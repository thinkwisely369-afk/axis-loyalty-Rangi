#!/bin/bash
# Quick fix script to update API URL in deployed frontend

cd ~/public_html/assets

# Find the main JS file and update the API URL
for file in index-*.js; do
    if [ -f "$file" ]; then
        # Backup
        cp "$file" "$file.backup"
        
        # Replace API URL - handle both cases
        sed -i 's|https://axisloyalty\.cloud"|https://axisloyalty.cloud/api"|g' "$file"
        sed -i 's|"https://axisloyalty\.cloud/auth|"https://axisloyalty.cloud/api/auth|g' "$file"
        
        echo "Updated $file"
    fi
done

echo "API URL fix applied!"
