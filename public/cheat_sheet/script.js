const STORAGE_KEY = "csharp-unity-cheat-sheet-order";

const typeLabelMap = {
  list: "文本列表",
  code: "代码卡",
  compare: "对比卡",
  api: "API 清单",
  table: "表格卡",
  syntax: "语法卡",
  pitfall: "避坑卡",
  keywords: "关键词",
  snippets: "片段集"
};

const cardsData = Array.isArray(window.CHEAT_SHEET_CARDS)
  ? window.CHEAT_SHEET_CARDS
  : [];

const elements = {
  grid: document.getElementById("cardGrid"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  resetOrderBtn: document.getElementById("resetOrderBtn"),
  resultCount: document.getElementById("resultCount"),
  statusText: document.getElementById("statusText")
};

const defaultOrder = cardsData.map((card) => card.id);
const cardMap = new Map(cardsData.map((card) => [card.id, card]));

const state = {
  query: "",
  order: normalizeOrder(loadStoredOrder()),
  sortable: null,
  layoutFrame: 0
};

prepareSearchIndex();
bindEvents();
renderCards();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(scheduleCardLayout);
}

function prepareSearchIndex() {
  cardsData.forEach((card) => {
    card.searchIndex = buildSearchText(card).toLowerCase();
  });
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderCards();
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    state.query = "";
    setStatus("搜索已清空");
    renderCards();
    elements.searchInput.focus();
  });

  elements.resetOrderBtn.addEventListener("click", () => {
    state.order = [...defaultOrder];
    clearStoredOrder();
    setStatus("已恢复默认顺序");
    renderCards();
  });

  window.addEventListener("resize", scheduleCardLayout);
}

function renderCards() {
  elements.grid.innerHTML = "";

  if (!cardsData.length) {
    elements.grid.appendChild(
      createEmptyState("没有加载到卡片数据。", "请检查 cards-data.js 是否正确引入。")
    );
    updateMeta(0);
    destroySortable();
    return;
  }

  const cards = getFilteredCards();

  if (!cards.length) {
    elements.grid.appendChild(
      createEmptyState("没有匹配卡片。", "试试搜索标题、分类、API 名称或关键词。")
    );
    updateMeta(0);
    destroySortable();
    return;
  }

  cards.forEach((card) => {
    elements.grid.appendChild(createCardElement(card));
  });

  updateMeta(cards.length);
  initSortable();
  scheduleCardLayout();
}

function createCardElement(card) {
  const article = document.createElement("article");
  article.className = "cheat-card";
  article.dataset.id = card.id;

  const header = document.createElement("header");
  header.className = "card-header";

  const headerMain = document.createElement("div");
  headerMain.className = "card-header-main";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = card.title;

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const categoryChip = document.createElement("span");
  categoryChip.className = "card-chip";
  categoryChip.textContent = card.category;

  const typeChip = document.createElement("span");
  typeChip.className = "card-chip card-chip-kind";
  typeChip.textContent = typeLabelMap[card.type] || card.type;

  meta.append(categoryChip, typeChip);
  headerMain.append(title, meta);

  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "card-handle";
  handle.setAttribute("aria-label", `拖拽排序：${card.title}`);
  handle.title = "拖拽排序";

  header.append(headerMain, handle);

  const body = document.createElement("div");
  body.className = "card-body";
  body.appendChild(createCardContent(card));

  article.append(header, body);
  return article;
}

function createCardContent(card) {
  switch (card.type) {
    case "list":
      return renderListCard(card.content);
    case "code":
      return renderCodeCard(card.content);
    case "compare":
      return renderCompareCard(card.content);
    case "api":
      return renderApiCard(card.content);
    case "table":
      return renderTableCard(card.content);
    case "syntax":
      return renderSyntaxCard(card.content);
    case "pitfall":
      return renderPitfallCard(card.content);
    case "keywords":
      return renderKeywordsCard(card.content);
    case "snippets":
      return renderSnippetsCard(card.content);
    default:
      return document.createTextNode("Unsupported card type");
  }
}

function renderListCard(items) {
  const list = document.createElement("ul");
  list.className = "list-content";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = formatInlineCode(item);
    list.appendChild(li);
  });

  return list;
}

