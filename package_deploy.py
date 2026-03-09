import os
import zipfile

def zip_folder(folder_path, output_path, excludes=None):
    if excludes is None:
        excludes = []
    
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Skip excluded directories
            if any(exclude in root for exclude in excludes):
                continue
                
            for file in files:
                file_path = os.path.join(root, file)
                # Skip excluded files or folders in path
                if any(exclude in file_path for exclude in excludes):
                    continue
                
                # Use relative path for zip entry
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname)
    print(f"Created {output_path}")

if __name__ == "__main__":
    # Backend
    zip_folder('backend', 'backend_update.zip', excludes=['vendor', 'node_modules', '.git'])
    
    # Frontend (if dist exists)
    if os.path.exists('dist'):
        zip_folder('dist', 'frontend_update.zip')
    else:
        print("dist folder not found. Build might have failed.")
