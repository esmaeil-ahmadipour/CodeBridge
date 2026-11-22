import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'CodeBridge',
    short_name: 'CodeBridge',
    description: 'Turn a project ZIP into AI-ready text, privately, in your browser.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0E1116',
    theme_color: '#0E1116',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
