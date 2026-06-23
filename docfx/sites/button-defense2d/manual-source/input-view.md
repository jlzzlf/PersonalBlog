# 输入与表现组件

## 模块职责

输入与表现组件属于运行时场景组件，主要负责把输入、游戏状态和场景表现连接起来。它们通常不作为业务流程入口，只读取系统状态或调用轻量表现方法。

## `CursorInputController`

### 协作关系

| 依赖接口 | 用途 |
| --- | --- |
| `InputService.PointPosition` | 读取当前指针屏幕坐标 |
| `GameStateModel.StateChanged` | 根据游戏状态切换光标显示 |
| `GridQueryService.World2Cell` | 把世界坐标转换为格子 |
| `GridQueryService.GridCenter2World` | 把格子转换为光标世界坐标 |

### 行为边界

`CursorInputController` 做的事情：

- 在 `Awake` 中获取或使用 Inspector 绑定的 `InputService`、`GridQueryService`、相机和光标对象。
- 监听 `GameStateModel.StateChanged`。
- 当状态为 `Preparing`、`Playing` 或 `Paused` 时显示光标。
- 每帧把鼠标所在网格格心设置为光标位置。

它不做的事情：

- 不处理建造、拆除或点击业务。
- 不改变游戏状态。
- 不直接调用 `BuildSystem`。

公开接口只有 `GetArchitecture()`，用于让组件通过 JLZFramework 扩展方法访问 `GameArchitecture`。

### 使用约定

- 场景中需要绑定或能自动找到 `InputService.Instance`、`GridQueryService.Instance` 和 `Camera.main`。
- 光标对象或 Prefab 应在 Inspector 中配置。
- 如果新增建造输入逻辑，应新建输入业务组件调用 `BuildSystem`，不要把业务塞进光标表现组件。

## `DontTouchButtonView`

### 协作关系

| 调用方 | 调用接口 | 目的 |
| --- | --- | --- |
| 场景摆放或按钮表现逻辑 | `SetPosition(Vector3 position)` | 移动按钮表现对象 |

### `SetPosition`

| API | 用途 |
| --- | --- |
| `SetPosition(Vector3 position)` | 设置按钮视图 Transform 的世界坐标 |

约定：

- 该组件只负责表现位置，不处理按钮血量。
- 按钮扣血和失败判断通过 `ButtonSystem` 完成。
- 如果后续按钮有动画、受击表现或状态显示，可以在该 View 上扩展表现接口，但不要让 View 推进游戏流程。
