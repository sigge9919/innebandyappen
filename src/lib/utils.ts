import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGameDisplayName(player: Player): string {
  return player.displayName || player.name.split(' ')[0];
}
