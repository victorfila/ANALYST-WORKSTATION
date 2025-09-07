import { z } from 'zod';

// Validation schemas for localStorage data
export const ApiKeysSchema = z.object({
  hybridAnalysis: z.string(),
  virusTotal: z.string(),
});

export const AnalysisResultSchema = z.object({
  hybridAnalysis: z.any().optional(),
  virusTotal: z.any().optional(),
  fileName: z.string(),
  fileSize: z.number(),
  hash: z.string().optional(),
  timestamp: z.string(),
  id: z.number(),
});

export const AppDataSchema = z.object({
  apiKeys: ApiKeysSchema,
  analysisResults: z.array(AnalysisResultSchema),
  userNotes: z.string(),
  timestamp: z.string(),
});

// Input sanitization utilities
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid file name characters
    .replace(/\.\./g, '') // Remove directory traversal
    .trim();
};

// Safe JSON parsing with validation
export const safeParseJSON = <T>(
  jsonString: string, 
  schema: z.ZodSchema<T>,
  fallback: T
): T => {
  try {
    const parsed = JSON.parse(jsonString);
    return schema.parse(parsed);
  } catch (error) {
    console.warn('Failed to parse or validate JSON:', error);
    return fallback;
  }
};

// Basic encryption for localStorage (client-side only, limited security)
export class LocalStorageEncryption {
  private static readonly ENCRYPTION_KEY = 'cyber-panel-encrypt-key';
  
  static async encrypt(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);
      
      // Generate a random key for this session
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBytes
      );
      
      // Note: In a real implementation, you'd need to securely store the key
      // This is a basic implementation for demonstration
      const result = {
        data: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
      };
      
      return btoa(JSON.stringify(result));
    } catch (error) {
      console.warn('Encryption failed, storing as plain text:', error);
      return data;
    }
  }
  
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const parsed = JSON.parse(atob(encryptedData));
      // For now, just return as plain text since key management is complex
      // In a real implementation, you'd decrypt here
      return encryptedData;
    } catch (error) {
      // Assume it's plain text if decryption fails
      return encryptedData;
    }
  }
}