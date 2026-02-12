'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Lightbox } from '@/app/components/ui/Lightbox';

type MediaItem = {
  url: string;
  publicId: string;
};

type MediaData = {
  photos?: MediaItem[];
};

type Props = {
  media: MediaData | null | undefined;
  className?: string;
  maxPhotos?: number;
  initialLightboxIndex?: number | null;
  onLightboxClose?: () => void;
  onLightboxOpen?: (index: number) => void;
  showThumbnails?: boolean;
  showLightbox?: boolean;
  title?: string;
};

export function ExerciceMedia({ media, className = '', maxPhotos = 3, initialLightboxIndex = null, onLightboxClose, onLightboxOpen, showThumbnails = true, showLightbox = true, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(showLightbox ? (initialLightboxIndex ?? null) : null);

  // Synchroniser avec la prop initialLightboxIndex (uniquement si showLightbox est activé)
  useEffect(() => {
    if (showLightbox) {
      if (initialLightboxIndex !== null && initialLightboxIndex !== lightboxIndex) {
        setLightboxIndex(initialLightboxIndex);
      } else if (initialLightboxIndex === null && lightboxIndex !== null) {
        setLightboxIndex(null);
      }
    } else {
      // Si showLightbox est désactivé, s'assurer que l'état est null
      if (lightboxIndex !== null) {
        setLightboxIndex(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLightboxIndex, showLightbox]);

  const openLightbox = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toujours notifier le parent, même si on n'affiche pas le lightbox local
    onLightboxOpen?.(index);
    // Ne mettre à jour l'état local que si showLightbox est activé
    if (showLightbox) {
      setLightboxIndex(index);
    }
  }, [onLightboxOpen, showLightbox]);

  const closeLightbox = useCallback(() => {
    if (showLightbox) {
      setLightboxIndex(null);
    }
    onLightboxClose?.();
  }, [onLightboxClose, showLightbox]);

  const handleIndexChange = useCallback((index: number) => {
    if (showLightbox) {
      setLightboxIndex(index);
    }
    onLightboxOpen?.(index);
  }, [onLightboxOpen, showLightbox]);

  if (!media) return null;

  const photos = media.photos || [];

  if (photos.length === 0) {
    return null;
  }

  const photosToShow = photos.slice(0, maxPhotos);
  const remainingCount = photos.length - maxPhotos;

  // Préparer les images pour le Lightbox (limité à maxPhotos)
  const lightboxImages = photos.slice(0, maxPhotos).map((photo, index) => ({
    url: photo.url,
    alt: `Photo de l'exercice ${index + 1} sur ${Math.min(photos.length, maxPhotos)}`,
  }));

  return (
    <>
      {showThumbnails && (
        <div className={clsx('w-full', className)}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {photosToShow.map((photo, index) => (
              <button
                key={photo.publicId}
                type="button"
                onClick={(e) => openLightbox(index, e)}
                className="relative w-full h-24 md:h-32 rounded-lg border border-gray-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-[0.98] transition-transform"
                aria-label={`Voir la photo ${index + 1} en grand`}
              >
                <Image
                  src={`${photo.url}?f_auto,q_auto`}
                  alt={`Photo de l'exercice ${index + 1}${photos.length > 1 ? ` sur ${photos.length}` : ''}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                  onError={() => {
                    console.error('Erreur de chargement de l\'image:', photo.url);
                  }}
                />
                {index === maxPhotos - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="text-white font-semibold text-sm">+{remainingCount}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onIndexChange={handleIndexChange}
          title={title}
        />
      )}
    </>
  );
}
