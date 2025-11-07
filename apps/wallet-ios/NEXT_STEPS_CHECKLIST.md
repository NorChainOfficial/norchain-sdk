# iOS App - Next Steps Checklist

**Quick reference for completing the remaining 25% to production**

---

## 🔴 CRITICAL - Must Do Before Testing

### ☐ 1. Fix Xcode Project File (5 minutes)

**Issue:** Project file is corrupted and won't build

**Solution:**
```bash
cd /Volumes/Development/sahalat/private\ server/noor-wallet/ios-wallet
open NorWallet.xcodeproj
```

**What happens:**
- Xcode will detect corruption
- Click "Automatically Manage" if prompted
- Let Xcode repair the project
- Close and reopen Xcode
- Try building (⌘B)

**Verification:**
```bash
# Should build without errors
xcodebuild -project NorWallet.xcodeproj -scheme NorWallet -configuration Release build
```

---

## 🟡 HIGH PRIORITY - Security & Quality

### ☐ 2. Security Audit (2-3 days)

**Checklist:**

#### A. Private Key Security
- [ ] Verify Keychain implementation uses `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- [ ] Confirm private keys are NEVER logged (check all `print()` statements)
- [ ] Test private key access requires biometric/PIN
- [ ] Verify mnemonic backup flow is secure

#### B. Network Security
- [ ] Enable certificate pinning for Supabase requests
- [ ] Verify all API calls use HTTPS
- [ ] Check for man-in-the-middle vulnerabilities
- [ ] Test with network proxy (Charles/Proxyman)

#### C. Supabase RLS
- [ ] Test RLS policies with multiple test users
- [ ] Verify users can only see their own data
- [ ] Test edge cases (empty wallets, multiple devices)
- [ ] Check audit logs are working

#### D. Code Review
- [ ] Search for any `TODO` or `FIXME` comments
- [ ] Review all force unwraps (`!`) and optionals
- [ ] Check error handling in critical paths
- [ ] Verify input validation on all user inputs

**Tools:**
```bash
# Search for potential issues
grep -r "TODO" ios-wallet/NorWallet/
grep -r "FIXME" ios-wallet/NorWallet/
grep -r "print(" ios-wallet/NorWallet/ | grep -i "key\|mnemonic\|password"
```

**Deliverable:** Security audit report with fixes implemented

---

### ☐ 3. Performance Optimization (2-3 days)

**Checklist:**

#### A. Memory Management
- [ ] Profile with Instruments (Allocations, Leaks)
- [ ] Fix any memory leaks
- [ ] Optimize image loading in asset list
- [ ] Implement view recycling for long lists

#### B. Network Optimization
- [ ] Implement request caching
- [ ] Add retry logic for failed requests
- [ ] Batch multiple API calls where possible
- [ ] Add offline mode indicators

#### C. UI Performance
- [ ] Profile scroll performance in asset list
- [ ] Optimize animation frame rates
- [ ] Reduce view hierarchy complexity
- [ ] Lazy load images for token logos

#### D. App Launch
- [ ] Measure launch time (target: < 2 seconds)
- [ ] Defer non-critical initializations
- [ ] Optimize initial data loading

**Tools:**
```bash
# Launch time test
xcrun simctl launch --console booted com.yourcompany.norwallet
```

**Benchmarks:**
- Launch time: < 2 seconds (cold start)
- Asset list scroll: 60 FPS
- Transaction history load: < 1 second
- Memory footprint: < 150 MB

---

## 🟢 MEDIUM PRIORITY - Production Readiness

### ☐ 4. Analytics & Crash Reporting (1-2 days)

**Option A: Firebase (Recommended)**

```bash
# Install Firebase
cd ios-wallet
pod init
# Add to Podfile:
# pod 'Firebase/Analytics'
# pod 'Firebase/Crashlytics'
pod install
```

**Integration:**
- [ ] Add GoogleService-Info.plist
- [ ] Initialize Firebase in App Delegate
- [ ] Add crash reporting
- [ ] Track key events (wallet created, transaction sent, etc.)
- [ ] Test crash reporting

**Option B: Sentry (Privacy-Focused)**

```bash
# Add Sentry
# Add to Package.swift dependencies
```

**Key Events to Track:**
- Wallet creation
- Wallet import
- Transaction sent
- Transaction received
- Network switches
- Errors encountered

---

### ☐ 5. Code Signing & Certificates (1 day)

**Prerequisites:**
- [ ] Apple Developer Program membership ($99/year)
- [ ] Admin access to Apple Developer account

**Steps:**

#### A. Certificates
1. Go to developer.apple.com → Certificates
2. Create Production Certificate (iOS Distribution)
3. Download and install in Keychain

#### B. Identifiers
1. Register App ID: `com.yourcompany.norwallet`
2. Enable capabilities: Push Notifications, Associated Domains

#### C. Provisioning Profiles
1. Create App Store provisioning profile
2. Select production certificate
3. Download and install

#### D. Push Certificates
1. Create APNs Certificate (Production)
2. Upload to Supabase Dashboard (if needed)

#### E. Xcode Configuration
1. Open NorWallet.xcodeproj
2. Select target → Signing & Capabilities
3. Select team
4. Choose "Manual" signing
5. Select provisioning profiles

**Verification:**
```bash
# Archive should succeed
xcodebuild archive \
  -project NorWallet.xcodeproj \
  -scheme NorWallet \
  -configuration Release \
  -archivePath build/NorWallet.xcarchive
