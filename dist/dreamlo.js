"use strict";
var dreamlo;
(function (dreamlo) {
    let ScoreFormat;
    (function (ScoreFormat) {
        ScoreFormat["Object"] = "object";
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
    async function getScores(format = dreamlo.ScoreFormat.Object, sortOrder = dreamlo.SortOrder.PointsDescending, skip = 0, take) {
        if (!_publicKey) {
            throw new Error("dreamlo public key not set. Call dreamlo.initialize() first.");
        }
        let url;
        if (format === dreamlo.ScoreFormat.Object) {
            url = _baseUrl + _publicKey + "/" + dreamlo.ScoreFormat.Json + sortOrder + "/" + skip;
        }
        else {
            url = _baseUrl + _publicKey + "/" + format + sortOrder + "/" + skip;
        }
        if (take) {
            url += "/" + take;
        }
        let result = await _get(url);
        if (format === dreamlo.ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return result;
    }
    dreamlo.getScores = getScores;
    async function getScore(name, format = dreamlo.ScoreFormat.Object) {
        if (!_publicKey) {
            throw new Error("dreamlo public key not set. Call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("dreamlo getScore name parameter is required.");
        }
        let url;
        if (format === dreamlo.ScoreFormat.Object) {
            url = _baseUrl + _publicKey + "/" + dreamlo.ScoreFormat.Json + "-get/" + name;
        }
        else {
            url = _baseUrl + _publicKey + "/" + format + "-get/" + name;
        }
        let result = await _get(url);
        if (format === dreamlo.ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return _enforceExpectedResult(name, format, result);
    }
    dreamlo.getScore = getScore;
    async function addScore(score, format = dreamlo.ScoreFormat.Object, sortOrder = dreamlo.SortOrder.PointsDescending, canOverwrite = false) {
        var _a, _b;
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }
        if (!score.name) {
            throw new Error("dreamlo addScore score.name property is required.");
        }
        if (!score.points) {
            throw new Error("dreamlo addScore score.points property is required.");
        }
        let url;
        if (format === dreamlo.ScoreFormat.Object) {
            url = _baseUrl + _privateKey + "/add-" + dreamlo.ScoreFormat.Json + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_a = score.seconds) !== null && _a !== void 0 ? _a : 0);
        }
        else {
            url = _baseUrl + _privateKey + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_b = score.seconds) !== null && _b !== void 0 ? _b : 0);
        }
        if (score.text) {
            url += "/" + score.text;
        }
        if (!canOverwrite) {
            const existingScore = await getScore(score.name, dreamlo.ScoreFormat.Pipe);
            if (existingScore) {
                throw new Error(`Score with name ${score.name} already exists. Set canOverwriteScore to true to overwrite.`);
            }
        }
        let result = await _get(url);
        if (format === dreamlo.ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return result;
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
            .then((response) => {
            if (!response.ok) {
                const error = response.status + " " + response.statusText;
                return Promise.reject(error);
            }
            return response.text();
        })
            .then((text) => {
            data = text;
        })
            .catch((error) => {
            throw new Error("dreamlo request returned: " + error);
        });
        return data;
    }
    function _enforceExpectedResult(name, format, result) {
        let expectedResult = "";
        switch (format) {
            case dreamlo.ScoreFormat.Object:
                for (const score of result) {
                    if (score.name === name) {
                        expectedResult = score;
                    }
                }
                break;
            case dreamlo.ScoreFormat.Json:
                for (const score of JSON.parse(result).dreamlo.leaderboard.entry) {
                    if (score.name === name) {
                        expectedResult = JSON.stringify(score);
                    }
                }
                break;
            case dreamlo.ScoreFormat.Xml:
                const parser = new DOMParser();
                let xmlDoc = parser.parseFromString(result, "text/xml");
                for (const score of xmlDoc.getElementsByTagName("entry")) {
                    if (score.getElementsByTagName("name")[0].childNodes[0].nodeValue === name) {
                        expectedResult = score.outerHTML;
                    }
                }
                break;
            case dreamlo.ScoreFormat.Pipe:
                expectedResult = result;
                break;
            case dreamlo.ScoreFormat.Quote:
                const scoreArrays = _decodeQuoteWithCommaStringAsScoreArrays(result);
                for (const scoreArray of scoreArrays) {
                    if (scoreArray[0] === `"${name}"`) {
                        expectedResult = _recodeScoreArrayAsQuoteWithCommaString(scoreArray);
                    }
                }
                break;
        }
        return expectedResult;
    }
    function _decodeQuoteWithCommaStringAsScoreArrays(quoteWithCommaString) {
        let scoreArrays = [];
        quoteWithCommaString.split("\n").forEach((score) => {
            scoreArrays.push(score.split(","));
        });
        return scoreArrays;
    }
    function _recodeScoreArrayAsQuoteWithCommaString(scoreArray) {
        let quoteWithCommaString = "";
        for (let index = 0; index < scoreArray.length; index++) {
            quoteWithCommaString += scoreArray[index];
            if (index !== scoreArray.length - 1) {
                quoteWithCommaString += ",";
            }
        }
        return quoteWithCommaString;
    }
})(dreamlo || (dreamlo = {}));
//# sourceMappingURL=dreamlo.js.map