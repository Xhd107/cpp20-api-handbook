export const graphicsCategories = [
  { id: 'gfx-vector', domain: 'graphics', title: '图形学：向量与几何基础', description: '点与方向、点积、叉积、归一化和局部坐标基，是理解后续变换与着色的前提。' },
  { id: 'gfx-matrix', domain: 'graphics', title: '图形学：矩阵与空间变换', description: '统一列向量约定，整理 TRS、任意轴旋转、法线变换、相机和四元数。' },
  { id: 'gfx-projection', domain: 'graphics', title: '图形学：投影与插值', description: '从观察空间到裁剪空间、NDC 和像素坐标，并处理透视下的属性插值。' },
  { id: 'gfx-intersection', domain: 'graphics', title: '图形学：射线与相交测试', description: '覆盖拾取、光线追踪和 BVH 常用的平面、球、三角形及 AABB 求交。' },
  { id: 'gfx-shading', domain: 'graphics', title: '图形学：着色与曲线', description: '用向量公式理解 Lambert、Blinn-Phong、线性色彩和 Bézier 曲线。' },
  { id: 'gfx-sampling', domain: 'graphics', title: '图形学：采样与蒙特卡洛', description: '概率密度、圆盘与半球采样、分层采样，以及路径追踪积分的数值基础。' }
];

