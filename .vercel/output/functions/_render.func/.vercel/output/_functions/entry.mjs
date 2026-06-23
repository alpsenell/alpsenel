import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_De7NRlak.mjs';
import { manifest } from './manifest_DIu42icH.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/ask.astro.mjs');
const _page2 = () => import('./pages/tr.astro.mjs');
const _page3 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/ask.ts", _page1],
    ["src/pages/tr/index.astro", _page2],
    ["src/pages/index.astro", _page3]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "416c3503-d737-42f9-a407-2dc1a843ea70",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
