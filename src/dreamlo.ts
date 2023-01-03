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
        const request = new XMLHttpRequest();
        request.open("GET", url, true);

        let xml = "";
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                xml = request.responseText;
            }
            console.log("DreamLo request returned: " + request.status + " " + request.statusText);
        };
        request.send();

        return xml;
    }
};