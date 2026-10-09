/**
 * Core Type Definitions for NexusSearch System Infrastructure
 * Enforces strict runtime data boundaries across internal services.
 */

export type Web3ProviderType = 'ENS' | 'UNSTOPPABLE' | 'LENS' | 'SOLANA';

export interface Web3DomainPayload {
  id: string;
  domainName: string;
  provider: Web3ProviderType;
  resolvedHash: string;
  ownerAddress: string;
  verifiedByUser: boolean;
  indexedAt: Date;
  updatedAt: Date;
}

export interface IngestTelemetryPayload {
  searchQuery: string;
  isDomainTarget: boolean;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
  countryCode: string;
}

export interface RegisteredAdPayload {
  id: string;
  targetToken: string;
  bidAmount: string; // Transmitted via string to prevent floating-point mutations
  proxyUrl: string;
  headline: string;
  description: string;
  isActive: boolean;
}

export interface ErrorBoundaryResponse {
  success: false;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
}

export interface SearchResolutionResult {
  success: true;
  query: string;
  isDomain: boolean;
  resolutionType: Web3ProviderType | null;
  targetContentHash: string | null;
  executionTimeMs: number;
}
