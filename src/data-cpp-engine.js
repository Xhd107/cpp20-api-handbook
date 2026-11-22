export const engineCppCategories = [
  { id: 'cpp-buffer', title: '顶点布局与二进制缓冲', description: '描述 CPU 端顶点布局，检查上传范围，处理模型文件中的字节。' },
  { id: 'cpp-frame-memory', title: '帧内分配与资源缓存', description: '为临时绘制列表分配空间，管理显式生命周期，按键复用资源。' },
  { id: 'cpp-scene-algorithms', title: '场景划分与批处理', description: '对可见物体、空间层次和网格批次做划分、去重与偏移计算。' },
  { id: 'cpp-render-numeric', title: '纹理尺寸与浮点诊断', description: '处理 Mip 层数、分块坐标、非有限值和浮点边界。' },
  { id: 'cpp-engine-sync', title: '后台加载与帧任务同步', description: '在 CPU 线程之间发布资源、等待批次完成，并协调重复的模拟阶段。' }
];

export const engineCppApis = [
  {
    id: 'vertex-layout', category: 'cpp-buffer', name: 'offsetof / sizeof',
    header: '<cstddef>、<type_traits>', since: 'C++98', level: 'A',
    brief: '为交错顶点流填写属性偏移与步长。offsetof 给出成员相对对象起点的字节偏移，sizeof 给出相邻数组元素的间距。',
    signature: 'offsetof(Vertex, uv)',
    returns: '两者都得到 std::size_t，可分别填写属性 offset 和绑定 stride。',
    pitfall: '成员之间和结构体末尾都可能有填充。先验证类型具有标准布局，再核对 GPU 端的属性格式。',
    code: `struct Vertex {
    float position[3];
    float uv[2];
};
static_assert(std::is_standard_layout_v<Vertex>);
constexpr auto uvOffset = offsetof(Vertex, uv);
constexpr auto stride = sizeof(Vertex);`,
    keywords: '顶点 输入布局 stride offset 偏移 步长 顶点声明',
    references: [{ label: 'C++20 工作草案 · support.types.layout', url: 'https://timsong-cpp.github.io/cppwp/n4861/support.types.layout' }]
  },
  {
    id: 'span-bytes', category: 'cpp-buffer', name: 'std::as_bytes / std::as_writable_bytes',
    header: '<span>', since: 'C++20', level: 'A',
    brief: '把索引数组交给按字节计数的上传接口，同时保留可读范围。',
    signature: 'std::as_bytes(std::span{indices})',
    returns: '得到 std::span<const std::byte>。字节视图的 size() 等于原视图的 size_bytes()。',
    pitfall: '视图借用原存储。延迟上传时须保证源数据仍有效；可写字节视图还要求元素可修改。',
    code: `unsigned short indices[] = {0, 2, 1};
auto bytes = std::as_bytes(std::span{indices});
auto uploadSize = bytes.size();  // 3 * sizeof(unsigned short)`,
    keywords: '索引缓冲 上传 字节数 staging buffer 顶点 二进制',
    references: [{ label: 'C++20 工作草案 · span.objectrep', url: 'https://timsong-cpp.github.io/cppwp/n4861/span.objectrep' }]
  },
  {
    id: 'span-subspan', category: 'cpp-buffer', name: 'std::span::subspan',
    header: '<span>、<cstddef>', since: 'C++20', level: 'A',
    brief: '按偏移截取资源包中的一段数据。先验证长度，再创建切片。',
    signature: 'buffer.subspan(offset, count)',
    returns: '返回指向同一存储的子视图。偏移恰好在末尾时，长度可以为零。',
    pitfall: '下标单位是元素；处理字节偏移时使用字节视图。用减法检查剩余空间，避免 offset + count 溢出。',
    code: `auto fits = [](std::span<const std::byte> buffer,
               std::size_t offset, std::size_t count) {
    return offset <= buffer.size() && count <= buffer.size() - offset;
};
std::byte data[16]{};
std::span<const std::byte> buffer{data};
if (fits(buffer, 8, 4)) {
    auto chunk = buffer.subspan(8, 4);
}`,
    keywords: '切片 资源包 索引偏移 越界 二进制 子网格',
    references: [{ label: 'C++20 工作草案 · span.sub', url: 'https://timsong-cpp.github.io/cppwp/n4861/span.sub' }]
  },
  {
    id: 'byte-copy', category: 'cpp-buffer', name: 'std::memcpy / std::memmove',
    header: '<cstring>、<cstdint>', since: 'C++98', level: 'A',
    brief: '从未对齐的字节位置读取固定宽度字段，或在同一暂存缓冲区内搬移一段数据。',
    signature: 'std::memcpy(&value, source, sizeof value)',
    returns: '返回目标地址。示例将四个字节读入已有的 uint32_t 对象。',
    pitfall: 'memcpy 要求区间不重叠，重叠搬移使用 memmove。复制只保留对象表示；文件字节序需要单独处理。',
    code: `unsigned char packet[] = {0, 1, 2, 3, 4};
std::uint32_t value{};
std::memcpy(&value, packet + 1, sizeof value);
std::memmove(packet, packet + 1, 4);  // 左移四个字节`,
    keywords: '未对齐 文件头 序列化 重叠 拷贝 缓冲区',
    references: [{ label: 'C++20 工作草案 · cstring.syn', url: 'https://timsong-cpp.github.io/cppwp/n4861/cstring.syn' }]
  },
  {
    id: 'frame-arena', category: 'cpp-frame-memory', name: 'std::pmr::monotonic_buffer_resource',
    header: '<memory_resource>、<vector>、<cstddef>', since: 'C++17', level: 'A',
    brief: '把本帧的绘制索引放入一块临时内存，多次分配后整批回收。',
    signature: 'std::pmr::vector<unsigned> draws{&arena};',
    returns: '容器通过 arena 取得存储；release() 统一释放资源持有的分配。',
    pitfall: '先销毁使用该资源的容器，再调用 release()。clear() 仍保留容量。初始缓冲用完后默认向上游继续分配。',
    code: `alignas(std::max_align_t) std::byte scratch[4096];
std::pmr::monotonic_buffer_resource arena{scratch, sizeof scratch};
{
    std::pmr::vector<unsigned> draws{&arena};
    draws.reserve(128);
    draws.push_back(17);
}
arena.release();`,
    keywords: '帧分配器 arena PMR 内存池 绘制列表 临时分配',
    references: [{ label: 'C++20 工作草案 · mem.res.monotonic.buffer', url: 'https://timsong-cpp.github.io/cppwp/n4861/mem.res.monotonic.buffer' }]
  },
  {
    id: 'align-buffer', category: 'cpp-frame-memory', name: 'std::align',
    header: '<memory>、<cstddef>', since: 'C++11', level: 'B',
    brief: '在 CPU 暂存区中为下一段数据找到对齐地址。',
    signature: 'std::align(alignment, bytes, cursor, remaining)',
    returns: '成功时返回对齐后的指针，并从 remaining 中扣除前置填充；失败返回 nullptr 并保留原参数。',
    pitfall: '对齐值须为二的幂。成功后仍需自己消费本次请求的字节数。GPU 动态偏移另受设备限制。',
    code: `std::byte storage[128];
void* cursor = storage + 1;
std::size_t remaining = sizeof storage - 1;
if (void* slot = std::align(16, 32, cursor, remaining)) {
    cursor = static_cast<std::byte*>(slot) + 32;
    remaining -= 32;
}`,
    keywords: '内存对齐 bump allocator 填充 分配游标',
    references: [{ label: 'C++20 工作草案 · ptr.align', url: 'https://timsong-cpp.github.io/cppwp/n4861/ptr.align' }]
  },
  {
    id: 'construct-slot', category: 'cpp-frame-memory', name: 'std::construct_at / std::destroy_at',
    header: '<memory>、<cstddef>', since: 'C++20', level: 'B',
    brief: '在对象池的已对齐空槽中构造组件，并在归还槽位前执行析构。',
    signature: 'std::construct_at(pointer, args...)',
    returns: 'construct_at 返回所构造对象的指针；destroy_at 执行析构，返回 void。',
    pitfall: '槽位必须足够大且满足对齐。构造成功后要配对析构。释放整个内存块不能替代非平凡析构。destroy_at 从 C++17 即可用。',
    code: `struct Particle { explicit Particle(float t) : life(t) {} float life; };
alignas(Particle) std::byte slot[sizeof(Particle)];
auto* particle = std::construct_at(reinterpret_cast<Particle*>(slot), 1.0f);
particle->life -= 0.016f;
std::destroy_at(particle);`,
    keywords: '对象池 placement new 生命周期 粒子 组件 槽位',
    references: [{ label: 'C++20 工作草案 · specialized.algorithms', url: 'https://timsong-cpp.github.io/cppwp/n4861/specialized.algorithms' }]
  },
  {
    id: 'cache-emplace', category: 'cpp-frame-memory', name: 'std::unordered_map::try_emplace',
    header: '<unordered_map>、<vector>', since: 'C++17', level: 'A',
    brief: '资源键首次出现时才在哈希表中构造对应的缓存对象。',
    signature: 'cache.try_emplace(key, constructorArgs...)',
    returns: '返回迭代器和 inserted 标志。键已存在时迭代器指向原值。',
    pitfall: '传入构造参数才能推迟值的构造。把 loadTexture() 当实参仍会在查表前调用它。插入触发 rehash 时迭代器会失效。',
    code: `std::unordered_map<int, std::vector<float>> curves;
auto [entry, inserted] = curves.try_emplace(42, 256, 0.0f);
entry->second[0] = 1.0f;`,
    keywords: '资源缓存 延迟构造 哈希表 重复插入 动画曲线',
    references: [{ label: 'C++20 工作草案 · unord.map.modifiers', url: 'https://timsong-cpp.github.io/cppwp/n4861/unord.map.modifiers' }]
  },
  {
    id: 'bvh-nth', category: 'cpp-scene-algorithms', name: 'std::nth_element',
    header: '<algorithm>、<array>', since: 'C++98', level: 'A',
    brief: '构建 BVH 时按质心坐标把图元分成两个数量接近的区间。',
    signature: 'std::nth_element(first, middle, last, compare)',
    returns: '返回 void。middle 处是完整排序后该位置的元素；左右分区内的顺序未指定。',
    pitfall: '坐标应为有限数并使用严格弱序比较。递归时拆成 [first, middle) 与 [middle, last)，只有一个图元就停止。',
    code: `struct Primitive { float centerX; int id; };
std::array<Primitive, 4> nodes{{{4, 0}, {1, 1}, {7, 2}, {2, 3}}};
auto mid = nodes.begin() + nodes.size() / 2;
std::nth_element(nodes.begin(), mid, nodes.end(),
    [](const auto& a, const auto& b) { return a.centerX < b.centerX; });`,
    keywords: 'BVH 中位数 空间划分 包围盒 质心',
    references: [{ label: 'C++20 工作草案 · alg.nth.element', url: 'https://timsong-cpp.github.io/cppwp/n4861/alg.nth.element' }]
  },
  {
    id: 'visible-partition', category: 'cpp-scene-algorithms', name: 'std::partition / std::stable_partition',
    header: '<algorithm>、<array>', since: 'C++98', level: 'A',
    brief: '把可见绘制项移到队列前部，用一个边界标记可提交的区间。',
    signature: 'auto endVisible = std::partition(first, last, predicate);',
    returns: '返回第一条不满足条件的记录位置；全部可见时返回 last。',
    pitfall: 'partition 会打乱原顺序。若输入已经按透明物体的深度排好，使用 stable_partition 保留各组相对顺序。',
    code: `struct Draw { int id; bool visible; };
std::array<Draw, 3> queue{{{7, true}, {8, false}, {9, true}}};
auto endVisible = std::stable_partition(queue.begin(), queue.end(),
    [](const Draw& item) { return item.visible; });
// [queue.begin(), endVisible) 依次包含 7、9`,
    keywords: '可见性 剔除 绘制队列 批处理 透明排序',
    references: [{ label: 'C++20 工作草案 · alg.partitions', url: 'https://timsong-cpp.github.io/cppwp/n4861/alg.partitions' }]
  },
  {
    id: 'unique-material', category: 'cpp-scene-algorithms', name: 'std::unique',
    header: '<algorithm>、<vector>', since: 'C++98', level: 'A',
    brief: '从多个子网格引用的材质 ID 中生成无重复的加载列表。',
    signature: 'auto tail = std::unique(ids.begin(), ids.end());',
    returns: '返回压缩后逻辑末尾。调用容器的 erase 才会缩短 size()。',
    pitfall: '只合并连续的等价元素。独立的 ID 清单可以先排序；重排原始顶点或索引会改变几何关系。',
    code: `std::vector<int> ids{3, 1, 3, 2, 1};
std::sort(ids.begin(), ids.end());
ids.erase(std::unique(ids.begin(), ids.end()), ids.end());
// ids 为 {1, 2, 3}`,
    keywords: '材质 去重 排序 unique erase 资源依赖',
    references: [{ label: 'C++20 工作草案 · alg.unique', url: 'https://timsong-cpp.github.io/cppwp/n4861/alg.unique' }]
  },
  {
    id: 'batch-scan', category: 'cpp-scene-algorithms', name: 'std::exclusive_scan',
    header: '<numeric>、<array>、<cstddef>', since: 'C++17', level: 'B',
    brief: '从每个子网格的索引数一次算出各自在合并缓冲中的起始位置。',
    signature: 'std::exclusive_scan(first, last, offsets.begin(), initial)',
    returns: '每个输出是当前位置之前的累计值，函数返回输出末尾迭代器。',
    pitfall: '输出需要预留足够元素。这里的偏移单位是索引；转换为字节偏移时须乘单个索引的大小，并保证累计值可表示。',
    code: `std::array<std::size_t, 3> counts{6, 3, 9};
std::array<std::size_t, 3> offsets{};
std::exclusive_scan(counts.begin(), counts.end(), offsets.begin(), std::size_t{0});
// offsets 为 {0, 6, 9}，最后一批占用 [9, 18)`,
    keywords: '前缀和 prefix sum 子网格 间接绘制 批次 索引偏移',
    references: [{ label: 'C++20 工作草案 · exclusive.scan', url: 'https://timsong-cpp.github.io/cppwp/n4861/exclusive.scan' }]
  },
  {
    id: 'texture-bits', category: 'cpp-render-numeric', name: 'std::bit_width / bit_ceil / has_single_bit',
    header: '<bit>、<algorithm>', since: 'C++20', level: 'A',
    brief: '从非零纹理的最大边长计算完整 Mip 链层数，或计算可容纳请求的二次幂桶大小。',
    signature: 'std::bit_width(std::max(width, height))',
    returns: 'bit_width(0u) 为 0；对正整数返回二进制有效位数。bit_ceil 向上取二次幂，has_single_bit 判断正二次幂。',
    pitfall: '函数接受无符号整数。bit_ceil 的结果必须可表示。非二次幂纹理也能有完整 Mip 链，两条边都应先验证非零。',
    code: `unsigned width = 300, height = 128;
auto levels = std::bit_width(std::max(width, height));  // 9 层，含原图
auto bucket = std::bit_ceil(width);  // 512
bool powerOfTwo = std::has_single_bit(width);  // false`,
    keywords: 'mipmap mip levels 贴图 层级 纹理池 二次幂',
    references: [{ label: 'C++20 工作草案 · bit.pow.two', url: 'https://timsong-cpp.github.io/cppwp/n4861/bit.pow.two' }]
  },
  {
    id: 'finite-positions', category: 'cpp-render-numeric', name: 'std::isfinite / std::isnan / std::isinf',
    header: '<cmath>、<algorithm>、<array>', since: 'C++11', level: 'A',
    brief: '拦截模型中损坏的坐标，防止 NaN 进入包围盒计算或排序比较器。',
    signature: 'std::isfinite(component)',
    returns: 'isfinite 对有限值返回 true，包括零和次正规数；isnan 和 isinf 可区分两类异常输入。',
    pitfall: '不要用 x == NaN 检测。依赖 NaN 诊断的构建应避免启用假设输入恒为有限值的浮点优化。',
    code: `std::array<float, 3> position{1.0f, 2.0f, 3.0f};
bool valid = std::all_of(position.begin(), position.end(),
    [](float component) { return std::isfinite(component); });`,
    keywords: '无穷大 非法顶点 NaN Inf AABB 导入 模型',
    references: [{ label: 'C++20 工作草案 · cmath.syn', url: 'https://timsong-cpp.github.io/cppwp/n4861/cmath.syn' }]
  },
  {
    id: 'grid-floor', category: 'cpp-render-numeric', name: 'std::floor / std::ceil',
    header: '<cmath>', since: 'C++98', level: 'A',
    brief: '把世界坐标落入规则网格。负半轴也按向下取整选择格子。',
    signature: 'std::floor(worldX / cellWidth)',
    returns: '返回浮点形式的整数。floor 向负无穷取整，ceil 向正无穷取整。',
    pitfall: '格宽须为正，转换到整数索引前要确认结果有限且在目标范围内。直接转 int 在负半轴会向零截断。',
    code: `double worldX = -0.25;
double cellWidth = 2.0;
auto cell = static_cast<int>(std::floor(worldX / cellWidth));  // -1
auto upperEdge = (cell + 1) * cellWidth;  // 0.0`,
    keywords: '空间哈希 体素 tile 网格 分块 负坐标',
    references: [{ label: 'C++20 工作草案 · cmath.syn', url: 'https://timsong-cpp.github.io/cppwp/n4861/cmath.syn' }]
  },
  {
    id: 'float-next', category: 'cpp-render-numeric', name: 'std::nextafter',
    header: '<cmath>、<limits>', since: 'C++11', level: 'B',
    brief: '构造刚好落在裁剪阈值或深度比较边界两侧的测试用例。',
    signature: 'std::nextafter(edge, direction)',
    returns: '返回从 edge 朝 direction 移动一步的可表示浮点值；两个参数相等时返回 direction。',
    pitfall: '这一步的实际长度随数值量级变化。使用同类型参数，以免先提升到 double 再转回 float 时丢掉这一步。',
    code: `float edge = 1.0f;
float inside = std::nextafter(edge, 0.0f);
float outside = std::nextafter(edge, std::numeric_limits<float>::infinity());
// inside < edge < outside`,
    keywords: 'ULP 浮点精度 边界测试 深度 阈值',
    references: [{ label: 'C++20 工作草案 · cmath.syn', url: 'https://timsong-cpp.github.io/cppwp/n4861/cmath.syn' }]
  },
  {
    id: 'publish-release', category: 'cpp-engine-sync', name: 'std::memory_order_release / acquire',
    header: '<atomic>、<thread>', since: 'C++11', level: 'A',
    brief: '后台线程写完资源描述后发布就绪标记，让读取线程看到同一批写入。',
    signature: 'ready.store(true, std::memory_order_release)',
    returns: '读取方的 acquire load 读到这次发布的值后，可以读取发布前写好的普通字段。',
    pitfall: '这是一次发布的例子。重复改写同一对象需要额外同步；CPU 原子操作不能代替 GPU 上传完成通知。',
    code: `int width = 0;
std::atomic<bool> ready{false};
std::thread loader([&] {
    width = 256;
    ready.store(true, std::memory_order_release);
});
if (ready.load(std::memory_order_acquire)) {
    int visibleWidth = width;
}
loader.join();`,
    keywords: '内存序 资源发布 可见性 加载线程 happens-before',
    references: [{ label: 'C++20 工作草案 · atomics.order', url: 'https://timsong-cpp.github.io/cppwp/n4861/atomics.order' }]
  },
  {
    id: 'load-latch', category: 'cpp-engine-sync', name: 'std::latch',
    header: '<latch>、<thread>、<array>', since: 'C++20', level: 'A',
    brief: '两份资源可以并行准备，消费方等整个批次完成后再读结果。',
    signature: 'done.count_down(); done.wait();',
    returns: 'count_down 递减计数；wait 在计数为零时返回，均返回 void。',
    pitfall: 'latch 只能使用一轮，每份工作包括失败路径都要报告完成。计数不代表任务成功，错误结果应另外保存。',
    code: `std::latch done{2};
std::array<int, 2> sizes{};
std::jthread mesh([&] { sizes[0] = 12; done.count_down(); });
std::jthread texture([&] { sizes[1] = 64; done.count_down(); });
done.wait();
auto total = sizes[0] + sizes[1];`,
    keywords: '倒计时 批加载 作业依赖 join 后台加载',
    references: [{ label: 'C++20 工作草案 · thread.latch', url: 'https://timsong-cpp.github.io/cppwp/n4861/thread.latch' }]
  },
  {
    id: 'phase-barrier', category: 'cpp-engine-sync', name: 'std::barrier',
    header: '<barrier>、<thread>', since: 'C++20', level: 'B',
    brief: '物理模拟的两个工作线程在每个子步结束时会合，再开始下一阶段。',
    signature: 'phase.arrive_and_wait();',
    returns: '参与者抵达后等待本轮完成。下一轮复用同一个 barrier。',
    pitfall: '每轮必须凑齐约定的参与者。永久退出的线程应按协议 arrive_and_drop。在线程池里阻塞所有工作线程可能让尚未调度的参与者无从运行。',
    code: `std::barrier phase{2};
auto simulate = [&] {
    for (int step = 0; step < 4; ++step) {
        // 更新本线程负责的数据分片
        phase.arrive_and_wait();
    }
};
std::jthread worker(simulate);
simulate();`,
    keywords: '物理 子步 阶段 屏障 帧同步 工作线程',
    references: [{ label: 'C++20 工作草案 · thread.barrier.class', url: 'https://timsong-cpp.github.io/cppwp/n4861/thread.barrier.class' }]
  },
  {
    id: 'atomic-wait-ready', category: 'cpp-engine-sync', name: 'std::atomic::wait / notify_all',
    header: '<atomic>、<thread>', since: 'C++20', level: 'B',
    brief: '让读取线程在资源状态仍为 Pending 时等待，避免显式循环轮询。',
    signature: 'state.wait(oldState, std::memory_order_acquire);',
    returns: 'wait 在观察到值与 oldState 不同后返回。notify_all 唤醒可能在该原子上等待的线程。',
    pitfall: '生产者先写新状态，再通知。短暂变化后恢复旧值可能被错过；一次性状态或单调版本号更合适。',
    code: `std::atomic<int> state{0};
std::jthread loader([&] {
    state.store(1, std::memory_order_release);
    state.notify_all();
});
state.wait(0, std::memory_order_acquire);  // 已发布则直接返回`,
    keywords: '资源就绪 唤醒 异步等待 原子等待 ABA',
    references: [{ label: 'C++20 工作草案 · atomics.wait', url: 'https://timsong-cpp.github.io/cppwp/n4861/atomics.wait' }]
  }
];
