import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import minimist from "minimist";
import esbuild from "esbuild";

// pnpm run dev
// node scripts/dev.js reactivity -f esm
const args = minimist(process.argv.slice(2));
// { _: [ 'reactivity' ], f: 'esm' }
const format = args.f || "iife";
const target = args._[0] || "reactivity";

// type: "module" 获取 __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

const IIFENamesMap = {
  reactivity: "VueReactivity",
};

esbuild
  .context({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile: resolve(`./packages/${target}/dist/${target}.js`),
    bundle: true, // 将所有的文件打包到一起
    sourcemap: true,
    format,
    platform: "browser",
    globalName: IIFENamesMap[target],
  })
  .then((ctx) => ctx.watch());
