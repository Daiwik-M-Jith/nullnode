#!/usr/bin/env python3
import os
import re
import glob

# Auth buttons HTML
auth_buttons = '''
                <button id="authButton" class="nav-link" style="background: var(--accent-gradient); border: none; padding: 0.5rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; color: var(--bg-dark); display: none;">Login</button>
                <div id="userProfile" style="display: none; align-items: center; gap: 0.5rem;">
                    <img id="userAvatar" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--primary-color); cursor: pointer;" title="" />
                    <button id="logoutButton" class="nav-link" style="background: rgba(255, 95, 87, 0.1); border: 1px solid #ff5f57; padding: 0.4rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; color: #ff5f57;">Logout</button>
                </div>'''

# Auth scripts
auth_scripts = '''

    <!-- Supabase Client & Auth -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="auth.js"></script>'''

def add_auth_to_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        print(f"Encoding issue with {filepath}, trying latin-1")
        with open(filepath, 'r', encoding='latin-1') as f:
            content = f.read()

    # Skip if already has auth
    if 'id="authButton"' in content:
        print(f"Skipping {filepath} - already has auth")
        return False

    # Add auth buttons to nav-links
    nav_pattern = r'(\s*<div class="nav-links">(.*?)</div>)'
    if re.search(nav_pattern, content, re.DOTALL):
        def replace_nav(match):
            nav_content = match.group(1)
            return nav_content.replace('</div>', auth_buttons + '\n            </div>')
        content = re.sub(nav_pattern, replace_nav, content, flags=re.DOTALL)
        print(f"Added auth buttons to {filepath}")
    else:
        print(f"No nav-links found in {filepath}")
        return False

    # Add auth scripts before </body>
    if 'auth.js' not in content:
        content = content.replace('</body>', auth_scripts + '\n</body>')
        print(f"Added auth scripts to {filepath}")

    # Write back
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except UnicodeEncodeError:
        print(f"Encoding issue writing {filepath}, using latin-1")
        with open(filepath, 'w', encoding='latin-1') as f:
            f.write(content)

    return True

# Find all HTML files (excluding test files)
html_files = glob.glob('*.html')
html_files = [f for f in html_files if not f.startswith('test-')]

updated_count = 0
for html_file in html_files:
    if add_auth_to_file(html_file):
        updated_count += 1

print(f"\nDone! Updated {updated_count} HTML files with auth functionality.")