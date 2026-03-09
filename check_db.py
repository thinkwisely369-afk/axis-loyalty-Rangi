import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def check_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        cmd = "cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"print_r(Schema::getColumnListing('privileges'))\""
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    check_db()
