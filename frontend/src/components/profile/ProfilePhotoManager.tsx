"use client";

import {
  ChangeEvent,
  DragEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import {
  formatFileSize,
  loadSourceImage,
  processProfilePhoto,
  type ProcessedProfilePhoto,
  type SourceImage,
} from "@/lib/profile-photo-image";

type PhotoApiResponse = {
  success: boolean;
  message?: string;
  image?: string | null;
};

const VIEWPORT_SIZE = 320;

function getResponseMessage(
  result: PhotoApiResponse,
  fallback: string,
): string {
  return result.message || fallback;
}

function uploadPhoto(
  blob: Blob,
  onProgress: (progress: number) => void,
): Promise<PhotoApiResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();
    const extension = blob.type === "image/webp" ? "webp" : "jpg";

    formData.append(
      "photo",
      new File([blob], `profile-photo.${extension}`, {
        type: blob.type,
      }),
    );

    request.open("POST", "/api/upload/photo");
    request.responseType = "json";

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      const result = request.response as PhotoApiResponse | null;

      if (
        request.status < 200 ||
        request.status >= 300 ||
        !result?.success
      ) {
        reject(
          new Error(
            result?.message || "Failed to upload profile photo.",
          ),
        );
        return;
      }

      resolve(result);
    });

    request.addEventListener("error", () => {
      reject(new Error("The upload was interrupted. Try again."));
    });

    request.send(formData);
  });
}

