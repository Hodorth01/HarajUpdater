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
  // 1. Basic Metadata Optimized for Arabic SEO
  title: "حراج برو | أداة تحديث إعلانات حراج تلقائياً - Haraj Pro",
  description: "حراج برو هو النظام الأكثر تقدماً لتحديث إعلاناتك على منصة حراج تلقائياً. صمم خصيصاً لمساعدتك في البقاء دائماً في مقدمة نتائج البحث وزيادة مبيعاتك بكل سهولة وأمان.",
  keywords: ["حراج", "بوت حراج", "تحديث تلقائي", "حراج برو", "تسويق حراج", "أتمتة"],
  authors: [{ name: "Thamer Alshehri" }],
  metadataBase: new URL("https://harajpro.netlify.app"),

  // 2. Icon Linking (Favicons)
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // 3. Web Manifest (Android Support)
  manifest: "/site.webmanifest",

  // 4. Open Graph (Social Sharing Preview)
  openGraph: {
    title: "حراج برو - الحل الذكي لإدارة إعلانات حراج",
    description: "استخدم حراج برو لضمان ظهور إعلاناتك في مقدمة الأقسام يومياً. أداة احترافية، آمنة، وسهلة الاستخدام لزيادة وصولك للمشترين.",
    url: "https://harajpro.netlify.app",
    siteName: "Haraj Pro",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "حراج برو - شعار",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },

  // 5. Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "حراج برو | تحديث تلقائي لإعلانات حراج",
    description: "النظام الأفضل لأتمتة تحديث الإعلانات اليومي على موقع حراج لزيادة المشاهدات والمبيعات.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* Structured Data for Google Search */}
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