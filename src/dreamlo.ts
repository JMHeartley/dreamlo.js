/// <reference path="score.ts" />
/// <reference path="scoreFormat.ts" />
/// <reference path="sortOrder.ts" />
namespace dreamlo {
    let _baseUrl = "http://dreamlo.com/lb/";
    let _publicCode = "";
    let _privateCode = "";
    export function initialize(publicCode: string, privateCode: string, useHttps = false): void {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _publicCode = publicCode;
        _privateCode = privateCode;
    }
    export async function getScores(format: ScoreFormat = ScoreFormat.Object, sortOrder: SortOrder = SortOrder.PointsDescending, skip: number = 0, take?: number): Promise<string> {
        if (!_publicCode) {
            throw new Error("publicCode is not set; call dreamlo.initialize() first.");
        }

        let url;
        if (format === ScoreFormat.Object) {
            url = _baseUrl + _publicCode + "/" + ScoreFormat.Json + sortOrder + "/" + skip;
        }
        else {
            url = _baseUrl + _publicCode + "/" + format + sortOrder + "/" + skip;
        }
        if (take) {
            url += "/" + take;
        }

        let result = await _get(url);
        if (format === ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
        }
        return _enforceExpectedResultForMultipleScoreRetrieval(format, result);
    }
    export async function getScore(name: string, format: ScoreFormat = ScoreFormat.Object): Promise<string> {
        if (!_publicCode) {
            throw new Error("publicCode is not set; call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("name parameter is required.");
        }

        let url;
        if (format === ScoreFormat.Object) {
            url = _baseUrl + _publicCode + "/" + ScoreFormat.Json + "-get/" + name;
        }
        else {
            url = _baseUrl + _publicCode + "/" + format + "-get/" + name;
        }

        let result = await _get(url);
        if (format === ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard.entry;
        }
        return _enforceExpectedResultForSingleScoreRetrieval(name, format, result);
    }
    export async function addScore(score: Score, format: ScoreFormat = ScoreFormat.Object, sortOrder: SortOrder = SortOrder.PointsDescending, canOverwrite: boolean = false): Promise<string> {
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
            const existingScore = await getScore(score.name, ScoreFormat.Pipe);
            if (existingScore) {
                throw new Error(`score with name ${score.name} already exists; set canOverwriteScore to true to overwrite.`);
            }
        }

        let url;
        if (format === ScoreFormat.Object) {
            url = _baseUrl + _privateCode + "/add-" + ScoreFormat.Json + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? 0);
        }
        else {
            url = _baseUrl + _privateCode + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? 0);
        }
        if (score.text) {
            url += "/" + score.text;
        }

        let result = await _get(url);
        if (format === ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
        }
        return _enforceExpectedResultForMultipleScoreRetrieval(format, result);
    }
    export async function deleteScores(): Promise<void> {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }

        const url = _baseUrl + _privateCode + "/clear";
        await _get(url);
    }
    export async function deleteScore(name: string): Promise<void> {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("name parameter is required.");
        }

        const url = _baseUrl + _privateCode + "/delete/" + name;
        await _get(url);
    }
    async function _get(url: string): Promise<string> {
        let data = "";
        // dreamlo Docs: You can not have an asterisk * character in your URL, scores, usernames, etc.
        url = url.replace(/\*/gi, "_");
        await fetch(url)
            .then((response) => {
                if (!response.ok) {
                    const error = response.status + " " + response.statusText;
                    return Promise.reject(error);
                }

                return response.text()
            })
            .then((text) => {
                data = text;
            })
            .catch((error) => {
                throw new Error("dreamlo request returned: " + error);
            });

        return data;
    }
    //HACK: this is to get around the fact that dreamlo API returns an object
    // when a single score is returned and null when no scores are returned, 
    // enforce an array is always returned when using Object or JSON formats
    function _enforceExpectedResultForMultipleScoreRetrieval(format: ScoreFormat, result: any): any {
        let expectedResult: any;
        switch (format) {
            case ScoreFormat.Object:
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
            case ScoreFormat.Json:
                const jsonResult = JSON.parse(result);
                if (!jsonResult.dreamlo.leaderboard) {
                    jsonResult.dreamlo.leaderboard = [];
                }
                else if (!Array.isArray(jsonResult.dreamlo.leaderboard.entry)) {
                    jsonResult.dreamlo.leaderboard.entry = [jsonResult.dreamlo.leaderboard.entry];
                }
                expectedResult = JSON.stringify(jsonResult);
                break;
            // the following formats don't have an equivalent to an array of scores
            // and will return a single score or an empty string
            case ScoreFormat.Xml:
            case ScoreFormat.Pipe:
            case ScoreFormat.Quote:
                expectedResult = result;
                break;
        }
        return expectedResult;
    }
    // HACK: this is to get around the fact that the dreamlo API returns all scores 
    // are returned when using JSON, XML, or Quote formats instead of just the 
    // score with the matching name, no matter with the score in present or not
    function _enforceExpectedResultForSingleScoreRetrieval(name: string, format: ScoreFormat, result: any): string {
        let expectedResult = "";
        switch (format) {
            case ScoreFormat.Object:
                for (const score of result) {
                    if (score.name === name) {
                        expectedResult = score;
                    }
                }
                break;
            case ScoreFormat.Json:
                for (const score of JSON.parse(result).dreamlo.leaderboard.entry) {
                    if (score.name === name) {
                        expectedResult = JSON.stringify(score);
                    }
                }
                break;
            case ScoreFormat.Xml:
                const parser = new DOMParser();
                let xmlDoc = parser.parseFromString(result, "text/xml");
                for (const score of xmlDoc.getElementsByTagName("entry")) {
                    if (score.getElementsByTagName("name")[0].childNodes[0].nodeValue === name) {
                        expectedResult = score.outerHTML;
                    }
                }
                break;
            case ScoreFormat.Pipe:
                // this format returns a single score as expected
                expectedResult = result;
                break;
            case ScoreFormat.Quote:
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
    function _decodeQuoteWithCommaStringAsScoreArrays(quoteWithCommaString: string): string[][] {
        let scoreArrays: string[][] = [];
        quoteWithCommaString.split("\n").forEach((score) => {
            scoreArrays.push(score.split(","));
        });
        return scoreArrays;
    }
    function _recodeScoreArrayAsQuoteWithCommaString(scoreArray: string[]): string {
        let quoteWithCommaString = "";
        for (let index = 0; index < scoreArray.length; index++) {
            quoteWithCommaString += scoreArray[index];
            if (index !== scoreArray.length - 1) {
                quoteWithCommaString += ",";
            }
        }
        return quoteWithCommaString;
    }
}
