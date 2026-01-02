import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Polaris",
  description: "Next Gen Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {/* We removed the Sidebar and Header from here */}
          {children} 
        </ClientLayout>
        
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}