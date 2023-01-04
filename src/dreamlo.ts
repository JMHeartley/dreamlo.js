/// <reference path="score.ts" />
namespace DreamLo {
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
    export function getScores(format: ScoreFormat, sortOrder: SortOrder = SortOrder.PointsDescending, start: number = 0, count?: number): string {
        if (_publicKey === "") {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }

        let url = _baseUrl + _publicKey + "/" + format + sortOrder + "/" + start;
        if (count) {
            url += "/" + count;
        }

        return _get(url);
    }
    export function getScore(format: ScoreFormat, name: string): string {
        if (_publicKey === "") {
            throw new Error("DreamLo public key not set. Call DreamLo.initialize() first.");
        }

        let url = _baseUrl + _publicKey + "/" + format + "-get/" + name;

        return _get(url);
    }
    export function addScore(score: Score): void {
        if (_privateKey === "") {
            throw new Error("DreamLo private key not set. Call DreamLo.initialize() first.");
        }

        let url = _baseUrl + _privateKey + "/add/" + score.name + "/" + score.points + "/" + score.seconds ?? -1;
        if (score.text) {
            url += "/" + score.text;
        }

        _get(url);
    }
    function _get(url: string): string {
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
    export enum ScoreFormat {
        Xml = "xml",
        Json = "json",
        Pipe = "pipe",
        Quote = "quote"
    }
    export enum SortOrder {
        PointsDescending = "",
        PointsAscending = "-asc",
        SecondsDescending = "-seconds",
        SecondsAscending = "-seconds-asc",
        DateDescending = "-date",
        DateAscending = "-date-asc"
    }
}
