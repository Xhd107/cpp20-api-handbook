export const categories = [
  { id: 'text', title: '字符串与数值转换', description: '文本观察、拆分、格式化，以及字符串与数字之间的转换。' },
  { id: 'sequence', title: '顺序容器与访问窗口', description: '保存顶点、面、索引等连续或顺序数据。' },
  { id: 'associative', title: '关联容器', description: '按键保存和查找数据，处理去重、映射与索引表。' },
  { id: 'utility', title: '值、对象与通用工具', description: '表达可选值、多种类型、对象组合和移动语义。' },
  { id: 'algorithm', title: '常用算法', description: '排序、查找、统计、转换、删除与数值累计。' },
  { id: 'ranges', title: 'Ranges 与视图', description: '用惰性视图遍历、筛选、分组或拼接范围，按需收集到拥有存储的容器。' },
  { id: 'io', title: '文件系统与输入输出', description: '路径、目录、文件流、控制台与错误处理。' },
  { id: 'memory', title: '内存与资源所有权', description: '用智能指针表达独占、共享和弱引用关系。' },
  { id: 'preprocessor', title: '预处理与宏', description: '配置条件编译，追踪记号展开，并检查日志、断言和公共头文件中的宏。' },
  { id: 'lambda', title: 'Lambda 与回调', description: '从局部函数、捕获和排序谓词，到移动任务、弱引用回调与协程的生命周期。' },
  { id: 'numeric', title: '时间、随机数、数学与位操作', description: '计时、随机采样、常用数学函数和 C++20 位工具。' },
  { id: 'concurrency', title: '并发基础', description: '线程、互斥、原子变量、条件变量和异步任务。' },
  { id: 'types', title: '类型、模板与诊断', description: '固定宽度整数、类型信息、Concepts、异常和错误码。' }
];

