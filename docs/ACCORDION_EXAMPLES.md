# 📖 Guide d'utilisation : Accordion (Compound Pattern)

## 🎯 Vue d'ensemble

Le composant `Accordion` utilise le **compound pattern** pour offrir une API flexible et composable. Il permet de créer des sections pliables/dépliables avec une gestion d'état interne.

---

## 📦 Import

```typescript
import { Accordion } from '@/app/components/ui';
```

---

## 🚀 Utilisation de base

### Accordéon simple (un seul item ouvert à la fois)

```tsx
<Accordion>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>
      Question 1 : Comment ça marche ?
    </Accordion.Trigger>
    <Accordion.Content>
      <p>Voici la réponse détaillée...</p>
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Trigger>
      Question 2 : C'est accessible ?
    </Accordion.Trigger>
    <Accordion.Content>
      <p>Oui ! Complètement accessible (WCAG AA)</p>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Accordéon multiple (plusieurs items ouverts simultanément)

```tsx
<Accordion multiple>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Contenu 1</Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Trigger>Section 2</Accordion.Trigger>
    <Accordion.Content>Contenu 2</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Items ouverts par défaut

```tsx
// Un seul item ouvert
<Accordion defaultValue="item-1">
  {/* ... items */}
</Accordion>

// Plusieurs items ouverts (nécessite multiple)
<Accordion multiple defaultValue={['item-1', 'item-3']}>
  {/* ... items */}
</Accordion>
```

---

## 🎨 Personnalisation avancée

### Avec icônes

```tsx
<Accordion.Trigger 
  icon="📁"
  showChevron
>
  <h3 className="font-semibold">Mon titre</h3>
  <p className="text-sm text-gray-500">Description</p>
</Accordion.Trigger>
```

### Sans chevron

```tsx
<Accordion.Trigger showChevron={false}>
  Mon titre personnalisé
</Accordion.Trigger>
```

### Avec badges et contenu riche

```tsx
<Accordion.Trigger icon="⭐">
  <div className="flex items-center justify-between w-full">
    <span className="font-semibold">Section importante</span>
    <Badge color="emerald">Nouveau</Badge>
  </div>
</Accordion.Trigger>
```

### Classes CSS personnalisées

