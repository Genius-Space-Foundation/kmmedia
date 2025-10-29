import { v2 as cloudinary } from 'cloudinary';

export interface PreviewOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'low