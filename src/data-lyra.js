export const lyraCategories = [
  { id: "ue-lyra-experience", domain: 'unreal', title: "Lyra 玩法体验与角色初始化", description: "从地图的 Experience 找到 Game Feature、PawnData 与角色初始化时机。" },
  { id: "ue-lyra-abilities", domain: 'unreal', title: "Lyra 输入、技能与角色状态", description: "追踪输入标签、ASC 持有者、临时能力、血量和相机。" },
  { id: "ue-lyra-equipment", domain: 'unreal', title: "Lyra 背包、装备与 HUD", description: "查看快捷栏、物品实例、装备 Fragment 和本地消息。" },
  { id: "ue-lyra-match", domain: 'unreal', title: "Lyra 队伍、回合与交互", description: "核对伤害规则、回合状态和交互能力的来源。" }
];

function lyraExample({ headers, doc, body, ...entry }) {
  return {
    ...entry,
    header: headers.join('、'),
    since: 'Lyra · UE 5.8',
    quickLabel: entry.signature,
    resultLabel: '试玩验证',
    code: [...headers.map(header => '#include "' + header + '"'), '', body].join('\n'),
    references: [{ label: 'Epic Games · Lyra', url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/' + doc }]
  };
}

export const lyraApis = [
  lyraExample({
    id: 'lyra-experience-ready', category: 'ue-lyra-experience', name: "等 Experience 就绪后再启动玩法", level: 'A',
    headers: ["CoreMinimal.h", "GameModes/LyraExperienceManagerComponent.h", "GameModes/LyraExperienceDefinition.h", "GameFramework/GameStateBase.h", "Engine/World.h"],
    signature: "CallOrRegister_OnExperienceLoaded",
    brief: "从能取得 GameState 的初始化入口调用 WatchExperience，传入与当前玩法逻辑同寿命的 UObject。示例记录已就绪的 Experience 名称，可在同一回调中启动该模式特有的系统。",
    returns: "打开 L_Expanse，在 LyraExperienceManagerComponent.cpp 的加载回调设断点。分别在加载前后调用，已有 Experience 时应同步得到回调。",
    pitfall: "回调可能在注册当下执行，应先初始化回调依赖。等待者可能随世界销毁，示例使用弱引用检查。",
    keywords: "Lyra Starter Game Lyra 玩法体验与角色初始化", doc: 'lyra-sample-game-in-unreal-engine',
    body: `void WatchExperience(UWorld& World, UObject& Observer)
{
    auto* State = World.GetGameState();
    if (!State) return;
    auto* Manager = State->FindComponentByClass<ULyraExperienceManagerComponent>();
    if (!Manager) return;
    Manager->CallOrRegister_OnExperienceLoaded(
        FOnLyraExperienceLoaded::FDelegate::CreateLambda(
            [WeakObserver = TWeakObjectPtr<UObject>(&Observer)](const ULyraExperienceDefinition* Experience)
            {
                if (!WeakObserver.IsValid() || !Experience) return;
                UE_LOG(LogTemp, Display, TEXT("Experience ready: %s"), *GetNameSafe(Experience));
            }));
}`
  }),
  lyraExample({
    id: 'lyra-experience-features', category: 'ue-lyra-experience', name: "找出当前玩法启用了哪些 Game Feature", level: 'A',
    headers: ["CoreMinimal.h", "GameModes/LyraExperienceManagerComponent.h", "GameModes/LyraExperienceDefinition.h"],
    signature: "GameFeaturesToEnable / ActionSets",
    brief: "在 Experience 加载后，把管理组件传给示例，打印配置的插件名称与 Action Set 数量。编辑器里可从关卡 World Settings 的 Default Gameplay Experience 追到对应资产。",
    returns: "打开 L_Expanse，沿关卡配置进入对应 Experience，检查插件与 Action Sets；再与 TopDownArena 的配置比较。",
    pitfall: "插件名称是配置值；实际启用结果还要在加载日志中核对。Actions 和 Action Sets 均可能为同一玩法添加组件、输入或界面。",
    keywords: "Lyra Starter Game Lyra 玩法体验与角色初始化", doc: 'game-features-and-modular-gameplay-in-unreal-engine',
    body: `void LogFeatureConfig(const ULyraExperienceManagerComponent& Manager)
{
    if (!Manager.IsExperienceLoaded()) return;
    const auto* Experience = Manager.GetCurrentExperienceChecked();
    for (const FString& Feature : Experience->GameFeaturesToEnable)
        UE_LOG(LogTemp, Display, TEXT("Configured feature: %s"), *Feature);
    UE_LOG(LogTemp, Display, TEXT("Action sets: %d"), Experience->ActionSets.Num());
}`
  }),
  lyraExample({
    id: 'lyra-pawn-data', category: 'ue-lyra-experience', name: "查某个 Pawn 实际用了哪套能力和输入", level: 'A',
    headers: ["CoreMinimal.h", "Character/LyraPawnExtensionComponent.h", "Character/LyraPawnData.h", "GameFramework/Actor.h"],
    signature: "FindPawnExtensionComponent / GetPawnData",
    brief: "取得 Pawn 后查看扩展组件，再读实际关联的 PawnData，定位角色类、AbilitySets 和 InputConfig 的来源。",
    returns: "在同一 Experience 重生一次，检查新 Pawn 的数据和技能集数量。若更换 Experience 后行为不同，对比当前 PawnData 资产。",
    pitfall: "客户端初期可能尚未收到 PawnData。调用返回空时，在角色初始化完成或组件收到数据后再查询。",
    keywords: "Lyra Starter Game Lyra 玩法体验与角色初始化", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `void LogPawnConfig(const AActor& Pawn)
{
    const auto* Extension = ULyraPawnExtensionComponent::FindPawnExtensionComponent(&Pawn);
    const auto* Data = Extension ? Extension->GetPawnData<ULyraPawnData>() : nullptr;
    if (Data)
        UE_LOG(LogTemp, Display, TEXT("PawnData %s, ability sets: %d"),
            *GetNameSafe(Data), Data->AbilitySets.Num());
}`
  }),
  lyraExample({
    id: 'lyra-avatar-ready', category: 'ue-lyra-experience', name: "在技能系统绑定当前 Pawn 时再初始化表现", level: 'A',
    headers: ["CoreMinimal.h", "Character/LyraPawnExtensionComponent.h", "AbilitySystem/LyraAbilitySystemComponent.h", "GameFramework/Actor.h"],
    signature: "OnAbilitySystemInitialized_RegisterAndCall",
    brief: "在附加到 Pawn 的表现组件初始化时登记回调。实际项目也可通过 Uninitialized 回调解除旧 Pawn 的数值与表现绑定。",
    returns: "在 Shooter Gym 重生，分别看旧 Pawn 解除与新 Pawn 初始化时的调用，确认新绑定指向新化身。",
    pitfall: "初始化可能同步调用回调。以自己的表现组件作为观察者，保留角色已有的回调。Lyra 对同一观察者只保留一个注册。",
    keywords: "Lyra Starter Game Lyra 玩法体验与角色初始化", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `void WatchAvatar(AActor& Pawn, UObject& Observer)
{
    if (auto* Extension = ULyraPawnExtensionComponent::FindPawnExtensionComponent(&Pawn))
    {
        Extension->OnAbilitySystemInitialized_RegisterAndCall(
            FSimpleMulticastDelegate::FDelegate::CreateWeakLambda(
                &Observer, [WeakPawn = TWeakObjectPtr<AActor>(&Pawn)]()
            {
                auto* CurrentPawn = WeakPawn.Get();
                auto* Current = ULyraPawnExtensionComponent::FindPawnExtensionComponent(CurrentPawn);
                auto* ASC = Current ? Current->GetLyraAbilitySystemComponent() : nullptr;
                if (ASC && ASC->GetAvatarActor() == CurrentPawn)
                    UE_LOG(LogTemp, Display, TEXT("Avatar ready: %s"), *GetNameSafe(CurrentPawn));
            }));
    }
}`
  }),
  lyraExample({
    id: 'lyra-input-tag', category: 'ue-lyra-abilities', name: "排查按键触发不了 Lyra 技能", level: 'B',
    headers: ["CoreMinimal.h", "Character/LyraHeroComponent.h", "Input/LyraInputConfig.h", "InputAction.h", "GameFramework/Actor.h"],
    signature: "FindAbilityInputActionForTag / IsReadyToBindInputs",
    brief: "使用从当前角色或 Game Feature 找到的 ULyraInputConfig 和期望输入标签。核对 IMC 绑定的 Input Action、Input Config 的标签和 Ability Set 条目上的输入标签。",
    returns: "从 ShooterCore 的 GA_Hero_Dash 和 AbilitySet_ShooterHero 出发，追踪实际输入配置。按键时依次查看 HeroComponent 和 ASC 的 InputTag 回调。",
    pitfall: "IsReadyToBindInputs 说明角色已到绑定阶段。若映射仍无效，检查当前 LocalPlayer 的 IMC、标签是否一致以及能力激活条件。",
    keywords: "Lyra Starter Game Lyra 输入、技能与角色状态", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `const UInputAction* FindBoundAction(const AActor& Pawn, const ULyraInputConfig& Config,
                                    const FGameplayTag& InputTag)
{
    const auto* Hero = ULyraHeroComponent::FindHeroComponent(&Pawn);
    return Hero && Hero->IsReadyToBindInputs()
        ? Config.FindAbilityInputActionForTag(InputTag, false) : nullptr;
}`
  }),
  lyraExample({
    id: 'lyra-asc-owner', category: 'ue-lyra-abilities', name: "重生后从同一 PlayerState 找回玩家能力", level: 'B',
    headers: ["CoreMinimal.h", "Player/LyraPlayerController.h", "Player/LyraPlayerState.h", "AbilitySystem/LyraAbilitySystemComponent.h"],
    signature: "GetLyraAbilitySystemComponent / GetAvatarActor",
    brief: "在玩家控制器的调试入口打印 ASC 的 Owner 和 Avatar，定位重生前后技能系统及 Pawn 的生命周期。",
    returns: "在 L_Expanse 玩家死亡并重生时对比日志。玩家的 ASC 挂在 PlayerState，新 Pawn 初始化后成为当前 Avatar。",
    pitfall: "把跨重生状态放在合适的持久对象，同时按规则清理只属于旧 Pawn 的效果或订阅。查询时允许尚无 Avatar。",
    keywords: "Lyra Starter Game Lyra 输入、技能与角色状态", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `void LogAbilityActors(const ALyraPlayerController& Controller)
{
    const auto* Player = Controller.GetLyraPlayerState();
    const auto* ASC = Player ? Player->GetLyraAbilitySystemComponent() : nullptr;
    if (ASC)
        UE_LOG(LogTemp, Display, TEXT("Owner=%s Avatar=%s"),
            *GetNameSafe(ASC->GetOwnerActor()), *GetNameSafe(ASC->GetAvatarActor()));
}`
  }),
  lyraExample({
    id: 'lyra-ability-grant', category: 'ue-lyra-abilities', name: "临时授予一组能力并在结束时撤回", level: 'B',
    headers: ["CoreMinimal.h", "AbilitySystem/LyraAbilitySet.h", "AbilitySystem/LyraAbilitySystemComponent.h"],
    signature: "GiveToAbilitySystem / TakeFromAbilitySystem",
    brief: "在 LyraGame 里让权威端的装备或临时增益保存同一组句柄，作用域结束时把句柄交回原 ASC。",
    returns: "看 LyraEquipmentManagerComponent.cpp 的授予与移除路径。在 Shooter Gym 装备再卸下同一物品，对比赋予的技能是否仍在列表中。",
    pitfall: "每次授予单独保存句柄，避免重复给予。SourceObject 要按能力用途提供，装备能力可能从它解析装备实例。",
    keywords: "Lyra Starter Game Lyra 输入、技能与角色状态", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `void GrantTemporarySet(const ULyraAbilitySet& Set, ULyraAbilitySystemComponent& ASC,
                       FLyraAbilitySet_GrantedHandles& Handles, UObject* Source)
{
    if (ASC.IsOwnerActorAuthoritative())
        Set.GiveToAbilitySystem(&ASC, &Handles, Source);
}

void RemoveTemporarySet(ULyraAbilitySystemComponent& ASC, FLyraAbilitySet_GrantedHandles& Handles)
{
    if (ASC.IsOwnerActorAuthoritative())
        Handles.TakeFromAbilitySystem(&ASC);
}`
  }),
  lyraExample({
    id: 'lyra-hud-health', category: 'ue-lyra-abilities', name: "用 Lyra 生命组件初始化血条", level: 'B',
    headers: ["CoreMinimal.h", "Character/LyraHealthComponent.h", "Components/ProgressBar.h", "GameFramework/Actor.h"],
    signature: "FindHealthComponent / GetHealthNormalized",
    brief: "在 HUD 获得新 Pawn 时立即刷新。后续订阅当前组件的 OnHealthChanged 和 OnMaxHealthChanged，并在换 Pawn 时解除旧绑定。",
    returns: "L_Expanse 开双玩家 PIE，受伤并重生，检查血条读取新 Pawn 的健康值，退出旧 Pawn 后不再接收旧组件的事件。",
    pitfall: "健康组件初始化前可能给出零，收到初始化事件后应再刷新。血量规则仍由各 Gameplay Effect 和相关属性集负责。",
    keywords: "Lyra Starter Game Lyra 输入、技能与角色状态", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `void RefreshHealthBar(UProgressBar& Bar, const AActor* Pawn)
{
    const auto* Health = ULyraHealthComponent::FindHealthComponent(Pawn);
    Bar.SetPercent(Health ? FMath::Clamp(Health->GetHealthNormalized(), 0.f, 1.f) : 0.f);
}`
  }),
  lyraExample({
    id: 'lyra-camera-mode', category: 'ue-lyra-abilities', name: "让一个技能在持续期间使用特殊镜头", level: 'B',
    headers: ["CoreMinimal.h", "AbilitySystem/Abilities/LyraGameplayAbility.h", "Camera/LyraCameraMode.h"],
    signature: "SetCameraMode / ClearCameraMode",
    brief: "将公开的 SetCameraMode 接入技能开始逻辑，传入项目配置的 CameraMode。示例展示供 Lyra 能力类使用的两个普通辅助函数。",
    returns: "把自定义模式用于一个按住结束的能力，在 Shooter Gym 验证触发、正常结束和取消后的镜头过渡。",
    pitfall: "Lyra 的能力结束流程会清理由该能力控制的相机模式。如果效果需要提前离开瞄准状态，可显式清理。能力应调用其父类结束逻辑。",
    keywords: "Lyra Starter Game Lyra 输入、技能与角色状态", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `void EnterAbilityCamera(ULyraGameplayAbility& Ability, TSubclassOf<ULyraCameraMode> Mode)
{
    if (Mode) Ability.SetCameraMode(Mode);
}

void LeaveAbilityCamera(ULyraGameplayAbility& Ability)
{
    Ability.ClearCameraMode();
}`
  }),
  lyraExample({
    id: 'lyra-quickbar', category: 'ue-lyra-equipment', name: "切换快捷栏并读取实际装备槽", level: 'A',
    headers: ["CoreMinimal.h", "Equipment/LyraQuickBarComponent.h", "GameFramework/PlayerController.h"],
    signature: "SetActiveSlotIndex / GetActiveSlotItem",
    brief: "在所属本地 PlayerController 的快捷键处理处传入从零开始的槽号。UI 在槽位变更通知后读取当前 Index 和 Item。",
    returns: "在 Shooter Gym 拾取两个可装备物品后切换。对比快捷栏高亮、手中模型以及切换后的可用能力。",
    pitfall: "SetActiveSlotIndex 是服务器 RPC。请求发出后，收到更新前读取到的可能仍是旧槽，空槽也可能没有 Item。",
    keywords: "Lyra Starter Game Lyra 背包、装备与 HUD", doc: 'lyra-inventory-and-equipment-in-unreal-engine',
    body: `void SelectQuickSlot(APlayerController& Player, int32 Slot)
{
    if (!Player.IsLocalController()) return;
    if (auto* Bar = Player.FindComponentByClass<ULyraQuickBarComponent>())
    {
        const auto Slots = Bar->GetSlots();
        if (Slots.IsValidIndex(Slot) && Slots[Slot])
            Bar->SetActiveSlotIndex(Slot);
    }
}`
  }),
  lyraExample({
    id: 'lyra-inventory-stats', category: 'ue-lyra-equipment', name: "从物品实例读取能跨换装保留的计数", level: 'A',
    headers: ["CoreMinimal.h", "Equipment/LyraQuickBarComponent.h", "Inventory/LyraInventoryItemInstance.h"],
    signature: "GetActiveSlotItem / GetStatTagStackCount",
    brief: "把快捷栏当前的物品和物品定义中实际使用的计数标签交给 UI。对于武器，可从 ID_Pistol 的 SetStats Fragment 开始查。",
    returns: "用同一个物品切换至另一槽再切回来。检查物品实例上的计数仍可读取，与当前装备的临时实例相互独立。",
    pitfall: "标签栈属于具体物品实例。不同弹药用途可能用不同标签，HUD 应读取对应标签。",
    keywords: "Lyra Starter Game Lyra 背包、装备与 HUD", doc: 'lyra-inventory-and-equipment-in-unreal-engine',
    body: `int32 ReadSelectedItemStat(const ULyraQuickBarComponent& Bar, FGameplayTag StatTag)
{
    const auto* Item = Bar.GetActiveSlotItem();
    return Item && StatTag.IsValid() ? Item->GetStatTagStackCount(StatTag) : 0;
}`
  }),
  lyraExample({
    id: 'lyra-item-fragment', category: 'ue-lyra-equipment', name: "判断物品是否配置为可装备", level: 'A',
    headers: ["CoreMinimal.h", "Inventory/LyraInventoryItemInstance.h", "Inventory/InventoryFragment_EquippableItem.h", "Equipment/LyraEquipmentDefinition.h"],
    signature: "FindFragmentByClass / EquipmentDefinition",
    brief: "在背包界面构建装备按钮时检查 EquippableItem Fragment。配置装备定义后，再由实际快捷栏和装备管理器处理装备与移除。",
    returns: "打开 ID_Pistol，确认其 Fragment 指向 WID_Pistol。用没有该 Fragment 的物品实例对照查询，应得到 false。",
    pitfall: "此查询只说明配置可装备。服务器仍应检查物品归属、槽位及玩法约束。",
    keywords: "Lyra Starter Game Lyra 背包、装备与 HUD", doc: 'lyra-inventory-and-equipment-in-unreal-engine',
    body: `bool HasEquipmentDefinition(const ULyraInventoryItemInstance& Item)
{
    const auto* Fragment = Item.FindFragmentByClass<UInventoryFragment_EquippableItem>();
    return Fragment && Fragment->EquipmentDefinition != nullptr;
}`
  }),
  lyraExample({
    id: 'lyra-quickbar-message', category: 'ue-lyra-equipment', name: "让 HUD 监听当前玩家的快捷栏切换", level: 'A',
    headers: ["CoreMinimal.h", "GameFramework/GameplayMessageSubsystem.h", "Equipment/LyraQuickBarComponent.h", "GameFramework/PlayerController.h"],
    signature: "RegisterListener / FGameplayMessageListenerHandle::Unregister",
    brief: "在 HUD 创建时先从自己的 QuickBar 获取当前槽，再调用 WatchQuickSlot。把返回句柄存到 Widget，销毁或更换本地玩家时调用 Unregister。",
    returns: "在分屏或本地 PIE 切换各自的快捷栏，观察日志只记录匹配 Player 的消息。重新打开 HUD 时只存在一份订阅。",
    pitfall: "Gameplay Message Router 在本进程分发消息。按 Payload.Owner 过滤玩家，首次显示时从组件读取当前值。",
    keywords: "Lyra Starter Game Lyra 背包、装备与 HUD", doc: 'lyra-inventory-and-equipment-in-unreal-engine',
    body: `FGameplayMessageListenerHandle WatchQuickSlot(APlayerController& Player)
{
    const auto Channel = FGameplayTag::RequestGameplayTag(
        FName(TEXT("Lyra.QuickBar.Message.ActiveIndexChanged")));
    return UGameplayMessageSubsystem::Get(&Player)
        .RegisterListener<FLyraQuickBarActiveIndexChangedMessage>(Channel,
            [WeakPlayer = TWeakObjectPtr<APlayerController>(&Player)](
                FGameplayTag, const FLyraQuickBarActiveIndexChangedMessage& Message)
            {
                if (auto* Current = WeakPlayer.Get(); Current && Message.Owner.Get() == Current)
                    UE_LOG(LogTemp, Display, TEXT("Active slot: %d"), Message.ActiveIndex);
            });
}`
  }),
  lyraExample({
    id: 'lyra-teams', category: 'ue-lyra-match', name: "让服务器用 Lyra 队伍规则判定伤害", level: 'B',
    headers: ["CoreMinimal.h", "Teams/LyraTeamSubsystem.h", "Engine/World.h", "GameFramework/Actor.h"],
    signature: "ULyraTeamSubsystem::CanCauseDamage",
    brief: "在权威端拿到真实来源与目标后，于应用伤害之前调用。示例禁止自伤并采用 Lyra 队伍判定。",
    returns: "在 Elimination 用队友与对手分别验证，检查队伍分配完毕后结果是否符合玩法规则。",
    pitfall: "仅在双方的身份可由服务器确认时执行。CanCauseDamage 的无队伍对象处理也属于规则，移植时应查看其实现。",
    keywords: "Lyra Starter Game Lyra 队伍、回合与交互", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `bool CanApplyTeamDamage(AActor& Instigator, AActor& Target)
{
    auto* World = Target.GetWorld();
    if (!Target.HasAuthority() || !World || Instigator.GetWorld() != World) return false;
    auto* Teams = World->GetSubsystem<ULyraTeamSubsystem>();
    return Teams && Teams->CanCauseDamage(&Instigator, &Target, false);
}`
  }),
  lyraExample({
    id: 'lyra-phase', category: 'ue-lyra-match', name: "只在正式比赛阶段接受目标计分", level: 'B',
    headers: ["CoreMinimal.h", "AbilitySystem/Phases/LyraGamePhaseSubsystem.h", "Engine/World.h"],
    signature: "ULyraGamePhaseSubsystem::IsPhaseActive",
    brief: "从服务端目标组件调用 IsScoringPhase，通过后再提交计分。在 ShooterCore 的标签配置中可找到 Playing、Warmup 和 PostGame。",
    returns: "在 Elimination 切换比赛阶段，检查热身与赛后返回 false，比赛中返回 true。",
    pitfall: "对父标签的查询也可能匹配活跃子阶段。客户端 UI 若需要显示当前阶段，可订阅已有玩法消息或读取复制状态。",
    keywords: "Lyra Starter Game Lyra 队伍、回合与交互", doc: 'abilities-in-lyra-in-unreal-engine',
    body: `bool IsScoringPhase(UWorld& World)
{
    if (!World.GetAuthGameMode()) return false;
    const auto Playing = FGameplayTag::RequestGameplayTag(
        FName(TEXT("ShooterGame.GamePhase.Playing")), false);
    const auto* Phases = World.GetSubsystem<ULyraGamePhaseSubsystem>();
    return Playing.IsValid() && Phases && Phases->IsPhaseActive(Playing);
}`
  }),
  lyraExample({
    id: 'lyra-interaction', category: 'ue-lyra-match', name: "给可交互对象提供一个由玩家执行的能力", level: 'B',
    headers: ["CoreMinimal.h", "Interaction/InteractionOption.h"],
    signature: "FInteractionOption::InteractionAbilityToGrant",
    brief: "在实现 IInteractableTarget 的目标对象中构造以下选项，从 GatherInteractionOptions 提交给 Builder。为该选项传入项目自己的交互能力。",
    returns: "打开 ShooterExplorer 的 L_InteractionTestMap，从 B_InteractableChair 追踪现有交互。把新选项接到可探测的测试对象，确认 UI 显示提示，按交互键后执行能力。",
    pitfall: "此路径让玩家化身侧获得交互能力。若玩法需要目标自身处理，应配置目标 ASC 和其已有能力句柄。服务端执行时仍须复核目标。",
    keywords: "Lyra Starter Game Lyra 队伍、回合与交互", doc: 'lyra-sample-game-interaction-system-in-unreal-engine',
    body: `FInteractionOption MakeInspectOption(TSubclassOf<UGameplayAbility> Ability)
{
    FInteractionOption Option;
    Option.Text = NSLOCTEXT("HandbookInteraction", "Inspect", "Inspect");
    Option.InteractionAbilityToGrant = Ability;
    return Option;
}`
  })
];