export const graphicsApis = [
  {
    id: 'gfx-point-vector-homogeneous', category: 'gfx-vector', name: '点、方向与齐次坐标', header: '数学基础 · 仿射变换', since: 'GAMES101 · 变换', level: 'A',
    brief: '用第四个分量区分位置和方向，让平移、旋转、缩放能统一写成一个 4×4 矩阵。',
    returns: 'w = 1 的点会被平移；w = 0 的方向只受线性部分影响，不会因物体移动而改变。',
    pitfall: '点与方向不能混用 w。齐次坐标相等还允许非零整体缩放；当 w 不为 1 时，恢复笛卡尔坐标要除以 w。',
    code: `// 列向量约定，T 表示平移
Vec4 pointA{1, 2, 3, 1};
Vec4 pointB{4, 2, 3, 1};
Vec4 direction = pointB - pointA; // (3, 0, 0, 0)

Vec4 movedPoint = T * pointA;     // 位置改变
Vec4 movedDir   = T * direction;  // 方向不变`,
    keywords: '图形学 数学 点 位置 向量 方向 齐次坐标 w 仿射 平移 homogeneous point vector'
  },
  {
    id: 'gfx-dot-projection', category: 'gfx-vector', name: '点积、夹角与投影', header: '数学基础 · 向量', since: 'GAMES101 · 线性代数', level: 'A',
    brief: '点积把两个向量变成一个标量，常用于光照余弦、前后关系、距离平面和向量投影。',
    returns: '返回标量。两向量都为单位向量时，结果直接是夹角余弦；正、零、负分别对应锐角、垂直、钝角。',
    pitfall: '未归一化就直接 acos(dot) 会得到错误角度。浮点误差还可能让点积略超出 [-1, 1]，调用 acos 前应夹紧。',
    code: `float cosine = dot(normalize(a), normalize(b));
cosine = clamp(cosine, -1.0f, 1.0f);
float angle = acos(cosine); // 弧度

Vec3 projected = b * (dot(a, b) / dot(b, b)); // b 非零`,
    keywords: '图形学 数学 点积 数量积 内积 夹角 余弦 投影 dot acos Lambert'
  },
  {
    id: 'gfx-cross-normal', category: 'gfx-vector', name: '叉积、法线与有向面积', header: '数学基础 · 向量', since: 'GAMES101 · 线性代数', level: 'A',
    brief: '三维叉积生成同时垂直于两个输入的向量，其长度是平行四边形面积，也可用于三角形内外判定。',
    returns: '返回三维向量。方向由坐标系手性和操作数顺序决定；二维行列式 cross2 返回有符号面积的两倍。',
    pitfall: '叉积不满足交换律：a×b = −(b×a)。退化三角形的叉积接近零，不能安全归一化；背面剔除必须先统一顶点绕序。',
    code: `Vec3 normal = normalize(cross(B - A, C - A));
float area = 0.5f * length(cross(B - A, C - A));

// 2D：判断 P 相对有向边 A→B 位于哪一侧
float side = cross2(B - A, P - A);`,
    keywords: '图形学 数学 叉积 叉乘 外积 法线 面积 左右 三角形 环绕 绕序 cross normal winding'
  },
  {
    id: 'gfx-safe-normalize', category: 'gfx-vector', name: '安全归一化与零向量', header: '数学基础 · 数值稳定性', since: '通用计算约定', level: 'A',
    brief: '归一化把方向缩放到单位长度，是点积、光照、射线和基构建前最常见的准备步骤。',
    returns: '返回长度为 1、方向不变的向量；零长度或接近零长度时必须按业务约定返回失败或备用方向。',
    pitfall: '直接除零会产生 NaN，并污染后续所有矩阵、光照和求交结果。ε 应与数据尺度匹配，不能在所有场景机械套用同一个值。',
    code: `bool tryNormalize(Vec3 v, float eps, Vec3& out) {
    float len2 = dot(v, v);
    if (len2 <= eps * eps) return false;
    out = v / sqrt(len2);
    return true;
}`,
    keywords: '图形学 数学 归一化 单位向量 零向量 NaN epsilon 数值稳定 normalize length'
  },
  {
    id: 'gfx-orthonormal-basis', category: 'gfx-vector', name: '从法线构建正交基 / TBN', header: '数学基础 · 坐标系', since: '虎书 · 数学基础', level: 'B',
    brief: '从一个单位方向构造另外两个互相垂直的单位向量，用于切线空间、相机和半球采样。',
    returns: '返回一组局部正交基。把局部向量 (x,y,z) 转到世界空间时使用 x*vx + y*vy + z*vz。',
    pitfall: '辅助向量与主轴接近平行时叉积会不稳定。只给法线无法唯一确定绕法线旋转；法线贴图还要求 TBN 与 UV 导数和手性一致。',
    code: `Vec3 z = normalize(normal);
Vec3 h = abs(z.z) < 0.999f ? Vec3{0,0,1} : Vec3{0,1,0};
Vec3 x = normalize(cross(h, z));
Vec3 y = cross(z, x);
Vec3 world = x*local.x + y*local.y + z*local.z;`,
    keywords: '图形学 数学 正交基 标准正交 TBN 切线空间 法线贴图 局部坐标 世界坐标 basis tangent bitangent'
  },
  {
    id: 'gfx-matrix-composition', category: 'gfx-matrix', name: '矩阵复合、列向量与 MVP', header: '线性代数 · 变换约定', since: 'GAMES101 · 变换', level: 'A',
    brief: '把模型、视图、投影串成一条变换链；先确认向量约定，再判断矩阵乘法顺序。',
    returns: '返回同一坐标点在新空间中的表示。矩阵乘法可结合，但通常不可交换。',
    pitfall: '行向量通常写成 p′ = pM，顺序与矩阵转置规则不同。内存的行主序/列主序是存储问题，不等于数学上的行向量/列向量约定。',
    codeLanguage: 'hlsl',
    code: `float4 ToClip(float3 localPosition, float4x4 model,
              float4x4 view, float4x4 projection) {
    float4 worldPosition = mul(model, float4(localPosition, 1.0));
    float4 viewPosition = mul(view, worldPosition);
    return mul(projection, viewPosition); // 齐次裁剪坐标
}`,
    keywords: '图形学 数学 矩阵 复合 MVP 列向量 行向量 列主序 行主序 变换顺序 matrix multiplication'
  },
  {
    id: 'gfx-trs-transform', category: 'gfx-matrix', name: '平移、旋转、缩放（TRS）', header: '线性代数 · 仿射矩阵', since: 'GAMES101 · 变换', level: 'A',
    brief: 'TRS 是节点本地变换的常见分解；列向量下 M = T R S 表示先缩放、再旋转、最后平移。',
    returns: '返回新的点或方向。旋转和均匀缩放保持形状；非均匀缩放会改变角度与长度。',
    pitfall: '旋转默认绕原点，不是绕物体中心；绕中心 c 旋转应使用 T(c) R T(−c)。三角函数使用弧度，欧拉角还需约定轴序。',
    code: `float c = cos(angle), s = sin(angle);
Mat4 Rz = {{{c,-s,0,0}, {s,c,0,0}, {0,0,1,0}, {0,0,0,1}}};
Mat4 M = translation * Rz * scaling;

Mat4 aroundCenter = T(center) * Rz * T(-center);`,
    keywords: '图形学 数学 TRS 平移 旋转 缩放 欧拉角 弧度 角度 原点 绕中心 rotation scale translation'
  },
  {
    id: 'gfx-rodrigues-rotation', category: 'gfx-matrix', name: '任意轴旋转 / Rodrigues 公式', header: '线性代数 · 轴角旋转', since: 'GAMES101 · 三维变换', level: 'B',
    brief: '不拆欧拉角，直接把向量 v 绕单位轴 k 旋转 θ，是处理任意旋转轴的紧凑公式。',
    returns: '返回旋转后的向量，长度保持不变；当 k 与 v 平行时，v 不变。',
    pitfall: 'k 忘记归一化会使结果不再是纯旋转。右手坐标系与左手坐标系的正方向观感不同，接入引擎时要用简单轴向案例验证。',
    codeLanguage: 'hlsl',
    code: `// unitAxis 已归一化，theta 的单位是弧度。
float3 RotateAxisAngle(float3 v, float3 unitAxis, float theta) {
    float s, c;
    sincos(theta, s, c);
    return v * c + cross(unitAxis, v) * s
         + unitAxis * dot(unitAxis, v) * (1.0 - c);
}`,
    keywords: '图形学 数学 罗德里格斯 罗德里格 Rodrigues 任意轴 旋转 轴角 向量 axis angle'
  },
  {
    id: 'gfx-normal-matrix', category: 'gfx-matrix', name: '法线矩阵 / 逆转置', header: '线性代数 · 法线变换', since: '虎书 · 变换矩阵', level: 'A',
    brief: '非均匀缩放或剪切时，法线不能直接用模型的线性部分变换，必须使用逆转置保持与切线垂直。',
    returns: '返回变换后的单位法线方向；平移不参与。若 L 是正交矩阵，则逆转置就是 L 本身。',
    pitfall: '奇异矩阵不能求逆。非均匀缩放后即使数值方向正确，也必须重新归一化；行列向量约定和着色器矩阵布局会影响 API 写法。',
    code: `Mat3 L = Mat3(modelMatrix);
Mat3 normalMatrix = transpose(inverse(L));
Vec3 worldNormal = normalize(normalMatrix * localNormal);

// 验证：变换后仍满足 dot(worldNormal, worldTangent) ≈ 0`,
    keywords: '图形学 数学 法线矩阵 逆转置 非均匀缩放 切线 法线 normal matrix inverse transpose'
  },
  {
    id: 'gfx-lookat-view', category: 'gfx-matrix', name: 'LookAt 相机视图矩阵', header: '坐标变换 · 相机', since: 'GAMES101 · 视图', level: 'A',
    brief: '用相机位置、目标和参考上方向建立相机坐标系，再把世界坐标转换为观察坐标。',
    returns: '返回世界空间到观察空间的刚体变换；观察空间中相机位于原点，并朝 −Z 看。',
    pitfall: 'upReference 与视线共线时无法构建基。不同 API 可能看向 +Z、采用左手系或返回相机到世界矩阵，不能直接互换。',
    code: `Vec3 p = worldPoint - eye;
Vec3 viewPoint {
    dot(r, p),
    dot(u, p),
    dot(-f, p)
};
// 等价于把上式写成 V * Vec4{worldPoint, 1}`,
    keywords: '图形学 数学 LookAt 相机 视图矩阵 观察空间 eye target up forward right 右手'
  },
  {
    id: 'gfx-quaternion-slerp', category: 'gfx-matrix', name: '四元数旋转与 Slerp', header: '旋转表示 · 单位四元数', since: 'RTR4 · Transform', level: 'B',
    brief: '单位四元数用四个数表示三维旋转，适合旋转复合与平滑插值，避免直接插值欧拉角。',
    returns: '返回新的旋转或插值旋转。q 与 −q 表示同一个空间旋转，但插值路径可能不同。',
    pitfall: '用于旋转前应单位化。若 dot(q0,q1)<0，通常先翻转一个四元数以走短弧；两旋转非常接近时用归一化 Lerp，避免 sinΩ 接近零。',
    code: `float d = dot(q0, q1);
if (d < 0) { q1 = -q1; d = -d; }
if (d > 0.9995f) q = normalize(lerp(q0, q1, t));
else {
    float omega = acos(clamp(d, -1.0f, 1.0f));
    q = (sin((1-t)*omega)*q0 + sin(t*omega)*q1) / sin(omega);
}`,
    keywords: '图形学 数学 四元数 quaternion Slerp 球面插值 旋转 欧拉角 万向锁 短弧 nlerp'
  },
  {
    id: 'gfx-orthographic-projection', category: 'gfx-projection', name: '正交投影与区间映射', header: '投影 · 观察体到 NDC', since: 'GAMES101 · 投影', level: 'A',
    brief: '正交投影把长方体观察范围线性映射到标准设备坐标，不会像透视投影那样近大远小。',
    returns: '返回 NDC 坐标。x、y 可见范围通常是 [-1,1]；OpenGL 传统 z 范围为 [-1,1]，D3D/Vulkan 常为 [0,1]。',
    pitfall: 'l、r、b、t、n、f 是坐标还是正距离必须先约定。r=l、t=b 或深度范围为零会产生除零；不要照搬其他 API 的 z 行。',
    code: `float map01(float x, float lo, float hi) {
    return (x - lo) / (hi - lo);
}
float xNdc = 2*map01(x,l,r) - 1;
float yNdc = 2*map01(y,b,t) - 1;
float z01  = map01(viewDepth,near,far); // 0..1 深度示例`,
    keywords: '图形学 数学 正交投影 orthographic NDC 区间映射 近平面 远平面 深度范围'
  },
  {
    id: 'gfx-perspective-matrix', category: 'gfx-projection', name: '透视投影矩阵', header: '投影 · 对称视锥', since: 'GAMES101 · 投影', level: 'A',
    brief: '透视投影把视锥映射为裁剪坐标，并通过 w = −z 在后续透视除法中形成近大远小。',
    returns: '返回投影矩阵；变换后仍需除以 w 才得到 NDC。fovy 是垂直视场角，必须使用弧度。',
    pitfall: '这条矩阵只对应上述约定。D3D/Vulkan 的 0..1 深度、反向 Z、非对称视锥或不同手性都要调整；near 必须大于 0。',
    code: `float f = 1 / tan(fovyRadians / 2);
// 用轴上点检查：view=(0,0,-near,1) 应映射到近裁剪面
// view=(0,0,-far,1)  应映射到远裁剪面
Mat4 P = makePerspective(f, aspect, near, far);
Vec4 clip = P * Vec4{viewPoint, 1};`,
    keywords: '图形学 数学 透视投影 perspective matrix fov aspect near far 视锥 投影矩阵 右手 OpenGL'
  },
  {
    id: 'gfx-perspective-divide', category: 'gfx-projection', name: '透视除法与 NDC', header: '投影 · 裁剪坐标', since: '虎书 · 视图', level: 'A',
    brief: '投影矩阵输出的是齐次裁剪坐标，不是最终屏幕坐标；除以 w 后才进入标准设备坐标。',
    returns: '返回三维 NDC 点。可见点还需满足裁剪范围；在常见右手透视矩阵中，相机前方点的 w 为正。',
    pitfall: 'w 接近零时不能除。裁剪应发生在透视除法之前；把所有顶点先除 w 再做完整裁剪可能丢失跨近平面三角形的正确拓扑。',
    code: `Vec4 clip = projection * view * world;
if (abs(clip.w) > epsilon) {
    Vec3 ndc = Vec3{clip.x, clip.y, clip.z} / clip.w;
}
// 实际 GPU 管线会在裁剪后执行这一步`,
    keywords: '图形学 数学 透视除法 NDC 裁剪坐标 w divide clip space normalized device coordinates'
  },
  {
    id: 'gfx-viewport-pixel-center', category: 'gfx-projection', name: '视口映射与像素中心', header: '投影 · NDC 到屏幕', since: '虎书 · 视图与光栅图像', level: 'A',
    brief: '把 NDC 的 [-1,1] 区间映射到目标分辨率，并用半像素偏移得到像素中心。',
    returns: '返回连续屏幕坐标；像素索引仍是整数。这里 sy_top 假设屏幕 y 向下，NDC y 向上。',
    pitfall: '把像素中心当整数坐标会造成半像素偏移。窗口原点、DPI、Y 轴方向和视口尺寸都可能改变公式，不能只看最终画布分辨率。',
    code: `float sx = (ndc.x + 1) * 0.5f * viewportWidth;
float sy = (1 - ndc.y) * 0.5f * viewportHeight;

Vec2 pixelCenter {i + 0.5f, j + 0.5f};
Vec2 uv = pixelCenter / Vec2{imageWidth, imageHeight};`,
    keywords: '图形学 数学 视口 viewport 像素中心 半像素 NDC 屏幕坐标 UV DPI Y 翻转'
  },
  {
    id: 'gfx-barycentric', category: 'gfx-projection', name: '重心坐标与三角形插值', header: '几何 · 三角形参数化', since: 'GAMES101 · 着色插值', level: 'A',
    brief: '用三个权重表示三角形内的点，可插值深度、颜色、法线和 UV，也可判断点是否落在三角形内。',
    returns: '返回三个权重。顶点、边和内部都允许相应权重为零；三角形外至少一个权重为负。',
    pitfall: '退化三角形的有向面积接近零，无法稳定求权重。透视投影后，屏幕空间重心坐标不能直接线性插值世界空间属性。',
    code: `Vec3 v0=B-A, v1=C-A, v2=P-A;
float d00=dot(v0,v0), d01=dot(v0,v1), d11=dot(v1,v1);
float d20=dot(v2,v0), d21=dot(v2,v1);
float den=d00*d11-d01*d01;
float beta=(d11*d20-d01*d21)/den;
float gamma=(d00*d21-d01*d20)/den;
float alpha=1-beta-gamma;`,
    keywords: '图形学 数学 重心坐标 barycentric 三角形 内部 插值 颜色 法线 UV 面积'
  },
  {
    id: 'gfx-perspective-correct', category: 'gfx-projection', name: '透视校正插值', header: '光栅化 · 顶点属性', since: 'GAMES101 · 作业 2/3', level: 'A',
    brief: '要用屏幕空间重心权重插值纹理坐标、法线等顶点属性，需要以裁剪 w 的倒数修正。',
    returns: '返回透视校正后的顶点属性。它等价于先恢复三角形在原三维空间中的插值位置，再计算属性。',
    pitfall: 'wi 必须使用对应的裁剪空间 w，不能随手换成已经非线性映射的 NDC 深度。插值后的法线还要重新归一化。',
    code: `float invW = alpha/w0 + beta/w1 + gamma/w2;
Vec2 uv = (alpha*uv0/w0 + beta*uv1/w1 + gamma*uv2/w2) / invW;
Vec3 n  = (alpha*n0/w0 + beta*n1/w1 + gamma*n2/w2) / invW;
n = normalize(n);`,
    keywords: '图形学 数学 透视校正 透视矫正 插值 UV 法线 重心坐标 裁剪 w perspective correct'
  },
  {
    id: 'gfx-ray-generation', category: 'gfx-intersection', name: '射线方程与像素光线生成', header: '几何 · 参数直线', since: '虎书 · 光线追踪', level: 'A',
    brief: '射线由起点和方向组成；透视相机为每个像素生成不同方向，正交相机则共用方向。',
    returns: '返回射线上的点或一条像素射线。D 是否单位化决定 t 的单位：单位方向时 t 就是空间距离。',
    pitfall: '像素应采样在中心或指定抖动位置，不是整数角点。视线基向量、宽高比和 Y 方向必须保持一致。',
    code: `float scale = tan(fovy/2);
float u = (2*(x+0.5)/width - 1) * aspect * scale;
float v = (1 - 2*(y+0.5)/height) * scale;
Ray ray{eye, normalize(forward + u*right + v*up)};
Vec3 hitPoint = ray.O + hitT * ray.D;`,
    keywords: '图形学 数学 射线 光线 ray 像素 相机 光线追踪 拾取 参数方程 fov'
  },
  {
    id: 'gfx-ray-plane', category: 'gfx-intersection', name: '射线与平面求交', header: '相交测试 · 平面', since: '几何求交基础', level: 'A',
    brief: '把射线方程代入平面方程，一次除法即可求出交点参数。',
    returns: '返回参数 t；分母非零且 t 位于指定区间内才接受，交点为 O + tD。',
    pitfall: 'dot(D,N) 接近零表示平行或射线位于平面内，不能按普通唯一交点处理。N 未单位化时 t 的含义仍正确，但法线夹角计算会受影响。',
    code: `float den = dot(ray.D, plane.N);
if (abs(den) > epsilon) {
    float t = dot(plane.P0 - ray.O, plane.N) / den;
    if (t >= tMin && t <= tMax) hit = {t, ray.O + t*ray.D};
}`,
    keywords: '图形学 数学 射线 平面 求交 ray plane intersection 点法式 平行 epsilon'
  },
  {
    id: 'gfx-ray-sphere', category: 'gfx-intersection', name: '射线与球求交', header: '相交测试 · 隐式曲面', since: '虎书 · 光线追踪', level: 'A',
    brief: '将射线代入球面隐式方程得到二次方程，用判别式判断未命中、相切或两次相交。',
    returns: '返回零、一个或两个 t。选择位于有效区间内的最小正根，球面单位法线为 normalize(hitPoint − C)。',
    pitfall: '较小的根为负时，较大根仍可能有效，例如起点在球内。Δ 接近零要按浮点容差处理；不要默认 D 已归一化而强行令 a=1。',
    code: `Vec3 oc=ray.O-center;
float a=dot(ray.D,ray.D);
float halfB=dot(oc,ray.D);
float c=dot(oc,oc)-radius*radius;
float disc=halfB*halfB-a*c;
if (disc >= 0) {
    float t=(-halfB-sqrt(disc))/a;
    // 若 t 不在区间，再试 (-halfB+sqrt(disc))/a
}`,
    keywords: '图形学 数学 射线 球 求交 二次方程 判别式 ray sphere intersection 法线'
  },
  {
    id: 'gfx-moller-trumbore', category: 'gfx-intersection', name: '射线与三角形 / Möller–Trumbore', header: '相交测试 · 重心坐标', since: '虎书 · 光线追踪', level: 'A',
    brief: '不解平面再测内外，直接联立射线与三角形重心坐标，一次得到 t、u、v。',
    returns: '返回光线参数 t 和重心权重；三个顶点权重为 (1−u−v, u, v)。',
    pitfall: 'det 接近零表示平行或退化。若 det<0 就返回会执行背面剔除；需要双面相交时应对 det 的绝对值做容差，而不是误删负行列式。',
    code: `Vec3 p=cross(D,E2); float det=dot(E1,p);
if (abs(det)<eps) return false;
float inv=1/det; Vec3 T=O-V0;
float u=dot(T,p)*inv; if (u<0||u>1) return false;
Vec3 q=cross(T,E1);
float v=dot(D,q)*inv; if (v<0||u+v>1) return false;
float t=dot(E2,q)*inv;
return t>=tMin && t<=tMax;`,
    keywords: '图形学 数学 Moller Trumbore 射线 三角形 求交 重心坐标 背面剔除 det 拾取'
  },
  {
    id: 'gfx-ray-aabb', category: 'gfx-intersection', name: '射线与 AABB / Slab 法', header: '相交测试 · 包围盒', since: 'RTR4 · Intersection', level: 'A',
    brief: '分别计算射线进入和离开三组轴对齐平板的时间，再取所有进入值的最大值和离开值的最小值。',
    returns: '返回进入和离开包围盒的参数区间，是 BVH 遍历时快速排除节点的核心测试。',
    pitfall: '方向分量为零时不能直接套普通除法：若原点在该轴区间外必不命中，在区间内则该轴不限制 t。还要处理射线起点已在盒内的情况。',
    code: `float tNear = tMin;
float tFar = tMax;
for (int axis = 0; axis < 3; ++axis) {
    if (D[axis] == 0.0f) {
        if (O[axis] < boxMin[axis] || O[axis] > boxMax[axis]) return false;
        continue;
    }
    float t1 = (boxMin[axis] - O[axis]) / D[axis];
    float t2 = (boxMax[axis] - O[axis]) / D[axis];
    if (t1 > t2) std::swap(t1, t2);
    tNear = std::max(tNear, t1);
    tFar = std::min(tFar, t2);
    if (tNear > tFar) return false;
}
return true;`,
    keywords: '图形学 数学 AABB slab 射线 包围盒 求交 BVH 加速结构 tNear tFar'
  },
  {
    id: 'gfx-lambert-diffuse', category: 'gfx-shading', name: 'Lambert 余弦与漫反射', header: '着色 · 理想漫反射', since: '虎书 · 表面着色', level: 'A',
    brief: '表面接收的光与入射角余弦成正比；理想漫反射再把能量均匀反射到半球各方向。',
    returns: '返回漫反射光照贡献。N、L 均为从表面指向外部的单位向量，L 指向光源。',
    pitfall: 'dot 为负表示光在背面，应夹到零。π 是否显式出现取决于光照单位和引擎归一化约定，不能把不同教程的强度参数直接混用。',
    code: `Vec3 N=normalize(normal), L=normalize(lightPos-P);
float r2=dot(lightPos-P,lightPos-P);
float ndotl=max(0.0f,dot(N,L));
Vec3 Lo=albedo/PI * lightIntensity/r2 * ndotl;`,
    keywords: '图形学 数学 Lambert 朗伯 漫反射 余弦 BRDF 光照 法线 光线方向 距离平方'
  },
  {
    id: 'gfx-blinn-phong', category: 'gfx-shading', name: 'Blinn–Phong 半向量高光', header: '着色 · 经验高光模型', since: 'GAMES101 · 着色', level: 'A',
    brief: '用灯光方向与观察方向的半向量和法线夹角估计高光，是经典经验着色模型。',
    returns: '返回高光权重；p 越大，高光越集中。常与 Lambert 漫反射项相加。',
    pitfall: 'L 或 V 方向写反会把 H 算错；L+V 接近零向量时不能归一化。Blinn–Phong 是经验高光模型。',
    codeLanguage: 'hlsl',
    code: `// N、L、V 为单位向量，shininess > 0。
float BlinnSpecular(float3 N, float3 L, float3 V, float shininess) {
    float3 halfVector = L + V;
    float lengthSquared = dot(halfVector, halfVector);
    if (dot(N, L) <= 0.0 || lengthSquared <= 1e-8) return 0.0;
    float3 H = halfVector * rsqrt(lengthSquared);
    return pow(saturate(dot(N, H)), shininess);
}`,
    keywords: '图形学 数学 Blinn Phong 半向量 高光 法线 观察方向 光照 half vector specular'
  },
  {
    id: 'gfx-linear-srgb', category: 'gfx-shading', name: '线性空间与 sRGB 转换', header: '颜色 · 传递函数', since: 'RTR4 · Light and Color', level: 'A',
    brief: '光照、混合和多数物理计算应在线性值上进行；sRGB 编码主要用于存储、显示和纹理输入解释。',
    returns: '返回另一颜色空间中的同通道数值；RGB 三通道分别转换，alpha 通常保持线性。',
    pitfall: '2.2 次幂只是近似，不是完整 sRGB 曲线。法线、粗糙度、金属度等数据纹理不应按 sRGB 颜色纹理解码。',
    code: `float srgbToLinear(float c) {
    return c<=0.04045f ? c/12.92f
        : pow((c+0.055f)/1.055f,2.4f);
}
float linearToSrgb(float c) {
    return c<=0.0031308f ? 12.92f*c
        : 1.055f*pow(c,1.0f/2.4f)-0.055f;
}`,
    keywords: '图形学 数学 线性空间 sRGB Gamma 伽马 颜色 纹理 解码 编码 linear color'
  },
  {
    id: 'gfx-bezier-casteljau', category: 'gfx-shading', name: 'Bézier 曲线 / de Casteljau', header: '几何 · 参数曲线', since: 'GAMES101 · 曲线与曲面', level: 'B',
    brief: 'de Casteljau 算法反复线性插值控制点，既能求 Bézier 曲线上的点，也能用于曲线细分。',
    returns: '返回参数 u 对应的曲线点。曲线经过首末控制点，中间控制点影响形状但通常不在曲线上。',
    pitfall: '参数 u 等间隔不代表弧长等间隔。拼接曲线时，共享端点只保证 C0；切线连续还需控制点满足相应方向和长度关系。',
    code: `// points 非空，lerp 是数学库提供的向量插值。
Vec3 deCasteljau(std::vector<Vec3> points, float u) {
    while (points.size()>1) {
        std::vector<Vec3> next;
        for (std::size_t i=0;i+1<points.size();++i)
            next.push_back(lerp(points[i],points[i+1],u));
        points=std::move(next);
    }
    return points[0];
}`,
    keywords: '图形学 数学 贝塞尔 Bézier de Casteljau 曲线 控制点 伯恩斯坦 插值 细分'
  },
  {
    id: 'gfx-monte-carlo', category: 'gfx-sampling', name: '蒙特卡洛积分与概率密度', header: '采样 · 数值积分', since: 'GAMES101 · 路径追踪', level: 'A',
    brief: '用随机样本估计难以解析求解的积分，是路径追踪和全局光照的数学基础。',
    returns: '返回积分的随机估计值。满足无偏条件时期望等于真实积分；误差通常按 1/√N 缩小。',
    pitfall: '在 f(x) 非零且需要采样的位置令 p(x)=0 会遗漏贡献。面积密度与立体角密度不能直接混用；样本数翻倍不会让误差减半。',
    code: `float estimate=0;
for (int i=0;i<N;++i) {
    Sample s=sampleDistribution(rng); // 同时返回 x 和 pdf
    if (s.pdf>0) estimate += f(s.x)/s.pdf;
}
estimate/=N;
// 要让误差约减半，通常需要约 4 倍样本`,
    keywords: '图形学 数学 蒙特卡洛 Monte Carlo 积分 概率密度 PDF 无偏 方差 重要性采样 路径追踪'
  },
  {
    id: 'gfx-uniform-disk', category: 'gfx-sampling', name: '圆盘均匀采样', header: '采样 · 逆变换法', since: '虎书 · 采样', level: 'A',
    brief: '两个均匀随机数不能直接作为半径和角度；半径必须开平方，才能避免样本挤向圆心。',
    returns: '返回半径 R 圆盘上面积均匀分布的样本。面积元为 r·dr·dθ，因此半径密度与 r 成正比。',
    pitfall: '令 r=Rξ1 会使圆心附近过密。这个公式针对面积均匀，不等同于圆盘上的方向均匀或其他测度。',
    code: `float r=R*sqrt(random01());
float theta=2*PI*random01();
Vec2 p{r*cos(theta),r*sin(theta)};

// 错误：float r=R*random01(); 会向圆心聚集`,
    keywords: '图形学 数学 圆盘 均匀采样 逆变换 面积元 随机数 镜头 采样 disk sampling'
  },
  {
    id: 'gfx-cosine-hemisphere', category: 'gfx-sampling', name: '余弦加权半球采样', header: '采样 · 立体角测度', since: 'GAMES101 · 路径追踪', level: 'A',
    brief: '按 cosθ/π 的立体角密度采样法线半球，可与 Lambert BRDF 和余弦因子配合降低方差。',
    returns: '返回局部 z 轴周围的单位方向和对应立体角 PDF；世界方向需通过法线正交基变换。',
    pitfall: '均匀半球采样的 PDF 是 1/(2π)，与余弦加权不同。返回方向后还要把 local.z 对齐表面法线，不能直接把局部向量当世界向量。',
    code: `float r=sqrt(xi1), phi=2*PI*xi2;
Vec3 local{r*cos(phi),r*sin(phi),sqrt(1-xi1)};
float pdf=local.z/PI;
Vec3 world = tangent*local.x + bitangent*local.y
           + normal*local.z;`,
    keywords: '图形学 数学 余弦加权 半球采样 cosine hemisphere PDF 立体角 Lambert 路径追踪'
  },
  {
    id: 'gfx-stratified-jitter', category: 'gfx-sampling', name: '分层采样与像素抖动', header: '采样 · 降低方差', since: '虎书 · 采样', level: 'B',
    brief: '把定义域划成若干层，每层放置样本，避免纯随机采样在某些区域过度聚集。',
    returns: '返回覆盖各层的样本集合。用于像素时，样本位置仍需映射到该像素或子像素区域。',
    pitfall: '每层一个样本不等于各层贡献权重可随意修改；估计积分时仍要匹配采样 PDF 或层权重。低差异序列也不等于随机独立样本。',
    code: `for (int y=0;y<n;++y)
for (int x=0;x<m;++x) {
    Vec2 jitter{random01(),random01()};
    Vec2 p = pixelOrigin + (Vec2{float(x), float(y)} + jitter)
                         / Vec2{float(m), float(n)};
    samples.push_back(p);
}`,
    keywords: '图形学 数学 分层采样 像素 抖动 jitter stratified 抗锯齿 方差 低差异'
  }
];
