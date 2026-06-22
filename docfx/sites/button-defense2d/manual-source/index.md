# Grid 系统文档样例

这是 ButtonDefense2D 的第一份项目文档。它以 `Assets/Project/Runtime/Core/Grid` 为范围，说明项目手册与 API Reference 如何配合。

## 从哪里开始

对外查询网格、建造和移动规则时，优先通过 `GridQueryService.Instance`。它聚合了网格大小、坐标转换、可通行性与建筑放置查询，避免调用方直接依赖各个内部 Layer。

## 文档结构

- [Grid 系统](grid-system.md)：解释职责、坐标规则和最小调用方式。
- 左侧目录的 API Reference：由 `Game.csproj` 中的 XML 注释自动生成。

> 当前 API Reference 会包含 `Game` 程序集的公开类型；这只是项目文档的起点。以后项目拆分出更细的程序集时，每个程序集都可以按需单独生成和归档。
