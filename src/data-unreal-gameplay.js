export const gameplayCategories = [
  { id: 'ue-player-actions', domain: 'unreal', title: '玩家输入、角色与相机', description: '配置本地输入、驱动移动、切换镜头和控制角色。' },
  { id: 'ue-world-actions', domain: 'unreal', title: '关卡交互与机关', description: '检测玩家目标、控制机关、附着道具和清理临时对象。' },
  { id: 'ue-rule-actions', domain: 'unreal', title: '战斗数值、物品与任务', description: '组织生命值、冷却、库存和一次性任务状态。' },
  { id: 'ue-event-actions', domain: 'unreal', title: '蓝图脚本与表现反馈', description: '从 C++ 发起蓝图事件、动画、材质和声音反馈。' },
  { id: 'ue-ai-actions', domain: 'unreal', title: 'AI、导航与行为树', description: '驱动 NPC 寻路、注视、运行行为树并更新决策数据。' },
  { id: 'ue-ui-actions', domain: 'unreal', title: '玩家界面与输入焦点', description: '管理本地 HUD、菜单、进度条和按钮。' },
  { id: 'ue-save-actions', domain: 'unreal', title: '数据配置、存档与关卡流程', description: '读取设计数据，保存进度并在关卡之间交接状态。' },
  { id: 'ue-net-actions', domain: 'unreal', title: '多人权限与状态同步', description: '区分服务器规则、客户端请求、持久复制状态和短暂表现。' }
];

