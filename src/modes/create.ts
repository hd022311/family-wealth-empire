import { setupStory } from "../story/setup";
import { initial, type State } from "../simulation";
import { createClan, projectFamily, syncActive } from "../family/engine";
import type { Background } from "../family/types";
import { newWorld } from "../world/model";
export type Setup = {
  mode: "story" | "free";
  name: string;
  familyName: string;
  background: Exclude<Background, "legacy">;
  age: number;
  spouse: boolean;
  children: number;
};
export function createAdventure(config: Setup): State {
  if (
    !config.name.trim() ||
    !config.familyName.trim() ||
    config.name.length > 30 ||
    config.familyName.length > 30 ||
    !["story", "free"].includes(config.mode) ||
    !["self-made", "ordinary", "wealthy"].includes(config.background) ||
    !Number.isInteger(config.age) ||
    config.age < 18 ||
    config.age > 60 ||
    !Number.isInteger(config.children) ||
    config.children < 0 ||
    config.children > 3 ||
    (!config.spouse && config.children > 0)
  )
    throw Error("開局設定無效");
  const s = initial(),
    story = config.mode === "story";
  s.age = story ? 30 : config.age;
  s.family = [];
  if (story || config.spouse)
    s.family.push({ id: 1, name: "林知夏", age: s.age, role: "配偶" });
  for (let i = 0; i < (story ? 2 : config.children); i++)
    s.family.push({
      id: i + 2,
      name: ["林晨", "林星", "林晴"][i],
      age: Math.max(0, Math.min(s.age - 18, 4 - i * 3)),
      role: "子女",
    });
  const bg = story ? "wealthy" : config.background;
  s.cash = bg === "self-made" ? 300000 : bg === "ordinary" ? 600000 : 1800000;
  s.clan = createClan(bg, s.family, s.age);
  s.clan.people[0].name = config.name.trim();
  if (!story) {
    s.clan.people.find((p) => p.id === 10)!.age = s.age + 23;
    s.clan.people.find((p) => p.id === 11)!.age = s.age + 21;
    s.clan.people.find((p) => p.id === 12)!.age = s.age + 3;
  }
  if (story) {
    s.clan.people.find((p) => p.id === 10)!.age = 62;
    s.clan.people.find((p) => p.id === 11)!.age = 60;
    const sibling = structuredClone(s.clan.people.find((p) => p.id === 12)!);
    sibling.id = 15;
    sibling.name = "林予晴";
    sibling.age = 27;
    sibling.finances = {
      cash: 180000,
      home: 0,
      stocks: 20000,
      business: 0,
      debt: 0,
      income: 38000,
      expenses: 30000,
    };
    sibling.goal = "兼顧職涯與照顧父母";
    sibling.responsibilities = ["自負生活費", "協商父母照顧"];
    s.clan.people.push(sibling);
    s.clan.links.push(
      { from: 10, to: 15, kind: "parent" },
      { from: 11, to: 15, kind: "parent" },
    );
  }
  s.world = newWorld(config.mode, config.name.trim(), config.familyName.trim());
  if (story) s.story = setupStory(s);
  projectFamily(s);
  syncActive(s);
  s.logs = ["新人生開始：父母財產與玩家財產分開，所有市場均為虛構資料。"];
  return s;
}
