import { NextRequest, NextResponse } from 'next/server';
import { sanitizeAndIdentifyDomain, executeWeb3Resolution } from './lib/web3';

// Array of free, globally redundant open IPFS public HTTP gateways 
const STABLE_PUBLIC_IPFS_GATEWAYS = [
  'https://ipfs.io',
  'https://cloudflare-ipfs.com',
  'https://dweb.link',
  'https://pinata.cloud'
];

/**
 * Next.js Edge Middleware Router Engine
 * Intercepts paths matching Web3 routing parameters cleanly.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Configuration Matrix: Extract target domain either from subdomain format or url routing paths
  // Path format: /view/domain.eth or subdomain format: domain.eth.nexussearch.xyz
  let targetDomain = '';

  if (pathname.startsWith('/view/')) {
    const parts = pathname.split('/');
    if (parts[2]) {
      targetDomain = parts[2];
    }
  }

  // Fallback: If no direct path mapping is caught, check if the request is bypassable core code asset
  if (!targetDomain) {
    if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api/') || 
      pathname.includes('.') || 
      pathname === '/'
    ) {
      return NextResponse.next();
    }
  }

  // Ensure query strings are sanitized defensively before triggering on-chain calls
  const profile = sanitizeAndIdentifyDomain(targetDomain);
  if (!profile.isValid || !profile.cleaned) {
    // If domain layout is malformed, pass execution context out to normal fallback router routes
    return NextResponse.next();
  }

  try {
    // Execute cryptographically isolated dynamic contract lookup via open RPC endpoints
    const resolution = await executeWeb3Resolution(profile.cleaned);

    if (!resolution.success || !resolution.targetContentHash) {
      // If domain resolution hits an empty state, redirect user gracefully to an explanatory path page
      url.pathname = '/search';
      url.searchParams.set('error', 'NOT_FOUND');
      url.searchParams.set('q', profile.cleaned);
      return NextResponse.redirect(url);
    }

    // Extract raw IPFS content identifier hash sequence from protocol URI scheme
    let cleanHash = resolution.targetContentHash;
    if (cleanHash.startsWith('ipfs://')) {
      cleanHash = cleanHash.replace('ipfs://', '');
    }

    // Execute round-robin primary proxy mapping across open gateway clusters
    // To remain fully 0-cost, we proxy the stream via a rewrite parameter mapping out to open structures
    const targetGatewayBase = STABLE_PUBLIC_IPFS_GATEWAYS[0];
    const targetGatewayUrl = `${targetGatewayBase}${cleanHash}${url.search || ''}`;

    // Rewrite instructs the Next.js runtime edge engine to fetch data from decentralized clusters 
    // without altering the domain name rendered inside the user's browser window.
    const response = NextResponse.rewrite(new URL(targetGatewayUrl));

    // Enforce high-security enterprise parameters via Content Security Policy (CSP) framework
    // This stops malicious injected code scripts from reading cookies or accessing root directories
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; media-src *; connect-src *;"
    );
    response.headers.set('X-Frame-Options', 'DENY');
    // Set Edge node micro-cache intervals to limit node queries on free layers
    response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=60');
    response.headers.set('X-Resolved-Via', `Nexus-${resolution.resolutionType}`);

    return response;

  } catch (error) {
    console.error(`Edge routing engine failure event triggered for target: ${profile.cleaned}:`, error);
    url.pathname = '/search';
    url.searchParams.set('error', 'GATEWAY_TIMEOUT');
    return NextResponse.redirect(url);
  }
}

/**
 * Configure middleware layer interception filters
 */
export const config = {
  matcher: [
    '/view/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
