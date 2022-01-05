# Windows部屬
## 環境準備
1. 安裝windows版的docker
2. 打開powershell執行以下指令
```
wsl -d docker-desktop
echo 262144 >> /proc/sys/vm/max_map_count
exit
```
即可關掉powershell
## 相關服務部屬
1. 進到project根目錄(此目錄下有docker-compose.yml)
2. 在此目錄下打開powershell執行 docker-compose up --build -d


## 如何驗證有沒有部屬成功
1. opensearch 

