# Analyse : Risque de confusion entre UI Progrès et UI Sablier

**Date** : 15 janvier 2026  
**Contexte** : Application de rééducation post-AVC - Synapso

---

## 🚨 Problème identifié

Il existe un **risque de confusion** entre l'UI des progrès et l'UI du mode sablier car les deux utilisent des **couleurs amber/yellow similaires**.

---

## 📊 Comparaison des deux UIs

### UI Progrès (Célébrer un progrès)

**Éléments visuels** :
- **Bouton flottant** (`ProgressFAB`) : 
  - Gradient : `from-amber-400 via-yellow-400 to-amber-500`
  - Emoji : ⭐ (étoile)
  - Position : Fixe en bas de l'écran (gauche ou droite selon main dominante)
  - Label : "Noter un progrès"
  
- **Bouton dans modal** (`ProgressBottomSheet`) :
  - Gradient : `from-amber-300 via-yellow-400 to-amber-500`
  - Label : "Noter mon progrès !"
  
- **Menu "PROGRES"** :
  - Gradient : `from-amber-500 to-yellow-500`

**Fonction** : Célébrer un progrès, noter une victoire

---

### UI Sablier (Remonter le temps)

**Éléments visuels** :
- **Bannière fixe** (`SelectedDateBanner`) :
  - Couleur : `bg-amber-400 border-amber-500`
  - Emoji : ⏳ (sablier)
  - Position : Fixe en haut de l'écran
  - Texte : "Tu es sur le [date]"
  - Bouton : "Revenir à aujourd'hui" (blanc avec bordure amber)
  
- **Fond de l'application** (`TimeMachineWrapper`) :
  - Couleur : `bg-amber-50/50` (amber très clair)
  
- **Boutons sablier** (dans `DayDetailModal`) :
  - Couleur : `bg-amber-400 hover:bg-amber-500 border-amber-600`
  - Label : "Ajouter des exercices pour ce jour"

**Fonction** : Remonter dans le temps pour compléter des exercices oubliés

---

## ⚠️ Points de confusion potentiels

### 1. **Couleurs trop similaires**

Les deux UIs utilisent des tons amber/yellow :
- Progrès : `amber-400`, `amber-500`, `yellow-400`
- Sablier : `amber-400`, `amber-500`, `amber-50`

**Risque** : Pour une personne avec troubles cognitifs, la distinction peut être difficile.

### 2. **Emojis différents mais contexte similaire**

- Progrès : ⭐ (étoile) - célébration
- Sablier : ⏳ (sablier) - temps

**Risque** : Les emojis sont différents, mais si l'utilisateur se concentre sur la couleur, il peut confondre.

### 3. **Position différente mais visibilité similaire**

- Progrès : Bouton flottant en bas
- Sablier : Bannière fixe en haut

**Risque** : Les deux sont très visibles et proéminents, ce qui peut créer de la confusion sur leur fonction.

---

## ✅ Différenciations existantes (points positifs)

1. **Emoji distinct** : ⭐ vs ⏳ (bonne différenciation)
2. **Position différente** : Bas vs Haut (aide à la distinction)
3. **Contexte différent** : Célébration vs Navigation temporelle
4. **Style différent** : Bouton rond flottant vs Bannière rectangulaire

---

## 🎯 Recommandations pour réduire la confusion

### Option 1 : Changer la couleur du mode sablier (RECOMMANDÉ) ⭐

**Principe** : Utiliser une couleur différente pour le mode sablier qui évoque le voyage dans le temps.

#### Option 1A : **Indigo** (MEILLEURE OPTION) ⭐⭐⭐

**Couleur proposée** : **Indigo** (bleu profond, évoque la nuit, le passé, la profondeur temporelle)

**Pourquoi Indigo ?** :
- ✅ **Évoque le temps** : Couleur de la nuit, du passé, de la profondeur temporelle
- ✅ **Distinction claire** : Se distingue parfaitement de l'amber/yellow des progrès
- ✅ **Pas déjà utilisé** : Nouvelle couleur, pas de confusion avec les catégories
- ✅ **Accessibilité** : Bon contraste avec le texte blanc
- ✅ **Évocatif** : Évoque le mystère, le voyage, la nostalgie

**Implémentation** :
```typescript
// SelectedDateBanner.tsx
className="bg-indigo-500 border-b-2 border-indigo-600" // Au lieu de amber

// TimeMachineWrapper.tsx
isTimeMachineMode ? 'bg-indigo-50/50' : 'bg-white' // Au lieu de amber-50

// DayDetailModal.tsx (bouton sablier)
'bg-indigo-500 hover:bg-indigo-600 border-indigo-700' // Au lieu de amber

// Textes
'text-indigo-900' // Au lieu de amber-900
```

**Emoji** : Garder ⏳ (sablier) - déjà distinctif

---

#### Option 1B : **Slate/Gris-bleu** (ALTERNATIVE)

**Couleur proposée** : **Slate** (gris-bleu, évoque les vieilles photos, la nostalgie)

**Pourquoi Slate ?** :
- ✅ **Évoque le passé** : Couleur des vieilles photos, de la nostalgie
- ✅ **Distinction claire** : Se distingue de l'amber/yellow
- ✅ **Neutre** : Couleur discrète, ne surcharge pas l'interface
- ⚠️ **Moins évocateur** : Moins "magique" que l'indigo

**Implémentation** :
```typescript
// SelectedDateBanner.tsx
className="bg-slate-500 border-b-2 border-slate-600"

// TimeMachineWrapper.tsx
isTimeMachineMode ? 'bg-slate-50/50' : 'bg-white'

// DayDetailModal.tsx (bouton sablier)
'bg-slate-500 hover:bg-slate-600 border-slate-700'
```

