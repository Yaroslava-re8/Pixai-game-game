import { PixelTile, PresetPalette } from "./types";

export const PRESET_PALETTES: PresetPalette[] = [
  {
    name: "Classic PICO-8",
    colors: [
      "#000000", "#1D2B53", "#7E2553", "#008751",
      "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8",
      "#FF004D", "#FFA300", "#FFEC27", "#00E436",
      "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"
    ]
  },
  {
    name: "Sweetie 16",
    colors: [
      "#1a1c2c", "#5d275d", "#b13e53", "#ef7d57",
      "#ffcd75", "#a7f070", "#38b764", "#257179",
      "#29366f", "#3b5dc9", "#41a6f6", "#73eff7",
      "#f4f4f4", "#94b0c2", "#566c86", "#333c57"
    ]
  },
  {
    name: "Original GameBoy",
    colors: [
      "#0f380f", "#306230", "#8bac0f", "#9bbc0f",
      "#ffffff", "#888888", "#2c2c2c", "#121212"
    ]
  },
  {
    name: "Vaporwave Sunset",
    colors: [
      "#140635", "#3f1c4a", "#672051", "#b02a64",
      "#e53f71", "#f97782", "#feaf8d", "#ffe3b3",
      "#3cf2fc", "#2a9efb", "#2241f7", "#1d0e8a"
    ]
  },
  {
    name: "Cyberpunk Tech",
    colors: [
      "#000000", "#09131d", "#00fdff", "#008f91",
      "#ff0055", "#9d0033", "#ffff00", "#a5a500",
      "#ffffff", "#4b4b4b"
    ]
  }
];

// Helper to create simple tile structures with repeat patterns
const generateGrassGrid = (): string[] => {
  const g1 = "#38b764"; // mid green
  const g2 = "#a7f070"; // light highlight
  const g3 = "#257179"; // dark shadow
  const g4 = "#ffcd75"; // flower yellow
  
  // 16x16 hand-drawn repeating grass tile
  return [
    g1, g1, g1, g1, g3, g1, g1, g1, g1, g1, g1, g1, g1, g1, g3, g1,
    g1, g2, g1, g1, g1, g1, g1, g1, g2, g1, g1, g1, g1, g1, g1, g1,
    g1, g1, g1, g1, g1, g1, g3, g1, g1, g1, g1, g3, g1, g1, g1, g1,
    g1, g1, g1, g2, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g2,
    g3, g1, g1, g1, g1, g1, g1, g3, g1, g1, g4, g1, g1, g3, g1, g1,
    g1, g1, g1, g1, g1, g1, g1, g1, g1, g4, g4, g4, g1, g1, g1, g1,
    g1, g3, g1, g1, g1, g1, g1, g1, g1, g1, g4, g1, g1, g1, g1, g1,
    g1, g1, g1, g1, g2, g1, g1, g1, g1, g1, g1, g1, g1, g2, g1, g1,
    g1, g1, g1, g1, g1, g1, g1, g3, g1, g1, g1, g1, g1, g1, g1, g1,
    g1, g1, g2, g1, g1, g1, g1, g1, g1, g1, g1, g1, g3, g1, g1, g1,
    g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g2, g1, g1, g1, g1, g1,
    g3, g1, g1, g1, g1, g4, g1, g1, g1, g1, g1, g1, g1, g1, g1, g3,
    g1, g1, g1, g1, g4, g4, g4, g1, g1, g1, g1, g1, g1, g1, g1, g1,
    g1, g1, g1, g1, g1, g4, g1, g1, g1, g3, g1, g1, g1, g2, g1, g1,
    g1, g2, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1,
    g1, g1, g1, g1, g1, g1, g1, g1, g3, g1, g1, g1, g1, g1, g1, g1
  ];
};

