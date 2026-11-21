# C++20 API 速查手册

以 C++20 为基准的常用标准库中文参考手册，包含 84 个主题、11 个用途分类。支持全文搜索、学习优先级筛选、C++20 新增筛选、分类导航、条目折叠和示例代码复制。

## 本地运行

```bash
npm ci
npm run dev
```

## 构建

```bash
npm run build
```

构建结果位于 `dist/`。项目使用 Vite，页面不依赖后端服务。

## GitHub Pages

仓库通过 `.github/workflows/deploy.yml` 自动构建并部署到 GitHub Pages。推送到 `main` 分支后，工作流会自动更新网页，也可以在 Actions 页面手动触发。

网页地址：`https://xhd107.github.io/cpp20-api-handbook/`

## 内容维护

- `src/data-core.js`：字符串、容器、关联容器和通用工具
- `src/data-algorithms.js`：算法与 Ranges
- `src/data-tail.js`：文件系统、智能指针、数学、并发和类型诊断
- `src/main.js`：渲染、搜索和交互
- `src/style.css`：页面样式与移动端适配

新增条目时，为数据对象补齐名称、分类、头文件、版本、优先级、说明、返回值、注意事项、示例和检索词。条目 ID 必须唯一。
