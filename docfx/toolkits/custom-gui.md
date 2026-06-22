# 自定义 GUI

## 模块职责

封装一组基于 Unity IMGUI 的简单控件和统一绘制根节点。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/自定义GUI`
- 运行时/编辑器：运行时

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `CustomGUIRoot` | 收集并绘制子对象中的控件 | 场景中的 GUI 根对象 |
| `CustomGUIControl` | 控件基类 | 各具体控件继承 |
| `CustomGUIPos` | 计算控件矩形位置 | 控件序列化字段 |
| `CustomButton` / `CustomGUILabel` / `CustomGUIInput` / `CustomGUISlider` / `CustomGUIToggle` / `CustomGUITexture` | 具体 IMGUI 控件 | 场景对象 |
| `CustomGUIToggleGroup` | 管理一组 Toggle 的单选状态 | Toggle 组根对象 |

## 注意事项

- 该模块基于 IMGUI，适合工具、调试面板或历史界面，不建议作为新正式 UI 的默认方案。
- `CustomGUIRoot` 通过 OnGUI 绘制子控件，控件对象需要放在它的子层级下。
- 控件位置使用屏幕九宫格对齐和偏移计算。
