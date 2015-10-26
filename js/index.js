var wjs = require("wcjs-player");
var player = new wjs("#player").addPlayer({autoplay:true});
var tags = [];

player.onPlaying(function() { 
    console.log("playing"); 

    wjsButton = $(".glyphicon-play");
    if (wjsButton.length != 0) 
        wjsButton.removeClass("glyphicon-play").addClass("glyphicon-pause");
});

player.onPaused(function() { 
    console.log("paused"); 

    wjsButton = $(".glyphicon-pause");
    if (wjsButton.length != 0) 
        wjsButton.removeClass("glyphicon-pause").addClass("glyphicon-play");
});
    
$('#input').on ('change', function (e) {
    console.log (e.target.value);
    player.clearPlaylist();
    player.addPlaylist("file://" + e.target.value);	
    player.play();
});

function backward () {
    player.rate (0.5 * player.rate());
}

function forward () {
    player.rate (2.0 * player.rate());
}

function togglePlay () {
    if (player.playing()) {
        player.pause();
   } else {
        player.rate (1.0);
        player.play();
   }
}

function tagIn () {

}

function tagOut () {

}

function seekToFrame (direction, frames) {
    var frameTime = 1000/player.fps();
    if (player.state() == 'playing') 
        player.pause();

    console.log("time:" + player.time());

    var newTime = (direction === "+" ? (player.time() + frames * frameTime) : (player.time() - frames * frameTime));
    player.time(newTime);

    console.log("after seek, time:" + player.time());
}

