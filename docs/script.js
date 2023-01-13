$(function () {
    setDefaults();
    addEventListeners();
});

const HTTP_BASE_URL = 'http://dreamlo.com/lb/';
const HTTPS_BASE_URL = 'https://dreamlo.com/lb/';
const DEFAULT_PUBLIC_CODE = '5fa8af5feb371a09c4c51d17';
const DEFAULT_PRIVATE_CODE = 'cgpr101Ep0yMn0IZPhMAqwVghoK20BG06c_rPh-i1Npg';
let _publicCode;
let _privateCode;
let _useHttps;
let _baseUrl;

function addEventListeners() {
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

    $("#getScoresForm").submit(function (event) {
        event.preventDefault();
        handleGetScoresFormAndUpdateResponse();
        clearForm(this);
    });

    $("#deleteScoreForm").submit(function (event) {
        event.preventDefault();
        handleDeleteScoreFormAndUpdateResponse();
        clearForm(this);
    });

    $("#deleteScoresForm").submit(function (event) {
        event.preventDefault();
        handleDeleteScoresFormAndUpdateResponse();
        clearForm(this);
    });

    $("#useHttpsCheckbox").change(function () {
        if (window.location.protocol === "https:" && !this.checked) {
            openMixedContentWarning();
            this.checked = true;
        }
    });
}

function setDefaults() {
    _publicCode = DEFAULT_PUBLIC_CODE;
    _privateCode = DEFAULT_PRIVATE_CODE;
    _baseUrl = HTTP_BASE_URL;
    _useHttps = true;
    $("#publicCodeInput").val(_publicCode);
    $("#privateCodeInput").val(_privateCode);
    $("#useHttpsCheckbox").prop('checked', _useHttps);
    $("#publicUrlPreview").val(_baseUrl + _publicCode + '/');
    $("#privateUrlPreview").val(_baseUrl + _privateCode + '/');

    dreamlo.initialize(_publicCode, _privateCode, _useHttps);
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
                alert("Unknown input type: " + this.type + "was not reset.");
        }
    });
}

function handleInitializeFormAndUpdateResponse() {
    _publicCode = $("#publicCodeInput").val();
    _privateCode = $("#privateCodeInput").val();
    _useHttps = $("#useHttpsCheckbox").is(":checked");
    _baseUrl = _useHttps ? HTTPS_BASE_URL : HTTP_BASE_URL;

    $("#publicUrlPreview").val(_baseUrl + _publicCode + '/');
    $("#privateUrlPreview").val(_baseUrl + _privateCode + '/');

    alert("Initializing dreamlo with public code: " + _publicCode + ", private code: " + _privateCode + ", and useHttps: " + _useHttps);
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

    alert("Adding score: " + JSON.stringify(score) + "\n format: " + format + ", sortOrder: " + sortOrder + ", canOverwrite: " + canOverwrite);

    dreamlo.addScore(score, format, sortOrder, canOverwrite)
        .then((data) => {
            $("#responseBody-addScore").val(data);
        })
        .catch((error) => {
            alert("Error adding score: " + error);
            $("#responseBody-addScore").val('');
        });

    if (format === 'object') {
        format = 'json';
    }
    let url = _baseUrl + _privateCode + "/add-" + format + sortOrder + "/" + score.name + "/" + score.points + "/" + (score.seconds ?? 0);
    if (score.text) {
        url += "/" + score.text;
    }
    $('#requestUrl-addScore').val(url);
}

function handleGetScoreFormAndUpdateResponse() {
    const name = $("#nameInput-getScore").val();
    let format = $("#formatInput-getScore").val();

    alert("Getting score for name: " + name + ", format: " + format);

    dreamlo.getScore(name, format)
        .then((data) => {
            $("#responseBody-getScore").val(data);
        })
        .catch((error) => {
            alert("Error getting score: " + error);
            $("#responseBody-getScore").val('');
        });

    if (format === 'object') {
        format = 'json';
    }
    let url = _baseUrl + _publicCode + "/" + format + "-get/" + name;
    $('#requestUrl-getScore').val(url);
}

function handleGetScoresFormAndUpdateResponse() {
    let format = $("#formatInput-getScores").val();
    const sortOrder = $("#sortOrderInput-getScores").val();
    let skip = $("#skipInput-getScores").val();
    const take = $("#takeInput-getScores").val();

    // if not set, give it it's default value
    if (!skip) {
        skip = 0;
    }

    alert("Getting scores for format: " + format + ", sortOrder: " + sortOrder + ", skip: " + skip + ", take: " + take);

    dreamlo.getScores(format, sortOrder, skip, take)
        .then((data) => {
            $("#responseBody-getScores").val(data);
        })
        .catch((error) => {
            alert("Error getting scores: " + error);
            $("#responseBody-getScores").val('');
        });

    if (format === 'object') {
        format = 'json';
    }
    let url = _baseUrl + _publicCode + "/" + format + sortOrder + "/" + skip;
    if (take) {
        url += "/" + take;
    }
    $('#requestUrl-getScores').val(url);
}

function handleDeleteScoreFormAndUpdateResponse() {
    const name = $("#nameInput-deleteScore").val();

    alert("Deleting score for name: " + name);

    dreamlo.deleteScore(name)
        .catch((error) => {
            alert("Error deleting score: " + error);
        });

    let url = _baseUrl + _privateCode + "/delete/" + name;
    $('#requestUrl-deleteScore').val(url);
}

function handleDeleteScoresFormAndUpdateResponse() {
    alert("Deleting all scores");

    dreamlo.deleteScores()
        .catch((error) => {
            alert("Error deleting scores: " + error);
        });

    let url = _baseUrl + _privateCode + "/clear";
    $('#requestUrl-deleteScores').val(url);
}

function openMixedContentWarning() {
    var warningModal = new bootstrap.Modal(document.getElementById('mixedContentWarningModal'), {
        keyboard: false
    });
    warningModal.show();
}