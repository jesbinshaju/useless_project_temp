package com.example.famousmeter.ui.screens

import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.PointMode
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.famousmeter.measurement.ImagePoint
import com.example.famousmeter.measurement.MeasurementEngine
import com.example.famousmeter.measurement.ValidationResult
import com.example.famousmeter.model.ReferenceConfig
import com.example.famousmeter.util.CoordinateTransformer
import com.example.famousmeter.util.ImageUtils
import java.util.Locale
import kotlin.math.roundToInt

enum class MarkingStep(val index: Int, val label: String, val instruction: String, val color: Color) {
    REF_BOTTOM(0, "Ref Bottom", "Tap the BOTTOM of the reference (e.g. feet / base)", Color(0xFF00E5FF)),
    REF_TOP(1, "Ref Top", "Tap the TOP of the reference (e.g. head / tip)", Color(0xFF00E5FF)),
    OBJ_BOTTOM(2, "Object Bottom", "Tap the BOTTOM of the object (e.g. tree base)", Color(0xFFFF9100)),
    OBJ_TOP(3, "Object Top", "Tap the TOP of the object (e.g. highest point)", Color(0xFFFF9100)),
    COMPLETE(4, "All Points Marked", "Review points and tap Calculate Height", Color(0xFF10B981))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarkingScreen(
    imagePath: String,
    referenceConfig: ReferenceConfig,
    onBack: () -> Unit,
    onCalculate: (refBottom: ImagePoint, refTop: ImagePoint, objBottom: ImagePoint, objTop: ImagePoint) -> Unit
) {
    var bitmap by remember { mutableStateOf<Bitmap?>(null) }
    val points = remember { mutableStateListOf<ImagePoint>() }
    var validationError by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(imagePath) {
        bitmap = ImageUtils.loadScaledBitmapFromFile(imagePath)
    }

    val currentStep = when (points.size) {
        0 -> MarkingStep.REF_BOTTOM
        1 -> MarkingStep.REF_TOP
        2 -> MarkingStep.OBJ_BOTTOM
        3 -> MarkingStep.OBJ_TOP
        else -> MarkingStep.COMPLETE
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (points.size < 4) "Step ${points.size + 1} of 4" else "Marking Complete",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    if (points.isNotEmpty()) {
                        IconButton(onClick = { points.removeLastOrNull(); validationError = null }) {
                            Icon(imageVector = Icons.AutoMirrored.Filled.Undo, contentDescription = "Undo", tint = Color.White)
                        }
                        IconButton(onClick = { points.clear(); validationError = null }) {
                            Icon(imageVector = Icons.Default.Refresh, contentDescription = "Reset", tint = Color.White)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFF0F172A))
        ) {
            // Guided Instruction Banner
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(
                    containerColor = currentStep.color.copy(alpha = 0.15f)
                )
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .background(currentStep.color, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (points.size < 4) "${points.size + 1}" else "✓",
                            color = Color.Black,
                            fontWeight = FontWeight.Black,
                            fontSize = 12.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = currentStep.instruction,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Image Area with Canvas Markers
            BoxWithConstraints(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(Color.Black)
            ) {
                val containerW = constraints.maxWidth.toFloat()
                val containerH = constraints.maxHeight.toFloat()

                val bmp = bitmap
                if (bmp != null) {
                    val bmpW = bmp.width.toFloat()
                    val bmpH = bmp.height.toFloat()
                    val bounds = CoordinateTransformer.computeFittedImageBounds(
                        bmpW, bmpH, containerW, containerH
                    )

                    Canvas(
                        modifier = Modifier
                            .fillMaxSize()
                            .pointerInput(bmp) {
                                detectTapGestures { tapOffset ->
                                    if (points.size < 4) {
                                        val imgPoint = CoordinateTransformer.screenToImageCoordinates(
                                            tapOffset, bounds, bmpW, bmpH
                                        )
                                        if (imgPoint != null) {
                                            points.add(ImagePoint(imgPoint.x, imgPoint.y))
                                            validationError = null
                                        }
                                    }
                                }
                            }
                    ) {
                        // 1. Draw image fitted
                        drawImage(
                            image = bmp.asImageBitmap(),
                            dstOffset = IntOffset(bounds.left.roundToInt(), bounds.top.roundToInt()),
                            dstSize = IntSize(bounds.width.roundToInt(), bounds.height.roundToInt())
                        )

                        // 2. Draw Reference Line if both ref points exist
                        if (points.size >= 2) {
                            val p0 = CoordinateTransformer.imageToScreenCoordinates(
                                Offset(points[0].x, points[0].y), bounds, bmpW, bmpH
                            )
                            val p1 = CoordinateTransformer.imageToScreenCoordinates(
                                Offset(points[1].x, points[1].y), bounds, bmpW, bmpH
                            )
                            drawLine(
                                color = Color(0xFF00E5FF),
                                start = p0,
                                end = p1,
                                strokeWidth = 5f,
                                cap = StrokeCap.Round
                            )
                        }

                        // 3. Draw Object Line if both object points exist
                        if (points.size >= 4) {
                            val p2 = CoordinateTransformer.imageToScreenCoordinates(
                                Offset(points[2].x, points[2].y), bounds, bmpW, bmpH
                            )
                            val p3 = CoordinateTransformer.imageToScreenCoordinates(
                                Offset(points[3].x, points[3].y), bounds, bmpW, bmpH
                            )
                            drawLine(
                                color = Color(0xFFFF9100),
                                start = p2,
                                end = p3,
                                strokeWidth = 5f,
                                cap = StrokeCap.Round
                            )
                        }

                        // 4. Draw Markers for each tapped point
                        points.forEachIndexed { index, imgPoint ->
                            val screenPoint = CoordinateTransformer.imageToScreenCoordinates(
                                Offset(imgPoint.x, imgPoint.y), bounds, bmpW, bmpH
                            )
                            drawMarker(screenPoint, index)
                        }
                    }
                } else {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Loading captured image...", color = Color.White)
                    }
                }
            }

            // Validation Error Banner
            validationError?.let { err ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = err,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            fontSize = 12.sp,
                            lineHeight = 15.sp,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Bottom Actions & Summary Bar
            Surface(
                color = Color(0xFF1E293B),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Pixel stats indicator
                    if (points.size >= 2) {
                        val refPx = points[0].distanceTo(points[1]).roundToInt()
                        val objPx = if (points.size >= 4) points[2].distanceTo(points[3]).roundToInt() else null

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            Text(
                                text = "Ref: $refPx px (${referenceConfig.heightMeters} m)",
                                color = Color(0xFF00E5FF),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                            if (objPx != null) {
                                Text(
                                    text = "Object: $objPx px",
                                    color = Color(0xFFFF9100),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                    }

                    // Main Action Button: Calculate Height
                    Button(
                        onClick = {
                            if (points.size == 4) {
                                val validation = MeasurementEngine.validatePoints(
                                    referenceBottom = points[0],
                                    referenceTop = points[1],
                                    objectBottom = points[2],
                                    objectTop = points[3]
                                )

                                when (validation) {
                                    is ValidationResult.Valid -> {
                                        onCalculate(points[0], points[1], points[2], points[3])
                                    }
                                    is ValidationResult.Invalid -> {
                                        validationError = validation.reason
                                    }
                                }
                            }
                        },
                        enabled = points.size == 4,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF10B981),
                            disabledContainerColor = Color(0xFF334155)
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Calculate, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (points.size == 4) "Calculate Height" else "Mark all 4 points to calculate",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }
    }
}

private fun DrawScope.drawMarker(offset: Offset, index: Int) {
    val isRef = index < 2
    val primaryColor = if (isRef) Color(0xFF00E5FF) else Color(0xFFFF9100)

    // Outer pulsating halo
    drawCircle(
        color = primaryColor.copy(alpha = 0.35f),
        radius = 24f,
        center = offset
    )

    // Inner ring
    drawCircle(
        color = Color.White,
        radius = 14f,
        center = offset
    )

    // Core point
    drawCircle(
        color = primaryColor,
        radius = 9f,
        center = offset
    )

    // Crosshair lines
    drawLine(
        color = Color.White.copy(alpha = 0.8f),
        start = Offset(offset.x - 28f, offset.y),
        end = Offset(offset.x + 28f, offset.y),
        strokeWidth = 2f
    )
    drawLine(
        color = Color.White.copy(alpha = 0.8f),
        start = Offset(offset.x, offset.y - 28f),
        end = Offset(offset.x, offset.y + 28f),
        strokeWidth = 2f
    )
}
