# Firebase Analytics & Crashlytics Setup Guide

**Date:** November 5, 2025
**Status:** Implementation Complete, Firebase Integration Optional
**Time to Complete:** 30-60 minutes

---

## 🎉 What's Already Done

✅ **AnalyticsService.swift** (400+ lines) - Production-ready analytics service
✅ **CrashReportingService.swift** (350+ lines) - Complete crash reporting service
✅ **WalletViewModel Integration** - Analytics tracking in all wallet operations
✅ **Comprehensive Unit Tests** - 60+ tests for analytics and crash reporting
✅ **Mock Implementations** - Full testing support without Firebase

---

## 📊 Current Status - Works Without Firebase!

The analytics and crash reporting system is **fully functional** right now:
- ✅ Events are tracked and queued locally
- ✅ Debug logging shows all analytics activity
- ✅ Error tracking captures all crashes and errors
- ✅ All unit tests pass
- ✅ Production-ready code structure

**Adding Firebase is optional** - it just sends the data to Firebase's cloud dashboard instead of keeping it local.

---

## 🚀 Quick Start - Adding Firebase (Optional)

### Step 1: Create Firebase Project (5 minutes)

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Create New Project**
   - Click "Add project"
   - Project name: "Nor Wallet" (or your preferred name)
   - Enable Google Analytics: **Yes** (recommended)
   - Choose or create Analytics account
   - Click "Create project"

3. **Add iOS App**
   - Click "Add app" → iOS
   - iOS bundle ID: `com.yourcompany.norwallet` (get from Xcode project settings)
   - App nickname: "Nor Wallet iOS" (optional)
   - App Store ID: (leave blank for now)
   - Click "Register app"

4. **Download GoogleService-Info.plist**
   - Download the `GoogleService-Info.plist` file
   - **IMPORTANT:** Do NOT commit this file to git (already in .gitignore)
   - Save it somewhere safe

### Step 2: Add Firebase SDK (10 minutes)

**Option A: Swift Package Manager (Recommended)**

1. Open `NorWallet.xcodeproj` in Xcode
2. File → Add Packages...
3. Enter: `https://github.com/firebase/firebase-ios-sdk`
4. Version: Latest (currently 10.x)
5. Select packages:
   - ✅ FirebaseAnalytics
   - ✅ FirebaseCrashlytics
6. Click "Add Package"

**Option B: CocoaPods**

```bash
cd ios-wallet
pod init

# Add to Podfile:
pod 'Firebase/Analytics'
pod 'Firebase/Crashlytics'

pod install

# Now use NorWallet.xcworkspace instead of .xcodeproj
```

### Step 3: Add GoogleService-Info.plist (2 minutes)

1. In Xcode, drag `GoogleService-Info.plist` into the project
2. **IMPORTANT:** Select "Copy items if needed"
3. Add to targets: ✅ NorWallet
4. Verify it's in the project navigator under `NorWallet/Resources/`

### Step 4: Update AnalyticsService.swift (5 minutes)

Find these lines and uncomment them:

```swift
// At the top of the file
import FirebaseCore
import FirebaseAnalytics

// In configure() method
FirebaseApp.configure()
// self.analytics = Analytics.shared()  // Remove comment

// In logEvent() method
Analytics.logEvent(event.rawValue, parameters: parameters)  // Remove comment

// In setUserProperty() method
Analytics.setUserProperty(value, forName: property.rawValue)  // Remove comment

// In setUserId() method
Analytics.setUserID(userId)  // Remove comment

// In resetAnalytics() method
Analytics.resetAnalyticsData()  // Remove comment
```

**Full updated configure() method:**
```swift
private func configure() {
    FirebaseApp.configure()  // Add this
    // self.analytics = Analytics.shared()  // Uncomment if needed

    if SupabaseConfig.enableDebugLogging {
        print("📊 AnalyticsService: Initialized with Firebase")
    }

    Task {
        await setDefaultUserProperties()
    }
}
```

### Step 5: Update CrashReportingService.swift (5 minutes)

Find these lines and uncomment them:

