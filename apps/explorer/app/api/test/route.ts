import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Test 1: Basic response
    console.log('[TEST] API route hit');

    // Test 2: Import ethers
    let ethersVersion = 'not imported';
    try {
      const ethers = await import('ethers');
      ethersVersion = ethers.version || 'unknown';
      console.log('[TEST] ethers imported successfully:', ethersVersion);
    } catch (importError) {
      console.error('[TEST] ethers import failed:', importError);
      return NextResponse.json({
        success: false,
        error: 'ethers import failed',
        details: importError instanceof Error ? importError.message : String(importError),
      });
    }

    // Test 3: Connect to RPC
    let blockNumber = null;
    let rpcError = null;
    try {
      const { JsonRpcProvider } = await import('ethers');
      const provider = new JsonRpcProvider('https://rpc.bitcoinbr.tech');
      blockNumber = await provider.getBlockNumber();
      console.log('[TEST] RPC connected, block:', blockNumber);
    } catch (rpcErr) {
      console.error('[TEST] RPC connection failed:', rpcErr);
      rpcError = rpcErr instanceof Error ? rpcErr.message : String(rpcErr);
    }

    return NextResponse.json({
      success: true,
      ethersVersion,
      blockNumber,
      rpcError,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[TEST] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test API failed',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
