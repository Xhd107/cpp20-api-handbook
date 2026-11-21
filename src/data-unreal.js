export const unrealCategories = [
  { id: 'ue-core', domain: 'unreal', title: 'U++：反射、宏与蓝图接口', description: 'Unreal 特有类声明、属性与函数标记，以及模块和命名规则。' },
  { id: 'ue-object', domain: 'unreal', title: 'U++：对象、Actor 与资源引用', description: '对象创建、Actor 生命周期、垃圾回收及 Unreal 常用指针。' },
  { id: 'ue-gameplay', domain: 'unreal', title: 'U++：Gameplay 常用工具', description: '字符串、容器、数学类型、日志、断言、委托、计时器与接口。' }
];

export const unrealApis = [
  {
    id: 'ue-class-macros', category: 'ue-core', name: 'UCLASS / USTRUCT / UENUM', header: 'CoreMinimal.h', since: 'Unreal 反射系统', level: 'A',
    brief: '把 C++ 类、结构体和枚举登记到 Unreal 反射系统，让编辑器、序列化和蓝图能够识别它们。',
    signature: 'UCLASS() class ...; USTRUCT() struct ...; UENUM() enum class ...;',
    returns: '这些是 UnrealHeaderTool 识别的声明宏，不是运行期函数，没有普通返回值。',
    pitfall: '普通 C++ 类型不会因为继承或加上宏就自动支持所有蓝图功能；仍需 GENERATED_BODY、正确的 .generated.h 和所需说明符。',
    code: `UCLASS(Blueprintable)
class MYGAME_API AMyActor : public AActor
{
    GENERATED_BODY()
};

USTRUCT(BlueprintType)
struct MYGAME_API FMySettings
{
    GENERATED_BODY()
};

UENUM(BlueprintType)
enum class EMyState : uint8 { Idle, Active };`,
    keywords: 'U++ Unreal UE 虚幻 UCLASS USTRUCT UENUM 反射 蓝图 类 结构体 枚举'
  },
  {
    id: 'ue-generated-body', category: 'ue-core', name: 'GENERATED_BODY + .generated.h', header: 'MyType.generated.h', since: 'UnrealHeaderTool', level: 'A',
    brief: 'UnrealHeaderTool 根据反射声明生成引擎所需的样板代码，GENERATED_BODY 把它放入类型内部。',
    signature: '#include "MyType.generated.h"  // 必须是最后一个 include',
    returns: '构建工具生成反射与序列化相关代码；GENERATED_BODY 本身不是可调用的函数。',
    pitfall: '.generated.h 必须放在该头文件所有 #include 的最后。改完反射声明后若出现奇怪的编译或链接错误，先检查 include 顺序、宏配对和 UHT 输出。',
    code: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MyActor.generated.h" // 最后包含

UCLASS()
class MYGAME_API AMyActor : public AActor
{
    GENERATED_BODY()
};`,
    keywords: 'U++ Unreal GENERATED_BODY generated.h UHT 头文件 编译错误 include'
  },
  {
    id: 'ue-uproperty', category: 'ue-core', name: 'UPROPERTY', header: 'CoreMinimal.h', since: 'Unreal 反射系统', level: 'A',
    brief: '把成员变量暴露给 Unreal 反射系统，用于编辑器显示、蓝图访问、序列化、网络复制和 UObject 引用追踪。',
    signature: 'UPROPERTY(Specifiers..., meta = (...)) Type PropertyName;',
    returns: '声明宏，无普通返回值；具体行为由 Edit、Blueprint、Replicated 等说明符决定。',
    pitfall: '需要让引擎追踪 UObject 强引用时，不能只写普通裸指针成员。UPROPERTY 不等于 public，也不会自动让属性可在蓝图编辑。',
    code: `UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Combat")
float MaxHealth = 100.0f;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
TObjectPtr<USceneComponent> SceneRoot;

UPROPERTY(Replicated)
int32 Score = 0;`,
    keywords: 'U++ Unreal UPROPERTY 属性 反射 蓝图 编辑器 序列化 GC Replicated'
  },
  {
    id: 'ue-property-specifiers', category: 'ue-core', name: 'Edit* / Visible* / BlueprintRead*', header: 'UPROPERTY 说明符', since: 'Unreal 反射系统', level: 'A',
    brief: '常用属性说明符分别控制“在哪里编辑”“只读显示”和“蓝图如何访问”。Category 只负责组织与检索。',
    signature: 'UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Audio")',
    returns: 'EditAnywhere 允许默认值和实例都编辑；EditDefaultsOnly 偏默认值；Visible* 偏只读展示。',
    pitfall: 'BlueprintReadWrite 允许蓝图写入，不代表允许在编辑器细节面板编辑；VisibleAnywhere 也不等于运行期线程安全或网络同步。',
    code: `UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Audio")
TObjectPtr<USoundBase> HitSound;

UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement",
          meta = (ClampMin = "0.0", UIMin = "0.0"))
float MoveSpeed = 600.0f;

UPROPERTY(VisibleInstanceOnly, BlueprintReadOnly, Category = "State")
int32 CurrentAmmo = 0;`,
    keywords: 'U++ Unreal EditAnywhere EditDefaultsOnly VisibleAnywhere BlueprintReadOnly BlueprintReadWrite Category ClampMin'
  },
  {
    id: 'ue-ufunction', category: 'ue-core', name: 'UFUNCTION / BlueprintCallable', header: 'CoreMinimal.h', since: 'Unreal 反射系统', level: 'A',
    brief: '把成员函数登记到反射系统；BlueprintCallable 允许蓝图调用，动态委托绑定和部分引擎回调也要求 UFUNCTION。',
    signature: 'UFUNCTION(BlueprintCallable, Category = "Combat") void Attack();',
    returns: '声明宏，无普通返回值；函数自身返回值按 C++ 声明，并可通过支持的类型暴露给蓝图。',
    pitfall: '参数和返回类型必须受 Unreal 反射支持。纯 C++ 函数不必一律加 UFUNCTION，过多的蓝图入口会扩大难以维护的公共接口。',
    code: `UFUNCTION(BlueprintCallable, Category = "Combat")
void Attack();

UFUNCTION(BlueprintPure, Category = "Combat")
float GetHealthPercent() const;

UFUNCTION()
void HandleHealthChanged(float NewHealth);`,
    keywords: 'U++ Unreal UFUNCTION BlueprintCallable BlueprintPure 函数 蓝图 动态委托'
  },
  {
    id: 'ue-blueprint-events', category: 'ue-core', name: 'BlueprintImplementableEvent / BlueprintNativeEvent', header: 'UFUNCTION 说明符', since: 'Unreal 反射系统', level: 'A',
    brief: '让 C++ 调用蓝图实现的事件；NativeEvent 还允许 C++ 提供默认实现，蓝图可选择覆盖。',
    signature: 'UFUNCTION(BlueprintNativeEvent) void Event(); void Event_Implementation();',
    returns: '调用声明的事件名即可进入生成的蓝图 thunk；NativeEvent 的 C++ 默认逻辑放在 _Implementation 中。',
    pitfall: 'BlueprintImplementableEvent 不写 C++ 函数体。BlueprintNativeEvent 必须声明并定义 _Implementation；调用 Event()，不要直接调用 Event_Implementation()。',
    code: `// .h
UFUNCTION(BlueprintImplementableEvent, Category = "Interaction")
void OnFocused();

UFUNCTION(BlueprintNativeEvent, Category = "Interaction")
void Interact(AActor* InstigatorActor);
virtual void Interact_Implementation(AActor* InstigatorActor);

// .cpp
void AMyActor::Interact_Implementation(AActor* InstigatorActor)
{
    // 蓝图未覆盖时执行这里的默认逻辑
}`,
    keywords: 'U++ Unreal BlueprintImplementableEvent BlueprintNativeEvent _Implementation 蓝图事件 覆盖'
  },
  {
    id: 'ue-prefixes', category: 'ue-core', name: 'A / U / F / E / T / I 类型前缀', header: 'Epic 编码规范', since: 'Unreal 编码约定', level: 'A',
    brief: 'Unreal 用前缀快速表达类型角色：A 是 Actor，U 是 UObject，F 是普通结构或类型，E 是枚举，T 是模板，I 常表示接口。',
    signature: 'AActor, UObject, FVector, EMyEnum, TArray<T>, IInteractable',
    returns: '这是命名约定，不影响函数返回值；S 常用于 Slate 控件，G 常见于引擎全局变量名。',
    pitfall: '前缀不能替代类型检查。自定义项目还可追加项目前缀，例如 AHeroCharacter；标准 C++ 类型不要机械套用 Unreal 前缀。',
    code: `class AMyCharacter;       // Actor 派生类
class UMySaveSubsystem;   // UObject 派生类
struct FItemData;         // 值类型 / 结构体
enum class EItemRarity : uint8;
template<typename T> class TMyWrapper;

TArray<FVector> Points;
FHitResult Hit;           // 值类型通常用 . 访问
AActor* Actor = nullptr;  // 对象指针通常用 -> 访问`,
    keywords: 'U++ Unreal 前缀 AActor UObject FVector FHitResult E T I 命名规范'
  },
  {
    id: 'ue-modules', category: 'ue-core', name: '*.Build.cs / 模块依赖', header: 'MyGame.Build.cs（C#）', since: 'UnrealBuildTool', level: 'B',
    brief: 'UnrealBuildTool 用 Build.cs 配置模块及依赖。使用其他模块的公开类型前，既要包含头文件，也要声明模块依赖。',
    signature: 'PublicDependencyModuleNames.AddRange(new string[] { "Core", "Engine" });',
    returns: '构建脚本没有 C++ 返回值；Public 依赖会传给依赖本模块的其他模块，Private 依赖只供本模块使用。',
    pitfall: 'Build.cs 是 C# 而不是 C++。出现“类型未定义”或链接错误时，检查模块名、头文件和 Public/Private 依赖，不要盲目重复 include。',
    code: `using UnrealBuildTool;

public class MyGame : ModuleRules
{
    public MyGame(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(
            new string[] { "Core", "CoreUObject", "Engine", "InputCore" });
        PrivateDependencyModuleNames.AddRange(
            new string[] { "UMG", "GameplayTasks" });
    }
}`,
    keywords: 'U++ Unreal Build.cs UnrealBuildTool Module PublicDependency PrivateDependency 模块 链接错误'
  },

  {
    id: 'ue-object-actor-component', category: 'ue-object', name: 'UObject / AActor / UActorComponent', header: 'UObject/Object.h · GameFramework/Actor.h', since: 'Unreal Gameplay 架构', level: 'A',
    brief: 'UObject 是反射与垃圾回收对象基础；AActor 能放入世界；UActorComponent 把可复用能力组合到 Actor 上。',
    signature: 'UObject → AActor；UObject → UActorComponent → USceneComponent',
    returns: '这些是基类，不是函数。Actor 有世界生命周期；SceneComponent 额外具有场景变换，可建立组件层级。',
    pitfall: '不要把所有类都做成 Actor。纯数据或 Subsystem 往往适合 UObject；需要位置但不需要独立 Actor 时，可考虑 SceneComponent。',
    code: `UCLASS()
class MYGAME_API UInventoryComponent : public UActorComponent
{
    GENERATED_BODY()
};

UCLASS()
class MYGAME_API ATreasureChest : public AActor
{
    GENERATED_BODY()
};`,
    keywords: 'U++ Unreal UObject AActor UActorComponent USceneComponent 组件 世界 对象 生命周期'
  },
  {
    id: 'ue-default-subobject', category: 'ue-object', name: 'CreateDefaultSubobject<T>', header: 'UObject/Object.h', since: 'Unreal 对象创建', level: 'A',
    brief: '在 Actor 构造函数中创建默认组件或子对象，并让它随类默认对象和实例正确建立。',
    signature: 'Component = CreateDefaultSubobject<USceneComponent>(TEXT("Name"));',
    returns: '返回所创建子对象的指针；相同 Outer 下的子对象名称应稳定且唯一。',
    pitfall: '主要用于构造函数。运行期动态创建普通 UObject 用 NewObject，生成 Actor 用 SpawnActor；不要混用 new。',
    code: `AMyCharacter::AMyCharacter()
{
    PrimaryActorTick.bCanEverTick = true;

    SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("SceneRoot"));
    SetRootComponent(SceneRoot);

    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(SceneRoot);
}`,
    keywords: 'U++ Unreal CreateDefaultSubobject 构造函数 组件 SetupAttachment RootComponent'
  },
  {
    id: 'ue-new-object', category: 'ue-object', name: 'NewObject<T>', header: 'UObject/Object.h', since: 'Unreal 对象创建', level: 'A',
    brief: '在运行期创建普通 UObject 实例，并通过 Outer 指定其对象层级归属。',
    signature: 'T* Object = NewObject<T>(Outer);',
    returns: '返回新 UObject 派生类实例的指针；可用 UPROPERTY 等强引用保持其存活。',
    pitfall: 'UObject 派生类不要直接使用 C++ new。NewObject 不会把 Actor 放进世界，Actor 应使用 SpawnActor；也不要把返回值误当成共享所有权指针。',
    code: `UMyInventory* Inventory = NewObject<UMyInventory>(this);

if (IsValid(Inventory))
{
    Inventory->Initialize(MaxSlots);
}

// 若需要长期持有，可在类成员中保存：
// UPROPERTY()
// TObjectPtr<UMyInventory> Inventory;`,
    keywords: 'U++ Unreal NewObject Outer 创建对象 UObject 构造函数 new'
  },
  {
    id: 'ue-spawn-actor', category: 'ue-object', name: 'GetWorld()->SpawnActor<T>', header: 'Engine/World.h', since: 'Unreal Actor 创建', level: 'A',
    brief: '在指定 UWorld 中生成 Actor，可传类、位置、旋转和生成参数。',
    signature: 'T* Actor = World->SpawnActor<T>(Class, Location, Rotation, Params);',
    returns: '成功时返回新 Actor 指针；因碰撞处理、世界状态等原因也可能返回 nullptr。',
    pitfall: '构造函数不适合访问已完成的 World 游戏状态。生成后立即检查结果；延迟生成可使用 SpawnActorDeferred，完成时再 FinishSpawning。',
    code: `FActorSpawnParameters Params;
Params.Owner = this;
Params.SpawnCollisionHandlingOverride =
    ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

AActor* NewActor = GetWorld()->SpawnActor<AActor>(
    ProjectileClass, SpawnLocation, SpawnRotation, Params);

if (!IsValid(NewActor))
{
    UE_LOG(LogTemp, Warning, TEXT("Actor spawn failed"));
}`,
    keywords: 'U++ Unreal SpawnActor UWorld 生成 Actor Deferred SpawnCollision 位置 旋转'
  },
  {
    id: 'ue-lifecycle', category: 'ue-object', name: 'BeginPlay / Tick / EndPlay', header: 'GameFramework/Actor.h', since: 'Unreal Actor 生命周期', level: 'A',
    brief: 'BeginPlay 用于游戏内初始化，Tick 按帧更新，EndPlay 用于停止活动和解绑等清理。',
    signature: 'void BeginPlay() override; void Tick(float DeltaSeconds) override;',
    returns: '这些重载通常无返回值；Tick 的 DeltaSeconds 是距上一帧的秒数。',
    pitfall: '构造函数早于 BeginPlay，不能依赖完整世界状态。Tick 默认未开启，要设置 bCanEverTick；清理后调用合适的 Super，避免重复绑定和重复定时器。',
    code: `void AMyActor::BeginPlay()
{
    Super::BeginPlay();
    CurrentHealth = MaxHealth;
}

void AMyActor::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    AddActorWorldOffset(FVector(0.0, 0.0, Speed * DeltaSeconds));
}

void AMyActor::EndPlay(const EEndPlayReason::Type Reason)
{
    GetWorldTimerManager().ClearAllTimersForObject(this);
    Super::EndPlay(Reason);
}`,
    keywords: 'U++ Unreal BeginPlay Tick EndPlay DeltaSeconds 生命周期 构造函数 Super'
  },
  {
    id: 'ue-cast', category: 'ue-object', name: 'Cast<T> / CastChecked<T>', header: 'UObject/Object.h 与模板转换工具', since: 'Unreal 类型转换', level: 'A',
    brief: 'Cast 使用 Unreal 反射类型信息检查 UObject 转换，失败返回 nullptr；CastChecked 要求转换必须成功。',
    signature: 'auto* Derived = Cast<UDerived>(Object);',
    returns: 'Cast 成功返回目标类型指针，失败返回 nullptr；CastChecked 失败会触发断言而不是静默返回。',
    pitfall: 'Cast 后仍需检查指针。CastChecked 只用于逻辑上必然成立的类型；它不等于 static_cast，也不能让无关 C++ 类型安全互转。',
    code: `void AMyActor::NotifyHit(AActor* OtherActor)
{
    if (AMyCharacter* Character = Cast<AMyCharacter>(OtherActor))
    {
        Character->ApplyDamage(10.0f);
    }
}

// 已确定类型且失败代表程序错误时：
// AMyCharacter* Character = CastChecked<AMyCharacter>(OtherActor);`,
    keywords: 'U++ Unreal Cast CastChecked 类型转换 反射 nullptr dynamic_cast'
  },
  {
    id: 'ue-isvalid', category: 'ue-object', name: 'IsValid / GetNameSafe', header: 'UObject/WeakObjectPtr.h 与 UObject 工具', since: 'Unreal 对象检查', level: 'A',
    brief: 'IsValid 同时检查 UObject 指针非空及对象未进入销毁流程；GetNameSafe 可安全取得名称用于日志。',
    signature: 'if (IsValid(Object)) { Object->Function(); }',
    returns: 'IsValid 返回 bool；GetNameSafe 返回 FString，空指针也可安全处理。',
    pitfall: '非空不代表对象仍可安全使用。只检查 nullptr 可能漏掉待销毁 UObject；但必然成立的内部不变量应使用断言，而不是静默跳过错誤。',
    code: `if (IsValid(TargetActor))
{
    TargetActor->SetActorHiddenInGame(true);
}

UE_LOG(LogTemp, Log, TEXT("Target: %s"), *GetNameSafe(TargetActor));

// 弱引用也可先取得裸指针：
if (AActor* Actor = WeakTarget.Get())
{
    Actor->SetActorEnableCollision(false);
}`,
    keywords: 'U++ Unreal IsValid GetNameSafe PendingKill 空指针 销毁 对象检查'
  },
  {
    id: 'ue-tobject-ptr', category: 'ue-object', name: 'TObjectPtr<T>', header: 'UObject/ObjectPtr.h', since: 'UE5', level: 'A',
    brief: 'UE5 推荐用于 UPROPERTY UObject 成员引用的包装类型，支持编辑器与资产系统的追踪能力。',
    signature: 'UPROPERTY() TObjectPtr<UMyObject> Object;',
    returns: '可像指针一样判空、赋值和用 -> 访问；它不是 shared_ptr，不表示共享所有权。',
    pitfall: 'TObjectPtr 本身不代替 UPROPERTY，也不负责延长普通局部对象寿命。函数参数和短生命周期局部变量通常继续使用裸指针即可。',
    code: `UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
TObjectPtr<UCameraComponent> Camera;

UPROPERTY(EditDefaultsOnly, Category = "Effects")
TObjectPtr<UNiagaraSystem> HitEffect;

void AMyActor::BeginPlay()
{
    Super::BeginPlay();
    if (Camera)
    {
        Camera->SetActive(true);
    }
}`,
    keywords: 'U++ Unreal UE5 TObjectPtr UPROPERTY 裸指针 成员变量 引用'
  },
  {
    id: 'ue-weak-object-ptr', category: 'ue-object', name: 'TWeakObjectPtr<T>', header: 'UObject/WeakObjectPtr.h', since: 'Unreal 弱对象引用', level: 'A',
    brief: '保存不阻止垃圾回收的 UObject 弱引用，适合缓存、观察者和非 owning 引用。',
    signature: 'TWeakObjectPtr<AActor> Target; Target.Get();',
    returns: 'Get 在对象有效时返回裸指针，否则返回 nullptr；IsValid 可直接返回当前有效性。',
    pitfall: '弱引用不保证对象在后续代码中一直存活，应把 Get 的结果保存为局部指针再使用。需要保持对象存活时不要使用弱引用。',
    code: `TWeakObjectPtr<AActor> WeakTarget;

void AMyActor::SetTarget(AActor* NewTarget)
{
    WeakTarget = NewTarget;
}

void AMyActor::FocusTarget()
{
    if (AActor* Target = WeakTarget.Get())
    {
        Target->SetActorHiddenInGame(false);
    }
}`,
    keywords: 'U++ Unreal TWeakObjectPtr 弱引用 GC Get IsValid 缓存 观察者'
  },
  {
    id: 'ue-soft-object-ptr', category: 'ue-object', name: 'TSoftObjectPtr<T> / TSoftClassPtr<T>', header: 'UObject/SoftObjectPtr.h', since: 'Unreal 软资产引用', level: 'B',
    brief: '用资产路径引用可能尚未加载的资源或类，避免仅因保存引用就强制加载整个资产。',
    signature: 'TSoftObjectPtr<UTexture2D> Icon; TSoftClassPtr<AActor> ActorClass;',
    returns: 'Get 只返回已经加载且有效的对象；LoadSynchronous 会同步加载并返回对象，异步加载通常配合 FStreamableManager。',
    pitfall: 'Get 返回空可能只是尚未加载，不一定是路径无效。不要在性能敏感路径随意 LoadSynchronous；使用异步加载时还要处理回调与生命周期。',
    code: `UPROPERTY(EditDefaultsOnly, Category = "UI")
TSoftObjectPtr<UTexture2D> Icon;

void AMyActor::UseIcon()
{
    if (UTexture2D* LoadedIcon = Icon.Get())
    {
        ApplyIcon(LoadedIcon);
        return;
    }

    // 简单工具代码可同步加载；游戏热点路径应改用异步加载。
    TSoftObjectPtr<UTexture2D> Requested = Icon;
    Requested.LoadSynchronous();
}`,
    keywords: 'U++ Unreal TSoftObjectPtr TSoftClassPtr 软引用 资产 异步加载 LoadSynchronous Streamable'
  },
  {
    id: 'ue-subclass-of', category: 'ue-object', name: 'TSubclassOf<T>', header: 'Templates/SubclassOf.h', since: 'Unreal 类引用', level: 'A',
    brief: '保存“某个基类或其派生类”的 UClass，而不是保存对象实例，常用于让设计师选择要生成的蓝图类。',
    signature: 'UPROPERTY(EditDefaultsOnly) TSubclassOf<AActor> ActorClass;',
    returns: '可转换为 UClass*；判空后可传给 SpawnActor、GetDefault 等接受类的 API。',
    pitfall: '它引用的是类，不是世界中已生成的 Actor。使用前检查是否配置；编辑器限制派生类型不代表类一定已经加载了所有实例资源。',
    code: `UPROPERTY(EditDefaultsOnly, Category = "Combat")
TSubclassOf<AMyProjectile> ProjectileClass;

void AMyWeapon::Fire(const FVector& Location, const FRotator& Rotation)
{
    if (!ProjectileClass) return;

    FActorSpawnParameters Params;
    Params.Owner = this;
    GetWorld()->SpawnActor<AMyProjectile>(
        ProjectileClass, Location, Rotation, Params);
}`,
    keywords: 'U++ Unreal TSubclassOf UClass StaticClass 蓝图类 生成 SpawnActor'
  },
  {
    id: 'ue-garbage-collection', category: 'ue-object', name: 'UPROPERTY 引用与垃圾回收', header: 'Unreal Garbage Collection', since: 'Unreal UObject 内存管理', level: 'A',
    brief: 'Unreal 通过被追踪的强引用判断 UObject 是否仍被使用；UPROPERTY 对象引用是常见的保活方式。',
    signature: 'UPROPERTY() TObjectPtr<UObject> StrongReference;',
    returns: '没有手动 delete 的返回过程；失去所有强引用的 UObject 会在之后的垃圾回收中清理，时间并不等同于当帧立即释放。',
    pitfall: '未标记的普通 UObject* 成员通常不参与 GC 引用追踪。Actor Destroy 后也不等于内存立刻清空，访问前仍需 IsValid；高频创建销毁还可能造成 GC 峰值。',
    code: `UPROPERTY()
TObjectPtr<UMyDataObject> OwnedData; // 强引用，帮助保持对象存活

TWeakObjectPtr<AActor> ObservedActor; // 弱引用，不阻止回收

void AMyActor::ReleaseObservation()
{
    ObservedActor = nullptr;
}

// 非 UObject 类型不使用这套 GC，应使用值语义或合适的智能指针。`,
    keywords: 'U++ Unreal GC 垃圾回收 UPROPERTY 强引用 弱引用 DestroyActor delete 内存'
  },
  {
    id: 'ue-shared-ptr', category: 'ue-object', name: 'TSharedPtr / TSharedRef / TUniquePtr', header: 'Templates/SharedPointer.h · Templates/UniquePtr.h', since: 'Unreal 智能指针', level: 'B',
    brief: '这些智能指针用于非 UObject 的 C++ 数据与系统对象，提供共享或独占所有权。',
    signature: 'TSharedRef<FType> Shared = MakeShared<FType>();',
    returns: 'MakeShared 返回 TSharedRef；MakeUnique 返回 TUniquePtr；TSharedPtr 可为空，TSharedRef 表示必须有效的共享引用。',
    pitfall: '不要把它们当作 UObject 垃圾回收的替代品。UObject 通常使用 UPROPERTY、TObjectPtr、TWeakObjectPtr；两套生命周期系统不要混用。',
    code: `struct FDownloadResult
{
    FString Content;
};

TSharedRef<FDownloadResult> Result = MakeShared<FDownloadResult>();
Result->Content = TEXT("Ready");

TSharedPtr<FDownloadResult> OptionalResult = Result;
TUniquePtr<FDownloadResult> Exclusive = MakeUnique<FDownloadResult>();`,
    keywords: 'U++ Unreal TSharedPtr TSharedRef TUniquePtr MakeShared MakeUnique 非UObject 智能指针'
  },

  {
    id: 'ue-strings', category: 'ue-gameplay', name: 'FString / FName / FText', header: 'Containers/UnrealString.h · Internationalization/Text.h', since: 'Unreal 字符串', level: 'A',
    brief: 'FString 用于可修改文本，FName 用于高频比较的标识符，FText 用于需要本地化的用户可见文本。',
    signature: 'FString Value; FName Id; FText DisplayText;',
    returns: 'FName 和 FText 可用 ToString 转为 FString；FString::FromInt、FText::FromString 等用于构造或转换。',
    pitfall: 'FName 不区分大小写且不可变；FText 转 FString 可能丢失本地化信息。面向玩家的 UI 文本不要长期只用 FString，字符串字面量通常配合 TEXT。',
    code: `FString RawName = TEXT("Player_01");
FName SocketName(TEXT("hand_r"));

FText Title = NSLOCTEXT("UI", "InventoryTitle", "Inventory");
FText Message = FText::Format(
    NSLOCTEXT("UI", "AmmoFormat", "Ammo: {0}"),
    FText::AsNumber(CurrentAmmo));

FString LogText = SocketName.ToString();
UE_LOG(LogTemp, Log, TEXT("%s"), *LogText);`,
    keywords: 'U++ Unreal FString FName FText TEXT NSLOCTEXT 本地化 字符串 转换'
  },
  {
    id: 'ue-tarray', category: 'ue-gameplay', name: 'TArray<T>', header: 'Containers/Array.h', since: 'Unreal 容器', level: 'A',
    brief: '连续存储的动态数组，是 Unreal Gameplay 代码最常用的顺序容器。',
    signature: 'TArray<T> Values; Values.Add(Value); Values.Emplace(Args...);',
    returns: 'Num 返回元素数，IsEmpty 判断是否为空，GetData 返回连续内存指针，RemoveAt 删除指定下标。',
    pitfall: '下标前先检查 IsValidIndex。扩容可能使指针、引用和迭代器失效；RemoveAt 保持顺序，RemoveAtSwap 更快但会改变顺序。',
    code: `TArray<FVector> SpawnPoints;
SpawnPoints.Reserve(32);
SpawnPoints.Add(FVector::ZeroVector);
SpawnPoints.Emplace(100.0, 0.0, 50.0);

for (const FVector& Point : SpawnPoints)
{
    DrawDebugPoint(GetWorld(), Point, 8.0f, FColor::Green);
}

if (SpawnPoints.IsValidIndex(0))
{
    const FVector First = SpawnPoints[0];
}`,
    keywords: 'U++ Unreal TArray Add Emplace Num Reserve IsValidIndex RemoveAt RemoveAtSwap 动态数组'
  },
  {
    id: 'ue-map-set', category: 'ue-gameplay', name: 'TMap / TSet', header: 'Containers/Map.h · Containers/Set.h', since: 'Unreal 容器', level: 'A',
    brief: 'TMap 保存唯一键到值的映射，TSet 保存唯一元素，二者常用于快速查找和去重。',
    signature: 'TMap<Key, Value> Map; TSet<T> Set;',
    returns: 'Find 返回指向值的可空指针；FindRef 返回值副本或默认构造值；Contains 返回 bool。',
    pitfall: 'FindRef 在键不存在时返回默认值，不能据此区分“值为零”和“键不存在”。自定义键需要合适的相等和 GetTypeHash 支持，遍历时避免结构性修改。',
    code: `TMap<FName, int32> Scores;
Scores.Add(TEXT("Player"), Scores.FindRef(TEXT("Player")) + 10);

if (int32* Score = Scores.Find(TEXT("Player")))
{
    *Score += 5;
}

TSet<FName> Visited;
if (!Visited.Contains(RoomName))
{
    Visited.Add(RoomName);
}`,
    keywords: 'U++ Unreal TMap TSet Find FindRef Contains Add 去重 字典 哈希 GetTypeHash'
  },
  {
    id: 'ue-math-types', category: 'ue-gameplay', name: 'FVector / FRotator / FQuat / FTransform', header: 'Math/Vector.h · Math/Rotator.h · Math/Transform.h', since: 'Unreal 数学类型', level: 'A',
    brief: 'FVector 表示位置或方向，FRotator 用 Pitch/Yaw/Roll 表示旋转，FQuat 是四元数，FTransform 组合位置、旋转和缩放。',
    signature: 'FVector Location; FRotator Rotation; FTransform Transform;',
    returns: 'FVector::Dist 返回距离，GetSafeNormal 返回安全归一化向量；Rotator 和 Quaternion 可通过对应函数转换。',
    pitfall: 'Unreal 默认以厘米为世界单位，Z 轴向上。归一化零向量前要检查；组合大量旋转时四元数通常比欧拉角更合适。',
    code: `FVector Start = GetActorLocation();
FVector End = Start + GetActorForwardVector() * 500.0;

const float Distance = FVector::Dist(Start, End);
const FVector Direction = (End - Start).GetSafeNormal();

FRotator Rotation(0.0f, 90.0f, 0.0f); // Pitch, Yaw, Roll
FQuat Quaternion = Rotation.Quaternion();
FTransform SpawnTransform(Quaternion, Start, FVector::OneVector);`,
    keywords: 'U++ Unreal FVector FRotator FQuat FTransform 向量 旋转 四元数 厘米 Z轴 Pitch Yaw Roll'
  },
  {
    id: 'ue-log', category: 'ue-gameplay', name: 'UE_LOG / TEXT / AddOnscreenDebugMessage', header: 'Logging/LogMacros.h · Engine/Engine.h', since: 'Unreal 日志', level: 'A',
    brief: 'UE_LOG 按日志分类和严重级别输出格式化诊断，TEXT 标记引擎字符字面量，屏幕调试信息可通过 GEngine 输出。',
    signature: 'UE_LOG(Category, Verbosity, TEXT("Format"), Args...);',
    returns: '日志宏无普通返回值；自定义分类用 DECLARE_LOG_CATEGORY_EXTERN 声明、DEFINE_LOG_CATEGORY 定义。',
    pitfall: 'FString 传给 %s 通常写 *Value 转为 TCHAR 指针。不要用日志替代真正的错误处理；高频 Tick 日志会淹没输出并影响性能。',
    code: `// MyGame.h
DECLARE_LOG_CATEGORY_EXTERN(LogMyGame, Log, All);

// MyGame.cpp
DEFINE_LOG_CATEGORY(LogMyGame);

UE_LOG(LogMyGame, Warning,
    TEXT("Health=%.1f Target=%s"), Health, *GetNameSafe(Target));

if (GEngine)
{
    GEngine->AddOnscreenDebugMessage(
        -1, 3.0f, FColor::Yellow, TEXT("Interaction complete"));
}`,
    keywords: 'U++ Unreal UE_LOG TEXT GEngine AddOnscreenDebugMessage 日志 FString %s Warning Error'
  },
  {
    id: 'ue-asserts', category: 'ue-gameplay', name: 'check / checkf / ensureMsgf', header: 'AssertionMacros.h', since: 'Unreal 断言', level: 'A',
    brief: 'check 用于绝不应发生且无法安全继续的错误，ensure 用于希望报告但尝试继续的异常状态。',
    signature: 'check(Expression); checkf(Expression, TEXT("...")); ensureMsgf(...);',
    returns: 'check 失败触发断言；ensure 系列返回表达式的布尔结果，可据此提前返回或降级处理。',
    pitfall: '不要用 check 验证普通可预期输入，例如玩家眼前没有交互对象。也不要用 if 静默吞掉本应立刻暴露的内部不变量破坏。',
    code: `void AMyActor::ApplyReward(int32 Amount)
{
    checkf(Amount >= 0, TEXT("Reward must not be negative"));
    Score += Amount;
}

bool AMyActor::ConsumeAmmo()
{
    if (!ensureMsgf(CurrentAmmo > 0, TEXT("No ammo to consume")))
    {
        return false;
    }

    --CurrentAmmo;
    return true;
}`,
    keywords: 'U++ Unreal check checkf ensure ensureMsgf 断言 空指针 防御式编程 调试'
  },
  {
    id: 'ue-dynamic-delegate', category: 'ue-gameplay', name: 'DECLARE_DYNAMIC_MULTICAST_DELEGATE', header: 'Engine/Engine.h 与委托声明宏', since: 'Unreal 动态委托', level: 'A',
    brief: '动态组播委托可暴露给蓝图，也就是常见的事件分发器；C++ 用 AddDynamic 绑定、Broadcast 触发。',
    signature: 'DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnChanged, float, NewValue);',
    returns: 'Broadcast 依次通知绑定回调，无普通返回值；AddDynamic 将 UFUNCTION 成员函数加入通知列表。',
    pitfall: '回调签名必须完全匹配，并用 UFUNCTION 标记。避免在构造函数绑定；可在 BeginPlay 等生命周期中绑定，需要提前停止时 RemoveDynamic。',
    code: `DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(
    FOnHealthChanged, float, NewHealth);

// 类成员：
UPROPERTY(BlueprintAssignable, Category = "Combat")
FOnHealthChanged OnHealthChanged;

UFUNCTION()
void HandleHealthChanged(float NewHealth);

// BeginPlay 中：
OnHealthChanged.AddDynamic(this, &AMyActor::HandleHealthChanged);

// 状态变化时：
OnHealthChanged.Broadcast(CurrentHealth);`,
    keywords: 'U++ Unreal 动态组播委托 Event Dispatcher BlueprintAssignable AddDynamic Broadcast UFUNCTION'
  },
  {
    id: 'ue-native-delegate', category: 'ue-gameplay', name: 'DECLARE_DELEGATE / BindUObject / ExecuteIfBound', header: 'Delegates/Delegate.h', since: 'Unreal 原生委托', level: 'B',
    brief: '原生委托面向 C++，通常比动态委托轻量，可绑定 UObject 函数、Lambda、共享指针对象等。',
    signature: 'DECLARE_DELEGATE_OneParam(FOnDamage, float);',
    returns: 'ExecuteIfBound 在已绑定时调用；IsBound 返回是否绑定；单点委托用 Execute，组播委托通常用 Broadcast。',
    pitfall: 'Execute 前未检查绑定可能触发断言。BindRaw 不管理生命周期；BindUObject 使用弱对象引用，但仍建议 ExecuteIfBound 并做好解绑。',
    code: `DECLARE_DELEGATE_OneParam(FOnDamageReceived, float);

FOnDamageReceived OnDamageReceived;
OnDamageReceived.BindUObject(this, &AMyActor::HandleDamage);

void AMyActor::TakeDamage(float Amount)
{
    OnDamageReceived.ExecuteIfBound(Amount);
}

// 不再监听时：OnDamageReceived.Unbind();`,
    keywords: 'U++ Unreal 原生委托 DECLARE_DELEGATE BindUObject BindLambda Execute ExecuteIfBound IsBound Unbind'
  },
  {
    id: 'ue-timers', category: 'ue-gameplay', name: 'FTimerHandle / SetTimer / ClearTimer', header: 'TimerManager.h', since: 'Unreal 计时器', level: 'A',
    brief: 'TimerManager 在指定延迟或周期后调用回调，适合冷却、延迟生成和周期逻辑。',
    signature: 'GetWorldTimerManager().SetTimer(Handle, Object, &Class::Function, Delay, bLoop);',
    returns: 'SetTimer 安排回调，FTimerHandle 用于之后查询或取消；ClearTimer 取消对应计时器。',
    pitfall: 'SetTimer 不是阻塞 sleep，游戏会继续执行。回调对象销毁、重复设置和循环计时器都需要管理；Tick 能直接表达的简单逻辑不必堆叠计时器。',
    code: `FTimerHandle InvulnerabilityTimer;

void AMyActor::StartInvulnerability()
{
    bInvulnerable = true;
    GetWorldTimerManager().SetTimer(
        InvulnerabilityTimer, this, &AMyActor::EndInvulnerability,
        2.0f, false);
}

void AMyActor::EndPlay(const EEndPlayReason::Type Reason)
{
    GetWorldTimerManager().ClearTimer(InvulnerabilityTimer);
    Super::EndPlay(Reason);
}`,
    keywords: 'U++ Unreal FTimerHandle SetTimer ClearTimer TimerManager 延迟 周期 冷却 EndPlay'
  },
  {
    id: 'ue-interfaces', category: 'ue-gameplay', name: 'UINTERFACE / Implements / Execute_*', header: 'UObject/Interface.h', since: 'Unreal 接口', level: 'B',
    brief: 'Unreal 接口让不共享同一基类的对象提供统一能力，减少向具体 Gameplay 类 Cast 的耦合。',
    signature: 'UINTERFACE() class UMyInterface; class IMyInterface;',
    returns: 'Implements<UMyInterface>() 返回是否实现接口；Execute_Function 可同时调用 C++ 或蓝图实现的接口事件。',
    pitfall: 'U 前缀类用于反射和类型检查，I 前缀类承载接口函数。BlueprintNativeEvent 接口函数要通过 Execute_* 调用，C++ 默认实现仍写 _Implementation。',
    code: `UINTERFACE(MinimalAPI)
class UInteractable : public UInterface { GENERATED_BODY() };

class MYGAME_API IInteractable
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable, BlueprintNativeEvent, Category = "Interaction")
    void Interact(AActor* InstigatorActor);
};

// 对任意 Actor 调用：
if (OtherActor && OtherActor->Implements<UInteractable>())
{
    IInteractable::Execute_Interact(OtherActor, this);
}`,
    keywords: 'U++ Unreal UINTERFACE UInterface IInterface Implements Execute_Interact 接口 BlueprintNativeEvent'
  }
];
