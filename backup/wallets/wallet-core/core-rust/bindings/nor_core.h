#ifndef NOR_CORE_FFI_H
#define NOR_CORE_FFI_H

#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

#ifdef __cplusplus
namespace nor_core {
#endif  // __cplusplus

#define nor_NOR_CHAIN_ID 65001

#define nor_NOR_CHAIN_DECIMALS 18

#define nor_DEFAULT_GAS_LIMIT 21000

/**
 * C-compatible string structure
 */
typedef struct nor_NorString {
  char *ptr;
  uintptr_t len;
} nor_NorString;

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

/**
 * Create a new wallet with random entropy
 * Returns a JSON string containing wallet data
 */
struct nor_NorString nor_wallet_create(void);

/**
 * Import wallet from mnemonic phrase
 * Returns a JSON string containing wallet data
 */
struct nor_NorString nor_wallet_from_mnemonic(const char *mnemonic);

/**
 * Import wallet from private key
 * Returns a JSON string containing wallet data
 */
struct nor_NorString nor_wallet_from_private_key(const char *private_key);

/**
 * Get Nor Chain RPC URL
 */
struct nor_NorString nor_get_chain_rpc(void);

/**
 * Get Nor Chain ID
 */
uint64_t nor_get_chain_id(void);

/**
 * Free a NorString allocated by Rust
 */
void nor_string_free(struct nor_NorString s);

/**
 * Initialize logger with specified level
 * level: 0=Trace, 1=Debug, 2=Info, 3=Warn, 4=Error
 */
void nor_init_logger(uint8_t level);

const char *nor_string_get_ptr(const struct nor_NorString *s);

const char *nor_string_get_c_string(char *ptr);

/**
 * Sign an EVM transaction
 * Returns a signed transaction hex string
 */
struct nor_NorString nor_sign_transaction(const char *from_address,
                                          const char *to_address,
                                          const char *value,
                                          const char *data,
                                          uint64_t gas_limit,
                                          const char *gas_price,
                                          uint64_t nonce,
                                          uint64_t chain_id);

/**
 * Get mnemonic for a wallet by ID
 * Returns the mnemonic phrase as a string
 */
struct nor_NorString nor_wallet_get_mnemonic(const char *wallet_id);

/**
 * Get balance for an address via RPC
 */
struct nor_NorString nor_get_balance(const char *address, const char *rpc_url);

#ifdef __cplusplus
}  // extern "C"
#endif  // __cplusplus

#ifdef __cplusplus
}  // namespace nor_core
#endif  // __cplusplus

#endif  /* NOR_CORE_FFI_H */
