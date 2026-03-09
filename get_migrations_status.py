import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def check_migrations():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        stdin, stdout, stderr = client.exec_command("cd /home/axisloyaltycloud/loyalty-backend && php artisan migrate:status")
        print(stdout.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    check_migrations()
