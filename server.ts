import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiEnabled: !!ai });
});

// AI Tile Grid Generation Endpoint
app.post("/api/generate-tile", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key is not configured in environment variables. Please configure GEMINI_API_KEY in the Secrets panel.",
      });
    }

    const { prompt, size = 16, mode = "tile" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Grid details based on size (16x16 = 256 pixels, 32x32 = 1024 pixels)
    const totalPixels = size * size;

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    
    let systemInstruction = "";
    if (mode === "sprite") {
      systemInstruction = `You are an expert retro 8-bit/16-bit pixel art designer specializing in game character sprites, monsters, items, weapons, and assets (such as heroes, knights, slimes, wizard sprite, magic potion, skull, chest, sword).
Your task is to generate a beautifully shaded, coherent, recognizable retro pixel art character or item sprite based on the user's prompt.
The character or item must be centered inside the ${size}x${size} grid with a dark base background color of "#1a1c2c" representing transparency or negative space (the empty surrounding canvas).
Make sure you paint the character/item clearly with a solid recognizable shape, using crisp outlines and high-contrast retro shading, with all outer boundaries outside the character/item colored as "#1a1c2c" so it is fully isolated and ready for in-game rendering.
Keep the palette limited to 4 to 8 vibrant colors (excluding "#1a1c2c") to maintain a high-quality vintage pixel aesthetic.`;
    } else {
      systemInstruction = `You are an expert retro 8-bit/16-bit pixel art designer specializing in seamless textures and tiles.
Your task is to generate a fully seamless repeating tile texture based on the user's prompt.
You must return a grid of precisely ${totalPixels} hex color strings (e.g. "#2E4F4F", "#0E8388") that when rendered coordinate-by-coordinate (row by row, from left-to-right, top-to-bottom) builds a beautifully shaded, coherent, recognizable retro pixel art image.
Make sure the edges wrap around perfectly so that if the tile is repeated side-by-side, the boundary seams are completely invisible (seamless repeating texture!).
Keep the palette limited to 4 to 8 colors to maintain a high-quality vintage pixel aesthetic.`;
    }

    const userPrompt = mode === "sprite" 
      ? `Generate an isolated pixel art character or item sprite for: "${prompt}". Size coordinate grid is ${size}x${size} (exactly ${totalPixels} pixels total). Center the character/item and use "#1a1c2c" for any empty negative space around it. Return a JSON containing name, palette, and precisely ${totalPixels} color strings inside the grid.`
      : `Generate a seamless pixel texture tile for: "${prompt}". Size coordinate grid is ${size}x${size} (exactly ${totalPixels} pixels total). Please make sure you return exactly ${totalPixels} color strings inside the grid. The colors should form an actual repeating tile texture.`;

    let aiResponse = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      let delay = 500;
      const maxRetries = 1; // 2 attempts max per model if it's a general retriable error

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[PixelLab] Attempting generation with model ${model} (attempt ${attempt + 1}/${maxRetries + 1})...`);
          
          const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                required: ["name", "palette", "grid"],
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "A cool retro fantasy or sci-fi name for this pixel tile.",
                  },
                  palette: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "The list of unique hex colors used in this tile palette (4 to 8 colors).",
                  },
                  grid: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: `Precisely ${totalPixels} hex color strings representing the tile image pixels. Left to right, top to bottom.`,
                  },
                },
              },
            },
          });

          if (response && response.text) {
            aiResponse = response;
            break;
          }
          throw new Error("Gemini returned an empty response text.");
        } catch (error: any) {
          lastError = error;
          
          // Detect 503 / High Demand / UNAVAILABLE status
          const errorMsg = (error.message || "").toLowerCase();
          const isBusyOrOverloaded = 
            error.status === "UNAVAILABLE" || 
            error.code === 503 ||
            errorMsg.includes("503") ||
            errorMsg.includes("demand") ||
            errorMsg.includes("unavailable") ||
            errorMsg.includes("overloaded");

          console.warn(`[PixelLab] Error with model ${model} on attempt ${attempt + 1}:`, error.message || error);

          if (isBusyOrOverloaded) {
            console.log(`[PixelLab] Model ${model} is experiencing high demand (503/UNAVAILABLE). Switching to another candidate model immediately...`);
            break; // Break inner loop to try the next model immediately without waiting or retrying
          }

          if (attempt === maxRetries) {
            break;
          }

          console.log(`[PixelLab] Waiting ${delay}ms before retrying ${model}...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff scaling
        }
      }

      if (aiResponse) {
        break; // Break outer loop if we got a valid response
      }
    }

    if (!aiResponse) {
      throw lastError || new Error("Failed to generate tile after fallback strategies and retries.");
    }

    const text = aiResponse.text;
    if (!text) {
      return res.status(500).json({ error: "Empty response text from Gemini API." });
    }

    const parsedData = JSON.parse(text);

    // Validate grid size and pad / truncate if necessary
    let grid = parsedData.grid || [];
    if (grid.length < totalPixels) {
      // Pad with the last color or a default
      const defaultColor = grid[0] || "#000000";
      while (grid.length < totalPixels) {
        grid.push(defaultColor);
      }
    } else if (grid.length > totalPixels) {
      grid = grid.slice(0, totalPixels);
    }

    res.json({
      name: parsedData.name || "Generated Texture Tile",
      palette: parsedData.palette || Array.from(new Set(grid)),
      grid,
      size,
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating the pixel tile texture.",
    });
  }
});

