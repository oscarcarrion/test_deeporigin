import validator from "validator";

/**
 * Validate if a string is a proper URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Check basic URL format
  const isValidatorURL = validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
    require_host: true,
    allow_underscores: true,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    disallow_auth: false,
  });

  if (!isValidatorURL) {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // Additional validations
    if (
      urlObj.hostname === "localhost" ||
      urlObj.hostname === "127.0.0.1" ||
      urlObj.hostname.endsWith(".local")
    ) {
      return false;
    }

    // Check for valid TLD or IP - simplified check
    const isFQDN = validator.isFQDN(urlObj.hostname);
    const isIP = validator.isIP(urlObj.hostname);

    if (!isFQDN && !isIP) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Normalize URL by adding protocol if missing and cleaning up
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const urlObj = new URL(url);

    // Normalize the URL
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Extract domain from URL for display purposes
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Check if URL is potentially malicious (basic checks)
 */
export function isSafeUrl(url: string): boolean {
  const dangerousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /ftp:/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(url));
}
