import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
    title: 'K-Pilgrimage Assistant',
    description: 'AI-powered K-Drama filming location guide and itinerary generator',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-slate-50">
                <main className="container mx-auto px-4 py-8 max-w-5xl">
                    {children}
                </main>
                <Toaster />
            </body>
        </html>
    );
}
