# 优先级队列

## 模块职责

提供最小优先级队列。优先级比较结果越小，越早出队。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/优先级队列`
- 运行时/编辑器：运行时

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `PriorityQueue<TElement, TPriority>` | 管理按优先级排序的元素集合 | 需要最小堆队列的系统 |

## 对外 API

| API | 用途 | 调用规则 |
| --- | --- | --- |
| `Enqueue` | 加入元素和优先级 | `TPriority` 需要可比较，或传入自定义比较器 |
| `Dequeue` / `TryDequeue` | 移除队首元素 | 空队列时优先使用 `TryDequeue` 避免异常 |
| `Peek` / `TryPeek` | 读取队首元素但不移除 | 空队列时优先使用 `TryPeek` 避免异常 |
| `Clear` | 清空队列 | 不会释放队列对象本身 |

## 注意事项

- 相同优先级不保证先进先出。
- 默认比较器来自 `Comparer<TPriority>.Default`。
