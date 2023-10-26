const postTemplate = document.getElementById("post-template").innerHTML;
const cardList = document.getElementById("card-list");
const newPostForm = document.getElementById("new-post-form");
const newPostButton = document.getElementById("new-post-button");
const newPostSubmitButton = document.getElementById("submit-post");
const inputTextarea = document.getElementById("input-textarea");
const signInFirst = document.getElementById("sign-in-first");
const signedIn = document.getElementById("signed-in");
const lastPost = document.getElementById("last-post");
const loading = document.getElementById("loading");
let postLoadingInProgress = false;

function requestNewPosts(amount) {
    if (postLoadingInProgress) return;
    postLoadingInProgress = true;
    const Http = new XMLHttpRequest();
    Http.open("GET", `/api/feed/new_content?amount=${amount}&last_post=${lastPost.textContent}`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send();

    Http.onreadystatechange = (event) => {
        if (Http.readyState !== 4) return;
        postLoadingInProgress = false;
        loading.style.display = 'none';
        let posts = JSON.parse(Http.responseText);
        if (posts.length === 0) {
            clearInterval(loadPostsInterval);
            return;
        }
        posts.forEach(post => {
            displayNewPost(post, signedIn);
        });
        lastPost.textContent = posts[posts.length - 1].post_id;
    }
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
    const content = inputTextarea.value;
    if (content.trim() === '') return;
    if (content.length > 250) return;

    const http = new XMLHttpRequest();
    http.open("POST", '/api/post/create');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify({
        content: inputTextarea.value,
    }));

    http.onreadystatechange = (event) => {
        if (http.readyState !== 4) return;
        window.location = '/feed';
    }
}

inputTextarea.oninput = function() {
    if (inputTextarea.value.length > 250) {
        inputTextarea.value = inputTextarea.value.slice(0, 250);
    }
}

const loadPostsInterval = window.setInterval(loadNewPosts, 200);

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