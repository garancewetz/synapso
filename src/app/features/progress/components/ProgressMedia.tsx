'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Lightbox } from '@/app/components/ui/Lightbox';

type Props = {
  medias: string[];
  className?: string;
  maxPhotos?: number;
  initialLightboxIndex?: number | null;
  onLightboxClose?: () => void;
  onLightboxOpen?: (index: number) => void;
  showThumbnails?: boolean;
  showLightbox?: boolean;
  title?: string;
};

export function ProgressMedia({ medias, className = '', maxPhotos = 3, initialLightboxIndex = null, onLightboxClose, onLightboxOpen, showThumbnails = true, showLightbox = true, title }: Props) {
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

  if (!medias || medias.length === 0) {
    return null;
  }

  const photosToShow = medias.slice(0, maxPhotos);
  const remainingCount = medias.length - maxPhotos;

  // Préparer les images pour le Lightbox
  const lightboxImages = medias.map((url, index) => ({
    url,
    alt: `Photo du progrès ${index + 1} sur ${medias.length}`,
  }));

  return (
    <>
      {showThumbnails && (
        <div className={clsx('w-full', className)}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {photosToShow.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={(e) => openLightbox(index, e)}
                className="relative w-full h-24 md:h-32 rounded-lg border border-amber-200/60 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-[0.98] transition-transform"
                aria-label={`Voir la photo ${index + 1} en grand`}
              >
                <Image
                  src={`${url}?f_auto,q_auto`}
                  alt={`Photo du progrès ${index + 1}${medias.length > 1 ? ` sur ${medias.length}` : ''}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                  onError={() => {
                    console.error('Erreur de chargement de l\'image:', url);
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

