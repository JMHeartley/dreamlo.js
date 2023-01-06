$(function () {
    resetDefaults();
    addEventListeners();
});

const HTTP_BASE_URL = 'http://dreamlo.com/lb/';
const HTTPS_BASE_URL = 'https://dreamlo.com/lb/';
const DEFAULT_PUBLIC_KEY = '63b5a2e18f40bb1070f72cb4';
const DEFAULT_PRIVATE_KEY = 'ElOCRpEtnUKf3PeJf4ByXw11TQgPvqhUS-YWKF7m8ZwA';
let _publicKey;
let _privateKey;
let _useHttps;
let _baseUrl;

function addEventListeners() {
    $("#resetDefaults").click(function () {
        resetDefaults();
        // clear all form previews
    });

    $("#initializeForm").submit(function (event) {
        event.preventDefault();
        handleInitializeFormAndUpdateResponse();
        clearForm(this);
    });

    $("#addScoreForm").submit(function (event) {
        event.preventDefault();
        handleAddScoreFormAndUpdateResponse();
        clearForm(this);
    });

    $("#getScoreForm").submit(function (event) {
        event.preventDefault();
        handleGetScoreFormAndUpdateResponse();
        clearForm(this);
    });
}

function resetDefaults() {
    _publicKey = DEFAULT_PUBLIC_KEY;
    _privateKey = DEFAULT_PRIVATE_KEY;
    _baseUrl = HTTP_BASE_URL;
    _useHttps = false;
    $("#publicKeyInput").val(_publicKey);
    $("#privateKeyInput").val(_privateKey);
    $("#useHttpsCheckbox").prop('checked', _useHttps);
    $("#publicUrlPreview").val(_baseUrl + _publicKey + '/');
    $("#privateUrlPreview").val(_baseUrl + _privateKey + '/');

    dreamLo.initialize(_publicKey, _privateKey, _useHttps);
}

function clearForm(htmlElement) {
    $(htmlElement).find(':input').each(function () {
        switch (this.type) {
            case 'password':
            case 'select-multiple':
            case 'text':
            case 'textarea':
            case 'number':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
                break;
            case 'select-one':
                $(this).val(this[0].value);
                break;
            case 'button':
            case 'submit':
            case 'reset':
                break;
            default:
                alert("Unknown input type: " + this.type + "was not reset.")
        }
    });
}

function handleInitializeFormAndUpdateResponse() {
    _publicKey = $("#publicKeyInput").val();
    _privateKey = $("#privateKeyInput").val();
    _useHttps = $("#useHttpsCheckbox").is(":checked");
    _baseUrl = _useHttps ? HTTPS_BASE_URL : HTTP_BASE_URL;

    $("#publicUrlPreview").val(_baseUrl + _publicKey + '/');
    $("#privateUrlPreview").val(_baseUrl + _privateKey + '/');
}

function handleAddScoreFormAndUpdateResponse() {
    const score = {
        name: $("#scoreNameInput-addScore").val(),
        points: $("#scorePointsInput-addScore").val(),
        seconds: $("#scoreSecondsInput-addScore").val(),
        text: $("#scoreTextInput-addScore").val()
    };
    let format = $("#formatInput-addScore").val();
    const sortOrder = $("#sortOrderInput-addScore").val();
    const canOverwrite = $("#canOverwriteCheckbox").is(":checked");

    dreamLo.addScore(score, format, sortOrder, canOverwrite)
        .then((data) => {
            $("#responseBody-addScore").val(data);
        });

    if (format === 'array') {
        format = 'json';
    }
    let url = _baseUrl + _privateKey + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? "");
    if (score.text) {
        url += "/" + score.text;
    }
    $('#requestUrl-addScore').val(url)
}

function handleGetScoreFormAndUpdateResponse() {
    const name = $("#nameInput-getScore").val();
    let format = $("#formatInput-getScore").val();

    dreamLo.getScore(name, format)
        .then((data) => {
            $("#responseBody-getScore").val(data);
        });

    if (format === 'array') {
        format = 'json';
    }
    let url = _baseUrl + _publicKey + "/" + format + "-get/" + name;
    $('#requestUrl-getScore').val(url)
}
