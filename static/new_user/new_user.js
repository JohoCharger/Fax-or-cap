const newUsernameInput = document.getElementById('new-username-input');
const submitButton = document.getElementById('submit-button');
const messageField = document.getElementById('message-field');
let canSubmit = false;

function displayMessage(message) {
    messageField.textContent = message.message;
    if (message.type === 'error') {
        messageField.style.color = 'red';
        canSubmit = false;
    } else {
        messageField.style.color = 'green';
        canSubmit = true;
    }
}

function usernamePromptChanged() {
    const newUsername = newUsernameInput.value;
    if (newUsername.length < 3) {
        displayMessage({
            message: 'Name must be at least 3 characters long',
            type: 'error'
        });
    } else if (newUsername.length > 30) {
        displayMessage({
            message: 'Name must be at most 30 characters long',
            type: 'error'
        });
    } else {
        const http = new XMLHttpRequest();
        http.open("GET", `http://localhost:3000/auth/username_available?username=${newUsername}`);
        http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        http.send();

        http.onreadystatechange = (event) => {
            if (http.readyState !== 4) return;
            let response = JSON.parse(http.responseText);
            if (response.available) {
                displayMessage({
                    message: `${newUsername} is available`,
                    type: 'success'
                });
            } else {
                displayMessage({
                    message: `${newUsername} is not available`,
                    type: 'error'
                });
            }
        }
    }
}

function submitNewUsername() {
    if (!canSubmit) return;
    const newUsername = newUsernameInput.value;
    const http = new XMLHttpRequest();
    http.open("POST", `http://localhost:3000/auth/change_username`);
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify({ newUsername }));

    http.onreadystatechange = (event) => {
        if (http.readyState !== 4) return;
        if (http.status === 200) window.location.replace('http://localhost:3000/feed');
    }
}

window.onload = function() {
    newUsernameInput.oninput = usernamePromptChanged;

    submitButton.onclick = submitNewUsername;
}