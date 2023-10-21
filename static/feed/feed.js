const postTemplate = document.getElementById("post-template").innerHTML;
const cardList = document.getElementById("card-list");
const newPostForm = document.getElementById("new-post-form");
const newPostButton = document.getElementById("new-post-button");
const newPostSubmitButton = document.getElementById("submit-post");
const inputTextarea = document.getElementById("input-textarea");
const signInFirst = document.getElementById("sign-in-first");
const signedIn = document.getElementById("signed-in");

function requestNewPosts(amount) {
    const Http = new XMLHttpRequest()
    Http.open("GET", `http://localhost:3000/feed/new_content?amount=${amount}`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send();

    Http.onreadystatechange = (event) => {
        if (Http.readyState !== 4) return;
        let posts = JSON.parse(Http.responseText);
        if (posts === []) return;
        posts.forEach(post => {
            displayNewPost(post);
        })
    }
}

function displayNewPost(post) {
    let newPostElement = createElementFromHTML(postTemplate);
    newPostElement.querySelector(".author").textContent = post.author;
    newPostElement.querySelector(".content").textContent = post.content;
    const timeString = newPostElement.querySelector(".time").textContent.replace('{time}', post.time_since);
    newPostElement.querySelector(".time").textContent = timeString;
    newPostElement.querySelector(".fax-button").onclick = faxButtonPressed;
    newPostElement.querySelector(".cap-button").onclick = capButtonPressed;
    cardList.appendChild(newPostElement)
}

function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function getScrollBottom() {
    if (cardList.childElementCount === 0) return;
    const lastCard = cardList.lastElementChild;
    const boundingBox = lastCard.getBoundingClientRect();
    return boundingBox.bottom;
}

function loadNewPosts(e) {
    const bottom = getScrollBottom();
    if (bottom <= window.innerHeight) {
        requestNewPosts(3);
    }
}

function faxButtonPressed(event) {
    let target = event.target;
    let correspondingCapButton = target.parentNode.lastElementChild;
    target.classList.add(("active"));
    correspondingCapButton.classList.remove("active");
}

function capButtonPressed(event) {
    let target = event.target;
    let correspondingFaxButton = target.parentNode.children[target.parentNode.childElementCount-2];
    correspondingFaxButton.classList.remove("active");
    target.classList.add(("active"));
}

function toggleNewPostForm() {
    if (signedIn) {
        if (newPostForm.style.display === 'block') newPostForm.style.display = 'none';
        else newPostForm.style.display = 'block';
    } else {
        if (signInFirst.style.display === 'block') signInFirst.style.display = 'none';
        else signInFirst.style.display = 'block';
    }
}

function submitNewPost() {
    const http = new XMLHttpRequest();
    http.open("POST", 'http://localhost:3000/new_post/submit');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify({
        content: inputTextarea.value,
    }));

    http.onreadystatechange = (event) => {
        if (http.readyState !== 4) return;
        window.location = '/feed';
    }
}

window.setInterval(loadNewPosts, 200);

window.onload = () => {
    loadNewPosts();

    let faxButtons = document.querySelectorAll(".fax-button");
    faxButtons.forEach(faxButton => {
        faxButton.onclick = faxButtonPressed;
    })

    let capButtons = document.querySelectorAll(".cap-button");
    capButtons.forEach(capButton => {
       capButton.onclick = capButtonPressed;
    });

    newPostSubmitButton.onclick = submitNewPost;
    newPostButton.onclick = toggleNewPostForm;
}