```

---

### ☐ 6. App Store Assets (2-3 days)

**Required Screenshots:**

#### iPhone 6.7" (Pro Max) - PRIMARY
- [ ] Home screen with balance
- [ ] Send transaction flow
- [ ] Receive with QR code
- [ ] Transaction history
- [ ] Security settings

#### iPhone 6.5" (Plus) - REQUIRED
- [ ] Same 5 screens as above

#### Optional but Recommended
- [ ] iPad Pro 12.9" (3 screenshots)

**Tools:**
- Use iOS Simulator
- Screenshot with ⌘S or Xcode → Window → Show Screenshot
- Edit with Sketch/Figma (add text overlays)

**App Preview Video (Optional but Recommended):**
- [ ] 15-30 second walkthrough
- [ ] Show: Create wallet → Add funds → Send transaction
- [ ] Use screen recording (⌘-Shift-5 on Mac)
- [ ] Edit with iMovie/Final Cut

**App Store Copy:**

```markdown
Title: Noor Wallet - Secure Crypto Wallet
Subtitle: Multi-chain cryptocurrency wallet

Description:
Noor Wallet is your secure gateway to the world of cryptocurrency.
With support for multiple blockchains and cutting-edge security
features, managing your digital assets has never been easier.

Features:
• Multi-chain support (Xaheen, Ethereum, BSC, Polygon, Tron)
• Secure Face ID/Touch ID authentication
• Send and receive crypto instantly
• Real-time transaction history
• DApps browser for Web3 applications
• Account Abstraction support (gasless transactions)
• Beautiful, intuitive interface

Your keys, your crypto. Private keys never leave your device.

