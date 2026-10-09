import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

/**
 * Normalizes input text strings to prevent SQL injections 
 * and ensure structural keyword matching parity.
 */
function normalizeKeyword(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Strips out special characters safely
    .replace(/\s+/g, ' ');    // Minimizes white space intervals
}

/**
 * GET /api/ads
 * Process contextual keyword query structures and serve matching premium bids.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawQuery = searchParams.get('q');

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, errorCode: 'MISSING_QUERY', errorMessage: 'Required search parameter "q" is blank.' },
        { status: 400 }
      );
    }

    const cleanKeyword = normalizeKeyword(rawQuery);
    
    if (cleanKeyword.length === 0 || cleanKeyword.length > 255) {
      return NextResponse.json({ success: true, matches: [] }, { status: 200 });
    }

    // Split search input into tokens to support flexible partial-match lookup sequences
    const keywordTokens = cleanKeyword.split(' ');

    // Query database using strict type validations and index vectors defined in Chunk 1
    const matchingAds = await db.searchAdAuction.findMany({
      where: {
        isActive: true,
        OR: keywordTokens.map(token => ({
          targetToken: {
            contains: token
          }
        }))
      },
      orderBy: {
        bidAmount: 'desc' // Maximize revenue by instantly presenting the top bid priority first
      },
      take: 2, // Limit inline ads to a maximum of 2 records to keep UX clean exactly like Google
      select: {
        id: true,
        proxyUrl: true,
        headline: true,
        description: true,
        bidAmount: true
      }
    });

    // Map database Decimals into safe transportable JSON string interfaces
    const formattedMatches = matchingAds.map(ad => ({
      id: ad.id,
      proxyUrl: ad.proxyUrl,
      headline: ad.headline,
      description: ad.description,
      // Pass bidAmount as string to guarantee floating-point calculation safety across systems
      bidAmount: ad.bidAmount.toString() 
    }));

    // Cache the contextual response at the Edge to reduce active server loads on free database plans
    const response = NextResponse.json({
      success: true,
      matches: formattedMatches
    }, { status: 200 });

    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    return response;

  } catch (error) {
    console.error('CRITICAL: Ad auction engine encountered an operations matching failure:', error);
    return NextResponse.json(
      { success: false, errorCode: 'AUCTION_PROCESSING_FAILURE', errorMessage: 'Failed to process ad auction data context.' },
      { status: 500 }
    );
  }
}
