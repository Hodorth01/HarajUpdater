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
  // 1. Basic Metadata (Optimized for Arabic SEO)
  title: "حراج برو | أداة تحديث إعلانات حراج تلقائياً - Haraj Pro",
  description: "حراج برو هو النظام الأكثر تقدماً لتحديث إعلاناتك على منصة حراج تلقائياً. صمم خصيصاً لمساعدتك في البقاء دائماً في مقدمة نتائج البحث وزيادة مبيعاتك بكل سهولة وأمان.",
  keywords: ["حراج", "بوت حراج", "تحديث تلقائي", "حراج برو", "تسويق حراج", "أتمتة"],
  authors: [{ name: "Thamer Alshehri" }],
  metadataBase: new URL("https://harajpro.netlify.app"),

  // 2. High-Resolution Icon Stack
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" }, // Perfect sharpness for browser tabs
      { url: "/favicon.ico", sizes: "any" }, // Compatibility fallback
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // 3. Web Manifest (Android home screen support)
  manifest: "/site.webmanifest",

  // 4. Open Graph (Social Sharing with High-Res SVG Wrapper)
  openGraph: {
    title: "حراج برو - الحل الذكي لإدارة إعلانات حراج",
    description: "استخدم حراج برو لضمان ظهور إعلاناتك في مقدمة الأقسام يومياً. أداة احترافية، آمنة، وسهلة الاستخدام لزيادة وصولك للمشترين.",
    url: "https://harajpro.netlify.app",
    siteName: "Haraj Pro",
    images: [
      {
        // Renders your Lucide SVG as a sharp 1200x630 image to prevent pixelation
        url: "https://og-image.vercel.app/%23%20Haraj%20Pro.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fraw.githubusercontent.com%2Flucide-icons%2Flucide%2Fmain%2Ficons%2Fbot.svg",
        width: 1200,
        height: 630,
        alt: "Haraj Pro Automation",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },

  // 5. Twitter Card (Large Format for SVG source)
  twitter: {
    card: "summary_large_image",
    title: "حراج برو | تحديث تلقائي لإعلانات حراج",
    description: "النظام الأفضل لأتمتة تحديث الإعلانات اليومي على موقع حراج لزيادة المشاهدات والمبيعات.",
    images: ["https://og-image.vercel.app/%23%20Haraj%20Pro.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fraw.githubusercontent.com%2Flucide-icons%2Flucide%2Fmain%2Ficons%2Fbot.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
              "description": "نظام أتمتة لتحديث إعلانات موقع حراج السعودي بشكل دوري",
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