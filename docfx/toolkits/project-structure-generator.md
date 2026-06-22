# 项目目录生成工具

## 模块职责

在 Unity Editor 中生成标准项目目录结构，并为 Runtime 目录创建程序集定义文件。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/项目目录生成工具`
- 运行时/编辑器：Editor

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `ProjectStructureGeneratorWindow` | 提供目录模板编辑和生成按钮 | 开发者通过 Unity 菜单打开 |
| `ProjectStructureGenerator` | 执行目录和 asmdef 生成 | EditorWindow 或其他编辑器工具 |
| `ProjectStructureTemplate` | 保存根目录、基础命名空间和目录列表 | 生成器 |

## 注意事项

- 菜单入口：`Tools/Project/项目结构生成工具`。
- 目录路径相对生成的项目根目录。
- 生成器会跳过已经存在的目录和 asmdef 文件。
