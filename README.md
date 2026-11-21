# 自查手册

**在线阅读：[https://xhd107.github.io/dev-handbook/](https://xhd107.github.io/dev-handbook/)**

面向日常开发的中文速查手册，按 **标准 C++、Unreal C++、图形学、Vulkan、HLSL** 五个顶级模块组织。当前包含 **145 个主题、20 个用途分类**：标准 C++ 84 条，Unreal C++ 31 条，图形学 30 条；Vulkan 与 HLSL 已建立独立入口，正文待补充。

支持当前模块内全文搜索、学习优先级筛选、分类导航、条目折叠和示例代码复制；C++20 新增筛选仅用于标准 C++。切换模块会同步切换分类和快捷入口，API 深链接可自动进入对应模块。

图形学模块优先整理常用数学和基础算法：向量与矩阵、投影与插值、射线求交、着色与曲线、采样与蒙特卡洛。每条给出公式、坐标约定、计算示例和易错点，便于实现时核对，不替代完整的图形学课程。

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

网页地址：`https://xhd107.github.io/dev-handbook/`

## 内容维护

- `src/data.js`：五个技术模块的定义、分类归属和数据汇总
- `src/data-core.js`：C++ 字符串、容器、关联容器和通用工具
- `src/data-algorithms.js`：C++ 算法与 Ranges
- `src/data-tail.js`：C++ 文件系统、智能指针、数学、并发和类型诊断
- `src/data-unreal.js`：Unreal 反射宏、对象生命周期、引用类型和 Gameplay 工具
- `src/data-graphics.js`：图形学数学、空间变换、投影、求交、着色和采样
- `src/main.js`：模块切换、渲染、搜索、筛选和交互
- `src/style.css`：页面样式与移动端适配

新增条目时，为数据对象补齐名称、分类、头文件、版本、优先级、说明、返回值、注意事项、示例和检索词。条目 ID 必须唯一。新增技术领域时，可继续拆分独立数据模块并添加用途分类，不必改动现有条目。

## 图形学参考资料

- [Fundamentals of Computer Graphics 5th 中文笔记](https://github.com/Xhd107/Fundamentals-Of-Computer-Graphics-5th-CN)
- [GAMES101：现代计算机图形学入门](https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html)
- [Real-Time Rendering 4th 阅读笔记](https://www.wolai.com/fkGSwxLu2pjWD7kiBY1V7W)

图形学条目默认使用**列向量、矩阵右乘、先右后左**的记法。相机、投影、着色器和引擎接入仍需分别核对手性、观察方向、深度范围及矩阵存储布局；具体公式旁会标注关键约定。

## Unreal 参考资料

- [Epic：虚幻引擎 C++ 编程](https://dev.epicgames.com/documentation/unreal-engine/programming-with-cplusplus-in-unreal-engine?lang=zh-CN)
- [Tom Looman：Unreal Engine C++ Guide](https://tomlooman.com/unreal-engine-cpp-guide/)
- [Epic：字符串处理](https://dev.epicgames.com/documentation/unreal-engine/string-handling-in-unreal-engine?lang=zh-CN)
- [Epic：委托与 Lambda](https://dev.epicgames.com/documentation/unreal-engine/delegates-and-lambda-functions-in-unreal-engine?lang=zh-CN)

Unreal 条目以 UE5 常见写法为基准。项目实际可用的 C++ 标准、API 和构建配置仍需结合所用引擎版本确认。
