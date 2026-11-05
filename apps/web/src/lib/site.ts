export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codebridge.tarvix.org';

// Latest-release asset URLs are permanent: GitHub redirects them to the newest stable release,
// so a new release never needs a website change or redeploy. Asset names come from desktop-release.yml.
export const repoUrl = 'https://github.com/esmaeil-ahmadipour/codebridge';
export const releaseUrl = `${repoUrl}/releases/latest/download`;

export const downloads = {
  windows: `${releaseUrl}/codebridge-windows-x64.zip`,
  macos: `${releaseUrl}/codebridge-macos-arm64.zip`,
  linux: `${releaseUrl}/codebridge-linux-x64.zip`,
} as const;
