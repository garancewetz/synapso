import { NextResponse } from 'next/server';

/**
 * Route API pour obtenir des informations sur la base de données en développement
 * Ne retourne que des informations non sensibles
 */
export async function GET() {
  // Vérifier que nous sommes en développement
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'dev') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev';
  const hasDevDb = !!process.env.DATABASE_URL_DEV;
  const dbType = hasDevDb ? 'DEV' : 'PROD';

  // Extraire juste le host de l'URL pour l'affichage (sans credentials)
  const dbUrl = hasDevDb ? process.env.DATABASE_URL_DEV : process.env.DATABASE_URL;
  let dbHost = 'unknown';
  
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      // Extraire juste le hostname (ex: ep-mute-shadow-ah128gam-pooler.c-3.us-east-1.aws.neon.tech)
      dbHost = url.hostname;
      // Si c'est Neon, extraire juste la partie identifiable
      if (dbHost.includes('neon.tech')) {
        const parts = dbHost.split('.');
        dbHost = parts[0] + '...neon.tech';
      } else if (dbHost.includes('localhost')) {
        dbHost = 'localhost';
      }
    } catch {
      // Si l'URL n'est pas valide, utiliser 'unknown'
      dbHost = 'unknown';
    }
  }

  return NextResponse.json({
    dbType,
    dbHost,
    isDev,
    hasDevDb,
  });
}