// AI Music Loop Generation Endpoint
app.post("/api/generate-music", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (!ai) {
      // Offline fallback when no key is set, guaranteeing a superb experience
      const name = prompt.toLowerCase().includes("lofi") ? "Morning Dream" : 
                   prompt.toLowerCase().includes("instrument") ? "Synth Odyssey" : 
                   prompt.toLowerCase().includes("playlist") ? "Chiptune Chillhouse" : "Arcade Wanderer";
      const description = `Designed a beautiful retro theme for "${prompt}"! Utilizing a steady bass pattern, accented mid tones, and syncopated high motifs to bring your vintage description to life.`;
      const bpm = prompt.toLowerCase().includes("lofi") ? 90 : 130;
      const waveform = prompt.toLowerCase().includes("lofi") ? "triangle" : "square";
      
      const grid = Array(8).fill(null).map(() => Array(16).fill(false));
      // Base beat / bassline (row 7 G3, row 5 C4)
      for (let i = 0; i < 16; i += 2) {
        grid[7][i] = true;
      }
      // Melody notes
      grid[3][2] = true;
      grid[2][4] = true;
      grid[1][6] = true;
      grid[0][8] = true;
      grid[2][10] = true;
      grid[3][12] = true;
      grid[5][14] = true;

      return res.json({ name, description, bpm, waveform, grid });
    }

    const systemInstruction = `You are an expert retro 8-bit chip music composer and procedural synth sound designer.
Your task is to generate an 8-row by 16-step chiptune music pattern/melody loop representing the user's creative prompt.
Rows represent 8 pentatonic notes (Row 0 is the highest note C5, Row 1 is A4, Row 2 is G4, Row 3 is E4, Row 4 is D4, Row 5 is C4, Row 6 is A3, Row 7 is Low G3 note).
Columns represent 16 beats/subdivisions in a loop.
You must return a beautiful, coordinated rhythmic beat where Row 7 (G3) or Row 6 (A3) usually act as bass beats, Row 5 (C4)/Row 4 (D4) as intermediate melody chords, and Row 0 (C5)/Row 1 (A4) as flashing treble highlights.
Select a suitable classic retro waveform ('square', 'sawtooth', 'triangle', or 'sine') and BPM (60 to 240) to fit their prompt.
Ensure to include a catchy retro song title and a detailed response from you (the virtual chiptune producer) describing how this composition structurally mirrors their narrative!`;

    const userPrompt = `Generate a fully functional, high-quality 8-row x 16-step chiptune loop score representing the prompt: "${prompt}".
Please structure the grid as an array of exactly 8 rows, and each row containing exactly 16 boolean values (true representing active, false representing blank). Avoid noise - make sure notes are placed harmoniously for nice rhythm, syncopation, and chord intervals.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["name", "description", "bpm", "waveform", "grid"],
          properties: {
            name: {
              type: Type.STRING,
              description: "A clever 8-bit game level style or synth-wave song name.",
            },
            description: {
              type: Type.STRING,
              description: "Short feedback comment from the AI Producer, describing the track's structure, time signature, and feel to match their request.",
            },
            bpm: {
              type: Type.INTEGER,
              description: "Playback speed BPM (60 to 240). Use faster BPMs (120-160) for action/arcade, slower (70-100) for lofi/ambient.",
            },
            waveform: {
              type: Type.STRING,
              description: "Waveform synthesis style. Selection must be exactly one of: 'square', 'sawtooth', 'triangle', or 'sine'.",
            },
            grid: {
              type: Type.ARRAY,
              description: "Exactly 8 rows. Row 0 = C5 (highest), Row 1 = A4, Row 2 = G4, Row 3 = E4, Row 4 = D4, Row 5 = C4, Row 6 = A3, Row 7 = G3 (lowest). Each row must contain exactly 16 boolean values (true=note active, false=rest).",
              items: {
                type: Type.ARRAY,
                items: { type: Type.BOOLEAN },
              },
            },
          },
        },
      },
    });

    if (response && response.text) {
      const parsedData = JSON.parse(response.text);
      let grid = parsedData.grid || [];
      
      // Ensure grid dimensions are exactly 8x16
      if (grid.length !== 8) {
        grid = Array(8).fill(null).map(() => Array(16).fill(false));
      } else {
        grid = grid.map((row: any) => {
          if (!Array.isArray(row)) {
            return Array(16).fill(false);
          }
          if (row.length !== 16) {
            const newRow = [...row];
            while (newRow.length < 16) newRow.push(false);
            return newRow.slice(0, 16);
          }
          return row.map(v => !!v);
        });
      }

      res.json({
        name: parsedData.name || "Custom AI Loop",
        description: parsedData.description || "Generated custom chiptune pattern.",
        bpm: Math.max(60, Math.min(240, parsedData.bpm || 120)),
        waveform: ["square", "sawtooth", "triangle", "sine"].includes(parsedData.waveform) ? parsedData.waveform : "square",
        grid,
      });
    } else {
      throw new Error("Empty response text from Gemini API.");
    }
  } catch (error: any) {
    console.error("Music Generation Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating the music chiptune motif.",
    });
  }
});

// Load Vite middleware in development, serve static in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PixelLab] Server running on http://localhost:${PORT}`);
  });
}

start();
