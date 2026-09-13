package com.example.famousmeter.util

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect

/**
 * Utility for converting between screen touch coordinates and image pixel coordinates.
 */
object CoordinateTransformer {

    /**
     * Computes the bounding rectangle of an image displayed with ContentScale.Fit
     * inside a container of size (containerWidth x containerHeight).
     */
    fun computeFittedImageBounds(
        imageWidth: Float,
        imageHeight: Float,
        containerWidth: Float,
        containerHeight: Float
    ): Rect {
        if (imageWidth <= 0f || imageHeight <= 0f || containerWidth <= 0f || containerHeight <= 0f) {
            return Rect.Zero
        }

        val imageAspect = imageWidth / imageHeight
        val containerAspect = containerWidth / containerHeight

        val drawWidth: Float
        val drawHeight: Float

        if (imageAspect > containerAspect) {
            // Constrained by width
            drawWidth = containerWidth
            drawHeight = containerWidth / imageAspect
        } else {
            // Constrained by height
            drawHeight = containerHeight
            drawWidth = containerHeight * imageAspect
        }

        val left = (containerWidth - drawWidth) / 2f
        val top = (containerHeight - drawHeight) / 2f

        return Rect(left, top, left + drawWidth, top + drawHeight)
    }

    /**
     * Converts a screen touch offset to image pixel coordinates (0..imageWidth, 0..imageHeight).
     */
    fun screenToImageCoordinates(
        touchOffset: Offset,
        imageBounds: Rect,
        imageWidth: Float,
        imageHeight: Float
    ): Offset? {
        if (imageBounds.width <= 0f || imageBounds.height <= 0f) return null

        val clampedX = touchOffset.x.coerceIn(imageBounds.left, imageBounds.right)
        val clampedY = touchOffset.y.coerceIn(imageBounds.top, imageBounds.bottom)

        val normalizedX = (clampedX - imageBounds.left) / imageBounds.width
        val normalizedY = (clampedY - imageBounds.top) / imageBounds.height

        return Offset(
            x = normalizedX * imageWidth,
            y = normalizedY * imageHeight
        )
    }

    /**
     * Converts image pixel coordinates back to screen canvas coordinates.
     */
    fun imageToScreenCoordinates(
        imageOffset: Offset,
        imageBounds: Rect,
        imageWidth: Float,
        imageHeight: Float
    ): Offset {
        if (imageWidth <= 0f || imageHeight <= 0f) return Offset.Zero

        val normX = imageOffset.x / imageWidth
        val normY = imageOffset.y / imageHeight

        return Offset(
            x = imageBounds.left + normX * imageBounds.width,
            y = imageBounds.top + normY * imageBounds.height
        )
    }
}
