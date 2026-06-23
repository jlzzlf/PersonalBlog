# Game 程序集内部接口文档

## 文档定位

这里记录 `Game` 程序集内部各运行时模块之间的调用接口和使用约定。

不展开的内容：

- 私有方法、内部算法和具体实现过程。
- JLZFramework 本身的框架机制。
- Grid 模块的完整文档。其他模块依赖 `Cell`、`GridQueryService`、`IFlowField` 时，只说明协作边界。
- Gizmos、开发者调试面板、过时目录里的旧接口。

## 模块协作总览

| 调用方                  | 主要被调用接口                                                                                                                                                                 | 作用                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `GameBoot`              | `GameFlowSystem.ConfigureScene`、`GameFlowSystem.StartGame`、`FlowFieldService.GiveBuilderQuery`、`FlowFieldService.RebuildDirtyFields`                                        | 连接场景引用并启动/维护运行时          |
| `GameFlowSystem`        | `GameRuntimeModel`、`GameStateModel`、`LevelPointSystem`、`BuildSystem`、`FlowFieldService`、`WaveSystem`、`RewardSystem`、`CharacterSystem`、`ResourceSystem`、`ButtonSystem` | 游戏主流程编排                         |
| `BuildSystem`           | `GridQueryService`、`GridEventService`、`BuildRuntimeModel`                                                                                                                    | 放置/拆除建筑并通知网格可行走性变化    |
| `WaveSystem`            | `LevelPointSystem`、`CharacterSystem`、`GameSceneContext`、`IFlowField`                                                                                                        | 开波、生成角色、统计波次结束           |
| `CharacterSystem`       | `LittleManController.Initialize`、`LittleManController.Removed`                                                                                                                | 生成角色并维护活跃角色集合             |
| `LittleManController`   | `FlowFieldPathProvider`、`GridQueryService`、`ButtonSystem`、`CharacterRuntimeModel`                                                                                           | 单个角色移动、阻挡建造、按压按钮并离场 |
| `CursorInputController` | `InputService`、`GameStateModel`、`GridQueryService`                                                                                                                           | 根据游戏状态显示网格光标               |

## 文档列表

- [场景启动与游戏流程](scene-flow.md)
- [资源、按钮与奖励](resources-button-reward.md)
- [建造系统](build.md)
- [角色系统](characters.md)
- [波次系统](waves.md)
- [输入与表现组件](input-view.md)

## 内部调用约定

- 流程推进优先通过 `GameFlowSystem`，不要让 UI、输入或角色脚本各自修改多个系统状态。
- 运行时状态由 Model 保存；跨模块读取可以读 Model，跨模块写入优先走对应 System。
- 会影响可行走性或可建造性的操作必须通过 `BuildSystem` 或 `GridQueryService` 的约定接口，并触发布局变化通知。
- 角色生成优先走 `WaveSystem` 或 `CharacterSystem`，角色移除优先调用 `LittleManController.Despawn()`。
- `RewardSystem` 当前仍是占位实现，流程文档按现有返回行为描述，不把未来计划写成已完成接口。
