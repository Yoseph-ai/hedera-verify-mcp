import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { kv } from '@vercel/kv';

// Allow the frontend to call this API from different domains
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace '*' with 'https://proofmarks.cloud'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, email } = await req.json();

    if (!customerName || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Generate a secure, unique API key (e.g., pm_a1b2c3d4...)
    const rawKey = `pm_${crypto.randomBytes(24).toString('hex')}`;
    
    // 2. Define the free tier metadata
    const keyRecord = {
      customer: customerName,
      email: email,
      tier: 'free',
      quotaVerify: 1000,  // 1,000 free verifies per month
      quotaAnchor: 5,     // 5 free Mainnet anchors per month
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // 3. Save to Upstash
    await kv.set(`apikey:${rawKey}`, JSON.stringify(keyRecord));

    // 4. Return the raw key to the user ONCE
    return NextResponse.json(
      { 
        success: true, 
        apiKey: rawKey,
        message: 'Store this key securely. It will not be shown again.' 
      },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Key generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}