const generateBrickGrid = (): string[] => {
  const b1 = "#b13e53"; // brick red
  const b2 = "#ef7d57"; // brick highlight
  const b3 = "#29366f"; // dark mortar
  const b4 = "#566c86"; // light mortar/weathering
  return [
    b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3,
    b2, b2, b2, b2, b2, b2, b2, b3, b2, b2, b2, b2, b2, b2, b2, b3,
    b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3,
    b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3,
    b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3,
    b2, b2, b2, b3, b2, b2, b2, b2, b2, b2, b2, b3, b2, b2, b2, b2,
    b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1,
    b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1,
    b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3,
    b2, b2, b2, b2, b2, b2, b2, b3, b2, b2, b2, b2, b2, b2, b2, b3,
    b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3,
    b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3,
    b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3, b3,
    b2, b2, b2, b3, b2, b2, b2, b2, b2, b2, b2, b3, b2, b2, b2, b2,
    b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1,
    b1, b1, b1, b3, b1, b1, b1, b1, b1, b1, b1, b3, b1, b1, b1, b1
  ];
};

const generateStoneGrid = (): string[] => {
  const s1 = "#94b0c2"; // stone mid
  const s2 = "#f4f4f4"; // stone light
  const s3 = "#566c86"; // stone shadow
  const s4 = "#333c57"; // deep crack
  return [
    s4, s4, s4, s4, s4, s4, s4, s4, s4, s4, s4, s4, s4, s4, s4, s4,
    s4, s2, s2, s2, s1, s1, s3, s4, s2, s2, s2, s2, s2, s1, s3, s4,
    s4, s2, s1, s1, s1, s3, s3, s4, s2, s1, s1, s1, s1, s3, s3, s4,
    s4, s1, s1, s1, s3, s3, s4, s4, s1, s1, s1, s3, s3, s3, s4, s4,
    s4, s3, s3, s3, s3, s4, s4, s4, s3, s3, s3, s3, s3, s4, s4, s4,
    s4, s4, s4, s4, s4, s4, s2, s2, s4, s4, s4, s4, s4, s4, s4, s4,
    s2, s2, s2, s1, s3, s4, s2, s1, s1, s1, s3, s4, s2, s2, s2, s1,
    s2, s1, s1, s3, s3, s4, s1, s1, s3, s3, s3, s4, s2, s1, s1, s1,
    s1, s3, s3, s3, s4, s4, s3, s3, s3, s3, s4, s4, s1, s3, s3, s3,
    s4, s4, s4, s4, s4, s2, s2, s2, s2, s1, s3, s4, s4, s4, s4, s4,
    s4, s2, s2, s2, s2, s2, s1, s1, s3, s3, s4, s4, s2, s2, s2, s2,
    s4, s2, s1, s1, s1, s1, s3, s3, s3, s4, s4, s4, s2, s1, s1, s1,
    s4, s1, s1, s3, s3, s3, s3, s3, s4, s4, s2, s2, s1, s1, s3, s3,
    s4, s3, s3, s3, s4, s4, s4, s4, s4, s4, s2, s1, s3, s3, s3, s4,
    s4, s4, s4, s4, s2, s2, s1, s1, s3, s4, s1, s3, s3, s4, s4, s4,
    s4, s4, s4, s4, s2, s1, s3, s3, s3, s4, s4, s4, s4, s4, s4, s4
  ];
};

