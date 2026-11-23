import { gameplayCategories, gameplayApis } from './data-unreal-gameplay.js';
import { lyraCategories, lyraApis } from './data-lyra.js';

export const quickGroups = {
  cpp: [
    { title: '资产路径、导入与热重载', tasks: [
      ['filesystem-path', '处理模型路径'],
      ['directory-iterator', '扫描目录中的模型文件'],
      ['filesystem-exists', '查询文件类型和大小'],
      ['io-filetime', '检测着色器源文件改动'],
      ['string-view', '拆分一行文本'],
      ['from-chars', '严格解析数字'],
      ['span-stream', '从内存读取资产描述'],
      ['asset-expected', '返回可区分的导入错误']
    ] },
    { title: '网格拓扑与顶点布局', tasks: [
      ['vector', '保存动态顶点'],
      ['span', '传入只读数组'],
      ['find-if', '查找非法索引'],
      ['texture-in-range', '判断索引能否压成 16 位'],
      ['vertex-layout', '填写顶点属性偏移'],
      ['layout-traits', '校验顶点结构的布局'],
      ['mesh-iota', '生成连续索引'],
      ['chunk-indices', '每三个索引取一个三角形'],
      ['append-batch', '合并多批网格索引'],
      ['mesh-minmax', '求单轴包围盒范围']
    ] },
    { title: '二进制资源、缓冲与上传', tasks: [
      ['span-bytes', '获取上传数据的字节数'],
      ['span-subspan', '从资源包切出一块数据'],
      ['byte-copy', '读取未对齐的文件字段'],
      ['asset-byteswap', '转换资产字节序'],
      ['align-buffer', '为暂存区分配对齐空间'],
      ['upload-row-pitch', '按行跨度复制纹理'],
      ['ptr-array-overwrite', '分配即将被覆盖的解码缓冲'],
      ['pp-embed', '嵌入小图标或查找表']
    ] },
    { title: '纹理、像素与颜色', tasks: [
      ['texture-bits', '计算 Mip 链层数'],
      ['texture-mdspan', '按行列访问纹理'],
      ['tile-submdspan', '借用纹理的一行'],
      ['mesh-inner', '从线性 RGB 求亮度'],
      ['pixel-unorm', '将浮点通道量化为 8 位'],
      ['float-next', '测试阈值两侧的浮点数']
    ] },
    { title: '场景查询、剔除与渲染队列', tasks: [
      ['bvh-nth', '拆分 BVH 节点'],
      ['grid-floor', '将负世界坐标映射到网格'],
      ['visible-partition', '把可见项移到队首'],
      ['mask-bitset', '按相机图层筛选物体'],
      ['priority-partial-sort', '选择最近的 K 个光源'],
      ['stable-draw-sort', '保留同层精灵的提交顺序'],
      ['sort-key-tie', '按管线和材质排列绘制项'],
      ['batch-scan', '计算子网格的合批偏移'],
      ['unique-material', '去掉重复的材质依赖'],
      ['small-inplace', '内嵌容量固定的局部光源列表']
    ] },
    { title: '变换、动画与帧步进', tasks: [
      ['fixed-step', '用固定步长推进物理模拟'],
      ['anim-fmod', '回绕正播或倒播时间'],
      ['lower-bound', '查找有序序列的区间边界'],
      ['keyframe-bracket', '找到动画时间两侧的关键帧'],
      ['midpoint-lerp', '在两个标量之间插值'],
      ['angle-atan2', '从平面方向求朝向角'],
      ['clip-hypot', '求二维位移长度'],
      ['finite-positions', '拒绝非有限的模型坐标'],
      ['zip-channels', '同步遍历粒子的位置和速度']
    ] },
    { title: '帧内存、资源缓存与生命周期', tasks: [
      ['frame-arena', '回收帧内临时内存'],
      ['construct-slot', '在对象池槽位构造组件'],
      ['unique-ptr', '管理独占资源'],
      ['ptr-deleter', '为外部资源指定释放函数'],
      ['ptr-alias', '保留网格成员的生命周期'],
      ['ptr-cycle', '打破场景树父子的引用环'],
      ['cache-emplace', '首次访问时构造缓存项'],
      ['ptr-owner-order', '按所有权去重资源视图'],
      ['ptr-atomic-publish', '发布只读材质快照'],
      ['entity-hive', '在频繁增删时保持组件地址']
    ] },
    { title: '后台加载、并行任务与同步', tasks: [
      ['load-latch', '等待一批资源就绪'],
      ['phase-barrier', '在物理子步之间会合'],
      ['atomic-wait-ready', '等待资源状态改变'],
      ['job-semaphore', '限制同时进行的上传任务'],
      ['asset-once', '线程安全地初始化查找表'],
      ['registry-shared-lock', '并发读取资产注册表'],
      ['jthread', '请求后台线程停止'],
      ['call-packaged-task', '取得异步解码的结果']
    ] },
    { title: '输入事件、回调与命令分派', tasks: [
      ['lambda-weak-event', '让过期回调安全退出'],
      ['call-bind-front', '把成员函数交给队列'],
      ['lambda-move-task', '把独占缓冲移入延迟任务'],
      ['call-c-context', '给 C 回调传递实例状态'],
      ['call-subscription', '在事件广播中注销自己'],
      ['call-overloaded', '按渲染命令类型分派'],
      ['call-apply', '展开排队保存的分派参数'],
      ['call-templated', '给同步遍历传入处理函数']
    ] },
    { title: '帧诊断、配置与工具链', tasks: [
      ['format', '格式化调试信息'],
      ['steady-clock', '测量一段 CPU 帧耗时'],
      ['duration-cast', '换算计时单位'],
      ['source-location', '记录诊断的源文件位置'],
      ['pp-evaluation', '排查宏里的重复调用'],
      ['pp-assert', '检查发布构建的断言行为'],
      ['pp-odr', '排查插件与宿主的布局差异'],
      ['pp-x-list', '同步生成像素格式枚举和名称'],
      ['pp-feature', '检查工具链是否提供所需 API']
    ] }
  ],
  graphics: [
    { title: '向量、几何与数值误差', tasks: [
      ['gfx-dot-projection', '计算向量夹角'],
      ['gfx-cross-normal', '从三角形顶点求面法线'],
      ['gfx-safe-normalize', '安全处理零长度方向'],
      ['gfx-signed-angle', '判断带符号的旋转角'],
      ['gfx-closest-point-segment', '求点到线段的最近点'],
      ['gfx-plane-signed-distance', '判断点在平面的哪一侧'],
      ['gfx-float-tolerance', '比较两个浮点结果是否足够接近'],
      ['gfx-point-vector-homogeneous', '区分点和方向的齐次坐标']
    ] },
    { title: '空间变换、相机与动画', tasks: [
      ['gfx-matrix-composition', '检查 MVP 顺序'],
      ['gfx-trs-transform', '组合缩放、旋转和平移'],
      ['gfx-affine-inverse', '把世界坐标转回本地'],
      ['gfx-transform-hierarchy', '重设父节点并保持世界变换'],
      ['gfx-basis-handedness', '转换坐标轴与手性'],
      ['gfx-lookat-view', '构造观察目标的相机'],
      ['gfx-rodrigues-rotation', '绕任意轴旋转向量'],
      ['gfx-quaternion-slerp', '在两个旋转之间平滑过渡'],
      ['gfx-bezier-casteljau', '沿控制点生成曲线路径']
    ] },
    { title: '投影、光栅化与深度', tasks: [
      ['gfx-perspective-matrix', '从视场角构造透视投影'],
      ['gfx-orthographic-projection', '构造正交投影'],
      ['gfx-perspective-divide', '从裁剪坐标得到 NDC'],
      ['gfx-viewport-pixel-center', '定位视口中的像素中心'],
      ['gfx-barycentric', '插值三角形属性'],
      ['gfx-perspective-correct', '校正透视 UV'],
      ['gfx-depth-linearization', '从深度缓冲还原距离'],
      ['gfx-frustum-planes', '用视锥平面剔除包围球']
    ] },
    { title: '射线、碰撞与屏幕拾取', tasks: [
      ['gfx-unproject-screen', '从鼠标位置生成拾取射线'],
      ['gfx-ray-generation', '为相机像素生成光线'],
      ['gfx-ray-plane', '计算射线落在平面的位置'],
      ['gfx-ray-sphere', '检测射线与球体的交点'],
      ['gfx-moller-trumbore', '射线拾取三角形'],
      ['gfx-ray-aabb', '测试 BVH 包围盒']
    ] },
    { title: '材质、纹理与光照', tasks: [
      ['gfx-normal-matrix', '修正缩放后的法线'],
      ['gfx-orthonormal-basis', '从法线构建局部正交基'],
      ['gfx-tangent-normal-map', '处理法线贴图和镜像 UV'],
      ['gfx-reflect-direction', '计算镜面反射方向'],
      ['gfx-lambert-diffuse', '计算漫反射光照'],
      ['gfx-blinn-phong', '用半向量计算高光'],
      ['gfx-linear-srgb', '在线性空间与 sRGB 间转换'],
      ['gfx-bilinear-interpolation', '在四个纹素之间插值'],
      ['gfx-smoothstep', '平滑过渡遮罩边缘'],
      ['gfx-lerp-remap', '把数值映射到另一个区间']
    ] },
    { title: '随机采样与光线积分', tasks: [
      ['gfx-monte-carlo', '用随机样本估计光照积分'],
      ['gfx-uniform-disk', '在圆盘上均匀取样'],
      ['gfx-cosine-hemisphere', '生成路径追踪方向'],
      ['gfx-stratified-jitter', '对像素采样做分层抖动'],
      ['gfx-solid-angle-pdf', '把面积密度换算成立体角密度']
    ] }
  ],
  unreal: [
    ...gameplayCategories.map(({ id, title }) => ({
      title,
      tasks: gameplayApis.filter(api => api.category === id).map(api => [api.id, api.name])
    })),
    ...lyraCategories.map(({ id, title }) => ({
      title,
      tasks: lyraApis.filter(api => api.category === id).map(api => [api.id, api.name])
    })),
    { title: '工程模块、反射与蓝图', tasks: [
      ['ue-modules', '声明模块依赖'],
      ['ue-prefixes', '识别引擎类型前缀'],
      ['ue-class-macros', '声明反射类、结构体和枚举'],
      ['ue-generated-body', '接入生成的反射代码'],
      ['ue-uproperty', '标记蓝图属性'],
      ['ue-property-specifiers', '控制属性可编辑性'],
      ['ue-ufunction', '暴露可由蓝图调用的函数'],
      ['ue-blueprint-events', '让蓝图覆写原生行为']
    ] },
    { title: 'Actor、组件与对象寿命', tasks: [
      ['ue-object-actor-component', '选择 Actor 或组件作为基类'],
      ['ue-default-subobject', '在构造时创建默认组件'],
      ['ue-new-object', '运行时创建 UObject'],
      ['ue-spawn-actor', '在世界里生成 Actor'],
      ['ue-lifecycle', '选择初始化和清理时机'],
      ['ue-cast', '将对象转换为具体类型'],
      ['ue-isvalid', '检查对象是否仍然有效']
    ] },
    { title: '资产引用、加载与垃圾回收', tasks: [
      ['ue-tobject-ptr', '保存 UObject 引用'],
      ['ue-weak-object-ptr', '观察可能被销毁的对象'],
      ['ue-soft-object-ptr', '保存可延迟加载的资产引用'],
      ['ue-subclass-of', '限制可选择的类'],
      ['ue-garbage-collection', '让 GC 跟踪对象引用'],
      ['ue-shared-ptr', '管理普通 C++ 对象的所有权']
    ] },
    { title: 'Gameplay、工具与调试', tasks: [
      ['ue-dynamic-delegate', '广播 Gameplay 事件'],
      ['ue-native-delegate', '绑定原生回调'],
      ['ue-timers', '注册和清除定时器'],
      ['ue-interfaces', '通过接口调用 Gameplay 行为'],
      ['ue-math-types', '表示引擎中的位置和旋转'],
      ['ue-strings', '选择显示文本或标识名称'],
      ['ue-tarray', '遍历或修改动态数组'],
      ['ue-map-set', '建立查找表和去重集合'],
      ['ue-log', '输出引擎日志'],
      ['ue-asserts', '记录可恢复的运行时异常条件']
    ] }
  ],
  hlsl: [
    { title: '语言、数据类型与矩阵', tasks: [
      ['hlsl-cpp-control', '用熟悉的 C++ 写法入门'],
      ['hlsl-numeric-types', '为着色器选择数值精度'],
      ['hlsl-vectors-swizzle', '重排颜色和向量分量'],
      ['hlsl-matrix-mul', '把 MVP 矩阵传给着色器'],
      ['hlsl-function-params', '从辅助函数传回多个结果'],
      ['hlsl-struct-array', '组织结构体和定长数组']
    ] },
    { title: '着色阶段与插值', tasks: [
      ['hlsl-shader-stage', '确定入口阶段与编译目标'],
      ['hlsl-vertex-position', '把顶点位置交给光栅化器'],
      ['hlsl-interpolation', '禁止材质 ID 跨顶点插值'],
      ['hlsl-pixel-target', '输出像素颜色或深度']
    ] },
    { title: '资源布局与纹理采样', tasks: [
      ['hlsl-register', '确认槽号和资源绑定'],
      ['hlsl-cbuffer', '把 CPU 参数传给着色器'],
      ['hlsl-structured-buffer', '按结构读取实例缓冲'],
      ['hlsl-texture-sample', '按 UV 读取纹理颜色'],
      ['hlsl-texture-load', '精确读取指定纹素'],
      ['hlsl-derivatives', '估计屏幕空间的变化率'],
      ['hlsl-intrinsics', '在着色器中做限幅和插值']
    ] },
    { title: '计算着色器与线程协作', tasks: [
      ['hlsl-dispatch', '让每个线程处理一个元素'],
      ['hlsl-rwtexture', '从计算着色器写入图像'],
      ['hlsl-group-shared', '在线程组内共享数据并同步'],
      ['hlsl-interlocked-add', '让多个线程安全累加计数']
    ] }
  ]
};
