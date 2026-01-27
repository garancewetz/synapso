import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type MediaData = {
  photos?: Array<{ url: string; publicId: string }>;
  video?: { url: string; publicId: string } | null;
};

/**
 * Supprime un média de Cloudinary
 */
export async function deleteCloudinaryMedia(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    // Log l'erreur mais ne pas faire échouer la suppression
    // car le fichier peut déjà être supprimé ou ne pas exister
    console.error(`Erreur lors de la suppression du média ${publicId}:`, error);
  }
}

/**
 * Supprime tous les médias associés à un exercice
 */
export async function deleteExerciceMedia(media: MediaData | null | undefined): Promise<void> {
  if (!media) return;

  const deletePromises: Promise<void>[] = [];

  // Supprimer les photos
  if (media.photos && Array.isArray(media.photos)) {
    media.photos.forEach((photo) => {
      if (photo.publicId) {
        deletePromises.push(deleteCloudinaryMedia(photo.publicId, 'image'));
      }
    });
  }

  // Exécuter toutes les suppressions en parallèle
  await Promise.all(deletePromises);
}

/**
 * Supprime une seule photo de Cloudinary
 */
export async function deletePhoto(photo: { url: string; publicId: string }): Promise<void> {
  if (photo.publicId) {
    await deleteCloudinaryMedia(photo.publicId, 'image');
  }
}

