# HeyProData - Onboarding Flow Guide

## 🎯 Complete User Journey

### Step 1: Authentication
**Login** (`/login`) or **Sign In** (`/signin`)
- Enter credentials
- Optional: Google/Apple OAuth
- Click Login/Sign in button

↓

### Step 2: OTP Verification
**OTP Page** (`/otp`)
- Receive OTP via email
- Enter 5-digit code
- Auto-focus between inputs
- Security warning displayed
- **Progress: None (OTP verification only)**

↓

### Step 3: Name Collection
**Name Page** (`/onboarding/name`)
- First name (Legal ID)
- Surname (Legal ID)
- **Progress: 25% (187.5px / 750px)**
- Gradient: Pink → Blue → Teal → Green

↓

### Step 4: Location Details
**Location Page** (`/onboarding/location`)
- Country dropdown (7 options)
- State dropdown (6 options)
- City text input
- Back button available
- **Progress: 50% (375px / 750px)**

↓

### Step 5: Username/Alias (Optional)
**Username Page** (`/onboarding/username`)
- Alias First name
- Alias Last name
- Skip option available
- **Progress: 75% (562.5px / 750px)**

↓

### Step 6: Profile Photo (Optional)
**Profile Photo Page** (`/onboarding/profile-photo`)
- Upload image via drag & drop or click
- Preview before submission
- Skip option available
- **Progress: 100% (750px / 750px - Full bar)**

↓

### Step 7: Complete
**Dashboard** (`/dashboard`)
- Display all collected information
- Show profile photo or generated avatar
- Welcome message
- Logout functionality

---

## 📊 Progress Bar Specifications

### Visual Design
```
Background: White (#FFFFFF)
Width: 750px
Height: 20px
Border: 2px solid gray
Border-radius: 41px (pill shape)

Progress Fill:
Height: 20px
Border-radius: 10px
Gradient: linear-gradient(90deg, 
  #FA6E80 0%,      /* Pink */
  #6A89BE 43.84%,  /* Blue */
  #85AAB7 65.76%,  /* Teal */
  #31A7AC 109.6%   /* Green */
)
```

### Progress Stages
| Page | Progress | Width | Percentage |
|------|----------|-------|------------|
| OTP | None | - | No bar |
| Name | 25% | 187.5px | 1/4 complete |
| Location | 50% | 375px | 1/2 complete |
| Username | 75% | 562.5px | 3/4 complete |
| Profile Photo | 100% | 750px | Complete |

### Animation
- Smooth transition: `500ms ease-out`
- Width animates based on progress
- Gradient remains consistent across all stages

---

## 🎨 Background Gradient

All onboarding pages use the same conic gradient:
```css
background: conic-gradient(
  from 180deg at 50% 50%,
  #FA6E80 0deg,    /* Pink */
  #6A89BE 144deg,  /* Blue */
  #85AAB7 216deg,  /* Teal */
  #31A7AC 360deg   /* Green */
);
```

---

## 💾 Data Collection

### localStorage Keys:
1. `mockUser` - Authentication data
2. `onboardingData` - JSON object containing:
   ```json
   {
     "firstName": "John",
     "surname": "Doe",
     "country": "United States",
     "state": "California",
     "city": "San Francisco",
     "aliasFirstName": "Johnny",
     "aliasLastName": "D",
     "profilePhoto": "data:image/png;base64..."
   }
   ```
3. `profilePhoto` - Base64 encoded image

---

## ✨ Features

### OTP Page
- ✅ Auto-focus next input on digit entry
- ✅ Backspace navigation to previous input
- ✅ Number-only validation
- ✅ Security warning message
- ✅ Email display

### Form Validation
- ✅ Empty field detection
- ✅ Real-time error clearing
- ✅ "Please fill this field" messages
- ✅ Dropdown validation for selects

### Navigation
- ✅ Back button on Location page
- ✅ Skip option on Username & Profile Photo pages
- ✅ Forward-only flow (prevents skipping required steps)
- ✅ Smooth page transitions

### Progress Bar
- ✅ Dynamic width calculation
- ✅ Smooth animation transitions
- ✅ Pixel-perfect dimensions
- ✅ Gradient color accuracy
- ✅ Responsive positioning

---

## 🔄 State Management

Current implementation uses:
- `localStorage` for persistence
- `useNavigate` with state for passing data between pages
- React hooks for local form state

**For Backend Integration:**
Replace localStorage with API calls at each step to save progress in database.

---

## 🚀 Next Steps for Production

1. **Replace mock OTP** with real email service (SendGrid, AWS SES)
2. **Add session management** with JWT tokens
3. **Implement progress saving** in backend database
4. **Add resume capability** (if user closes browser mid-onboarding)
5. **Phone number OTP** alternative option
6. **Country/State data** from API instead of hardcoded
7. **Image upload to cloud storage** (S3, Cloudinary)
8. **Add analytics tracking** for drop-off points

---

**Built with pixel-perfect precision** ✨
