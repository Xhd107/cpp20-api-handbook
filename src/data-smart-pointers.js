export const smartPointerApis = [
  {
    id: 'ptr-borrow-transfer', category: 'memory', name: '独占资源的借用与转移',
    header: '<memory>、<utility>', since: 'C++11', level: 'A',
    brief: '把纹理交给缓存之前，先让校验函数只读访问它。',
    signature: 'inspect(*texture); cache = std::move(texture);',
    returns: '引用借用对象；移动 unique_ptr 把释放责任交给目标，源指针变空。',
    pitfall: '借出的引用不能超过实际对象寿命。release() 只返回裸指针，接收方必须按原有删除约定接管；reset(p.get()) 会留下悬垂指针。',
    code: `struct Texture { int width; };
auto inspect = [](const Texture& t) { return t.width; };
std::unique_ptr<Texture> texture(new Texture{256});
int width = inspect(*texture);
auto cached = std::move(texture);  // texture 为空，cached 继续拥有对象`,
    keywords: '智能指针 get release reset 接口参数 移动 借用',
    references: [{ label: '工作草案 · unique.ptr.single', url: 'https://timsong-cpp.github.io/cppwp/n4950/unique.ptr.single' }]
  },
  {
    id: 'ptr-deleter', category: 'memory', name: 'unique_ptr 自定义删除器',
    header: '<memory>、<cstdio>', since: 'C++11', level: 'A',
    brief: '把使用 fclose 关闭的文件交给 RAII 管理。',
    signature: 'std::unique_ptr<std::FILE, CloseFile>',
    returns: '非空指针离开作用域时调用保存的删除器；空指针不会触发删除器。',
    pitfall: '释放函数必须与创建函数匹配。GPU 句柄若要求设备存活、指定线程或等待 fence，应把这些条件落实到回收流程。析构期间删除器不能抛异常。',
    code: `struct CloseFile {
    void operator()(std::FILE* f) const noexcept { std::fclose(f); }
};
using File = std::unique_ptr<std::FILE, CloseFile>;
File source{std::fopen("mesh.bin", "rb")};
if (source) {
    int firstByte = std::fgetc(source.get());
}`,
    keywords: '智能指针 自定义 deleter fclose RAII 图形资源 回收',
    references: [{ label: '工作草案 · unique.ptr.single.dtor', url: 'https://timsong-cpp.github.io/cppwp/n4950/unique.ptr.single.dtor' }]
  },
  {
    id: 'ptr-incomplete', category: 'memory', name: 'unique_ptr 与不完整类型（PImpl）',
    header: '<memory>', since: 'C++11', level: 'B',
    brief: '在 Renderer 的公开头文件隐藏渲染后端细节。',
    signature: '~Renderer();',
    returns: '调用方可在只有前置声明的地方持有 Renderer；默认删除器在实现文件销毁完整的 Impl。',
    pitfall: '把析构函数放到能看到 Impl 完整定义的位置。构造和移动赋值等可能触发清理的操作也宜在实现文件定义。',
    code: `// renderer.hpp
class Renderer {
    struct Impl;
    std::unique_ptr<Impl> impl;
public:
    Renderer();
    ~Renderer();
};
// renderer.cpp，已包含 renderer.hpp
struct Renderer::Impl { int frame = 0; };
Renderer::Renderer() : impl(new Impl{}) {}
Renderer::~Renderer() = default;`,
    keywords: '智能指针 前置声明 PImpl 析构 头文件 default_delete 完整类型',
    references: [{ label: '工作草案 · unique.ptr.dltr.dflt1', url: 'https://timsong-cpp.github.io/cppwp/n4950/unique.ptr.dltr.dflt1' }]
  },
  {
    id: 'ptr-array-overwrite', category: 'memory', name: 'make_unique_for_overwrite / make_shared_for_overwrite',
    header: '<memory>、<cstddef>', since: 'C++20', level: 'B',
    brief: '为即将被解码器完整写入的暂存数组分配空间。',
    signature: 'std::make_unique_for_overwrite<std::byte[]>(count)',
    returns: '返回拥有数组的智能指针；标量元素默认初始化，使用前要写入。普通 make_unique<T[]>(n) 对元素值初始化。',
    pitfall: '只有确实写入的区间才能交给后续处理。短读或解码失败时应保存实际写入长度。类类型仍执行默认初始化。',
    code: `auto pixels = std::make_unique_for_overwrite<std::byte[]>(4);
for (unsigned i = 0; i < 4; ++i) pixels[i] = std::byte{0xff};
auto first = pixels[0];`,
    keywords: '智能指针 数组 初始化 暂存 缓冲区 图像 解码',
    references: [{ label: '工作草案 · unique.ptr.create', url: 'https://timsong-cpp.github.io/cppwp/n4950/unique.ptr.create' }]
  },
  {
    id: 'ptr-alias', category: 'memory', name: 'shared_ptr 别名构造与控制块',
    header: '<memory>', since: 'C++11', level: 'A',
    brief: '把网格的一个成员交给调用方，同时让整个网格活到最后一次访问。',
    signature: 'std::shared_ptr<int> part(mesh, &mesh->indices);',
    returns: 'get() 指向成员；复制和析构共享原网格的控制块。两个地址可以不同，但所有者相同。',
    pitfall: '用 mesh.get() 另建 shared_ptr 会建立独立控制块，造成重复释放。别名指向 vector 元素时，保住容器仍不能阻止扩容使元素地址失效。',
    code: `struct Mesh { int indices = 36; };
auto mesh = std::make_shared<Mesh>();
std::shared_ptr<int> count(mesh, &mesh->indices);
mesh.reset();
int draws = *count;  // 36，网格仍存活`,
    keywords: '智能指针 aliasing constructor 双重释放 子对象 所有权',
    references: [{ label: '工作草案 · util.smartptr.shared.const', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.shared.const' }]
  },
  {
    id: 'ptr-weak-retention', category: 'memory', name: 'make_shared / allocate_shared 与弱引用滞留',
    header: '<memory>', since: 'C++11', level: 'B',
    brief: '理解纹理缓存中对象析构和控制块回收的两个时间点。',
    signature: 'std::allocate_shared<T>(allocator, args...)',
    returns: '最后一个强所有者离开时析构对象；弱观察者可以继续存在，lock() 返回空。',
    pitfall: '实现通常合并分配对象和控制块。此时长期存在的 weak_ptr 可保留合并分配的存储；对象析构释放的独立像素缓冲有自己的生命周期。',
    code: `struct Texture { int width = 256; };
auto t = std::allocate_shared<Texture>(std::allocator<Texture>{});
std::weak_ptr<Texture> cached = t;
t.reset();       // Texture 已析构
auto reloaded = cached.lock();  // 空
cached.reset();  // 释放这个弱观察者`,
    keywords: '智能指针 控制块 合并分配 弱缓存 内存占用 析构',
    references: [{ label: '工作草案 · util.smartptr.shared.create', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.shared.create' }]
  },
  {
    id: 'ptr-cycle', category: 'memory', name: '用 weak_ptr 打破场景树的强引用环',
    header: '<memory>、<vector>', since: 'C++11', level: 'A',
    brief: '父节点拥有孩子，孩子只在需要时临时访问父节点。',
    signature: 'if (auto parent = child->parent.lock())',
    returns: 'lock 原子地尝试取得强所有权；成功得到的局部 shared_ptr 在该次访问期间保活对象。',
    pitfall: '先 expired 再取裸指针无法保活。线程间替换同一个 weak_ptr 实例或修改节点内容时，还需要相应同步。',
    code: `struct Node {
    std::vector<std::shared_ptr<Node>> children;
    std::weak_ptr<Node> parent;
};
auto root = std::make_shared<Node>();
auto child = std::make_shared<Node>();
root->children.push_back(child);
child->parent = root;
root.reset();
bool detached = !child->parent.lock();  // true`,
    keywords: '智能指针 父子 场景树 反向引用 引用环 lock',
    references: [{ label: '工作草案 · util.smartptr.weak.obs', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.weak.obs' }]
  },
  {
    id: 'ptr-from-this', category: 'memory', name: 'enable_shared_from_this / weak_from_this',
    header: '<memory>', since: 'C++11 / C++17', level: 'A',
    brief: '让对象的成员函数取得与创建方相同的所有权，供事件系统订阅。',
    signature: 'object.shared_from_this(); object.weak_from_this();',
    returns: 'shared_from_this 返回强所有者；C++17 的 weak_from_this 返回弱观察者。',
    pitfall: '使用公开且无歧义的继承，在 shared_ptr 完成接管后调用。构造期间取得的弱引用为空，之后也不会自动补上；用 shared_ptr(this) 会另建控制块。',
    code: `struct Camera : std::enable_shared_from_this<Camera> {
    std::weak_ptr<Camera> subscribe() { return weak_from_this(); }
};
auto camera = std::make_shared<Camera>();
auto ticket = camera->subscribe();
auto sameCamera = camera->shared_from_this();`,
    keywords: '智能指针 自身引用 回调 订阅 bad_weak_ptr 构造函数',
    references: [{ label: '工作草案 · util.smartptr.enab', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.enab' }]
  },
  {
    id: 'ptr-casts', category: 'memory', name: 'dynamic_pointer_cast / static_pointer_cast',
    header: '<memory>', since: 'C++11', level: 'B',
    brief: '从异构资源表取出纹理，并保留原控制块。',
    signature: 'std::dynamic_pointer_cast<Texture>(asset)',
    returns: '运行时转换成功返回共享所有权的结果，失败得到空 shared_ptr。static_pointer_cast 使用静态转换。',
    pitfall: '向下 dynamic_cast 需要多态基类与 RTTI 支持。静态向下转换要求真实对象类型匹配。从转换后的裸指针重建 shared_ptr 会引入第二个控制块。',
    code: `struct Asset { virtual ~Asset() = default; };
struct Texture : Asset { int width = 512; };
std::shared_ptr<Asset> asset = std::make_shared<Texture>();
if (auto texture = std::dynamic_pointer_cast<Texture>(asset)) {
    int width = texture->width;
}`,
    keywords: '智能指针 RTTI 资源类型 多态 向下转换',
    references: [{ label: '工作草案 · util.smartptr.shared.cast', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.shared.cast' }]
  },
  {
    id: 'ptr-atomic-publish', category: 'memory', name: 'atomic<shared_ptr<T>> 发布只读快照',
    header: '<atomic>、<memory>', since: 'C++20', level: 'A',
    brief: '加载线程发布新的材质参数，渲染线程在一帧内保留同一个版本。',
    signature: 'slot.store(next, std::memory_order_release);',
    returns: 'acquire load 得到独立的强所有者；后续替换槽位时，读者仍可使用原快照。',
    pitfall: '不同 shared_ptr 实例可共享控制块；并发读写同一个普通实例仍需同步。引用计数和 use_count()==1 都不能充当对象内容的锁。原子特化也不保证无锁。',
    code: `struct Params { float roughness; };
std::atomic<std::shared_ptr<const Params>> slot;
slot.store(std::make_shared<const Params>(Params{0.4f}),
           std::memory_order_release);
auto frame = slot.load(std::memory_order_acquire);
if (frame) { float roughness = frame->roughness; }`,
    keywords: '智能指针 原子 快照 热更新 引用计数 线程安全 use_count',
    references: [{ label: '工作草案 · util.smartptr.atomic.shared', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.atomic.shared' }]
  },
  {
    id: 'ptr-owner-order', category: 'memory', name: 'owner_before / std::owner_less',
    header: '<memory>、<set>', since: 'C++11', level: 'B',
    brief: '按资源所有权去重，即使两个视图指向同一对象的不同子成员。',
    signature: '!a.owner_before(b) && !b.owner_before(a)',
    returns: '等价关系按共享所有权判断。owner_less 可用作 set 或 map 的比较器。',
    pitfall: 'operator== 比较存储指针。弱引用键即使失效也不会自动移出容器，缓存需要自行清理。',
    code: `struct Pair { int a = 1, b = 2; };
auto pair = std::make_shared<Pair>();
std::shared_ptr<int> a(pair, &pair->a), b(pair, &pair->b);
using Key = std::weak_ptr<int>;
std::set<Key, std::owner_less<Key>> resources{a, b};
auto count = resources.size();  // 1，虽然 a.get() != b.get()`,
    keywords: '智能指针 控制块 去重 资源身份 有序表 weak_ptr',
    references: [{ label: '工作草案 · util.smartptr.ownerless', url: 'https://timsong-cpp.github.io/cppwp/n4950/util.smartptr.ownerless' }]
  },
  {
    id: 'ptr-out', category: 'memory', name: 'std::out_ptr 与 C 风格输出参数',
    header: '<memory>', since: 'C++23', level: 'B',
    featureTest: '__cpp_lib_out_ptr >= 202106L',
    brief: '适配通过 T** 交付新对象的加载接口，调用结束后让 unique_ptr 接管。',
    signature: 'create(std::out_ptr(candidate));',
    returns: '适配器在完整表达式结束时完成接管；接口状态码仍由调用方检查。',
    pitfall: 'out_ptr 会清空原智能指针。若失败时需保留当前资源，先用临时指针接收，成功后交换。删除器必须匹配 C 接口。',
    code: `auto create = [](int** out) { *out = new int(42); return true; };
auto current = std::make_unique<int>(7);
std::unique_ptr<int> candidate;
bool ok = create(std::out_ptr(candidate));
if (ok) current.swap(candidate);`,
    keywords: '智能指针 C API 二级指针 输出参数 所有权 失败回滚',
    references: [{ label: '工作草案 · out.ptr.t', url: 'https://timsong-cpp.github.io/cppwp/n4950/out.ptr.t' }]
  },
  {
    id: 'ptr-owner-hash', category: 'memory', name: 'std::owner_hash / std::owner_equal',
    header: '<memory>、<unordered_set>', since: 'C++26', level: 'B',
    featureTest: '__cpp_lib_smart_ptr_owner_equality >= 202306L',
    brief: '建立按控制块去重的弱引用哈希表，支持别名指针。',
    signature: 'std::unordered_set<Key, std::owner_hash, std::owner_equal>',
    returns: '具有相同所有权的键比较相等并得到相同哈希值，适用于 shared_ptr 和 weak_ptr。',
    pitfall: '哈希值可能碰撞，不能当作持久化资源 ID。已失效的弱引用键仍要显式清除。',
    code: `using Key = std::weak_ptr<int>;
std::unordered_set<Key, std::owner_hash, std::owner_equal> owners;
auto data = std::make_shared<int>(3);
owners.emplace(data);
owners.emplace(data);
auto count = owners.size();  // 1`,
    keywords: '智能指针 资源身份 控制块 哈希 弱引用键 去重',
    references: [{ label: '工作草案 · util.smartptr.owner.hash', url: 'https://timsong-cpp.github.io/cppwp/n5050/util.smartptr.owner.hash' }]
  },
  {
    id: 'ptr-polymorphic-delete', category: 'memory', name: '多态所有权与虚析构',
    header: '<memory>、<utility>', since: 'C++11', level: 'A',
    brief: '把具体纹理作为基类资源移交给缓存，确保销毁时调用正确的析构链。',
    signature: 'std::unique_ptr<Resource> asset = std::move(texture);',
    returns: 'unique_ptr 的默认删除器随目标类型变化；使用普通 delete 通过基类指针销毁派生对象时，应给基类公开虚析构。',
    pitfall: 'shared_ptr 从实际派生类型建立控制块后可以保留其销毁方式。但先擦除成基类裸指针再接管会丢失这项信息。',
    code: `struct Resource { virtual ~Resource() = default; };
struct Texture : Resource { int width = 512; };
std::unique_ptr<Texture> texture(new Texture);
std::unique_ptr<Resource> asset = std::move(texture);
asset.reset();  // 调用 Texture 和 Resource 的析构函数`,
    keywords: '智能指针 多态删除 虚析构 基类 派生类 默认删除器',
    references: [{ label: '工作草案 · unique.ptr.single.dtor', url: 'https://timsong-cpp.github.io/cppwp/n4950/unique.ptr.single.dtor' }]
  }
];
