const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const resumeInput = $("#resumeInput");
const jdInput = $("#jdInput");
const roleSelect = $("#roleSelect");
const levelSelect = $("#levelSelect");
const rolePill = $("#rolePill");
const scoreRing = $("#scoreRing");
const scoreValue = $("#scoreValue");
const scoreTitle = $("#scoreTitle");
const scoreSummary = $("#scoreSummary");
const insightGrid = $("#insightGrid");
const rewritePreview = $("#rewritePreview");
const riskList = $("#riskList");
const historyList = $("#historyList");
const toast = $("#toast");

const samples = {
  resume: `张同学｜本科｜信息管理与信息系统
项目：校园二手交易小程序
- 负责需求调研、原型设计和数据看板，访谈 28 名学生，梳理 16 个交易场景
- 使用 Axure 输出 35 页高保真原型，推动开发完成商品发布、搜索、议价、订单状态流转
- 上线试运行 3 周，累计发布商品 860 件，交易转化率 12.6%
实习：互联网教育公司产品助理
- 跟进课程购买路径优化，整理用户反馈 180 条，提出页面信息层级和表单字段优化建议
- 协同运营搭建活动页，活动期新增线索 1,240 条
技能：PRD、竞品分析、SQL 基础、飞书多维表格、Figma`,
  jd: `岗位：AI 产品经理实习生
职责：
1. 参与 AI 工具类产品的需求分析、原型设计和效果评估
2. 关注用户使用路径，设计 Prompt 配置、生成结果预览、反馈闭环
3. 与算法、前端、运营协作推动功能上线
要求：
1. 有产品原型、数据分析、用户调研经验
2. 理解 AIGC、Prompt、智能体或低代码产品优先
3. 能清晰表达项目价值，有量化结果和复盘意识`
};

const keywordPool = ["AI", "AIGC", "Prompt", "原型", "需求分析", "用户调研", "数据分析", "效果评估", "协作", "上线", "量化", "反馈闭环", "智能体", "低代码"];

function countText() {
  $("#resumeCount").textContent = `${resumeInput.value.trim().length} 字`;
  $("#jdCount").textContent = `${jdInput.value.trim().length} 字`;
}

function getMatchedKeywords() {
  const combinedResume = resumeInput.value.toLowerCase();
  const jd = jdInput.value.toLowerCase();
  return keywordPool.filter((word) => {
    const token = word.toLowerCase();
    return jd.includes(token) && combinedResume.includes(token);
  });
}

function getMissingKeywords() {
  const combinedResume = resumeInput.value.toLowerCase();
  const jd = jdInput.value.toLowerCase();
  return keywordPool.filter((word) => {
    const token = word.toLowerCase();
    return jd.includes(token) && !combinedResume.includes(token);
  });
}

function calculateScore() {
  const base = resumeInput.value.trim() && jdInput.value.trim() ? 46 : 0;
  const matched = getMatchedKeywords().length * 5;
  const proofBonus = /\d|%|条|人|周|件|次/.test(resumeInput.value) ? 12 : 0;
  const aiBonus = /ai|aigc|prompt|智能体|低代码/i.test(resumeInput.value) ? 10 : 0;
  const atsBonus = $("#atsToggle").checked ? 6 : 0;
  return Math.min(96, base + matched + proofBonus + aiBonus + atsBonus);
}

function insight(label, text, value, tone = "blue") {
  const color = tone === "green" ? "var(--green)" : tone === "amber" ? "var(--amber)" : "var(--blue)";
  return `
    <div class="insight">
      <span class="tag">${label}</span>
      <div>
        <strong>${text}</strong>
        <div class="meter" style="margin-top:8px"><span style="--value:${value}%; background:${color}"></span></div>
      </div>
      <strong>${value}%</strong>
    </div>
  `;
}

function buildRewrite(score) {
  const role = roleSelect.value;
  const matched = getMatchedKeywords();
  const missing = getMissingKeywords();
  const intensity = Number($("#toneRange").value);
  const verb = intensity === 1 ? "参与" : intensity === 2 ? "主导推进" : "独立负责并推动";
  const aiLine = missing.includes("Prompt") || role.includes("AI")
    ? "补充 AI 工具体验理解：围绕输入配置、生成预览、结果反馈设计闭环，体现对 AIGC 产品链路的判断。"
    : "强化岗位关键词和业务结果之间的对应关系，避免只罗列技能。";

  return `
    <h3>简历摘要</h3>
    <p>${levelSelect.value} ${role} 候选人，具备用户调研、原型设计、数据分析和跨团队协作经验。曾${verb}校园交易与课程转化相关项目，能从用户场景拆解需求，并用量化指标验证优化效果。当前 JD 匹配度 ${score}%，建议重点突出 ${matched.slice(0, 4).join("、") || "需求分析、原型、量化结果"}。</p>
    <h3>项目经历改写</h3>
    <p><strong>校园二手交易小程序｜产品设计与增长验证</strong></p>
    <p>通过访谈 28 名学生梳理发布、搜索、议价和订单流转等核心场景，输出 35 页高保真原型并协同开发上线。试运行 3 周内累计发布商品 860 件，交易转化率达到 12.6%。建议在投递 ${role} 时补充“需求假设 - 原型验证 - 数据复盘”的过程描述。</p>
    <h3>下一步补强</h3>
    <p>${aiLine}</p>
  `;
}

