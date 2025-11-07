import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the token list file
    const tokenListPath = path.join(process.cwd(), 'public', 'tokenlist.json');
    const tokenListFile = fs.readFileSync(tokenListPath, 'utf8');
    const tokenList = JSON.parse(tokenListFile);
    
    return NextResponse.json(tokenList);
  } catch (error) {
    console.error('Error reading token list:', error);
    return NextResponse.json(
      { error: 'Failed to load token list' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-static';