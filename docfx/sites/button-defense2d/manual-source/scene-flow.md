# 场景启动与游戏流程

## 模块职责

流程模块是 Game 内部运行时的主编排层。它把场景配置、资源、按钮、建造、波次、角色、奖励和寻路缓存连接成一局游戏。

其他模块应把“开始游戏、开波、暂停、继续、失败、胜利、奖励后进入下一波”等流程动作交给 `GameFlowSystem`，不要各自直接改多个子系统。

## 模块间接口

| 类型 | 作为被调用方时提供的接口 | 主要调用方 |
| --- | --- | --- |
| `GameSceneContext` | 提供本场景配置数据和 `TryValidate` | `GameBoot`、`GameFlowSystem`、`LevelPointSystem`、`BuildSystem`、`WaveSystem` |
| `GameBoot` | Unity 生命周期入口，公开场景引用 | 场景对象，不作为业务模块调用入口 |
| `GameFlowSystem` | 游戏流程动作入口 | UI、输入、调试工具、其他流程脚本 |
| `GameStateModel` | 游戏状态读写和状态变化事件 | `GameFlowSystem` 写入，UI/输入/表现读取或监听 |
| `GameRuntimeModel` | 当前波次和最大波次 | `GameFlowSystem` 写入，UI/调试读取 |
| `LevelPointSystem` | 运行时出生点和按钮目标点 | `GameFlowSystem` 初始化，`WaveSystem` 和寻路逻辑读取 |

## 启动顺序

`GameBoot` 在场景中负责串联启动：

1. `Awake` 中获取 `GameFlowSystem` 和 `FlowFieldService`。
2. 调用 `GameFlowSystem.ConfigureScene(sceneContext)`。
3. 调用 `FlowFieldService.GiveBuilderQuery(gridQueryService)`。
4. `Start` 中调用 `GameFlowSystem.StartGame()`。
5. `Update` 中调用 `FlowFieldService.RebuildDirtyFields()`，统一刷新脏流场。

这意味着大多数运行时模块不需要主动初始化自己，只需要在 `GameFlowSystem.StartGame()` 的流程里被调度。

## `GameSceneContext`

跨模块使用的公开成员：

| API | 用途 | 调用方 |
| --- | --- | --- |
| `GridQueryService GridQueryService` | 当前场景网格查询服务 | `GameFlowSystem`、`BuildSystem`、`WaveSystem`、`LevelPointSystem` |
| `int MaxWave` | 本局最大波次 | `GameRuntimeModel.BeginNewRun` |
| `int InitialPower` | 初始电量 | `ResourceSystem.BeginRun` |
| `int ButtonHp` | 按钮初始血量 | `ButtonSystem.BeginRun` |
| `List<Vector2Int> SpawnCells` | 出生格配置 | `LevelPointSystem`、`BuildSystem` |
| `List<Vector2Int> ButtonArrivalCells` | 按钮目标格配置 | `LevelPointSystem`、`BuildSystem`、`FlowFieldService` |
| `TryValidate(out string error)` | 启动前校验关键引用和点位 | `GameFlowSystem.StartGame` |

约定：

- `GameSceneContext` 是场景配置源，不负责运行时逻辑。
- `SpawnCells` 和 `ButtonArrivalCells` 在一局开始后会被复制到 `LevelPointSystem`，运行中不要直接修改它们来驱动逻辑。
- 运行中如果关卡目标格发生变化，应通过对应运行时系统同步更新，而不是只改 `GameSceneContext`。

## `GameFlowSystem`

跨模块调用入口：

| API | 作用 | 状态约束 |
| --- | --- | --- |
| `ConfigureScene(GameSceneContext sceneContext)` | 绑定当前场景配置 | `StartGame` 前调用 |
| `StartGame()` | 开始新一局并初始化所有核心系统 | 需要有效 `GameSceneContext` |
| `StartCurrentWave()` | 从备战进入当前波次 | 仅 `Preparing` 生效 |
| `PauseGame()` | 暂停并允许建造编辑 | 仅 `Playing` 生效 |
| `ResumeGame()` | 继续游戏并刷新脏流场 | 仅 `Paused` 生效 |
| `SelectReward(string rewardId)` | 应用奖励并推进下一阶段 | 仅 `RewardSelecting` 生效 |
| `EndGame()` | 进入失败状态 | `Victory` 或 `GameOver` 后不重复执行 |

