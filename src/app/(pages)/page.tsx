import { HomeClient } from './HomeClient';

// Cold start: the entry route (PWA start_url) is fully static, served from the
// Netlify CDN with no serverless boot nor Prisma connection — instant first byte.
// This removes the ~11s black screen on the first morning launch of the iOS
// standalone PWA, where the service worker does not yet control the first
// navigation. User and data (exercices, history) load client-side via React
// Query (HomeClient). See memory: cold-start-static-entry — do not reintroduce
// cookies()/DB here, it would make `/` dynamic again.
export const dynamic = 'force-static';

export default function HomePage() {
  return <HomeClient />;
}
