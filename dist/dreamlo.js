"use strict";
var dreamlo;
(function (dreamlo) {
    let ScoreFormat;
    (function (ScoreFormat) {
        ScoreFormat["Json"] = "json";
        ScoreFormat["Xml"] = "xml";
        ScoreFormat["Pipe"] = "pipe";
        ScoreFormat["Quote"] = "quote";
    })(ScoreFormat = dreamlo.ScoreFormat || (dreamlo.ScoreFormat = {}));
})(dreamlo || (dreamlo = {}));
var dreamlo;
(function (dreamlo) {
    let SortOrder;
    (function (SortOrder) {
        SortOrder["PointsDescending"] = "";
        SortOrder["PointsAscending"] = "-asc";
        SortOrder["SecondsDescending"] = "-seconds";
        SortOrder["SecondsAscending"] = "-seconds-asc";
        SortOrder["DateDescending"] = "-date";
        SortOrder["DateAscending"] = "-date-asc";
    })(SortOrder = dreamlo.SortOrder || (dreamlo.SortOrder = {}));
})(dreamlo || (dreamlo = {}));
var dreamlo;
(function (dreamlo) {
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
    dreamlo.initialize = initialize;
    async function getScores(format = dreamlo.ScoreFormat.Json, sortOrder = dreamlo.SortOrder.PointsDescending, skip = 0, take) {
        if (!_publicKey) {
            throw new Error("dreamlo public key not set. Call dreamlo.initialize() first.");
        }
        let url = _baseUrl + _publicKey + "/" + format + sortOrder + "/" + skip;
        if (take) {
            url += "/" + take;
        }
        return await _get(url);
    }
    dreamlo.getScores = getScores;
    async function getScore(name, format = dreamlo.ScoreFormat.Json) {
        if (!_publicKey) {
            throw new Error("dreamlo public key not set. Call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("dreamlo getScore name parameter is required.");
        }
        let url = _baseUrl + _publicKey + "/" + format + "-get/" + name;
        let result = await _get(url);
        return _enforceExpectedResult(name, format, result);
    }
    dreamlo.getScore = getScore;
    async function addScore(score, format = dreamlo.ScoreFormat.Json, sortOrder = dreamlo.SortOrder.PointsDescending, canOverwrite = false) {
        var _a;
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }
        if (!score.name) {
            throw new Error("dreamlo addScore score.name property is required.");
        }
        if (!score.points) {
            throw new Error("dreamlo addScore score.points property is required.");
        }
        let url = _baseUrl + _privateKey + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_a = score.seconds) !== null && _a !== void 0 ? _a : "");
        if (score.text) {
            url += "/" + score.text;
        }
        if (!canOverwrite) {
            const existingScore = await getScore(score.name, dreamlo.ScoreFormat.Pipe);
            if (existingScore) {
                throw new Error(`Score with name ${score.name} already exists. Set canOverwriteScore to true to overwrite.`);
            }
        }
        return await _get(url);
    }
    dreamlo.addScore = addScore;
    async function deleteScores() {
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }
        const url = _baseUrl + _privateKey + "/clear";
        await _get(url);
    }
    dreamlo.deleteScores = deleteScores;
    async function deleteScore(name) {
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("dreamlo deleteScore name parameter is required.");
        }
        const url = _baseUrl + _privateKey + "/delete/" + name;
        await _get(url);
    }
    dreamlo.deleteScore = deleteScore;
    async function _get(url) {
        let data = "";
        url = url.replace(/\*/gi, "_");
        await fetch(url)
            .then((response) => response.text())
            .then((text) => {
            data = text;
        })
            .catch((error) => {
            throw new Error("dreamlo request returned: " + error);
        });
        return data;
    }
    function _enforceExpectedResult(name, format, result) {
        let newResult = "";
        switch (format) {
            case dreamlo.ScoreFormat.Json:
                for (const score of JSON.parse(result).dreamlo.leaderboard.entry) {
                    if (score.name === name) {
                        newResult = JSON.stringify(score);
                    }
                }
                break;
            case dreamlo.ScoreFormat.Xml:
                const parser = new DOMParser();
                let xmlDoc = parser.parseFromString(result, "text/xml");
                for (const score of xmlDoc.getElementsByTagName("entry")) {
                    if (score.getElementsByTagName("name")[0].childNodes[0].nodeValue === name) {
                        newResult = score.outerHTML;
                    }
                }
                break;
            case dreamlo.ScoreFormat.Pipe:
                newResult = result;
                break;
            case dreamlo.ScoreFormat.Quote:
                const scoreStringArrays = decodeQuoteWithCommaAsScoreStringArrays(result);
                for (const score of scoreStringArrays) {
                    if (score[0] === `"${name}"`) {
                        newResult = recodeScoreStringArrayAsQuoteWithCommaString(score);
                    }
                }
                break;
        }
        return newResult;
    }
    function decodeQuoteWithCommaAsScoreStringArrays(data) {
        let result = [];
        for (const score of data.split("\n")) {
            const scoreArray = [];
            for (const value of score.split(",")) {
                scoreArray.push(value);
            }
            result.push(scoreArray);
        }
        return result;
    }
    function recodeScoreStringArrayAsQuoteWithCommaString(scoreArray) {
        let result = "";
        for (let index = 0; index < scoreArray.length; index++) {
            result += scoreArray[index];
            if (index !== scoreArray.length - 1) {
                result += ",";
            }
        }
        return result;
    }
})(dreamlo || (dreamlo = {}));
//# sourceMappingURL=dreamlo.js.map