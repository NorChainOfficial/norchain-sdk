#!/bin/bash
# Script to add Supabase SDK to Xcode project
# This script provides instructions and attempts to add via project file

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_FILE="$PROJECT_DIR/NorWallet.xcodeproj/project.pbxproj"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        Adding Supabase SDK to Xcode Project                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode first."
    exit 1
fi

echo "📋 Method 1: Using Xcode GUI (Recommended)"
echo ""
echo "1. Open Xcode:"
echo "   open $PROJECT_DIR/NorWallet.xcodeproj"
echo ""
echo "2. In Xcode:"
echo "   - Select the 'NorWallet' project in the navigator (blue icon)"
echo "   - Select the 'NorWallet' target"
echo "   - Go to the 'Package Dependencies' tab"
echo "   - Click the '+' button"
echo "   - Paste URL: https://github.com/supabase/supabase-swift"
echo "   - Select version: 'Up to Next Major Version' → 2.0.0"
echo "   - Click 'Add Package'"
echo "   - Select 'Supabase' product (check the box)"
echo "   - Click 'Add Package'"
echo ""
echo "3. Wait for package resolution (may take 1-2 minutes)"
echo ""
echo "4. Build the project:"
echo "   Press ⌘B or Product → Build"
echo ""

# Try method 2: Using xcodebuild (if project allows)
echo "📋 Method 2: Using Command Line (Alternative)"
echo ""
echo "Note: This requires Xcode to be closed and may not work for all projects."
echo ""
echo "If you want to try command line:"
echo "1. Close Xcode completely"
echo "2. Run:"
echo "   cd $PROJECT_DIR"
echo "   xcodebuild -resolvePackageDependencies -project NorWallet.xcodeproj"
echo ""
echo "However, adding packages via command line is limited."
echo "The GUI method (Method 1) is recommended."
echo ""

# Create a simple helper script
cat > "$PROJECT_DIR/open-xcode.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
open NorWallet.xcodeproj
echo "✅ Opening Xcode project..."
echo ""
echo "Next steps:"
echo "1. Select 'NorWallet' project (blue icon)"
echo "2. Select 'NorWallet' target"
echo "3. Go to 'Package Dependencies' tab"
echo "4. Click '+' → Add: https://github.com/supabase/supabase-swift"
echo "5. Version: Up to Next Major Version → 2.0.0"
echo "6. Add Package → Select 'Supabase' → Add Package"
EOF

chmod +x "$PROJECT_DIR/open-xcode.sh"

echo "✅ Created helper script: open-xcode.sh"
echo ""
echo "🚀 Quick start:"
echo "   ./open-xcode.sh"
echo ""
echo "Then follow the GUI instructions above."
echo ""

