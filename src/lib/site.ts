export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codebridge.tarvix.org';

// Change this to the real repository once it exists.
export const repoUrl = 'https://github.com/esmaeil-ahmadipour/codebridge';
export const releaseUrl = `${repoUrl}/releases/latest/download`;

export const downloads = {
  windows: `${releaseUrl}/codebridge-windows-x64.exe`,
  macos: `${releaseUrl}/codebridge-macos-arm64`,
  linux: `${releaseUrl}/codebridge-linux-x64`,
} as const;
