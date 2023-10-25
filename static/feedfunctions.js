function getFaxOrCapString(post) {
    if (post.fax === 0 && post.cap === 0) return 'no votes yet';
    if (post.fax === 0 && post.cap !== 0) return '100% cap';
    if (post.fax !== 0 && post.cap === 0) return '100% fax';
    if (post.fax === post.cap) return "50% fax";

    const total = post.fax + post.cap;
    if (post.fax > post.cap) {
        return String(Math.round(post.fax / total * 100)) + '% fax'
    } else {
        return String(Math.round(post.cap / total * 100)) + '% cap'
    }
}

function getTimeString(time) {
    time /= 60000;
    if (time < 1) return '1min';
    if (time < 60) return String(Math.floor(time)) + 'min';
    time /= 60;
    if (time < 24) return String(Math.floor(time)) + 'hr';
    time /= 24;
    if (time < 365) return String(Math.floor(time)) + 'd';
    return String(Math.floor(time / 365)) + 'yr';
}

function displayNewPost(post) {
    let newPostElement = createElementFromHTML(postTemplate);
    newPostElement.querySelector(".author").textContent = post.username;
    newPostElement.querySelector(".content").textContent = post.content;
    newPostElement.querySelector(".post-id").textContent = post.post_id;
    newPostElement.querySelector(".profile-picture").src = post.img_link;
    newPostElement.querySelector(".profile-link").href = `/profile/${post.username}`;
    const timeString = newPostElement.querySelector(".time").textContent.replace('{time}', post.time_since);
    newPostElement.querySelector(".time").textContent = timeString;
    newPostElement.querySelector(".faxorcap").textContent = post.faxorcapString;
    newPostElement.querySelector(".fax-count").textContent = post.fax;
    newPostElement.querySelector(".cap-count").textContent = post.cap;
    newPostElement.querySelector(".fax-button").onclick = faxButtonPressed;
    newPostElement.querySelector(".cap-button").onclick = capButtonPressed;

    if (post.vote_type === 1) newPostElement.querySelector(".fax-button").classList.add("active");
    if (post.vote_type === 0) newPostElement.querySelector(".cap-button").classList.add("active");

    if (!signedIn) {
        newPostElement.querySelector(".fax-button").style.display = 'none';
        newPostElement.querySelector(".cap-button").style.display = 'none';
    }

    cardList.appendChild(newPostElement);
    return newPostElement;
}

function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function getScrollBottom() {
    if (cardList.childElementCount === 0) return 0;
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

function updateFaxOrCapString(target) {
    const capAmountElement = target.parentNode.querySelector('.cap-count');
    const faxAmountElement = target.parentNode.querySelector('.fax-count');
    const faxorcapString = target.parentNode.querySelector('.faxorcap');
    const newFaxorcapString = getFaxOrCapString({
        fax: parseInt(faxAmountElement.textContent),
        cap: parseInt(capAmountElement.textContent),
    });

    faxorcapString.textContent = newFaxorcapString;
}

function faxButtonPressed(event) {
    if (!signedIn) return;

    let target = event.target;
    const capAmountElement = target.parentNode.querySelector('.cap-count');
    const faxAmountElement = target.parentNode.querySelector('.fax-count');
    const post_id = target.parentNode.querySelector('.post-id').textContent;

    if (event.target.classList.contains('active')) {
        target.classList.remove('active');
        faxAmountElement.textContent = String(parseInt(faxAmountElement.textContent) - 1);
        updateFaxOrCapString(target);
        removeVote( { post_id } );
        return
    }
    let correspondingCapButton = target.parentNode.querySelector('.cap-button');
    if (correspondingCapButton.classList.contains('active')) {
        correspondingCapButton.classList.remove("active");
        capAmountElement.textContent = String(parseInt(capAmountElement.textContent) - 1);
    }
    target.classList.add(("active"));
    faxAmountElement.textContent = String(parseInt(faxAmountElement.textContent) + 1);

    updateFaxOrCapString(target);
    sendVote({ post_id, vote_type: 1 });
}

function capButtonPressed(event) {
    if (!signedIn) return;

    let target = event.target;
    const capAmountElement = target.parentNode.querySelector('.cap-count');
    const faxAmountElement = target.parentNode.querySelector('.fax-count');
    const post_id = target.parentNode.querySelector('.post-id').textContent;


    if (event.target.classList.contains('active')) {
        target.classList.remove('active');
        capAmountElement.textContent = String(parseInt(capAmountElement.textContent) - 1);
        updateFaxOrCapString(target);
        removeVote( { post_id } );
        return

    }
    let correspondingFaxButton = target.parentNode.querySelector('.fax-button');
    if (correspondingFaxButton.classList.contains('active')) {
        correspondingFaxButton.classList.remove("active");
        faxAmountElement.textContent = String(parseInt(faxAmountElement.textContent) - 1);
    }
    target.classList.add(("active"));
    capAmountElement.textContent = String(parseInt(capAmountElement.textContent) + 1);

    updateFaxOrCapString(target);
    sendVote({ post_id, vote_type: 0 });
}

function sendVote(vote) {
    const http = new XMLHttpRequest();
    http.open('POST', '/api/vote/add');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify(vote));
}

function removeVote(post_id) {
    const http = new XMLHttpRequest();
    http.open('DELETE', '/api/vote/remove');
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify(post_id));
}
