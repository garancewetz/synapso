'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Loader } from './ui';
import { ErrorMessage } from './ErrorMessage';
import clsx from 'clsx';

type MediaItem = {
  url: string;
  publicId: string;
};

type MediaData = {
  photos?: MediaItem[];
};

type Props = {
  value: MediaData | null;
  onChange: (media: MediaData | null) => void;
};

const MAX_PHOTOS = 3;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function MediaUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const photos = useMemo(() => value?.photos || [], [value?.photos]);
  const canAddPhotos = photos.length < MAX_PHOTOS;

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    try {
      // Vérifier la taille
      if (file.size > MAX_IMAGE_SIZE) {
        const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024);
        throw new Error(`Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      }

      // Créer FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'image');

      // Upload
      const response = await fetch('/api/exercices/upload-media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();

      // Mettre à jour l'état
      onChange({
        ...value,
        photos: [...photos, { url: result.url, publicId: result.publicId }],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [value, photos, onChange]);

  const handleImageInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    e.target.value = '';
  }, [handleFileSelect]);

  const removePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos.length > 0 ? { ...value, photos: newPhotos } : null);
  }, [photos, value, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Médias (optionnel)
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Ajoutez jusqu&apos;à {MAX_PHOTOS} photos
        </p>

        <ErrorMessage message={error} />

        {/* Photos existantes */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {photos.map((photo, index) => (
              <div key={photo.publicId} className="relative group">
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95"
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

        {/* Boutons d'upload */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canAddPhotos && (
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageInput}
                disabled={uploading}
                className="hidden"
                aria-label="Ajouter une photo"
              />
              <div
                className={clsx(
                  'px-4 py-3 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors',
                  'focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-400',
                  uploading
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                )}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size="small" />
                    <span>Upload en cours...</span>
                  </div>
                ) : (
                  <span>📷 Ajouter une photo ({photos.length}/{MAX_PHOTOS})</span>
                )}
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

