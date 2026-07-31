export const WEBSITE_URL = "https://floorballtactix.com";

export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(standalone || iosStandalone);
  // TODO: när Capacitor läggs till i steg 3, lägg även till Capacitor.isNativePlatform() här.
}

export function openWebsite(path: string = ""): void {
  window.open(`${WEBSITE_URL}${path}`, "_blank", "noopener,noreferrer");
}