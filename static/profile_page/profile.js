const postTemplate = document.getElementById("post-template").innerHTML;
const cardList = document.getElementById("card-list");
const accountName = document.getElementById('username').textContent;
const signedIn = document.getElementById("signed-in");
const lastPost = document.getElementById('last-post');
const deletePostButton = document.getElementById('delete-button');
const cancelDeletionButton = document.getElementById('cancel-button');
const deleteVerification = document.getElementById('delete-verification');
const deletePostContent = document.getElementById('delete-post-content');
const ownAccount = !!document.getElementById('own-account');
const signoutButton = document.getElementById('signout_button');
const loading = document.getElementById('loading');

if (ownAccount) {
    signoutButton.onclick = () => {
        google.accounts.id.disableAutoSelect();
        const http = new XMLHttpRequest();
        http.open('GET', 'http://localhost:3000/auth/log_out');
        http.send();

        http.onreadystatechange = (event) => {
            if (http.readyState !== 4) return;
            window.location = '/feed';
        }
    }
}

function requestNewPosts(amount) {
    const Http = new XMLHttpRequest()
    Http.open("GET", `/feed/new_content/${accountName}?amount=${amount}&last_post=${lastPost.textContent}`);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send();

    Http.onreadystatechange = (event) => {
        if (Http.readyState !== 4) return;
        loading.style.display = "none";
        let posts = JSON.parse(Http.responseText);
        if (posts.length === 0) {
            clearInterval(loadPostsInterval);
            return;
        }
        lastPost.textContent = posts[posts.length - 1].post_id;
        posts.forEach(post => {
            const newElement = displayNewPost(post);
            const deleteButton = newElement.querySelector('.delete-button');
            if (ownAccount) {
                deleteButton.onclick = promptDeleteButton;
            } else {
                deleteButton.style.display = 'none';
            }
        });
    }
}

function resizeCardList() {
    if (window.innerWidth < 1200) return;
    cardList.style.height = String(window.innerHeight - 100) + 'px';
}

function hidePostDeletionVerification(e) {
    deleteVerification.style.display = 'none';
}

function promptDeleteButton(event) {
    const target = event.target;
    const post_id = target.parentNode.parentNode.querySelector('.post-id').textContent;
    deletePostContent.textContent = target.parentNode.parentNode.querySelector('.content').textContent;
    deleteVerification.style.display = 'block';

    deletePostButton.onclick = () => {
        removePost(target, post_id)
    }
    console.log(cancelDeletionButton)
    cancelDeletionButton.onclick = hidePostDeletionVerification;
}

function removePost(targetNode, post_id) {
    const http = new XMLHttpRequest();
    http.open('DELETE', '/post/remove');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify({ post_id }));
    hidePostDeletionVerification();

    http.onreadystatechange = () => {
        if (http.readyState !== 4) return;
        if (http.status === 200) {
            targetNode.parentNode.parentNode.parentNode.style.display = 'none';
        }
    }
}

window.setInterval(resizeCardList, 300);
const loadPostsInterval = window.setInterval(loadNewPosts, 500);

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
        deleteButton.onclick = promptDeleteButton;
    });
}