# 🏗️ Architecture Technique - CourseNotes AI

## Vue d'ensemble

CourseNotes AI est une application full-stack Next.js qui génère automatiquement des notes de cours, des QCM interactifs et des infographies à partir de fichiers uploadés.

---

## 📁 Structure du Projet

```
CourseNotesAI/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes (backend)
│   │   ├── generate/route.ts         # POST - Génération complète
│   │   ├── notes/
│   │   │   ├── route.ts              # GET - Liste des notes
│   │   │   └── [id]/route.ts         # GET - Détail d'une note
│   │   ├── vote/route.ts             # POST - Vote sur une note
│   │   └── courses/route.ts          # GET/POST - Gestion cours
│   ├── generate/page.tsx             # Page de génération
│   ├── gallery/page.tsx              # Page gallery publique
│   ├── notes/[id]/page.tsx           # Page détail note (tabs)
│   ├── courses/page.tsx              # Page browse courses
│   ├── layout.tsx                    # Layout racine + Navbar
│   ├── page.tsx                      # Homepage
│   └── globals.css                   # Styles globaux
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── progress.tsx
│   ├── layout/
│   │   └── Navbar.tsx                # Barre de navigation
│   └── quiz/
│       └── QuizContainer.tsx         # QCM interactif (feature phare)
│
├── lib/
│   ├── ai/
│   │   ├── claude.ts                 # Intégration Claude API
│   │   ├── replicate.ts              # Intégration Ideogram v3
│   │   └── prompts.ts                # Prompts structurés
│   ├── parsers/
│   │   └── file-parser.ts            # PDF/DOCX/Image parsing
│   ├── storage/
│   │   ├── api-key-storage.ts        # localStorage API keys
│   │   └── quiz-progress.ts          # localStorage quiz state
│   ├── supabase/
│   │   ├── client.ts                 # Client Supabase
│   │   └── database.types.ts         # Types générés
│   └── utils.ts                      # Utilitaires (cn, etc.)
│
├── types/
│   └── index.ts                      # Types TypeScript globaux
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Schéma DB complet
│
├── public/                           # Assets statiques
├── .env.local                        # Variables d'environnement (gitignored)
├── .env.example                      # Template env vars
├── tailwind.config.ts                # Config Tailwind
├── tsconfig.json                     # Config TypeScript
├── next.config.ts                    # Config Next.js
├── package.json                      # Dépendances
├── README.md                         # Documentation complète
├── QUICKSTART.md                     # Guide démarrage rapide
└── ARCHITECTURE.md                   # Ce fichier
```

---

## 🔄 Flow de Données - Génération de Notes

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  1. User uploads file (PDF/DOCX/Image)                          │
│  2. Fills form (course, settings, API key)                      │
│  3. Clicks "Generate Notes"                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ POST /api/generate
                         │ FormData: file + params
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              API ROUTE: /api/generate/route.ts                  │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Parse File                                             │
│  ├─ parseFile() → Extracted text                                │
│  │   ├─ PDF: pdf-parse                                          │
│  │   ├─ DOCX: mammoth                                           │
│  │   └─ Images: tesseract.js (OCR)                              │
│                                                                  │
│  Step 2: Create/Get Course in DB                                │
│  ├─ Check if course exists (institution + code)                 │
│  ├─ If not: INSERT into courses table                           │
│  └─ Return course_id                                            │
│                                                                  │
│  Step 3: Generate with Claude                                   │
│  ├─ generateWithClaude(text, settings)                          │
│  │   ├─ Build structured prompt                                 │
│  │   ├─ Call Anthropic API (claude-sonnet-4)                    │
│  │   └─ Parse response → Extract 3 sections:                    │
│  │       ├─ notes_markdown                                      │
│  │       ├─ qcm_json                                            │
│  │       └─ visual_prompt                                       │
│                                                                  │
│  Step 4: Generate Visual                                        │
│  ├─ generateVisualWithReplicate(visual_prompt)                  │
│  │   ├─ Call Replicate API (Ideogram v3 Turbo)                 │
│  │   └─ Return image URL                                        │
│                                                                  │
│  Step 5: Store in Database                                      │
│  ├─ INSERT into notes table:                                    │
│  │   ├─ course_id, module_id                                    │
│  │   ├─ creator_name, title, language                           │
│  │   ├─ notes_markdown                                          │
│  │   ├─ qcm_json                                                │
│  │   ├─ visual_prompt                                           │
│  │   └─ visual_image_url                                        │
│  └─ Return note_id                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ JSON Response:
                         │ { success, noteId, notesMarkdown,
                         │   qcmJson, visualUrl }
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  Redirect to: /notes/{noteId}                                   │
│  Display tabs: Notes | QCM | Visual                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎮 QCM Interactif - Architecture du Composant

