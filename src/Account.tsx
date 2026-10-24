import { StartScreen } from "./modes/StartScreen";
import { createAdventure } from "./modes/create";
import { useEffect, useRef, useState } from "react";
import { Rankings } from "./Rankings";
import { LawCenter } from "./legal/LawCenter";
import { cloud, cloudConfigured, publicLocalDemo, listCloud, uploadCloud } from "./cloud";
import {
  makeSlot,
  readLibrary,
  updateSlot,
  returnSummary,
  syncDecision,
  LIBRARY_KEY,
  type Library,
  type Slot,
} from "./saves";
import type { State } from "./simulation";
import type { User } from "@supabase/supabase-js";
function boot(): { lib: Library; error: string; migrated?: boolean } {
  try {
    if (
      !localStorage.getItem(LIBRARY_KEY) &&
      !localStorage.getItem("family-wealth-empire-v1")
    )
      return { lib: { version: 1, active: "", slots: [] }, error: "" };
    const raw = localStorage.getItem(LIBRARY_KEY);
    const lib = readLibrary(localStorage);
    return { lib, error: "", migrated: !!raw && raw !== JSON.stringify(lib) };
  } catch {
    return {
      lib: { version: 1, active: "", slots: [] },
      error: "無法讀取本機家族庫。原資料未被覆蓋；請先備份瀏覽器資料。",
    };
  }
}
export function Account({
  children,
}: {
  children: (
    state: State,
    onChange: (s: State) => void,
    key: string,
    onSave: () => void,
    onLoad: () => void,
    paused: boolean,
  ) => React.ReactNode;
}) {
  const [start] = useState(boot);
  const [home, setHome] = useState(
    () =>
      !localStorage.getItem(LIBRARY_KEY) &&
      !localStorage.getItem("family-wealth-empire-v1"),
  );
  const [lib, setLib] = useState(start.lib);
  const ref = useRef(lib);
  ref.current = lib;
  const [open, setOpen] = useState(Boolean(start.error)),
    [user, setUser] = useState<User | null>(null),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(
      start.error ||
        (lib.slots[0] ? returnSummary(lib.slots[0]) : "選擇模式，開啟新人生。"),
    ),
    [busy, setBusy] = useState(false),
    [storageError, setStorageError] = useState(""),
    [epoch, setEpoch] = useState(0),
    [conflicts, setConflicts] = useState<{ local: Slot; remote?: Slot }[]>([]);
  const userRef = useRef(user);
  userRef.current = user;
  const inFlight = useRef(false);
  const bootError = Boolean(start.error);
  useEffect(() => {
    if (bootError || !ref.current.slots.length) return;
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (start.migrated && raw) {
      try {
        localStorage.setItem(`${LIBRARY_KEY}-before-v4-${Date.now()}`, raw);
      } catch {
        setStorageError("舊存檔備份失敗，暫不寫入格式遷移；請檢查儲存空間。");
        return;
      }
    }
    if (!raw || start.migrated) persist(ref.current);
  }, []);
  function persist(next: Library) {
    setLib(next);
    ref.current = next;
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "本機存檔失敗，最新進度只在記憶體。請保留頁面並檢查儲存權限。",
      );
      return false;
    }
  }
  useEffect(() => {
    if (!cloud) return;
    cloud.auth.getSession().then(({ data, error }) => {
      if (error) setMessage(error.message);
      setUser(data.session?.user ?? null);
    });
    const { data } = cloud.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setConflicts([]);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  function replace(slot: Slot, forceReload = false) {
    const l = ref.current;
    persist({
      ...l,
      slots: l.slots.some((s) => s.id === slot.id)
        ? l.slots.map((s) => (s.id === slot.id ? slot : s))
        : [...l.slots, slot],
    });
    if (forceReload) setEpoch((e) => e + 1);
  }
  async function sync(automatic = false) {
    const uid = userRef.current?.id;
    if (!uid || !cloud || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const remote = await listCloud();
      if (userRef.current?.id !== uid) return;
      const found: { local: Slot; remote?: Slot }[] = [];
      const localStart = [...ref.current.slots];
      for (const entry of localStart) {
        const local = ref.current.slots.find((s) => s.id === entry.id);
        if (!local) continue;
        if (automatic && local.owner !== uid) continue;
        const r = remote.find((s) => s.id === local.id);
        const decision = syncDecision(local, r, uid);
        if (decision === "foreign") continue;
        if (decision === "conflict") {
          found.push({ local, remote: r });
          continue;
        }
        if (decision === "download") {
          replace(r!, ref.current.active === r!.id);
          continue;
        }
        if (decision === "upload") {
          const uploaded = await uploadCloud(local);
          if (userRef.current?.id !== uid) return;
          if (!uploaded) {
            found.push({
              local,
              remote: (await listCloud()).find((s) => s.id === local.id),
            });
            continue;
          }
          // A month can advance while a network request is pending: keep newer local state dirty.
          const latest = ref.current.slots.find((s) => s.id === local.id);
          replace(
            latest && JSON.stringify(latest) !== JSON.stringify(local)
              ? {
                  ...latest,
                  owner: uid,
                  revision: uploaded.revision,
                  dirty: true,
                }
              : uploaded,
          );
        }
      }
      if (userRef.current?.id !== uid) return;
      for (const r of remote)
        if (!ref.current.slots.some((s) => s.id === r.id)) replace(r);
      setConflicts(found);
      setMessage(
        found.length
          ? "偵測到存檔衝突，已停止覆寫。請選擇保留方式。"
          : "同步完成。訪客家族需按「同步所有家族」才會上傳；後續本機變更仍會保留。",
      );
    } catch (e) {
      setMessage(`同步未完成，本機進度保留：${(e as Error).message}`);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  const syncRef = useRef(sync);
  syncRef.current = sync;
  useEffect(() => {
    if (user) {
      void syncRef.current(true);
    }
  }, [user?.id]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        navigator.onLine &&
        document.visibilityState === "visible" &&
        userRef.current
      )
        void syncRef.current(true);
    }, 30000);
    const online = () => {
      setMessage("連線恢復；版本檢查後才會同步，衝突不會自動覆寫。");
      void syncRef.current(true);
    };
    window.addEventListener("online", online);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", online);
    };
  }, []);
  async function auth(signup: boolean) {
    if (!cloud) return;
    setBusy(true);
    try {
      const result = signup
        ? await cloud.auth.signUp({ email, password })
        : await cloud.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setPassword("");
      setMessage(
        signup
          ? "註冊已送出，請依專案設定完成電子郵件驗證，再登入。"
          : "登入成功。可手動同步訪客進度。",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const active = lib.slots.find((s) => s.id === lib.active);
  const onChange = (s: State) => {
    const l = ref.current;
    const slot = l.slots.find((s) => s.id === l.active);
    if (slot && JSON.stringify(slot.state) !== JSON.stringify(s))
      persist({
        ...l,
        slots: l.slots.map((p) => (p.id === slot.id ? updateSlot(p, s) : p)),
      });
  };
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [lawOpen, setLawOpen] = useState(false);
  return (
    <>
      {lawOpen && (
        <LawCenter state={active?.state} onClose={() => setLawOpen(false)} />
      )}
      {publicLocalDemo&&<div className="public-demo-banner" role="note"><strong>開發測試版 · 本機存檔模式</strong><span>正式雲端存檔未啟用。進度保存在這個瀏覽器；清除網站資料或更換裝置不會自動帶入存檔。所有行情均為虛構。</span></div>}
      <div className="account-bar">
      <button className="law-entry" onClick={() => setLawOpen(true)}>
        ⚖ 台灣法律
      </button>

        <span>
          {user ? `會員 ${user.email}` : "訪客試玩 · 本機家族"}　|　
          {active?.name}　·　
          {cloudConfigured ? "雲端已設定（連線結果見訊息）" : "雲端尚未設定"}
        </span>
        <button onClick={() => setHome(true)}>首頁 / 新人生</button>
        <button onClick={() => setRankingsOpen((v) => !v)}>排行榜規劃</button>
        <button onClick={() => setOpen((v) => !v)}>
          {open ? "返回遊戲" : "家族存檔 / 會員"}
        </button>
      </div>
      {rankingsOpen && <Rankings />}
      {open && (
        <section className="account-panel">
          <h2>持續經營，隨時回家。</h2>
          <p>
            每次玩 5–15
            分鐘也能累積進度。離線不老化、不死亡、不收取利息；虛構市場本階段離線進展為零。
          </p>
          <div className="account-grid">
            <div>
              <h3>獨立家族存檔</h3>
              {lib.slots.map((slot) => (
                <div className="slot" key={slot.id}>
                  <div>
                    <b>{slot.name}</b>
                    <small>
                      {slot.state.world?.mode === "story"
                        ? "劇情模式"
                        : slot.state.world?.mode === "free"
                          ? "自由模式"
                          : "經典存檔"}{" "}
                      · 第 {slot.state.generation} 代 ·{" "}
                      {Math.floor(slot.state.age)} 歲 ·{" "}
                      {slot.owner
                        ? slot.owner === user?.id
                          ? "此帳號雲端"
                          : "其他帳號，本機保留"
                        : "本機訪客"}{" "}
                      · v{slot.revision}
                      {slot.dirty ? " · 待同步" : ""}
                    </small>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => {
                      persist({ ...ref.current, active: slot.id });
                      setEpoch((e) => e + 1);
                      setMessage(returnSummary(slot));
                      setHome(false);
                      setOpen(false);
                    }}
                  >
                    接續
                  </button>
                </div>
              ))}
              <button
                disabled={bootError || busy}
                onClick={() => {
                  const name = window.prompt("新家族名稱");
                  if (!name) return;
                  const slot = makeSlot(name);
                  if (
                    persist({
                      ...ref.current,
                      active: slot.id,
                      slots: [...ref.current.slots, slot],
                    })
                  ) {
                    setEpoch((e) => e + 1);
                    setOpen(false);
                  }
                }}
              >
                ＋ 建立獨立家族
              </button>
              <p className="hint">
                本機資料可被同一瀏覽器使用者存取；共用裝置請清除網站資料。不同帳戶不會自動互傳存檔。
              </p>
            </div>
            <div>
              <h3>會員與跨裝置同步</h3>
              {!cloudConfigured ? (
                <p>
                  尚未連接 Supabase。請依 README 設定 .env.local 的
                  VITE_SUPABASE_URL 與
                  VITE_SUPABASE_PUBLISHABLE_KEY，執行資料庫遷移，再重啟 Vite。
                </p>
              ) : user ? (
                <>
                  <p>{user.email}</p>
                  <button disabled={busy} onClick={() => void sync()}>
                    同步所有家族（含上傳訪客進度）
                  </button>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      const { error } = await cloud!.auth.signOut();
                      setMessage(
                        error ? error.message : "已登出。本機進度仍保留。",
                      );
                    }}
                  >
                    登出
                  </button>
                  <p className="hint">
                    每 30
                    秒檢查已綁定此帳號的家族。首次訪客上傳需按同步；其他裝置登入後可下載。自動同步失敗不影響本機遊玩。
                  </p>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void auth(false);
                  }}
                >
                  <label>
                    電子郵件
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    密碼
                    <input
                      type="password"
                      minLength={6}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </label>
                  <button disabled={busy}>登入</button>
                  <button
                    type="button"
                    disabled={busy || !email || password.length < 6}
                    onClick={() => void auth(true)}
                  >
                    註冊
                  </button>
                </form>
              )}
              <p className="hint">
                目前為個人沙盒存檔，不用於排名或交易。雲端保護所有權及版本一致性，尚未實作權威財務防作弊。
              </p>
            </div>
          </div>
          {conflicts.map(({ local, remote }) => (
            <article className="conflict" key={local.id}>
              <h3>
                {local.name}：本機 v{local.revision} / 雲端 v
                {remote?.revision ?? "不存在"}
              </h3>
              <p>
                不合併金錢或時間，以避免重複資產。可先保留本機副本，再採用雲端。
              </p>
              <button
                onClick={() => {
                  const copy = {
                    ...local,
                    id: crypto.randomUUID(),
                    name: `${local.name.slice(0, 50)}（衝突副本）`,
                    owner: null,
                    revision: 0,
                    dirty: true,
                  };
                  persist({
                    ...ref.current,
                    slots: [...ref.current.slots, copy],
                  });
                  setMessage("本機副本已另存，尚未上傳。");
                }}
              >
                保留本機為新家族
              </button>
              {remote && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "以雲端版本取代本機此家族？建議先保留副本。",
                      )
                    ) {
                      replace(remote, true);
                      setConflicts((c) =>
                        c.filter((x) => x.local.id !== local.id),
                      );
                    }
                  }}
                >
                  採用雲端版本
                </button>
              )}
            </article>
          ))}
          {active && (
            <>
              <h3>世代典藏 · {active.generations.length} 段已完成世代</h3>
              {active.generations.map((g, i) => (
                <details key={i}>
                  <summary>
                    第 {g.generation} 代 · 第 {g.atMonth} 月接班快照
                  </summary>
                  <p>{g.state.logs.join(" / ")}</p>
                  <button
                    onClick={() => {
                      const copy = makeSlot(
                        `${active.name.slice(0, 40)}・第${g.generation}代分支`,
                        structuredClone(g.state),
                      );
                      persist({
                        ...ref.current,
                        active: copy.id,
                        slots: [...ref.current.slots, copy],
                      });
                      setEpoch((e) => e + 1);
                      setOpen(false);
                    }}
                  >
                    從此快照建立獨立接班分支
                  </button>
                </details>
              ))}
            </>
          )}
        </section>
      )}
      <div className="sync-message" role="status">
        {busy ? "同步 / 驗證進行中… " : ""}
        {message}
        {storageError && <strong>　{storageError}</strong>}
      </div>
      {home && (
        <StartScreen
          hasSave={!!active}
          onContinue={() => {
            setHome(false);
            setOpen(false);
          }}
          onCreate={(config) => {
            try {
              const slot = makeSlot(config.familyName, createAdventure(config));
              persist({
                ...ref.current,
                active: slot.id,
                slots: [...ref.current.slots, slot],
              });
              setHome(false);
              setOpen(false);
              setEpoch((e) => e + 1);
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
        />
      )}
      {active &&
        !home &&
        children(
          active.state,
          onChange,
          `${active.id}:${epoch}`,
          () => {
            if (persist(ref.current)) setMessage("目前家族已儲存在本機。");
          },
          () => {
            try {
              const next = readLibrary(localStorage);
              setLib(next);
              setEpoch((e) => e + 1);
              setMessage("已讀取本機家族進度。");
            } catch (e) {
              setMessage((e as Error).message);
            }
          },
          open || rankingsOpen || lawOpen,
        )}
    </>
  );
}
