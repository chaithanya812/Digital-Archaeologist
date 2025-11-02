import type { Metadata } from "next";
import "./globals.css";
import BlobBackground from "@/components/BlobBackground";

export const metadata: Metadata = {
  title: "Project Chronos - Unified Digital Analysis Platform",
  description: "A unified platform for audio, text, and image analysis powered by Google Gemini AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <BlobBackground />
        {children}
      </body>
    </html>
  );
}