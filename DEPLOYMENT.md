# SERI MVP 部署说明

本文档面向腾讯云轻量应用服务器部署。MVP 推荐使用 **Node.js + PM2 + Nginx + PostgreSQL**，比 Docker 更直观，适合第一版上线和排障。后续服务增多后再迁移 Docker 或 Kubernetes。

## 1. 推荐服务器配置

- 腾讯云轻量应用服务器：2 核 4G 起步
- 系统：Ubuntu 22.04 LTS
- 系统盘：60GB 起步
- 带宽：5Mbps 起步
- 数据库：MVP 可同机 PostgreSQL；正式运营建议迁移到云数据库 PostgreSQL

## 2. 安装基础软件

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 3. 初始化 PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE seri_mvp;
CREATE USER seri_user WITH ENCRYPTED PASSWORD 'replace_with_strong_password';
GRANT ALL PRIVILEGES ON DATABASE seri_mvp TO seri_user;
\q
```

执行迁移：

```bash
psql "postgresql://seri_user:replace_with_strong_password@localhost:5432/seri_mvp" -f db/migrations/001_initial_schema.sql
```

导入首批内容：

```bash
npm run db:seed
```

## 4. 配置环境变量

复制 `.env.example` 为 `.env.production`：

```bash
cp .env.example .env.production
```

必须修改：

```env
DATABASE_URL="postgresql://seri_user:replace_with_strong_password@localhost:5432/seri_mvp"
AUTH_SECRET="至少32位随机字符串"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="强密码"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

不要把 `.env.production` 提交到 Git。

## 5. 构建与 PM2 启动

```bash
npm install
npm run build
pm2 start npm --name seri-mvp -- start
pm2 save
pm2 startup
```

确认服务：

```bash
pm2 status
curl http://127.0.0.1:3000
```

## 6. Nginx 反向代理

创建配置：

```bash
sudo nano /etc/nginx/sites-available/seri-mvp
```

示例：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用：

```bash
sudo ln -s /etc/nginx/sites-available/seri-mvp /etc/nginx/sites-enabled/seri-mvp
sudo nginx -t
sudo systemctl reload nginx
```

## 7. HTTPS

备案完成、域名解析到服务器后，使用 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

检查自动续期：

```bash
sudo certbot renew --dry-run
```

## 8. 文件上传目录

当前 PDF 上传保存到项目根目录的 `uploads/`。

```bash
mkdir -p uploads
chmod 755 uploads
```

后续正式运营建议迁移到腾讯云 COS。

## 9. 数据库备份

每日备份示例：

```bash
mkdir -p ~/backups/seri
pg_dump "postgresql://seri_user:replace_with_strong_password@localhost:5432/seri_mvp" > ~/backups/seri/seri_$(date +%F).sql
```

可加入 crontab：

```bash
crontab -e
```

```cron
30 2 * * * pg_dump "postgresql://seri_user:replace_with_strong_password@localhost:5432/seri_mvp" > /home/ubuntu/backups/seri/seri_$(date +\%F).sql
```

建议同时备份 `uploads/`。

## 10. 域名、备案、上线步骤

1. 在腾讯云购买或绑定域名。
2. 完成 ICP 备案。
3. DNS 添加 A 记录到服务器公网 IP。
4. 配置 Nginx `server_name`。
5. 配置 `.env.production` 的 `NEXT_PUBLIC_SITE_URL`。
6. 使用 Certbot 配置 HTTPS。
7. 访问 `/robots.txt` 和 `/sitemap.xml`。
8. 到百度搜索资源平台、必应站长平台提交 sitemap。

## 11. 上线检查清单

- `npm run lint` 通过
- `npm run build` 通过
- `/` 可访问
- `/policies`、`/cases`、`/topics`、`/reports` 可访问
- `/search?q=长护险` 可访问
- `/robots.txt` 可访问
- `/sitemap.xml` 可访问
- `/admin/login` 可访问
- 未登录访问 `/admin` 会跳转登录
- 后台强密码已配置
- `AUTH_SECRET` 已配置
- PDF 上传不超过 20MB
- PostgreSQL 已配置备份

## 12. Docker 备选

MVP 不推荐优先 Docker，因为服务器上还要处理上传目录、数据库备份和 Nginx 证书，PM2 更容易排障。若后续希望容器化，可加入 `Dockerfile`、`docker-compose.yml`，将应用、PostgreSQL、Nginx 分开管理。
