import localFont from "next/font/local";

export const inter = localFont({
  src: "../../public/fonts/inter-variable.woff",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

// Combined CSS variables for the application layout.
export const fontVariables = [inter.variable].filter(Boolean).join(' ');
