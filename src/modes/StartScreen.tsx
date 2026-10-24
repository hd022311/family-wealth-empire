import { useState } from "react";
import type { Setup } from "./create";
export function StartScreen({
  onCreate,
  onContinue,
  hasSave,
}: {
  onCreate: (c: Setup) => void;
  onContinue: () => void;
  hasSave: boolean;
}) {
  const [c, set] = useState<Setup>({
    mode: "story",
    name: "林家安",
    familyName: "青禾家族",
    background: "ordinary",
    age: 25,
    spouse: true,
    children: 1,
  });
  return (
    <main className="start-screen">
      <small>現代台灣 · 虛構市場 · 持續經營的人生</small>
      <h1>家族財富帝國</h1>
      <p>探索城市、經營職涯，讓每個選擇留下家族記憶。</p>
      <div className="mode-cards">
        {(["story", "free"] as const).map((mode) => (
          <button
            key={mode}
            className={c.mode === mode ? "active" : ""}
            onClick={() => set({ ...c, mode })}
          >
            <h2>{mode === "story" ? "劇情模式 · 推薦新玩家" : "自由模式"}</h2>
            <p>
              {mode === "story"
                ? "《兩間房子的承諾》：30 歲，有自己的家庭與職涯。父母的自住房與出租房，牽動彼此的人生。"
                : "自訂背景與家庭，探索職涯、投資及跨世代經營。隨時開放。"}
            </p>
          </button>
        ))}
      </div>
      <section className="setup-form">
        <label>
          角色姓名
          <input
            value={c.name}
            maxLength={30}
            onChange={(e) => set({ ...c, name: e.target.value })}
          />
        </label>
        <label>
          家族名稱
          <input
            value={c.familyName}
            maxLength={30}
            onChange={(e) => set({ ...c, familyName: e.target.value })}
          />
        </label>
        {c.mode === "free" && (
          <>
            <label>
              家庭背景
              <select
                value={c.background}
                onChange={(e) =>
                  set({
                    ...c,
                    background: e.target.value as Setup["background"],
                  })
                }
              >
                <option value="self-made">白手起家</option>
                <option value="ordinary">一般家庭</option>
                <option value="wealthy">富裕家庭</option>
              </select>
            </label>
            <label>
              起始年齡
              <input
                type="number"
                min={18}
                max={60}
                value={c.age}
                onChange={(e) => set({ ...c, age: Number(e.target.value) })}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={c.spouse}
                onChange={(e) =>
                  set({
                    ...c,
                    spouse: e.target.checked,
                    children: e.target.checked ? c.children : 0,
                  })
                }
              />
              已有配偶
            </label>
            <label>
              子女人數
              <select
                disabled={!c.spouse}
                value={c.children}
                onChange={(e) =>
                  set({ ...c, children: Number(e.target.value) })
                }
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </>
        )}
      </section>
      <button
        className="primary"
        disabled={!c.name.trim() || !c.familyName.trim()}
        onClick={() => onCreate(c)}
      >
        開始{c.mode === "story" ? "劇情" : "自由"}人生
      </button>
      {hasSave && <button onClick={onContinue}>繼續目前家族</button>}
      <p>
        每個新人生使用獨立存檔。離線不衰老、不死亡；法律待驗證的分產不會自動執行。
      </p>
    </main>
  );
}
