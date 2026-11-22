import { categories as standardCategories, coreApis } from './data-core.js';
import { algorithmApis } from './data-algorithms.js';
import { tailApis } from './data-tail.js';
import { engineCppCategories, engineCppApis } from './data-cpp-engine.js';
import { practiceApis } from './data-cpp-practice.js';
import { cpp23Apis } from './data-cpp23.js';
import { cpp26Apis } from './data-cpp26.js';
import { smartPointerApis } from './data-smart-pointers.js';
import { preprocessorApis } from './data-preprocessor.js';
import { lambdaApis } from './data-lambdas.js';
import { callableApis } from './data-callables.js';
import { unrealCategories, unrealApis } from './data-unreal.js';
import { gameplayCategories, gameplayApis } from './data-unreal-gameplay.js';
import { graphicsCategories, graphicsApis } from './data-graphics.js';
import { graphicsMathCategory, graphicsMathApis } from './data-graphics-math.js';
import { graphicsTheory } from './data-graphics-theory.js';
import { hlslCategories, hlslApis } from './data-hlsl.js';

export const modules = [
  { id: 'cpp', title: '标准 C++', description: '按用途查标准库与语言特性，涵盖图形和引擎常用工具，可单独筛选 C++20、C++23、C++26 新增内容。' },
  { id: 'unreal', title: 'Unreal C++', description: '按功能查找 UE5 玩法脚本，从玩家输入、关卡交互到 UI、AI、存档与联网。将玩法示例保存为注释所示的同名头文件，在 Build.cs 加入所列模块，再按词条说明配置蓝图和关卡。' },
  { id: 'graphics', title: '图形学', description: '按问题查公式和推导，覆盖插值、向量、坐标变换、投影与深度、求交、着色与采样。' },
  { id: 'vulkan', title: 'Vulkan', description: 'Vulkan 独立模块，用于整理实例、设备、交换链、管线、同步与资源管理。', emptyMessage: 'Vulkan 模块已经建立，后续可加入实例与设备、交换链、渲染通道、管线、描述符和同步等内容。' },
  { id: 'hlsl', title: 'HLSL', description: '以 DXC 和 HLSL 2021 为查阅基准。从 C++ 熟悉的写法入手，查向量和矩阵、阶段语义、资源绑定、纹理采样和计算着色器。' }
];

export const categories = [
  ...[...standardCategories, ...engineCppCategories].map((category) => ({ ...category, domain: 'cpp' })),
  ...unrealCategories,
  ...gameplayCategories,
  graphicsMathCategory,
  ...graphicsCategories,
  ...hlslCategories
];
export const apis = [
  ...coreApis,
  ...algorithmApis,
  ...tailApis,
  ...engineCppApis,
  ...practiceApis,
  ...cpp23Apis,
  ...cpp26Apis,
  ...smartPointerApis,
  ...preprocessorApis,
  ...lambdaApis,
  ...callableApis,
  ...unrealApis,
  ...gameplayApis,
  ...[...graphicsApis, ...graphicsMathApis].map((api) => ({
    ...api,
    theory: graphicsTheory[api.id]
  })),
  ...hlslApis
];
