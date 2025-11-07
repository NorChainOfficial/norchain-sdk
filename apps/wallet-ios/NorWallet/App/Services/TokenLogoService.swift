import SwiftUI
import Foundation

/// Token Logo Service - Similar to MetaMask's approach
/// Supports multiple sources with hierarchical fallback:
/// 1. Local asset catalog
/// 2. Trust Wallet Assets (GitHub)
/// 3. CoinGecko API
/// 4. Generated monogram fallback
class TokenLogoService {
    static let shared = TokenLogoService()
    
    // Cache for loaded images
    private var imageCache: [String: UIImage] = [:]
    private let cacheQueue = DispatchQueue(label: "com.nor.wallet.tokenLogoCache", attributes: .concurrent)
    
    // Standard logo size (256x256 as per industry standard)
    static let standardLogoSize: Int = 256
    
    private init() {}
    
    // MARK: - Main Logo URL Generator
    
    /// Get logo URL for a token symbol
    /// - Parameters:
    ///   - symbol: Token symbol (e.g., "ETH", "BTC")
    ///   - contractAddress: Optional contract address for ERC-20 tokens
    ///   - chainId: Optional chain ID for multi-chain support
    /// - Returns: URL string for the logo
    func getLogoURL(symbol: String, contractAddress: String? = nil, chainId: Int? = nil) -> String? {
        let lowercaseSymbol = symbol.lowercased()
        
        // Priority 1: Trust Wallet Assets (most reliable, supports contract addresses)
        // Try common contract addresses first
        let contract = contractAddress ?? TokenLogoService.getCommonTokenContractAddress(symbol: lowercaseSymbol)
        if let contract = contract {
            // ERC-20 token with contract address
            return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/\(contract.lowercased())/logo.png"
        }
        
        // Priority 2: Trust Wallet native coins
        if let nativeCoinURL = getTrustWalletNativeCoinURL(symbol: lowercaseSymbol) {
            return nativeCoinURL
        }
        
        // Priority 3: CoinGecko API (for broader coverage)
        if let coinGeckoURL = getCoinGeckoLogoURL(symbol: lowercaseSymbol) {
            return coinGeckoURL
        }
        
        // Priority 4: SpotHQ Cryptocurrency Icons (7,500+ icons)
        return getAlternativeLogoURL(symbol: lowercaseSymbol)
    }
    
    // MARK: - Trust Wallet Assets (Primary Source)
    
    /// Get Trust Wallet URL for native coins
    private func getTrustWalletNativeCoinURL(symbol: String) -> String? {
        let nativeCoins: [String: String] = [
            "eth": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
            "btc": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
            "bnb": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png",
            "matic": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
            "polygon": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
            "avax": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
            "sol": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
            "solana": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
            "dot": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polkadot/info/logo.png",
            "polkadot": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polkadot/info/logo.png",
            "ada": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png",
            "cardano": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png",
            "xrp": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xrp/info/logo.png",
            "trx": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
            "tron": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
            "ltc": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png",
            "bch": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoincash/info/logo.png",
            "eos": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/eos/info/logo.png",
            "xlm": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/stellar/info/logo.png"
        ]
        
        return nativeCoins[symbol]
    }
    
    /// Get Trust Wallet URL for ERC-20 tokens by contract address
    func getTrustWalletERC20URL(contractAddress: String) -> String {
        return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/\(contractAddress.lowercased())/logo.png"
    }
    
    // MARK: - CoinGecko API (Secondary Source)
    
