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

function getFaxOrCapPercentage(account) {
    if (account.fax === 0 && account.cap === 0) return 'no votes yet';
    if (account.fax === 0 && account.cap !== 0) return '100% capper';
    if (account.fax !== 0 && account.cap === 0) return '100% fax spitter';
    if (account.fax === account.cap) return "50% fax spitter";

    const total = account.fax + account.cap;
    if (account.fax > account.cap) {
        return String(Math.round(account.fax / total * 100)) + '% fax spitter';
    } else {
        return String(Math.round(account.cap / total * 100)) + '% capper';
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

module.exports = { getTimeString, getFaxOrCapString, getFaxOrCapPercentage };