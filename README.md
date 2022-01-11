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

## 新增一台新儀器時要做的事
1. 請sam產生一組新的非對稱ssh key
2. 把公鑰取名為{mac}.pem放至publickey目錄下
3. 在project根目錄下執行
```
docker-compose up --build -d
```

## 如何驗證有沒有部屬成功
1. opensearch http://localhost:9200 帳:admin
2. dashboard http://localhost:9300 帳:admin

## proservice API有更新時
1. git pull更新
2. docker-compose up --build -d


## 更新opensearch密碼方法 (若不更新預設密碼的話,此步驟可跳過)
1. 在project根目錄打開powershell 
```
docker exec -it opensearch-node1 bash -c 'JAVA_HOME=/usr/share/opensearch/jdk bash /usr/share/opensearch/plugins/opensearch-security/tools/hash.sh'
會提示輸入密碼,輸入後按Enter就會產生hash值 複製起來
exit
```
2. 將第一部產生的hash值改到elk-config/internal_users.yml相對應admin的hash值

3. 在project根目錄打開powershell 
```sh
docker exec -it -e JAVA_HOME=/usr/share/opensearch/jdk opensearch-node1 bash -c '/usr/share/opensearch/plugins/opensearch-security/tools/securityadmin.sh -f /usr/share/opensearch/plugins/opensearch-security/securityconfig/internal_users.yml -t internalusers -icl -nhnv  -cert /usr/share/opensearch/config/admin.pem -cacert /usr/share/opensearch/config/root-ca.pem -key /usr/share/opensearch/config/admin-key.pem'
```