    /// Get CoinGecko logo URL
    private func getCoinGeckoLogoURL(symbol: String) -> String? {
        // CoinGecko uses coin IDs, not symbols. This is a simplified mapping.
        // For production, you'd want to use CoinGecko's API to get coin IDs dynamically
        let coinGeckoMap: [String: String] = [
            "eth": "ethereum",
            "btc": "bitcoin",
            "usdt": "tether",
            "usdc": "usd-coin",
            "dai": "dai",
            "bnb": "binancecoin",
            "matic": "matic-network",
            "polygon": "matic-network",
            "avax": "avalanche-2",
            "sol": "solana",
            "solana": "solana",
            "dot": "polkadot",
            "polkadot": "polkadot",
            "link": "chainlink",
            "chainlink": "chainlink",
            "ada": "cardano",
            "cardano": "cardano",
            "xrp": "ripple",
            "ripple": "ripple",
            "uni": "uniswap",
            "uniswap": "uniswap",
            "aave": "aave",
            "comp": "compound-governance-token",
            "compound": "compound-governance-token",
            "sushi": "sushi",
            "sushiswap": "sushi",
            "1inch": "1inch",
            "crv": "curve-dao-token",
            "curve": "curve-dao-token",
            "mkr": "maker",
            "maker": "maker"
        ]
        
        guard let coinId = coinGeckoMap[symbol] else { return nil }
        
        // CoinGecko CDN provides high-quality logos
        return "https://assets.coingecko.com/coins/images/\(getCoinGeckoImageId(for: coinId))/large/\(coinId).png"
    }
    
    /// Get CoinGecko image ID (simplified - in production use their API)
    private func getCoinGeckoImageId(for coinId: String) -> String {
        let idMap: [String: String] = [
            "ethereum": "279",
            "bitcoin": "1",
            "tether": "825",
            "usd-coin": "3408",
            "dai": "4943",
            "binancecoin": "1839",
            "matic-network": "4713",
            "avalanche-2": "5805",
            "solana": "4128",
            "polkadot": "6636",
            "chainlink": "1975",
            "cardano": "2010",
            "ripple": "52",
            "uniswap": "12504",
            "aave": "7278",
            "compound-governance-token": "5692",
            "sushi": "11976",
            "1inch": "8104",
            "curve-dao-token": "6538",
            "maker": "1518"
        ]
        return idMap[coinId] ?? "1"
    }
    
    // MARK: - Alternative Sources
    
    /// Get alternative logo URL (fallback)
    private func getAlternativeLogoURL(symbol: String) -> String? {
        // Priority: SpotHQ Cryptocurrency Icons (7,500+ icons, CC0 license)
        // Available sizes: 16, 32, 64, 128, 200, color, white, black
        // Using 200x200 for best quality
        let symbolUpper = symbol.uppercased()
        return "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/200/color/\(symbolUpper).png"
    }
    
    // MARK: - Network Logo Support
    
    /// Get network/blockchain logo URL
    func getNetworkLogoURL(chainName: String) -> String? {
        let chainLower = chainName.lowercased()
        let networkMap: [String: String] = [
            "ethereum": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
            "bitcoin": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
            "binance": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png",
            "polygon": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
            "avalanche": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
            "solana": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
            "polkadot": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polkadot/info/logo.png",
            "cardano": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png",
            "xrp": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xrp/info/logo.png",
            "tron": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
            "litecoin": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png",
            "nor": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" // Nor Chain uses Ethereum format
        ]
        return networkMap[chainLower]
    }
    
    // MARK: - Common ERC-20 Token Contract Addresses
    
    /// Get contract address for common ERC-20 tokens
    static func getCommonTokenContractAddress(symbol: String) -> String? {
        let contracts: [String: String] = [
            "usdt": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "usdc": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "dai": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            "link": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
            "wbtc": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "uni": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            "aave": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
            "comp": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
            "mkr": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
            "crv": "0xD533a949740bb3306d119CC777fa900bA034cd52",
            "sushi": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
            "1inch": "0x111111111117dC0aa78b770fA6A738034120C302"
        ]
        
        return contracts[symbol.lowercased()]
    }
    
    // MARK: - Image Caching
    
    /// Get cached image
    func getCachedImage(for key: String) -> UIImage? {
        return cacheQueue.sync {
            return imageCache[key]
        }
    }
    
    /// Cache image
    func cacheImage(_ image: UIImage, for key: String) {
        cacheQueue.async(flags: .barrier) {
            self.imageCache[key] = image
        }
    }
    
    /// Clear cache
    func clearCache() {
        cacheQueue.async(flags: .barrier) {
            self.imageCache.removeAll()
        }
    }
}

