import fs from "fs";
import path from "path";

// Gunakan direktori lokal yang akan di-mount sebagai persistent volume di Coolify
const STORAGE_DIR = path.join(process.cwd(), "storage_data");

/**
 * Save a file to the local filesystem
 * @param file The file object from FormData
 * @param category The category folder (e.g., 'dokumen-pendaftaran', 'bukti-pembayaran')
 * @param subfolder The subfolder (usually user ID or registration number)
 * @param filename The desired filename
 * @returns The relative path to the saved file
 */
export async function saveFileLocal(
  fileOrBuffer: File | Buffer,
  category: string,
  subfolder: string,
  filename: string,
): Promise<string> {
  // Ensure the directory exists
  const targetDir = path.join(STORAGE_DIR, category, subfolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Convert file to buffer if it's a File
  let buffer: Buffer;
  if (Buffer.isBuffer(fileOrBuffer)) {
    buffer = fileOrBuffer;
  } else {
    const bytes = await fileOrBuffer.arrayBuffer();
    buffer = Buffer.from(bytes);
  }

  // Define full path
  const filePath = path.join(targetDir, filename);

  // Write file
  fs.writeFileSync(filePath, buffer);

  // Return relative path for database storage
  // Format: category/subfolder/filename
  return path.posix.join(category, subfolder, filename);
}

/**
 * Get a file buffer from local storage
 * @param relativePath The relative path stored in database
 * @returns The file buffer and mime type, or null if not found
 */
export function getFileLocal(
  relativePath: string,
): { buffer: Buffer; mimeType: string } | null {
  // Sanitize relative path to remove leading slashes which can mess up path.join
  const sanitizedPath = relativePath.startsWith("/")
    ? relativePath.substring(1)
    : relativePath;
  const fullPath = path.join(STORAGE_DIR, sanitizedPath);

  // Basic security check to prevent directory traversal
  if (!fullPath.startsWith(STORAGE_DIR)) {
    return null;
  }

  if (fs.existsSync(fullPath)) {
    const buffer = fs.readFileSync(fullPath);

    // Robust mime type detection based on Magic Bytes (first few bytes)
    // PDF: %PDF- (25 50 44 46 2D)
    // JPEG: FF D8 FF
    // PNG: 89 50 4E 47
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();

    let mimeType = "application/octet-stream";
    if (hex.startsWith("FFD8FF")) {
      mimeType = "image/jpeg";
    } else if (hex === "89504E47") {
      mimeType = "image/png";
    } else if (hex === "25504446") {
      mimeType = "application/pdf";
    } else {
      // Fallback to extension-based detection if magic bytes don't match known types
      const ext = path.extname(fullPath).toLowerCase();
      if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".png") mimeType = "image/png";
      else if (ext === ".webp") mimeType = "image/webp";
      else if (ext === ".pdf") mimeType = "application/pdf";
    }

    console.log(
      `[Storage] File found: ${fullPath} (Detected: ${mimeType} via ${hex})`,
    );
    return { buffer, mimeType };
  }

  // Enhanced logging for diagnostics
  console.error(`[Storage] ❌ File NOT found: ${fullPath}`);
  console.log(`[Storage] Checked Path: ${fullPath}`);
  console.log(`[Storage] Process CWD: ${process.cwd()}`);
  console.log(`[Storage] STORAGE_DIR: ${STORAGE_DIR}`);

  // Check if parent directory exists
  const parentDir = path.dirname(fullPath);
  console.log(
    `[Storage] Parent Directory exists: ${fs.existsSync(parentDir)} (${parentDir})`,
  );

  return null;
}

/**
 * Delete a file from local storage
 * @param relativePath The relative path stored in database
 */
export function deleteFileLocal(relativePath: string): boolean {
  const fullPath = path.join(STORAGE_DIR, relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}
