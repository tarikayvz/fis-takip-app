// client/src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fiş Takip AI",
  description: "Yapay zeka destekli finans asistanı",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}