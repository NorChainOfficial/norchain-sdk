package com.noor.wallet.ui.screens.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import com.noor.wallet.viewmodels.WalletViewModel

/**
 * OnboardingScreen - Wallet creation/import screen
 * Mirrors iOS OnboardingView.swift functionality
 */
@Composable
fun OnboardingScreen(
    onWalletCreated: () -> Unit,
    onWalletImported: () -> Unit,
    viewModel: WalletViewModel = viewModel()
) {
    var showImportSheet by remember { mutableStateOf(false) }
    val isLoading by viewModel.isLoading.collectAsState()
    val wallet by viewModel.currentWallet.collectAsState()
    
    // Navigate when wallet is created
    LaunchedEffect(wallet) {
        wallet?.let {
            onWalletCreated()
        }
    }

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
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo/Icon
            Spacer(modifier = Modifier.height(80.dp))
            
            Text(
                text = "Noor Wallet",
                fontSize = 42.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Your secure crypto wallet",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.6f)
            )
            
            Spacer(modifier = Modifier.height(80.dp))
            
            // Action Buttons
            Button(
                onClick = {
                    viewModel.createWallet()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF8B5CF6)
                ),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Text(
                        text = "Create New Wallet",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Semibold,
                        color = Color.White
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedButton(
                onClick = { showImportSheet = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color.White
                ),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.3f),
                            Color.White.copy(alpha = 0.1f)
                        )
                    )
                )
            ) {
                Text(
                    text = "Import Wallet",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Semibold,
                    color = Color.White
                )
            }
        }
    }
    
    // Import Sheet
    if (showImportSheet) {
        ImportWalletSheet(
            onDismiss = { showImportSheet = false },
            onImport = { mnemonic ->
                viewModel.importWallet(mnemonic)
                showImportSheet = false
                onWalletImported()
            }
        )
    }
}

@Composable
fun ImportWalletSheet(
    onDismiss: () -> Unit,
    onImport: (String) -> Unit
) {
    var mnemonic by remember { mutableStateOf("") }
    
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF1A0F3D),
        sheetState = rememberModalBottomSheetState()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Import Wallet",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            OutlinedTextField(
                value = mnemonic,
                onValueChange = { mnemonic = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Mnemonic Phrase", color = Color.White.copy(alpha = 0.6f)) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF8B5CF6),
                    unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                ),
                minLines = 3,
                maxLines = 5
            )
            
            Button(
                onClick = {
                    if (mnemonic.isNotBlank()) {
                        onImport(mnemonic.trim())
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = mnemonic.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF8B5CF6)
                )
            ) {
                Text("Import", color = Color.White)
            }
        }
    }
}
