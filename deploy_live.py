import paramiko
import os

def run_command(ssh, command):
    print(f"--- Running: {command} ---")
    stdin, stdout, stderr = ssh.exec_command(command)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(f"STDOUT: {out}")
    if err: print(f"STDERR: {err}")
    return out, err

def upload_file(sftp, local_path, remote_path):
    print(f"Uploading {local_path} to {remote_path}...")
    sftp.put(local_path, remote_path)
    print("Upload complete")

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

frontend_zip = 'frontend_update.zip'
backend_zip = 'backend_update.zip'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=user, password=pw)
    sftp = client.open_sftp()

    # Upload files
    upload_file(sftp, frontend_zip, f'/home/{user}/{frontend_zip}')
    upload_file(sftp, backend_zip, f'/home/{user}/{backend_zip}')
    
    # Extract Frontend
    run_command(client, f"rm -rf /home/{user}/domains/axisloyalty.cloud/public_html/assets")
    run_command(client, f"unzip -o /home/{user}/{frontend_zip} -d /home/{user}/domains/axisloyalty.cloud/public_html/")
    
    # Extract Backend
    # Note: backend_update.zip contains a 'backend/' folder inside it? 
    # Let's check what's in the zip I created. 
    # I used 'Compress-Archive -Path backend/*' which usually means the contents of backend/ are at the root of the zip.
    run_command(client, f"unzip -o /home/{user}/{backend_zip} -d /home/{user}/loyalty-backend/")
    
    # Run Migrations
    run_command(client, f"cd /home/{user}/loyalty-backend && php artisan migrate --force")
    
    # Clear Cache
    run_command(client, f"cd /home/{user}/loyalty-backend && php artisan cache:clear && php artisan config:clear")

    print("Deployment successful!")

except Exception as e:
    print(f"Error during deployment: {e}")
finally:
    client.close()
