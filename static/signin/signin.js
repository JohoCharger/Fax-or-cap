const staySigned = document.getElementById('stay-signed');

function dontStaySigned() {
    const Http = new XMLHttpRequest();
    Http.open("POST", `/api/account/stay_signed`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send(JSON.stringify({ stay: false }));
}

function doStaySigned() {
    const Http = new XMLHttpRequest();
    Http.open("POST", `/api/account/stay_signed`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send(JSON.stringify({ stay: true }));
}

window.onload = function(e) {
    staySigned.onchange = (event => {
        if (staySigned.checked) {
            dontStaySigned();
        } else {
            doStaySigned();
        }
    });
}