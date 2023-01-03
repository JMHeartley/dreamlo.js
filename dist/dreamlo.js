"use strict";
var DreamLo;
(function (DreamLo) {
    let _baseUrl = "http://dreamlo.com/lb/";
    function initialize(privateKey, useHttps = false) {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _baseUrl += privateKey;
    }
    DreamLo.initialize = initialize;
    function getScoresXml() {
        const url = _baseUrl + "/xml";
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        let xml = "";
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                xml = request.responseText;
                console.log(xml);
            }
        };
        request.send();
        return xml;
    }
    DreamLo.getScoresXml = getScoresXml;
})(DreamLo || (DreamLo = {}));
;
//# sourceMappingURL=dreamlo.js.map