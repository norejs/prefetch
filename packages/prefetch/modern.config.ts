import { moduleTools, defineConfig } from "@modern-js/module-tools";
import { testingPlugin } from "@modern-js/plugin-testing";
import { modulePluginDoc } from "@modern-js/plugin-rspress";

export default defineConfig({
  plugins: [moduleTools(), testingPlugin(), modulePluginDoc()],
  buildPreset: "npm-library",
});
