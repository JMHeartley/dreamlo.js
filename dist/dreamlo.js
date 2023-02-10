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
    let _publicCode = "";
    let _privateCode = "";
    function initialize(publicCode, privateCode, useHttps = false) {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _publicCode = publicCode;
        _privateCode = privateCode;
    }
    dreamlo.initialize = initialize;
    async function getScores(format = dreamlo.ScoreFormat.Object, sortOrder = dreamlo.SortOrder.PointsDescending, skip = 0, take) {
        if (!_publicCode) {
            throw new Error("publicCode is not set; call dreamlo.initialize() first.");
        }
        const requestUrl = _constructGetScoresRequestUrl(format, sortOrder, skip, take);
        let result = await _get(requestUrl);
        if (format === dreamlo.ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
        }
        return _enforceExpectedResultForMultipleScoreRetrieval(format, result);
    }
    dreamlo.getScores = getScores;
    async function getScore(name, format = dreamlo.ScoreFormat.Object) {
        if (!_publicCode) {
            throw new Error("publicCode is not set; call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("name parameter is required.");
        }
        const requestUrl = _constructGetScoreRequestUrl(name, format);
        let result = await _get(requestUrl);
        if (format === dreamlo.ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
        }
        return _enforceExpectedResultForSingleScoreRetrieval(name, format, result);
    }
    dreamlo.getScore = getScore;
    async function addScore(score, format = dreamlo.ScoreFormat.Object, sortOrder = dreamlo.SortOrder.PointsDescending, canOverwrite = false) {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }
        if (!score.name) {
            throw new Error("score.name property is required.");
        }
        if (!score.points) {
            throw new Error("score.points property is required.");
        }
        if (!canOverwrite) {
            const existingScore = await getScore(score.name, dreamlo.ScoreFormat.Pipe);
            if (existingScore) {
                throw new Error(`score with name ${score.name} already exists; set canOverwriteScore to true to overwrite.`);
            }
        }
        const requestUrl = _constructAddScoreRequestUrl(score, format, sortOrder);
        let result = await _get(requestUrl);
        if (format === dreamlo.ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
        }
        return _enforceExpectedResultForMultipleScoreRetrieval(format, result);
    }
    dreamlo.addScore = addScore;
    async function deleteScores() {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }
        const requestUrl = _baseUrl + _privateCode + "/clear";
        await _get(requestUrl);
    }
    dreamlo.deleteScores = deleteScores;
    async function deleteScore(name) {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("name parameter is required.");
        }
        const requestUrl = _baseUrl + _privateCode + "/delete/" + name;
        await _get(requestUrl);
    }
    dreamlo.deleteScore = deleteScore;
    function _constructGetScoresRequestUrl(format, sortOrder, skip, take) {
        let requestUrl;
        if (format === dreamlo.ScoreFormat.Object) {
            requestUrl = _baseUrl + _publicCode + "/" + dreamlo.ScoreFormat.Json + sortOrder + "/" + skip;
        }
        else {
            requestUrl = _baseUrl + _publicCode + "/" + format + sortOrder + "/" + skip;
        }
        if (take) {
            requestUrl += "/" + take;
        }
        return requestUrl;
    }
    function _constructGetScoreRequestUrl(name, format) {
        let requestUrl;
        if (format === dreamlo.ScoreFormat.Object) {
            requestUrl = _baseUrl + _publicCode + "/" + dreamlo.ScoreFormat.Json + "-get/" + name;
        }
        else {
            requestUrl = _baseUrl + _publicCode + "/" + format + "-get/" + name;
        }
        return requestUrl;
    }
    function _constructAddScoreRequestUrl(score, format, sortOrder) {
        var _a, _b;
        let requestUrl;
        if (format === dreamlo.ScoreFormat.Object) {
            requestUrl = _baseUrl + _privateCode + "/add-" + dreamlo.ScoreFormat.Json + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_a = score.seconds) !== null && _a !== void 0 ? _a : 0);
        }
        else {
            requestUrl = _baseUrl + _privateCode + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + ((_b = score.seconds) !== null && _b !== void 0 ? _b : 0);
        }
        if (score.text) {
            requestUrl += "/" + score.text;
        }
        return requestUrl;
    }
    async function _get(requestUrl) {
        let data = "";
        requestUrl = requestUrl.replace(/\*/gi, "_");
        await fetch(requestUrl)
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
    function _enforceExpectedResultForMultipleScoreRetrieval(format, result) {
        let expectedResult;
        switch (format) {
            case dreamlo.ScoreFormat.Object:
                if (!result) {
                    expectedResult = [];
                }
                else if (!Array.isArray(result.entry)) {
                    expectedResult = [result.entry];
                }
                else {
                    expectedResult = result.entry;
                }
                break;
            case dreamlo.ScoreFormat.Json:
                const jsonResult = JSON.parse(result);
                if (!jsonResult.dreamlo.leaderboard) {
                    jsonResult.dreamlo.leaderboard = [];
                }
                else if (!Array.isArray(jsonResult.dreamlo.leaderboard.entry)) {
                    jsonResult.dreamlo.leaderboard.entry = [jsonResult.dreamlo.leaderboard.entry];
                }
                expectedResult = JSON.stringify(jsonResult);
                break;
            case dreamlo.ScoreFormat.Xml:
            case dreamlo.ScoreFormat.Pipe:
            case dreamlo.ScoreFormat.Quote:
                expectedResult = result;
                break;
        }
        return expectedResult;
    }
    function _enforceExpectedResultForSingleScoreRetrieval(name, format, result) {
        let expectedResult;
        switch (format) {
            case dreamlo.ScoreFormat.Object:
                if (!result) {
                    expectedResult = result;
                }
                else {
                    for (const score of result.entry) {
                        if (score.name === name) {
                            expectedResult = score;
                        }
                    }
                }
                break;
            case dreamlo.ScoreFormat.Json:
                const leaderboard = JSON.parse(result).dreamlo.leaderboard;
                if (!leaderboard) {
                    expectedResult = JSON.stringify(leaderboard);
                }
                else {
                    for (const score of leaderboard.entry) {
                        if (score.name === name) {
                            expectedResult = JSON.stringify(score);
                        }
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
                const multipleScoresAsArrays = _convertQuoteWithCommaStringToMultipleScoresAsArrays(result);
                for (const singleScoreAsArray of multipleScoresAsArrays) {
                    if (singleScoreAsArray[0] === `"${name}"`) {
                        expectedResult = _convertSingleScoreAsArrayToQuoteWithCommaString(singleScoreAsArray);
                    }
                }
                break;
        }
        return expectedResult;
    }
    function _convertQuoteWithCommaStringToMultipleScoresAsArrays(quoteWithCommaString) {
        let scoreArrays = [];
        const scores = quoteWithCommaString.split("\n");
        scores.forEach((score) => {
            const scoreArray = score.split(",");
            scoreArrays.push(scoreArray);
        });
        return scoreArrays;
    }
    function _convertSingleScoreAsArrayToQuoteWithCommaString(singleScoreAsArray) {
        let quoteWithCommaString = "";
        for (let index = 0; index < singleScoreAsArray.length; index++) {
            quoteWithCommaString += singleScoreAsArray[index];
            if (index !== singleScoreAsArray.length - 1) {
                quoteWithCommaString += ",";
            }
        }
        return quoteWithCommaString;
    }
})(dreamlo || (dreamlo = {}));
//# sourceMappingURL=dreamlo.js.map