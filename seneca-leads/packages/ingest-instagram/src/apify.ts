import { ApifyClient } from 'apify-client';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'apify-instagram' });

export const INSTAGRAM_PROFILE_ACTOR = 'apify/instagram-profile-scraper';

export interface IgPost {
  type?: string;
  shortCode?: string;
  caption?: string;
  hashtags?: string[];
  url?: string;
  commentsCount?: number;
  likesCount?: number;
  timestamp?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
}

export interface IgProfile {
  username: string;
  fullName?: string;
  biography?: string;
  externalUrl?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  profilePicUrl?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
  businessCategoryName?: string;
  joinedRecently?: boolean;
  latestPosts?: IgPost[];
}

export interface InstagramFetchResult {
  username: string;
  profile: IgProfile | null;
  raw: unknown;
  error?: string;
}

export async function fetchInstagramProfiles(input: {
  apifyToken: string;
  usernames: string[];
}): Promise<InstagramFetchResult[]> {
  if (input.usernames.length === 0) return [];

  const client = new ApifyClient({ token: input.apifyToken });

  log.info({ count: input.usernames.length, actor: INSTAGRAM_PROFILE_ACTOR }, 'starting Apify run');

  // Apify's instagram-profile-scraper expects directUrls or usernames.
  // Using usernames is simpler.
  const run = await client.actor(INSTAGRAM_PROFILE_ACTOR).call({
    usernames: input.usernames,
    resultsLimit: 12, // last 12 posts as per spec
    addParentData: false,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  log.info({ items: items.length, runId: run.id }, 'Apify run finished');

  return items.map((raw) => normalizeApifyItem(raw, input.usernames));
}

function normalizeApifyItem(raw: unknown, requested: string[]): InstagramFetchResult {
  if (!raw || typeof raw !== 'object') {
    return { username: '?', profile: null, raw, error: 'non-object item' };
  }
  const obj = raw as Record<string, unknown>;
  const username =
    (typeof obj.username === 'string' ? obj.username : null) ??
    (typeof obj.ownerUsername === 'string' ? obj.ownerUsername : null) ??
    requested[0] ??
    '?';

  if (obj.error || obj.errorDescription) {
    return {
      username,
      profile: null,
      raw,
      error: String(obj.error ?? obj.errorDescription ?? 'unknown'),
    };
  }

  const profile: IgProfile = {
    username,
    fullName: stringOrUndefined(obj.fullName),
    biography: stringOrUndefined(obj.biography),
    externalUrl: stringOrUndefined(obj.externalUrl),
    followersCount: numberOrUndefined(obj.followersCount),
    followsCount: numberOrUndefined(obj.followsCount),
    postsCount: numberOrUndefined(obj.postsCount),
    profilePicUrl: stringOrUndefined(obj.profilePicUrl),
    isPrivate: typeof obj.private === 'boolean' ? obj.private : undefined,
    isVerified: typeof obj.verified === 'boolean' ? obj.verified : undefined,
    businessCategoryName: stringOrUndefined(obj.businessCategoryName),
    joinedRecently: typeof obj.joinedRecently === 'boolean' ? obj.joinedRecently : undefined,
    latestPosts: Array.isArray(obj.latestPosts)
      ? (obj.latestPosts as IgPost[]).slice(0, 12)
      : undefined,
  };

  return { username, profile, raw };
}

function stringOrUndefined(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function numberOrUndefined(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

export function computeEngagementRate(profile: IgProfile): number | null {
  const posts = profile.latestPosts ?? [];
  const followers = profile.followersCount ?? 0;
  if (followers <= 0 || posts.length === 0) return null;

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recent = posts.filter((p) => {
    if (!p.timestamp) return true; // keep undated posts
    const t = Date.parse(p.timestamp);
    return isNaN(t) ? true : t >= ninetyDaysAgo;
  });
  if (recent.length === 0) return null;

  const ratios = recent.map(
    (p) => ((p.likesCount ?? 0) + (p.commentsCount ?? 0)) / followers,
  );
  const sum = ratios.reduce((a, b) => a + b, 0);
  return sum / ratios.length;
}
