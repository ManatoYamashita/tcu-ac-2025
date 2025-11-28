import type { Metadata } from 'next';
import './globals.css';
import { generateWebSiteJsonLd } from '@/lib/utils/json-ld';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'manapuraza blog',
    template: '%s | manapuraza blog',
  },
  description: 'Markdownベースの技術ブログ - Web開発、プログラミング、技術記事を発信',
  keywords: ['技術ブログ', 'Web開発', 'プログラミング', 'Markdown', 'Next.js', 'React'],
  authors: [{ name: 'Manato Yamashita' }],
  creator: 'Manato Yamashita',
  publisher: 'manapuraza',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: baseUrl,
    siteName: 'manapuraza blog',
    title: 'manapuraza blog',
    description: 'Markdownベースの技術ブログ - Web開発、プログラミング、技術記事を発信',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'manapuraza blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'manapuraza blog',
    description: 'Markdownベースの技術ブログ - Web開発、プログラミング、技術記事を発信',
    creator: '@ManatoYamashita',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateWebSiteJsonLd();

  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
