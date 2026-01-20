# 🚀 Quick Start Guide - CourseNotes AI

## Setup en 5 minutes

### Étape 1: Installation des dépendances ✅

```bash
npm install
```

**Statut**: ✅ Déjà fait

---

### Étape 2: Configuration Supabase

#### A. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Remplissez les informations:
   - Name: `coursenotes-ai`
   - Database Password: (choisissez un mot de passe fort)
   - Region: Choisissez le plus proche (ex: Europe West)
4. Cliquez "Create new project" (attendre ~2 minutes)

#### B. Récupérer les credentials

1. Une fois le projet créé, allez dans **Project Settings** (icône engrenage)
2. Allez dans **API**
3. Copiez:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### C. Exécuter la migration SQL

1. Dans Supabase, allez dans **SQL Editor** (icône ⚡)
2. Cliquez **"+ New query"**
3. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql` de ce projet
4. **Copiez tout le contenu** et collez-le dans l'éditeur SQL
5. Cliquez **"Run"** (ou Ctrl+Enter)
6. ✅ Vous devriez voir "Success. No rows returned"

#### D. Créer les buckets de storage

1. Allez dans **Storage** dans Supabase
2. Cliquez **"New bucket"**
   - Name: `uploads`
   - Public bucket: **✓ Coché**
   - Cliquez "Create bucket"
3. Répétez pour créer un bucket `generated` (également public)

---

### Étape 3: Configuration Replicate

#### A. Créer un compte Replicate

1. Allez sur [https://replicate.com](https://replicate.com)
2. Cliquez "Sign up" (vous pouvez utiliser GitHub)
3. Confirmez votre email

#### B. Obtenir l'API token

1. Une fois connecté, allez sur [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Cliquez **"Create token"**
3. Copiez le token (commence par `r8_`)
4. **Ajoutez 10$ de crédit** :
   - Allez dans **Billing**
   - Cliquez "Add credit"
   - Ajoutez minimum $10 (suffisant pour 1000 images)

---

### Étape 4: Configurer les variables d'environnement

1. Ouvrez le fichier `.env.local` (déjà créé)
2. Remplacez les valeurs:

```env
# Supabase (de l'étape 2B)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replicate (de l'étape 3B)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
```

3. **Sauvegardez** le fichier

---

### Étape 5: Lancer l'application

```bash
npm run dev
```

✅ **L'application est maintenant accessible sur** : [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test de l'application

### Test 1: Homepage

1. Ouvrez [http://localhost:3000](http://localhost:3000)
2. ✅ Vous devriez voir la homepage avec le hero "Transform Your Lectures..."

### Test 2: Génération de notes

1. Cliquez sur **"Generate Notes"**
2. Préparez un fichier de test:
   - PDF de cours (recommandé)
   - Ou un DOCX
   - Ou une image de slide
3. Remplissez le formulaire:
   - **Upload File**: Sélectionnez votre fichier
   - **Claude API Key**: Obtenez-en une sur [console.anthropic.com](https://console.anthropic.com)
   - **Your Name**: Votre nom
   - **Note Title**: Ex: "Lecture 1: Introduction"
   - **Course Code**: Ex: "CS101"
   - **Course Name**: Ex: "Introduction to Computer Science"
   - Laissez les autres paramètres par défaut
4. Cliquez **"Generate Notes"**
5. ⏳ Attendez 2-3 minutes
6. ✅ Vous serez redirigé vers la page de la note

### Test 3: Quiz interactif

1. Sur la page de la note, cliquez sur l'onglet **"QCM"**
2. Cliquez **"Start Quiz"**
3. Répondez aux questions
4. Cliquez **"Submit Quiz"**
5. ✅ Vous devriez voir votre score avec des ⭐⭐⭐
6. Cliquez **"Review Answers"** pour voir les corrections

### Test 4: Gallery

1. Retournez à la homepage
2. Cliquez **"Browse Gallery"**
3. ✅ Vous devriez voir la note que vous venez de créer
4. Testez les filtres et le tri

---

## 🎯 Prêt pour le déploiement ?

Consultez le [README.md](README.md) section "Deployment (Vercel)"

---

## ❓ Problèmes courants

### Le serveur ne démarre pas
```bash
# Vérifiez les dépendances
npm install

# Redémarrez le serveur
npm run dev
```

### Erreur Supabase
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que la migration SQL a bien été exécutée
- Vérifiez que les buckets `uploads` et `generated` existent

### Erreur "Invalid API key" (Claude)
- Allez sur [console.anthropic.com](https://console.anthropic.com)
- Créez un nouveau compte si nécessaire
- Allez dans "API Keys"
- Créez une nouvelle clé
- **Ajoutez du crédit** (minimum $5)
- Copiez la clé qui commence par `sk-ant-`

### Erreur Replicate
- Vérifiez le token dans `.env.local`
- Vérifiez que vous avez du crédit dans votre compte Replicate

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur dans le terminal
3. Consultez le [README.md](README.md) section "Troubleshooting"

---

**Félicitations ! 🎉 Votre application CourseNotes AI est opérationnelle !**
