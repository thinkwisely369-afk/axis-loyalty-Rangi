import paramiko

def run_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(f"STDOUT: {out}")
    if err: print(f"STDERR: {err}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('198.251.81.14', port=25552, username='axisloyaltycloud', password='2mAwCk2bXJv3JBhdmbsq')
    print("Connected successfully")
    run_command(client, "ls -R | grep -E 'index.php|index.html' | head -n 20")
    run_command(client, "pwd")
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
