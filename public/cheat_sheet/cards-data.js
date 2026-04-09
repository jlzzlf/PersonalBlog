window.CHEAT_SHEET_CARDS = [
  {
    id: "basic-types",
    title: "变量与基础类型",
    category: "基础",
    type: "list",
    content: [
      "`int`、`long`、`float`、`double`、`decimal`、`bool`、`char`、`string` 是最常用基础类型。",
      "`float` 字面量常写成 `3.5f`，`decimal` 常写成 `12.5m`。",
      "`var` 只是编译期类型推断，变量本身仍然是强类型。",
      "值类型通常直接存值，引用类型通常存对象引用。",
      "局部变量必须先赋值再使用，字段会有默认值。",
      "`const` 是编译期常量，`readonly` 是运行期只读。"
    ]
  },
  {
    id: "literal-cast-convert",
    title: "字面量、转换与装箱",
    category: "基础",
    type: "list",
    content: [
      "隐式转换用于安全扩大型转换，例如 `int -> long`。",
      "显式转换用于可能丢失信息的转换，例如 `(int)3.9`。",
      "`Convert.ToInt32()`、`int.Parse()`、`int.TryParse()` 各有不同使用场景。",
      "值类型转为 `object` 会发生装箱，反向取回时会拆箱。",
      "频繁装箱会产生额外分配与性能损耗。",
      "涉及用户输入时，优先用 `TryParse`，更稳。"
    ]
  },
  {
    id: "value-ref-null",
    title: "值类型 vs 引用类型",
    category: "基础",
    type: "compare",
    content: {
      leftTitle: "值类型",
      rightTitle: "引用类型",
      rows: [
        { label: "常见类型", left: "`int`、`float`、`bool`、`struct`", right: "`class`、数组、`string`、委托" },
        { label: "变量保存", left: "通常直接保存数据本身", right: "通常保存对象引用" },
        { label: "赋值行为", left: "复制值", right: "复制引用地址" },
        { label: "默认值", left: "有具体默认值", right: "默认一般为 `null`" },
        { label: "可空性", left: "需 `T?` 才可空", right: "默认可为 `null`" }
      ]
    }
  },
  {
    id: "var-dynamic-object",
    title: "var vs dynamic vs object",
    category: "基础",
    type: "compare",
    content: {
      leftTitle: "关键点",
      rightTitle: "说明",
      rows: [
        { label: "`var`", left: "编译期推断类型", right: "写起来短，仍然是强类型" },
        { label: "`dynamic`", left: "运行期再绑定成员", right: "灵活但缺少编译期检查" },
        { label: "`object`", left: "所有类型的基类引用", right: "使用前常需强转或模式匹配" },
        { label: "推荐场景", left: "`var` 适合右值明显时", right: "`dynamic` 仅少数互操作场景再用" },
        { label: "风险", left: "`var` 风险低", right: "`dynamic` 容易把错误拖到运行期" }
      ]
    }
  },
  {
    id: "operators-null",
    title: "常用运算符与空判断",
    category: "基础",
    type: "list",
    content: [
      "算术运算符：`+ - * / %`。",
      "比较运算符：`== != > < >= <=`。",
      "逻辑运算符：`&& || !`，注意短路行为。",
      "空合并：`a ?? b`，左边不为空就取左边。",
      "空合并赋值：`a ??= new Foo()`。",
      "空条件访问：`obj?.Method()`、`arr?[0]`。",
      "模式判断：`obj is Player p` 常比手写强转更安全。"
    ]
  },
  {
    id: "if-switch-pattern",
    title: "if / switch / 模式匹配",
    category: "流程控制",
    type: "list",
    content: [
      "`if / else if / else` 适合范围判断与组合条件。",
      "`switch` 适合离散值分支，结构更清楚。",
      "现代 C# 支持 `switch expression`，可直接返回值。",
      "模式匹配可配合 `is`、`switch`、`when` 使用。",
      "多分支逻辑优先保持“每个分支只做一件事”。",
      "过深嵌套时，先考虑提前返回。"
    ]
  },
  {
    id: "loop-control",
    title: "循环与跳转",
    category: "流程控制",
    type: "list",
    content: [
      "`for` 适合需要下标的场景。",
      "`foreach` 适合只读遍历，代码更简洁。",
      "`while` 适合“条件满足就继续”的循环。",
      "`do...while` 至少会执行一次。",
      "`break` 结束当前循环，`continue` 跳过本轮。",
      "遍历集合时修改集合本身，常会抛异常或产生逻辑问题。"
    ]
  },
  {
    id: "method-basics",
    title: "方法定义与返回",
    category: "方法",
    type: "list",
    content: [
      "方法签名通常包含：访问修饰符、返回类型、方法名、参数列表。",
      "`void` 表示没有返回值。",
      "方法名优先使用动词短语，例如 `MoveTo`、`ApplyDamage`。",
      "参数太多时，先思考是否该封装成对象。",
      "返回值应尽量表达结果，不要让调用者猜。",
      "保持方法短小，职责单一。"
    ]
  },
  {
    id: "param-modes",
    title: "ref / out / in / params",
    category: "方法",
    type: "compare",
    content: {
      leftTitle: "关键字",
      rightTitle: "说明",
      rows: [
        { label: "`ref`", left: "按引用传递，调用前必须赋值", right: "方法内可读可改原变量" },
        { label: "`out`", left: "按引用输出，调用前可不赋值", right: "方法内必须赋值后再返回" },
        { label: "`in`", left: "按只读引用传递", right: "避免大结构复制，但方法内不能改" },
        { label: "`params`", left: "可变参数", right: "调用时可传多个同类型参数" },
        { label: "常见使用", left: "`TryParse(out value)`", right: "工具方法、批量参数传入等" }
      ]
    }
  },
  {
    id: "overload-optional-named",
    title: "重载、可选参数、命名参数",
    category: "方法",
    type: "code",
    content: `public class DamageCalculator
{
    public int Calc(int baseDamage)
    {
        return baseDamage;
    }

    public int Calc(int baseDamage, int bonus)
    {
        return baseDamage + bonus;
    }

    public void Log(string message, bool warning = false, string prefix = "[Game]")
    {
        Console.WriteLine($"{prefix} {message}");
    }

    public void Test()
    {
        int a = Calc(10);
        int b = Calc(10, 5);

        Log("Loaded");
        Log("Low HP", warning: true, prefix: "[Battle]");
    }
}`
  },
  {
    id: "string-common-api",
    title: "String 常用操作",
    category: "字符串",
    type: "api",
    content: [
      { name: "Length", desc: "字符串长度。" },
      { name: "Contains(str)", desc: "是否包含指定子串。" },
      { name: "StartsWith(str)", desc: "是否以指定内容开头。" },
      { name: "EndsWith(str)", desc: "是否以指定内容结尾。" },
      { name: "Substring(start, len)", desc: "截取部分字符串。" },
      { name: "Replace(old, new)", desc: "替换指定内容。" },
      { name: "Trim()", desc: "去掉首尾空白。" },
      { name: "Split(',')", desc: "按分隔符切分字符串。" },
      { name: "ToLower() / ToUpper()", desc: "大小写转换。" },
      { name: "string.Join()", desc: "把集合拼接成字符串。" }
    ]
  },
  {
    id: "string-format",
    title: "字符串插值与格式化",
    category: "字符串",
    type: "code",
    content: `string name = "Alice";
int hp = 95;
float speed = 3.5f;

// 字符串插值
string a = $"Name: {name}, HP: {hp}";

// 组合格式化
string b = string.Format("Speed: {0:F2}", speed);

// 多行原始字符串（C# 11）
string json = """
{
  "name": "Alice",
  "hp": 95
}
""";`
  },
  {
    id: "array-common",
    title: "数组常用知识",
    category: "集合",
    type: "list",
    content: [
      "数组长度固定，声明后不能扩容。",
      "数组通过索引访问，索引从 `0` 开始。",
      "`Length` 获取数组长度。",
      "数组适合元素数量固定、结构稳定的场景。",
      "越界访问会抛 `IndexOutOfRangeException`。",
      "需要频繁增删时，通常更适合 `List<T>`。"
    ]
  },
  {
    id: "list-api",
    title: "List<T> 常用操作",
    category: "集合",
    type: "api",
    content: [
      { name: "Add(item)", desc: "尾部添加元素。" },
      { name: "AddRange(items)", desc: "批量添加元素。" },
      { name: "Insert(index, item)", desc: "在指定位置插入。" },
      { name: "Remove(item)", desc: "移除首个匹配元素。" },
      { name: "RemoveAt(index)", desc: "按下标移除元素。" },
      { name: "Clear()", desc: "清空全部元素。" },
      { name: "Count", desc: "当前元素个数。" },
      { name: "Contains(item)", desc: "是否包含某元素。" },
      { name: "IndexOf(item)", desc: "查找元素索引。" },
      { name: "Sort()", desc: "排序，可配合比较器使用。" }
    ]
  },
  {
    id: "dictionary-api",
    title: "Dictionary<TKey, TValue>",
    category: "集合",
    type: "api",
    content: [
      { name: "dict[key] = value", desc: "新增或覆盖指定键值。" },
      { name: "Add(key, value)", desc: "新增键值，键已存在会抛异常。" },
      { name: "TryGetValue(key, out value)", desc: "安全读取值，推荐高频使用。" },
      { name: "ContainsKey(key)", desc: "判断键是否存在。" },
      { name: "Remove(key)", desc: "删除指定键。" },
      { name: "Keys / Values", desc: "获取所有键或值集合。" },
      { name: "Count", desc: "当前元素数量。" },
      { name: "Clear()", desc: "清空字典。" }
    ]
  },
  {
    id: "set-queue-stack",
    title: "HashSet / Queue / Stack",
    category: "集合",
    type: "compare",
    content: {
      leftTitle: "集合类型",
      rightTitle: "特点",
      rows: [
        { label: "HashSet<T>", left: "无序、不重复", right: "适合去重、快速判断是否存在" },
        { label: "Queue<T>", left: "先进先出 FIFO", right: "适合排队、任务调度" },
        { label: "Stack<T>", left: "后进先出 LIFO", right: "适合回退、撤销、DFS" },
        { label: "List<T>", left: "有序、可扩容", right: "最常用通用集合" },
        { label: "Dictionary<TKey, TValue>", left: "键值映射", right: "适合按 key 快速取值" }
      ]
    }
  },
  {
    id: "for-vs-foreach",
    title: "for vs foreach",
    category: "集合",
    type: "compare",
    content: {
      leftTitle: "for",
      rightTitle: "foreach",
      rows: [
        { label: "适合场景", left: "需要索引、倒序、跳步", right: "只关心元素本身时更清爽" },
        { label: "可读性", left: "略低一些", right: "通常更直观" },
        { label: "修改元素", left: "更容易按索引改", right: "遍历时不适合改集合结构" },
        { label: "性能", left: "多数场景差异不大", right: "优先看可读性与正确性" },
        { label: "推荐", left: "数组、List 索引处理", right: "枚举型只读遍历" }
      ]
    }
  },
  {
    id: "class-vs-struct",
    title: "class vs struct",
    category: "面向对象",
    type: "compare",
    content: {
      leftTitle: "class",
      rightTitle: "struct",
      rows: [
        { label: "类型归属", left: "引用类型", right: "值类型" },
        { label: "默认值", left: "`null`", right: "字段默认值组成的实例" },
        { label: "赋值行为", left: "复制引用", right: "复制整个值" },
        { label: "继承", left: "可继承类", right: "不能继承类，可实现接口" },
        { label: "适合场景", left: "身份明确、生命周期较长的对象", right: "小而轻、不可变或数据块" }
      ]
    }
  },
  {
    id: "field-vs-property",
    title: "字段 vs 属性",
    category: "面向对象",
    type: "compare",
    content: {
      leftTitle: "字段 Field",
      rightTitle: "属性 Property",
      rows: [
        { label: "本质", left: "直接存储数据", right: "通过 `get/set` 控制访问" },
        { label: "封装性", left: "较弱", right: "更强，可插入校验逻辑" },
        { label: "语法", left: "`public int hp;`", right: "`public int Hp { get; set; }`" },
        { label: "自动属性", left: "没有", right: "编译器自动生成后备字段" },
        { label: "推荐", left: "私有字段常见", right: "对外公开成员更推荐用属性" }
      ]
    }
  },
  {
    id: "access-modifier",
    title: "访问修饰符",
    category: "面向对象",
    type: "compare",
    content: {
      leftTitle: "修饰符",
      rightTitle: "可访问范围",
      rows: [
        { label: "public", left: "任何地方", right: "公开 API 最常见" },
        { label: "private", left: "仅当前类内部", right: "默认优先使用" },
        { label: "protected", left: "当前类及子类", right: "给继承链开放" },
        { label: "internal", left: "当前程序集内部", right: "同项目内部共享" },
        { label: "protected internal", left: "同程序集或子类", right: "范围较宽，慎用" }
      ]
    }
  },
  {
    id: "inherit-polymorphism",
    title: "继承、多态、override",
    category: "面向对象",
    type: "list",
    content: [
      "继承表达 is-a 关系，例如 `Dog : Animal`。",
      "`virtual` 表示可被子类重写。",
      "`override` 表示子类重写父类虚方法。",
      "`base.Method()` 可调用父类实现。",
      "多态的核心是“同一接口，不同行为”。",
      "别为复用一点代码就滥用继承，组合往往更稳。"
    ]
  },
  {
    id: "abstract-vs-interface",
    title: "abstract vs interface",
    category: "面向对象",
    type: "compare",
    content: {
      leftTitle: "abstract class",
      rightTitle: "interface",
      rows: [
        { label: "是否可含字段", left: "可以", right: "通常不放实例字段" },
        { label: "是否可写实现", left: "可以写部分默认实现", right: "现代 C# 可写默认实现，但常保持契约化" },
        { label: "继承数量", left: "类只能继承一个基类", right: "可实现多个接口" },
        { label: "适合场景", left: "共享基础状态与通用逻辑", right: "定义能力、行为契约" },
        { label: "直觉", left: "更像“半成品基类”", right: "更像“能力标签 + 约定”" }
      ]
    }
  },
  {
    id: "interface-usage",
    title: "接口使用建议",
    category: "面向对象",
    type: "list",
    content: [
      "接口更适合表达“能做什么”，而不是“是什么”。",
      "命名常用 `I` 前缀，例如 `IDamageable`、`IMovable`。",
      "面向接口编程能降低耦合，方便替换实现。",
      "不要为了“看起来高级”给所有类都套接口。",
      "当你预期会有多种实现时，接口价值最高。",
      "接口粒度尽量小，避免臃肿大接口。"
    ]
  },
  {
    id: "generic-basics",
    title: "泛型基础",
    category: "泛型",
    type: "list",
    content: [
      "泛型让代码在保持类型安全的同时复用逻辑。",
      "`List<T>`、`Dictionary<TKey, TValue>` 都是泛型类型。",
      "泛型避免频繁强转，也减少装箱拆箱。",
      "类型参数命名常见：`T`、`TKey`、`TValue`、`TResult`。",
      "泛型方法和泛型类都很常见。",
      "看见“逻辑相同，仅类型不同”时，先想想能否抽成泛型。"
    ]
  },
  {
    id: "generic-constraints",
    title: "泛型约束",
    category: "泛型",
    type: "list",
    content: [
      "`where T : class`，限制为引用类型。",
      "`where T : struct`，限制为值类型。",
      "`where T : new()`，要求有无参构造函数。",
      "`where T : BaseType`，限制继承某基类。",
      "`where T : ISomeInterface`，限制实现某接口。",
      "约束越明确，泛型内部能安全使用的能力越多。"
    ]
  },
  {
    id: "delegate-action-func",
    title: "delegate / Action / Func",
    category: "委托与事件",
    type: "compare",
    content: {
      leftTitle: "类型",
      rightTitle: "用途",
      rows: [
        { label: "delegate", left: "自定义委托类型", right: "语义清楚，适合需要命名的回调" },
        { label: "Action", left: "无返回值委托", right: "最常用事件/回调类型" },
        { label: "Func", left: "有返回值委托", right: "最后一个泛型参数是返回值" },
        { label: "Predicate<T>", left: "返回 `bool` 的委托", right: "常用于条件判断" },
        { label: "Lambda", left: "快速创建匿名函数", right: "常与 Action/Func 配合" }
      ]
    }
  },
  {
    id: "event-usage",
    title: "event 事件模式",
    category: "委托与事件",
    type: "code",
    content: `public class Health
{
    public event Action<int> OnHealthChanged;

    private int _current = 100;

    public void Damage(int value)
    {
        _current = Math.Max(0, _current - value);
        OnHealthChanged?.Invoke(_current);
    }
}

public class Hud
{
    public void Bind(Health health)
    {
        health.OnHealthChanged += HandleHealthChanged;
    }

    private void HandleHealthChanged(int value)
    {
        Console.WriteLine($"HP: {value}");
    }
}`
  },
  {
    id: "lambda-closure",
    title: "Lambda 与闭包",
    category: "委托与事件",
    type: "list",
    content: [
      "Lambda 是匿名函数的简洁写法，例如 `x => x * 2`。",
      "闭包会捕获外部变量，而不是只捕获当时的值。",
      "循环里注册回调时，要特别注意捕获变量的问题。",
      "表达式体 Lambda 适合短逻辑，复杂逻辑再展开成代码块。",
      "回调太多时，适当拆成命名方法更易读。"
    ]
  },
  {
    id: "exception-basics",
    title: "异常处理",
    category: "异常与资源",
    type: "list",
    content: [
      "`try` 放可能抛异常的代码。",
      "`catch` 负责处理异常，尽量抓具体异常类型。",
      "`finally` 无论是否异常通常都会执行。",
      "不要用异常代替普通分支判断。",
      "外部输入、IO、网络、反序列化都要更谨慎。",
      "记录日志时要保留上下文，不要只打印“出错了”。"
    ]
  },
  {
    id: "using-idisposable",
    title: "using 与 IDisposable",
    category: "异常与资源",
    type: "code",
    content: `using var reader = new StreamReader("data.txt");
string text = reader.ReadToEnd();

// 传统写法
using (var file = new FileStream("save.bin", FileMode.OpenOrCreate))
{
    // 使用 file
}

// 只要对象实现了 IDisposable，using 结束时就会自动调用 Dispose()。`
  },
  {
    id: "common-exceptions",
    title: "常见异常速记",
    category: "异常与资源",
    type: "api",
    content: [
      { name: "NullReferenceException", desc: "对象引用为空却访问其成员。" },
      { name: "IndexOutOfRangeException", desc: "数组索引越界。" },
      { name: "ArgumentException", desc: "参数不合法。" },
      { name: "InvalidOperationException", desc: "对象当前状态不允许此操作。" },
      { name: "KeyNotFoundException", desc: "字典按不存在的 key 取值。" },
      { name: "FormatException", desc: "字符串格式不正确，无法解析。" },
      { name: "IOException", desc: "文件、流、IO 相关错误。" }
    ]
  },
  {
    id: "linq-common",
    title: "LINQ 常用查询",
    category: "LINQ",
    type: "api",
    content: [
      { name: "Where()", desc: "按条件过滤元素。" },
      { name: "Select()", desc: "把元素映射成新结果。" },
      { name: "First() / FirstOrDefault()", desc: "取首个元素或默认值。" },
      { name: "Any()", desc: "是否存在满足条件的元素。" },
      { name: "All()", desc: "是否全部满足条件。" },
      { name: "Count()", desc: "统计数量。" },
      { name: "OrderBy()", desc: "升序排序。" },
      { name: "OrderByDescending()", desc: "降序排序。" },
      { name: "GroupBy()", desc: "分组。" },
      { name: "ToList()", desc: "把延迟查询结果立刻落成 List。" }
    ]
  },
  {
    id: "linq-deferred",
    title: "LINQ 延迟执行",
    category: "LINQ",
    type: "list",
    content: [
      "很多 LINQ 查询是延迟执行的，真正遍历时才开始算。",
      "源集合变化后，再次枚举结果也可能变化。",
      "需要“立刻拍快照”时，用 `ToList()` 或 `ToArray()`。",
      "LINQ 很方便，但不要在性能敏感热路径里无脑连写。",
      "链式调用太长时，可适当拆成中间变量，提高可读性。"
    ]
  },
  {
    id: "async-await",
    title: "async / await",
    category: "异步",
    type: "code",
    content: `public async Task<string> LoadTextAsync(string path)
{
    using var reader = new StreamReader(path);
    string text = await reader.ReadToEndAsync();
    return text;
}

public async Task TestAsync()
{
    string text = await LoadTextAsync("data.txt");
    Console.WriteLine(text);
}`
  },
  {
    id: "task-basics",
    title: "Task 基础",
    category: "异步",
    type: "list",
    content: [
      "`Task` 表示一个异步操作。",
      "`Task<T>` 表示有返回值的异步操作。",
      "`await` 会等待任务完成，再继续往下执行。",
      "异步方法命名通常加 `Async` 后缀。",
      "不要随手写 `async void`，除了事件处理器等少数场景。",
      "异步并不等于多线程，它更像“把等待时间让出去”。"
    ]
  },
  {
    id: "parse-tryparse",
    title: "Parse / TryParse",
    category: "实用",
    type: "api",
    content: [
      { name: "int.Parse(str)", desc: "格式错误会抛异常。" },
      { name: "int.TryParse(str, out value)", desc: "成功返回 true，失败不抛异常。" },
      { name: "float.TryParse(str, out value)", desc: "解析浮点数时更稳妥。" },
      { name: "Enum.TryParse<T>()", desc: "把字符串转成枚举值。" },
      { name: "DateTime.TryParse()", desc: "解析日期字符串。" },
      { name: "推荐", desc: "用户输入、配置读取优先 `TryParse`。" }
    ]
  },
  {
    id: "datetime-timespan",
    title: "DateTime / TimeSpan",
    category: "实用",
    type: "api",
    content: [
      { name: "DateTime.Now", desc: "当前本地时间。" },
      { name: "DateTime.UtcNow", desc: "当前 UTC 时间。" },
      { name: "AddDays(n)", desc: "加减天数。" },
      { name: "AddMinutes(n)", desc: "加减分钟。" },
      { name: "ToString(format)", desc: "按格式输出时间。" },
      { name: "TimeSpan.FromSeconds(x)", desc: "从秒创建时间跨度。" },
      { name: "end - start", desc: "两个时间相减得到 TimeSpan。" }
    ]
  },
  {
    id: "enum-record-tuple",
    title: "enum / record / tuple",
    category: "现代 C#",
    type: "list",
    content: [
      "`enum` 适合表达一组离散状态，例如 `Idle`、`Run`、`Dead`。",
      "`record` 更适合表达“数据为主”的对象，值语义友好。",
      "`(int x, int y)` 是元组，适合临时打包少量返回值。",
      "元组字段可命名，提高可读性。",
      "当数据结构变复杂时，优先回到明确的类或结构体。"
    ]
  },
  {
    id: "pattern-matching",
    title: "模式匹配速记",
    category: "现代 C#",
    type: "list",
    content: [
      "`obj is Player p`，判断并顺手完成安全转换。",
      "`x is > 0 and < 10`，可直接写范围模式。",
      "`switch` 可按类型、常量、范围、属性做匹配。",
      "`_` 常作默认分支或忽略变量。",
      "模式匹配很适合替代一串冗长的 `if + cast`。"
    ]
  },
  {
    id: "equality-hashcode",
    title: "Equals / GetHashCode",
    category: "进阶",
    type: "list",
    content: [
      "判断对象逻辑相等时，通常需要重写 `Equals()`。",
      "若重写 `Equals()`，通常也要同步重写 `GetHashCode()`。",
      "字典、HashSet 等哈希集合特别依赖哈希一致性。",
      "可变字段参与哈希时要谨慎，容易出现难查 bug。",
      "只比较“身份”还是比较“内容”，要先想清楚。"
    ]
  },
  {
    id: "sort-search-compare",
    title: "排序、比较与查找",
    category: "进阶",
    type: "list",
    content: [
      "`List<T>.Sort()` 可直接排序。",
      "自定义排序可实现 `IComparer<T>` 或传 Comparison Lambda。",
      "`BinarySearch()` 适合已排序集合。",
      "查找优先想清楚是按索引、按值、还是按 key。",
      "数据结构选对了，后面很多代码都会轻松很多。"
    ]
  },
  {
    id: "nullable-reference",
    title: "可空引用与防空思路",
    category: "进阶",
    type: "list",
    content: [
      "启用可空引用后，`string?` 表示允许为空，`string` 表示预期非空。",
      "编译器的可空警告是很有价值的提示，不要全当空气。",
      "进入方法边界时尽早做空校验，后面逻辑会更干净。",
      "别到处乱加 `!` 压警告，那只是把问题往后踢。",
      "空判断写得越靠前，NRE 越少。"
    ]
  },
  {
    id: "serializefield-public",
    title: "public vs [SerializeField] private",
    category: "Unity/C#",
    type: "compare",
    content: {
      leftTitle: "public 字段",
      rightTitle: "[SerializeField] private 字段",
      rows: [
        { label: "Inspector 显示", left: "会显示", right: "也会显示" },
        { label: "外部访问", left: "外部可直接访问", right: "外部不可直接访问" },
        { label: "封装性", left: "较弱", right: "更好" },
        { label: "推荐", left: "少数确实要公开的数据", right: "大多数 Inspector 配置字段" },
        { label: "常见写法", left: "`public int hp;`", right: "`[SerializeField] private int hp;`" }
      ]
    }
  },
  {
    id: "unity-event-lifecycle",
    title: "Unity 事件订阅习惯",
    category: "Unity/C#",
    type: "code",
    content: `public class PlayerHud : MonoBehaviour
{
    [SerializeField] private Health health;

    private void OnEnable()
    {
        if (health != null)
            health.OnHealthChanged += Refresh;
    }

    private void OnDisable()
    {
        if (health != null)
            health.OnHealthChanged -= Refresh;
    }

    private void Refresh(int value)
    {
        Debug.Log($"HP: {value}");
    }
}`
  },
  {
  id: "numeric-types-table",
  title: "常见数值类型",
  category: "基础",
  type: "table",
  content: {
    headers: ["类型", "大小", "特点", "常见场景"],
    rows: [
      ["int", "32 位", "最常用整数类型", "计数、索引、ID"],
      ["long", "64 位", "范围更大", "时间戳、大数值"],
      ["float", "32 位", "精度较低，速度常更合适", "游戏坐标、速度、插值"],
      ["double", "64 位", "精度更高", "高精度计算、工具层逻辑"],
      ["decimal", "128 位", "十进制精度好", "金额、财务计算"],
      ["byte", "8 位", "很小的整数范围", "二进制数据、颜色通道"]
    ]
  }
},
{
  id: "common-keywords-core",
  title: "核心关键字速记",
  category: "基础",
  type: "keywords",
  content: [
    { keyword: "class", desc: "定义类", note: "最常见引用类型" },
    { keyword: "struct", desc: "定义结构体", note: "值类型，适合小数据块" },
    { keyword: "interface", desc: "定义接口契约", note: "适合解耦与多实现" },
    { keyword: "enum", desc: "定义枚举", note: "表达离散状态" },
    { keyword: "public", desc: "公开访问", note: "任何地方可访问" },
    { keyword: "private", desc: "私有访问", note: "默认优先使用" },
    { keyword: "protected", desc: "受保护访问", note: "当前类和子类可访问" },
    { keyword: "internal", desc: "程序集内访问", note: "同程序集共享" },
    { keyword: "static", desc: "静态成员", note: "属于类型本身" },
    { keyword: "const", desc: "编译期常量", note: "必须在声明时赋值" },
    { keyword: "readonly", desc: "运行期只读", note: "初始化后不可再改" },
    { keyword: "new", desc: "创建对象或显式隐藏成员", note: "最常见是实例化对象" },
    { keyword: "void", desc: "无返回值", note: "方法常用" },
    { keyword: "return", desc: "返回结果并结束方法", note: "也可提前退出" },
    { keyword: "this", desc: "当前对象引用", note: "也可用于构造函数链" },
    { keyword: "base", desc: "父类引用", note: "调用父类实现" },
    { keyword: "if", desc: "条件分支", note: "最常用判断语句" },
    { keyword: "else", desc: "条件分支补充", note: "和 if 配套" },
    { keyword: "switch", desc: "多分支匹配", note: "现代 C# 可配合模式匹配" },
    { keyword: "case", desc: "switch 分支项", note: "匹配具体情况" },
    { keyword: "for", desc: "计数循环", note: "适合需要索引时" },
    { keyword: "foreach", desc: "遍历循环", note: "适合只读遍历集合" },
    { keyword: "while", desc: "条件循环", note: "满足条件时反复执行" },
    { keyword: "break", desc: "跳出循环或 switch", note: "立刻结束当前结构" },
    { keyword: "continue", desc: "跳过当前轮", note: "继续下一轮循环" }
  ]
},
{
  id: "nullable-operators-syntax",
  title: "空判断语法速记",
  category: "基础",
  type: "syntax",
  content: {
    rules: [
      "`?.` 用于空条件访问。",
      "`??` 用于空合并。",
      "`??=` 用于空时再赋值。",
      "值类型可通过 `?` 变成可空值类型。"
    ],
    examples: [
      {
        title: "空条件访问",
        code: "player?.Move();",
        note: "player 不为空时才调用方法"
      },
      {
        title: "空合并",
        code: "string name = input ?? \"Unknown\";",
        note: "左边为 null 时取右边"
      },
      {
        title: "空合并赋值",
        code: "cache ??= new Dictionary<string, int>();",
        note: "左边为 null 时才赋值"
      },
      {
        title: "可空值类型",
        code: "int? hp = null;",
        note: "值类型通过 ? 变为可空"
      },
      {
        title: "判空后取值",
        code: "if (hp.HasValue) Console.WriteLine(hp.Value);",
        note: "访问 Value 前先确认有值"
      }
    ]
  }
},
{
  id: "property-constructor-syntax",
  title: "属性与构造函数写法",
  category: "面向对象",
  type: "syntax",
  content: {
    rules: [
      "属性更适合对外暴露成员。",
      "构造函数负责创建对象时初始化状态。",
      "表达式体成员适合短逻辑。"
    ],
    examples: [
      {
        title: "自动属性",
        code: "public int Hp { get; set; }",
        note: "最常见属性写法"
      },
      {
        title: "只读属性",
        code: "public string Name { get; private set; }",
        note: "外部可读，内部可改"
      },
      {
        title: "表达式体属性",
        code: "public bool IsDead => Hp <= 0;",
        note: "适合简单只读计算"
      },
      {
        title: "构造函数",
        code: "public Player(string name) { Name = name; }",
        note: "创建对象时初始化状态"
      },
      {
        title: "构造函数链",
        code: "public Player() : this(\"Unknown\") { }",
        note: "复用另一个构造函数"
      }
    ]
  }
},
{
  id: "object-collection-init-syntax",
  title: "对象与集合初始化",
  category: "语法",
  type: "syntax",
  content: {
    rules: [
      "初始化器适合在创建对象后立刻填充数据。",
      "集合初始化器能让少量初始数据更直观。"
    ],
    examples: [
      {
        title: "对象初始化器",
        code: "var p = new Player { Name = \"Alice\", Hp = 100 };",
        note: "创建后直接设置属性"
      },
      {
        title: "List 初始化",
        code: "var list = new List<int> { 1, 2, 3 };",
        note: "适合少量初始元素"
      },
      {
        title: "Dictionary 初始化",
        code: "var dict = new Dictionary<string, int> { [\"hp\"] = 100, [\"mp\"] = 50 };",
        note: "键值写法更直观"
      },
      {
        title: "数组初始化",
        code: "int[] nums = { 1, 2, 3, 4 };",
        note: "长度由元素数量决定"
      }
    ]
  }
},
{
  id: "switch-expression-syntax",
  title: "switch expression 速记",
  category: "现代 C#",
  type: "syntax",
  content: {
    rules: [
      "switch expression 适合把输入映射成输出。",
      "可配合范围模式、类型模式一起使用。"
    ],
    examples: [
      {
        title: "按枚举返回值",
        code: "string text = state switch { GameState.Idle => \"待机\", GameState.Run => \"移动\", _ => \"未知\" };",
        note: "适合离散值映射"
      },
      {
        title: "带条件匹配",
        code: "string rank = score switch { >= 90 => \"S\", >= 80 => \"A\", >= 60 => \"B\", _ => \"C\" };",
        note: "范围判断更紧凑"
      },
      {
        title: "类型模式",
        code: "string name = obj switch { Player p => p.Name, Enemy e => e.Id.ToString(), _ => \"Unknown\" };",
        note: "按类型分流逻辑"
      }
    ]
  }
},
{
  id: "pattern-matching-syntax",
  title: "模式匹配写法",
  category: "现代 C#",
  type: "syntax",
  content: {
    rules: [
      "模式匹配能替代很多冗长的 if + cast。",
      "适合类型判断、范围判断、判空。"
    ],
    examples: [
      {
        title: "is + 变量",
        code: "if (obj is Player p) Console.WriteLine(p.Name);",
        note: "判断成功后顺手拿到强类型变量"
      },
      {
        title: "常量模式",
        code: "if (state is GameState.Dead) Respawn();",
        note: "适合枚举、常量判断"
      },
      {
        title: "关系模式",
        code: "if (hp is > 0 and <= 20) WarnLowHp();",
        note: "范围判断更直接"
      },
      {
        title: "not 模式",
        code: "if (target is not null) Attack(target);",
        note: "比 != null 更现代一点"
      }
    ]
  }
},
{
  id: "lambda-linq-syntax",
  title: "Lambda / LINQ 写法",
  category: "LINQ",
  type: "syntax",
  content: {
    rules: [
      "Lambda 是匿名函数的简写形式。",
      "LINQ 常和 Lambda 一起使用。",
      "链式调用太长时可适当拆变量。"
    ],
    examples: [
      {
        title: "单参数 Lambda",
        code: "x => x * 2",
        note: "最基本的匿名函数写法"
      },
      {
        title: "代码块 Lambda",
        code: "(x, y) => { int sum = x + y; return sum; }",
        note: "逻辑稍复杂时使用"
      },
      {
        title: "Where 过滤",
        code: "var alive = enemies.Where(e => e.Hp > 0);",
        note: "按条件筛选元素"
      },
      {
        title: "Select 投影",
        code: "var names = players.Select(p => p.Name);",
        note: "把对象映射成新结果"
      },
      {
        title: "Any 判断",
        code: "bool hasBoss = enemies.Any(e => e.IsBoss);",
        note: "是否存在满足条件的元素"
      }
    ]
  }
},
{
  id: "using-namespace-syntax",
  title: "using / namespace 速记",
  category: "语法",
  type: "syntax",
  content: {
    rules: [
      "using 用于导入命名空间。",
      "也可用别名简化长类型名。",
      "现代 C# 支持文件作用域命名空间。"
    ],
    examples: [
      {
        title: "导入命名空间",
        code: "using System.Collections.Generic;",
        note: "引入类型所在命名空间"
      },
      {
        title: "别名 using",
        code: "using Vec3 = UnityEngine.Vector3;",
        note: "为类型取短别名"
      },
      {
        title: "文件作用域命名空间",
        code: "namespace Game.Core;",
        note: "现代写法更紧凑"
      },
      {
        title: "传统命名空间",
        code: "namespace Game.Core { public class Player {} }",
        note: "旧写法也仍然常见"
      }
    ]
  }
},
{
  id: "snippet-common-guards",
  title: "常用防御式短代码",
  category: "snippets",
  type: "snippets",
  content: [
    { title: "参数判空", code: "if (target == null) return;", note: "" },
    { title: "提前返回", code: "if (!isReady) return;", note: "" },
    { title: "安全取字典", code: "if (dict.TryGetValue(id, out var item)) { /* use item */ }", note: "" },
    { title: "安全解析整数", code: "if (int.TryParse(input, out var value)) { /* use value */ }", note: "" },
    { title: "空集合兜底", code: "items ??= new List<Item>();", note: "" }
  ]
},
{
  id: "snippet-property-event",
  title: "属性与事件短代码",
  category: "snippets",
  type: "snippets",
  content: [
    { title: "自动属性", code: "public int Level { get; set; }", note: "" },
    { title: "只读公开", code: "public int Hp => _hp;", note: "" },
    { title: "事件声明", code: "public event Action OnDead;", note: "" },
    { title: "安全触发事件", code: "OnDead?.Invoke();", note: "" },
    { title: "表达式体方法", code: "public bool IsAlive() => _hp > 0;", note: "" }
  ]
},
{
  id: "snippet-list-dictionary",
  title: "集合短代码速记",
  category: "snippets",
  type: "snippets",
  content: [
    { title: "创建 List", code: "var list = new List<int>();", note: "" },
    { title: "创建 Dictionary", code: "var dict = new Dictionary<string, int>();", note: "" },
    { title: "尾部添加", code: "list.Add(10);", note: "" },
    { title: "按键赋值", code: "dict[\"hp\"] = 100;", note: "" },
    { title: "遍历 List", code: "foreach (var item in list) Console.WriteLine(item);", note: "" }
  ]
},
{
  id: "snippet-string-format",
  title: "字符串短代码速记",
  category: "snippets",
  type: "snippets",
  content: [
    { title: "插值字符串", code: "string text = $\"HP: {hp}\";", note: "" },
    { title: "格式化浮点", code: "string s = speed.ToString(\"F2\");", note: "" },
    { title: "拼接集合", code: "string joined = string.Join(\",\", names);", note: "" },
    { title: "忽略大小写比较", code: "bool same = string.Equals(a, b, StringComparison.OrdinalIgnoreCase);", note: "" },
    { title: "去掉首尾空白", code: "input = input.Trim();", note: "" }
  ]
},
{
  id: "pitfall-null-reference",
  title: "NullReference 常见坑",
  category: "坑点",
  type: "pitfall",
  content: [
    { label: "问题", body: "对象还没 new 就访问成员，是最常见的 NRE 来源。" },
    { label: "问题", body: "字典、List、数组字段如果没初始化，调用成员也会直接炸。" },
    { label: "问题", body: "事件回调里的对象可能已经被销毁或解绑，要注意时机。" },
    { label: "建议", body: "进入方法边界尽早判空，后面的逻辑会干净很多。" },
    { label: "建议", body: "不要用大量 `!` 强压可空警告，那只是把雷埋深一点。" }
  ]
},
{
  id: "pitfall-collection-modify",
  title: "集合操作常见坑",
  category: "坑点",
  type: "pitfall",
  content: [
    { label: "问题", body: "不要在 foreach 遍历时直接修改集合结构。" },
    { label: "问题", body: "按索引访问数组或 List 前，先确认范围合法。" },
    { label: "问题", body: "Dictionary 直接用 dict[key] 取值时，key 不存在会抛异常。" },
    { label: "建议", body: "安全取值优先用 `TryGetValue`。" },
    { label: "建议", body: "需要删除多个元素时，常见做法是倒序 for。" }
  ]
},
{
  id: "pitfall-float-string-parse",
  title: "字面量与解析常见坑",
  category: "坑点",
  type: "pitfall",
  content: [
    { label: "问题", body: "float 字面量忘写 `f`，常会被当成 double。" },
    { label: "问题", body: "用户输入直接 Parse，格式不对就会抛异常。" },
    { label: "问题", body: "字符串比较要想清楚是否需要忽略大小写。" },
    { label: "建议", body: "涉及外部输入时，优先 `TryParse` 而不是 `Parse`。" }
  ]
},
{
  id: "pitfall-async-task",
  title: "异步常见坑",
  category: "坑点",
  type: "pitfall",
  content: [
    { label: "问题", body: "除事件处理器外，不要滥用 `async void`。" },
    { label: "问题", body: "忘记 await 时，逻辑顺序可能和你想的不一样。" },
    { label: "问题", body: "异步并不自动等于多线程，不要混为一谈。" },
    { label: "建议", body: "异步方法命名带 `Async`，调用点更清楚。" },
    { label: "建议", body: "性能敏感和 Unity 主线程相关逻辑，要特别注意上下文。" }
  ]
},
{
  id: "pitfall-event-subscribe",
  title: "事件订阅常见坑",
  category: "坑点",
  type: "pitfall",
  content: [
    { label: "问题", body: "订阅了事件却没取消订阅，容易造成重复回调或对象滞留。" },
    { label: "问题", body: "匿名函数订阅后，如果没有保留引用，后面很难正确取消。" },
    { label: "问题", body: "多次 OnEnable 重复订阅，会导致一个事件触发多次。" },
    { label: "建议", body: "配对思路很重要：OnEnable 订阅，OnDisable 取消。" }
  ]
},
{
  id: "collection-choice-table",
  title: "集合选型速记",
  category: "集合",
  type: "table",
  content: {
    headers: ["集合", "特征", "适合场景"],
    rows: [
      ["Array", "长度固定、索引快", "数量固定的数据"],
      ["List<T>", "可扩容、最通用", "大多数动态列表场景"],
      ["Dictionary<TKey, TValue>", "按 key 快速查找", "配置表、映射关系"],
      ["HashSet<T>", "无序、不重复", "去重、快速判断存在"],
      ["Queue<T>", "先进先出", "任务排队、消息消费"],
      ["Stack<T>", "后进先出", "撤销、回退、DFS"]
    ]
  }
},
{
  id: "access-modifiers-table",
  title: "访问修饰符总览",
  category: "面向对象",
  type: "table",
  content: {
    headers: ["修饰符", "访问范围", "常见使用"],
    rows: [
      ["public", "任何地方", "公开 API、外部调用入口"],
      ["private", "当前类内部", "默认优先，保护封装"],
      ["protected", "当前类和子类", "继承链开放能力"],
      ["internal", "当前程序集内部", "模块内共享实现"],
      ["protected internal", "同程序集或子类", "范围较宽，慎用"],
      ["private protected", "同程序集中的子类", "更细粒度控制"]
    ]
  }
},
{
  id: "exception-table",
  title: "常见异常对照表",
  category: "异常",
  type: "table",
  content: {
    headers: ["异常", "典型原因", "处理思路"],
    rows: [
      ["NullReferenceException", "空对象访问成员", "先定位哪个引用为空"],
      ["IndexOutOfRangeException", "数组越界", "检查索引范围"],
      ["ArgumentException", "参数不合法", "校验输入参数"],
      ["InvalidOperationException", "当前状态不允许操作", "检查对象生命周期和状态"],
      ["KeyNotFoundException", "字典 key 不存在", "优先 TryGetValue"],
      ["FormatException", "字符串格式错误", "改用 TryParse 或先校验"]
    ]
  }
},
{
  id: "advanced-keywords",
  title: "进阶关键字速记",
  category: "现代 C#",
  type: "keywords",
  content: [
    { keyword: "abstract", desc: "抽象类或抽象成员", note: "不能直接实例化，常作基类" },
    { keyword: "virtual", desc: "声明可重写成员", note: "子类可用 override 改写" },
    { keyword: "override", desc: "重写父类虚成员", note: "必须对应父类 virtual 或 abstract" },
    { keyword: "sealed", desc: "禁止继续继承或重写", note: "可用于类，也可用于 override 成员" },
    { keyword: "interface", desc: "定义行为契约", note: "适合解耦与多实现" },
    { keyword: "delegate", desc: "函数类型", note: "可存方法引用，用于回调" },
    { keyword: "event", desc: "受限委托发布机制", note: "外部通常只能订阅和取消订阅" },
    { keyword: "nameof", desc: "获取成员名字符串", note: "重构时更安全，常用于日志和异常" },
    { keyword: "typeof", desc: "获取类型对象", note: "返回 Type" },
    { keyword: "is", desc: "类型判断或模式匹配", note: "可配合变量声明一起用" },
    { keyword: "as", desc: "安全类型转换", note: "失败返回 null，不抛异常" },
    { keyword: "switch", desc: "多分支匹配", note: "现代 C# 可配合模式匹配" },
    { keyword: "async", desc: "声明异步方法", note: "常与 Task / await 配合" },
    { keyword: "await", desc: "等待异步任务完成", note: "用于异步流控制" },
    { keyword: "yield", desc: "逐步返回序列元素", note: "常用于迭代器与延迟生成" },
    { keyword: "partial", desc: "拆分类或方法定义", note: "常配合代码生成" },
    { keyword: "record", desc: "偏数据模型的类型", note: "值相等语义更友好" },
    { keyword: "readonly", desc: "只读字段或成员", note: "初始化后不可再改" },
    { keyword: "checked", desc: "启用溢出检查", note: "整数溢出时可抛异常" },
    { keyword: "unchecked", desc: "关闭溢出检查", note: "允许整数溢出截断" },
    { keyword: "lock", desc: "加锁同步", note: "保护多线程共享资源" },
    { keyword: "using", desc: "导入命名空间或自动释放资源", note: "using var 很常见" },
    { keyword: "default", desc: "获取类型默认值", note: "引用类型通常为 null" },
    { keyword: "params", desc: "可变参数", note: "调用时可传多个同类型参数" }
  ]
},
{
  id: "linq-keywords",
  title: "LINQ 关键词块",
  category: "LINQ",
  type: "keywords",
  content: [
    { keyword: "Where", desc: "过滤元素", note: "按条件筛选" },
    { keyword: "Select", desc: "映射结果", note: "把元素投影成新值" },
    { keyword: "SelectMany", desc: "展开嵌套集合", note: "常用于拍平结构" },
    { keyword: "First", desc: "取第一个元素", note: "没有元素会抛异常" },
    { keyword: "FirstOrDefault", desc: "取首个或默认值", note: "更安全" },
    { keyword: "Single", desc: "要求唯一元素", note: "不唯一也会抛异常" },
    { keyword: "Any", desc: "是否存在匹配项", note: "常用于快速判定" },
    { keyword: "All", desc: "是否全部满足条件", note: "全量判断" },
    { keyword: "Count", desc: "统计数量", note: "也可带条件" },
    { keyword: "OrderBy", desc: "升序排序", note: "常和 ThenBy 连用" },
    { keyword: "OrderByDescending", desc: "降序排序", note: "反向排序" },
    { keyword: "ThenBy", desc: "二级排序", note: "在已有排序基础上追加" },
    { keyword: "GroupBy", desc: "按键分组", note: "适合分类统计" },
    { keyword: "Distinct", desc: "去重", note: "默认按相等性判断" },
    { keyword: "ToList", desc: "转成 List", note: "让查询立刻执行" },
    { keyword: "ToArray", desc: "转成数组", note: "拍快照常用" },
    { keyword: "Sum", desc: "求和", note: "数值聚合" },
    { keyword: "Max", desc: "最大值", note: "聚合查询" },
    { keyword: "Min", desc: "最小值", note: "聚合查询" }
  ]
},
{
  id: "snippet-parse-convert",
  title: "解析与转换短代码",
  category: "snippets",
  type: "snippets",
  content: [
    { title: "整数解析", code: "int value = int.Parse(\"123\");", note: "" },
    { title: "安全整数解析", code: "bool ok = int.TryParse(input, out var number);", note: "" },
    { title: "枚举解析", code: "Enum.TryParse<GameState>(text, out var state);", note: "" },
    { title: "显式转换", code: "int hp = (int)99.8f;", note: "" },
    { title: "通用转换", code: "int count = Convert.ToInt32(obj);", note: "" }
  ]
},
{
  id: "snippet-loop-control",
  title: "循环控制短代码",
  category: "snippets",
  type: "snippets",
  content: [
    { title: "for 遍历", code: "for (int i = 0; i < list.Count; i++) { }", note: "" },
    { title: "foreach 遍历", code: "foreach (var item in list) { }", note: "" },
    { title: "while 循环", code: "while (isRunning) { }", note: "" },
    { title: "结束循环", code: "if (done) break;", note: "" },
    { title: "跳过本轮", code: "if (skip) continue;", note: "" }
  ]
}
];