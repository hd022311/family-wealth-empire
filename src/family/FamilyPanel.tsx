import { useEffect, useState } from "react";
import type { State } from "../simulation";
import type { FamilyAction, Person, Decision } from "./types";
import { relationship, relativeRole } from "./engine";
import { LegalCase } from "../legal/LawCenter";
const money = (v: number) => Math.round(v).toLocaleString("zh-TW");
const choices = {
  support: "支持",
  counter: "提出條件",
  decline: "拒絕目前方案",
  legal: "尋求法律途徑",
};
function Responses({
  responses,
  state,
}: {
  responses: Decision[];
  state: State;
}) {
  return (
    <div className="npc-responses">
      {responses.map((d, i) => (
        <article key={`${d.personId}:${i}`}>
          <strong>
            {state.clan.people.find((p) => p.id === d.personId)?.name} ·{" "}
            {choices[d.choice]}
          </strong>
          <p>
            偏好：
            {
              {
                keep: "保留祖厝",
                sell: "出售變現",
                compensation: "補償與安全準備金",
              }[d.preference]
            }
          </p>
          <details>
            <summary>為何這樣決定？</summary>
            <ul>
              {d.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
        </article>
      ))}
    </div>
  );
}
function FamilyTree({
  state,
  onSelect,
}: {
  state: State;
  onSelect: (id: number) => void;
}) {
  const c = state.clan;
  const depth = new Map<number, number>();
  const level = (id: number, path: number[] = []): number => {
    if (path.includes(id)) return 0;
    const parents = c.links.filter((l) => l.kind === "parent" && l.to === id);
    return parents.length
      ? Math.max(...parents.map((l) => level(l.from, [...path, id]))) + 1
      : 0;
  };
  c.people.forEach((p) => depth.set(p.id, level(p.id)));
  c.links
    .filter((l) => l.kind === "spouse")
    .forEach((l) => {
      const d = Math.max(depth.get(l.from) ?? 0, depth.get(l.to) ?? 0);
      depth.set(l.from, d);
      depth.set(l.to, d);
    });
  const rows = new Map<number, Person[]>();
  c.people.forEach((p) => {
    const d = depth.get(p.id) ?? 0;
    rows.set(d, [...(rows.get(d) ?? []), p]);
  });
  const width = Math.max(800, ...[...rows.values()].map((r) => r.length * 175));
  const positions = new Map<number, { x: number; y: number }>();
  rows.forEach((row, d) =>
    row.forEach((p, i) =>
      positions.set(p.id, {
        x: (width * (i + 1)) / (row.length + 1),
        y: 65 + d * 140,
      }),
    ),
  );
  const height = (Math.max(...depth.values()) + 1) * 140;
  return (
    <div className="family-tree-scroll" aria-label="視覺化家族樹">
      <div className="family-tree" style={{ width, height }}>
        <svg width={width} height={height} aria-hidden="true">
          {c.links.map((l, i) => {
            const a = positions.get(l.from)!,
              b = positions.get(l.to)!;
            return (
              <path
                key={i}
                d={
                  l.kind === "spouse"
                    ? `M${a.x},${a.y} L${b.x},${b.y}`
                    : `M${a.x},${a.y + 38} V${(a.y + b.y) / 2} H${b.x} V${b.y - 38}`
                }
                fill="none"
                stroke={l.kind === "spouse" ? "#b5848b" : "#a7bca0"}
                strokeWidth="2"
                strokeDasharray={l.kind === "spouse" ? "5 5" : undefined}
              />
            );
          })}
        </svg>
        {c.people.map((p) => {
          const at = positions.get(p.id)!;
          return (
            <button
              key={p.id}
              className={`tree-person ${p.id === c.activeId ? "current" : ""} ${!p.alive ? "deceased" : ""}`}
              style={{ left: at.x - 72, top: at.y - 38 }}
              aria-label={`${p.name} 人物卡`}
              onClick={() => onSelect(p.id)}
            >
              <span className="tree-avatar">{p.name[0]}</span>
              <b>{p.name}</b>
              <small>
                {relativeRole(c, p.id)} · {Math.floor(p.age)} 歲 ·{" "}
                {p.alive ? "在世" : "已故"}
              </small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function RelationshipGraph({ state }: { state: State }) {
  const c = structuredClone(state.clan),
    others = c.people.filter((p) => p.id !== c.activeId && p.alive).slice(0, 5);
  return (
    <svg
      className="relation-graph"
      viewBox="0 0 340 230"
      role="img"
      aria-label="家人關係圖"
    >
      {others.map((p, i) => {
        const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2,
          x = 170 + 120 * Math.cos(angle),
          y = 115 + 86 * Math.sin(angle),
          r = relationship(c, c.activeId, p.id);
        return (
          <g key={p.id}>
            <line
              x1="170"
              y1="115"
              x2={x}
              y2={y}
              stroke={
                r.conflict > 50
                  ? "#be8575"
                  : r.trust > 60
                    ? "#82a67d"
                    : "#c7b785"
              }
              strokeWidth="2"
            />
            <text
              x={(x + 170) / 2}
              y={(y + 115) / 2 - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#76866c"
            >
              信任 {r.trust}
            </text>
            <circle cx={x} cy={y} r="24" fill="#edf2df" stroke="#bdcdae" />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="10"
              fill="#4f7255"
            >
              {p.name.slice(0, 5)}
            </text>
          </g>
        );
      })}
      <circle cx="170" cy="115" r="25" fill="#477b6d" />
      <text x="170" y="119" textAnchor="middle" fontSize="11" fill="#fff8df">
        目前家主
      </text>
    </svg>
  );
}
export function FamilyPanel({
  state,
  onAction,
  onSuccession,
  focused,
  error,
}: {
  state: State;
  onAction: (a: FamilyAction) => void;
  onSuccession: (id: number) => void;
  focused?: number;
  error?: string;
}) {
  const c = state.clan,
    [selected, setSelected] = useState(focused ?? c.activeId);
  useEffect(() => {
    if (focused !== undefined) setSelected(focused);
  }, [focused]);
  const p = c.people.find((p) => p.id === selected) ?? c.people[0];
  const r = relationship(structuredClone(c), c.activeId, p.id);
  const episode = c.episode,
    estates = c.estates;
  const canBackground =
    c.background === "legacy" &&
    state.month === 0 &&
    !state.properties.some((p) => p.owned) &&
    !state.shares.some(Boolean) &&
    state.city.sequence === 0;
  return (
    <section className="family-hub" aria-label="家族關係與人性模擬">
      <div className="family-hub-title">
        <div>
          <div className="eyebrow">FAMILY · CHOICES & MEMORY</div>
          <h2>家人有自己的生活，也有自己的選擇。</h2>
        </div>
        <span>健康 {c.playerHealth.toFixed(0)} · 固定種子模擬</span>
      </div>
      {c.background === "legacy" && (
        <div className="background-picker">
          <h3>選擇開局家庭背景</h3>
          <p>
            {canBackground
              ? "背景會改變你的起始現金與家庭，不會把父母資產算進玩家帳本。"
              : "此為已有紀錄的家族。保留現有資產；請建立新家族後選背景，不覆寫歷史。"}
          </p>
          <div>
            {[
              {
                id: "self-made",
                name: "A · 白手起家",
                cash: "30 萬",
                text: "父母雙亡，沒有父母遺產；從個人準備金出發。",
              },
              {
                id: "wealthy",
                name: "B · 富裕家庭",
                cash: "180 萬",
                text: "父母健在，另持房產、股票與企業；你沒有直接處分權。",
              },
              {
                id: "ordinary",
                name: "C · 一般家庭",
                cash: "60 萬",
                text: "父母健在，有獨立自住房、退休收入與存款。",
              },
            ].map((b) => (
              <button
                key={b.id}
                disabled={!canBackground}
                onClick={() =>
                  onAction({
                    type: "background",
                    background: b.id as "self-made" | "wealthy" | "ordinary",
                  })
                }
              >
                <strong>{b.name}</strong>
                <b>個人現金 {b.cash}</b>
                <small>{b.text}</small>
              </button>
            ))}
          </div>
        </div>
      )}
      <FamilyTree state={state} onSelect={setSelected} />
      <RelationshipGraph state={state} />
      <div className="family-hub-grid">
        <article className="person-card">
          <div className="eyebrow">INDEPENDENT CHARACTER</div>
          <h3>
            {p.name} · {relativeRole(c, p.id)}
          </h3>
          <p>
            {Math.floor(p.age)} 歲 · {p.alive ? "在世" : "已故"} · 健康{" "}
            {p.health.toFixed(0)} · 目標：{p.goal}
          </p>
          <dl>
            <dt>個人現金</dt>
            <dd>
              ＄{money(p.id === c.activeId ? state.cash : p.finances.cash)}
            </dd>
            <dt>獨立房產</dt>
            <dd>＄{money(p.finances.home)}</dd>
            <dt>股票／企業</dt>
            <dd>
              ＄{money(p.finances.stocks)} / {money(p.finances.business)}
            </dd>
            <dt>個人負債</dt>
            <dd>＄{money(p.finances.debt)}</dd>
            <dt>每月收入／支出</dt>
            <dd>
              {money(p.finances.income)} / {money(p.finances.expenses)}
            </dd>
          </dl>
          <p className="ownership-note">
            以上為此角色的獨立財產；父母、手足及配偶的財產不加進玩家淨資產。已故角色資產見遺產保管清冊。
          </p>
          <div className="traits">
            {[
              ["責任感", p.traits.duty],
              ["自主性", p.traits.autonomy],
              ["安全價值", p.traits.security],
              ["同理傾向", p.traits.empathy],
              ["家屋認同", p.values.home],
              ["公平價值", p.values.fairness],
              ["風險偏好", p.risk],
            ].map(([name, n]) => (
              <label key={name}>
                {name}
                <meter min="0" max="100" value={Number(n)} />
                <span>{n}</span>
              </label>
            ))}
          </div>
          <p className="hint">
            這些傾向沒有固定的好人／壞人分類。責任：
            {p.responsibilities.join("、") || "依個人生活目標安排"}。
          </p>
          {p.id !== c.activeId && (
            <>
              <div className="relationship-card">
                <h4>與目前家主的關係</h4>
                <div>
                  {[
                    ["親密", r.closeness],
                    ["信任", r.trust],
                    ["衝突", r.conflict],
                  ].map(([name, n]) => (
                    <span key={name}>
                      {name}
                      <b>{n}</b>
                    </span>
                  ))}
                </div>
                <p>
                  投入照顧 {r.careHours} 小時 · 互助 ＄{money(r.helpGiven)}
                </p>
              </div>
              <div className="actions">
                {[
                  { type: "visit", name: "探望 · ＄1,200 / 4h" },
                  { type: "assist", name: "自願援助 · ＄40,000" },
                  { type: "loan", name: "借款紀錄 · ＄60,000" },
                  { type: "promise", name: "承諾每月照顧 12h" },
                ].map((a) => (
                  <button
                    key={a.type}
                    disabled={!p.alive || state.dead}
                    onClick={() =>
                      onAction({
                        type: a.type as "visit" | "assist" | "loan" | "promise",
                        personId: p.id,
                      })
                    }
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </article>
        <div className="family-events">
          <div className="eyebrow">LIFE EVENTS · REAL CONSEQUENCES</div>
          <h3>家庭故事與會議</h3>
          <p className="family-message" role="status">
            {error || c.lastNotice}
          </p>
          {!episode && !state.story && (
            <>
              <p>
                父母的疾病風險依背景與固定種子模擬，也可主動開啟以下虛構故事。每個選擇都會影響資金、照顧、工作時間或記憶。
              </p>
              <button
                disabled={
                  state.dead ||
                  !c.people.some(
                    (p) => p.alive && relativeRole(c, p.id) === "父母",
                  )
                }
                onClick={() => onAction({ type: "start-story" })}
              >
                開始照顧故事：父親重大疾病
              </button>
            </>
          )}
          {episode?.phase === "illness" && (
            <article className="story-card">
              <div className="story-avatars" aria-hidden="true">
                父　✚　家
              </div>
              <h3>父親突然重大疾病</h3>
              <p>
                父親希望有照顧安排。請選自願方案；這不是法院判定的扶養分擔或真實醫療建議。
              </p>
              <div className="story-choices">
                {[
                  { id: "medical", label: "自費治療：12 萬＋每月 1.8 萬，4h" },
                  { id: "shared", label: "協商共同照顧：4 萬＋每月 1 萬，8h" },
                  { id: "time", label: "親自照顧：1.8 萬＋每月 6 千，24h" },
                  { id: "defer", label: "暫不承諾費用：病情與信任風險增加" },
                ].map((o) => (
                  <button
                    key={o.id}
                    onClick={() =>
                      onAction({
                        type: "care",
                        choice: o.id as "medical" | "shared" | "time" | "defer",
                      })
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </article>
          )}
          {episode?.phase === "sibling" && (
            <article className="story-card">
              <div className="story-avatars" aria-hidden="true">
                家　⌂　學
              </div>
              <h3>手足的房貸與教育費困境</h3>
              <p>
                林承安的家人也有安全與教育需求。他會依自己的處境回應，並不受你的選項直接控制。
              </p>
              <div className="story-choices">
                {[
                  { id: "gift", label: "贈與協助 · ＄40,000" },
                  { id: "loan", label: "先行借款 · ＄60,000" },
                  { id: "time", label: "承擔額外照顧 12h，工作與健康受影響" },
                  {
                    id: "meeting",
                    label: "家庭會議 · ＄2,000，不預設達成協議",
                  },
                ].map((o) => (
                  <button
                    key={o.id}
                    onClick={() =>
                      onAction({
                        type: "burden",
                        choice: o.id as "gift" | "loan" | "time" | "meeting",
                      })
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </article>
          )}
          {episode && (
            <>
              <div className="care-summary">
                目前階段：
                {
                  {
                    illness: "待選照顧方案",
                    sibling: "手足負擔協商",
                    care: "長期照顧中",
                    inheritance: "遺產協商",
                    "settled-intent": "意向已記錄",
                  }[episode.phase]
                }{" "}
                · 每月 ＄{money(episode.careMonthly)} · {episode.careHours} 小時
              </div>
              <Responses responses={episode.responses} state={state} />
              <p className="hint">
                使用原有時間控制繼續病程；離線不推進。治療選擇影響虛構病程長短，不保證治癒或死亡時點。
              </p>
            </>
          )}
          {estates.map((e) => (
            <article className="estate-card" key={e.id}>
              <div className="story-avatars" aria-hidden="true">
                ⌂　⚖　家
              </div>
              <h3>
                {c.people.find((p) => p.id === e.ownerId)?.name}的遺產與祖厝
              </h3>
              <p>
                死亡日期 {e.deathDate} ·{" "}
                {e.status === "awaiting-facts"
                  ? "待整理清冊"
                  : e.status === "disputed"
                    ? "協商有分歧"
                    : "方案保存，尚未依法完成分配"}
              </p>
              <dl>
                <dt>保管現金</dt>
                <dd>＄{money(e.finances.cash)}</dd>
                <dt>房屋／股票／企業</dt>
                <dd>
                  {money(e.finances.home)} / {money(e.finances.stocks)} /{" "}
                  {money(e.finances.business)}
                </dd>
                <dt>遺產債務</dt>
                <dd>＄{money(e.finances.debt)}</dd>
              </dl>
              <p className="legal-pending">
                法定權利、遺囑、夫妻財產、稅額與分割要件未確認前，不自動加進玩家現金；口頭承諾不當成有效遺囑。
              </p>
              <button
                disabled={state.dead || e.status !== "awaiting-facts"}
                onClick={() =>
                  onAction({ type: "review-estate", estateId: e.id })
                }
              >
                整理遺產清冊
              </button>
              <div className="story-choices">
                {[
                  { id: "keep", label: "提案共同保留祖厝" },
                  { id: "sell", label: "提案出售再分配" },
                  { id: "compensation", label: "提案保留並補償其他人" },
                ].map((o) => (
                  <button
                    key={o.id}
                    disabled={state.dead || e.status === "awaiting-facts"}
                    onClick={() =>
                      onAction({
                        type: "meeting",
                        proposal: o.id as "keep" | "sell" | "compensation",
                      })
                    }
                  >
                    {o.label} · 會議費 ＄2,000
                  </button>
                ))}
              </div>
              <button
                disabled={state.dead || e.legalProceedings}
                onClick={() =>
                  onAction({ type: "legal-route", estateId: e.id })
                }
              >
                尋求法律諮詢 · ＄6,000（無預設勝敗）
              </button>
              <Responses responses={e.responses} state={state} />
              <details>
                <summary>查看法律規則／事實／爭議分層</summary>
                <LegalCase facts={e.facts} />
              </details>
            </article>
          ))}
        </div>
      </div>
      <section className="family-memory">
        <h3>家族記憶與交易軌跡</h3>
        <p className="hint">
          客觀紀錄、角色認知與未審查文件分開保存。借款紀錄不等於法院確認的債權，未計入已確認資產。跨世代接班保留整個家族網絡與爭議。
        </p>
        <div className="memory-grid">
          <div>
            {c.memories
              .slice(-20)
              .reverse()
              .map((m) => (
                <article key={m.id} className={`memory ${m.kind}`}>
                  <span>
                    {m.kind === "fact"
                      ? "客觀遊戲事實"
                      : m.kind === "perception"
                        ? "角色主觀認知"
                        : "文件：尚未法律審查"}{" "}
                    · 第 {m.generation} 代／第 {m.month} 月
                  </span>
                  <p>{m.text}</p>
                </article>
              ))}
            {!c.memories.length && (
              <p>尚無重大互動。選擇人物並探望或開啟照顧故事。</p>
            )}
          </div>
          <div>
            <h4>最近交易（完整資料隨存檔保存）</h4>
            {c.transactions
              .slice(-12)
              .reverse()
              .map((t) => (
                <details key={t.id}>
                  <summary>
                    第 {t.month} 月 · {t.label}
                  </summary>
                  <ul>
                    {t.postings.map((p, i) => (
                      <li key={i}>
                        {p.account}：{p.delta >= 0 ? "+" : ""}
                        {money(p.delta)}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            <h4>口頭承諾與借款</h4>
            <p>
              {c.promises.length} 項照顧承諾、{c.loans.length}{" "}
              筆效力待確認的借款；不據此改動法定份額。
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
