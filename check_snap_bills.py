import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=user, password=pw)
    cmd = "cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"echo 'SNAP_BILLS: ' . (Schema::hasTable('snap_bills') ? 'YES' : 'NO')\""
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode())
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
