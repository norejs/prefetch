// @jest-environment jsdom
import express from "express";
import loadMaifest from "../src/core/loadMaifest";

// 普通的脚本
const scripts = [
  "/static/js/bundle.js",
  "static/js/0.chunk.js",
  "https://cdn.bootcdn.net/ajax/libs/react/17.0.2/umd/react.production.min.js",
];
const prefetchScripts = ["/prefetch.js", "prefetch2.js"];
// 普通的样式
const styles = [
  "https://cdn.bootcdn.net/ajax/libs/antd/4.16.13/antd.min.css",
  "https://cdn.bootcdn.net/ajax/libs/antd/4.16.13/antd.min.css",
];
// 定义在manifest中的脚本和样式
const scriptsInManifest = [
  "https://cdn.bootcdn.net/ajax/libs/react/17.0.2/umd/react.production.min.js",
];
const linksInManifest = [
  "https://cdn.bootcdn.net/ajax/libs/antd/4.16.13/antd.min.css",
];

// 模拟manifest
const mockManifest = {
  scripts: scriptsInManifest,
  links: linksInManifest,
};
const port = 3690;
const prefetchManifesturl = `http://localhost:${port}/prefetch-manifest.json`;
// const prefetchManifesturl = URL.createObjectURL(
//   new Blob([JSON.stringify(mockManifest)])
// );
// 模拟html
const mockHtml = `
<!DOCTYPE html>
<html>
  <head>
    ${scripts.map((src) => `<script src="${src}"></script>`).join("\n")}
    ${styles
      .map((href) => `<link href="${href}" rel="stylesheet" />`)
      .join("\n")}

    ${prefetchScripts
      .map((src) => `<script type="prefetch" src="${src}"></script>`)
      .join("\n")}
    <link rel="prefetch-manifest" href="${prefetchManifesturl}" />
    <!-- 以下都是一些干扰项 -->
    <!-- <link rel="prefetch" href="https://cdn.bootcdn.net/ajax/libs/antd/4.16.13/antd.min.css" /> -->
    <!-- <script type="prefetch" src="https://cdn.bootcdn.net/ajax/libs/react/17.0.2/umd/react.production.min.js"></script> -->
    <script type="prefetch">
      console.log("prefetch");
    </script>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

function startServer() {
  try {
    const app = express();
    app.get("/index.html", (req, res) => {
      res.send(mockHtml);
    });
    app.get("/prefetch-manifest.json", (req, res) => {
      res.json(mockManifest);
    });
    app.listen(port);
  } catch (error) {}
}

function getResult() {
  return {
    preScripts: [...prefetchScripts, ...scriptsInManifest],
    prefetchLinks: [...scripts, ...styles, ...linksInManifest],
  };
}

// 递归遍历对象，忽略对象的顺序
function ignoreOrder(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.sort().map(ignoreOrder);
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    keys.sort();
    return keys.reduce((acc, key) => {
      acc[key] = ignoreOrder(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

function isSameObj(result: any, expectResult: any) {
  try {
    return (
      JSON.stringify(ignoreOrder(result)) ===
      JSON.stringify(ignoreOrder(expectResult))
    );
  } catch (error) {
    return false;
  }
}

const mockHtmlUrl = `http://localhost:${port}/index.html`;

beforeAll(() => {
  startServer();
});
describe("Maifest", () => {
  test("loadMaifest", async () => {
    expect(loadMaifest).toBeDefined();
    // expect(loadMaifest("")).resolves.toBeNull();
    const result = getResult();
    const manifest = await loadMaifest(mockHtmlUrl);
    expect(isSameObj(manifest, result)).toBeTruthy();
  });
});
