import { Inter, JetBrains_Mono } from 'next/font/google';

const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', weight: ['400', '500', '600', '700'] });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains', weight: ['500'] });

export const fontVariables = `${sans.variable} ${mono.variable}`;
