import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

// Upload file to Cloudinary
export async function uploadFile(
  file: Buffer | string,
  options: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any;
    public_id?: string;
  } = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'kmmedia',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      public_id: options.public_id,
    };

    cloudinary.uploader.upload(
      file,
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadResult);
        }
      }
    );
  });
}

// Upload video with optimizations
export async function uploadVideo(
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
  } = {}
): Promise<UploadResult> {
  return uploadFile(file, {
    ...options,
    resource_type: 'video',
    transformation: [
      { quality: 'auto' },
      { format: 'mp4' },
    ],
  });
}

// Upload image with optimizations
export async function uploadImage(
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
    width?: number;
    height?: number;
  } = {}
): Promise<UploadResult> {
  return uploadFile(file, {
    ...options,
    resource_type: 'image',
    transformation: [
      { quality: 'auto' },
      { format: 'webp' },
      ...(options.width || options.height ? [{ 
        width: options.width, 
        height: options.height, 
        crop: 'fill' 
      }] : []),
    ],
  });
}

// Upload document (PDF, DOC, etc.)
export async function uploadDocument(
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
  } = {}
): Promise<UploadResult> {
  return uploadFile(file, {
    ...options,
    resource_type: 'raw',
  });
}

// Delete file from Cloudinary
export async function deleteFile(publicId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

// Generate signed URL for secure uploads
export function generateSignedUploadUrl(
  options: {
    folder?: string;
    resource_type?: string;
    transformation?: any;
  } = {}
): { signature: string; timestamp: number; api_key: string; cloud_name: string } {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: options.folder || 'kmmedia',
    resource_type: options.resource_type || 'auto',
    ...options.transformation,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

