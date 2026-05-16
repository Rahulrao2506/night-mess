import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Night Mess — VIT Hostel Food",
  description: "Order food from your hostel mess without standing in queue",
  manifest: "/manifest.json",
  themeColor: "#ff6b35",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Night Mess" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
