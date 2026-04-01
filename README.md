# Logika Financial AI — PWA

Dashboard keuangan AI untuk bisnis menengah Indonesia.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Recharts (visualisasi)
- Groq API — llama-3.3-70b-versatile
- next-pwa (installable PWA)

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local → isi GROQ_API_KEY
npm run dev
```

## Deploy ke Vercel

```bash
npm i -g vercel
vercel
# Set environment variable GROQ_API_KEY di Vercel dashboard
```

## Struktur

```
app/
├── layout.tsx          # Root layout + PWA meta
├── globals.css         # Global styles
├── page.tsx            # Main dashboard (semua komponen)
├── lib/
│   └── data.ts         # Data keuangan + helpers
└── api/
    └── analyze/
        └── route.ts    # Groq proxy (server-side, aman)
public/
├── manifest.json       # PWA manifest
└── icons/              # Icon 192x192 & 512x512 (tambahkan sendiri)
```

## Cara Kerja API Key

- **Production**: Set `GROQ_API_KEY` di `.env.local` atau Vercel env vars → key tidak pernah expose ke client
- **Demo/Dev**: User input key di tab Setting UI → dikirim ke `/api/analyze` sebagai fallback

## Next Steps

- [ ] Form input data manual per bulan
- [ ] Upload & parse CSV
- [ ] Export PDF laporan
- [ ] Auth (NextAuth / Appwrite)
- [ ] Multi-perusahaan / multi-user
