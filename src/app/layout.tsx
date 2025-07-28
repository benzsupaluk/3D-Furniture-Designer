import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

import FullScreenLoader from "@/components/loader/FullScreenLoader";
import NotificationComponent from "@/components/Notification";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3D Furniture Designer | Space Base Interior Tool",
  description:
    "Design your own space base with 3D furniture models in real-time. Move, rotate, and scale objects to create your dream space then generate styled room images with Spacely AI.",
  keywords: [
    "3D interior design",
    "furniture designer",
    "space planner",
    "generative AI interior",
    "react-three-fiber",
    "next.js",
    "Spacely AI",
  ],
  openGraph: {
    title: "3D Furniture Designer | Space Base Interior Tool",
    description:
      "Design and decorate your virtual room in 3D, then transform it with AI-generated interior styles using Spacely AI.",
    siteName: "3D Furniture Designer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Furniture Designer",
    description:
      "Create a virtual interior with 3D models, then style it using Spacely AI’s generative designs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning={true} className="font-lexend">
        <FullScreenLoader />
        <NotificationComponent />
        {children}
      </body>
    </html>
  );
}
