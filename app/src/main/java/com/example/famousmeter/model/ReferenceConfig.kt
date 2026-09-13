package com.example.famousmeter.model

enum class ReferenceCategory {
    PERSON,
    CUSTOM_OBJECT
}

data class ReferenceConfig(
    val category: ReferenceCategory = ReferenceCategory.PERSON,
    val label: String = "Reference Person",
    val heightCm: Double = 175.0
) {
    val heightMeters: Double
        get() = heightCm / 100.0
}
