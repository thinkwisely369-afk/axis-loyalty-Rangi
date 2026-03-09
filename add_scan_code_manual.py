import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def add_scan_code():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        print("Adding scan_code...")
        cmd = f"cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"Schema::hasColumn('privileges', 'scan_code') ?: Schema::table('privileges', function (\$t) {{ \$t->string('scan_code')->nullable(); }})\""
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    add_scan_code()
