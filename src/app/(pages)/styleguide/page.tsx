'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { ProgressButton } from '@/app/components/ui/ProgressButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { CompleteButton } from '@/app/components/ui/CompleteButton';
import { BackButton } from '@/app/components/ui/BackButton';
import { ToggleButtonGroup } from '@/app/components/ui/ToggleButtonGroup';
import { SegmentedControl } from '@/app/components/ui/SegmentedControl';
import { FormActions } from '@/app/components/FormActions';
import { EditIcon, CheckIcon, SparklesIcon } from '@/app/components/ui/icons';
import { useDeleteConfirmation } from '@/app/hooks/useDeleteConfirmation';
import { 
  BaseCard, 
  Card, 
  Badge, 
  Input, 
  Textarea, 
  InputWithSpeech, 
  TextareaWithSpeech,
  Loader,
  Logo,
  PeriodNavigation,
  Accordion,
  ViewAllLink,
  WeeklyCompletionIndicator
} from '@/app/components/ui';
import { WelcomeHeader } from '@/app/components/WelcomeHeader';

/**
 * Composant de carte pour afficher un composant UI dans le styleguide
 */
type ComponentCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function ComponentCard({ 
  title, 
  description, 
  children 
}: ComponentCardProps) {
  return (
    <Card variant="default" padding="md" className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 mb-6">{description}</p>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </Card>
  );
}

