# Web App Deployment Guide

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Quick Deploy

```bash
npm install -g vercel
cd web-wallet
vercel
```

#### Environment Variables

Set in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Manual Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### 2. Netlify

```bash
npm install -g netlify-cli
cd web-wallet
netlify deploy --prod
```

### 3. Self-Hosted

```bash
cd web-wallet
npm run build
npm start
```

Requires:
- Node.js 18+
- PM2 or similar process manager
- Reverse proxy (nginx)

## Production Checklist

- [ ] Set production environment variables
- [ ] Build production bundle
- [ ] Test production build locally
- [ ] Configure CDN (if needed)
- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Test authentication flow
- [ ] Test wallet operations
- [ ] Verify Supabase connection

## Environment Variables

### Development
`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://acyilidfiyfeouzzfkzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Production
Set in deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Troubleshooting

### Build Errors
- Check Node.js version (18+)
- Clear `.next` folder
- Reinstall dependencies

### Runtime Errors
- Verify environment variables
- Check Supabase connection
- Review browser console

### Performance
- Enable Next.js Image Optimization
- Use CDN for static assets
- Optimize bundle size

---

**Status**: Ready for production deployment!

