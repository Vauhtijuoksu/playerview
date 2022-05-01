
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
    document.getElementById("deaths").onclick = toggle_death;
    document.getElementById("HR").onclick = toggle_hr;
    getDonationsFlag()
    setFade()

});

function toggle_time(){
    document.getElementById("time").classList.toggle("hidden")
}
function toggle_death(){
    document.getElementById("deaths").classList.toggle("hidden")
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
    if (info.timers.length > 0){
        runtimer = info.timers[0] // Only 1 timer currently pls.
        if (runtimer.start_time != null){
            timer_start = new Date(runtimer.start_time)
        } else {
            timer_start = null
        }
        if (runtimer.end_time != null){
            timer_end = new Date(runtimer.end_time);
        } else {
            timer_end = null
        }

    }
    updateDeath(1, info.counters[0]);
    updateDeath(2, info.counters[1]);
    updateDeath(3, info.counters[2]);
    updateDeath(4, info.counters[3]);
    updateHR(1, info.heart_rates[0]);
    updateHR(2, info.heart_rates[1]);
    updateHR(3, info.heart_rates[2]);
    updateHR(4, info.heart_rates[3]);
    updateHR(5, info.heart_rates[4]);
}

function updateDeath(player, data) {
    var element = document.getElementById(("deathcounter" + player).toString());
    if (element) {
        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].className == "counter") {
                if (data >= 0) {
                    element.childNodes[i].innerHTML = data;
                } else {
                    element.childNodes[i].innerHTML = "";
                }
                break;
            }
        }
    }
    return element;
}
function updateHR(player, data) {
    if (data === undefined){
        data = ""

    }
    var element = document.getElementById(("hr" + player).toString());
    if (element) {
        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].className == "counter") {
                element.childNodes[i].innerHTML = data;
                break;
            }
        }
    }
    return element;
}


var donations_flag = {"message":"2022-04-30T08:37:45.788Z Lahjoituksia luettavana!"}
const fade_minutes = 1.5
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