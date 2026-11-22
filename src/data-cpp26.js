export const cpp26Apis = [
  {
    id: 'small-inplace', category: 'sequence', name: 'std::inplace_vector',
    header: '<inplace_vector>', since: 'C++26', level: 'A',
    featureTest: '__cpp_lib_inplace_vector >= 202406L',
    brief: '把容量上限已知的局部光源列表内嵌到对象中，只构造实际使用的元素。',
    signature: 'std::inplace_vector<LightId, 8> lights;',
    returns: 'size 随插入增长，capacity 固定。try_push_back 成功返回新元素指针，容量不足返回空指针。',
    pitfall: '普通 push_back 超容量会抛出 bad_alloc。对象大小包含其全部容量，较大的 N 会提高栈或组件的占用。',
    code: `std::inplace_vector<unsigned, 2> lights;
lights.push_back(4);
lights.push_back(7);
auto* extra = lights.try_push_back(9);  // nullptr`,
    keywords: '固定容量 小数组 内嵌 光源列表',
    references: [{ label: '工作草案 · inplace.vector', url: 'https://timsong-cpp.github.io/cppwp/n5050/inplace.vector' }]
  },
  {
    id: 'entity-hive', category: 'sequence', name: 'std::hive',
    header: '<hive>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_hive >= 202502L',
    brief: '保存频繁创建和销毁的实体组件，同时保留其他存活元素的地址。',
    signature: 'auto it = entities.emplace(value);',
    returns: 'emplace 返回迭代器。容器按块存储，可以复用删除留下的位置。',
    pitfall: '遍历顺序不能作为创建顺序。删除元素会使指向该元素的引用失效；主动整理存储也要检查失效规则。',
    code: `std::hive<int> entities;
auto hero = entities.emplace(42);
auto temp = entities.emplace(7);
entities.erase(temp);
int activeId = *hero;`,
    keywords: '实体池 ECS 稳定地址 稀疏 删除',
    references: [{ label: '工作草案 · hive', url: 'https://timsong-cpp.github.io/cppwp/n5050/hive' }]
  },
  {
    id: 'callback-function-ref', category: 'utility', name: 'std::function_ref',
    header: '<functional>', since: 'C++26', level: 'A',
    featureTest: '__cpp_lib_function_ref >= 202306L',
    brief: '给同步遍历函数传入借用的回调，避免为短期调用建立拥有型包装器。',
    signature: 'std::function_ref<void(int)>',
    returns: '保存对既有可调用目标的访问方式，调用时转发参数。',
    pitfall: '包装器不延长目标对象的生命周期。排入异步队列时应显式取得所有权。',
    code: `int total = 0;
auto accumulate = [&](int vertices) { total += vertices; };
std::function_ref<void(int)> visit{accumulate};
visit(3);`,
    keywords: '借用 回调 遍历 生命周期',
    references: [{ label: '工作草案 · func.wrap.ref', url: 'https://timsong-cpp.github.io/cppwp/n5050/func.wrap.ref' }]
  },
  {
    id: 'typed-copyable-fn', category: 'utility', name: 'std::copyable_function',
    header: '<functional>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_copyable_function >= 202306L',
    brief: '保存可复制的回调，并让函数签名表达 const 调用和 noexcept 要求。',
    signature: 'std::copyable_function<int(int) const noexcept>',
    returns: '可复制包装器，调用结果由所声明的函数签名决定。',
    pitfall: '目标须满足指定签名。调用空包装器违反前置条件，注册可选回调时要先检查。',
    code: `std::copyable_function<int(int) const noexcept> cost =
    [base = 2](int n) noexcept { return base * n; };
auto copy = cost;
int result = copy(3);`,
    keywords: '回调 注册表 noexcept const 复制',
    references: [{ label: '工作草案 · func.wrap.copy', url: 'https://timsong-cpp.github.io/cppwp/n5050/func.wrap.copy' }]
  },
  {
    id: 'span-checked', category: 'cpp-buffer', name: 'std::span::at',
    header: '<span>、<array>', since: 'C++26', level: 'A',
    featureTest: '__cpp_lib_span >= 202311L',
    brief: '为编辑器从外部传入的材质槽号提供带边界检查的访问。',
    signature: 'slots.at(index)',
    returns: '有效时返回元素引用，越界时抛出 std::out_of_range。',
    pitfall: '无异常项目应在下标访问前显式检查 size()。at 只能检查索引，无法判断底层存储是否仍然有效。',
    code: `std::array<int, 2> materials{12, 15};
std::span<int> slots{materials};
slots.at(1) = 18;`,
    keywords: '检查 访问窗口 越界 编辑器 索引',
    references: [{ label: '工作草案 · span.elem', url: 'https://timsong-cpp.github.io/cppwp/n5050/span.elem' }]
  },
  {
    id: 'range-concat', category: 'ranges', name: 'std::views::concat',
    header: '<ranges>、<array>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_ranges_concat >= 202403L',
    brief: '依次遍历两个来源的可见实例列表，无需为合并结果另建数组。',
    signature: 'std::views::concat(staticIds, movingIds)',
    returns: '得到惰性拼接视图，按各输入范围的顺序遍历。',
    pitfall: '输入的引用类型等必须满足兼容性约束。即便两个输入都连续，拼接结果也不能当作一块连续上传内存。',
    code: `std::array<int, 2> staticIds{1, 2};
std::array<int, 1> movingIds{7};
int sum = 0;
for (int id : std::views::concat(staticIds, movingIds)) sum += id;`,
    keywords: '拼接 合并 惰性 范围 批次',
    references: [{ label: '工作草案 · range.concat', url: 'https://timsong-cpp.github.io/cppwp/n5050/range.concat' }]
  },
  {
    id: 'optional-iteration', category: 'ranges', name: 'std::optional 的范围接口',
    header: '<optional>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_optional_range_support >= 202406L',
    brief: '把可能缺失的一项组件当作长度为零或一的范围，复用遍历代码。',
    signature: 'for (auto& item : maybeItem)',
    returns: '有值时遍历一次，无值时循环体不运行。引用直接指向 optional 中的对象。',
    pitfall: 'reset、重新构造或销毁原 optional 会影响先前取得的引用或迭代器。',
    code: `std::optional<int> selected = 7;
for (int& id : selected) {
    id += 1;
}  // 原 optional 中的值变为 8`,
    keywords: '可选组件 单项视图 编辑器 选中项',
    references: [{ label: '工作草案 · optional.iterators', url: 'https://timsong-cpp.github.io/cppwp/n5050/optional.iterators' }]
  },
  {
    id: 'constexpr-stable-sort', category: 'algorithm', name: '编译期 std::stable_sort',
    header: '<algorithm>、<array>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_constexpr_algorithms >= 202306L',
    brief: '构建编译期渲染阶段表，同优先级的项保留声明顺序。',
    signature: 'constexpr auto table = buildTable();',
    returns: '常量求值期间就能完成稳定排序，排序结果可用于 static_assert。',
    pitfall: '比较器与输入操作都要能够常量求值。运行时 GPU 资源不能作为编译期排序输入。',
    code: `constexpr auto table = [] {
    std::array<int, 4> keys{3, 0, 2, 1};
    std::stable_sort(keys.begin(), keys.end(), [](int a, int b) {
        return a / 2 < b / 2;
    });
    return keys;
}();
static_assert(table[0] == 0 && table[2] == 3);`,
    keywords: '编译期 烘焙 渲染阶段 稳定排序 常量表达式',
    references: [{ label: '工作草案 · stable.sort', url: 'https://timsong-cpp.github.io/cppwp/n5050/stable.sort' }]
  },
  {
    id: 'linalg-dot', category: 'numeric', name: 'std::linalg::dot',
    header: '<linalg>、<mdspan>、<array>、<cstddef>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_linalg >= 202311L',
    brief: '对两个一维 mdspan 求点积，将存储布局与数值算法接口分开。',
    signature: 'std::linalg::dot(a, b)',
    returns: '返回对应元素乘积之和。复数输入需要共轭内积时可查 dotc。',
    pitfall: '两个输入的长度必须一致。数值算法可能改变求和顺序，浮点结果不宜要求逐位相同。',
    code: `std::array<float, 3> a{1, 2, 3}, b{4, 5, 6};
using Vec = std::mdspan<float, std::extents<std::size_t, 3>>;
auto value = std::linalg::dot(Vec{a.data()}, Vec{b.data()});  // 32`,
    keywords: '线性代数 BLAS 点积 向量 多维视图',
    references: [{ label: '工作草案 · linalg.algs.blas1.dot', url: 'https://timsong-cpp.github.io/cppwp/n5050/linalg.algs.blas1.dot' }]
  },
  {
    id: 'debug-attached', category: 'types', name: 'std::is_debugger_present / breakpoint_if_debugging',
    header: '<debugging>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_debugging >= 202403L',
    brief: '给资产校验失败处增加条件断点，方便在调试器中查看原始状态。',
    signature: 'std::breakpoint_if_debugging();',
    returns: 'is_debugger_present 查询是否检测到调试器；条件断点在检测到调试器时触发。',
    pitfall: '调试器可能随时连接或分离。需要记录的错误仍应写入诊断渠道，条件断点用于交互排查。',
    code: `bool invalidMesh = false;
if (invalidMesh) {
    std::breakpoint_if_debugging();
}`,
    keywords: '调试器 断点 诊断 资产校验',
    references: [{ label: '工作草案 · debugging', url: 'https://timsong-cpp.github.io/cppwp/n5050/debugging' }]
  },
  {
    id: 'tile-submdspan', category: 'cpp-buffer', name: 'std::submdspan',
    header: '<mdspan>、<array>、<cstddef>', since: 'C++26', level: 'A',
    featureTest: '__cpp_lib_submdspan >= 202306L',
    brief: '从二维纹理中借用一行像素，保留父视图的实际步长。',
    signature: 'std::submdspan(image, row, std::full_extent)',
    returns: '得到共享原存储的低维视图。固定一个下标消去该维，full_extent 保留整维。',
    pitfall: '切片坐标必须在范围内，视图不延长底层内存寿命。列视图可能带步长，不能假定元素连续。',
    code: `std::array<float, 6> data{};
std::mdspan<float, std::extents<std::size_t, 2, 3>> image{data.data()};
auto row = std::submdspan(image, 1, std::full_extent);
row[2] = 0.5f;  // 修改 data[5]`,
    keywords: '切片 纹理行 ROI atlas 子视图',
    references: [{ label: '工作草案 · mdspan.sub', url: 'https://timsong-cpp.github.io/cppwp/n5050/mdspan.sub' }]
  },
  {
    id: 'pack-index', category: 'types', name: '包索引（pack indexing）',
    header: '<type_traits>', since: 'C++26', level: 'B',
    featureTest: '__cpp_pack_indexing >= 202311L',
    brief: '在编译期从组件类型包中按固定序号选取一种类型。',
    signature: 'Types...[I]',
    returns: '类型包索引得到选中的类型；也可对适当的表达式包取索引。',
    pitfall: '索引必须是可在编译期确定的有效位置。运行时的组件编号需要另一种分派方式。',
    code: `// 模板定义放在命名空间作用域
template<unsigned I, class... Types>
using ComponentAt = Types...[I];
static_assert(std::is_same_v<ComponentAt<1, int, float>, float>);`,
    keywords: '类型包 编译期索引 ECS 模板 元编程',
    references: [{ label: '工作草案 · dcl.type.pack.index', url: 'https://timsong-cpp.github.io/cppwp/n5050/dcl.type.pack.index' }]
  }
];
