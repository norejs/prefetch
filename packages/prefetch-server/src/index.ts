// 递归查找 @norejs/prefetch-worker 所在的目录
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);

// 获取当前文件所在的目录路径
const __dirname = dirname(__filename);
const workerName = "@norejs/prefetch-worker";

async function findWorkerPath(dir: string): Promise<string> {
  const workerPath = join(dir, "node_modules", workerName);
  if (await fs.exists(workerPath)) {
    return workerPath;
  }

  const parentDir = dirname(dir);
  if (parentDir === dir) {
    return "";
  }

  return findWorkerPath(parentDir);
}
export default function usePrefetchServer(
  app: any,
  options = {} as { url: string }
) {
  if (typeof app?.use !== "function") {
    throw new Error(
      "app.use is not a function, please check if the app is a express instance."
    );
  }
  const { url = "/service-worker.js" } = options ?? {};
  app.use(url, async (req: any, res: any, next: any) => {
    const workerPath = await findWorkerPath(__dirname);
    if (!workerPath) {
      return res.status(404).send("Service worker not found.");
    }
    console.log(join(workerPath, "dist", "worker/service-worker.js"));
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(join(workerPath, "dist", "worker/service-worker.js"));
  });
}
