# Grid 系统

Grid 系统负责将世界坐标映射为格子坐标，并统一提供建造与移动查询。当前代码位于 `Assets/Project/Runtime/Core/Grid`。

## 主要职责

- `GridMap`：维护网格宽高、范围判断与格子索引转换。
- `GridMapper`：在世界坐标和 `Cell` 坐标之间转换。
- `GridQueryService`：对外的查询入口，负责可建造、可移动、建筑物和地形查询。
- `TerrainLayer` 与 `BuildingLayer`：分别提供地形和建筑占用的底层判断。

## 最小调用方式

```csharp
GridQueryService grid = GridQueryService.Instance;
Cell cell = grid.World2Cell(worldPosition);

if (grid.CanBuild(cell))
{
    // 在这个格子执行建造逻辑
}
```

## 坐标约定

`Grid2World` 返回单元格的左下角坐标；需要放置物体在格子中央时，使用 `GridCenter2World`。`World2Cell` 会按单元格大小向下取整得到所属格子。

## 移动与建造

- `CanWalk` 判断目标格是否可移动。
- `CanWalkThrough` 额外处理八方向移动，并阻止斜向切角穿墙。
- `CanBuild` 同时检查地形、建筑阻挡和临时建造阻挡标记。
- `SetBuildBlocker` 与 `ClearBuildBlocker` 可为预览、单位或其他拥有者登记临时建造阻挡。

具体签名、参数与 XML 描述请从左侧目录最后的 API Reference 进入查看。
