import React, { useState, useEffect, useRef } from "react";
import {
  Paintbrush,
  Eraser,
  PaintBucket,
  Pipette,
  Search,
  Grid,
  Save,
  Download,
  RotateCcw,
  Sparkles,
  Heart,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Code,
  Info,
  Clock,
  Play,
  Grid3X3,
  ThumbsUp,
  Sliders,
  Upload,
  Database,
  Check,
  AlertCircle,
  Coins,
  Award,
  ShoppingBag,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  BookOpen,
  Target,
  Compass,
  Eye,
  EyeOff,
  Music,
  Pause
} from "lucide-react";
import { PixelTile, PresetPalette } from "./types";
import { PRESET_PALETTES, PRESET_TILES, SUBJECT_TEMPLATES, SubjectTemplate } from "./presets";

export default function App() {
  // Navigation & View States
  // "home" | "editor" | "gallery" | "market" | "music"
  const [currentView, setCurrentView] = useState<"home" | "editor" | "gallery" | "market" | "music">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PixelTile[]>(PRESET_TILES);

  // Storage of tiles (loaded from localStorage on startup + preset fallback)
  const [myTiles, setMyTiles] = useState<PixelTile[]>(() => {
    const saved = localStorage.getItem("pixellab_custom_tiles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading custom tiles:", e);
      }
    }
    return [];
  });

  // Current active tile being edited
  const [activeTile, setActiveTile] = useState<PixelTile>({
    id: "temp_init",
    name: "Classic Red Bricks",
    size: 16,
    grid: [...PRESET_TILES[1].grid],
    palette: [...PRESET_TILES[1].palette],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Walls"
  });

  // Editor specific states
  const [activeColor, setActiveColor] = useState("#ef7d57"); // Current paint color
  const [editorTool, setEditorTool] = useState<"pencil" | "eraser" | "bucket" | "picker">("pencil");
  const [isSymmetricH, setIsSymmetricH] = useState(false);
  const [isSymmetricV, setIsSymmetricV] = useState(false);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(1); // Sweetie 16 default
  const [customColors, setCustomColors] = useState<string[]>(["#ff00ea", "#00ff66", "#ffb700"]);

  // Undo/Redo Stacks
  const [historyStack, setHistoryStack] = useState<string[][]>([]);
  const [redoStack, setRedoStack] = useState<string[][]>([]);

  // Generator & Animation States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [generateMode, setGenerateMode] = useState<"tile" | "sprite">("tile");
  const [catalogTab, setCatalogTab] = useState<"all" | "tile" | "sprite">("all");

  // Save File Import & Export states & drag/drop zone visual status variables
  const [isDragActive, setIsDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);

  // ==================== RETRO ECONOMY STATE ENGINE ====================
  const [goldCoins, setGoldCoins] = useState<number>(() => {
    const saved = localStorage.getItem("pixellab_gold_coins");
    return saved ? parseInt(saved, 10) : 350; // Start with 350 free Gold Coins
  });

  const [totalEarned, setTotalEarned] = useState<number>(() => {
    const saved = localStorage.getItem("pixellab_total_earned");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [unlockedPalettes, setUnlockedPalettes] = useState<string[]>(() => {
    const saved = localStorage.getItem("pixellab_unlocked_palettes");
    return saved ? JSON.parse(saved) : ["Classic PICO-8", "Sweetie 16", "Original GameBoy"];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("pixellab_sound_enabled");
    return saved ? JSON.parse(saved) : true;
  });

  // State structure for retro quest items
  interface Bounty {
    id: string;
    seeker: string;
    title: string;
    description: string;
    reward: number;
    targetKeyword: string;
    targetCategory: string;
    requestedSize: number;
    icon: string;
  }

  const [bounties, setBounties] = useState<Bounty[]>(() => {
    const saved = localStorage.getItem("pixellab_active_bounties");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "bounty_garrison",
        seeker: "Guild Quartermaster 🧱",
        title: "Castle Stone Block",
        description: "The Lord Paramount wants high-contrast tile patterns for the new treasury wall. Submit dungeon stone wall designs.",
        reward: 350,
        targetKeyword: "stone",
        targetCategory: "Walls",
        requestedSize: 16,
        icon: "🧱"
      },
      {
        id: "bounty_druid",
        seeker: "Forest Druid Elder 🌿",
        title: "Verdant Moss Grass",
        description: "Enchanted forests have withered under corruption. Draw or import a Lush Forest Grass tile pattern with lively greens.",
        reward: 280,
        targetKeyword: "grass",
        targetCategory: "Ground",
        requestedSize: 16,
        icon: "🌿"
      },
      {
        id: "bounty_archmage",
        seeker: "Kingdom Archmage ❤️",
        title: "Relic Life Heart",
        description: "Seeking pristine life artifacts with red or pink hues to fuel resurrection spell matrixes. Send custom items or magical life hearts.",
        reward: 450,
        targetKeyword: "heart",
        targetCategory: "Items",
        requestedSize: 16,
        icon: "❤️"
      }
    ];
  });

  // Live merchant appraiser selected item ID
  const [appraisalTileId, setAppraisalTileId] = useState<string>("");
  const [appraisalMessage, setAppraisalMessage] = useState<string>("Welcome traveler! Put any of your custom designs in my Pixel Matrix Scanner, and I shall evaluate its physical structure and buy its blueprint for Gold Coins!");
  const [appraisalResult, setAppraisalResult] = useState<any>(null);

  // Subject Drawing Reference Guide states
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [showTraceGuides, setShowTraceGuides] = useState<boolean>(false);

  // Playtest Arena simulator state variables
  const [playtestTab, setPlaytestTab] = useState<"default" | "playtest">("default");
  const [playtestCharX, setPlaytestCharX] = useState<number>(20);
  const [playtestDummyHp, setPlaytestDummyHp] = useState<number>(100);
  const [playtestDummyType, setPlaytestDummyType] = useState<string>("Training Dummy");
  const [playtestDummyMaxHp, setPlaytestDummyMaxHp] = useState<number>(100);
  const [playtestIsThrusting, setPlaytestIsThrusting] = useState<boolean>(false);
  const [playtestScore, setPlaytestScore] = useState<number>(0);
  const [playtestDamageFloats, setPlaytestDamageFloats] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // ==================== RETRO CHIPTUNE SEQUENCER STATES ====================
  const [musicGrid, setMusicGrid] = useState<boolean[][]>(() => {
    return Array(8).fill(null).map(() => Array(16).fill(false));
  });
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [seqBpm, setSeqBpm] = useState<number>(125);
  const [currentSeqStep, setCurrentSeqStep] = useState<number>(-1);
  const [synthWave, setSynthWave] = useState<"square" | "sawtooth" | "triangle" | "sine">("square");

  // Flow Music Panel State variables
  const [activeMusicTab, setActiveMusicTab] = useState<"turntable" | "spaces" | "songs" | "playlists" | "projects">("turntable");
  const [musicPromptInput, setMusicPromptInput] = useState<string>("");
  const [isMusicGenerating, setIsMusicGenerating] = useState<boolean>(false);
  const [aiProducerMessage, setAiProducerMessage] = useState<string>("Describe any vibe or style (e.g. 'a moody cyberpunk dungeon bassline') and I will compose a fully-playable custom chiptune loop, program the sequencer, and synth the sound waves!");
  const [activeTrackName, setActiveTrackName] = useState<string>("Cyberpunk Retrowave");
  const [customTrackList, setCustomTrackList] = useState<Array<{ id: string; name: string; desc: string; bpm: number; wave: "square" | "sawtooth" | "triangle" | "sine"; grid: boolean[][] }>>([
    {
      id: "track_retrowave",
      name: "Cyberpunk Retrowave",
      desc: "Fast driving 8-bit digital bass arp with sharp rhythmic notes.",
      bpm: 135,
      wave: "square",
      grid: Array(8).fill(null).map((_, r) => Array(16).fill(false))
    },
    {
      id: "track_fanfare",
      name: "Heroic Fanfare",
      desc: "A triumphant major-chord brass melody signifying completed vaults.",
      bpm: 120,
      wave: "sawtooth",
      grid: Array(8).fill(null).map((_, r) => Array(16).fill(false))
    },
    {
      id: "track_forest",
      name: "Enchanted Forest",
      desc: "Soft twinkling fantasy scale lullaby mimicking quiet sunlit glades.",
      bpm: 95,
      wave: "triangle",
      grid: Array(8).fill(null).map((_, r) => Array(16).fill(false))
    },
    {
      id: "track_dungeon",
      name: "Spooky Dungeon Walk",
      desc: "Mysterious descending chromatic steps on eerie triangle wave.",
      bpm: 80,
      wave: "triangle",
      grid: Array(8).fill(null).map((_, r) => Array(16).fill(false))
    }
  ]);

  // Pitches defined for clean pentatonic melody harmony
  const SEQ_PITCHES = [
    { name: "C5 🔔", hz: 523.25 },
    { name: "A4 🎵", hz: 440.00 },
    { name: "G4 ♪", hz: 392.00 },
    { name: "E4 ♫", hz: 329.63 },
    { name: "D4 ♩", hz: 293.66 },
    { name: "C4 🔊", hz: 261.63 },
    { name: "A3 🥁", hz: 220.00 },
    { name: "G3 🔉", hz: 196.00 },
  ];

  const musicGridRef = useRef<boolean[][]>([]);
  const synthWaveRef = useRef<"square" | "sawtooth" | "triangle" | "sine">("square");
  const soundEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    musicGridRef.current = musicGrid;
  }, [musicGrid]);

  useEffect(() => {
    synthWaveRef.current = synthWave;
  }, [synthWave]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const playRetroTone = (hz: number, type: "square" | "sawtooth" | "triangle" | "sine", duration: number = 0.18) => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext init warning:", e);
    }
  };

  const playMusicStepNotes = (stepIndex: number) => {
    if (!soundEnabledRef.current) return;
    const gridVal = musicGridRef.current;
    if (!gridVal || gridVal.length === 0) return;
    
    for (let r = 0; r < 8; r++) {
      if (gridVal[r] && gridVal[r][stepIndex]) {
        const pitch = SEQ_PITCHES[r];
        if (pitch) {
          playRetroTone(pitch.hz, synthWaveRef.current, 0.22);
        }
      }
    }
  };

  // Run the sequencer loop cleanly
  useEffect(() => {
    let intervalId: any = null;
    if (isPlayingSeq) {
      const stepDurationMs = (60 / seqBpm / 4) * 1000; // 16th note subdivision
      intervalId = setInterval(() => {
        setCurrentSeqStep((prev) => {
          const next = (prev + 1) % 16;
          playMusicStepNotes(next);
          return next;
        });
      }, stepDurationMs);
    } else {
      setCurrentSeqStep(-1);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlayingSeq, seqBpm]);


  // Synced state variables persisting on load
  useEffect(() => {
    localStorage.setItem("pixellab_gold_coins", goldCoins.toString());
  }, [goldCoins]);

  useEffect(() => {
    localStorage.setItem("pixellab_total_earned", totalEarned.toString());
  }, [totalEarned]);

  useEffect(() => {
    localStorage.setItem("pixellab_unlocked_palettes", JSON.stringify(unlockedPalettes));
  }, [unlockedPalettes]);

  useEffect(() => {
    localStorage.setItem("pixellab_sound_enabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("pixellab_active_bounties", JSON.stringify(bounties));
  }, [bounties]);

  // Vintage retro audio synth chime module (using Web Audio API, runs 100% inside container iframe safely!)
  const playRetroSound = (type: "coin" | "level" | "fail" | "spark" | "strike") => {
    if (!soundEnabled) return;
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const ctx = new AudioContextClass();
      
      if (type === "coin") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "level") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === "fail") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "spark") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "strike") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sawtooth";
        // Fast pitch slide down for punchy thrust animation audio
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn("AudioContext initialization bypassed until user interaction", e);
    }
  };

  const loadPresetMelody = (presetName: "retrowave" | "fanfare" | "forest" | "dungeon") => {
    const freshGrid = Array(8).fill(null).map(() => Array(16).fill(false));
    if (presetName === "fanfare") {
      freshGrid[5][0] = true; // C4
      freshGrid[5][2] = true; // C4
      freshGrid[5][4] = true; // C4
      freshGrid[3][6] = true; // E4
      freshGrid[2][8] = true; // G4
      freshGrid[2][10] = true; // G4
      freshGrid[1][12] = true; // A4
      freshGrid[0][14] = true; // C5
    } else if (presetName === "retrowave") {
      for (let step = 0; step < 16; step++) {
        if (step % 2 === 0) {
          freshGrid[7][step] = true; // G3
        }
        if (step % 4 === 1) {
          freshGrid[5][step] = true; // C4
        }
        if (step % 4 === 3) {
          freshGrid[3][step] = true; // E4
        }
      }
      freshGrid[1][4] = true;
      freshGrid[0][8] = true;
      freshGrid[1][12] = true;
    } else if (presetName === "forest") {
      freshGrid[3][0] = true; // E4
      freshGrid[1][2] = true; // A4
      freshGrid[0][4] = true; // C5
      freshGrid[1][6] = true; // A4
      freshGrid[2][8] = true; // G4
      freshGrid[4][10] = true; // D4
      freshGrid[3][12] = true; // E4
      freshGrid[5][14] = true; // C4
    } else if (presetName === "dungeon") {
      freshGrid[6][0] = true; // A3
      freshGrid[4][2] = true; // D4
      freshGrid[3][4] = true; // E4
      freshGrid[2][6] = true; // G4
      freshGrid[1][8] = true; // A4
      freshGrid[2][10] = true; // G4
      freshGrid[3][12] = true; // E4
      freshGrid[4][14] = true; // D4
    }
    setMusicGrid(freshGrid);
    playRetroSound("level");
  };

  const handleGenerateMusic = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsMusicGenerating(true);
    setAiProducerMessage("Synthesizing your custom beats... programming the MIDI grids... dialing in retro pitch values... 🎧");
    setIsPlayingSeq(false);
    playRetroSound("spark");
    
    try {
      const resp = await fetch("/api/generate-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: promptText })
      });
      
      if (!resp.ok) {
        throw new Error("Generation request failed on backend server.");
      }
      
      const data = await resp.json();
      
      setMusicGrid(data.grid);
      setSeqBpm(data.bpm);
      setSynthWave(data.waveform);
      setActiveTrackName(data.name);
      setAiProducerMessage(data.description);
      
      // Store in our active playlist!
      const newTrack = {
        id: "track_" + Date.now(),
        name: data.name,
        desc: data.description,
        bpm: data.bpm,
        wave: data.waveform as "square" | "sawtooth" | "triangle" | "sine",
        grid: data.grid
      };
      
      setCustomTrackList(prev => [newTrack, ...prev]);
      playRetroSound("level");
      setIsPlayingSeq(true); // Auto play!
    } catch (e: any) {
      console.error(e);
      setAiProducerMessage("Could not contact the MIDI synthesis matrix. Falling back to an offline sweet melody... ⚡");
      loadPresetMelody("retrowave");
      setActiveTrackName("Fallback Jams");
      playRetroSound("fail");
    } finally {
      setIsMusicGenerating(false);
    }
  };

  const triggerSoundboardSfx = (type: "coin" | "laser" | "jump" | "explosion" | "powerup") => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      if (type === "coin") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.setValueAtTime(1300, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (type === "laser") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "jump") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(850, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === "powerup") {
        const tones = [440, 554, 659, 880];
        tones.forEach((hz, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "square";
          osc.frequency.setValueAtTime(hz, now + idx * 0.075);
          gain.gain.setValueAtTime(0.04, now + idx * 0.075);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.15);
          osc.start(now + idx * 0.075);
          osc.stop(now + idx * 0.075 + 0.18);
        });
      } else if (type === "explosion") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Soundboard sfx failed", e);
    }
  };

  // Download entire custom gallery database as a JSON save file
  const downloadFullBackup = () => {
    if (myTiles.length === 0) {
      alert("Your gallery database is currently empty. Draw or favorite some tiles in the editor first!");
      return;
    }
    const backupObj = {
      type: "pixellab_backup",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      totalTiles: myTiles.length,
      tiles: myTiles
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pixellab_gallery_save_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    setGenerationLogs(["Backup save file downloaded successfully!"]);
    setTimeout(() => setGenerationLogs([]), 2500);
  };

  // Download a single custom tile asset as a discrete JSON save file
  const downloadSingleTileSaveFile = (tile: PixelTile) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tile_save_${tile.name.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setGenerationLogs([`Save file downloaded for individual tile "${tile.name}"!`]);
    setTimeout(() => setGenerationLogs([]), 2500);
  };

  // Dynamic real-time math-driven appraiser for any custom pixel grid
  const calculateAppraisalValue = (tile: PixelTile) => {
    let base = 120; // Base value of any artwork blueprint
    
    // Greater complexity for larger grid designs
    if (tile.size === 32) base += 60;

    // Determine unique colors used, excluding default void colors
    const uniqueColors = new Set(tile.grid.filter(c => c !== "#1a1c2c" && c !== "transparent" && c !== "#08090f"));
    base += uniqueColors.size * 18;

    // Percentage of colored pixels in matrix density
    const coloredCount = tile.grid.filter(c => c !== "#1a1c2c" && c !== "transparent" && c !== "#08090f").length;
    const fillingRatio = coloredCount / (tile.size * tile.size);
    base += Math.round(fillingRatio * 100);

    // Grid Symmetry math engine (checks matches on fold horizontal/vertical lines)
    let symmetricHCount = 0;
    let symmetricVCount = 0;
    const size = tile.size;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size / 2; c++) {
        const leftIdx = r * size + c;
        const rightIdx = r * size + (size - 1 - c);
        if (tile.grid[leftIdx] === tile.grid[rightIdx]) {
          symmetricHCount++;
        }
      }
    }

    for (let c = 0; c < size; c++) {
      for (let r = 0; r < size / 2; r++) {
        const topIdx = r * size + c;
        const bottomIdx = (size - 1 - r) * size + c;
        if (tile.grid[topIdx] === tile.grid[bottomIdx]) {
          symmetricVCount++;
        }
      }
    }

    const totalCells = (size * size) / 2;
    const hRatio = symmetricHCount / totalCells;
    const vRatio = symmetricVCount / totalCells;

    const hSymmetric = hRatio > 0.8;
    const vSymmetric = vRatio > 0.8;

    let bonusMultiplier = 1.0;
    if (hSymmetric) bonusMultiplier += 0.15;
    if (vSymmetric) bonusMultiplier += 0.15;

    return {
      baseValue: Math.round(base * bonusMultiplier),
      uniqueColorCount: uniqueColors.size,
      fillingPercent: Math.round(fillingRatio * 100),
      hSymmetric,
      vSymmetric
    };
  };

  // Randomized Infinite Bounty Generator
  const generateRandomBounty = (oldId: string): Bounty => {
    const seekers = [
      { name: "Scout Captain Jack ⚔️", category: "Characters", keyword: "knight", icon: "⚔️", item: "Knight blueprint" },
      { name: "Sewer Custodian Barnaby 🟢", category: "Monsters", keyword: "slime", icon: "🟢", item: "toxic residue sprite" },
      { name: "Lava Forge Blacksmith 🌋", category: "Lava", keyword: "lava", icon: "🌋", item: "active magma design" },
      { name: "Maritime Navigator Kyle 🌊", category: "Liquids", keyword: "water", icon: "🌊", item: "Crystalline waves tiles" },
      { name: "Space Commando Vance 🛰️", category: "Sci-Fi", keyword: "scifi", icon: "🛰️", item: "Sci-Fi Relay panel" },
      { name: "Wandering Merchant Silas 🏺", category: "Items", keyword: "heart", icon: "🏺", item: "ancient life glyph" }
    ];

    const chosen = seekers[Math.floor(Math.random() * seekers.length)];
    const reward = 300 + Math.floor(Math.random() * 150);

    return {
      id: "bounty_" + Date.now(),
      seeker: chosen.name,
      title: `Custom ${chosen.item}`,
      description: `Prepare a high-fidelity retro asset classified under ${chosen.category} containing keywords such as '${chosen.keyword}' to fulfill this guild commission contract.`,
      reward,
      targetKeyword: chosen.keyword,
      targetCategory: chosen.category,
      requestedSize: 16,
      icon: chosen.icon
    };
  };

  // Hand-in target custom item for contract bounty fulfillment
  const handleSubmitBounty = (bounty: Bounty, tileId: string) => {
    const tile = [...myTiles, ...PRESET_TILES].find(t => t.id === tileId);
    if (!tile) return;
    
    // Compute reward
    let payout = bounty.reward;
    const titleLower = tile.name.toLowerCase();
    const keywordLower = bounty.targetKeyword.toLowerCase();
    const categoryLower = tile.category?.toLowerCase() || "";
    const targetCategoryLower = bounty.targetCategory.toLowerCase();

    const matchedKeyword = titleLower.includes(keywordLower) || categoryLower.includes(keywordLower);
    const matchedCategory = categoryLower.includes(targetCategoryLower);

    let bonusText = "";
    if (matchedKeyword && matchedCategory) {
      payout += 50;
      bonusText = " +50 Gold Exact Specs Match!";
    }

    setGoldCoins(prev => prev + payout);
    setTotalEarned(prev => prev + payout);
    playRetroSound("coin");

    setImportStatus({
      message: `Bounty Claimed! You handed in code blueprint "${tile.name}" to the "${bounty.seeker}". You earned 🪙 ${payout} Gold Coins!${bonusText}`,
      isError: false
    });

    // Replace completed contract with new one
    const replaceId = bounty.id;
    const replacement = generateRandomBounty(replaceId);
    setBounties(prev => prev.map(b => b.id === replaceId ? replacement : b));

    setGenerationLogs([`Successfully claimed ${payout} Gold Coins!`]);
    setTimeout(() => setGenerationLogs([]), 2500);
  };

  // Safe save-file structural validator and parser
  const handleImportSaveFile = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      let importedTiles: PixelTile[] = [];

      // Validator structure
      const isValidTile = (t: any): t is PixelTile => {
        return (
          t &&
          typeof t.name === "string" &&
          typeof t.size === "number" &&
          (t.size === 16 || t.size === 32) &&
          Array.isArray(t.grid) &&
          t.grid.length === t.size * t.size &&
          Array.isArray(t.palette)
        );
      };

      if (Array.isArray(data)) {
        importedTiles = data.filter(isValidTile);
      } else if (data && typeof data === "object") {
        if (data.type === "pixellab_backup" && Array.isArray(data.tiles)) {
          importedTiles = data.tiles.filter(isValidTile);
        } else if (isValidTile(data)) {
          importedTiles = [data];
        }
      }

      if (importedTiles.length === 0) {
        setImportStatus({
          message: "Import failed: No valid PixelLab tiles found in this save file.",
          isError: true
        });
        return;
      }

      const merged = [...myTiles];
      let addedCount = 0;
      let updatedCount = 0;

      importedTiles.forEach((tile) => {
        const tileId = tile.id || "imported_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
        const idx = merged.findIndex((t) => t.id === tileId);
        
        const cleanTile: PixelTile = {
          ...tile,
          id: tileId,
          createdAt: tile.createdAt || new Date().toISOString(),
          isFavorite: !!tile.isFavorite,
          category: tile.category || "Imported"
        };

        if (idx > -1) {
          merged[idx] = cleanTile;
          updatedCount++;
        } else {
          merged.unshift(cleanTile);
          addedCount++;
        }
      });

      saveTilesToStorage(merged);
      setImportStatus({
        message: `Import Success! Received ${addedCount} new tile(s) and synchronized ${updatedCount} existing tile(s) back into the gallery database.`,
        isError: false
      });
      
      setGenerationLogs([`Successfully loaded ${importedTiles.length} pixel asset(s) from save file!`]);
      setTimeout(() => setGenerationLogs([]), 3800);
    } catch (e: any) {
      setImportStatus({
        message: `Import failed: The selected save file is not a valid JSON structure. (${e.message})`,
        isError: true
      });
    }
  };

  // Drag and Drop Zone Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setImportStatus(null);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith(".json") && !file.name.endsWith(".pixellab")) {
        setImportStatus({
          message: "Validation Error: The save file suffix must be a .json or .pixellab extension.",
          isError: true
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          handleImportSaveFile(text);
        }
      };
      reader.onerror = () => {
        setImportStatus({
          message: "Unable to read the save file contents.",
          isError: true
        });
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          handleImportSaveFile(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Load a set of demo tiles directly if the custom gallery workspace is empty
  const handleLoadDemoGallery = () => {
    const demoItems: PixelTile[] = [
      {
        id: "demo_brick_blue",
        name: "Cyber Cobalt Bricks",
        size: 16,
        grid: PRESET_TILES[1].grid.map(c => c === "#b13e53" ? "#1d2b53" : c === "#ef7d57" ? "#29adff" : c),
        palette: ["#1d2b53", "#29adff", "#29366f", "#566c86"],
        createdAt: new Date().toISOString(),
        isFavorite: true,
        category: "Sci-Fi",
        type: "tile"
      },
      {
        id: "demo_moss_cave",
        name: "Moss Cave Cobblestone",
        size: 16,
        grid: PRESET_TILES[2].grid.map(c => c === "#f4f4f4" ? "#a7f070" : c === "#94b0c2" ? "#38b764" : c),
        palette: ["#1a1c2c", "#38b764", "#a7f070", "#566c86", "#333c57"],
        createdAt: new Date().toISOString(),
        isFavorite: false,
        category: "Walls",
        type: "tile"
      },
      {
        id: "demo_gold_crown",
        name: "Relic Gold Crown",
        size: 16,
        grid: PRESET_TILES[8].grid.map(c => c === "#ef7d57" ? "#ffcd75" : c === "#b13e53" ? "#ffa300" : c),
        palette: ["#1a1c2c", "#ffa300", "#ffcd75", "#f4f4f4"],
        createdAt: new Date().toISOString(),
        isFavorite: true,
        category: "Items",
        type: "sprite"
      }
    ];
    saveTilesToStorage([...demoItems, ...myTiles]);
    setImportStatus({
      message: "Success: Injected 3 gorgeous retro demo items into your catalog! You can now test downloading save backups.",
      isError: false
    });
  };

  // Sync Search queries & tabs on changes
  useEffect(() => {
    let allAvailable = [...myTiles, ...PRESET_TILES];
    
    // Switch filter by template type selector
    if (catalogTab !== "all") {
      allAvailable = allAvailable.filter(
        (t) => t.type === catalogTab || (!t.type && catalogTab === "tile")
      );
    }

    if (!searchQuery.trim()) {
      setSearchResults(allAvailable);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = allAvailable.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, catalogTab, myTiles]);

  // Persist myTiles to localStorage
  const saveTilesToStorage = (updatedList: PixelTile[]) => {
    setMyTiles(updatedList);
    localStorage.setItem("pixellab_custom_tiles", JSON.stringify(updatedList));
  };

  // Switch to Editor and Load Tile
  const handleEditTile = (tile: PixelTile) => {
    setActiveTile({
      ...tile,
      grid: [...tile.grid],
      palette: [...tile.palette]
    });
    setHistoryStack([]);
    setRedoStack([]);
    setActiveColor(tile.palette[0] || "#ef7d57");
    setCurrentView("editor");
    // Clear any previous error
    setErrorText(null);
  };

  // Reset Editor Tile with a Blank Canvas
  const handleNewTile = (size: number = 16) => {
    const emptyGrid = Array(size * size).fill("#1a1c2c"); // Dark base background
    const defaultPalette = ["#ff5555", "#55ff55", "#5555ff", "#ffff55", "#1a1c2c", "#ffffff"];
    const newTileObj: PixelTile = {
      id: "tile_" + Date.now(),
      name: "New Canvas Design",
      size,
      grid: emptyGrid,
      palette: defaultPalette,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      category: "Custom"
    };
    setActiveTile(newTileObj);
    setHistoryStack([]);
    setRedoStack([]);
    setActiveColor(defaultPalette[0]);
    setCurrentView("editor");
    setErrorText(null);
  };

  // Perform a random "I'm Feeling Lucky" action
  const handleImFeelingLucky = () => {
    const luckyPrompts = [
      "magma cave cobblestone",
      "glowing emerald matrix",
      "cyberpunk digital circuitry",
      "ancient high-tech temple tile",
      "mossy graveyard bricks",
      "vibrant floral surface",
      "undead bones gravel",
      "royal cyan mosaic",
      "rusty yellow spaceship hull"
    ];
    const item = luckyPrompts[Math.floor(Math.random() * luckyPrompts.length)];
    setAiPrompt(item);
    handleNewTile(16);
    // Focus or trigger the trigger AI tile generation with selected prompt
    setTimeout(() => {
      // Find generate button and simulate or directly call
      generateTileWithAI(item, 16);
    }, 50);
  };

  // Direct AI generation trigger
  const handleDirectSearchGenerate = () => {
    if (!searchQuery.trim()) return;
    handleNewTile(16);
    generateTileWithAI(searchQuery, 16);
  };

  // Core Gemini Tile Generator Orchestrator
  const generateTileWithAI = async (promptText: string, gridSize: number = 16) => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setErrorText(null);
    setGenerationLogs([]);

    const isSprite = generateMode === "sprite";
    const logs = isSprite
      ? [
          "Initializing Retro Sprite Generator Protocol...",
          "Connecting to Gemini Pro-Pixel character matrix...",
          "Applying alpha transparency & isolated boundaries...",
          "Calibrating isolated sprite outlines and shading...",
          "Synthesizing high fidelity gamified retro color palette...",
          "Rendering canvas cells of size " + gridSize + "x" + gridSize + "..."
        ]
      : [
          "Initializing Retro Synthesizer Protocol...",
          "Connecting to Gemini Pro-Pixel grid matrix...",
          "Applying 8-bit visual shader filter constraints...",
          "Analyzing repeating seamless boundary constraints...",
          "Synthesizing high fidelity retro color layout palette...",
          "Rendering canvas cells of size " + gridSize + "x" + gridSize + "..."
        ];

    // Stream logs mock visualizer for vintage retro look
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setGenerationLogs((prev) => [...prev, logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    try {
      const response = await fetch("/api/generate-tile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, size: gridSize, mode: generateMode }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok) {
        throw new Error(data.error || "System failed to generate pixel grid coordinates.");
      }

      setGenerationLogs((prev) => [
        ...prev,
        isSprite
          ? "✔ Isolated retro sprite compiled successfully!"
          : "✔ Seamless texture grid compiled successfully!"
      ]);

      // Update currently active canvas
      const generatedTile: PixelTile = {
        id: "gen_" + Date.now(),
        name: data.name || promptText,
        size: data.size,
        grid: data.grid,
        palette: data.palette,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        category: isSprite ? "AI Character" : "AI Generated",
        type: generateMode
      };

      setActiveTile(generatedTile);
      // Update color settings
      if (data.palette && data.palette.length > 0) {
        setActiveColor(data.palette[0]);
      }
      setHistoryStack([]);
      setRedoStack([]);
      setCurrentView("editor");
    } catch (e: any) {
      clearInterval(interval);
      console.error(e);
      setErrorText(e.message || "Failed to communicate with AI generation backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Paint Actions
  const handlePixelInteract = (index: number) => {
    const size = activeTile.size;
    const x = index % size;
    const y = Math.floor(index / size);

    // Save history
    setHistoryStack((prev) => [...prev, [...activeTile.grid]]);
    setRedoStack([]); // Clear redo on action

    let nextGrid = [...activeTile.grid];

    if (editorTool === "piper") {
      // Color picker siphons color
      const pickedColor = activeTile.grid[index];
      setActiveColor(pickedColor);
      setEditorTool("pencil");
      return;
    }

    const valueToApply = editorTool === "eraser" ? "#1a1c2c" : activeColor;

    // Direct paint with Symmetrical checks
    const pointsToPaint: { px: number; py: number }[] = [{ px: x, py: y }];

    if (isSymmetricH) {
      pointsToPaint.push({ px: size - 1 - x, py: y });
    }
    if (isSymmetricV) {
      pointsToPaint.push({ px: x, py: size - 1 - y });
    }
    if (isSymmetricH && isSymmetricV) {
      pointsToPaint.push({ px: size - 1 - x, py: size - 1 - y });
    }

    if (editorTool === "bucket") {
      // Paint bucket flood fill
      const targetColor = activeTile.grid[index];
      nextGrid = floodFill(activeTile.grid, x, y, targetColor, valueToApply, size);
    } else {
      // Standard pencil/eraser
      pointsToPaint.forEach(({ px, py }) => {
        const idx = py * size + px;
        nextGrid[idx] = valueToApply;
      });
    }

    setActiveTile((prev) => ({ ...prev, grid: nextGrid }));
  };

  // Flood Fill Logic (BFS)
  const floodFill = (
    currentGrid: string[],
    startX: number,
    startY: number,
    targetColor: string,
    replacementColor: string,
    size: number
  ): string[] => {
    if (targetColor === replacementColor) return currentGrid;
    const gridCopy = [...currentGrid];
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const idx = cy * size + cx;
      if (gridCopy[idx] === targetColor) {
        gridCopy[idx] = replacementColor;

        if (cx > 0) queue.push([cx - 1, cy]);
        if (cx < size - 1) queue.push([cx + 1, cy]);
        if (cy > 0) queue.push([cx, cy - 1]);
        if (cy < size - 1) queue.push([cx, cy + 1]);
      }
    }
    return gridCopy;
  };

  // Color picker selection bypass
  const siphonColor = (color: string) => {
    setActiveColor(color);
  };

  // Add a custom color to the user's custom layout
  const handleAddNewCustomColor = () => {
    // Generate simple random retro color or use a default hex input
    const randomHexes = ["#ff3366", "#33ffcc", "#ffff33", "#ff66ff", "#66ffff", "#ff9933"];
    const nextCol = randomHexes[Math.floor(Math.random() * randomHexes.length)];
    if (!customColors.includes(nextCol)) {
      setCustomColors((prev) => [...prev, nextCol]);
      setActiveColor(nextCol);
    }
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, [...activeTile.grid]]);
    setActiveTile((prev) => ({ ...prev, grid: previous }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setHistoryStack((prev) => [...prev, [...activeTile.grid]]);
    setActiveTile((prev) => ({ ...prev, grid: nextState }));
  };

  // Export current tile to workspace
  const handleSaveWorkspace = () => {
    const isNew = !myTiles.find((t) => t.id === activeTile.id);
    let updated;
    if (isNew) {
      const newSavedTile = {
        ...activeTile,
        id: "tile_" + Date.now(),
        createdAt: new Date().toISOString()
      };
      updated = [newSavedTile, ...myTiles];
    } else {
      updated = myTiles.map((t) => (t.id === activeTile.id ? activeTile : t));
    }
    saveTilesToStorage(updated);
    playRetroSound("spark");
    // Visual alert overlay (we avoid window.alert in iFrame)
    setGenerationLogs(["Saved successfully to local retro workspace catalog!"]);
    setTimeout(() => setGenerationLogs([]), 2000);
  };

  // Delete tile
  const handleDeleteTile = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = myTiles.filter((t) => t.id !== id);
    saveTilesToStorage(updated);
    playRetroSound("fail");
  };

  // Toggle favorite
  const handleToggleFavorite = (tile: PixelTile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const allCustom = myTiles.find((t) => t.id === tile.id);
    if (allCustom) {
      const updated = myTiles.map((t) =>
        t.id === tile.id ? { ...t, isFavorite: !t.isFavorite } : t
      );
      saveTilesToStorage(updated);
      playRetroSound("spark");
    } else {
      // Toggle presets favoritism in active list state if cloned
      const clonedTile = {
        ...tile,
        id: "custom_" + tile.id,
        isFavorite: !tile.isFavorite,
        createdAt: new Date().toISOString()
      };
      saveTilesToStorage([clonedTile, ...myTiles]);
      playRetroSound("spark");
    }
  };

  // Render high fidelity scaled canvas to compile actual PNG file for user download
  const handleDownloadPNG = () => {
    const size = activeTile.size;
    const pxScale = 32; // Make downloadable PNG crisp (e.g. 512x512 pixels total size)
    const canvas = document.createElement("canvas");
    canvas.width = size * pxScale;
    canvas.height = size * pxScale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw grid
    activeTile.grid.forEach((color, i) => {
      const x = i % size;
      const y = Math.floor(i / size);
      ctx.fillStyle = color;
      ctx.fillRect(x * pxScale, y * pxScale, pxScale, pxScale);
    });

    // Generate link
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${activeTile.name.toLowerCase().replace(/\s+/g, "_")}_tile.png`;
    link.href = url;
    link.click();
  };

  // Copy CSS box shadow format representing pure visual CSS renders of the grid
  const handleCopyCSSShadow = () => {
    const size = activeTile.size;
    let shadows = [];
    for (let i = 0; i < activeTile.grid.length; i++) {
      const color = activeTile.grid[i];
      if (color === "transparent" || color === "#1a1c2c") continue; // Treat background color as clear
      const x = (i % size) + 1;
      const y = Math.floor(i / size) + 1;
      shadows.push(`${x}px ${y}px 0 ${color}`);
    }

    const cssRule = `.pixel-art {\n  position: relative;\n  width: 1px;\n  height: 1px;\n  background: transparent;\n  box-shadow: ${shadows.join(",\n    ")};\n}`;

    navigator.clipboard.writeText(cssRule);
    setGenerationLogs(["CSS code copied! Check your clipboard."]);
    setTimeout(() => setGenerationLogs([]), 2000);
  };

  // Copy JSON pixel data representation
  const handleCopyJSONData = () => {
    const dataStr = JSON.stringify(activeTile, null, 2);
    navigator.clipboard.writeText(dataStr);
    setGenerationLogs(["JSON export data copied to clipboard!"]);
    setTimeout(() => setGenerationLogs([]), 2000);
  };

  // Master shop palettes list
  const ALL_SHOP_PALETTES = [
    { name: "Classic PICO-8", colors: PRESET_PALETTES[0]?.colors || [], price: 0 },
    { name: "Sweetie 16", colors: PRESET_PALETTES[1]?.colors || [], price: 0 },
    { name: "Original GameBoy", colors: PRESET_PALETTES[2]?.colors || [], price: 0 },
    { name: "Vaporwave Sunset", colors: PRESET_PALETTES[3]?.colors || [], price: 150 },
    { name: "Cyberpunk Tech", colors: PRESET_PALETTES[4]?.colors || [], price: 250 },
    { name: "Gilded Outlaw", colors: ["#1e1c18", "#42382e", "#6d5843", "#9d8063", "#cbab8d", "#fae1cb", "#d1a126", "#ffd85c", "#7e1515"], price: 350 },
    { name: "Toxic Wasteland", colors: ["#0b0d10", "#15251a", "#294d29", "#41803b", "#70b342", "#a5f033", "#ff00ea", "#800060", "#00fdff"], price: 400 },
    { name: "Glacial Deep", colors: ["#020412", "#0b1530", "#142d59", "#1b4d8a", "#267bb8", "#4baade", "#a3e5f7", "#ffffff", "#8a9ea8"], price: 450 }
  ];

  const activePalettesList = ALL_SHOP_PALETTES.filter(
    (p) => p.price === 0 || unlockedPalettes.includes(p.name)
  );

  // Active palette from computed unlocked list
  const activePalette = activePalettesList[selectedPaletteIndex] || activePalettesList[0] || ALL_SHOP_PALETTES[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#08090f] text-gray-200 font-sans selection:bg-teal-500 selection:text-[#08090f] overflow-x-hidden pb-12">
      {/* Dynamic Header/Top Menu bar */}
      <header className="border-b border-[#202237] bg-[#10121e]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Meta title joined with Retro Economy dashboard items */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView("home")}>
              <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 via-amber-500 to-teal-500 rounded flex items-center justify-center p-[2px] shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <div className="w-full h-full bg-[#0d0e15] rounded flex items-center justify-center">
                  <span className="font-pixel text-[11px] text-teal-400 select-none animate-pulse">PL</span>
                </div>
              </div>
              <div>
                <h1 className="font-pixel text-sm tracking-widest bg-gradient-to-r from-teal-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                  pixelLab
                </h1>
                <p className="text-[10px] text-gray-500 font-mono">RETRO SEAMLESS TILES EDITOR</p>
              </div>
            </div>

            {/* HIGH FIDELITY GOLD WALLET & RANK PROGRESS */}
            <div className="flex items-center gap-2.5 h-10 px-3 bg-[#0d0f19] border border-[#2b2d45] rounded-xl font-mono text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-[#ffb732]" title="Gold Pocket Balance">
                <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="text-white bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 text-xs font-bold leading-none font-pixel select-none">
                  {goldCoins}
                </span>
                <span className="hidden sm:inline font-pixel text-[8px] tracking-tight">GOLD</span>
              </div>
              
              <div className="h-4 w-[1px] bg-slate-800" />
              
              <div className="flex items-center gap-1 text-[10px] text-gray-400 select-none">
                <Award className="w-4 h-4 text-teal-400 animate-pulse" />
                <span className="text-teal-300 font-bold font-pixel text-[9px]">LVL {Math.floor(totalEarned / 400) + 1}</span>
                <span className="hidden lg:inline text-gray-500 font-pixel text-[8px] truncate max-w-[80px]">
                  ({Math.floor(totalEarned / 400) + 1 <= 1 ? "SCRIBE" : Math.floor(totalEarned / 400) + 1 <= 3 ? "SMITH" : Math.floor(totalEarned / 400) + 1 <= 5 ? "ARTIFICER" : "TILE LORD"})
                </span>
              </div>

              <div className="h-4 w-[1px] bg-slate-800" />

              {/* Sound on/off master */}
              <button
                onClick={() => {
                  const val = !soundEnabled;
                  setSoundEnabled(val);
                  setTimeout(() => {
                    if (val) playRetroSound("coin");
                  }, 50);
                }}
                className="text-gray-500 hover:text-teal-400 transition ml-0.5"
                title={soundEnabled ? "Mute Retro Chimes" : "Unmute Retro Chimes"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-500" />}
              </button>
            </div>
          </div>

          {/* Quick Stats or Navigation options */}
          <nav className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setCurrentView("home")}
              className={`px-3 py-1.5 rounded transition ${
                currentView === "home"
                  ? "bg-[#181a2f] text-teal-400 border border-teal-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              /browser_tiles
            </button>
            <button
              onClick={() => {
                const wallObj = myTiles[0] || PRESET_TILES[1];
                handleEditTile(wallObj);
              }}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                currentView === "editor"
                  ? "bg-[#181a2f] text-amber-300 border border-amber-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> /editor_bench
            </button>
            <button
              onClick={() => setCurrentView("gallery")}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                currentView === "gallery"
                  ? "bg-[#181a2f] text-rose-400 border border-rose-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" /> /gallery_vault
            </button>
            <button
              onClick={() => {
                setCurrentView("market");
                playRetroSound("spark");
              }}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                currentView === "market"
                  ? "bg-[#181a2f] text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)] animate-pulse"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" /> /bounty_market
            </button>
            <button
              onClick={() => {
                setCurrentView("music");
                playRetroSound("level");
              }}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                currentView === "music"
                  ? "bg-[#181a2f] text-[#73eff7] border border-teal-500/30 shadow-[0_0_8px_rgba(115,239,247,0.15)] animate-pulse"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Music className="w-3.5 h-3.5 text-[#73eff7]" /> /music_studio
            </button>
            <button
              onClick={() => handleNewTile(16)}
              className="bg-teal-500 hover:bg-teal-400 text-[#0c0e16] px-3 py-1.5 font-bold rounded flex items-center gap-1 transition shadow-[0_0_10px_rgba(20,184,166,0.2)]"
            >
              <Plus className="w-3.5 h-3.5" /> NEW TILE
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8 w-full flex-grow">
        
        {/* RETRO ADDRESS BROWSER BAR (matches first attached user mockup image!) */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="bg-[#1b1c2b] border-[#2d2e45] border-2 rounded-lg p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-gray-400 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
              <span className="ml-2 font-pixel text-[8px] tracking-tight">PIXEL_BROWSER_v1.0</span>
            </div>
            
            {/* Address Bar Row as in the Image */}
            <div className="flex border-2 border-black bg-[#11111a] rounded overflow-hidden items-center p-1 font-mono text-xs shadow-[inset_-2px_-2px_0px_#222,inset_2px_2px_0px_#000]">
              <div className="flex items-center justify-center p-1.5 bg-[#25273b] border border-[#3b3c56] rounded-sm mr-2 text-teal-400 shrink-0">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div className="text-teal-300 font-pixel text-[9px] md:text-[11px] select-all select-none mr-2 bg-[#1b1d2e] px-1.5 py-1 border border-teal-500/20 rounded">
                www.pixellab.ai
              </div>
              <input
                id="search-input"
                type="text"
                placeholder={currentView === "editor" ? "Create Tiles..." : currentView === "music" ? "Synthesize Music Loops..." : "search tile themes: grass, lava, tech, metal..."}
                value={currentView === "editor" ? "Create Tiles..." : currentView === "music" ? "Synthesize Music Loops..." : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDirectSearchGenerate()}
                className="w-full bg-transparent focus:outline-none text-gray-200 border-none font-mono py-1 px-2 placeholder:text-gray-600 font-medium"
                disabled={currentView === "editor" || currentView === "music"}
              />
            </div>
            
            {/* Retro Action buttons aligned underneath, perfectly styled as the image buttons */}
            {currentView !== "editor" && (
              <div className="flex items-center justify-center gap-4 mt-3">
                <button
                  onClick={handleDirectSearchGenerate}
                  className="px-4 py-2 bg-[#2d2f47] active:bg-[#1f2030] hover:bg-[#383a58] text-gray-200 font-pixel text-[9px] uppercase tracking-wide border-2 border-black rounded shadow-[inset_-1px_-1px_0px_#111,1px_1px_0px_#fff] cursor-pointer"
                >
                  PIXEL SEARCH
                </button>
                <button
                  onClick={handleImFeelingLucky}
                  className="px-4 py-2 bg-[#2d2f47] active:bg-[#1f2030] hover:bg-[#383a58] text-gray-200 font-pixel text-[9px] uppercase tracking-wide border-2 border-black rounded shadow-[inset_-1px_-1px_0px_#111,1px_1px_0px_#fff] cursor-pointer"
                >
                  I'M FEELING LUCKY
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== VIEW 1: HOME CATALOG & SEARCH ==================== */}
        {currentView === "home" && (
          <div>
            {/* Heading Accent */}
            <div className="text-center mb-8">
              <span className="font-pixel text-[10px] tracking-widest text-[#ef7d57] bg-[#ef7d57]/10 px-3 py-1 rounded inline-block mb-3 border border-[#ef7d57]/30">
                COMPREHENSIVE DESIGN LIBRARY
              </span>
              <h2 className="text-3xl font-bold tracking-tight font-sans text-white">
                Texture Explorer Catalog
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
                Discover pre-loaded professional vintage tiles or use the retro prompt system to generate repeating tiles on demand.
              </p>
            </div>

            {/* Catalog Grid Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
               {/* Left Column: Quick generate panel with text prompt */}
              <div className="lg:col-span-1 bg-[#10121e] border border-[#202237] p-5 rounded-xl h-fit">
                <h3 className="font-pixel text-[10px] text-teal-400 mb-3 tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Synthesize Grid
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Describe what asset details should compile inside our 8-bit visual grid database.
                </p>

                <div className="space-y-4">
                  {/* GENERATION MODE SELECTOR */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                      Asset Generation Target:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <button
                        onClick={() => setGenerateMode("tile")}
                        className={`p-2 py-2.5 rounded border text-center font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          generateMode === "tile"
                            ? "bg-[#1b1d2e]/80 border-teal-500 text-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.1)]"
                            : "bg-[#0c0d15] border-[#23253b] text-gray-500 hover:text-gray-400"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4 shrink-0" />
                        <span>Seamless Tile</span>
                      </button>
                      <button
                        onClick={() => setGenerateMode("sprite")}
                        className={`p-2 py-2.5 rounded border text-center font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          generateMode === "sprite"
                            ? "bg-[#1b1d2e]/80 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.1)]"
                            : "bg-[#0c0d15] border-[#23253b] text-gray-500 hover:text-gray-400"
                        }`}
                      >
                        <Heart className="w-4 h-4 shrink-0" />
                        <span>Sprite Asset</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                      Prompt description and style:
                    </label>
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={
                        generateMode === "sprite"
                          ? "e.g., green medieval dragon, pixel art health potion icon, golden magical sword..."
                          : "e.g., icy crystal cavern block, copper mechanical circuit node..."
                      }
                      className="w-full bg-[#0d0f17] border border-[#23253b] text-xs font-mono rounded p-2.5 text-gray-300 focus:outline-none focus:border-teal-500 placeholder:text-gray-600 resize-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                      Fidelity Format:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-[#1b1d2e] border border-[#2e314e] rounded p-2 text-center text-[#ffcd75]">
                        16x16 Grid
                      </div>
                      <div className="bg-[#0b0c12] opacity-50 border border-dashed border-[#222] p-2 rounded text-center text-gray-500 cursor-not-allowed">
                        32x32 Grid
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => generateTileWithAI(aiPrompt, 16)}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-amber-500 text-[#0c0e16] font-bold text-xs font-mono uppercase tracking-widest rounded hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#111] border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate AI Tile
                      </>
                    )}
                  </button>
                </div>

                {/* Live Output Log visualizer */}
                {isGenerating && (
                  <div className="mt-4 p-3 bg-[#0c0d15] border border-teal-500/20 rounded font-mono text-[9px] text-teal-400 space-y-1.5 max-h-[160px] overflow-y-auto">
                    <p className="pulse-pixel text-amber-400 font-bold uppercase select-none">
                      === COMPILING MATRIX ===
                    </p>
                    {generationLogs.map((log, idx) => (
                      <p key={idx} className="animate-fade-in truncate">
                        {log}
                      </p>
                    ))}
                  </div>
                )}

                {errorText && (
                  <div className="mt-4 p-3 bg-red-950/40 border border-red-500/20 rounded font-mono text-[10px] text-red-300">
                    <p className="font-bold uppercase">Generation Fail:</p>
                    <p className="mt-1 leading-relaxed">{errorText}</p>
                  </div>
                )}
              </div>

              {/* Right Columns: Display list of tiles */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Search Bar Context Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#202237] pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setCatalogTab("all")}
                      className={`text-[10px] md:text-xs px-3 py-1.5 rounded transition tracking-wider font-pixel font-bold uppercase ${
                        catalogTab === "all"
                          ? "bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                          : "bg-[#10121e] border border-[#202237] text-gray-400 hover:text-white"
                      }`}
                    >
                      All ({searchResults.length})
                    </button>
                    <button
                      onClick={() => setCatalogTab("tile")}
                      className={`text-[10px] md:text-xs px-3 py-1.5 rounded transition tracking-wider font-pixel font-bold uppercase ${
                        catalogTab === "tile"
                          ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "bg-[#10121e] border border-[#202237] text-gray-400 hover:text-white"
                      }`}
                    >
                      Seamless Tiles
                    </button>
                    <button
                      onClick={() => setCatalogTab("sprite")}
                      className={`text-[10px] md:text-xs px-3 py-1.5 rounded transition tracking-wider font-pixel font-bold uppercase ${
                        catalogTab === "sprite"
                          ? "bg-rose-500 text-black shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          : "bg-[#10121e] border border-[#202237] text-gray-400 hover:text-white"
                      }`}
                    >
                      Sprites & Emojis
                    </button>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setCatalogTab("all");
                      }}
                      className="text-xs px-2.5 py-1.5 rounded bg-[#10121e] border border-[#202237] hover:bg-[#1a1c2c] transition font-mono text-gray-400 hover:text-white"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-20 bg-[#10121e]/40 border border-dashed border-[#202237] rounded-xl">
                    <p className="text-gray-400 text-sm">No pixel designs match your current search constraints.</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Try typing a custom prompt into the Synthesize column!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {searchResults.map((tile) => (
                      <div
                        key={tile.id}
                        onClick={() => handleEditTile(tile)}
                        className="group bg-[#10121e] border border-[#202237] hover:border-teal-500/50 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between"
                      >
                        {/* 2D Render of Pixel Array inside small preview container */}
                        <div className="aspect-square bg-[#0b0c12] rounded-lg overflow-hidden border border-[#24263e] relative mb-3 flex items-center justify-center p-1">
                          
                          {/* Semicolon Repeating Checker for subtle preview */}
                          <div
                            className="w-full h-full grid select-none"
                            style={{
                              gridTemplateColumns: `repeat(${tile.size}, minmax(0, 1fr))`,
                              imageRendering: "pixelated"
                            }}
                          >
                            {tile.grid.map((color, idx) => (
                              <div
                                key={idx}
                                style={{ backgroundColor: color }}
                                className="w-full h-full scale-[1.05]"
                              />
                            ))}
                          </div>

                          {/* Float Categories label */}
                          {tile.category && (
                            <span className="absolute bottom-1 px-1.5 py-0.5 bg-black/70 text-[8px] font-pixel text-teal-400 tracking-wider rounded border border-[#2c2d3c]">
                              {tile.category}
                            </span>
                          )}

                          {/* Hover Overlay Button */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                            <span className="font-pixel text-[8px] tracking-wider bg-teal-500 text-black px-2 py-1 rounded font-bold uppercase shadow-lg">
                              Edit Canvas
                            </span>
                          </div>
                        </div>

                        {/* Description labels */}
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="font-bold text-xs truncate max-w-[80%] text-white group-hover:text-teal-400 transition">
                              {tile.name}
                            </h4>
                            <button
                              onClick={(e) => handleToggleFavorite(tile, e)}
                              className="text-gray-600 hover:text-rose-500 transition"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  tile.isFavorite
                                    ? "fill-rose-500 text-rose-500"
                                    : "text-gray-500"
                                }`}
                              />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                            <span>{tile.size}x{tile.size} Grid</span>
                            {"createdAt" in tile && myTiles.find((t) => t.id === tile.id) ? (
                              <button
                                onClick={(e) => handleDeleteTile(tile.id, e)}
                                className="hover:text-red-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                title="Delete from custom catalog"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-gray-600 italic">Preset</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Design Workflow Info banner */}
            <div className="mt-12 bg-[#121422] border border-[#202237] p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-tr from-[#ef7d57] to-[#ffcd75] rounded-xl p-3 shrink-0">
                <Grid3X3 className="w-8 h-8 text-[#121422]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">Perfect 3x3 Repeat Visualizer Included</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Click on any tile above to open it in our workshop bench. When active, you can preview the design as a repeated grid matrix, which adapts dynamically to each pixel brush action immediately!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: INTERACTIVE CREATE/EDIT WORKBENCH ==================== */}
        {currentView === "editor" && (
          <div className="space-y-6">
            
            {/* Breadcrumb bread crumbs (matches Image 2: pixellab.ai / Create Tiles...) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#202237] pb-4">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-gray-500 cursor-pointer hover:text-white" onClick={() => setCurrentView("home")}>
                  pixellab.ai
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                <span className="text-gray-500 cursor-pointer hover:text-white" onClick={() => setCurrentView("home")}>
                  Create Tiles...
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                <span className="text-white font-bold bg-[#1d1f30] px-2 py-0.5 rounded">
                  {activeTile.name}
                </span>
              </div>

              {/* Action items on top edit bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView("home")}
                  className="px-3 py-1.5 rounded bg-[#10121e] border border-[#202237] text-gray-400 hover:text-white text-xs font-mono flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
                </button>
              </div>
            </div>

            {/* AI Generator feedback banners (for inline canvas updates) */}
            {generationLogs.length > 0 && (
              <div className="p-3 bg-teal-950/20 border border-teal-500/20 text-teal-400 rounded-lg text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></span>
                <span>{generationLogs[generationLogs.length - 1]}</span>
              </div>
            )}

            {/* Custom Workbench Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* columns 1-3: TOOL BELT & CONFIGS */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* Frame configuration */}
                <div className="bg-[#10121e] border border-[#202237] p-4 rounded-xl">
                  <h3 className="font-pixel text-[9px] text-[#ef7d57] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Bench Options
                  </h3>

                  <div className="space-y-4">
                    {/* Title input */}
                    <div>
                      <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">
                        Tile Asset Name:
                      </label>
                      <input
                        type="text"
                        value={activeTile.name}
                        onChange={(e) => setActiveTile({ ...activeTile, name: e.target.value })}
                        className="w-full bg-[#0d0f17] border border-[#24263a] text-xs font-mono p-2 text-white rounded focus:outline-none focus:border-amber-500"
                        placeholder="Unnamed Tile"
                      />
                    </div>

                    {/* Canvas size */}
                    <div>
                      <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">
                        Grid Dimension (Resolution):
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <button
                          onClick={() => {
                            if (activeTile.size !== 16) {
                              const proceed = confirm("Changing grid size will reset current painting. Continue?");
                              if (proceed) handleNewTile(16);
                            }
                          }}
                          className={`p-2 rounded border text-center font-bold tracking-wider transition ${
                            activeTile.size === 16
                              ? "bg-amber-500 border-amber-400 text-black"
                              : "bg-[#181a2f] border-[#202237] text-gray-400 hover:text-white"
                          }`}
                        >
                          16 x 16 (Retro)
                        </button>
                        <button
                          onClick={() => {
                            if (activeTile.size !== 32) {
                              const proceed = confirm("Changing grid size will reset current painting. Continue?");
                              if (proceed) handleNewTile(32);
                            }
                          }}
                          className={`p-2 rounded border text-center font-bold tracking-wider transition ${
                            activeTile.size === 32
                              ? "bg-amber-500 border-amber-400 text-black"
                              : "bg-[#181a2f] border-[#202237] text-gray-400 hover:text-white"
                          }`}
                        >
                          32 x 32 (HD)
                        </button>
                      </div>
                    </div>

                    {/* Draw Tools selector */}
                    <div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">
                        Active Brush Tool:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <button
                          onClick={() => setEditorTool("pencil")}
                          className={`p-2 rounded border flex items-center gap-1.5 justify-center transition ${
                            editorTool === "pencil"
                              ? "bg-teal-500 border-teal-400 text-black font-bold"
                              : "bg-[#181a2f] border-[#202237] text-gray-400 hover:text-white"
                          }`}
                        >
                          <Paintbrush className="w-3.5 h-3.5" /> Pencil
                        </button>
                        <button
                          onClick={() => setEditorTool("eraser")}
                          className={`p-2 rounded border flex items-center gap-1.5 justify-center transition ${
                            editorTool === "eraser"
                              ? "bg-teal-500 border-teal-400 text-black font-bold"
                              : "bg-[#181a2f] border-[#202237] text-gray-400 hover:text-white"
                          }`}
                        >
                          <Eraser className="w-3.5 h-3.5" /> Eraser
                        </button>
                        <button
                          onClick={() => setEditorTool("bucket")}
                          className={`p-2 rounded border flex items-center gap-1.5 justify-center transition ${
                            editorTool === "bucket"
                              ? "bg-teal-500 border-teal-400 text-black font-bold"
                              : "bg-[#181a2f] border-[#202237] text-gray-400 hover:text-white"
                          }`}
                        >
                          <PaintBucket className="w-3.5 h-3.5" /> Fill
                        </button>
                        <button
                          onClick={() => setEditorTool("picker")}
                          className={`p-2 rounded border flex items-center gap-1.5 justify-center transition ${
                            editorTool === "picker"
                              ? "bg-teal-500 border-teal-400 text-black font-bold"
                              : "bg-[#181a2f] border-[#202237] text-gray-400 hover:text-white"
                          }`}
                        >
                          <Pipette className="w-3.5 h-3.5" /> Picker
                        </button>
                      </div>
                    </div>



                    {/* Clear Canvas */}
                    <button
                      onClick={() => {
                        const confirmClear = confirm("Are you sure you want to clear your painting canvas?");
                        if (confirmClear) {
                          setHistoryStack((prev) => [...prev, [...activeTile.grid]]);
                          setActiveTile((prev) => ({
                            ...prev,
                            grid: Array(prev.size * prev.size).fill("#1a1c2c")
                          }));
                        }
                      }}
                      className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-300 rounded font-mono text-xs cursor-pointer text-center"
                    >
                      Clear Painting Canvas
                    </button>
                  </div>
                </div>

                {/* ==================== DRAW SUBJECTS BLUEPRINT GUIDES ==================== */}
                <div className="bg-[#10121e] border border-[#202237] p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-pixel text-[9px] text-[#ef7d57] uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" /> Draw Subject Guides
                    </h3>
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded font-bold">
                      Interactive Blueprints
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Select a key pixel subject to learn classic 8-bit asset structures. Highlight blueprints with a faint ghost trace stencil directly over your active grid!
                  </p>

                  <div className="space-y-2.5">
                    {/* Subject Selector dropdown */}
                    <div className="font-mono text-xs">
                      <label className="text-gray-500 block mb-1 uppercase text-[9px] tracking-wider font-bold">
                        Choose Subject Target:
                      </label>
                      <select
                        value={activeSubjectId || ""}
                        onChange={(e) => {
                          const val = e.target.value || null;
                          setActiveSubjectId(val);
                          if (val) {
                            setShowTraceGuides(true);
                            playRetroSound("spark");
                          } else {
                            setShowTraceGuides(false);
                          }
                        }}
                        className="w-full text-xs font-mono bg-[#0d0f17] border border-[#24263a] rounded px-2.5 py-2 text-gray-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- Practice Drawing Subject --</option>
                        {SUBJECT_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.emoji} {tpl.name} ({tpl.difficulty})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active Subject Info container */}
                    {activeSubjectId ? (
                      (() => {
                        const sub = SUBJECT_TEMPLATES.find(s => s.id === activeSubjectId);
                        if (!sub) return null;
                        return (
                          <div className="bg-[#151726] border border-[#282a3f] p-3 rounded-lg space-y-3.5 font-mono">
                            {/* Title, Category & Difficulty */}
                            <div className="flex items-center justify-between border-b border-[#242637] pb-2">
                              <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                                <span className="text-sm select-none">{sub.emoji}</span> {sub.name}
                              </span>
                              <span className={`text-[8px] font-pixel px-1.5 py-0.5 rounded ${
                                sub.difficulty === "Easy" ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/10" :
                                sub.difficulty === "Medium" ? "bg-amber-950/50 text-amber-300 border border-amber-500/10" :
                                "bg-rose-950/50 text-rose-300 border border-rose-500/13"
                              }`}>
                                {sub.difficulty}
                              </span>
                            </div>

                            {/* Miniature Guide board and tips */}
                            <div className="flex gap-2.5">
                              {/* 16x16 Preview */}
                              <div className="w-[52px] h-[52px] bg-[#0c0d15] border border-[#2a2c41] p-0.5 rounded shrink-0 relative overflow-hidden flex items-center justify-center select-none" style={{ imageRendering: 'pixelated' }}>
                                <div 
                                  className="grid select-none pointer-events-none w-full h-full"
                                  style={{
                                    gridTemplateColumns: `repeat(${sub.size}, minmax(0, 1fr))`,
                                    imageRendering: "pixelated"
                                  }}
                                >
                                  {sub.grid.map((c, i) => (
                                    <div 
                                      key={i} 
                                      style={{ backgroundColor: c === "transparent" ? "transparent" : c }} 
                                      className="w-full h-full"
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Tips text */}
                              <div className="space-y-1 flex-grow">
                                <span className="text-[8px] text-teal-400 font-pixel uppercase tracking-widest block select-none">
                                  Silas' Drawing Tips:
                                </span>
                                <p className="text-[9px] text-gray-300 leading-normal italic">
                                  "{sub.tips}"
                                </p>
                              </div>
                            </div>

                            {/* Trace control buttons */}
                            <div className="space-y-2 pt-1 border-t border-[#242637]">
                              {/* Overlay Ghost guide toggle */}
                              <div className="flex items-center justify-between text-xs py-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  {showTraceGuides ? <Eye className="w-3.5 h-3.5 text-teal-400 animate-pulse" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                                  Ghost Stencil Guides:
                                </span>
                                
                                <button
                                  onClick={() => {
                                    setShowTraceGuides(!showTraceGuides);
                                    playRetroSound("coin");
                                  }}
                                  className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition cursor-pointer font-pixel ${
                                    showTraceGuides
                                      ? "bg-teal-500/15 border border-teal-500/30 text-teal-300 shadow-[0_0_8px_rgba(20,180,180,0.1)]"
                                      : "bg-[#0d0f17] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                                  }`}
                                >
                                  {showTraceGuides ? "ON" : "OFF"}
                                </button>
                              </div>

                              {/* Auto fill skeletal and Palette Loader buttons */}
                              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                                <button
                                  onClick={() => {
                                    const uniqueToInject = sub.colorsUsed.filter(col => col !== "transparent");
                                    setCustomColors(prev => {
                                      const combined = Array.from(new Set([...prev, ...uniqueToInject]));
                                      return combined.slice(0, 16);
                                    });
                                    if (uniqueToInject.length > 0) {
                                      setActiveColor(uniqueToInject[0]);
                                    }
                                    playRetroSound("level");
                                    setGenerationLogs([`Subject palette colors synced to Workbench!`]);
                                    setTimeout(() => setGenerationLogs([]), 2000);
                                  }}
                                  className="py-1.5 bg-[#1f2136] border border-[#3e415e] hover:bg-[#2c2f4d] hover:border-gray-400 text-gray-300 rounded font-bold uppercase tracking-wide transition block text-center cursor-pointer font-pixel text-[8px]"
                                  title="Add colors from this subject design directly into your active editor slots"
                                >
                                  🎨 Load Colors
                                </button>
                                
                                <button
                                  onClick={() => {
                                    const confirmSkel = confirm(`Overwrite current matrix and load "${sub.name}" blueprint skeleton? This will act as your drawing canvas structure.`);
                                    if (confirmSkel) {
                                      setHistoryStack((prev) => [...prev, [...activeTile.grid]]);
                                      setActiveTile(prev => ({
                                        ...prev,
                                        size: 16,
                                        grid: sub.grid.map(c => c === "transparent" ? "#1a1c2c" : c)
                                      }));
                                      playRetroSound("level");
                                      setGenerationLogs([`Loaded skeletal layout for "${sub.name}"!`]);
                                      setTimeout(() => setGenerationLogs([]), 2500);
                                    }
                                  }}
                                  className="py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold uppercase tracking-wide transition block text-center cursor-pointer font-pixel text-[8px]"
                                  title="Fills the entire grid with this subject design layout directly"
                                >
                                  ✨ Load Skeleton
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-[#0c0d15] border border-[#1f2132] p-3.5 text-center text-gray-400 rounded text-[10px] italic font-mono leading-relaxed">
                        No blueprint active. Choose a practice subject target above to set outline guides on your workbench.
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Assistant inline tile helper */}
                <div className="bg-[#10121e] border border-[#202237] p-4 rounded-xl">
                  <h3 className="font-pixel text-[9px] text-teal-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Prompter Helper
                  </h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                    Let Gemini inject high fidelity pixel assets directly into your active editor!
                  </p>

                  <div className="space-y-3">
                    {/* Inline Generation Mode Selector */}
                    <div>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                        <button
                          onClick={() => setGenerateMode("tile")}
                          className={`py-1.5 rounded border text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                            generateMode === "tile"
                              ? "bg-[#181a2f] border-teal-500/50 text-teal-400 font-bold"
                              : "bg-[#0c0d15] border-[#222] text-gray-500 hover:text-gray-400"
                          }`}
                        >
                          Seamless Tile
                        </button>
                        <button
                          onClick={() => setGenerateMode("sprite")}
                          className={`py-1.5 rounded border text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                            generateMode === "sprite"
                              ? "bg-[#181a2f] border-rose-500/50 text-rose-400 font-bold"
                              : "bg-[#0c0d15] border-[#222] text-gray-500 hover:text-gray-400"
                          }`}
                        >
                          Sprite Asset
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={
                        generateMode === "sprite"
                          ? "e.g., medieval dragon, red health potion, steel sword..."
                          : "e.g., molten magma flow, green mossy bricks..."
                      }
                      className="w-full bg-[#0d0f17] border border-[#23253b] text-xs font-mono rounded p-2 text-gray-300 focus:outline-none"
                    />

                    <button
                      onClick={() => generateTileWithAI(aiPrompt, activeTile.size)}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded disabled:opacity-40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Compiling...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Synthesize Grid
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* columns 4-8: CENTER CANVAS MATRIX DRAWING BLOCK */}
              <div className="lg:col-span-5 bg-[#10121e] border border-[#202237] p-5 rounded-xl space-y-6">
                
                {/* Canvas Matrix Header details */}
                <div className="flex items-center justify-between border-b border-[#202237] pb-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <Grid3X3 className="w-4 h-4 text-amber-400" />
                    <span>Workspace: <strong className="text-white">{activeTile.size}x{activeTile.size}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={historyStack.length === 0}
                      className="p-1 px-2 rounded bg-[#1c1e30] hover:bg-[#272942] disabled:opacity-30 disabled:hover:bg-[#1c1e30] text-gray-300 transition"
                      title="Undo Action"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      className="p-1 px-2 rounded bg-[#1c1e30] hover:bg-[#272942] disabled:opacity-30 disabled:hover:bg-[#1c1e30] text-gray-300 transition rotate-180 scale-x-[-1]"
                      title="Redo Action"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary Draw Grid */}
                <div className="flex justify-center select-none">
                  <div className="bg-[#0b0c12] p-3 rounded-xl border-2 border-[#2b2d45] relative shadow-2xl shrink-0">
                    <div
                      className="grid gap-[1px] border border-[#222]"
                      style={{
                        gridTemplateColumns: `repeat(${activeTile.size}, minmax(0, 400px))`,
                        width: `min(100%, 360px)`,
                        maxWidth: "360px",
                        aspectRatio: "1/1"
                      }}
                    >
                      {activeTile.grid.map((color, index) => {
                        const size = activeTile.size;
                        const x = index % size;
                        const y = Math.floor(index / size);
                        
                        // Ghost trace guidelines support (so you can draw subjects)
                        const activeSubject = SUBJECT_TEMPLATES.find(s => s.id === activeSubjectId);
                        const tracePixelColor = activeSubject && activeSubject.grid[index];
                        const isCellDefault = color === "#1a1c2c" || color === "transparent" || color === "#08090f";
                        const showGhostTracer = showTraceGuides && activeSubject && size === 16 && isCellDefault && tracePixelColor && tracePixelColor !== "transparent";

                        return (
                          <div
                            key={index}
                            onClick={() => handlePixelInteract(index)}
                            onMouseEnter={(e) => {
                              // Enable dragging to paint while mouse is active
                              if (e.buttons === 1) {
                                handlePixelInteract(index);
                              }
                            }}
                            style={{ 
                              backgroundColor: showGhostTracer ? `${tracePixelColor}38` : color 
                            }}
                            className="aspect-square relative flex items-center justify-center cursor-crosshair group/cell transition duration-75 scale-[1.03]"
                          >
                            {/* Trace design guide dot */}
                            {showGhostTracer && (
                              <div 
                                className="w-[4px] h-[4px] rounded-full opacity-60" 
                                style={{ backgroundColor: tracePixelColor }} 
                              />
                            )}

                            {/* Symmetric pointer indicator guides */}
                            <div className="absolute inset-0 border border-transparent group-hover/cell:border-white/50 pointer-events-none" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Retro Preset Palettes select */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Selected Color Palette:</span>
                    <select
                      value={selectedPaletteIndex}
                      onChange={(e) => setSelectedPaletteIndex(Number(e.target.value))}
                      className="bg-[#181a2f] border border-[#303350] rounded px-2 py-0.5 text-teal-400 focus:outline-none"
                    >
                      {activePalettesList.map((p, idx) => (
                        <option key={p.name} value={idx}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Render palette grid */}
                  <div className="flex flex-wrap gap-2.5 items-center bg-[#0d0f17] p-2.5 rounded-lg border border-[#23253a]">
                    {activePalette.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => siphonColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded border-2 transition relative ${
                          activeColor === color
                            ? "border-teal-400 scale-110 shadow-lg z-10"
                            : "border-black/50 hover:border-white/50"
                        }`}
                        title={color}
                      >
                        {activeColor === color && (
                          <span className="absolute inset-0 border border-white/40 rounded-sm" />
                        )}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleAddNewCustomColor}
                      className="w-7 h-7 rounded border border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center text-gray-500 hover:text-white transition cursor-pointer"
                      title="Add random custom color"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Selected color display detail */}
                  <div className="flex items-center justify-between bg-[#131525] p-2 rounded border border-[#202237] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-black" style={{ backgroundColor: activeColor }} />
                      <span className="text-gray-300 uppercase select-all font-bold">{activeColor}</span>
                    </div>
                    <span className="text-gray-500 italic text-[10px]">Pencil Mode Active</span>
                  </div>
                </div>

              </div>

              {/* columns 9-12: SEAMLESS REPEATING MATRIX PREVIEW & STORAGE */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 3x3 Tiling or Sprite Preview Panel with Interactive Playtest Sandbox Arena */}
                <div className="bg-[#10121e] border border-[#202237] p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#202237]/60 pb-2">
                    <span className="text-[10px] font-pixel text-[#ef7d57] uppercase tracking-wider flex items-center gap-1.5">
                      {playtestTab === "playtest" ? (
                        <span className="flex items-center gap-1">⚔️ Playtest Arena</span>
                      ) : (
                        <span className="flex items-center gap-1">👁️ Workbench Preview</span>
                      )}
                    </span>
                    <div className="flex gap-1.5 bg-[#0b0c13] p-1 rounded-md border border-[#1f2134]">
                      <button
                        onClick={() => {
                          setPlaytestTab("default");
                          playRetroSound("spark");
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-pixel uppercase transition cursor-pointer ${
                          playtestTab === "default"
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        Default
                      </button>
                      <button
                        onClick={() => {
                          setPlaytestTab("playtest");
                          playRetroSound("level");
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-pixel uppercase transition cursor-pointer flex items-center gap-1 ${
                          playtestTab === "playtest"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="Interact with your custom design in a real-time platformer playground!"
                      >
                        🎮 Playtest
                      </button>
                    </div>
                  </div>

                  {playtestTab === "playtest" ? (
                    <div className="space-y-3.5 font-mono">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1 text-amber-400 font-pixel text-[8px] tracking-wide">
                          🏆 HIGHSCORE:
                        </span>
                        <span className="font-pixel text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                          {playtestScore} PTS
                        </span>
                      </div>

                      {/* Interactive sandbox viewport */}
                      <div className="bg-[#06070a] rounded-lg border-2 border-[#202237] h-[210px] relative overflow-hidden flex flex-col justify-between select-none">
                        
                        {/* Damage floating numbers */}
                        {playtestDamageFloats.map((df) => (
                          <div
                            key={df.id}
                            style={{ left: `${df.x}%`, bottom: `${df.y}px` }}
                            className="absolute text-yellow-400 font-pixel text-[9px] font-bold select-none pointer-events-none z-30 animate-bounce"
                          >
                            {df.text}
                          </div>
                        ))}

                        {/* Top stat bars inside the simulator screen */}
                        <div className="p-2 flex justify-between gap-1 z-10 font-mono">
                          {/* Player status */}
                          <div className="bg-black/80 px-2 py-1 rounded border border-[#242637] text-[8px] flex flex-col gap-0.5">
                            <span className="text-teal-400 font-pixel uppercase text-[7px]">HERO (YOU)</span>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span>HP:</span>
                              <div className="w-12 h-1 bg-red-950 rounded overflow-hidden">
                                <div className="h-full bg-emerald-400 w-full" />
                              </div>
                            </div>
                          </div>

                          {/* Monster status */}
                          <div className="bg-black/80 px-2 py-1 rounded border border-[#242637] text-[8px] flex flex-col gap-0.5 text-right items-end">
                            <span className="text-rose-400 font-pixel uppercase text-[7px]">
                              {playtestDummyType}
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span>HP:</span>
                              <div className="w-14 h-1 bg-red-950 rounded overflow-hidden">
                                <div 
                                  className="h-full bg-rose-500 transition-all duration-150" 
                                  style={{ width: `${(playtestDummyHp / playtestDummyMaxHp) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mid stage arena - main canvas */}
                        <div className="flex-grow relative flex items-end justify-between px-4 pb-2 z-10">
                          
                          {/* Interactive Hero character player */}
                          <div 
                            className="absolute transition-all duration-150"
                            style={{ 
                              left: `${playtestCharX}%`, 
                              bottom: "6px"
                            }}
                          >
                            {/* Animated body */}
                            <div className={`relative flex flex-col items-center justify-center ${playtestIsThrusting ? "animate-pulse" : "animate-bounce"}`} style={{ animationDuration: playtestIsThrusting ? "0.15s" : "1.8s" }}>
                              
                              {/* Helmet Plumage */}
                              <div className="w-3 h-1.5 bg-[#ef7d57] rounded-t-full"></div>
                              {/* Steel Helmet */}
                              <div className="w-[18px] h-[18px] bg-[#94b0c2] border border-[#333c57] rounded flex items-center justify-center relative">
                                <div className="absolute top-[3px] bg-amber-400 w-1.5 h-1 rounded-sm" />
                                <div className="absolute bottom-[2px] w-[14px] h-[4px] bg-slate-950 flex justify-around">
                                  <div className="w-[1.5px] h-full bg-red-500" />
                                  <div className="w-[1.5px] h-full bg-red-500" />
                                </div>
                              </div>
                              {/* Mail Chest armor */}
                              <div className="w-[18px] h-[14px] bg-[#566c86] border border-[#29366f] flex items-center justify-center relative">
                                {/* Golden cross medallion */}
                                <div className="w-1.5 h-2 bg-amber-400 rounded-sm" />
                              </div>
                              {/* Legs boots */}
                              <div className="flex gap-1.5 mt-[-1px]">
                                <div className="w-2 h-2 bg-amber-800 rounded-b"></div>
                                <div className="w-2 h-2 bg-amber-800 rounded-b"></div>
                              </div>

                              {/* HELD PIXEL BLUEPRINT ASSIGNMENT */}
                              <div 
                                className="absolute"
                                style={{
                                  right: "-20px",
                                  bottom: "4px",
                                  transform: playtestIsThrusting 
                                    ? "translate(12px, -3px) rotate(45deg) scale(1.15)" 
                                    : "translate(0px, 0px) rotate(15deg)",
                                  transition: "transform 0.12s ease-out",
                                }}
                              >
                                {/* Render 16x16 or 32x32 Active Design Blueprint as Miniature weapon/object! */}
                                <div 
                                  className="w-[32px] h-[32px] border border-amber-500/30 p-0.5 rounded bg-black/80 shadow-lg relative overflow-hidden"
                                  style={{ imageRendering: "pixelated" }}
                                >
                                  <div 
                                    className="grid w-full h-full"
                                    style={{
                                      gridTemplateColumns: `repeat(${activeTile.size}, minmax(0, 1fr))`,
                                    }}
                                  >
                                    {activeTile.grid.map((c, i) => (
                                      <div 
                                        key={i} 
                                        style={{ backgroundColor: c === "#1a1c2c" || c === "transparent" ? "transparent" : c }}
                                        className="w-full h-full"
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="absolute bottom-[-5px] left-1 bg-amber-500 text-black font-pixel scale-[0.6] px-1 rounded uppercase tracking-wider font-bold">
                                  HELD
                                </span>
                              </div>

                            </div>
                          </div>

                          {/* Interactive Creature Target On Right */}
                          <div className="absolute right-[12%] bottom-[8px]">
                            {playtestDummyHp <= 0 ? (
                              <div className="animate-ping text-[8px] text-yellow-400 font-pixel font-bold">
                               💥 DEFEATED!
                              </div>
                            ) : (
                              <div className={`relative flex flex-col items-center justify-center ${playtestIsThrusting ? "animate-bounce" : "animate-pulse"}`} style={{ animationDuration: "1s" }}>
                                {playtestDummyType === "Slime" && (
                                  <div className="w-8 h-7 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-full border border-teal-300 flex flex-col justify-center items-center relative shadow-[0_4px_12px_rgba(40,250,150,0.3)]">
                                    <div className="flex gap-2 mt-1">
                                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                    </div>
                                    <div className="w-4 h-1 bg-emerald-800 rounded-full mt-1 animate-pulse" />
                                  </div>
                                )}
                                {playtestDummyType === "Goblin" && (
                                  <div className="w-[28px] h-[32px] bg-lime-600 rounded-t-lg border border-lime-400 flex flex-col justify-center items-center relative shadow-[0_4px_10px_rgba(100,240,50,0.15)]">
                                    {/* pointed ears */}
                                    <div className="absolute left-[-5px] top-1.5 w-3 h-1.5 bg-lime-600 rotate-45 rounded"></div>
                                    <div className="absolute right-[-5px] top-1.5 w-3 h-1.5 bg-lime-600 -rotate-45 rounded"></div>
                                    <div className="flex gap-2 mt-1.5">
                                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                    </div>
                                    <div className="w-4 h-1.5 bg-lime-900 rounded-full mt-2" />
                                  </div>
                                )}
                                {playtestDummyType === "Dragon" && (
                                  <div className="w-[36px] h-[36px] bg-[#b13e53] rounded-t-2xl border border-red-400 flex flex-col justify-center items-center relative shadow-[0_4px_14px_rgba(239,68,68,0.35)]">
                                    {/* horns */}
                                    <div className="absolute left-1.5 top-[-5px] w-1.5 h-3 bg-yellow-500 rotate-[15deg]"></div>
                                    <div className="absolute right-1.5 top-[-5px] w-1.5 h-3 bg-yellow-500 rotate-[-15deg]"></div>
                                    <div className="flex gap-2 .5 mt-1.5">
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                                    </div>
                                    <div className="w-5 h-2 bg-amber-950 mt-1.5 rounded-full" />
                                  </div>
                                )}
                                {playtestDummyType === "Training Dummy" && (
                                  <div className="flex flex-col items-center">
                                    <div className="w-[24px] h-[28px] bg-amber-700 rounded border border-amber-900 flex flex-col justify-center items-center relative">
                                      <div className="w-[18px] h-1.5 bg-amber-400 mt-2" />
                                      <div className="w-1.5 h-5 bg-amber-900 absolute bottom-[-4px]" />
                                    </div>
                                    <div className="w-[32px] h-1 bg-amber-950 mt-2"></div>
                                  </div>
                                )}

                                {/* Hit sparkle overlay when thrusted */}
                                {playtestIsThrusting && (
                                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full border border-yellow-400 scale-125 animate-ping z-20" />
                                )}
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Pixelated ground segment tiles - made dynamically repeating the active tile grid if "tile" type! */}
                        <div className="h-7 w-full bg-[#1b1d30] border-t-2 border-emerald-500 flex items-center justify-around overflow-hidden shrink-0 relative">
                          {activeTile.type === "tile" ? (
                            <div className="absolute inset-0 flex select-none pointer-events-none">
                              {Array(8).fill(0).map((_, i) => (
                                <div 
                                  key={i} 
                                  className="w-[32px] h-full border-r border-[#ffffff04]"
                                  style={{ imageRendering: "pixelated" }}
                                >
                                  <div 
                                    className="grid w-full h-full"
                                    style={{
                                      gridTemplateColumns: `repeat(${activeTile.size}, minmax(0, 1fr))`,
                                    }}
                                  >
                                    {activeTile.grid.map((c, idx) => (
                                      <div 
                                        key={idx} 
                                        style={{ backgroundColor: c }}
                                        className="w-full h-full scale-[1.03]"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-around">
                              {Array(18).fill(0).map((_, i) => (
                                <div key={i} className="w-1 h-full bg-slate-800/45 transform skew-x-12" />
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Interactive Controls belt */}
                      <div className="grid grid-cols-3 gap-1.5 px-0.5">
                        <button
                          onClick={() => {
                            setPlaytestCharX(prev => Math.max(5, prev - 12));
                            playRetroSound("spark");
                          }}
                          className="py-2 bg-[#181a30] hover:bg-[#202342] border border-[#2c2f54] text-gray-300 rounded font-pixel text-[8px] cursor-pointer flex items-center justify-center gap-1 uppercase font-bold"
                        >
                          ◀ Walk Left
                        </button>

                        <button
                          onClick={() => {
                            if (playtestIsThrusting) return;
                            setPlaytestIsThrusting(true);
                            playRetroSound("strike");

                            // Calculate damage and score
                            const updatedHp = Math.max(0, playtestDummyHp - Math.floor(Math.random() * 15 + 15));
                            setPlaytestDummyHp(updatedHp);

                            const nextFloat = {
                              id: Date.now(),
                              text: `-${Math.floor(Math.random() * 15 + 15)} HP`,
                              x: Math.floor(Math.random() * 20 + 55),
                              y: Math.floor(Math.random() * 40 + 60)
                            };
                            setPlaytestDamageFloats(prev => [...prev, nextFloat]);
                            setTimeout(() => {
                              setPlaytestDamageFloats(prev => prev.filter(f => f.id !== nextFloat.id));
                            }, 1000);

                            if (updatedHp <= 0) {
                              // Explode and trigger reward/score
                              setTimeout(() => {
                                playRetroSound("level");
                                setPlaytestScore(prev => prev + 100);
                                const creatureTypes = ["Slime", "Goblin", "Dragon", "Training Dummy"];
                                const weights = [100, 150, 250, 80];
                                const randIdx = Math.floor(Math.random() * creatureTypes.length);
                                const targetName = creatureTypes[randIdx];
                                const maxHp = weights[randIdx];

                                setPlaytestDummyType(targetName);
                                setPlaytestDummyMaxHp(maxHp);
                                setPlaytestDummyHp(maxHp);

                                setGenerationLogs([`🎉 Slain ${targetName}! +100 Highscore points!`]);
                                setTimeout(() => setGenerationLogs([]), 2000);
                              }, 350);
                            }

                            setTimeout(() => {
                              setPlaytestIsThrusting(false);
                            }, 150);
                          }}
                          className="py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded font-pixel text-[8px] font-bold cursor-pointer uppercase shadow-[0_2px_8px_rgba(245,158,11,0.2)]"
                        >
                          ⚔️ Attack!
                        </button>

                        <button
                          onClick={() => {
                            setPlaytestCharX(prev => Math.min(50, prev + 12));
                            playRetroSound("spark");
                          }}
                          className="py-2 bg-[#181a30] hover:bg-[#202342] border border-[#2c2f54] text-gray-300 rounded font-pixel text-[8px] cursor-pointer flex items-center justify-center gap-1 uppercase font-bold"
                        >
                          Walk Right ▶
                        </button>
                      </div>

                      <div className="bg-[#121422] p-2 rounded border border-[#23263b] text-[8px] text-gray-400 text-center uppercase tracking-wide">
                        {activeTile.type === "tile" 
                          ? "Seamless Tiling Engine is mapping active layout onto the ground blocks!" 
                          : "Character is holding your custom drawn sprite asset as a physical weapon!"}
                      </div>
                    </div>
                  ) : (
                    <>
                      {activeTile.type === "sprite" ? (
                        <>
                          <h3 className="font-pixel text-[9px] text-rose-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Sprite Game Preview
                          </h3>
                          <p className="text-[10px] text-gray-400 mb-3.5 leading-relaxed">
                            Rendering your isolated sprite inside an active 8-bit game platformer layout mock scene in real-time.
                          </p>

                          <div className="bg-[#0b0c12] p-4 rounded-lg border border-[#25273e] relative overflow-hidden flex flex-col items-center gap-4">
                            {/* Immersive Platformer Mock Scene */}
                            <div className="w-full h-[180px] bg-gradient-to-b from-[#111322] to-[#080911] rounded border border-black relative overflow-hidden flex flex-col justify-between p-2">
                              {/* Floating retro clouds */}
                              <div className="absolute top-4 left-4 w-8 h-2 bg-gray-700/20 rounded-full blur-[1px]"></div>
                              <div className="absolute top-8 right-6 w-12 h-3 bg-gray-700/20 rounded-full blur-[1px]"></div>

                              {/* Sun/Moon */}
                              <div className="absolute top-3 right-4 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/5"></div>

                              {/* Standing Sprite */}
                              <div className="flex-grow flex items-end justify-center pb-2 z-10">
                                <div 
                                  className="w-[72px] h-[72px] select-none animate-bounce"
                                  style={{ 
                                    animationDuration: "2.5s",
                                    imageRendering: "pixelated"
                                  }}
                                >
                                  <div 
                                    className="w-full h-full grid select-none"
                                    style={{
                                      gridTemplateColumns: `repeat(${activeTile.size}, minmax(0, 1fr))`,
                                    }}
                                  >
                                    {activeTile.grid.map((color, idx) => (
                                      <div
                                        key={idx}
                                        style={{ backgroundColor: color === "#1a1c2c" ? "transparent" : color }}
                                        className="w-full h-full scale-[1.03]"
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Retro Ground Platform */}
                              <div className="h-6 w-full bg-[#1e293b] border-t-2 border-teal-500 flex items-center justify-around overflow-hidden shrink-0">
                                {Array(12).fill(0).map((_, i) => (
                                  <div key={i} className="w-1.5 h-full bg-[#0f172a] transform skew-x-12 opacity-50"></div>
                                ))}
                              </div>

                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 border border-rose-500/30 rounded text-[8px] text-rose-400 font-pixel tracking-tighter">
                                SCENE PREVIEW
                              </div>
                            </div>

                            {/* RPG Card Frame Preview */}
                            <div className="w-full flex items-center justify-between p-2 bg-[#1b1d30] border border-[#2d304f] rounded text-[10px] font-mono">
                              <span className="text-gray-400">Idle Simulation:</span>
                              <span className="text-emerald-400 font-bold uppercase animate-pulse">Running</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-pixel text-[9px] text-[#73eff7] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <Grid3X3 className="w-3.5 h-3.5 text-teal-400" /> 3x3 Seamless Tiling
                          </h3>
                          <p className="text-[10px] text-gray-400 mb-3.5 leading-relaxed">
                            This displays your tile repeated in a 3x3 grid. Watch how the bounds join together flawlessly in real-time as you draw!
                          </p>

                          <div className="bg-[#0b0c12] p-2.5 rounded-lg border border-[#25273e] relative overflow-hidden flex items-center justify-center">
                            {/* Construct 3x3 grid */}
                            <div className="grid grid-cols-3 grid-rows-3 w-[240px] h-[240px] select-none scale-[1.01]">
                              {Array(9)
                                .fill(0)
                                .map((_, gridIdx) => (
                                  <div
                                    key={gridIdx}
                                    className="w-full h-full border border-[rgba(255,255,255,0.02)] select-none overflow-hidden"
                                  >
                                    <div
                                      className="w-full h-full grid select-none"
                                      style={{
                                        gridTemplateColumns: `repeat(${activeTile.size}, minmax(0, 1fr))`,
                                        imageRendering: "pixelated"
                                      }}
                                    >
                                      {activeTile.grid.map((color, idx) => (
                                        <div
                                          key={idx}
                                          style={{ backgroundColor: color }}
                                          className="w-full h-full scale-[1.03]"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>

                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 border border-teal-500/30 rounded text-[8px] text-teal-400 font-pixel tracking-tighter">
                              LIVE PREVIEW
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Storage & Export actions */}
                <div className="bg-[#10121e] border border-[#202237] p-4 rounded-xl space-y-3.5">
                  <h3 className="font-pixel text-[9px] text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Save & Export
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={handleSaveWorkspace}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.15)]"
                    >
                      <Save className="w-4 h-4" /> Save to Catalog
                    </button>

                    <button
                      onClick={handleDownloadPNG}
                      className="w-full py-2 bg-[#1b1d30] hover:bg-[#242742] border border-[#303352] text-gray-200 text-xs font-mono rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" /> Export PNG File
                    </button>

                    <button
                      onClick={handleCopyCSSShadow}
                      className="w-full py-2 bg-[#1b1d30] hover:bg-[#242742] border border-[#303352] text-gray-200 text-xs font-mono rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Generates pure CSS box-shadow code"
                    >
                      <Code className="w-4 h-4 text-cyan-400" /> Copy CSS BoxShadow
                    </button>

                    <button
                      onClick={handleCopyJSONData}
                      className="w-full py-2 bg-[#1b1d30] hover:bg-[#242742] border border-[#303352] text-gray-200 text-xs font-mono rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-rose-400" /> Copy JSON Grid
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== VIEW 3: DEDICATED GALLERY VAULT & SAVE MANAGER ==================== */}
        {currentView === "gallery" && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Title / Intro Banner */}
            <div className="text-center">
              <span className="font-pixel text-[10px] tracking-widest text-[#ef7d57] bg-[#ef7d57]/10 px-3 py-1 rounded inline-block mb-3 border border-[#ef7d57]/30">
                DATABASE CONTROL & BACKUP PORT
              </span>
              <h2 className="text-3xl font-bold tracking-tight font-sans text-white flex items-center justify-center gap-2">
                <Database className="w-7 h-7 text-rose-500" />
                Pixel Gallery & Save Manager
              </h2>
              <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">
                Manage your physical pixel save files. Export absolute binary backups of your designs, drag and drop existing tiles files, or download discrete standalone items.
              </p>
            </div>

            {/* Split layout: Save File Zone vs Gallery Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Backup & Restore Tools (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Drag & Drop Save File Portal */}
                <div className="bg-[#10121e] border-2 border-[#202237] rounded-xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <h3 className="font-pixel text-[9px] text-[#73eff7] mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 shrink-0" />
                    Upload Save File
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 font-mono leading-relaxed">
                    Upload a single pixel tile file (.json) or a full gallery backup file to import designs directly.
                  </p>

                  {/* Drag drop slot wrapper conforming strictly to standard Drag Events and manual clicks */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("save-file-input")?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      isDragActive
                        ? "border-teal-400 bg-teal-500/10 scale-[1.02] shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                        : "border-[#2b2d45] bg-[#0b0c12]/55 hover:border-teal-500/50 hover:bg-[#0c0e18]"
                    }`}
                  >
                    <input
                      id="save-file-input"
                      type="file"
                      accept=".json,.pixellab"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload
                      className={`w-10 h-10 mb-3 transition-transform ${
                        isDragActive ? "text-teal-400 animate-bounce" : "text-gray-400"
                      }`}
                    />
                    <span className="font-pixel text-[9px] text-gray-300 font-bold mb-1.5 block">
                      DRAG & DROP SAVE FILE
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      or click to search system files
                    </span>
                  </div>

                  {/* Import Success / Fail Alerts */}
                  {importStatus && (
                    <div
                      className={`mt-4 p-3.5 rounded-lg border font-mono text-xs flex gap-3 ${
                        importStatus.isError
                          ? "bg-red-950/30 border-red-500/30 text-red-300"
                          : "bg-teal-950/30 border-teal-500/30 text-teal-300"
                      }`}
                    >
                      {importStatus.isError ? (
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold uppercase tracking-wide text-[10px] mb-0.5">
                          {importStatus.isError ? "Saves Compiler Error :" : "Saves Compiler OK :"}
                        </p>
                        <p className="leading-relaxed">{importStatus.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Gallery Actions (Export, Clear, Seed Demo) */}
                <div className="bg-[#10121e] border border-[#202237] rounded-xl p-5 space-y-4">
                  <h3 className="font-pixel text-[9px] text-[#ef7d57] uppercase tracking-wider flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5 text-[#ef7d57]" /> Save File Console
                  </h3>

                  <div className="space-y-3 font-mono text-xs">
                    <button
                      onClick={downloadFullBackup}
                      disabled={myTiles.length === 0}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-black font-pixel text-[9px] tracking-wider uppercase rounded font-bold transition flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(20,184,166,0.15)] cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-black" /> EXPORT FULL GALLERY SAVE
                    </button>

                    <div className="text-[10px] text-gray-500 leading-relaxed py-1 px-2 bg-[#0c0d15] rounded border border-[#202237]">
                      📁 Saves your custom catalog ({myTiles.length} designs) into a single transportable backup file readable by pixelLab.
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={handleLoadDemoGallery}
                        className="py-2.5 bg-[#1b1d30] border border-[#2d304f] hover:bg-[#232742] text-gray-300 rounded font-bold text-center text-[10px] cursor-pointer animate-pulse"
                      >
                        ⚡ SEED DEMO TILES
                      </button>
                      <button
                        onClick={() => {
                          if (myTiles.length === 0) return;
                          const confirmClear = confirm(
                            "CRITICAL ACTION: Are you sure you want to purge your entire custom gallery? This cannot be undone unless you have a backup save file!"
                          );
                          if (confirmClear) {
                            saveTilesToStorage([]);
                            setImportStatus({
                              message: "Success: Custom gallery database completely wiped.",
                              isError: false
                            });
                          }
                        }}
                        disabled={myTiles.length === 0}
                        className="py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 disabled:opacity-30 text-red-300 rounded font-bold text-center text-[10px] cursor-pointer"
                      >
                        PURGE VAULT
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Database Statistics Frame */}
                <div className="bg-[#10121e] border border-[#202237] rounded-xl p-4 font-mono text-xs space-y-3">
                  <div className="text-[10px] uppercase font-pixel tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-[#202237] pb-2">
                    <Info className="w-3.5 h-3.5 text-amber-500" /> Database Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-[#0b0c12] p-2.5 rounded border border-[#1b1d2e]">
                      <span className="text-[10px] text-gray-500 block mb-0.5 uppercase">Saved Artifacts</span>
                      <strong className="text-xl text-teal-400 font-pixel">{myTiles.length}</strong>
                    </div>
                    <div className="bg-[#0b0c12] p-2.5 rounded border border-[#1b1d2e]">
                      <span className="text-[10px] text-gray-500 block mb-0.5 uppercase">Estimated Size</span>
                      <strong className="text-sm font-bold text-amber-400 block mt-1.5">
                        {myTiles.length > 0 ? `${(JSON.stringify(myTiles).length / 1024).toFixed(2)} KB` : "0 KB"}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Side: Saved Items List (7 columns) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-[#10121e] border border-[#202237] rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#202237] pb-4 mb-4 gap-2">
                    <div>
                      <h3 className="font-pixel text-[10px] text-white uppercase tracking-wider">
                        My Saved Custom Inventory
                      </h3>
                      <p className="text-gray-500 text-[10px] font-mono mt-0.5">
                        Author workspace tiles saved locally in memory.
                      </p>
                    </div>

                    <div className="bg-[#0b0c12] border border-[#202237] rounded px-3 py-1 font-mono text-[10px] text-teal-400 shrink-0 w-fit">
                      {myTiles.filter(t => t.isFavorite).length} Favorites
                    </div>
                  </div>

                  {myTiles.length === 0 ? (
                    <div className="text-center py-16 bg-[#0b0c12]/30 border border-dashed border-[#202237] rounded-xl">
                      <Database className="w-8 h-8 text-gray-600 mx-auto mb-3 animate-bounce" />
                      <p className="text-gray-400 text-sm">Your custom gallery vault is empty.</p>
                      <p className="text-xs text-gray-600 mt-2 max-w-xs mx-auto font-mono">
                        Create designs in the **Editor Bench**, upload a **Save File** or click **Seed Demo Tiles** on the left to populate items!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                      {myTiles.map((tile) => (
                        <div
                          key={tile.id}
                          className="group relative bg-[#0b0c12] border border-[#202237] hover:border-teal-500/50 rounded-xl p-3 transition flex flex-col justify-between overflow-hidden"
                        >
                          {/* Pixel Grid Display inside safe canvas viewport */}
                          <div
                            onClick={() => handleEditTile(tile)}
                            className="aspect-square bg-[#0c0d16] rounded-lg overflow-hidden border border-[#222] relative mb-3 flex items-center justify-center p-1 cursor-pointer"
                          >
                            <div
                              className="w-full h-full grid select-none"
                              style={{
                                gridTemplateColumns: `repeat(${tile.size}, minmax(0, 1fr))`,
                                imageRendering: "pixelated"
                              }}
                            >
                              {tile.grid.map((color, idx) => (
                                <div
                                  key={idx}
                                  style={{ backgroundColor: color }}
                                  className="w-full h-full scale-[1.05]"
                                />
                              ))}
                            </div>

                            {/* Hover Overlay Button */}
                            <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition duration-150 flex flex-col gap-2 items-center justify-center p-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTile(tile);
                                }}
                                className="font-pixel text-[8px] tracking-wider bg-teal-500 text-black px-2 py-1.5 rounded font-bold uppercase w-full text-center hover:bg-teal-400 active:scale-95 transition"
                              >
                                Edit Bench
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadSingleTileSaveFile(tile);
                                }}
                                className="font-mono text-[9px] bg-[#1a1a2e] hover:bg-[#252542] border border-gray-700 hover:border-gray-500 text-gray-300 px-2 py-1.5 rounded w-full flex items-center justify-center gap-1.5 active:scale-95 transition"
                                title="Download Save File for this tile"
                              >
                                <Save className="w-3 h-3 text-amber-500" /> Save File (.json)
                              </button>
                            </div>
                          </div>

                          {/* Detail block */}
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h4 className="font-bold text-xs truncate max-w-[80%] text-white">
                                {tile.name}
                              </h4>
                              
                              <button
                                onClick={(e) => handleToggleFavorite(tile, e)}
                                className="text-gray-600 hover:text-rose-500 transition"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    tile.isFavorite
                                      ? "fill-rose-500 text-rose-500"
                                      : "text-gray-500"
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                              <span>{tile.size}x{tile.size} Grid</span>
                              <button
                                onClick={(e) => handleDeleteTile(tile.id, e)}
                                className="hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
                                title="Delete from gallery"
                              >
                                <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== VIEW 4: RETRO MARKET & BOUNTY PORTAL ==================== */}
        {currentView === "market" && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Title Banner */}
            <div className="text-center">
              <span className="font-pixel text-[10px] tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded inline-block mb-3 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)] select-none">
                GUILD MERCHANT CONTRACTS & REWARDS
              </span>
              <h2 className="text-3xl font-bold tracking-tight font-sans text-white flex items-center justify-center gap-2">
                <Coins className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                Pixel Bounty & Premium Shop
              </h2>
              <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">
                Submit custom tiles to fulfill contract commissions, run dynamic appraisal scans on your library assets to sell blueprints, and spend your earned Gold Coins to unlock retro palettes!
              </p>
            </div>

            {/* Split layout: Quests Left (7 Columns) vs Live Scanner & Shop Right (5 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Active Guild Bounties Contracts (7 columns) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-[#10121e] border border-[#202237] rounded-xl p-5 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between border-b border-[#2d2f4d] pb-4 mb-4">
                    <div>
                      <h3 className="font-pixel text-[10px] text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-500 animate-pulse" /> Active Quest Bounty Scroll
                      </h3>
                      <p className="text-gray-400 text-xs font-mono mt-1">
                        Select a pixel tile pattern from your inventory that meets the seeker requirements.
                      </p>
                    </div>
                    <div className="font-mono text-[10px] text-teal-400 bg-teal-950/20 px-2 py-1 rounded border border-teal-500/10 font-bold">
                      Infinite Contracts Active
                    </div>
                  </div>

                  <div className="space-y-4">
                    {bounties.map((bounty) => {
                      // Find suitable matches in user inventory
                      const suitableItems = [...myTiles, ...PRESET_TILES];
                      
                      return (
                        <div
                          key={bounty.id}
                          className="bg-[#0b0d16] border border-[#2c2d46] hover:border-amber-500/40 rounded-xl p-4 transition flex flex-col sm:flex-row justify-between gap-4"
                        >
                          {/* Details */}
                          <div className="space-y-2 flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{bounty.icon}</span>
                              <span className="font-bold text-xs uppercase font-pixel text-amber-300">
                                {bounty.title}
                              </span>
                              <span className="text-[10px] font-mono bg-blue-900/20 text-blue-300 border border-blue-500/20 px-1.5 rounded">
                                Req: {bounty.targetCategory}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 font-mono leading-relaxed max-w-md">
                              {bounty.description}
                            </p>

                            <div className="text-[10px] text-teal-400 font-mono italic">
                              Target tag matches: <span className="underline font-bold">"{bounty.targetKeyword}"</span>
                            </div>

                            <div className="flex gap-4 pt-1 font-mono text-xs">
                              <span className="font-bold text-amber-400 flex items-center gap-1 font-pixel text-[9px] leading-none">
                                🪙 Reward: {bounty.reward} Gold
                              </span>
                              <span className="text-teal-400 font-bold font-pixel text-[9px] leading-none">
                                ⭐ XP: +100
                              </span>
                            </div>
                          </div>

                          {/* Matching Submission Selector & Submit Trigger */}
                          <div className="flex flex-col justify-end gap-2.5 sm:w-56 shrink-0 bg-[#121422] p-3 rounded-lg border border-[#222540]">
                            <span className="font-pixel text-[8px] text-gray-400 uppercase tracking-wider block mb-1">
                              Submit Asset:
                            </span>
                            
                            <select
                              id={`bounty-select-${bounty.id}`}
                              className="w-full text-xs font-mono bg-[#0c0d16] border border-gray-700 hover:border-gray-500 rounded px-2 py-1.5 text-gray-300 focus:outline-none"
                            >
                              <option value="">-- Choose Tile --</option>
                              {suitableItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.size}x{item.size})
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                const sel = document.getElementById(`bounty-select-${bounty.id}`) as HTMLSelectElement | null;
                                if (!sel || !sel.value) {
                                  playRetroSound("fail");
                                  alert("Please select a tile design from your inventory slot first!");
                                  return;
                                }
                                handleSubmitBounty(bounty, sel.value);
                                sel.value = ""; // clear selection
                              }}
                              className="font-pixel text-[9px] w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold uppercase tracking-wider rounded transition shadow-[0_2px_8px_rgba(245,158,11,0.15)] cursor-pointer"
                            >
                              CLAIM REWARD 🪙
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Miner's Loot allowance & interactive Forge Work mini-game */}
                <div className="bg-[#10121e] border border-[#202237] rounded-xl p-5 shadow-[0_8px_16px_rgba(0,0,0,0.4)] space-y-4">
                  <h3 className="font-pixel text-[10px] text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-teal-400 animate-pulse" /> Miner's Forge Allowance
                  </h3>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    Short on gold to purchase premium palettes? Take a virtual shift at the pixel forge! Click below to mine for spare crystal shards and earn Gold Coins instantly.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0c14] p-3 rounded-lg border border-[#23243f]">
                    <div className="text-xs font-mono text-gray-400">
                      ⚒️ Daily Forge Miner Shift pay: <span className="text-amber-400 font-bold">+100 Gold Coins</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setGoldCoins(prev => prev + 100);
                        playRetroSound("coin");
                        setGenerationLogs(["Anvil struck! +100 Gold Coins extracted from retro mine!"]);
                        setTimeout(() => setGenerationLogs([]), 2000);
                      }}
                      className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-black rounded font-pixel text-[9px] uppercase tracking-wider font-bold transition shadow-lg cursor-pointer"
                    >
                      ⚒️ Strike Anvil (+100 Gold)
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Appraisal scanner & Merchant Swatch Palette Shop (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Appraisal Merchant Scanner Tool */}
                <div className="bg-[#10121e] border-2 border-[#2c2d46] rounded-xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <h3 className="font-pixel text-[10px] text-fuchsia-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    Loot Appraisal Scanner
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 font-mono leading-relaxed">
                    Set a design in the scanner bay. The system computes complexity multipliers (unique colors, coverage percentages, and symmetries) to buy blueprint shipments from you.
                  </p>

                  <div className="space-y-4 bg-[#0a0c14] p-3 rounded-xl border border-fuchsia-500/25">
                    {/* Select asset to appraise */}
                    <div className="font-mono text-xs">
                      <label className="text-gray-400 block mb-1.5">Load Scanner Target:</label>
                      <select
                        value={appraisalTileId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setAppraisalTileId(id);
                          if (!id) {
                            setAppraisalResult(null);
                            setAppraisalMessage("Welcome traveler! Put any of your custom designs in my Pixel Matrix Scanner, and I shall evaluate its physical structure and buy its blueprint for Gold Coins!");
                            return;
                          }
                          const tile = [...myTiles, ...PRESET_TILES].find(t => t.id === id);
                          if (tile) {
                            const res = calculateAppraisalValue(tile);
                            setAppraisalResult(res);
                            
                            let comment = `Silas says: "Ah! Excellent work on '${tile.name}'. `;
                            if (res.hSymmetric && res.vSymmetric) {
                              comment += `The symmetrical grid balance is flawless! Double bonus applied! `;
                            } else if (res.hSymmetric) {
                              comment += `The horizontal balance is highly satisfying! Bonus applied! `;
                            }
                            comment += `I can offer you 🪙 ${res.baseValue} Gold for a blueprint shipment."`;
                            setAppraisalMessage(comment);
                            playRetroSound("spark");
                          }
                        }}
                        className="w-full text-xs font-mono bg-[#141626] border border-gray-700 hover:border-gray-500 rounded px-2.5 py-2 text-gray-300 focus:outline-none"
                      >
                        <option value="">-- Choose Art Piece to Appraise --</option>
                        {[...myTiles, ...PRESET_TILES].map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.size}x{item.size})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dialog Box containing Silas' Appraisal advice */}
                    <div className="bg-[#121422] p-3 rounded-lg border border-[#2b2d4b] text-xs font-mono transition">
                      <div className="text-[10px] text-fuchsia-400 font-pixel uppercase tracking-wider mb-1 block select-none">
                        💼 Broker Silas:
                      </div>
                      <p className="text-gray-300 italic leading-relaxed text-[11px]">
                        "{appraisalMessage}"
                      </p>
                    </div>

                    {/* Visual specs results */}
                    {appraisalResult && (
                      <div className="bg-[#0b0d16] p-3 rounded border border-[#222] font-mono text-[10px] text-gray-400 space-y-1.5">
                        <div className="text-teal-400 uppercase font-pixel tracking-wider text-[8px] border-b border-[#222] pb-1.5 mb-1.5 text-center">
                          Appraisal Diagnostics Map:
                        </div>
                        <div className="flex justify-between">
                          <span>Unique Colors:</span>
                          <strong className="text-white">{appraisalResult.uniqueColorCount} shades</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Matrix Coverage:</span>
                          <strong className="text-white">{appraisalResult.fillingPercent}% bound</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Horizontal Symmetry:</span>
                          <strong className={appraisalResult.hSymmetric ? "text-emerald-400" : "text-gray-500"}>
                            {appraisalResult.hSymmetric ? "OK (+15% bonus)" : "No"}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Vertical Symmetry:</span>
                          <strong className={appraisalResult.vSymmetric ? "text-emerald-400" : "text-gray-500"}>
                            {appraisalResult.vSymmetric ? "OK (+15% bonus)" : "No"}
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-[#222] mt-1.5 font-pixel text-[9px] leading-tight">
                          <span className="font-bold text-amber-400">Total Valuation:</span>
                          <strong className="text-amber-400 font-bold">🪙 {appraisalResult.baseValue} Gold</strong>
                        </div>
                      </div>
                    )}

                    {/* Sell Button if result is parsed loaded */}
                    {appraisalResult && (
                      <button
                        onClick={() => {
                          const tile = [...myTiles, ...PRESET_TILES].find(t => t.id === appraisalTileId);
                          if (!tile) return;
                          
                          setGoldCoins(prev => prev + appraisalResult.baseValue);
                          setTotalEarned(prev => prev + appraisalResult.baseValue);
                          playRetroSound("coin");
                          
                          setImportStatus({
                            message: `Appraisal Deal Struck! Silas purchased a blueprint copy of "${tile.name}" and credited 🪙 ${appraisalResult.baseValue} Gold Coins to your digital wallet!`,
                            isError: false
                          });
                          
                          setGenerationLogs([`Sold copy for ${appraisalResult.baseValue} Gold Coins!`]);
                          setTimeout(() => setGenerationLogs([]), 2500);
                        }}
                        className="w-full py-2.5 bg-[#4f2479] hover:bg-[#68339b] text-white rounded font-pixel text-[9px] tracking-wider uppercase font-bold transition flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(110,4,120,0.15)] cursor-pointer"
                      >
                        ⚖️ SIGN CONTRACT & EXPORT SHIPMENT Blueprint
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Swatch Merchant Shop Cabinet (Spend Gold to unlock) */}
                <div className="bg-[#10121e] border border-[#202237] rounded-xl p-5 space-y-4 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                  <h3 className="font-pixel text-[10px] text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-400 animate-pulse" /> Premium Palettes Shop Cabinet
                  </h3>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    Spend your earned Gold Coins to purchase secret retro color spectrums. Once unlocked, they instantly become selectable in the Editor Bench!
                  </p>

                  <div className="space-y-3 font-mono">
                    {ALL_SHOP_PALETTES.map((p) => {
                      const isDefault = p.price === 0;
                      const isUnlocked = isDefault || unlockedPalettes.includes(p.name);
                      const isAffordable = goldCoins >= (p.price || 0);

                      return (
                        <div
                          key={p.name}
                          className={`bg-[#0b0c12] p-3 rounded-lg border flex items-center justify-between gap-3 ${
                            isUnlocked
                              ? "border-emerald-500/15 bg-emerald-950/2"
                              : "border-[#2c2d46]"
                          }`}
                        >
                          <div className="space-y-1.5 flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white uppercase font-bold">
                                {p.name}
                              </span>
                              {isDefault ? (
                                <span className="text-[8px] font-pixel bg-gray-800 text-gray-400 px-1 rounded">
                                  DEFAULT
                                </span>
                              ) : isUnlocked ? (
                                <span className="text-[8px] font-pixel bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-1 rounded">
                                  UNLOCKED
                                </span>
                              ) : (
                                <span className="text-[8px] font-pixel bg-[#3a1d1d] text-rose-300 border border-rose-500/20 px-1 rounded">
                                  LOCKED 🔒
                                </span>
                              )}
                            </div>

                            {/* Color swatches preview row */}
                            <div className="flex flex-wrap gap-1">
                              {p.colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="w-3.5 h-3.5 rounded-sm border border-black/30"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Purchase or select action button */}
                          <div className="shrink-0">
                            {isUnlocked ? (
                              <div className="text-[10px] text-gray-500 bg-[#111] px-2.5 py-1.5 rounded border border-[#222]">
                                AVAILABLE ✅
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!isAffordable) {
                                    playRetroSound("fail");
                                    return;
                                  }
                                  
                                  const price = p.price || 0;
                                  setGoldCoins(prev => prev - price);
                                  setUnlockedPalettes(prev => [...prev, p.name]);
                                  playRetroSound("level");

                                  setImportStatus({
                                    message: `Success! Unlocked premium palette "${p.name}". It is now loaded into your Editor Bench options drawer!`,
                                    isError: false
                                  });
                                }}
                                disabled={!isAffordable}
                                className={`px-3 py-1.5 rounded font-pixel text-[8px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                                  isAffordable
                                    ? "bg-amber-400 hover:bg-amber-300 text-black shadow-[0_2px_8px_rgba(245,158,11,0.2)]"
                                    : "bg-[#251919] text-rose-400 hover:bg-transparent border border-rose-500/20 opacity-70"
                                }`}
                              >
                                {isAffordable ? `UNLOCK [🪙 ${p.price}]` : `NEED 🪙 ${p.price}`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== VIEW 5: FLOW MUSIC PREMIUM STUDIO ==================== */}
        {currentView === "music" && (
          <div className="bg-[#0b0c13] border-2 border-[#1f2132] rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] animate-fade-in font-sans">
            
            {/* Top Workspace Header - Mimics Flow Music top state */}
            <div className="bg-[#0f111a] border-b border-[#1b1c28] px-6 py-3 flex items-center justify-between text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-emerald-400 font-pixel text-[9px] tracking-widest uppercase">PRODUCER CORE ONLINE</span>
              </div>
              <div className="bg-[#1b1e2c] border border-slate-700/30 px-3 py-1 rounded text-[10px] text-teal-300">
                ACTIVE CODES: <span className="text-white font-bold">{customTrackList.length} Tracks Loaded</span>
              </div>
            </div>

            {/* Main Outer Flow Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
              
              {/* === LEFT SIDEBAR: FLOW MUSIC DRAWER COLUMN (3 Columns) === */}
              <div className="lg:col-span-3 bg-[#0d0f17] border-r border-[#1a1c29] p-5 flex flex-col justify-between select-none">
                
                <div className="space-y-6">
                  {/* Flow Music Logo & Accessories Header */}
                  <div className="flex items-center justify-between border-b border-[#1b1d2c]/80 pb-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveMusicTab("turntable")}>
                      <div className="w-7 h-7 bg-gradient-to-tr from-teal-400 via-cyan-500 to-rose-400 rounded-lg flex items-center justify-center p-[2px] shadow-[0_0_12px_rgba(50,200,240,0.25)]">
                        <div className="w-full h-full bg-[#0d0f17] rounded-md flex items-center justify-center">
                          <Music className="w-3.5 h-3.5 text-teal-300" />
                        </div>
                      </div>
                      <span className="font-sans font-black text-sm tracking-tight text-white flex items-center gap-1">
                        Flow Music
                      </span>
                    </div>
                    {/* Search & drawer toggles */}
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <Search className="w-3.5 h-3.5 hover:text-white cursor-pointer transition" />
                      <Sliders className="w-3.5 h-3.5 hover:text-white cursor-pointer transition" />
                    </div>
                  </div>

                  {/* Sidebar Navigation Options List */}
                  <div className="space-y-1">
                    {[
                      { id: "login", label: "Login / Profile", icon: "👤", action: () => {
                        playRetroSound("coin");
                        alert(`Successfully logged in as: guest@pixellab.io\nLevel: ${Math.floor(totalEarned / 400) + 1}\nAccount status: Verified flow developer.`);
                      }},
                      { id: "songs", label: "Songs", icon: "🎶", badge: customTrackList.length },
                      { id: "playlists", label: "Playlists", icon: "📚", badge: "Live" },
                      { id: "spaces", label: "Spaces (Studio)", icon: "🌀" },
                      { id: "videos", label: "Music videos", icon: "📹", badge: "Wave" },
                      { id: "projects", label: "Projects", icon: "📁", badge: "Sync" },
                      { id: "turntable", label: "Turntable", icon: "💿", highlight: isPlayingSeq },
                    ].map((item) => {
                      const isActive = activeMusicTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.action) {
                              item.action();
                            } else {
                              setActiveMusicTab(item.id as any);
                              playRetroSound("spark");
                            }
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                            isActive
                              ? "bg-teal-500/15 text-teal-300 border border-teal-500/25 shadow-[0_0_10px_rgba(20,180,180,0.08)]"
                              : "text-gray-400 hover:text-white hover:bg-slate-800/20"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-sm select-none">{item.icon}</span>
                            <span>{item.label}</span>
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#1b1c28] border border-slate-700/30 text-teal-400">
                              {item.badge}
                            </span>
                          )}
                          {item.id === "turntable" && isPlayingSeq && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Bottom: Floating big vinyl platter status or controller */}
                <div className="bg-[#10121e] border border-[#1e202f] p-3.5 rounded-xl text-center relative mt-6 font-mono text-[10px]">
                  <div className="flex items-center justify-center mb-2.5">
                    <div className={`w-14 h-14 rounded-full bg-[#080911] border-2 border-slate-800 flex items-center justify-center relative shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${isPlayingSeq ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }}>
                      <div className="w-10 h-10 rounded-full border border-dashed border-teal-500/30 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-teal-400 border border-[#0d0f17]"></div>
                      </div>
                      {/* Stylized vinyl groove shine */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                  <span className="text-gray-400 block font-pixel text-[8px] tracking-wide uppercase truncate">
                    {isPlayingSeq ? "PLAYING LOOP" : "SYSTEM PAUSED"}
                  </span>
                  <span className="text-teal-400 block font-pixel text-[9px] font-bold mt-1 max-w-[150px] mx-auto truncate" title={activeTrackName}>
                    {activeTrackName}
                  </span>
                  
                  {/* Master Play Floating Trigger (Mockup bottom-left button overlay) */}
                  <button 
                    onClick={() => {
                      setIsPlayingSeq(!isPlayingSeq);
                      playRetroSound("coin");
                    }} 
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-400 text-black flex items-center justify-center hover:bg-teal-300 shadow-lg cursor-pointer transform hover:scale-105 transition"
                  >
                    {isPlayingSeq ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>

              </div>

              {/* === RIGHT SIDEBAR: WORKSPACE INTERACTIVE BOARD CONTAINER (9 Columns) === */}
              <div className="lg:col-span-9 bg-[#0b0c13] p-6 flex flex-col justify-between">
                
                {/* Upper section of content board */}
                <div className="space-y-8">
                  
                  {/* Central branding header & visual tag */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c1d2c] pb-5">
                    <div>
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] rounded-full mb-2 font-mono">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></span>
                        Welcome to Google Flow Music
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        Create the <span className="bg-gradient-to-r from-[#73eff7] to-[#ef7d57] bg-clip-text text-transparent">hook</span> you imagine.
                      </h2>
                    </div>
                    {/* Catalog bridge */}
                    <button
                      onClick={() => setCurrentView("home")}
                      className="px-3.5 py-2 rounded-xl bg-[#1b1c2a] border border-[#2b2d41] text-gray-300 hover:text-white font-mono text-xs flex items-center gap-2 transition"
                    >
                      <ArrowLeft className="w-4 h-4 text-rose-500" /> Back to PixelLab Editor
                    </button>
                  </div>

                  {/* === INPUT BOX ROW: 'ASK PRODUCER...' GENERATOR INPUT === */}
                  <div className="bg-[#11131f] border-2 border-[#1f2235] rounded-xl p-4.5 space-y-3.5 shadow-lg max-w-3xl mx-auto focus-within:border-teal-500/50 transition">
                    <textarea
                      value={musicPromptInput}
                      onChange={(e) => setMusicPromptInput(e.target.value)}
                      placeholder="Ask Producer... (e.g. 'moody lofi beat with a relaxing triangle wave' or 'an energetic high-bpm arcade synth pop loop')"
                      className="w-full bg-transparent border-none text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-0 text-sm font-medium leading-relaxed resize-none h-18"
                      disabled={isMusicGenerating}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerateMusic(musicPromptInput);
                        }
                      }}
                    />
                    
                    {/* Underlying details bar */}
                    <div className="flex items-center justify-between border-t border-[#1a1c29] pt-3.5">
                      <div className="flex items-center gap-2">
                        {/* Templates shortcut plus button */}
                        <button
                          onClick={() => {
                            const templates = [
                              "A relaxing lofi chillwave loop on soft triangle synthesizer notes.",
                              "Fast energetic arcade boss battle theme on buzzing sawtooth waveforms.",
                              "An epic cinematic synth melody representing magical fantasy level up.",
                              "Dark mysterious cyberpunk dungeon bassline with retro syncopation."
                            ];
                            const r = templates[Math.floor(Math.random() * templates.length)];
                            setMusicPromptInput(r);
                            playRetroSound("coin");
                          }}
                          className="w-7 h-7 bg-[#1c1d2d] hover:bg-[#25273d] text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition border border-[#25283e] cursor-pointer"
                          title="Generate Random Music Prompt Idea"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        {/* Audio wave parameters shortcuts */}
                        <div className="flex gap-1.5 font-mono text-[10px]">
                          <select
                            value={synthWave}
                            onChange={(e) => {
                              setSynthWave(e.target.value as any);
                              playRetroTone(440, e.target.value as any, 0.2);
                            }}
                            className="bg-[#1c1d2d] px-2.5 py-1 text-gray-300 rounded border border-[#25283e] focus:outline-none"
                          >
                            <option value="square">Wave: Square</option>
                            <option value="sawtooth">Wave: Sawtooth</option>
                            <option value="triangle">Wave: Triangle</option>
                            <option value="sine">Wave: Sine</option>
                          </select>

                          <div className="bg-[#1c1d2d] px-2.5 py-1 text-gray-300 rounded border border-[#25283e] flex items-center gap-1.5">
                            <span>BPM:</span>
                            <span className="text-teal-400 font-bold">{seqBpm}</span>
                          </div>
                        </div>
                      </div>

                      {/* Synthesis trigger button */}
                      <button
                        onClick={() => handleGenerateMusic(musicPromptInput)}
                        disabled={isMusicGenerating || !musicPromptInput.trim()}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
                          isMusicGenerating
                            ? "bg-amber-500 text-black animate-spin"
                            : musicPromptInput.trim()
                            ? "bg-teal-400 hover:bg-teal-300 text-black shadow-[0_0_12px_rgba(40,220,180,0.3)]"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                        title="Submit prompt to AI Producer"
                      >
                        {isMusicGenerating ? (
                          <RotateCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 fill-current animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PRODUCER FEEDBACK INTERACTIVE CHAT CARD */}
                  <div className="bg-[#10121e]/80 border border-[#202235] p-4 rounded-xl flex items-start gap-3.5 max-w-4xl mx-auto font-mono text-xs shadow-inner leading-relaxed">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#73eff7] to-[#ef7d57] p-[1.5px] shadow-[0_2px_8px_rgba(239,125,87,0.2)] shrink-0 flex items-center justify-center select-none font-bold text-center">
                      <div className="w-full h-full bg-[#0d0f17] rounded-lg text-teal-400 flex items-center justify-center">
                        🤖
                      </div>
                    </div>
                    <div className="space-y-1 bg-black/10 p-1 flex-grow">
                      <div className="flex items-center gap-1.5">
                        <span className="text-teal-400 font-bold select-none text-[10px]">AI CHIPTUNE PRODUCER:</span>
                        {isMusicGenerating && (
                          <span className="text-[10px] text-amber-400 animate-pulse">(Generating Loop Notes...)</span>
                        )}
                      </div>
                      <p className="text-slate-300 font-medium">
                        "{aiProducerMessage}"
                      </p>
                    </div>
                  </div>

                  {/* === TAB 1: DEFAULT MAIN DASHBOARD CARDS ("STARTERS") === */}
                  {activeMusicTab === "turntable" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-dashed border-[#202235] pb-2 max-w-4xl mx-auto">
                        <h3 className="font-sans font-extrabold text-sm text-white uppercase tracking-tight flex items-center gap-2">
                          🌱 Dynamic Starters
                        </h3>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">Click to load precomposed synth scales</span>
                      </div>

                      {/* STARTERS BENTO GRID (Perfect matchup to design reference) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                        
                        {/* 1. Build your space */}
                        <div
                          onClick={() => {
                            setMusicPromptInput("celestial space synth ambient loop");
                            setSynthWave("sine");
                            setSeqBpm(110);
                            loadPresetMelody("forest");
                            setActiveTrackName("Evolving Space Dust");
                            setAiProducerMessage("Loaded clean space wave preset. Sine synthesis filters activated for slow space wave arps!");
                            setActiveMusicTab("spaces");
                          }}
                          className="bg-gradient-to-br from-[#121c2c] to-[#0d1522] border border-[#23354e] hover:border-cyan-400 p-4 rounded-xl cursor-pointer transition transform hover:scale-[1.02] shadow-md flex flex-col justify-between h-[190px] group select-none"
                        >
                          <div className="w-8 h-8 rounded-lg bg-cyan-950/40 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition">
                            <Compass className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-pixel bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded leading-none block w-fit mb-1">NEW</span>
                            <h4 className="font-sans font-extrabold text-xs text-white leading-tight">Build your space</h4>
                            <p className="text-[10px] text-gray-400 leading-tight mt-1 text-slate-400">Assemble customized structural scales.</p>
                          </div>
                        </div>

                        {/* 2. Make a Playlist */}
                        <div
                          onClick={() => {
                            setMusicPromptInput("retro synth pop arcade jam");
                            setSynthWave("square");
                            setSeqBpm(140);
                            loadPresetMelody("retrowave");
                            setActiveTrackName("Pixel Arcade Playlist");
                            setAiProducerMessage("Generated cyberpunk playlist tracks. Fast BPM retro-pulse programmed into the chiptune grid!");
                            setActiveMusicTab("songs");
                          }}
                          className="bg-gradient-to-br from-[#241517] to-[#150d0e] border border-[#442629] hover:border-rose-400 p-4 rounded-xl cursor-pointer transition transform hover:scale-[1.02] shadow-md flex flex-col justify-between h-[190px] group select-none"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-950/40 flex items-center justify-center border border-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-black transition">
                            <Heart className="w-4 h-4 fill-rose-500/10" />
                          </div>
                          <div>
                            <h4 className="font-sans font-extrabold text-xs text-white leading-tight">Make a Playlist</h4>
                            <p className="text-[10px] text-gray-400 leading-tight mt-1 text-slate-400">Queue consecutive 8-bit chip melodies.</p>
                          </div>
                        </div>

                        {/* 3. Make a lofi track about me */}
                        <div
                          onClick={() => {
                            setMusicPromptInput("dusty relaxing lofi rain melody");
                            setSynthWave("triangle");
                            setSeqBpm(90);
                            // Custom lofi grid
                            const lofi = Array(8).fill(null).map(() => Array(16).fill(false));
                            lofi[7][0] = true; lofi[7][8] = true;
                            lofi[5][2] = true; lofi[5][10] = true;
                            lofi[3][4] = true; lofi[3][12] = true;
                            lofi[1][6] = true; lofi[0][14] = true;
                            setMusicGrid(lofi);
                            setActiveTrackName("Raindrop Meditation");
                            setAiProducerMessage("Synthesizing warm, nostalgic vibes mimicking woodsy cottage rainstorms in a cozy pixel room.");
                            setActiveMusicTab("spaces");
                          }}
                          className="bg-gradient-to-br from-[#122419] to-[#0c1811] border border-[#1f3d2a] hover:border-emerald-400 p-4 rounded-xl cursor-pointer transition transform hover:scale-[1.02] shadow-md flex flex-col justify-between h-[190px] group select-none"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-950/40 flex items-center justify-center border border-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black transition">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-sans font-extrabold text-xs text-white leading-tight font-sans">Make a lofi track</h4>
                            <p className="text-[10px] text-gray-400 leading-tight mt-1 text-slate-400">Relax with nostalgic woodsy frequencies.</p>
                          </div>
                        </div>

                        {/* 4. Create an instrument */}
                        <div
                          onClick={() => {
                            setMusicPromptInput("retro laser gun customized synthesizer sound effects");
                            setSynthWave("sawtooth");
                            setSeqBpm(160);
                            loadPresetMelody("fanfare");
                            setActiveTrackName("Arcade Super Synth");
                            setAiProducerMessage("Sawtooth pitch cascades initiated. Press any arcade pad below to hear customized synthesis sweeping!");
                            setActiveMusicTab("spaces");
                          }}
                          className="bg-gradient-to-br from-[#241e12] to-[#16120b] border border-[#443821] hover:border-amber-400 p-4 rounded-xl cursor-pointer transition transform hover:scale-[1.02] shadow-md flex flex-col justify-between h-[190px] group select-none"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-950/40 flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-sans font-extrabold text-xs text-white leading-tight">Create instrument</h4>
                            <p className="text-[10px] text-gray-400 leading-tight mt-1 text-slate-400">Design custom vintage wave shapes.</p>
                          </div>
                        </div>

                        {/* 5. Make my own audio player */}
                        <div
                          onClick={() => {
                            setMusicPromptInput("futuristic cyberspace player backing loops");
                            setSynthWave("square");
                            setSeqBpm(120);
                            loadPresetMelody("dungeon");
                            setActiveTrackName("Dungeon Depths Backing Loop");
                            setAiProducerMessage("Audio player configuration synchronized! Enjoy manual pitch modulators and track queue list controls.");
                            setActiveMusicTab("playlists");
                          }}
                          className="bg-gradient-to-br from-[#1b1224] to-[#110b18] border border-[#342145] hover:border-purple-400 p-4 rounded-xl cursor-pointer transition transform hover:scale-[1.02] shadow-md flex flex-col justify-between h-[190px] group select-none"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-950/40 flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition">
                            <Volume2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-sans font-extrabold text-xs text-white leading-tight">Own audio player</h4>
                            <p className="text-[10px] text-gray-400 leading-tight mt-1 text-slate-400">Customize envelope and audio drawer settings.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* === TAB 2: SONGS / CURATED PLAYLIST SELECTION === */}
                  {activeMusicTab === "songs" && (
                    <div className="max-w-4xl mx-auto space-y-4">
                      <div className="flex items-center justify-between border-b border-[#202235] pb-2">
                        <h3 className="font-sans font-bold text-sm text-teal-300 uppercase flex items-center gap-1.5">
                          🎶 Curated Retro Melodies catalog
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {customTrackList.map((track) => (
                          <div 
                            key={track.id}
                            className={`p-3 rounded-xl border transition flex items-center justify-between font-mono text-xs cursor-pointer ${
                              activeTrackName === track.name
                                ? "bg-teal-500/10 border-teal-500/40 text-teal-300 shadow-md"
                                : "bg-[#10121e] border-[#222438] text-gray-400 hover:border-gray-500 hover:text-white"
                            }`}
                            onClick={() => {
                              setActiveTrackName(track.name);
                              setSeqBpm(track.bpm);
                              setSynthWave(track.wave);
                              // Trigger a nice preset loader
                              const presetKey = track.id.includes("retrowave") ? "retrowave" :
                                                track.id.includes("fanfare") ? "fanfare" :
                                                track.id.includes("forest") ? "forest" :
                                                track.id.includes("dungeon") ? "dungeon" : null;
                              if (presetKey) {
                                loadPresetMelody(presetKey as any);
                              } else {
                                setMusicGrid(track.grid);
                                playRetroSound("level");
                              }
                              setAiProducerMessage(`Now playing customized sequence: ${track.name} on a ${track.wave} synthesizer loop at ${track.bpm} BPM!`);
                            }}
                          >
                            <div className="space-y-1">
                              <p className="text-white font-extrabold font-sans text-xs flex items-center gap-1.5">
                                <span className="text-teal-400">✦</span> {track.name}
                              </p>
                              <p className="text-[10px] text-gray-500">{track.desc}</p>
                              <div className="flex gap-2.5 text-[8px] uppercase tracking-wider text-teal-500/70">
                                <span>{track.bpm} BPM</span>
                                <span>{track.wave} Wave</span>
                              </div>
                            </div>
                            
                            <button className="p-2 rounded-lg bg-teal-500/10 hover:bg-teal-400 hover:text-black transition">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* === TAB 3: PLAYLIST ORGANIZER === */}
                  {activeMusicTab === "playlists" && (
                    <div className="max-w-4xl mx-auto space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-[#202235] pb-2">
                        <h3 className="font-sans font-bold text-sm text-[#73eff7] uppercase">
                          📂 Interactive Mixtape Groups
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { title: "8-Bit Nostalgia", tracks: "4 tracks", desc: "Pure NES/Gameboy synth chips", color: "from-cyan-900 to-indigo-950", preset: "retrowave" },
                          { title: "Cozy Lofi Glades", tracks: "3 tracks", desc: "Warm relaxing melodies with triangle filter", color: "from-emerald-950 to-teal-980", preset: "forest" },
                          { title: "Arcade Adventure Quest", tracks: "5 tracks", desc: "High-octane energetic boss battles", color: "from-rose-950 to-amber-970", preset: "fanfare" }
                        ].map((mixtape, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              loadPresetMelody(mixtape.preset as any);
                              playRetroSound("level");
                              setAiProducerMessage(`Loaded whole mixtape suite: "${mixtape.title}". Ready to play!`);
                              setActiveMusicTab("spaces");
                            }}
                            className={`rounded-xl overflow-hidden p-[1px] bg-gradient-to-tr ${mixtape.title.includes("Lofi") ? "from-emerald-500 to-cyan-500" : mixtape.title.includes("Arcade") ? "from-orange-500 to-rose-500" : "from-[#73eff7] to-indigo-500"} cursor-pointer hover:scale-[1.02] transition shadow-lg select-none`}
                          >
                            <div className="bg-[#0c0d16] p-4.5 rounded-xl h-full flex flex-col justify-between gap-5 text-gray-300">
                              <div className="space-y-1">
                                <span className="text-[8px] font-pixel bg-teal-500/10 text-teal-300 px-1.5 py-0.5 rounded font-bold">MIXTAPE</span>
                                <h4 className="text-white font-extrabold font-sans text-xs mt-1.5">{mixtape.title}</h4>
                                <p className="text-[10px] text-gray-500 leading-normal">{mixtape.desc}</p>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-[#73eff7]">
                                <span>{mixtape.tracks}</span>
                                <span className="font-pixel text-[8px] hover:underline">LOAD ➔</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* === TAB 4: SPACES (FULL MELODIC SEQUENCER BOARD) === */}
                  {activeMusicTab === "spaces" && (
                    <div className="bg-[#10121e] border-2 border-[#1f2134] rounded-xl p-5 md:p-6 space-y-5 shadow-xl max-w-4xl mx-auto">
                      
                      {/* Sequencer header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2134] pb-4">
                        <div className="space-y-0.5">
                          <h3 className="font-sans font-extrabold text-[#73eff7] text-sm uppercase tracking-tight flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-teal-400" /> Melody Matrix Composer
                          </h3>
                          <p className="text-[10px] text-gray-500 font-mono">
                            Columns = 1/16 Beat Steps | Rows = Pentatonic Pitches
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setIsPlayingSeq(!isPlayingSeq);
                              playRetroTone(400, "square", 0.08);
                            }}
                            className={`px-3.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                              isPlayingSeq
                                ? "bg-red-500 text-white shadow-lg animate-pulse"
                                : "bg-teal-400 hover:bg-teal-300 text-black shadow-md"
                            }`}
                          >
                            {isPlayingSeq ? (
                              <><Pause className="w-3 h-3 fill-current" /> STOP SEQ</>
                            ) : (
                              <><Play className="w-3 h-3 fill-current" /> RUN SEQ</>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setMusicGrid(Array(8).fill(null).map(() => Array(16).fill(false)));
                              setIsPlayingSeq(false);
                              playRetroSound("fail");
                            }}
                            className="px-2.5 py-1.5 bg-[#080911] hover:bg-slate-900 border border-red-500/35 text-rose-300 rounded-lg text-[9px] transition"
                          >
                            RESET
                          </button>
                        </div>
                      </div>

                      {/* Pitch labels and checkbox stepping trigger */}
                      <div className="space-y-1.5">
                        <div className="flex pl-[68px] pr-0.5 select-none text-[8px] font-mono text-gray-500">
                          {Array(16).fill(0).map((_, colIdx) => (
                            <div 
                              key={colIdx} 
                              className={`w-full text-center ${currentSeqStep === colIdx ? "text-teal-400 font-bold" : ""}`}
                            >
                              {currentSeqStep === colIdx ? "▼" : (colIdx + 1).toString().padStart(2, "0")}
                            </div>
                          ))}
                        </div>

                        {/* Sequencer Grid */}
                        <div className="space-y-1">
                          {SEQ_PITCHES.map((pitch, rowIdx) => (
                            <div key={rowIdx} className="flex items-center gap-2.5">
                              {/* Left Note Tag */}
                              <div className="w-[58px] shrink-0">
                                <span className="text-[9px] font-mono text-gray-400 bg-black/30 border border-slate-800/80 px-1.5 py-0.5 rounded block text-center truncate">
                                  {pitch.name}
                                </span>
                              </div>

                              {/* Checks row */}
                              <div className="grid gap-1 flex-grow" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
                                {Array(16).fill(0).map((_, colIdx) => {
                                  const isActive = musicGrid[rowIdx][colIdx];
                                  const isCurrent = currentSeqStep === colIdx;
                                  return (
                                    <button
                                      key={colIdx}
                                      onClick={() => {
                                        setMusicGrid(prev => {
                                          const copy = prev.map((r, rIdx) => {
                                            if (rIdx === rowIdx) {
                                              const newR = [...r];
                                              newR[colIdx] = !newR[colIdx];
                                              return newR;
                                            }
                                            return r;
                                          });
                                          return copy;
                                        });
                                        playRetroTone(pitch.hz, synthWave, 0.15);
                                      }}
                                      className={`aspect-square sm:aspect-video rounded transition-all cursor-pointer border ${
                                        isActive
                                          ? "bg-teal-400 border-teal-300 shadow-[0_0_8px_rgba(40,220,180,0.5)] scale-95"
                                          : isCurrent
                                          ? "bg-teal-500/10 border-teal-500/40"
                                          : "bg-[#0b0c13] hover:bg-slate-900 border-slate-800"
                                      }`}
                                      title={`Notes row ${rowIdx + 1}, column ${colIdx + 1}`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* === TAB 5: MUSIC VIDEOS VISUALIZER SPECTRA === */}
                  {activeMusicTab === "videos" && (
                    <div className="bg-[#11131f] border border-[#1e2031] rounded-xl p-5 max-w-2xl mx-auto space-y-4 text-center font-mono">
                      <h3 className="font-sans font-bold text-sm text-rose-400 uppercase">
                        🌌 Generative Music spectra
                      </h3>
                      <p className="text-xs text-gray-400">
                        Synthesized geometric math spectrum reacting in solid frequencies to active sequencer steps!
                      </p>
                      
                      <div className="w-full h-48 bg-[#07080f] rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
                        {/* Dynamic spectrum rendering utilizing CSS grids reacting to current step */}
                        <div className="flex items-end gap-1.5 h-36 w-4/5 select-none">
                          {Array(16).fill(0).map((_, i) => {
                            const isCurrent = currentSeqStep === i;
                            const activeNotesCount = musicGrid.filter(row => row[i]).length;
                            const heightPercentage = activeNotesCount > 0 ? (activeNotesCount / 8) * 100 : isCurrent ? 30 : 5;
                            return (
                              <div
                                key={i}
                                className={`w-full rounded-sm transition-all duration-100 ${
                                  isCurrent
                                    ? "bg-gradient-to-t from-teal-500 via-cyan-400 to-white shadow-[0_0_12px_rgba(50,220,180,0.4)]"
                                    : "bg-gradient-to-t from-indigo-900 via-rose-500 to-amber-400"
                                }`}
                                style={{ height: `${heightPercentage}%` }}
                              />
                            );
                          })}
                        </div>
                        
                        <div className="absolute inset-0 flex flex-col justify-between p-3 text-[9px] text-[#73eff7]/40 pointer-events-none uppercase">
                          <div className="flex justify-between">
                            <span>Channel: L+R Stereo</span>
                            <span>Scale: Pentatonic C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>FPS: 60 lock</span>
                            <span>Status: {isPlayingSeq ? "Active stream" : "Muted"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === TAB 6: PROJECTS PANEL INTEGRATOR === */}
                  {activeMusicTab === "projects" && (
                    <div className="max-w-2xl mx-auto bg-[#10121e] border border-[#212338] p-5 rounded-xl space-y-4 text-xs font-mono">
                      <h3 className="font-sans font-extrabold text-white text-sm uppercase">
                        📁 PixelLab Project Assets Synced
                      </h3>
                      <p className="text-gray-400">
                        Bind your custom-themed chiptune backing structures directly to pixel design tiles. High fidelity integration syncs:
                      </p>
                      
                      <div className="space-y-3">
                        <div className="bg-[#090a10] p-4.5 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-teal-400 font-bold uppercase text-[10px]">ACTIVE WORKBENCH ATOM</p>
                            <p className="text-white font-extrabold text-sm font-sans mt-0.5">{activeTile.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1">Grid size: {activeTile.size}x{activeTile.size} ({activeTile.category})</p>
                          </div>
                          
                          <div className="w-12 h-12 bg-slate-900 border border-slate-700/50 p-1 rounded relative overflow-hidden" style={{ imageRendering: "pixelated" }}>
                            <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${activeTile.size}, minmax(0, 1fr))` }}>
                              {activeTile.grid.map((c, idx) => (
                                <div key={idx} style={{ backgroundColor: c }} className="w-full h-full" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#090a10] p-4.5 rounded-lg border border-slate-800 space-y-2">
                          <p className="text-rose-400 font-bold uppercase text-[10px]">INTEGRATION ACTION</p>
                          <p className="text-gray-400 leading-normal">
                            Bind current MIDI sequencer melody to this pixel design. Whenever anyone opens your custom texture in the editor, your crafted song loop will play in the background automatically!
                          </p>
                          <button
                            onClick={() => {
                              playRetroSound("level");
                              alert(`Asset linked!\n"${activeTrackName}" is now successfully bound to pixel texture "${activeTile.name}".`);
                            }}
                            className="bg-teal-500 font-pixel text-black font-extrabold px-3 py-1.5 rounded uppercase hover:bg-teal-400 transition inline-block text-[9px] cursor-pointer"
                          >
                            🔗 Link track to tile
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* === LOWER PANEL: STATIC MUSIC CONTROLS (PLAYER TRAY DRAWER) === */}
                <div className="bg-[#0d0f17] border border-[#1e202f] rounded-xl p-4.5 mt-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                  
                  {/* Left segment - active title & synth type */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-0.5 truncate max-w-[190px]">
                      <span className="text-white text-xs font-bold leading-none block truncate">{activeTrackName}</span>
                      <span className="text-[10px] text-gray-500 block font-mono truncate uppercase">{synthWave} wave synthesis</span>
                    </div>
                  </div>

                  {/* Mid Segment - controls */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        // Previous preset loop
                        playRetroSound("coin");
                        loadPresetMelody("dungeon");
                        setActiveTrackName("Spooky Dungeon Walk");
                      }}
                      className="text-gray-500 hover:text-white transition"
                    >
                      ⏮
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsPlayingSeq(!isPlayingSeq);
                        playRetroSound("coin");
                      }}
                      className="w-10 h-10 rounded-full bg-teal-400 text-black flex items-center justify-center hover:bg-teal-300 transition shadow-[0_3px_10px_rgba(50,220,180,0.3)] cursor-pointer"
                    >
                      {isPlayingSeq ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <button 
                      onClick={() => {
                        // Next preset loop
                        playRetroSound("coin");
                        loadPresetMelody("retrowave");
                        setActiveTrackName("Cyberpunk Retrowave");
                      }}
                      className="text-gray-500 hover:text-white transition"
                    >
                      ⏭
                    </button>
                  </div>

                  {/* Right Segment - BPM and quick volume on/off */}
                  <div className="flex items-center gap-4 w-full md:w-auto font-mono text-xs text-gray-400 justify-end">
                    <span className="text-[10px] uppercase shrink-0">Speed scale:</span>
                    <input
                      type="range"
                      min="60"
                      max="240"
                      value={seqBpm}
                      onChange={(e) => setSeqBpm(parseInt(e.target.value, 10))}
                      className="w-24 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                    <span className="text-teal-400 font-bold shrink-0">{seqBpm} BPM</span>
                    
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1 text-gray-500 hover:text-white ml-2 transition"
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-teal-400 animate-pulse" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}


      </main>

      {/* Decorative footer elements */}
      <footer className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-[#1b1d2e] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
        <div>
          <span>Designed with pixel precision on the AI Studio platform.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> UTC Runtime Server Live</span>
          <span>&copy; 2026 pixelLab</span>
        </div>
      </footer>
    </div>
  );
}
