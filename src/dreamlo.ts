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
    export function getScoresXml(): string {
        const url = _baseUrl + _publicKey + "/xml";
        return _get(url);
    }
    export function getScoresJson(): string {
        const url = _baseUrl + _publicKey + "/json";
        return _get(url);
    }
    export function getScoresPipe(): string {
        const url = _baseUrl + _publicKey + "/pipe";
        return _get(url);
    }
    export function getScoresQuote(): string {
        const url = _baseUrl + _publicKey + "/quote";
        return _get(url);
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
};