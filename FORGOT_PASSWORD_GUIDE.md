# 🔑 Forgot Password - Complete Guide

## ✅ Tapos Na ang Implementation!

Kumpleto na ang forgot password feature mo! Here's how it works:

---

## 🎯 How It Works:

### Complete Flow:
```
1. User clicks "Forgot password?" sa login page
   ↓
2. Redirected to /forgot page
   ↓
3. Enter email address
   ↓
4. Click "Send reset instructions"
   ↓
5. Supabase sends email with reset link
   ↓
6. User checks email inbox
   ↓
7. Click "Reset Password" link in email
   ↓
8. Redirected to /reset-password page
   ↓
9. Enter new password (with show/hide feature!)
   ↓
10. Click "Update Password"
   ↓
11. Success! Redirected to login
   ↓
12. Login with NEW password ✅
```

---

## 🧪 Paano I-test? (Step-by-Step)

### Test 1: Complete Forgot Password Flow

#### Step 1: Go to Login Page
```
http://localhost:5173/login
```

#### Step 2: Click "Forgot password?" link
```
Bottom of login form:
[Forgot password?] ← Click dito!
```

#### Step 3: Enter Email (Existing Account)
```
Gamitin mo yung email na existing na sa Supabase:
✅ Email na naka-register na
✅ Email na verified na

Example:
- counselor@test.com
- student@test.com
- Or any email mo na naka-register
```

#### Step 4: Click "Send reset instructions"
```
[Send reset instructions] button
```

#### Step 5: Wait for Success Message
```
Success message lalabas:
"If an account exists for this email, 
a password reset instruction has been sent. 
Please check your inbox."
```

#### Step 6: Check Email
```
1. Open Gmail/email inbox
2. Look for email from Supabase
3. Subject: "Reset Your Password" or similar
4. Check spam folder if not in inbox!
```

#### Step 7: Click Reset Link
```
Email contains:
[Reset Password] button ← Click dito!

Or a link like:
https://jkluwmbmooaqjmoxppgd.supabase.co/auth/v1/verify?...
```

#### Step 8: Enter New Password
```
Redirected to: /reset-password

Form:
- New Password: [••••••••] [👁️]
- Confirm Password: [••••••••] [👁️]

With password strength indicator!
```

#### Step 9: Click "Update Password"
```
[Update Password] button
```

#### Step 10: Success!
```
Success page shows:
✅ Password Updated!
"Redirecting to login in 3 seconds..."
```

#### Step 11: Login with New Password
```
Auto-redirected to /login
Login using your NEW password
Success! ✅
```

---

## 📧 Pwede Ba Ibang Email Gamitin?

### ✅ YES! Pero may conditions:

#### Condition 1: Email MUST BE registered na
```
✅ Existing account sa Supabase
❌ Email na hindi pa naka-register
```

#### Condition 2: Email MUST BE verified (if verification enabled)
```
✅ Email na na-verify na
⚠️ Unverified email (depende sa settings)
```

#### Condition 3: Not blocked by rate limit
```
✅ Less than 3-5 reset requests per hour
❌ Exceeded rate limit (wait 1 hour)
```

---

## 🎯 Test Cases:

### Test Case 1: Existing Account
```
Email: counselor@test.com (naka-register na)
Expected: ✅ Email sent
Result: Can reset password
```

### Test Case 2: Non-Existent Email
```
Email: notregistered@test.com (wala sa Supabase)
Expected: ⚠️ Same message (for security)
Result: No email sent (pero hindi sinasabi sa user)
```

### Test Case 3: Multiple Accounts
```
You can test with ANY registered email:
- student@test.com
- counselor@test.com
- admin@test.com
- judskic195@gmail.com (if registered)
```

---

## 🔧 Supabase Configuration Needed

### Step 1: Enable Password Reset Emails
Go to Supabase Dashboard:
```
Authentication → Email Templates → Password Reset
```

Should be enabled by default!

### Step 2: Set Redirect URL
```
Authentication → Settings (or URL Configuration)

Add redirect URL:
http://localhost:5173/reset-password

For production:
https://yourdomain.com/reset-password
```

---

## 📱 Pages Added:

### 1. ForgotPasswordPage ✅ (Already Exists)
```
Route: /forgot
Purpose: User enters email
Features:
- Email input
- Send button
- Success/error messages
- Link back to login
```

### 2. ResetPasswordPage ✅ (NEW!)
```
Route: /reset-password
Purpose: User enters new password
Features:
- New password input with show/hide
- Confirm password input with show/hide
- Password strength indicator
- Validation
- Success message
- Auto-redirect to login
```

---

## 🎨 What the Pages Look Like:

### Forgot Password Page (`/forgot`):
```
┌────────────────────────────────────┐
│  Forgot Password                   │
│                                    │
│  Enter your email and we'll send   │
│  you next steps.                   │
│                                    │
│  Email                             │
│  [you@example.com          ]       │
│                                    │
│  [Send reset instructions]         │
│                                    │
│  Remembered your password?         │
│  Sign in                           │
└────────────────────────────────────┘
```

### Reset Password Page (`/reset-password`):
```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  Reset Password                    │
│  Enter your new password below     │
│                                    │
│  New Password                      │
│  [••••••••              [👁️] ]    │
│  [Strength: Strong ✅]             │
│                                    │
│  Confirm New Password              │
│  [••••••••              [👁️] ]    │
│                                    │
│  [Update Password]                 │
│                                    │
│  Remembered your password?         │
│  Back to Login                     │
└────────────────────────────────────┘
```

