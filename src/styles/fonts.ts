import {
  Amatic_SC,
  Special_Elite,
  Jolly_Lodger,
  Nosifer,
} from "next/font/google";
export const amatic = Amatic_SC({
  weight: ["400", "700"],
  display: "block",
  preload: true,
  subsets: ["vietnamese"],
  variable: "--font-amatic",
});
export const special = Special_Elite({
  weight: ["400"],
  display: "block",
  preload: true,
  subsets: ["latin"],
  variable: "--font-special",
});
export const jolly = Jolly_Lodger({
  weight: ["400"],
  display: "block",
  preload: true,
  subsets: ["latin"],
  variable: "--font-jolly",
});
export const nosifer = Nosifer({
  weight: ["400"],
  display: "block",
  preload: true,
  subsets: ["latin"],
  variable: "--font-nosifer",
});
