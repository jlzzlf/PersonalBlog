---
title: 'Unity异步避坑指南'
description: '以我迁移《合成守卫战》资源加载流程时踩到的问题为起点，整理一套 Unity 异步、Addressables、WebGL、UniTask 相关的学习笔记。'
category: '学习记录'
tags:
  - Unity
  - 学习记录
  - async
  - WebGL
pubDate: '2026-05-18'
---

# Unity异步避坑指南

> 以我迁移《合成守卫战》资源加载流程时踩到的问题为起点，整理一套 Unity 异步、Addressables、WebGL、UniTask 相关的学习笔记。

## 1. 从 Resources 迁移到 Addressables

最近在开发过程中遇到了一些问题。在这里做个记录吧。

项目背景大概是这样：

- Unity 2D 竖屏塔防小游戏；
- 资源包括关卡配置、地图 Prefab、怪物 Prefab、炮塔 Prefab、子弹、特效、音频、UI 图标等；
- 原来为了快速开发，很多地方用 `Resources.Load` 占位；
- 后面要面向 WebGL / 微信小游戏 / 抖音小游戏方向；
- 资源要通过 Addressables + CDN 按需下载；
- 战斗中怪物、子弹、特效等频繁生成对象后续会接对象池。  

我需要将所有使用Resources里占位的地方都替换成Addressables加载

```text
Resources.Load
    ↓
Addressables.LoadAssetAsync
```

---

## 2. 我一开始的 Addressables 封装

我试着写了一个Addressable资源加载工具：

```csharp
public class AddressableResourceUtility : IResourceUtility
{
    public async Task<T> LoadAssetAsync<T>(string key) where T : Object
    {
        var handle = Addressables.LoadAssetAsync<T>(key);
        return await handle.Task;
    }

    public async Task<GameObject> InstantiateAsync(
        string key,
        Vector3 position,
        Quaternion rotation,
        Transform parent = null)
    {
        var handle = Addressables.InstantiateAsync(key, position, rotation, parent);
        return await handle.Task;
    }

    public void Release(Object asset)
    {
        Addressables.Release(asset);
    }
}
```

这个封装有个问题在这里：

```csharp
await handle.Task;
```

这个 `handle.Task` 在 WebGL 下不可用。

---

## 3. `handle.Task` 有什么问题？

Addressables 的加载返回的是 `AsyncOperationHandle`。

它本身可以通过多种方式等待：

```csharp
// 方式一：Task
await handle.Task;

// 方式二：协程
yield return handle;

// 方式三：Completed 回调
handle.Completed += OnLoaded;
```

WebGL 出问题的是第一种：

```csharp
await handle.Task;
```

下面两种方式仍然是可行的：

```csharp
handle.Completed += operation =>
{
    var result = operation.Result;
};
```

或者：

```csharp
var handle = Addressables.LoadAssetAsync<GameObject>(key);
yield return handle;

var prefab = handle.Result;
```

所以不是：

```text
Addressables 不支持 WebGL。
```

更准确的说法是：

```text
AsyncOperationHandle.Task 在 WebGL平台上不可用
```

---

## 4. 第一个误区：异步不等于多线程

一个异步方法可以完全不创建新线程，例如：

```csharp
public async Task LoadAsync()
{
    await SomeNonThreadOperation();
}
```

`await` 的本质是：

```text
执行到 await
    ↓
如果异步操作没有完成，当前方法先让出去
    ↓
记录后续要执行的位置
    ↓
等异步操作完成后，再继续执行 await 后面的代码
```

这更像是“切流程”，不是“开线程”。

例如游戏里加载资源时：

```text
主线程发起加载请求
    ↓
这一帧先返回，不阻塞画面
    ↓
Unity / 浏览器底层继续推进下载与加载
    ↓
完成后回到主线程继续执行逻辑
```

所以：

```text
异步 = 不阻塞当前流程
多线程 = 把代码放到其他线程执行
```

这两个概念有关联，但不是一回事。

---

## 5. 第二个误区：Task 不一定开线程，但 Task 生态和线程池关系很深

> 我们使用异步加载时完全没有开多线程，但 `handle.Task` 依然不可用。为什么 Task 的设计一定会依赖线程池？

因为：

```text
Task 本身不一定开线程。
但 .NET 的 Task 生态和线程池、TaskScheduler、SynchronizationContext 关系很深。
```

标准 .NET 的 Task 体系里还包括：

```text
Task.Run
TaskScheduler
ThreadPool
ContinueWith
Task.WhenAll
Task.Wait
Task.Result
SynchronizationContext
```

这些东西在 .NET 环境里很强大，但在 Unity WebGL 这种浏览器单线程环境里就会变得麻烦。

因此官方干脆说：

```text
AsyncOperationHandle.Task 在 WebGL 不可用。
```

而不是让开发者在各种 Task 组合行为里踩更隐蔽的坑。

---

## 6. 方案选择：Completed、Coroutine、TaskCompletionSource、UniTask

我在这个问题上实际面对过四种选择。

---

### 方案一：直接用 Completed 回调

示例：

