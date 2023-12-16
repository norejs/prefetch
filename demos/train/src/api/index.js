import axios from 'axios';
export function checkVersion() {
    const data = {
        GE: '1702765169775',
        head: {
            isIframe: false,
            'x-traceID': '09031166312606129044-1702765169775-2764569',
            sourceFrom: 'H5',
            channel: 'html5',
            subChannel: 'IOS',
        },
        token: null,
        sToken: 'b96a4ad1fa1b4a3f90bbc2e242f723c8',
        language: 'zh-CN',
        locale: 'zh-CN',
        params: {
            switchConfigName: 'RentelSensitiveInfoServiceValidate',
            Channel: 'html5',
            SecondaryChannel: 'IOS',
        },
        CorpPayType: 'public',
        Site: 15,
        pu: '0.26783388246761985',
        isServerSide: false,
        clientTimezoneOffsetMinutesNew: '480',
        serviceName: 'MyCorpInfoService',
        operation: 'checkVersionAndComId',
    };

    axios({
        method: 'post',
        url: 'https://ct.ctrip.com/restapi/restapi',
        params: {
            serviceName: 'MyCorpInfoService',
            operation: 'checkVersionAndComId',
        },
        data: data,
    })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
}
