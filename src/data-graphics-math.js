export const graphicsMathCategory = {
  id: 'gfx-scalar',
  domain: 'graphics',
  title: '图形学：标量、插值与数值误差',
  description: '在区间间换算参数、做平滑过渡，以及判断浮点结果是否足够接近。'
};

const mathEntry = (entry) => ({
  header: '数学基础',
  since: '通用数学',
  level: 'A',
  ...entry
});

export const graphicsMathApis = [
  mathEntry({
    id: 'gfx-lerp-remap', category: 'gfx-scalar', name: '线性插值、逆插值与区间映射',
    header: 'C++20：std::lerp（<cmath>） · HLSL：lerp',
    brief: '想把血条比例映射到像素宽度，或把一个数从旧区间映射到新区间，先求比例，再做插值。',
    returns: '插值返回目标区间的值，逆插值返回无量纲的比例。',
    pitfall: 't 超出 [0,1] 时会外推，需要限制范围就显式 clamp。旧区间长度为零时，应由业务决定返回默认值还是报告错误。',
    code: `// 把 [20,80] 上的 35 映射到 [0,320]
float t = (35.0f - 20.0f) / (80.0f - 20.0f); // 0.25
float width = std::lerp(0.0f, 320.0f, t);     // 80`,
    keywords: 'lerp inverse lerp remap map range 插值 反插值 归一化 区间转换 进度条 比例'
  }),
  mathEntry({
    id: 'gfx-smoothstep', category: 'gfx-scalar', name: 'Smoothstep 平滑过渡',
    header: 'HLSL / GLSL：smoothstep',
    codeLanguage: 'hlsl',
    brief: '想让遮罩边缘渐变，或让一个值平滑地从 0 过渡到 1，用三次 smoothstep。',
    returns: '返回 [0,1] 的权重。两端的斜率都为零，可以接到两侧的常量段。',
    pitfall: '反向渐变用 1−smoothstep(edge0,edge1,x)。做屏幕边缘抗锯齿时，过渡宽度还要与像素覆盖范围匹配。',
    code: `// edge0 < edge1
float alpha = smoothstep(edge0, edge1, x);
// 在区间四分之一处，alpha 为 0.15625。`,
    keywords: 'smoothstep Hermite 平滑插值 缓入缓出 遮罩 羽化 渐变 阈值 抗锯齿'
  }),
  mathEntry({
    id: 'gfx-float-tolerance', category: 'gfx-scalar', name: '浮点近似比较：绝对与相对容差',
    header: 'C++：std::abs / std::isfinite / std::max',
    brief: '想比较计算出的坐标或误差，给接近零和数值较大的情况分别设容差。',
    returns: '返回两个值在给定精度下是否足够接近。绝对容差与被比较量单位相同，相对容差无量纲。',
    pitfall: '根据业务单位和误差来源定容差，例如米与米²需要不同阈值。机器 epsilon 描述 1 附近的浮点间距。近似相等不具备传递性，不能当排序或哈希的等价规则。',
    code: `bool nearlyEqual(double a, double b, double absTol, double relTol) {
    if (a == b) return true; // 包含同号无穷大
    if (!std::isfinite(a) || !std::isfinite(b)) return false;
    double limit = std::max(absTol, relTol * std::max(std::abs(a), std::abs(b)));
    return std::abs(a - b) <= limit;
}`,
    keywords: 'epsilon eps 浮点误差 近似相等 精度 容差 absolute relative nearly equal 比较 防抖'
  }),
  mathEntry({
    id: 'gfx-signed-angle', category: 'gfx-vector', name: '有符号夹角 / atan2',
    header: 'C++：std::atan2（<cmath>）',
    brief: '想知道该向左还是向右转，用点积和有向叉积一起算角度。',
    returns: '返回约在 [−π,π] 的弧度。二维 Y 向上时，从 +X 转向 +Y 为正。',
    pitfall: '零向量或几乎平行于转轴的方向无法定义角度。屏幕 Y 向下时视觉上的顺逆时针相反。反向时 +π 和 −π 都表示半圈。',
    code: `Vec3 aPlane = a - axis * dot(a, axis); // axis 已归一化
Vec3 bPlane = b - axis * dot(b, axis);
// 确认两个投影都有足够长度，再求角度
float angle = std::atan2(dot(axis, cross(aPlane, bPlane)), dot(aPlane, bPlane));`,
    keywords: 'atan2 signed angle 有向角 有符号夹角 左转右转 顺时针 逆时针 朝向 转向 弧度'
  }),
  mathEntry({
    id: 'gfx-closest-point-segment', category: 'gfx-vector', name: '点到线段的最近点和距离',
    brief: '想找鼠标离哪条边最近，先投影到直线，再把参数限制在线段内。',
    returns: '返回最近点 Q、线段参数 t 和平方距离。只需要比较远近时，可以用平方距离省掉开方。',
    pitfall: '直线不限制 t，射线约束 t≥0，线段约束 0≤t≤1。退化线段可返回 A。最小有效线段长度要与场景单位匹配。',
    code: `Vec3 d = B - A;
float len2 = dot(d, d);
float t = len2 <= minLengthSquared ? 0.0f
    : std::clamp(dot(P - A, d) / len2, 0.0f, 1.0f);
Vec3 closest = A + t * d;
Vec3 delta = P - closest;
float distanceSquared = dot(delta, delta);`,
    keywords: 'closest point segment 点到线段 点到边 最近点 最近距离 平方距离 投影 吸附 拾取'
  }),
  mathEntry({
    id: 'gfx-plane-signed-distance', category: 'gfx-vector', name: '点到平面的有符号距离与投影',
    brief: '想判断点在地面上方还是下方，或把它沿法线投影到平面。',
    returns: '正值位于法线指向的一侧，零在平面上，负值在另一侧。Q 是平面上离 P 最近的点。',
    pitfall: 'N·P+d 能判定侧别。要把数值当成世界单位的距离，需除以 |N|。归一化平面系数时，N 和 d 要一起除。',
    code: `// 平面 y=2，法线向上，点 P=(3,5,1)
Vec3 normal{0, 1, 0};
float distance = dot(normal, P - Vec3{0, 2, 0}); // 3
Vec3 onPlane = P - distance * normal;          // (3,2,1)`,
    keywords: 'plane signed distance 平面 半空间 正负距离 点到平面 地面 判定哪一侧 投影 法向量'
  }),
  mathEntry({
    id: 'gfx-reflect-direction', category: 'gfx-vector', name: '镜面反射方向 / reflect',
    header: 'HLSL / GLSL / GLM：reflect(I, N)',
    brief: '想算光线打到镜面后往哪走，翻转入射方向的法线分量。',
    returns: '返回离开表面的反射方向。若 I 为单位向量，R 也是单位向量。',
    pitfall: '着色公式里的 L 常从表面指向光源，此时应传 −L。几何法线和贴图扰动后的法线可能产生不同的反射方向。',
    code: `Vec3 incident{0.6f, -0.8f, 0.0f};
Vec3 normal{0.0f, 1.0f, 0.0f};
Vec3 reflected = incident - 2.0f * dot(normal, incident) * normal;
// (0.6, 0.8, 0)`,
    keywords: 'reflect reflection 镜面反射 反弹 入射向量 反射向量 法线 incident 光线'
  }),
  mathEntry({
    id: 'gfx-affine-inverse', category: 'gfx-matrix', name: '仿射逆变换：世界坐标转本地',
    header: 'GLM：inverse / affineInverse',
    brief: '想把鼠标射线、物体位置或方向变换到另一个物体的本地空间，使用该物体世界变换的逆。',
    returns: '返回本地空间的点或方向。对射线分别变换原点和方向，保留变换后方向向量的长度即可沿用同一个射线参数 t。',
    pitfall: '有缩放或剪切时通常不能用转置代替逆。零缩放会使逆不存在。变换射线后再归一化方向会改变 t 的尺度。',
    code: `// A 已确认可逆
Mat3 invA = inverse(A);
Vec3 localOrigin = invA * (worldOrigin - translation);
Vec3 localDirection = invA * worldDirection; // 保持 t 对应关系`,
    keywords: 'inverse affine inverse local world 逆矩阵 逆变换 换基 世界转本地 局部坐标 物体空间'
  }),
  mathEntry({
    id: 'gfx-transform-hierarchy', category: 'gfx-matrix', name: '父子变换与重设父节点',
    brief: '想把物体挂到另一个节点下，并保持当时的世界位置和朝向。',
    returns: '返回新父节点空间下的局部矩阵。乘回新父节点的世界矩阵即可恢复原世界变换。',
    pitfall: '新父节点矩阵必须可逆。非均匀缩放叠加旋转可产生剪切。只存 TRS 的系统可能无法精确保存算出的局部矩阵。',
    code: `Mat4 oldWorld = oldParentWorld * childLocal;
Mat4 newLocal = inverse(newParentWorld) * oldWorld;
// 新父节点下，newParentWorld * newLocal 约等于 oldWorld`,
    keywords: 'scene graph hierarchy parent child reparent keep world transform 父子变换 重设父节点 挂载 场景树 保持世界位置'
  }),
  mathEntry({
    id: 'gfx-basis-handedness', category: 'gfx-matrix', name: '轴向转换、手性与负行列式',
    brief: '想导入不同坐标约定的模型，或排查镜像之后三角形突然被剔除。',
    returns: '返回新坐标约定下的点、方向或变换。单纯翻转一个轴会反转有向体积和三角形几何绕序。',
    pitfall: '列向量、内存布局、坐标手性是三项独立约定。将反射烘焙到顶点时，要同时核对索引绕序、法线与切线手性。渲染时还要检查投影、视口和前面设置。',
    code: `Mat3 C = diagonal(1.0f, 1.0f, -1.0f); // 翻 Z
Vec3 converted = C * sourcePoint;
Mat3 convertedTransform = C * sourceTransform * inverse(C);
bool reversesOrientation = determinant(C) < 0.0f;`,
    keywords: 'handedness change of basis determinant 坐标系转换 左手系 右手系 换基 行列式 负缩放 镜像 绕序 面剔除'
  }),
  mathEntry({
    id: 'gfx-bilinear-interpolation', category: 'gfx-projection', name: '双线性插值 / Bilinear',
    header: '纹理双线性过滤 · 两次横向插值再纵向插值',
    brief: '想用网格四个角的数值算内部一点，或理解纹理放大时为什么会混合四个 texel。',
    returns: '返回四角的加权值。单元中心处四角权重各为 1/4。',
    pitfall: 'u、v 是单元内比例。用归一化 UV 模拟硬件过滤时，还要按纹素中心和寻址模式选邻点。手动插值 sRGB 颜色时先转线性空间。',
    code: `float bottom = std::lerp(0.0f, 2.0f, 0.5f);
float top    = std::lerp(4.0f, 6.0f, 0.5f);
float center = std::lerp(bottom, top, 0.5f); // 3`,
    keywords: 'bilinear lerp 双线性插值 双线性过滤 四邻点 纹理过滤 高度图 texel UV'
  }),
  mathEntry({
    id: 'gfx-unproject-screen', category: 'gfx-projection', name: '屏幕反投影：像素到世界点或射线',
    header: 'GLM：unProjectNO / unProjectZO',
    brief: '想用鼠标拾取三维物体，或从屏幕位置和深度缓冲重建世界点。',
    returns: '有深度时可获得一个世界点。只有屏幕坐标时得到一条射线，例如取近裁剪面上的点作起点。',
    pitfall: '匹配屏幕 Y 方向、视口偏移、深度范围与反向 Z。例子假定像素坐标原点在左上、NDC 上边为 +1、近端深度为 0、远端深度为 1，且远平面有限。无限远端可能得到 h.w=0，应改用另一个有限深度点。',
    code: `float x = 2.0f * (pixelX - viewportX) / width - 1.0f;
float y = 1.0f - 2.0f * (pixelY - viewportY) / height;
Mat4 invPV = inverse(projection * view);
Vec4 h0 = invPV * Vec4{x, y, 0.0f, 1.0f};
Vec4 h1 = invPV * Vec4{x, y, 1.0f, 1.0f};
Vec3 origin = Vec3{h0.x, h0.y, h0.z} / h0.w;
Vec3 farPoint = Vec3{h1.x, h1.y, h1.z} / h1.w;
Vec3 direction = normalize(farPoint - origin);`,
    keywords: 'unproject 反投影 逆投影 屏幕转世界 鼠标拾取 像素到三维 深度重建 ray picking NDC'
  }),
  mathEntry({
    id: 'gfx-depth-linearization', category: 'gfx-projection', name: '透视深度线性化与反向 Z',
    brief: '想从深度缓冲还原相机前方距离，或排查近处精细、远处抖动的深度精度问题。',
    returns: '返回沿相机前向轴的正距离。离开画面中心时，相机到点的欧氏距离需要完整的三维位置。',
    pitfall: '先撤销自定义的视口深度映射。正交、斜裁剪或无限远投影要用对应公式，或用实际投影矩阵反解。用反向 Z 时要配套修改投影、深度比较方向和清除值。',
    code: `float n = 0.5f, f = 100.0f;
float d = 0.5f;
float viewDistance = n * f / (n + (1.0f - d) * (f - n));
// 约 0.995，深度 0.5 对应的位置离近平面很近`,
    keywords: 'linear depth depth buffer z buffer 深度线性化 线性深度 反向Z reverse Z reversed-Z z-fighting 深度精度 近平面'
  }),
  mathEntry({
    id: 'gfx-frustum-planes', category: 'gfx-projection', name: '视锥裁剪与包围球剔除',
    header: '齐次裁剪空间 · 六个半空间',
    level: 'B',
    brief: '想提前跳过相机看不到的物体，从 PV 矩阵提取视锥平面，再用包围球测试。',
    returns: '某个平面能把整个球排除时可安全剔除。通过所有平面测试表示保留候选。',
    pitfall: '提取的是矩阵的数学行，不能按库的行列存储想当然。反向 Z 会交换近远端含义。无限远投影可能产生恒真的深度边界，此时可跳过这条边界。',
    code: `// 示例：用左侧平面排除世界空间包围球
Vec4 left = row(PV, 3) + row(PV, 0);
Vec3 n{left.x, left.y, left.z};
float side = dot(n, center) + left.w;
bool outsideLeft = side < -radius * length(n);`,
    keywords: 'frustum culling clipping 视锥剔除 视锥体 平面提取 齐次裁剪 包围球 相机可见性'
  }),
  mathEntry({
    id: 'gfx-tangent-normal-map', category: 'gfx-shading', name: '切线空间法线贴图：TBN 与镜像 UV',
    header: 'glTF 2.0：NORMAL / TANGENT · MikkTSpace',
    codeLanguage: 'hlsl',
    brief: '想把法线贴图的方向用到世界空间光照，或排查镜像 UV 接缝上的高光错误。',
    returns: '返回可直接与世界空间光照方向做点积的单位法线，前提是 TBN 也在世界空间。',
    pitfall: '切线基应与烘焙器一致。glTF 用 tangent.w 保存手性。物体变换的线性部分若有反射，手性还要乘 determinant 的符号。非均匀缩放时，法线用逆转置，切线用线性部分，再重新正交化。',
    code: `// N 与 tangent 已在世界空间，sampledRGB 是线性采样值。
float3 ApplyNormalMap(float3 N, float3 tangent, float handedness, float3 sampledRGB) {
    N = normalize(N);
    float3 T = normalize(tangent - N * dot(N, tangent));
    float3 B = handedness * cross(N, T);
    float3 nTS = 2.0 * sampledRGB - 1.0;
    return normalize(T * nTS.x + B * nTS.y + N * nTS.z);
}`,
    keywords: 'normal mapping normal map tangent space TBN MikkTSpace 法线贴图 切线空间 副切线 镜像UV 绿通道'
  }),
  mathEntry({
    id: 'gfx-solid-angle-pdf', category: 'gfx-sampling', name: '面积 PDF 转立体角 PDF',
    header: 'PBRT：面积光源采样 · 概率密度变换',
    level: 'B',
    brief: '想把面积光源采样的 PDF 与 BSDF 方向采样的 PDF 放在一起做多重重要性采样。',
    returns: '返回该面积采样点换算成单位立体角后的密度。均匀面积采样时 pA = 1/面积。',
    pitfall: '零距离和掠射极限须单独处理。单面发光与遮挡由各自的逻辑判断。比较 MIS 权重前还要计入选中该光源的概率。若一个方向对应多个有效采样点，方向边缘密度需考虑所有对应项。',
    code: `Vec3 delta = lightPoint - shadingPoint;
float r2 = dot(delta, delta); // 要求 r2 > 0
Vec3 wi = delta / std::sqrt(r2);
float cosLight = std::abs(dot(lightNormal, -wi)); // 要求 > 0
float pdfSolidAngle = pdfArea * r2 / cosLight;`,
    keywords: 'pdf solid angle Jacobian MIS 面积密度 立体角密度 光源采样 雅可比 概率密度换算 多重重要性采样'
  })
];
