'use client';

import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/Button';
import { ProgressButton } from '@/app/components/ProgressButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { CompleteButton } from '@/app/components/ui/CompleteButton';
import { BackButton } from '@/app/components/BackButton';
import { ToggleButtonGroup } from '@/app/components/ui/ToggleButtonGroup';
import { FormActions } from '@/app/components/FormActions';
import { ShareIcon, EditIcon, CheckIcon, CalendarIcon } from '@/app/components/ui/icons';
import { useShareProgress } from '@/app/hooks/useShareProgress';
import { useDeleteConfirmation } from '@/app/hooks/useDeleteConfirmation';
import { BaseCard, Card, Badge } from '@/app/components/ui';
import { CategoryCardWithProgress } from '@/app/components/CategoryCardWithProgress';
import { StatsCard } from '@/app/components/historique/StatsCard';
import { MenuLink } from '@/app/components/MenuLink';
import { ProgressCard } from '@/app/components/historique/ProgressCard';
import { ProgressCardCompact } from '@/app/components/historique/ProgressCardCompact';
import { APHASIE_COLORS } from '@/app/constants/card.constants';
import type { Progress } from '@/app/types';

export default function StyleguidePage() {
  const [toggleValue, setToggleValue] = useState<'option1' | 'option2'>('option1');
  const deleteConfirmation = useDeleteConfirmation();
  const [completeState, setCompleteState] = useState(false);
  const [completeToday, setCompleteToday] = useState(false);

  // Exemple de progrès pour le partage
  const exampleProgress: Progress = {
    id: 1,
    userId: 1,
    content: 'Exemple de progrès',
    emoji: '⭐',
    createdAt: new Date().toISOString(),
  };
  
  const exampleCardRef = useRef<HTMLDivElement | null>(null);
  const { handleShare } = useShareProgress(exampleProgress, exampleCardRef);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Styleguide</h1>
        <p className="text-gray-600 mb-8">
          Recensement de tous les composants UI utilisés sur le site
        </p>

        {/* Button - Composant de base */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Button - Composant de base</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="action">Action</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="danger-outline">Danger Outline</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avec icône</h3>
                <div className="flex flex-wrap gap-2">
                  <Button icon={<CheckIcon className="w-5 h-5" />}>Avec icône gauche</Button>
                  <Button icon={<CheckIcon className="w-5 h-5" />} iconPosition="right">Avec icône droite</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tailles</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm">Petit</Button>
                  <Button size="md">Moyen</Button>
                  <Button size="lg">Grand</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Formes</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button rounded="md">Arrondi</Button>
                  <Button rounded="lg">Plus arrondi</Button>
                  <Button rounded="full">Rond</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">État disabled</h3>
                <Button disabled>Bouton Désactivé</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ProgressButton */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ProgressButton</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: inline</h3>
                <ProgressButton onClick={() => {}} variant="inline" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: fixed (position right)</h3>
                <div className="relative h-20 border-2 border-dashed border-gray-300 rounded-lg">
                  <ProgressButton onClick={() => {}} variant="fixed" position="right" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: fixed (position left)</h3>
                <div className="relative h-20 border-2 border-dashed border-gray-300 rounded-lg">
                  <ProgressButton onClick={() => {}} variant="fixed" position="left" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AddButton */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">AddButton</h2>
          <p className="text-xs text-gray-500 mb-2">Utilise Button en interne</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Sans label</h3>
                <AddButton href="/styleguide" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avec label</h3>
                <AddButton href="/styleguide" label="Ajouter" />
              </div>
            </div>
          </div>
        </section>

        {/* CompleteButton */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">CompleteButton</h2>
          <p className="text-xs text-gray-500 mb-2">Utilise Button en interne</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Exercice - Non complété</h3>
                <CompleteButton 
                  isCompleted={false} 
                  variant="exercice"
                  onClick={() => setCompleteState(!completeState)}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Exercice - Complété aujourd&apos;hui</h3>
                <CompleteButton 
                  isCompleted={true} 
                  isCompletedToday={true}
                  variant="exercice"
                  onClick={() => setCompleteToday(!completeToday)}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Exercice - Complété cette semaine</h3>
                <CompleteButton 
                  isCompleted={true} 
                  isCompletedToday={false}
                  variant="exercice"
                  weeklyCount={2}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Challenge - Non maîtrisé</h3>
                <CompleteButton 
                  isCompleted={false} 
                  variant="challenge"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Challenge - Maîtrisé</h3>
                <CompleteButton 
                  isCompleted={true} 
                  variant="challenge"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Button - Mode iconOnly (remplace IconButton) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Button - Mode iconOnly</h2>
          <p className="text-xs text-gray-500 mb-2">Remplace IconButton</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">État inactif</h3>
                <div className="flex gap-2">
                  <Button iconOnly>
                    <EditIcon className="w-5 h-5" />
                  </Button>
                  <Button iconOnly>
                    <CheckIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">État actif</h3>
                <div className="flex gap-2">
                  <Button iconOnly isActive>
                    <EditIcon className="w-5 h-5" />
                  </Button>
                  <Button iconOnly isActive activeClassName="bg-blue-50 text-blue-600 border-blue-200">
                    <CheckIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Exemple: Partage (avec hook useShareProgress)</h3>
                <Button
                  iconOnly
                  onClick={handleShare}
                  title="Partager sur WhatsApp"
                  aria-label={`Partager ce progrès sur WhatsApp : ${exampleProgress.content}`}
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* BackButton */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">BackButton</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avec href</h3>
                <BackButton backHref="/" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avec label personnalisé</h3>
                <BackButton backHref="/" backLabel="Retour à la page précédente" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Sans href (navigation par défaut)</h3>
                <BackButton />
              </div>
            </div>
          </div>
        </section>

        {/* ToggleButtonGroup */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ToggleButtonGroup</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Couleur: amber (par défaut)</h3>
                <ToggleButtonGroup
                  options={[
                    { value: 'option1', label: 'Option 1', icon: '📅' },
                    { value: 'option2', label: 'Option 2', icon: '📊' },
                  ]}
                  value={toggleValue}
                  onChange={(value) => setToggleValue(value as 'option1' | 'option2')}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Couleur: purple</h3>
                <ToggleButtonGroup
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                  ]}
                  value={toggleValue}
                  onChange={(value) => setToggleValue(value as 'option1' | 'option2')}
                  activeColor="purple"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">État: disabled</h3>
                <ToggleButtonGroup
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                  ]}
                  value={toggleValue}
                  onChange={(value) => setToggleValue(value as 'option1' | 'option2')}
                  disabled
                />
              </div>
            </div>
          </div>
        </section>

        {/* FormActions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">FormActions</h2>
          <p className="text-xs text-gray-500 mb-2">Utilise Button en interne</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avec bouton Annuler</h3>
                <FormActions
                  onCancel={() => {}}
                  onSubmitLabel="Enregistrer"
                  onCancelLabel="Annuler"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avec bouton Supprimer</h3>
                <FormActions
                  showDelete
                  onDelete={() => deleteConfirmation.handleClick(async () => {})}
                  deleteConfirm={deleteConfirmation.showConfirm}
                  onCancel={() => {}}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">État: loading</h3>
                <FormActions
                  loading
                  onCancel={() => {}}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Exemples d'utilisation avec hooks */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Exemples d&apos;utilisation avec hooks</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Button avec confirmation de suppression (useDeleteConfirmation)</h3>
                <Button
                  type="button"
                  onClick={() => deleteConfirmation.handleClick(async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  })}
                  disabled={deleteConfirmation.isDeleting}
                  variant={deleteConfirmation.showConfirm ? 'danger' : 'danger-outline'}
                  size="md"
                  rounded="lg"
                  className="w-full"
                >
                  {deleteConfirmation.isDeleting ? (
                    <span className="animate-spin">⏳</span>
                  ) : deleteConfirmation.showConfirm ? (
                    '⚠️ Confirmer la suppression'
                  ) : (
                    '🗑️ Supprimer'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CARDS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cards</h1>
          <p className="text-gray-600 mb-8">
            Recensement de tous les types de cartes utilisés sur le site
          </p>
        </div>

        {/* BaseCard - Composant de base */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">BaseCard - Composant de base</h2>
          <p className="text-xs text-gray-500 mb-2">Composant compound avec Accent, Content, Footer</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Carte normale</h3>
                <BaseCard>
                  <BaseCard.Accent color="bg-teal-500" />
                  <BaseCard.Content>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">Titre de la carte</h3>
                      <p className="text-sm text-gray-600 mt-1">Contenu de la carte</p>
                    </div>
                  </BaseCard.Content>
                  <BaseCard.Footer>
                    <Button iconOnly>
                      <EditIcon className="w-4 h-4" />
                    </Button>
                  </BaseCard.Footer>
                </BaseCard>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Carte dorée (isGolden) - Pour célébrations</h3>
                <BaseCard isGolden>
                  <BaseCard.Accent />
                  <BaseCard.Content>
                    <div className="p-4">
                      <h3 className="font-semibold text-amber-950">Progrès noté !</h3>
                      <p className="text-sm text-amber-700 mt-1">Célébration d&apos;un moment important</p>
                    </div>
                  </BaseCard.Content>
                  <BaseCard.Footer>
                    <Button iconOnly>
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                  </BaseCard.Footer>
                </BaseCard>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Carte avec accent personnalisé</h3>
                <BaseCard>
                  <BaseCard.Accent color="bg-blue-500" width="w-2" />
                  <BaseCard.Content>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">Carte avec accent bleu</h3>
                      <p className="text-sm text-gray-600 mt-1">Accent personnalisable</p>
                    </div>
                  </BaseCard.Content>
                </BaseCard>
              </div>
            </div>
          </div>
        </section>

        {/* Card - Composant simple */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Card - Composant simple</h2>
          <p className="text-xs text-gray-500 mb-2">Pour contenus statiques</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: default</h3>
                <Card variant="default">
                  <p className="text-gray-700">Contenu de la carte par défaut</p>
                </Card>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: elevated</h3>
                <Card variant="elevated">
                  <p className="text-gray-700">Carte avec ombre plus prononcée</p>
                </Card>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: outlined</h3>
                <Card variant="outlined">
                  <p className="text-gray-700">Carte avec bordure épaisse</p>
                </Card>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variant: subtle</h3>
                <Card variant="subtle">
                  <p className="text-gray-700">Carte avec fond gris clair</p>
                </Card>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Padding: sm, md (défaut), lg</h3>
                <div className="space-y-2">
                  <Card padding="sm">
                    <p className="text-gray-700 text-sm">Padding small</p>
                  </Card>
                  <Card padding="md">
                    <p className="text-gray-700">Padding medium (défaut)</p>
                  </Card>
                  <Card padding="lg">
                    <p className="text-gray-700">Padding large</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CategoryCardWithProgress */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">CategoryCardWithProgress</h2>
          <p className="text-xs text-gray-500 mb-2">Carte de catégorie avec jauge de progression</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Haut du corps - Sans progression</h3>
                <CategoryCardWithProgress category="UPPER_BODY" total={5} completedCount={0} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Milieu du corps - En cours</h3>
                <CategoryCardWithProgress category="CORE" total={8} completedCount={3} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bas du corps - Complété</h3>
                <CategoryCardWithProgress category="LOWER_BODY" total={6} completedCount={6} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Étirement - Avec bonus</h3>
                <CategoryCardWithProgress category="STRETCHING" total={4} completedCount={6} />
              </div>
            </div>
          </div>
        </section>

        {/* StatsCard */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">StatsCard</h2>
          <p className="text-xs text-gray-500 mb-2">Carte de statistique carrée</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard
                value={12}
                label="Exercices"
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-200"
              />
              <StatsCard
                value="5j"
                label="Streak"
                bgColor="bg-green-50"
                textColor="text-green-700"
                borderColor="border-green-200"
              />
              <StatsCard
                value="85%"
                label="Progression"
                bgColor="bg-amber-50"
                textColor="text-amber-700"
                borderColor="border-amber-200"
              />
              <StatsCard
                value={24}
                label="Total"
                bgColor="bg-purple-50"
                textColor="text-purple-700"
                borderColor="border-purple-200"
              />
            </div>
          </div>
        </section>

        {/* MenuLink */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">MenuLink</h2>
          <p className="text-xs text-gray-500 mb-2">Carte de navigation réutilisable</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">MenuLink - Horizontal (défaut)</h3>
                <MenuLink
                  href="/styleguide"
                  icon="📊"
                  title="Statistiques"
                  description="Voir mes statistiques"
                  iconBgColor="bg-blue-100"
                  iconTextColor="text-blue-700"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">MenuLink - Vertical</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MenuLink
                    href="/styleguide"
                    icon="🎯"
                    title="Exercices"
                    description="Mes exercices"
                    variant="vertical"
                    iconBgColor="bg-orange-100"
                    iconTextColor="text-orange-700"
                  />
                  <MenuLink
                    href="/styleguide"
                    icon="⭐"
                    title="Progrès"
                    description="Mes progrès"
                    variant="vertical"
                    iconBgColor="bg-amber-100"
                    iconTextColor="text-amber-700"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">MenuLink - Style secondaire</h3>
                <MenuLink
                  href="/styleguide"
                  icon="⚙️"
                  title="Paramètres"
                  description="Mes paramètres"
                  isSecondary
                  iconBgColor="bg-gray-100"
                  iconTextColor="text-gray-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ProgressCard */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ProgressCard</h2>
          <p className="text-xs text-gray-500 mb-2">Carte de progrès avec style doré (isGolden)</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Carte normale</h3>
                <ProgressCard
                  progress={{
                    id: 1,
                    userId: 1,
                    content: 'Premier exercice complété !',
                    emoji: '⭐',
                    createdAt: new Date().toISOString(),
                  }}
                  onEdit={() => {}}
                  onShare={() => {}}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Carte compacte</h3>
                <ProgressCard
                  progress={{
                    id: 2,
                    userId: 1,
                    content: 'Progrès compact',
                    emoji: '🎉',
                    createdAt: new Date().toISOString(),
                  }}
                  compact
                />
              </div>
            </div>
          </div>
        </section>

        {/* ProgressCardCompact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ProgressCardCompact</h2>
          <p className="text-xs text-gray-500 mb-2">Carte de progrès ultra-compacte pour modales</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Carte compacte</h3>
                <ProgressCardCompact
                  progress={{
                    id: 3,
                    userId: 1,
                    content: 'Progrès noté aujourd\'hui',
                    emoji: '⭐',
                    createdAt: new Date().toISOString(),
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Exemples d'utilisation BaseCard */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Exemples d&apos;utilisation BaseCard</h2>
          <p className="text-xs text-gray-500 mb-2">Cartes métier utilisant BaseCard</p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">AphasieItemCard - Citation</h3>
                <BaseCard as="li">
                  <BaseCard.Content>
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                            &quot;Je vais chercher le pain&quot;
                          </h3>
                          <p className="text-base md:text-lg text-gray-700 italic">
                            Je vais acheter le pain
                          </p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 shrink-0 flex items-center gap-1.5">
                          <CalendarIcon className="w-3 h-3" />
                          <span>5 janv. 2026</span>
                        </Badge>
                      </div>
                    </div>
                  </BaseCard.Content>
                  <BaseCard.Footer>
                    <Button iconOnly>
                      <EditIcon className="w-4 h-4" />
                    </Button>
                  </BaseCard.Footer>
                </BaseCard>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">AphasieChallengeCard - Exercice orthophonique</h3>
                <BaseCard as="li">
                  <BaseCard.Accent color={APHASIE_COLORS.SOLAR_YELLOW} />
                  <BaseCard.Content>
                    <div className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
                            Répéter &quot;Bonjour, comment allez-vous ?&quot;
                          </div>
                        </div>
                      </div>
                    </div>
                    <BaseCard.Footer>
                      <Button iconOnly>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <CompleteButton isCompleted={false} variant="challenge" />
                    </BaseCard.Footer>
                  </BaseCard.Content>
                </BaseCard>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">ExerciceCard - Exercice physique (exemple simplifié)</h3>
                <BaseCard>
                  <BaseCard.Accent color="bg-orange-500" />
                  <BaseCard.Content>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-800">
                            Pompes
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            3 séries de 10 répétitions
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700">
                          Haut du corps
                        </Badge>
                      </div>
                    </div>
                    <BaseCard.Footer>
                      <Button iconOnly isActive>
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                      <Button iconOnly>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <CompleteButton isCompleted={false} variant="exercice" />
                    </BaseCard.Footer>
                  </BaseCard.Content>
                </BaseCard>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
