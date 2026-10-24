import { build } from "vite";
import {
  mkdtemp,
  readFile,
  readdir,
  mkdir,
  writeFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const scratch = await mkdtemp(join(tmpdir(), "fwe-demo-"));
try {
  await build({
    configFile: false,
    root,
    define: {
      "import.meta.env.PROD": "false",
      "import.meta.env.VITE_SUPABASE_URL": '""',
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": '""',
    },
    build: {
      outDir: scratch,
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: resolve(root, "src/main.tsx"),
        output: {
          inlineDynamicImports: true,
          entryFileNames: "game.js",
          assetFileNames: "[name][extname]",
        },
      },
    },
  });
  const js = await readFile(join(scratch, "game.js"), "utf8");
  const cssFiles = (await readdir(scratch)).filter((name) =>
    name.endsWith(".css"),
  );
  const css = (
    await Promise.all(
      cssFiles.map((name) => readFile(join(scratch, name), "utf8")),
    )
  ).join("\n");
  const html =
    '<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>家族財富帝國 · 兩間房子的承諾 · 離線試玩</title><style>' +
    css.replace(/<\/style/gi, "<\\/style") +
    '</style></head><body><div id="root"></div><script type="module">' +
    js.replace(/<\/script/gi, "<\\/script") +
    "</script></body></html>";
  await mkdir(resolve(root, "artifacts"), { recursive: true });
  await writeFile(
    resolve(root, "artifacts/family-wealth-empire-demo.html"),
    html,
  );
  await mkdir(resolve(root, "dist"), { recursive: true });
  await writeFile(resolve(root, "dist/standalone.html"), html);
  console.log(
    "Standalone guest demo: artifacts/family-wealth-empire-demo.html (Supabase and service worker disabled; no remote assets).",
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
