// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../src/app/context/AuthContext";
import Navbar from "./components/Navbar";
import Script from 'next/script';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Court Booking",
  description: "Book your favorite courts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Add the script tag before the closing </body> tag */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}