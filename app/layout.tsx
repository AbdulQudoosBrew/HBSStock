
import GlobalLoading from "@/components/GlobalLoading";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./authContext";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "HBS Stock - Stock Management System",
  description:
    "HBS Stock is a modern Next.js web application for efficient product inventory management. Features include product listing, filtering, sorting, secure authentication, and responsive design.",
  authors: [
    {
      name: "HBS Stock",
      url: "https://hbsstock.vercel.app/",
      email: "quddoos18@gmail.com",
    },
  ],
  keywords: [
    "HBS Stock",
    "Inventory Management",
    "Next.js",
    "React",
    "Prisma",
    "MongoDB",
    "Product Listing",
    "Authentication",
    "JWT",
    "CRUD",
    "Responsive Web App",
    "HBS Stock",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
    other: [
      { rel: "icon", url: "/favicon.ico" },
    ],
  },
  openGraph: {
    title: "HBS Stock - Stock Management System",
    description:
      "Efficiently manage your product inventory with HBS Stock, a secure and responsive Next.js web application.",
    url: "https://hbsstock.vercel.app/",
    images: [
      {
        url: "https://github.com/user-attachments/assets/7495dcfb-c7cb-44e6-a1ef-d82930a8ada7",
        width: 1200,
        height: 630,
        alt: "HBS Stock Screenshot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HBS Stock - Stock Management System",
    description:
      "Efficiently manage your product inventory with HBS Stock, a secure and responsive Next.js web application.",
    images: [
      "https://github.com/user-attachments/assets/7495dcfb-c7cb-44e6-a1ef-d82930a8ada7",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div>Loading...</div>}>
              <GlobalLoading />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </ThemeProvider>
          <Toaster />
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
