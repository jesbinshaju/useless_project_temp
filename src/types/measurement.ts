export interface Point {
  x: number;
  y: number;
}

export interface MeasurementResult {
  referenceName: string;
  referenceHeightMeters: number;
  referencePixelHeight: number;
  objectPixelHeight: number;
  objectHeightMeters: number;
  objectHeightCm: number;
  objectHeightFeet: number;
  referenceMultiplier: number; // How many phones / reference objects tall
  a10Multiplier: number;        // How many A10s (Mohanlals) tall
  // Original coordinates for overlaying Mohanlal directly on the photo
  refBottom: Point;
  refTop: Point;
  objBottom: Point;
  objTop: Point;
}

export type UnitType = 'cm' | 'm' | 'ft';

export type AppStep =
  | 'home'
  | 'reference-input'
  | 'camera-capture'
  | 'mark-reference'
  | 'mark-object'
  | 'result';
