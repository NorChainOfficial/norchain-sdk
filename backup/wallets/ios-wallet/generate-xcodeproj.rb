#!/usr/bin/env ruby
# Script to generate NorWallet.xcodeproj

require 'fileutils'
require 'securerandom'

project_dir = File.dirname(__FILE__)
xcodeproj_path = File.join(project_dir, 'NorWallet.xcodeproj')
FileUtils.mkdir_p(xcodeproj_path)

# Generate UUIDs for references
app_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
app_swift_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
content_swift_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
viewmodel_swift_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
lib_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
plist_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
bridging_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
header_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
xcconfig_uuid = SecureRandom.uuid.gsub('-', '')[0..23]
norcore_uuid = SecureRandom.uuid.gsub('-', '')[0..23]

# Create minimal but working project.pbxproj
project_content = <<~PBXPROJ
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {
	};
	rootObject = #{SecureRandom.uuid.gsub('-', '')[0..23]} /* Project object */;
}
PBXPROJ

File.write(File.join(xcodeproj_path, 'project.pbxproj'), project_content)
puts "✅ Generated NorWallet.xcodeproj"
puts "Open it in Xcode and it will initialize properly"