export const coreApis = [
  {
    id: 'string', category: 'text', name: 'std::string', header: '<string>', since: 'C++98', level: 'A',
    brief: '拥有并管理字符数据的动态字符串。适合需要保存、修改和返回文本的场景。',
    signature: 'std::string text = "hello";',
    returns: 'size() 返回字符数；substr() 返回新的 string；c_str() 返回以空字符结尾的指针。',
    pitfall: 'c_str() 返回的指针不能越过字符串生命周期；字符串修改或重新分配后，旧指针可能失效。string 按字节计数，不等于 UTF-8 字符数。',
    code: `std::string line = "  v 1 2 3";
line.push_back('!');
line += "  end";

std::string copy = line.substr(0, 2);
const char* raw = line.c_str();`,
    keywords: '字符串 拥有 修改 substr c_str append push_back'
  },
  {
    id: 'string-view', category: 'text', name: 'std::string_view', header: '<string_view>', since: 'C++17', level: 'A',
    brief: '不拥有数据的只读字符串窗口。适合函数参数、切片和解析，避免不必要的复制。',
    signature: 'std::string_view view = text;',
    returns: 'find() 返回位置或 npos；substr() 返回新的 string_view；starts_with()/ends_with() 返回 bool。',
    pitfall: '原字符串必须比视图活得更久，且不能悬垂。starts_with() 和 ends_with() 是 C++20 新增；data() 指向的内容不保证以 \\0 结尾。',
    code: `std::string line = "v 1.0 2.0 3.0";
std::string_view rest = line;

rest.remove_prefix(2);
bool isVertex = std::string_view{line}.starts_with("v ");

if (rest.find_first_not_of(" \\t") == std::string_view::npos) {
    // 空行或全空白行
}`,
    keywords: '字符串视图 切片 find substr starts_with ends_with remove_prefix npos'
  },
  {
    id: 'cctype-case', category: 'text', name: 'std::tolower / std::toupper', header: '<cctype>', since: 'C++98', level: 'B',
    brief: '按当前 C 区域设置转换单个字符的大小写，常用于扩展名的 ASCII 不区分大小写比较。',
    signature: 'int lower = std::tolower(static_cast<unsigned char>(ch));',
    returns: '返回转换后的字符值；没有对应转换时返回原值。返回类型是 int。',
    pitfall: '普通 char 为负值时不能直接传入（EOF 除外），先转换为 unsigned char。它不是完整的 Unicode 大小写转换方案。',
    code: `char asciiLower(char ch) {
    return static_cast<char>(
        std::tolower(static_cast<unsigned char>(ch))
    );
}

bool same = asciiLower('A') == asciiLower('a');`,
    keywords: '大小写 扩展名 字符 unsigned char ascii'
  },
  {
    id: 'from-chars', category: 'text', name: 'std::from_chars', header: '<charconv>', since: 'C++17', level: 'A',
    brief: '把字符序列解析为整数或浮点数。不抛异常、不分配内存，适合高性能解析器。',
    signature: 'auto result = std::from_chars(first, last, value);',
    returns: '返回 from_chars_result{ptr, ec}。ptr 指向首个未转换字符；ec 为 std::errc{} 表示没有错误。',
    pitfall: '它不跳过前导空白，也不接受前导 + 号。必须同时检查 ec 和 ptr == last，才能确保整个片段都是一个合法数字。',
    code: `bool parseInt(std::string_view text, int& value) {
    const char* first = text.data();
    const char* last = first + text.size();
    auto [ptr, ec] = std::from_chars(first, last, value);
    return ec == std::errc{} && ptr == last;
}`,
    keywords: '数字 解析 整数 浮点 ptr ec errc parser'
  },
  {
    id: 'to-chars', category: 'text', name: 'std::to_chars', header: '<charconv>', since: 'C++17', level: 'B',
    brief: '把整数或浮点数写入调用者提供的字符缓冲区，是 from_chars 的反向工具。',
    signature: 'auto result = std::to_chars(first, last, value);',
    returns: '返回 to_chars_result{ptr, ec}；成功时 ptr 指向写入区域末尾之后，失败时 ec 指示错误。',
    pitfall: '缓冲区由你提供，函数不会追加 \\0。缓冲区太小会得到 value_too_large。构造 string_view 时应使用写入后的长度。',
    code: `char buffer[64];
auto [ptr, ec] = std::to_chars(
    buffer, buffer + sizeof buffer, 12345
);

if (ec == std::errc{}) {
    std::string_view text(buffer, ptr - buffer);
}`,
    keywords: '数字 转字符串 缓冲区 序列化 无分配'
  },
  {
    id: 'stoi-stod', category: 'text', name: 'std::stoi / std::stol / std::stod', header: '<string>', since: 'C++11', level: 'B',
    brief: '把 string 转为整数或浮点数，接口简单，适合配置读取和非热点代码。',
    signature: 'int value = std::stoi(text, &position);',
    returns: '返回转换后的数字；可通过 position 获知停止位置。输入无效抛 invalid_argument，越界抛 out_of_range。',
    pitfall: '会跳过前导空白，可能接受部分字符串。要严格解析整个输入，应检查 position == text.size()，或优先使用 from_chars。',
    code: `const std::string text = "123abc";
std::size_t used = 0;
int value = std::stoi(text, &used);
// value == 123, used == 3

bool consumedAll = used == text.size(); // false`,
    keywords: '字符串 转数字 异常 stoi stod stol position'
  },
  {
    id: 'stringstream', category: 'text', name: 'std::istringstream / std::ostringstream', header: '<sstream>', since: 'C++98', level: 'B',
    brief: '把字符串当作输入或输出流，适合简单分词和兼容流式组合的代码。',
    signature: 'std::istringstream input(text);',
    returns: '提取运算符返回流自身，可转换为 bool 判断成功与否；str() 返回内部字符串。',
    pitfall: 'operator>> 默认按空白分词，区域设置和格式化状态会影响结果。高性能 OBJ 解析通常优先 string_view + from_chars。',
    code: `std::istringstream input("v 1.5 2.5 3.5");
std::string tag;
double x = 0, y = 0, z = 0;

if (input >> tag >> x >> y >> z) {
    // 四个字段都提取成功
}`,
    keywords: '字符串流 分词 拼接 ostringstream istringstream'
  },
  {
    id: 'getline', category: 'text', name: 'std::getline', header: '<string>', since: 'C++98', level: 'A',
    brief: '从输入流读取一整行，保留行内空格并丢弃行尾分隔符。',
    signature: 'while (std::getline(file, line)) { /* ... */ }',
    returns: '返回输入流引用；放入 while 条件时，读取成功就继续，失败或到达末尾则结束。',
    pitfall: 'Windows 文本模式通常会自动处理 CRLF；处理其他来源的文本时，末尾可能残留 \\r。混用 operator>> 后要注意换行符仍留在流中。',
    code: `std::string line;
std::size_t lineNumber = 0;

while (std::getline(file, line)) {
    ++lineNumber;
    if (line.empty()) continue;
    // 解析这一行
}`,
    keywords: '逐行 读取 文件 空格 cin ifstream'
  },
  {
    id: 'format', category: 'text', name: 'std::format', header: '<format>', since: 'C++20', level: 'A',
    brief: '类型安全的格式化字符串工具，用 {} 占位并支持对齐、进制和浮点精度。',
    signature: 'std::string text = std::format("value: {:.3f}", value);',
    returns: '返回格式化后的 std::string；格式不匹配时抛 std::format_error。',
    pitfall: '格式串应在编译期可检查的场景下使用字面量；运行期动态格式串应使用 std::vformat。输出到流可配合 std::format_to 等工具。',
    code: `std::string message = std::format(
    "face {} refers to vertex {}", faceIndex, vertexIndex
);

std::string matrix = std::format("{:8.3f}", 3.1415926);
// 保留三位小数，总宽度至少为 8`,
    keywords: '格式化 字符串 占位符 精度 对齐 C++20'
  },

  {
    id: 'vector', category: 'sequence', name: 'std::vector', header: '<vector>', since: 'C++98', level: 'A',
    brief: '连续存储的动态数组。绝大多数数量可变的顺序数据都优先从 vector 开始。',
    signature: 'std::vector<T> values;',
    returns: 'size() 返回元素数；capacity() 返回容量；push_back()/emplace_back() 在末尾添加；data() 返回连续内存指针。',
    pitfall: 'reserve() 只改容量，resize() 才改元素数量。扩容可能使指针、引用和迭代器失效；size() 为 0 时不要访问 front()/back()。',
    code: `struct Mesh {
    std::vector<Vec3> vertices;
    std::vector<Face> faces;
};

mesh.vertices.reserve(1024);
mesh.vertices.push_back(vertex);
mesh.vertices.emplace_back(x, y, z);`,
    keywords: '动态数组 连续内存 push_back emplace_back reserve resize capacity'
  },
  {
    id: 'array', category: 'sequence', name: 'std::array', header: '<array>', since: 'C++11', level: 'A',
    brief: '编译期固定长度的数组，大小是类型的一部分，没有动态容量管理。',
    signature: 'std::array<T, N> values{};',
    returns: 'size() 恒为 N；begin()/end() 提供迭代器；data() 返回连续内存指针。',
    pitfall: 'N 不能运行期改变。用花括号 {} 做值初始化可避免内置类型元素保持未初始化；越界用 at() 可抛异常，operator[] 不检查。',
    code: `struct Face {
    std::array<std::int32_t, 3> v{};
};

Face face{{0, 1, 2}};
static_assert(face.v.size() == 3);`,
    keywords: '固定数组 三角面 三个顶点 连续内存'
  },
  {
    id: 'deque', category: 'sequence', name: 'std::deque', header: '<deque>', since: 'C++98', level: 'B',
    brief: '支持在首尾高效增删的双端队列，支持下标访问，但不要求所有元素连续存储。',
    signature: 'std::deque<T> values;',
    returns: 'push_front()/push_back() 添加元素；front()/back() 访问首尾；size() 返回元素数。',
    pitfall: '它不是 vector 的通用替代品。需要连续内存、span 或 C API 数据指针时应选 vector/array。',
    code: `std::deque<std::string> pending;
pending.push_back("second.obj");
pending.push_front("first.obj");

std::string next = std::move(pending.front());
pending.pop_front();`,
    keywords: '双端队列 队首 队尾 push_front pop_front'
  },
  {
    id: 'list', category: 'sequence', name: 'std::list', header: '<list>', since: 'C++98', level: 'C',
    brief: '双向链表，适合频繁在中间插入删除且必须保持其他元素迭代器稳定的特殊场景。',
    signature: 'std::list<T> values;',
    returns: 'insert()/erase() 在迭代器位置操作；splice() 可在链表间转移元素。',
    pitfall: '不支持 operator[]，逐个访问有额外指针和缓存开销。没有明确理由时，通常优先 vector。',
    code: `std::list<int> values{1, 2, 4};
auto pos = values.begin();
std::advance(pos, 2);
values.insert(pos, 3); // 1, 2, 3, 4`,
    keywords: '链表 插入 删除 splice 迭代器稳定'
  },
  {
    id: 'stack-queue', category: 'sequence', name: 'std::stack / std::queue', header: '<stack> / <queue>', since: 'C++98', level: 'B',
    brief: '容器适配器：stack 后进先出，queue 先进先出，只暴露当前数据结构需要的操作。',
    signature: 'std::stack<T> history; std::queue<T> pending;',
    returns: 'stack 用 top()；queue 用 front()/back()；二者都用 push()/emplace()/pop()。',
    pitfall: 'pop() 不返回元素，必须先取 top() 或 front() 再 pop()。空容器上访问或弹出都是未定义行为。',
    code: `std::queue<std::filesystem::path> pending;
pending.push("a.obj");

auto path = std::move(pending.front());
pending.pop();`,
    keywords: '栈 队列 LIFO FIFO top front pop'
  },
  {
    id: 'priority-queue', category: 'sequence', name: 'std::priority_queue', header: '<queue>', since: 'C++98', level: 'B',
    brief: '始终能快速取得优先级最高元素的堆，常用于任务调度、搜索和渲染队列。',
    signature: 'std::priority_queue<T, Container, Compare> queue;',
    returns: 'top() 返回堆顶；push()/emplace() 添加；pop() 删除堆顶。',
    pitfall: '默认使用 less，所以“最大”的元素在堆顶。需要最小堆时传入 greater<T>；top() 是 const 引用。',
    code: `std::priority_queue<
    int, std::vector<int>, std::greater<int>
> minHeap;

minHeap.push(8);
minHeap.push(3);
int smallest = minHeap.top(); // 3`,
    keywords: '优先队列 堆 最大堆 最小堆 greater'
  },
  {
    id: 'span', category: 'sequence', name: 'std::span', header: '<span>', since: 'C++20', level: 'A',
    brief: '连续内存的非拥有视图，把 vector、array 或 C 数组统一成只读或可写参数。',
    signature: 'void read(std::span<const T> values);',
    returns: 'size() 返回元素数；data() 返回指针；subspan() 返回子视图；front()/back() 访问首尾。',
    pitfall: 'span 不延长底层数据生命周期，也不拥有内存。只读参数写 span<const T>；需要表达一维连续窗口时才使用它。',
    code: `FaceStatus parseFace(
    std::string_view rest,
    std::span<const Vec3> vertices,
    std::vector<Face>& outFaces
);

parseFace(rest, mesh.vertices, mesh.faces);`,
    keywords: '连续内存 视图 非拥有 subspan C++20'
  },
  {
    id: 'erase-container', category: 'sequence', name: 'std::erase / std::erase_if', header: '容器对应头文件', since: 'C++20', level: 'B',
    brief: '直接从 vector、string 等支持的容器中删除等于某值或满足条件的元素。',
    signature: 'auto removed = std::erase_if(container, predicate);',
    returns: '返回被删除的元素数量，类型为容器的 size_type。',
    pitfall: '这是 C++20 的非成员函数，不是所有容器都有同一套重载。关联容器也有对应 erase_if；旧写法 erase(remove_if(...)) 仍很常见。',
    code: `std::vector<int> indices{0, -1, 2, 8, -3};

auto removed = std::erase_if(indices, [](int index) {
    return index < 0;
});
// indices == {0, 2, 8}, removed == 2`,
    keywords: '删除 元素 erase_if remove_if C++20'
  },

  {
    id: 'map', category: 'associative', name: 'std::map', header: '<map>', since: 'C++98', level: 'A',
    brief: '按键排序保存唯一键值对的平衡搜索树，适合需要有序遍历的映射。',
    signature: 'std::map<Key, Value> table;',
    returns: 'find() 返回迭代器；insert()/emplace() 插入；erase() 删除；lower_bound() 找首个不小于键的位置。',
    pitfall: '查找、插入和删除通常为 O(log N)。键的比较规则决定等价关系；只要不需要排序，通常 unordered_map 的平均查找更快。',
    code: `std::map<std::string, int> materialIndex;
materialIndex.insert_or_assign("metal", 2);

if (auto it = materialIndex.find("metal");
    it != materialIndex.end()) {
    int index = it->second;
}`,
    keywords: '映射 字典 有序 键值对 红黑树'
  },
  {
    id: 'unordered-map', category: 'associative', name: 'std::unordered_map', header: '<unordered_map>', since: 'C++11', level: 'A',
    brief: '基于哈希表的无序键值映射，适合快速按键查找且不关心遍历顺序的数据。',
    signature: 'std::unordered_map<Key, Value> table;',
    returns: 'find() 返回迭代器；reserve() 预留桶相关容量；insert_or_assign() 插入或覆盖。',
    pitfall: '平均查找 O(1)，最坏可到 O(N)。自定义键需要合适的哈希和相等比较；不要依赖遍历顺序。',
    code: `std::unordered_map<std::string, std::size_t> ids;
ids.reserve(128);
ids.insert_or_assign("default", 0);

if (auto it = ids.find("default"); it != ids.end()) {
    std::size_t id = it->second;
}`,
    keywords: '哈希表 无序映射 快速查找 hash'
  },
  {
    id: 'set', category: 'associative', name: 'std::set / std::unordered_set', header: '<set> / <unordered_set>', since: 'C++98 / C++11', level: 'A',
    brief: '保存唯一元素。set 有序，unordered_set 使用哈希且不保证顺序。',
    signature: 'std::set<T> ordered; std::unordered_set<T> unique;',
    returns: 'insert() 返回是否插入等信息；find() 查找；erase() 删除；contains() 在 C++20 起直接返回 bool。',
    pitfall: '重复插入不会制造第二份相同元素。需要保留出现次数时应考虑 multiset 或另外维护计数。',
    code: `std::unordered_set<int> validIndices{0, 1, 2};

if (validIndices.contains(index)) {
    // 索引已经存在
}

auto [pos, inserted] = validIndices.insert(3);`,
    keywords: '集合 去重 唯一 有序 无序 contains'
  },
  {
    id: 'contains', category: 'associative', name: 'container.contains(key)', header: '关联容器对应头文件', since: 'C++20', level: 'A',
    brief: '判断键或元素是否存在，替代 find(key) != end() 的重复样板。',
    signature: 'if (table.contains(key)) { /* ... */ }',
    returns: '返回 bool，存在为 true。',
    pitfall: '适用于 map、set 及其 unordered/multi 版本等关联容器，不是 vector 的成员。之后还要取值时，一次 find() 可能避免二次查找。',
    code: `if (!materials.contains(materialName)) {
    materials.emplace(materialName, nextId++);
}

// 需要立即使用迭代器时：
auto it = materials.find(materialName);
if (it != materials.end()) { /* 使用 it */ }`,
    keywords: '存在 判断 map set C++20 find'
  },
  {
    id: 'map-access', category: 'associative', name: 'operator[] / at / insert_or_assign', header: '<map> / <unordered_map>', since: 'C++98 / C++11 / C++17', level: 'A',
    brief: '三种常见的映射访问方式：自动创建、严格读取、插入或覆盖。',
    signature: 'table[key]; table.at(key); table.insert_or_assign(key, value);',
    returns: 'operator[] 和 at() 返回映射值引用；insert_or_assign() 返回迭代器和是否插入的标志。',
    pitfall: 'operator[] 在键不存在时会值初始化新元素，const 映射不能使用；at() 不存在时抛 out_of_range。只检查存在性用 contains()。',
    code: `std::map<std::string, int> counts;
++counts["vertex"]; // 不存在则先创建 0，再加一

counts.insert_or_assign("vertex", 10);
int value = counts.at("vertex");`,
    keywords: 'map 下标 at 插入 覆盖 默认值'
  },

  {
    id: 'optional', category: 'utility', name: 'std::optional', header: '<optional>', since: 'C++17', level: 'A',
    brief: '表示“可能有值，也可能没有值”，适合解析结果、查找结果和可缺失配置。',
    signature: 'std::optional<T> maybeValue;',
    returns: 'has_value() 或 if (value) 判断；value() 取值；value_or() 提供默认值；nullopt 表示空。',
    pitfall: '空 optional 上调用 value() 会抛 bad_optional_access；operator* 不检查。不要用 *maybe 读取尚未确认存在的值。',
    code: `std::optional<Vec3> parseVertex(std::string_view rest);

if (auto vertex = parseVertex(rest)) {
    mesh.vertices.push_back(*vertex);
} else {
    reportInvalidLine();
}`,
    keywords: '可选值 空值 nullopt 解析 返回值'
  },
  {
    id: 'variant', category: 'utility', name: 'std::variant', header: '<variant>', since: 'C++17', level: 'B',
    brief: '同一时刻保存若干指定类型中的一种，适合封闭集合的结果或消息类型。',
    signature: 'std::variant<A, B> value;',
    returns: 'std::get<T>() 取值；std::get_if<T>() 返回指针或 nullptr；std::visit() 按当前类型访问。',
    pitfall: '取错类型时 get() 抛 bad_variant_access。variant 不是任意类型容器；任意类型擦除是 any 的领域。',
    code: `using Number = std::variant<int, double>;
Number value = 3.5;

if (const auto* number = std::get_if<double>(&value)) {
    std::cout << *number;
}`,
    keywords: '多类型 联合体 类型安全 visit get_if'
  },
  {
    id: 'any', category: 'utility', name: 'std::any', header: '<any>', since: 'C++17', level: 'C',
    brief: '保存可复制构造的任意单值类型，并保留运行期类型信息。',
    signature: 'std::any value = 42;',
    returns: 'has_value() 判断是否有值；type() 返回类型信息；any_cast<T>() 取值。',
    pitfall: '取错类型会抛 bad_any_cast。它带来类型擦除和潜在分配开销，封闭类型集合优先 variant。',
    code: `std::any setting = std::string{"high"};

if (const auto* text = std::any_cast<std::string>(&setting)) {
    std::cout << *text;
}`,
    keywords: '任意类型 类型擦除 any_cast'
  },
  {
    id: 'pair-tuple', category: 'utility', name: 'std::pair / std::tuple', header: '<utility> / <tuple>', since: 'C++98 / C++11', level: 'A',
    brief: '把两个或多个值组合成一个对象，常用于多返回值和关联容器元素。',
    signature: 'std::pair<A, B> two; std::tuple<Ts...> many;',
    returns: 'pair 用 first/second；tuple 用 get<N>() 或 get<T>()；结构化绑定可直接解包。',
    pitfall: '字段有明确业务含义时，具名 struct 通常比 tuple 更可读。结构化绑定默认按值复制，需要引用时写 auto& 或 const auto&。',
    code: `std::pair<bool, Mesh> loadOBJ(std::string_view path);

auto [ok, mesh] = loadOBJ(path);

auto [low, high] = std::minmax(3, 7);`,
    keywords: '多返回值 元组 结构化绑定 first second get'
  },
  {
    id: 'move', category: 'utility', name: 'std::move', header: '<utility>', since: 'C++11', level: 'A',
    brief: '把表达式转换为右值，使移动构造或移动赋值可以接管资源。它本身不搬运数据。',
    signature: 'destination = std::move(source);',
    returns: '返回移除引用后的右值引用类型，真正发生什么由目标类型的移动操作决定。',
    pitfall: '移动后的对象仍有效，但状态通常未指定；除非类型另有保证，不要继续使用其旧值。返回局部对象时一般直接 return local，不要多余地 std::move。',
    code: `Mesh mesh = buildMesh();
outMesh = std::move(mesh);

std::vector<Face> faces;
faces.push_back(std::move(face));`,
    keywords: '移动语义 右值 资源转移 vector string'
  },
  {
    id: 'forward', category: 'utility', name: 'std::forward', header: '<utility>', since: 'C++11', level: 'C',
    brief: '在转发引用模板中保持实参原有的左值或右值属性，主要用于完美转发。',
    signature: 'target(std::forward<T>(argument));',
    returns: '按模板参数 T 返回对应的左值或右值引用。',
    pitfall: '普通业务代码很少需要。不要在同一参数可能再次使用时提前 forward，否则可能把已经移动的对象交给后续逻辑。',
    code: `template<typename T>
void store(T&& value) {
    values.push_back(std::forward<T>(value));
}`,
    keywords: '完美转发 转发引用 模板 右值'
  },
  {
    id: 'swap', category: 'utility', name: 'std::swap', header: '<utility>', since: 'C++98', level: 'B',
    brief: '交换两个同类型对象的值，常利用移动操作高效交换资源。',
    signature: 'std::swap(a, b);',
    returns: '无返回值。',
    pitfall: '对象必须满足相应可移动或可交换要求。标准容器还有成员 swap，通常提供明确的常数时间保证。',
    code: `std::vector<Face> current;
std::vector<Face> next;
build(next);
current.swap(next); // 常数时间交换内部资源`,
    keywords: '交换 swap 容器 移动'
  },
  {
    id: 'function', category: 'utility', name: 'std::function', header: '<functional>', since: 'C++11', level: 'B',
    brief: '用统一类型保存函数、Lambda、函数对象等可复制可调用目标。',
    signature: 'std::function<Return(Args...)> callback;',
    returns: 'operator() 调用目标；转换为 bool 可判断是否为空。',
    pitfall: '类型擦除可能带来分配和调用开销；空调用会抛 bad_function_call。模板参数或 auto 参数在不需要类型擦除时更轻量。',
    code: `using ErrorHandler = std::function<void(std::string_view)>;

ErrorHandler onError = [](std::string_view message) {
    std::cerr << message << '\n';
};

if (onError) onError("invalid face");`,
    keywords: '回调 函数对象 Lambda 类型擦除'
  },
];
