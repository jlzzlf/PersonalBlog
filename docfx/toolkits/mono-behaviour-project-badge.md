# 可挂载脚本标记

## 模块职责

在 Unity Project 窗口中给 MonoBehaviour 脚本绘制 `MB` 标记，帮助区分可挂载脚本和 MonoBehaviour 基类。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/可挂载脚本标记`
- 运行时/编辑器：Editor

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `MonoBehaviourProjectBadgeDrawer` | 监听 Project 窗口绘制事件并显示脚本标记 | Unity Editor 自动调用 |

## 注意事项

- 该模块通过 `InitializeOnLoad` 自动注册，无需手动挂载。
- 可挂载脚本和不可直接挂载的 MonoBehaviour 基类会使用不同底色。
