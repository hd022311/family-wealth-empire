import { useEffect, useRef, useState } from "react";
import { sources, topics, searchTopics } from "./catalog";
import {
  statutoryShares,
  inheritanceTax,
  reservedShare,
  willAssessment,
  type SuccessionFacts,
} from "./engine";
import type { State } from "../simulation";
export function LegalCase({ facts }: { facts: SuccessionFacts }) {
  const result = statutoryShares(facts),
    tax = inheritanceTax(facts.deathDate ?? ""),
    reserved = reservedShare(facts.deathDate ?? "");
  return (
    <div className="legal-case">
      <h3>法律與模擬分離檢視</h3>
      <section>
        <h4>A · 法律規則與驗證狀態</h4>
        <p className="legal-pending">
          尚未完成法律驗證。沒有可確認適用的官方版本時，不顯示應繼分、特留分或稅額。
        </p>
        <p>
          引擎版本 {result.ruleVersion} · 適用基準日{" "}
          {result.applicableDate ?? "未確認"}
        </p>
        {result.shares && result.status === "confirmed" && (
          <ul>
            {result.shares.map((s) => (
              <li key={s.id}>
                {s.name}：{s.fraction.numerator}/{s.fraction.denominator}
                （僅法定份額，非實際分割金額）
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4>B · 已知遊戲事實</h4>
        <p>
          死亡日期：{facts.deathDate ?? "未確認"}；遺囑：
          {facts.will === "none"
            ? "申報無遺囑（仍待查證）"
            : facts.will === "document"
              ? "有文件，效力待確認"
              : "未確認"}
          。
        </p>
        <div className="fact-heirs">
          {facts.heirs.map((h) => (
            <span key={h.id}>
              {h.name} ·{" "}
              {h.relation === "spouse"
                ? "配偶"
                : h.relation === "descendant"
                  ? "直系卑親屬"
                  : h.relation}{" "}
              · {h.status === "eligible" ? "清冊列為候選" : h.status}
            </span>
          ))}
        </div>
      </section>
      <section>
        <h4>C · NPC 模擬行為</h4>
        <p>
          家人可以支持、要求補償、拒絕或尋求法律途徑；其個性、財務、責任與記憶不會進入應繼分計算。
        </p>
      </section>
      <section>
        <h4>D · 可能的法律爭議</h4>
        <ul>
          {result.disputes.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p>{willAssessment("oral-promise").reason}</p>
      </section>
      <section>
        <h4>E · 待確認事項與司法結果</h4>
        <ul>
          {[
            ...result.pending,
            tax.reason,
            reserved.reason,
            "分割協議、財產處分、登記及法院結果未確認，不能以會議意向直接移轉財產。",
          ].map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
        <p>
          遺產稅（{tax.year ?? "年度未定"}）：待確認，非 0
          元。特留分：待確認，非 0。
        </p>
      </section>
    </div>
  );
}
const sample: SuccessionFacts = {
  deathDate: "2026-10-23",
  heirs: [
    { id: 1, name: "配偶（示例）", relation: "spouse", status: "eligible" },
    ...[2, 3, 4].map((id) => ({
      id,
      name: `子女${id - 1}（示例）`,
      relation: "descendant" as const,
      status: "eligible" as const,
    })),
  ],
  familyComplete: true,
  marriageConfirmed: true,
  will: "none",
  maritalProperty: "unknown",
  gifts: "unknown",
  insurance: "unknown",
  ownershipConfirmed: true,
};
export function LawCenter({
  state,
  onClose,
}: {
  state: State | undefined;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    [query, setQuery] = useState(""),
    [topic, setTopic] = useState("all"),
    [caseId, setCaseId] = useState("sample");
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  const visible = searchTopics(query, topic);
  const estate = state?.clan.estates.find((e) => e.id === caseId);
  return (
    <dialog
      ref={ref}
      className="law-dialog"
      aria-label="台灣法律查詢中心"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="law-top">
        <div>
          <div className="eyebrow">TAIWAN LAW · TRACEABLE RULES</div>
          <h2>台灣法律查詢中心</h2>
        </div>
        <button autoFocus onClick={onClose} aria-label="關閉台灣法律">
          關閉 ×
        </button>
      </div>
      <p className="legal-pending">
        官方法源目前無法連線核實（環境代理 CONNECT
        403）。以下為待核對的主題索引；未核實規則與年度金額不會當作正式法律計算。沒有載入未確認的
        2026 修法。
      </p>
      <div className="law-search">
        <label>
          關鍵字或法條號碼
          <input
            aria-label="法律搜尋"
            placeholder="例：1138、遺囑、照顧"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          法律主題
          <select
            aria-label="法律主題"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="all">全部主題</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="hint">
        找到 {visible.length}{" "}
        個主題。可在遊戲內閱讀，官方連結供另行核對，不會自動跳離遊戲。
      </p>
      <div className="law-topics">
        {visible.map((t) => (
          <article key={t.id}>
            <h3>{t.title}</h3>
            <p>
              <b>白話摘要（待核對）</b> {t.plain}
            </p>
            <p>
              <b>遊戲例子</b> {t.example}
            </p>
            <details>
              <summary>官方法源、版本與爭議</summary>
              {t.sourceIds.map((id) => {
                const s = sources.find((s) => s.id === id)!;
                return (
                  <div className="source-card" key={id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.law} 第 {s.articles.join("、")} 條 ↗
                    </a>
                    <dl>
                      <dt>公布日期</dt>
                      <dd>{s.promulgatedOn ?? "待官方核對"}</dd>
                      <dt>施行／適用日期</dt>
                      <dd>{s.effectiveFrom ?? "待官方核對"}</dd>
                      <dt>失效／修正區間</dt>
                      <dd>{s.effectiveTo ?? "未確認，非表示永久有效"}</dd>
                      <dt>規則版本</dt>
                      <dd>{s.revision}</dd>
                    </dl>
                    <p>{s.conditions}</p>
                  </div>
                );
              })}
              <ul>
                {t.disputes.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p>法院判決／政府解釋：尚無經核實資料，未展示虛構引用。</p>
            </details>
          </article>
        ))}
      </div>
      {!visible.length && <p>沒有相符主題，請縮短關鍵字或改用條號。</p>}
      <label>
        事件法律檢視
        <select
          aria-label="事件法律檢視"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
        >
          <option value="sample">配偶與三名子女（資料缺漏展示）</option>
          {state?.clan.estates.map((e) => (
            <option key={e.id} value={e.id}>
              {state.clan.people.find((p) => p.id === e.ownerId)?.name} ·{" "}
              {e.deathDate}
            </option>
          ))}
        </select>
      </label>
      <LegalCase facts={estate?.facts ?? sample} />
    </dialog>
  );
}
