import { useEffect, useState } from "react";
import type { State } from "../simulation";
import type { StoryAction } from "./types";
import {
  STORY_TITLE,
  storyChapters,
  storyStage,
  storyTasks,
  familyPlace,
  carePlans,
} from "./definitions";
import { places } from "../world/model";
import { relationship } from "../family/engine";
const money = (n: number) => Math.round(n).toLocaleString("zh-TW");
type Props = {
  state: State;
  onAction: (a: StoryAction) => void;
  onTravel: (place: number) => void;
  error?: string;
};
export function StoryLocation({
  state: s,
  onAction,
  onTravel,
}: {
  state: State;
  onAction: Props["onAction"];
  onTravel: Props["onTravel"];
}) {
  const st = s.story;
  if (!st) return null;
  const place = s.world!.place,
    h = st.houses.find((h) => h.place === place);
  const people = s.clan.people.filter(
    (p) =>
      p.id !== s.clan.activeId &&
      p.alive &&
      [1, 2, 3, 10, 11, 12, 15].includes(p.id) &&
      familyPlace(p.id) === place,
  );
  return (
    <section className="story-location" aria-label="劇情場所互動">
      <small>《{STORY_TITLE}》</small>
      <h3>{places[place]?.name ?? "城市探索"}</h3>
      {h ? (
        <>
          <p className="ownership-note">
            登記於遊戲清冊的屋主：
            <b>{s.clan.people.find((p) => p.id === h.ownerId)?.name}</b>。
            {h.estateId
              ? "已記入該屋主的獨立遺產；處分權待核實。"
              : "父母保有自己的財產與決定權。"}
          </p>
          <dl>
            <dt>房屋帳面價值</dt>
            <dd>${money(h.value)}</dd>
            <dt>屋況</dt>
            <dd>
              {h.condition} / 100{h.repairUntil > s.month ? " · 施工中" : ""}
            </dd>
            <dt>每月租金／維護</dt>
            <dd>
              ${money(h.rent)} / ${money(h.maintenance)}
            </dd>
          </dl>
          {h.use === "rental" && (
            <button onClick={() => onAction({ type: "inspect-rental" })}>
              整理出租屋近況 · 2h
            </button>
          )}
          <div className="story-buttons">
            <button
              disabled={
                !!h.estateId || h.repairUntil > s.month || h.condition === 100
              }
              onClick={() =>
                onAction({ type: "repair", place: h.place, funding: "parent" })
              }
            >
              請屋主支付修繕 $8,000 · 4h
            </button>
            <button
              disabled={
                !!h.estateId || h.repairUntil > s.month || h.condition === 100
              }
              onClick={() =>
                onAction({ type: "repair", place: h.place, funding: "player" })
              }
            >
              自願支援修繕 $8,000 · 4h
            </button>
          </div>
          <small>修繕不改變所有權；出租房下一個遊戲月停租施工。</small>
        </>
      ) : (
        <p>
          工作、回家或探望父母，今天由你安排。先前往場所，才能陪伴家人與處理房屋事務。
        </p>
      )}
      <div className="story-buttons">
        {people.map((p) => (
          <button
            key={p.id}
            onClick={() => onAction({ type: "visit", personId: p.id })}
          >
            陪伴{p.name} · $1,200 / 4h
          </button>
        ))}
      </div>
      {[7, 8].includes(place) &&
        s.clan.people.some((p) => p.id === 10 && p.alive) && (
          <button onClick={() => onAction({ type: "checkup", parentId: 10 })}>
            陪父親健檢 · $3,000 / 4h
          </button>
        )}
      <div className="story-buttons">
        {st.houses
          .filter((h) => h.place !== place)
          .map((h) => (
            <button key={h.id} onClick={() => onTravel(h.place)}>
              前往{h.name}
            </button>
          ))}
        {place !== 7 && (
          <button onClick={() => onTravel(7)}>前往社區中心</button>
        )}
        {place !== 0 && <button onClick={() => onTravel(0)}>回自己家</button>}
      </div>
    </section>
  );
}
export function StoryPanel({
  state: s,
  onAction,
  onTravel,
  error,
}: Props) {
  const st = s.story!;
  const [time, setTime] = useState({
    care: st.time.care,
    family: st.time.family,
    overtime: st.time.overtime,
  });
  useEffect(
    () =>
      setTime({
        care: st.time.care,
        family: st.time.family,
        overtime: st.time.overtime,
      }),
    [st.time.care, st.time.family, st.time.overtime, s.month],
  );
  const tasks = storyTasks(s),
    stage = storyStage(s),
    e = st.episode;
  return (
    <section id="story-goals" className="promise-story" aria-label="兩間房子的承諾劇情中心">
      <div className="story-heading">
        <div>
          <small>STORY · 日常、選擇與留下的記憶</small>
          <h2>
            第 {stage} 章：{storyChapters[stage - 1].title}
          </h2>
          <p>
            《{STORY_TITLE}》 · 第 {s.month - st.startedMonth + 1} 個遊戲月
          </p>
        </div>
        <small>使用上方「結算一月」推進人生與收支。</small>
      </div>
      <details className="secondary-info"><summary>章節總覽與開發狀態</summary><div className="chapter-trail" aria-label="六章主線">
        {storyChapters.map((c) => (
          <span key={c.id} className={c.id === stage ? "current" : ""}>
            {c.id} · {c.title}
            {c.status === "framework" ? "（框架）" : ""}
          </span>
        ))}
      </div>
      </details>
      <p
        className={error ? "story-alert" : "story-message"}
        role={error ? "alert" : "status"}
      >
        {error || st.lastNotice}
      </p>

      <div className="story-grid">
        <section>
          <h3>這一段人生，想完成的事</h3>
          <ul className="story-tasks">
            {tasks.map((t) => (
              <li key={t.id}>
                <span>
                  {t.done ? "✓" : "○"} {t.text}
                </span>
                <button onClick={() => onTravel(t.place)}>
                  前往{places[t.place].name}
                </button>
              </li>
            ))}
          </ul>
          <small>目標可以自由排序，不必買保險或把財產留給誰才能繼續。</small>
        </section>
        <section className="time-planner">
          <h3>每月可安排時間：40h</h3>
          <p>
            已用 {st.time.spent}h；目前保留休息{" "}
            {Math.max(
              0,
              40 - st.time.spent - time.care - time.family - time.overtime,
            )}
            h。安排持續生效，臨時探望每月另計。
          </p>
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              onAction({ type: "plan", ...time });
            }}
          >
            {(
              [
                { key: "care", name: "照顧", max: 24 },
                { key: "family", name: "家庭陪伴", max: 16 },
                { key: "overtime", name: "加班", max: 16 },
              ] as const
            ).map((f) => (
              <label key={f.key}>
                {f.name}時數
                <input
                  aria-label={`${f.name}時數`}
                  type="number"
                  min={0}
                  max={f.max}
                  value={time[f.key]}
                  onChange={(ev) =>
                    setTime({ ...time, [f.key]: Number(ev.target.value) })
                  }
                />
              </label>
            ))}
            <button type="submit">儲存時間安排</button>
          </form>
          <details><summary>時間安排的收入、健康與家庭影響</summary><p>
            遊戲模型：有工作才有加班收入，每小時
            $350；每小時日間照顧使工作收入減少
            $250，最多扣到基本薪資。家庭預留不足會累積衝突，休息不足影響健康。
          </p>
          <small>
            上月基本薪資 ${money(st.lastSalary.base)} ＋加班 $
            {money(st.lastSalary.bonus)} −照顧少領 ${money(st.lastSalary.lost)}
            ；自家租屋 ${money(st.lastSalary.housing)}
            。皆為虛構遊戲數值，不是台灣勞動、租賃或福利規則。
          </small></details>
        </section>
      </div>
      <section className="parent-houses">
        <h3>兩間房子，兩份生活</h3>
        <div>
          {st.houses.map((h) => (
            <button
              key={h.id}
              className={`house-story-card ${h.use}`}
              onClick={() => onTravel(h.place)}
            >
              <span className="house-portrait" aria-hidden="true">
                ⌂
              </span>
              <b>{h.name}</b>
              <span>
                {s.clan.people.find((p) => p.id === h.ownerId)?.name}的
                {h.estateId ? "獨立遺產清冊" : "財產"} · 屋況 {h.condition}
              </span>
              <small>
                {h.use === "rental"
                  ? `月租 $${money(h.rent)}，入屋主帳戶`
                  : "父母自住，沒有玩家租金收入"}
                {h.repairUntil > s.month ? " · 施工停租中" : ""}
              </small>
              <span>前往查看 →</span>
            </button>
          ))}
        </div>
      </section>
      {e && (
        <section id="care-panel" className="care-episode" aria-label="父母照顧事件">
          <div className="care-heading">
            <span className="medical-mark" aria-hidden="true">
              ＋
            </span>
            <div>
              <h3>
                {s.clan.people.find((p) => p.id === e.parentId)?.name}
                的健康與照顧
              </h3>
              <p>
                健康{" "}
                {s.clan.people
                  .find((p) => p.id === e.parentId)
                  ?.health.toFixed(0)}{" "}
                · 已追蹤 {e.monthsTreated} 個月 ·{" "}
                {e.status === "completed"
                  ? "本階段追蹤完成，繼續自由經營"
                  : e.status === "needs-plan"
                    ? "等待安排照顧"
                    : e.status === "bereaved"
                      ? "照顧結束，遺產獨立保管"
                      : "照顧中"}
              </p>
            </div>
          </div>
          {["active", "needs-plan"].includes(e.status) && (
            <>
              <div className="care-options">
                {Object.entries(carePlans).map(([id, p]) => (
                  <article key={id}>
                    <h4>{p.name}</h4>
                    <p>
                      啟動 ${money(p.initial)} · 每月總需求 $
                      {money(p.monthlyNeed)} · 玩家支付上限 $
                      {money(p.playerLimit)}
                    </p>
                    <small>
                      預留照顧 {p.hours}
                      h；父母、手足與玩家依實際能力分擔。變更方案須再付啟動費。
                    </small>
                    <button
                      disabled={e.plan === id}
                      onClick={() =>
                        onAction({
                          type: "choose-care",
                          plan: id as keyof typeof carePlans,
                        })
                      }
                    >
                      {e.plan === id ? "目前照顧方案" : `安排${p.name}`}
                    </button>
                  </article>
                ))}
              </div>
              <div className="story-buttons">
                <button onClick={() => onTravel(7)}>前往社區中心協商</button>
                <button
                  disabled={e.lastReviewed === s.month}
                  onClick={() => onAction({ type: "ask-siblings" })}
                >
                  邀手足協商 · $1,500 / 3h
                </button>
              </div>
              <p>
                上次實付 ${money(e.lastPaid)}；未滿足 ${money(e.unmetMoney)}／
                {e.unmetHours}h。穩定追蹤可改善病況，不是必然死亡流程。
              </p>
            </>
          )}
          <div className="sibling-responses">
            {e.responses.map((r) => (
              <article key={r.personId}>
                <b>
                  {s.clan.people.find((p) => p.id === r.personId)?.name} ·{" "}
                  {r.money
                    ? "分擔費用與時間"
                    : r.hours
                      ? "以時間協助"
                      : "暫無餘力"}
                </b>
                <p>
                  提出 ${money(r.money)}／{r.hours}h；本月實付 $
                  {money(r.actualMoney)}
                </p>
                <details>
                  <summary>自主決定的原因</summary>
                  <ul>
                    {r.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        </section>
      )}
      <details className="secondary-info">
        <summary>家人近況 · 每個人都有自己的生活</summary>
        <div className="family-status-cards">
          {s.clan.people
            .filter((p) => [1, 2, 3, 10, 11, 12, 15].includes(p.id))
            .map((p) => {
              const r = relationship(
                structuredClone(s.clan),
                s.clan.activeId,
                p.id,
              );
              return (
                <article key={p.id}>
                  <span className="story-avatar" aria-hidden="true">
                    {p.name[0]}
                  </span>
                  <h4>
                    {p.name} · {Math.floor(p.age)} 歲
                  </h4>
                  <p>{p.goal}</p>
                  <small>
                    健康 {p.health.toFixed(0)} · 信任 {r.trust.toFixed(0)} ·
                    衝突 {r.conflict.toFixed(0)}
                  </small>
                  <details>
                    <summary>財務、責任與期待</summary>
                    <p>
                      個人現金 ${money(p.finances.cash)}／負債 $
                      {money(p.finances.debt)}；月收入 $
                      {money(p.finances.income)}／支出 $
                      {money(p.finances.expenses)}，房租收入另列於屋主帳。
                    </p>
                    <p>
                      責任：{p.responsibilities.join("、") || "成長與生活"}
                      。安全感 {p.traits.security}，自主性 {p.traits.autonomy}
                      ，公平價值 {p.values.fairness}。
                    </p>
                    <p>
                      {st.parentWishes.find((w) => w.personId === p.id)?.text ??
                        (p.id === 12
                          ? "期待保留家族情感，也擔心補償與家庭現金需求。"
                          : p.id === 15
                            ? "希望照顧分工公平，財產安排由父母自主決定。"
                            : "希望彼此有時間陪伴。")}
                    </p>
                  </details>
                  <button
                    disabled={!p.alive}
                    onClick={() => onTravel(familyPlace(p.id))}
                  >
                    前往與{p.name}見面
                  </button>
                </article>
              );
            })}
        </div>
      </details>
      <details className="story-records">
        <summary>重大事件與長期記憶</summary>
        <ol>
          {s.clan.memories
            .filter((m) => m.month >= st.startedMonth)
            .slice(-12)
            .reverse()
            .map((m) => (
              <li key={m.id}>
                <small>
                  第 {m.month} 月 ·{" "}
                  {m.kind === "fact"
                    ? "客觀紀錄"
                    : m.kind === "perception"
                      ? "角色認知"
                      : "文件待確認"}
                </small>
                <p>{m.text}</p>
              </li>
            ))}
        </ol>
      </details>
      <details>
        <summary>第三至六章 · 擴充架構與法律邊界</summary>
        <p>
          後續章節只有事件規格，尚無正式法律計算或可玩的章節分支；保險安排是可選項，沒有保證最佳結局。
        </p>
        {storyChapters
          .filter((c) => c.status === "framework")
          .map((c) => (
            <article key={c.id}>
              <h4>{c.title}（框架）</h4>
              <p>待核實：{c.legal.join("、")}</p>
            </article>
          ))}
        <p>
          父母各次死亡建立各自清冊，沒有合併遺產或自動凍結全部財產。法律結果尚未驗證，房屋與款項不會直接轉給玩家。
        </p>
      </details>
    </section>
  );
}
