import bcrypt from "bcryptjs";

// ===================================
// PASSWORD GENERATION
// ===================================

/**
 * Generate default password for new registration
 * Format: [JENJANG_CODE][NIK_LAST_8_DIGITS]
 * Example: MT67890123, IL67890123, MA67890123
 */
export function generatePasswordDefault(nik: string, jenjang: string): string {
  // Get last 8 digits of NIK
  const nikLast8 = nik.slice(-8);

  // Get jenjang code
  let jenjangCode = "";

  switch (jenjang) {
    case "MTs":
      jenjangCode = "MT";
      break;
    case "IL":
      jenjangCode = "IL";
      break;
    case "SMA":
    case "MA":
      jenjangCode = "MA";
      break;
    default:
      // Fallback: use first 2 characters uppercase
      jenjangCode = jenjang.substring(0, 2).toUpperCase();
  }

  // Format: MT67890123
  return `${jenjangCode}${nikLast8}`;
}

// ===================================
// PASSWORD HASHING
// ===================================

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if match
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===================================
// PASSWORD VALIDATION
// ===================================

/**
 * Validate password strength
 * Minimum requirements:
 * - At least 8 characters
 * - Contains at least one letter
 * - Contains at least one number
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password minimal 8 karakter");
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password harus mengandung huruf");
  }

  if (!/\d/.test(password)) {
    errors.push("Password harus mengandung angka");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if password is strong enough for user change
 * More strict than default password
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) // Special character optional but recommended
  );
}

// ===================================
// PASSWORD UTILITIES
// ===================================

/**
 * Generate random password (for admin reset, etc.)
 * @param length - Password length (default: 12)
 * @returns Random password
 */
export function generateRandomPassword(length: number = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Mask password for display
 * Example: MT67890123 -> MT••••••23
 */
export function maskPassword(
  password: string,
  visibleChars: number = 2,
): string {
  if (password.length <= visibleChars * 2) {
    return "•".repeat(password.length);
  }

  const start = password.slice(0, visibleChars);
  const end = password.slice(-visibleChars);
  const middle = "•".repeat(password.length - visibleChars * 2);

  return `${start}${middle}${end}`;
}

// ===================================
// EXAMPLE USAGE
// ===================================

/*
// Generate default password
const password = generatePasswordDefault("3201234567890123", "MTs");
console.log(password); // MT67890123

// Hash password
const hashed = await hashPassword(password);
console.log(hashed); // $2a$10$...

// Verify password
const isValid = await comparePassword("MT67890123", hashed);
console.log(isValid); // true

// Validate strength
const validation = validatePasswordStrength("abc123");
console.log(validation);
// { isValid: false, errors: ["Password minimal 8 karakter"] }

// Mask password
const masked = maskPassword("MT67890123");
console.log(masked); // MT••••••23
*/
