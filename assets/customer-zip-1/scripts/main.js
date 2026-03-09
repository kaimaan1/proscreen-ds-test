var videoEl = null;

function init(){
	videoEl = document.getElementById("container");
	videoEl.play();
}

// Support both BroadSign and Proscreen callbacks
function BroadSignPlay(){
	if(videoEl) videoEl.play();
}

window.ProscreenPlay = function(){
	if(videoEl) videoEl.play();
};

window.addEventListener('load', init);