---

## 🔍 How to Check if Email Exists in Supabase:

### Method 1: Supabase Dashboard
```
1. Go to Supabase Dashboard
2. Authentication → Users
3. Search for email
4. If found = Registered ✅
5. If not found = Not registered ❌
```

### Method 2: Try Login
```
1. Go to /login
2. Enter email + any password
3. If "Invalid credentials" = Registered ✅
4. If "No account found" = Not registered ❌
```

---

## ⚠️ Rate Limit Issues

### If You See "Rate Limit Exceeded":

#### Cause:
Too many password reset emails sent in short time

#### Solution:
```
1. Wait 60 minutes
2. Use different email address
3. Check Supabase logs
4. Manually reset password in dashboard
```

#### Prevention:
```
- Don't test multiple times in a row
- Wait 5-10 minutes between tests
- Use different test emails
```

---

## 🐛 Troubleshooting:

### Issue 1: Email Not Arriving

**Causes:**
- Rate limit exceeded
- Email in spam folder
- Wrong email address
- Supabase email not configured

**Solutions:**
1. Check spam folder
2. Wait a few minutes
3. Verify email is registered
4. Check Supabase logs

### Issue 2: Reset Link Not Working

**Causes:**
- Link expired (usually 1 hour)
- Wrong redirect URL
- Link already used

**Solutions:**
1. Request new reset email
2. Check redirect URL in Supabase settings
3. Don't click old links

### Issue 3: Can't Update Password

**Causes:**
- Password too weak
- Passwords don't match
- Session expired

**Solutions:**
1. Use strong password (8+ chars, uppercase, lowercase, numbers)
2. Make sure passwords match exactly
3. Request new reset link

---

## ✅ Features of Reset Password Page:

### 1. Password Strength Indicator
```
Real-time feedback:
🔴 Weak
🟡 Medium
🟢 Strong

Shows requirements:
✓ At least 8 characters
✓ Uppercase letter
✓ Lowercase letter
✓ Number
✓ Special character
```

### 2. Show/Hide Password
```
Click eye icon (👁️):
- Hidden: ••••••••
- Visible: MyPassword123!
```

### 3. Validation
```
Checks:
✓ Password length (min 8)
✓ Contains uppercase
✓ Contains lowercase
✓ Contains numbers
✓ Passwords match
```

### 4. Success Feedback
```
After successful update:
✅ Success message
🔄 Auto-redirect to login (3 seconds)
```

---

## 📋 Test Checklist:

### Pre-Test Setup:
- [ ] App is running (`npm run dev`)
- [ ] Have access to test email inbox
- [ ] Email is registered in Supabase
- [ ] Not blocked by rate limit

### Testing Steps:
- [ ] Can access /forgot page
- [ ] Can enter email
- [ ] Can submit form
- [ ] Success message appears
- [ ] Email arrives (check spam!)
- [ ] Can click reset link
- [ ] Redirected to /reset-password
- [ ] Can enter new password
- [ ] Password strength shows
- [ ] Can toggle show/hide password
- [ ] Can submit new password
- [ ] Success message appears
- [ ] Redirected to login
- [ ] Can login with NEW password ✅

---

## 🎯 Example Test Scenario:

### Scenario: Test with Existing Account

```bash
# 1. Start app
npm run dev

# 2. Go to login
http://localhost:5173/login

# 3. Click "Forgot password?"
# 4. Enter: counselor@test.com (existing account)
# 5. Click "Send reset instructions"
# 6. Wait for success message
# 7. Check email (counselor@test.com inbox)
# 8. Open email from Supabase
# 9. Click "Reset Password" link
# 10. Enter new password: Counselor123!
# 11. Confirm password: Counselor123!
# 12. Click "Update Password"
# 13. See success message
# 14. Auto-redirect to /login
# 15. Login with: counselor@test.com / Counselor123!
# 16. Success! ✅
```

---

## 💡 Pro Tips:

### Tip 1: Use Test Emails
```
Create dedicated test accounts:
- test1@yourdomain.com
- test2@yourdomain.com
- test3@yourdomain.com
```

### Tip 2: Check Spam
```
90% of password reset emails go to spam
Always check spam folder first!
```

### Tip 3: Don't Spam
```
Limit: 3-5 emails per hour per email
Don't test 10 times in a row
```

### Tip 4: Save Test Passwords
```
Keep track of:
- Original password
- New test password
- Which account you're testing
```

---

## 🎊 Summary:

### What You Have Now:

✅ **Forgot Password Page** (`/forgot`)
- User enters email
- Sends reset link

✅ **Reset Password Page** (`/reset-password`)
- User enters new password
- Password strength indicator
- Show/hide password
- Validation
- Success message

✅ **Email Integration**
- Supabase sends reset emails
- Secure reset links
- 1-hour expiry

✅ **Security Features**
- Rate limiting
- Link expiry
- Password validation
- Token verification

---

## 🚀 Ready to Test!

```bash
# Start your app
npm run dev

# Test flow:
1. /login → Click "Forgot password?"
2. /forgot → Enter email
3. Check email inbox
4. Click reset link
5. /reset-password → Enter new password
6. /login → Login with new password
7. Success! ✅
```

---

**Gamitin mo lang yung email na EXISTING NA sa Supabase!** 📧

**Good luck testing!** 🍀

---

**Last Updated:** 2026-07-28  
**Status:** ✅ Complete & Ready to Test  
**Pages:** 2 (Forgot + Reset)
