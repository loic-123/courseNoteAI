# 📚 CourseNotes AI

**Transform Your Lectures into Complete Study Materials**

CourseNotes AI is an all-in-one platform that automatically generates:
- 📝 **Comprehensive Notes** (10/10 detail level)
- ✅ **Interactive Quizzes** (in-app scoring & corrections)
- 🎨 **Visual Study Sheets** (AI-generated infographics)

---

## 🚀 Features

### 1. Notes Generation
- Upload PDF, DOCX, or images
- Configurable detail level (1-10)
- Technical level adaptation (Beginner/Intermediate/Advanced)
- Optional creative metaphors
- LaTeX math support
- Markdown formatting

### 2. Interactive QCM (Feature Phare)
- 10-15 questions per note
- 3 modes: Taking → Results → Review
- Instant scoring with grade (⭐⭐⭐⭐⭐)
- Detailed explanations for each answer
- Progress saved in localStorage
- Topic breakdown analysis

### 3. Visual Sheets
- Auto-generated via Ideogram v3 Turbo
- A3 infographic format
- Downloadable PNG

### 4. Public Gallery
- Browse all notes
- Filter by institution, course, language
- Sort by recent/upvoted/viewed
- Vote system (👍👎)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend/Backend** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage |
| **AI Notes** | Claude Sonnet 4.5 (user's API key) |
| **AI Visual** | Ideogram v3 Turbo (Replicate) |
| **Markdown** | react-markdown + KaTeX |
| **Deployment** | Vercel |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- Supabase account
- Replicate API token
- Claude API key (for users)

### 1. Clone & Install

```bash
git clone <your-repo>
cd CourseNotesAI
npm install
```

### 2. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/Public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

4. Run the migration:
   - Go to SQL Editor in Supabase dashboard
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

5. Create storage bucket for visuals:
   - Go to Storage in Supabase Dashboard
   - Click "New bucket"
   - Name: `visuals`
   - Check "Public bucket" for public read access
   - Click "Create bucket"

6. Run storage policies (optional, for RLS):
   - Go to SQL Editor
   - Copy content from `supabase/migrations/002_storage_bucket.sql`
   - Execute the SQL

### 3. Setup Replicate

1. Get API token from [replicate.com](https://replicate.com)
2. Add to `.env.local`: `REPLICATE_API_TOKEN=r8_...`

### 4. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Replicate
REPLICATE_API_TOKEN=r8_your_token_here
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `REPLICATE_API_TOKEN`
4. Deploy!

### 3. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 🏛️ Architecture Complète

### Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COURSENOTESAI                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FRONTEND (Next.js 14 App Router)                                      │
│   ├── / (Homepage)           → Hero + Features                          │
│   ├── /generate              → Upload + Configuration Form              │
│   ├── /gallery               → Browse All Notes                         │
│   ├── /courses               → Browse Courses                           │
│   └── /notes/[id]            → View Notes / Quiz / Visual               │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                    API ROUTES (Server)                        │    │
│   ├───────────────────────────────────────────────────────────────┤    │
│   │  POST /api/generate      → Pipeline de génération (5 étapes)  │    │
│   │  GET  /api/notes         → Liste avec filtres                 │    │
│   │  GET  /api/notes/[id]    → Détail + incrémente vues          │    │
│   │  POST /api/vote          → Système de votes                   │    │
│   │  GET/POST /api/courses   → Gestion des cours                  │    │
│   └─────────────┬─────────────────────────────┬───────────────────┘    │
│                 │                             │                         │
│   ┌─────────────▼─────────────┐   ┌──────────▼──────────────────┐     │
│   │    SUPABASE (PostgreSQL)  │   │    SERVICES IA EXTERNES     │     │
│   ├───────────────────────────┤   ├─────────────────────────────┤     │
│   │  Tables:                  │   │  Claude API (Anthropic)     │     │
│   │  • institutions           │   │  ├─ Génération notes        │     │
│   │  • courses                │   │  ├─ Génération QCM          │     │
│   │  • modules                │   │  └─ Génération prompt visuel│     │
│   │  • notes (table principale)│  │                             │     │
│   │  • votes                  │   │  Replicate API              │     │
│   │  • tags                   │   │  └─ FLUX Schnell (images)   │     │
│   │  • notes_tags             │   └─────────────────────────────┘     │
│   └───────────────────────────┘                                        │
│                                                                         │
│   PARSERS DE FICHIERS                                                   │
│   ├── pdf-parse       → Extraction texte PDF                           │
│   ├── mammoth         → Extraction texte DOCX                          │
│   ├── tesseract.js    → OCR pour images                                │
│   └── File API        → Fichiers TXT                                   │
│                                                                         │
│   COMPOSANTS UI                                                         │
│   ├── Navbar          → Navigation globale                             │
│   ├── QuizContainer   → Interface quiz interactive                     │
│   ├── shadcn/ui       → Composants UI (Button, Card, Tabs...)          │
│   └── react-markdown  → Rendu markdown + KaTeX (LaTeX)                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Diagramme Entité-Relation

```
┌──────────────────┐
│ INSTITUTIONS     │
├──────────────────┤
│ id (UUID) [PK]   │
│ name             │
│ short_name       │
│ created_at       │
└────────┬─────────┘
         │ 1:N
         │
┌────────▼──────────┐
│ COURSES           │
├───────────────────┤
│ id (UUID) [PK]    │
│ institution_id ───┼──→ institutions.id
│ code              │
│ name              │
│ description       │
│ created_at        │
└────────┬──────────┘
         │ 1:N
         │
┌────────▼──────────┐              ┌──────────────────┐
│ MODULES           │              │ TAGS             │
├───────────────────┤              ├──────────────────┤
│ id (UUID) [PK]    │              │ id (UUID) [PK]   │
│ course_id ────────┼──→ courses   │ name             │
│ name              │              │ created_at       │
│ description       │              └────────┬─────────┘
│ order_index       │                       │ N:M
│ created_at        │                       │
└───────────────────┘              ┌────────▼─────────┐
         ▲                         │ NOTES_TAGS       │
         │ 1:N                     ├──────────────────┤
         │                         │ note_id ─────────┼──→ notes.id
         │                         │ tag_id ──────────┼──→ tags.id
┌────────┴────────────────────┐    └──────────────────┘
│ NOTES (Table Principale)    │
├─────────────────────────────┤
│ id (UUID) [PK]              │
│ course_id ──────────────────┼──→ courses.id
│ module_id ──────────────────┼──→ modules.id (nullable)
│ creator_name                │
│ title                       │
│ language ('en'/'fr')        │
│                             │
│ CONTENU GÉNÉRÉ:             │
│ notes_markdown (TEXT)       │  ← Notes complètes en Markdown
│ qcm_json (JSONB)            │  ← Quiz avec questions/réponses
│ visual_prompt (TEXT)        │  ← Prompt pour génération image
│ visual_image_url (TEXT)     │  ← URL image Replicate
│                             │
│ ENGAGEMENT:                 │
│ upvotes (INT)               │
│ downvotes (INT)             │
│ views_count (INT)           │
│                             │
│ created_at, updated_at      │
└─────────────┬───────────────┘
              │ 1:N
              │
┌─────────────▼───────────┐
│ VOTES                   │
├─────────────────────────┤
│ id (UUID) [PK]          │
│ note_id ────────────────┼──→ notes.id
│ user_identifier         │  ← Hash SHA256 de l'IP
│ vote_type ('up'/'down') │
│ created_at              │
└─────────────────────────┘
UNIQUE(note_id, user_identifier)
```

### Tables Détaillées

| Table | Description | Champs clés |
|-------|-------------|-------------|
| **institutions** | Universités/écoles | name, short_name |
| **courses** | Cours par institution | code, name, institution_id |
| **modules** | Sous-parties de cours | name, order_index, course_id |
| **notes** | Contenus générés | markdown, qcm_json, visual_url |
| **votes** | Votes utilisateurs | vote_type, user_identifier |
| **tags** | Tags de filtrage | name |
| **notes_tags** | Table de jonction | note_id, tag_id |

### Pre-seeded Data

The migration automatically seeds 5 institutions:
- Imperial College London
- University of Cambridge
- University of Oxford
- University College London (UCL)
- London School of Economics (LSE)

---

## 🔄 Flux de Données Détaillés

### Flux 1: Génération de Notes (Pipeline Principal)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUX DE GÉNÉRATION COMPLET                           │
└─────────────────────────────────────────────────────────────────────────┘

USER                           FRONTEND                        BACKEND
  │                               │                               │
  │  1. Upload fichier(s)         │                               │
  │  2. Configure settings        │                               │
  │  3. Click [Generate]          │                               │
  │──────────────────────────────>│                               │
  │                               │                               │
  │                               │  POST /api/generate           │
  │                               │  (FormData)                   │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ ÉTAPE 1: Parse      │
  │                               │                    │ ├─ PDF → pdf-parse  │
  │                               │                    │ ├─ DOCX → mammoth   │
  │                               │                    │ ├─ Image → OCR      │
  │                               │                    │ └─ TXT → text()     │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ ÉTAPE 2: Course     │
  │                               │                    │ ├─ Check exists     │
  │                               │                    │ └─ Create if new    │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ ÉTAPE 3: Claude API │
  │                               │                    │ ├─ Generate notes   │
  │                               │                    │ ├─ Generate QCM     │
  │                               │                    │ └─ Generate prompt  │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ ÉTAPE 4: Replicate  │
  │                               │                    │ └─ Generate image   │
  │                               │                    │    (FLUX Schnell)   │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ ÉTAPE 5: Database   │
  │                               │                    │ └─ INSERT note      │
  │                               │                    │    (markdown, qcm,  │
  │                               │                    │     visual_url)     │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │      { success, noteId }      │
  │                               │<──────────────────────────────│
  │                               │                               │
  │     Redirect /notes/{id}      │                               │
  │<──────────────────────────────│                               │
  │                               │                               │
```

### Flux 2: Affichage d'une Note

```
USER                           FRONTEND                        BACKEND
  │                               │                               │
  │  Click note card              │                               │
  │──────────────────────────────>│                               │
  │                               │  GET /api/notes/{id}          │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ 1. Query note       │
  │                               │                    │ 2. Join courses     │
  │                               │                    │ 3. Join institutions│
  │                               │                    │ 4. INCREMENT views  │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │      { note + relations }     │
  │                               │<──────────────────────────────│
  │                               │                               │
  │     ┌─────────────────────────┤                               │
  │     │ Render 3 tabs:          │                               │
  │     │ ├─ Notes (Markdown)     │                               │
  │     │ ├─ Quiz (QCM)           │                               │
  │     │ └─ Visual (Image)       │                               │
  │     └─────────────────────────┤                               │
  │<──────────────────────────────│                               │
```

### Flux 3: Quiz Interactif

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MACHINE D'ÉTAT DU QUIZ                          │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  INTRO   │◄──────────────────────────────────┐
     │          │                                    │
     │ • Stats  │                                    │
     │ • Rules  │                                    │
     └────┬─────┘                                    │
          │ [Start Quiz]                             │
          ▼                                          │
     ┌──────────┐                                    │
     │ TAKING   │                                    │
     │          │                                    │
     │ • Q1..Qn │──── Auto-save to ────► localStorage│
     │ • Timer  │     quiz_progress_{id}             │
     └────┬─────┘                                    │
          │ [Submit]                                 │
          ▼                                          │
     ┌──────────┐                                    │
     │ RESULTS  │                                    │
     │          │                                    │
     │ • Score  │                                    │
     │ • Stars  │                                    │
     │ • Grade  │                                    │
     └────┬─────┴────────┐                          │
          │              │                          │
          │ [Review]     │ [Retry]                  │
          ▼              └──────────────────────────┘
     ┌──────────┐
     │ REVIEW   │
     │          │
     │ • Q + A  │
     │ • Explain│
     └──────────┘


SCORING:
├── 90%+ → ⭐⭐⭐⭐⭐ "Perfect!"
├── 80%+ → ⭐⭐⭐⭐  "Excellent!"
├── 70%+ → ⭐⭐⭐   "Good job!"
├── 60%+ → ⭐⭐    "Pass"
└── <60% → ⭐     "Needs review"
```

### Flux 4: Système de Votes

```
USER                           FRONTEND                        BACKEND
  │                               │                               │
  │  Click 👍 or 👎               │                               │
  │──────────────────────────────>│                               │
  │                               │  POST /api/vote               │
  │                               │  { noteId, voteType }         │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │                    ┌──────────┴──────────┐
  │                               │                    │ 1. Get IP from      │
  │                               │                    │    x-forwarded-for  │
  │                               │                    │ 2. Hash SHA256      │
  │                               │                    │    → user_identifier│
  │                               │                    │ 3. Check existing   │
  │                               │                    │    vote             │
  │                               │                    │ 4. Insert/Update    │
  │                               │                    │ 5. Update note      │
  │                               │                    │    counts           │
  │                               │                    └──────────┬──────────┘
  │                               │                               │
  │                               │  { upvotes, downvotes }       │
  │                               │<──────────────────────────────│
  │                               │                               │
  │     Update UI counts          │                               │
  │<──────────────────────────────│                               │
```

---

## 🗂️ Structure des Fichiers

```
CourseNotesAI/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # Pipeline de génération
│   │   ├── notes/
│   │   │   ├── route.ts           # Liste des notes
│   │   │   └── [id]/route.ts      # Détail d'une note
│   │   ├── vote/route.ts          # Système de votes
│   │   └── courses/route.ts       # Gestion des cours
│   ├── generate/page.tsx          # Page d'upload
│   ├── gallery/page.tsx           # Galerie publique
│   ├── courses/page.tsx           # Liste des cours
│   ├── notes/[id]/page.tsx        # Vue détail note
│   ├── layout.tsx                 # Layout racine
│   └── page.tsx                   # Homepage
├── components/
│   ├── layout/Navbar.tsx          # Navigation
│   ├── quiz/QuizContainer.tsx     # Quiz interactif
│   └── ui/                        # Composants shadcn/ui
├── lib/
│   ├── ai/
│   │   ├── claude.ts              # Intégration Claude API
│   │   └── replicate.ts           # Intégration Replicate
│   ├── parsers/
│   │   └── file-parser.ts         # Parsers multi-format
│   └── supabase/
│       └── client.ts              # Client Supabase
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Schéma DB complet
├── types/
│   └── index.ts                   # Types TypeScript
└── next.config.ts                 # Config Next.js
```

---

## 🎯 User Flow

### 1. Generate Notes

1. Visit `/generate`
2. Upload PDF/DOCX/Image
3. Enter Claude API key (saved in localStorage)
4. Configure settings:
   - Detail level (1-10)
   - Technical level
   - Length (short/medium/long)
   - Language (EN/FR)
   - Use metaphors (toggle)
5. Fill course details
6. Click "Generate"
7. Wait ~2-3 minutes
8. Redirected to note detail page

### 2. Take Quiz

1. Go to note detail page
2. Click "QCM" tab
3. Click "Start Quiz"
4. Answer 10-15 questions
5. Submit and see score
6. Review wrong answers with explanations
7. Retry if needed

### 3. Browse Gallery

1. Visit `/gallery`
2. Filter by language, sort by recent/upvotes/views
3. Click on note card
4. View notes, take quiz, or download visual

---

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| **Vercel** | €0 (Free tier) |
| **Supabase** | €0 (< 500MB DB) |
| **Replicate** | €0.01/image = **~€8/month** (800 images) |
| **Claude API** | €0 (users provide keys) |
| **Total** | **~€8/month** ✅ |

---

## 🔑 API Key Management

### Phase 1: BYOK (Bring Your Own Key)

- Users provide their Claude API key
- Stored in **localStorage** (client-side only)
- Not sent to server except during generation
- "Remember my key" checkbox
- Keys never stored in database

### Get Claude API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create account / Login
3. Go to API Keys
4. Create new key
5. Copy `sk-ant-...`

---

## 📱 Mobile Responsiveness

- Responsive grid layouts
- Touch-friendly quiz interface
- Swipe navigation (future enhancement)
- Mobile-optimized cards
- Sticky navbar

---

## 🐛 Troubleshooting

### PDF Parsing Fails

- Try converting to DOCX
- Ensure file < 50MB
- Check for corrupted file

### Claude API Error

- Verify API key is valid
- Check API rate limits
- Ensure sufficient credits

### Supabase Connection Error

- Verify environment variables
- Check Supabase project status
- Ensure RLS policies allow access

### Visual Generation Fails

- Check Replicate API token
- Verify model availability
- App continues without visual (graceful degradation)

---

## 🎯 Success Metrics (Week 1)

- [ ] 10+ notes generated
- [ ] 5+ courses covered
- [ ] 20+ votes cast
- [ ] 50+ quiz attempts
- [ ] 80%+ quiz completion rate
- [ ] < 2 min generation time
- [ ] 100% image generation success

---

## 🔮 Future Enhancements (v2)

- [ ] Freemium model (pooled API keys)
- [ ] User authentication (Supabase Auth)
- [ ] Personal dashboard
- [ ] Quiz history tracking
- [ ] Collaborative notes
- [ ] Mobile app (React Native)
- [ ] AI-powered study recommendations
- [ ] Export to Notion/Anki

---

## 📄 License

MIT License - feel free to use and modify!

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Claude AI](https://anthropic.com)
- [Replicate](https://replicate.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Ready to transform your lectures? 🚀**

Visit [http://localhost:3000](http://localhost:3000) to get started!
