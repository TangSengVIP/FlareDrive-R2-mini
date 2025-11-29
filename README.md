# 用户下载中心（FlareDrive-R2 简化版）

仅保留下载相关功能的前端页面。文件列表从 `public/files.json` 加载，点击文件名或“下载”按钮直接发起下载。

## 本地开发

- 安装依赖：`npm i`
- 运行开发：`npm run dev`

## 配置 Cloudflare Pages + R2 公共桶

1. Fork 或推送到 GitHub
2. 在 Cloudflare Pages 新建项目，连接 Git 仓库
3. 构建设置：
   - Build command：`npm run build`
   - Output directory：`dist`
4. 在 Pages 项目 Settings → Environment Variables 添加：
   - `VITE_PUBURL`：R2 公共存储桶地址（例：`https://xxxx.r2.dev`）
   - （可选）在 Pages → Settings → R2 bindings 绑定你的桶，变量名设置为 `BUCKET`
5. 将实际文件上传到 R2，并在仓库 `public/files.json` 中填写对应 `path`（相对桶根路径）和 `name`/`size`

> 注意：不要开启 R2 公共读写，只需公共读取即可。避免将敏感信息写入代码仓库。

## 文件列表来源

优先级顺序：
- `GET /api/files`（自动从 R2 列出对象，需要绑定 R2：`BUCKET`）
- `public/files.json`（静态清单）
- 内置示例数据（仅本地测试）

编辑 `public/files.json`，示例：

```json
[
  { "id": "1", "name": "示例文档.pdf", "size": 1048576, "path": "documents/sample-document.pdf" }
]
```

## 环境变量

参考 `.env.example`：

- `VITE_PUBURL`：Cloudflare R2 公共桶 URL，用于生成下载链接
- （可选）`BUCKET`：Cloudflare Pages R2 绑定变量名，启用自动列表 `/api/files`

> 路径约定：若所有文件都存放在桶根目录，`files.json` 的 `path` 可省略，此时将使用 `name` 作为对象键。大小缺省时会通过对 `${VITE_PUBURL}/{key}` 发送 `HEAD` 请求自动获取 `Content-Length`。
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`：可选，若不配置则使用静态 `files.json`
## 自动从 GitHub 同步到 R2（CI）

本仓库内置 GitHub Actions 工作流程，将指定仓库的最新 Release 资产自动拉取并上传到 R2 桶根目录。

- 工作流：`.github/workflows/sync-to-r2.yml`
- 触发：手动（workflow_dispatch）或每天 03:00（可调整）
- 所需 Secrets（在 GitHub 仓库 Settings → Secrets and variables → Actions 配置）：
  - `GH_SOURCE_REPO`：来源仓库（如 `owner/repo`）
  - `GH_SOURCE_TOKEN`：GitHub PAT，至少授予 `repo` 权限（若来源仓库为公开，仅 Release 资产下载通常也需要 token 以提升速率和避免限制）
  - `R2_ACCOUNT_ID`：Cloudflare 账户 ID（用于 S3 兼容端点）
  - `R2_BUCKET_NAME`：目标 R2 桶名
  - `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`：R2 访问密钥对（从 R2 控制台创建）

可选输入参数：
- `tag`：指定 Release tag；留空则同步最新 Release。

同步后，Pages 前端会从 R2 根目录直接读取文件（通过 `/api/files` 或 `files.json`），页面刷新即可显示最新内容。
