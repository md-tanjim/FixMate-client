import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { ToastContainer, toast } from 'react-toastify';
import Navbar from "./components/home/Navbar";
import ConditionalNavbar from "./components/conditional-navbar";
import Footer from "./components/home/Footer";
import ConditionalFooter from "./components/home/ConditionalFooter";


const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
        <ConditionalNavbar />
          {children}
          
          <ConditionalFooter/>
          </ThemeProvider>
      </body>
        <ToastContainer/>
    </html>
  )
}
