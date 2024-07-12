/**
 * PrefetchLinks 组件，用于预加载应用资源
 */
import React, { useEffect } from "react";
// import registerPreloadApp from "../../core/registerPreloadApp";
import { IRule } from "../../interfaces";
// 加载应用的资源
export default function PrefetchLinks(props: {
  appUrl: string;
  children: React.ReactNode;
  rules?: IRule[];
}) {
  const { appUrl, children, rules = [] } = props;
  useEffect(() => {
    console.log("PrefetchLinks useEffect", appUrl, rules);
    // registerPreloadApp({ appUrl, rules });
  }, []);
  return <>{children}</>;
}
