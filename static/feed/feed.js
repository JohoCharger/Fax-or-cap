const postTemplate = document.getElementById("post-template").innerHTML;
const cardList = document.getElementById("card-list");
const newPostForm = document.getElementById("new-post-form");
const newPostButton = document.getElementById("new-post-button");
const newPostSubmitButton = document.getElementById("submit-post");
const inputTextarea = document.getElementById("input-textarea");
const signInFirst = document.getElementById("sign-in-first");
const signedIn = document.getElementById("signed-in");
const lastPost = document.getElementById("last-post");

function requestNewPosts(amount) {
    const Http = new XMLHttpRequest();
    Http.open("GET", `http://localhost:3000/feed/new_content?amount=${amount}&last_post=${lastPost.textContent}`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send();

    Http.onreadystatechange = (event) => {
        if (Http.readyState !== 4) return;
        let posts = JSON.parse(Http.responseText);
        if (posts.length === 0) return;
        posts.forEach(post => {
            displayNewPost(post);
        });
        lastPost.textContent = posts[posts.length - 1].post_id;
    }
}

function displayNewPost(post) {
    let newPostElement = createElementFromHTML(postTemplate);
    newPostElement.querySelector(".author").textContent = post.username;
    newPostElement.querySelector(".content").textContent = post.content;
    newPostElement.querySelector(".post-id").textContent = post.post_id;
    newPostElement.querySelector(".profile-picture").src = post.img_link;
    const timeString = newPostElement.querySelector(".time").textContent.replace('{time}', post.time_since);
    newPostElement.querySelector(".time").textContent = timeString;
    newPostElement.querySelector(".fax-button").onclick = faxButtonPressed;
    newPostElement.querySelector(".cap-button").onclick = capButtonPressed;

    if (post.vote_type === 1) newPostElement.querySelector(".fax-button").classList.add("active");
    if (post.vote_type === 0) newPostElement.querySelector(".cap-button").classList.add("active");

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
    if (!signedIn) return;

    let target = event.target;
    const post_id = target.parentNode.querySelector('.post-id').textContent;

    if (event.target.classList.contains('active')) {
        target.classList.remove('active');
        removeVote( { post_id } );
        return
    }
    let correspondingCapButton = target.parentNode.querySelector('.cap-button');
    target.classList.add(("active"));
    correspondingCapButton.classList.remove("active");

    sendVote({ post_id, vote_type: 1 });
}

function capButtonPressed(event) {
    if (!signedIn) return;

    let target = event.target;
    const post_id = target.parentNode.querySelector('.post-id').textContent;


    if (event.target.classList.contains('active')) {
        target.classList.remove('active');
        removeVote( { post_id } );
        return

    }
    let correspondingFaxButton = target.parentNode.querySelector('.fax-button');
    target.classList.add(("active"));
    correspondingFaxButton.classList.remove("active");

    sendVote({ post_id, vote_type: 0 });
}

function sendVote(vote) {
    const http = new XMLHttpRequest();
    http.open('POST', 'http://localhost:3000/vote/add');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify(vote));
}

function removeVote(post_id) {
    const http = new XMLHttpRequest();
    http.open('DELETE', 'http://localhost:3000/vote/remove');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify(post_id));
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
    http.open("POST", 'http://localhost:3000/post/submit');
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