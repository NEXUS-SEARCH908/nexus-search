import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { sanitizeAndIdentifyDomain } from '../../../lib/web3';

/**
 * Parses user agent profiles into primitive categories entirely server-side.
 * Eliminates the need for paid analytical lookup libraries.
 */
function determineDeviceType(userAgent: string | null): 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN' {
  if (!userAgent) return 'UNKNOWN';
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('playbook') || ua.includes('kindle')) {
    return 'TABLET';
  }
  if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android') || ua.includes('windows phone')) {
    return 'MOBILE';
  }
  if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('opera')) {
    return 'DESKTOP';
  }
  return 'UNKNOWN';
}

/**
 * Extracts geographical country metrics from standard free CDN proxy headers 
 * (Vercel, Cloudflare, Netlify metadata architectures)
 */
function extractCountryCode(request: NextRequest): string {
  const vercelGeo = request.headers.get('x-vercel-ip-country');
  if (vercelGeo && vercelGeo.length === 2) return vercelGeo.toUpperCase();

  const cfGeo = request.headers.get('cf-ipcountry');
  if (cfGeo && cfGeo.length === 2) return cfGeo.toUpperCase();

  return 'XX'; // Fallback flag representing unmappable or proxy location
}

/**
 * POST /api/telemetry
 * Security Audited high-performance ingest controller.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    
    // Explicit Payload Verification Bound
    if (!body || typeof body.searchQuery !== 'string') {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_PAYLOAD', errorMessage: 'Required string argument "searchQuery" missing.' },
        { status: 400 }
      );
    }

    // Clean inputs and enforce safe character storage limits
    const rawQuery = body.searchQuery.trim();
    if (rawQuery.length === 0 || rawQuery.length > 2000) {
      return NextResponse.json(
        { success: false, errorCode: 'MALFORMED_QUERY', errorMessage: 'Search query out of bounded safety parameters.' },
        { status: 400 }
      );
    }

    // Automatically determine if the search target was an engineered domain entity
    const domainProfile = sanitizeAndIdentifyDomain(rawQuery);
    
    const userAgent = request.headers.get('user-agent');
    const deviceType = determineDeviceType(userAgent);
    const countryCode = extractCountryCode(request);

    // Database transactional write sequence executed via single async non-blocking execution block
    const savedTelemetry = await db.anonymousTelemetry.create({
      data: {
        searchQueryQuery: rawQuery,
        isDomainTarget: domainProfile.isValid,
        deviceType: deviceType,
        countryCode: countryCode,
      },
      select: {
        id: true,
        timestamp: true
      }
    });

    return NextResponse.json({
      success: true,
      logId: savedTelemetry.id,
      recordedAt: savedTelemetry.timestamp
    }, { status: 201 });

  } catch (error) {
    // Graceful containment preventing server crashes from breaking the application lifecycle
    console.error('CRITICAL: Telemetry service engine encountered a system pipeline failure:', error);
    
    return NextResponse.json(
      { success: false, errorCode: 'INTERNAL_INGEST_ERROR', errorMessage: 'Telemetry write sequence failed internally.' },
      { status: 500 }
    );
  }
}

/**
 * Options preflight fallback layout handling configuration routes cleanly
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
    },
  });
}
