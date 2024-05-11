import { preRequest } from "@norejs/prefetch";

import { useEffect } from "react";
import RequestModel from "@cotrip/ctweb-util/esm/ctmodel";

const customPreRequest = () => {
  const customerServiceSwitchModel = new RequestModel({
    isCorpRestApi: true,
    serviceName: "CorpFrontendIMService",
    serviceOperation: "customerServiceSwitch",
  });

  const customerServiceSwitch = async (params: any) => {
    try {
      const response = await customerServiceSwitchModel.fetch({
        body: { params },
        silence: true,
      });
      return response;
    } catch (error) {
      return null;
    }
  };
  customerServiceSwitch({
    productLine: "4",
    pageCode: "DC0102",
    Channel: "html5",
    resourceSink: true,
    SecondaryChannel: "Other",
  }).then((res) => {
    console.log("customerServiceSwitch", res);
  });
};

const language = "zh-CN";
const Index = () => {
  const requestParams = {
    params: {
      language,
    },
    operation: "getAllCategoricalCountryCode",
    language,
    serviceName: "CorpNodeCommon",
  };
  useEffect(() => {
    // PrefetchRoot.init(rules);
    let clock: any = 0;
    preRequest(undefined, undefined)
      .post("/restapi/restapi", requestParams)
      .then((res) => {
        console.log("prefetch request 这是预请求", res);
      });

    customPreRequest();
    clock = setTimeout(() => {
      realRequest();
    }, 2000);
    return () => {
      clearTimeout(clock);
    };
  }, []);

  const realRequest = () => {
    console.time("real request");
    creatrerequest()
      .post("/restapi/restapi", requestParams)
      .then((res) => {
        console.log("real request 这是真实请求", res);
        console.timeEnd("real request");
      });
  };

  return (
    <div className="container-box w-full">
      {/* <PrefetchRoot appUrl="/webapp/hailing/search" rules={rules}>
      <a>打车</a>
    </PrefetchRoot> */}
      <iframe
        width="100%"
        height={"100%"}
        frameBorder={0}
        style={{ border: 0 }}
        allowFullScreen={true}
        src=""
      />
    </div>
  );
};

export default Index;
