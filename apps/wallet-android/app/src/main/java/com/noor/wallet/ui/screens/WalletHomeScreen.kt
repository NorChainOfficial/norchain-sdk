package com.noor.wallet.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.noor.wallet.ui.components.TokenIcon
import com.noor.wallet.viewmodels.WalletViewModel

/**
 * WalletHomeScreen - Main wallet screen
 * Mirrors iOS WalletHomeView.swift functionality
 */
@Composable
fun WalletHomeScreen(
    viewModel: WalletViewModel = viewModel(),
    onNavigateToSend: () -> Unit,
    onNavigateToReceive: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val wallet by viewModel.currentWallet.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    // Glassmorphism background
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
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Balance Card
            item {
                BalanceCard(
                    wallet = wallet,
                    isLoading = isLoading
                )
            }
            
            // Assets Section
            item {
                Text(
                    text = "Assets",
                    modifier = Modifier.padding(horizontal = 24.dp),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
            
            // Assets List
            wallet?.accounts?.firstOrNull()?.let { account ->
                // TODO: Fetch and display assets
                item {
                    AssetRow(
                        symbol = "ETH",
                        name = "Ethereum",
                        balance = "0.0",
                        usdValue = "$0.00"
                    )
                }
            }
        }
    }
}

@Composable
fun BalanceCard(
    wallet: com.noor.core.NoorCore.WalletInfo?,
    isLoading: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.1f)
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.15f),
                            Color.White.copy(alpha = 0.05f)
                        )
                    )
                )
                .padding(24.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Total Balance",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.6f)
                )
                
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Text(
                        text = "$0.00", // TODO: Calculate from assets
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                
                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ActionButton(
                        text = "Send",
                        modifier = Modifier.weight(1f),
                        onClick = { /* TODO */ }
                    )
                    ActionButton(
                        text = "Receive",
                        modifier = Modifier.weight(1f),
                        onClick = { /* TODO */ }
                    )
                    ActionButton(
                        text = "Swap",
                        modifier = Modifier.weight(1f),
                        onClick = { /* TODO */ }
                    )
                }
            }
        }
    }
}

@Composable
fun AssetRow(
    symbol: String,
    name: String,
    balance: String,
    usdValue: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 6.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.1f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                TokenIcon(symbol = symbol, size = 40)
                
                Column {
                    Text(
                        text = name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Semibold,
                        color = Color.White
                    )
                    Text(
                        text = balance,
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.6f)
                    )
                }
            }
            
            Text(
                text = usdValue,
                fontSize = 16.sp,
                fontWeight = FontWeight.Semibold,
                color = Color.White
            )
        }
    }
}

@Composable
fun ActionButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF8B5CF6)
        )
    ) {
        Text(
            text = text,
            fontSize = 14.sp,
            fontWeight = FontWeight.Semibold,
            color = Color.White
        )
    }
}

