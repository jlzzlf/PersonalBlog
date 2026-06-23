# 波次系统

## 模块职责

波次系统负责在流程层进入 `Playing` 后管理本波运行状态、生成角色、统计待生成数量和存活数量，并在波次清空时通知 `GameFlowSystem`。

它不负责决定下一阶段进入奖励、备战、胜利或失败，这些由 `GameFlowSystem` 处理。

## 协作关系

| 调用方 | 调用接口 | 目的 |
| --- | --- | --- |
| `GameFlowSystem.StartGame` | `BeginRun(context, buttonFlowField)` | 初始化本局波次上下文 |
| `GameFlowSystem.StartCurrentWave` | `TryStartWave(runtimeModel.CurrentWave)` | 开始当前流程波次 |
| 调试工具或刷怪逻辑 | `TrySpawnCharacter` / `TrySpawnCharacters` | 在运行中波次生成角色 |
| `WaveSystem` | `LevelPointSystem.GetSpawnCell` | 获取出生格 |
| `WaveSystem` | `CharacterSystem.Spawn` | 实际生成角色 |
| `CharacterSystem` | `CharacterRemoved` 事件 | 角色离场后通知波次统计 |
| `GameFlowSystem` | 订阅 `WaveCleared` | 波次结束后推进流程 |

## `WaveSystem`

跨模块接口：

| API | 模块间用途 | 调用约束 |
| --- | --- | --- |
| `event Action WaveCleared` | 通知本波已清空 | `pending == 0` 且 `alive == 0` 时触发 |
| `bool IsWaveRunning` | 当前是否有运行中波次 | 只读 |
| `int CurrentWave` | 波次系统当前运行波次 | 只读 |
| `BeginRun(GameSceneContext context, IFlowField flowField)` | 初始化场景上下文和目标流场 | 新局开始时调用 |
| `bool TryStartWave(int waveIndex)` | 启动指定波次 | 已初始化、无运行中波次、上下文有效时成功 |
| `BeginSpawning(int totalCharacterCount)` | 设置本波预计生成数量 | 波次运行中调用 |
| `bool TrySpawnCharacter(LittleManController characterPrefab, int spawnIndex)` | 生成单个角色 | 波次运行中且 Prefab 有效 |
| `bool TrySpawnCharacters(LittleManController characterPrefab, int characterCount)` | 批量生成角色 | 会先调用 `BeginSpawning(characterCount)` |
| `NotifyCharacterSpawned()` | 告诉波次系统有角色已生成 | 自定义生成流程使用 |
| `NotifyCharacterRemoved()` | 告诉波次系统有角色离场 | 默认由 `CharacterSystem.CharacterRemoved` 驱动 |
| `StopWave()` | 停止当前波次并清空统计 | 失败、胜利、新局重置 |

## 开波与生成约定

`GameFlowSystem.StartCurrentWave()` 是正式开波入口。它会先刷新脏流场，再把状态切到 `Playing`，最后调用 `WaveSystem.TryStartWave`。

当前 `TryStartWave` 只切换运行状态和重置统计，不会自动读取波次配置或生成敌人。因此测试刷怪需要在开波后主动调用生成接口。

批量生成推荐：

```csharp
if (waveSystem.TryStartWave(waveIndex))
{
    waveSystem.TrySpawnCharacters(characterPrefab, count);
}
```

自定义分批生成推荐：

```csharp
waveSystem.BeginSpawning(totalCount);

// 每次真正生成一个角色时：
waveSystem.TrySpawnCharacter(characterPrefab, spawnIndex);
```

注意：

- `TrySpawnCharacters` 会自动设置待生成数量，适合一次性生成。
- 如果使用 `TrySpawnCharacter` 做分批生成，调用方需要先 `BeginSpawning(totalCount)`。
- `NotifyCharacterSpawned` 会减少待生成数量并增加存活数量。
- `NotifyCharacterRemoved` 会减少存活数量并尝试结束波次。
- `BeginSpawning(0)` 会立即尝试结束波次。

## 波次结束

波次结束条件：

- 当前处于运行中。
- 待生成数量为 0。
- 存活角色数量为 0。

满足条件后：

1. `IsWaveRunning` 设为 `false`。
2. 触发 `WaveCleared`。
3. `GameFlowSystem` 接收事件后决定进入奖励选择、下一波备战或胜利。

约定：

- 其他模块不要监听 `WaveCleared` 后自行推进主状态。
- 如果只是 UI 表现，可以监听该事件显示结果，但状态推进仍交给 `GameFlowSystem`。
