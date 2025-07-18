// import "@/styles/globals.css";
// import { type Metadata } from "next";
// import { Geist } from "next/font/google";
// import { AppProviders } from "./providers";

// export const metadata: Metadata = {
//   title: "Dionysus",
//   description: "Generated by create-t3-app",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

// export default function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <html lang="en" className={geist.variable}>
//       <body>
//         <AppProviders>{children}</AppProviders>
//       </body>
//     </html>
//   );
// }

// import "@/styles/globals.css";

// import { type Metadata } from "next";
// import { Geist } from "next/font/google";
// import { ClerkProvider } from "@clerk/nextjs";

// import { TRPCReactProvider } from "@/trpc/react";

// export const metadata: Metadata = {
//   title: "Dionysus",
//   description: "Generated by create-t3-app",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

// export default function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <ClerkProvider>
//       <html lang="en" className={`${geist.variable}`}>
//         <body>
//           <TRPCReactProvider>{children}</TRPCReactProvider>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }

import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AppProviders } from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "RepoGenie",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
        <Toaster richColors />
      </body>
    </html>
  );
}
