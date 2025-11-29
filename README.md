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
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`：可选，若不配置则使用静态 `files.json`
