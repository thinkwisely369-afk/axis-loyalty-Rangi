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
        php_code = """<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Schema::table('privileges', function (Blueprint $table) {
    if (!Schema::hasColumn('privileges', 'promotion_time')) $table->string('promotion_time')->nullable();
    if (!Schema::hasColumn('privileges', 'banner_image')) $table->string('banner_image')->nullable();
    if (!Schema::hasColumn('privileges', 'qr_code')) $table->string('qr_code')->nullable();
    if (!Schema::hasColumn('privileges', 'is_active')) $table->boolean('is_active')->default(true);
});
echo "Columns fixed\\n";
"""
        sftp = client.open_sftp()
        with sftp.file('/home/axisloyaltycloud/loyalty-backend/fix_db.php', 'w') as f:
            f.write(php_code)
        
        stdin, stdout, stderr = client.exec_command("cd /home/axisloyaltycloud/loyalty-backend && php fix_db.php")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # client.exec_command("rm /home/axisloyaltycloud/loyalty-backend/fix_db.php")
    finally:
        client.close()

if __name__ == "__main__":
    fix_db()
