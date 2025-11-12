package com.nor.wallet.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nor.wallet.ui.components.SecurityCard
import com.nor.wallet.ui.components.SettingsSection

/**
 * SecurityScreen - Security settings screen
 * Mirrors iOS SecurityView.swift functionality
 */
@Composable
fun SecurityScreen(
    onBack: () -> Unit,
    onNavigateToPinSetup: () -> Unit,
    onNavigateToSeedPhrase: () -> Unit,
    onNavigateToPrivateKey: () -> Unit,
    onNavigateToAutoLock: () -> Unit
) {
    var biometricEnabled by remember { mutableStateOf(false) }
    var pinEnabled by remember { mutableStateOf(false) }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF5B47ED),
                        Color(0xFF2D1B69),
                        Color(0xFF1A0F3D)
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = "Security",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Protect your wallet and funds",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.6f)
                    )
                }
            }
            
            // Content
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                // Authentication Section
                item {
                    SettingsSection(title = "Authentication") {
                        SecurityCard(
                            icon = "fingerprint",
                            title = "Biometric Authentication",
                            subtitle = if (biometricEnabled) "Enabled" else "Enable to unlock wallet",
                            onClick = { biometricEnabled = !biometricEnabled }
                        )
                        
                        SecurityCard(
                            icon = "lock",
                            title = "PIN",
                            subtitle = if (pinEnabled) "Enabled" else "Set up PIN",
                            onClick = onNavigateToPinSetup
                        )
                    }
                }
                
                // Backup Section
                item {
                    SettingsSection(title = "Backup") {
                        SecurityCard(
                            icon = "key",
                            title = "Seed Phrase",
                            subtitle = "View your recovery phrase",
                            onClick = onNavigateToSeedPhrase
                        )
                        
                        SecurityCard(
                            icon = "key.horizontal",
                            title = "Export Private Key",
                            subtitle = "View your private key",
                            onClick = onNavigateToPrivateKey
                        )
                    }
                }
                
                // Settings Section
                item {
                    SettingsSection(title = "Settings") {
                        SecurityCard(
                            icon = "lock.rotation",
                            title = "Auto Lock",
                            subtitle = "Configure auto-lock timer",
                            onClick = onNavigateToAutoLock
                        )
                    }
                }
            }
        }
    }
}

