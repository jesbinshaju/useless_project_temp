package com.example.famousmeter.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.famousmeter.model.ReferenceCategory
import com.example.famousmeter.model.ReferenceConfig
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReferenceSelectionScreen(
    initialConfig: ReferenceConfig = ReferenceConfig(),
    onBack: () -> Unit,
    onContinue: (ReferenceConfig) -> Unit
) {
    var category by remember { mutableStateOf(initialConfig.category) }
    var heightText by remember { mutableStateOf(initialConfig.heightCm.toInt().toString()) }
    var objectName by remember { mutableStateOf(if (initialConfig.category == ReferenceCategory.CUSTOM_OBJECT) initialConfig.label else "Ruler") }
    val scrollState = rememberScrollState()

    val heightVal = heightText.toDoubleOrNull() ?: 0.0
    val isValid = heightVal in 5.0..1000.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Select Reference", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "What is your known reference?",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Text(
                    text = "The reference object or person must stand directly beside the object you are measuring.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Selector Tabs: Person vs Custom Object
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    ReferenceTypeCard(
                        title = "Person",
                        subtitle = "Friend, colleague, or self",
                        icon = Icons.Default.Person,
                        isSelected = category == ReferenceCategory.PERSON,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            category = ReferenceCategory.PERSON
                            if (heightText == "30" || heightText == "100") {
                                heightText = "175"
                            }
                        }
                    )

                    ReferenceTypeCard(
                        title = "Custom Object",
                        subtitle = "Ruler, pole, door, etc.",
                        icon = Icons.Default.Category,
                        isSelected = category == ReferenceCategory.CUSTOM_OBJECT,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            category = ReferenceCategory.CUSTOM_OBJECT
                            if (heightText == "175") {
                                heightText = "100"
                            }
                        }
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                if (category == ReferenceCategory.CUSTOM_OBJECT) {
                    OutlinedTextField(
                        value = objectName,
                        onValueChange = { objectName = it },
                        label = { Text("Object Name") },
                        placeholder = { Text("e.g. 1-Meter Stick") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Known Height Input
                OutlinedTextField(
                    value = heightText,
                    onValueChange = { input ->
                        if (input.all { it.isDigit() || it == '.' }) {
                            heightText = input
                        }
                    },
                    label = {
                        Text(
                            if (category == ReferenceCategory.PERSON) "Person's Known Height (cm)"
                            else "Object's Known Height (cm)"
                        )
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    trailingIcon = {
                        Text(
                            text = "cm",
                            modifier = Modifier.padding(end = 12.dp),
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    isError = !isValid && heightText.isNotEmpty()
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Real-time meter readout
                val meters = heightVal / 100.0
                Text(
                    text = String.format(Locale.US, "= %.2f meters (%.2f feet)", meters, meters * 3.28084),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Quick Preset Chips
                Text(
                    text = "Quick Presets:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val presets = if (category == ReferenceCategory.PERSON) {
                        listOf(165, 170, 175, 180, 185)
                    } else {
                        listOf(30, 50, 100, 150, 200)
                    }

                    presets.forEach { preset ->
                        FilterChip(
                            selected = heightText == preset.toString(),
                            onClick = { heightText = preset.toString() },
                            label = { Text("${preset} cm") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Continue Button
            Button(
                onClick = {
                    val finalLabel = if (category == ReferenceCategory.PERSON) "Reference Person" else objectName.ifBlank { "Custom Object" }
                    onContinue(
                        ReferenceConfig(
                            category = category,
                            label = finalLabel,
                            heightCm = heightVal
                        )
                    )
                },
                enabled = isValid,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
            ) {
                Text(
                    text = "Continue to Camera",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.size(8.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null
                )
            }
        }
    }
}

@Composable
private fun ReferenceTypeCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        border = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) {
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
            } else {
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
            }
        ),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 14.sp
            )
        }
    }
}
