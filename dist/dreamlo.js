"use strict";
var dreamLo;
(function (dreamLo) {
    let ScoreFormat;
    (function (ScoreFormat) {
        ScoreFormat["Json"] = "json";
        ScoreFormat["Xml"] = "xml";
        ScoreFormat["Pipe"] = "pipe";
        ScoreFormat["Quote"] = "quote";
        ScoreFormat["Array"] = "array";
    })(ScoreFormat = dreamLo.ScoreFormat || (dreamLo.ScoreFormat = {}));
})(dreamLo || (dreamLo = {}));
var dreamLo;
(function (dreamLo) {
    let SortOrder;
    (function (SortOrder) {
        SortOrder["PointsDescending"] = "";
        SortOrder["PointsAscending"] = "-asc";
        SortOrder["SecondsDescending"] = "-seconds";
        SortOrder["SecondsAscending"] = "-seconds-asc";
        SortOrder["DateDescending"] = "-date";
        SortOrder["DateAscending"] = "-date-asc";
    })(SortOrder = dreamLo.SortOrder || (dreamLo.SortOrder = {}));
})(dreamLo || (dreamLo = {}));
var dreamLo;
(function (dreamLo) {
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
    dreamLo.initialize = initialize;
    async function getScores(format = dreamLo.ScoreFormat.Json, sortOrder = dreamLo.SortOrder.PointsDescending, skip = 0, take) {
        if (!_publicKey) {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }
        let url;
        if (format === dreamLo.ScoreFormat.Array) {
            url = _baseUrl + _publicKey + "/" + dreamLo.ScoreFormat.Json + sortOrder + "/" + skip;
        }
        else {
            url = _baseUrl + _publicKey + "/" + format + sortOrder + "/" + skip;
        }
        if (take) {
            url += "/" + take;
        }
        let result = await _get(url);
        if (format === dreamLo.ScoreFormat.Array) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return result;
    }
    dreamLo.getScores = getScores;
    async function getScore(name, format = dreamLo.ScoreFormat.Json) {
        if (!_publicKey) {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }
        if (!name) {
            throw new Error("DreamLo getScore name parameter is required.");
        }
        let url;
        if (format === dreamLo.ScoreFormat.Array) {
            url = _baseUrl + _publicKey + "/" + dreamLo.ScoreFormat.Json + "-get/" + name;
        }
        else {
            url = _baseUrl + _publicKey + "/" + format + "-get/" + name;
        }
        let result = await _get(url);
        if (format === dreamLo.ScoreFormat.Array) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return result;
    }
    dreamLo.getScore = getScore;
    async function addScore(score, format = dreamLo.ScoreFormat.Json, sortOrder = dreamLo.SortOrder.PointsDescending) {
        var _a, _b;
        if (!_privateKey) {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        if (!score.name) {
            throw new Error("DreamLo addScore score.name property is required.");
        }
        if (!score.points) {
            throw new Error("DreamLo addScore score.points property is required.");
        }
        let url;
        if (format === dreamLo.ScoreFormat.Array) {
            url = _baseUrl + _privateKey + "/add-" + dreamLo.ScoreFormat.Json + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_a = score.seconds) !== null && _a !== void 0 ? _a : "");
        }
        else {
            url = _baseUrl + _privateKey + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_b = score.seconds) !== null && _b !== void 0 ? _b : "");
        }
        if (score.text) {
            url += "/" + score.text;
        }
        let result = await _get(url);
        if (format === dreamLo.ScoreFormat.Array) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return result;
    }
    dreamLo.addScore = addScore;
    async function deleteScores() {
        if (!_privateKey) {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        const url = _baseUrl + _privateKey + "/clear";
        await _get(url);
    }
    dreamLo.deleteScores = deleteScores;
    async function deleteScore(name) {
        if (!_privateKey) {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }
        if (!name) {
            throw new Error("DreamLo deleteScore name parameter is required.");
        }
        const url = _baseUrl + _privateKey + "/delete/" + name;
        await _get(url);
    }
    dreamLo.deleteScore = deleteScore;
    async function _get(url) {
        let data = "";
        await fetch(url)
            .then((response) => response.text())
            .then((text) => {
            data = text;
        })
            .catch((error) => {
            throw new Error("DreamLo request returned: " + error);
        });
        return data;
    }
})(dreamLo || (dreamLo = {}));
//# sourceMappingURL=dreamLo.js.map