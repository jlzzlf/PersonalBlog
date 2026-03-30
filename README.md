# Astro 博客后台写作方案

这个项目已经接入了基于 `Decap CMS + GitHub + Cloudflare Pages Functions` 的网页写作后台。

写作后台入口：

- 生产环境：`https://你的域名/admin`

## 已完成的能力

- 保持 Astro + Cloudflare Pages + GitHub 的原有架构
- 文章继续存放在 `src/content/blog`
- 支持网页里新建、编辑、删除文章
- 支持把图片上传到 `public/uploads`
- 使用 GitHub OAuth 登录
- 使用 Cloudflare Pages Functions 处理 OAuth，不把 GitHub Secret 暴露到前端
- 支持 `editorial_workflow`，默认以草稿 / PR 工作流提交
- 兼容 Astro Content Collections 的本地图片和 `/uploads/...` 公共图片

## 你还需要手动配置的内容

### 1. 创建 GitHub OAuth App

在 GitHub 中创建一个 OAuth App，并填写：

- Homepage URL：`https://你的域名`
- Authorization callback URL：`https://你的域名/api/cms/callback`

创建完成后，记下：

- `Client ID`
- `Client Secret`

说明：

- 建议只在正式域名上使用后台写作，不要把 GitHub OAuth 回调地址指向 `pages.dev` 预览域名。
- 如果你有自定义域名，后台写作请始终从自定义域名访问。

### 2. 在 Cloudflare Pages 中配置环境变量 / Secrets

在 Pages 项目的 Production 环境中配置以下变量：

- `CMS_GITHUB_REPO=你的GitHub用户名/你的仓库名`
- `CMS_GITHUB_BRANCH=main`
- `CMS_ALLOWED_GITHUB_LOGINS=你的GitHub用户名`
- `CMS_GITHUB_AUTH_SCOPE=repo`
- `CMS_ADMIN_USERNAME=你自定义的后台用户名`
- `CMS_ADMIN_PASSWORD=一段足够长的随机密码`
- `PUBLIC_SITE_URL=https://你的域名`
- `PUBLIC_DISPLAY_URL=https://你的域名`
- `GITHUB_OAUTH_CLIENT_ID=你的Client ID`
- `GITHUB_OAUTH_CLIENT_SECRET=你的Client Secret`

变量说明：

- `CMS_ALLOWED_GITHUB_LOGINS`：推荐必填。只有这里列出的 GitHub 用户名才能完成登录。
- `CMS_GITHUB_AUTH_SCOPE`：建议直接用 `repo`。当前后台启用了 `editorial_workflow`，这样兼容性最稳；如果你的仓库是公开的、又想缩小权限范围，可以再尝试改成 `public_repo`。
- `CMS_ADMIN_USERNAME`：浏览器进入 `/admin` 和 `/api/cms/*` 时要输入的后台用户名。
- `CMS_ADMIN_PASSWORD`：浏览器进入后台时要输入的密码，建议放到 Cloudflare Pages 的 `Secret` 里。
- `PUBLIC_DISPLAY_URL` 可选；不填时会回退到 `PUBLIC_SITE_URL`

### 3. 用站点内置密码保护后台

这个项目现在不再依赖 Cloudflare Access，而是直接用 Cloudflare Pages Functions 给下面两类路径加浏览器登录保护：

- `/admin*`
- `/api/cms*`

这样会形成两层保护：

1. 浏览器先要求输入 `CMS_ADMIN_USERNAME / CMS_ADMIN_PASSWORD`
2. 进入后台后还要通过 GitHub OAuth，并且 GitHub 用户名要在白名单里

这套方案不需要绑定 Cloudflare Access，也不需要额外付费方式。

### 4. 重新部署

把这些文件 push 到 GitHub 后，Cloudflare Pages 会自动重新部署。

部署完成后，访问：

- `https://你的域名/admin`

## 使用说明

### 写文章

后台里会看到两个集合：

- `博客文章（Markdown）`
- `博客文章（MDX）`

推荐日常写作使用 `Markdown` 集合。

如果你的文章里需要保留 MDX 语法或组件导入，再使用 `MDX` 集合。

### 图片

- 正文图片和封面图会上传到 `public/uploads`
- 封面图字段现在同时支持：
  - Astro 本地图片对象
  - `/uploads/...` 这种公共路径

### 发布流程

当前后台启用了 `editorial_workflow`：

- 保存后不会直接改线上内容
- 会先以草稿 / 分支 / PR 方式写回 GitHub
- 发布后再进入主分支并触发 Cloudflare Pages 部署

这比直接提交到 `main` 更稳妥。

## 本地调试

### 只看后台入口页面

如果你运行：

- `npm run dev`

那么 Astro 只会启动前端页面，不会启动 Cloudflare Pages Functions。

这时你可以直接打开：

- `http://localhost:4321/admin`

你会看到后台入口页面和本地提示，但 GitHub 登录不会真的工作。

### 本地联调整个 CMS 登录流程

如果你要连同 `/api/cms/*` 这些 Functions 一起测试，请先准备本地密钥文件：

1. 复制 `.dev.vars.example` 为 `.dev.vars`
2. 填入你自己的 GitHub OAuth、仓库配置和后台用户名密码

然后执行：

1. `npm run build`
2. `npx wrangler pages dev dist`

根据 Cloudflare 官方 Pages Functions 本地开发文档，`wrangler pages dev` 会同时提供静态资源和 Functions；而本地 secrets 建议放在 `.dev.vars` 或 `.env`，并且不要提交到 git。

## 关键文件

- `src/pages/admin.astro`：后台页面入口
- `functions/api/cms/config.js`：后台运行时配置
- `functions/api/cms/auth.js`：GitHub OAuth 发起入口
- `functions/api/cms/callback.js`：GitHub OAuth 回调处理
- `src/content.config.ts`：Astro 内容模型
