import { StoryPanel, StoryLocation } from "./story/StoryPanel";
import { storyAction } from "./story/engine";
import type { StoryAction } from "./story/types";
import { WorldPanel } from "./world/WorldPanel";
import { worldAction, type WorldAction } from "./world/engine";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { City } from "./City";
import {
  initial,
  tick,
  transact,
  assets,
  debt,
  net,
  inherit,
  heirs,
  renovationCost,
  expansionCost,
  isUnderConstruction,
  type State,
  type Action,
} from "./simulation";
import "./style.css";
import { Account } from "./Account";
import { FamilyPanel } from "./family/FamilyPanel";
import { familyAction } from "./family/engine";
import type { FamilyAction } from "./family/types";
const money = (v: number) =>
  new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 }).format(v);
function App({
  start,
  onChange,
  onSave,
  onLoad,
  paused,
}: {
  start: State;
  onChange: (s: State) => void;
  onSave: () => void;
  onLoad: () => void;
  paused: boolean;
}) {
  const [s, setS] = useState<State>(() => structuredClone(start)),
    [speed, setSpeed] = useState(start.world ? 0 : 1),
    [selected, select] = useState(0),
    [tab, setTab] = useState(start.story ? "劇情" : "房產"),
    [notice, setNotice] = useState(
      "歡迎來到青禾城。點選建築，開始第一筆投資。",
    );
  const [familyError, setFamilyError] = useState("");
  const [focusedMember, setFocusedMember] = useState<number | undefined>(
    undefined,
  );
  function lifeAction(a: WorldAction) {
    try {
      setS(worldAction(current.current, a));
      notify("人生行動已記錄。");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  const [storyError, setStoryError] = useState("");
  function storyInteract(a: StoryAction) {
    try {
      setS(storyAction(current.current, a));
      setStoryError("");
      notify("劇情選擇已記入生活與家族帳本。");
    } catch (e) {
      setStoryError((e as Error).message);
      notify((e as Error).message);
    }
  }
  function familyInteract(a: FamilyAction) {
    if (current.current.story && a.type === "visit") {
      storyInteract({ type: "visit", personId: a.personId });
      return;
    }
    try {
      setS(familyAction(current.current, a));
      setFamilyError("");
      notify("家庭選擇已執行並記錄。");
    } catch (e) {
      setFamilyError((e as Error).message);
      notify((e as Error).message);
    }
  }
  const current = useRef(s);
  current.current = s;
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  useEffect(() => {
    changeRef.current(s);
  }, [s]);
  const notify = (msg: string) => setNotice(msg);
  useEffect(() => {
    if (!speed || s.dead || paused) return;
    let elapsed = 0,
      last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (document.hidden || !document.hasFocus()) return;
      elapsed += Math.min(delta, 1000) * speed;
      if (elapsed >= 15000) {
        elapsed -= 15000;
        setS((old) => {
          const next = tick(old);
          return next;
        });
      }
    }, 200);
    return () => clearInterval(timer);
  }, [speed, s.dead, paused]);
  function action(a: Action) {
    try {
      setS(transact(current.current, a));
      notify("交易完成，帳本已更新。");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  function save() {
    onSave();
    notify("已提交本機家族存檔。");
  }
  function load() {
    onLoad();
    setSpeed(0);
  }
  const property = s.properties.find((p) => p.id === selected);
  return (
    <div className="shell">
      <header>
        <a className="brand" href="#">
          <span className="seal">家</span>
          <div>
            家族財富帝國<small>FAMILY WEALTH EMPIRE</small>
          </div>
        </a>
        <div className="header-actions">
          <span className="fiction">● 虛構市場模擬</span>
          <button onClick={save}>存檔</button>
          <button onClick={load}>讀檔</button>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">你的每個選擇，都將成為家族的未來</div>
            <h1>從一座小城，築起世代的財富。</h1>
            <p>
              第 {s.generation} 代家主 · {Math.floor(s.age)} 歲{" "}
              {Math.floor((s.age % 1) * 12 + 0.00001)} 個月 · 青禾城
            </p>
          </div>
          <div className="date">
            <strong>
              {2026 + Math.floor(s.month / 12)}
              <span> 年 {(s.month % 12) + 1} 月</span>
            </strong>
            <small>{s.climate} · 每月自動結算</small>
          </div>
        </section>
        {s.clan.background === "legacy" &&
          s.month === 0 &&
          s.city.sequence === 0 && (
            <div className="origin-banner">
              <span>開局家庭背景尚未選擇：白手起家／富裕家庭／一般家庭</span>
              <button
                onClick={() => {
                  setTab("家族");
                  setSpeed(0);
                }}
              >
                選擇家庭背景 ↓
              </button>
            </div>
          )}
        <section className="metrics">
          {[
            ["可用現金", s.cash],
            ["每月收入", s.income],
            ["每月支出", s.expense],
            ["家族淨資產", net(s)],
          ].map(([name, v]) => (
            <div key={name}>
              <small>{name}</small>
              <strong className={Number(v) < 0 ? "negative" : ""}>
                <span>＄</span>
                {money(Number(v))}
              </strong>
            </div>
          ))}
        </section>
        <div className="workspace">
          <section className="map-panel">
            <div className="panel-heading">
              <div>
                <h2>家族的城市</h2>
                <small>點選建築查看資產與交易</small>
              </div>
              <span className="live">● LIVE</span>
            </div>
            <City
              onMove={(x, y) => lifeAction({ type: "move", x, y })}
              state={s}
              speed={speed}
              paused={paused}
              selected={selected}
              onMember={(id) => {
                setFocusedMember(id);
                setTab("家族");
                notify(
                  id === s.clan.activeId
                    ? `家主 · ${Math.floor(s.age)} 歲`
                    : `${s.family.find((m) => m.id === id)?.name} · ${Math.floor(s.family.find((m) => m.id === id)?.age ?? 0)} 歲`,
                );
              }}
              onSelect={(id) => {
                if (s.world) lifeAction({ type: "travel", place: id });
                if (id < 4) select(id);
                setTab(id >= 8 ? "劇情" : id === 4 ? "帳本" : "房產");
              }}
            />
            <div className="map-footer">
              <span>◈ 住宅　▥ 公寓　▣ 商店　▤ 銀行</span>
              <small>人物與建築為程序繪製</small>
            </div>
            <div className="timebar">
              <span>遊戲時間</span>
              <div>
                {[0, 1, 4, 12].map((v) => (
                  <button
                    key={v}
                    disabled={s.dead}
                    className={speed === v ? "active" : ""}
                    onClick={() => setSpeed(v)}
                  >
                    {v === 0 ? "Ⅱ 暫停" : `${v}×`}
                  </button>
                ))}
              </div>
              <small>1 倍速一生約 3 小時</small>
            </div>
          </section>
          <aside>
            <nav>
              {[
                ...(s.story ? ["劇情"] : []),
                "房產",
                "股票",
                "家族",
                "帳本",
              ].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>
            <div className="side-content">
              {tab === "劇情" && s.story && (
                <StoryLocation
                  state={s}
                  onAction={storyInteract}
                  onTravel={(place) => lifeAction({ type: "travel", place })}
                />
              )}

              {tab === "房產" && (
                <>
                  <div className="eyebrow">REAL ESTATE</div>
                  <h2>讓每一間房，成為未來的底氣。</h2>
                  <div className="property-list">
                    {s.properties.map((p) => (
                      <button
                        key={p.id}
                        className={
                          selected === p.id ? "property selected" : "property"
                        }
                        onClick={() => select(p.id)}
                      >
                        <span className="building-icon">
                          {p.kind === "公寓"
                            ? "▥"
                            : p.kind === "商店"
                              ? "▣"
                              : "⌂"}
                        </span>
                        <span>
                          <b>{p.name}</b>
                          <small>
                            {p.kind} ·{" "}
                            {p.owned
                              ? isUnderConstruction(s, p)
                                ? "施工中"
                                : p.rented
                                  ? "出租中"
                                  : p.operating
                                    ? "營運中"
                                    : "空置"
                              : "可購入"}
                          </small>
                        </span>
                        <strong>
                          {(p.value / 10000).toFixed(1)}
                          <small>萬元</small>
                        </strong>
                      </button>
                    ))}
                  </div>
                  {property && (
                    <div className="detail">
                      <h3>{property.name}</h3>
                      <dl>
                        <dt>建築等級 / 狀態</dt>
                        <dd>
                          Lv.{property.level} ·{" "}
                          {isUnderConstruction(s, property)
                            ? `施工至第 ${property.renovationUntil} 月`
                            : property.operating
                              ? "自行營運"
                              : property.rented
                                ? "出租中"
                                : "空置"}
                        </dd>
                        <dt>預估月租金</dt>
                        <dd>＄{money(property.rent)}</dd>
                        <dt>房貸餘額</dt>
                        <dd>＄{money(property.debt)}</dd>
                        <dt>每月房貸利率</dt>
                        <dd>年息 2.5% ÷ 12</dd>
                      </dl>
                      {!property.owned ? (
                        <button
                          className="primary"
                          disabled={s.dead}
                          onClick={() =>
                            action({ type: "buy", id: property.id })
                          }
                        >
                          購入 · 頭期款 ＄{money(property.value * 0.3)}
                        </button>
                      ) : (
                        <>
                          <div className="actions">
                            <button
                              disabled={s.dead}
                              onClick={() =>
                                action({ type: "rent", id: property.id })
                              }
                            >
                              {property.rented ? "停止出租" : "出租收租"}
                            </button>
                            <button
                              disabled={s.dead}
                              onClick={() =>
                                action({ type: "repay", id: property.id })
                              }
                            >
                              還貸最多 10 萬
                            </button>
                            <button
                              disabled={s.dead}
                              onClick={() =>
                                action({ type: "sell", id: property.id })
                              }
                            >
                              出售房產
                            </button>
                            {property.kind === "商店" ? (
                              <>
                                <button
                                  disabled={
                                    s.dead || isUnderConstruction(s, property)
                                  }
                                  onClick={() =>
                                    action({ type: "operate", id: property.id })
                                  }
                                >
                                  {property.operating ? "停止營運" : "自行營運"}
                                </button>
                                <button
                                  disabled={
                                    s.dead ||
                                    property.level >= 3 ||
                                    !property.operating ||
                                    isUnderConstruction(s, property)
                                  }
                                  onClick={() =>
                                    action({ type: "expand", id: property.id })
                                  }
                                >
                                  企業擴張 · ＄{money(expansionCost(property))}
                                </button>
                              </>
                            ) : (
                              <button
                                disabled={
                                  s.dead ||
                                  property.level >= 3 ||
                                  isUnderConstruction(s, property)
                                }
                                onClick={() =>
                                  action({ type: "renovate", id: property.id })
                                }
                              >
                                翻修升級 · ＄{money(renovationCost(property))}
                              </button>
                            )}
                          </div>
                          <div className="hint">
                            {property.kind === "商店"
                              ? "自行營運每級每月營收約 6,000 元、成本 2,500 元；營收受景氣影響。不能同時出租。"
                              : "翻修提升租金 10%；施工期間暫停收租。"}
                            工程需兩個遊戲月，完成前暫停收租/營運。每級工程款
                            70% 加入房價，最高 Lv.3。
                          </div>
                        </>
                      )}
                      <p className="hint">
                        購入貸款七成；租金每月入帳，維護費每月為市值
                        0.03%。賣出收取 2% 手續費。
                      </p>
                    </div>
                  )}
                </>
              )}
              {tab === "股票" && (
                <>
                  <div className="eyebrow">FICTIONAL EXCHANGE</div>
                  <h2>投資下一個可能。</h2>
                  <p className="hint">
                    以下皆為虛構股票，價格每月波動，無真實行情來源。
                  </p>
                  {s.prices.map((price, i) => (
                    <article className="stock" key={i}>
                      <h3>
                        {["青禾科技", "長青生活", "遠洋能源"][i]}
                        <small>FWE 00{i + 1}</small>
                      </h3>
                      <strong>＄{price.toFixed(2)}</strong>
                      <p>
                        持有 {s.shares[i]} 股 · 市值 ＄
                        {money(price * s.shares[i])}
                      </p>
                      <div className="actions">
                        <button
                          disabled={s.dead}
                          onClick={() =>
                            action({ type: "stock", id: i, quantity: 100 })
                          }
                        >
                          買 100 股
                        </button>
                        <button
                          disabled={s.dead}
                          onClick={() =>
                            action({ type: "stock", id: i, quantity: -100 })
                          }
                        >
                          賣 100 股
                        </button>
                      </div>
                    </article>
                  ))}
                </>
              )}

              {tab === "家族" && (
                <>
                  <div className="eyebrow">FAMILY TREE</div>
                  <h2>財富有價，傳承無價。</h2>
                  <p>
                    下方家族中心可查看人物、獨立資產、關係、事件及家庭會議。
                  </p>
                  <p>
                    家主健康 {s.clan.playerHealth.toFixed(0)} · 家族記憶{" "}
                    {s.clan.memories.length} 筆
                  </p>
                  <button
                    onClick={() =>
                      document.getElementById("family-center")?.scrollIntoView({
                        behavior:
                          document.documentElement.dataset.reducedMotion ===
                          "true"
                            ? "instant"
                            : "smooth",
                      })
                    }
                  >
                    查看家族中心 ↓
                  </button>
                  <div className="actions">
                    <button
                      disabled={
                        s.dead ||
                        s.age < 18 ||
                        s.age >= 75 ||
                        s.family.some((m) => m.role === "配偶" && m.age < 85)
                      }
                      onClick={() => action({ type: "marry" })}
                    >
                      結婚 · ＄120,000
                    </button>
                    <button
                      disabled={
                        s.dead ||
                        s.age < 18 ||
                        s.age >= 60 ||
                        !s.family.some(
                          (m) => m.role === "配偶" && m.age < 85,
                        ) ||
                        s.family.filter((m) => m.role === "子女").length >= 6
                      }
                      onClick={() => action({ type: "birth" })}
                    >
                      迎接新生兒 · ＄50,000
                    </button>
                  </div>
                </>
              )}
              {tab === "帳本" && (
                <>
                  <div className="eyebrow">FAMILY LEDGER</div>
                  <h2>看見財富的每一步。</h2>
                  <dl className="ledger">
                    {[
                      ["總資產", assets(s)],
                      ["總負債", debt(s)],
                      ["淨資產", net(s)],
                      ["本月收入", s.income],
                      ["本月支出", s.expense],
                      ["每月結餘", s.income - s.expense],
                    ].map(([label, v]) => (
                      <React.Fragment key={label}>
                        <dt>{label}</dt>
                        <dd>＄{money(Number(v))}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                  <h3>銀行 · 房貸管理</h3>
                  {s.properties
                    .filter((p) => p.owned && p.debt > 0)
                    .map((p) => (
                      <div className="bank" key={p.id}>
                        <span>
                          {p.name}
                          <small>＄{money(p.debt)}</small>
                        </span>
                        <button
                          disabled={s.dead}
                          onClick={() => action({ type: "repay", id: p.id })}
                        >
                          還款 10 萬
                        </button>
                      </div>
                    ))}
                  <p className="hint">
                    {s.world
                      ? "薪資依職涯與年資計算；基本生活費 18,000 元，工作室營運費另計。新模式沒有自動退休給付。"
                      : "薪資 52,000 元，65 歲起退休收入 18,000 元；生活費 28,000 元。"}
                    現金可為負數，第一版尚無破產程序。
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
        {s.story && (
          <StoryPanel
            state={s}
            onAction={storyInteract}
            onTravel={(place) => lifeAction({ type: "travel", place })}
            error={storyError}
            onAdvance={() => {
              if (paused) return;
              setSpeed(0);
              setS((old) => tick(old));
              setStoryError("");
            }}
          />
        )}
        {s.world && (
          <WorldPanel
            state={s}
            onAction={lifeAction}
            onFamily={() => setTab("家族")}
          />
        )}
        {tab === "家族" && (
          <div id="family-center">
            <FamilyPanel
              state={s}
              onAction={familyInteract}
              error={familyError}
              focused={focusedMember}
              onSuccession={(id) => {
                setS(inherit(s, id));
                setSpeed(0);
              }}
            />
          </div>
        )}
        <div className="notice" role="status">
          ◉　{notice}
        </div>
        <section className="journal">
          <div>
            <div className="eyebrow">FAMILY CHRONICLE</div>
            <h2>家族記事</h2>
          </div>
          <ul>
            {s.logs.slice(0, 5).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>
        <footer>
          <span>家族財富帝國 · 原型版本 0.3</span>
          <button
            onClick={() => {
              if (window.confirm("建立新家族並覆蓋目前存檔？")) {
                const n = initial();
                setS(n);
                setSpeed(0);
                notify("目前家族已重設，時間暫停中。");
              }
            }}
          >
            重新開始
          </button>
        </footer>
      </main>
      {s.dead && (
        <div className="overlay">
          <section
            className="succession"
            role="dialog"
            aria-modal="true"
            aria-label="選擇下一代"
          >
            <div className="succession-emblem" aria-hidden="true">
              ✦
            </div>
            <div className="eyebrow">A NEW CHAPTER</div>
            <h2>一段人生落幕，家族故事繼續。</h2>
            <p>
              原家主財產將留在獨立遺產保管清冊，法源、身分、稅務及分割尚待確認。選擇下一代只切換經營視角，使用該角色自己的帳戶，不代表已取得法定遺產。
            </p>
            {heirs(s).map((m) => (
              <button
                className="primary"
                key={m.id}
                onClick={() => {
                  setS(inherit(s, m.id));
                  setSpeed(0);
                  setTab("家族");
                  notify("新世代已接班，時間暫停中。");
                }}
              >
                {m.name} · {Math.floor(m.age)} 歲 · 接續個人帳戶
              </button>
            ))}
            {!heirs(s).length && (
              <button
                onClick={() => {
                  setS(initial());
                  setSpeed(0);
                }}
              >
                沒有成年接班角色，開始新家族
              </button>
            )}
            <button onClick={save}>儲存此刻</button>
            <button onClick={load}>讀取存檔</button>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <Account>
    {(state, onChange, key, onSave, onLoad, paused) => (
      <App
        key={key}
        start={state}
        onChange={onChange}
        onSave={onSave}
        onLoad={onLoad}
        paused={paused}
      />
    )}
  </Account>,
);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{scope:import.meta.env.BASE_URL}).catch(() => {
      /* App remains playable while open; offline reload unavailable. */
    });
  });
}
