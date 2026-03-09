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
        tinker_cmd = """
Schema::table('privileges', function ($table) {
    if (!Schema::hasColumn('privileges', 'promotion_time')) $table->string('promotion_time')->nullable();
    if (!Schema::hasColumn('privileges', 'banner_image')) $table->string('banner_image')->nullable();
    if (!Schema::hasColumn('privileges', 'qr_code')) $table->string('qr_code')->nullable();
    if (!Schema::hasColumn('privileges', 'is_active')) $table->boolean('is_active')->default(true);
});
echo "Columns fixed";
"""
        # Escape double quotes for shell
        tinker_cmd = tinker_cmd.replace('"', '\\"')
        cmd = f"cd /home/axisloyaltycloud/loyalty-backend && php artisan tinker --execute=\"{tinker_cmd}\""
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
    finally:
        client.close()

if __name__ == "__main__":
    fix_db()
