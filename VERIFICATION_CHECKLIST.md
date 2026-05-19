# MindMate - Setup Verification Checklist

Use this checklist to verify your setup is complete and working correctly.

## ✅ Pre-Setup Checklist

- [ ] Node.js 16+ installed
- [ ] npm or yarn available
- [ ] Supabase account created
- [ ] Text editor/IDE ready (VS Code recommended)
- [ ] All files downloaded/cloned

## ✅ Project Installation

- [ ] Navigated to mindmate directory
- [ ] Ran `npm install` successfully
- [ ] No installation errors in console
- [ ] node_modules folder created
- [ ] package-lock.json created

## ✅ Environment Setup

- [ ] Created `.env` file in project root
- [ ] Added `VITE_SUPABASE_URL` (from Supabase dashboard)
- [ ] Added `VITE_SUPABASE_ANON_KEY` (from Supabase dashboard)
- [ ] .env file is in .gitignore
- [ ] Verified credentials are correct

## ✅ Database Setup

- [ ] Created Supabase project
- [ ] Opened Supabase SQL Editor
- [ ] Copied SUPABASE_SETUP.sql content
- [ ] Executed SQL script without errors
- [ ] Verified tables created:
  - [ ] `users` table exists
  - [ ] `assessments` table exists
  - [ ] `mood_tracking` table exists
  - [ ] `chatbot_logs` table exists
- [ ] RLS policies visible in Security > Policies
- [ ] Indexes created (check in SQL Editor)

## ✅ Authentication Setup

- [ ] Enabled Supabase Auth
- [ ] Set up email provider (password-based)
- [ ] Created demo student account:
  - [ ] Email: student@demo.com
  - [ ] Password: password123
  - [ ] Role: student (in users table)
- [ ] Created demo admin account:
  - [ ] Email: admin@demo.com
  - [ ] Password: password123
  - [ ] Role: admin (in users table)
- [ ] Email confirmation enabled (optional)

## ✅ Development Server

- [ ] Ran `npm run dev` in project directory
- [ ] No build errors in console
- [ ] Application opened at http://localhost:3000
- [ ] Development server is running
- [ ] No CORS errors in console

## ✅ Frontend Functionality

### Login & Authentication
- [ ] Login page loads correctly
- [ ] Can login with student account
- [ ] Can login with admin account
- [ ] Incorrect credentials show error
- [ ] Register page works (if testing)
- [ ] Logout functionality works

### Student Portal
- [ ] Dashboard shows welcome message
- [ ] 4 feature cards visible and clickable
- [ ] Quick stats display (may be empty first time)

#### Assessment Page
- [ ] 21 questions load
- [ ] Progress bar appears
- [ ] Can select answers (0-3 scale)
- [ ] Previous/Next buttons work
- [ ] Question number jumping works
- [ ] Consent checkbox appears on last question
- [ ] Submit button is disabled until answer selected

#### Assessment Results
- [ ] Results page shows after submission
- [ ] Stress level displayed with color
- [ ] Score and percentage shown
- [ ] Coping strategies appear
- [ ] Links to other pages work

#### Mood Tracker
- [ ] 5 emoji mood buttons appear
- [ ] Can select mood
- [ ] Notes field accepts text
- [ ] "Log My Mood" button works
- [ ] Success message shows
- [ ] Chart appears after logging moods
- [ ] Chart displays mood history

#### Chat Page
- [ ] Chat interface loads
- [ ] Can type messages
- [ ] Bot responds to messages
- [ ] Chat history persists
- [ ] Crisis detection works (try keywords)
- [ ] Emergency resources display on crisis
- [ ] No console errors

#### Coping Strategies
- [ ] Page loads with content
- [ ] Stress level filters work
- [ ] Technique cards display
- [ ] Cards expand when clicked
- [ ] 4 categories visible
- [ ] All techniques have descriptions

### Admin Portal
- [ ] Dashboard loads
- [ ] Stats cards display
- [ ] Charts render correctly
- [ ] Numbers are accurate

#### Assessments Page
- [ ] Assessment table displays
- [ ] Search functionality works
- [ ] Stress level filter works
- [ ] Results count accurate
- [ ] Table is responsive

#### Risk Monitoring
- [ ] Page loads correctly
- [ ] (Will be empty if no crisis messages)
- [ ] Crisis keywords documented
- [ ] Emergency resources listed
- [ ] Protocol guidelines displayed

## ✅ User Interface

- [ ] All pages have consistent styling
- [ ] Colors match the teal/green theme
- [ ] Buttons are clickable and responsive
- [ ] Forms have proper validation
- [ ] Loading spinners appear when needed
- [ ] Error messages display correctly
- [ ] Mobile view is responsive
- [ ] Sidebar collapses on mobile
- [ ] No layout issues on small screens

## ✅ Data Flow

- [ ] Assessments save to database
- [ ] Mood entries save to database
- [ ] Chat messages save to database
- [ ] User data persists on refresh
- [ ] Logout clears session
- [ ] Re-login loads user data

## ✅ Security Features

- [ ] Only logged-in users can access portal
- [ ] Students cannot access admin pages
- [ ] Admins cannot access student pages
- [ ] Consent checkbox affects data visibility
- [ ] Anonymous data shown without consent
- [ ] Session expires on logout

## ✅ Browser Console

- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] No warnings about dependencies
- [ ] Network requests show successful (200/201/204)
- [ ] Supabase connection confirmed

## ✅ Performance

- [ ] Pages load quickly (under 3 seconds)
- [ ] Charts render smoothly
- [ ] No lag when scrolling
- [ ] Buttons respond immediately
- [ ] Forms submit quickly

## ✅ Documentation Review

- [ ] README.md read and understood
- [ ] QUICK_START.md reviewed
- [ ] DEPLOYMENT.md available
- [ ] SUPABASE_SETUP.sql verified
- [ ] PROJECT_SUMMARY.md reviewed

## ✅ Ready for Development

- [ ] Can modify component styling
- [ ] Can add new assessment questions
- [ ] Can customize colors
- [ ] Can extend functionality
- [ ] Code is well-commented
- [ ] Project structure is clear

## ✅ Ready for Deployment

- [ ] Built successfully: `npm run build`
- [ ] Dist folder created
- [ ] No build errors
- [ ] Ready for Vercel deployment
- [ ] Ready for Netlify deployment
- [ ] Environment variables secured
- [ ] Database backups configured

## 📝 Troubleshooting Notes

If any checks failed, consult these resources:

| Issue | Solution |
|-------|----------|
| Supabase connection fails | Check .env file, verify URL/key |
| Tables not found | Re-run SUPABASE_SETUP.sql script |
| Cannot login | Create accounts in Supabase Auth |
| Chat not working | Check database chatbot_logs table |
| Charts not displaying | Ensure Recharts installed: npm list recharts |
| Styling issues | Clear browser cache, restart dev server |
| CORS errors | Check Supabase CORS settings |
| Empty data | Ensure you've logged moods/completed assessment |

## 🎉 Completion

Once all checkboxes are marked ✅:

1. **You're ready to use the application** - for testing and development
2. **You can customize** - update questions, styling, text
3. **You can deploy** - follow DEPLOYMENT.md for production
4. **You can train users** - counselors and students

## 📞 Next Steps

1. **Test thoroughly** - Try all features
2. **Customize for your school** - Add branding
3. **Train staff** - Prepare counselors
4. **Deploy** - Follow deployment guide
5. **Monitor** - Track usage and feedback
6. **Iterate** - Improve based on feedback

---

**Great job! Your MindMate application is up and running!** 🎉

Remember: Always prioritize student safety and follow your school's crisis protocols.
