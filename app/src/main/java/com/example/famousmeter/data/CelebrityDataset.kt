package com.example.famousmeter.data

import com.example.famousmeter.model.FamousPerson

object CelebrityDataset {

    val CELEBRITIES: List<FamousPerson> = listOf(
        FamousPerson(
            id = "mohanlal",
            name = "Mohanlal",
            title = "The Complete Actor",
            heightMeters = 1.72,
            category = "Mollywood",
            funQuote = "\"Lucifer level stature right here.\""
        )
    )

    fun getDefaultCelebrity(): FamousPerson = CELEBRITIES.first()

    fun getCelebrityById(id: String): FamousPerson =
        CELEBRITIES.find { it.id == id } ?: getDefaultCelebrity()
}
