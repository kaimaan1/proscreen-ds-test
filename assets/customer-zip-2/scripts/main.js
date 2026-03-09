const debug = false;
const networkName = "Test";
const campaignName = "Unicef_2025";
const forceAlert = false;

var alertActive = false;
var alertID = null;
const ALERT_STORAGE_KEY = "ukraine_alert_shown_ids";
var adStatus = "skip";
var triesToLoad = 0;
var videoEl = null;
var shouldPlayAlert = false;
var preloadComplete = false;

function init(){
	videoEl = document.getElementById("container");
	loadAlerts();
}

function loadAlerts() {
  var url = "https://ukraine-alert.framian-web-services.workers.dev/";

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true);

  xobj.onreadystatechange = function(){
	  handleReadyStateChange(xobj);
  }
  xobj.send(null);
}

function handleReadyStateChange(xobj){
	if (xobj.readyState == 4 && xobj.status == "200") {
    	console.log(xobj.responseText);

    	var json = JSON.parse(xobj.responseText);
		alertActive = json["active"];
		alertID = json["id"].toString();
		console.log("Alert Active: "+alertActive+", Alert ID: "+alertID);

		if(forceAlert){
			alertActive = true;
			clearLastAlertId();
			console.log("Force Alert is ON - forcing alert to play");
		}

		var lastAlertId = alertActive ? getLastAlertId() : null;
		var isRepeat = alertActive && alertID && lastAlertId === alertID;

		shouldPlayAlert = alertActive && !isRepeat;
		preloadComplete = true;
		adStatus = shouldPlayAlert ? "alert" : "skip";

		if(!shouldPlayAlert){
			exitAd();
			return;
		}

		// Auto-play if loaded directly (not via BroadSignPlay/ProscreenPlay)
		playVideo();
	}
	else if(xobj.readyState == 4 && xobj.status != "200"){
		console.log("loading JSON failed");
		triesToLoad++;

		if(triesToLoad < 2){
			loadAlerts();
		} else {
			exitAd();
		}
	}
}

function exitAd(){
	console.log("No alert active, requesting skip");
	// Tell parent slideshow to skip this slide
	try {
		window.parent.postMessage({ type: 'proscreen-skip-slide' }, '*');
	} catch(e) {}
}

function playVideo(){
	if(!preloadComplete) return;
	setLastAlertId(alertID);
	if(videoEl) videoEl.play();
	console.log("video play: "+videoEl.src);
}

function BroadSignPlay(){
	if(!preloadComplete){
		console.warn("BroadSignPlay called before data ready, exiting.");
		exitAd();
		return;
	}
	playVideo();
}

window.ProscreenPlay = function(){
	if(!preloadComplete){
		exitAd();
		return;
	}
	playVideo();
};

window.addEventListener('load', init);

function getLastAlertId(){
	if(typeof localStorage === "undefined") return null;
	try {
		var stored = localStorage.getItem(ALERT_STORAGE_KEY);
		return stored ? stored : null;
	} catch(err) {
		return null;
	}
}

function setLastAlertId(id){
	if(!id || typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(ALERT_STORAGE_KEY, id);
	} catch(err) {}
}

function clearLastAlertId(){
	if(typeof localStorage === "undefined") return;
	try {
		localStorage.removeItem(ALERT_STORAGE_KEY);
	} catch(err) {}
}