const generateLavaGrid = (): string[] => {
  const l1 = "#1a1c2c"; // cool basalt
  const l2 = "#b13e53"; // dark red crust
  const l3 = "#ef7d57"; // active orange
  const l4 = "#ffcd75"; // yellow core
  return [
    l1, l1, l1, l1, l2, l3, l2, l1, l1, l1, l1, l1, l1, l1, l1, l1,
    l1, l1, l2, l3, l4, l4, l3, l2, l1, l1, l1, l2, l2, l1, l1, l1,
    l1, l2, l3, l4, l4, l4, l3, l2, l2, l1, l2, l3, l3, l2, l1, l1,
    l2, l3, l4, l4, l3, l3, l2, l2, l3, l2, l3, l4, l4, l3, l2, l1,
    l2, l3, l3, l2, l2, l1, l1, l2, l3, l4, l4, l4, l4, l3, l2, l2,
    l1, l2, l1, l1, l1, l1, l1, l2, l3, l4, l3, l3, l2, l2, l1, l2,
    l1, l1, l1, l1, l1, l1, l1, l1, l2, l3, l2, l1, l1, l1, l1, l1,
    l1, l1, l1, l2, l2, l1, l1, l1, l1, l1, l1, l1, l1, l1, l1, l1,
    l2, l2, l2, l3, l3, l2, l1, l1, l1, l1, l1, l1, l2, l2, l1, l1,
    l3, l4, l4, l4, l4, l3, l2, l1, l1, l1, l1, l2, l3, l3, l2, l1,
    l4, l4, l3, l3, l3, l4, l3, l2, l1, l1, l2, l3, l4, l4, l3, l2,
    l3, l3, l2, l1, l2, l3, l4, l3, l2, l1, l2, l3, l4, l4, l3, l2,
    l2, l1, l1, l1, l1, l2, l3, l4, l3, l2, l2, l2, l3, l3, l2, l1,
    l1, l1, l1, l1, l1, l1, l2, l3, l4, l4, l3, l2, l1, l2, l1, l1,
    l1, l1, l1, l1, l1, l1, l1, l2, l3, l4, l3, l2, l1, l1, l1, l1,
    l1, l1, l1, l1, l1, l1, l1, l1, l2, l3, l2, l1, l1, l1, l1, l1
  ];
};

const generateSciFiGrid = (): string[] => {
  const c1 = "#1a1c2c"; // dark structural steel
  const c2 = "#333c57"; // deep steel
  const c3 = "#73eff7"; // neon teal tracer
  const c4 = "#ef7d57"; // copper node
  return [
    c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1,
    c1, c2, c2, c2, c2, c2, c2, c1, c2, c2, c2, c2, c2, c2, c2, c1,
    c1, c2, c1, c1, c1, c1, c2, c1, c2, c1, c1, c1, c1, c1, c2, c1,
    c1, c2, c1, c4, c4, c1, c2, c1, c2, c1, c3, c3, c3, c1, c2, c1,
    c1, c2, c1, c4, c4, c1, c2, c1, c2, c1, c1, c3, c1, c1, c2, c1,
    c1, c2, c1, c1, c1, c1, c2, c1, c2, c1, c1, c3, c1, c1, c2, c1,
    c1, c2, c2, c2, c2, c2, c2, c1, c2, c2, c2, c2, c2, c2, c2, c1,
    c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1,
    c1, c2, c2, c2, c2, c2, c2, c1, c2, c2, c2, c2, c2, c2, c2, c1,
    c1, c2, c1, c1, c1, c1, c2, c1, c2, c1, c1, c1, c1, c1, c2, c1,
    c1, c2, c1, c3, c1, c1, c2, c1, c2, c1, c4, c4, c4, c1, c2, c1,
    c1, c2, c1, c3, c3, c1, c2, c1, c2, c1, c4, c4, c4, c1, c2, c1,
    c1, c2, c1, c1, c3, c1, c2, c1, c2, c1, c4, c4, c4, c1, c2, c1,
    c1, c2, c1, c1, c1, c1, c2, c1, c1, c1, c1, c1, c1, c1, c2, c1,
    c1, c2, c2, c2, c2, c2, c2, c1, c2, c2, c2, c2, c2, c2, c2, c1,
    c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1, c1
  ];
};