```tsx
<Accordion className="space-y-4">
  <Accordion.Item className="border-2 border-blue-200">
    <Accordion.Trigger className="bg-blue-50">
      Trigger personnalisé
    </Accordion.Trigger>
    <Accordion.Content className="bg-blue-50/50">
      Contenu personnalisé
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

---

## 📋 Exemples d'utilisation réels

### 1. FAQ Section

```tsx
export function FAQ() {
  const faqs = [
    {
      question: "Comment créer mon compte ?",
      answer: "Rendez-vous sur la page d'inscription..."
    },
    {
      question: "Est-ce que c'est gratuit ?",
      answer: "Oui, l'application est 100% gratuite."
    }
  ];

  return (
    <Accordion>
      {faqs.map((faq, index) => (
        <Accordion.Item key={index} value={`faq-${index}`}>
          <Accordion.Trigger>
            <h3 className="text-base font-semibold">{faq.question}</h3>
          </Accordion.Trigger>
          <Accordion.Content>
            <p className="text-gray-600">{faq.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
```

### 2. Settings Sections

```tsx
export function Settings() {
  return (
    <Accordion multiple defaultValue={['account', 'notifications']}>
      <Accordion.Item value="account">
        <Accordion.Trigger icon="👤">
          <h3 className="font-semibold">Mon compte</h3>
          <p className="text-sm text-gray-500">Gérer mes informations</p>
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="space-y-4">
            <Input label="Nom" />
            <Input label="Email" />
            <Button>Enregistrer</Button>
          </div>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="notifications">
        <Accordion.Trigger icon="🔔">
          <h3 className="font-semibold">Notifications</h3>
        </Accordion.Trigger>
        <Accordion.Content>
          {/* Settings de notifications */}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

### 3. Historique par semaine (exemple réel de Synapso)

```tsx
export function HistoryByWeek() {
  const weeks = [
    {
      weekKey: 'current',
      label: 'Semaine actuelle',
      entries: [...],
      victories: [...]
    },
    // ...
  ];

  return (
    <Accordion multiple defaultValue={['current']}>
      {weeks.map(({ weekKey, label, entries, victories }) => (
        <Accordion.Item key={weekKey} value={weekKey}>
          <Accordion.Trigger icon="📁">
            <h3 className="font-semibold">{label}</h3>
            <p className="text-sm text-gray-500">
              {entries.length} exercices
              {victories.length > 0 && (
                <span className="text-amber-600 ml-1">
                  · {victories.length} victoires
                </span>
              )}
            </p>
          </Accordion.Trigger>
          <Accordion.Content>
            {/* Grille d'exercices et victoires */}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
```

---

## 🎨 Props API

### `<Accordion>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | Items de l'accordéon (Accordion.Item) |
| `multiple` | `boolean` | `false` | Permet d'ouvrir plusieurs items simultanément |
| `defaultValue` | `string \| string[]` | - | Item(s) ouvert(s) par défaut |
| `className` | `string` | `''` | Classes CSS personnalisées |

### `<Accordion.Item>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | Trigger + Content |
| `value` | `string` | - | ✅ **Requis** - Identifiant unique de l'item |
| `className` | `string` | `''` | Classes CSS personnalisées |

### `<Accordion.Trigger>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | Contenu du trigger (titre, description, etc.) |
| `icon` | `ReactNode` | - | Icône à afficher (emoji ou ReactNode) |
| `showChevron` | `boolean` | `true` | Afficher le chevron animé |
| `className` | `string` | `''` | Classes CSS personnalisées |

### `<Accordion.Content>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | Contenu pliable |
| `className` | `string` | `''` | Classes CSS personnalisées |

---

## ♿ Accessibilité

Le composant est **100% accessible** :

- ✅ `aria-expanded` sur le trigger
- ✅ `aria-controls` pour lier trigger et content
- ✅ `aria-hidden` sur le content
- ✅ Navigation au clavier (Tab, Enter, Space)
- ✅ Focus ring visible
- ✅ Animations fluides (respects `prefers-reduced-motion`)

---

## 🎯 Avantages du Compound Pattern

### ✅ **Flexibilité maximale**
```tsx
// Facile d'ajouter des éléments personnalisés
<Accordion.Trigger>
  <CustomHeader />
  <CustomBadge />
</Accordion.Trigger>
```

### ✅ **API intuitive**
```tsx
// Structure claire et lisible
<Accordion>
  <Accordion.Item>
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### ✅ **État géré automatiquement**
```tsx
// Pas besoin de gérer isExpanded/onToggle
// Accordion gère tout en interne !
```

### ✅ **Composition facile**
```tsx
// Combinez avec d'autres composants
<Accordion.Content>
  <Badge>Tag</Badge>
  <Button>Action</Button>
  <Form>...</Form>
</Accordion.Content>
```

---

## 🚀 Migration depuis WeekAccordion

### Avant (ancien code)

```tsx
const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

const toggleWeek = (weekKey: string) => {
  setExpandedWeeks(prev => {
    const newSet = new Set(prev);
    if (newSet.has(weekKey)) {
      newSet.delete(weekKey);
    } else {
      newSet.add(weekKey);
    }
    return newSet;
  });
};

return weeks.map(week => (
  <WeekAccordion
    key={week.weekKey}
    label={week.label}
    entries={week.entries}
    isExpanded={expandedWeeks.has(week.weekKey)}
    onToggle={() => toggleWeek(week.weekKey)}
  />
));
```

### Après (avec Accordion)

```tsx
// ✨ Beaucoup plus simple !
import { WeekAccordionList } from '@/app/components/historique';

return (
  <WeekAccordionList 
    weeks={weeks}
    defaultExpanded={['current']}
  />
);
```

---

## 💡 Bonnes pratiques

1. **Toujours fournir une `value` unique** pour chaque Item
2. **Utiliser `multiple`** quand plusieurs sections doivent pouvoir être ouvertes
3. **Fournir `defaultValue`** pour améliorer l'UX
4. **Garder le contenu léger** pour des animations fluides
5. **Utiliser des icônes** pour une meilleure reconnaissance visuelle

---

## 🐛 Troubleshooting

### L'animation ne fonctionne pas
→ Vérifiez que chaque Item a une `value` unique

### Le contenu ne s'affiche pas
→ Vérifiez que vous avez bien `<Accordion.Content>` dans `<Accordion.Item>`

### Erreur "must be used within Accordion"
→ Vérifiez la hiérarchie : `Accordion > Item > Trigger/Content`

---

Créé avec ❤️ pour Synapso

