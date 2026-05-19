# MindMate Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd mindmate
npm install
```

### Step 2: Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project (choose your region)
3. Copy your URL and Anon Key

### Step 3: Configure Environment
Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Create Database Tables

1. Open Supabase SQL Editor
2. Copy-paste the SQL from [README.md](./README.md#create-database-tables)
3. Execute the script

### Step 5: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📱 Features Overview

### For Students:

| Feature | Description | Location |
|---------|-------------|----------|
| **Assessment** | 21-question mental health screening | `/assessment` |
| **Results** | Personalized stress level & recommendations | `/assessment-result` |
| **Mood Tracker** | Daily mood logging with charts | `/mood-tracker` |
| **AI Chat** | 24/7 support chatbot with crisis detection | `/chat` |
| **Coping Strategies** | Evidence-based stress management techniques | `/coping-strategies` |

### For Admins:

| Feature | Description | Location |
|---------|-------------|----------|
| **Dashboard** | Overview & statistics | `/admin` |
| **Assessments** | Student results (respecting consent) | `/admin/assessments` |
| **Risk Monitoring** | Crisis detection & emergency resources | `/admin/risk-monitoring` |

---

## 🔑 Test Accounts

Use these to test both portals immediately:

**Student:**
- Email: `student@demo.com`
- Password: `password123`

**Admin:**
- Email: `admin@demo.com`
- Password: `password123`

---

## 📊 Demo Workflow

### As a Student:
1. Login with student account
2. Complete the 21-question assessment
3. View your stress level & recommendations
4. Log your mood daily
5. Chat with MindMate for support
6. Explore coping strategies

### As an Admin:
1. Login with admin account
2. View dashboard statistics
3. Search & filter student assessments
4. Monitor high-risk cases
5. View crisis alerts & protocols

---

## 🛠️ Customization

### Change Branding Colors
Edit `tailwind.config.js`:
```javascript
extend: {
  colors: {
    teal: { // Change these values
      600: '#14b8a6',
      700: '#0d9488',
    }
  }
}
```

### Modify Assessment Questions
Edit `src/utils/assessmentUtils.js`:
```javascript
export const ASSESSMENT_QUESTIONS = [
  "Your custom question here",
  // ... more questions
]
```

### Update Crisis Keywords
Edit `src/utils/chatbotUtils.js`:
```javascript
const CRISIS_KEYWORDS = [
  'your keywords here',
  // ... more keywords
]
```

---

## 📚 Project Structure Quick Reference

```
src/
├── pages/          # All pages/screens
├── components/     # Reusable components
├── contexts/       # Auth context
├── utils/          # Helper functions
└── App.jsx         # Main routing
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Login page loads
- [ ] Can register new account
- [ ] Can complete assessment
- [ ] Results page shows stress level
- [ ] Can log mood
- [ ] Chat interface works
- [ ] Can view coping strategies
- [ ] Admin dashboard loads
- [ ] Can filter assessments
- [ ] Risk monitoring shows (if any flagged)

---

## 🐛 Troubleshooting

**"Cannot find module" error**
```bash
npm install
npm run dev
```

**Supabase connection fails**
- Check .env file exists
- Verify URL and key are correct
- Ensure Supabase project is active

**Database tables not found**
- Log into Supabase
- Run SQL setup script again
- Check for error messages

---

## 📖 Documentation

- [Complete README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)

---

## 🎯 Next Steps

After getting familiar with the app:

1. **Customize** the assessment questions
2. **Add** your school logo
3. **Configure** email notifications
4. **Set up** monitoring alerts
5. **Deploy** to production
6. **Train** counselors on admin portal

---

## 💡 Tips for School Implementation

1. **Get Admin Approval**: Present the system to school administration
2. **Train Staff**: Conduct training sessions for counselors & teachers
3. **Student Launch**: Start with pilot group before full rollout
4. **Data Privacy**: Ensure FERPA/GDPR compliance
5. **Crisis Protocol**: Integrate with existing crisis response procedures
6. **Support**: Set up help desk for users

---

## 🤝 Support

**Issues or Questions?**
- Check [README.md](./README.md) FAQ section
- Review code comments
- Check Supabase status page
- Contact development team

---

**Happy coding! Remember: Mental health matters.** 💚

Last Updated: 2024
Version: 1.0.0
