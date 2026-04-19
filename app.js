(() => {
  const state = {
    records: [],
    query: "",
    viewLimit: 50,
  };

  const dom = {
    query: document.getElementById("query"),
    clearQuery: document.getElementById("clearQuery"),
    status: document.getElementById("status"),
    results: document.getElementById("results"),
    limit: document.getElementById("limit"),
    template: document.getElementById("resultItemTemplate"),
    fileInput: document.getElementById("jsonFile"),
  };

  const normalizeText = (value) => {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  const tokenizeQuery = (query) => {
    return String(query || "")
      .normalize("NFKC")
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((token) => token.replace(/\s+/g, ""))
      .filter(Boolean);
  };

  const escapeHtml = (value) => {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  const toSearchRecord = (line) => {
    const rawLine = String(line || "");
    return {
      rawLine,
      searchableText: normalizeText(rawLine),
    };
  };

  const loadFromObject = (jsonObj) => {
    if (!jsonObj || !Array.isArray(jsonObj.addresses)) {
      throw new Error("`addresses` 配列が見つかりません。");
    }

    state.records = jsonObj.addresses.map(toSearchRecord);
    updateStatus(`読み込み完了: ${state.records.length.toLocaleString("ja-JP")}件`);
    runSearch();
  };

  const updateStatus = (message) => {
    dom.status.textContent = message;
  };

  const readJsonFile = async (file) => {
    const text = await file.text();
    return JSON.parse(text);
  };

  const loadJson = async () => {
    updateStatus("データを読み込み中...");

    try {
      const response = await fetch("./kenall.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`読み込み失敗: HTTP ${response.status}`);
      }
      const json = await response.json();
      loadFromObject(json);
    } catch (error) {
      updateStatus("自動読込に失敗。下のファイル選択で`kenall.json`を指定してください。");
      console.error(error);
    }
  };

  const highlightText = (text, tokens) => {
    let safeText = escapeHtml(text);
    const uniqTokens = Array.from(new Set(tokens.filter(Boolean))).sort((a, b) => b.length - a.length);

    for (const token of uniqTokens) {
      const escapedToken = escapeHtml(token);
      if (!escapedToken) {
        continue;
      }
      const re = new RegExp(escapedToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
      safeText = safeText.replace(re, (m) => `<mark>${m}</mark>`);
    }

    return safeText;
  };

  const searchRecords = (query, limit) => {
    const normalized = normalizeText(query);
    if (!normalized) {
      return state.records.slice(0, limit);
    }

    const tokens = tokenizeQuery(query);
    const results = [];

    for (const record of state.records) {
      const matched = tokens.every((t) => record.searchableText.includes(t));
      if (matched) {
        results.push(record);
      }
      if (results.length >= limit) {
        break;
      }
    }

    return results;
  };

  const renderResults = (records, query) => {
    dom.results.textContent = "";

    const normalized = normalizeText(query);
    const tokens = normalized ? tokenizeQuery(query) : [];

    const fragment = document.createDocumentFragment();
    for (const record of records) {
      const node = dom.template.content.firstElementChild.cloneNode(true);

      node.querySelector(".raw-line").innerHTML = highlightText(record.rawLine, tokens);

      fragment.appendChild(node);
    }

    dom.results.appendChild(fragment);
  };

  const runSearch = () => {
    if (state.records.length === 0) {
      return;
    }

    const results = searchRecords(state.query, state.viewLimit);
    renderResults(results, state.query);

    const suffix = state.query ? ` / 検索語: ${state.query}` : "";
    updateStatus(`表示中: ${results.length.toLocaleString("ja-JP")}件${suffix}`);
  };

  const debounce = (fn, delayMs) => {
    let timerId = 0;
    return (...args) => {
      clearTimeout(timerId);
      timerId = window.setTimeout(() => fn(...args), delayMs);
    };
  };

  const onQueryInput = debounce((event) => {
    state.query = event.target.value || "";
    runSearch();
  }, 80);

  const onLimitChange = (event) => {
    state.viewLimit = Number.parseInt(event.target.value, 10) || 50;
    runSearch();
  };

  const onClearQuery = () => {
    state.query = "";
    dom.query.value = "";
    runSearch();
    dom.query.focus();
  };

  const onFileSelected = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const json = await readJsonFile(file);
      loadFromObject(json);
    } catch (error) {
      updateStatus("ファイルの読み込みに失敗しました。JSON形式を確認してください。");
      console.error(error);
    }
  };

  const init = async () => {
    dom.query.addEventListener("input", onQueryInput);
    dom.clearQuery.addEventListener("click", onClearQuery);
    dom.limit.addEventListener("change", onLimitChange);
    dom.fileInput.addEventListener("change", onFileSelected);
    await loadJson();
  };

  init();
})();
