const postTemplate = document.getElementById("post-template").innerHTML;
const cardList = document.getElementById("card-list");

function requestNewPosts(amount) {
    const Http = new XMLHttpRequest()
    Http.open("GET", `http://localhost:3000/feed/new_content?amount=${amount}`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send();

    Http.onreadystatechange = (event) => {
        if (Http.readyState !== 4) return;
        let posts = JSON.parse(Http.responseText);
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
}