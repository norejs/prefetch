import { IRule } from "..";
import loadMaifest from "./loadMaifest";
// import runAppPreloadScript from "./runAppPreloadScript";

const registedApps: { [key: string]: boolean } = {};
export interface IRegisterPreloadAppProps {
  appUrl: string;
  rules?: IRule[];
}
/**
 * 注册需要预加载的APP
 * @param IRegisterPreloadAppProps
 * @returns
 */
export default async function registerPreloadApp(
  props: IRegisterPreloadAppProps
) {
  const { appUrl, rules = [] } = props;
  if (registedApps[appUrl]) {
    return;
  }
  const manifest = await loadMaifest(appUrl);
  const {
    normalScripts = [],
    // preloadScripts = [],
    styles = [],
  } = manifest ?? {};
  appendPrefetchLink(styles);
  appendPrefetchLink(normalScripts);

  registedApps[appUrl] = true;
}

/**
 * 添加预加载的link
 * @param links
 */
function appendPrefetchLink(links: string[]) {
  try {
    const fragment = document.createDocumentFragment();
    links.forEach((link) => {
      const linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "prefetch");
      linkEl.setAttribute("href", link);
      fragment.appendChild(linkEl);
    });
    document?.head?.appendChild(fragment);
  } catch (error) {
    console.log(error);
  }
}

export function registerRules(appUrl: string, rules: IRule[]) {
  rules.forEach((rule) => {
    // TODO
  });
}
