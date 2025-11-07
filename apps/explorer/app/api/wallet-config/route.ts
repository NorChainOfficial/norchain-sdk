import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the wallet config file
    const configPath = path.join(process.cwd(), 'public', 'wallet-config.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configFile);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading wallet config:', error);
    return NextResponse.json(
      { error: 'Failed to load wallet configuration' },
      { status: 500 }
    );
  }
}