/**
 * Helper function to generate UUID that is compatible across all environments,
 * including older Safari browsers (<15.4) that don't support crypto.randomUUID().
 *
 * Uses crypto.randomUUID() when available for better performance and cryptographic
 * quality, with a fallback to a UUID v4 implementation using crypto.getRandomValues().
 */
export const generateUUID = (): string => {
  // Use native crypto.randomUUID() if available (Safari 15.4+, Chrome 92+, Firefox 95+)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback to crypto.getRandomValues() based UUID v4 implementation
  // This provides cryptographically secure random values in older Safari
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant (10xx) bits as per RFC 4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Final fallback using Math.random() for environments without crypto
  // This is less secure but ensures functionality
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