const generateWaterGrid = (): string[] => {
  const w1 = "#29366f"; // abyss blue
  const w2 = "#3b5dc9"; // deep ocean text
  const w3 = "#41a6f6"; // tropical crystal
  const w4 = "#73eff7"; // dynamic spray cyan
  return [
    w2, w2, w2, w3, w3, w2, w2, w2, w2, w2, w2, w3, w3, w2, w2, w2,
    w3, w4, w3, w2, w2, w2, w3, w3, w3, w4, w3, w2, w2, w2, w3, w3,
    w2, w3, w2, w1, w1, w2, w3, w4, w2, w3, w2, w1, w1, w2, w3, w4,
    w1, w1, w1, w1, w1, w2, w3, w2, w1, w1, w1, w1, w1, w2, w3, w2,
    w2, w2, w2, w3, w3, w2, w2, w2, w2, w2, w2, w3, w3, w2, w2, w2,
    w3, w4, w3, w2, w2, w2, w3, w3, w3, w4, w3, w2, w2, w2, w3, w3,
    w2, w3, w2, w1, w1, w2, w3, w4, w2, w3, w2, w1, w1, w2, w3, w4,
    w1, w1, w1, w1, w1, w2, w3, w2, w1, w1, w1, w1, w1, w2, w3, w2,
    w2, w2, w2, w3, w3, w2, w2, w2, w2, w2, w2, w3, w3, w2, w2, w2,
    w3, w4, w3, w2, w2, w2, w3, w3, w3, w4, w3, w2, w2, w2, w3, w3,
    w2, w3, w2, w1, w1, w2, w3, w4, w2, w3, w2, w1, w1, w2, w3, w4,
    w1, w1, w1, w1, w1, w2, w3, w2, w1, w1, w1, w1, w1, w2, w3, w2,
    w2, w2, w2, w3, w3, w2, w2, w2, w2, w2, w2, w3, w3, w2, w2, w2,
    w3, w4, w3, w2, w2, w2, w3, w3, w3, w4, w3, w2, w2, w2, w3, w3,
    w2, w3, w2, w1, w1, w2, w3, w4, w2, w3, w2, w1, w1, w2, w3, w4,
    w1, w1, w1, w1, w1, w2, w3, w2, w1, w1, w1, w1, w1, w2, w3, w2
  ];
};

const generateKnightGrid = (): string[] => {
  const bg = "#1a1c2c";
  const sk = "#ffe3b3";
  const sh = "#333c57";
  const ar = "#94b0c2";
  const plume = "#b13e53";
  const wh = "#f4f4f4";
  return [
    bg, bg, bg, bg, plume, plume, plume, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, plume, plume, plume, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, sh, sh, sh, sh, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, sh, ar, ar, ar, ar, sh, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, sh, ar, wh, sh, ar, sh, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, sh, ar, ar, ar, ar, sh, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, sh, sk, sk, sh, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, sh, sh, sh, sh, sh, sh, sh, sh, bg, bg, bg, bg, bg, bg,
    bg, sh, ar, ar, sh, ar, ar, ar, sh, ar, sh, bg, bg, bg, bg, bg,
    bg, sh, ar, ar, sh, ar, ar, ar, sh, ar, sh, bg, bg, bg, bg, bg,
    bg, sh, sh, sh, sh, ar, ar, ar, sh, sh, sh, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, sh, ar, ar, ar, sh, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, sh, ar, bg, ar, sh, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, sh, sh, bg, bg, bg, sh, sh, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg
  ];
};

const generateSlimeGrid = (): string[] => {
  const bg = "#1a1c2c";
  const g1 = "#38b764"; // dark green
  const g2 = "#a7f070"; // slime green
  const g3 = "#ffcd75"; // slime eye reflection
  const wh = "#f4f4f4"; // eyes highlight
  const bl = "#1a1c2c";
  return [
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, g2, g2, g2, g2, g2, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, g2, g2, g2, g2, g2, g2, g2, bg, bg, bg, bg, bg,
    bg, bg, bg, g2, g2, g2, g2, g2, g2, g2, g2, g2, bg, bg, bg, bg,
    bg, bg, g2, g2, g1, g1, g2, g2, g1, g1, g2, g2, g2, bg, bg, bg,
    bg, bg, g2, g2, wh, bl, g2, g2, wh, bl, g2, g2, g2, bg, bg, bg,
    bg, g2, g2, g2, bl, bl, g2, g2, bl, bl, g2, g2, g2, g2, bg, bg,
    bg, g2, g2, g2, g2, g2, g2, g2, g2, g2, g2, g2, g2, g2, bg, bg,
    bg, g1, g2, g2, g2, g2, g2, g2, g2, g2, g2, g2, g2, g1, bg, bg,
    bg, g1, g1, g2, g2, g2, g2, g2, g2, g2, g2, g2, g1, g1, bg, bg,
    bg, bg, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, g1, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg
  ];
};

