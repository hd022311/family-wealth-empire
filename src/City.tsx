import { familyPlace } from "./story/definitions";
import { pathTo } from "./world/navigation";
import { places } from "./world/model";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import type { State } from "./simulation";
import { isUnderConstruction } from "./simulation";
import {
  ageAppearance,
  clampZoom,
  environmentAt,
  readCitySettings,
  SETTINGS_KEY,
  type CitySettings,
  type CityEvent,
} from "./cityModel";

type Props = {
  state: State;
  speed: number;
  paused: boolean;
  selected: number;
  onMove?: (x: number, y: number) => void;
  onSelect: (id: number) => void;
  onMember: (id: number) => void;
};
type Controller = {
  sync: (state: State, initial?: boolean) => void;
  settings: (settings: CitySettings) => void;
  zoom: (amount: number) => void;
  reset: () => void;
};
const sites = [
  { x: 1, y: 1, h: 65, color: 0xf3cf9b, name: "青禾小宅", id: 0 },
  { x: 5, y: 1, h: 113, color: 0x96c6db, name: "河畔公寓", id: 1 },
  { x: 1, y: 5, h: 57, color: 0xf4a181, name: "轉角商店", id: 2 },
  { x: 5, y: 5, h: 74, color: 0xf1d59b, name: "日光住宅", id: 3 },
  { x: 6, y: 3.8, h: 92, color: 0xb9d2d0, name: "青禾銀行", id: 4 },
];
const iso = (x: number, y: number) =>
  new Phaser.Math.Vector2(420 + (x - y) * 53, 90 + (x + y) * 27);
