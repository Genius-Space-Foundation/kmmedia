import { v2 as cloudinary } from 'cloudinary';

export interface PreviewOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  format?: string;
}

export async function generateFilePreview(
  fileUrl: string,
  options: PreviewOptions = {}
): Promise<string> {
  return fileUrl;
}