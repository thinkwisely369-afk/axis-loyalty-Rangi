import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def get_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        # Get the last 200 lines and search for the most recent error
        stdin, stdout, stderr = client.exec_command("tail -n 200 /home/axisloyaltycloud/loyalty-backend/storage/logs/laravel.log")
        logs = stdout.read().decode()
        print(logs)
    finally:
        client.close()

if __name__ == "__main__":
    get_logs()
