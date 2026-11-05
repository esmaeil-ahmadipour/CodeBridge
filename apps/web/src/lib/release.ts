import type { Locale } from '@/i18n/config';
import { latestReleaseApi, releasesUrl } from './site.ts';

export interface ReleaseInfo { version: string; publishedAt: string | null; url: string }

/** Validates a GitHub "latest release" payload; returns null for anything unexpected. */
export function parseRelease(data: unknown): ReleaseInfo | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  if (r.draft === true || r.prerelease === true) return null;
  const tag = typeof r.tag_name === 'string' ? r.tag_name.trim() : '';
  if (!tag || tag.length > 64) return null;
  const html = typeof r.html_url === 'string' && r.html_url.startsWith(`${releasesUrl}/`) ? r.html_url : releasesUrl;
  const published = typeof r.published_at === 'string' && !Number.isNaN(Date.parse(r.published_at)) ? r.published_at : null;
  return { version: tag, publishedAt: published, url: html };
}

/**
 * Server-side only (the CSP blocks browser requests to other origins). Cached for an hour by Next,
 * so visitors never hit the GitHub API. Any failure (rate limit, 404, timeout, bad JSON) yields null.
 */
export async function getLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'codebridge-site',
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(latestReleaseApi, { headers, signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) return null;
    return parseRelease(await res.json());
  } catch {
    return null;
  }
}

const dateLocale: Record<Locale, string> = { en: 'en-US', fa: 'fa-IR', ar: 'ar' };

export function formatReleaseDate(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(dateLocale[locale], { dateStyle: 'medium', timeZone: 'UTC' }).format(d);
}
