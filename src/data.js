import { categories as standardCategories, coreApis } from './data-core.js';
import { algorithmApis } from './data-algorithms.js';
import { tailApis } from './data-tail.js';
import { engineCppCategories, engineCppApis } from './data-cpp-engine.js';
import { unrealCategories, unrealApis } from './data-unreal.js';
import { graphicsCategories, graphicsApis } from './data-graphics.js';
import { graphicsMathCategory, graphicsMathApis } from './data-graphics-math.js';
import { graphicsTheory } from './data-graphics-theory.js';
import { hlslCategories, hlslApis } from './data-hlsl.js';

export const modules = [
  { id: 'cpp', title: '标准 C++', description: '以 C++20 为基准的标准库、算法、Ranges、文件系统、并发与类型工具。' },
  { id: 'unreal', title: 'Unreal C++', description: 'UE5 常见反射宏、对象生命周期、资源引用与 Gameplay 工具。' },
  { id: 'graphics', title: '图形学', description: '按问题查公式和推导，覆盖插值、向量、坐标变换、投影与深度、求交、着色与采样。' },
  { id: 'vulkan', title: 'Vulkan', description: 'Vulkan 独立模块，用于整理实例、设备、交换链、管线、同步与资源管理。', emptyMessage: 'Vulkan 模块已经建立，后续可加入实例与设备、交换链、渲染通道、管线、描述符和同步等内容。' },
  { id: 'hlsl', title: 'HLSL', description: '以 DXC 和 HLSL 2021 为查阅基准。从 C++ 熟悉的写法入手，查向量和矩阵、阶段语义、资源绑定、纹理采样和计算着色器。' }
];

export const categories = [
  ...[...standardCategories, ...engineCppCategories].map((category) => ({ ...category, domain: 'cpp' })),
  ...unrealCategories,
  graphicsMathCategory,
  ...graphicsCategories,
  ...hlslCategories
];
export const apis = [
  ...coreApis,
  ...algorithmApis,
  ...tailApis,
  ...engineCppApis,
  ...unrealApis,
  ...[...graphicsApis, ...graphicsMathApis].map((api) => ({
    ...api,
    theory: graphicsTheory[api.id]
  })),
  ...hlslApis
];
