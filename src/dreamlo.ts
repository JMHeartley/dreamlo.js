/// <reference path="score.ts" />
/// <reference path="scoreFormat.ts" />
/// <reference path="sortOrder.ts" />
namespace dreamlo {
    let _baseUrl = "http://dreamlo.com/lb/";
    let _publicKey = "";
    let _privateKey = "";
    export function initialize(publicKey: string, privateKey: string, useHttps = false): void {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _publicKey = publicKey;
        _privateKey = privateKey;
    }
    export async function getScores(format: ScoreFormat = ScoreFormat.Json, sortOrder: SortOrder = SortOrder.PointsDescending, skip: number = 0, take?: number): Promise<string> {
        if (!_publicKey) {
            throw new Error("dreamlo public key not set. Call dreamlo.initialize() first.");
        }

        let url = _baseUrl + _publicKey + "/" + format + sortOrder + "/" + skip;
        if (take) {
            url += "/" + take;
        }

        return await _get(url);
    }
    export async function getScore(name: string, format: ScoreFormat = ScoreFormat.Json): Promise<string> {
        if (!_publicKey) {
            throw new Error("dreamlo public key not set. Call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("dreamlo getScore name parameter is required.");
        }

        let url = _baseUrl + _publicKey + "/" + format + "-get/" + name;

        let result = await _get(url);
        // HACK: this is to get around the fact that the dreamlo API returns all scores 
        // are returned when using formats JSON, XML, and Quote instead of just the 
        // score with the matching name, no matter with the score in present or not
        return _enforceExpectedResult(name, format, result);
    }
    export async function addScore(score: Score, format: ScoreFormat = ScoreFormat.Json, sortOrder: SortOrder = SortOrder.PointsDescending, canOverwrite: boolean = false): Promise<string> {
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }
        if (!score.name) {
            throw new Error("dreamlo addScore score.name property is required.");
        }
        if (!score.points) {
            throw new Error("dreamlo addScore score.points property is required.");
        }

        let url = _baseUrl + _privateKey + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? "");
        if (score.text) {
            url += "/" + score.text;
        }

        if (!canOverwrite) {
            const existingScore = await getScore(score.name, ScoreFormat.Pipe);
            if (existingScore) {
                throw new Error(`Score with name ${score.name} already exists. Set canOverwriteScore to true to overwrite.`);
            }
        }

        return await _get(url);
    }
    export async function deleteScores(): Promise<void> {
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }

        const url = _baseUrl + _privateKey + "/clear";
        await _get(url);
    }
    export async function deleteScore(name: string): Promise<void> {
        if (!_privateKey) {
            throw new Error("dreamlo private key not set. Call dreamlo.initialize() first.");
        }
        if (!name) {
            throw new Error("dreamlo deleteScore name parameter is required.");
        }

        const url = _baseUrl + _privateKey + "/delete/" + name;
        await _get(url);
    }
    async function _get(url: string): Promise<string> {
        let data = "";
        // dreamlo Docs: You can not have an asterisk * character in your URL, scores, usernames, etc.
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
    function _enforceExpectedResult(name: string, format: ScoreFormat, result: string): string {
        let newResult = "";
        switch (format) {
            case ScoreFormat.Json:
                for (const score of JSON.parse(result).dreamlo.leaderboard.entry) {
                    if (score.name === name) {
                        newResult = JSON.stringify(score);
                    }
                }
                break;
            case ScoreFormat.Xml:
                const parser = new DOMParser();
                let xmlDoc = parser.parseFromString(result, "text/xml");
                for (const score of xmlDoc.getElementsByTagName("entry")) {
                    if (score.getElementsByTagName("name")[0].childNodes[0].nodeValue === name) {
                        newResult = score.outerHTML;
                    }
                }
                break;
            case ScoreFormat.Pipe:
                // this format returns a single score as expected
                newResult = result;
                break;
            case ScoreFormat.Quote:
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
    function decodeQuoteWithCommaAsScoreStringArrays(data: string): string[][] {
        let result: string[][] = [];
        for (const score of data.split("\n")) {
            const scoreArray: string[] = [];
            for (const value of score.split(",")) {
                scoreArray.push(value);
            }
            result.push(scoreArray);
        }
        return result;
    }
    function recodeScoreStringArrayAsQuoteWithCommaString(scoreArray: string[]): string {
        let result = "";
        for (let index = 0; index < scoreArray.length; index++) {
            result += scoreArray[index];
            if (index !== scoreArray.length - 1) {
                result += ",";
            }
        }
        return result;
    }
}
