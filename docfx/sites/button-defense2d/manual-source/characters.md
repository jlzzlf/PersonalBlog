# 角色系统

## 模块职责

角色系统负责运行时角色的生成、初始化、活跃集合维护和清理。单个角色控制器负责移动、阻挡建造格、抵达按钮后造成按钮伤害，以及离场通知。

波次系统不直接实例化角色 Prefab，而是通过 `CharacterSystem` 生成角色，这样活跃集合和离场事件才能保持一致。

## 协作关系

| 调用方 | 调用接口 | 目的 |
| --- | --- | --- |
| `GameFlowSystem.StartGame` | `CharacterSystem.BeginRun()` | 新局清理旧角色 |
| `WaveSystem` | `CharacterSystem.Spawn(...)` | 波次中生成角色 |
| `CharacterSystem` | `LittleManController.Initialize(flowField)` | 生成后初始化角色导航 |
| `CharacterSystem` | 订阅 `LittleManController.Removed` | 维护活跃集合并向波次系统转发移除 |
| `WaveSystem` | 订阅 `CharacterSystem.CharacterRemoved` | 更新存活数量并判断波次结束 |
| `LittleManController` | `ButtonSystem.NotifyButtonPressed(...)` | 抵达按钮后扣按钮血量 |
| `LittleManController` | `GridQueryService.SetBuildBlocker` / `ClearBuildBlocker` | 占用当前格和目标格，阻止建造 |
| 角色表现 | `CharacterRuntimeModel.ModelChanged` | 根据模型变化刷新表现 |

## `CharacterSystem`

跨模块接口：

| API | 模块间用途 | 调用方 |
| --- | --- | --- |
| `event Action<LittleManController> CharacterRemoved` | 通知角色已离场 | `WaveSystem` |
| `int ActiveCharacterCount` | 当前活跃角色数量 | UI、调试、流程判断 |
| `BeginRun()` | 新局开始前清理所有角色 | `GameFlowSystem` |
| `Spawn(LittleManController prefab, Vector3 worldPosition, IFlowField flowField)` | 实例化角色、注册集合、绑定流场 | `WaveSystem` |
| `ClearAllCharacters()` | 清理所有活跃角色 | `BeginRun` 或重置逻辑 |

调用后效果：

- `Spawn` 会实例化 Prefab，把角色加入活跃集合，订阅角色 `Removed` 事件，然后调用 `Initialize(flowField)`。
- `ClearAllCharacters` 会取消角色离场订阅、释放角色占用的建造阻挡格并销毁角色对象。
- 角色离场时，`CharacterSystem` 会从集合移除并触发 `CharacterRemoved`。

约定：

- 波次中生成角色优先调用 `WaveSystem.TrySpawnCharacter(s)`，由波次系统同步统计数量。
- 如果确实绕过波次直接生成，也必须调用 `CharacterSystem.Spawn`，不要直接 `Instantiate` 角色 Prefab。
- 清理角色时优先调用 `CharacterSystem.ClearAllCharacters` 或 `LittleManController.Despawn()`。

## `LittleManController`

跨模块接口：

| API | 用途 | 调用方 |
| --- | --- | --- |
| `event Action<LittleManController> Removed` | 单个角色离场通知 | `CharacterSystem` |
| `CharacterRuntimeModel RuntimeModel` | 读取或监听角色运行时状态 | 角色表现、调试 |
| `Initialize(IFlowField flowField)` | 绑定流场并进入移动状态 | `CharacterSystem.Spawn` |
| `Despawn()` | 释放阻挡格、通知离场并销毁对象 | 战斗、陷阱、按钮抵达逻辑 |
| `ReleaseBuildBlockCells()` | 释放角色注册到网格服务的建造阻挡格 | 清理、回收、销毁前 |

运行时行为边界：

- `Initialize` 之后角色会根据绑定的 `IFlowField` 移动。
- 移动时角色会把当前格注册为建造阻挡格，并把下一个移动目标格也临时注册为建造阻挡格。
- 到达 `FlowFieldDestinationKind.Primary` 目标时，会调用 `ButtonSystem.NotifyButtonPressed(config.buttonPressDamage)`，然后 `Despawn()`。
- `OnDestroy` 会兜底调用离场通知，但主动移除仍建议调用 `Despawn()`，这样释放和通知顺序更明确。

## `CharacterConfigSO`

角色 Prefab 和运行时模型之间的配置接口：

| 字段 | 用途 | 读取方 |
| --- | --- | --- |
| `maxHp` | 初始最大生命值 | `CharacterRuntimeModel` |
| `moveSpeed` | 初始移动速度 | `CharacterRuntimeModel` |
| `moveTargetRandomOffsetRadius` | 移动目标点随机偏移半径 | `LittleManController` |
| `buttonPressDamage` | 抵达按钮后的按压伤害 | `LittleManController` |

约定：

- 每个 `LittleManController` Prefab 必须绑定 `CharacterConfigSO`。
- 配置变更只影响新创建的 `CharacterRuntimeModel`，不会自动改已有角色。

## `CharacterRuntimeModel`

跨模块接口：

| API | 用途 |
| --- | --- |
| `event Action<CharacterRuntimeModel, CharacterModelChangeFlags> ModelChanged` | 累计变化推送 |
| `CurrentHp` / `MaxHp` | 生命值读取 |
| `MoveSpeed` | 移动速度读取 |
| `State` | 当前角色状态 |
| `ApplyDamage(int damage)` | 扣生命值 |
| `SetState(CharacterRuntimeState state)` | 设置角色状态 |
| `PushChanges()` | 推送本帧累计变化 |

约定：

- `LittleManController` 在 `LateUpdate` 调用 `PushChanges()`。
- 表现层监听 `ModelChanged` 时，应根据 `CharacterModelChangeFlags` 只刷新需要的部分。
- 当前 `ApplyDamage` 只修改生命值，不自动执行死亡和离场；调用方需要根据生命值决定后续流程。

## 角色状态

| 状态 | 语义 | 当前主要使用情况 |
| --- | --- | --- |
| `MovingToButton` | 向按钮移动 | 当前主状态 |
| `Attracted` | 被吸引 | 预留 |
| `Captured` | 被捕获 | 预留 |
| `Sleeping` | 睡眠 | 预留 |
| `Dead` | 死亡 | 按钮抵达离场前设置 |

## `CharacterMover`

`CharacterMover` 是无状态位移工具，供角色控制器内部复用。

| API | 用途 |
| --- | --- |
| `Move(Transform transform, Vector2 direction, float speed, float deltaTime)` | 按方向直接移动 |
| `MoveTowards(Transform transform, Vector3 targetPosition, float speed, float deltaTime, float arriveDistance)` | 向目标点移动，抵达时返回 `true` |

约定：

- 它不处理寻路、碰撞、状态和事件，只移动 Transform。
- 需要角色业务状态时由 `LittleManController` 或更高层系统处理。
