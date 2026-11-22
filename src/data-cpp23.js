export const cpp23Apis = [
  {
    id: 'asset-expected', category: 'utility', name: 'std::expected / std::unexpected',
    header: '<expected>、<string_view>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_expected >= 202202L',
    brief: '让资源解析同时表达成功值与可处理的失败原因。',
    signature: 'std::expected<int, ParseError>',
    returns: '有值时通过 *result 访问；失败时通过 error() 读取错误。',
    pitfall: '访问前先判别状态。value() 在失败时抛出 bad_expected_access；operator* 要求对象已有值。',
    code: `enum class ParseError { missingName };
auto parse = [](std::string_view name) -> std::expected<int, ParseError> {
    if (name.empty()) return std::unexpected(ParseError::missingName);
    return 42;
};
auto asset = parse("albedo");`,
    keywords: '错误处理 资源加载 失败原因',
    references: [{ label: '工作草案 · expected', url: 'https://timsong-cpp.github.io/cppwp/n4950/expected' }]
  },
  {
    id: 'optional-transform', category: 'utility', name: 'std::optional::transform / and_then / or_else',
    header: '<optional>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_optional >= 202110L',
    brief: '把可缺省的配置值转换成运行时单位，并保留缺省状态。',
    signature: 'maybeWidth.transform(convert)',
    returns: 'transform 包装转换结果；and_then 接续返回 optional 的操作；or_else 在缺值时提供另一个 optional。',
    pitfall: '普通转换使用 transform；回调本身返回 optional 时使用 and_then，避免生成双层 optional。',
    code: `std::optional<float> widthCm = 25.f;
auto widthM = widthCm.transform([](float cm) { return cm * 0.01f; });
auto resolved = widthM.or_else([] { return std::optional{1.f}; });`,
    keywords: '链式 可选值 单位转换 回退',
    references: [{ label: '工作草案 · optional.monadic', url: 'https://timsong-cpp.github.io/cppwp/n4950/optional.monadic' }]
  },
  {
    id: 'texture-mdspan', category: 'cpp-buffer', name: 'std::mdspan / std::extents',
    header: '<mdspan>、<array>、<cstddef>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_mdspan >= 202207L',
    brief: '把连续的纹理数据作为二维像素矩阵访问，避免散落的行列地址计算。',
    signature: 'std::mdspan<float, std::extents<std::size_t, 2, 3>>',
    returns: '建立借用存储的多维视图。默认 layout_right 使最右侧下标连续。',
    pitfall: '示例使用紧密排列的行。含行填充的上传缓冲应设置匹配实际步长的 layout_stride 映射。',
    code: `std::array<float, 6> pixels{};
std::mdspan<float, std::extents<std::size_t, 2, 3>> image(pixels.data());
image[1, 2] = 0.5f;  // 对应 pixels[5]`,
    keywords: '纹理 像素 多维数组 行跨度 row pitch',
    references: [{ label: '工作草案 · mdspan.mdspan', url: 'https://timsong-cpp.github.io/cppwp/n4950/mdspan.mdspan' }]
  },
  {
    id: 'asset-byteswap', category: 'cpp-buffer', name: 'std::byteswap',
    header: '<bit>、<cstdint>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_byteswap >= 202110L',
    brief: '将资产文件里的固定宽度整数从文件字节序转换到宿主约定。',
    signature: 'std::byteswap(value)',
    returns: '返回同类型整数，各字节顺序反转。',
    pitfall: '只在文件和主机字节序相反时交换。操作要求整数类型没有填充位；逐字段转换，不能翻转整个结构体。',
    code: `constexpr std::uint32_t input = 0x11223344u;
static_assert(std::byteswap(input) == 0x44332211u);`,
    keywords: '大小端 文件头 序列化 字节翻转',
    references: [{ label: '工作草案 · bit.byteswap', url: 'https://timsong-cpp.github.io/cppwp/n4950/bit.byteswap' }]
  },
  {
    id: 'render-underlying', category: 'types', name: 'std::to_underlying',
    header: '<utility>、<cstdint>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_to_underlying >= 202102L',
    brief: '取出作用域枚举的底层值，用于受控的格式转换或索引。',
    signature: 'std::to_underlying(format)',
    returns: '返回枚举声明的底层整数类型。',
    pitfall: '要写入持久化文件，应固定枚举底层类型与各项编号。磁盘值转回枚举时仍需检查允许的取值。',
    code: `enum class Format : std::uint8_t { rgba8 = 1, depth32 = 2 };
static_assert(std::to_underlying(Format::depth32) == 2);`,
    keywords: '序列化 枚举 底层类型 渲染格式',
    references: [{ label: '工作草案 · utility.underlying', url: 'https://timsong-cpp.github.io/cppwp/n4950/utility.underlying' }]
  },
  {
    id: 'task-move-fn', category: 'utility', name: 'std::move_only_function',
    header: '<functional>、<memory>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_move_only_function >= 202110L',
    brief: '将持有独占上传数据的回调移入任务队列。',
    signature: 'std::move_only_function<int()>',
    returns: '封装可调用目标，可移动；调用包装器得到目标的返回值。',
    pitfall: '调用空包装器违反前置条件。移动后的包装器也应先检查，再决定是否调用。',
    code: `auto payload = std::make_unique<int>(42);
std::move_only_function<int()> task = [p = std::move(payload)] { return *p; };
int result = task();`,
    keywords: '独占 回调 函数包装 任务队列 move-only',
    references: [{ label: '工作草案 · func.wrap.move', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.wrap.move' }]
  },
  {
    id: 'shader-flat-map', category: 'associative', name: 'std::flat_map',
    header: '<flat_map>、<string>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_flat_map >= 202207L',
    brief: '为构建后频繁读取的小型着色器参数表提供有序查找。',
    signature: 'std::flat_map<std::string, int> bindings;',
    returns: '以有序键序列和对应的值序列维护映射，find 返回迭代器。',
    pitfall: '插入和删除通常需要移动元素，会影响迭代器或引用；遍历时键值对具有代理引用语义。',
    code: `std::flat_map<std::string, int> bindings{{"normal", 1}, {"albedo", 0}};
auto binding = bindings.at("normal");`,
    keywords: '材质参数 绑定表 平坦映射 排序数组',
    references: [{ label: '工作草案 · flat.map', url: 'https://timsong-cpp.github.io/cppwp/n4950/flat.map' }]
  },
  {
    id: 'zip-channels', category: 'ranges', name: 'std::views::zip',
    header: '<ranges>、<array>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_ranges_zip >= 202110L',
    brief: '并排遍历粒子位置和速度两组独立数组。',
    signature: 'std::views::zip(position, velocity)',
    returns: '每步得到一组对应元素的引用，最短输入耗尽时结束。',
    pitfall: '长度不匹配会被截短。要求一一对应的组件数组应先验证数量一致。',
    code: `std::array<float, 2> x{1, 2}, vx{2, 3};
for (auto [position, speed] : std::views::zip(x, vx)) {
    position += speed * 0.5f;
}`,
    keywords: 'SoA 粒子 并行数组 同步遍历',
    references: [{ label: '工作草案 · range.zip', url: 'https://timsong-cpp.github.io/cppwp/n4950/range.zip' }]
  },
  {
    id: 'enumerate-slots', category: 'ranges', name: 'std::views::enumerate',
    header: '<ranges>、<array>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_ranges_enumerate >= 202302L',
    brief: '遍历材质槽时同时取得槽号和可修改的元素。',
    signature: 'std::views::enumerate(slots)',
    returns: '每项包含从零递增的下标和底层元素引用。',
    pitfall: '下标相对于传入视图。先 filter 再 enumerate 得到的是过滤结果中的序号。',
    code: `std::array<int, 3> slots{};
for (auto [index, slot] : std::views::enumerate(slots)) {
    slot = static_cast<int>(index);
}`,
    keywords: '序号 索引 材质槽 编号',
    references: [{ label: '工作草案 · range.enumerate', url: 'https://timsong-cpp.github.io/cppwp/n4950/range.enumerate' }]
  },
  {
    id: 'chunk-indices', category: 'ranges', name: 'std::views::chunk',
    header: '<ranges>、<array>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_ranges_chunk >= 202202L',
    brief: '按三个索引一组遍历独立三角形列表。',
    signature: 'indices | std::views::chunk(3)',
    returns: '得到一系列子范围，最后一组允许短于指定长度。',
    pitfall: '分组大小必须为正。三角形列表的索引数应为三的倍数；三角形带使用不同拓扑规则。',
    code: `std::array<int, 6> indices{0, 1, 2, 2, 3, 0};
for (auto triangle : indices | std::views::chunk(3)) {
    auto firstVertex = triangle.front();
}`,
    keywords: '三角形 索引 分批 分组 拓扑',
    references: [{ label: '工作草案 · range.chunk', url: 'https://timsong-cpp.github.io/cppwp/n4950/range.chunk' }]
  },
  {
    id: 'ranges-materialize', category: 'ranges', name: 'std::ranges::to',
    header: '<ranges>、<vector>、<array>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_ranges_to_container >= 202202L',
    brief: '把可见实例的惰性筛选结果保存成独立的提交列表。',
    signature: 'view | std::ranges::to<std::vector>()',
    returns: '创建并返回目标容器，目标容器拥有物化后的元素。',
    pitfall: '物化可能分配内存；复制指针或 string_view 只会复制借用关系。',
    code: `std::array<int, 4> ids{-1, 2, -1, 3};
auto visible = ids | std::views::filter([](int id) { return id >= 0; })
                   | std::ranges::to<std::vector>();  // {2, 3}`,
    keywords: '物化 收集 视图转容器 绘制列表',
    references: [{ label: '工作草案 · range.utility.conv', url: 'https://timsong-cpp.github.io/cppwp/n4950/range.utility.conv' }]
  },
  {
    id: 'range-contains', category: 'algorithm', name: 'std::ranges::contains / contains_subrange',
    header: '<algorithm>、<array>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_ranges_contains >= 202207L',
    brief: '在小型材质列表中查找 ID，或检查事件流是否包含一段连续标记。',
    signature: 'std::ranges::contains_subrange(events, marker)',
    returns: '返回 bool；空标记序列总是匹配。',
    pitfall: 'contains 对普通范围线性查找。有哈希表或有序映射时优先使用容器本身的查找。',
    code: `std::array<int, 5> events{2, 4, 7, 8, 1};
std::array<int, 2> marker{7, 8};
bool found = std::ranges::contains_subrange(events, marker);`,
    keywords: '查找 子序列 事件标记 连续匹配',
    references: [{ label: '工作草案 · alg.contains', url: 'https://timsong-cpp.github.io/cppwp/n4950/alg.contains' }]
  },
  {
    id: 'debug-println', category: 'io', name: 'std::print / std::println',
    header: '<print>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_print >= 202207L',
    brief: '输出带类型检查的帧诊断信息，无需先构造格式化字符串。',
    signature: 'std::println("frame {}", frame);',
    returns: '默认写入标准输出，println 在末尾加换行，均返回 void。',
    pitfall: '换行不保证立即刷新。高频渲染路径仍要控制输出量，异步日志设施可在其他线程处理 I/O。',
    code: `unsigned frame = 12;
double frameMs = 16.67;
std::println("frame {}: {:.2f} ms", frame, frameMs);`,
    keywords: '日志 帧时间 格式化输出',
    references: [{ label: '工作草案 · print.fun', url: 'https://timsong-cpp.github.io/cppwp/n4950/print.fun' }]
  },
  {
    id: 'span-stream', category: 'io', name: 'std::ispanstream / std::ospanstream',
    header: '<spanstream>、<span>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_spanstream >= 202106L',
    brief: '让已有的流式文本解析逻辑直接读取内存中的资产描述。',
    signature: 'std::ispanstream input{std::span<const char>{data, length}};',
    returns: '提供流提取或插入操作，底层缓冲由调用方持有。',
    pitfall: '长度应覆盖有效字符。输出缓冲不会自动扩容，空间不足时要检查流状态。',
    code: `const char data[] = "128 64";
std::ispanstream input{std::span<const char>{data, sizeof(data) - 1}};
int width{}, height{};
if (input >> width >> height) {
    // 这里得到 128 与 64
}`,
    keywords: '内存流 固定缓冲 导入 解析',
    references: [{ label: '工作草案 · spanstream.syn', url: 'https://timsong-cpp.github.io/cppwp/n4950/spanstream.syn' }]
  },
  {
    id: 'consteval-branch', category: 'types', name: 'if consteval',
    header: '语言特性（无需头文件）', since: 'C++23', level: 'B',
    featureTest: '__cpp_if_consteval >= 202106L',
    brief: '让同一工具在编译期生成查表数据，在运行期使用普通调用路径。',
    signature: 'if consteval { ... } else { ... }',
    returns: '在常量求值中选择第一条分支。该分支可将函数参数传给立即函数。',
    pitfall: '语法要求花括号。constexpr 函数也能在运行期执行，仅有 constexpr 声明不足以确定会走哪个分支。',
    code: `struct Lut {
    static consteval int bake(int n) { return n * n; }
    static constexpr int sample(int n) {
        if consteval { return bake(n); }
        else { return n * n; }
    }
};
static_assert(Lut::sample(4) == 16);`,
    keywords: '立即函数 常量求值 编译期 查表',
    references: [{ label: '工作草案 · stmt.if', url: 'https://timsong-cpp.github.io/cppwp/n4950/stmt.if' }]
  },
  {
    id: 'explicit-object', category: 'types', name: '显式对象参数（deducing this）',
    header: '<utility>、<type_traits>', since: 'C++23', level: 'B',
    featureTest: '__cpp_explicit_this_parameter >= 202110L',
    brief: '给资产包装器写一个访问器，同时保留调用对象的 const 与引用类别。',
    signature: 'get(this Self&& self)',
    returns: '显式对象参数从调用对象推导；decltype(auto) 可保留返回表达式的引用。',
    pitfall: '显式对象成员函数中通过 self 访问成员。临时对象销毁后，指向其成员的引用会悬垂。',
    code: `// 类定义放在命名空间作用域
struct Weight {
    float value;
    decltype(auto) get(this auto&& self) {
        return (std::forward<decltype(self)>(self).value);
    }
};`,
    keywords: '显式 this 完美转发 const 重载 访问器',
    references: [{ label: '工作草案 · dcl.fct', url: 'https://timsong-cpp.github.io/cppwp/n4950/dcl.fct' }]
  },
  {
    id: 'asset-generator', category: 'ranges', name: 'std::generator / co_yield',
    header: '<generator>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_generator >= 202207L',
    brief: '让资源扫描按需产出 ID，调用方可以在找到候选项后停止遍历。',
    signature: 'std::generator<unsigned>',
    returns: '返回单遍输入范围。迭代推进时恢复协程，co_yield 交出当前值。',
    pitfall: '协程可能晚于创建时运行。跨挂起点保留的引用必须持续有效，且同一个 generator 只启动一次。',
    code: `auto scan = []() -> std::generator<unsigned> {
    for (unsigned id = 1; id <= 3; ++id) co_yield id;
};
unsigned first = 0;
for (auto id : scan()) { first = id; break; }`,
    keywords: '协程 生成器 惰性 扫描 输入范围',
    references: [{ label: '工作草案 · coro.generator', url: 'https://timsong-cpp.github.io/cppwp/n4950/coro.generator' }]
  },
  {
    id: 'append-batch', category: 'sequence', name: 'std::vector::append_range',
    header: '<vector>、<array>', since: 'C++23', level: 'A',
    featureTest: '__cpp_lib_containers_ranges >= 202202L',
    brief: '把一整个网格批次的索引追加到已拥有的缓冲区。',
    signature: 'indices.append_range(batch)',
    returns: '在 vector 末尾构造新元素，返回 void。',
    pitfall: '输入范围与目标容器不得重叠。扩容会使已有指针和迭代器失效，能预估总量时先 reserve。',
    code: `std::vector<unsigned> indices{0, 1, 2};
std::array<unsigned, 3> batch{2, 3, 0};
indices.append_range(batch);`,
    keywords: '追加 网格批次 合并范围',
    references: [{ label: '工作草案 · vector.modifiers', url: 'https://timsong-cpp.github.io/cppwp/n4950/vector.modifiers' }]
  }
];
