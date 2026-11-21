export const hlslCategories = [
  { id: 'hlsl-language', domain: 'hlsl', title: 'HLSL：语法与类型', description: '从熟悉的 C++ 写法开始，查标量、向量、矩阵、数组和参数修饰。' },
  { id: 'hlsl-pipeline', domain: 'hlsl', title: 'HLSL：着色器阶段与语义', description: '把输入送进着色器，在顶点和像素阶段之间传数据，并控制插值。' },
  { id: 'hlsl-resources', domain: 'hlsl', title: 'HLSL：资源绑定与布局', description: '查绑定槽、常量缓冲布局、结构化缓冲区与可读写纹理。' },
  { id: 'hlsl-sampling', domain: 'hlsl', title: 'HLSL：采样与内置函数', description: '按 UV 采样、按整数坐标读取纹素、计算屏幕导数和常用数学量。' },
  { id: 'hlsl-compute', domain: 'hlsl', title: 'HLSL：计算着色器', description: '把 Dispatch 线程映射到数据，用组共享内存和原子操作协作。' }
];

const learn = (page, label) => ({
  label,
  url: 'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/' + page
});
const dxc = (page, label) => ({
  label,
  url: 'https://github.com/microsoft/DirectXShaderCompiler/wiki/' + page
});
const hlsl = (entry) => ({ codeLanguage: 'hlsl', level: 'A', since: 'HLSL 基础', ...entry });

