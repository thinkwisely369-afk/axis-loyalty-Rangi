import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=user, password=pw)
    sftp = client.open_sftp()
    sftp.put('fix_db_step.php', '/home/axisloyaltycloud/loyalty-backend/fix_db_step.php')
    sftp.close()
    
    stdin, stdout, stderr = client.exec_command("cd /home/axisloyaltycloud/loyalty-backend && php fix_db_step.php")
    print(stdout.read().decode())
    print(stderr.read().decode())
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
