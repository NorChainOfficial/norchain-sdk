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