**Fichier**: `components/quiz/QuizContainer.tsx`

### États du Composant

```typescript
type QuizMode = 'intro' | 'taking' | 'results' | 'review';

interface State {
  mode: QuizMode;
  currentQuestionIndex: number;
  userAnswers: Record<number, number>; // questionId → selectedOption
  startTime: number;
  elapsedTime: number;
}
```

### Flow des Modes

```
┌─────────┐
│  INTRO  │ → Affiche métadonnées (15 questions, ~10 min)
└────┬────┘   [Start Quiz] button
     │
     ▼
┌─────────┐
│ TAKING  │ → Mode examen
└────┬────┘   - Affiche question courante
     │         - Radio buttons pour options
     │         - Navigation [Previous] [Next]
     │         - Progress bar
     │         - Auto-save dans localStorage
     │
     │ [Submit Quiz]
     ▼
┌─────────┐
│ RESULTS │ → Affiche score
└────┬────┘   - Score: 12/15 (80%)
     │         - Grade: ⭐⭐⭐⭐ "Excellent!"
     │         - Breakdown par topic
     │         - [Review Answers] [Retry Quiz]
     │
     │ [Review Answers]
     ▼
┌─────────┐
│ REVIEW  │ → Mode correction
└─────────┘   - Affiche chaque question avec réponse
              - Highlight correct/wrong
              - Explications détaillées
              - Navigation entre questions
```

### Persistence

- **localStorage** :
  - Clé : `quiz_progress_{noteId}`
  - Sauvegarde automatique pendant "taking"
  - Permet de reprendre si page reload
  - Supprimée après "submit"

---

## 🗄️ Base de Données Supabase

### Schéma ER

```
institutions (1) ──< courses (M)
                      │
                      ├──< modules (M)
                      │
                      └──< notes (M)
                            │
                            └──< votes (M)
```

### Tables Principales

#### 1. `notes` (Table centrale)

```sql
notes:
  - id (UUID, PK)
  - course_id (UUID, FK → courses)
  - module_id (UUID, FK → modules, nullable)
  - creator_name (TEXT)
  - title (TEXT)
  - language (en|fr)
  - notes_markdown (TEXT)        -- Contenu Markdown
  - qcm_json (JSONB)              -- Quiz complet
  - visual_prompt (TEXT)          -- Prompt Ideogram
  - visual_image_url (TEXT)       -- URL image générée
  - upvotes (INT, default 0)
  - downvotes (INT, default 0)
  - views_count (INT, default 0)
  - created_at, updated_at
```

