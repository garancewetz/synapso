'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Loader } from './ui';
import { ErrorMessage } from './ErrorMessage';
import clsx from 'clsx';

type Props = {
  value: string[];
  onChange: (medias: string[]) => void;
};

const MAX_MEDIAS = 2;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function MediaUploaderProgress({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const medias = value || [];
  const canAddMedias = medias.length < MAX_MEDIAS;

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    try {
      if (file.size > MAX_IMAGE_SIZE) {
        const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024);
        throw new Error(`Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      }

      const formData = new FormData();
      formData.append('file', file);
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

      const result = await response.json();

      onChange([...medias, result.url]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [medias, onChange]);

  const handleImageInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  }, [handleFileSelect]);

  const removeMedia = useCallback((index: number) => {
    const newMedias = medias.filter((_, i) => i !== index);
    onChange(newMedias);
  }, [medias, onChange]);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500 text-center mb-2">Médias (optionnel)</p>
        <p className="text-xs text-gray-400 text-center mb-3">
          Jusqu&apos;à {MAX_MEDIAS} médias
        </p>

        <ErrorMessage message={error} className="mb-2" />

        {medias.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {medias.map((mediaUrl, index) => (
              <div key={mediaUrl} className="relative group">
                <Image
                  src={mediaUrl}
                  alt={`Média ${index + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-gray-700/80 hover:bg-gray-800 text-white rounded-full p-1.5 opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 active:scale-95"
                  aria-label={`Supprimer le média ${index + 1}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {canAddMedias && (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInput}
              disabled={uploading}
              className="hidden"
              aria-label="Ajouter un média"
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
                  <Loader size="small" />
                  <span>Upload...</span>
                </div>
              ) : (
                <span>📷 Ajouter ({medias.length}/{MAX_MEDIAS})</span>
              )}
            </div>
          </label>
        )}
      </div>
    </div>
  );
}

