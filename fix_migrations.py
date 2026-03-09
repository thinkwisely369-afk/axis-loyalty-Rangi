import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def fake_migration():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        cmd = "cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"DB::table('migrations')->insert(['migration' => '2026_02_15_083840_create_privileges_table', 'batch' => 1])\""
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # Now run real migrate
        stdin, stdout, stderr = client.exec_command("cd /home/axisloyaltycloud/loyalty-backend && php artisan migrate --force")
        print(stdout.read().decode())
        print(stderr.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    fake_migration()
