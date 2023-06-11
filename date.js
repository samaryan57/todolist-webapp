export default { getDate, getDay };

function getDate() {
    let today = new Date();
    // let currentDay = today.getDay();
    let day = "";

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    day = today.toLocaleDateString("en-US", options);

    return day;
}

function getDay() {
    let today = new Date();
    // let currentDay = today.getDay();
    let day = "";

    let options = {
        weekday: "long",
    };

    day = today.toLocaleDateString("en-US", options);

    return day;
}