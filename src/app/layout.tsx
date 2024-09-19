/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import { Web3Provider } from "../components/web3Provider";

export const metadata = {
  title: "NFT Snake Game",
  description: "Play Snake and mint your NFT!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
