export const practiceApis = [
  {
    id: 'upload-row-pitch', category: 'cpp-buffer', name: '纹理上传：row pitch / std::memcpy',
    header: '<array>、<cstddef>、<cstring>', since: 'C++17', level: 'A',
    brief: '把紧密排列的 CPU 像素复制到每行末尾带填充的上传缓冲。',
    signature: 'std::memcpy(dst + y * dstPitch, src + y * srcPitch, rowBytes);',
    returns: '逐行复制有效像素，目标行末的填充字节保持原值。',
    pitfall: 'pitch 以字节计。目标跨度取设备或映射接口给出的值。动态输入要检查每行长度、总范围及乘法溢出；块压缩纹理要按压缩块行计算。',
    code: `// 两行 RGBA8，每行三个像素；示例目标每行占 16 字节
constexpr std::size_t rowBytes = 3 * 4, dstPitch = 16, height = 2;
std::array<std::byte, rowBytes * height> src{};
std::array<std::byte, dstPitch * height> dst{};
src[rowBytes] = std::byte{0xff};  // 第二行的第一个通道
for (std::size_t y = 0; y < height; ++y) {
    std::memcpy(dst.data() + y * dstPitch, src.data() + y * rowBytes, rowBytes);
}
// dst[16] 为 0xff，第一行的填充 dst[12..15] 仍为零`,
    keywords: '纹理上传 行跨度 行对齐 pitch stride staging RGBA8'
  },
  {
    id: 'pixel-unorm', category: 'cpp-render-numeric', name: 'UNORM8 量化：std::clamp / std::lround',
    header: '<algorithm>、<cmath>、<cstdint>', since: 'C++17', level: 'A',
    brief: '将浮点遮罩或颜色通道编码成 8 位无符号归一化整数。',
    signature: 'round(clamp(x, 0, 1) * 255)',
    returns: '得到 0 到 255 的整数。归一化解码可用 float(byte) / 255.f。',
    pitfall: '示例约定所有非有限输入写为零。量化只改变数值表示；写入 sRGB 颜色数据还要处理传递函数，粗糙度等数据纹理通常按线性值处理。',
    code: `auto pack = [](float x) -> std::uint8_t {
    if (!std::isfinite(x)) return 0;
    float unit = std::clamp(x, 0.f, 1.f);
    return static_cast<std::uint8_t>(std::lround(unit * 255.f));
};
auto mid = pack(0.5f);  // 128
auto white = pack(1.2f);  // 255`,
    keywords: '像素打包 UNORM 通道量化 遮罩 颜色格式'
  },
  {
    id: 'fixed-step', category: 'numeric', name: '固定步长累加器与渲染插值',
    header: '<algorithm>、<chrono>', since: 'C++17', level: 'A',
    brief: '按固定频率更新模拟，用一帧中未消费的时间计算渲染插值系数。',
    signature: 'while (lag >= step) { simulate(step); lag -= step; }',
    returns: '示例到达第 25 毫秒时模拟两次，剩余 5 毫秒，插值系数为 0.5。',
    pitfall: 'lag 和前后两次模拟状态都要跨帧保留。示例每帧最多接受 50 毫秒以限制追帧开销，会主动丢弃超额时间。需要真实时间一致性的模拟应另行规定追帧策略。',
    code: `using namespace std::chrono_literals;
constexpr auto step = 10ms;  // 100 Hz
auto lag = 0ms;
int ticks = 0;
auto frame = [&](std::chrono::milliseconds elapsed) {
    lag += std::clamp(elapsed, 0ms, 50ms);
    while (lag >= step) {
        ++ticks;  // 在此用 step 推进一次模拟
        lag -= step;
    }
    return static_cast<double>(lag.count()) / step.count();
};
double alpha = frame(25ms);  // ticks == 2，alpha == 0.5`,
    keywords: '游戏循环 delta time timestep 物理 追帧 帧率 插值'
  },
  {
    id: 'keyframe-bracket', category: 'algorithm', name: '关键帧区间：upper_bound / lerp',
    header: '<algorithm>、<array>、<cmath>、<iterator>', since: 'C++20', level: 'A',
    brief: '在按时间排序的动画轨道上找到相邻关键帧，并插值一个标量通道。',
    signature: 'std::ranges::upper_bound(keys, t, {}, &Key::time)',
    returns: '找出第一帧时间严格大于 t 的关键帧，再与它的前一帧配对。轨道两端保持端点值。',
    pitfall: '示例轨道非空，时间有限且严格递增。导入可变长轨道时须处理空轨和重复时间；旋转轨道需要四元数插值。',
    code: `struct Key { float time, value; };
std::array<Key, 3> keys{{{0, 0}, {1, 10}, {3, 30}}};
auto sample = [&](float t) {
    auto hi = std::ranges::upper_bound(keys, t, {}, &Key::time);
    if (hi == keys.begin()) return keys.front().value;
    if (hi == keys.end()) return keys.back().value;
    const auto& lo = *std::prev(hi);
    float u = (t - lo.time) / (hi->time - lo.time);
    return std::lerp(lo.value, hi->value, u);
};
float value = sample(2.f);  // 20`,
    keywords: '动画 关键帧 轨道 二分查找 时间采样 标量插值'
  },
  {
    id: 'mesh-iota', category: 'algorithm', name: 'std::iota',
    header: '<numeric>、<array>', since: 'C++11', level: 'A',
    brief: '给导入网格生成从零开始的连续索引。',
    signature: 'std::iota(first, last, start)',
    returns: '原地写入递增序列，返回 void。',
    pitfall: '输出区间必须已经存在。起始值的类型决定递增运算的类型，过窄的整数可能回绕。',
    code: `std::array<unsigned, 4> indices{};
std::iota(indices.begin(), indices.end(), 0u);  // 0, 1, 2, 3`,
    keywords: '索引 初始化 连号 index buffer',
    references: [{ label: '工作草案 · numeric.iota', url: 'https://timsong-cpp.github.io/cppwp/n4950/numeric.iota' }]
  },
  {
    id: 'mesh-inner', category: 'numeric', name: 'std::inner_product',
    header: '<numeric>、<array>', since: 'C++98', level: 'A',
    brief: '计算三个颜色通道的加权亮度，或求同维向量的点积。',
    signature: 'std::inner_product(first, last, other, init)',
    returns: '返回从 init 开始累计的乘积和。',
    pitfall: '第二个输入必须至少和第一个区间一样长。用浮点初值保留小数，整数初值可能在每步累加时截断。',
    code: `std::array<float, 3> rgb{1.f, 0.f, 0.f};
std::array<float, 3> weights{0.2126f, 0.7152f, 0.0722f};
auto luminance = std::inner_product(rgb.begin(), rgb.end(), weights.begin(), 0.f);`,
    keywords: '点积 dot RGB 亮度 权重',
    references: [{ label: '工作草案 · inner.product', url: 'https://timsong-cpp.github.io/cppwp/n4950/inner.product' }]
  },
  {
    id: 'priority-partial-sort', category: 'cpp-scene-algorithms', name: 'std::partial_sort',
    header: '<algorithm>、<array>', since: 'C++98', level: 'B',
    brief: '从点光源候选中取距离最小的 K 项，并让这 K 项按距离有序。',
    signature: 'std::partial_sort(first, first + k, last, cmp)',
    returns: '原地排序前 K 项，剩余项次序未指定。',
    pitfall: '先把 K 限制到候选数量。比较距离时应给出严格弱序，输入中的 NaN 要提前处理。',
    code: `std::array<float, 5> distance2{9, 1, 8, 4, 7};
std::partial_sort(distance2.begin(), distance2.begin() + 2, distance2.end());
// 前两项是 1、4`,
    keywords: '最近光源 top k 距离 裁剪',
    references: [{ label: '工作草案 · partial.sort', url: 'https://timsong-cpp.github.io/cppwp/n4950/partial.sort' }]
  },
  {
    id: 'stable-draw-sort', category: 'cpp-scene-algorithms', name: 'std::stable_sort',
    header: '<algorithm>、<array>', since: 'C++98', level: 'A',
    brief: '按渲染层整理精灵，保留同层内原有的提交顺序。',
    signature: 'std::stable_sort(first, last, compare)',
    returns: '在原区间内排序，比较等价的项保持相对顺序。',
    pitfall: '输入顺序要先确定。若绘制项来自无序的并行收集，同层结果仍可能随帧变化。',
    code: `struct Sprite { int layer, id; };
std::array<Sprite, 3> draws{{{2, 7}, {1, 8}, {2, 9}}};
std::stable_sort(draws.begin(), draws.end(), [](auto a, auto b) {
    return a.layer < b.layer;
});  // id 顺序为 8、7、9`,
    keywords: '透明 绘制顺序 精灵 稳定排序',
    references: [{ label: '工作草案 · stable.sort', url: 'https://timsong-cpp.github.io/cppwp/n4950/stable.sort' }]
  },
  {
    id: 'mesh-minmax', category: 'algorithm', name: 'std::minmax_element',
    header: '<algorithm>、<array>', since: 'C++11', level: 'A',
    brief: '一次扫描找出顶点在某个轴上的两个极值。',
    signature: 'auto [lo, hi] = std::minmax_element(first, last);',
    returns: '返回两个迭代器，分别指向第一个最小值和最后一个最大值。',
    pitfall: '空区间返回一对 last，解引用前需判空。使用浮点坐标时要先处理非有限值。',
    code: `std::array<float, 4> x{-2, 1, 3, 0};
auto [lo, hi] = std::minmax_element(x.begin(), x.end());
float extent = *hi - *lo;  // 5`,
    keywords: '包围盒 AABB 极值 范围',
    references: [{ label: '工作草案 · alg.min.max', url: 'https://timsong-cpp.github.io/cppwp/n4950/alg.min.max' }]
  },
  {
    id: 'clip-hypot', category: 'numeric', name: 'std::hypot',
    header: '<cmath>', since: 'C++11', level: 'A',
    brief: '从坐标差计算欧氏距离，减少先平方造成的中间溢出或下溢。',
    signature: 'std::hypot(dx, dy)',
    returns: '返回非负长度。三个参数的重载从 C++17 开始提供。',
    pitfall: '真实结果仍可能超出返回类型。仅做范围筛选时要统一距离与阈值的单位。',
    code: `double dx = 3.0, dy = 4.0;
double distance = std::hypot(dx, dy);  // 5`,
    keywords: '欧氏距离 向量长度 模长',
    references: [{ label: '工作草案 · cmath.syn', url: 'https://timsong-cpp.github.io/cppwp/n4950/cmath.syn' }]
  },
  {
    id: 'angle-atan2', category: 'numeric', name: 'std::atan2',
    header: '<cmath>', since: 'C++98', level: 'A',
    brief: '由平面方向计算带象限的朝向角，用于瞄准和朝向指示。',
    signature: 'std::atan2(y, x)',
    returns: '返回以弧度表示的主值，范围在 −π 到 π 之间。',
    pitfall: '参数先 y 后 x。零向量没有几何方向，屏幕 Y 向下时还要统一正角方向。',
    code: `double dx = -1, dy = 1;
double heading = std::atan2(dy, dx);  // 约 2.356 弧度`,
    keywords: '象限 朝向 航向 弧度 角度',
    references: [{ label: '工作草案 · cmath.syn', url: 'https://timsong-cpp.github.io/cppwp/n4950/cmath.syn' }]
  },
  {
    id: 'anim-fmod', category: 'numeric', name: 'std::fmod / std::remainder',
    header: '<cmath>', since: 'C++98', level: 'B',
    brief: '把可能倒播的动画时间回绕到一个循环周期内。',
    signature: 'std::fmod(time, period)',
    returns: 'fmod 的非零结果与被除数同号。C++11 的 remainder 使用最近整数确定商，适合求中心化的余量。',
    pitfall: '周期必须为正且有限。负余数加周期后可能因舍入恰好等于右端点，需要处理。',
    code: `double period = 2.0;
double t = std::fmod(-0.25, period);
if (t < 0) t += period;
if (t >= period) t = 0;  // 始终位于 [0, period)`,
    keywords: '动画 倒播 周期 回绕 wrap',
    references: [{ label: '工作草案 · cmath.syn', url: 'https://timsong-cpp.github.io/cppwp/n4950/cmath.syn' }]
  },
  {
    id: 'mask-bitset', category: 'numeric', name: 'std::bitset',
    header: '<bitset>', since: 'C++98', level: 'A',
    brief: '用固定数量的位跟踪渲染层、输入键或组件签名，按位筛选。',
    signature: '(layers & cameraMask).any()',
    returns: 'any 判断是否有交集，count 返回置位数，test 查询指定位置。',
    pitfall: '从最低有效位开始编号。test 对越界索引抛出异常，来自配置文件的层号应先校验。',
    code: `std::bitset<64> layers, cameraMask;
layers.set(3);
cameraMask.set(3).set(5);
bool visible = (layers & cameraMask).any();`,
    keywords: '层掩码 组件 ECS bit mask layer',
    references: [{ label: '工作草案 · template.bitset', url: 'https://timsong-cpp.github.io/cppwp/n4950/template.bitset' }]
  },
  {
    id: 'visit-command', category: 'utility', name: 'std::visit',
    header: '<variant>、<type_traits>', since: 'C++17', level: 'B',
    brief: '按绘制命令的实际类型分派处理函数，避免手写标签转换。',
    signature: 'std::visit(visitor, command)',
    returns: '返回被选中的调用结果。普通重载要求各备选调用返回同一类型和值类别。',
    pitfall: '访问器必须覆盖每个备选类型。若 variant 因异常而失去值，visit 抛出 bad_variant_access。',
    code: `struct Draw { int count; };
struct Clear {};
std::variant<Draw, Clear> command = Draw{3};
int vertices = std::visit([](const auto& cmd) -> int {
    if constexpr (std::is_same_v<std::decay_t<decltype(cmd)>, Draw>)
        return cmd.count;
    else return 0;
}, command);`,
    keywords: '变体 渲染命令 visitor 分派',
    references: [{ label: '工作草案 · variant.visit', url: 'https://timsong-cpp.github.io/cppwp/n4950/variant.visit' }]
  },
  {
    id: 'resource-exchange', category: 'utility', name: 'std::exchange',
    header: '<utility>', since: 'C++14', level: 'A',
    brief: '转移一个同时需要在源对象中清空的资源句柄。',
    signature: 'auto old = std::exchange(handle, invalid);',
    returns: '先保存旧值，再把新值赋给原对象，最后返回旧值。',
    pitfall: '只更换 C++ 对象的值，底层句柄仍需由新所有者按引擎约定释放；并发访问还需同步。',
    code: `unsigned sourceHandle = 42;
unsigned ownedHandle = std::exchange(sourceHandle, 0u);
// ownedHandle 为 42，sourceHandle 为约定的空值 0`,
    keywords: 'RAII 移动构造 句柄 所有权',
    references: [{ label: '工作草案 · utility.exchange', url: 'https://timsong-cpp.github.io/cppwp/n4950/utility.exchange' }]
  },
  {
    id: 'asset-once', category: 'concurrency', name: 'std::call_once / std::once_flag',
    header: '<mutex>、<array>', since: 'C++11', level: 'B',
    brief: '让多个工作线程共享一张按需初始化的查表数据。',
    signature: 'std::call_once(flag, initialize)',
    returns: '成功执行一次初始化，随后使用同一标志的调用可看到初始化结果。',
    pitfall: '若初始化抛出异常，后续调用可重试。once_flag 没有重置操作，热重载资源需要另一套生命周期。',
    code: `static std::once_flag initialized;
static std::array<int, 4> squares{};
std::call_once(initialized, [] {
    for (int i = 0; i < 4; ++i) squares[i] = i * i;
});`,
    keywords: '线程安全 延迟 初始化 LUT 查表',
    references: [{ label: '工作草案 · thread.once', url: 'https://timsong-cpp.github.io/cppwp/n4950/thread.once' }]
  },
  {
    id: 'registry-shared-lock', category: 'concurrency', name: 'std::shared_mutex / std::shared_lock',
    header: '<shared_mutex>、<mutex>、<map>', since: 'C++17', level: 'B',
    brief: '资产索引允许多个读者同时查询，写入时独占访问。',
    signature: 'std::shared_lock readLock(mutex);',
    returns: '读锁与同一互斥量上的其他读锁可共存，unique_lock 取得独占权。shared_lock 自 C++14 可用。',
    pitfall: '标准没有承诺公平调度。返回资源表内的指针或引用时，要处理解锁后的对象生命周期。',
    code: `std::shared_mutex mutex;
std::map<int, int> assets{{7, 12}};
int version;
{
    std::shared_lock readLock(mutex);
    version = assets.at(7);
}
std::unique_lock writeLock(mutex);
++assets.at(7);`,
    keywords: '读写锁 资产注册表 热重载 多读少写',
    references: [{ label: '工作草案 · thread.sharedmutex.requirements', url: 'https://timsong-cpp.github.io/cppwp/n4950/thread.sharedmutex.requirements' }]
  },
  {
    id: 'job-semaphore', category: 'cpp-engine-sync', name: 'std::counting_semaphore',
    header: '<semaphore>', since: 'C++20', level: 'B',
    brief: '限制可同时占用暂存缓冲区的后台任务数量。',
    signature: 'slots.try_acquire()',
    returns: '成功时消耗一个许可并返回 true；release 归还许可，可由其他线程调用。',
    pitfall: 'try_acquire 允许偶发失败。异常路径也须归还已获取的许可，且须另行分配具体缓冲区。',
    code: `std::counting_semaphore<3> slots{3};
if (slots.try_acquire()) {
    // 使用一个已分配的槽；这里的工作不抛异常
    slots.release();
}`,
    keywords: '限流 异步上传 许可 信号量 后台任务',
    references: [{ label: '工作草案 · thread.sema', url: 'https://timsong-cpp.github.io/cppwp/n4950/thread.sema' }]
  },
  {
    id: 'layout-traits', category: 'cpp-buffer', name: 'std::is_trivially_copyable_v / is_standard_layout_v',
    header: '<type_traits>、<cstddef>', since: 'C++17', level: 'A',
    brief: '在编译期检查顶点声明是否满足原始字节复制及成员偏移查询的要求。',
    signature: 'static_assert(std::is_trivially_copyable_v<Vertex>);',
    returns: '变量模板给出编译期布尔值。对应的类模板从 C++11 起可用。',
    pitfall: '即使两项检查都通过，字节序、填充和 GPU 输入格式仍需分别约定。',
    code: `struct Vertex { float x, y, z; };
static_assert(std::is_trivially_copyable_v<Vertex>);
static_assert(std::is_standard_layout_v<Vertex>);
constexpr auto zOffset = offsetof(Vertex, z);`,
    keywords: '顶点 序列化 布局 POD 字节上传',
    references: [{ label: '工作草案 · meta.unary.prop', url: 'https://timsong-cpp.github.io/cppwp/n4950/meta.unary.prop' }]
  },
  {
    id: 'texture-in-range', category: 'types', name: 'std::in_range',
    header: '<utility>、<cstdint>', since: 'C++20', level: 'A',
    brief: '检查网格索引能否无损压缩成 16 位，再进行窄化转换。',
    signature: 'std::in_range<std::uint16_t>(index)',
    returns: '可用目标整数类型表示时返回 true，正确处理有符号与无符号的边界。',
    pitfall: '适用于受支持的整数类型；浮点输入、bool 和普通 char 等不在这组整数比较工具的适用范围内。',
    code: `int index = 65534;
if (std::in_range<std::uint16_t>(index)) {
    auto packed = static_cast<std::uint16_t>(index);
}`,
    keywords: '窄化 索引缓冲 溢出 有符号 无符号',
    references: [{ label: '工作草案 · utility.intcmp', url: 'https://timsong-cpp.github.io/cppwp/n4950/utility.intcmp' }]
  },
  {
    id: 'io-filetime', category: 'io', name: 'std::filesystem::last_write_time',
    header: '<filesystem>、<system_error>', since: 'C++17', level: 'B',
    brief: '为着色器热重载记录源文件的最后修改时间。',
    signature: 'std::filesystem::last_write_time(path, ec)',
    returns: '查询重载返回 file_time_type，失败时通过 ec 报错。',
    pitfall: '不同文件系统的时间分辨率不同，短时间内两次写入可能得到相同时间戳。比较前先检查 ec。',
    code: `std::error_code ec;
auto stamp = std::filesystem::last_write_time("lighting.hlsl", ec);
if (!ec) {
    auto previous = stamp;  // 在缓存中保留以供下次比较
}`,
    keywords: '文件监听 修改时间 热更新 shader 缓存',
    references: [{ label: '工作草案 · fs.op.last.write.time', url: 'https://timsong-cpp.github.io/cppwp/n4950/fs.op.last.write.time' }]
  },
  {
    id: 'sort-key-tie', category: 'utility', name: 'std::tie',
    header: '<tuple>、<algorithm>、<array>', since: 'C++11', level: 'B',
    brief: '为渲染队列组合管线、材质两个排序键，按声明顺序比较。',
    signature: 'std::tie(a.pipeline, a.material) < std::tie(b.pipeline, b.material)',
    returns: '构造引用组成的 tuple。元组比较先看第一项，相等时再看下一项。',
    pitfall: '返回的 tuple 借用原变量。要把键保存到超出变量生命周期的地方，应存值。',
    code: `struct Draw { int pipeline, material; };
std::array<Draw, 3> draws{{{2, 1}, {1, 4}, {1, 2}}};
std::sort(draws.begin(), draws.end(), [](auto a, auto b) {
    return std::tie(a.pipeline, a.material) < std::tie(b.pipeline, b.material);
});`,
    keywords: '多关键字 排序键 批处理 渲染队列',
    references: [{ label: '工作草案 · tuple.creation', url: 'https://timsong-cpp.github.io/cppwp/n4950/tuple.creation' }]
  }
];