function buildRisks() {
  const risks = [
    {
      level: "high",
      title: "AI 产品经验可能被追问",
      body: "如果简历没有真实 AI 项目，不要硬写“负责大模型产品”。可以改成对 Prompt 配置、生成结果评估、用户反馈闭环的产品理解。"
    },
    {
      level: "",
      title: "量化结果需要解释口径",
      body: "例如“交易转化率 12.6%”要准备计算方式、样本周期和你具体影响了哪个环节。"
    },
    {
      level: "",
      title: "协作贡献要更具体",
      body: "面试官会区分“参与”和“主导”。准备你产出的 PRD、原型、数据表或评审记录。"
    }
  ];

  if (!$("#interviewToggle").checked) {
    risks.pop();
  }

  riskList.innerHTML = risks.map((risk) => `
    <div class="risk ${risk.level}">
      <strong>${risk.title}</strong>
      <p>${risk.body}</p>
    </div>
  `).join("");
}

function saveHistory(score) {
  const item = {
    role: roleSelect.value,
    score,
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  };
  const history = JSON.parse(localStorage.getItem("resumeOptimizerHistory") || "[]");
  history.unshift(item);
  localStorage.setItem("resumeOptimizerHistory", JSON.stringify(history.slice(0, 5)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("resumeOptimizerHistory") || "[]");
  historyList.innerHTML = history.length
    ? history.map((item) => `
      <button class="history-item">
        <strong>${item.role} · ${item.score}%</strong>
        <small>${item.time} 生成</small>
      </button>
    `).join("")
    : `<div class="history-item"><strong>暂无记录</strong><small>生成后会保存在本机浏览器</small></div>`;
}

function analyze() {
  countText();
  const score = calculateScore();
  scoreRing.style.setProperty("--score", score);
  scoreValue.textContent = score;
  rolePill.textContent = roleSelect.value;

  const missing = getMissingKeywords();
  const matched = getMatchedKeywords();

  scoreTitle.textContent = score > 78 ? "匹配度较高" : score > 58 ? "可投递，需补强" : "需要明显改写";
  scoreSummary.textContent = score
    ? `已识别 ${matched.length} 个命中关键词，${missing.length} 个建议补充项。`
    : "请先填入简历和目标 JD。";

  insightGrid.innerHTML = [
    insight("关键词", matched.length ? `命中：${matched.slice(0, 5).join("、")}` : "缺少 JD 关键词承接", Math.min(95, 35 + matched.length * 9), "green"),
    insight("项目证据", /\d|%|条|人|周|件|次/.test(resumeInput.value) ? "已有量化结果，可继续解释口径" : "缺少数字、规模或结果", /\d|%|条|人|周|件|次/.test(resumeInput.value) ? 82 : 42, "blue"),
    insight("岗位差距", missing.length ? `建议补充：${missing.slice(0, 4).join("、")}` : "JD 要点覆盖较完整", Math.max(34, 92 - missing.length * 8), "amber")
  ].join("");

  rewritePreview.innerHTML = score ? buildRewrite(score) : "<p>完成分析后，这里会生成更贴近目标岗位的简历摘要和项目经历表达。</p>";
  buildRisks();

  if (score) {
    saveHistory(score);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

resumeInput.addEventListener("input", countText);
jdInput.addEventListener("input", countText);
roleSelect.addEventListener("change", () => {
  rolePill.textContent = roleSelect.value;
});

$("#sampleBtn").addEventListener("click", () => {
  resumeInput.value = samples.resume;
  jdInput.value = samples.jd;
  roleSelect.value = "AI 产品经理";
  countText();
  analyze();
});

$("#analyzeBtn").addEventListener("click", analyze);
$("#regenerateBtn").addEventListener("click", analyze);
$("#clearHistory").addEventListener("click", () => {
  localStorage.removeItem("resumeOptimizerHistory");
  renderHistory();
});

$("#copyBtn").addEventListener("click", async () => {
  const text = rewritePreview.innerText.trim();
  if (!text || text.startsWith("完成分析")) {
    showToast("请先生成改写稿");
    return;
  }
  await navigator.clipboard.writeText(text);
  showToast("改写稿已复制");
});

$("#toneRange").addEventListener("input", () => {
  if (resumeInput.value.trim() && jdInput.value.trim()) {
    rewritePreview.innerHTML = buildRewrite(calculateScore());
  }
});

$("#interviewToggle").addEventListener("change", buildRisks);

$$(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".tab").forEach((tab) => tab.classList.remove("active"));
    $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.tab}`).classList.add("active");
  });
});

countText();
renderHistory();
buildRisks();
