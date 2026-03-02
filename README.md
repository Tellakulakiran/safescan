# SafeScan — Deploy Guide

## What you're deploying
- **Frontend**: Landing page, create profile form, profile view page
- **Backend**: Next.js API routes (serverless functions on Vercel)
- **Database**: PostgreSQL on Neon (free tier, serverless)
- **Hosting**: Vercel (free tier)

When someone scans a QR it opens `yourdomain.com/p/PROFILE_ID` — a real URL that loads instantly from the database.

---

## Step 1 — Set up the database (5 min)

1. Go to **https://neon.tech** → sign up free
2. Click **New Project** → name it `safescan` → click Create
3. On the dashboard, click **Connect** (top right)
4. Copy the **Pooled connection string** → this is your `DATABASE_URL`
5. Copy the **Direct connection string** → this is your `DIRECT_URL`
   - Direct = same URL but **without** `?pgbouncer=true`

---

## Step 2 — Run locally first (optional but recommended)

```bash
# Clone and install
npm install

# Create your env file
cp .env.example .env.local
# Edit .env.local — paste your two Neon URLs

# Push schema to the database (creates tables)
npm run db:push

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "SafeScan v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/safescan.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel

1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo `safescan`
3. Under **Environment Variables**, add:
   - `DATABASE_URL` = your Neon pooled URL
   - `DIRECT_URL` = your Neon direct URL
4. Click **Deploy**

That's it. Vercel runs `npm run build` which includes `prisma generate` automatically.

**Your app will be live at:** `https://safescan.vercel.app`

---

## Step 5 — Add a custom domain (optional)

1. In Vercel → your project → **Settings → Domains**
2. Add your domain (e.g. `safescan.app`)
3. Update your DNS with the records Vercel shows you
4. SSL certificate is automatic

---

## How QR codes work

- User fills form → profile saved to Neon PostgreSQL with a UUID
- QR code encodes: `https://yourdomain.com/p/UUID`
- Anyone scanning it opens that URL → page fetches profile from DB → shows full details
- **No internet?** The profile page renders from server-side data — even a cached version works

---

## File structure

```
safescan/
├── prisma/
│   └── schema.prisma          ← Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx            ← Landing page (/)
│   │   ├── create/page.tsx     ← Create profile (/create)
│   │   ├── p/[id]/
│   │   │   ├── page.tsx        ← Profile view server component
│   │   │   ├── ProfileClient.tsx ← Online/offline display logic
│   │   │   └── not-found.tsx   ← 404 for bad QR codes
│   │   ├── api/profiles/
│   │   │   ├── route.ts        ← POST (create) + GET (list)
│   │   │   └── [id]/route.ts   ← GET (scan) + DELETE
│   │   ├── layout.tsx          ← Root HTML wrapper
│   │   └── globals.css         ← All styles
│   └── lib/
│       └── prisma.ts           ← Neon DB client
├── .env.example                ← Copy to .env.local
└── package.json
```

---

## Costs

| Service | Free tier | Paid |
|---------|-----------|------|
| Vercel  | 100GB bandwidth/mo, unlimited deploys | $20/mo Pro |
| Neon    | 3GB storage, 10 branches | $19/mo Pro |
| Domain  | — | ~$10/yr |

For thousands of users, the free tiers handle it easily.