export const hlslApis = [
  hlsl({
    id: 'hlsl-cpp-control', category: 'hlsl-language', name: '沿用 C++ 写法：变量、函数、分支和循环',
    header: 'if / else · for · while · switch · return', since: 'HLSL 2021',
    brief: '变量声明、函数、花括号作用域和基本控制流都可按熟悉的 C++ 形式写。标量与向量条件要区别处理。',
    signature: 'C++ 同形语法：Type name = value;  if (条件) { ... }  for (初始化; 条件; 更新) { ... }',
    returns: 'HLSL 2021 中标量 &&、||、?: 按短路规则求值。向量比较得到布尔向量，用 any 或 all 汇总成标量，再交给 if。',
    pitfall: '不要把旧版本 HLSL 的求值行为套到 HLSL 2021。GPU 上同一波内线程走不同分支时，可能产生额外开销。',
    code: `float SumPositive(float3 values) {
    if (!any(values > 0.0)) return 0.0;
    float sum = 0.0;
    for (int i = 0; i < 3; ++i) {
        if (values[i] > 0.0) sum += values[i];
    }
    return sum;
}`,
    keywords: 'C++ 相同 基本语法 condition loop branch 短路 布尔向量 any all for if while break continue switch',
    references: [dxc('HLSL-2021', 'DXC：HLSL 2021 与标量短路')]
  }),
  hlsl({
    id: 'hlsl-numeric-types', category: 'hlsl-language', name: '标量、类型转换和 16 位精度',
    header: 'bool / int / uint / float · half / min16float / float16_t',
    brief: '普通计算先用 float，用 int 或 uint 做索引和计数。遇到 half 时，先确认它实际使用多少位。',
    signature: '常用数值标量：int、uint、float 为 32 位；原生 float16_t 需 SM 6.2+ 和 -enable-16bit-types（DXC）',
    returns: 'float(x) 做数值转换。默认 DXC 中 half 是 float 的别名，开启原生 16 位类型后它才是 float16_t 的别名。min16float 表示允许的最低精度，实现可用更高精度。',
    pitfall: '两个整数相除先做整数除法，结果赋给 float 也补不回小数。跨 CPU/GPU 共享的数据还要核对布局与位宽。',
    code: `float Ratio(uint part, uint total) {
    if (total == 0u) return 0.0;
    return float(part) / float(total);
}`,
    keywords: 'float int uint bool precision fp16 half 16位 32位 最小精度 整数除法 强制转换 类型转换',
    references: [learn('dx-graphics-hlsl-scalar', 'Microsoft Learn：标量类型'), dxc('16-Bit-Scalar-Types', 'DXC：16 位标量类型')]
  }),
  hlsl({
    id: 'hlsl-vectors-swizzle', category: 'hlsl-language', name: '向量、分量重排和逐分量运算',
    header: 'float2 / float3 / float4 · .xyzw / .rgba',
    brief: '想取 RGB、交换 UV 或把标量乘到每个分量上，可以直接用向量构造与 swizzle。',
    signature: 'float4(rgb, alpha) · color.rgb · uv.yx · a * b',
    returns: 'swizzle 可以选择、排序和重复读取分量。同型向量的普通乘法按分量相乘，点积用 dot(a, b)。',
    pitfall: '一次 swizzle 使用一套命名。读取 v.xx 合法，给 v.xx 赋值会重复写同一分量，因此不允许。',
    code: `float4 ExchangeRedBlue(float4 color, float alphaScale) {
    float3 reordered = color.bgr;
    return float4(reordered, color.a * alphaScale);
}`,
    keywords: 'swizzle float2 float3 float4 xyzw rgba bgr 向量 分量 通道 重排 交换 点积 分量乘',
    references: [learn('dx-graphics-hlsl-per-component-math', 'Microsoft Learn：逐分量运算')]
  }),
  hlsl({
    id: 'hlsl-matrix-mul', category: 'hlsl-language', name: '矩阵乘法、mul 与行列布局',
    header: 'float4x4 · mul(M, v) / mul(v, M) · row_major / column_major',
    brief: '想把 C++ 的 MVP 矩阵传给着色器，先对齐数学上的乘法顺序，再对齐缓冲区里的存储排列。',
    signature: 'mul(M, v) 把 v 当列向量；mul(v, M) 把 v 当行向量；同形矩阵 A * B 按分量乘。',
    returns: 'mul 做线性代数意义的矩阵乘法。row_major 与 column_major 控制缓冲中的矩阵排列，和 mul 的参数顺序是两件事。',
    pitfall: 'floatMxN 表示 M 行 N 列。上传矩阵时根据 CPU 库、编译选项或显式布局修饰核对内存，别看到 row_major 就把乘法顺序也反过来。',
    code: `cbuffer ObjectData : register(b0) {
    column_major float4x4 ModelViewProjection;
};

float4 ToClip(float3 position) {
    return mul(ModelViewProjection, float4(position, 1.0));
}`,
    keywords: 'MVP matrix matrix multiply 矩阵乘法 mul 行向量 列向量 row_major column_major 行主序 列主序 转置',
    references: [learn('dx-graphics-hlsl-mul', 'Microsoft Learn：mul'), learn('dx-graphics-hlsl-per-component-math#matrix-ordering', 'Microsoft Learn：矩阵排列')]
  }),
  hlsl({
    id: 'hlsl-function-params', category: 'hlsl-language', name: '函数参数：in、out、inout',
    header: '普通参数默认 in · out 写回 · inout 读入再写回',
    brief: '普通函数声明和 return 类似 C++。要返回多个结果或更新输入值，用 out 或 inout 写明方向。',
    signature: 'void F(in float x, out float y, inout float accumulated);',
    returns: 'in 传入值，out 在返回时把结果写回，inout 同时读入并写回。可把它们理解为拷入和拷出语义。',
    pitfall: 'out 参数的初始值不可依赖，所有返回路径都应赋值。不要把同一变量同时传给多个输出参数并依赖它们的写回顺序。',
    code: `void SplitUv(float2 uv, out float2 tile, out float2 localUv) {
    tile = floor(uv);
    localUv = frac(uv);
}`,
    keywords: 'C++ 函数 参数 引用 输出 input output copy out inout 多个返回值',
    references: [learn('dx-graphics-hlsl-function-parameters', 'Microsoft Learn：函数参数')]
  }),
  hlsl({
    id: 'hlsl-struct-array', category: 'hlsl-language', name: '沿用 C++ 写法：struct 与固定长度数组',
    header: 'struct · T values[N] · values[i]',
    brief: '把相关字段放在 struct 里，用固定长度数组存少量权重或查找表。字段访问和数组下标写法与 C++ 类似。',
    signature: 'struct S { float3 position; };  float weights[3] = { 0.25, 0.5, 0.25 };',
    returns: 'struct 聚合多个字段，数组用从 0 开始的下标访问元素。这两个语法同样可用于普通函数内部。',
    pitfall: '接口 struct 的语义和缓冲区 struct 的布局由用途决定。GPU 资源内的结构和数组不能直接照搬 CPU 端的 sizeof 或布局。',
    code: `struct FilterTap {
    float2 offset;
    float weight;
};

FilterTap HorizontalTap(uint index) {
    // 调用方确保 index < 3。
    const float weights[3] = { 0.25, 0.5, 0.25 };
    FilterTap tap;
    tap.offset = float2(float(index) - 1.0, 0.0);
    tap.weight = weights[index];
    return tap;
}`,
    keywords: 'C++ 相同 struct array 结构体 固定数组 花括号 初始化 下标 访问 成员',
    references: [learn('dx-graphics-hlsl-struct', 'Microsoft Learn：结构体'), learn('dx-graphics-hlsl-variable-syntax', 'Microsoft Learn：变量声明')]
  }),
  hlsl({
    id: 'hlsl-shader-stage', category: 'hlsl-pipeline', name: '入口函数、阶段和 Shader Model',
    header: 'DXC：-E 选入口 · -T 选目标 · -HV 选语言版本', since: 'DXC · SM 6.x',
    brief: '不知道函数从哪里执行时，先看编译目标。顶点、像素和计算着色器分别用 vs、ps、cs 目标。',
    signature: '例如 -E PSMain -T ps_6_0 -HV 2021。入口、目标和语言版本可分别指定。',
    returns: '入口是管线调用的函数，名称由应用或编译设置选择。目标 ps_6_0 表示像素阶段和 Shader Model 6.0。',
    pitfall: '语言版本决定语法和部分求值规则，Shader Model 决定目标能力。源文件后缀不会选择阶段，Vulkan 的 SPIR-V 编译还要核对后端设置。',
    code: `// 入口：PSMain。DXC 目标：ps_6_0。
float4 PSMain() : SV_Target0 {
    return float4(0.2, 0.6, 1.0, 1.0);
}`,
    keywords: 'DXC DXIL SPIR-V shader model SM 6 HV 2021 entry point 入口 编译 目标 VS PS CS 顶点 像素 计算',
    references: [learn('dx-graphics-hlsl-models', 'Microsoft Learn：Shader Model 与目标'), dxc('Language-Versions', 'DXC：语言版本')]
  }),
  hlsl({
    id: 'hlsl-vertex-position', category: 'hlsl-pipeline', name: '顶点输入到裁剪位置：POSITION / SV_Position',
    header: 'POSITION / TEXCOORD0 · SV_Position',
    brief: '想让顶点着色器变换位置并把 UV 传下去，输入语义对齐顶点布局，输出 SV_Position 交给光栅化器。',
    signature: 'VS 输入 POSITION 是应用提供的属性；VS 输出 SV_Position 是 float4 齐次裁剪位置。',
    returns: '顶点着色器输出供后续阶段使用。TEXCOORD0 可以承载 UV 或其他自定义数据，阶段衔接要匹配语义和类型。',
    pitfall: '不要在这里手动除以 w。像素着色器输入的 SV_Position 已是光栅化后的屏幕位置，不能当作顶点阶段的裁剪位置。',
    code: `cbuffer Transform : register(b0) {
    float4x4 MVP;
};

struct VSOut {
    float4 position : SV_Position;
    float2 uv : TEXCOORD0;
};

VSOut VSMain(float3 position : POSITION, float2 uv : TEXCOORD0) {
    VSOut output;
    output.position = mul(MVP, float4(position, 1.0));
    output.uv = uv;
    return output;
}`,
    keywords: 'vertex shader VS POSITION SV_Position TEXCOORD UV input layout 顶点 输入布局 裁剪坐标 语义 光栅化',
    references: [learn('dx-graphics-hlsl-semantics', 'Microsoft Learn：系统值和自定义语义')]
  }),
  hlsl({
    id: 'hlsl-pixel-target', category: 'hlsl-pipeline', name: '像素着色器输出：SV_Target 与 SV_Depth',
    header: 'SV_Target0 / SV_Target1 · SV_Depth',
    brief: '想给像素写颜色，返回 SV_Target0。要同时写多张渲染目标，用带不同编号的成员。',
    signature: 'float4 PSMain(...) : SV_Target0；多个目标可用带语义的 struct 返回。',
    returns: 'SV_TargetN 对应第 N 个颜色目标，SV_Depth 可显式输出像素深度。只写颜色时，深度通常由管线根据光栅化结果处理。',
    pitfall: '管线要实际配置对应编号的目标和兼容格式。显式写深度可能限制某些早期深度优化。',
    code: `struct PSOut {
    float4 color : SV_Target0;
    float4 material : SV_Target1;
};

PSOut PSMain(float2 uv : TEXCOORD0) {
    PSOut output;
    output.color = float4(uv, 0.0, 1.0);
    output.material = float4(0.5, 0.0, 0.0, 1.0);
    return output;
}`,
    keywords: 'pixel shader PS SV_Target MRT render target SV_Depth 像素 片元 输出 多渲染目标 深度',
    references: [learn('dx-graphics-hlsl-semantics', 'Microsoft Learn：像素阶段系统值')]
  }),
  hlsl({
    id: 'hlsl-interpolation', category: 'hlsl-pipeline', name: '跨阶段插值：linear、noperspective、nointerpolation',
    header: 'linear · noperspective · nointerpolation · centroid · sample',
    brief: '默认浮点属性做透视校正。想传递整数材质 ID，显式用 nointerpolation。',
    signature: 'linear float2 uv : TEXCOORD0;  nointerpolation uint materialId : TEXCOORD1;',
    returns: 'linear 为默认透视校正插值，noperspective 使用屏幕线性插值，nointerpolation 让同一图元沿用单个值。',
    pitfall: '顶点到像素的 int/uint 属性必须用 nointerpolation。开 MSAA 时，centroid 和 sample 会改变求值位置，sample 还可触发逐样本着色。',
    code: `struct PixelInput {
    float4 position : SV_Position;
    float2 uv : TEXCOORD0;
    nointerpolation uint materialId : TEXCOORD1;
};

float4 PSMain(PixelInput input) : SV_Target0 {
    float debugValue = float(input.materialId & 7u) / 7.0;
    return float4(input.uv, debugValue, 1.0);
}`,
    keywords: 'linear noperspective nointerpolation flat centroid sample MSAA 插值 透视校正 材质ID 整数语义',
    references: [learn('dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4', 'Microsoft Learn：插值修饰符')]
  }),
  hlsl({
    id: 'hlsl-register', category: 'hlsl-resources', name: 'register：b、t、s、u 与 space',
    header: 'D3D12：CBV / SRV / sampler / UAV', since: 'D3D12 · space 从 SM 5.1 起',
    brief: '想知道着色器资源绑定到哪里，先看 register 的字母、槽号与空间，再对照应用的根签名和资源绑定。',
    signature: 'b：常量缓冲；t：SRV；s：采样器；u：UAV。省略 space 时为 space0。',
    returns: 't0、s0 和 u0 属于各自的编号范围。t0, space1 和 t0, space0 则是两个不同的 SRV 位置。',
    pitfall: 'D3D12 的根签名要与逻辑绑定位置兼容。用 DXC 编译到 Vulkan 时，默认映射可能让相同空间和槽号的 b0、t0、s0 撞到同一个 binding，要核对 SPIR-V 后端设置。',
    code: `cbuffer Frame : register(b0, space0) {
    float4 Tint;
};
Texture2D<float4> Albedo : register(t0, space0);
SamplerState LinearSampler : register(s0, space0);
RWTexture2D<float4> Output : register(u0, space1);`,
    keywords: 'register space binding root signature descriptor SRV UAV CBV sampler b0 t0 s0 u0 资源绑定 根签名 槽',
    references: [
      { label: 'Microsoft Learn：D3D12 HLSL 资源绑定', url: 'https://learn.microsoft.com/en-us/windows/win32/direct3d12/resource-binding-in-hlsl' },
      { label: 'DXC：SPIR-V 绑定规则', url: 'https://github.com/microsoft/DirectXShaderCompiler/blob/main/docs/SPIR-V.rst#hlsl-register-and-vulkan-binding' }
    ]
  }),
  hlsl({
    id: 'hlsl-cbuffer', category: 'hlsl-resources', name: 'cbuffer：常量缓冲与 16 字节打包',
    header: 'cbuffer · register(bN) · 常量缓冲字段偏移',
    brief: '把每帧或每个物体的只读参数放到常量缓冲。画面出现随机颜色或错位时，先查 CPU 和 HLSL 的字段偏移。',
    signature: '常见 32 位标量成员可共享 16 字节块；跨块的向量从下一块开始。普通标量或短向量数组的元素各从新的 16 字节块开始。',
    returns: '例子中 Tint 在偏移 0，Exposure 在 12，Weights 的元素在 16、32。用反射或工具核对实际布局。',
    pitfall: 'float3 后可以紧跟一个 float。不要强行把每个字段都对齐到 16 字节，也不要用 C++ bool 的对象布局去匹配 HLSL bool。D3D12 CBV 的对齐要求是另一个层级。',
    code: `cbuffer Material : register(b1) {
    float3 Tint;         // 0
    float Exposure;     // 12
    float2 Weights[2];  // 16、32
};

float3 ApplyMaterial(float3 color) {
    return color * Tint * (Exposure + Weights[1].x);
}`,
    keywords: 'constant buffer cbuffer packing packoffset alignment 16字节 256 常量缓冲 对齐 偏移 填充 CPU GPU 布局',
    references: [learn('dx-graphics-hlsl-packing-rules', 'Microsoft Learn：常量变量打包规则')]
  }),
  hlsl({
    id: 'hlsl-structured-buffer', category: 'hlsl-resources', name: 'StructuredBuffer：按结构读取或写入数组',
    header: 'StructuredBuffer<T> · RWStructuredBuffer<T>',
    brief: '想把粒子、实例或灯光数据交给着色器按索引访问，使用结构化缓冲区。',
    signature: 'StructuredBuffer<T> 通过 t 槽读取；RWStructuredBuffer<T> 通过 u 槽读写。',
    returns: 'buffer[i] 访问第 i 个结构化元素。D3D 的结构化视图使用 DXGI_FORMAT_UNKNOWN，并指定与元素匹配的 stride。',
    pitfall: '按结构化缓冲的元素布局核对 CPU 字段偏移与 stride，不能套用 cbuffer 的打包规则。索引和资源大小由调用方保证。',
    code: `struct Particle {
    float3 position;
    float life;
};

StructuredBuffer<Particle> Particles : register(t0);

Particle ReadParticle(uint index) {
    // 调用方保证 index 在缓冲范围内。
    return Particles[index];
}`,
    keywords: 'StructuredBuffer RWStructuredBuffer stride DXGI_FORMAT_UNKNOWN buffer 结构化缓冲 粒子 实例',
    references: [learn('sm5-object-structuredbuffer', 'Microsoft Learn：StructuredBuffer')]
  }),
  hlsl({
    id: 'hlsl-rwtexture', category: 'hlsl-resources', name: 'RWTexture2D：从计算着色器写图像',
    header: 'RWTexture2D<T> · register(uN) · GetDimensions',
    brief: '想生成纹理或做图像后处理，用 RWTexture2D 将计算结果写到整数纹素坐标。',
    signature: 'RWTexture2D<float4> Output : register(u0);  Output[uint2(x,y)] = value;',
    returns: '为一个纹素写入数值。宿主需要把支持相应格式和用途的资源作为 UAV 绑定。',
    pitfall: 'RWTexture2D 没有 Sample 方法。向上取整派发后要检查边界。跨绘制或 Dispatch 的依赖要按图形 API 的资源状态与同步规定处理。',
    code: `RWTexture2D<float4> Output : register(u0);

[numthreads(8, 8, 1)]
void ClearCS(uint3 id : SV_DispatchThreadID) {
    uint width, height;
    Output.GetDimensions(width, height);
    if (id.x >= width || id.y >= height) return;
    Output[id.xy] = float4(0.0, 0.0, 0.0, 1.0);
}`,
    keywords: 'RWTexture2D UAV GetDimensions image store 写纹理 Compute 图像处理 清屏 越界',
    references: [learn('sm5-object-rwtexture2d', 'Microsoft Learn：RWTexture2D')]
  }),
  hlsl({
    id: 'hlsl-texture-sample', category: 'hlsl-sampling', name: 'Texture2D.Sample / SampleLevel：用 UV 采样',
    header: 'Texture2D<T> · SamplerState · mip / LOD',
    brief: '有 UV、想读取过滤后的颜色时用 Sample。想指定从哪个 mip 级别取样，就用 SampleLevel。',
    signature: 'tex.Sample(sampler, uv) · tex.SampleLevel(sampler, uv, lod)',
    returns: '返回经过采样器寻址与过滤的结果。像素阶段的 Sample 根据屏幕导数选择 LOD，SampleLevel 则接收显式 LOD。',
    pitfall: 'Sample 的隐式 LOD 依赖导数。在普通计算着色器里可先用 SampleLevel 避开对导数的要求。LOD 0 仍会用采样器过滤，并不等同于 Load。',
    code: `Texture2D<float4> Albedo : register(t0);
SamplerState LinearSampler : register(s0);

float4 PSMain(float2 uv : TEXCOORD0) : SV_Target0 {
    return Albedo.Sample(LinearSampler, uv);
}

float4 InspectMip(float2 uv, float lod) {
    return Albedo.SampleLevel(LinearSampler, uv, lod);
}`,
    keywords: 'Sample SampleLevel sampler Texture2D uv 双线性 纹理过滤 采样器 mipmap LOD 纹理采样 Clamp Wrap',
    references: [learn('dx-graphics-hlsl-to-sample', 'Microsoft Learn：Sample'), learn('dx-graphics-hlsl-to-samplelevel', 'Microsoft Learn：SampleLevel')]
  }),
  hlsl({
    id: 'hlsl-texture-load', category: 'hlsl-sampling', name: 'Texture2D.Load：用整数坐标读单个纹素',
    header: 'Texture2D.Load(int3(x, y, mip))',
    brief: '读 G-buffer、ID 纹理或邻域像素时，如果你已有整数坐标并需要原始纹素，用 Load。',
    signature: 'T Texture2D<T>.Load(int3(x, y, mip));',
    returns: '读取指定 mip 上的单个纹素。没有采样器，不进行过滤或采样器寻址。',
    pitfall: '这里的 xy 是纹素下标，最后一个分量才是 mip。多重采样纹理的 Load 参数不同，需另传样本下标。',
    code: `Texture2D<float> Depth : register(t0);

float ReadDepth(int2 pixel) {
    // 调用方保证 pixel 位于 mip 0 范围内。
    return Depth.Load(int3(pixel, 0));
}`,
    keywords: 'Load texel fetch Texture2D 整数坐标 逐像素 纹素 Gbuffer g-buffer 深度 读像素 无过滤',
    references: [learn('dx-graphics-hlsl-to-load', 'Microsoft Learn：Load')]
  }),
  hlsl({
    id: 'hlsl-derivatives', category: 'hlsl-sampling', name: '屏幕导数：ddx、ddy、fwidth',
    header: 'ddx(x) · ddy(x) · fwidth(x)', since: '像素阶段 · SM 6.6 扩展部分阶段',
    brief: '想做程序化图形的边缘抗锯齿，或自己传纹理梯度，先估计某个量每像素变化多少。',
    signature: 'fwidth(x) = abs(ddx(x)) + abs(ddy(x))，向量参数按分量计算。',
    returns: '返回相邻执行位置上的屏幕方向差分。fwidth 可作为阈值过渡的屏幕尺度。',
    pitfall: '在像素阶段通常先在一致控制流中求导，再进入可能分歧的分支。计算、网格和放大着色器的导数支持要看 SM 6.6、设备能力和线程组形状。',
    code: `// 在像素阶段调用；sd 为负表示内部。
float Coverage(float sd) {
    float width = max(0.5 * fwidth(sd), 1e-5);
    return 1.0 - smoothstep(-width, width, sd);
}`,
    keywords: 'ddx ddy fwidth derivative gradient SampleGrad SDF 屏幕导数 抗锯齿 阈值 四像素 quad',
    references: [
      learn('dx-graphics-hlsl-fwidth', 'Microsoft Learn：fwidth'),
      { label: 'DirectX 规范：SM 6.6 的导数', url: 'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html' }
    ]
  }),
  hlsl({
    id: 'hlsl-intrinsics', category: 'hlsl-sampling', name: '常用内置函数：saturate、lerp、dot、normalize',
    header: 'saturate / clamp · lerp / smoothstep · dot / cross / normalize',
    brief: '想夹到 0–1、混合颜色或求光照余弦，用 HLSL 内置函数，可直接接受常见标量或向量类型。',
    signature: 'saturate(x) 限制到 [0,1]；lerp(a,b,t) 插值；smoothstep(a,b,x) 做平滑过渡；dot(a,b) 返回标量。',
    returns: '有些函数逐分量执行，有些把向量变成标量。normalize 返回单位方向，cross 计算三维叉积。',
    pitfall: 'lerp 不会自动限制 t，超出区间时会外推。normalize 的输入应非零。光照计算和颜色插值通常使用线性颜色。',
    code: `// lightDir 与 normal 已归一化；两种颜色都在线性空间。
float3 Shade(float3 darkColor, float3 litColor, float3 normal, float3 lightDir) {
    float diffuse = saturate(dot(normal, lightDir));
    return lerp(darkColor, litColor, diffuse);
}`,
    keywords: 'intrinsic 内置函数 clamp saturate lerp mix smoothstep normalize dot cross length 插值 归一化 夹紧',
    references: [learn('dx-graphics-hlsl-intrinsic-functions', 'Microsoft Learn：内置函数索引')]
  }),
  hlsl({
    id: 'hlsl-dispatch', category: 'hlsl-compute', name: 'Dispatch、numthreads 与线程 ID',
    header: 'SV_DispatchThreadID · SV_GroupID · SV_GroupThreadID · SV_GroupIndex',
    brief: '想让每个线程处理一个元素，先确定每组线程数，再从全局线程 ID 取数据下标。',
    signature: '全局线程 ID = 组 ID × numthreads + 组内线程 ID。SV_GroupIndex 是组内展平后的整数下标。',
    returns: '例如 [numthreads(64,1,1)] 配合 Dispatch(2,1,1) 会发出 128 个线程，全局 x 下标为 0 到 127。',
    pitfall: 'Dispatch 的参数是组数。处理 N 个元素时向上取整成组，并在读写缓冲区前检查线程下标是否小于 N。',
    code: `cbuffer Work : register(b0) {
    uint Count;
};
RWStructuredBuffer<float> Values : register(u0);

[numthreads(64, 1, 1)]
void DoubleCS(uint3 id : SV_DispatchThreadID) {
    if (id.x >= Count) return;
    Values[id.x] *= 2.0;
}`,
    keywords: 'dispatch numthreads SV_DispatchThreadID SV_GroupThreadID SV_GroupIndex SV_GroupID 全局线程 组内线程 派发 线程组 越界',
    references: [learn('sv-dispatchthreadid', 'Microsoft Learn：Dispatch 线程 ID')]
  }),
  hlsl({
    id: 'hlsl-group-shared', category: 'hlsl-compute', name: 'groupshared 与组内同步屏障',
    header: 'groupshared · GroupMemoryBarrierWithGroupSync',
    brief: '同一线程组需要先各写一部分数据，再互相读取时，用组共享内存和同步屏障。',
    signature: 'groupshared float Cache[64];  GroupMemoryBarrierWithGroupSync();',
    returns: '屏障等待同组线程到达，并让组共享内存的访问完成。例子中每组输出一个局部和。',
    pitfall: '组内所有线程都必须到达该屏障，不能让尾部多发的线程先 return。跨线程组汇总需要由下一次派发或其他算法组织。',
    code: `cbuffer Work : register(b0) { uint Count; };
StructuredBuffer<float> Values : register(t0);
RWStructuredBuffer<float> PartialSums : register(u0);
groupshared float Cache[64];

[numthreads(64, 1, 1)]
void SumGroupCS(uint3 id : SV_DispatchThreadID,
                uint3 groupId : SV_GroupID, uint lane : SV_GroupIndex) {
    Cache[lane] = 0.0;
    if (id.x < Count) Cache[lane] = Values[id.x];
    GroupMemoryBarrierWithGroupSync();

    if (lane == 0u) {
        float sum = 0.0;
        for (uint i = 0u; i < 64u; ++i) sum += Cache[i];
        PartialSums[groupId.x] = sum;
    }
}`,
    keywords: 'groupshared groupsync barrier shared memory 屏障 线程组 共享内存 同步 归约 sum reduction',
    references: [learn('groupmemorybarrierwithgroupsync', 'Microsoft Learn：组内同步屏障')]
  }),
  hlsl({
    id: 'hlsl-interlocked-add', category: 'hlsl-compute', name: 'InterlockedAdd：并发计数',
    header: 'InterlockedAdd(dest, amount[, previous])',
    brief: '多个线程都要给一个计数器加一时，用原子加，避免同时读写导致丢失增量。',
    signature: '对支持的整数共享变量或资源元素做原子加。可选 out 参数接收之前的值。',
    returns: '目标整数原子地增加。每次操作可取到它修改前的独立值，便于为线程分配不同索引。',
    pitfall: '在派发前初始化计数器。原子加本身不为其它数据提供内存屏障，大量线程争同一个地址也会影响吞吐。',
    code: `cbuffer Work : register(b0) { uint Count; };
StructuredBuffer<uint> Flags : register(t0);
RWStructuredBuffer<uint> Counters : register(u0);

[numthreads(64, 1, 1)]
void CountCS(uint3 id : SV_DispatchThreadID) {
    if (id.x >= Count) return;
    if (Flags[id.x] != 0u) InterlockedAdd(Counters[0], 1u);
}`,
    keywords: 'InterlockedAdd atomic atomic add 原子加 原子操作 计数器 histogram 并发 竞争 互斥',
    references: [learn('interlockedadd', 'Microsoft Learn：InterlockedAdd')]
  })
];
