# MindMate Deployment Guide

## Development Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git (for version control)
- Supabase account

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd mindmate
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

**Advantages:**
- Zero-config deployment
- Automatic builds on git push
- Built-in SSL certificates
- Global CDN

**Steps:**

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Select the repository

3. **Configure environment variables**
- In Vercel dashboard, go to Settings → Environment Variables
- Add:
  - `VITE_SUPABASE_URL`: Your Supabase URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
- Vercel will automatically build and deploy
- Your site will be live at `mindmate.vercel.app`

### Option 2: Deploy to Netlify

**Steps:**

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy
```

4. **Configure environment variables**
- In Netlify dashboard, go to Site settings → Build & deploy → Environment
- Add your Supabase credentials

### Option 3: Deploy to GitHub Pages

**Note:** This is suitable for static sites only. Consider Vercel or Netlify for better backend integration.

1. **Update vite.config.js**
```javascript
export default defineConfig({
  base: '/mindmate/',
  // ... rest of config
})
```

2. **Build**
```bash
npm run build
```

3. **Deploy to GitHub Pages**
```bash
npm install gh-pages --save-dev
# Add to package.json scripts:
# "deploy": "gh-pages -d dist"
npm run deploy
```

## Supabase Production Setup

### 1. Create Production Supabase Project

- Go to [supabase.com](https://supabase.com)
- Create a new project in your region
- Choose a secure password
- Wait for project initialization

### 2. Configure Database

Run the SQL setup script in the SQL editor:
- Copy the SQL from README.md or SUPABASE_SETUP.sql
- Paste into Supabase SQL editor
- Execute the script

### 3. Enable Security Features

**Row Level Security (RLS)**
- Go to Authentication → Policies
- Enable RLS for all tables
- The policies from the setup script will be applied

**API Authentication**
- Go to Settings → API
- Copy your Project URL and Anon Key
- Add to your deployment platform's environment variables

### 4. Set Up Email Templates (Optional)

- Go to Authentication → Email Templates
- Customize password recovery and confirmation emails
- Add your school logo and branding

## Database Optimization

### Backups

**Automatic Backups (Supabase Pro)**
- Supabase automatically backs up your database
- Manual backups available in Settings → Backups

**Manual Backup**
```bash
pg_dump postgresql://user:password@db.supabase.co/postgres > backup.sql
```

### Monitoring

**Database Health**
- Monitor usage in Settings → Database
- Set up email alerts for quota limits
- Monitor query performance

## CI/CD Pipeline Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        run: npm install -g vercel && vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Performance Optimization

### Code Splitting
The Vite build automatically handles code splitting. Monitor bundle size:
```bash
npm run build
# Check dist folder size
```

### Image Optimization
- Use SVG icons when possible
- Compress images before uploading
- Use WebP format for modern browsers

### Database Queries
- Use indexes (included in setup)
- Avoid N+1 queries
- Implement pagination for large datasets

## Monitoring & Maintenance

### Error Tracking

Set up Sentry (Optional):
```bash
npm install @sentry/react @sentry/tracing
```

### Analytics

Set up Google Analytics:
```bash
npm install react-ga4
```

### Uptime Monitoring

- Use services like UptimeRobot
- Set up alerts for downtime
- Monitor Supabase status

## Troubleshooting

### Build Issues

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Environment variables not loading:**
- Verify `.env` file exists
- Check variable names match config
- Restart dev server

### Deployment Errors

**Supabase connection fails:**
- Verify URL and key in environment variables
- Check Supabase project status
- Ensure RLS policies allow operations

**Database quota exceeded:**
- Check Storage usage
- Clean up old data
- Upgrade to Supabase Pro

## Security Checklist

- [ ] Supabase project password is strong and stored securely
- [ ] Environment variables are not committed to git
- [ ] Row Level Security (RLS) is enabled on all tables
- [ ] API keys are rotated regularly
- [ ] Email verification is enabled for new accounts
- [ ] Rate limiting is configured on Supabase
- [ ] Database backups are tested and working
- [ ] SSL certificate is valid and auto-renewing
- [ ] Monitoring and alerts are configured
- [ ] Data retention policies are in place

## Updating the Application

### Rolling Updates

1. **Create a new branch**
```bash
git checkout -b feature/new-feature
```

2. **Make changes and test locally**
```bash
npm run dev
```

3. **Push and create pull request**
```bash
git push origin feature/new-feature
```

4. **Merge after review**
- GitHub will trigger deployment
- Vercel will build and deploy automatically

### Database Migrations

For schema changes:
1. Test changes locally
2. Create backup of production database
3. Run migration script on production
4. Deploy updated application code

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Last Updated**: 2024  
**Version**: 1.0.0
