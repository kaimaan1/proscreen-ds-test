
const debug = false;
const networkName = "Outshine"
const campaignName = "Unicef_2025";
const forceAlert = false; //for debugging purposes only



var alertActive = false;
var alertID = null;
const ALERT_STORAGE_KEY = "ukraine_alert_shown_ids";
var adStatus = "skip";  //defalt behaviour
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
         
		//is there an Air Alert onGoing?
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

		if(isRepeat && debug){
			console.log("Alert already shown, skipping playback for ID: "+alertID);
		}

		shouldPlayAlert = alertActive && !isRepeat;
		preloadComplete = true;
		adStatus = shouldPlayAlert ? "alert" : "skip";

		track();

		if(!shouldPlayAlert){
			exitAd();
			return;
		}

		if(debug)BroadSignPlay();
	}
	else if(xobj.status != "200"){
		console.log("loading JSON failed");
		console.log(xobj.readyState, xobj.status);
		triesToLoad++;

		if(triesToLoad < 2){
			loadAlerts();
		}
	}
}

//list of analytics can be found here: http://kallan.campaigns.fi/list.php?campaign=Unicef_2025
function track(){
	var page = campaignName+"/"+networkName+"/"+adStatus;
    console.log(page);

    var url = "https://kallan.campaigns.fi/record.php?path="+page;
    var xobj = new XMLHttpRequest();
    
    xobj.open('POST', url, true); // Replace 'my_data' with the path to your file

    xobj.onreadystatechange = function () {
      console.log(xobj.readyState + " "+xobj.status);

      if (xobj.readyState == 4 && xobj.status == "200") {
        
      }
      else if(xobj.status != "200"){
        
      }
        
    };
    
	if(!debug)xobj.send(null);  
}

function exitAd(){
	if(debug){
		console.log("Ad exited");	
		return;
	}
	window.location.replace("https://cesmes.campaigns.fi/error");
}

function BroadSignPlay(){ //set up
  if(!preloadComplete){
	console.warn("BroadSignPlay called before data ready, exiting.");
	exitAd();
	return;
  }

  setLastAlertId(alertID);
  videoEl.play();
  console.log("video play: "+videoEl.src);
}

window.addEventListener('load', init);

function getLastAlertId(){
	if(typeof localStorage === "undefined"){
		return null;
	}

	try{
		var stored = localStorage.getItem(ALERT_STORAGE_KEY);
		return stored ? stored : null;
	}
	catch(err){
		console.warn("Failed to read last alert id", err);
		return null;
	}
}

function setLastAlertId(id){
	if(!id || typeof localStorage === "undefined"){
		return;
	}

	try{
		localStorage.setItem(ALERT_STORAGE_KEY, id);
	}
	catch(err){
		console.warn("Failed to persist last alert id", err);
	}
}

function clearLastAlertId(){
	if(typeof localStorage === "undefined"){
		return;
	}

	try{
		localStorage.removeItem(ALERT_STORAGE_KEY);
	}
	catch(err){
		console.warn("Failed to clear last alert id", err);
	}
}
