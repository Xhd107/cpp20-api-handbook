export const preprocessorApis = [
  {
    id: 'pp-config', category: 'preprocessor', name: '#if / #ifdef / defined',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '给渲染调试开关定义一致的 0/1 语义。',
    signature: '#if defined(RENDER_TRACE) && RENDER_TRACE',
    returns: '预处理器仅保留选中的分支，#ifdef 只看名字是否已定义。',
    pitfall: '宏定义为 0 时 #ifdef 仍成立。未定义标识符在 #if 表达式中通常按 0 处理，拼错名字可能静默关闭功能。',
    code: `#ifndef RENDER_TRACE
#define RENDER_TRACE 0
#endif
#if RENDER_TRACE
constexpr bool traceEnabled = true;
#else
constexpr bool traceEnabled = false;
#endif`,
    keywords: '宏 预处理 条件编译 调试开关 0 1 构建配置',
    references: [{ label: '工作草案 · cpp.cond', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.cond' }]
  },
  {
    id: 'pp-guard', category: 'preprocessor', name: '头文件防重包含与 #pragma once',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '给项目头文件加上标准的防重包含保护。',
    signature: '#ifndef ENGINE_MESH_FORMAT_HPP',
    returns: '同一翻译单元再次包含时跳过已经读过的定义。许多编译器也支持 #pragma once。',
    pitfall: '保护名称需要项目级前缀，不同文件重名会意外跳过内容。防重包含只作用于单个翻译单元，头文件中的非 inline 外部函数仍可能违反单一定义规则。',
    code: `// mesh_format.hpp
#ifndef ENGINE_MESH_FORMAT_HPP
#define ENGINE_MESH_FORMAT_HPP
struct MeshFormat { unsigned stride; };
#endif`,
    keywords: '宏 预处理 include guard 多重包含 头文件 pragma once ODR',
    references: [{ label: '工作草案 · cpp.include', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.include' }]
  },
  {
    id: 'pp-odr', category: 'preprocessor', name: '配置宏与跨翻译单元的 ODR',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '控制公开结构体布局的宏要在库、插件和调用方使用同一份配置。',
    signature: '#if ENGINE_VERTEX_COLOR',
    returns: '宏会改变预处理后参与编译的类定义，也可能改变 sizeof、成员偏移和调用约定。',
    pitfall: '两个目标用不同值编译同一个公开类型，会违反单一定义规则。链接成功也可能出现顶点错位。由公共配置头提供值，并为不同布局建立独立类型或版本。',
    code: `// 公共配置头中统一定义
#define ENGINE_VERTEX_COLOR 1
struct Vertex {
    float xyz[3];
#if ENGINE_VERTEX_COLOR
    unsigned color;
#endif
};`,
    keywords: '宏 预处理 ABI 接口 布局 插件 编译选项 一个定义规则',
    references: [{ label: '工作草案 · basic.def.odr', url: 'https://timsong-cpp.github.io/cppwp/n4950/basic.def.odr' }]
  },
  {
    id: 'pp-evaluation', category: 'preprocessor', name: '函数式宏的括号与重复求值',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '检查取最大值的宏为何会多调用一次资源查询。',
    signature: '#define ENGINE_MAX(a,b) (((a) > (b)) ? (a) : (b))',
    returns: '预处理器替换记号；比较后，被选中分支对应的表达式会再执行一次。',
    pitfall: '给参数和结果加括号能保护运算优先级，无法保证只求值一次。有副作用的实参应先存局部变量，或改用函数。',
    code: `#define ENGINE_MAX(a, b) (((a) > (b)) ? (a) : (b))
int calls = 0;
auto query = [&] { ++calls; return 8; };
int value = ENGINE_MAX(query(), 0);  // value == 8，calls == 2
#undef ENGINE_MAX`,
    keywords: '宏 预处理 副作用 求值次数 优先级 lambda 宏陷阱',
    references: [{ label: '工作草案 · cpp.replace', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.replace' }]
  },
  {
    id: 'pp-statement', category: 'preprocessor', name: 'do { ... } while (false) 多语句宏',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'B',
    brief: '让一组诊断操作可以安全放入没有花括号的 if/else 调用点。',
    signature: 'ENGINE_RESET(stats);',
    returns: '展开后形如单个语句，调用方的分号构成 do 语句的结尾。',
    pitfall: '宏内部的 break 或 continue 会作用于这层循环。重复使用的实参要防止重复求值；一般业务逻辑可直接用 inline 函数。',
    code: `#define ENGINE_RESET(s) do { (s).draws = 0; (s).tris = 0; } while (false)
struct Stats { int draws, tris; } stats{4, 8};
if (stats.draws > 0)
    ENGINE_RESET(stats);
else
    stats.tris = -1;
#undef ENGINE_RESET`,
    keywords: '宏 预处理 悬空 else 多语句 分号 do while',
    references: [{ label: '工作草案 · cpp.replace', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.replace' }]
  },
  {
    id: 'pp-stringize', category: 'preprocessor', name: '# 字符串化与两层展开',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'A',
    brief: '把编译期着色器变体编号写进诊断文本。',
    signature: '#define ENGINE_STR_RAW(x) #x',
    returns: '直接 #x 得到实参的记号拼写；经过外层普通替换后再字符串化可得到宏的展开值。',
    pitfall: '字符串化会规范化记号之间的空白，不能用来还原原始源码格式。',
    code: `#define ENGINE_STR_RAW(x) #x
#define ENGINE_STR(x) ENGINE_STR_RAW(x)
#define ENGINE_VARIANT 7
const char* name = ENGINE_STR_RAW(ENGINE_VARIANT);  // "ENGINE_VARIANT"
const char* value = ENGINE_STR(ENGINE_VARIANT);     // "7"
#undef ENGINE_VARIANT
#undef ENGINE_STR
#undef ENGINE_STR_RAW`,
    keywords: '宏 预处理 字符串化 stringize 两阶段 日志',
    references: [{ label: '工作草案 · cpp.stringize', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.stringize' }]
  },
  {
    id: 'pp-paste', category: 'preprocessor', name: '## 记号拼接与重新扫描',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'B',
    brief: '从变体编号生成不同的编译期标识符。',
    signature: '#define ENGINE_CAT_RAW(a,b) a##b',
    returns: '连接结果必须是单个有效预处理记号，随后参与重新扫描。外层宏可以先展开编号。',
    pitfall: '## 两侧的参数不会先按普通规则展开；单层拼接宏会把参数的名字直接拼进去。',
    code: `#define ENGINE_CAT_RAW(a, b) a##b
#define ENGINE_CAT(a, b) ENGINE_CAT_RAW(a, b)
#define ENGINE_SLOT 3
constexpr int ENGINE_CAT(binding_, ENGINE_SLOT) = 7;
static_assert(binding_3 == 7, "binding");
#undef ENGINE_SLOT
#undef ENGINE_CAT
#undef ENGINE_CAT_RAW`,
    keywords: '宏 预处理 token paste 拼接 标识符 宏展开',
    references: [{ label: '工作草案 · cpp.concat', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.concat' }]
  },
  {
    id: 'pp-comma', category: 'preprocessor', name: '模板逗号与宏参数边界',
    header: '<utility>', since: 'C++98', level: 'A',
    brief: '给断言或检查宏传入含模板参数逗号的表达式。',
    signature: 'ENGINE_CHECK((expression))',
    returns: '圆括号可以保护内部逗号，使整个表达式作为一个宏实参传入。',
    pitfall: '尖括号和花括号不会对预处理器建立相同的嵌套保护。类型参数可以先起别名；表达式可以整体加一层括号。',
    code: `#define ENGINE_CHECK(expr) static_cast<bool>(expr)
bool ok = ENGINE_CHECK((std::pair<int, int>{1, 2}.second == 2));
#undef ENGINE_CHECK`,
    keywords: '宏 预处理 模板实参 花括号 逗号 assert 参数过多',
    references: [{ label: '工作草案 · cpp.replace.general', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.replace.general' }]
  },
  {
    id: 'pp-variadic', category: 'preprocessor', name: '可变参数宏与 __VA_OPT__',
    header: '<cstdio>', since: 'C++11 / C++20', level: 'A',
    brief: '为有附加参数和没有附加参数的渲染日志提供同一个入口。',
    signature: 'fmt __VA_OPT__(,) __VA_ARGS__',
    returns: 'C++11 的 __VA_ARGS__ 转发可变参数；C++20 的 __VA_OPT__ 只在可变参数展开后有记号时插入内容。',
    pitfall: '避免依赖非标准的逗号删除扩展。转发给 printf 类函数时，格式和实参类型仍须匹配。',
    code: `#define ENGINE_LOG(fmt, ...) std::printf(fmt __VA_OPT__(,) __VA_ARGS__)
ENGINE_LOG("ready\\n");
ENGINE_LOG("frame %d\\n", 12);
#undef ENGINE_LOG`,
    keywords: '宏 预处理 日志 可变参数 空参数 逗号 variadic',
    references: [{ label: '工作草案 · cpp.subst', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.subst' }]
  },
  {
    id: 'pp-x-list', category: 'preprocessor', name: 'X Macro 单表生成枚举与名称',
    header: '语言特性（无需头文件）', since: 'C++98', level: 'B',
    brief: '用同一份像素格式清单生成枚举和调试名称，避免新增格式后漏改名称表。',
    signature: '#define ENGINE_FORMATS(X) X(Rgba8) X(Depth32)',
    returns: '同一份清单分别传入不同展开操作，生成两段普通 C++ 代码。',
    pitfall: '用完立即 #undef 临时宏。示例依赖连续枚举值；若数值是持久化格式编号，需显式生成编号映射。',
    code: `#define ENGINE_FORMATS(X) X(Rgba8) X(Depth32)
#define ENGINE_ENUM(name) name,
enum class Format { ENGINE_FORMATS(ENGINE_ENUM) };
#undef ENGINE_ENUM
#define ENGINE_NAME(name) #name,
const char* names[] = { ENGINE_FORMATS(ENGINE_NAME) };
#undef ENGINE_NAME
#undef ENGINE_FORMATS
const char* depth = names[static_cast<int>(Format::Depth32)];`,
    keywords: '宏 预处理 X宏 X-macro 枚举 反射 名称表',
    references: [{ label: '工作草案 · cpp.rescan', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.rescan' }]
  },
  {
    id: 'pp-scope', category: 'preprocessor', name: '#undef、命名污染与 min/max',
    header: '<algorithm>', since: 'C++98', level: 'B',
    brief: '在第三方头文件定义了函数式 max 宏时，仍然调用标准库的 std::max。',
    signature: '(std::max)(a, b)',
    returns: '括号使 max 后的下一个记号成为右括号，函数式宏不会触发。',
    pitfall: '宏不受 C++ 命名空间和花括号约束。优先在依赖边界处理污染；平台宏和 push_macro/pop_macro 等扩展依工具链而异。',
    code: `// <algorithm> 已包含；第三方头文件可能定义了函数式 max 宏。
int larger = (std::max)(3, 7);  // 即使存在该宏，仍调用标准库函数`,
    keywords: '宏 预处理 Windows NOMINMAX 作用域 污染 命名冲突',
    references: [{ label: '工作草案 · cpp.scope', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.scope' }]
  },
  {
    id: 'pp-assert', category: 'preprocessor', name: 'assert / NDEBUG 与副作用',
    header: '<cassert>', since: 'C++98', level: 'A',
    brief: '为渲染状态加调试断言，同时保留发布构建需要执行的操作。',
    signature: 'assert(ok);',
    returns: '启用断言时检查条件；在包含 <cassert> 时定义了 NDEBUG，则断言表达式不求值。',
    pitfall: '把加载、加锁、递增等必要操作留在断言外。对外部输入的运行时错误处理也要在发布构建中执行。',
    code: `int submits = 0;
bool ok = (++submits == 1);  // 两种构建都会执行
assert(ok);
if (!ok) { /* 在此处理提交失败 */ }`,
    keywords: '宏 预处理 Debug Release 断言 发布构建 副作用',
    references: [{ label: '工作草案 · assertions.assert', url: 'https://timsong-cpp.github.io/cppwp/n4950/assertions.assert' }]
  },
  {
    id: 'pp-feature', category: 'preprocessor', name: '__has_include、<version> 与特性检测',
    header: '<version>', since: 'C++17 / C++20', level: 'A',
    brief: '选择资源导入器能实际使用的标准库接口，在旧库上保留回退。',
    signature: '#if defined(__cpp_lib_byteswap) && __cpp_lib_byteswap >= 202110L',
    returns: '__has_include 从 C++17 起检查头文件可见性；C++20 的 <version> 集中提供库特性宏。',
    pitfall: '头文件存在只说明可以找到它。检查所需宏的数值，再启用对应 API；语言模式也会影响宏是否出现。',
    code: `#if __has_include(<bit>) && defined(__cpp_lib_byteswap) && __cpp_lib_byteswap >= 202110L
constexpr bool nativeByteSwap = true;
#else
constexpr bool nativeByteSwap = false;
#endif`,
    keywords: '宏 预处理 SD-6 特性宏 条件包含 配置 可移植 __cpp_lib',
    references: [{ label: '工作草案 · version.syn', url: 'https://timsong-cpp.github.io/cppwp/n4950/version.syn' }]
  },
  {
    id: 'pp-site', category: 'preprocessor', name: '__FILE__ / __LINE__ 与调用点',
    header: '<cstdio>', since: 'C++98', level: 'B',
    brief: '记录报错源文件和行号，把宏压缩为传递调用位置的一层薄包装。',
    signature: 'ENGINE_REPORT(code)',
    returns: '宏在调用处展开，__FILE__ 提供字符串，__LINE__ 提供逻辑行号。',
    pitfall: '路径可能因构建环境而变化；#line 也能改写逻辑位置。C++20 可用默认参数 std::source_location::current() 捕获调用点。',
    code: `auto report = [](int code, const char* file, int line) {
    std::fprintf(stderr, "%s:%d: render error %d\\n", file, line, code);
};
#define ENGINE_REPORT(code) report((code), __FILE__, __LINE__)
ENGINE_REPORT(7);  // 记录这一行的位置和错误码 7
#undef ENGINE_REPORT`,
    keywords: '宏 预处理 调用者 日志 文件名 行号 source_location',
    references: [{ label: '工作草案 · cpp.predefined', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.predefined' }]
  },
  {
    id: 'pp-elifdef', category: 'preprocessor', name: '#elifdef / #elifndef',
    header: '语言特性（无需头文件）', since: 'C++23', level: 'B',
    featureTest: '无专用特性宏，可在目标工具链上试编译 #elifdef。',
    brief: '为多个后端选择调试标签，用更直接的分支检查宏是否存在。',
    signature: '#elifdef ENGINE_BACKEND_VULKAN',
    returns: '分别等价于 #elif defined(NAME) 和 #elif !defined(NAME)。',
    pitfall: '定义为 0 也算存在。构建脚本若始终定义所有后端并以数值开关选择，应按数值使用 #if/#elif。',
    code: `#if defined(ENGINE_BACKEND_D3D)
constexpr auto backend = "Direct3D";
#elifdef ENGINE_BACKEND_VULKAN
constexpr auto backend = "Vulkan";
#else
constexpr auto backend = "CPU";
#endif`,
    keywords: '宏 预处理 条件分支 后端 预处理 elifdef elifndef',
    references: [{ label: '工作草案 · cpp.cond', url: 'https://timsong-cpp.github.io/cppwp/n4950/cpp.cond' }]
  },
  {
    id: 'pp-embed', category: 'preprocessor', name: '#embed / __has_embed 嵌入小型资源',
    header: '语言特性（无需头文件）', since: 'C++26', level: 'B',
    featureTest: 'defined(__has_embed)',
    brief: '编译时把小图标或查找表写入程序，对缺失或空文件使用回退字节。',
    signature: '#embed "icon.bin"',
    returns: '把资源内容展开为可初始化数组的整数列表。__has_embed 可区分可用非空、空和找不到的资源。',
    pitfall: '用嵌套条件先检测对 __has_embed 的支持，再调用它。外部资源改变时还要让构建系统重新编译相应文件；大纹理一般适合独立资产管线。',
    code: `constexpr unsigned char icon[] = {
#if defined(__has_embed)
#  if __has_embed("icon.bin") == __STDC_EMBED_FOUND__
#    embed "icon.bin"
#  else
    0xff
#  endif
#else
    0xff
#endif
};
static_assert(sizeof(icon) >= 1);`,
    keywords: '宏 预处理 二进制 嵌入 资源文件 shader blob 图标',
    references: [{ label: '工作草案 · cpp.embed', url: 'https://timsong-cpp.github.io/cppwp/n5050/cpp.embed' }]
  }
];