const generateHeartGrid = (): string[] => {
  const bg = "#1a1c2c";
  const r1 = "#b13e53"; // dark blood red outline
  const r2 = "#ef7d57"; // bright vibrant red
  const wh = "#f4f4f4"; // shine white
  return [
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, r1, r1, r1, bg, bg, bg, bg, bg, r1, r1, r1, bg, bg, bg,
    bg, r1, r2, r2, r2, r1, bg, bg, bg, r1, r2, r2, r2, r1, bg, bg,
    bg, r1, wh, r2, r2, r2, r1, bg, r1, r2, r2, r2, r2, r1, bg, bg,
    bg, r1, wh, wh, r2, r2, r2, r1, r2, r2, r2, r2, r2, r1, bg, bg,
    bg, bg, r1, r2, r2, r2, r2, r2, r2, r2, r2, r2, r1, bg, bg, bg,
    bg, bg, bg, r1, r2, r2, r2, r2, r2, r2, r2, r1, bg, bg, bg, bg,
    bg, bg, bg, bg, r1, r2, r2, r2, r2, r2, r1, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, r1, r2, r2, r2, r1, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, r1, r2, r1, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, r1, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg,
    bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg, bg
  ];
};

export const PRESET_TILES: PixelTile[] = [
  {
    id: "grass",
    name: "Lush Forest Grass",
    size: 16,
    grid: generateGrassGrid(),
    palette: ["#38b764", "#a7f070", "#257179", "#ffcd75"],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Ground",
    type: "tile"
  },
  {
    id: "brick",
    name: "Classic Red Bricks",
    size: 16,
    grid: generateBrickGrid(),
    palette: ["#b13e53", "#ef7d57", "#29366f", "#566c86"],
    createdAt: new Date().toISOString(),
    isFavorite: true,
    category: "Walls",
    type: "tile"
  },
  {
    id: "stone",
    name: "Dungeon Stone Wall",
    size: 16,
    grid: generateStoneGrid(),
    palette: ["#1a1c2c", "#94b0c2", "#f4f4f4", "#566c86", "#333c57"],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Walls",
    type: "tile"
  },
  {
    id: "lava",
    name: "Active Magma Crust",
    size: 16,
    grid: generateLavaGrid(),
    palette: ["#1a1c2c", "#b13e53", "#ef7d57", "#ffcd75"],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Lava",
    type: "tile"
  },
  {
    id: "scifi",
    name: "Sci-Fi Relay Panel",
    size: 16,
    grid: generateSciFiGrid(),
    palette: ["#1a1c2c", "#333c57", "#73eff7", "#ef7d57"],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Sci-Fi",
    type: "tile"
  },
  {
    id: "water",
    name: "Crystalline Ocean Waves",
    size: 16,
    grid: generateWaterGrid(),
    palette: ["#29366f", "#3b5dc9", "#41a6f6", "#73eff7"],
    createdAt: new Date().toISOString(),
    isFavorite: true,
    category: "Liquids",
    type: "tile"
  },
  {
    id: "knight",
    name: "Valiant Tiny Knight",
    size: 16,
    grid: generateKnightGrid(),
    palette: ["#1a1c2c", "#ffe3b3", "#333c57", "#94b0c2", "#b13e53", "#f4f4f4"],
    createdAt: new Date().toISOString(),
    isFavorite: true,
    category: "Characters",
    type: "sprite"
  },
  {
    id: "slime",
    name: "Bouncy Green Slime",
    size: 16,
    grid: generateSlimeGrid(),
    palette: ["#1a1c2c", "#38b764", "#a7f070", "#ffcd75", "#f4f4f4"],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Monsters",
    type: "sprite"
  },
  {
    id: "heart",
    name: "Magical Life Heart",
    size: 16,
    grid: generateHeartGrid(),
    palette: ["#1a1c2c", "#b13e53", "#ef7d57", "#f4f4f4"],
    createdAt: new Date().toISOString(),
    isFavorite: false,
    category: "Items",
    type: "sprite"
  }
];

