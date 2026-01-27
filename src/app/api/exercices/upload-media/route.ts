import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Limites de taille (en bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Upload un fichier vers Cloudinary
 */
function uploadToCloudinary(buffer: Buffer, resourceType: 'image' | 'video'): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    // S'assurer que la configuration est à jour
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Options d'upload - format simple pour éviter les problèmes de signature
    const uploadOptions = {
      resource_type: resourceType as 'image' | 'video',
      folder: 'exercices',
      // Les transformations peuvent être appliquées lors de la récupération de l'image
      // plutôt que lors de l'upload pour éviter les problèmes de signature
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: no result'));
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Configuration Cloudinary manquante' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const resourceType = formData.get('resourceType') as 'image' | 'video' | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!resourceType || (resourceType !== 'image' && resourceType !== 'video')) {
      return NextResponse.json(
        { error: 'Type de ressource invalide. Doit être "image" ou "video"' },
        { status: 400 }
      );
    }

    // Vérifier le type MIME
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedTypes = resourceType === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier
    const fileSize = file.size;
    const maxSize = resourceType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    
    if (fileSize > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Vérifier les magic bytes pour une sécurité supplémentaire
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Vérifier les signatures de fichiers (magic bytes)
    if (resourceType === 'image') {
      const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      const isGIF = buffer.toString('ascii', 0, 3) === 'GIF';
      const isWebP = buffer.toString('ascii', 8, 12) === 'WEBP';
      
      if (!isJPEG && !isPNG && !isGIF && !isWebP) {
        return NextResponse.json(
          { error: 'Le fichier n\'est pas une image valide' },
          { status: 400 }
        );
      }
    } else {
      // Pour les vidéos, vérifier les signatures communes
      const isMP4 = buffer.toString('ascii', 4, 8) === 'ftyp';
      const isWebM = buffer.toString('ascii', 0, 4) === 'webm';
      
      // Note: Les vidéos peuvent avoir des formats variés, donc on est moins strict
      // mais on vérifie au moins que ce n'est pas une image
      const isImage = buffer[0] === 0xFF && buffer[1] === 0xD8; // JPEG
      if (isImage) {
        return NextResponse.json(
          { error: 'Le fichier est une image, pas une vidéo' },
          { status: 400 }
        );
      }
    }


    // Upload vers Cloudinary
    const result = await uploadToCloudinary(buffer, resourceType);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    logError('Error uploading media to Cloudinary', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du média' },
      { status: 500 }
    );
  }
}

