package com.example.famousmeter.model

import java.util.Locale

/**
 * Represents a celebrity or quirky unit with known physical height.
 */
data class FamousPerson(
    val id: String,
    val name: String,
    val title: String,
    val heightMeters: Double,
    val category: String,
    val funQuote: String
) {
    /**
     * Calculates how many times this person fits into the object height.
     */
    fun calculateMultiplier(objectHeightMeters: Double): Double {
        return if (heightMeters > 0.0) objectHeightMeters / heightMeters else 0.0
    }

    fun formattedMultiplier(objectHeightMeters: Double): String {
        return String.format(Locale.US, "%.2f", calculateMultiplier(objectHeightMeters))
    }

    val formattedHeight: String
        get() = String.format(Locale.US, "%.2f m", heightMeters)
}