---

#### Option 1C : **Violet foncé** (ALTERNATIVE)

**Couleur proposée** : **Violet foncé** (évoque la magie, le mystère, le voyage)

**Pourquoi Violet foncé ?** :
- ✅ **Évoque la magie** : Couleur du mystère, du voyage temporel
- ✅ **Distinction claire** : Se distingue de l'amber/yellow
- ⚠️ **Déjà utilisé** : Violet utilisé pour les étirements (mais plus clair)
- ⚠️ **Risque de confusion** : Peut être confondu avec la catégorie étirements

**Implémentation** :
```typescript
// Utiliser violet-600 ou violet-700 (plus foncé que purple-500 des étirements)
className="bg-violet-600 border-b-2 border-violet-700"
```

---

### Option 2 : Renforcer les différences visuelles (COMPLÉMENTAIRE)

**En plus de l'Option 1**, ajouter :

1. **Bordure distinctive pour le mode sablier** :
   - Bordure pointillée ou double bordure pour le mode sablier
   - Style différent du bouton progrès (qui est rond)

2. **Animation différente** :
   - Mode sablier : Animation de "remontée" (vers le haut)
   - Progrès : Animation de "célébration" (confettis, explosion)

3. **Icône supplémentaire** :
   - Mode sablier : Ajouter une flèche vers le haut ↖️ ou calendrier 📅
   - Progrès : Garder ⭐ (étoile)

---

### Option 3 : Changer l'emoji du mode sablier (ALTERNATIVE)

**Si on garde amber pour le sablier**, changer l'emoji pour être plus distinctif :

- **Option A** : 📅 (calendrier) - plus explicite sur la fonction temporelle
- **Option B** : ⏪ (flèche retour) - indique le retour en arrière
- **Option C** : 🔙 (flèche retour) - similaire mais différent de ⭐

**Avantage** : Distinction plus claire avec ⭐ (progrès)

**Inconvénient** : ⏳ (sablier) est déjà très approprié pour "remonter le temps"

---

## 🎨 Recommandation finale

### **Option 1A (Indigo) + Renforcement visuel** (MEILLEURE SOLUTION) ⭐

1. **Changer la couleur du mode sablier en Indigo** :
   - Bannière : `bg-indigo-500 border-indigo-600`
   - Fond : `bg-indigo-50/50`
   - Boutons : `bg-indigo-500 hover:bg-indigo-600 border-indigo-700`
   - Textes : `text-indigo-900`

2. **Garder l'emoji ⏳** (sablier) - déjà distinctif

3. **Ajouter une bordure distinctive** :
   - Bordure double ou pointillée pour le mode sablier
   - Style différent du bouton progrès

**Résultat** :
- ✅ **Progrès** : Amber/Yellow + ⭐ = Célébration dorée
- ✅ **Sablier** : Indigo + ⏳ = Voyage dans le temps (nuit, passé, profondeur)
- ✅ Distinction claire et immédiate
- ✅ Pas de confusion possible
- ✅ Évocatif du voyage temporel

---

## 📝 Impact sur le code

### Fichiers à modifier (Option Indigo)

1. `src/app/components/SelectedDateBanner.tsx`
   - Changer `amber-400` → `indigo-500`
   - Changer `amber-500` → `indigo-600`
   - Changer `amber-900` → `indigo-900`
   - Changer `amber-800` → `indigo-800`
   - Changer `amber-700` → `indigo-700`

2. `src/app/components/TimeMachineWrapper.tsx`
   - Changer `amber-50/50` → `indigo-50/50`

3. `src/app/components/historique/DayDetailModal.tsx`
   - Changer les boutons sablier : `amber-400` → `indigo-500`
   - Changer `amber-500` → `indigo-600`
   - Changer `amber-600` → `indigo-700`
   - Changer `amber-900` → `indigo-900`

4. `src/app/components/TimeMachineTransition.tsx`
   - Changer les gradients amber → indigo
   - Changer `amber-100` → `indigo-100`
   - Changer `amber-50` → `indigo-50`

5. `src/app/components/historique/ActivityHeatmapCell.tsx`
   - Changer les bordures amber → indigo pour le jour sélectionné
   - Changer `ring-amber-500` → `ring-indigo-500`

6. `context.md`
   - Mettre à jour la documentation des couleurs (indigo au lieu de amber pour le mode sablier)

---

## ✅ Validation

**Critères de validation** :
- [ ] Distinction visuelle immédiate entre progrès et sablier
- [ ] Pas de confusion possible pour une personne avec troubles cognitifs
- [ ] Cohérence avec le reste de l'application (teal déjà utilisé)
- [ ] Accessibilité maintenue (contrastes suffisants)
- [ ] Tests utilisateurs si possible

---

## 📊 Comparaison avant/après

### Avant (Risque de confusion)
- Progrès : Amber/Yellow + ⭐
- Sablier : Amber/Yellow + ⏳
- **Risque** : Confusion possible

### Après (Distinction claire)
- Progrès : Amber/Yellow + ⭐ (célébration dorée)
- Sablier : Indigo + ⏳ (voyage dans le temps, nuit, passé)
- **Résultat** : Distinction claire et immédiate, évocatif du voyage temporel

---

**Conclusion** : Il existe effectivement un risque de confusion entre les deux UIs. La solution recommandée est de changer la couleur du mode sablier en Teal pour créer une distinction claire avec l'UI des progrès (Amber/Yellow).
