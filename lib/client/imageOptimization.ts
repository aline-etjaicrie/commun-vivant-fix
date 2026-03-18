'use client';

const TRANSFORM_EXCLUDED_TYPES = new Set(['image/gif', 'image/svg+xml']);

export interface OptimizeImageOptions {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  targetType?: 'image/webp' | 'image/jpeg';
}

function replaceExtension(filename: string, nextExtension: string): string {
  return filename.replace(/\.[a-z0-9]+$/i, '') + nextExtension;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image_load_failed'));
    image.decoding = 'async';
    image.src = url;
  });
}

function exportCanvas(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function optimizeImageBlob(blob: Blob, options: OptimizeImageOptions): Promise<Blob> {
  if (!blob.type.startsWith('image/') || TRANSFORM_EXCLUDED_TYPES.has(blob.type)) {
    return blob;
  }

  const quality = options.quality ?? 0.82;
  const targetType = options.targetType ?? 'image/webp';
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(objectUrl);
    const ratio = Math.min(
      1,
      options.maxWidth / Math.max(image.naturalWidth, 1),
      options.maxHeight / Math.max(image.naturalHeight, 1)
    );

    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const shouldResize = width !== image.naturalWidth || height !== image.naturalHeight;

    if (!shouldResize && blob.size <= 1.5 * 1024 * 1024) {
      return blob;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return blob;

    ctx.drawImage(image, 0, 0, width, height);

    const exported = await exportCanvas(canvas, targetType, quality);
    if (!exported) return blob;

    if (!shouldResize && exported.size >= blob.size * 0.98) {
      return blob;
    }

    return exported;
  } catch {
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function optimizeImageFile(file: File, options: OptimizeImageOptions): Promise<File> {
  const optimizedBlob = await optimizeImageBlob(file, options);
  if (optimizedBlob === file) {
    return file;
  }

  const extension = optimizedBlob.type === 'image/jpeg' ? '.jpg' : '.webp';
  const nextName = replaceExtension(file.name, extension);

  return new File([optimizedBlob], nextName, {
    type: optimizedBlob.type || file.type,
    lastModified: file.lastModified,
  });
}

export function isSupportedImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
