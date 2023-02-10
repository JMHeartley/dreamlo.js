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

        const requestUrl = _constructGetScoresRequestUrl(format, sortOrder, skip, take);

        let result = await _get(requestUrl);
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

        const requestUrl = _constructGetScoreRequestUrl(name, format);

        let result = await _get(requestUrl);
        if (format === ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
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

        const requestUrl = _constructAddScoreRequestUrl(score, format, sortOrder);

        let result = await _get(requestUrl);
        if (format === ScoreFormat.Object) {
            result = JSON.parse(result).dreamlo.leaderboard;
        }
        return _enforceExpectedResultForMultipleScoreRetrieval(format, result);
    }
    export async function deleteScores(): Promise<void> {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }

        const requestUrl = _baseUrl + _privateCode + "/clear";

        await _get(requestUrl);
    }
    export async function deleteScore(name: string): Promise<void> {
        if (!_privateCode) {
            throw new Error("privateCode not set; call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("name parameter is required.");
        }

        const requestUrl = _baseUrl + _privateCode + "/delete/" + name;

        await _get(requestUrl);
    }
    function _constructGetScoresRequestUrl(format: ScoreFormat, sortOrder: SortOrder, skip: number, take?: number): string {
        let requestUrl;
        if (format === ScoreFormat.Object) {
            requestUrl = _baseUrl + _publicCode + "/" + ScoreFormat.Json + sortOrder + "/" + skip;
        }
        else {
            requestUrl = _baseUrl + _publicCode + "/" + format + sortOrder + "/" + skip;
        }
        if (take) {
            requestUrl += "/" + take;
        }
        return requestUrl;
    }
    function _constructGetScoreRequestUrl(name: string, format: ScoreFormat): string {
        let requestUrl;
        if (format === ScoreFormat.Object) {
            requestUrl = _baseUrl + _publicCode + "/" + ScoreFormat.Json + "-get/" + name;
        }
        else {
            requestUrl = _baseUrl + _publicCode + "/" + format + "-get/" + name;
        }
        return requestUrl;
    }
    function _constructAddScoreRequestUrl(score: Score, format: ScoreFormat, sortOrder: SortOrder): string {
        let requestUrl;
        if (format === ScoreFormat.Object) {
            requestUrl = _baseUrl + _privateCode + "/add-" + ScoreFormat.Json + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? 0);
        }
        else {
            requestUrl = _baseUrl + _privateCode + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? 0);
        }
        if (score.text) {
            requestUrl += "/" + score.text;
        }
        return requestUrl;
    }
    async function _get(requestUrl: string): Promise<string> {
        let data = "";
        // dreamlo Docs: You can not have an asterisk * character in your URL, scores, usernames, etc.
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
    function _enforceExpectedResultForSingleScoreRetrieval(name: string, format: ScoreFormat, result: any): any {
        let expectedResult: any;
        switch (format) {
            case ScoreFormat.Object:
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
            case ScoreFormat.Json:
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
    function _convertQuoteWithCommaStringToMultipleScoresAsArrays(quoteWithCommaString: string): string[][] {
        let scoreArrays: string[][] = [];
        const scores = quoteWithCommaString.split("\n");
        scores.forEach((score) => {
            const scoreArray = score.split(",");
            scoreArrays.push(scoreArray);
        });
        return scoreArrays;
    }
    function _convertSingleScoreAsArrayToQuoteWithCommaString(singleScoreAsArray: string[]): string {
        let quoteWithCommaString = "";
        for (let index = 0; index < singleScoreAsArray.length; index++) {
            quoteWithCommaString += singleScoreAsArray[index];
            if (index !== singleScoreAsArray.length - 1) {
                quoteWithCommaString += ",";
            }
        }
        return quoteWithCommaString;
    }
}
