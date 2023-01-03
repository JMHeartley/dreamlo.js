"use strict";
var DreamLo;
(function (DreamLo) {
    let _baseUrl = "http://dreamlo.com/lb/";
    let _publicKey = "";
    function initialize(publicKey, useHttps = false) {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _publicKey = publicKey;
    }
    DreamLo.initialize = initialize;
    function getScores(format, sortOrder = SortOrder.ScoreDescending, start = 0, count) {
        if (_publicKey === "") {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }
        let url = _baseUrl + _publicKey + "/" + format + sortOrder + "/" + start;
        if (count) {
            url += "/" + count;
        }
        return _get(url);
    }
    DreamLo.getScores = getScores;
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
    let ScoreFormat;
    (function (ScoreFormat) {
        ScoreFormat["Xml"] = "xml";
        ScoreFormat["Json"] = "json";
        ScoreFormat["Pipe"] = "pipe";
        ScoreFormat["Quote"] = "quote";
    })(ScoreFormat = DreamLo.ScoreFormat || (DreamLo.ScoreFormat = {}));
    let SortOrder;
    (function (SortOrder) {
        SortOrder["ScoreDescending"] = "";
        SortOrder["ScoreAscending"] = "-asc";
        SortOrder["SecondsDescending"] = "-seconds";
        SortOrder["SecondsAscending"] = "-seconds-asc";
        SortOrder["DateDescending"] = "-date";
        SortOrder["DateAscending"] = "-date-asc";
    })(SortOrder = DreamLo.SortOrder || (DreamLo.SortOrder = {}));
})(DreamLo || (DreamLo = {}));
//# sourceMappingURL=dreamlo.js.map