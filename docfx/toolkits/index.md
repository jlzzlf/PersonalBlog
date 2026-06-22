# JLZFramework Toolkits

Toolkits 是 JLZFramework 下的通用工具集合。这里记录每个工具模块的职责、入口类和调用规则，API 细节由 XML 注释生成。

## 模块列表

- [Input System 通用输入模块](input-system.md)
- [事件中心](event-bus.md)
- [优先级队列](priority-queue.md)
- [单例模式基类（不推荐）](singleton-base.md)
- [存档系统 - PlayerPrefs](player-prefs.md)
- [自定义 GUI](custom-gui.md)
- [项目目录生成工具](project-structure-generator.md)
- [可挂载脚本标记](mono-behaviour-project-badge.md)

## 编写约定

- 业务代码只依赖明确的入口类，不直接依赖内部实现。
- Editor 工具只在编辑器程序集内使用，不作为运行时接口。
- 模板型工具需要在项目接入时做本地化改造，文档页应写明改造点。
