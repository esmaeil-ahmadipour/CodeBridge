export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codebridge.tarvix.org';

// Latest-release asset URLs are permanent: GitHub redirects them to the newest stable release,
// so a new release never needs a website change or redeploy. Asset names come from desktop-release.yml.
export const repoUrl = 'https://github.com/esmaeil-ahmadipour/codebridge';
export const releasesUrl = `${repoUrl}/releases`;
export const releaseUrl = `${releasesUrl}/latest/download`;
// Only used to show the version/date; downloads never depend on it.
export const latestReleaseApi = 'https://api.github.com/repos/esmaeil-ahmadipour/codebridge/releases/latest';

export type PlatformId = 'windows' | 'macos' | 'linux';

// Order = display order. `asset` must match the ZIP names produced by desktop-release.yml.
export const platforms = [
  { id: 'windows', asset: 'codebridge-windows-x64.zip', arch: 'x64', format: 'ZIP' },
  { id: 'macos', asset: 'codebridge-macos-arm64.zip', arch: 'ARM64', format: 'ZIP' },
  { id: 'linux', asset: 'codebridge-linux-x64.zip', arch: 'x64', format: 'ZIP' },
] as const;

export const downloads = {
  windows: `${releaseUrl}/${platforms[0].asset}`,
  macos: `${releaseUrl}/${platforms[1].asset}`,
  linux: `${releaseUrl}/${platforms[2].asset}`,
} as const satisfies Record<PlatformId, string>;