// 每条示例均为独立头文件。公共部分集中在此，页面上的代码可整段复制。
function gameplayExample({ className, parent, headers, modules, declarations = '', body, doc, ...entry }) {
  const file = className.slice(1);
  const includes = ['CoreMinimal.h', ...headers, file + '.generated.h'];
  const code = [
    '// ' + file + '.h', ...includes.map(h => '#include "' + h + '"'),
    '', ...(declarations ? [declarations, ''] : []), 'UCLASS(Blueprintable)',
    'class ' + className + ' : public ' + parent + ' {', '    GENERATED_BODY()', 'public:',
    ...body.split('\n').map(line => '    ' + line), '};'
  ].join('\n');
  return { ...entry, quickLabel: entry.signature, resultLabel: '试玩验证', header: headers.join('、') + '（模块 ' + modules + '）', since: 'UE 5.8',
    code: '#pragma once\n' + code, references: [{ label: 'Epic Games 文档', url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/' + doc + '?application_version=5.8' }] };
}

export const gameplayApis = [
  gameplayExample({
    id: 'ue-use-interface', category: 'ue-world-actions', name: '按交互键调用不同对象的蓝图行为', level: 'A',
    className: 'AHandbookUseCharacter', parent: 'ACharacter', headers: ['GameFramework/Character.h', 'UObject/Interface.h', 'Engine/World.h'], modules: 'Engine',
    signature: 'LineTraceSingleByChannel / Execute_Use', brief: '在门和开关的蓝图中添加 HandbookUsable 接口并实现 Use 事件。让角色蓝图在交互键按下时调用 TryUse，目标需阻挡 Visibility。',
    returns: '在角色前方 250 厘米内依次放置门、开关和普通物体。前两者各执行自己的 Use 行为，普通物体返回 false。',
    pitfall: 'Execute_Use 支持仅在蓝图中实现的接口。此例从角色眼部发射射线，用于单机；联网应让服务端重新验证。',
    keywords: '交互 E键 对话 开门 蓝图接口 射线', doc: 'interfaces-in-unreal-engine',
    declarations: `UINTERFACE(BlueprintType, Blueprintable)
class UHandbookUsable : public UInterface { GENERATED_BODY() };
class IHandbookUsable {
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintImplementableEvent, BlueprintCallable) void Use(APawn* User);
};`,
    body: `UFUNCTION(BlueprintCallable) bool TryUse() {
    FVector Eye; FRotator Aim;
    GetActorEyesViewPoint(Eye, Aim);
    FHitResult Hit;
    FCollisionQueryParams Query;
    Query.AddIgnoredActor(this);
    if (!GetWorld()->LineTraceSingleByChannel(Hit, Eye, Eye + Aim.Vector() * 250.f,
                                               ECC_Visibility, Query)) return false;
    AActor* Target = Hit.GetActor();
    if (!IsValid(Target) || !Target->GetClass()->ImplementsInterface(UHandbookUsable::StaticClass()))
        return false;
    IHandbookUsable::Execute_Use(Target, this);
    return true;
}`
  }),
  gameplayExample({
    id: 'ue-pickup-commit', category: 'ue-rule-actions', name: '背包接收成功后才消耗拾取物', level: 'A',
    className: 'AHandbookPickup', parent: 'AActor', headers: ['GameFramework/Actor.h', 'GameFramework/Pawn.h'], modules: 'Engine',
    signature: 'BlueprintImplementableEvent / Destroy', brief: '从权威端已验证的交互或重叠事件调用 TryCollect。拾取物子蓝图实现 GrantTo，在背包实际入库后返回 true。',
    returns: '背包满时 GrantTo 返回 false，物体保留；成功时只发放一次并销毁。可在 GrantTo 内再次调用 TryCollect 检查重入保护。',
    pitfall: '在调用可重入的蓝图代码之前锁定领取。失败分支不得已发放部分奖励；多人关卡应复制拾取物并在服务器处理领取。',
    keywords: '拾取 背包 交互 重入 原子领取', doc: 'unreal-engine-actor-lifecycle',
    body: `bool bClaimed = false;
AHandbookPickup() { bReplicates = true; }
UFUNCTION(BlueprintImplementableEvent) bool GrantTo(APawn* Receiver);
UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly) bool TryCollect(APawn* Receiver) {
    if (!HasAuthority() || bClaimed || !IsValid(Receiver)) return false;
    bClaimed = true;
    if (!GrantTo(Receiver)) { bClaimed = false; return false; }
    Destroy();
    return true;
}`
  }),
  gameplayExample({
    id: 'ue-ai-patrol', category: 'ue-ai-actions', name: '为巡逻选择随机可达的目的地', level: 'B',
    className: 'AHandbookPatrolAI', parent: 'AAIController', headers: ['AIController.h', 'NavigationSystem.h', 'Navigation/PathFollowingComponent.h'], modules: 'AIModule NavigationSystem',
    signature: 'GetRandomReachablePointInRadius / MoveToLocation', brief: '用该控制器接管站在 NavMesh 上的 NPC，在巡逻开始或抵达上一个目标后调用 PatrolOnce。',
    returns: '在有导航网格的场景反复触发，观察 NPC 前往半径 600 厘米内的不同点；无 Pawn 或找不到点时返回 false。',
    pitfall: '导航查询成功与实际走到目标是两个阶段。重试应留间隔，避免在 Tick 中不断覆盖正在执行的移动请求。',
    keywords: 'AI 巡逻 漫游 随机点 导航网格', doc: 'navigation-system-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) bool PatrolOnce() {
    auto* Nav = FNavigationSystem::GetCurrent<UNavigationSystemV1>(GetWorld());
    APawn* Agent = GetPawn();
    FNavLocation Goal;
    if (!Nav || !Agent || !Nav->GetRandomReachablePointInRadius(Agent->GetActorLocation(), 600.f, Goal))
        return false;
    return MoveToLocation(Goal.Location, 30.f) != EPathFollowingRequestResult::Failed;
}`
  }),
  gameplayExample({
    id: 'ue-match-clock', category: 'ue-net-actions', name: '让迟加入的玩家看到同一回合倒计时', level: 'B',
    className: 'AHandbookRoundState', parent: 'AGameStateBase', headers: ['GameFramework/GameStateBase.h', 'Net/UnrealNetwork.h'], modules: 'Engine',
    signature: 'GetServerWorldTimeSeconds / DOREPLIFETIME', brief: '将 GameMode 的 GameStateClass 配为此类。服务器调用 StartRound，客户端 HUD 周期性读取 Remaining。',
    returns: '服务器开始 60 秒回合后，延迟加入的玩家也应看到剩余时间随原回合走，而非从 60 秒重新起算。',
    pitfall: '仅复制截止时刻，读数依赖客户端获得该属性及服务器时钟同步。倒计时归零后的胜负结算仍由服务器决定。',
    keywords: '比赛 回合 GameState 同步时钟 late join UI', doc: 'game-mode-and-game-state-in-unreal-engine',
    body: `UPROPERTY(Replicated) double EndTime = 0.0;
UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly) void StartRound(float Seconds) {
    if (HasAuthority()) EndTime = GetServerWorldTimeSeconds() + FMath::Max(0.f, Seconds);
}
UFUNCTION(BlueprintPure) double Remaining() const {
    return FMath::Max(0.0, EndTime - GetServerWorldTimeSeconds());
}
void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override {
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(AHandbookRoundState, EndTime);
}`
  }),
  gameplayExample({
    id: 'ue-input-map', category: 'ue-player-actions', name: '为本地玩家启用操作映射', level: 'A',
    className: 'AHandbookInputController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h', 'EnhancedInputSubsystems.h', 'InputMappingContext.h', 'Engine/LocalPlayer.h'], modules: 'EnhancedInput',
    signature: 'AddMappingContext', brief: '在项目启用 Enhanced Input。创建 IMC 并添加按键映射，在控制器蓝图的 Mapping 上指定它，设为当前 GameMode 的 PlayerController。',
    returns: '在本地玩家执行 showdebug enhancedinput，确认上下文出现，离开该控制器后对应映射移除。',
    pitfall: '映射属于 LocalPlayer，避免在远程控制器添加，或调用 ClearAllMappings 移除其他系统的上下文。',
    keywords: '玩家输入、角色与相机 AddMappingContext 为本地玩家启用操作映射', doc: 'enhanced-input-in-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<UInputMappingContext> Mapping;
UEnhancedInputLocalPlayerSubsystem* Inputs() const {
    return ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(GetLocalPlayer());
}
void BeginPlay() override {
    Super::BeginPlay();
    if (auto* S = Inputs(); S && Mapping) S->AddMappingContext(Mapping, 0);
}
void EndPlay(EEndPlayReason::Type Why) override {
    if (auto* S = Inputs(); S && Mapping) S->RemoveMappingContext(Mapping);
    Super::EndPlay(Why);
}`
  }),
  gameplayExample({
    id: 'ue-move-axis', category: 'ue-player-actions', name: '让角色沿相机朝向移动', level: 'A',
    className: 'AHandbookMoveCharacter', parent: 'ACharacter', headers: ['GameFramework/Character.h', 'EnhancedInputComponent.h', 'InputActionValue.h', 'InputAction.h'], modules: 'EnhancedInput',
    signature: 'BindAction / AddMovementInput', brief: '在角色蓝图指定 Axis2D 类型的 MoveAction；将 WASD 映射为 X 横移和 Y 前进，为本地玩家添加对应 IMC。',
    returns: '转动控制器 90° 后按前进，角色应沿新的水平朝向移动。',
    pitfall: '取控制器的 yaw，防止俯仰角带出竖直分量。CharacterMovement 会使用帧时间，输入值无需再乘 DeltaSeconds。',
    keywords: '玩家输入、角色与相机 BindAction / AddMovementInput 让角色沿相机朝向移动', doc: 'enhanced-input-in-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<UInputAction> MoveAction;
void SetupPlayerInputComponent(UInputComponent* Input) override {
    Super::SetupPlayerInputComponent(Input);
    if (auto* E = Cast<UEnhancedInputComponent>(Input); E && MoveAction)
        E->BindAction(MoveAction, ETriggerEvent::Triggered, this, &AHandbookMoveCharacter::Move);
}
void Move(const FInputActionValue& Value) {
    if (!Controller) return;
    const FVector2D Axis = Value.Get<FVector2D>();
    const FRotator Yaw(0, Controller->GetControlRotation().Yaw, 0);
    AddMovementInput(Yaw.RotateVector(FVector::ForwardVector), Axis.Y);
    AddMovementInput(Yaw.RotateVector(FVector::RightVector), Axis.X);
}`
  }),
  gameplayExample({
    id: 'ue-jump-action', category: 'ue-player-actions', name: '按住跳跃并在松键时停止加力', level: 'A',
    className: 'AHandbookJumpCharacter', parent: 'ACharacter', headers: ['GameFramework/Character.h', 'EnhancedInputComponent.h', 'InputAction.h'], modules: 'EnhancedInput',
    signature: 'Jump / StopJumping', brief: '设置一个布尔 JumpAction 并加入本地映射，使用本类的角色蓝图作为玩家 Pawn。',
    returns: '比较轻点和按住跳跃键的高度；按住超过 JumpMaxHoldTime 后不再继续加力。',
    pitfall: '按下和释放是不同阶段；上下文取消也应结束跳跃。实际高度取决于 CharacterMovement 的参数。',
    keywords: '玩家输入、角色与相机 Jump / StopJumping 按住跳跃并在松键时停止加力', doc: 'enhanced-input-in-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<UInputAction> JumpAction;
AHandbookJumpCharacter() { JumpMaxHoldTime = 0.2f; }
void SetupPlayerInputComponent(UInputComponent* Input) override {
    Super::SetupPlayerInputComponent(Input);
    auto* E = Cast<UEnhancedInputComponent>(Input);
    if (!E || !JumpAction) return;
    E->BindAction(JumpAction, ETriggerEvent::Started, this, &ACharacter::Jump);
    E->BindAction(JumpAction, ETriggerEvent::Completed, this, &ACharacter::StopJumping);
    E->BindAction(JumpAction, ETriggerEvent::Canceled, this, &ACharacter::StopJumping);
}`
  }),
  gameplayExample({
    id: 'ue-view-blend', category: 'ue-player-actions', name: '平滑切换到剧情镜头', level: 'A',
    className: 'AHandbookCameraController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h'], modules: 'Engine',
    signature: 'SetViewTargetWithBlend', brief: '从控制器蓝图调用 CutTo，传入场景内的 CameraActor；结束时传回当前 Pawn。',
    returns: '观察视角在半秒内过渡，确认过渡期间控制器仍持有原 Pawn。',
    pitfall: '切换观察目标与转移输入控制权是两个操作。普通镜头切换在所属本地玩家执行。',
    keywords: '玩家输入、角色与相机 SetViewTargetWithBlend 平滑切换到剧情镜头', doc: 'cameras-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) void CutTo(AActor* Camera) {
    if (IsLocalController() && IsValid(Camera))
        SetViewTargetWithBlend(Camera, 0.5f, VTBlend_Cubic);
}`
  }),
  gameplayExample({
    id: 'ue-switch-pawn', category: 'ue-player-actions', name: '把控制权交给另一只 Pawn', level: 'A',
    className: 'AHandbookPossessController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h'], modules: 'Engine',
    signature: 'Possess', brief: '在服务器的玩家控制器上调用 TakeControl，传入已经生成、可被接管的 Pawn。',
    returns: '切换后 GetPawn() 指向新角色，旧角色不再响应此控制器的移动输入。',
    pitfall: 'Possess 由权威端执行。多人项目需另行验证载具座位、距离、所有权等规则。',
    keywords: '玩家输入、角色与相机 Possess 把控制权交给另一只 Pawn', doc: 'possessing-pawns-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) bool TakeControl(APawn* Next) {
    if (!HasAuthority() || !IsValid(Next) || Next->GetController()) return false;
    Possess(Next);
    return GetPawn() == Next;
}`
  }),
  gameplayExample({
    id: 'ue-focus-trace', category: 'ue-world-actions', name: '用准星找出可交互对象', level: 'A',
    className: 'AHandbookFocusController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h', 'Engine/World.h'], modules: 'Engine',
    signature: 'LineTraceSingleByChannel', brief: '从本地控制器在按交互键时调用 FindFocus。目标添加 Actor Tag Interactable，并对 Visibility 设置 Block。',
    returns: '对准 300 厘米内目标时返回该 Actor；在其前方放一堵阻挡墙后返回空。',
    pitfall: '本例按相机中心线检测，适用于居中的准星。联网交互时服务器还要复核距离和遮挡。',
    keywords: '关卡交互与机关 LineTraceSingleByChannel 用准星找出可交互对象', doc: 'traces-in-unreal-engine---overview',
    body: `UFUNCTION(BlueprintCallable) AActor* FindFocus() const {
    FVector Eye; FRotator Aim;
    GetPlayerViewPoint(Eye, Aim);
    FHitResult Hit;
    FCollisionQueryParams Query;
    Query.AddIgnoredActor(GetPawn());
    GetWorld()->LineTraceSingleByChannel(Hit, Eye, Eye + Aim.Vector() * 300.f,
                                         ECC_Visibility, Query);
    AActor* Target = Hit.GetActor();
    return IsValid(Target) && Target->ActorHasTag(TEXT("Interactable")) ? Target : nullptr;
}`
  }),
  gameplayExample({
    id: 'ue-enter-zone', category: 'ue-world-actions', name: '玩家进入触发区时激活机关', level: 'A',
    className: 'AHandbookTriggerZone', parent: 'AActor', headers: ['GameFramework/Actor.h', 'Components/BoxComponent.h', 'GameFramework/Pawn.h'], modules: 'Engine',
    signature: 'OnComponentBeginOverlap', brief: '放置触发区；玩家胶囊开启 Generate Overlap Events。子蓝图实现 Activated 事件。',
    returns: '让玩家进入盒子触发蓝图表现，AI Pawn 进入时应无反应。',
    pitfall: '两个组件都要生成重叠事件。拥有多个重叠组件的角色可多次触发，单次机关须另加完成标记。',
    keywords: '关卡交互与机关 OnComponentBeginOverlap 玩家进入触发区时激活机关', doc: 'collision-in-unreal-engine---overview',
    body: `UPROPERTY(VisibleAnywhere) TObjectPtr<UBoxComponent> Zone;
AHandbookTriggerZone() {
    Zone = CreateDefaultSubobject<UBoxComponent>(TEXT("Zone"));
    SetRootComponent(Zone);
    Zone->SetBoxExtent(FVector(100));
    Zone->SetCollisionProfileName(TEXT("Trigger"));
}
void BeginPlay() override {
    Super::BeginPlay();
    Zone->OnComponentBeginOverlap.AddUniqueDynamic(this, &AHandbookTriggerZone::Enter);
}
UFUNCTION() void Enter(UPrimitiveComponent* Self, AActor* Other, UPrimitiveComponent* Part,
    int32 Body, bool Swept, const FHitResult& Hit) {
    if (const APawn* P = Cast<APawn>(Other); P && P->IsPlayerControlled()) Activated();
}
UFUNCTION(BlueprintImplementableEvent) void Activated();`
  }),
  gameplayExample({
    id: 'ue-door-step', category: 'ue-world-actions', name: '按时间开关一扇门', level: 'A',
    className: 'AHandbookSlidingDoor', parent: 'AActor', headers: ['GameFramework/Actor.h', 'Components/SceneComponent.h'], modules: 'Engine',
    signature: 'FMath::VInterpConstantTo', brief: '在子蓝图给根节点挂门模型。交互事件调用 SetOpen，示例沿世界 Z 轴抬升 200 厘米。',
    returns: '重复发送开门命令不会越走越远，中途发关门命令应平滑折返，到位后 Tick 停止。',
    pitfall: '示例移动整个机关，不处理挤压或阻挡。需要碰撞反馈时应明确 sweep、阻挡后的运动和停止策略。',
    keywords: '关卡交互与机关 FMath::VInterpConstantTo 按时间开关一扇门', doc: 'actor-ticking-in-unreal-engine',
    body: `FVector Closed, Target;
AHandbookSlidingDoor() {
    SetRootComponent(CreateDefaultSubobject<USceneComponent>(TEXT("Root")));
    PrimaryActorTick.bCanEverTick = true;
    PrimaryActorTick.bStartWithTickEnabled = false;
}
void BeginPlay() override { Super::BeginPlay(); Closed = Target = GetActorLocation(); }
UFUNCTION(BlueprintCallable) void SetOpen(bool Open) {
    Target = Closed + FVector(0, 0, Open ? 200.f : 0.f);
    SetActorTickEnabled(true);
}
void Tick(float Dt) override {
    Super::Tick(Dt);
    SetActorLocation(FMath::VInterpConstantTo(GetActorLocation(), Target, Dt, 150.f));
    if (GetActorLocation().Equals(Target, 0.01f)) SetActorTickEnabled(false);
}`
  }),
  gameplayExample({
    id: 'ue-attach-prop', category: 'ue-world-actions', name: '把手持道具挂到骨骼插槽', level: 'A',
    className: 'AHandbookEquipCharacter', parent: 'ACharacter', headers: ['GameFramework/Character.h', 'Components/SkeletalMeshComponent.h'], modules: 'Engine',
    signature: 'AttachToComponent', brief: '在角色骨架创建 HandSocket，传入已有可移动根组件、已关闭物理模拟的道具 Actor。',
    returns: '播放手部动画，道具应保持在插槽位置；传入不存在的道具时返回 false。',
    pitfall: '附着与库存所有权、物理碰撞和网络授权分别管理，不能用父子关系代替这些状态。',
    keywords: '关卡交互与机关 AttachToComponent 把手持道具挂到骨骼插槽', doc: 'skeletal-mesh-sockets-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) bool Equip(AActor* Prop) {
    const FName Socket(TEXT("HandSocket"));
    if (!IsValid(Prop) || !GetMesh() || !GetMesh()->DoesSocketExist(Socket)) return false;
    return Prop->AttachToComponent(GetMesh(), FAttachmentTransformRules::SnapToTargetNotIncludingScale, Socket);
}`
  }),
  gameplayExample({
    id: 'ue-expire-actor', category: 'ue-world-actions', name: '让临时效果自动过期', level: 'A',
    className: 'AHandbookTimedEffect', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'SetLifeSpan', brief: '将本类作为临时提示或特效 Actor 的父类，生成后自动开始倒计时。',
    returns: '在 PIE 的 World Outliner 观察，实例出现约两秒后消失。',
    pitfall: '传 0 表示取消寿命计时。对象池复用时需重新设置计时，外部观察者使用弱引用。',
    keywords: '关卡交互与机关 SetLifeSpan 让临时效果自动过期', doc: 'unreal-engine-actor-lifecycle',
    body: `void BeginPlay() override {
    Super::BeginPlay();
    SetLifeSpan(2.f);
}`
  }),
  gameplayExample({
    id: 'ue-health-damage', category: 'ue-rule-actions', name: '扣减生命值并只触发一次死亡', level: 'A',
    className: 'AHandbookHealthActor', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'TakeDamage / BlueprintImplementableEvent', brief: '在子蓝图实现 Died；从单机或权威端用 ApplyDamage 对此实例造成伤害。',
    returns: '先造成 70 点再造成 60 点，实际扣减依次为 70 和 30；继续伤害不会再次触发 Died。',
    pitfall: '在调用父类分发伤害事件前处理重入。此例为简单生命模型，不包含护盾或客户端同步。',
    keywords: '战斗数值、物品与任务 TakeDamage / BlueprintImplementableEvent 扣减生命值并只触发一次死亡', doc: 'API/Runtime/Engine/AActor/TakeDamage',
    body: `UPROPERTY(VisibleAnywhere, BlueprintReadOnly) float Health = 100.f;
UFUNCTION(BlueprintImplementableEvent) void Died();
float TakeDamage(float Amount, const FDamageEvent& Event, AController* By, AActor* Source) override {
    if (!HasAuthority() || !CanBeDamaged() || Health <= 0.f || !FMath::IsFinite(Amount)) return 0.f;
    const float Lost = FMath::Clamp(Amount, 0.f, Health);
    if (Lost <= 0.f) return 0.f;
    Health -= Lost;
    const bool bDiedNow = Health <= 0.f;
    Super::TakeDamage(Lost, Event, By, Source);
    if (bDiedNow) Died();
    return Lost;
}`
  }),
  gameplayExample({
    id: 'ue-ability-cooldown', category: 'ue-rule-actions', name: '阻止技能在冷却期间重复施放', level: 'A',
    className: 'AHandbookCooldown', parent: 'AActor', headers: ['GameFramework/Actor.h', 'TimerManager.h'], modules: 'Engine',
    signature: 'IsTimerActive / SetTimer', brief: '从施放入口先调用 TryActivate，仅在返回 true 时消耗资源并执行效果。',
    returns: '同一帧连按两次，只有第一次成功；两秒后可再次成功。',
    pitfall: '本例在权威端判定，Timer 使用游戏时间。若 UI 要展示冷却，需另行同步结束时间。',
    keywords: '战斗数值、物品与任务 IsTimerActive / SetTimer 阻止技能在冷却期间重复施放', doc: 'gameplay-timers-in-unreal-engine',
    body: `FTimerHandle Cooldown;
void Ready() {}
UFUNCTION(BlueprintCallable) bool TryActivate() {
    auto& Timers = GetWorldTimerManager();
    if (!HasAuthority() || Timers.IsTimerActive(Cooldown)) return false;
    Timers.SetTimer(Cooldown, this, &AHandbookCooldown::Ready, 2.f, false);
    return true;
}`
  }),
  gameplayExample({
    id: 'ue-stack-items', category: 'ue-rule-actions', name: '按物品 ID 入库并扣除库存', level: 'A',
    className: 'AHandbookInventory', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'TMap::FindOrAdd / Remove', brief: '从拾取和消费逻辑分别调用 AddOne、SpendOne。示例由权威端维护，每类最多 99 件。',
    returns: '同一 ID 连续加入两次、扣除两次后条目消失；第三次扣除返回 false。',
    pitfall: '读取数量时用 Find，避免查询缺少的键时意外创建条目；此表未做网络复制。',
    keywords: '战斗数值、物品与任务 TMap::FindOrAdd / Remove 按物品 ID 入库并扣除库存', doc: 'map-containers-in-unreal-engine',
    body: `UPROPERTY() TMap<FName, int32> Counts;
UFUNCTION(BlueprintCallable) bool AddOne(FName Id) {
    if (!HasAuthority() || Id.IsNone()) return false;
    int32& N = Counts.FindOrAdd(Id);
    if (N >= 99) return false;
    ++N; return true;
}
UFUNCTION(BlueprintCallable) bool SpendOne(FName Id) {
    if (!HasAuthority()) return false;
    int32* N = Counts.Find(Id);
    if (!N || *N <= 0) return false;
    if (--(*N) == 0) Counts.Remove(Id);
    return true;
}`
  }),
  gameplayExample({
    id: 'ue-quest-flags', category: 'ue-rule-actions', name: '收集不同目标并只结算一次任务', level: 'A',
    className: 'AHandbookQuest', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'TSet / BlueprintImplementableEvent', brief: '在权威端发现目标时传入它的稳定 ID；此任务条件为收集任意三个不同的有效 ID。',
    returns: '依次提交 A、A、B、C，第三种 ID 出现时只广播一次完成事件。',
    pitfall: '先更新结算状态，再调用可能重入的蓝图事件。实际掉落奖励时仍需验证 ID 来源。',
    keywords: '战斗数值、物品与任务 TSet / BlueprintImplementableEvent 收集不同目标并只结算一次任务', doc: 'set-containers-in-unreal-engine',
    body: `UPROPERTY() TSet<FName> Seen;
UPROPERTY() bool bComplete = false;
UFUNCTION(BlueprintImplementableEvent) void Completed();
UFUNCTION(BlueprintCallable) void Record(FName Id) {
    if (!HasAuthority() || bComplete || Id.IsNone()) return;
    Seen.Add(Id);
    if (Seen.Num() >= 3) {
        bComplete = true;
        Completed();
    }
}`
  }),
  gameplayExample({
    id: 'ue-bp-rule', category: 'ue-event-actions', name: '让策划在蓝图覆写交互条件', level: 'A',
    className: 'AHandbookGate', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'BlueprintNativeEvent', brief: '以本类创建门禁蓝图，覆写 CanUse；其他脚本调用 TryUse。',
    returns: '未覆写时只检查使用者是否有效；覆写成恒 false 后 Used 不应触发。',
    pitfall: '调用事件包装函数 CanUse 才会走蓝图覆写。直接调用 _Implementation 会跳过蓝图分派。',
    keywords: '蓝图脚本与表现反馈 BlueprintNativeEvent 让策划在蓝图覆写交互条件', doc: 'exposing-gameplay-elements-to-blueprints-visual-scripting-in-unreal-engine',
    body: `UFUNCTION(BlueprintNativeEvent) bool CanUse(APawn* User) const;
virtual bool CanUse_Implementation(APawn* User) const { return IsValid(User); }
UFUNCTION(BlueprintImplementableEvent) void Used(APawn* User);
UFUNCTION(BlueprintCallable) bool TryUse(APawn* User) {
    if (!CanUse(User)) return false;
    Used(User);
    return true;
}`
  }),
  gameplayExample({
    id: 'ue-bp-broadcast', category: 'ue-event-actions', name: '把计数变化广播给多个蓝图监听者', level: 'A',
    className: 'AHandbookScoreCounter', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'BlueprintAssignable / Broadcast', brief: '在关卡中放置实例；UI 与音效蓝图分别绑定 Changed，监听同一局部事件源。',
    returns: '调用 Increment 后两个监听者都收到同一个最新分数，后绑定的监听者可先读取 Score。',
    pitfall: '委托广播只在当前实例所在进程触发。需要跨客户端广播持久状态时使用复制。',
    keywords: '蓝图脚本与表现反馈 BlueprintAssignable / Broadcast 把计数变化广播给多个蓝图监听者', doc: 'multicast-delegates-in-unreal-engine',
    declarations: `DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FHandbookScoreChanged, int32, NewScore);`,
    body: `UPROPERTY(BlueprintAssignable) FHandbookScoreChanged Changed;
