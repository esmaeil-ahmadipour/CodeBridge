export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codebridge.tarvix.org';

// Latest-release asset URLs are permanent; keep the repository and published filenames together.
export const downloadConfig = {
  owner: 'esmaeil-ahmadipour',
  repository: 'CodeBridge',
  assets: {
    windows: 'codebridge-windows-x64.zip',
    macos: 'codebridge-macos-arm64.zip',
    linux: 'codebridge-linux-x64.zip',
  },
} as const;

export const repoUrl = `https://github.com/${downloadConfig.owner}/${downloadConfig.repository}`;
export const releasesUrl = `${repoUrl}/releases`;
export const latestReleaseUrl = `${releasesUrl}/latest`;
export const releaseUrl = `${latestReleaseUrl}/download`;
// Used for release publication metadata; the application version comes from the root package at build time.
export const latestReleaseApi = `https://api.github.com/repos/${downloadConfig.owner}/${downloadConfig.repository}/releases/latest`;

export function getApplicationVersion(): string {
  const version = process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION;
  if (!version) throw new Error('The root application version was not injected into the web build.');
  return version;
}

export type PlatformId = 'windows' | 'macos' | 'linux';

// Order = display order. `asset` must match the ZIP names produced by desktop-release.yml.
export const platforms = [
  { id: 'windows', asset: downloadConfig.assets.windows, arch: 'x64', format: 'ZIP' },
  { id: 'macos', asset: downloadConfig.assets.macos, arch: 'ARM64', format: 'ZIP' },
  { id: 'linux', asset: downloadConfig.assets.linux, arch: 'x64', format: 'ZIP' },
] as const;

export const downloads = {
  windows: `${releaseUrl}/${platforms[0].asset}`,
  macos: `${releaseUrl}/${platforms[1].asset}`,
  linux: `${releaseUrl}/${platforms[2].asset}`,
} as const satisfies Record<PlatformId, string>;