#### 2. `qcm_json` Structure

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 2,
      "explanation": "Detailed explanation...",
      "difficulty": "medium",
      "topic": "Topic name"
    }
  ],
  "metadata": {
    "total_questions": 15,
    "estimated_time_minutes": 10,
    "passing_score_percentage": 60
  }
}
```

---

## 🔌 API Endpoints

### 1. POST /api/generate

**Entrées** :
- FormData avec file + params

**Sorties** :
```json
{
  "success": true,
  "noteId": "uuid",
  "notesMarkdown": "# Lecture 1...",
  "qcmJson": { "questions": [...] },
  "visualUrl": "https://replicate.delivery/..."
}
```

**Durée** : ~2-3 minutes (maxDuration: 300s)

---

### 2. GET /api/notes

**Query params** :
- `institution_id` (optional)
- `course_id` (optional)
- `language` (en|fr, optional)
- `sort` (recent|upvotes|views, default: recent)
- `limit` (default: 20)
- `offset` (default: 0)

**Sorties** :
```json
{
  "notes": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### 3. GET /api/notes/[id]

**Sorties** : Note complète avec relations (course, institution, module)

**Side effect** : Incrémente `views_count`

---

### 4. POST /api/vote

**Entrées** :
```json
{
  "noteId": "uuid",
  "voteType": "up" | "down"
}
```

**Logique** :
- Hash IP → `user_identifier`
- Check si déjà voté → UPDATE
- Sinon → INSERT
- Update counts sur note

---

## 🧩 Composants Clés

### QuizContainer (components/quiz/QuizContainer.tsx)

**Responsabilités** :
- Gestion de l'état du quiz (4 modes)
- Calcul du score
- Persistence localStorage
- Affichage des explications

**Props** :
```typescript
interface QuizContainerProps {
  noteId: string;
  qcmData: QCMData;
}
```

**Fonctions principales** :
- `handleStartQuiz()` : Démarre le timer
- `handleSelectAnswer()` : Enregistre réponse
- `handleSubmit()` : Calcule score, switch to results
- `calculateScore()` : Count correct answers
- `getGrade()` : Convertit % → étoiles

---

### NotesViewer (app/notes/[id]/page.tsx)

**Responsabilités** :
- Fetch note depuis API
- Affichage tabs (Notes, QCM, Visual)
- Rendu Markdown + LaTeX (react-markdown + KaTeX)
- Vote buttons
- Share/Download actions

**Libraries** :
- `react-markdown` : Markdown → HTML
- `remark-gfm` : GitHub Flavored Markdown
- `remark-math` + `rehype-katex` : LaTeX math rendering

---

## 🔐 Sécurité

### API Keys (Claude)

**Phase 1** : BYOK (Bring Your Own Key)
- Stockées **uniquement** dans `localStorage` (client-side)
- Jamais sauvées en DB
- Transmises via API seulement durant génération
- Validation côté serveur avant usage

### User Identification (Votes)

```typescript
function getUserIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
}
```

- Hash SHA-256 de l'IP
- Empêche multi-votes
- Préserve anonymat relatif

---

## 🚀 Performance

### Optimisations

1. **Next.js Image Optimization**
   - Automatic WebP conversion
   - Responsive images
   - Lazy loading

2. **Supabase Indexes**
   ```sql
   CREATE INDEX idx_notes_course ON notes(course_id);
   CREATE INDEX idx_notes_upvotes ON notes(upvotes DESC);
   CREATE INDEX idx_notes_created ON notes(created_at DESC);
   ```

3. **API Route Caching**
   - Gallery: cache 60s
   - Notes detail: cache 120s

4. **Lazy Loading**
   - Tabs content chargé à la demande
   - Images lazy-loaded via Next/Image

---

## 📊 Monitoring & Logs

### Logs Disponibles

```typescript
// Dans /api/generate/route.ts
console.log('Parsing file...');
console.log('Generating with Claude...');
console.log('Generating visual...');
console.error('Failed to generate visual:', error);
```

### Métriques à Tracker (Production)

- Temps de génération moyen
- Taux de succès Claude API
- Taux de succès Ideogram
- Taux de completion quiz
- Taux de retry quiz

---

## 🔧 Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
REPLICATE_API_TOKEN=r8_xxx

# Optional (v2)
NEXT_PUBLIC_APP_URL=https://coursenotes.ai
```

### Next.js Config

```typescript
// next.config.ts
{
  images: {
    remotePatterns: [
      { hostname: '**.supabase.co' },
      { hostname: 'replicate.delivery' }
    ]
  }
}
```

---

## 🧪 Testing Strategy

### Tests à Implémenter (Future)

1. **Unit Tests**
   - `lib/ai/prompts.ts` → Validation prompts
   - `lib/parsers/file-parser.ts` → Test parsing
   - `components/quiz/QuizContainer.tsx` → Score calculation

2. **Integration Tests**
   - API routes (GET /api/notes, POST /api/generate)
   - Supabase queries

3. **E2E Tests** (Playwright)
   - User flow : Upload → Generate → View → Quiz
   - Gallery filter/sort
   - Vote system

---

## 🔮 Extensibilité

### Points d'Extension Faciles

1. **Nouveaux Parsers**
   ```typescript
   // lib/parsers/file-parser.ts
   async function parseFile(file: File): Promise<string> {
     // Add: .pptx, .txt, .md, etc.
   }
   ```

2. **Nouveaux AI Models**
   ```typescript
   // lib/ai/
   // Ajouter: openai.ts, gemini.ts, etc.
   ```

3. **Nouveaux Storage Providers**
   ```typescript
   // lib/storage/
   // Ajouter: s3-storage.ts, cloudinary.ts, etc.
   ```

4. **Auth System** (v2)
   ```typescript
   // Utiliser Supabase Auth
   import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
   ```

---

## 📚 Ressources

- **Next.js Docs** : [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs** : [supabase.com/docs](https://supabase.com/docs)
- **Claude API** : [docs.anthropic.com](https://docs.anthropic.com)
- **Replicate API** : [replicate.com/docs](https://replicate.com/docs)
- **shadcn/ui** : [ui.shadcn.com](https://ui.shadcn.com)

---

**Architecture v1.0** - Prête pour déploiement production 🚀
