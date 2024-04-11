/**
 * PrefetchLinks 组件，用于预加载应用资源
 */
import React, { useEffect } from "react";
import registerPreloadApp from "../../core/registerPreloadApp";
// 加载应用的资源
export default function PrefetchLinks(props: {
  appUrl: string;
  children: React.ReactNode;
}) {
  const { appUrl, children } = props;
  useEffect(() => {
    registerPreloadApp({ appUrl });
  }, []);
  return <>{children}</>;
}
