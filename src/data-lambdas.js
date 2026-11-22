export const lambdaApis = [
  {
    id: 'lambda-local', category: 'lambda', name: '局部 Lambda 与立即调用',
    header: '语言特性（无需头文件）', since: 'C++11', level: 'A',
    brief: '在绘制函数里整理只用一次的 LOD 选择逻辑，直接初始化只读结果。',
    signature: '[captures](parameters) -> Return { body }(arguments)',
    returns: 'Lambda 表达式创建一个闭包对象。末尾 () 才是调用，返回值可用于初始化 const 变量。',
    pitfall: '局部函数对象也能保存后调用。返回指向闭包内部或函数局部变量的引用时，需要额外检查生命周期。',
    code: `float distance = 42.f;
const int lod = [distance] {
    if (distance < 10.f) return 0;
    if (distance < 50.f) return 1;
    return 2;
}();  // 1`,
    keywords: 'lambda 匿名函数 子函数 子函数 匿名函数 IIFE 局部函数 闭包 LOD',
    references: [{ label: '工作草案 · expr.prim.lambda', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda' }]
  },
  {
    id: 'lambda-ref-value', category: 'lambda', name: '按值、按引用和混合捕获',
    header: '<array>', since: 'C++11', level: 'A',
    brief: '用一帧开始时的阈值筛选物体，同时把计数写回局部统计。',
    signature: '[limit, &visible](float distance) { ... }',
    returns: 'limit 在闭包创建时复制，visible 借用原变量。修改外部 limit 不会改变已捕获的数值。',
    pitfall: '按引用捕获不延长对象寿命。延迟回调要特别检查 [&]；按值复制裸指针或视图也不会取得底层存储的所有权。',
    code: `float limit = 20.f;
int visible = 0;
auto count = [limit, &visible](float d) { if (d < limit) ++visible; };
limit = 5.f;
for (float d : std::array<float, 3>{4.f, 12.f, 30.f}) count(d);
// visible 为 2，捕获的阈值仍是 20`,
    keywords: 'lambda 匿名函数 子函数 闭包 捕获列表 捕获时机 生命周期 引用 悬垂',
    references: [{ label: '工作草案 · expr.prim.lambda.capture', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.capture' }]
  },
  {
    id: 'lambda-mutable', category: 'lambda', name: 'mutable 与有状态闭包的复制',
    header: '语言特性（无需头文件）', since: 'C++11', level: 'B',
    brief: '给局部 ID 生成器一份可更新的计数，观察复制后的状态。',
    signature: '[n]() mutable { return ++n; }',
    returns: 'mutable 允许修改按值捕获的成员。复制闭包会复制当时保存的值。',
    pitfall: '算法或回调容器可以复制函数对象。需要唯一计数源时，显式共享状态并处理同步，或传引用。',
    code: `int seed = 7;
auto next = [seed]() mutable { return ++seed; };
int first = next();  // 8
auto other = next;   // 复制闭包及其当前计数 8
int a = next(), b = other();  // 都是 9，外部 seed 仍为 7`,
    keywords: 'lambda 匿名函数 子函数 状态计数 可变 值捕获 副本',
    references: [{ label: '工作草案 · expr.prim.lambda.closure', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.closure' }]
  },
  {
    id: 'lambda-draw-sort', category: 'lambda', name: 'Lambda 比较器与排序键',
    header: '<algorithm>、<array>、<tuple>', since: 'C++11', level: 'A',
    brief: '用一段局部比较逻辑按管线、材质对绘制项分组。',
    signature: 'std::sort(first, last, [](const Draw& a, const Draw& b) { ... })',
    returns: '比较器返回 a 是否应排在 b 之前。std::tie 从左到右比较各个键。',
    pitfall: '使用严格弱序。写成 <= 会让相等的元素同时排在彼此前面，破坏排序算法的前置条件。',
    code: `struct Draw { int pipeline, material; };
std::array<Draw, 3> queue{{{2, 3}, {1, 4}, {1, 2}}};
std::sort(queue.begin(), queue.end(), [](const Draw& a, const Draw& b) {
    return std::tie(a.pipeline, a.material) < std::tie(b.pipeline, b.material);
});  // 第一个绘制项为 {1, 2}`,
    keywords: 'lambda 匿名函数 子函数 比较器 排序 绘制队列 谓词 strict weak ordering',
    references: [{ label: '工作草案 · alg.sorting', url: 'https://timsong-cpp.github.io/cppwp/n4950/alg.sorting' }]
  },
  {
    id: 'lambda-move-task', category: 'lambda', name: '初始化捕获与独占任务',
    header: '<memory>、<utility>', since: 'C++14', level: 'A',
    brief: '把导入缓冲的所有权移入延迟任务，让它可以晚于当前作用域运行。',
    signature: '[data = std::move(buffer)] { ... }',
    returns: '闭包拥有移动进来的 unique_ptr。该闭包可移动，无法复制。',
    pitfall: 'C++11 的 std::function 要求可复制目标。任务队列可用模板移动保存，或在 C++23 使用 std::move_only_function。',
    code: `auto buffer = std::make_unique<int>(36);
auto upload = [data = std::move(buffer)] { return *data; };
auto queued = std::move(upload);
int indexCount = queued();  // 36，buffer 已空`,
    keywords: 'lambda 匿名函数 子函数 移动捕获 init capture 任务队列 move-only 回调',
    references: [{ label: '工作草案 · expr.prim.lambda.capture', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.capture' }]
  },
  {
    id: 'lambda-this', category: 'lambda', name: '[this] 与 [*this] 的对象寿命',
    header: '语言特性（无需头文件）', since: 'C++11 / C++17', level: 'A',
    brief: '区分读取实时相机参数的回调与创建时冻结的相机快照。',
    signature: '[this] { ... }   /   [*this] { ... }',
    returns: '[this] 通过原对象访问成员；C++17 的 [*this] 将当前对象复制进闭包。',
    pitfall: '[=] 在成员函数中隐式捕获 this 也会访问原对象，此写法自 C++20 起弃用。[*this] 按类型的复制语义工作，指针成员仍可能借用外部对象。',
    code: `struct Camera {
    int layer = 1;
    auto live() { return [this] { return layer; }; }
    auto snapshot() { return [*this] { return layer; }; }
};
Camera camera;
auto live = camera.live();
auto snapshot = camera.snapshot();
camera.layer = 3;
int current = live(), saved = snapshot();  // 3 与 1`,
    keywords: 'lambda 匿名函数 子函数 对象捕获 快照 成员函数 指针 浅拷贝',
    references: [{ label: '工作草案 · expr.prim.lambda.capture', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.capture' }]
  },
  {
    id: 'lambda-weak-event', category: 'lambda', name: '弱捕获的异步事件回调',
    header: '<memory>', since: 'C++17', level: 'A',
    brief: '让排队中的回调在目标节点已销毁时自动跳过。',
    signature: '[target = weak_from_this()] { if (auto self = target.lock()) ... }',
    returns: '每次执行时尝试取得强所有权，成功后的局部 shared_ptr 保护对象直到该次处理结束。',
    pitfall: '在 shared_ptr 接管对象后再注册回调。若对象保存自己的回调，强捕获 shared_from_this() 会闭合引用环。weak_ptr 仅保护寿命，不保证线程能安全修改节点。',
    code: `struct Node : std::enable_shared_from_this<Node> {
    int events = 0;
    auto onClick() {
        return [target = weak_from_this()] {
            if (auto self = target.lock()) ++self->events;
        };
    }
};
auto node = std::make_shared<Node>();
auto callback = node->onClick();
callback();     // events 为 1
node.reset();
callback();     // lock 失败，直接结束`,
    keywords: 'lambda 匿名函数 子函数 回调订阅 事件系统 生命周期 弱捕获 循环引用 weak_ptr',
    references: [{ label: '工作草案 · util.smartptr.enab', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.enab' }]
  },
  {
    id: 'lambda-generic', category: 'lambda', name: '泛型 Lambda 与显式模板参数',
    header: '<array>、<cstddef>', since: 'C++14 / C++20', level: 'B',
    brief: '给编译期长度不同的顶点属性数组复用同一个缩放操作。',
    signature: '[]<class T, std::size_t N>(std::array<T, N>& values) { ... }',
    returns: 'C++14 的 auto 形参可推导类型。C++20 显式模板参数还能直接命名并约束元素类型、维数等信息。',
    pitfall: 'auto value 按值传参会复制，修改原数组要用引用。编译器针对实际调用的参数类型实例化函数体。',
    code: `auto scale = []<class T, std::size_t N>(std::array<T, N>& v, T factor) {
    for (auto& x : v) x *= factor;
};
std::array<float, 3> position{1, 2, 3};
scale(position, 2.f);  // {2, 4, 6}`,
    keywords: 'lambda 匿名函数 子函数 模板 lambda 泛型 auto 引用 维度',
    references: [{ label: '工作草案 · expr.prim.lambda', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda' }]
  },
  {
    id: 'lambda-recursion', category: 'lambda', name: '递归 Lambda 与显式对象参数',
    header: '<array>', since: 'C++14 / C++23', level: 'B',
    featureTest: '__cpp_explicit_this_parameter >= 202110L',
    brief: '在场景树遍历函数内部定义递归访问器。',
    signature: '[](this auto&& self, int node) { self(child); }',
    returns: 'C++23 的显式对象参数可以给闭包自身命名。C++14 可改写为 [](auto&& self, int n) 并使用 self(self, child)。',
    pitfall: '递归返回值宜显式标注。若输入可能有环，需先设计访问标记；深度不受控时可改用显式栈。',
    code: `// parent[i] 是节点 i 的父节点，根的父节点为 -1
std::array<int, 4> parent{-1, 0, 0, 2};
auto depth = [&parent](this auto&& self, int node) -> int {
    return parent[node] < 0 ? 0 : 1 + self(parent[node]);
};
int levels = depth(3);  // 2`,
    keywords: 'lambda 匿名函数 子函数 递归 自调用 deducing this 局部函数 遍历 父子树',
    references: [{ label: '工作草案 · expr.prim.lambda', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda' }]
  },
  {
    id: 'lambda-callback-c', category: 'lambda', name: '无捕获 Lambda 转函数指针',
    header: '语言特性（无需头文件）', since: 'C++11', level: 'B',
    brief: '把无状态访问器交给需要函数指针的回调接口。',
    signature: 'int (*callback)(int) = [](int id) { ... };',
    returns: '签名匹配的无捕获 Lambda 可以转换成函数指针；带捕获的闭包需要额外存储环境。',
    pitfall: 'C 接口若提供 void* 用户数据，可通过上下文传状态，并按接口约定保证其生命周期。另需匹配调用约定与异常边界。',
    code: `using Visitor = int (*)(int);
auto visit = [](Visitor fn, int id) { return fn(id); };
int tag = visit([](int id) { return id + 100; }, 7);  // 107`,
    keywords: 'lambda 匿名函数 子函数 C API ABI 回调 函数指针 trampoline 用户数据',
    references: [{ label: '工作草案 · expr.prim.lambda.closure', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.closure' }]
  },
  {
    id: 'lambda-forward', category: 'lambda', name: 'auto&& 参数与完美转发',
    header: '<utility>、<memory>', since: 'C++14', level: 'B',
    brief: '写一个薄的命令包装器，把参数以调用方原本的值类别交给处理函数。',
    signature: 'std::forward<decltype(arg)>(arg)',
    returns: '即使参数声明为 auto&&，具名变量表达式仍是左值；forward 恢复推导出的值类别。',
    pitfall: '同一实参被转发给消费型操作后可能已被移走。需要多次读取时先明确所有权，避免重复转发。',
    code: `auto invokeOne = [](auto&& fn, auto&& arg) -> decltype(auto) {
    return std::forward<decltype(fn)>(fn)(std::forward<decltype(arg)>(arg));
};
auto read = [](std::unique_ptr<int> p) { return *p; };
int result = invokeOne(read, std::make_unique<int>(9));`,
    keywords: 'lambda 匿名函数 子函数 完美转发 泛型 回调包装 转发引用 值类别',
    references: [{ label: '工作草案 · expr.prim.lambda', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda' }]
  },
  {
    id: 'lambda-constexpr', category: 'lambda', name: 'constexpr Lambda 生成静态查找表',
    header: '<array>', since: 'C++17', level: 'B',
    brief: '在编译期生成四档采样数，复用与运行期相同的循环写法。',
    signature: 'constexpr auto samples = [] { ... }();',
    returns: '满足常量求值要求的 Lambda 可在编译期执行，生成可用于 static_assert 的结果。',
    pitfall: '给调用运算符标注 constexpr 只表示允许常量求值。用 constexpr 变量或 static_assert 才会在该处要求编译期结果。',
    code: `constexpr auto samples = [] {
    std::array<unsigned, 4> table{};
    for (unsigned i = 0; i < table.size(); ++i) table[i] = 1u << i;
    return table;
}();
static_assert(samples[3] == 8);`,
    keywords: 'lambda 匿名函数 子函数 编译期 查表 LUT 立即调用 采样',
    references: [{ label: '工作草案 · expr.prim.lambda.closure', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.closure' }]
  },
  {
    id: 'lambda-coroutine', category: 'lambda', name: '协程 Lambda 的捕获寿命',
    header: '<generator>、<memory>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_generator >= 202207L',
    brief: '为延迟生成的网格 ID 保留强所有权，把资源作为值参数传进协程帧。',
    signature: '[](std::shared_ptr<T> data) -> std::generator<int> { co_yield ...; }',
    returns: '按值传入的参数存入协程帧。即使创建它的临时闭包和外部智能指针已销毁，参数仍可在恢复时访问。',
    pitfall: '协程 Lambda 的按值捕获属于闭包。只保留返回的协程对象不能保活临时闭包；捕获 shared_ptr 也有同样问题。',
    code: `auto meshId = std::make_shared<int>(42);
auto ids = [](std::shared_ptr<const int> id) -> std::generator<int> {
    co_yield *id;
}(meshId);
meshId.reset();
int first = 0;
for (int id : ids) first = id;  // 42`,
    keywords: 'lambda 匿名函数 子函数 协程挂起 闭包悬垂 coroutine generator 异步 生命周期',
    references: [{ label: '工作草案 · expr.prim.lambda.capture', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.lambda.capture' }]
  }
];
