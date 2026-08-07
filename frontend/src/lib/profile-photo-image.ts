export const PROFILE_PHOTO_SOURCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PROFILE_PHOTO_SOURCE_SIZE =
  15 * 1024 * 1024;
export const MAX_PROFILE_PHOTO_UPLOAD_SIZE =
  1024 * 1024;
export const TARGET_PROFILE_PHOTO_SIZE =
  500 * 1024;
export const MIN_PROFILE_PHOTO_DIMENSION = 200;
export const MAX_PROFILE_PHOTO_DIMENSION = 1200;

export type PhotoTransform = {
  offsetX: number;
  offsetY: number;
  zoom: number;
  rotation: number;
  viewportSize: number;
};

export type SourceImage = {
  file: File;
  url: string;
  width: number;
  height: number;
};

export type ProcessedProfilePhoto = {
  blob: Blob;
  url: string;
  width: number;
  format: "image/webp" | "image/jpeg";
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateProfilePhotoFile(file: File): void {
  if (file.size === 0) {
    throw new Error("The selected image is empty.");
  }

  if (
    !PROFILE_PHOTO_SOURCE_TYPES.includes(
      file.type as (typeof PROFILE_PHOTO_SOURCE_TYPES)[number],
    )
  ) {
    throw new Error("Choose a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_PROFILE_PHOTO_SOURCE_SIZE) {
    throw new Error("Choose an image no larger than 15 MB.");
  }
}

export async function loadSourceImage(
  file: File,
): Promise<SourceImage> {
  validateProfilePhotoFile(file);

  const url = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      const image = new Image();

      image.onload = () =>
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      image.onerror = () =>
        reject(new Error("The selected image could not be read."));
      image.src = url;
    });

    if (
      dimensions.width < MIN_PROFILE_PHOTO_DIMENSION ||
      dimensions.height < MIN_PROFILE_PHOTO_DIMENSION
    ) {
      throw new Error(
        "Choose an image that is at least 200 × 200 pixels.",
      );
    }

    return {
      file,
      url,
      ...dimensions,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The optimized image could not be created."));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function renderCrop(
  image: HTMLImageElement,
  transform: PhotoTransform,
  outputSize: number,
  type: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not supported in this browser.");
  }

  const coverScale = Math.max(
    outputSize / image.naturalWidth,
    outputSize / image.naturalHeight,
  );
  const offsetScale = outputSize / transform.viewportSize;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputSize, outputSize);
  context.translate(
    outputSize / 2 + transform.offsetX * offsetScale,
    outputSize / 2 + transform.offsetY * offsetScale,
  );
  context.rotate((transform.rotation * Math.PI) / 180);
  context.scale(
    coverScale * transform.zoom,
    coverScale * transform.zoom,
  );
  context.drawImage(
    image,
    -image.naturalWidth / 2,
    -image.naturalHeight / 2,
  );

  return canvasToBlob(canvas, type, quality);
}

async function supportsWebP(): Promise<boolean> {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const blob = await canvasToBlob(canvas, "image/webp", 0.8);

  return blob.type === "image/webp";
}

export async function processProfilePhoto(
  source: SourceImage,
  transform: PhotoTransform,
): Promise<ProcessedProfilePhoto> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () =>
      reject(new Error("The selected image could not be processed."));
    element.src = source.url;
  });

  const format = (await supportsWebP())
    ? "image/webp"
    : "image/jpeg";
  let outputSize = Math.min(
    MAX_PROFILE_PHOTO_DIMENSION,
    source.width,
    source.height,
  );
  let quality = 0.88;
  let blob = await renderCrop(
    image,
    transform,
    outputSize,
    format,
    quality,
  );

  while (
    blob.size > TARGET_PROFILE_PHOTO_SIZE &&
    quality > 0.6
  ) {
    quality = Math.max(0.6, quality - 0.07);
    blob = await renderCrop(
      image,
      transform,
      outputSize,
      format,
      quality,
    );
  }

  while (
    blob.size > MAX_PROFILE_PHOTO_UPLOAD_SIZE &&
    outputSize > MIN_PROFILE_PHOTO_DIMENSION
  ) {
    outputSize = Math.max(
      MIN_PROFILE_PHOTO_DIMENSION,
      Math.floor(outputSize * 0.82),
    );
    blob = await renderCrop(
      image,
      transform,
      outputSize,
      format,
      quality,
    );
  }

  if (blob.size > MAX_PROFILE_PHOTO_UPLOAD_SIZE) {
    throw new Error(
      "This image could not be optimized below the 1 MB upload limit. Try a less complex image.",
    );
  }

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: outputSize,
    format,
  };
}
