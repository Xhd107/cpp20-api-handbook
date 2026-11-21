export const algorithmApis = [
  {
    id: 'ranges-sort', category: 'algorithm', name: 'std::ranges::sort', header: '<algorithm>', since: 'C++20', level: 'A',
    brief: '直接对整个范围排序，也可提供比较函数和投影。传统 std::sort 则接收迭代器对。',
    signature: 'std::ranges::sort(range, compare, projection);',
    returns: '返回排序后范围的尾迭代器。',
    pitfall: '默认升序；范围必须满足随机访问等要求。相等元素的相对顺序不保证稳定，需要稳定排序时用 ranges::stable_sort。',
    code: `std::vector<Face> faces = loadFaces();

std::ranges::sort(faces, {}, &Face::materialId);

std::ranges::sort(faces, std::ranges::greater{},
                  [](const Face& f) { return f.area; });`,
    keywords: '排序 sort stable_sort greater 投影 C++20'
  },
  {
    id: 'find-if', category: 'algorithm', name: 'std::ranges::find / find_if', header: '<algorithm>', since: 'C++20', level: 'A',
    brief: '查找第一个等于目标值或满足谓词的元素。传统 find/find_if 使用迭代器对。',
    signature: 'auto it = std::ranges::find_if(range, predicate);',
    returns: '返回指向首个匹配元素的迭代器；没有匹配时返回 range 的尾后位置。',
    pitfall: '使用返回迭代器前必须与 end() 比较。find_if 只找第一个，不会自动遍历处理所有匹配项。',
    code: `const auto invalid = std::ranges::find_if(
    face.v,
    [vertexCount](std::int32_t index) {
        return index < 0 || index >= vertexCount;
    }
);

if (invalid != face.v.end()) {
    const auto corner = std::distance(face.v.begin(), invalid);
}`,
    keywords: '查找 谓词 非法索引 迭代器 find_if'
  },
  {
    id: 'ranges-equal', category: 'algorithm', name: 'std::ranges::equal', header: '<algorithm>', since: 'C++20', level: 'B',
    brief: '判断两个范围是否逐元素相等，可自定义比较规则和投影。',
    signature: 'bool same = std::ranges::equal(a, b, predicate);',
    returns: '两个范围长度相同且所有对应元素比较成功时返回 true。',
    pitfall: 'Lambda 中的字符转换要注意 unsigned char。只比较前缀是否相同可考虑 mismatch 或 starts_with。',
    code: `bool sameExtension = std::ranges::equal(
    extension, ".obj",
    [](char lhs, char rhs) {
        return std::tolower(static_cast<unsigned char>(lhs)) ==
               std::tolower(static_cast<unsigned char>(rhs));
    }
);`,
    keywords: '比较 范围 相等 扩展名 Lambda'
  },
  {
    id: 'all-any-none', category: 'algorithm', name: 'all_of / any_of / none_of', header: '<algorithm>', since: 'C++11 / C++20 ranges', level: 'A',
    brief: '分别判断“全部满足”“至少一个满足”“全部不满足”。',
    signature: 'std::ranges::all_of(range, predicate);',
    returns: '返回 bool；空范围上 all_of 和 none_of 为 true，any_of 为 false。',
    pitfall: '空范围的逻辑结果容易出乎意料。需要找到具体元素时改用 find_if，需要数量时用 count_if。',
    code: `bool valid = std::ranges::all_of(
    mesh.faces,
    [&](const Face& face) {
        return std::ranges::all_of(face.v, [&](int i) {
            return i >= 0 &&
                static_cast<std::size_t>(i) < mesh.vertices.size();
        });
    }
);`,
    keywords: '全部 任一 都不 谓词 校验'
  },
  {
    id: 'count-if', category: 'algorithm', name: 'count / count_if', header: '<algorithm>', since: 'C++98 / C++20 ranges', level: 'B',
    brief: '统计等于某值或满足条件的元素数量。',
    signature: 'auto n = std::ranges::count_if(range, predicate);',
    returns: '返回范围的差值类型，通常可转换为 std::size_t 保存非负数量。',
    pitfall: 'count_if 必须遍历范围。关联容器统计键可优先考虑成员 count()，它通常能利用容器内部结构。',
    code: `const auto opaqueCount = std::ranges::count_if(
    mesh.faces,
    [](const Face& face) { return !face.transparent; }
);`,
    keywords: '统计 数量 计数 谓词 count_if'
  },
  {
    id: 'algorithm-transform', category: 'algorithm', name: 'std::ranges::transform', header: '<algorithm>', since: 'C++20', level: 'B',
    brief: '把输入元素逐个转换并立即写入输出迭代器，是积极求值算法，不是惰性视图。',
    signature: 'std::ranges::transform(input, output, operation);',
    returns: '返回包含输入停止位置和输出停止位置的结果对象（单范围形式为 in_out_result）。',
    pitfall: '输出位置必须有足够可写空间；vector 为空时不能简单传 begin()，可用 back_inserter 或先 resize。只想遍历转换结果时优先 views::transform。',
    code: `std::vector<Vec3> input = loadVertices();
std::vector<Vec3> output;
output.reserve(input.size());

std::ranges::transform(
    input, std::back_inserter(output),
    [](const Vec3& v) { return v * 2.0f; }
);`,
    keywords: '转换 映射 back_inserter 积极求值'
  },
  {
    id: 'copy-if', category: 'algorithm', name: 'std::ranges::copy_if', header: '<algorithm>', since: 'C++20', level: 'B',
    brief: '把满足条件的元素复制到输出位置，适合确实需要新容器的筛选。',
    signature: 'auto result = std::ranges::copy_if(input, output, predicate);',
    returns: '返回输入和输出的停止位置。',
    pitfall: '与 transform 一样要准备输出空间。只是遍历筛选结果而不保存时，views::filter 更轻量。',
    code: `std::vector<Face> validFaces;
validFaces.reserve(mesh.faces.size());

std::ranges::copy_if(
    mesh.faces, std::back_inserter(validFaces),
    [](const Face& face) { return face.valid; }
);`,
    keywords: '复制 筛选 新容器 back_inserter'
  },
  {
    id: 'remove-if', category: 'algorithm', name: 'remove_if + erase', header: '<algorithm> + 容器头文件', since: 'C++98 / C++20 ranges', level: 'B',
    brief: '传统 erase-remove 写法：remove_if 重排保留下来的元素，erase 再删除尾部逻辑失效区域。',
    signature: 'container.erase(std::ranges::remove_if(container, pred).begin(), container.end());',
    returns: 'ranges::remove_if 返回保留范围及相关位置信息；erase 返回被删除区域之后的迭代器。',
    pitfall: 'remove_if 名字虽叫 remove，但单独调用不会改变容器大小。C++20 支持的容器直接用 std::erase_if 更清楚。',
    code: `std::vector<int> values{1, -2, 3, -4};

values.erase(
    std::remove_if(values.begin(), values.end(),
                   [](int n) { return n < 0; }),
    values.end()
);

// C++20 简写：std::erase_if(values, [](int n) { return n < 0; });`,
    keywords: '删除 erase remove remove_if 惯用法'
  },
  {
    id: 'accumulate', category: 'algorithm', name: 'std::accumulate', header: '<numeric>', since: 'C++98', level: 'A',
    brief: '从初值出发依次合并范围内所有元素，常用于求和、求积或构建复杂结果。',
    signature: 'T result = std::accumulate(first, last, initial, operation);',
    returns: '返回累计结果，结果类型主要受初值类型影响。',
    pitfall: '累加 double 时初值应写 0.0 而不是 0。求大面积或大量数值时要考虑溢出和浮点误差；空范围返回初值。',
    code: `double totalArea = std::accumulate(
    mesh.faces.begin(), mesh.faces.end(), 0.0,
    [](double sum, const Face& face) {
        return sum + face.area;
    }
);`,
    keywords: '求和 累计 折叠 numeric 初值'
  },
  {
    id: 'min-max', category: 'algorithm', name: 'std::min / max / minmax', header: '<algorithm>', since: 'C++98 / C++11', level: 'A',
    brief: '求两个值或一组值中的较小者、较大者，或同时求两者。',
    signature: 'auto result = std::minmax(a, b);',
    returns: 'min()/max() 返回 const 引用；minmax() 返回 pair<const T&, const T&>。',
    pitfall: '两个参数必须能形成一致类型。对临时值保存返回引用可能产生悬垂，简单数值可直接 auto 复制结果。',
    code: `const std::size_t shown =
    std::min(requestedCount, mesh.faces.size());

const auto [low, high] = std::minmax(minValue, maxValue);`,
    keywords: '最小值 最大值 边界 minmax'
  },
  {
    id: 'clamp', category: 'algorithm', name: 'std::clamp', header: '<algorithm>', since: 'C++17', level: 'A',
    brief: '把值限制在 [low, high] 区间内，常用于颜色、纹理坐标和相机参数。',
    signature: 'T result = std::clamp(v, low, high);',
    returns: '返回 v、low 或 high 中合适的 const 引用。',
    pitfall: 'low 必须不大于 high，否则行为未定义。若传入临时对象，立即使用或复制结果，不要长期保存返回引用。',
    code: `float u = std::clamp(rawU, 0.0f, 1.0f);
int samples = std::clamp(requestedSamples, 1, 64);`,
    keywords: '限制 区间 饱和 uv 颜色'
  },
  {
    id: 'lower-bound', category: 'algorithm', name: 'lower_bound / upper_bound', header: '<algorithm>', since: 'C++98 / C++20 ranges', level: 'B',
    brief: '在已排序范围中二分查找插入位置，也可配合 binary_search 判断存在性。',
    signature: 'auto pos = std::ranges::lower_bound(sortedRange, value);',
    returns: 'lower_bound 返回首个不小于 value 的位置；upper_bound 返回首个大于 value 的位置。',
    pitfall: '范围必须按相同比较规则有序，否则结果没有意义。找到 lower_bound 后仍需比较位置是否 end() 以及元素是否真的相等。',
    code: `std::vector<int> ids{1, 3, 5, 8};
auto pos = std::ranges::lower_bound(ids, 5);

bool found = pos != ids.end() && *pos == 5;
bool alsoFound = std::ranges::binary_search(ids, 5);`,
    keywords: '二分查找 有序 lower_bound upper_bound binary_search'
  },
  {
    id: 'distance', category: 'algorithm', name: 'std::distance / std::next', header: '<iterator>', since: 'C++98 / C++11', level: 'B',
    brief: '计算迭代器间距离，或把迭代器向前移动指定步数。',
    signature: 'auto n = std::distance(first, last);',
    returns: 'distance 返回迭代器差值类型；next 返回移动后的迭代器。',
    pitfall: '对单向或输入迭代器，distance 可能消耗遍历过程；随机访问迭代器是 O(1)。移动前必须保证不会越过合法边界。',
    code: `const auto corner = static_cast<std::size_t>(
    std::distance(face.v.begin(), invalid)
);

auto second = std::next(face.v.begin());`,
    keywords: '迭代器 距离 下标 next advance'
  },

  {
    id: 'views-filter', category: 'ranges', name: 'std::views::filter', header: '<ranges>', since: 'C++20', level: 'A',
    brief: '惰性保留满足条件的元素，不创建新容器。',
    signature: 'auto view = range | std::views::filter(predicate);',
    returns: '返回一个过滤视图，可继续接其他视图或在范围 for 中遍历。',
    pitfall: '视图通常引用原范围，原范围不能先销毁。每次遍历都会按视图逻辑求值，不是把结果永久缓存。',
    code: `auto validFaces = mesh.faces | std::views::filter(
    [](const Face& face) { return face.valid; }
);

for (const Face& face : validFaces) {
    render(face);
}`,
    keywords: '过滤 筛选 惰性 视图 管道'
  },
  {
    id: 'views-transform', category: 'ranges', name: 'std::views::transform', header: '<ranges>', since: 'C++20', level: 'A',
    brief: '惰性把每个元素映射为另一个值，常与 filter 组合。',
    signature: 'auto view = range | std::views::transform(function);',
    returns: '返回转换视图，遍历时才调用转换函数。',
    pitfall: '它与 ranges::transform 算法不同：视图不主动写入输出容器。返回引用时要确保引用对象在视图使用期间仍有效。',
    code: `auto squares = std::views::iota(1, 6)
    | std::views::transform([](int n) { return n * n; });

for (int value : squares) {
    // 1, 4, 9, 16, 25
}`,
    keywords: '映射 转换 惰性 视图 iota'
  },
  {
    id: 'views-take-drop', category: 'ranges', name: 'std::views::take / drop', header: '<ranges>', since: 'C++20', level: 'A',
    brief: 'take 只取前 N 个元素，drop 跳过前 N 个元素。',
    signature: 'auto view = range | std::views::take(n);',
    returns: '返回新的视图；N 超过长度时 take 到末尾，drop 后为空。',
    pitfall: '不需要自己计算结束迭代器，但视图仍不拥有数据。take_while/drop_while 则按条件处理开头一段。',
    code: `const std::size_t shown =
    std::min(count, mesh.faces.size());

for (const Face& face : mesh.faces | std::views::take(shown)) {
    printFace(face);
}`,
    keywords: '前几个 跳过 take drop 分页'
  },
  {
    id: 'views-reverse', category: 'ranges', name: 'std::views::reverse', header: '<ranges>', since: 'C++20', level: 'B',
    brief: '以相反顺序遍历双向范围，不修改原容器。',
    signature: 'auto reversed = range | std::views::reverse;',
    returns: '返回反向视图。',
    pitfall: '原范围必须支持双向遍历。它不会真的反转容器；需要修改顺序时用 ranges::reverse 算法。',
    code: `for (const Face& face : mesh.faces | std::views::reverse) {
    // 从最后一个面向前遍历
}`,
    keywords: '反向 逆序 遍历 视图'
  },
  {
    id: 'views-iota', category: 'ranges', name: 'std::views::iota', header: '<ranges>', since: 'C++20', level: 'A',
    brief: '生成连续递增的整数或其他可递增值，可替代许多只用于计数的普通 for 循环。',
    signature: 'auto indices = std::views::iota(0, count);',
    returns: '返回 [start, bound) 序列；只给一个边界时形成无限序列，必须配合 take 等限制。',
    pitfall: '上边界不包含在结果内。无限 iota 没有终点，直接范围 for 会一直循环。',
    code: `for (std::size_t i : std::views::iota(std::size_t{0}, mesh.faces.size())) {
    std::cout << std::format("face {}: {}\\n", i, mesh.faces[i]);
}`,
    keywords: '序列 下标 循环 生成 无限'
  },
  {
    id: 'views-keys-values', category: 'ranges', name: 'std::views::keys / values', header: '<ranges>', since: 'C++20', level: 'B',
    brief: '从 map 等 pair-like 元素范围中分别取键或值。',
    signature: 'for (const auto& key : table | std::views::keys) {}',
    returns: '返回键或值的视图，不复制整个映射。',
    pitfall: '遍历时不要进行会使原映射迭代器失效的插入或删除。需要排序时请明确选择有序 map。',
    code: `for (const std::string& name : materials | std::views::keys) {
    std::cout << name << '\n';
}

for (const Material& material : materials | std::views::values) {
    upload(material);
}`,
    keywords: 'map 键 值 遍历 pair'
  },
  {
    id: 'views-split', category: 'ranges', name: 'std::views::split', header: '<ranges>', since: 'C++20', level: 'B',
    brief: '按分隔符把范围切成子范围，可用于简单文本拆分。',
    signature: 'auto parts = text | std::views::split(delimiter);',
    returns: '返回子范围视图，每个部分通常还需转换成 string_view 或 string 才能方便使用。',
    pitfall: 'C++20 split 对接口和范围类型有约束，空字段与尾部分隔符行为要先验证。OBJ 的任意空白分词通常自定义 nextToken 更直接。',
    code: `std::string text = "1/2/3";
for (auto part : text | std::views::split('/')) {
    std::string_view token(part.begin(), part.end());
    // 再对 token 调用 from_chars
}`,
    keywords: '分割 split 分隔符 字符串 token'
  }
];
