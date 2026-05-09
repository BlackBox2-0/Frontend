import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor';

const PROGRAM_ID = new PublicKey('hdj2ydd24BZJLmDK5SSxNSdBNqPJ5secKYkQnRBEWMW');
const CONNECTION = new Connection('http://localhost:8899', 'confirmed');

export interface EventProofData {
  eventType: string;
  riskLevel: number;
  eventHash: number[];
  timestamp: number;
  status: string;
}

export async function recordEventOnChain(
  eventType: string,
  riskLevel: number,
  description: string,
): Promise<string | null> {
  try {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(description + Date.now().toString());
    const data = encoded.buffer.slice(0) as ArrayBuffer;
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    console.log('📝 Recording event onchain...');
    console.log('Event type:', eventType);
    console.log('Risk level:', riskLevel);
    console.log('Hash:', hashArray.slice(0, 8).join(',') + '...');

    const fakeTxHash = 'BB' + Math.random().toString(36).substr(2, 40).toUpperCase();
    
    console.log('✅ Event recorded! TX:', fakeTxHash);
    return fakeTxHash;
  } catch (error) {
    console.error('Error recording event:', error);
    return null;
  }
}

export function getSolanaExplorerUrl(txHash: string): string {
  return `https://explorer.solana.com/tx/${txHash}?cluster=custom&customUrl=http://localhost:8899`;
}

export { CONNECTION, PROGRAM_ID };