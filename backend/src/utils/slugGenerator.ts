import { nanoid, customAlphabet } from "nanoid";
import { supabase } from "../config/database";

// Create a custom nanoid generator with URL-safe alphabet that avoids confusing characters
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
const customNanoid = customAlphabet(alphabet, 6);

/**
 * Generate a random short code for URLs
 */
export function generateShortCode(length: number = 6): string {
  if (length === 6) {
    return customNanoid();
  }
  // For custom lengths, create a new generator
  const generator = customAlphabet(alphabet, length);
  return generator();
}

/**
 * Check if a short code is already taken
 */
export async function isShortCodeTaken(shortCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("urls")
    .select("id")
    .eq("short_code", shortCode)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw error;
  }

  return !!data;
}

/**
 * Generate a unique short code that doesn't exist in the database
 */
export async function generateUniqueShortCode(
  maxAttempts: number = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const shortCode = generateShortCode();
    const isTaken = await isShortCodeTaken(shortCode);

    if (!isTaken) {
      return shortCode;
    }
  }

  throw new Error(
    "Unable to generate unique short code after maximum attempts"
  );
}

/**
 * Validate custom slug format
 */
export function isValidCustomSlug(slug: string): boolean {
  // Allow alphanumeric characters, hyphens, and underscores
  // Must be 3-20 characters long
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(slug);
}

/**
 * Sanitize custom slug
 */
export function sanitizeCustomSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 20);
}
