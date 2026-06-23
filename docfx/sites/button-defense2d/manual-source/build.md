# 建造系统

## 模块职责

建造系统是 Game 内部所有“改变关卡布局”的业务入口。它负责判断能否建造、生成建筑、拆除建筑、维护运行时建筑集合，并通知依赖网格可行走性的模块刷新。

影响角色路径、出生点、按钮目标点和可建造性的操作，都应通过 `BuildSystem` 或它约定调用的 `GridQueryService` 完成。

## 协作关系

| 调用方 | 调用接口 | 目的 |
| --- | --- | --- |
| `GameFlowSystem.StartGame` | `ResetForNewRun()`、`InitializeLevelLayout(context)`、`SetEditingEnabled(...)` | 新局初始化建造状态 |
| `GameFlowSystem.PauseGame` / `ResumeGame` | `SetEditingEnabled(...)` | 暂停/继续时控制是否允许编辑 |
| 输入或调试工具 | `TryBuildSingleCellObstacle`、`TryRemoveBuilding` | 玩家或测试建造操作 |
| `BuildSystem` | `GridQueryService.PlaceBuilding`、`RemoveBuilding`、`SetBuildBlocker` | 同步网格层状态 |
| `FlowFieldService` | 监听 `GridWalkabilityChangedEvent` | 布局变化后标记流场为脏 |
| UI | `BuildRuntimeModel`、`BuildSystem.IsEditingEnabled` | 展示编辑状态和建筑数量 |

## `BuildSystem`

跨模块接口：

| API | 模块间用途 | 调用约束 |
| --- | --- | --- |
| `event Action GridLayoutChanged` | 通知建造布局变化 | 建筑变动或保留阻挡格变动后触发 |
| `bool IsEditingEnabled` | 查询当前是否允许建造编辑 | 由流程层设置 |
| `ResetForNewRun()` | 清理运行时建筑并重置模型 | 新局开始 |
| `InitializeLevelLayout(GameSceneContext context)` | 绑定 `GridQueryService`，并把出生点/按钮目标点注册为不可建造格 | `LevelPointSystem.BeginRun` 后、流场创建前 |
| `SetEditingEnabled(bool enabled)` | 设置编辑开关 | 流程层调用 |
| `TryBuildSingleCellObstacle(Cell cell, BuildingBase buildingPrefab, Transform parent, out BuildingBase placedBuilding)` | 在格子上生成建筑实例 | 仅编辑开启、网格服务已初始化、Prefab 可放置时成功 |
| `TryRemoveBuilding(Cell cell)` | 拆除格子上的建筑 | 仅编辑开启且该格有建筑时成功 |
| `NotifyGridLayoutChanged()` | 主动广播布局变化 | 自定义建筑规则改变可行走性后调用 |

调用后效果：

- 成功建造会实例化 Prefab、设置世界坐标、写入 `GridQueryService` 的建筑层、注册到 `BuildRuntimeModel`，然后触发布局变化。
- 成功拆除会从 `GridQueryService` 和 `BuildRuntimeModel` 移除建筑，销毁 GameObject，然后触发布局变化。
- `NotifyGridLayoutChanged` 会触发 `GridLayoutChanged`，并发布 `GridWalkabilityChangedEvent`，使流场缓存变脏。

推荐调用顺序：

```csharp
BuildSystem buildSystem = this.GetSystem<BuildSystem>();

if (!buildSystem.IsEditingEnabled)
{
    return;
}

buildSystem.TryBuildSingleCellObstacle(
    cell,
    obstaclePrefab,
    buildRoot,
    out BuildingBase placedBuilding);
```

## `BuildRuntimeModel`

跨模块接口：

| API | 用途 | 主要调用方 |
| --- | --- | --- |
| `IsEditingEnabled` | 当前编辑开关 | UI、输入、`BuildSystem` |
| `GridRevision` | 布局修订号 | 调试、缓存判断 |
| `RuntimeBuildingCount` | 当前运行时建筑数量 | UI、调试 |
| `ResetForNewRun()` | 重置编辑状态、建筑集合和修订号 | `BuildSystem` |
| `SetEditingEnabled(bool enabled)` | 写入编辑开关 | `BuildSystem` |
| `RegisterRuntimeBuilding(BuildingBase building)` | 注册建筑实例 | `BuildSystem` |
| `UnregisterRuntimeBuilding(BuildingBase building)` | 注销建筑实例 | `BuildSystem` |
| `SnapshotRuntimeBuildings()` | 获取建筑快照 | `BuildSystem` 清理时使用 |
| `ClearRuntimeBuildings()` | 清空建筑集合 | `BuildSystem` |
| `AdvanceGridRevision()` | 推进布局修订号 | `BuildSystem.NotifyGridLayoutChanged` |

约定：

- 其他模块读取模型即可，不要直接注册或清理建筑。
- 修订号只表示布局发生过变化，不携带变化详情。

## `BuildingBase`

建筑 Prefab 之间共用的协作接口：

| API | 用途 |
| --- | --- |
| `bool blocksMovement` | 是否阻挡角色移动和流场通行 |
| `bool blocksBuilding` | 是否阻止继续在占用格建造 |
| `Init(Cell origin)` | 写入建筑原点 |
| `GetOccupiedCells()` | 获取当前原点下占用格 |
| `GetOccupiedCells(Cell origin)` | 预检查某个原点下会占用哪些格 |
| `virtual OnPlaced()` | 建筑进入网格层后回调 |
| `virtual OnRemoved()` | 建筑从网格层移除后回调 |

约定：

- 自定义建筑通过继承 `BuildingBase` 提供占格规则和放置/移除回调。
- 建筑不要自己把自己写入网格层，必须由 `BuildSystem` 或 `GridQueryService` 执行放置。
- 如果建筑在放置后动态改变 `blocksMovement` 或 `blocksBuilding`，调用方需要再调用 `BuildSystem.NotifyGridLayoutChanged()`。

## `PrototypeObstacleBuilding`

`PrototypeObstacleBuilding` 只是 `BuildingBase` 的空实现，用于原型阶段的障碍建筑 Prefab。正式建筑可以直接新建派生类。