```csharp
public void LoadAsset<T>(string key, Action<T> onSuccess) where T : Object
{
    var handle = Addressables.LoadAssetAsync<T>(key);

    handle.Completed += operation =>
    {
        if (operation.Status == AsyncOperationStatus.Succeeded)
        {
            onSuccess?.Invoke(operation.Result);
        }
        else
        {
            Debug.LogError($"加载失败: {key}");
        }
    };
}
```

---

### 方案二：用协程

示例：

```csharp
private IEnumerator LoadLevelFlow(int levelId)
{
    var handle = Addressables.LoadAssetAsync<LevelConfig>(
        $"Config/Level/Level_{levelId:000}"
    );

    yield return handle;

    if (handle.Status != AsyncOperationStatus.Succeeded)
    {
        Debug.LogError("关卡配置加载失败");
        yield break;
    }

    LevelConfig config = handle.Result;
}
```

---

### 方案三：TaskCompletionSource 保留 Task 外壳

我一度考虑：

```text
方法继续返回 Task<T>，但内部不用 handle.Task。
```

示例：

```csharp
public Task<T> LoadAssetAsync<T>(string key) where T : Object
{
    var tcs = new TaskCompletionSource<T>();

    var handle = Addressables.LoadAssetAsync<T>(key);

    handle.Completed += operation =>
    {
        if (operation.Status == AsyncOperationStatus.Succeeded)
        {
            tcs.TrySetResult(operation.Result);
        }
        else
        {
            Addressables.Release(operation);
            tcs.TrySetException(new Exception($"加载失败: {key}"));
        }
    };

    return tcs.Task;
}
```

这确实避开了：

```csharp
await handle.Task;
```

但它仍然把我的项目留在标准 `Task` 体系里。

理论上可行，但如果项目目标明确包含 WebGL / 小游戏，我更倾向于不要继续在资源加载主链路里依赖标准 Task。

---

### 方案四：UniTask

这是我最后更倾向的方案。

```csharp
using Cysharp.Threading.Tasks;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public async UniTask<GameObject> LoadPrefabAsync(string key)
{
    AsyncOperationHandle<GameObject> handle =
        Addressables.LoadAssetAsync<GameObject>(key);

    await handle;

    if (handle.Status != AsyncOperationStatus.Succeeded)
    {
        Addressables.Release(handle);
        Debug.LogError($"加载失败: {key}");
        return null;
    }

    return handle.Result;
}
```


---

## 7. UniTask 到底解决了什么

UniTask 不是专门为了 Addressables 出现的。

它解决的是 Unity 异步开发里的几个长期问题。

### 7.1 协程返回值不舒服

协程写法：

```csharp
IEnumerator Load()
{
    yield return ...;
}
```

它不能像普通方法一样自然地：

```csharp
return prefab;
```

也不能自然地：

```csharp
try
{
    await LoadAsync();
}
catch
{
}
```

---

### 7.2 回调容易套娃

Completed 回调简单时很好用：

```csharp
LoadA(() => Debug.Log("A loaded"));
```

但加载一关时可能变成：

```text
DownloadDependencies 完成
    -> LoadLevelConfig 完成
        -> LoadMap 完成
            -> LoadEnemies 完成
                -> LoadBullets 完成
                    -> StartBattle
```

这会让流程很不清楚。

---

### 7.3 标准 Task 不贴合 Unity

标准 Task 更偏 .NET 通用世界。

Unity 的很多异步对象不是标准 Task：

```text
AsyncOperation
ResourceRequest
AssetBundleRequest
UnityWebRequestAsyncOperation
AsyncOperationHandle
```

UniTask 给这些 Unity 异步对象提供了 await 支持。

---

### 7.4 GC 和性能问题

`Task<T>` 是引用类型，很多时候会有额外分配。

UniTask 是更轻量的结构体异步类型，目标之一就是减少 Unity 项目里的异步 GC 压力。

---

## 8. UniTask 从底层为什么适合 WebGL

底层关键不是：

```text
UniTask 让 WebGL 支持了多线程。
```

而是：

```text
UniTask 不依赖多线程来驱动大多数 Unity 异步流程。
```

Unity 每帧都会跑 PlayerLoop：

```text
Initialization
EarlyUpdate
FixedUpdate
Update
LateUpdate
PostLateUpdate
```

UniTask 把自己的调度接进 PlayerLoop。

所以当我写：

```csharp
await UniTask.Yield();
```

它不是开一个新线程，而是：

```text
当前帧先让出去
    ↓
下一次 PlayerLoop 到指定阶段
    ↓
继续执行 await 后面的代码
```

当我写：

```csharp
await handle;
```

它不是在等 `handle.Task`，而是 UniTask 对 `AsyncOperationHandle` 做了 await 适配。

可以把它理解为更像：

```csharp
yield return handle;
```

或者：

```csharp
handle.Completed += ...;
```

只是写法变成了：

```csharp
await handle;
```

所以它能避开 WebGL 下 `AsyncOperationHandle.Task` 不可用的问题。

但是 UniTask 也有边界。

这些不要在 WebGL / 小游戏方向使用：

```csharp
await Task.Run(...);
await UniTask.SwitchToThreadPool();
await UniTask.RunOnThreadPool(...);
handle.WaitForCompletion();
```

这些写法要么依赖线程池，要么同步阻塞主线程。



