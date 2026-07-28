import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGameDisplayName(player: Player): string {
  return player.displayName || player.name.split(' ')[0];
}

// Legacy training section type -> Swedish label (segments are now stored per team)
const LEGACY_SECTION_LABELS: Record<string, string> = {
  'Warm-up': 'Uppvärmning',
  'Main drills': 'Huvudövningar',
  'Game-like drills': 'Spelövningar',
  'Cool-down': 'Nedvarvning',
};

export function sectionLabel(type: string) {
  return LEGACY_SECTION_LABELS[type] || type;
}
