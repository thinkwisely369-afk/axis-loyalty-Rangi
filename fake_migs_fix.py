import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def fake_migrations():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        migs = [
            '2026_02_15_130453_add_profile_photo_to_users_table',
            '2026_02_16_041000_add_details_to_privileges_table',
            '2026_02_17_084400_add_qr_code_to_privileges_table'
        ]
        for m in migs:
            print(f"Faking {m}...")
            cmd = f"cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"DB::table('migrations')->insert(['migration' => '{m}', 'batch' => 1])\""
            client.exec_command(cmd)
            
        print("Running migrate...")
        stdin, stdout, stderr = client.exec_command("cd /home/axisloyaltycloud/loyalty-backend && php artisan migrate --force")
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    fake_migrations()
