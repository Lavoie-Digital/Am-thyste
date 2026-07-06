/**
 * Detects embedded / in-app browsers (Facebook, Messenger, Instagram, TikTok…).
 *
 * Google blocks OAuth sign-in from these webviews with
 * `Error 403: disallowed_useragent`, so we can't run the Google popup there.
 * We detect them to steer the user toward a real browser or email sign-in.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";

  // Explicit in-app browser markers.
  const patterns = [
    /FBAN|FBAV|FB_IAB|FBIOS/i, // Facebook / Messenger
    /Instagram/i,
    /Messenger/i,
    /Line\//i,
    /Twitter/i,
    /TikTok|BytedanceWebview|musical_ly/i,
    /Snapchat/i,
    /Pinterest/i,
    /WhatsApp/i,
    /LinkedInApp/i,
    /GSA\//i, // Google Search App webview
  ];
  if (patterns.some((re) => re.test(ua))) return true;

  // Generic Android WebView (wv token, or Version/x.x + Chrome without the
  // standalone Chrome browser markers).
  if (/\bwv\b/.test(ua)) return true;

  return false;
}
