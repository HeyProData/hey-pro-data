import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "@/components/Providers";
import ScrollHandler from "@/components/ScrollHandler";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Hey Pro Data",
  description: "A Creative Industry Marketplace Platform",
  keywords:
    "Hey Pro Data, creative marketplace, film industry jobs, media professionals, hire creatives, production gigs, freelance filmmakers, creative collaboration, entertainment industry network, project hiring platform",
  robots: { index: true, follow: true },
  authors: [{ name: "Hey Pro Data", url: "https://heyprodata.com" }],
  creator: "Hey Pro Data",
  publisher: "Hey Pro Data",
  icons: {
    icon: [
      "/favicon.ico",
      "/logo.png",
      "/apple-icon.png",
      "icon0.svg",
      "icon1.png",
      "/logo/favicon.svg",
      "/logo/web-app-manifest-192x192.png",
      "/logo/web-app-manifest-461x161.png",
      "/logo/web-app-manifest-512x512.png",
    ],
  },
  metadataBase: new URL("https://heyprodata.com"),
  openGraph: {
    title: "Hey Pro Data",
    description: "A Creative Industry Marketplace Platform",
    type: "website",
    emails: "support@heyprodata.com",
    countryName: "UAE",
    url: "https://heyprodata.com",
    siteName: "Hey Pro Data",
    images: ["/favicon.ico", "logo.png"],
    locale: "en-UAE",
  },
  // Moved mobile-web-app meta tags here for server compatibility
  appleWebApp: {
    title: "Eazika",
    capable: true,
    statusBarStyle: "default",
  },
  manifest: "/manifest.json",
};

function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const getAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;

  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${getAnalyticsId}`}
        />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${getAnalyticsId}');
          `}
        </Script>
      </head>

      <body className={`${poppins.variable} font-poppins bg-white text-black`}>
        {/* This component handles the body class modification safely on the client */}
        <ScrollHandler />

        <Providers>
          <div className="">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
export default RootLayout;