"use strict";
var DreamLo;
(function (DreamLo) {
    let _baseUrl = "http://dreamlo.com/lb/";
    let _publicKey = "";
    let _privateKey = "";
    function initialize(publicKey, privateKey, useHttps = false) {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _publicKey = publicKey;
        _privateKey = privateKey;
    }
    DreamLo.initialize = initialize;
    function getScores(format, sortOrder = SortOrder.PointsDescending, start = 0, count) {
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
    function getScore(format, name) {
        if (_publicKey === "") {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }
        let url = _baseUrl + _publicKey + "/" + format + "-get/" + name;
        return _get(url);
    }
    DreamLo.getScore = getScore;
    function addScore(score) {
        var _a;
        if (_privateKey === "") {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        let url = (_a = _baseUrl + _privateKey + "/add/" + score.name + "/" + score.points + "/" + score.seconds) !== null && _a !== void 0 ? _a : -1;
        if (score.text) {
            url += "/" + score.text;
        }
        _get(url);
    }
    DreamLo.addScore = addScore;
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
        SortOrder["PointsDescending"] = "";
        SortOrder["PointsAscending"] = "-asc";
        SortOrder["SecondsDescending"] = "-seconds";
        SortOrder["SecondsAscending"] = "-seconds-asc";
        SortOrder["DateDescending"] = "-date";
        SortOrder["DateAscending"] = "-date-asc";
    })(SortOrder = DreamLo.SortOrder || (DreamLo.SortOrder = {}));
})(DreamLo || (DreamLo = {}));
//# sourceMappingURL=dreamlo.js.map