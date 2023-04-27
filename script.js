
let info_url = "https://api.dev.vauhtijuoksu.fi/stream-metadata";

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
docReady(function() {
    make_timer()
    updateStatus()
    document.getElementById("time").onclick = toggle_time;
    document.getElementById("selfcount").onclick = toggle_selfcount;
    document.getElementById("COUNT").onclick = toggle_count;
    document.getElementById("HR").onclick = toggle_hr;
    getDonationsFlag()
    setFade()

});

function toggle_time(){
    document.getElementById("time").classList.toggle("hidden")
}
function toggle_count(){
    document.getElementById("COUNT").classList.toggle("hidden")
}
function toggle_selfcount() {
    document.getElementById("selfcount").classList.toggle("hidden")
}
function toggle_hr(){
    document.getElementById("HR").classList.toggle("hidden")
}

function updateStatus() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", info_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var info = JSON.parse(xhr.responseText);
            updateInfo(info);
            setTimeout(updateStatus, 1000);
        }
    }
    xhr.send();
}
let selfcount = 0

document.addEventListener("keyup", KeyCheck);  //or however you are calling your method
function KeyCheck(event) {
    var KeyID = event.keyCode;
    switch (KeyID) {
        case 32:
            selfcount += 1
            updateselfcount()
            break;
        case 8:
            selfcount -= 1
            updateselfcount()
            break;
        case 46:
            selfcount = 0
            updateselfcount()
            break;
        default:
            break;
    }
}

function updateselfcount() {
    var element = document.getElementById("selfcountvalue");
    element.innerHTML = selfcount
}

let timer_start = null   // Date.now()
let timer_end = null

function make_timer(){
    let timer = "<div id='timer'>"
    timer += "<div id='t-h1' class='num'></div><div id='t-h2' class='num'>0</div><div>:</div>"
    timer += "<div id='t-m1' class='num'>0</div><div id='t-m2' class='num'>0</div><div>:</div>"
    timer += "<div id='t-s1' class='num'>0</div><div id='t-s2' class='num'>0</div><div class='smallnum'>.</div>"
    timer += "<div id='t-ms1' class='num smallnum'>0</div><div id='t-ms2' class='num smallnum'>0</div>"
    timer += "</div>"
    var element = document.getElementById("time");
    if (element !== null){
        element.innerHTML += timer;
        setInterval(update_time, 10)
    }
}

function update_time(){
    let time_now = 0
    let h1 = 0
    let h2 = 0
    let m1 = 0
    let m2 = 0
    let s1 = 0
    let s2 = 0
    let ms1 = 0
    let ms2 = 0

    if (timer_start !== null){
        if (timer_end === null) {
            let now = Date.now()
            time_now = (now - timer_start) / 1000
        } else {
            time_now = (timer_end - timer_start) / 1000
        }
        if (time_now < 0){
            time_now = 0
        }
        let remain = time_now
        let hours = Math.floor(remain / (60 * 60))
        remain -= hours * 60 * 60
        let minutes = Math.floor(remain / (60))
        remain -= minutes * 60
        let seconds = Math.floor(remain)
        remain -= seconds
        remain = Math.floor(remain * 100)
        h1 = Math.floor(hours / 10)
        h2 = hours % 10
        m1 = Math.floor(minutes / 10)
        m2 = minutes % 10
        s1 = Math.floor(seconds / 10)
        s2 = seconds % 10
        ms1 = Math.floor(remain / 10)
        ms2 = remain % 10
    }
    if (h1 > 0){
        document.getElementById("t-h1").innerHTML = h1
    } else {
        document.getElementById("t-h1").innerHTML = ""
    }
    document.getElementById("t-h2").innerHTML = h2
    document.getElementById("t-m1").innerHTML = m1
    document.getElementById("t-m2").innerHTML = m2
    document.getElementById("t-s1").innerHTML = s1
    document.getElementById("t-s2").innerHTML = s2
    document.getElementById("t-ms1").innerHTML = ms1
    document.getElementById("t-ms2").innerHTML = ms2
}


function updateInfo(info) {
   // console.log(info)
    let runtimer = false
    if (info.timers.length > 0){

        for (let i = 0; i < info.timers.length; i ++) {
            if (info.timers[i]["name"] == 1){
                runtimer = info.timers[i] // Only 1 timer currently pls.
                if (runtimer.start_time != null) {
                    timer_start = new Date(runtimer.start_time)
                } else {
                    timer_start = null
                }
                if (runtimer.end_time != null) {
                    timer_end = new Date(runtimer.end_time);
                } else {
                    timer_end = null
                }
            }
        }

    }
    if (!runtimer){
        console.log("no timer found!")
    }
    updateCounters(info.counters)
    updateHRs(info.heart_rates);
}


let counters = []
function updateCounters(data) {
    for (let i = 0; i < data.length; i ++){
        if (counters.length < i+1){
            counters.push({"value": 0})
            let COUNTS = document.getElementById("COUNT");
            COUNTS.innerHTML += "<div id='deathcounter"+i+"'></div>"
        }
        var element = document.getElementById(("deathcounter" + i).toString());
        if (data[i] >= 0){
            counters[i]["value"] = data[i]
            element.style.display = "block"
            element.innerHTML = "<div class='skull'>" + (i+1) + "💀</div><div class='counter'>" + counters[i]["value"] + "</div>"
        } else {
            element.style.display = "none";
        }
    }
}



let hrs = []
function updateHRs(data) {
    for (let i = 0; i < data.length; i ++){
        if (hrs.length < i+1){
            hrs.push({"value": 0, "novalue": 10, "highscore": 0})
            let HRS = document.getElementById("HR");
            HRS.innerHTML += "<div id='hr"+i+"'></div>"
        }
        var element = document.getElementById(("hr" + i).toString());
        if (data[i] > 0){
            hrs[i]["value"] = data[i]
            if (hrs[i]["highscore"] < data[i]){
                hrs[i]["highscore"] = data[i]
            }
            hrs[i]["novalue"] = 0
            element.style.display = "block"
            element.innerHTML = "<div class='heart'>" + (i+1) + "❤️</div><div class='counter' style='opacity: 1'>" + hrs[i]["value"] + "</div>"
        } else {
            hrs[i]["novalue"] += 1
            element.innerHTML = "<div class='heart'>" + (i+1) + "❤️</div><div class='counter' style='opacity: "+ (((10-hrs[i]["novalue"])/20) + 0.5) + "'>" + hrs[i]["value"] + "</div>"
            if (hrs[i]["novalue"] > 10){
                element.style.display = "none";
            }
        }
    }
}


var donations_flag = {"message":"2022-04-30T08:37:45.788Z Lahjoituksia luettavana!"}
const fade_minutes = 1.2
function getDonationsFlag() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.dev.vauhtijuoksu.fi/player-info");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            donations_flag = JSON.parse(xhr.responseText);
            setTimeout(getDonationsFlag, 2000);
        }
    }
    xhr.send();
}
function setFade() {
    var element = document.getElementById("playeralert");
    let msg = donations_flag.message
    let time = new Date(msg.split(" ")[0])
    var diff = (Date.now() - time)/1000
    if (diff < fade_minutes*60) {
        element.style.backgroundColor = "#ffe600";
        element.style.opacity = (1-diff/(fade_minutes*60)).toString();
    } else {
        element.style.opacity = "0";

    }
    setTimeout(setFade, 100);
}