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
 * SettingsScreen - App settings screen
 * Mirrors iOS SettingsView.swift functionality
 */
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onNavigateToSecurity: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToNetwork: () -> Unit,
    onNavigateToHelp: () -> Unit
) {
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
                        text = "Settings",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Manage your wallet preferences",
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
                // Security Section
                item {
                    SettingsSection(title = "Security") {
                        SecurityCard(
                            icon = "shield",
                            title = "Security",
                            subtitle = "Biometric, PIN, backup",
                            onClick = onNavigateToSecurity
                        )
                    }
                }
                
                // Preferences Section
                item {
                    SettingsSection(title = "Preferences") {
                        SecurityCard(
                            icon = "bell",
                            title = "Notifications",
                            subtitle = "Transaction and price alerts",
                            onClick = onNavigateToNotifications
                        )
                        
                        SecurityCard(
                            icon = "network",
                            title = "Network",
                            subtitle = "Switch blockchain networks",
                            onClick = onNavigateToNetwork
                        )
                    }
                }
                
                // Support Section
                item {
                    SettingsSection(title = "Support") {
                        SecurityCard(
                            icon = "questionmark.circle",
                            title = "Help & Support",
                            subtitle = "FAQ, contact, user guide",
                            onClick = onNavigateToHelp
                        )
                    }
                }
            }
        }
    }
}

