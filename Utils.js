function GetTimeString2(time) {
    const timeSplit = time.split('');
    if (timeSplit.length <= 5) {
        return "1min";
    } else if (timeSplit.length === 6) {
        return timeSplit[0] + "min"; //Single digit minutes
    } else if (timeSplit.length === 7) {
        return timeSplit[0] + timeSplit[1] + "min"; //Two digit minutes
    } else if (timeSplit.length === 8) {
        return timeSplit[0] + "hr"; //Single digit hours
    } else if (timeSplit.length === 9) {
        return timeSplit[0] + timeSplit[1] + "hr"; //Two Digit hours
    } else if (timeSplit.length === 10) {
        return timeSplit[0] + "d"; //Single Digit days
    } else if (timeSplit.length === 11) {
        return timeSplit[0] + timeSplit[1] + "d"; //Two Digit days
    } else if (timeSplit.length === 12) {
        return timeSplit[0] + timeSplit[1] + timeSplit[2] + "d"; //Three Digit days
    } else {
        return timeSplit[0] + "yr"; //Years
    }
}

function GetTimeString(time) {
    time /= 60000;
    if (time < 1) return '1min';
    if (time < 60) return String(Math.floor(time)) + 'min';
    time /= 60;
    if (time < 24) return String(Math.floor(time)) + 'hr';
    time /= 24;
    if (time < 365) return String(Math.floor(time)) + 'd';
    return String(Math.floor(time / 365)) + 'yr';
}

module.exports = { GetTimeString };