import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "@/components/header";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Header />
                <div className="h-[calc(100vh-456px)] mt-20 sm:mb-0 mb-20">
                    {children}
                </div>

            </body>
        </html>
    );
}
