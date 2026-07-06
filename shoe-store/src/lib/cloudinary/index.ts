import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadImage(
  file: Buffer | string,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: Record<string, unknown>;
  } = {}
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const folder = options.folder || 'shoe-store/products';
  
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
    {
      folder,
      public_id: options.publicId,
      transformation: options.transformation || {
        quality: 'auto:good',
        fetch_format: 'auto',
        width: 1200,
        height: 1200,
        crop: 'limit',
      },
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch {
    return false;
  }
}

export function getOptimizedUrl(publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
} = {}): string {
  return cloudinary.url(publicId, {
    quality: options.quality || 'auto:good',
    fetch_format: options.format || 'auto',
    width: options.width,
    height: options.height,
    crop: options.width && options.height ? 'fill' : 'limit',
    gravity: 'auto',
  });
}

export function getResponsiveUrls(publicId: string): Record<string, string> {
  return {
    thumb: getOptimizedUrl(publicId, { width: 200, height: 200 }),
    card: getOptimizedUrl(publicId, { width: 400, height: 400 }),
    detail: getOptimizedUrl(publicId, { width: 800, height: 800 }),
    zoom: getOptimizedUrl(publicId, { width: 1200, height: 1200 }),
  };
}