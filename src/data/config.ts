/**
 * A10 Reference Configuration
 *
 * A10 = Mohanlal (Kerala's iconic star, fondly called Lalettan / A10)
 * Standard height: 1.72 meters (~5 ft 7.7 in = 172 cm)
 *
 * Adjust this single constant to update the base A10 unit.
 */
export const A10_HEIGHT_METERS = 1.72;
export const A10_NAME = "Mohanlal";
export const A10_UNIT_LABEL = "A10";

/**
 * Available Lalettan Avatar Skins!
 */
export interface LalettanSkin {
  id: string;
  name: string;
  url: string;
  desc: string;
}

export const LALETTAN_SKINS: LalettanSkin[] = [
  {
    id: "mundu",
    name: "Classic Mundu A10",
    url: "/mohanlal.png",
    desc: "Iconic Kasavu Mundu & Kurta",
  },
  {
    id: "spadikam",
    name: "Spadikam Aadu Thoma",
    url: "/a10_spadikam.png",
    desc: "Rayban glass & Mundu murukki",
  },
  {
    id: "sports",
    name: "Olympic Lalettan",
    url: "/a10_crouch.png",
    desc: "Vintage A-Cap sporty pose",
  },
];

export const MOHANLAL_IMAGE_URL = "/mohanlal.png";

/**
 * Common quick-select reference items with their typical physical heights in cm
 */
export const POPULAR_REFERENCES = [
  { name: "Smartphone (iPhone / Android)", heightCm: 15, icon: "📱" },
  { name: "Comic Book / Balarama", heightCm: 25, icon: "📖" },
  { name: "Water Bottle (1L)", heightCm: 28, icon: "🧴" },
  { name: "Standard 30cm Ruler", heightCm: 30, icon: "📏" },
  { name: "Laptop (15.6\")", heightCm: 25, icon: "💻" },
  { name: "Human (Average Adult)", heightCm: 172, icon: "🚶" },
];

/**
 * Calculates how many A10s tall an object is.
 */
export function calculateA10Multiplier(objectHeightMeters: number): number {
  if (A10_HEIGHT_METERS <= 0) {
    throw new Error("A10_HEIGHT_METERS must be greater than zero.");
  }
  return objectHeightMeters / A10_HEIGHT_METERS;
}
