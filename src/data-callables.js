export const callableApis = [
  {
    id: 'call-functor', category: 'callables', name: '具名函数对象与 operator()',
    header: '<algorithm>、<array>', since: 'C++98', level: 'A',
    brief: '把视锥剔除的层掩码保存为可重复使用的筛选条件。',
    signature: 'LayerVisible visible{cameraMask}; visible(objectMask);',
    returns: '对象像函数一样调用；掩码作为普通成员随对象保存。相同类型可创建多个不同配置的筛选器。',
    pitfall: '标准算法可能复制函数对象。用于筛选的 operator() 宜为 const，并让同一输入得到一致结果。',
    code: `struct LayerVisible {
    unsigned cameraMask;
    bool operator()(unsigned objectMask) const {
        return (cameraMask & objectMask) != 0;
    }
};
std::array<unsigned, 4> objects{1, 2, 4, 3};
LayerVisible visible{2};
auto count = std::count_if(objects.begin(), objects.end(), visible);  // 2`,
    keywords: '仿函数 闭包 谓词 相机 可见层',
    references: [{ label: '工作草案 · over.call.object', url: 'https://timsong-cpp.github.io/cppwp/n4950/over.call.object' }]
  },
  {
    id: 'call-dispatch-table', category: 'callables', name: '普通函数指针与分派表',
    header: '<array>', since: 'C++98', level: 'A',
    brief: '同一签名的混合操作按枚举编号分派，省去逐项判断。',
    signature: 'using Blend = float (*)(float, float);',
    returns: '查表得到一个函数指针，取出后可用普通函数调用语法执行。',
    pitfall: '表项不能携带每个实例的捕获状态。枚举若来自文件，应在索引前检查边界；调用空函数指针是未定义行为。',
    code: `using Blend = float (*)(float, float);
std::array<Blend, 2> ops{
    [](float a, float b) { return a + b; },
    [](float a, float b) { return a * b; }
};
unsigned mode = 1;
float out = mode < ops.size() ? ops[mode](0.5f, 0.4f) : 0.f;  // 0.2`,
    keywords: '分发表 函数表 策略 回调 函数指针',
    references: [{ label: '工作草案 · expr.call', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.call' }]
  },
  {
    id: 'call-member-ptr', category: 'callables', name: '成员指针、重载与对象绑定',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '选择相机的一种 set 重载，保存后再指定在哪个实例上执行。',
    signature: 'void (Camera::*setInt)(int) = &Camera::set;',
    returns: '成员函数指针包含成员调用信息；通过 (object.*pmf)(args) 或 (ptr->*pmf)(args) 调用。',
    pitfall: '它与普通函数指针类型不同。目标类型需要匹配参数及 const 等限定；重载集需要明确的目标签名。',
    code: `struct Camera {
    int layer = 0;
    void set(int id) { layer = id; }
    void set(float) { /* 另一个重载 */ }
};
void (Camera::*setInt)(int) = &Camera::set;
Camera editor, game;
(game.*setInt)(4);  // 只修改 game`,
    keywords: '成员函数指针 重载选择 绑定实例 delegate',
    references: [{ label: '工作草案 · expr.mptr.oper', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.mptr.oper' }]
  },
  {
    id: 'call-c-context', category: 'callables', name: '函数指针 + void* 上下文',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '给只接受回调地址和用户数据的接口传入实例状态。',
    signature: 'callback(userData, vertexCount);',
    returns: '静态入口用上下文找到原实例。多个注册项可共用入口，各自传自己的上下文。',
    pitfall: '类型转换必须与注册时一致。异步注册需在对象销毁前注销并等待在途回调完成；真实 C 接口还应匹配其语言链接、调用约定与异常规则。',
    code: `struct Stats { int vertices = 0; };
using Callback = void (*)(void*, int);
struct Hook { Callback call; void* context; };
Stats stats;
Hook hook{[](void* p, int n) noexcept {
    static_cast<Stats*>(p)->vertices += n;
}, &stats};
hook.call(hook.context, 36);  // stats.vertices 为 36`,
    keywords: 'C API userdata trampoline 上下文 有状态回调',
    references: [{ label: '工作草案 · expr.call', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.call' }]
  },
  {
    id: 'call-invoke', category: 'callables', name: 'std::invoke 统一调用',
    header: '<functional>', since: 'C++17', level: 'A',
    brief: '用同一入口调用成员函数，或取得成员变量的引用。',
    signature: 'std::invoke(member, object, args...)',
    returns: '成员函数返回其调用结果；成员数据访问保留引用，可直接修改对象。普通函数和闭包也适用。',
    pitfall: '数据成员指针只能取成员，额外传实参会出错。用 auto 保存结果通常会复制，修改原成员须绑定引用。',
    code: `struct Light {
    float power;
    void scale(float k) { power *= k; }
};
Light light{4.f};
std::invoke(&Light::scale, light, 0.5f);
float& output = std::invoke(&Light::power, light);
output += 1.f;  // light.power 为 3`,
    keywords: '统一调用 成员变量 数据成员指针 泛型包装',
    references: [{ label: '工作草案 · func.invoke', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.invoke' }]
  },
  {
    id: 'call-invoke-r', category: 'callables', name: 'std::invoke_r 指定返回类型',
    header: '<functional>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_invoke_r >= 202106L',
    brief: '让不同计数回调都按采样器要求的浮点类型返回；通知接口也可显式丢弃结果。',
    signature: 'std::invoke_r<float>(sample, frame)',
    returns: '按目标类型隐式转换调用结果。R 为 void 时执行调用并丢弃结果。',
    pitfall: '转换仍可能损失精度。要求回调返回精确类型时，应在接口上另行约束。',
    code: `auto coveredPixels = [](int tiles) { return 4 * tiles; };
float pixels = std::invoke_r<float>(coveredPixels, 3);  // 12.f
int notifications = 0;
std::invoke_r<void>([&] { return ++notifications; });`,
    keywords: '泛型调用 结果转换 丢弃返回',
    references: [{ label: '工作草案 · func.invoke', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.invoke' }]
  },
  {
    id: 'call-mem-fn', category: 'callables', name: 'std::mem_fn 把成员包装成回调',
    header: '<functional>、<algorithm>、<array>', since: 'C++11', level: 'B',
    brief: '将组件的成员函数直接交给只接受一元回调的遍历接口。',
    signature: 'auto reset = std::mem_fn(&Emitter::reset);',
    returns: '适配器调用时以第一个参数作为对象，支持匹配的对象、指针和引用包装器。',
    pitfall: '适配器只保存成员指针。实际组件必须在调用时有效，传入空对象指针无法调用成员函数。',
    code: `struct Emitter { int count; void reset() { count = 0; } };
std::array<Emitter, 2> emitters{{{8}, {3}}};
auto reset = std::mem_fn(&Emitter::reset);
std::for_each(emitters.begin(), emitters.end(), reset);`,
    keywords: '组件遍历 成员函数适配器 一元回调',
    references: [{ label: '工作草案 · func.memfn', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.memfn' }]
  },
  {
    id: 'call-ref', category: 'callables', name: 'std::ref / cref / reference_wrapper',
    header: '<functional>、<algorithm>、<array>', since: 'C++11', level: 'A',
    brief: '让按值接收回调的算法更新外部统计对象。',
    signature: 'std::for_each(first, last, std::ref(counter));',
    returns: '复制的是引用包装器，各副本仍调用同一个对象。cref 提供只读引用。',
    pitfall: '引用包装器不会延长对象寿命，也不提供并发保护。异步队列、并行算法都要另行处理生命周期或同步。',
    code: `struct Counter {
    int vertices = 0;
    void operator()(int n) { vertices += n; }
} stats;
std::array<int, 3> batches{3, 6, 9};
std::for_each(batches.begin(), batches.end(), std::ref(stats));
// stats.vertices 为 18`,
    keywords: '引用包装 回调复制 统计对象 借用',
    references: [{ label: '工作草案 · refwrap', url: 'https://timsong-cpp.github.io/cppwp/n4950/refwrap' }]
  },
  {
    id: 'call-bind-front', category: 'callables', name: 'std::bind_front 固定前置参数',
    header: '<functional>', since: 'C++20', level: 'A',
    brief: '把渲染器绑定到成员函数，给队列留下只接收网格 ID 的提交入口。',
    signature: 'std::bind_front(&Renderer::submit, std::ref(renderer))',
    returns: '返回可调用对象。调用时先传入保存的前置参数，再传入本次参数。',
    pitfall: '默认按值保存经退化的实参，直接传 renderer 会保存副本。std::ref 借用原实例，需要它活过包装器。',
    code: `struct Renderer {
    int lastMesh = -1;
    void submit(int mesh) { lastMesh = mesh; }
} renderer;
auto submitMesh = std::bind_front(&Renderer::submit, std::ref(renderer));
submitMesh(17);  // renderer.lastMesh 为 17`,
    keywords: '偏应用 部分绑定 固定接收者 参数适配',
    references: [{ label: '工作草案 · func.bind.partial', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.bind.partial' }]
  },
  {
    id: 'call-bind-back', category: 'callables', name: 'std::bind_back 固定末尾参数',
    header: '<functional>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_bind_back >= 202202L',
    brief: '给多个光照采样复用相同曝光系数，将二元操作适配成一元操作。',
    signature: 'std::bind_back(applyExposure, gain)',
    returns: '返回适配器，执行时将保存的参数放在调用实参之后。',
    pitfall: '普通值参数在绑定时保存。编辑器稍后调整曝光，已有适配器仍使用先前保存的值。',
    code: `auto expose = [](float linear, float gain) { return linear * gain; };
float gain = 2.f;
auto bake = std::bind_back(expose, gain);
gain = 4.f;
float result = bake(0.25f);  // 0.5f`,
    keywords: '偏应用 尾部参数 曝光 固定参数',
    references: [{ label: '工作草案 · func.bind.partial', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.bind.partial' }]
  },
  {
    id: 'call-bind-order', category: 'callables', name: 'std::bind 与 placeholders',
    header: '<functional>', since: 'C++11', level: 'B',
    brief: '读懂已有引擎中用 _1、_2 调整回调参数顺序的代码。',
    signature: 'std::bind(f, std::placeholders::_2, std::placeholders::_1)',
    returns: '占位符指向调用包装器时的实参。普通绑定参数会存进包装器，std::ref 可显式借用。',
    pitfall: '占位符的编号从 1 开始。对同一个可移动实参重复使用占位符时，需要避免多次消费它。',
    code: `using namespace std::placeholders;
auto encode = [](int layer, int slot) { return 100 * layer + slot; };
auto slotThenLayer = std::bind(encode, _2, _1);
int key = slotThenLayer(3, 2);  // encode(2, 3)，结果 203`,
    keywords: '老代码 回调 参数重排 占位符 _1 _2',
    references: [{ label: '工作草案 · func.bind.bind', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.bind.bind' }]
  },
  {
    id: 'call-predicate', category: 'callables', name: 'std::not_fn 与谓词取反',
    header: '<functional>、<algorithm>、<array>', since: 'C++17', level: 'B',
    brief: '已有一个判断资源是否就绪的谓词，复用它统计尚未完成的资源。',
    signature: 'auto pending = std::not_fn(isReady);',
    returns: '调用适配器会将参数转发给原目标，并对结果取逻辑非。',
    pitfall: '标准筛选算法依赖稳定的判断条件。把领取任务、修改对象等副作用留在处理阶段。',
    code: `struct Asset { bool ready; };
std::array<Asset, 3> assets{{{true}, {false}, {false}}};
auto pending = std::not_fn(&Asset::ready);
auto missing = std::count_if(assets.begin(), assets.end(), pending);  // 2`,
    keywords: '谓词组合 反向筛选 未加载资源',
    references: [{ label: '工作草案 · func.not.fn', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.not.fn' }]
  },
  {
    id: 'call-projection', category: 'callables', name: 'Ranges 投影与成员字段',
    header: '<algorithm>、<array>、<functional>', since: 'C++20', level: 'A',
    brief: '按材质字段排序，再按另一个字段查找，不必为每个字段重写比较器。',
    signature: 'std::ranges::sort(draws, {}, &Draw::material)',
    returns: '投影先从元素取出键，比较器再比较键。find 返回原始绘制项的迭代器。',
    pitfall: '相同排序键之间的原顺序不受 sort 保证。投影可能被重复调用，昂贵的键可预先计算。',
    code: `struct Draw { int id, material; };
std::array<Draw, 3> draws{{{10, 4}, {20, 1}, {30, 2}}};
std::ranges::sort(draws, {}, &Draw::material);
auto hit = std::ranges::find(draws, 30, &Draw::id);
// draws[0].id 为 20，hit 指向 id 为 30 的绘制项`,
    keywords: '比较器 projection 排序键 字段查询',
    references: [{ label: '工作草案 · alg.sort', url: 'https://timsong-cpp.github.io/cppwp/n4950/alg.sort' }]
  },
  {
    id: 'call-apply', category: 'callables', name: 'std::apply 展开参数包',
    header: '<tuple>', since: 'C++17', level: 'A',
    brief: '将排队保存的分派参数拆开，交给原有的三参数计算函数。',
    signature: 'std::apply(dispatch, groupCounts)',
    returns: '按元组元素的顺序构造一次函数调用，返回目标的结果。',
    pitfall: '按值保存元组只复制其中的值；若元素是指针或引用，延迟执行前须再次检查其寿命。',
    code: `auto dispatch = [](unsigned x, unsigned y, unsigned z) { return x * y * z; };
auto groupCounts = std::tuple{8u, 4u, 2u};
unsigned groups = std::apply(dispatch, groupCounts);  // 64`,
    keywords: 'tuple 解包 元组 参数展开 延迟调用',
    references: [{ label: '工作草案 · tuple.apply', url: 'https://timsong-cpp.github.io/cppwp/n4950/tuple.apply' }]
  },
  {
    id: 'call-overload-visitor', category: 'callables', name: '重载函数对象处理 variant 命令',
    header: '<variant>', since: 'C++17', level: 'A',
    brief: '使用具名重载为不同渲染命令提供独立处理分支。',
    signature: 'std::visit(Visitor{}, command)',
    returns: '按当前持有的命令类型选出可调用重载，并返回该次结果。',
    pitfall: '每种备选类型都需要可调用的分支。使用窄类型重载或隐式转换时要留意误匹配，分支返回类型和值类别也需一致。',
    code: `struct Draw { int vertices; };
struct Clear {};
struct Cost {
    int operator()(const Draw& d) const { return d.vertices; }
    int operator()(const Clear&) const { return 0; }
};
std::variant<Draw, Clear> command = Draw{36};
int vertices = std::visit(Cost{}, command);  // 36`,
    keywords: '访问者 visitor 分派 重载集 绘制命令',
    references: [{ label: '工作草案 · variant.visit', url: 'https://timsong-cpp.github.io/cppwp/n4950/variant.visit' }]
  },
  {
    id: 'call-templated', category: 'callables', name: '模板回调入口与 std::invocable',
    header: '<functional>、<concepts>、<array>', since: 'C++20', level: 'A',
    brief: '编写同步遍历入口，允许调用方传 Lambda、仿函数或普通函数。',
    signature: 'requires std::invocable<F&, int>',
    returns: '约束在编译期检查调用形式；在循环中以左值反复调用同一对象，不需要复制或擦除类型。',
    pitfall: 'F&& 接收临时回调仅在本次调用期间有效。如果接口改成异步保存，需要重新设计所有权。',
    code: `// 模板定义在命名空间作用域
template<class F> requires std::invocable<F&, int>
void forEachVisible(const std::array<int, 3>& ids, F&& visit) {
    for (int id : ids) if (id >= 0) std::invoke(visit, id);
}
// 调用示例
int sum = 0;
forEachVisible({2, -1, 5}, [&](int id) { sum += id; });  // 7`,
    keywords: '同步回调 requires callable 转发引用 API设计',
    references: [{ label: '工作草案 · concept.invocable', url: 'https://timsong-cpp.github.io/cppwp/n4950/concept.invocable' }]
  },
  {
    id: 'call-traits', category: 'callables', name: 'is_invocable_r / is_nothrow_invocable',
    header: '<type_traits>', since: 'C++17', level: 'B',
    brief: '在注册物理线程回调前检查签名兼容性与异常承诺。',
    signature: 'std::is_nothrow_invocable_r_v<Result, Fn&, Args...>',
    returns: '编译期布尔值。带 R 的版本允许可隐式转换的返回结果，nothrow 版本还检查调用及结果转换是否不抛异常。',
    pitfall: '签名检查无法证明回调没有分配、数据竞争或阻塞。若签名需要精确返回类型，可另查 invoke_result_t。',
    code: `auto samples = [](unsigned groups) noexcept -> unsigned { return groups * 4; };
using Fn = decltype(samples);
static_assert(std::is_invocable_r_v<unsigned, Fn&, unsigned>);
static_assert(std::is_nothrow_invocable_r_v<unsigned, Fn&, unsigned>);
static_assert(!std::is_invocable_v<Fn&>);  // 缺少参数`,
    keywords: 'noexcept 返回类型 调用约束 编译期检测',
    references: [{ label: '工作草案 · meta.rel', url: 'https://timsong-cpp.github.io/cppwp/n4950/meta.rel' }]
  },
  {
    id: 'call-packaged-task', category: 'callables', name: 'std::packaged_task 把返回值交给 future',
    header: '<future>、<thread>、<utility>', since: 'C++11', level: 'A',
    brief: '把资产解码工作交给后台线程，在提交端保留结果句柄。',
    signature: 'auto ready = job.get_future();',
    returns: '执行任务会将返回值或抛出的异常写入共享状态；future::get() 等待并取出结果，或重新抛出异常。',
    pitfall: 'packaged_task 负责包装工作，调度由线程或队列完成。每个共享状态最多获取一次 future，任务也只能成功满足该状态一次。',
    code: `std::packaged_task<int(int)> decode([](int blocks) { return blocks * 4; });
auto ready = decode.get_future();
std::thread worker(std::move(decode), 9);
worker.join();
int vertices = ready.get();  // 36`,
    keywords: '任务队列 一次性任务 后台解码 返回结果 异常',
    references: [{ label: '工作草案 · futures.task', url: 'https://timsong-cpp.github.io/cppwp/n4950/futures.task' }]
  },
  {
    id: 'call-fold', category: 'callables', name: '折叠表达式依次执行多个回调',
    header: '<functional>', since: 'C++17', level: 'B',
    brief: '按注册顺序执行一组编译期已知的帧末处理步骤。',
    signature: '(static_cast<void>(std::invoke(steps)), ...);',
    returns: '对内建逗号运算符折叠可从左到右执行每个步骤。没有步骤时也有效。',
    pitfall: '转换到 void 可避免用户自定义逗号运算符干扰顺序。若某一步抛出异常，后续步骤不会执行。',
    code: `auto finish = [](auto&&... steps) {
    (static_cast<void>(std::invoke(steps)), ...);
};
int phase = 0;
finish([&] { phase = 2; }, [&] { phase *= 3; });  // 6`,
    keywords: '折叠表达式 参数包 fold 串行组合',
    references: [{ label: '工作草案 · expr.prim.fold', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.fold' }]
  },
  {
    id: 'call-constexpr-dispatch', category: 'callables', name: 'if constexpr 按组件能力分派',
    header: '语言特性（无需头文件）', since: 'C++20', level: 'B',
    brief: '创建通用更新器，只让提供 tick(dt) 的组件进入更新路径。',
    signature: 'if constexpr (requires { component.tick(dt); })',
    returns: '在实例化模板时检查表达式，丢弃不适用的分支。示例对静态组件返回 false。',
    pitfall: '这里的 requires 表达式从 C++20 起可用，if constexpr 自 C++17 起可用。运行期才知道的资源类型需要运行期分派。',
    code: `struct Animated { float time = 0; void tick(float dt) { time += dt; } };
struct Static {};
auto update = [](auto& component, float dt) {
    if constexpr (requires { component.tick(dt); }) {
        component.tick(dt);
        return true;
    } else return false;
};
Animated animated;
Static fixed;
bool a = update(animated, 0.5f), b = update(fixed, 0.5f);`,
    keywords: '鸭子类型 编译期分派 可选成员 requires expression 泛型组件',
    references: [{ label: '工作草案 · expr.prim.req', url: 'https://timsong-cpp.github.io/cppwp/n4950/expr.prim.req' }]
  },
  {
    id: 'call-subscription', category: 'callables', name: '事件订阅、注销与广播期间修改',
    header: '<functional>、<map>、<vector>', since: 'C++11', level: 'A',
    brief: '让回调可以在收到事件时注销自身，同时确保剩余监听者继续收到事件。',
    signature: '复制本轮订阅 ID，再逐项查找并调用。',
    returns: '本轮新增的订阅延至下轮，轮到之前已移除的订阅跳过。复制当前处理器使自身注销不会销毁正在调用的副本。',
    pitfall: '示例为单线程，ID 在广播期间不复用。复制 std::function 也会复制目标内的值状态；持久计数应放在具有明确寿命的外部对象。',
    code: `using Handler = std::function<void()>;
std::map<int, Handler> handlers;
int calls = 0;
handlers.emplace(1, [&] { ++calls; handlers.erase(1); });
handlers.emplace(2, [&] { ++calls; });
auto broadcast = [&] {
    std::vector<int> ids;
    for (const auto& entry : handlers) ids.push_back(entry.first);
    for (int id : ids) {
        auto it = handlers.find(id);
        if (it == handlers.end()) continue;
        auto run = it->second;
        run();
    }
};
broadcast();
broadcast();  // calls 为 3，只有第二个订阅持续生效`,
    keywords: '事件委托 观察者 delegate signal 取消订阅 自注销 生命周期',
    references: [{ label: '工作草案 · func.wrap.func', url: 'https://timsong-cpp.github.io/cppwp/n4950/func.wrap.func' }]
  },
  {
    id: 'call-overloaded', category: 'callables', name: 'overloaded 模式：把多个 Lambda 合成访问器',
    header: '<variant>', since: 'C++17', level: 'B',
    brief: '给同一组命令编写局部处理逻辑，同时让各分支捕获所在帧的状态。',
    signature: 'using F::operator()...;',
    returns: '通过继承组合多个闭包的调用运算符，交给 std::visit 做重载决议。overloaded 是项目中自行定义的小模板。',
    pitfall: 'C++17 示例需要推导指引。无约束的 auto 通配分支也会参与重载，可能掩盖新增命令缺少专门处理的问题。',
    code: `// 模板定义在命名空间作用域
template<class... F>
struct Overloaded : F... { using F::operator()...; };
template<class... F> Overloaded(F...) -> Overloaded<F...>;
// 调用示例
struct Draw { int vertices; };
struct Clear {};
int submitted = 0;
auto handle = Overloaded{
    [&](Draw draw) { submitted += draw.vertices; },
    [](Clear) { /* 本次不提交顶点 */ }
};
std::variant<Draw, Clear> command = Draw{12};
std::visit(handle, command);`,
    keywords: '多 Lambda overload pattern 访问者 模式匹配 命令分派',
    references: [{ label: '工作草案 · variant.visit', url: 'https://timsong-cpp.github.io/cppwp/n4950/variant.visit' }]
  },
  {
    id: 'call-builtins', category: 'callables', name: 'std::greater<> / std::bit_or<> 等标准函数对象',
    header: '<functional>、<numeric>、<array>、<algorithm>', since: 'C++14', level: 'B',
    brief: '复用标准运算完成降序排序和可见层掩码合并。',
    signature: 'std::accumulate(first, last, init, std::bit_or<>{});',
    returns: '空模板参数使运算符接受可推导的操作数类型。greater 比较大小，bit_or 对掩码逐位合并。',
    pitfall: '确认累加初值和运算语义。合并位掩码需要逐位或，逻辑或只产生真假值；空范围会得到初值。',
    code: `std::array<unsigned, 3> masks{1u, 4u, 1u};
auto visible = std::accumulate(masks.begin(), masks.end(), 0u, std::bit_or<>{});
std::sort(masks.begin(), masks.end(), std::greater<>{});
// visible 为 5，masks[0] 为 4`,
    keywords: '透明仿函数 greater less plus bit_or 位掩码 归约',
    references: [{ label: '工作草案 · function.objects', url: 'https://timsong-cpp.github.io/cppwp/n4950/function.objects' }]
  },
  {
    id: 'call-static-policy', category: 'callables', name: 'template<auto> 固定编译期处理策略',
    header: '<array>', since: 'C++17', level: 'B',
    brief: '让离线网格工具在编译期选定索引映射函数，批量处理时直接调用。',
    signature: 'template<auto Map> ...',
    returns: '策略成为模板实参，每种策略可以生成单独的实例。调用端传入普通函数名即可。',
    pitfall: '运行中切换策略需要另行分派。大量不同策略会增加编译量和生成代码体积。',
    code: `// 模板定义在命名空间作用域
constexpr unsigned localIndex(unsigned i) { return i % 3; }
template<auto Map>
void remap(std::array<unsigned, 3>& indices) {
    for (auto& i : indices) i = Map(i);
}
// 调用示例
std::array<unsigned, 3> indices{3, 5, 7};
remap<localIndex>(indices);  // {0, 2, 1}`,
    keywords: '非类型模板参数 NTTP policy 编译期策略 静态分派',
    references: [{ label: '工作草案 · temp.param', url: 'https://timsong-cpp.github.io/cppwp/n4950/temp.param' }]
  },
  {
    id: 'call-structured-binding', category: 'callables', name: '遍历回调注册表：结构化绑定与引用',
    header: '<map>', since: 'C++17', level: 'A',
    brief: '更新每个监听者的调用次数时，确保修改实际登记项。',
    signature: 'for (auto& [id, count] : registry)',
    returns: '引用绑定让 count 指向表中的计数，const auto& 适合只读遍历；按值写 auto 会复制每个键值对。',
    pitfall: 'map 的键即使经 auto& 分解仍是 const。绑定引用只能用到相应元素失效之前；在回调内删除当前项时要额外处理迭代器。',
    code: `std::map<int, unsigned> registry{{7, 0}, {9, 0}};
for (auto& [id, count] : registry) {
    if (id == 7) ++count;
}
auto updated = registry.at(7);  // 1`,
    keywords: '解包 decomposition structured binding auto 引用 拷贝',
    references: [{ label: '工作草案 · dcl.struct.bind', url: 'https://timsong-cpp.github.io/cppwp/n4950/dcl.struct.bind' }]
  },
  {
    id: 'call-deleter', category: 'callables', name: 'Lambda 作为 unique_ptr 删除策略',
    header: '<memory>', since: 'C++11', level: 'B',
    brief: '给需要定制释放行为的导入器对象绑定一个带状态的删除器。',
    signature: 'std::unique_ptr<T, decltype(release)>',
    returns: '删除器作为智能指针的一部分保存。reset 或作用域结束时用它回收所持对象。',
    pitfall: '删除器捕获的引用要活过智能指针，析构路径不能抛异常。真实引擎句柄应调用其配套释放函数。',
    code: `int released = 0;
auto release = [&released](int* p) noexcept {
    delete p;
    ++released;
};
std::unique_ptr<int, decltype(release)> resource(new int(7), release);
resource.reset();  // released 为 1`,
    keywords: '自定义删除器 捕获状态 deleter RAII decltype',
    references: [{ label: '工作草案 · unique.ptr.single.dtor', url: 'https://timsong-cpp.github.io/cppwp/n4950/unique.ptr.single.dtor' }]
  }
];