export interface SubjectTemplate {
  id: string;
  name: string;
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  size: number;
  grid: string[];
  colorsUsed: string[];
  category: string;
  tips: string;
}

const swordGrid = (): string[] => {
  const S = "#94b0c2"; // Steel mid
  const W = "#f4f4f4"; // Steel shine
  const D = "#1a1c2c"; // Dark steel outline
  const G = "#ffa300"; // Gold guard
  const H = "#ab5236"; // Handle brown
  const _ = "transparent";
  return [
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, D, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, D, W, D,
    _, _, _, _, _, _, _, _, _, _, _, _, D, W, S, D,
    _, _, _, _, _, _, _, _, _, _, _, D, W, S, D, _,
    _, _, _, _, _, _, _, _, _, _, D, W, S, D, _, _,
    _, _, _, _, _, _, _, _, _, D, W, S, D, _, _, _,
    _, _, _, _, _, _, _, _, D, W, S, D, _, _, _, _,
    _, _, _, _, _, _, _, D, W, S, D, _, _, _, _, _,
    _, _, _, _, _, _, D, W, S, D, _, _, _, _, _, _,
    _, _, _, _, _, D, G, G, D, _, _, _, _, _, _, _,
    _, _, _, _, D, G, G, D, _, _, _, _, _, _, _, _,
    _, _, _, D, H, D, G, D, _, _, _, _, _, _, _, _,
    _, _, D, H, D, _, D, _, _, _, _, _, _, _, _, _,
    _, D, H, D, _, _, _, _, _, _, _, _, _, _, _, _,
    D, H, D, _, _, _, _, _, _, _, _, _, _, _, _, _,
    D, D, _, _, _, _, _, _, _, _, _, _, _, _, _, _
  ];
};

const keyGrid = (): string[] => {
  const G = "#ffa300"; // Gold
  const Y = "#ffec27"; // Yellow highlight
  const D = "#1a1c2c"; // Outline
  const _ = "transparent";
  return [
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, D, D, D, D, _, _, _, _, _, _, _, _, _, _,
    _, D, Y, Y, G, G, D, _, _, _, _, _, _, _, _, _,
    _, D, Y, _, _, G, D, _, _, _, _, _, _, _, _, _,
    _, D, G, _, _, G, D, _, _, _, _, _, _, _, _, _,
    _, D, G, G, G, G, D, D, _, _, _, _, _, _, _, _,
    _, _, D, D, D, D, G, G, D, _, _, _, _, _, _, _,
    _, _, _, _, _, _, D, G, G, D, _, _, _, _, _, _,
    _, _, _, _, _, _, _, D, G, G, D, _, _, _, _, _,
    _, _, _, _, _, _, _, _, D, G, G, D, _, _, _, _,
    _, _, _, _, _, _, _, _, _, D, G, G, D, _, _, _,
    _, _, _, _, _, _, _, _, _, _, D, G, G, D, D, _,
    _, _, _, _, _, _, _, _, _, _, _, D, G, Y, D, _,
    _, _, _, _, _, _, _, _, _, _, _, D, G, D, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, D, D, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _
  ];
};

