import { PrefetchRoot, IRule } from "@ctrip/corp-fe-prefetch";

const rules: IRule[] = [
  {
    apiUrl: "https://m.ctrip.com/restapi/soa2/18088/getAppConfig.json",
    type: "POST",
    expireTime: 10000,
    triger: "idle",
    fetch: () => {
      return fetch("https://m.ctrip.com/restapi/soa2/18088/getAppConfig.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: "5278",
          categoryList: ["ubtconfig"],
          head: {
            appid: "5278",
            cid: "1702042292907.ix5qc4",
            cver: "000.001",
            sid: "8892",
          },
        }),
      });
      // return fetch("https://m.ctrip.com/restapi/soa2/18088/getAppConfig.json", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     head: {
      //       cid: "09031015410962490138",
      //       ctok: "",
      //       cver: "1.0",
      //       lang: "01",
      //       sid: "8888",
      //       syscode: "09",
      //       auth: "",
      //       extension: [],
      //     },
      //     contentType: "json",
      //   }),
      // });
    },
  },
];

const Index = () => (
  <div className="container-box w-full">
    <PrefetchRoot appUrl="/webapp/hailing/search" rules={rules}>
      <a>打车</a>
    </PrefetchRoot>
    <iframe
      width="100%"
      height={"100%"}
      frameBorder={0}
      style={{ border: 0 }}
      allowFullScreen={true}
      src="https://ct.ctrip.com/webapp/home"
    />
  </div>
);

export default Index;