function renderCodeCard(codeText) {
  const pre = document.createElement("pre");
  pre.className = "code-card";

  const code = document.createElement("code");
  code.textContent = codeText;
  pre.appendChild(code);

  return pre;
}

function renderCompareCard(content) {
  const compareTable = normalizeCompareContent(content);
  const table = document.createElement("table");
  table.className = "compare-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  compareTable.headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  compareTable.rows.forEach((row) => {
    const tr = document.createElement("tr");

    row.forEach((cellText) => {
      const td = document.createElement("td");
      td.innerHTML = formatInlineCode(cellText);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  return table;
}

function renderApiCard(items) {
  const table = document.createElement("table");
  table.className = "api-table";

  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>API</th><th>说明</th></tr>";

  const tbody = document.createElement("tbody");
  items.forEach((item) => {
    const tr = document.createElement("tr");

    const nameCell = document.createElement("td");
    const name = document.createElement("span");
    name.className = "api-name";
    name.textContent = item.name;
    nameCell.appendChild(name);

    const descCell = document.createElement("td");
    descCell.innerHTML = formatInlineCode(item.desc);

    tr.append(nameCell, descCell);
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  return table;
}

function renderTableCard(content) {
  const tableContent = normalizeTableContent(content);
  const table = document.createElement("table");
  table.className = "data-table";

  if (tableContent.headers.length) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    tableContent.headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);
  }

  const tbody = document.createElement("tbody");
  tableContent.rows.forEach((row) => {
    const tr = document.createElement("tr");

    row.forEach((cellText) => {
      const td = document.createElement("td");
      td.innerHTML = formatInlineCode(cellText);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function renderSyntaxCard(content) {
  const syntax = normalizeSyntaxContent(content);
  const wrapper = document.createElement("div");
  wrapper.className = "syntax-card";

  if (syntax.signature) {
    wrapper.appendChild(createLabeledBlock("语法", renderCodeCard(syntax.signature)));
  }

  if (syntax.pattern) {
    wrapper.appendChild(createLabeledBlock("模式", renderCodeCard(syntax.pattern)));
  }

  if (syntax.rules.length) {
    wrapper.appendChild(createLabeledBlock("说明", renderListCard(syntax.rules)));
  }

  if (syntax.examples.length) {
    const exampleWrap = document.createElement("div");
    exampleWrap.className = "stack-list";

    syntax.examples.forEach((example) => {
      const item = document.createElement("section");
      item.className = "stack-item";

      if (example.title) {
        const title = document.createElement("h3");
        title.className = "mini-heading";
        title.textContent = example.title;
        item.appendChild(title);
      }

      if (example.code) {
        item.appendChild(renderCodeCard(example.code));
      }

      if (example.note) {
        const note = document.createElement("p");
        note.className = "muted-note";
        note.innerHTML = formatInlineCode(example.note);
        item.appendChild(note);
      }

      exampleWrap.appendChild(item);
    });

    wrapper.appendChild(createLabeledBlock("示例", exampleWrap));
  }

  if (!wrapper.children.length) {
    const note = document.createElement("p");
    note.textContent = "请提供 syntax 类型的内容。";
    wrapper.appendChild(note);
  }

  return wrapper;
}

function renderPitfallCard(content) {
  const pitfall = normalizePitfallContent(content);
  const wrapper = document.createElement("div");
  wrapper.className = "pitfall-card";

  pitfall.sections.forEach((section) => {
    const block = document.createElement("section");
    block.className = "pitfall-block";

    const title = document.createElement("h3");
    title.className = "mini-heading";
    title.textContent = section.label;
    block.appendChild(title);

    if (Array.isArray(section.body)) {
      block.appendChild(renderListCard(section.body));
    } else {
      const text = document.createElement("p");
      text.innerHTML = formatInlineCode(section.body);
      block.appendChild(text);
    }

    wrapper.appendChild(block);
  });

  if (!wrapper.children.length) {
    const note = document.createElement("p");
    note.textContent = "请提供 pitfall 类型的内容。";
    wrapper.appendChild(note);
  }

  return wrapper;
}

function renderKeywordsCard(content) {
  const keywords = normalizeKeywordsContent(content);
  const table = document.createElement("table");
  table.className = "keywords-table";
  table.innerHTML = "<thead><tr><th>关键词</th><th>说明</th><th>备注</th></tr></thead>";

  const tbody = document.createElement("tbody");
  keywords.forEach((item) => {
    const tr = document.createElement("tr");

    const keywordCell = document.createElement("td");
    const keyword = document.createElement("span");
    keyword.className = "keyword-term";
    keyword.textContent = item.term;
    keywordCell.appendChild(keyword);

    const descCell = document.createElement("td");
    descCell.innerHTML = formatInlineCode(item.desc);

    const noteCell = document.createElement("td");
    noteCell.innerHTML = formatInlineCode(item.note || "");

    tr.append(keywordCell, descCell, noteCell);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function renderSnippetsCard(content) {
  const snippets = normalizeSnippetsContent(content);
  const wrapper = document.createElement("div");
  wrapper.className = "snippets-card stack-list";

  snippets.forEach((snippet) => {
    const item = document.createElement("section");
    item.className = "stack-item";

    if (snippet.title) {
      const title = document.createElement("h3");
      title.className = "mini-heading";
      title.textContent = snippet.title;
      item.appendChild(title);
    }

    if (snippet.code) {
      item.appendChild(renderCodeCard(snippet.code));
    }

    if (snippet.note) {
      const note = document.createElement("p");
      note.className = "muted-note";
      note.innerHTML = formatInlineCode(snippet.note);
      item.appendChild(note);
    }

    wrapper.appendChild(item);
  });

  if (!wrapper.children.length) {
    const note = document.createElement("p");
    note.textContent = "请提供 snippets 类型的内容。";
    wrapper.appendChild(note);
  }

  return wrapper;
}

function createLabeledBlock(label, contentNode) {
  const block = document.createElement("section");
  block.className = "labeled-block";

  const title = document.createElement("h3");
  title.className = "mini-heading";
  title.textContent = label;

  block.append(title, contentNode);
  return block;
}

function createEmptyState(titleText, detailText) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.innerHTML = `<strong>${escapeHtml(titleText)}</strong><p>${escapeHtml(detailText)}</p>`;
  return empty;
}

function initSortable() {
  destroySortable();

  if (typeof Sortable === "undefined") {
    elements.grid.classList.add("sortable-disabled");
    setStatus("SortableJS 未加载，当前仅可浏览与搜索");
    return;
  }

  elements.grid.classList.remove("sortable-disabled");

  state.sortable = Sortable.create(elements.grid, {
    animation: 110,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    handle: ".card-handle",
    draggable: ".cheat-card",
    ghostClass: "drag-ghost",
    chosenClass: "drag-chosen",
    dragClass: "drag-dragging",
    swapThreshold: 0.58,
    invertSwap: true,
    invertedSwapThreshold: 0.72,
    fallbackOnBody: true,
    delayOnTouchOnly: true,
    delay: 90,
    onEnd: handleSortEnd
  });
}

function handleSortEnd() {
  const visibleIds = Array.from(elements.grid.querySelectorAll(".cheat-card")).map(
    (card) => card.dataset.id
  );

  if (!state.query) {
    state.order = visibleIds;
  } else {
    const visibleIdSet = new Set(visibleIds);
    let index = 0;

    state.order = state.order.map((id) => {
      if (visibleIdSet.has(id)) {
        return visibleIds[index++];
      }
      return id;
    });
  }

  saveOrder(state.order);
  setStatus("排序已保存到本地");
  updateMeta(visibleIds.length);
  scheduleCardLayout();
}

function destroySortable() {
  if (state.sortable) {
    state.sortable.destroy();
    state.sortable = null;
  }
}

function getFilteredCards() {
  const orderedCards = state.order.map((id) => cardMap.get(id)).filter(Boolean);

  if (!state.query) {
    return orderedCards;
  }

  return orderedCards.filter((card) => card.searchIndex.includes(state.query));
}

function updateMeta(visibleCount) {
  elements.resultCount.textContent = `显示 ${visibleCount} / ${cardsData.length} 张卡片`;

  if (!cardsData.length) {
    elements.statusText.textContent = "未加载数据";
    return;
  }

  if (!state.query && !loadStoredOrder()) {
    elements.statusText.textContent = "默认顺序";
    return;
  }

  if (state.query) {
    elements.statusText.textContent = `搜索中：${state.query}`;
    return;
  }

  elements.statusText.textContent = "已应用本地排序";
}

function setStatus(text) {
  elements.statusText.textContent = text;
}

function buildSearchText(card) {
  return [card.title, card.category, card.type, extractSearchText(card.content)].join(" ");
}

function formatInlineCode(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function normalizeCompareContent(content) {
  if (Array.isArray(content?.headers) && Array.isArray(content?.rows)) {
    return {
      headers: content.headers,
      rows: content.rows
    };
  }

  if (
    typeof content?.leftTitle === "string" &&
    typeof content?.rightTitle === "string" &&
    Array.isArray(content?.rows)
  ) {
    return {
      headers: ["项目", content.leftTitle, content.rightTitle],
      rows: content.rows.map((row) => [
        row.label || "",
        row.left || "",
        row.right || ""
      ])
    };
  }

  return {
    headers: ["对比"],
    rows: [["数据格式错误"]]
  };
}

function normalizeTableContent(content) {
  if (Array.isArray(content?.headers) && Array.isArray(content?.rows)) {
    return {
      headers: content.headers.map(String),
      rows: content.rows.map((row) => normalizeRowArray(row))
    };
  }

  if (Array.isArray(content?.rows) && content.rows.length && isPlainObject(content.rows[0])) {
    const headers = Array.isArray(content.columns)
      ? content.columns.map(String)
      : Object.keys(content.rows[0]);

    return {
      headers,
      rows: content.rows.map((row) =>
        headers.map((key) => stringifyValue(row[key]))
      )
    };
  }

  if (Array.isArray(content) && content.length) {
    if (Array.isArray(content[0])) {
      return {
        headers: [],
        rows: content.map((row) => normalizeRowArray(row))
      };
    }

    if (isPlainObject(content[0])) {
      const headers = Object.keys(content[0]);
      return {
        headers,
        rows: content.map((row) =>
          headers.map((key) => stringifyValue(row[key]))
        )
      };
    }
  }

  return {
    headers: ["表格"],
    rows: [["请提供 table 类型的 rows 数据"]]
  };
}

function normalizeSyntaxContent(content) {
  if (typeof content === "string") {
    return {
      signature: content,
      pattern: "",
      rules: [],
      examples: []
    };
  }

  const examples = Array.isArray(content?.examples)
    ? content.examples.map((item) =>
        typeof item === "string"
          ? { title: "", code: item, note: "" }
          : {
              title: item?.title || "",
              code: item?.code || item?.snippet || "",
              note: item?.note || item?.desc || ""
            }
      )
    : [];

  return {
    signature: content?.signature || content?.syntax || content?.code || "",
    pattern: content?.pattern || "",
    rules: normalizeStringList(content?.rules || content?.notes),
    examples
  };
}

function normalizePitfallContent(content) {
  if (Array.isArray(content)) {
    return {
      sections: content.map((item) =>
        typeof item === "string"
          ? { label: "注意", body: item }
          : {
              label: item?.label || item?.title || "注意",
              body: item?.body || item?.text || item?.items || ""
            }
      )
    };
  }

  if (isPlainObject(content)) {
    const mappedSections = [
      ["问题", content.problem || content.issue || content.wrong],
      ["原因", content.why || content.cause],
      ["后果", content.effect || content.impact],
      ["修复", content.fix || content.solution],
      ["避免方式", content.avoid || content.tips]
    ]
      .filter(([, value]) => Boolean(value))
      .map(([label, value]) => ({
        label,
        body: value
      }));

    return { sections: mappedSections };
  }

  return {
    sections: typeof content === "string" ? [{ label: "注意", body: content }] : []
  };
}

function normalizeKeywordsContent(content) {
  const items = Array.isArray(content) ? content : content?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    if (typeof item === "string") {
      return { term: item, desc: "", note: "" };
    }

    return {
      term: item?.term || item?.keyword || item?.name || "",
      desc: item?.desc || item?.meaning || item?.description || "",
      note: item?.note || item?.tips || ""
    };
  });
}

function normalizeSnippetsContent(content) {
  const items = Array.isArray(content) ? content : content?.items;

  if (typeof content === "string") {
    return [{ title: "", code: content, note: "" }];
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    if (typeof item === "string") {
      return { title: "", code: item, note: "" };
    }

    return {
      title: item?.title || item?.name || "",
      code: item?.code || item?.snippet || "",
      note: item?.note || item?.desc || ""
    };
  });
}

function extractSearchText(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => extractSearchText(item)).join(" ");
  }

  if (isPlainObject(value)) {
    return Object.values(value)
      .map((item) => extractSearchText(item))
      .join(" ");
  }

  return "";
}

function normalizeRowArray(row) {
  return Array.isArray(row) ? row.map((cell) => stringifyValue(cell)) : [stringifyValue(row)];
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function stringifyValue(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return extractSearchText(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entityMap[char];
  });
}

function loadStoredOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to read saved order:", error);
    return null;
  }
}

function saveOrder(order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    console.warn("Failed to save order:", error);
  }
}

function clearStoredOrder() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved order:", error);
  }
}

