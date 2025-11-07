package com.noor.wallet

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.noor.core.NoorCore
import com.noor.wallet.ui.navigation.AppNavigation

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Noor Core
        NoorCore.initLogger(NoorCore.LogLevel.INFO)
        
        // Initialize Supabase (happens automatically via SupabaseService.getInstance())

        setContent {
            NoorWalletTheme {
                Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                ) { 
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
fun NoorWalletTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = lightColorScheme(), content = content)
}

@Composable
fun WalletScreen() {
    var wallet by remember { mutableStateOf<NoorCore.WalletInfo?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val chainInfo = remember { WalletService.getChainInfo() }

    Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(text = "Noor Wallet", style = MaterialTheme.typography.headlineLarge)

        Text(text = "Chain: ${chainInfo.name}", style = MaterialTheme.typography.titleMedium)

        Text(
                text = "RPC: ${chainInfo.rpcUrl}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Divider(modifier = Modifier.padding(vertical = 8.dp))

        if (wallet != null) {
            WalletCard(wallet = wallet!!)
        } else {
            WalletSetup(
                    onCreateWallet = {
                        try {
                            wallet = WalletService.createWallet()
                            error = null
                        } catch (e: Exception) {
                            error = e.message
                        }
                    },
                    error = error
            )
        }
    }
}

@Composable
fun WalletSetup(onCreateWallet: () -> Unit, error: String?) {
    Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Button(onClick = onCreateWallet, modifier = Modifier.fillMaxWidth()) {
            Text("Create New Wallet")
        }

        OutlinedButton(onClick = { /* Import wallet */}, modifier = Modifier.fillMaxWidth()) {
            Text("Import Wallet")
        }

        error?.let {
            Text(
                    text = it,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun WalletCard(wallet: NoorCore.WalletInfo) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                    text = "Wallet ID:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(text = wallet.id, style = MaterialTheme.typography.bodySmall)

            wallet.accounts.firstOrNull()?.let { account ->
                Spacer(modifier = Modifier.height(8.dp))

                Text(
                        text = "Address:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(text = account.address, style = MaterialTheme.typography.bodySmall)

                Text(
                        text = "Chain: ${account.chainType}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
