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
        # Search for the word "error" in the log
        stdin, stdout, stderr = client.exec_command("grep -i \"error\" /home/axisloyaltycloud/loyalty-backend/storage/logs/laravel.log | tail -n 20")
        print(stdout.read().decode())
        
        # Also try to get the very last exception trace
        stdin, stdout, stderr = client.exec_command("tail -n 100 /home/axisloyaltycloud/loyalty-backend/storage/logs/laravel.log")
        print(stdout.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    get_logs()
