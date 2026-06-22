# 单例模式基类（不推荐）

## 模块职责

提供历史遗留的单例基类，包括普通 C# 单例、懒加载单例和 MonoBehaviour 单例。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/单例模式基类（不推荐）`
- 运行时/编辑器：运行时

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `SingletonBase<T>` | 立即创建的普通 C# 单例 | 历史代码 |
| `SingletonLazy<T>` | 首次访问时创建的普通 C# 单例 | 历史代码 |
| `MonoSingletonBase<T>` | 自动查找或创建 GameObject 的 MonoBehaviour 单例 | 历史代码 |

## 注意事项

- 该模块目录已经标注“不推荐”，新模块优先使用更明确的生命周期管理方式。
- 普通 C# 单例要求派生类提供私有无参构造函数。
- `MonoSingletonBase<T>` 的初始化逻辑应写在 `OnSingletonAwake`，不要直接重写 `Awake`。
