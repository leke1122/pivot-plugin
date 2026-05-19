# 部署到 GitHub + Vercel

本地仓库已初始化并完成首次提交。按下面步骤即可获得 **HTTPS 公网地址**，用于飞书「自定义插件」测试。

## 1. 登录 GitHub CLI（一次性）

在 PowerShell 中执行：

```powershell
gh auth login
```

选择：GitHub.com → HTTPS → 按提示浏览器登录授权。

## 2. 创建仓库并推送

在 `pivot-plugin` 目录执行（仓库名可改）：

```powershell
cd e:\飞书透视表\pivot-plugin
git branch -M main
gh repo create feishu-bitable-pivot --public --source=. --remote=origin --push
```

完成后会得到：`https://github.com/<你的用户名>/feishu-bitable-pivot`

## 3. 连接 Vercel

1. 打开 https://vercel.com 并用 GitHub 登录  
2. **Add New → Project** → 导入 `feishu-bitable-pivot`  
3. 保持默认即可（已含 `vercel.json`）  
   - Framework: Vite  
   - Build Command: `npm run build:web`  
   - Output: `dist`  
4. 点击 **Deploy**，等待完成  

部署地址示例：`https://feishu-bitable-pivot.vercel.app`

## 4. 飞书侧配置

1. [开放平台](https://open.feishu.cn/app/cli_aa86a1bceb3ddbb4) → **开发配置 → 安全设置 → 服务器域名**  
   - 添加：`https://feishu-bitable-pivot.vercel.app`（换成你的 Vercel 域名）  
2. 多维表格 → **添加自定义插件** → 填入：  
   `https://你的域名.vercel.app/`  
3. 在插件视图内测试透视功能（须在多维表格内打开，不能只在浏览器里测数据）

## 5. 后续更新

```powershell
git add .
git commit -m "update: ..."
git push
```

Vercel 会自动重新部署。

---

**说明：** 不要把 App Secret 写入仓库。opdev 上传飞书仍用 `npm run upload`，与 Vercel 部署互不影响。
