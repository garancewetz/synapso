'use client';

import { useState, useCallback } from 'react';
import { Loader } from './ui';
import { ErrorMessage } from './ErrorMessage';
import clsx from 'clsx';

type MediaItem = {
  url: string;
  publicId: string;
};

type MediaData = {
  photos?: MediaItem[];
  video?: MediaItem | null;
};

type Props = {
  value: MediaData | null;
  onChange: (media: MediaData | null) => void;
};

const MAX_PHOTOS = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export function MediaUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const photos = value?.photos || [];
  const video = value?.video;
  const hasVideo = !!video;
  const canAddPhotos = photos.length < MAX_PHOTOS && !hasVideo;

  const handleFileSelect = useCallback(async (file: File, resourceType: 'image' | 'video') => {
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Vérifier la taille
      const maxSize = resourceType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        throw new Error(`Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      }

      // Créer FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', resourceType);

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
      if (resourceType === 'image') {
        // Si on ajoute une photo mais qu'il y a déjà une vidéo, remplacer la vidéo
        if (hasVideo) {
          onChange({
            photos: [{ url: result.url, publicId: result.publicId }],
            video: null,
          });
        } else {
          onChange({
            ...value,
            photos: [...photos, { url: result.url, publicId: result.publicId }],
            video: null,
          });
        }
      } else {
        // Si on ajoute une vidéo, supprimer toutes les photos
        onChange({
          photos: [],
          video: { url: result.url, publicId: result.publicId },
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [value, photos, hasVideo, onChange]);

  const handleImageInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'image');
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    e.target.value = '';
  }, [handleFileSelect]);

  const handleVideoInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'video');
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    e.target.value = '';
  }, [handleFileSelect]);

  const removePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos.length > 0 || video ? { ...value, photos: newPhotos, video } : null);
  }, [photos, video, value, onChange]);

  const removeVideo = useCallback(() => {
    onChange(photos.length > 0 ? { ...value, video: null } : null);
  }, [photos, value, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Médias (optionnel)
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Ajoutez jusqu'à {MAX_PHOTOS} photos ou 1 vidéo (mutuellement exclusif)
        </p>

        <ErrorMessage message={error} />

        {/* Photos existantes */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {photos.map((photo, index) => (
              <div key={photo.publicId} className="relative group">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
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

        {/* Vidéo existante */}
        {video && (
          <div className="mb-4 relative group">
            <video
              src={video.url}
              controls
              className="w-full max-w-md rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95"
              aria-label="Supprimer la vidéo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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

          {!hasVideo && (
            <label className="flex-1">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoInput}
                disabled={uploading}
                className="hidden"
                aria-label="Ajouter une vidéo"
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
                  <span>🎥 Ajouter une vidéo</span>
                )}
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

