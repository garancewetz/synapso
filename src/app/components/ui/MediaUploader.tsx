'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Loader } from '@/app/components/ui';
import { ErrorMessage } from '@/app/components/ErrorMessage';
import clsx from 'clsx';
import type { MediaItem } from '@/app/types/exercice';

type Props = {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  /** Nombre maximum de médias autorisés */
  maxItems?: number;
  /** Autoriser la sélection multiple */
  multiple?: boolean;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const COMPRESS_MAX_WIDTH = 1200;
const COMPRESS_QUALITY = 0.8;

/** Compresse et convertit l'image en JPEG via Canvas (résout les problèmes HEIC iOS + réduit la taille) */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > COMPRESS_MAX_WIDTH) {
        height = Math.round((height * COMPRESS_MAX_WIDTH) / width);
        width = COMPRESS_MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas non disponible'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Échec de la compression'));
          }
        },
        'image/jpeg',
        COMPRESS_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de charger l\'image'));
    };

    img.src = url;
  });
}

export function MediaUploader({ value, onChange, maxItems = 3, multiple = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const items = useMemo(() => value || [], [value]);
  const canAdd = items.length < maxItems;

  const handleFilesSelect = useCallback(async (files: File[]) => {
    setError('');
    setUploading(true);

    try {
      const remainingSlots = maxItems - items.length;
      const filesToUpload = files.slice(0, remainingSlots);

      for (const file of filesToUpload) {
        if (file.size > MAX_IMAGE_SIZE) {
          const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024);
          throw new Error(`Le fichier "${file.name}" est trop volumineux. Taille maximale: ${maxSizeMB}MB`);
        }
      }

      // Compression + upload en parallèle
      const uploadResults = await Promise.all(
        filesToUpload.map(async (file) => {
          const compressed = await compressImage(file);

          const formData = new FormData();
          formData.append('file', compressed, 'photo.jpg');
          formData.append('resourceType', 'image');

          const response = await fetch('/api/exercices/upload-media', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l\'upload');
          }

          return response.json();
        })
      );

      const newItems: MediaItem[] = uploadResults.map((result) => ({
        url: result.url,
        publicId: result.publicId,
      }));

      onChange([...items, ...newItems]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [items, maxItems, onChange]);

  const handleImageInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
    e.target.value = '';
  }, [handleFilesSelect]);

  const removeItem = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 text-center mb-2">Médias (optionnel)</p>
        <p className="text-xs text-gray-400 text-center mb-3">
          Jusqu&apos;à {maxItems} médias
        </p>

        <ErrorMessage message={error} />

        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {items.map((item, index) => (
              <div key={item.publicId} className="relative group">
                <Image
                  src={item.url}
                  alt={`Photo ${index + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-2 right-2 bg-gray-700/80 hover:bg-gray-800 text-white rounded-full p-1.5 opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 active:scale-95"
                  aria-label={`Supprimer la photo ${index + 1}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {canAdd && (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleImageInput}
              disabled={uploading}
              className="hidden"
              aria-label="Ajouter des médias"
            />
            <div
              className={clsx(
                'px-3 py-2 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors text-sm',
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-400',
                uploading
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
              )}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size="md" />
                  <span>Upload...</span>
                </div>
              ) : (
                <span>📷 Ajouter ({items.length}/{maxItems})</span>
              )}
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
