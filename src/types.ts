export interface PixelTile {
  id: string;
  name: string;
  size: number; // e.g. 16 or 32
  grid: string[]; // hex codes, length: size * size
  palette: string[]; // list of unique custom colors in palette
  createdAt: string;
  isFavorite: boolean;
  category?: string; // e.g. "Ground", "Walls", "Lava", "Liquids", "Sci-Fi", "Nature"
  type?: "tile" | "sprite"; // Tile mode or Character & Item Sprite mode
}

export interface PresetPalette {
  name: string;
  colors: string[];
}
