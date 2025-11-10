package com.noor.wallet.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

/**
 * TokenIcon component - matches iOS TokenIcon design
 * Hierarchical logo lookup with fallback monogram
 */
@Composable
fun TokenIcon(
    symbol: String,
    modifier: Modifier = Modifier,
    size: Int = 40,
    contractAddress: String? = null
) {
    val logoUrl = remember { mutableStateOf<String?>(null) }
    
    // TODO: Implement TokenLogoService equivalent for Android
    // For now, use placeholder
    
    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape),
        contentAlignment = Alignment.Center
    ) {
        logoUrl.value?.let { url ->
            AsyncImage(
                model = url,
                contentDescription = symbol,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        } ?: run {
            // Monogram fallback
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .background(Color(0xFF8B5CF6)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = symbol.take(1).uppercase(),
                    fontSize = (size * 0.4).sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

