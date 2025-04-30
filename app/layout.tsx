import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { VoiceAgent } from "@/components/VoiceAgent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invoice Generator",
  description: "Generate invoices and estimates easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background relative">
          {children}
          <Toaster />
          <VoiceAgent />
          <div className="absolute bottom-2 right-6 print:hidden">
            <small>
              Made with ❤️ By{" "}
              <Link
                className="underline uppercase text-blue-600"
                href="https://www.codvix.in"
              >
                codvix
              </Link>{" "}
              Tech Private Limited
            </small>
          </div>
        </div>
      </body>
    </html>
  );
}
