# Setup Réagim Dashboard

## 1. Supabase

1. Aller sur https://supabase.com → New project → nommer le projet "reagim-dashboard"
2. Attendre la création (1-2 min)
3. Aller dans **SQL Editor** → **New query**
4. Copier-coller le contenu de `supabase/schema.sql` et cliquer **Run**
5. Aller dans **Project Settings → API** et copier :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Dans **Realtime → Tables** → activer `biens`

## 2. Variables d'environnement en local

```bash
cp .env.local.example .env.local
# Remplir avec vos vraies clés Supabase
```

## 3. Lancer en local

```bash
npm run dev
# Dashboard : http://localhost:3000
# Vue aubergiste : http://localhost:3000/aubergiste
```

## 4. Déployer sur Vercel

1. Pousser le projet sur GitHub
2. Sur vercel.com → Import → sélectionner le repo
3. Dans **Environment Variables**, ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Déployer → l'URL sera `reagim-dashboard.vercel.app`

## Démo en entretien

1. Ouvrir le dashboard sur laptop : `https://reagim-dashboard.vercel.app`
2. Ouvrir la vue aubergiste sur smartphone : `https://reagim-dashboard.vercel.app/aubergiste`
3. Changer un statut sur le smartphone → voir le pin changer de couleur sur la carte en direct ✨
