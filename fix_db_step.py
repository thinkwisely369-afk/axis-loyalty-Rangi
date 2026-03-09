import paramiko

host = '198.251.81.14'
port = 25552
user = 'axisloyaltycloud'
pw = '2mAwCk2bXJv3JBhdmbsq'

def fix_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=user, password=pw)
        cols = [
            ("promotion_time", "string"),
            ("banner_image", "string"),
            ("qr_code", "string"),
            ("is_active", "boolean")
        ]
        for col, type in cols:
            print(f"Adding {col}...")
            if type == "string":
                cmd = f"cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"Schema::hasColumn('privileges', '{col}') ?: Schema::table('privileges', function (\$t) {{ \$t->string('{col}')->nullable(); }})\""
            else:
                cmd = f"cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"Schema::hasColumn('privileges', '{col}') ?: Schema::table('privileges', function (\$t) {{ \$t->boolean('{col}')->default(true); }})\""
            
            stdin, stdout, stderr = client.exec_command(cmd)
            print(stdout.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    fix_db()
