# 🎓 CourseNotes AI - Spécifications Fonctionnelles

**Version** : 2.0 (Sans Code - Pour Claude Code)  
**Deadline** : Deploy in 2 days  
**Budget** : €100/month max  
**Target** : 20 users, 10 generations/week each  
**Languages** : English (primary) + French

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Stack Technique](#stack-technique)
3. [Architecture & Data Model](#architecture--data-model)
4. [Fonctionnalités Principales](#fonctionnalités-principales)
5. [QCM Interactif (Feature Phare)](#qcm-interactif-feature-phare)
6. [User Flows](#user-flows)
7. [Pages & Wireframes](#pages--wireframes)
8. [API Endpoints](#api-endpoints)
9. [Gestion des Clés API](#gestion-des-clés-api)
10. [Internationalisation](#internationalisation)
11. [Phases d'Implémentation](#phases-dimplémentation)
12. [Success Metrics](#success-metrics)

---

## 🎯 Vue d'Ensemble

### Proposition de Valeur

CourseNotes AI est une **plateforme web all-in-one** qui transforme automatiquement des supports de cours (PDF, DOCX, images) en **trois outputs complets** :

1. **📝 Notes de cours détaillées** (niveau 10/10 de détails, explications simplifiées)
2. **✅ QCM interactif** avec scoring instantané et corrections détaillées
3. **🎨 Fiche visuelle** (infographie A3 auto-générée via Ideogram AI)

**Différenciation clé** : 
- Seul outil qui génère les 3 formats en 1 workflow
- QCM **interactif dans l'app** (pas juste du texte)
- Pricing transparent avec BYOK (Bring Your Own API Key)

---

## 🏗️ Stack Technique

**Recommandations (SATO : Simple, Affordable, Time-efficient, Optimal)** :

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend/Backend** | Next.js 14 (App Router) + TypeScript + Tailwind | Full-stack, excellent DX, Vercel 1-click deploy |
| **Database** | Supabase (PostgreSQL) | Free tier 500MB, RLS built-in, real-time subs |
| **Storage** | Supabase Storage | Integrated, 2GB free |
| **Auth (v2)** | Supabase Auth | OAuth providers, JWT tokens |
| **AI Notes** | Claude Sonnet 4.5 (user's API key) | Best reasoning for educational content |
| **AI Visual** | Ideogram v3 Turbo (Replicate) | $0.01/image, excellent text rendering |
| **i18n** | next-intl | Standard Next.js i18n, locale routing |
| **UI** | shadcn/ui | Copy-paste components, no bloat |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **PDF Export** | jsPDF or React-PDF | Client-side PDF generation |
| **Deployment** | Vercel | Free tier, edge functions |

**Cost Structure** :
- Images : 800 gen/mois × €0.01 = **€8/mois**
- Claude API : **€0** (users provide keys)
- Vercel : **€0** (free tier)
- Supabase : **€0** (< 500MB DB)
- **Total : ~€8/mois** ✅

---

## 📊 Architecture & Data Model

### Database Tables (High-Level)

**7 Tables principales** :

1. **users** : User profiles (optional auth in v1)
   - id, email, name, created_at

2. **institutions** : Universities/schools
   - id, name, short_name, created_at
   - Pre-seeded : Imperial, Cambridge, Oxford

3. **courses** : Course information
   - id, institution_id, code, name, description, created_at
   - Example : ELEC70122 - Machine Learning for Safety-Critical Systems

4. **modules** : Subparts of courses
   - id, course_id, name, description, order_index, created_at

5. **notes** : Generated study materials (main content)
   - id, course_id, module_id, creator_name, title, language
   - notes_markdown, qcm_json, visual_prompt, visual_image_url
   - upvotes, downvotes, views_count
   - created_at, updated_at

6. **votes** : User voting on notes
   - id, note_id, user_identifier (IP/fingerprint), vote_type, created_at

7. **tags** : Tags for filtering
   - id, name, created_at
   - notes_tags (junction table)

**Storage Buckets** :
- `uploads/` : User-uploaded files (PDF, DOCX, images)
- `generated/` : Generated visual sheets (PNG/PDF)

### Relations

```
institutions (1) ----< (M) courses
courses (1) ----< (M) modules  
courses (1) ----< (M) notes
notes (1) ----< (M) votes
notes (M) >----< (M) tags (via notes_tags)
```

---

## ⚙️ Fonctionnalités Principales

### 1. Génération de Notes Complètes

**Input** :
- Upload fichier (PDF, DOCX, images jusqu'à 50MB)
- Sélection cours/module (optionnel, créé à la volée si n'existe pas)
- Paramètres personnalisés :
  - **Detail Level** : slider 1-10 (contrôle l'exhaustivité)
  - **Use Metaphors** : toggle (ajoute des analogies créatives)
  - **Technical Level** : dropdown (Beginner / Intermediate / Advanced)
  - **Length** : radio (Short ~20 pages / Medium ~40 pages / Long ~60+ pages)
  - **Language** : EN / FR

**Processing** :
1. Parse fichier → Extract text (pdf-parse, mammoth, tesseract.js pour OCR)
2. Envoyer à Claude API avec prompt structuré
3. Extract 3 outputs :
   - Notes Markdown
   - QCM JSON
   - Visual Prompt
4. Générer visual image via Replicate (Ideogram v3 Turbo)
5. Stocker dans Supabase (notes table + storage)

**Output** :
- Page de résultats avec 3 tabs :
  - **Notes** : Markdown rendered avec LaTeX support
  - **QCM** : Interface interactive (voir section dédiée)
  - **Visual** : Image affichée + download button

---

### 2. Public Gallery

**Features** :
- Grid view de toutes les notes publiques
- Filtres :
  - Institution (dropdown)
  - Course (dropdown, filtered by institution)
  - Language (EN/FR)
  - Tags (multi-select)
- Tri :
  - Most recent
  - Most upvoted
  - Most viewed
- Search bar (full-text sur titre + description)

**Note Card Display** :
- Thumbnail de la visual sheet
- Titre + description courte
- Course + Institution badges
- Stats : upvotes, downvotes, views
- Creator name (attribution)
- Click → Open detail page

---

### 3. Note Detail Page

**Layout** :
- Header :
  - Titre
  - Course + Institution + Module
  - Creator + Date
  - Vote buttons (👍 / 👎) with counts
- Tabs :
  - **Notes** : Full markdown avec TOC (table of contents)
  - **QCM** : Interface interactive
  - **Visual** : Image en grand format
- Actions :
  - Download PDF (notes + visual combinés)
  - Share link (copy to clipboard)
  - Report (v2)

---

### 4. Courses & Modules Management

**Course Creation** (si n'existe pas) :
- User peut créer un nouveau cours à la volée pendant génération
- Form : Institution (dropdown) + Course Code + Course Name + Description (optionnel)
- Stocké dans `courses` table

**Module Creation** (optionnel) :
- User peut associer ses notes à un module spécifique
- Form : Module Name + Description + Order Index
- Stocké dans `modules` table

**Browse Courses** :
- Page dédiée listant tous les cours par institution
- Click cours → Voir toutes les notes pour ce cours

---

## ✅ QCM Interactif (Feature Phare)

### Vue d'Ensemble

Le **QCM interactif** est une fonctionnalité différenciante majeure. Contrairement aux concurrents qui génèrent juste du texte statique, CourseNotes AI offre une **expérience quiz complète dans l'app**.

**Objectifs** :
- ✅ Tester la compréhension immédiatement après génération
- ✅ Scoring instantané pour motivation
- ✅ Corrections détaillées pour apprentissage
- ✅ Progress tracking (quels concepts sont maîtrisés)
- ✅ Retry mode pour amélioration

---

### Format du QCM (Généré par Claude)

**Structure JSON** :
```json
{
  "questions": [
    {
      "id": 1,
      "question": "Quelle est la principale caractéristique...",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_answer": 2,  // Index (0-based)
      "explanation": "Explication détaillée de 2-3 lignes...",
      "difficulty": "medium",  // easy / medium / hard
      "topic": "Introduction aux Concepts"
    },
    // ... 10-15 questions total
  ],
  "metadata": {
    "total_questions": 15,
    "estimated_time_minutes": 10,
    "passing_score_percentage": 60
  }
}
```

**Caractéristiques** :
- 10-15 questions par génération
- Mix de difficulté (30% easy, 50% medium, 20% hard)
- Topics variés (cover tous les concepts clés)
- Explications détaillées pour chaque question

---

### Interface Utilisateur QCM

#### Mode Quiz (Exam Mode)

**Layout** :

```
┌─────────────────────────────────────────┐
│  Question 3/15            Timer: 02:45   │
├─────────────────────────────────────────┤
│                                          │
│  Quelle est la principale caractéris... │
│                                          │
│  ○ Option A - Lorem ipsum dolor sit     │
│  ○ Option B - Consectetur adipiscing    │
│  ● Option C - Sed do eiusmod tempor     │ ← Selected
│  ○ Option D - Ut labore et dolore       │
│                                          │
│  [Previous]  [Next]  [Submit Quiz]      │
│                                          │
│  Progress: ███████░░░░░░░░  7/15        │
└─────────────────────────────────────────┘
```

**Features** :
- Radio buttons pour sélectionner réponse
- Navigation : Previous / Next entre questions
- Progress bar (questions answered vs total)
- Timer optionnel (countdown)
- Bouton "Submit Quiz" s'affiche quand toutes les questions ont une réponse

**UX Details** :
- Auto-save réponses (localStorage pour pas perdre si reload)
- "Skip" button pour passer (can come back)
- Confirm dialog avant "Submit" si questions non répondues

---

#### Mode Correction (Results Mode)

**Après Submit, afficher** :

```
┌─────────────────────────────────────────┐
│  🎉 Quiz Completed!                      │
├─────────────────────────────────────────┤
│                                          │
│  Your Score: 12/15 (80%)                │
│  ⭐⭐⭐ Excellent!                        │
│                                          │
│  ✓ Correct: 12 questions                │
│  ✗ Incorrect: 3 questions               │
│  Time: 8m 23s                           │
│                                          │
│  [Review Answers]  [Retry Quiz]         │
│                                          │
│  📊 Breakdown by Topic:                  │
│  • Introduction: 4/5 (80%)              │
│  • Core Concepts: 5/6 (83%)             │
│  • Advanced: 3/4 (75%)                  │
└─────────────────────────────────────────┘
```

**Grading System** :
- 90-100% : ⭐⭐⭐⭐⭐ "Perfect!"
- 80-89% : ⭐⭐⭐⭐ "Excellent!"
- 70-79% : ⭐⭐⭐ "Good job!"
- 60-69% : ⭐⭐ "Pass"
- < 60% : ⭐ "Needs review"

---

#### Mode Review (Answer Review)

**Click "Review Answers" → Show each question with** :

```
┌─────────────────────────────────────────┐
│  Question 3/15               ✓ Correct   │
├─────────────────────────────────────────┤
│                                          │
│  Quelle est la principale caractéris... │
│                                          │
│  ○ Option A                              │
│  ○ Option B                              │
│  ✓ Option C  ← Your answer (Correct)    │
│  ○ Option D                              │
│                                          │
│  💡 Explanation:                         │
│  L'option C est correcte car elle...    │
│  [detailed 2-3 line explanation]        │
│                                          │
│  [Previous]  [Next]  [Back to Summary]  │
└─────────────────────────────────────────┘
```

**Si Wrong Answer** :

```
┌─────────────────────────────────────────┐
│  Question 5/15               ✗ Wrong     │
├─────────────────────────────────────────┤
│                                          │
│  Quelle méthode est utilisée pour...    │
│                                          │
│  ○ Option A                              │
│  ✓ Option B  ← Correct answer            │
│  ✗ Option C  ← Your answer (Wrong)      │
│  ○ Option D                              │
│                                          │
│  ❌ Why you were wrong:                  │
│  L'option C ne fonctionne pas car...    │
│                                          │
│  ✅ Why B is correct:                    │
│  L'option B utilise la méthode qui...   │
│                                          │
│  [Previous]  [Next]  [Back to Summary]  │
└─────────────────────────────────────────┘
```

**Visual Indicators** :
- ✓ Green background pour correct
- ✗ Red background pour wrong
- ℹ️ Blue info icon pour explanation

---

### Retry Mode

**Features** :
- "Retry Quiz" button réinitialise tout
- Questions restent les mêmes (pour mémorisation)
- Score précédent affiché pour comparaison
- "Improvement: +2 questions!" si meilleur score

**Optionnel (v2)** :
- "Retry Wrong Only" : Ne refait que les questions échouées
- "Shuffle Questions" : Change l'ordre

---

### Data Persistence

**localStorage** (client-side) :
- User progress (current question, selected answers)
- Permet de continuer si page reload

**Supabase** (server-side, v2) :
- Quiz attempts (user_id, note_id, score, time, correct_questions)
- Analytics (quel topic pose problème)

---

### Mobile Responsiveness

**Optimisations mobile** :
- Questions affichées 1 par 1 (full screen)
- Swipe left/right pour Previous/Next
- Tap option pour sélectionner (large touch targets)
- Fixed footer avec Submit button

---

### Success Criteria

Pour considérer le QCM interactif réussi :
- [ ] Submit quiz fonctionne sans bug
- [ ] Scoring est accurate (12/15 = 80%)
- [ ] Explanations s'affichent correctement
- [ ] Mobile UX est smooth (no lag)
- [ ] localStorage save/restore fonctionne
- [ ] Users can retry without re-generating
- [ ] 80%+ des beta users complètent au moins 1 quiz

---

## 🔄 User Flows

### Flow 1 : Génération de Notes (New User, First Time)

```
1. User arrive sur homepage
   ↓
2. Click "Generate Notes"
   ↓
3. Upload PDF (ex: ELEC70122_Lecture1.pdf)
   ↓
4. Prompt pour API key Claude (first time)
   - Input API key
   - Click "Test" → Validation
   - Check "Remember my key"
   - Key saved in localStorage
   ↓
5. Fill generation form
   - Select Institution: Imperial College London
   - Course: "ELEC70122 - ML for Safety-Critical Systems" (create new)
   - Module: "Lecture 1 - Introduction" (create new)
   - Detail Level: 8/10
   - Metaphors: Yes
   - Technical Level: Advanced
   - Length: Medium
   - Language: English
   ↓
6. Click "Generate" → Processing (2-3 min)
   - Progress bar: Parsing file... ✓
   - Progress bar: Generating notes... (30s)
   - Progress bar: Generating QCM... (20s)
   - Progress bar: Creating visual... (40s)
   ↓
7. Results page avec 3 tabs
   - Tab "Notes" : View markdown
   - Tab "QCM" : Start quiz
   - Tab "Visual" : View image
   ↓
8. Click "Take Quiz" dans tab QCM
   ↓
9. Answer 15 questions (8 minutes)
   ↓
10. Submit → See score 13/15 (87%) ⭐⭐⭐⭐
    ↓
11. Review wrong answers
    ↓
12. Download PDF (notes + visual)
    ↓
13. Note automatiquement ajoutée à public gallery
```

---

### Flow 2 : Browsing Gallery & Taking Quiz (Returning User)

```
1. User arrive sur homepage
   ↓
2. Click "Browse Gallery"
   ↓
3. Filter par :
   - Institution: Imperial
   - Course: ELEC70122
   ↓
4. Voit 5 notes existantes
   ↓
5. Click sur "Lecture 2 - Safety Verification"
   ↓
6. Detail page s'affiche
   - Read notes (tab Notes)
   - Click tab "QCM"
   ↓
7. Start quiz directement (no re-generation needed)
   ↓
8. Complete quiz → Score 11/15 (73%) ⭐⭐⭐
   ↓
9. Review explanations
   ↓
10. Click "Retry Quiz" → Try again
    ↓
11. Score 14/15 (93%) ⭐⭐⭐⭐⭐ "Improvement: +3!"
    ↓
12. Upvote note (👍)
```

---

## 📱 Pages & Wireframes

### Page 1 : Homepage

**Sections** :
1. **Hero**
   - H1: "Transform Your Lectures into Complete Study Materials"
   - Subheading: "Notes. Quizzes. Visuals. All AI-Powered."
   - CTA: "Generate Notes Free" (big button)
   - Screenshot/demo de l'app

2. **Features** (3 colonnes)
   - 📝 Comprehensive Notes (10/10 detail level)
   - ✅ Interactive Quizzes (instant scoring)
   - 🎨 Visual Study Sheets (auto-generated)

3. **Stats** (si assez de données)
   - X notes generated
   - Y courses covered
   - Z students helped

4. **Gallery Preview**
   - Grid de 6 notes récentes
   - Link "Browse All Notes →"

5. **Footer**
   - About, Contact, Privacy, Terms

---

### Page 2 : Generate Notes

**Form Layout** :

```
┌─────────────────────────────────────────┐
│  Generate Course Notes                   │
├─────────────────────────────────────────┤
│                                          │
│  📄 Upload File (PDF, DOCX, Images)     │
│  [Drag & Drop or Click to Upload]       │
│  Max 50MB                                │
│                                          │
│  🔑 Claude API Key *                     │
│  [sk-ant-...••••••] [Test] ✓ Valid      │
│  □ Remember my key                       │
│                                          │
│  🏫 Institution *                        │
│  [Dropdown: Imperial, Cambridge, ...]   │
│                                          │
│  📚 Course *                             │
│  [Dropdown or Create New]               │
│  → If "Create New":                     │
│    - Code: [ELEC70122]                  │
│    - Name: [ML for Safety-Critical...]  │
│                                          │
│  📖 Module (optional)                    │
│  [Dropdown or Create New]               │
│                                          │
│  ⚙️ Generation Settings                 │
│  Detail Level: ▓▓▓▓▓▓▓▓░░ 8/10          │
│  Use Metaphors: [Toggle ON]             │
│  Technical Level: [Advanced ▼]          │
│  Length: ○ Short ● Medium ○ Long        │
│  Language: ● EN ○ FR                    │
│                                          │
│  [Generate Notes]                       │
└─────────────────────────────────────────┘
```

**Processing State** :
- Replace form with progress indicator
- Show steps : Parse (5%) → Notes (40%) → QCM (70%) → Visual (100%)
- Estimated time : ~2 minutes

---

### Page 3 : Results / Note Detail

**Tabs Interface** :

```
┌─────────────────────────────────────────┐
│  ELEC70122 - Lecture 1: Introduction    │
│  Imperial College London                 │
│  Created by Loïc • Jan 14, 2026         │
│  👍 12  👎 2  👁 47 views               │
├─────────────────────────────────────────┤
│  [Notes] [QCM] [Visual]                 │
├─────────────────────────────────────────┤
│                                          │
│  [Content of selected tab]              │
│                                          │
│  [Download PDF] [Share Link]            │
└─────────────────────────────────────────┘
```

**Tab "Notes"** :
- Table of contents (sticky sidebar)
- Markdown rendered avec LaTeX (KaTeX)
- Syntax highlighting pour code blocks
- Smooth scroll to section on TOC click

**Tab "QCM"** :
- **Before Start** :
  - "15 questions, ~10 minutes"
  - "Passing score: 60%"
  - [Start Quiz] button
- **During Quiz** :
  - Interactive question interface (voir section QCM)
- **After Submit** :
  - Score + grade + review options

**Tab "Visual"** :
- Image displayed full width (max 1200px)
- Zoom on click (lightbox)
- Download button (PNG)

---

### Page 4 : Gallery

**Layout** :

```
┌─────────────────────────────────────────┐
│  Public Gallery                          │
├─────────────────────────────────────────┤
│  Filters:                                │
│  Institution: [All ▼]                   │
│  Course: [All ▼]                        │
│  Language: [All ▼]                      │
│  Sort: [Most Recent ▼]                  │
│  Search: [_____________] [🔍]           │
├─────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │ Note  │ │ Note  │ │ Note  │         │
│  │ Card  │ │ Card  │ │ Card  │         │
│  └───────┘ └───────┘ └───────┘         │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │ Note  │ │ Note  │ │ Note  │         │
│  │ Card  │ │ Card  │ │ Card  │         │
│  └───────┘ └───────┘ └───────┘         │
│                                          │
│  [Load More]                            │
└─────────────────────────────────────────┘
```

**Note Card** :
- Visual thumbnail (hover: scale 1.05)
- Course badge + Institution badge
- Title (truncate à 2 lignes)
- Stats: 👍 12 | 👎 2 | 👁 47
- Creator + date
- Click → Navigate to detail page

---

### Page 5 : Courses

**Layout** :

```
┌─────────────────────────────────────────┐
│  Browse Courses                          │
├─────────────────────────────────────────┤
│  📍 Imperial College London              │
│                                          │
│  • ELEC70122 - ML for Safety-Critical   │
│    12 notes available                   │
│                                          │
│  • COMP70050 - Deep Learning            │
│    8 notes available                    │
│                                          │
│  • MATH70027 - Advanced Linear Algebra  │
│    5 notes available                    │
│                                          │
├─────────────────────────────────────────┤
│  📍 University of Cambridge              │
│                                          │
│  • CS101 - Introduction to CS           │
│    3 notes available                    │
│                                          │
│  [+ Create New Course]                  │
└─────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

**Note** : Claude Code implémentera ces endpoints. Voici la liste fonctionnelle.

### POST /api/generate

**Purpose** : Génération complète (notes + QCM + visual)

**Input** :
- `multipart/form-data` :
  - file (File)
  - claudeApiKey (string)
  - institutionId (uuid)
  - courseId (uuid, optional)
  - courseCode (string, if creating new)
  - courseName (string, if creating new)
  - moduleId (uuid, optional)
  - moduleName (string, if creating new)
  - creatorName (string)
  - detailLevel (1-10)
  - useMetaphors (boolean)
  - technicalLevel (beginner|intermediate|advanced)
  - length (short|medium|long)
  - language (en|fr)

**Processing** :
1. Parse file → Extract text
2. Call Claude API with prompt
3. Parse response → Extract notes_markdown, qcm_json, visual_prompt
4. Generate visual via Replicate
5. Store note in DB + visual in Storage
6. Return note ID + URLs

**Output** :
```json
{
  "success": true,
  "noteId": "uuid",
  "notesMarkdown": "# Lecture 1...",
  "qcmJson": { "questions": [...] },
  "visualUrl": "https://supabase.co/storage/.../visual.png"
}
```

**Error Handling** :
- 400 : Invalid input
- 401 : Invalid API key
- 413 : File too large
- 500 : Generation failed

---

### POST /api/generate-image

**Purpose** : Generate visual from prompt (called by /api/generate)

**Input** :
```json
{
  "prompt": "Create an A3 infographic...",
  "noteId": "uuid"
}
```

**Output** :
```json
{
  "success": true,
  "imageUrl": "https://...",
  "replicateId": "..."
}
```

---

### GET /api/notes

**Purpose** : List notes (for gallery)

**Query Params** :
- `institution_id` (uuid, optional)
- `course_id` (uuid, optional)
- `language` (en|fr, optional)
- `sort` (recent|upvotes|views, default: recent)
- `limit` (default: 20)
- `offset` (default: 0)

**Output** :
```json
{
  "notes": [
    {
      "id": "uuid",
      "title": "Lecture 1...",
      "course": { "code": "ELEC70122", "name": "..." },
      "institution": { "name": "Imperial", "short_name": "Imperial" },
      "creator_name": "Loïc",
      "upvotes": 12,
      "downvotes": 2,
      "views_count": 47,
      "visual_image_url": "https://...",
      "created_at": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/notes/[id]

**Purpose** : Get single note detail

**Output** :
```json
{
  "id": "uuid",
  "title": "...",
  "course": {...},
  "institution": {...},
  "module": {...},
  "creator_name": "Loïc",
  "notes_markdown": "# Lecture 1...",
  "qcm_json": { "questions": [...] },
  "visual_prompt": "...",
  "visual_image_url": "https://...",
  "upvotes": 12,
  "downvotes": 2,
  "views_count": 47,
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T10:00:00Z"
}
```

---

### POST /api/vote

**Purpose** : Upvote/downvote a note

**Input** :
```json
{
  "noteId": "uuid",
  "voteType": "up" | "down",
  "userIdentifier": "ip_hash_or_fingerprint"
}
```

**Output** :
```json
{
  "success": true,
  "upvotes": 13,
  "downvotes": 2
}
```

**Logic** :
- Check if user already voted (user_identifier + note_id)
- If yes : update vote
- If no : insert new vote
- Update note upvotes/downvotes count

---

### GET /api/courses

**Purpose** : List all courses (for browse page)

**Query Params** :
- `institution_id` (uuid, optional)

**Output** :
```json
{
  "courses": [
    {
      "id": "uuid",
      "code": "ELEC70122",
      "name": "ML for Safety-Critical Systems",
      "institution": {...},
      "notes_count": 12
    }
  ]
}
```

---

### POST /api/courses

**Purpose** : Create new course

**Input** :
```json
{
  "institutionId": "uuid",
  "code": "ELEC70122",
  "name": "...",
  "description": "..."
}
```

**Output** :
```json
{
  "id": "uuid",
  "code": "ELEC70122",
  "name": "..."
}
```

---

## 🔑 Gestion des Clés API

### Option 1 : Local Storage (v1 - Implémentation Initiale)

**Flow** :
1. User entre API key sur generate page
2. Click "Test" → Validate avec Anthropic API (minimal request)
3. Si valid → Save dans `localStorage`
4. Checkbox "Remember my key" (checked by default)
5. Subsequent visits → Key auto-loaded

**Security** :
- Key stockée client-side uniquement
- Jamais envoyée à notre serveur (sauf durant API call)
- User peut clear key anytime

**UX** :
- Input type password (masked)
- Show/hide toggle
- "✓ Saved & Valid" indicator si key existe
- Link to console.anthropic.com pour get key

---

### Option 2 : Freemium (v2 - Futur)

**Free Tier** :
- BYOK (comme v1)
- Unlimited generations

**Pro Tier (€15/mois)** :
- Pooled API key (aucune config requise)
- Priority queue
- Early access features

**Database** :
- Tables : `user_plans`, `generation_usage`
- Track usage per user
- Rate limiting based on plan

---

## 🌐 Internationalisation

### Langues Supportées

- **English** (primary)
- **French** (secondary)

### Implementation avec next-intl

**Structure** :
```
src/messages/
  en.json
  fr.json
```

**Routing** :
```
/en/generate
/fr/generate
```

**Langue Toggle** :
- Dropdown dans navbar : 🇬🇧 EN | 🇫🇷 FR
- Change URL + reload content

**Traduit** :
- UI strings (buttons, labels, placeholders)
- Static content (homepage hero, features)
- Error messages
- NOT translated : User-generated content (notes, QCM restent dans langue originale)

---

## 📅 Phases d'Implémentation

### Phase 1 : Core Generation (6 heures)

**Goals** :
- Setup Next.js + Supabase + Tailwind
- Create database schema
- File upload + parsing
- Claude API integration (notes + QCM generation)
- Basic results display (markdown rendering)
- API key management (localStorage)

**Deliverables** :
- [ ] User can upload PDF
- [ ] User can enter API key (persists)
- [ ] Generate notes + QCM (text-only for now)
- [ ] View results on results page

---

### Phase 2 : QCM Interactif + Visual (6 heures)

**Goals** :
- Build QCM interactive interface
  - Quiz mode (question by question)
  - Scoring system
  - Review mode with explanations
- Replicate API integration (Ideogram v3 Turbo)
- Visual generation + display
- Gallery page (basic grid)

**Deliverables** :
- [ ] User can take quiz in app
- [ ] See score + corrections
- [ ] Visual sheet auto-generated
- [ ] Browse gallery of public notes

---

### Phase 3 : Polish + Deploy (12 heures)

**Goals** :
- Courses/modules CRUD
- Advanced gallery filters
- Voting system
- Download PDF
- Mobile responsiveness
- Loading states + error handling
- i18n setup (EN/FR)
- SEO meta tags
- Deploy to Vercel

**Deliverables** :
- [ ] Fully functional app
- [ ] Mobile-friendly
- [ ] Deployed with custom domain
- [ ] 5 beta users tested successfully

---

## 📊 Success Metrics

### Week 1 Targets

- [ ] **10+ notes generated** (seed content)
- [ ] **5+ courses covered** (diverse subjects)
- [ ] **3+ institutions** represented
- [ ] **20+ votes cast** (engagement)
- [ ] **50+ quiz attempts** (interactive feature usage)
- [ ] **80%+ quiz completion rate** (good UX)
- [ ] **0 critical bugs**
- [ ] **< 2 min generation time** (excluding AI)
- [ ] **100% image generation success**
- [ ] **> 30% mobile usage**
- [ ] **80%+ users save API key** (good onboarding)

---

## 🎯 Différenciation vs Concurrents

### Vs Knowt (Flashcards Leader)

**Knowt fait** :
- Flashcards only
- Ads sur free tier
- Basic quizzes (text-based)

**CourseNotes AI fait mieux** :
- ✅ Notes complètes (comprehensive)
- ✅ QCM interactif (scoring + explanations)
- ✅ Visual sheets (unique)
- ✅ No ads (BYOK transparent)

---

### Vs StudyFetch (AI Tutor)

**StudyFetch fait** :
- Notes + Tutor (Spark.E)
- $12/mois (expensive)
- No visuals

**CourseNotes AI fait mieux** :
- ✅ Free (BYOK ~€2-3/mois)
- ✅ Visual sheets
- ✅ Interactive quizzes (better than just chatbot)

---

### Vs Quizlet (Legacy)

**Quizlet fait** :
- Flashcards + basic quizzes
- $8/mois pour Learn mode
- Limited AI

**CourseNotes AI fait mieux** :
- ✅ Comprehensive notes (not just cards)
- ✅ Auto-generation from PDF
- ✅ Visual learning aids
- ✅ Advanced quiz features

---

## 🚀 Next Steps pour Claude Code

**Ready to Code!** 

Claude Code doit :
1. Lire ce spec complet
2. Lire les skills appropriées (/mnt/skills/public/...)
3. Implémenter Phase 1 en priorité
4. Puis Phase 2 (focus QCM interactif)
5. Finaliser Phase 3

**Questions à clarifier avant coding** :
- Quel framework CSS préféré ? (Tailwind recommended)
- shadcn/ui components list à installer
- Stratégie pour LaTeX rendering (KaTeX vs MathJax)
- PDF export library (jsPDF vs react-pdf)

---

**Document préparé pour Claude Code Opus 4**  
**Prêt à implémenter 🚀**
