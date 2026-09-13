import { Point, MeasurementResult } from '../types/measurement';
import { calculateA10Multiplier } from '../data/config';

/**
 * MeasurementEngine is an isolated mathematical calculation module.
 * It contains zero UI or React dependencies.
 */
export class MeasurementEngine {
  /**
   * Calculates Euclidean distance between two points in 2D space.
   * distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)
   */
  public static pixelDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Computes object height from reference points and object points.
   *
   * @param referenceBottom - Pixel coordinate of reference bottom
   * @param referenceTop - Pixel coordinate of reference top
   * @param objectBottom - Pixel coordinate of object bottom
   * @param objectTop - Pixel coordinate of object top
   * @param referenceHeightMeters - Known physical height of reference (e.g. mobile phone) in meters
   * @param referenceName - Name of reference object (e.g. "Smartphone")
   */
  public static calculate(
    referenceBottom: Point,
    referenceTop: Point,
    objectBottom: Point,
    objectTop: Point,
    referenceHeightMeters: number,
    referenceName: string = 'Reference'
  ): MeasurementResult {
    if (!referenceBottom || !referenceTop) {
      throw new Error("Please mark both the top and bottom of the reference.");
    }

    if (!objectBottom || !objectTop) {
      throw new Error("Please mark both the top and bottom of the object.");
    }

    if (isNaN(referenceHeightMeters) || referenceHeightMeters <= 0) {
      throw new Error("Invalid reference height. Please specify a positive height.");
    }

    const referencePixelHeight = this.pixelDistance(referenceTop, referenceBottom);
    if (referencePixelHeight <= 0) {
      throw new Error("Reference points cannot be identical. Pixel height is zero.");
    }

    const objectPixelHeight = this.pixelDistance(objectTop, objectBottom);
    if (objectPixelHeight <= 0) {
      throw new Error("Object points cannot be identical. Pixel height is zero.");
    }

    // Ratio: how many reference objects (e.g. phones) tall is the object
    const referenceMultiplier = objectPixelHeight / referencePixelHeight;

    // Real world physical height:
    // objectHeightMeters = referenceHeightMeters * (objectPixelHeight / referencePixelHeight)
    const objectHeightMeters = referenceHeightMeters * referenceMultiplier;
    const objectHeightCm = objectHeightMeters * 100;
    const objectHeightFeet = objectHeightMeters * 3.28084;

    // A10 unit multiplier (how many Mohanlals tall)
    const a10Multiplier = calculateA10Multiplier(objectHeightMeters);

    return {
      referenceName,
      referenceHeightMeters,
      referencePixelHeight,
      objectPixelHeight,
      objectHeightMeters,
      objectHeightCm,
      objectHeightFeet,
      referenceMultiplier,
      a10Multiplier,
      refBottom: referenceBottom,
      refTop: referenceTop,
      objBottom: objectBottom,
      objTop: objectTop,
    };
  }
}
