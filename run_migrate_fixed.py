import paramiko
import sys

# Ensure stdout handles UTF-8
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def run_command(ssh, command):
    print(f"--- Running: {command} ---")
    stdin, stdout, stderr = ssh.exec_command(command)
    out = stdout.read().decode('utf-8', 'ignore')
    err = stderr.read().decode('utf-8', 'ignore')
    # Use ascii() to avoid encoding errors on print
    if out: print(f"STDOUT: {ascii(out)}")
    if err: print(f"STDERR: {ascii(err)}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('198.251.81.14', port=25552, username='axisloyaltycloud', password='2mAwCk2bXJv3JBhdmbsq')
    run_command(client, "cd loyalty-backend && php artisan migrate --force")
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
