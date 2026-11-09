import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "SMK Bina Bhakti - Sistem Informasi Keterserapan Lulusan",
  description: "Sistem Informasi Keterserapan Lulusan dan Bursa Kerja SMK Bina Bhakti Mekarmukti",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900">
        <SessionWrapper>
          {children}
          <Toaster position="top-right" />
        </SessionWrapper>
      </body>
    </html>
  );
}
