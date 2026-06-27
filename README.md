# 知璟银发智库 SERI MVP

Sprint 0 工程骨架：Next.js + TypeScript + Tailwind CSS，包含前台基础路由、后台登录与管理路由、PostgreSQL 初始迁移脚本、文件上传接口结构。

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 准备环境变量

```bash
cp .env.example .env.local
```

Windows PowerShell 可直接复制 `.env.example` 为 `.env.local`，然后修改其中的数据库地址和管理员密码。

3. 启动开发服务

```bash
npm run dev
```

访问：

- 前台首页：http://localhost:3000
- 后台登录：http://localhost:3000/admin/login

默认后台账号来自 `.env.local`：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## 数据库配置

本项目使用 PostgreSQL。先创建数据库：

```sql
CREATE DATABASE seri_mvp;
```

然后执行迁移：

```bash
psql "postgresql://postgres:postgres@localhost:5432/seri_mvp" -f db/migrations/001_initial_schema.sql
```

如果你修改了 `.env.local` 的 `DATABASE_URL`，请把上面的连接串替换成你的实际地址。

## 已建表

- `admins`
- `policies`
- `cases`
- `topics`
- `reports`
- `files`
- `regions`
- `tags`
- `content_tags`
- `topic_relations`

## 当前路由

前台：

- `/`
- `/policies`
- `/cases`
- `/topics`
- `/reports`
- `/search`
- `/about`

后台：

- `/admin/login`
- `/admin`
- `/admin/policies`
- `/admin/cases`
- `/admin/topics`
- `/admin/reports`

接口：

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/files/upload`

## 文件上传

Sprint 0 仅提供上传接口结构：

- 仅允许 PDF、JPEG、PNG、WEBP、GIF
- 单文件最大 20MB
- 需要后台登录
- 临时保存到本地 `uploads/`

后续 Sprint 可替换为对象存储，并将文件元数据写入 `files` 表。

## 常用命令

```bash
npm run dev
npm run lint
npm run format
npm run build
```

## Seed 内容导入

首批内容报告默认放在：

```text
seeds/银发经济内容报告_30条政策_20案例_5专题_5报告.md
```

导入前可先验证解析结果，不写入数据库：

```bash
node scripts/seed-content.mjs --dry-run
```

导入数据库：

```bash
npm run db:seed
```

如果内容报告放在其他位置，可通过环境变量指定：

```bash
CONTENT_REPORT_PATH="/absolute/path/to/content-report.md" npm run db:seed
```

生产环境不依赖任何 Windows 本地路径。如果默认文件不存在，脚本会输出明确错误提示。

## Sprint 0 边界

本阶段没有实现会员、支付、AI 搜索、企业库、项目库、复杂权限、复杂 CMS 表单和商业化能力。
