package com.example.famousmeter.measurement

import kotlin.math.hypot

/**
 * Coordinate point in normalized or pixel space on the photograph.
 */
data class ImagePoint(
    val x: Float,
    val y: Float
) {
    /**
     * Calculates Euclidean distance to another point.
     * dist = sqrt((x2 - x1)^2 + (y2 - y1)^2)
     */
    fun distanceTo(other: ImagePoint): Double {
        val dx = (this.x - other.x).toDouble()
        val dy = (this.y - other.y).toDouble()
        return hypot(dx, dy)
    }
}

/**
 * Deterministic calculation result holding all measurement parameters and results.
 */
data class MeasurementResult(
    val referenceHeightMeters: Double,
    val referencePixelHeight: Double,
    val objectPixelHeight: Double,
    val objectHeightMeters: Double,
    val objectHeightFeet: Double
) {
    val formattedMeters: String
        get() = String.format(java.util.Locale.US, "%.2f m", objectHeightMeters)

    val formattedFeet: String
        get() = String.format(java.util.Locale.US, "%.2f ft", objectHeightFeet)

    val ratio: Double
        get() = if (referencePixelHeight > 0) objectPixelHeight / referencePixelHeight else 0.0
}

sealed class ValidationResult {
    object Valid : ValidationResult()
    data class Invalid(val reason: String) : ValidationResult()
}

/**
 * Pure mathematical measurement engine with NO dependencies on Android UI framework.
 * Implements the core formula:
 * objectHeight = referenceHeightMeters * (objectPixelHeight / referencePixelHeight)
 */
object MeasurementEngine {

    const val METERS_TO_FEET: Double = 3.280839895

    /**
     * Validates that all 4 points exist and form meaningful non-zero segments.
     */
    fun validatePoints(
        referenceBottom: ImagePoint?,
        referenceTop: ImagePoint?,
        objectBottom: ImagePoint?,
        objectTop: ImagePoint?
    ): ValidationResult {
        if (referenceBottom == null) return ValidationResult.Invalid("Reference bottom point is missing.")
        if (referenceTop == null) return ValidationResult.Invalid("Reference top point is missing.")
        if (objectBottom == null) return ValidationResult.Invalid("Object bottom point is missing.")
        if (objectTop == null) return ValidationResult.Invalid("Object top point is missing.")

        val refDist = referenceBottom.distanceTo(referenceTop)
        if (refDist <= 1.0) {
            return ValidationResult.Invalid("Reference top and bottom points are too close together.")
        }

        val objDist = objectBottom.distanceTo(objectTop)
        if (objDist <= 1.0) {
            return ValidationResult.Invalid("Object top and bottom points are too close together.")
        }

        // Check if top is positioned below bottom in standard screen coordinates (y increases downward)
        if (referenceTop.y > referenceBottom.y) {
            return ValidationResult.Invalid("Reference top point appears to be below reference bottom. Please check marker placement.")
        }

        if (objectTop.y > objectBottom.y) {
            return ValidationResult.Invalid("Object top point appears to be below object bottom. Please check marker placement.")
        }

        return ValidationResult.Valid
    }

    /**
     * Calculates the real-world height of the object.
     *
     * @param referenceHeightMeters Known physical height of the reference object/person in meters.
     * @param referenceTop Top coordinate of the reference.
     * @param referenceBottom Bottom coordinate of the reference.
     * @param objectTop Top coordinate of the measured object.
     * @param objectBottom Bottom coordinate of the measured object.
     * @return [MeasurementResult] containing heights in meters, feet, and pixel distances.
     */
    fun calculateHeight(
        referenceHeightMeters: Double,
        referenceTop: ImagePoint,
        referenceBottom: ImagePoint,
        objectTop: ImagePoint,
        objectBottom: ImagePoint
    ): MeasurementResult {
        require(referenceHeightMeters > 0.0) { "Reference height must be greater than zero." }

        val refPixelHeight = referenceTop.distanceTo(referenceBottom)
        require(refPixelHeight > 0.0) { "Reference pixel height must be greater than zero." }

        val objPixelHeight = objectTop.distanceTo(objectBottom)
        require(objPixelHeight > 0.0) { "Object pixel height must be greater than zero." }

        val objectHeightMeters = referenceHeightMeters * (objPixelHeight / refPixelHeight)
        val objectHeightFeet = objectHeightMeters * METERS_TO_FEET

        return MeasurementResult(
            referenceHeightMeters = referenceHeightMeters,
            referencePixelHeight = refPixelHeight,
            objectPixelHeight = objPixelHeight,
            objectHeightMeters = objectHeightMeters,
            objectHeightFeet = objectHeightFeet
        )
    }

    fun metersToFeet(meters: Double): Double = meters * METERS_TO_FEET
}