export default function ProfilePhotoManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const viewportSizeRef = useRef(VIEWPORT_SIZE);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [savedImage, setSavedImage] =
    useState<string | null>(null);
  const [source, setSource] = useState<SourceImage | null>(null);
  const [processed, setProcessed] =
    useState<ProcessedProfilePhoto | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewportSize, setViewportSize] =
    useState(VIEWPORT_SIZE);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const clearProcessed = useCallback(() => {
    setProcessed((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }
      return null;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSource((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }
      return null;
    });
    clearProcessed();
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearProcessed]);

  useEffect(() => {
    let active = true;

    async function loadPhoto() {
      try {
        const response = await fetch("/api/upload/photo", {
          cache: "no-store",
        });
        const result = (await response.json()) as PhotoApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            getResponseMessage(result, "Failed to load profile photo."),
          );
        }

        if (active) {
          setSavedImage(result.image ?? null);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load profile photo.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPhoto();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (source) {
        URL.revokeObjectURL(source.url);
      }
    };
  }, [source]);

  useEffect(() => {
    return () => {
      if (processed) {
        URL.revokeObjectURL(processed.url);
      }
    };
  }, [processed]);

  useLayoutEffect(() => {
    const viewport = cropViewportRef.current;

    if (!source || !viewport) {
      return;
    }

    function updateViewportSize(nextSize: number) {
      if (!Number.isFinite(nextSize) || nextSize <= 0) {
        return;
      }

      const roundedSize = Math.max(1, Math.round(nextSize));
      const previousSize = viewportSizeRef.current;

      if (roundedSize === previousSize) {
        return;
      }

      setOffset((current) => ({
        x: current.x * (roundedSize / previousSize),
        y: current.y * (roundedSize / previousSize),
      }));
      viewportSizeRef.current = roundedSize;
      setViewportSize(roundedSize);
      clearProcessed();
    }

    updateViewportSize(viewport.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        updateViewportSize(entry.contentRect.width);
      }
    });

    observer.observe(viewport);

    return () => observer.disconnect();
  }, [clearProcessed, source]);

  async function selectFile(file: File) {
    try {
      setErrorMessage("");
      setMessage("");
      clearSelection();
      const loaded = await loadSourceImage(file);
      setSource(loaded);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The selected image could not be loaded.",
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void selectFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      void selectFile(file);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start) {
      return;
    }

    const limit = viewportSize * 0.48;
    setOffset({
      x: Math.max(
        -limit,
        Math.min(limit, start.offsetX + event.clientX - start.pointerX),
      ),
      y: Math.max(
        -limit,
        Math.min(limit, start.offsetY + event.clientY - start.pointerY),
      ),
    });
    clearProcessed();
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
  }

  async function createPreview() {
    if (!source) {
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage("");
      setMessage("");
      clearProcessed();
      const result = await processProfilePhoto(source, {
        offsetX: offset.x,
        offsetY: offset.y,
        zoom,
        rotation,
        viewportSize,
      });
      setProcessed(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The image could not be optimized.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleUpload() {
    if (!processed || uploading) {
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setErrorMessage("");
      setMessage("");
      const result = await uploadPhoto(
        processed.blob,
        setUploadProgress,
      );
      setSavedImage(result.image ?? null);
      setMessage(
        getResponseMessage(result, "Profile photo uploaded successfully."),
      );
      clearSelection();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload profile photo.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (
      removing ||
      !window.confirm("Remove your current profile photo?")
    ) {
      return;
    }

    try {
      setRemoving(true);
      setErrorMessage("");
      setMessage("");
      const response = await fetch("/api/upload/photo", {
        method: "DELETE",
      });
      const result = (await response.json()) as PhotoApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getResponseMessage(result, "Failed to remove profile photo."),
        );
      }

      setSavedImage(null);
      setMessage(
        getResponseMessage(result, "Profile photo removed successfully."),
      );
      clearSelection();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to remove profile photo.",
      );
    } finally {
      setRemoving(false);
    }
  }

  const coverScale = source
    ? Math.max(viewportSize / source.width, viewportSize / source.height)
    : 1;
  const renderedWidth = source ? source.width * coverScale : viewportSize;
  const renderedHeight = source ? source.height * coverScale : viewportSize;
  const savedPercent =
    source && processed
      ? Math.max(
          0,
          Math.round((1 - processed.blob.size / source.file.size) * 100),
        )
      : 0;

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <LoaderCircle className="animate-spin" size={18} />
          Loading profile photo…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Profile Photo</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Upload a professional photo. We crop, resize, and optimize it
            automatically before secure storage.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Avatar
            src={savedImage ?? undefined}
            alt="Current profile photo"
            name="Candidate"
            size="xl"
            className="rounded-full"
          />
          {savedImage ? (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={removing || uploading}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removing ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <Trash2 size={16} />
              )}
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div role="status" className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {message}
        </div>
      ) : null}

      {!source ? (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDrop}
          className={`mt-7 rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-10 ${
            isDraggingFile
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <ImagePlus className="mx-auto text-blue-600" size={36} />
          <p className="mt-4 font-semibold text-slate-900">
            Drag and drop your photo here
          </p>
          <p className="mt-1 text-sm text-slate-500">
            JPG, PNG, or WEBP · up to 15 MB · minimum 200 × 200
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            {savedImage ? "Choose replacement" : "Choose photo"}
          </button>
        </div>
      ) : (
        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900">Adjust crop</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Drag the image to position your face inside the square.
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                aria-label="Cancel photo selection"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div
              ref={cropViewportRef}
              role="application"
              aria-label="Square photo crop area. Drag to reposition the image."
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative mx-auto mt-5 aspect-square w-full max-w-80 touch-none cursor-move overflow-hidden rounded-3xl bg-slate-900 shadow-inner select-none"
            >
              <img
                src={source.url}
                alt="Photo being cropped"
                draggable={false}
                style={{
                  width: renderedWidth,
                  height: renderedHeight,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg) scale(${zoom})`,
                }}
                className="absolute left-1/2 top-1/2 max-w-none object-cover will-change-transform"
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-white/90 shadow-[inset_0_0_0_999px_rgba(15,23,42,0.08)]" />
              <div className="pointer-events-none absolute inset-1/3 rounded-full border border-white/60" />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <ZoomIn size={17} /> Zoom {zoom.toFixed(1)}×
                </span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(event) => {
                    setZoom(Number(event.target.value));
                    clearProcessed();
                  }}
                  className="mt-3 w-full accent-blue-600"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <RotateCcw size={17} /> Rotate {rotation}°
                </span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(event) => {
                    setRotation(Number(event.target.value));
                    clearProcessed();
                  }}
                  className="mt-3 w-full accent-blue-600"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void createPreview()}
              disabled={processing || uploading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <ImagePlus size={17} />
              )}
              {processing ? "Optimizing…" : "Create optimized preview"}
            </button>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">Optimized photo</h3>
            {processed ? (
              <>
                <img
                  src={processed.url}
                  alt="Optimized profile photo preview"
                  className="mx-auto mt-4 aspect-square w-full max-w-56 rounded-3xl object-cover shadow-sm"
                />
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Original</dt>
                    <dd className="font-semibold text-slate-800">
                      {formatFileSize(source.file.size)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Optimized</dt>
                    <dd className="font-semibold text-green-700">
                      {formatFileSize(processed.blob.size)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Saved</dt>
                    <dd className="font-semibold text-slate-800">
                      {savedPercent}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Output</dt>
                    <dd className="font-semibold text-slate-800">
                      {processed.width} × {processed.width}{" "}
                      {processed.format === "image/webp" ? "WEBP" : "JPEG"}
                    </dd>
                  </div>
                </dl>

                {uploading ? (
                  <div className="mt-5" aria-live="polite">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Uploading</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-[width]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleUpload()}
                  disabled={uploading || processing}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <LoaderCircle className="animate-spin" size={17} />
                  ) : (
                    <Upload size={17} />
                  )}
                  {uploading ? "Uploading…" : "Upload profile photo"}
                </button>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm leading-6 text-slate-500">
                Adjust your crop, then create a preview to see the optimized
                size before uploading.
              </div>
            )}
          </aside>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Choose profile photo"
      />
    </section>
  );
}