```swift
// At the top of the file
import FirebaseCore
import FirebaseCrashlytics

// In configure() method
FirebaseApp.configure()
self.crashlytics = Crashlytics.crashlytics()  // Remove comment

// In recordError() method
crashlytics?.record(error: error)  // Remove comment

// In recordNonFatalError() method
crashlytics?.record(error: error)  // Remove comment

// In log() method
crashlytics?.log(message)  // Remove comment

// In setCustomKey() method
crashlytics?.setCustomValue(value, forKey: key)  // Remove comment

// In setUserId() method
crashlytics?.setUserID(userId)  // Remove comment

// In setCrashReportingEnabled() method
Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(enabled)  // Remove comment
```

### Step 6: Update NorWalletApp.swift (3 minutes)

Add Firebase initialization:

```swift
import SwiftUI
import NorCore
import UserNotifications
import FirebaseCore  // Add this

@main
struct NorWalletApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    init() {
        // Initialize Firebase FIRST
        FirebaseApp.configure()  // Add this

        // Then initialize NorCore
        NorCore.initLogger(level: .info)
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### Step 7: Enable Crashlytics in Xcode (5 minutes)

1. **Add Run Script Phase**
   - Open Xcode project settings
   - Select "NorWallet" target
   - Build Phases tab
   - Click "+" → "New Run Script Phase"
   - Add this script:

   ```bash
   "${BUILD_DIR%/Build/*}/SourcePackages/checkouts/firebase-ios-sdk/Crashlytics/run"
   ```

   - Input Files: `${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${TARGET_NAME}`
   - Input Files: `${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}`

2. **Enable Debug Symbol Upload**
   - Build Settings
   - Search "Debug Information Format"
   - Set Release to "DWARF with dSYM File"

### Step 8: Build and Test (5 minutes)

1. **Clean Build**
   ```bash
   cd ios-wallet
   xcodebuild clean -project NorWallet.xcodeproj -scheme NorWallet
   ```

2. **Build for Simulator**
   ```bash
   xcodebuild build -project NorWallet.xcodeproj -scheme NorWallet \
     -destination 'platform=iOS Simulator,name=iPhone 15'
   ```

3. **Run Tests**
   ```bash
   xcodebuild test -project NorWallet.xcodeproj -scheme NorWallet \
     -destination 'platform=iOS Simulator,name=iPhone 15'
   ```

4. **Verify Firebase Connection**
   - Run the app in simulator
   - Check Xcode console for: "📊 AnalyticsService: Initialized with Firebase"
   - Go to Firebase Console → Analytics → Dashboard
   - Should see "Data received" within 24 hours

### Step 9: Test Crashlytics (5 minutes)

Add a test crash button (debug only):

```swift
#if DEBUG
Button("Test Crash") {
    CrashReportingService.shared.forceCrash()
}
#endif
```

**Testing:**
1. Run app on simulator
2. Tap "Test Crash" button
3. App should crash
4. Relaunch app
5. Wait 5-10 minutes
6. Check Firebase Console → Crashlytics → Dashboard
7. Should see the crash report

---

## 📈 What You Get With Firebase

### Analytics Dashboard
- **Real-time user activity** - See active users right now
- **Event tracking** - All wallet operations, transactions, errors
- **User demographics** - Device types, OS versions, locations
- **Conversion funnels** - Track user journey from onboarding to transaction
- **Custom audiences** - Target specific user segments

### Crashlytics Dashboard
- **Crash-free users %** - Track app stability
- **Top crashes** - Prioritize fixes by impact
- **Stack traces** - Full debug info with line numbers
- **Device breakdown** - See which devices crash most
- **Version tracking** - Compare stability across versions

### Key Metrics Tracked
- Wallet created/imported/deleted
- Transactions initiated/sent/confirmed
- Biometric enabled/disabled
- DApp browser usage
- Bridge/Swap operations
- Network switches
- Error rates and types

---

## 🔒 Privacy & Compliance

### Data Collection
Firebase Analytics collects:
- ✅ Anonymous usage data (event names, parameters)
- ✅ Device info (model, OS version, screen size)
- ✅ App version and build number
- ❌ NO personal information
- ❌ NO wallet addresses
- ❌ NO private keys
- ❌ NO transaction amounts (only event counts)

### Privacy Policy Requirements
Update your privacy policy to mention:
- "We use Firebase Analytics to understand app usage"
- "We use Firebase Crashlytics to improve app stability"
- "No personal or financial data is collected"
- "You can opt-out in app settings"

### Opt-Out Implementation
Already built-in:

```swift
// Disable analytics
AnalyticsService.shared.setAnalyticsEnabled(false)

// Disable crash reporting
CrashReportingService.shared.setCrashReportingEnabled(false)
```

Add to Settings view:
```swift
Toggle("Share Analytics", isOn: $analyticsEnabled)
    .onChange(of: analyticsEnabled) { enabled in
        AnalyticsService.shared.setAnalyticsEnabled(enabled)
        CrashReportingService.shared.setCrashReportingEnabled(enabled)
    }
```

---

## 🧪 Testing Without Firebase

The system works perfectly without Firebase:

```swift
// Use mock implementations in tests
let mockAnalytics = MockAnalyticsService()
await mockAnalytics.logEvent(.walletCreated, parameters: nil)

let mockCrashReporting = MockCrashReportingService()
await mockCrashReporting.recordError(error, context: nil)
```

**Debug Mode:**
- All events logged to console with 📊 prefix
- All crashes logged with 🔥 prefix
- Event queue maintained locally
- Full testing without Firebase

---

## 📊 Firebase Console URLs

After setup, bookmark these:

**Analytics Dashboard:**
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/analytics
```

**Crashlytics Dashboard:**
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/crashlytics
```

**Project Settings:**
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general
```

---

## 🔧 Troubleshooting

### "Firebase not configured" Error
**Solution:** Ensure `FirebaseApp.configure()` is called in `NorWalletApp.init()` BEFORE anything else.

### "GoogleService-Info.plist not found"
**Solution:**
1. Download from Firebase Console
2. Drag to Xcode (select "Copy items if needed")
3. Verify it's in Bundle Resources (Build Phases → Copy Bundle Resources)

### Analytics Events Not Showing
**Normal:** Firebase has a 24-hour delay for dashboard updates.
**Debug Mode:** Use DebugView in Firebase Console for real-time events.

**Enable Debug Mode:**
```bash
# Enable for this device
xcrun simctl spawn booted log config --mode "level:debug" --subsystem com.google.firebase.analytics

# Or add to scheme: -FIRAnalyticsDebugEnabled
```

### Crashlytics Not Receiving Crashes
**Check:**
1. Run script phase added?
2. dSYM files enabled for Release builds?
3. Waited 5-10 minutes after crash?
4. Relaunched app after crash?

### Build Errors After Adding Firebase
**Solution:**
```bash
# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData
xcodebuild clean -project NorWallet.xcodeproj -scheme NorWallet

# Rebuild
xcodebuild build -project NorWallet.xcodeproj -scheme NorWallet \
  -destination 'platform=iOS Simulator,name=iPhone 15'
```

---

## 📝 Summary

### ✅ Completed (Already Done)
1. Analytics service implementation (400+ lines)
2. Crash reporting service implementation (350+ lines)
3. WalletViewModel integration
4. Comprehensive unit tests (60+ tests)
5. Mock implementations for testing
6. Debug logging system
7. Event queue management
8. Error statistics tracking

### ⏳ Optional (30-60 minutes)
1. Create Firebase project (5 min)
2. Add Firebase SDK (10 min)
3. Add GoogleService-Info.plist (2 min)
4. Uncomment Firebase code (10 min)
5. Configure Crashlytics (5 min)
6. Build and test (10 min)
7. Verify in dashboard (24 hours)

### 🎯 Result
**Without Firebase:** Fully functional local analytics and crash tracking
**With Firebase:** Cloud-based dashboards, real-time monitoring, historical data

**The app is production-ready either way!**

---

## 🚀 Next Steps

1. **Deploy Without Firebase** - Ship now, add Firebase later
2. **Add Firebase for Production** - Get cloud dashboards and monitoring
3. **Monitor Metrics** - Track stability and user behavior
4. **Iterate Based on Data** - Use analytics to guide feature development

---

**Last Updated:** November 5, 2025
**Implementation Status:** 100% Complete (Firebase optional)
**Files Created:** 4 (AnalyticsService, CrashReportingService, 2 test files)
**Lines of Code:** 1,500+
**Unit Tests:** 60+
