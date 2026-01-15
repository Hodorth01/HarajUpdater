import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 1. Basic Metadata
  title: "حراج برو | أداة تحديث إعلانات حراج تلقائياً - Haraj Pro",
  description: "حراج برو هو النظام الأكثر تقدماً لتحديث إعلاناتك على منصة حراج تلقائياً لضمان بقاء إعلاناتك في المقدمة وزيادة مبيعاتك بكل سهولة وأمان.",
  keywords: ["حراج", "بوت حراج", "تحديث تلقائي", "حراج برو", "تسويق حراج", "أتمتة"],
  authors: [{ name: "Thamer Alshehri" }],
  metadataBase: new URL("https://harajpro.netlify.app"),

  // 2. High-Resolution Icon Stack
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" }, // Keep your SVG for perfect browser tab sharpness
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // 3. Web Manifest (Android support)
  manifest: "/site.webmanifest",

  // 4. Open Graph (Using your high-res icon.png)
  openGraph: {
    title: "حراج برو - الحل الذكي لإدارة إعلانات حراج",
    description: "استخدم حراج برو لضمان ظهور إعلاناتك في مقدمة الأقسام يومياً. أداة احترافية وآمنة لزيادة وصولك للمشترين.",
    url: "https://harajpro.netlify.app",
    siteName: "Haraj Pro",
    images: [
      {
        url: "/icon.png", 
        width: 1200, 
        height: 630, 
        alt: "Haraj Pro Robot Logo",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },

  // 5. Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "حراج برو | تحديث تلقائي لإعلانات حراج",
    description: "النظام الأفضل لأتمتة تحديث الإعلانات اليومي على موقع حراج لزيادة المشاهدات.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Haraj Pro",
              "operatingSystem": "Web",
              "applicationCategory": "BusinessApplication",
              "description": "Automated listing updater for Haraj.com.sa",
              "url": "https://harajpro.netlify.app",
              "author": {
                "@type": "Person",
                "name": "Thamer Alshehri"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}