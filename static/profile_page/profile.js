const button = document.getElementById('signout_button');
button.onclick = () => {
    google.accounts.id.disableAutoSelect();
    const http = new XMLHttpRequest();
    http.open('GET', 'http://localhost:3000/auth/log_out');
    http.send();

    http.onreadystatechange = (event) => {
        if (http.readyState !== 4) return;
        window.location = '/feed';
    }
};

const postTemplate = document.getElementById("post-template").innerHTML;
const cardList = document.getElementById("card-list");
const accountName = document.getElementById('username').textContent;
const signedIn = document.getElementById("signed-in");
const lastPost = document.getElementById('last-post');

function requestNewPosts(amount) {
    const Http = new XMLHttpRequest()
    Http.open("GET", `http://localhost:3000/feed/new_content/${accountName}?amount=${amount}&last_post=${lastPost.textContent}`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send();

    Http.onreadystatechange = (event) => {
        if (Http.readyState !== 4) return;
        let posts = JSON.parse(Http.responseText);
        if (posts.length === 0) return;
        lastPost.textContent = posts[posts.length - 1].post_id;
        posts.forEach(post => {
            displayNewPost(post);
        });
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

function resizeCardList() {
    if (window.innerWidth < 1200) return;
    cardList.style.height = String(window.innerHeight - 100) + 'px';
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

function removePost(event) {
    const target = event.target;
    const post_id = target.parentNode.querySelector('.post-id').textContent;
    const http = new XMLHttpRequest();
    http.open('DELETE', 'http://localhost:3000/post/remove');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify({ post_id }));

    http.onreadystatechange = (event) => {
        if (http.readyState !== 4) return;
        if (http.status === 200) {
            target.parentNode.parentNode.parentNode.style.display = 'none';
        }
    }
}

function removeVote(post_id) {
    const http = new XMLHttpRequest();
    http.open('DELETE', 'http://localhost:3000/vote/remove');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify(post_id));
}

window.setInterval(resizeCardList, 300);
window.setInterval(loadNewPosts, 500);

window.onload = () => {
    resizeCardList();
    loadNewPosts();

    let faxButtons = document.querySelectorAll(".fax-button");
    faxButtons.forEach(faxButton => {
        faxButton.onclick = faxButtonPressed;
    })

    let capButtons = document.querySelectorAll(".cap-button");
    capButtons.forEach(capButton => {
        capButton.onclick = capButtonPressed;
    });

    let deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(deleteButton => {
        deleteButton.onclick = removePost;
    });
}