UPROPERTY(VisibleAnywhere, BlueprintReadOnly) int32 Score = 0;
UFUNCTION(BlueprintCallable) void Increment() {
    Changed.Broadcast(++Score);
}`
  }),
  gameplayExample({
    id: 'ue-play-montage', category: 'ue-event-actions', name: '让角色播放交互动作蒙太奇', level: 'A',
    className: 'AHandbookGesture', parent: 'ACharacter', headers: ['GameFramework/Character.h', 'Animation/AnimMontage.h'], modules: 'Engine',
    signature: 'PlayAnimMontage', brief: '配置同骨架的 Montage，并在角色 AnimGraph 接入与其轨道匹配的 Slot。',
    returns: '从蓝图触发 Gesture，有效资源返回正播放时长；角色应显示该动作。',
    pitfall: '返回时长只说明已开始播放，不能作为权威命中时刻。需要与动作对齐的表现应使用 Notify。',
    keywords: '蓝图脚本与表现反馈 PlayAnimMontage 让角色播放交互动作蒙太奇', doc: 'animation-montage-in-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<UAnimMontage> Animation;
UFUNCTION(BlueprintCallable) float Gesture() {
    return Animation ? PlayAnimMontage(Animation) : 0.f;
}`
  }),
  gameplayExample({
    id: 'ue-material-switch', category: 'ue-event-actions', name: '只改变选中物体的高亮材质参数', level: 'A',
    className: 'AHandbookHighlight', parent: 'AStaticMeshActor', headers: ['Engine/StaticMeshActor.h', 'Materials/MaterialInstanceDynamic.h', 'Components/StaticMeshComponent.h'], modules: 'Engine',
    signature: 'CreateDynamicMaterialInstance', brief: '为网格第 0 槽设置含 Glow 标量参数的材质；关卡交互开始和结束时调用 Highlight。',
    returns: '两个实例共用同一基础材质，只点亮其中一个，它们的效果应独立。',
    pitfall: '缓存动态材质实例；重复悬停时无需重新创建。参数名需与材质图一致。',
    keywords: '蓝图脚本与表现反馈 CreateDynamicMaterialInstance 只改变选中物体的高亮材质参数', doc: 'instanced-materials-in-unreal-engine',
    body: `UPROPERTY(Transient) TObjectPtr<UMaterialInstanceDynamic> Material;
void BeginPlay() override {
    Super::BeginPlay();
    Material = GetStaticMeshComponent()->CreateDynamicMaterialInstance(0);
}
UFUNCTION(BlueprintCallable) void Highlight(bool On) {
    if (Material) Material->SetScalarParameterValue(TEXT("Glow"), On ? 1.f : 0.f);
}`
  }),
  gameplayExample({
    id: 'ue-sound-cue', category: 'ue-event-actions', name: '在机关所在位置播放一次提示音', level: 'A',
    className: 'AHandbookChime', parent: 'AActor', headers: ['GameFramework/Actor.h', 'Kismet/GameplayStatics.h', 'Sound/SoundBase.h'], modules: 'Engine',
    signature: 'PlaySoundAtLocation', brief: '在子蓝图指定 Chime 声音资产，从机关事件调用 Ring；按需要配置声音衰减。',
    returns: '靠近和远离机关各触发一次，检查预期的空间感及衰减距离。',
    pitfall: '这是一次性声音，调用后不返回可停止的组件；循环声需要保留音频组件。该调用不会自行复制。',
    keywords: '蓝图脚本与表现反馈 PlaySoundAtLocation 在机关所在位置播放一次提示音', doc: 'API/Runtime/Engine/UGameplayStatics/PlaySoundAtLocation',
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<USoundBase> Chime;
UFUNCTION(BlueprintCallable) void Ring() {
    if (Chime && GetNetMode() != NM_DedicatedServer)
        UGameplayStatics::PlaySoundAtLocation(this, Chime, GetActorLocation());
}`
  }),
  gameplayExample({
    id: 'ue-ai-walk', category: 'ue-ai-actions', name: '让 NPC 沿导航网格走向目标', level: 'B',
    className: 'AHandbookMoveAI', parent: 'AAIController', headers: ['AIController.h', 'Navigation/PathFollowingComponent.h'], modules: 'AIModule',
    signature: 'MoveToLocation', brief: '让此 AIController 接管具有导航移动组件的角色，在关卡放置覆盖目标的 NavMeshBoundsVolume。',
    returns: '按 P 查看绿色导航区；给可达点下达命令，角色应移动到容差范围。',
    pitfall: '请求被接受只表示开始处理。抵达、受阻和中断须在移动完成回调中区分。',
    keywords: 'AI、导航与行为树 MoveToLocation 让 NPC 沿导航网格走向目标', doc: 'navigation-system-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) bool GoToPoint(FVector Target) {
    const auto Result = MoveToLocation(Target, 50.f, true, true, true, true, nullptr, false);
    return Result != EPathFollowingRequestResult::Failed;
}`
  }),
  gameplayExample({
    id: 'ue-ai-focus', category: 'ue-ai-actions', name: '让 NPC 注视目标并恢复移动朝向', level: 'B',
    className: 'AHandbookFocusAI', parent: 'AAIController', headers: ['AIController.h'], modules: 'AIModule',
    signature: 'SetFocus / ClearFocus', brief: '在已接管 NPC 的服务器 AIController 上调用 LookAt。需要身体随控制器旋转时配置 CharacterMovement 或角色 yaw 设置。',
    returns: '传入移动目标时控制器朝向随之变化；传空后清除玩法层焦点。',
    pitfall: '凝视和寻路是独立行为。更高优先级焦点及移动组件旋转设置会影响可见结果。',
    keywords: 'AI、导航与行为树 SetFocus / ClearFocus 让 NPC 注视目标并恢复移动朝向', doc: 'API/Runtime/AIModule/AAIController',
    body: `UFUNCTION(BlueprintCallable) void LookAt(AActor* Target) {
    if (IsValid(Target)) SetFocus(Target);
    else ClearFocus(EAIFocusPriority::Gameplay);
}`
  }),
  gameplayExample({
    id: 'ue-ai-tree', category: 'ue-ai-actions', name: '接管 NPC 后启动行为树', level: 'B',
    className: 'AHandbookTreeAI', parent: 'AAIController', headers: ['AIController.h', 'BehaviorTree/BehaviorTree.h'], modules: 'AIModule',
    signature: 'OnPossess / RunBehaviorTree', brief: '在 AI 控制器子蓝图指定 Tree，将它设为角色的 AI Controller Class，并配置 Auto Possess AI。',
    returns: '在 PIE 的行为树调试器中选中该 NPC，确认根节点开始执行。',
    pitfall: '行为树和黑板资源要匹配；脚本在取得 Pawn 后启动，避免在构造阶段访问世界。',
    keywords: 'AI、导航与行为树 OnPossess / RunBehaviorTree 接管 NPC 后启动行为树', doc: 'behavior-trees-in-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<UBehaviorTree> Tree;
void OnPossess(APawn* InPawn) override {
    Super::OnPossess(InPawn);
    if (Tree && !RunBehaviorTree(Tree))
        UE_LOG(LogTemp, Warning, TEXT("Cannot start behavior tree"));
}`
  }),
  gameplayExample({
    id: 'ue-ai-blackboard', category: 'ue-ai-actions', name: '把感知目标写入黑板并在丢失时清除', level: 'B',
    className: 'AHandbookBlackboardAI', parent: 'AAIController', headers: ['AIController.h', 'BehaviorTree/BlackboardComponent.h'], modules: 'AIModule',
    signature: 'SetValueAsObject / ClearValue', brief: '先初始化黑板或启动行为树；配置 Object 类型 Actor 基类的 Target 键。从感知逻辑调用 SetTarget。',
    returns: '在行为树调试器中观察 Target，传空后追踪分支应按其装饰器配置退出。',
    pitfall: '键名、类型以及装饰器的 Observer Aborts 需要配套；清空黑板并不自动中断所有正在进行的任务。',
    keywords: 'AI、导航与行为树 SetValueAsObject / ClearValue 把感知目标写入黑板并在丢失时清除', doc: 'behavior-trees-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) void SetTarget(AActor* Target) {
    if (UBlackboardComponent* BB = GetBlackboardComponent()) {
        const FName Key(TEXT("Target"));
        if (IsValid(Target)) BB->SetValueAsObject(Key, Target);
        else BB->ClearValue(Key);
    }
}`
  }),
  gameplayExample({
    id: 'ue-hud-create', category: 'ue-ui-actions', name: '为每个本地玩家创建一次 HUD', level: 'A',
    className: 'AHandbookHudController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h', 'Blueprint/UserWidget.h'], modules: 'UMG',
    signature: 'CreateWidget / AddToPlayerScreen', brief: '用此控制器的蓝图指定 HUDClass 为 Widget Blueprint，在 GameMode 使用该控制器。',
    returns: '启动两个本地玩家或两个客户端，每位本地玩家只看到自己控制器创建的 HUD。',
    pitfall: '专用服务器没有本地视口。若 HUD 已移除但需要再次显示，检查 IsInViewport 并重新添加。',
    keywords: '玩家界面与输入焦点 CreateWidget / AddToPlayerScreen 为每个本地玩家创建一次 HUD', doc: 'creating-widgets-in-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) TSubclassOf<UUserWidget> HUDClass;
UPROPERTY(Transient) TObjectPtr<UUserWidget> HUDWidget;
void BeginPlay() override {
    Super::BeginPlay();
    if (IsLocalController() && HUDClass && !HUDWidget) {
        HUDWidget = CreateWidget<UUserWidget>(this, HUDClass);
        if (HUDWidget) HUDWidget->AddToPlayerScreen();
    }
}
void EndPlay(EEndPlayReason::Type Why) override {
    if (HUDWidget) HUDWidget->RemoveFromParent();
    Super::EndPlay(Why);
}`
  }),
  gameplayExample({
    id: 'ue-menu-focus', category: 'ue-ui-actions', name: '打开菜单接管输入并在关闭时还给游戏', level: 'A',
    className: 'AHandbookMenuController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h', 'Blueprint/UserWidget.h'], modules: 'UMG Slate SlateCore',
    signature: 'SetInputMode / SetWidgetToFocus', brief: '把已创建、允许获取焦点的 Widget 传入 OpenMenu；在 Widget 的关闭按钮上调用 CloseMenu。',
    returns: '打开后鼠标可点击菜单，关闭后鼠标隐藏，角色重新接收游戏输入。',
    pitfall: 'UIOnly 模式下关闭快捷键需要由 UI 处理。示例只管理一层菜单，多层弹窗应恢复上一层焦点。',
    keywords: '玩家界面与输入焦点 SetInputMode / SetWidgetToFocus 打开菜单接管输入并在关闭时还给游戏', doc: 'creating-widgets-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) void OpenMenu(UUserWidget* Menu) {
    if (!IsLocalController() || !IsValid(Menu)) return;
    if (!Menu->IsInViewport()) Menu->AddToPlayerScreen(10);
    FInputModeUIOnly Mode;
    Mode.SetWidgetToFocus(Menu->TakeWidget());
    SetInputMode(Mode);
    bShowMouseCursor = true;
}
UFUNCTION(BlueprintCallable) void CloseMenu(UUserWidget* Menu) {
    if (!IsLocalController()) return;
    if (IsValid(Menu)) Menu->RemoveFromParent();
    SetInputMode(FInputModeGameOnly());
    bShowMouseCursor = false;
}`
  }),
  gameplayExample({
    id: 'ue-hud-health', category: 'ue-ui-actions', name: '在数值改变时更新血条', level: 'A',
    className: 'UHandbookHealthWidget', parent: 'UUserWidget', headers: ['Blueprint/UserWidget.h', 'Components/ProgressBar.h'], modules: 'UMG',
    signature: 'BindWidget / SetPercent', brief: '在此类派生的 Widget Blueprint 中添加名为 Bar 的 ProgressBar，从生命值变更事件调用 Refresh。',
    returns: '分别传入 (30,100)、(120,100) 和 (0,0)，应显示 30%、满条和空条。',
    pitfall: 'ProgressBar 输入范围是 0 到 1。初次创建 Widget 也要主动刷新，防止错过此前的事件。',
    keywords: '玩家界面与输入焦点 BindWidget / SetPercent 在数值改变时更新血条', doc: 'API/Runtime/UMG/UProgressBar',
    body: `UPROPERTY(meta=(BindWidget)) TObjectPtr<UProgressBar> Bar;
UFUNCTION(BlueprintCallable) void Refresh(float Current, float Maximum) {
    if (Bar) Bar->SetPercent(Maximum > 0.f ? FMath::Clamp(Current / Maximum, 0.f, 1.f) : 0.f);
}`
  }),
  gameplayExample({
    id: 'ue-ui-button', category: 'ue-ui-actions', name: '绑定按钮点击并在页面销毁时解绑', level: 'A',
    className: 'UHandbookConfirmWidget', parent: 'UUserWidget', headers: ['Blueprint/UserWidget.h', 'Components/Button.h'], modules: 'UMG',
    signature: 'OnClicked / AddUniqueDynamic', brief: '在子 Widget Blueprint 中添加名为 Confirm 的 Button，覆写 Accepted 处理确认逻辑。',
    returns: '将页面移除再添加，每次单击只能触发一次 Accepted。',
    pitfall: 'NativeConstruct 可随控件重新挂载而多次执行。动态委托回调需要 UFUNCTION，参数须匹配。',
    keywords: '玩家界面与输入焦点 OnClicked / AddUniqueDynamic 绑定按钮点击并在页面销毁时解绑', doc: 'API/Runtime/UMG/UButton',
    body: `UPROPERTY(meta=(BindWidget)) TObjectPtr<UButton> Confirm;
void NativeConstruct() override {
    Super::NativeConstruct();
    if (Confirm) Confirm->OnClicked.AddUniqueDynamic(this, &UHandbookConfirmWidget::Handle);
}
void NativeDestruct() override {
    if (Confirm) Confirm->OnClicked.RemoveDynamic(this, &UHandbookConfirmWidget::Handle);
    Super::NativeDestruct();
}
UFUNCTION() void Handle() { Accepted(); }
UFUNCTION(BlueprintImplementableEvent) void Accepted();`
  }),
  gameplayExample({
    id: 'ue-save-checkpoint', category: 'ue-save-actions', name: '把检查点写入存档并在重启后读取', level: 'A',
    className: 'UHandbookCheckpointSave', parent: 'USaveGame', headers: ['GameFramework/SaveGame.h', 'Kismet/GameplayStatics.h'], modules: 'Engine',
    signature: 'CreateSaveGameObject / SaveGameToSlot / LoadGameFromSlot', brief: '从检查点事件调用 WriteCheckpoint，主菜单继续按钮调用 ReadCheckpoint。示例使用本地用户 0 的单槽位。',
    returns: '写入非零坐标，退出并重启后应读回相同坐标；删除槽位再读应返回 false。',
    pitfall: '只在成功读档时移动角色。频繁或大型存档应改用异步 API 并处理完成回调；上线前为格式变更做版本迁移。',
    keywords: '数据配置、存档与关卡流程 CreateSaveGameObject / SaveGameToSlot / LoadGameFromSlot 把检查点写入存档并在重启后读取', doc: 'saving-and-loading-your-game-in-unreal-engine',
    body: `UPROPERTY(SaveGame) FVector Location = FVector::ZeroVector;
UFUNCTION(BlueprintCallable) static bool WriteCheckpoint(FVector Point) {
    auto* Data = Cast<UHandbookCheckpointSave>(
        UGameplayStatics::CreateSaveGameObject(StaticClass()));
    if (!Data) return false;
    Data->Location = Point;
    return UGameplayStatics::SaveGameToSlot(Data, TEXT("Checkpoint"), 0);
}
UFUNCTION(BlueprintCallable) static bool ReadCheckpoint(FVector& Point) {
    auto* Data = Cast<UHandbookCheckpointSave>(
        UGameplayStatics::LoadGameFromSlot(TEXT("Checkpoint"), 0));
    if (!Data) return false;
    Point = Data->Location;
    return true;
}`
  }),
  gameplayExample({
    id: 'ue-session-state', category: 'ue-save-actions', name: '跨关卡保留本次游戏的任务选择', level: 'A',
    className: 'UHandbookSession', parent: 'UGameInstanceSubsystem', headers: ['Subsystems/GameInstanceSubsystem.h'], modules: 'Engine',
    signature: 'UGameInstanceSubsystem', brief: '在蓝图用 Get Game Instance Subsystem 取得该类型，调用 SelectMission 后切换地图；新地图从同一子系统读取 Mission。',
    returns: '同一次游戏切关后仍能读到 ID，完全退出再启动时恢复空值。',
    pitfall: '子系统是每个 GameInstance 的进程内状态。避免强引用旧世界的 Actor；联网复制和磁盘存档分别处理。',
    keywords: '数据配置、存档与关卡流程 UGameInstanceSubsystem 跨关卡保留本次游戏的任务选择', doc: 'programming-subsystems-in-unreal-engine',
    body: `UPROPERTY(VisibleAnywhere, BlueprintReadOnly) FName Mission = NAME_None;
UFUNCTION(BlueprintCallable) void SelectMission(FName Next) {
    Mission = Next;
}`
  }),
  gameplayExample({
    id: 'ue-load-level', category: 'ue-save-actions', name: '按地图资产引用切换单机关卡', level: 'A',
    className: 'AHandbookPortal', parent: 'AActor', headers: ['GameFramework/Actor.h', 'Kismet/GameplayStatics.h', 'Engine/World.h'], modules: 'Engine',
    signature: 'OpenLevelBySoftObjectPtr', brief: '在子蓝图指定目标 World 软引用，将地图包含在打包配置里，并从单机传送门调用 Travel。',
    returns: '选择有效地图后当前世界被替换；清空引用后再次调用应停留在原地图。',
    pitfall: '普通 OpenLevel 会替换当前世界。多人服务器带全体玩家旅行时需采用相应的 ServerTravel 流程。',
    keywords: '数据配置、存档与关卡流程 OpenLevelBySoftObjectPtr 按地图资产引用切换单机关卡', doc: 'travelling-in-multiplayer-in-unreal-engine',
    body: `UPROPERTY(EditAnywhere) TSoftObjectPtr<UWorld> Destination;
UFUNCTION(BlueprintCallable) void Travel() {
    if (GetNetMode() == NM_Standalone && !Destination.IsNull())
        UGameplayStatics::OpenLevelBySoftObjectPtr(this, Destination);
}`
  }),
  gameplayExample({
    id: 'ue-data-tuning', category: 'ue-save-actions', name: '从数据表读取物品的堆叠上限', level: 'A',
    className: 'AHandbookItemRules', parent: 'AActor', headers: ['GameFramework/Actor.h', 'Engine/DataTable.h'], modules: 'Engine',
    signature: 'FTableRowBase / FindRow', brief: '创建使用 FHandbookItemRow 的 DataTable，添加 Potion 行并设置 Limit；在子蓝图指定 Items。',
    returns: '查询 Potion 应返回配置值；未知行、空表和非正数都返回 0。',
    pitfall: '把 RowName 当稳定键，显示名称另存。不要跨表重载或修改长期缓存 FindRow 返回的指针。',
    keywords: '数据配置、存档与关卡流程 FTableRowBase / FindRow 从数据表读取物品的堆叠上限', doc: 'data-driven-gameplay-elements-in-unreal-engine',
    declarations: `USTRUCT(BlueprintType)
struct FHandbookItemRow : public FTableRowBase {
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Limit = 1;
};`,
    body: `UPROPERTY(EditDefaultsOnly) TObjectPtr<UDataTable> Items;
UFUNCTION(BlueprintPure) int32 StackLimit(FName Id) const {
    if (!Items || Id.IsNone()) return 0;
    const auto* Row = Items->FindRow<FHandbookItemRow>(Id, TEXT("Inventory"), false);
    return Row ? FMath::Max(0, Row->Limit) : 0;
}`
  }),
  gameplayExample({
    id: 'ue-respawn', category: 'ue-save-actions', name: '通过 GameMode 为玩家重新生成角色', level: 'A',
    className: 'AHandbookRespawnMode', parent: 'AGameModeBase', headers: ['GameFramework/GameModeBase.h'], modules: 'Engine',
    signature: 'RestartPlayer', brief: '在关卡设置启用此 GameMode，配置 Default Pawn Class 和 PlayerStart；玩家已失去旧 Pawn 后在服务器调用 Respawn。',
    returns: '服务器和客户端应看到新 Pawn，控制器重新接管，新角色在可用 PlayerStart 出现。',
    pitfall: '旧 Pawn 仍受控制时先按死亡流程处理。GameMode 仅在权威世界有效，客户端不能直接向它发送服务器 RPC。',
    keywords: '数据配置、存档与关卡流程 RestartPlayer 通过 GameMode 为玩家重新生成角色', doc: 'game-mode-and-game-state-in-unreal-engine',
    body: `UFUNCTION(BlueprintCallable) void Respawn(AController* Player) {
    if (HasAuthority() && IsValid(Player) && !Player->GetPawn())
        RestartPlayer(Player);
}`
  }),
  gameplayExample({
    id: 'ue-replicated-state', category: 'ue-net-actions', name: '把机关开关同步给当前及迟加入玩家', level: 'B',
    className: 'AHandbookRepSwitch', parent: 'AActor', headers: ['GameFramework/Actor.h', 'Net/UnrealNetwork.h'], modules: 'Engine',
    signature: 'ReplicatedUsing / DOREPLIFETIME', brief: '放置此复制 Actor，在子蓝图实现 ApplyVisual；在服务器调用 SetEnabled。默认关闭的外观与蓝图默认状态保持一致。',
    returns: '双客户端 PIE 下从服务器改变状态，检查两端外观；再加入的客户端也应显示当前值。',
    pitfall: 'C++ 服务器赋值不会自动执行自己的 OnRep，因此服务器直接更新表现。复制反映最终状态，中间过渡可能合并。',
    keywords: '多人权限与状态同步 ReplicatedUsing / DOREPLIFETIME 把机关开关同步给当前及迟加入玩家', doc: 'replicate-actor-properties-in-unreal-engine',
    body: `AHandbookRepSwitch() { bReplicates = true; }
UPROPERTY(ReplicatedUsing=OnRep_Enabled) bool bEnabled = false;
UFUNCTION() void OnRep_Enabled() { ApplyVisual(bEnabled); }
UFUNCTION(BlueprintImplementableEvent) void ApplyVisual(bool Enabled);
UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly) void SetEnabled(bool Enabled) {
    if (!HasAuthority() || bEnabled == Enabled) return;
    bEnabled = Enabled;
    ApplyVisual(bEnabled);
}
void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override {
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(AHandbookRepSwitch, bEnabled);
}`
  }),
  gameplayExample({
    id: 'ue-owner-request', category: 'ue-net-actions', name: '从所属角色向服务器申请消耗一次充能', level: 'B',
    className: 'AHandbookChargeCharacter', parent: 'ACharacter', headers: ['GameFramework/Character.h'], modules: 'Engine',
    signature: 'UFUNCTION(Server, Reliable)', brief: '让客户端控制这个复制角色，在离散按键事件上调用 ServerSpend。服务器保有 Charges，子蓝图在 Spent 中执行服务端效果。',
    returns: '双客户端 PIE 下，在所属客户端连按四次；服务端初始三次充能只允许三次效果。',
    pitfall: '只接受操作意图。数量和规则由服务器判断，不信任客户端上报的余额。此例未将余额复制给 UI。',
    keywords: '多人权限与状态同步 UFUNCTION(Server, Reliable) 从所属角色向服务器申请消耗一次充能', doc: 'remote-procedure-calls-in-unreal-engine',
    body: `int32 Charges = 3;
UFUNCTION(Server, Reliable, BlueprintCallable) void ServerSpend();
void ServerSpend_Implementation() {
    if (Charges <= 0) return;
    --Charges;
    Spent();
}
UFUNCTION(BlueprintImplementableEvent) void Spent();`
  }),
  gameplayExample({
    id: 'ue-owner-toast', category: 'ue-net-actions', name: '只给所属客户端发送一次 UI 提示', level: 'B',
    className: 'AHandbookToastController', parent: 'APlayerController', headers: ['GameFramework/PlayerController.h'], modules: 'Engine',
    signature: 'UFUNCTION(Client, Reliable)', brief: '在服务器取得目标玩家控制器后调用 ClientToast；在其子蓝图实现 ShowLocalToast 创建本地 UI。',
    returns: '双客户端 PIE 下只选中第二位玩家发提示，第一位玩家的界面应无变化。',
    pitfall: 'RPC 依赖拥有连接。一次性提示不记录历史，需要迟加入也能恢复的内容使用复制属性。',
    keywords: '多人权限与状态同步 UFUNCTION(Client, Reliable) 只给所属客户端发送一次 UI 提示', doc: 'actor-owner-and-owning-connection-in-unreal-engine',
    body: `UFUNCTION(Client, Reliable, BlueprintCallable) void ClientToast(const FText& Message);
void ClientToast_Implementation(const FText& Message) {
    if (IsLocalController()) ShowLocalToast(Message);
}
UFUNCTION(BlueprintImplementableEvent) void ShowLocalToast(const FText& Message);`
  }),
  gameplayExample({
    id: 'ue-multicast-fx', category: 'ue-net-actions', name: '向相关客户端播放短暂特效', level: 'B',
    className: 'AHandbookPulseFX', parent: 'AActor', headers: ['GameFramework/Actor.h'], modules: 'Engine',
    signature: 'NetMulticast, Unreliable', brief: '从服务器逻辑调用 Pulse，在蓝图覆写 LocalPulse 生成一段不影响玩法结果的瞬时表现。',
    returns: '双客户端 PIE 下，两位相关玩家都能看到服务器触发的表现；迟加入者不会重放过去的特效。',
    pitfall: 'Unreliable 允许丢包。扣血、得分和永久开关状态必须有独立权威状态。',
    keywords: '多人权限与状态同步 NetMulticast, Unreliable 向相关客户端播放短暂特效', doc: 'remote-procedure-calls-in-unreal-engine',
    body: `AHandbookPulseFX() { bReplicates = true; }
UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly) void Pulse() {
    if (HasAuthority()) MulticastPulse();
}
UFUNCTION(NetMulticast, Unreliable) void MulticastPulse();
void MulticastPulse_Implementation() {
    if (GetNetMode() != NM_DedicatedServer) LocalPulse();
}
UFUNCTION(BlueprintImplementableEvent) void LocalPulse();`
  }),
  gameplayExample({
    id: 'ue-tag-ability', category: 'ue-rule-actions', name: '用 Gameplay Tags 检查能力解锁条件', level: 'A',
    className: 'AHandbookTagRules', parent: 'AActor', headers: ['GameFramework/Actor.h', 'GameplayTagContainer.h'], modules: 'GameplayTags',
    signature: 'FGameplayTagContainer::HasAll', brief: '在项目 Gameplay Tags 中登记 Ability、Ability.Dash 等标签，为实例配置 Owned；用 CanActivate 查询要求的标签集合。',
    returns: '拥有 Ability.Dash 时要求父标签 Ability 可通过；缺少任一必需标签时失败。',
    pitfall: 'HasAll 允许父子匹配，空需求集合通过。需要完全相同标签的规则使用 HasAllExact。',
    keywords: '战斗数值、物品与任务 FGameplayTagContainer::HasAll 用 Gameplay Tags 检查能力解锁条件', doc: 'using-gameplay-tags-in-unreal-engine',
    body: `UPROPERTY(EditAnywhere) FGameplayTagContainer Owned;
UFUNCTION(BlueprintPure) bool CanActivate(const FGameplayTagContainer& Required) const {
    return Owned.HasAll(Required);
}`
  }),
  gameplayExample({
    id: 'ue-sprint', category: 'ue-player-actions', name: '按住冲刺键加速，释放后还原速度', level: 'A',
    className: 'AHandbookSprintCharacter', parent: 'ACharacter', headers: ['GameFramework/Character.h', 'GameFramework/CharacterMovementComponent.h'], modules: 'Engine',
    signature: 'MaxWalkSpeed', brief: '在单机角色蓝图把冲刺键按下接 SetSprint(true)，释放或取消接 false。',
    returns: '直线行走时对比两种速度；松键后应回到行走速度上限。',
    pitfall: '联机角色须在服务端与预测路径建立一致的冲刺状态。示例只变更行走速度上限，不负责输入和体力消耗。',
    keywords: '玩家输入、角色与相机 MaxWalkSpeed 按住冲刺键加速，释放后还原速度', doc: 'understanding-networked-movement-in-the-character-movement-component-for-unreal-engine',
    body: `UPROPERTY(EditDefaultsOnly) float WalkSpeed = 300.f;
UPROPERTY(EditDefaultsOnly) float RunSpeed = 650.f;
void BeginPlay() override {
    Super::BeginPlay();
    SetSprint(false);
}
UFUNCTION(BlueprintCallable) void SetSprint(bool Run) {
    GetCharacterMovement()->MaxWalkSpeed = FMath::Max(0.f, Run ? RunSpeed : WalkSpeed);
}`
  })
];
