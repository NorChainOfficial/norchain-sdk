import re
import uuid

def gen_uuid():
    return str(uuid.uuid4()).upper().replace('-', '')[:24]

with open('NorWallet.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

files = {
    'WalletHomeView.swift': {'file_ref': gen_uuid(), 'build_file': gen_uuid()},
    'CustomTabBar.swift': {'file_ref': gen_uuid(), 'build_file': gen_uuid()},
    'OnboardingView.swift': {'file_ref': gen_uuid(), 'build_file': gen_uuid()},
}

# Add PBXBuildFile entries
build_file_section = re.search(r'(/\* Begin PBXBuildFile section \*/.*?)(/\* End PBXBuildFile section \*/)', content, re.DOTALL)
if build_file_section:
    new_build_files = []
    for filename, uuids in files.items():
        new_build_files.append(f"\t\t{uuids['build_file']} /* {filename} in Sources */ = {{isa = PBXBuildFile; fileRef = {uuids['file_ref']} /* {filename} */; }};")
    
    new_section = build_file_section.group(1) + '\n'.join(new_build_files) + '\n\t' + build_file_section.group(2)
    content = content.replace(build_file_section.group(0), new_section)

# Add PBXFileReference entries
file_ref_section = re.search(r'(/\* Begin PBXFileReference section \*/.*?)(/\* End PBXFileReference section \*/)', content, re.DOTALL)
if file_ref_section:
    new_file_refs = []
    for filename, uuids in files.items():
        new_file_refs.append(f"\t\t{uuids['file_ref']} /* {filename} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = {filename}; sourceTree = \"<group>\"; }};")
    
    new_section = file_ref_section.group(1) + '\n'.join(new_file_refs) + '\n\t' + file_ref_section.group(2)
    content = content.replace(file_ref_section.group(0), new_section)

# Add to App group
app_group = re.search(r'(DF7A6B63DEED00854B539146 /\* App \*/ = \{[^}]*children = \(([^)]*)\);', content, re.DOTALL)
if app_group:
    children = app_group.group(2)
    new_children = []
    for filename, uuids in files.items():
        new_children.append(f"\t\t\t\t\t{uuids['file_ref']} /* {filename} */,")
    new_children_str = '\n'.join(new_children) + '\n\t\t\t\t'
    new_section = app_group.group(0).replace(children, children + new_children_str)
    content = content.replace(app_group.group(0), new_section)

# Add to Sources build phase
sources_phase = re.search(r'(B23FAA07FC25FD8C9EB2748E /\* Sources \*/ = \{[^}]*files = \(([^)]*)\);)', content, re.DOTALL)
if sources_phase:
    files_list = sources_phase.group(2)
    new_files = []
    for filename, uuids in files.items():
        new_files.append(f"\t\t\t\t{uuids['build_file']} /* {filename} in Sources */,")
    new_files_str = '\n'.join(new_files) + '\n\t\t\t'
    new_section = sources_phase.group(0).replace(files_list, files_list + new_files_str)
    content = content.replace(sources_phase.group(0), new_section)

with open('NorWallet.xcodeproj/project.pbxproj', 'w') as f:
    f.write(content)

print("✅ Added files to project.pbxproj")
for filename in files:
    print(f"  - {filename}")
