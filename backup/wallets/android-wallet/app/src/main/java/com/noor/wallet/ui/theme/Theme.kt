package com.noor.wallet.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Noor Wallet Brand Colors - Premium Purple Glassmorphism
val Purple80 = Color(0xFF8B5CF6)
val Purple70 = Color(0xFF7C3AED)
val Purple60 = Color(0xFF5B47ED)
val PurpleDeep = Color(0xFF2D1B69)
val PurpleDark = Color(0xFF1A0F3D)
val PurpleLight = Color(0xFFDDD6FE)
val PurpleTint = Color(0xFFA78BFA)

// Accent Colors
val Pink = Color(0xFFEC4899)
val Gold = Color(0xFFFBBF24)
val GoldDark = Color(0xFFF59E0B)

// Functional Colors
val Success = Color(0xFF10B981)
val SuccessDark = Color(0xFF059669)
val Error = Color(0xFFEF4444)
val ErrorDark = Color(0xFFDC2626)
val Info = Color(0xFF3B82F6)
val InfoDark = Color(0xFF2563EB)

// Background & Surface
val BackgroundDark = Color(0xFF0F0F23)
val SurfaceDark = Color(0xFF1A1A3E)

private val DarkColorScheme =
        darkColorScheme(
                primary = Purple80,
                onPrimary = Color.White,
                primaryContainer = Purple70,
                onPrimaryContainer = Color.White,
                secondary = PurpleTint,
                onSecondary = Color.White,
                secondaryContainer = Purple60,
                onSecondaryContainer = Color.White,
                tertiary = Pink,
                onTertiary = Color.White,
                error = Error,
                onError = Color.White,
                errorContainer = ErrorDark,
                onErrorContainer = Color.White,
                background = BackgroundDark,
                onBackground = Color.White,
                surface = SurfaceDark,
                onSurface = Color.White,
                surfaceVariant = PurpleDeep,
                onSurfaceVariant = Color.White.copy(alpha = 0.7f),
                outline = Color.White.copy(alpha = 0.2f),
                outlineVariant = Color.White.copy(alpha = 0.1f),
        )

@Composable
fun NoorWalletTheme(
        darkTheme: Boolean = true, // Always dark theme for glassmorphism
        content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = BackgroundDark.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