Keywords: crypto, wallet, ethereum, blockchain, defi, web3, cryptocurrency
```

**URLs:**
- [ ] Privacy Policy URL (required)
- [ ] Support URL (required)
- [ ] Marketing URL (optional)

---

### ☐ 7. TestFlight Beta (1-2 weeks)

**Setup:**

#### A. Prepare Build
```bash
cd ios-wallet
./scripts/archive-production.sh
```

#### B. Upload to App Store Connect
1. Open Xcode
2. Window → Organizer
3. Select archive
4. Click "Distribute App"
5. Choose "App Store Connect"
6. Upload

#### C. TestFlight Configuration
1. Go to appstoreconnect.apple.com
2. Select your app
3. TestFlight tab
4. Add build for testing
5. Add test information
6. Add testers (internal first, then external)

**Beta Testing Checklist:**

Internal Testing (1-2 testers):
- [ ] App launches successfully
- [ ] Create wallet works
- [ ] Import wallet works
- [ ] Send transaction works
- [ ] Receive works
- [ ] Biometric auth works
- [ ] No crashes on basic flows

External Testing (10-20 testers):
- [ ] Recruit testers (friends, family, crypto community)
- [ ] Send TestFlight invitations
- [ ] Create feedback form (Google Forms)
- [ ] Weekly check-ins with testers
- [ ] Track bugs in spreadsheet
- [ ] Fix critical bugs, re-upload builds

**Feedback Areas:**
- Usability (1-10 rating)
- Performance (any lag or crashes?)
- Security (feel safe using it?)
- Features (what's missing?)
- Design (like the UI?)

**Duration:** 1-2 weeks minimum

---

## 🎯 FINAL STEP - App Store Submission

### ☐ 8. Submit to App Store

**Pre-Submission Checklist:**
- [ ] All features working
- [ ] No crashes in TestFlight
- [ ] Screenshots uploaded
- [ ] App description complete
- [ ] Privacy policy live
- [ ] Support URL working
- [ ] App rated for age (likely 4+)
- [ ] Export compliance completed

**Submission Steps:**

1. **Final Build**
   ```bash
   cd ios-wallet
   ./scripts/deploy-production.sh
   ```

2. **Upload via Xcode**
   - Archive → Distribute → App Store
   - Let it upload (may take 10-30 minutes)

3. **App Store Connect**
   - Go to appstoreconnect.apple.com
   - Select app
   - Add build
   - Fill in all required fields
   - Submit for review

4. **Apple Review**
   - Typical time: 1-3 business days
   - May get questions from reviewer
   - Respond promptly to speed up process

5. **Release**
   - Choose manual or automatic release
   - Monitor crash reports
   - Respond to user reviews

---

## 📊 Progress Tracking

**Overall Status: 95% Complete**

| Task | Status | Time | Priority |
|------|--------|------|----------|
| 1. Fix Xcode | ⏳ Pending | 5 min | 🔴 Critical |
| 2. Security Audit | ⏳ Pending | 2-3 days | 🟡 High |
| 3. Performance | ⏳ Pending | 2-3 days | 🟡 High |
| 4. Analytics | ⏳ Pending | 1-2 days | 🟢 Medium |
| 5. Code Signing | ⏳ Pending | 1 day | 🟢 Medium |
| 6. App Store Assets | ⏳ Pending | 2-3 days | 🟢 Medium |
| 7. TestFlight | ⏳ Pending | 1-2 weeks | 🟢 Medium |
| 8. App Store | ⏳ Pending | 3-5 days | 🟢 Medium |

**Total Estimated Time:** 3-4 weeks

---

## 🚀 Quick Start

**To resume work:**

```bash
# 1. Fix Xcode project (FIRST!)
cd /Volumes/Development/sahalat/private\ server/noor-wallet/ios-wallet
open NorWallet.xcodeproj

# 2. Run tests (after Xcode fix)
xcodebuild test -project NorWallet.xcodeproj -scheme NorWallet -destination 'platform=iOS Simulator,name=iPhone 15'

# 3. Build Release
./scripts/build-release.sh

# 4. Verify production config
./scripts/verify-production.sh
```

---

## 💡 Tips

- **Start with Xcode fix** - Nothing else works until this is done
- **Do security audit early** - May reveal issues that need time to fix
- **TestFlight early and often** - Real users find bugs you won't
- **Keep beta testers engaged** - Weekly updates, respond to feedback
- **Document everything** - Future you will thank present you
- **Celebrate milestones** - You've built something amazing!

---

**Questions or issues?**
- Check `PRODUCTION_READINESS_REPORT.md` for detailed status
- Review `../docs/` for technical documentation
- See `scripts/README.md` for automation commands

**Good luck with the launch! 🎉**