const crownGrid = (): string[] => {
  const G = "#ffa300"; // Gold
  const Y = "#ffec27"; // Yellow highlight
  const R = "#ff004d"; // Ruby
  const B = "#29adff"; // Sapphire
  const D = "#1a1c2c"; // Outline
  const _ = "transparent";
  return [
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, _, _, D, _, _, _, _, _, D, _, _, _, _, _,
    _, _, _, D, R, D, _, _, _, D, B, D, _, _, _, _,
    _, D, _, D, Y, D, _, D, _, D, Y, D, _, D, _, _,
    _, D, R, D, Y, D, D, G, D, D, Y, D, R, D, _, _,
    _, D, Y, G, Y, G, G, G, G, G, Y, G, Y, D, _, _,
    _, D, Y, G, Y, G, G, G, G, G, Y, G, Y, D, _, _,
    _, _, D, G, B, G, G, R, G, G, B, G, D, _, _, _,
    _, _, D, G, G, G, G, G, G, G, G, G, D, _, _, _,
    _, _, D, G, Y, G, Y, G, Y, G, Y, G, D, _, _, _,
    _, _, D, D, Y, Y, Y, Y, Y, Y, Y, D, D, _, _, _,
    _, _, _, D, D, D, D, D, D, D, D, D, _, _, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _
  ];
};

const potionGrid = (): string[] => {
  const P = "#ff004d"; // Potion deep red
  const L = "#ff77a8"; // Potion light pink
  const S = "#73eff7"; // Sparkle glass glow
  const B = "#1a1c2c"; // Deep outline
  const C = "#ab5236"; // Cork wood
  const _ = "transparent";
  return [
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, B, B, B, B, _, _, _, _, _, _,
    _, _, _, _, _, _, B, C, C, B, _, _, _, _, _, _,
    _, _, _, _, _, _, B, B, B, B, _, _, _, _, _, _,
    _, _, _, _, _, _, _, B, B, _, _, _, _, _, _, _,
    _, _, _, _, _, _, B, S, S, B, _, _, _, _, _, _,
    _, _, _, _, _, B, S, S, S, S, B, _, _, _, _, _,
    _, _, _, _, B, S, S, L, L, S, S, B, _, _, _, _,
    _, _, _, B, S, L, L, P, P, L, S, S, B, _, _, _,
    _, _, _, B, L, P, P, P, P, P, P, S, B, _, _, _,
    _, _, B, L, P, P, S, S, P, P, P, P, B, _, _, _,
    _, _, B, P, P, P, S, S, P, P, P, P, B, _, _, _,
    _, _, B, P, P, P, P, P, P, P, P, P, B, _, _, _,
    _, _, _, B, B, B, B, B, B, B, B, B, _, _, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _
  ];
};

const shieldGrid = (): string[] => {
  const A = "#94b0c2"; // Iron grey
  const W = "#f4f4f4"; // Steel shine
  const G = "#ffa300"; // Gold trim
  const D = "#1a1c2c"; // Outline
  const B = "#29adff"; // Blue emblem
  const _ = "transparent";
  return [
    _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    _, D, D, D, D, D, D, D, D, D, D, D, D, D, _, _,
    _, D, G, G, G, G, G, G, G, G, G, G, G, D, _, _,
    _, D, G, W, A, A, A, A, A, A, A, A, G, D, _, _,
    _, D, G, W, B, D, D, D, D, D, B, A, G, D, _, _,
    _, D, G, W, B, B, D, D, D, B, B, A, G, D, _, _,
    _, D, G, W, A, B, B, D, B, B, A, A, G, D, _, _,
    _, D, G, W, A, A, B, B, B, A, A, A, G, D, _, _,
    _, D, G, W, A, A, A, B, A, A, A, A, G, D, _, _,
    _, _, D, G, W, A, A, A, A, A, A, G, D, _, _, _,
    _, _, D, G, W, W, A, A, A, A, G, G, D, _, _, _,
    _, _, _, D, G, W, W, A, A, G, G, D, _, _, _, _,
    _, _, _, D, G, G, W, A, G, G, G, D, _, _, _, _,
    _, _, _, _, D, G, G, G, G, G, D, _, _, _, _, _,
    _, _, _, _, _, D, D, G, D, D, _, _, _, _, _, _,
    _, _, _, _, _, _, _, D, _, _, _, _, _, _, _, _
  ];
};

