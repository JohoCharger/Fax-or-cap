function GetTimeString(time) {
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

module.exports = { GetTimeString };