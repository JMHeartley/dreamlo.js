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
        return _get(url);
    }
    DreamLo.getScoresXml = getScoresXml;
    function getScoresJson() {
        const url = _baseUrl + "/json";
        return _get(url);
    }
    DreamLo.getScoresJson = getScoresJson;
    function getScoresPipe() {
        const url = _baseUrl + "/pipe";
        return _get(url);
    }
    DreamLo.getScoresPipe = getScoresPipe;
    function getScoresQuote() {
        const url = _baseUrl + "/quote";
        return _get(url);
    }
    DreamLo.getScoresQuote = getScoresQuote;
    function _get(url) {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        let data = "";
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                data = request.responseText;
            }
            else {
                console.log("DreamLo request returned: " + request.status + " " + request.statusText);
            }
        };
        request.send();
        return data;
    }
})(DreamLo || (DreamLo = {}));
;
//# sourceMappingURL=dreamlo.js.map