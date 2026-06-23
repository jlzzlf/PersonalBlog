# 资源、按钮与奖励

## 模块职责

这三个模块为流程层提供数值和阶段接口：

- `ResourceSystem` / `ResourceModel` 管理本局电量。
- `ButtonSystem` 管理按钮剩余血量，并在耗尽时通知流程失败。
- `RewardSystem` 预留奖励选择流程入口；当前仍是占位实现。

它们都由 `GameFlowSystem` 在一局开始和波次结束时调度。

## 资源模块

### 协作关系

| 调用方 | 调用接口 | 目的 |
| --- | --- | --- |
| `GameFlowSystem.StartGame` | `ResourceSystem.BeginRun(context.InitialPower)` | 新局初始化电量 |
| 建造、技能、奖励等消耗模块 | `ResourceModel.TrySpendPower` | 尝试扣除电量 |
| 奖励、拾取、结算等产出模块 | `ResourceModel.AddPower` | 增加电量 |
| UI | `ResourceModel.Power` | 显示当前电量 |

### `ResourceSystem`

| API | 模块内用途 |
| --- | --- |
| `BeginRun(int initialPower)` | 新局开始时把初始电量写入 `ResourceModel` |

约定：

- `BeginRun` 是流程初始化入口，不做具体消费逻辑。
- 运行中修改电量应直接走 `ResourceModel`，或后续补充更明确的资源业务方法。

### `ResourceModel`

| API | 模块间用途 | 规则 |
| --- | --- | --- |
| `int Power` | 读取当前电量 | 只读 |
| `ResetPower(int initialPower)` | 重置电量 | 限制在 `0..999` |
| `AddPower(int value)` | 增加电量 | 结果限制在 `0..999` |
| `bool TrySpendPower(int value)` | 尝试扣除电量 | `value < 0` 或余额不足时返回 `false` |

建造模块消耗资源时的推荐形态：

```csharp
ResourceModel resource = this.GetModel<ResourceModel>();

if (!resource.TrySpendPower(cost))
{
    return false;
}

// 再执行具体建造逻辑
```

如果扣费后后续逻辑可能失败，需要调用方自己处理回滚或调整调用顺序。

## 按钮模块

### 协作关系

| 调用方 | 调用接口 | 目的 |
| --- | --- | --- |
| `GameFlowSystem.StartGame` | `ButtonSystem.BeginRun(context.ButtonHp)` | 新局初始化按钮血量 |
| `LittleManController` | `ButtonSystem.NotifyButtonPressed(config.buttonPressDamage)` | 角色抵达按钮后造成伤害 |
| `GameFlowSystem.OnButtonDepleted` | 订阅 `ButtonDepleted` | 按钮耗尽后进入失败 |
| UI | `RemainingButtonHp` | 显示按钮剩余血量 |

### `ButtonSystem`

| API | 模块间用途 | 规则 |
| --- | --- | --- |
| `event Action ButtonDepleted` | 通知按钮血量耗尽 | 从正数降到 0 时触发 |
| `int RemainingButtonHp` | 读取剩余按钮血量 | 只读 |
| `BeginRun(int buttonHp)` | 新局初始化按钮血量 | 最小为 1 |
| `NotifyButtonPressed(int damage = 1)` | 按钮受到一次按压伤害 | `damage <= 0` 或已耗尽时无效果 |

约定：

- 角色、陷阱或调试逻辑需要造成按钮伤害时，只调用 `NotifyButtonPressed`。
- `GameFlowSystem` 负责监听 `ButtonDepleted` 并调用 `EndGame()`，按钮模块不直接操作流程状态。
- 如果后续按钮有护盾、免疫或特殊规则，应优先扩展 `ButtonSystem`，不要让角色脚本直接判断失败条件。

## 奖励模块

### 协作关系

| 调用方 | 调用接口 | 当前行为 |
| --- | --- | --- |
| `GameFlowSystem.StartGame` | `RewardSystem.CancelSelection()`、`RewardSystem.BeginRun()` | 清理/初始化奖励状态，目前为空实现 |
| `GameFlowSystem.OnWaveCleared` | `RewardSystem.TryBeginSelection(currentWave)` | 当前固定返回 `false` |
| `GameFlowSystem.SelectReward` | `RewardSystem.TryApplySelection(rewardId)` | 当前固定返回 `false` |

### `RewardSystem`

| API | 设计用途 | 当前约束 |
| --- | --- | --- |
| `BeginRun()` | 新局清理已获得奖励、候选奖励和随机池状态 | 还未实现 |
| `CancelSelection()` | 取消当前奖励候选 | 还未实现 |
| `bool TryBeginSelection(int completedWave)` | 波次结束后尝试生成奖励候选 | 当前固定返回 `false` |
| `bool TryApplySelection(string rewardId)` | 应用玩家选择的奖励 | 当前固定返回 `false` |

流程约定：

- `GameFlowSystem` 根据 `TryBeginSelection` 返回值决定是否进入 `RewardSelecting`。
- 当前版本奖励不会中断波次流程，波次结束后会直接进入下一波备战。
- 后续实现奖励 UI 时，UI 应通过 `GameFlowSystem.SelectReward(rewardId)` 回到流程层，不要直接调用 `RewardSystem.TryApplySelection` 后自行推进状态。
