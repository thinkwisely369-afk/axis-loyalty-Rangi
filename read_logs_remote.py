import paramiko
import sys

def check_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect('198.251.81.14', port=25552, user='axisloyaltycloud', password='2mAwCk2bXJv3JBhdmbsq')
        stdin, stdout, stderr = ssh.exec_command('tail -n 20 ~/loyalty-backend/storage/logs/laravel.log')
        print(stdout.read().decode())
        print(stderr.read().decode())
        ssh.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_logs()
