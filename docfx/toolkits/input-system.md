# Input System 通用输入模块

## 模块职责

提供 Unity Input System 的项目模板、初始化检查窗口、输入配置资产和运行时输入服务。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/InputSystem通用输入模块`
- 运行时/编辑器：运行时 + Editor
- 主要程序集：`InputTemplate`

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `InputSystemSetupWindow` | 检查并修复 Input System 模板配置 | 开发者通过 Unity 菜单打开 |
| `InputConfig` | 保存输入资产、启动 ActionMap 和重绑定配置 | `InputService` |
| `InputService` | 暴露缓存输入值、输入事件和 ActionMap 控制方法 | 游戏业务脚本 |

## 对外 API

| API | 用途 | 调用规则 |
| --- | --- | --- |
| `InputService.Instance` | 获取场景输入服务 | 场景中需要有一个挂载了 `InputService` 的对象 |
| `InputService.Move` / `Look` / `PointPosition` | 获取缓存输入值 | 适合在 Update 中读取当前状态 |
| `InputService.JumpPerformed` / `InteractPerformed` / `PressPerformed` | 订阅离散输入事件 | 订阅方负责在销毁时取消订阅 |
| `EnableMap` / `DisableMap` / `SwitchToOnlyMap` | 控制 ActionMap 启用状态 | 需要统一管理调用方，避免多个系统互相抢状态 |

## 注意事项

- `InputService` 是 MonoBehaviour，需要挂载在场景对象或常驻启动 Prefab 上。
- 使用该模块的业务程序集需要引用输入模块程序集。
- `InputTemplate.asmdef` 需要引用 `Unity.InputSystem`。
- 新增 Action 后需要在 `.inputactions` 里重新生成 C# 类，再在 `InputConfig` 和 `InputService` 的本地化入口补项目需要的字段、属性或事件。
- `DefaultInputActions.cs` 是生成代码，不要手写修改。
