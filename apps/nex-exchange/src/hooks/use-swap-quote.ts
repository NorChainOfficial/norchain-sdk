import { useQuery } from "@tanstack/react-query";
import { getSwapQuote } from "@/lib/api-client";
import type { Token, SwapQuote } from "@/types/token";

interface UseSwapQuoteParams {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
}

export function useSwapQuote({ tokenIn, tokenOut, amountIn }: UseSwapQuoteParams) {
  return useQuery<SwapQuote>({
    queryKey: ["swapQuote", tokenIn?.address, tokenOut?.address, amountIn],
    queryFn: async () => {
      if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
        throw new Error("Invalid swap parameters");
      }

      return getSwapQuote({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn,
        chainId: tokenIn.chainId,
      });
    },
    enabled: !!tokenIn && !!tokenOut && !!amountIn && parseFloat(amountIn) > 0,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
  });
}