export default function StyleguidePage() {
  const [toggleValue, setToggleValue] = useState<'option1' | 'option2'>('option1');
  const deleteConfirmation = useDeleteConfirmation();
  const [completeState, setCompleteState] = useState(false);
  const [completeToday, setCompleteToday] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [inputSpeechValue, setInputSpeechValue] = useState('');
  const [textareaSpeechValue, setTextareaSpeechValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Styleguide</h1>
        <p className="text-gray-600 mb-8">
          Documentation complète de tous les composants UI disponibles
        </p>

        {/* ============================================ */}
        {/* BUTTONS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Boutons</h1>
          <p className="text-gray-600 mb-8">
            Tous les composants bouton disponibles
          </p>
        </div>

        {/* Button */}
        <ComponentCard 
          title="Button" 
          description="Bouton d&apos;action standard avec support du forwardRef"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="action">Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="danger-outline">Danger Outline</Button>
              <Button variant="golden">Golden</Button>
              <Button variant="simple">Simple</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Tailles</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm">Petit</Button>
              <Button size="md">Moyen</Button>
              <Button size="lg">Grand</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Formes</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Button rounded="md">Arrondi</Button>
              <Button rounded="lg">Plus arrondi</Button>
              <Button rounded="full">Rond</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Avec icône</h3>
            <div className="flex flex-wrap gap-2">
              <Button icon={<CheckIcon className="w-5 h-5" />}>Icône gauche</Button>
              <Button icon={<CheckIcon className="w-5 h-5" />} iconPosition="right">Icône droite</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Mode iconOnly</h3>
            <div className="flex gap-2">
              <Button iconOnly>
                <EditIcon className="w-5 h-5" />
              </Button>
              <Button iconOnly isActive>
                <CheckIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">États</h3>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Désactivé</Button>
            </div>
          </div>
        </ComponentCard>

        {/* CompleteButton */}
        <ComponentCard 
          title="CompleteButton" 
          description="Bouton spécial pour marquer un exercice comme fait"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">États</h3>
            <div className="flex flex-wrap gap-2">
              <CompleteButton 
                isCompleted={false} 
                onClick={() => setCompleteState(!completeState)}
              />
              <CompleteButton 
                isCompleted={true} 
                isCompletedToday={completeToday}
                onClick={() => setCompleteToday(!completeToday)}
              />
            </div>
          </div>
        </ComponentCard>

        {/* ActionButton */}
        <ComponentCard 
          title="ActionButton" 
          description="Bouton d&apos;action unifié - Gros bouton sans variant par défaut"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Sans variant (par défaut)</h3>
            <div className="flex flex-wrap gap-2">
              <Button>Bouton sans variant</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Avec variants (pour AddButton)</h3>
            <div className="flex flex-wrap gap-2">
              <AddButton href="/test" label="Ajouter (variant simple)" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Les variants &apos;golden&apos; et &apos;simple&apos; sont utilisés uniquement par AddButton.
              Button et ProgressButton utilisent ActionButton sans variant.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Display modes</h3>
            <p className="text-xs text-gray-400 mb-2">
              Les modes fixed/inline sont gérés par ProgressButton et AddButton
            </p>
          </div>
        </ComponentCard>

        {/* AddButton */}
        <ComponentCard 
          title="AddButton" 
          description="Bouton d&apos;ajout utilisant ActionButton avec variant simple"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemples</h3>
            <div className="flex flex-wrap gap-2">
              <AddButton href="/test" label="Ajouter" />
            </div>
          </div>
        </ComponentCard>

        {/* ProgressButton */}
        <ComponentCard 
          title="ProgressButton" 
          description="Bouton de progrès utilisant ActionButton sans variant"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Display modes</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Inline</p>
                <ProgressButton onClick={() => {}} variant="inline" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Fixed (right)</p>
                <div className="relative h-20">
                  <ProgressButton onClick={() => {}} variant="fixed" position="right" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Fixed (left)</p>
                <div className="relative h-20">
                  <ProgressButton onClick={() => {}} variant="fixed" position="left" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mt-4">
              ProgressButton utilise ActionButton sans variant (gros bouton par défaut).
            </p>
          </div>
        </ComponentCard>

        {/* BackButton */}
        <ComponentCard 
          title="BackButton" 
          description="Bouton de retour en arrière"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <BackButton />
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* CARDS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cartes</h1>
          <p className="text-gray-600 mb-8">
            Composants de carte pour afficher du contenu
          </p>
        </div>

        {/* Card */}
        <ComponentCard 
          title="Card" 
          description="Carte simple pour contenus statiques sans actions"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Variants</h3>
            <div className="space-y-4">
              <Card variant="default" padding="md">
                <p>Card default</p>
              </Card>
              <Card variant="outlined" padding="md">
                <p>Card outlined</p>
              </Card>
              <Card variant="subtle" padding="md">
                <p>Card subtle</p>
              </Card>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Padding</h3>
            <div className="space-y-4">
              <Card variant="default" padding="none">
                <p>Padding none</p>
              </Card>
              <Card variant="default" padding="sm">
                <p>Padding sm</p>
              </Card>
              <Card variant="default" padding="md">
                <p>Padding md (défaut)</p>
              </Card>
              <Card variant="default" padding="lg">
                <p>Padding lg</p>
              </Card>
            </div>
          </div>
        </ComponentCard>

        {/* BaseCard */}
        <ComponentCard 
          title="BaseCard" 
          description="Carte universel avec compound pattern pour cartes interactives"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Structure normale</h3>
            <BaseCard>
              <BaseCard.Accent color="bg-teal-500" />
              <BaseCard.Content>
                <div className="p-4">
                  <p>Contenu de la carte</p>
                </div>
              </BaseCard.Content>
              <BaseCard.Footer>
                <Button variant="secondary" size="sm">Action</Button>
              </BaseCard.Footer>
            </BaseCard>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Variante dorée (isGolden)</h3>
            <BaseCard isGolden>
              <BaseCard.Accent />
              <BaseCard.Content>
                <div className="p-4">
                  <p>Victoire !</p>
                </div>
              </BaseCard.Content>
              <BaseCard.Footer>
                <span>🎉</span>
              </BaseCard.Footer>
            </BaseCard>
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* BADGES */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Badges</h1>
          <p className="text-gray-600 mb-8">
            Petits éléments d&apos;information visuelle
          </p>
        </div>

        {/* Badge */}
        <ComponentCard 
          title="Badge" 
          description="Badge générique avec variants et couleurs personnalisables"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="workout">Workout</Badge>
              <Badge variant="equipment">Equipment</Badge>
              <Badge variant="completed" icon={<CheckIcon className="w-3.5 h-3.5" />}>
                Fait
              </Badge>
              <Badge variant="mastered" icon={<SparklesIcon className="w-3.5 h-3.5" />}>
                Maîtrisé
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Avec icône (emoji)</h3>
            <div className="flex flex-wrap gap-2">
              <Badge icon="🏋️" variant="equipment">Haltères</Badge>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Avec couleurs personnalisées</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-orange-100 text-orange-600">
                Orange
              </Badge>
              <Badge variant="default" className="bg-blue-100 text-blue-600">
                Bleu
              </Badge>
            </div>
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* FORM INPUTS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Champs de formulaire</h1>
          <p className="text-gray-600 mb-8">
            Composants pour la saisie de données
          </p>
        </div>

        {/* Input */}
        <ComponentCard 
          title="Input" 
          description="Champ de saisie standard"
        >
          <div className="max-w-md">
            <Input label="Nom" placeholder="Entrez votre nom" />
            <div className="mt-4">
              <Input label="Email" type="email" required placeholder="email@example.com" />
            </div>
            <div className="mt-4">
              <Input placeholder="Sans label" />
            </div>
          </div>
        </ComponentCard>

        {/* Textarea */}
        <ComponentCard 
          title="Textarea" 
          description="Zone de texte multiligne"
        >
          <div className="max-w-md">
            <Textarea 
              label="Description" 
              placeholder="Entrez une description"
              rows={4}
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
          </div>
        </ComponentCard>

        {/* InputWithSpeech */}
        <ComponentCard 
          title="InputWithSpeech" 
          description="Input avec bouton de dictée vocale intégré"
        >
          <div className="max-w-md">
            <InputWithSpeech
              label="Nom (avec dictée)"
              value={inputSpeechValue}
              onValueChange={setInputSpeechValue}
              placeholder="Cliquez sur le micro pour dicter"
            />
          </div>
        </ComponentCard>

        {/* TextareaWithSpeech */}
        <ComponentCard 
          title="TextareaWithSpeech" 
          description="Textarea avec bouton de dictée vocale intégré"
        >
          <div className="max-w-md">
            <TextareaWithSpeech
              label="Description (avec dictée)"
              value={textareaSpeechValue}
              onValueChange={setTextareaSpeechValue}
              placeholder="Cliquez sur le micro pour dicter"
              rows={4}
            />
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* CONTROLS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contrôles</h1>
          <p className="text-gray-600 mb-8">
            Composants de contrôle et sélection
          </p>
        </div>

        {/* ToggleButtonGroup */}
        <ComponentCard 
          title="ToggleButtonGroup" 
          description="Groupe de boutons toggle"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <ToggleButtonGroup
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ]}
              value={toggleValue}
              onChange={(val) => setToggleValue(val as 'option1' | 'option2')}
            />
          </div>
        </ComponentCard>

        {/* SegmentedControl */}
        <ComponentCard 
          title="SegmentedControl" 
          description="Contrôle de segmentation pour les filtres"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <SegmentedControl
              options={[
                { value: 'all', label: 'Tout' },
                { value: 'active', label: 'Actif' },
                { value: 'completed', label: 'Terminé' },
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* NAVIGATION */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Navigation</h1>
          <p className="text-gray-600 mb-8">
            Composants de navigation
          </p>
        </div>

        {/* PeriodNavigation */}
        <ComponentCard 
          title="PeriodNavigation" 
          description="Navigation par période (semaine/mois)"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <PeriodNavigation
              label="Semaine du 1er janvier"
              onPrevious={() => {}}
              onNext={() => {}}
              canGoBack={true}
              canGoForward={true}
            />
          </div>
        </ComponentCard>

        {/* ViewAllLink */}
        <ComponentCard 
          title="ViewAllLink" 
          description="Lien &apos;Voir tout&apos; avec icône"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <ViewAllLink href="/test" label="Voir tout" />
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* ACCORDION */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accordion</h1>
          <p className="text-gray-600 mb-8">
            Composant accordéon avec compound pattern
          </p>
        </div>

        {/* Accordion */}
        <ComponentCard 
          title="Accordion" 
          description="Composant accordéon avec compound pattern"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple simple</h3>
            <Accordion>
              <Accordion.Item value="item-1">
                <Accordion.Trigger>Question 1</Accordion.Trigger>
                <Accordion.Content>Réponse 1</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="item-2">
                <Accordion.Trigger>Question 2</Accordion.Trigger>
                <Accordion.Content>Réponse 2</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Mode multiple</h3>
            <Accordion multiple>
              <Accordion.Item value="item-1">
                <Accordion.Trigger>Item 1</Accordion.Trigger>
                <Accordion.Content>Contenu 1</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="item-2">
                <Accordion.Trigger>Item 2</Accordion.Trigger>
                <Accordion.Content>Contenu 2</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* UTILITY COMPONENTS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Composants utilitaires</h1>
          <p className="text-gray-600 mb-8">
            Composants utilitaires et indicateurs
          </p>
        </div>

        {/* Loader */}
        <ComponentCard 
          title="Loader" 
          description="Spinner de chargement"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Tailles</h3>
            <div className="flex items-center gap-4">
              <Loader size="small" />
              <Loader size="medium" />
              <Loader size="large" />
            </div>
          </div>
        </ComponentCard>

        {/* Logo */}
        <ComponentCard 
          title="Logo" 
          description="Logo de l&apos;application"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Tailles</h3>
            <div className="flex items-center gap-4">
              <Logo size={20} />
              <Logo size={40} />
              <Logo size={60} />
            </div>
          </div>
        </ComponentCard>

        {/* WeeklyCompletionIndicator */}
        <ComponentCard 
          title="WeeklyCompletionIndicator" 
          description="Indicateur de complétion hebdomadaire"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <WeeklyCompletionIndicator 
              completions={[
                new Date(),
                new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              ]}
            />
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* FORM ACTIONS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Actions de formulaire</h1>
          <p className="text-gray-600 mb-8">
            Composants pour les actions de formulaire
          </p>
        </div>

        {/* FormActions */}
        <ComponentCard 
          title="FormActions" 
          description="Actions de formulaire avec gestion de suppression"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple</h3>
            <FormActions
              onCancel={() => {}}
              showDelete={true}
              onDelete={() => {}}
              deleteConfirm={deleteConfirmation.showConfirm}
            />
          </div>
        </ComponentCard>

        {/* ============================================ */}
        {/* COMPOSITE COMPONENTS */}
        {/* ============================================ */}
        
        <div className="border-t-2 border-gray-200 pt-12 mt-12 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Composants composites</h1>
          <p className="text-gray-600 mb-8">
            Composants composés utilisant plusieurs composants UI de base
          </p>
        </div>

        {/* WelcomeHeader */}
        <ComponentCard 
          title="WelcomeHeader" 
          description="Carte de bienvenue avec salutation, progression du jour et calendrier hebdomadaire"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple avec objectif non atteint</h3>
            <WelcomeHeader
              userName="Marie"
              completedToday={2}
              resetFrequency="DAILY"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple avec objectif atteint</h3>
            <WelcomeHeader
              userName="Jean"
              completedToday={5}
              resetFrequency="DAILY"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple avec calendrier hebdomadaire</h3>
            <WelcomeHeader
              userName="Sophie"
              completedToday={7}
              resetFrequency="DAILY"
              weekData={[
                { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), dateKey: '2024-01-01', count: 3, dominantCategory: 'UPPER_BODY', secondaryCategory: null, allCategories: ['UPPER_BODY'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), dateKey: '2024-01-02', count: 5, dominantCategory: 'LOWER_BODY', secondaryCategory: null, allCategories: ['LOWER_BODY'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), dateKey: '2024-01-03', count: 0, dominantCategory: null, secondaryCategory: null, allCategories: [], isToday: false, isEmpty: true },
                { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), dateKey: '2024-01-04', count: 4, dominantCategory: 'CORE', secondaryCategory: null, allCategories: ['CORE'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), dateKey: '2024-01-05', count: 6, dominantCategory: 'UPPER_BODY', secondaryCategory: 'STRETCHING', allCategories: ['UPPER_BODY', 'STRETCHING'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), dateKey: '2024-01-06', count: 2, dominantCategory: 'LOWER_BODY', secondaryCategory: null, allCategories: ['LOWER_BODY'], isToday: false, isEmpty: false },
                { date: new Date(), dateKey: '2024-01-07', count: 7, dominantCategory: 'CORE', secondaryCategory: null, allCategories: ['CORE'], isToday: true, isEmpty: false },
              ]}
              progressDates={new Set(['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'])}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple avec reset hebdomadaire</h3>
            <WelcomeHeader
              userName="Pierre"
              completedToday={3}
              resetFrequency="WEEKLY"
              weekData={[
                { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), dateKey: '2024-01-01', count: 3, dominantCategory: 'UPPER_BODY', secondaryCategory: null, allCategories: ['UPPER_BODY'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), dateKey: '2024-01-02', count: 5, dominantCategory: 'LOWER_BODY', secondaryCategory: null, allCategories: ['LOWER_BODY'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), dateKey: '2024-01-03', count: 0, dominantCategory: null, secondaryCategory: null, allCategories: [], isToday: false, isEmpty: true },
                { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), dateKey: '2024-01-04', count: 4, dominantCategory: 'CORE', secondaryCategory: null, allCategories: ['CORE'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), dateKey: '2024-01-05', count: 6, dominantCategory: 'UPPER_BODY', secondaryCategory: 'STRETCHING', allCategories: ['UPPER_BODY', 'STRETCHING'], isToday: false, isEmpty: false },
                { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), dateKey: '2024-01-06', count: 2, dominantCategory: 'LOWER_BODY', secondaryCategory: null, allCategories: ['LOWER_BODY'], isToday: false, isEmpty: false },
                { date: new Date(), dateKey: '2024-01-07', count: 3, dominantCategory: 'CORE', secondaryCategory: null, allCategories: ['CORE'], isToday: true, isEmpty: false },
              ]}
              progressDates={new Set(['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'])}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemple en état de chargement</h3>
            <WelcomeHeader
              userName="Lucie"
              completedToday={null}
              resetFrequency="DAILY"
            />
          </div>
        </ComponentCard>

        {/* Note: Les composants composites comme CategoryCardWithProgress, ExerciceCard, etc. 
            sont documentés dans leur propre contexte d'utilisation */}
        
        <Card variant="default" padding="md" className="mb-8">
          <p className="text-sm text-gray-500">
            Les composants composites (CategoryCardWithProgress, ExerciceCard, JournalNoteCard, etc.) 
            sont documentés dans leur contexte d&apos;utilisation dans l&apos;application.
          </p>
        </Card>

      </div>
    </div>
  );
}
