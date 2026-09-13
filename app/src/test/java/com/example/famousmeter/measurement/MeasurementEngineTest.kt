package com.example.famousmeter.measurement

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MeasurementEngineTest {

    @Test
    fun calculateHeight_standardVerticalPoints_calculatesExactRatio() {
        // Example from prompt:
        // reference height = 1.75 m
        // reference pixel height = 250 px (from y=750 to y=500)
        // object pixel height = 1750 px (from y=2000 to y=250)
        // Expected: 1.75 * (1750 / 250) = 12.25 m
        val refBottom = ImagePoint(x = 100f, y = 750f)
        val refTop = ImagePoint(x = 100f, y = 500f)

        val objBottom = ImagePoint(x = 400f, y = 2000f)
        val objTop = ImagePoint(x = 400f, y = 250f)

        val result = MeasurementEngine.calculateHeight(
            referenceHeightMeters = 1.75,
            referenceTop = refTop,
            referenceBottom = refBottom,
            objectTop = objTop,
            objectBottom = objBottom
        )

        assertEquals(1.75, result.referenceHeightMeters, 0.001)
        assertEquals(250.0, result.referencePixelHeight, 0.001)
        assertEquals(1750.0, result.objectPixelHeight, 0.001)
        assertEquals(12.25, result.objectHeightMeters, 0.001)
        assertEquals(40.19, result.objectHeightFeet, 0.05)
        assertEquals(7.0, result.ratio, 0.001)
    }

    @Test
    fun calculateHeight_angledPoints_usesEuclideanDistance() {
        // 3-4-5 right triangle: dx=30, dy=40 -> distance = 50
        val refBottom = ImagePoint(x = 0f, y = 40f)
        val refTop = ImagePoint(x = 30f, y = 0f)

        // dx=60, dy=80 -> distance = 100
        val objBottom = ImagePoint(x = 100f, y = 180f)
        val objTop = ImagePoint(x = 160f, y = 100f)

        val result = MeasurementEngine.calculateHeight(
            referenceHeightMeters = 2.0,
            referenceTop = refTop,
            referenceBottom = refBottom,
            objectTop = objTop,
            objectBottom = objBottom
        )

        assertEquals(50.0, result.referencePixelHeight, 0.001)
        assertEquals(100.0, result.objectPixelHeight, 0.001)
        assertEquals(4.0, result.objectHeightMeters, 0.001)
    }

    @Test
    fun validatePoints_allValidPoints_returnsValid() {
        val refBottom = ImagePoint(100f, 600f)
        val refTop = ImagePoint(100f, 400f)
        val objBottom = ImagePoint(300f, 800f)
        val objTop = ImagePoint(300f, 100f)

        val validation = MeasurementEngine.validatePoints(
            referenceBottom = refBottom,
            referenceTop = refTop,
            objectBottom = objBottom,
            objectTop = objTop
        )

        assertTrue(validation is ValidationResult.Valid)
    }

    @Test
    fun validatePoints_missingPoint_returnsInvalid() {
        val validation = MeasurementEngine.validatePoints(
            referenceBottom = ImagePoint(100f, 600f),
            referenceTop = null,
            objectBottom = ImagePoint(300f, 800f),
            objectTop = ImagePoint(300f, 100f)
        )

        assertTrue(validation is ValidationResult.Invalid)
    }

    @Test
    fun validatePoints_invertedPoints_returnsInvalid() {
        // refTop.y > refBottom.y implies top is below bottom
        val refBottom = ImagePoint(100f, 400f)
        val refTop = ImagePoint(100f, 600f)
        val objBottom = ImagePoint(300f, 800f)
        val objTop = ImagePoint(300f, 100f)

        val validation = MeasurementEngine.validatePoints(
            referenceBottom = refBottom,
            referenceTop = refTop,
            objectBottom = objBottom,
            objectTop = objTop
        )

        assertTrue(validation is ValidationResult.Invalid)
    }
}