function normalizeOrder(savedOrder) {
  if (!Array.isArray(savedOrder) || savedOrder.length === 0) {
    return [...defaultOrder];
  }

  const uniqueIds = [];
  savedOrder.forEach((id) => {
    if (cardMap.has(id) && !uniqueIds.includes(id)) {
      uniqueIds.push(id);
    }
  });

  defaultOrder.forEach((id) => {
    if (!uniqueIds.includes(id)) {
      uniqueIds.push(id);
    }
  });

  return uniqueIds;
}

function scheduleCardLayout() {
  if (!elements.grid) {
    return;
  }

  window.cancelAnimationFrame(state.layoutFrame);
  state.layoutFrame = window.requestAnimationFrame(() => {
    syncResponsiveGrid();
    applyCardSpans();
  });
}

function syncResponsiveGrid() {
  const visibleCards = elements.grid.querySelectorAll(".cheat-card").length || 1;
  const gridStyles = window.getComputedStyle(elements.grid);
  const containerWidth = elements.grid.clientWidth;
  const gridGap = parseFloat(gridStyles.getPropertyValue("column-gap")) || 0;
  const minCardWidth =
    parseFloat(gridStyles.getPropertyValue("--card-min-width")) || 280;
  const maxCardWidth =
    parseFloat(gridStyles.getPropertyValue("--card-max-width")) || minCardWidth;

  if (!containerWidth) {
    return;
  }

  let columnCount = Math.max(
    1,
    Math.min(
      visibleCards,
      Math.ceil((containerWidth + gridGap) / (maxCardWidth + gridGap)) || 1
    )
  );

  while (columnCount < visibleCards) {
    const nextCount = columnCount + 1;
    const nextWidth =
      (containerWidth - gridGap * (nextCount - 1)) / nextCount;

    if (nextWidth < minCardWidth) {
      break;
    }

    columnCount = nextCount;
  }

  elements.grid.style.setProperty("--grid-column-count", String(columnCount));
}

function applyCardSpans() {
  const gridStyles = window.getComputedStyle(elements.grid);
  const rowSize = parseFloat(gridStyles.getPropertyValue("grid-auto-rows"));
  const rowGap = parseFloat(gridStyles.getPropertyValue("row-gap"));

  if (!rowSize) {
    return;
  }

  Array.from(elements.grid.children).forEach((item) => {
    if (item.classList.contains("cheat-card")) {
      item.style.gridRowEnd = "auto";
    }
  });

  Array.from(elements.grid.children).forEach((item) => {
    if (!item.classList.contains("cheat-card")) {
      return;
    }

    const itemHeight = item.getBoundingClientRect().height;
    const span = Math.max(1, Math.ceil((itemHeight + rowGap) / (rowSize + rowGap)));
    item.style.gridRowEnd = `span ${span}`;
  });
}