`StartGame()` 内部协作顺序：

1. 校验 `GameSceneContext`。
2. 设置状态为 `Booting`。
3. 停止旧波次、清理角色、取消奖励选择、清空流场缓存。
4. 重置建造、波次、资源、按钮和运行时模型。
5. 用场景点位初始化 `LevelPointSystem`。
6. 初始化关卡建造保留格。
7. 为按钮目标创建或获取流场。
8. 初始化 `WaveSystem` 和 `RewardSystem`。
9. 进入 `Preparing` 并允许建造。

内部约束：

- `GameFlowSystem` 是状态机边界。其他模块不应直接把状态从 `Playing` 改到 `Preparing`。
- `StartCurrentWave()` 会在开波前统一刷新流场，确保备战期间的建筑变化生效。
- `PauseGame()` 会设置 `Time.timeScale = 0`，同时允许编辑建造。
- `ResumeGame()` 会先刷新流场，再恢复 `Playing` 和时间。

## `GameStateModel`

跨模块使用成员：

| API | 用途 | 写入方 |
| --- | --- | --- |
| `GameState CurrentState` | 当前状态 | `GameFlowSystem` |
| `GameState PreviousState` | 上一个状态 | `GameFlowSystem` |
| `event Action<GameState, GameState> StateChanged` | 状态变化通知 | `GameStateModel.SetState` |
| `SetState(GameState state)` | 设置状态并触发通知 | 原则上仅 `GameFlowSystem` |

状态语义：

| 状态 | 说明 |
| --- | --- |
| `None` | 尚未进入运行流程 |
| `Booting` | 本局启动中 |
| `Preparing` | 备战，可建造 |
| `Playing` | 波次进行中 |
| `Paused` | 暂停，可建造 |
| `RewardSelecting` | 等待奖励选择 |
| `Victory` | 胜利 |
| `GameOver` | 失败 |

调用约定：

- 输入、UI、表现组件应监听 `StateChanged` 或读取 `CurrentState`。
- 只有流程主控需要调用 `SetState`。如果新增系统必须改变大流程，应先通过 `GameFlowSystem` 增加明确方法。

## `GameRuntimeModel`

跨模块使用成员：

| API | 用途 | 调用方 |
| --- | --- | --- |
| `CurrentWave` | 当前波次 | UI、调试、`GameFlowSystem` |
| `MaxWave` | 最大波次 | UI、调试、`GameFlowSystem` |
| `IsFinalWave` | 是否最后一波 | `GameFlowSystem` |
| `BeginNewRun(int maxWave)` | 初始化本局波次计数 | `GameFlowSystem.StartGame` |
| `TryAdvanceToNextWave()` | 尝试推进到下一波 | `GameFlowSystem` |

约定：

- 波次推进由 `GameFlowSystem` 调用 `TryAdvanceToNextWave()`。
- `WaveSystem.CurrentWave` 表示波次系统正在运行的波次，`GameRuntimeModel.CurrentWave` 表示流程层当前应该启动的波次。

## `LevelPointSystem`

跨模块使用成员：

| API | 用途 | 调用方 |
| --- | --- | --- |
| `SpawnCells` | 运行时出生格列表 | `WaveSystem`、调试工具 |
| `ButtonArrivalCells` | 运行时按钮目标格列表 | `GameFlowSystem`、`FlowFieldService` |
| `BeginRun(GameSceneContext context)` | 从场景配置复制并校验点位 | `GameFlowSystem.StartGame` |
| `GetSpawnCell(int index)` | 按索引循环获取出生格 | `WaveSystem` |

约定：

- 该系统只负责点位转换和读取，不负责生成角色。
- `GetSpawnCell` 会按出生点数量取模，适合批量生成时轮询多个出生点。
- 如果没有出生点会抛出异常，因此必须先通过 `GameSceneContext.TryValidate` 和 `BeginRun`。
