package com.noor.wallet.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.noor.wallet.ui.screens.WalletHomeScreen
import com.noor.wallet.ui.screens.SecurityScreen
import com.noor.wallet.ui.screens.SettingsScreen
import com.noor.wallet.ui.screens.onboarding.OnboardingScreen

/**
 * Navigation routes - matches iOS navigation structure
 */
object Routes {
    const val ONBOARDING = "onboarding"
    const val WALLET_HOME = "wallet_home"
    const val SECURITY = "security"
    const val SETTINGS = "settings"
}

@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController(),
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Routes.ONBOARDING,
        modifier = modifier
    ) {
        composable(Routes.ONBOARDING) {
            OnboardingScreen(
                onWalletCreated = {
                    navController.navigate(Routes.WALLET_HOME) {
                        popUpTo(Routes.ONBOARDING) { inclusive = true }
                    }
                },
                onWalletImported = {
                    navController.navigate(Routes.WALLET_HOME) {
                        popUpTo(Routes.ONBOARDING) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.WALLET_HOME) {
            WalletHomeScreen(
                onNavigateToSend = {
                    // TODO: Navigate to send screen
                },
                onNavigateToReceive = {
                    // TODO: Navigate to receive screen
                },
                onNavigateToSettings = {
                    navController.navigate(Routes.SETTINGS)
                }
            )
        }

        composable(Routes.SETTINGS) {
            SettingsScreen(
                onBack = { navController.popBackStack() },
                onNavigateToSecurity = {
                    navController.navigate(Routes.SECURITY)
                },
                onNavigateToNotifications = {
                    // TODO: Navigate to notifications
                },
                onNavigateToNetwork = {
                    // TODO: Navigate to network
                },
                onNavigateToHelp = {
                    // TODO: Navigate to help
                }
            )
        }

        composable(Routes.SECURITY) {
            SecurityScreen(
                onBack = { navController.popBackStack() },
                onNavigateToPinSetup = {
                    // TODO: Navigate to PIN setup
                },
                onNavigateToSeedPhrase = {
                    // TODO: Navigate to seed phrase
                },
                onNavigateToPrivateKey = {
                    // TODO: Navigate to private key
                },
                onNavigateToAutoLock = {
                    // TODO: Navigate to auto lock
                }
            )
        }
    }
}
