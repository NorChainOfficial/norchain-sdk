#ifndef NOOR_CORE_FFI_H
#define NOOR_CORE_FFI_H

#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

#ifdef __cplusplus
namespace noor_core {
#endif  // __cplusplus

#define noor_NOOR_CHAIN_ID 7860

#define noor_NOOR_CHAIN_DECIMALS 18

#define noor_DEFAULT_GAS_LIMIT 21000

/**
 * C-compatible string structure
 */
typedef struct noor_NoorString {
  char *ptr;
  uintptr_t len;
} noor_NoorString;

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

/**
 * Create a new wallet with random entropy
 * Returns a JSON string containing wallet data
 */
struct noor_NoorString noor_wallet_create(void);

/**
 * Import wallet from mnemonic phrase
 * Returns a JSON string containing wallet data
 */
struct noor_NoorString noor_wallet_from_mnemonic(const char *mnemonic);

/**
 * Import wallet from private key
 * Returns a JSON string containing wallet data
 */
struct noor_NoorString noor_wallet_from_private_key(const char *private_key);

/**
 * Get Noor Chain RPC URL
 */
struct noor_NoorString noor_get_chain_rpc(void);

/**
 * Get Noor Chain ID
 */
uint64_t noor_get_chain_id(void);

/**
 * Free a NoorString allocated by Rust
 */
void noor_string_free(struct noor_NoorString s);

/**
 * Initialize logger with specified level
 * level: 0=Trace, 1=Debug, 2=Info, 3=Warn, 4=Error
 */
void noor_init_logger(uint8_t level);

const char *noor_string_get_ptr(const struct noor_NoorString *s);

const char *noor_string_get_c_string(char *ptr);

/**
 * Sign an EVM transaction
 * Returns a signed transaction hex string
 */
struct noor_NoorString noor_sign_transaction(const char *from_address,
                                             const char *to_address,
                                             const char *value,
                                             const char *data,
                                             uint64_t gas_limit,
                                             const char *gas_price,
                                             uint64_t nonce,
                                             uint64_t chain_id);

/**
 * Get balance for an address via RPC
 */
struct noor_NoorString noor_get_balance(const char *address, const char *rpc_url);

#ifdef __cplusplus
}  // extern "C"
#endif  // __cplusplus

#ifdef __cplusplus
}  // namespace noor_core
#endif  // __cplusplus

#endif  /* NOOR_CORE_FFI_H */
