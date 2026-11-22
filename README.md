# 自查手册

**在线阅读：[https://xhd107.github.io/dev-handbook/](https://xhd107.github.io/dev-handbook/)**

面向日常开发的中文速查手册，按 **标准 C++、Unreal C++、图形学、Vulkan、HLSL** 五个顶级模块组织。当前包含 **250 个主题、31 个用途分类**，其中标准 C++ 152 条，Unreal C++ 31 条，图形学 46 条，HLSL 21 条。Vulkan 已建立独立入口，正文待补充。

支持当前模块内全文搜索、学习优先级筛选、分类导航、条目折叠和示例代码复制。标准 C++ 可分别筛选 C++20、C++23、C++26 新增内容。C++23、C++26 条目列出特性检测宏及阈值，并链接到相应的工作草案章节。切换模块会同步切换分类和快捷入口，API 深链接可自动进入对应模块。

图形学模块从实现时常遇到的问题出发，整理区间映射、浮点误差、向量与矩阵、坐标空间转换、投影与深度、射线求交、着色与采样。打开条目可先读 LaTeX 公式和推导，再按需展开 C++ 或 HLSL 示例。

HLSL 模块先简写与 C++ 同形的语法，再查 HLSL 特有的向量和矩阵、阶段语义、资源绑定与布局、纹理采样和计算着色器。每条附官方参考。

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
- `src/data-cpp-engine.js`：标准 C++ 在顶点布局、帧内分配、场景划分、纹理数值和后台任务同步中的用法
- `src/data-cpp-practice.js`：网格算法、引擎数值处理、资源管理与并发实例
- `src/data-cpp23.js`、`src/data-cpp26.js`：按标准版本维护的语言与库特性；每条提供 `featureTest` 条件
- `src/data-unreal.js`：Unreal 反射宏、对象生命周期、引用类型和 Gameplay 工具
- `src/data-graphics.js`：图形学数学、空间变换、投影、求交、着色和采样
- `src/data-graphics-math.js`：标量插值、数值误差、常用几何查询、逆变换、深度重建与切线空间
- `src/data-graphics-theory.js`：按条目 ID 保存数学解释和 LaTeX 公式，由 KaTeX 渲染
- `src/data-hlsl.js`：HLSL 基础、相关 Shader Model 或语言版本、示例与官方文档
- `src/main.js`：模块切换、渲染、搜索、筛选和交互
- `src/style.css`：页面样式与移动端适配

新增条目时补齐名称、分类、头文件或相关工具、适用版本、优先级、说明、返回值、注意事项、示例和检索词。条目 ID 必须唯一。文档里的代码示例使用 C++ 或 HLSL，默认显示 C++，HLSL 示例需注明 `codeLanguage: 'hlsl'`。图形学词条还需在 `src/data-graphics-theory.js` 按 ID 加入说明与 LaTeX 公式。每一步使用 `[说明, 公式, ...]`，公式使用 `tex` 标签模板，直接写 LaTeX。

## 图形学参考资料

- [Fundamentals of Computer Graphics 5th 中文笔记](https://github.com/Xhd107/Fundamentals-Of-Computer-Graphics-5th-CN)
- [GAMES101：现代计算机图形学入门](https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html)
- [Modern Robotics：Rodrigues 旋转公式](https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-2-3-exponential-coordinates-of-rotation-part-2-of-2/)
- [Real-Time Rendering 4th 阅读笔记](https://www.wolai.com/fkGSwxLu2pjWD7kiBY1V7W)
- [PBRT 4e：应用变换](https://www.pbr-book.org/4ed/Geometry_and_Transformations/Applying_Transformations)、[形状采样接口](https://www.pbr-book.org/4ed/Shapes/Basic_Shape_Interface)
- [Khronos：Vulkan 裁剪与视口变换](https://docs.vulkan.org/spec/latest/chapters/vertexpostproc.html)、[glTF 2.0 规范](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [GLM：投影与反投影](https://glm.g-truc.net/0.9.9/api/a00666.html)、[NVIDIA：透视深度精度与反向 Z](https://developer.nvidia.com/blog/visualizing-depth-precision/)

图形学条目默认使用**列向量**，矩阵写在向量左侧，例如 `p′ = M p`。多个变换从右往左应用，例如 `P V M p` 依次应用模型、视图和投影变换。接入相机、着色器或引擎时，需分别核对手性、观察方向、深度范围和矩阵存储布局。

## Unreal 参考资料

- [Epic：虚幻引擎 C++ 编程](https://dev.epicgames.com/documentation/unreal-engine/programming-with-cplusplus-in-unreal-engine?lang=zh-CN)
- [Epic：Unreal 模块和 Build.cs](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules)
- [Tom Looman：Unreal Engine C++ Guide](https://tomlooman.com/unreal-engine-cpp-guide/)
- [Epic：字符串处理](https://dev.epicgames.com/documentation/unreal-engine/string-handling-in-unreal-engine?lang=zh-CN)
- [Epic：委托与 Lambda](https://dev.epicgames.com/documentation/unreal-engine/delegates-and-lambda-functions-in-unreal-engine?lang=zh-CN)

Unreal 条目以 UE5 常见写法为基准。项目实际可用的 C++ 标准、API 和构建配置仍需结合所用引擎版本确认。

## HLSL 参考资料

- [Microsoft Learn：HLSL 语言参考](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-reference)，查语义、内置函数、纹理对象和 Shader Model。
- [DirectX Shader Compiler：语言版本](https://github.com/microsoft/DirectXShaderCompiler/wiki/Language-Versions)与 [HLSL 2021](https://github.com/microsoft/DirectXShaderCompiler/wiki/HLSL-2021)，查 DXC 的语法版本和兼容性。
- [Microsoft：HLSL 语言规范草案](https://microsoft.github.io/hlsl-specs/specs/index.html)，用来核对语言规则的细节，实际功能支持仍要看编译器和编译目标。
- [Microsoft Learn：D3D12 资源绑定](https://learn.microsoft.com/en-us/windows/win32/direct3d12/resource-binding-in-hlsl)与 [DXC：SPIR-V 后端](https://github.com/microsoft/DirectXShaderCompiler/blob/main/docs/SPIR-V.rst#hlsl-register-and-vulkan-binding)，分别查 Direct3D 和 Vulkan 下的绑定约定。

条目以 DXC 和 HLSL 2021 为基准。语言选项 `-HV` 与目标选项 `-T` 分开指定。示例是独立着色器或辅助函数，纹理、采样器和缓冲区需要宿主程序绑定。