export const SUBJECT_TEMPLATES: SubjectTemplate[] = [
  {
    id: "sub_spear",
    name: "Ancient Valkyrie Spear",
    emoji: "🔱",
    difficulty: "Medium",
    size: 16,
    grid: [
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#1a1c2c", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#f4f4f4", "#94b0c2", "#1a1c2c",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#94b0c2", "#f4f4f4", "#94b0c2", "#1a1c2c",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#94b0c2", "#94b0c2", "#94b0c2", "#1a1c2c", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#ffa300", "#94b0c2", "#94b0c2", "#1a1c2c", "transparent", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#ffa300", "#ffa300", "#1a1c2c", "#1a1c2c", "transparent", "transparent", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "transparent", "transparent", "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "transparent", "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "#1a1c2c", "#ab5236", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "#1a1c2c", "#1a1c2c", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent",
      "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent"
    ],
    colorsUsed: ["#94b0c2", "#f4f4f4", "#1a1c2c", "#ffa300", "#ab5236"],
    category: "Weapons",
    tips: "Keep the long wooden shaft straight diagonally and top it off with a golden socket coupling and a razor-sharp steel spearhead."
  },
  {
    id: "sub_sword",
    name: "Classic Iron Knight Sword",
    emoji: "⚔️",
    difficulty: "Medium",
    size: 16,
    grid: swordGrid(),
    colorsUsed: ["#94b0c2", "#f4f4f4", "#1a1c2c", "#ffa300", "#ab5236"],
    category: "Weapons",
    tips: "Draw a clean diagonal blade with high contrast white pixels, separating with a golden guard and sturdy handle."
  },
  {
    id: "sub_key",
    name: "Dungeon Relic Key",
    emoji: "🔑",
    difficulty: "Easy",
    size: 16,
    grid: keyGrid(),
    colorsUsed: ["#ffa300", "#ffec27", "#1a1c2c"],
    category: "Quest Items",
    tips: "Keep the handle ring round at the top-left, and trace a diagonal line down to place two symmetrical key notches."
  },
  {
    id: "sub_crown",
    name: "Gleaming Golden Crown",
    emoji: "👑",
    difficulty: "Hard",
    size: 16,
    grid: crownGrid(),
    colorsUsed: ["#ffa300", "#ffec27", "#ff004d", "#29adff", "#1a1c2c"],
    category: "Relics",
    tips: "A symmetrical crown. Place sapphire and ruby gem blocks on the tips and center. Use gold highlights for the trim."
  },
  {
    id: "sub_potion",
    name: "Bubbling Healing Elixir",
    emoji: "🧪",
    difficulty: "Easy",
    size: 16,
    grid: potionGrid(),
    colorsUsed: ["#ff004d", "#ff77a8", "#73eff7", "#1a1c2c", "#ab5236"],
    category: "Elixirs",
    tips: "Paint a circular glass structure containing glowing red liquid, leaving a tiny shine trace on the glass wall."
  },
  {
    id: "sub_shield",
    name: "Kingdom Defender Shield",
    emoji: "🛡️",
    difficulty: "Medium",
    size: 16,
    grid: shieldGrid(),
    colorsUsed: ["#94b0c2", "#f4f4f4", "#ffa300", "#1a1c2c", "#29adff"],
    category: "Armor",
    tips: "Create a wide shield outline with steel coloring, gold trim frame, and a contrasting blue design in the center."
  }
];

