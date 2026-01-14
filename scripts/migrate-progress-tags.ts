import { PrismaClient } from '@prisma/client';
import { PROGRESS_TAGS, PROGRESS_TAGS_WITH_EMOJI } from '../src/app/constants/progress.constants';

const prisma = new PrismaClient();

/**
 * Extrait les tags du contenu d'un progrès et retourne les labels des tags trouvés
 */
function extractTagsFromContent(content: string): string[] {
  const foundTags: string[] = [];

  PROGRESS_TAGS.forEach(({ label, emoji }) => {
    if (PROGRESS_TAGS_WITH_EMOJI.includes(label as typeof PROGRESS_TAGS_WITH_EMOJI[number])) {
      const tagPattern = `${emoji}${label}${emoji}`;
      if (content.includes(tagPattern)) {
        foundTags.push(label);
      }
    } else {
      // Pour Confort, chercher juste le label
      if (content.includes(label)) {
        foundTags.push(label);
      }
    }
  });

  return foundTags;
}

/**
 * Nettoie le contenu en retirant les tags
 */
function cleanContentFromTags(content: string): string {
  let cleanContent = content;

  PROGRESS_TAGS.forEach(({ label, emoji }) => {
    if (PROGRESS_TAGS_WITH_EMOJI.includes(label as typeof PROGRESS_TAGS_WITH_EMOJI[number])) {
      const tagPattern = `${emoji}${label}${emoji}`;
      const regex = new RegExp(`\\s*${tagPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
      cleanContent = cleanContent.replace(regex, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Pour Confort, chercher juste le label
      const regex = new RegExp(`\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
      cleanContent = cleanContent.replace(regex, ' ').replace(/\s+/g, ' ').trim();
    }
  });

  return cleanContent;
}

async function main() {
  console.log('🔄 Migration des tags de progrès...');

  // Récupérer tous les progrès
  const allProgress = await prisma.progress.findMany();

  console.log(`📊 ${allProgress.length} progrès à traiter`);

  let migratedCount = 0;
  let cleanedCount = 0;

  for (const progress of allProgress) {
    const tags = extractTagsFromContent(progress.content);
    const cleanedContent = cleanContentFromTags(progress.content);

    // Si des tags ont été trouvés ou si le contenu a changé, mettre à jour
    if (tags.length > 0 || cleanedContent !== progress.content) {
      await prisma.progress.update({
        where: { id: progress.id },
        data: {
          tags: tags,
          content: cleanedContent,
        },
      });

      if (tags.length > 0) {
        migratedCount++;
        console.log(`  ✅ Progrès #${progress.id}: ${tags.length} tag(s) migré(s) - ${tags.join(', ')}`);
      }

      if (cleanedContent !== progress.content) {
        cleanedCount++;
      }
    }
  }

  console.log(`\n✨ Migration terminée !`);
  console.log(`   - ${migratedCount} progrès avec tags migrés`);
  console.log(`   - ${cleanedCount} progrès avec contenu nettoyé`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

