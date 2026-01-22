import { supabase } from './client';

/**
 * Downloads an image from a URL or base64 data URL and uploads it to Supabase Storage
 * @param imageSource - The URL or base64 data URL of the image
 * @param fileName - The name to give the file in storage (without extension)
 * @param bucket - The storage bucket name (default: 'visuals')
 * @returns The public URL of the uploaded image, or null if failed
 */
export async function uploadImageToStorage(
  imageSource: string,
  fileName: string,
  bucket: string = 'visuals'
): Promise<string | null> {
  try {
    let buffer: Buffer;
    let contentType: string;
    let extension: string;

    // Check if it's a base64 data URL
    if (imageSource.startsWith('data:')) {
      console.log('Processing base64 image...');

      // Parse data URL: data:image/png;base64,xxxxx
      const matches = imageSource.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid base64 data URL format');
        return null;
      }

      contentType = matches[1];
      const base64Data = matches[2];
      buffer = Buffer.from(base64Data, 'base64');
      extension = getExtensionFromContentType(contentType);
    } else {
      // It's a regular URL - fetch it
      console.log('Downloading image from:', imageSource.substring(0, 100) + '...');

      const response = await fetch(imageSource);

      if (!response.ok) {
        console.error('Failed to fetch image:', response.status, response.statusText);
        return null;
      }

      contentType = response.headers.get('content-type') || 'image/webp';
      extension = getExtensionFromContentType(contentType);

      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Generate unique file path
    const filePath = `${fileName}.${extension}`;

    console.log('Uploading to Supabase Storage:', filePath, 'Size:', buffer.length, 'bytes');

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('Upload successful! Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    return null;
  }
}

/**
 * Gets file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
  const mapping: Record<string, string> = {
    'image/webp': 'webp',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
  };

  return mapping[contentType] || 'webp';
}

/**
 * Generates a unique filename for a visual
 * @param noteTitle - The title of the note
 * @param timestamp - Optional timestamp (defaults to now)
 */
export function generateVisualFileName(noteTitle: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  // Sanitize title: remove special characters, replace spaces with dashes
  const sanitized = noteTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50); // Limit length

  return `visual-${sanitized}-${ts}`;
}

/**
 * Deletes an image from Supabase Storage based on its public URL
 * @param publicUrl - The public URL of the image to delete
 * @param bucket - The storage bucket name (default: 'visuals')
 * @returns true if deleted successfully, false otherwise
 */
export async function deleteImageFromStorage(
  publicUrl: string,
  bucket: string = 'visuals'
): Promise<boolean> {
  try {
    // Extract the file path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/visuals/<filename>
    const urlParts = publicUrl.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length !== 2) {
      console.error('Could not parse file path from URL:', publicUrl);
      return false;
    }

    const filePath = urlParts[1];
    console.log('Deleting file from storage:', filePath);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      return false;
    }

    console.log('File deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return false;
  }
}
