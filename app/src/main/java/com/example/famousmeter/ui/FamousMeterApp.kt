package com.example.famousmeter.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.example.famousmeter.measurement.ImagePoint
import com.example.famousmeter.measurement.MeasurementEngine
import com.example.famousmeter.measurement.MeasurementResult
import com.example.famousmeter.model.ReferenceConfig
import com.example.famousmeter.ui.screens.CalculationScreen
import com.example.famousmeter.ui.screens.CameraScreen
import com.example.famousmeter.ui.screens.HomeScreen
import com.example.famousmeter.ui.screens.MarkingScreen
import com.example.famousmeter.ui.screens.ReferenceSelectionScreen
import com.example.famousmeter.ui.screens.ResultScreen

sealed class AppScreen {
    object Home : AppScreen()
    object SelectReference : AppScreen()
    object Camera : AppScreen()
    data class Marking(val imagePath: String) : AppScreen()
    data class Calculating(val result: MeasurementResult, val refConfig: ReferenceConfig) : AppScreen()
    data class Result(val result: MeasurementResult, val refConfig: ReferenceConfig) : AppScreen()
}

@Composable
fun FamousMeterApp() {
    var currentScreen by remember { mutableStateOf<AppScreen>(AppScreen.Home) }
    var referenceConfig by remember { mutableStateOf(ReferenceConfig()) }

    // System Back Button Handling
    BackHandler(enabled = currentScreen != AppScreen.Home) {
        when (currentScreen) {
            is AppScreen.SelectReference -> currentScreen = AppScreen.Home
            is AppScreen.Camera -> currentScreen = AppScreen.SelectReference
            is AppScreen.Marking -> currentScreen = AppScreen.Camera
            is AppScreen.Calculating -> {} // Lock during short calculation animation
            is AppScreen.Result -> currentScreen = AppScreen.Home
            AppScreen.Home -> {}
        }
    }

    AnimatedContent(
        targetState = currentScreen,
        transitionSpec = { fadeIn() togetherWith fadeOut() },
        label = "ScreenTransition",
        modifier = Modifier.fillMaxSize()
    ) { screen ->
        when (screen) {
            is AppScreen.Home -> {
                HomeScreen(
                    onStartMeasurement = {
                        currentScreen = AppScreen.SelectReference
                    }
                )
            }

            is AppScreen.SelectReference -> {
                ReferenceSelectionScreen(
                    initialConfig = referenceConfig,
                    onBack = { currentScreen = AppScreen.Home },
                    onContinue = { updatedConfig ->
                        referenceConfig = updatedConfig
                        currentScreen = AppScreen.Camera
                    }
                )
            }

            is AppScreen.Camera -> {
                CameraScreen(
                    onBack = { currentScreen = AppScreen.SelectReference },
                    onPhotoCaptured = { photoPath ->
                        currentScreen = AppScreen.Marking(photoPath)
                    }
                )
            }

            is AppScreen.Marking -> {
                MarkingScreen(
                    imagePath = screen.imagePath,
                    referenceConfig = referenceConfig,
                    onBack = { currentScreen = AppScreen.Camera },
                    onCalculate = { refBottom: ImagePoint, refTop: ImagePoint, objBottom: ImagePoint, objTop: ImagePoint ->
                        val result = MeasurementEngine.calculateHeight(
                            referenceHeightMeters = referenceConfig.heightMeters,
                            referenceTop = refTop,
                            referenceBottom = refBottom,
                            objectTop = objTop,
                            objectBottom = objBottom
                        )
                        currentScreen = AppScreen.Calculating(result, referenceConfig)
                    }
                )
            }

            is AppScreen.Calculating -> {
                CalculationScreen(
                    onFinished = {
                        currentScreen = AppScreen.Result(screen.result, screen.refConfig)
                    }
                )
            }

            is AppScreen.Result -> {
                ResultScreen(
                    result = screen.result,
                    referenceConfig = screen.refConfig,
                    onMeasureAgain = {
                        currentScreen = AppScreen.Home
                    }
                )
            }
        }
    }
}
