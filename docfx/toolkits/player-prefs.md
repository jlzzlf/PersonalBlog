# 存档系统 - PlayerPrefs

## 模块职责

将纯数据对象的 public 字段拆分并保存到 Unity `PlayerPrefs`，读取时按类型和 key 重新组装对象。

## 所属位置

- 代码目录：`Assets/JLZFramework/Toolkits/存档系统/PlayerPrefs`
- 运行时/编辑器：运行时

## 入口类

| 类型 | 职责 | 调用方 |
| --- | --- | --- |
| `PlayerPrefsDataMgr` | 保存和读取基于字段的数据对象 | 需要轻量本地存档的业务模块 |

## 对外 API

| API | 用途 | 调用规则 |
| --- | --- | --- |
| `SaveData` | 保存数据对象 | 数据对象字段不要为 null |
| `LoadData<T>` | 读取并组装数据对象 | 类型结构和字段名需要与保存时一致 |

## 注意事项

- 仅支持 public 字段，不支持属性和 private 字段。
- 重命名类型或字段会改变存档 key，旧数据将无法按原规则读取。
- 复杂存档建议后续迁移到可版本化的序列化方案。