const phaseNames = { day: "白天", dusk: "黃昏", night: "夜晚" };
const weatherNames = { sunny: "晴天", cloudy: "陰天", rainy: "雨天" };
export function City(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef(props),
    controller = useRef<Controller | null>(null);
  latest.current = props;
  const [settings, setSettings] = useState(() =>
    readCitySettings(
      localStorage,
      matchMedia("(prefers-reduced-motion: reduce)").matches,
      matchMedia("(pointer: coarse)").matches,
    ),
  );
  const config = useRef(settings);
  config.current = settings;
  const [environment, setEnvironment] = useState("白天 · 晴天"),
    [zoom, setZoom] = useState(100),
    [feedback, setFeedback] = useState(
      "點選建築或人物；拖曳地圖，雙指或滾輪縮放。",
    );
  useEffect(() => {
    controller.current?.sync(props.state);
  }, [props.state]);
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(
      settings.reducedMotion,
    );
    controller.current?.settings(settings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* Visual preferences are optional. */
    }
  }, [settings]);
  useEffect(() => {
    class Town extends Phaser.Scene {
      private labelReadingKey = "";
      private model = latest.current.state;
      private preferences = config.current;
      private seen = new Set<string>();
      private buildings = new Map<number, Phaser.GameObjects.Container>();
      private windows: { x: number; y: number; w: number; h: number }[] = [];
      private trees: Phaser.GameObjects.Container[] = [];
      private cranes: { hook: Phaser.GameObjects.Rectangle; base: number }[] =
        [];
      private traffic: {
        sprite: Phaser.GameObjects.Sprite;
        route: Phaser.Math.Vector2[];
        offset: number;
        rate: number;
        category: "car" | "person" | "customer";
      }[] = [];
      private family = new Map<
        number,
        {
          sprite: Phaser.GameObjects.Sprite;
          label: Phaser.GameObjects.Text;
          age: number;
          role: string;
          route: Phaser.Math.Vector2[];
        }
      >();
      private clouds: Phaser.GameObjects.Container[] = [];
      private shade!: Phaser.GameObjects.Rectangle;
      private lampGlow!: Phaser.GameObjects.Graphics;
      private rain!: Phaser.GameObjects.Graphics;
      private selection!: Phaser.GameObjects.Graphics;
      private particles: { x: number; y: number }[] = [];
      private lamps: Phaser.Math.Vector2[] = [];
      private elapsed = 0;
      private familyTime = 0;
      private walking: { x: number; y: number }[] = [];
      private walkTarget = "";
      private walkingPoint = { x: 1, y: 2 };
      private citizens: {
        sprite: Phaser.GameObjects.Sprite;
        label: Phaser.GameObjects.Text;
        id: number;
      }[] = [];
      private lastReport = -1000;
      private down = { x: 0, y: 0, scrollX: 0, scrollY: 0 };
      private dragged = false;
      private pinched = false;
      private pinchDistance = 0;
      private fading = new Set<Phaser.GameObjects.GameObject>();
      private popupTexts: Phaser.GameObjects.Text[] = [];
      create() {
        this.makeTextures();
        this.drawGround();
        if (this.model.world) {
          this.walkingPoint = { ...this.model.world.position };
          for (const id of [5, 6, 7]) {
            const p = places[id],
              pos = iso(p.x, p.y);
            const pad = this.add
              .rectangle(
                pos.x,
                pos.y - 30,
                85,
                65,
                id === 6 ? 0x85b96a : 0xa1c8dd,
              )
              .setDepth(pos.y - 5)
              .setInteractive({ useHandCursor: true });
            this.add
              .text(pos.x, pos.y - 55, p.name, {
                fontSize: "15px",
                color: "#163e31",
                backgroundColor: "#fff8e3",
              })
              .setOrigin(0.5)
              .setDepth(pos.y + 1);
            pad.on("pointerup", (p: Phaser.Input.Pointer) => {
              if (this.clickAllowed(p)) latest.current.onSelect(id);
            });
          }
          for (const n of this.model.world.npcs) {
            const pos = iso(places[n.place].x, places[n.place].y);
            const sprite = this.add
              .sprite(pos.x, pos.y, "npc-0-adult")
              .setScale(0.8);
            const label = this.add
              .text(pos.x, pos.y - 30, n.name, {
                fontSize: "10px",
                color: "#234b40",
                backgroundColor: "#fff8e3",
              })
              .setOrigin(0.5);
            sprite
              .setInteractive({ useHandCursor: true })
              .on("pointerup", (p: Phaser.Input.Pointer) => {
                if (this.clickAllowed(p)) {
                  const current = this.model.world!.npcs.find(
                    (c) => c.id === n.id,
                  )!;
                  latest.current.onSelect(current.place);
                  setFeedback(`${current.name} · ${current.goal}`);
                }
              });
            this.citizens.push({ sprite, label, id: n.id });
          }
        }
        this.shade = this.add
          .rectangle(0, 0, 840, 570, 0x17284c, 0)
          .setOrigin(0)
          .setDepth(20000);
        this.lampGlow = this.add.graphics().setDepth(20001);
        this.rain = this.add.graphics().setScrollFactor(0).setDepth(20002);
        this.selection = this.add.graphics().setDepth(-10);
        for (let i = 0; i < 80; i++)
          this.particles.push({ x: (i * 157) % 900, y: (i * 83) % 650 });
        for (let i = 0; i < 4; i++) {
          const cloud = this.add
            .container(90 + i * 230, 40 + (i % 2) * 72)
            .setDepth(10000)
            .setAlpha(0.3);
          cloud.add([
            this.add.ellipse(0, 0, 105, 30, 0xffffff),
            this.add.ellipse(-20, -11, 48, 30, 0xffffff),
            this.add.ellipse(17, -16, 58, 36, 0xffffff),
          ]);
          this.clouds.push(cloud);
        }
        for (let i = 0; i < 5; i++)
          this.traffic.push({
            sprite: this.add.sprite(0, 0, `car-${i % 3}`).setScale(0.9),
            route: [iso(-0.6, 3.25), iso(7.7, 3.25)],
            offset: i / 5,
            rate: 0.027,
            category: "car",
          });
        for (let i = 0; i < 12; i++)
          this.traffic.push({
            sprite: this.add.sprite(0, 0, `npc-${i % 3}-adult`),
            route:
              i < 8
                ? [iso(3.4, -0.3), iso(3.4, 7.3)]
                : [iso(5.7, 5.5), iso(6.8, 6.2), iso(6.4, 7.1), iso(5.7, 5.5)],
            offset: i / 12,
            rate: 0.018,
            category: "person",
          });
        for (let i = 0; i < 4; i++)
          this.traffic.push({
            sprite: this.add.sprite(0, 0, `npc-${i % 3}-adult`),
            route: [iso(3, 5.2), iso(1.6, 5.2), iso(1.2, 5.1), iso(3, 5.2)],
            offset: i / 4,
            rate: 0.06,
            category: "customer",
          });
        this.cameras.main.setBounds(-220, -160, 1280, 900);
        this.cameras.main.setScroll(0, 0);
        this.installInput();
        controller.current = {
          sync: (s, first) => this.sync(s, first),
          settings: (s) => {
            this.preferences = s;
            if (s.reducedMotion) {
              this.tweens.killAll();
              this.fading.forEach((o) => o.destroy());
              this.fading.clear();
            }
          },
          zoom: (amount) => this.zoomAt(this.cameras.main.zoom + amount),
          reset: () => {
            this.cameras.main.setZoom(1).setScroll(0, 0);
            setZoom(100);
          },
        };
        this.sync(latest.current.state, true);
        this.events.once("shutdown", () => {
          controller.current = null;
        });
      }
      private makeTextures() {
        const draw = this.make.graphics({ x: 0, y: 0 });
        for (const role of [
          "player",
          "spouse",
          "child",
          "npc-0",
          "npc-1",
          "npc-2",
        ])
          for (const age of ["baby", "child", "adult", "elder"]) {
            draw.clear();
            const body =
              role === "player"
                ? 0x3060aa
                : role === "spouse"
                  ? 0xcc5f80
                  : role === "child"
                    ? 0xeab84b
                    : role === "npc-0"
                      ? 0x5b9d85
                      : role === "npc-1"
                        ? 0xd47751
                        : 0x6c81b0;
            const small = age === "baby" || age === "child";
            const h = small ? 12 : 20;
            const headY = 28 - h;
            draw.fillStyle(0x234c45, 0.2);
            draw.fillEllipse(12, 31, 17, 6);
            draw.fillStyle(0x364f5a);
            draw.fillRect(7, 26, 4, 5);
            draw.fillRect(13, 26, 4, 5);
            draw.fillStyle(body);
            draw.fillRoundedRect(6, headY + 4, 12, h - 3, 3);
            draw.fillStyle(0xf3c79f);
            draw.fillCircle(12, headY, 6);
            draw.fillStyle(age === "elder" ? 0xdedfd6 : 0x493f42);
            draw.fillRoundedRect(6, headY - 6, 12, 5, 2);
            draw.fillStyle(0x393839);
            draw.fillRect(13, headY, 2, 2);
            if (role === "player") {
              draw.fillStyle(0x244c78);
              draw.fillRect(4, headY - 6, 16, 3);
            }
            if (age === "elder") {
              draw.lineStyle(1, 0x8a735c);
              draw.lineBetween(20, 20, 20, 32);
            }
            draw.generateTexture(`${role}-${age}`, 24, 36);
          }
        [0xe39755, 0x5c9ebd, 0xd67d7d].forEach((color, i) => {
          draw.clear();
          draw.fillStyle(0x173e3e, 0.22);
          draw.fillEllipse(20, 23, 38, 10);
          draw.fillStyle(0x34434d);
          draw.fillCircle(9, 21, 4);
          draw.fillCircle(30, 21, 4);
          draw.fillStyle(color);
          draw.fillRoundedRect(1, 8, 38, 14, 5);
          draw.fillStyle(0xb7deeb);
          draw.fillRoundedRect(9, 3, 23, 10, 4);
          draw.fillStyle(0xffedb9);
          draw.fillRect(2, 13, 4, 4);
          draw.fillRect(33, 13, 4, 4);
          draw.generateTexture(`car-${i}`, 40, 30);
        });
        draw.destroy();
      }
      private drawGround() {
        const ground = this.add.graphics().setDepth(-1000);
        for (let x = 0; x < 8; x++)
          for (let y = 0; y < 8; y++) {
            const a = iso(x, y);
            const road = x === 3 || y === 3;
            ground.fillStyle(
              road ? 0x788e91 : (x + y) % 2 ? 0xa7d1a7 : 0xb8dcb1,
            );
            ground.fillPoints(
              [
                { x: a.x, y: a.y - 27 },
                { x: a.x + 53, y: a.y },
                { x: a.x, y: a.y + 27 },
                { x: a.x - 53, y: a.y },
              ],
              true,
            );
            ground.lineStyle(1, road ? 0x98aaab : 0x99c59d, 0.35);
            ground.strokePoints(
              [
                { x: a.x, y: a.y - 27 },
                { x: a.x + 53, y: a.y },
                { x: a.x, y: a.y + 27 },
                { x: a.x - 53, y: a.y },
              ],
              true,
            );
            if (road) {
              ground.lineStyle(2, 0xf1e4b6, 0.85);
              ground.lineBetween(a.x - 8, a.y - 4, a.x + 8, a.y + 4);
            }
            if (!road && (x + y) % 3 === 0) {
              ground.fillStyle(0xf6db87);
              for (let j = 0; j < 3; j++)
                ground.fillCircle(a.x - 14 + j * 13, a.y + 9, 2);
            }
          }
        const park = iso(6.3, 6.2);
        ground.fillStyle(0x83bfa6);
        ground.fillEllipse(park.x, park.y, 132, 66);
        ground.fillStyle(0xd8e2c4);
        ground.fillEllipse(park.x, park.y, 94, 45);
        ground.fillStyle(0x76c7da);
        ground.fillEllipse(park.x, park.y, 68, 29);
        ground.lineStyle(2, 0xd8f2e6);
        ground.strokeEllipse(park.x, park.y, 50, 19);
        this.add
          .text(park.x, park.y + 27, "青禾公園", {
            fontSize: "12px",
            color: "#477965",
            backgroundColor: "#edf2dc",
            padding: { x: 5, y: 3 },
          })
          .setOrigin(0.5)
          .setDepth(park.y + 3);
        for (const [x, y] of [
          [0, 3],
          [2, 6],
          [6, 0],
          [7, 6],
          [0, 5],
          [4, 0],
          [7, 4],
          [1, 7],
        ]) {
          const a = iso(x, y);
          const tree = this.add.container(a.x, a.y).setDepth(a.y + 10);
          const trunk = this.add.rectangle(0, -8, 6, 25, 0x987951);
          const crown = this.add.container(0, -32);
          crown.add([
            this.add.ellipse(0, 0, 33, 40, 0x478c69),
            this.add.ellipse(-9, -9, 23, 27, 0x69ab78),
            this.add.ellipse(9, -4, 19, 28, 0x559b6e),
          ]);
          tree.add([trunk, crown]);
          this.trees.push(crown);
        }
        for (const [x, y] of [
          [3.6, 0.5],
          [3.6, 5.8],
          [0.5, 3.5],
          [6.8, 3.5],
        ]) {
          const a = iso(x, y);
          this.lamps.push(a);
          const lamp = this.add.graphics().setDepth(a.y + 12);
          lamp.lineStyle(3, 0x536f6e);
          lamp.lineBetween(a.x, a.y, a.x, a.y - 35);
          lamp.lineBetween(a.x, a.y - 35, a.x + 10, a.y - 39);
          lamp.fillStyle(0xf9dd8e);
          lamp.fillEllipse(a.x + 10, a.y - 37, 13, 6);
        }
        const bench = iso(5.4, 6.5);
        const b = this.add.graphics().setDepth(bench.y);
        b.lineStyle(5, 0xb18c63);
        b.lineBetween(bench.x - 18, bench.y - 10, bench.x + 15, bench.y + 6);
        b.lineStyle(2, 0x626e5b);
        b.lineBetween(bench.x - 12, bench.y - 6, bench.x - 12, bench.y + 3);
        b.lineBetween(bench.x + 10, bench.y + 5, bench.x + 10, bench.y + 12);
      }
      private path(
        from: { x: number; y: number },
        to: { x: number; y: number },
      ) {
        return pathTo(
          from,
          to,
          this.model.story
            ? [
                { x: 0, y: 0 },
                { x: 7, y: 7 },
              ]
            : [],
        );
      }
      private sites() {
        return this.model.story
          ? [
              ...sites,
              { id: 8, x: 0, y: 0, h: 50, color: 0xdcbf93, name: "父母自住房" },
              { id: 9, x: 7, y: 7, h: 76, color: 0xa9c5dc, name: "父母出租房" },
            ]
          : sites;
      }
      private renderBuildings() {
        this.buildings.forEach((b) => b.destroy());
        this.buildings.clear();
        this.windows = [];
        this.cranes = [];
        for (const b of this.sites()) {
          const p = this.model.properties.find((p) => p.id === b.id);
          const parentHouse = this.model.story?.houses.find(
            (h) => h.place === b.id,
          );
          const a = iso(b.x, b.y);
          const level = p?.level ?? 1;
          const h = b.h + (level - 1) * 22,
            w = 39;
          const container = this.add.container(a.x, a.y).setDepth(a.y);
          const g = this.add.graphics();
          container.add(g);
          const poly = (pts: number[][], color: number) => {
            g.fillStyle(color);
            g.fillPoints(
              pts.map(([x, y]) => ({ x, y })),
              true,
            );
          };
          g.fillStyle(0x345756, 0.16);
          g.fillEllipse(12, 10, 112, 40);
          poly(
            [
              [-w, 0],
              [0, 21],
              [0, 21 - h],
              [-w, -h],
            ],
            p?.owned || parentHouse
              ? b.color
              : Phaser.Display.Color.ValueToColor(b.color).desaturate(12).color,
          );
          poly(
            [
              [0, 21],
              [w, 0],
              [w, -h],
              [0, 21 - h],
            ],
            Phaser.Display.Color.ValueToColor(b.color).darken(15).color,
          );
          poly(
            [
              [-w, -h],
              [0, -21 - h],
              [w, -h],
              [0, 21 - h],
            ],
            level === 3 ? 0x4c6fb0 : 0x467f85,
          );
          g.lineStyle(2, 0xeff2d6);
          g.lineBetween(-w, -h, 0, 21 - h);
          g.lineBetween(0, 21 - h, w, -h);
          for (let row = 0; row < Math.floor(h / 24); row++)
            for (let col = 0; col < 2; col++) {
              g.fillStyle(0xbde4e9);
              g.fillRect(-30 + col * 15, -h + 16 + row * 23 + col * 5, 8, 10);
              g.fillStyle(0x7bb1c6);
              g.fillRect(8 + col * 15, -h + 24 + row * 23 - col * 5, 8, 10);
              this.windows.push(
                {
                  x: a.x - 30 + col * 15,
                  y: a.y - h + 16 + row * 23 + col * 5,
                  w: 8,
                  h: 10,
                },
                {
                  x: a.x + 8 + col * 15,
                  y: a.y - h + 24 + row * 23 - col * 5,
                  w: 8,
                  h: 10,
                },
              );
            }
          g.fillStyle(0x5b7270);
          g.fillRect(-15, -10, 11, 20);
          if (b.id === 2) {
            for (let j = 0; j < 6; j++) {
              g.fillStyle(j % 2 ? 0xf9e4b6 : 0xc85a51);
              g.fillRect(-39 + j * 13, -24 + j * 2, 13, 8);
            }
            g.fillStyle(0xffe5a0);
            g.fillRect(-32, -10, 14, 12);
          }
          if (
            (p && isUnderConstruction(this.model, p)) ||
            (parentHouse && parentHouse.repairUntil > this.model.month)
          ) {
            g.lineStyle(3, 0xcda463);
            for (const x of [-46, 46]) {
              g.lineBetween(x, 5, x, -h - 15);
              for (let y = -h; y < 10; y += 22)
                g.lineBetween(-46, y, 46, y + 7);
            }
            g.fillStyle(0xf3b958);
            g.fillTriangle(-8, -h - 28, 9, -h - 20, -8, -h - 14);
            const hook = this.add.rectangle(36, -h + 12, 7, 12, 0xf0b650);
            container.add(hook);
            this.cranes.push({ hook, base: -h + 12 });
            container.add(
              this.add
                .sprite(-30, 2, "npc-1-adult")
                .setOrigin(0.5, 1)
                .setScale(0.8),
            );
          }
          const title =
            b.id === 2 && level > 1
              ? level === 3
                ? "青禾公司"
                : "青禾商社"
              : b.name;
          const label = this.add
            .text(0, 32, `${title}${level > 1 ? ` Lv.${level}` : ""}`, {
              fontSize: "14px",
              fontFamily: "sans-serif",
              color: "#244e4d",
              backgroundColor: "#fff8e3",
              padding: { x: 6, y: 4 },
            })
            .setOrigin(0.5);
          container.add(label);
          const stateLabel = parentHouse
            ? `${parentHouse.estateId ? "獨立遺產清冊" : this.model.clan.people.find((p) => p.id === parentHouse.ownerId)?.name + "持有"} · ${parentHouse.repairUntil > this.model.month ? "施工中" : parentHouse.use === "rental" ? "出租中" : "自住"}`
            : p
              ? isUnderConstruction(this.model, p)
                ? "施工中"
                : p.estateLock
                  ? "遺產保管"
                  : !p.owned
                    ? "待售"
                    : p.rented
                      ? "出租中"
                      : p.operating
                        ? "營運中"
                        : "空置"
              : "房貸服務";
          const badge = this.add
            .text(0, -h - 30, stateLabel, {
              fontSize: "11px",
              color: p?.rented || p?.operating ? "#fff8e4" : "#4c6c62",
              backgroundColor:
                p?.rented || p?.operating ? "#388367" : "#eff2da",
              padding: { x: 5, y: 3 },
            })
            .setOrigin(0.5);
          container.add(badge);
          const zone = this.add
            .zone(0, -h / 2, 96, h + 48)
            .setInteractive({ useHandCursor: true });
          container.add(zone);
          zone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (this.clickAllowed(pointer)) {
              latest.current.onSelect(b.id);
              setFeedback(`${title} · ${stateLabel}`);
            }
          });
          this.buildings.set(b.id, container);
        }
      }
      private familyRoute(age: number, index: number) {
        if (age >= 65)
          return [iso(5.7, 5.6), iso(6.8, 6.1), iso(6.2, 6.6), iso(5.7, 5.6)];
        if (age < 18)
          return [
            iso(2.3, 1.2),
            iso(3.5, 1.2),
            iso(3.5, 5.7),
            iso(5.8, 6),
            iso(3.5, 5.7),
            iso(2.3, 1.2),
          ];
        return index % 2
          ? [
              iso(2, 1.6),
              iso(3.5, 1.6),
              iso(3.5, 4.8),
              iso(1.6, 4.8),
              iso(3.5, 4.8),
              iso(2, 1.6),
            ]
          : [
              iso(2, 1.4),
              iso(3.5, 1.4),
              iso(5.7, 3.6),
              iso(3.5, 1.4),
              iso(2, 1.4),
            ];
      }
      private renderFamily() {
        const members = [
          {
            id: this.model.clan.activeId,
            name: "家主",
            age: this.model.age,
            role: "家主",
          },
          ...this.model.family,
        ].filter(
          (m) =>
            m.age < 85 &&
            this.model.clan.people.find((p) => p.id === m.id)?.alive !==
              false &&
            !(m.id === this.model.clan.activeId && this.model.dead),
        );
        for (const [id, actor] of this.family)
          if (!members.some((m) => m.id === id)) {
            actor.sprite.destroy();
            actor.label.destroy();
            this.family.delete(id);
          }
        members.forEach((m, index) => {
          const role =
            m.id === this.model.clan.activeId
              ? "player"
              : m.role === "配偶"
                ? "spouse"
                : m.role === "父母"
                  ? "npc-0"
                  : m.role === "手足"
                    ? "npc-2"
                    : "child";
          const texture = `${role}-${ageAppearance(m.age)}`;
          let actor = this.family.get(m.id);
          if (!actor) {
            const sprite = this.add
              .sprite(0, 0, texture)
              .setOrigin(0.5, 1)
              .setScale(1.12)
              .setInteractive({ useHandCursor: true });
            const label = this.add
              .text(0, 0, m.id === this.model.clan.activeId ? "家主" : m.name, {
                fontSize: "10px",
                color: "#fff8e8",
                backgroundColor:
                  m.id === this.model.clan.activeId
                    ? "#3866a2"
                    : m.role === "配偶"
                      ? "#a75674"
                      : "#9b7a32",
                padding: { x: 3, y: 2 },
              })
              .setOrigin(0.5, 1);
            sprite.on("pointerup", (p: Phaser.Input.Pointer) => {
              if (this.clickAllowed(p)) {
                latest.current.onMember(m.id);
                setFeedback(
                  `${m.id === this.model.clan.activeId ? "家主" : this.model.family.find((member) => member.id === m.id)?.name} · ${Math.floor(this.family.get(m.id)?.age ?? m.age)} 歲`,
                );
              }
            });
            actor = {
              sprite,
              label,
              age: m.age,
              role: m.role,
              route: this.familyRoute(m.age, index),
            };
            this.family.set(m.id, actor);
          }
          actor.label.setText(
            m.id === this.model.clan.activeId
              ? "家主"
              : m.name +
                  (this.model.story?.episode?.parentId === m.id &&
                  this.model.story.episode.status === "active"
                    ? " · 照護中"
                    : ""),
          );
          actor.age = m.age;
          actor.role = m.role;
          actor.sprite.setTexture(texture);
          actor.route = this.familyRoute(m.age, index);
          if (this.model.story && m.id !== this.model.clan.activeId) {
            const location = familyPlace(m.id),
              p = places[location];
            const clinic =
              this.model.story.episode &&
              this.model.story.episode.status === "active" &&
              (m.id === 10 || m.id === 11);
            actor.route = clinic
              ? [iso(p.x, p.y), iso(1, 3), iso(1, 6), iso(p.x, p.y)]
              : [
                  iso(p.x - 0.15, p.y),
                  iso(p.x + 0.5, p.y + 0.15),
                  iso(p.x + 0.25, p.y + 0.5),
                  iso(p.x - 0.15, p.y),
                ];
          }
        });
      }
      sync(state: State, first = false) {
        const previous = this.model;
        this.model = state;
        this.renderBuildings();
        this.renderFamily();
        if (first) {
          state.city.events.forEach((e) => this.seen.add(e.id));
          return;
        }
        if (
          previous.generation !== state.generation ||
          state.city.sequence < previous.city.sequence
        ) {
          this.seen.clear();
          this.familyTime = 0;
        }
        state.city.events.forEach((event) => {
          if (!this.seen.has(event.id)) {
            this.seen.add(event.id);
            this.showEvent(event);
          }
        });
        // Limit presentation memory independently of simulation history.
        if (this.seen.size > 100)
          this.seen = new Set(state.city.events.map((e) => e.id));
      }
      private showEvent(event: CityEvent) {
        setFeedback(event.title);
        const site = this.sites().find(
          (s) => s.id === (event.placeId ?? event.propertyId),
        );
        const point = site
          ? iso(site.x, site.y)
          : event.placeId !== undefined && places[event.placeId]
            ? iso(places[event.placeId].x, places[event.placeId].y)
            : iso(3.3, 3.3);
        const summary =
          event.title.length > 34
            ? event.title.slice(0, 34) + "…"
            : event.title;
        const title =
          event.amount === undefined
            ? summary
            : `${summary}\n${event.amount < 0 ? "支出" : event.placeId !== undefined && event.placeId >= 8 ? "屋主帳戶入帳" : "已入帳"} ＄${Math.abs(event.amount).toLocaleString()}`;
        this.popupTexts = this.popupTexts.filter((t) => t.active);
        while (this.popupTexts.length >= 2) {
          const old = this.popupTexts.shift()!;
          this.tweens.killTweensOf(old);
          this.fading.delete(old);
          old.destroy();
        }
        const text = this.add
          .text(
            point.x,
            Math.max(85, point.y - 90) - this.popupTexts.length * 28,
            title,
            {
              fontSize: `${parseFloat(getComputedStyle(document.documentElement).fontSize) / Math.max(.1, ((host.current?.clientWidth || 840) / 840) * this.cameras.main.zoom)}px`,
              color:
                event.amount !== undefined && event.amount < 0
                  ? "#805b31"
                  : "#205e49",
              backgroundColor: "#fff9dc",
              padding: { x: 10, y: 7 },
              align: "center",
              wordWrap: { width: 240 },
            },
          )
          .setOrigin(0.5)
          .setDepth(22000);
        this.fading.add(text);
        this.popupTexts.push(text);
        host.current!.dataset.activePopups = String(this.popupTexts.length);
        const cleanup = () => {
          this.popupTexts = this.popupTexts.filter(
            (t) => t !== text && t.active,
          );
          if (host.current)
            host.current.dataset.activePopups = String(this.popupTexts.length);
          this.fading.delete(text);
          text.destroy();
        };
        if (this.preferences.reducedMotion) {
          this.time.delayedCall(2200, cleanup);
          return;
        }
        this.tweens.add({
          targets: text,
          y: text.y - 45,
          alpha: 0,
          delay: 1000,
          duration: 1500,
          onComplete: cleanup,
        });
        if (
          ["marriage", "retirement", "death", "succession"].includes(event.kind)
        ) {
          const glyph =
            event.kind === "marriage"
              ? "♡"
              : event.kind === "retirement"
                ? "♧"
                : event.kind === "death"
                  ? "✦"
                  : "♛";
          const emblem = this.add
            .text(point.x, point.y - 165, glyph, {
              fontSize: "42px",
              color: event.kind === "death" ? "#fff8e8" : "#f4d37a",
              stroke: "#53756b",
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setDepth(22001);
          this.fading.add(emblem);
          this.tweens.add({
            targets: emblem,
            y: emblem.y - 18,
            alpha: 0,
            delay: 700,
            duration: 1700,
            onComplete: () => {
              this.fading.delete(emblem);
              emblem.destroy();
            },
          });
        }
        const building =
          event.propertyId === undefined
            ? undefined
            : this.buildings.get(event.propertyId);
        if (
          building &&
          ["purchase", "renovation", "expansion"].includes(event.kind)
        )
          this.tweens.add({
            targets: building,
            scaleX: 1.05,
            scaleY: 1.05,
            yoyo: true,
            duration: 320,
            repeat: 1,
          });
        if (
          ["move-in", "marriage", "birth", "succession"].includes(event.kind)
        ) {
          const person = this.add
            .sprite(
              point.x + 50,
              point.y + 8,
              event.kind === "birth" ? "child-baby" : "spouse-adult",
            )
            .setOrigin(0.5, 1)
            .setDepth(point.y + 20);
          this.fading.add(person);
          this.tweens.add({
            targets: person,
            x: point.x - 15,
            y: point.y,
            alpha: 0.1,
            duration: 1700,
            onComplete: () => {
              this.fading.delete(person);
              person.destroy();
            },
          });
        }
      }
      private clickAllowed(p: Phaser.Input.Pointer) {
        return !this.dragged && !this.pinched && p.getDistance() < 10;
      }
      private zoomAt(value: number, x = 420, y = 285) {
        const camera = this.cameras.main,
          before = camera.getWorldPoint(x, y);
        camera.setZoom(clampZoom(value));
        camera.scrollX = before.x - 420 - (x - 420) / camera.zoom;
        camera.scrollY = before.y - 285 - (y - 285) / camera.zoom;
        setZoom(Math.round(camera.zoom * 100));
      }
      private installInput() {
        this.input.addPointer(1);
        this.input.on(
          "pointerup",
          (p: Phaser.Input.Pointer, objects: unknown[]) => {
            if (!this.model.world || objects.length || !this.clickAllowed(p))
              return;
            const point = this.cameras.main.getWorldPoint(p.x, p.y),
              a = (point.x - 420) / 53,
              b = (point.y - 90) / 27,
              x = Math.round((a + b) / 2),
              y = Math.round((b - a) / 2);
            if (this.path(this.model.world.position, { x, y }).length)
              latest.current.onMove?.(x, y);
          },
        );
        this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
          const active = this.input.manager.pointers.filter((p) => p.isDown);
          if (active.length > 1) {
            this.pinched = true;
            this.pinchDistance = Phaser.Math.Distance.Between(
              active[0].x,
              active[0].y,
              active[1].x,
              active[1].y,
            );
            return;
          }
          this.pinched = false;
          this.dragged = false;
          this.down = {
            x: p.x,
            y: p.y,
            scrollX: this.cameras.main.scrollX,
            scrollY: this.cameras.main.scrollY,
          };
        });
        this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
          if (!p.isDown) return;
          const active = this.input.manager.pointers.filter((p) => p.isDown);
          if (active.length > 1) {
            this.pinched = true;
            const a = active[0],
              b = active[1],
              distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
            if (this.pinchDistance > 0)
              this.zoomAt(
                (this.cameras.main.zoom * distance) / this.pinchDistance,
                (a.x + b.x) / 2,
                (a.y + b.y) / 2,
              );
            this.pinchDistance = distance;
            return;
          }
          if (this.pinched) return;
          const dx = p.x - this.down.x,
            dy = p.y - this.down.y;
          if (Math.hypot(dx, dy) > 6) this.dragged = true;
          if (this.dragged) {
            this.cameras.main.scrollX =
              this.down.scrollX - dx / this.cameras.main.zoom;
            this.cameras.main.scrollY =
              this.down.scrollY - dy / this.cameras.main.zoom;
          }
        });
        this.input.on(
          "wheel",
          (
            _p: Phaser.Input.Pointer,
            _objects: unknown,
            _dx: number,
            dy: number,
          ) => {
            this.zoomAt(
              this.cameras.main.zoom * (dy > 0 ? 0.9 : 1.1),
              _p.x,
              _p.y,
            );
          },
        );
      }
      private along(route: Phaser.Math.Vector2[], progress: number) {
        const t = (((progress % 1) + 1) % 1) * (route.length - 1);
        const index = Math.floor(t);
        return new Phaser.Math.Vector2(
          Phaser.Math.Linear(route[index].x, route[index + 1].x, t - index),
          Phaser.Math.Linear(route[index].y, route[index + 1].y, t - index),
        );
      }
      update(_time: number, delta: number) {
        if (!this.shade || document.hidden) return;
        const dt = Math.min(delta, 80);
        const reduced = this.preferences.reducedMotion;
        if (!reduced) this.elapsed += dt;
        if (
          !reduced &&
          !latest.current.paused &&
          latest.current.speed > 0 &&
          !this.model.dead &&
          document.hasFocus()
        )
          this.familyTime += dt * Math.min(latest.current.speed, 4);
        const env = environmentAt(this.elapsed, this.preferences),
          camera = this.cameras.main;
        this.shade
          .setPosition(
            camera.scrollX + 420 - 420 / camera.zoom,
            camera.scrollY + 285 - 285 / camera.zoom,
          )
          .setDisplaySize(840 / camera.zoom, 570 / camera.zoom)
          .setFillStyle(
            env.phase === "dusk" ? 0xa06752 : 0x17284c,
            env.night * 0.38 +
              (env.weather === "cloudy"
                ? 0.09
                : env.weather === "rainy"
                  ? 0.14
                  : 0),
          );
        this.lampGlow.clear();
        if (env.night > 0) {
          this.lampGlow.fillStyle(0xffdc79, 0.85 * env.night);
          this.windows.forEach((w) =>
            this.lampGlow.fillRect(w.x, w.y, w.w, w.h),
          );
          for (const a of this.lamps) {
            this.lampGlow.fillStyle(0xffde7b, 0.14 * env.night);
            this.lampGlow.fillCircle(a.x + 10, a.y - 37, 23);
            this.lampGlow.fillStyle(0xfff2ae, env.night);
            this.lampGlow.fillEllipse(a.x + 10, a.y - 37, 13, 6);
          }
        }
        this.cranes.forEach(({ hook, base }) => {
          hook.y = base + (reduced ? 0 : Math.sin(this.elapsed / 420) * 10);
        });
        this.trees.forEach((tree, i) => {
          tree.rotation = reduced
            ? 0
            : Math.sin(this.elapsed / 1400 + i) * 0.055;
        });
        this.clouds.forEach((c, i) => {
          c.setVisible(this.preferences.quality === "high" || i < 2);
          c.x = ((90 + i * 230 + this.elapsed * 0.007) % 1100) - 100;
          c.alpha = env.weather === "sunny" ? 0.2 : 0.45;
        });
        const shop = this.model.properties[2];
        let npcIndex = 0,
          carIndex = 0;
        this.traffic.forEach((actor) => {
          const visible =
            actor.category === "customer"
              ? shop.owned &&
                shop.operating &&
                !isUnderConstruction(this.model, shop)
              : actor.category === "car"
                ? carIndex++ < (this.preferences.quality === "low" ? 2 : 5)
                : npcIndex++ < (this.preferences.quality === "low" ? 5 : 12);
          actor.sprite.setVisible(visible);
          if (!visible) return;
          const position = this.along(
            actor.route,
            actor.offset + (this.elapsed / 1000) * actor.rate,
          );
          actor.sprite
            .setPosition(position.x, position.y)
            .setDepth(position.y + 5);
          if (actor.category === "car") actor.sprite.setRotation(0.43);
        });
        if (this.model.world) {
          const w = this.model.world,
            key = `${w.position.x},${w.position.y}`;
          if (key !== this.walkTarget) {
            this.walkTarget = key;
            this.walking = this.path(
              {
                x: Math.round(this.walkingPoint.x),
                y: Math.round(this.walkingPoint.y),
              },
              w.position,
            ).slice(1);
          }
          if (!latest.current.paused) {
            const target = this.walking[0];
            if (reduced) {
              this.walkingPoint = { ...w.position };
              this.walking = [];
            } else if (target) {
              const dx = target.x - this.walkingPoint.x,
                dy = target.y - this.walkingPoint.y,
                d = Math.hypot(dx, dy),
                step = dt / 500;
              if (d <= step) {
                this.walkingPoint = { ...target };
                this.walking.shift();
              } else {
                this.walkingPoint.x += (dx / d) * step;
                this.walkingPoint.y += (dy / d) * step;
              }
            }
          }
          for (const c of this.citizens) {
            const n = w.npcs.find((n) => n.id === c.id)!,
              p = places[n.place],
              pos = iso(
                p.x + 0.15 * Math.sin(this.elapsed / 1300 + n.id),
                p.y + 0.15 * Math.cos(this.elapsed / 1400 + n.id),
              );
            c.sprite.setPosition(pos.x, pos.y).setDepth(pos.y + 10);
            c.label.setPosition(pos.x, pos.y - 30).setDepth(pos.y + 11);
          }
          host.current!.dataset.playerX = String(this.walkingPoint.x);
          host.current!.dataset.playerY = String(this.walkingPoint.y);
        }
        let index = 0;
        this.family.forEach((actor, id) => {
          const pos = this.along(
            actor.route,
            index++ * 0.17 + (this.familyTime / 1000) * 0.013,
          );
          if (this.model.world && id === this.model.clan.activeId) {
            const p = iso(this.walkingPoint.x, this.walkingPoint.y);
            pos.set(p.x, p.y);
          }
          actor.sprite.setPosition(pos.x, pos.y).setDepth(pos.y + 12);
          actor.label.setPosition(pos.x, pos.y - 37).setDepth(pos.y + 13);
        });
        this.rain.clear();
        if (env.weather === "rainy" && !reduced) {
          this.rain.lineStyle(1, 0xc2e4f0, 0.7);
          const count = this.preferences.quality === "high" ? 80 : 25;
          for (let i = 0; i < count; i++) {
            const drop = this.particles[i],
              x = (drop.x - this.elapsed * 0.06) % 900,
              y = (drop.y + this.elapsed * 0.3) % 650;
            this.rain.lineBetween(x, y, x - 5, y + 13);
          }
        }
        this.selection.clear();
        const selected = this.sites().find(
          (b) =>
            b.id ===
            (this.model.story && this.model.world!.place >= 8
              ? this.model.world!.place
              : latest.current.selected),
        );
        if (selected) {
          const a = iso(selected.x, selected.y);
          this.selection.lineStyle(3, 0xf6dc7b, 0.9);
          this.selection.strokeEllipse(a.x, a.y + 7, 105, 43);
        }
        // Labels are presentation only. Show the selected building rather than
        // overlapping every name; all places and people remain in the HTML panels.
        const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const screenScale = (host.current?.clientWidth || 840) / 840;
        const labelKey = `${selected?.id}:${rootSize}:${screenScale}:${camera.zoom}:${this.model.city.sequence}`;
        if (labelKey !== this.labelReadingKey) {
          this.labelReadingKey = labelKey;
          const selectedContainer = selected ? this.buildings.get(selected.id) : undefined;
          const visit = (object: Phaser.GameObjects.GameObject) => {
            if (object instanceof Phaser.GameObjects.Text && !this.popupTexts.includes(object)) {
              object.setVisible(object.parentContainer === selectedContainer && !!selectedContainer);
              object.setFontSize(rootSize / Math.max(.1, screenScale * camera.zoom));
              object.setColor("#203f40").setBackgroundColor("#fffdf2");
            } else if (object instanceof Phaser.GameObjects.Container) object.list.forEach(visit);
          };
          this.children.list.forEach(visit);
        }
        // Semantic status updates are throttled; financial state is never touched here.
        if (this.elapsed - this.lastReport > 500 || reduced) {
          this.lastReport = this.elapsed;
          setEnvironment(
            `${phaseNames[env.phase]} · ${weatherNames[env.weather]}`,
          );
          if (host.current) {
            host.current.dataset.cameraX = String(Math.round(camera.scrollX));
            host.current.dataset.cameraY = String(Math.round(camera.scrollY));
          }
        }
      }
    }
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current!,
      width: 840,
      height: 570,
      backgroundColor: "#dce9d8",
      scene: Town,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      input: { mouse: { preventDefaultWheel: true } },
      fps: {
        target: 60,
        limit: matchMedia("(pointer: coarse)").matches ? 30 : 60,
      },
      render: { antialias: true },
      banner: false,
    });
    return () => {
      controller.current = null;
      game.destroy(true);
    };
  }, []);
  function change<K extends keyof CitySettings>(
    key: K,
    value: CitySettings[K],
  ) {
    setSettings((old) => ({ ...old, [key]: value }));
  }
  return (
    <>
      <div className="city-toolbar">
        <span data-testid="city-environment">{environment}</span>
        <div>
          <button
            aria-label="縮小城市"
            onClick={() => controller.current?.zoom(-0.15)}
          >
            −
          </button>
          <output aria-label="地圖縮放">{zoom}%</output>
          <button
            aria-label="放大城市"
            onClick={() => controller.current?.zoom(0.15)}
          >
            ＋
          </button>
          <button onClick={() => controller.current?.reset()}>重設視角</button>
        </div>
      </div>
      <div
        ref={host}
        className="city"
        aria-label="可拖曳縮放、點選人物及建築的等角青禾城市地圖"
      />
      <div className="city-feedback" role="status" aria-label="城市事件">
        {feedback}
      </div>
      <p className="map-reading-hint">地圖只標示選取的建築，減少遮擋。點選人物查看近況；完整名稱與操作也在下方場所及人物面板。</p>
      <details className="city-options">
        <summary>城市動畫設定 · 拖曳移動 / 雙指或滾輪縮放</summary>
        <div>
          <label>
            動畫品質
            <select
              aria-label="動畫品質"
              value={settings.quality}
              onChange={(e) =>
                change("quality", e.target.value as CitySettings["quality"])
              }
            >
              <option value="low">省電</option>
              <option value="high">精緻</option>
            </select>
          </label>
          <label>
            日夜
            <select
              aria-label="城市日夜"
              value={settings.phase}
              onChange={(e) =>
                change("phase", e.target.value as CitySettings["phase"])
              }
            >
              <option value="auto">自然循環</option>
              <option value="day">白天</option>
              <option value="dusk">黃昏</option>
              <option value="night">夜晚</option>
            </select>
          </label>
          <label>
            天氣
            <select
              aria-label="城市天氣"
              value={settings.weather}
              onChange={(e) =>
                change("weather", e.target.value as CitySettings["weather"])
              }
            >
              <option value="auto">自然變化</option>
              <option value="sunny">晴天</option>
              <option value="cloudy">陰天</option>
              <option value="rainy">雨天</option>
            </select>
          </label>
          <label className="motion-toggle">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => change("reducedMotion", e.target.checked)}
            />
            減少動態效果
          </label>
        </div>
        <p>
          背景天氣不影響財務。家庭移動隨遊戲暫停；減少動態會停止交通、搖晃與雨線，交易仍以文字確認。
        </p>
      </details>
    </>
  );
}
