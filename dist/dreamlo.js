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
    function getScores(format = ScoreFormat.Json, sortOrder = SortOrder.PointsDescending, start = 0, count) {
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
    function getScore(format = ScoreFormat.Json, name) {
        if (_publicKey === "") {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }
        let url = _baseUrl + _publicKey + "/" + format + "-get/" + name;
        return _get(url);
    }
    DreamLo.getScore = getScore;
    function addScore(score, format = ScoreFormat.Json, sortOrder = SortOrder.PointsDescending) {
        var _a;
        if (_privateKey === "") {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        let url = (_a = _baseUrl + _privateKey + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + score.seconds) !== null && _a !== void 0 ? _a : "";
        if (score.text) {
            url += "/" + score.text;
        }
        return _get(url);
    }
    DreamLo.addScore = addScore;
    function deleteScores() {
        if (_privateKey === "") {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        const url = _baseUrl + _privateKey + "/clear";
        _get(url);
    }
    DreamLo.deleteScores = deleteScores;
    function deleteScore(name) {
        if (_privateKey === "") {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        const url = _baseUrl + _privateKey + "/delete/" + name;
        _get(url);
    }
    DreamLo.deleteScore = deleteScore;
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
        ScoreFormat["Json"] = "json";
        ScoreFormat["Xml"] = "xml";
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