import type { State } from "../simulation";
import { places, jobs, salary } from "./model";
import { chapter, chapters, type WorldAction } from "./engine";
export function WorldPanel({
  state: s,
  onAction,
  onFamily,
}: {
  state: State;
  onAction: (a: WorldAction) => void;
  onFamily: () => void;
}) {
  const w = s.world;
  if (!w) return null;
  const goals = [
    ["工作入帳", w.paid > 0],
    ["認識人物", w.npcs.some((n) => n.met)],
    ["發現商機", w.venture],
    ["購入資產", s.properties.some((p) => p.owned)],
    [
      "家族互動",
      s.clan.memories.some(
        (m) => m.category === "care" || m.category === "gift",
      ),
    ],
  ] as const;
  return (
    <section className="world-panel">
      <div className="panel-heading">
        <div>
          <small>
            {w.familyName} · {w.mode === "story" ? "劇情模式" : "自由模式"}
          </small>
          <h2>
            {w.mode === "story"
              ? s.story
                ? "城市生活與職涯"
                : `第 ${chapter(s) + 1} 章：${chapters[chapter(s)]}`
              : "自由人生 · 自己決定方向"}
          </h2>
        </div>
        <span>
          {w.name} · 專業 {w.skill}
        </span>
      </div>
      <p>
        先前往場所，再選擇工作或交流。新人生預設暫停，可用 1×／4×／12×
        推進月份領薪。
      </p>
      <div className="world-goals">
        {goals.map(([text, done]) => (
          <span key={text}>
            {done ? "✓" : "○"} {text}
          </span>
        ))}
      </div>
      <nav className="places" aria-label="城市場所">
        {places.map((p, i) =>
          i >= 8 && !s.story ? null : (
            <button
              key={p.name}
              className={w.place === i ? "active" : ""}
              onClick={() => onAction({ type: "travel", place: i })}
            >
              {p.name}
            </button>
          ),
        )}
      </nav>
      <h3>目前位置：{places[w.place]?.name ?? "城市道路"}</h3>
      <div className="world-columns">
        <section>
          <h3>職涯與經營</h3>
          <p>
            {jobs.find((j) => j.id === w.job)?.name ?? "尚未就業"} · 遊戲月薪 $
            {salary(w).toLocaleString()} · 年資 {w.experience} 月
          </p>
          {jobs
            .filter((j) => j.place === w.place)
            .map((j) => (
              <button
                key={j.id}
                disabled={w.job === j.id}
                onClick={() => onAction({ type: "job", job: j.id })}
              >
                應徵{j.name} · ${j.pay.toLocaleString()}
                {j.skill ? " · 專業需12" : ""}
              </button>
            ))}
          {w.place === 7 && (
            <>
              <button onClick={() => onAction({ type: "train" })}>
                專業進修 $1,000
              </button>
              <button
                disabled={w.venture}
                onClick={() => onAction({ type: "venture" })}
              >
                {w.venture
                  ? "服務工作室營運中"
                  : "人脈商機：服務工作室 $30,000"}
              </button>
              {s.family
                .filter((m) => m.role === "子女" && m.age >= 6)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onAction({ type: "mentor", id: m.id })}
                  >
                    培養{m.name} $3,000 · 能力 {w.talent[m.id] ?? 0}
                  </button>
                ))}
            </>
          )}
          {[0, 3, 6].includes(w.place) && (
            <button onClick={onFamily}>探望家人／召開家庭會議</button>
          )}
          {w.venture && (
            <p>
              本月服務收入 ${w.ventureIncome.toLocaleString()}，營運支出
              $2,000。收入為虛構且有風險。
            </p>
          )}
        </section>
        <section>
          <h3>自主生活的市民</h3>
          {w.npcs.map((n) => (
            <article className="citizen-card" key={n.id}>
              <strong>
                {n.name} · {Math.floor(n.age)} 歲
              </strong>
              <small>
                {jobs[n.job].name} · {n.household} · {n.goal}
              </small>
              <details><summary>能力、責任與財務</summary><small>
                專業 {n.skill} · 風險偏好 {n.risk} · 家庭責任 {n.duty} · 存款 $
                {Math.round(n.cash).toLocaleString()}
              </small></details>
              <button
                onClick={() =>
                  onAction(
                    n.place === w.place
                      ? { type: "chat", id: n.id }
                      : { type: "travel", place: n.place },
                  )
                }
              >
                {n.place === w.place
                  ? `交流${n.met ? " · 已認識" : ""}`
                  : `前往${places[n.place].name}找他`}
              </button>
            </article>
          ))}
        </section>
      </div>
      <details>
        <summary>人生記憶與自主世界紀錄（{w.memories.length}）</summary>
        {w.memories.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </details>
    </section>
  );
}
