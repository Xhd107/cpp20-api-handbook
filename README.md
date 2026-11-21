# 自查手册

**在线阅读：[https://xhd107.github.io/cpp20-api-handbook/](https://xhd107.github.io/cpp20-api-handbook/)**

面向日常开发的中文速查手册，当前包含 **115 个主题、14 个用途分类**，覆盖 C++20 标准库与 Unreal Engine C++（U++）。支持全文搜索、学习优先级筛选、C++20 新增筛选、Unreal 分区筛选、分类导航、条目折叠和示例代码复制。内容结构可继续扩展 HLSL、Vulkan 等技术领域。

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

- `src/data-core.js`：C++ 字符串、容器、关联容器和通用工具
- `src/data-algorithms.js`：C++ 算法与 Ranges
- `src/data-tail.js`：C++ 文件系统、智能指针、数学、并发和类型诊断
- `src/data-unreal.js`：Unreal 反射宏、对象生命周期、引用类型和 Gameplay 工具
- `src/main.js`：渲染、搜索、筛选和交互
- `src/style.css`：页面样式与移动端适配

新增条目时，为数据对象补齐名称、分类、头文件、版本、优先级、说明、返回值、注意事项、示例和检索词。条目 ID 必须唯一。新增技术领域时，可继续拆分独立数据模块并添加用途分类，不必改动现有条目。

## Unreal 参考资料

- [Epic：虚幻引擎 C++ 编程](https://dev.epicgames.com/documentation/unreal-engine/programming-with-cplusplus-in-unreal-engine?lang=zh-CN)
- [Tom Looman：Unreal Engine C++ Guide](https://tomlooman.com/unreal-engine-cpp-guide/)
- [Epic：字符串处理](https://dev.epicgames.com/documentation/unreal-engine/string-handling-in-unreal-engine?lang=zh-CN)
- [Epic：委托与 Lambda](https://dev.epicgames.com/documentation/unreal-engine/delegates-and-lambda-functions-in-unreal-engine?lang=zh-CN)

Unreal 条目以 UE5 常见写法为基准。项目实际可用的 C++ 标准、API 和构建配置仍需结合所用引擎版本确认。
