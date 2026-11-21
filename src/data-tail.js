export const tailApis = [
  {
    id: 'filesystem-path', category: 'io', name: 'std::filesystem::path', header: '<filesystem>', since: 'C++17', level: 'A',
    brief: '专门表示文件系统路径，提供文件名、扩展名、父目录和路径拼接等操作。',
    signature: 'std::filesystem::path path = "C:/Models/test.obj";',
    returns: 'filename()、extension()、parent_path() 返回 path；operator/= 按路径规则拼接。',
    pitfall: 'path 只做词法路径处理，不代表文件一定存在。Windows 与 POSIX 的根目录、分隔符和编码规则不同，跨平台代码不要手写字符串拼接。',
    code: `std::filesystem::path path = "C:/Models/test.obj";

auto file = path.filename();    // test.obj
auto ext = path.extension();    // .obj
auto parent = path.parent_path();

path.replace_extension(".mesh");`,
    keywords: '路径 文件名 扩展名 父目录 replace_extension'
  },
  {
    id: 'filesystem-exists', category: 'io', name: 'exists / is_regular_file / file_size', header: '<filesystem>', since: 'C++17', level: 'A',
    brief: '查询路径是否存在、是否为普通文件以及文件大小。',
    signature: 'bool ok = std::filesystem::is_regular_file(path, ec);',
    returns: 'exists()/is_regular_file() 返回 bool；file_size() 返回 uintmax_t 字节数。',
    pitfall: '检查后才打开仍可能出现竞态，最终仍需处理打开失败。使用 error_code 重载可避免文件系统查询以异常报告错误。',
    code: `std::error_code ec;
if (!std::filesystem::is_regular_file(path, ec)) {
    // 不存在、不是普通文件，或查询失败
}

auto bytes = std::filesystem::file_size(path, ec);
if (ec) {
    // 查询失败
}`,
    keywords: '文件存在 普通文件 大小 error_code'
  },
  {
    id: 'create-directories', category: 'io', name: 'std::filesystem::create_directories', header: '<filesystem>', since: 'C++17', level: 'B',
    brief: '递归创建目录及缺失的父目录，类似 mkdir -p。',
    signature: 'bool created = std::filesystem::create_directories(path, ec);',
    returns: '实际创建了新目录返回 true；目录已经存在返回 false。失败可通过异常或 error_code 报告。',
    pitfall: '返回 false 不一定是错误，也可能只是目录已存在。应先检查 ec，再结合返回值判断。create_directory 只创建单级目录。',
    code: `std::error_code ec;
std::filesystem::create_directories("output/previews", ec);

if (ec) {
    std::cerr << "Cannot create output directory: "
              << ec.message();
}`,
    keywords: '创建目录 递归 输出目录 mkdir'
  },
  {
    id: 'directory-iterator', category: 'io', name: 'std::filesystem::directory_iterator', header: '<filesystem>', since: 'C++17', level: 'B',
    brief: '遍历目录的直接子项；recursive_directory_iterator 可递归遍历子目录。',
    signature: 'for (const auto& entry : std::filesystem::directory_iterator(dir)) {}',
    returns: '每次迭代得到 directory_entry，可用 path()、is_regular_file()、file_size() 查询。',
    pitfall: '遍历顺序未指定。递归遍历要考虑权限、符号链接和文件系统变化；使用 error_code 重载处理不可访问目录。',
    code: `for (const auto& entry :
     std::filesystem::directory_iterator(folder)) {
    if (entry.is_regular_file() && entry.path().extension() == ".obj") {
        process(entry.path());
    }
}`,
    keywords: '遍历目录 文件列表 recursive directory_entry'
  },
  {
    id: 'ifstream', category: 'io', name: 'std::ifstream', header: '<fstream>', since: 'C++98', level: 'A',
    brief: '从文件读取文本或二进制数据，析构时自动关闭文件。',
    signature: 'std::ifstream file(path);',
    returns: 'is_open() 判断是否打开；good()/fail()/bad()/eof() 查询流状态；get()/read() 读取。',
    pitfall: 'fail() 表示 failbit 或 badbit 已设置，不只是“最近一次操作失败”。不要写 while(file.eof())；应把读取操作本身作为循环条件。二进制文件使用 std::ios::binary。',
    code: `std::ifstream file(path);
if (!file.is_open()) {
    throw std::runtime_error("Cannot open model file");
}

std::string line;
while (std::getline(file, line)) {
    parseLine(line);
}
if (file.bad()) {
    // 底层读取发生严重错误
}`,
    keywords: '文件流 读取 eof fail bad open 二进制'
  },
  {
    id: 'ofstream', category: 'io', name: 'std::ofstream', header: '<fstream>', since: 'C++98', level: 'B',
    brief: '向文件写入文本或二进制数据，默认 trunc 覆盖，可用 app 追加。',
    signature: 'std::ofstream output(path, std::ios::binary);',
    returns: '输出运算符和 write() 返回流引用；is_open()/fail() 用于错误检查。',
    pitfall: '默认模式可能清空已有文件。写完后检查流状态；关键数据写入还要考虑刷新、关闭及目标文件系统错误。',
    code: `std::ofstream output("mesh-summary.txt", std::ios::trunc);
if (!output) {
    throw std::runtime_error("Cannot create output file");
}

output << std::format("vertices: {}\\n", mesh.vertices.size());
if (!output) {
    // 写入失败
}`,
    keywords: '写文件 输出流 覆盖 追加 binary trunc app'
  },
  {
    id: 'cout-cerr', category: 'io', name: 'std::cout / std::cerr', header: '<iostream>', since: 'C++98', level: 'A',
    brief: 'cout 写标准输出，cerr 写标准错误，便于把正常结果和诊断信息分开。',
    signature: 'std::cout << result; std::cerr << error;',
    returns: '输出运算符返回流引用，因此可以链式调用。',
    pitfall: 'cerr 通常无缓冲并与 cout 绑定，频繁写错误流可能影响性能。命令行程序应让调用者能分别重定向 stdout 和 stderr。',
    code: `std::cout << std::format("Loaded {} vertices\\n", count);
std::cerr << std::format("Line {}: invalid face\\n", lineNumber);`,
    keywords: '控制台 标准输出 标准错误 stdout stderr'
  },
  {
    id: 'error-code', category: 'io', name: 'std::error_code / filesystem_error', header: '<system_error> / <filesystem>', since: 'C++11 / C++17', level: 'B',
    brief: 'error_code 以值保存错误而不抛异常；filesystem_error 是文件系统操作常用的异常类型。',
    signature: 'operation(path, ec); if (ec) { /* ... */ }',
    returns: 'error_code::value() 返回数值，message() 返回文本，转换为 bool 表示是否有错误。',
    pitfall: '每次调用前按需 ec.clear()，并优先使用传入 ec 的那次调用结果。不要混用“期待它不抛异常”和没有 ec 参数的重载。',
    code: `std::error_code ec;
const auto size = std::filesystem::file_size(path, ec);
if (ec) {
    std::cerr << ec.message() << '\n';
}

try {
    std::filesystem::create_directories(path);
} catch (const std::filesystem::filesystem_error& error) {
    std::cerr << error.what() << '\n';
}`,
    keywords: '错误码 异常 文件系统 error_code filesystem_error'
  },

  {
    id: 'unique-ptr', category: 'memory', name: 'std::unique_ptr / make_unique', header: '<memory>', since: 'C++11 / C++14', level: 'A',
    brief: '表达独占所有权的智能指针，离开作用域自动释放对象，不可复制但可移动。',
    signature: 'auto object = std::make_unique<T>(args...);',
    returns: 'make_unique 返回 unique_ptr<T>；get() 返回观察用裸指针；release() 放弃所有权；reset() 替换或释放。',
    pitfall: '不要用同一裸指针构造两个 unique_ptr，也不要 delete get() 的结果。接口只是短期观察对象时，优先使用引用、裸指针或 span，而不是复制所有权。',
    code: `class Renderer {
    std::unique_ptr<GpuDevice> device =
        std::make_unique<GpuDevice>();
};

auto mesh = std::make_unique<Mesh>();
loadInto(*mesh);
render(mesh.get()); // 仅观察，不接管所有权`,
    keywords: '智能指针 独占 所有权 RAII make_unique'
  },
  {
    id: 'shared-ptr', category: 'memory', name: 'std::shared_ptr / make_shared', header: '<memory>', since: 'C++11', level: 'B',
    brief: '多个 shared_ptr 共享同一对象所有权，最后一个所有者销毁时释放对象。',
    signature: 'auto object = std::make_shared<T>(args...);',
    returns: 'use_count() 返回当前 shared 所有者数量；get() 返回观察指针；reset() 放弃当前所有权。',
    pitfall: '共享所有权应是有意设计，不是绕过生命周期思考的默认方案。循环引用会泄漏，应让回边使用 weak_ptr。多线程读写同一对象仍需同步。',
    code: `auto texture = std::make_shared<Texture>();
auto materialA = std::make_shared<Material>(texture);
auto materialB = std::make_shared<Material>(texture);

std::weak_ptr<Texture> observer = texture;`,
    keywords: '共享所有权 引用计数 make_shared 循环引用'
  },
  {
    id: 'weak-ptr', category: 'memory', name: 'std::weak_ptr', header: '<memory>', since: 'C++11', level: 'C',
    brief: '观察 shared_ptr 管理的对象但不延长其生命周期，常用于缓存、观察者和打破循环引用。',
    signature: 'std::weak_ptr<T> observer = shared;',
    returns: 'expired() 判断是否已销毁；lock() 返回 shared_ptr，对象不存在时为空。',
    pitfall: '不能直接 operator* 访问。使用前先 lock()，并在整个操作期间保存得到的 shared_ptr；expired() 与 lock() 分开检查可能产生竞态。',
    code: `if (auto texture = weakTexture.lock()) {
    renderer.bind(*texture);
} else {
    // 纹理已经销毁
}`,
    keywords: '弱引用 缓存 循环引用 expired lock'
  },

  {
    id: 'steady-clock', category: 'numeric', name: 'std::chrono::steady_clock', header: '<chrono>', since: 'C++11', level: 'A',
    brief: '单调时钟，适合测量耗时、帧时间和超时间隔，不受系统时间回拨影响。',
    signature: 'auto start = std::chrono::steady_clock::now();',
    returns: 'now() 返回 time_point；两个 time_point 相减得到 duration。',
    pitfall: 'system_clock 适合日历时间，steady_clock 适合间隔。不要混用不同时钟的 time_point。',
    code: `const auto start = std::chrono::steady_clock::now();
loadOBJ(path);
const auto end = std::chrono::steady_clock::now();

const auto milliseconds =
    std::chrono::duration<double, std::milli>(end - start).count();`,
    keywords: '计时 性能 帧时间 单调时钟 duration'
  },
  {
    id: 'duration-cast', category: 'numeric', name: 'std::chrono::duration / duration_cast', header: '<chrono>', since: 'C++11', level: 'B',
    brief: '以强类型表示时间间隔，并在秒、毫秒、微秒等单位间显式转换。',
    signature: 'auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(elapsed);',
    returns: 'duration::count() 返回计数值；duration_cast 返回目标单位的 duration。',
    pitfall: '整数单位转换会截断小数部分。需要保留小数时使用 duration<double, std::milli> 等浮点表示。',
    code: `using namespace std::chrono_literals;

auto timeout = 250ms;
auto elapsed = end - start;
auto wholeMs = std::chrono::duration_cast<std::chrono::milliseconds>(elapsed);

if (elapsed > timeout) {
    cancelLoading();
}`,
    keywords: '毫秒 秒 时间单位 chrono_literals duration_cast'
  },
  {
    id: 'random-engine', category: 'numeric', name: 'std::random_device / std::mt19937', header: '<random>', since: 'C++11', level: 'B',
    brief: 'random_device 常用于播种，mt19937 是通用伪随机数引擎，适合采样和测试。',
    signature: 'std::mt19937 engine(std::random_device{}());',
    returns: '引擎调用产生均匀分布的引擎结果；通常应交给 distribution 映射到目标范围。',
    pitfall: '它不是密码学安全随机数。引擎构造有成本，不要在每次取随机数时重新构造；可复现测试可使用固定种子。',
    code: `std::random_device seedSource;
std::mt19937 engine(seedSource());

// 可复现测试：std::mt19937 engine(12345);
auto sample = std::uniform_int_distribution<int>(0, 9)(engine);`,
    keywords: '随机数 种子 mt19937 random_device'
  },
  {
    id: 'random-distribution', category: 'numeric', name: 'uniform_int_distribution / uniform_real_distribution', header: '<random>', since: 'C++11', level: 'B',
    brief: '把随机引擎输出映射为指定区间内的整数或实数分布。',
    signature: 'std::uniform_int_distribution<int> pick(0, count - 1);',
    returns: 'operator()(engine) 返回一个随机样本。整数分布使用闭区间 [a, b]。',
    pitfall: '整数分布包含上界，实数分布通常为 [a, b)。选择随机下标时确保容器非空，并把上界写成 size() - 1。',
    code: `std::uniform_real_distribution<float> unit(0.0f, 1.0f);
float u = unit(engine);
float v = unit(engine);

std::uniform_int_distribution<std::size_t> pick(
    0, mesh.vertices.size() - 1
);`,
    keywords: '均匀分布 随机采样 整数 浮点 区间'
  },
  {
    id: 'cmath', category: 'numeric', name: 'std::sqrt / sin / cos / pow / abs', header: '<cmath>', since: 'C++98', level: 'A',
    brief: '常用数学函数，覆盖几何长度、三角函数、幂和绝对值等计算。',
    signature: 'auto length = std::sqrt(x*x + y*y + z*z);',
    returns: '返回相应数学结果；定义域错误或不可表示结果按浮点规则处理。',
    pitfall: '比较浮点数通常不要直接用 ==；归一化零长度向量前必须检查长度。整数绝对值还可用 <cstdlib> 或相关重载，注意最小负数溢出。',
    code: `float length = std::sqrt(x*x + y*y + z*z);
if (length > 1e-6f) {
    x /= length;
    y /= length;
    z /= length;
}

float angle = std::atan2(y, x);`,
    keywords: '数学 平方根 三角函数 向量 归一化 atan2'
  },
  {
    id: 'gcd-lcm', category: 'numeric', name: 'std::gcd / std::lcm', header: '<numeric>', since: 'C++17', level: 'C',
    brief: '计算两个整数的最大公约数和最小公倍数。',
    signature: 'auto divisor = std::gcd(a, b);',
    returns: '返回对应整数公共类型结果；gcd(0, 0) 为 0。',
    pitfall: '参数应是整数类型；如果输入绝对值或计算结果不能用返回类型表示，行为未定义。一般几何和渲染代码使用频率较低。',
    code: `int a = std::gcd(24, 18); // 6
int b = std::lcm(4, 6);   // 12`,
    keywords: '最大公约数 最小公倍数 整数 数学'
  },
  {
    id: 'midpoint-lerp', category: 'numeric', name: 'std::midpoint / std::lerp', header: '<numeric> / <cmath>', since: 'C++20', level: 'B',
    brief: 'midpoint 计算中点，lerp 在 a 与 b 之间做线性插值。',
    signature: 'auto middle = std::midpoint(a, b); auto value = std::lerp(a, b, t);',
    returns: '返回中点或插值结果；lerp 在 t=0 时为 a，t=1 时为 b。',
    pitfall: 'midpoint 对整数和指针有防溢出语义；lerp 的 t 可以超出 [0,1] 做外插，需要区间限制时先 clamp。',
    code: `Vec3 center{
    std::midpoint(min.x, max.x),
    std::midpoint(min.y, max.y),
    std::midpoint(min.z, max.z)
};

float smooth = std::lerp(0.0f, 1.0f, std::clamp(t, 0.0f, 1.0f));`,
    keywords: '中点 插值 包围盒 动画 C++20'
  },
  {
    id: 'numbers', category: 'numeric', name: 'std::numbers', header: '<numbers>', since: 'C++20', level: 'B',
    brief: '提供 pi、e、sqrt2 等标准数学常量，避免自行写低精度魔法数字。',
    signature: 'double angle = std::numbers::pi * degrees / 180.0;',
    returns: 'std::numbers::pi 是 double 常量；std::numbers::pi_v<T> 可指定浮点类型。',
    pitfall: '用于 float 时写 pi_v<float> 可避免先以 double 表示再转换。常量精度仍受目标浮点类型限制。',
    code: `float radians = degrees * std::numbers::pi_v<float> / 180.0f;
double circumference = 2.0 * std::numbers::pi * radius;`,
    keywords: '圆周率 数学常量 pi 角度 弧度 C++20'
  },
  {
    id: 'bit', category: 'numeric', name: 'std::popcount / bit_cast / endian', header: '<bit>', since: 'C++20', level: 'C',
    brief: '统计置位数、按位重新解释对象表示，以及查询平台字节序。',
    signature: 'int bits = std::popcount(value);',
    returns: 'popcount 返回无符号整数中 1 的位数；bit_cast<To>(from) 返回按位复制后的 To；endian 表示字节序。',
    pitfall: 'bit_cast 要求源和目标大小相同且满足可平凡复制等约束，不是数值转换。二进制文件读写必须明确处理字节序。',
    code: `std::uint32_t flags = 0b101101u;
int enabled = std::popcount(flags); // 4

float value = 1.0f;
auto bits = std::bit_cast<std::uint32_t>(value);

if constexpr (std::endian::native == std::endian::little) {
    // 当前平台为小端
}`,
    keywords: '位操作 popcount bit_cast 字节序 二进制 C++20'
  },

  {
    id: 'jthread', category: 'concurrency', name: 'std::jthread / stop_token', header: '<thread> / <stop_token>', since: 'C++20', level: 'B',
    brief: '可协作停止的线程，析构时若仍可 join，会请求停止并等待线程结束。',
    signature: 'std::jthread worker([](std::stop_token token) { /* ... */ });',
    returns: 'request_stop() 发起停止请求；get_stop_token() 获取令牌；joinable() 判断是否仍可 join。',
    pitfall: '停止是协作式的，任务必须定期检查 stop_requested() 或等待条件。共享数据仍需互斥或原子同步，jthread 不会自动消除数据竞争。',
    code: `std::jthread worker([](std::stop_token stop) {
    while (!stop.stop_requested()) {
        processNextChunk();
    }
});

worker.request_stop();
worker.join();`,
    keywords: '线程 自动join 停止 stop_token C++20'
  },
  {
    id: 'mutex', category: 'concurrency', name: 'std::mutex', header: '<mutex>', since: 'C++11', level: 'B',
    brief: '互斥锁，用来保证同一时刻只有一个线程进入受保护的临界区。',
    signature: 'std::mutex mutex;',
    returns: 'lock()/unlock() 手动加解锁；try_lock() 尝试加锁并返回 bool。',
    pitfall: '不要直接手动 lock/unlock，优先 RAII 锁对象。锁保护的是数据不变量，不是某段语法代码；所有访问共享数据的线程必须遵守同一锁协议。',
    code: `std::mutex meshMutex;
Mesh sharedMesh;

void appendFace(const Face& face) {
    std::lock_guard lock(meshMutex);
    sharedMesh.faces.push_back(face);
}`,
    keywords: '互斥锁 临界区 数据竞争 共享数据'
  },
  {
    id: 'scoped-lock', category: 'concurrency', name: 'std::lock_guard / std::scoped_lock', header: '<mutex>', since: 'C++11 / C++17', level: 'B',
    brief: 'RAII 锁管理：离开作用域自动解锁；scoped_lock 还能同时锁定多个互斥量。',
    signature: 'std::scoped_lock lock(mutexA, mutexB);',
    returns: '构造时加锁，析构时解锁，无普通返回值。',
    pitfall: '尽量缩短临界区，不要持锁调用可能再次获取相关锁的外部代码。多锁顺序不当会死锁，scoped_lock 多参数形式可避免部分顺序问题。',
    code: `void mergeMeshes(Mesh& target, Mesh& source,
                 std::mutex& targetMutex, std::mutex& sourceMutex) {
    std::scoped_lock lock(targetMutex, sourceMutex);
    append(target, source);
}`,
    keywords: 'RAII 自动解锁 scoped_lock 多锁 死锁'
  },
  {
    id: 'atomic', category: 'concurrency', name: 'std::atomic', header: '<atomic>', since: 'C++11', level: 'C',
    brief: '提供不可分割的读写和修改操作，适合简单标志、计数器等并发状态。',
    signature: 'std::atomic<int> completed{0};',
    returns: 'load() 读取；store() 写入；fetch_add() 修改并返回旧值；is_lock_free() 查询是否无锁。',
    pitfall: 'atomic 只保护这个对象上的操作，不自动保护由多个变量组成的不变量。默认顺序一致内存序最安全易懂，放松内存序需要严谨论证。',
    code: `std::atomic<std::size_t> loaded{0};

void onChunkLoaded(std::size_t count) {
    loaded.fetch_add(count);
}

std::size_t current = loaded.load();`,
    keywords: '原子变量 计数器 并发 memory_order'
  },
  {
    id: 'condition-variable', category: 'concurrency', name: 'std::condition_variable', header: '<condition_variable>', since: 'C++11', level: 'C',
    brief: '让线程在条件尚未满足时休眠，并在其他线程改变状态后收到通知。',
    signature: 'cv.wait(lock, predicate);',
    returns: '带谓词的 wait() 在谓词为 true 后返回；notify_one()/notify_all() 唤醒等待线程。',
    pitfall: '必须使用 unique_lock，并总用谓词处理虚假唤醒和错过通知。谓词检查共享状态，状态修改仍受同一 mutex 保护。',
    code: `std::unique_lock lock(queueMutex);
queueCV.wait(lock, [&] { return stop || !tasks.empty(); });

if (stop) return;
auto task = std::move(tasks.front());
tasks.pop();
lock.unlock();`,
    keywords: '条件变量 等待 通知 生产者 消费者 unique_lock'
  },
  {
    id: 'async-future', category: 'concurrency', name: 'std::async / std::future', header: '<future>', since: 'C++11', level: 'C',
    brief: '启动可能异步执行的任务，并通过 future 获取结果或异常。',
    signature: 'auto result = std::async(std::launch::async, task);',
    returns: 'async 返回 future；future::get() 等待并取出一次结果，任务异常会在 get() 时重新抛出。',
    pitfall: 'future::get() 只能调用一次。launch::async 明确要求新线程；不传启动策略时可能延迟执行，语义不一定符合预期。',
    code: `auto pending = std::async(std::launch::async, [&] {
    return loadOBJ(path);
});

try {
    Mesh mesh = pending.get();
} catch (const std::exception& error) {
    std::cerr << error.what();
}`,
    keywords: '异步 future promise 任务 结果 异常'
  },

  {
    id: 'fixed-int', category: 'types', name: 'std::int32_t / std::uint32_t', header: '<cstdint>', since: 'C++11', level: 'A',
    brief: '明确位宽的定长有符号或无符号整数，适合文件格式、索引和二进制接口。',
    signature: 'std::int32_t vertexIndex = 0;',
    returns: '这是类型别名，不是函数；int32_t 恰好 32 位且有符号，uint32_t 恰好 32 位且无符号。',
    pitfall: '定宽类型由实现支持时才提供。无符号减法可能下溢；解析负数索引时使用有符号类型，转换到 size_t 前先检查非负及上界。',
    code: `struct Face {
    std::array<std::int32_t, 3> v{};
};

if (index < 0 || static_cast<std::size_t>(index) >= vertices.size()) {
    // 非法索引
}`,
    keywords: '固定宽度 整数 索引 有符号 无符号 cstdint'
  },
  {
    id: 'size-t', category: 'types', name: 'std::size_t', header: '<cstddef>', since: 'C++98', level: 'A',
    brief: '标准库用于对象大小、容器元素数量和无符号下标的常见类型。',
    signature: 'std::size_t count = values.size();',
    returns: '这是实现定义的无符号整数类型别名，能表示可支持对象的大小。',
    pitfall: '无符号数减一会下溢，for (size_t i=n-1; i>=0; --i) 容易死循环。与有符号数比较或混合运算前先明确转换规则。',
    code: `for (std::size_t i = 0; i < mesh.faces.size(); ++i) {
    const Face& face = mesh.faces[i];
}

// 反向遍历可使用 views::iota + views::reverse 等明确方式`,
    keywords: '大小 下标 无符号 size_t 容器'
  },
  {
    id: 'numeric-limits', category: 'types', name: 'std::numeric_limits', header: '<limits>', since: 'C++98', level: 'B',
    brief: '查询算术类型的最小值、最大值、精度和特殊浮点值能力。',
    signature: 'constexpr auto max = std::numeric_limits<T>::max();',
    returns: 'min() 返回最小正规有限值（浮点）或最小值（整数）；lowest() 返回最小有限值；max() 返回最大值。',
    pitfall: '浮点 min() 不是最负值，应使用 lowest()。epsilon() 不能直接当作所有浮点比较场景的固定容差。',
    code: `constexpr int maxInt = std::numeric_limits<int>::max();
constexpr float mostNegative = std::numeric_limits<float>::lowest();

static_assert(std::numeric_limits<double>::is_iec559);`,
    keywords: '类型 最大值 最小值 lowest epsilon limits'
  },
  {
    id: 'type-traits', category: 'types', name: 'std::is_arithmetic_v / remove_cvref_t', header: '<type_traits>', since: 'C++17 / C++20', level: 'C',
    brief: '编译期查询和变换类型，常用于模板约束与泛型工具。',
    signature: 'static_assert(std::is_arithmetic_v<T>);',
    returns: '_v 变量模板给出 bool；_t 别名模板给出变换后的类型。remove_cvref_t 去除顶层 const/volatile 和引用。',
    pitfall: '这些检查发生在编译期，不能判断运行期数值是否有效。C++20 泛型接口通常优先 Concepts 提升可读性。',
    code: `template<typename T>
concept Arithmetic = std::is_arithmetic_v<T>;

template<typename T>
using Plain = std::remove_cvref_t<T>;

static_assert(std::is_same_v<Plain<const int&>, int>);`,
    keywords: '类型萃取 编译期 remove_cvref is_arithmetic 模板'
  },
  {
    id: 'concepts', category: 'types', name: 'std::integral / floating_point / same_as', header: '<concepts>', since: 'C++20', level: 'B',
    brief: '标准 Concepts 用可读约束限制模板参数，并在不满足时给出更明确诊断。',
    signature: 'template<std::integral T> T parseInteger(std::string_view text);',
    returns: 'Concept 在编译期得到 true 或 false，用于约束模板，而不是运行期函数调用。',
    pitfall: 'std::integral 包含有符号、无符号及其他整数类型，需要排除 bool 或限定符号时应增加约束。Concepts 是语言机制与标准库概念的组合。',
    code: `template<std::floating_point T>
T average(T a, T b) {
    return std::midpoint(a, b);
}

static_assert(std::same_as<decltype(average(1.0f, 2.0f)), float>);`,
    keywords: '概念 模板约束 integral floating_point same_as C++20'
  },
  {
    id: 'errc', category: 'types', name: 'std::errc', header: '<system_error>', since: 'C++11', level: 'A',
    brief: '一组可移植错误条件枚举，from_chars 等无异常 API 用它报告错误。',
    signature: 'if (ec == std::errc::invalid_argument) { /* ... */ }',
    returns: 'std::errc{} 表示无错误；常见值有 invalid_argument、result_out_of_range、value_too_large。',
    pitfall: 'errc 是错误条件枚举，不应把所有 error_code 的数值直接当作 errc。解析时还要检查 ptr 是否到达预期位置。',
    code: `auto [ptr, ec] = std::from_chars(first, last, value);

if (ec == std::errc::invalid_argument) {
    // 没有可解析的数字
} else if (ec == std::errc::result_out_of_range) {
    // 数字超出目标类型范围
} else if (ec == std::errc{} && ptr != last) {
    // 数字之后还有多余字符
}`,
    keywords: '错误码 无异常 from_chars invalid_argument out_of_range'
  },
  {
    id: 'exception', category: 'types', name: 'std::exception / runtime_error', header: '<exception> / <stdexcept>', since: 'C++98', level: 'B',
    brief: '标准异常层次的基础；runtime_error 表示运行期错误，what() 提供诊断文本。',
    signature: 'throw std::runtime_error("Cannot load mesh");',
    returns: 'what() 返回以空字符结尾的说明字符串。catch (const std::exception&) 可捕获标准异常派生类。',
    pitfall: '按 const 引用捕获，避免切片。异常适合无法局部正常处理的错误；普通可预期解析失败也可用 optional 或错误码。',
    code: `try {
    Mesh mesh = loadOBJ(path);
} catch (const std::filesystem::filesystem_error& error) {
    report(error.what());
} catch (const std::exception& error) {
    report(error.what());
}`,
    keywords: '异常 try catch throw runtime_error what'
  },
  {
    id: 'source-location', category: 'types', name: 'std::source_location', header: '<source_location>', since: 'C++20', level: 'B',
    brief: '在日志和断言中自动捕获调用处的文件、行、列和函数名。',
    signature: 'void log(std::string_view message, std::source_location where = std::source_location::current());',
    returns: 'file_name()、function_name() 返回文本；line()/column() 返回位置数值。',
    pitfall: '把 current() 放在默认参数中，记录的才是调用者位置；在函数体内部直接调用通常记录的是当前函数内部位置。',
    code: `void logError(
    std::string_view message,
    std::source_location where = std::source_location::current()
) {
    std::cerr << std::format("{}:{}: {}\\n",
        where.file_name(), where.line(), message);
}

logError("Invalid OBJ face");`,
    keywords: '日志 文件名 行号 调试 source_location C++20'
  }
];
