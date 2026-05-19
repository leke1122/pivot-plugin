# 飞书多维表格 · 透视表插件

在多维表格**数据表视图**中读取当前 Base 的数据，通过**右侧边栏**配置行 / 列 / 值 / 筛选字段，生成接近 Excel 透视表的汇总结果。

## 功能概览

- 自动读取当前多维表格（优先当前选中的数据表）
- 侧边栏拖拽配置透视字段
- 汇总方式：求和、计数、平均值、最小值、最大值
- 支持多行维度、多列维度、多个值字段
- 监听表 / 字段 / 记录变更后自动刷新（符合官方审核规范）

## 技术栈

- React 19 + TypeScript + Vite
- [@lark-base-open/js-sdk](https://www.npmjs.com/package/@lark-base-open/js-sdk)（多维表格插件 SDK）

## Vercel 公网部署（自定义插件测试 URL）

1. 将本目录推送到 GitHub 仓库（根目录即 `pivot-plugin` 内容）。
2. 在 [Vercel](https://vercel.com) 导入该仓库，框架选 **Vite**，无需改构建命令（已含 `vercel.json`）。
3. 部署完成后使用：`https://你的项目.vercel.app/`
4. 飞书开放平台 → **安全设置 → 服务器域名**，加入 `https://你的项目.vercel.app`。
5. 多维表格 → 添加自定义插件，填入上述 URL。

> 自定义 URL 仅在飞书环境内可读写多维表；浏览器直接打开只能看到界面壳子。

## 本地开发

```bash
cd pivot-plugin
npm install
npm run dev
```

在飞书多维表格中：

1. 打开任意 Base，进入目标数据表
2. 点击「扩展视图 / 插件」→ 添加本地调试插件（需先在开放平台创建**数据表视图**类型插件并配置调试）
3. 浏览器访问 Vite 开发地址进行联调

> 若使用 `@lark-opdev/cli` 企业自建应用流程，可参考[数据表视图开发指南](https://open.feishu.cn/document/base-extensions/base-table-view-extension-development-guide)，将本项目的 `dist` 通过 `npm run upload` 上传。本项目默认按 **Base JS SDK + 静态 dist 发布** 方式组织，与仓库内 `代码规范.pdf` 一致。

## 构建与上架

```bash
npm run build
```

`package.json` 已设置 `"output": "dist"`，`vite.config.ts` 使用 `base: './'` 相对路径，满足审核要求。

上架前请确认：

1. 仓库中包含构建后的 `dist`（提交审核时需从 `.gitignore` 中移除 `dist`）
2. 不使用 history 路由（本项目为单页，无路由）
3. 不向外部服务器发送多维表格业务数据

## 配置说明

在飞书开发者后台创建应用并添加能力：**多维表格插件 → 数据表视图**。

需开通权限（用户身份）：

- 查看、评论、编辑和管理多维表格（`bitable:app`）或只读权限（视需求）

## 目录结构

```
pivot-plugin/
├── src/
│   ├── components/     # 侧边栏、透视结果表
│   ├── hooks/          # 数据加载与透视配置
│   ├── lib/            # 单元格规范化、透视引擎
│   └── services/       # bitable SDK 封装
├── dist/               # 构建产物（上架用）
└── package.json
```

## 参考

- [Base JS SDK 文档](https://lark-base-team.github.io/js-sdk-docs/)
- [多维表格插件概述](https://open.feishu.cn/document/base-extensions/base-extension-introduction)
- 项目上级目录中的 `代码规范.pdf`（发布审核要求）
