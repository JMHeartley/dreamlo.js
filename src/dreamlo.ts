namespace DreamLo {
    let _baseUrl = "http://dreamlo.com/lb/";
    export function initialize(privateKey: string, useHttps = false): void {
        if (useHttps) {
            _baseUrl = _baseUrl.replace("http://", "https://");
        }
        _baseUrl += privateKey;
    }
    export function getScoresXml(): string {
        const url = _baseUrl + "/xml";
        return _get(url);
    }
    export function getScoresJson(): string {
        const url = _baseUrl + "/json";
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