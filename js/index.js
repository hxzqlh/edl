var wjs = require("wcjs-player");
var player = new wjs("#player").addPlayer({autoplay:true});
var tags = [];

player.onOpening (function () {
    console.log ("opening: fps " + player.fps().toFixed(2));
    $("#trackFrameRate").html(player.fps().toFixed(2)).removeClass("disabled btn-danger").addClass("btn-success");
    tags = [];
});

player.onPlaying(function() { 
    console.log("playing"); 

    wjsButton = $(".icon-play");
    if (wjsButton.length != 0) 
        wjsButton.removeClass("icon-play").addClass("icon-pause");
});

player.onPaused(function() { 
    console.log("paused"); 

    wjsButton = $(".icon-pause");
    if (wjsButton.length != 0) 
        wjsButton.removeClass("icon-pause").addClass("icon-play");
});

player.onTime(function() { 
    triggerFrameUpdate ();
});
    
$('#input').on ('change', function (e) {
    console.log (e.target.value);
    player.clearPlaylist();
    player.addPlaylist("file://" + e.target.value);	
    player.play();
});

$("#seekBackward").bind("click", function(e) {
    e.preventDefault();
    seekToFrame ('-', $("#seekBackwardOver button.active").html());
});

$("#seekForward").bind("click", function(e) {
    e.preventDefault();
    seekToFrame ('+', $("#seekForwardOver button.active").html());
});

function triggerFrameUpdate () {
    var curFrame = getCurFrame(); 
    $("#trackSMPTE").html(toSMPTE(curFrame, player.fps())).removeClass("disabled btn-danger").addClass("btn-success");
    $("#trackTime").html(player.time()).removeClass("disabled btn-danger").addClass("btn-success");
    $("#trackFrames").html(curFrame).removeClass("disabled btn-danger").addClass("btn-success")
}

function getCurFrame () {
    var frameTime = parseInt (1000/player.fps());
    return Math.floor (player.time() / frameTime);
}

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

function seekToFrame (direction, frames) {
    var frameTime = parseInt (1000/player.fps());
    if (player.state() == 'playing') 
        player.pause();

    console.log("time:" + player.time());

    var newTime = (direction === "+" ? (player.time() + frames * frameTime) : (player.time() - frames * frameTime));
    newTime = newTime < 0 ? 0 : newTime;
    newTime = newTime > player.length () ?  player.length () : newTime;
    player.time(newTime);
    triggerFrameUpdate ();

    console.log("after seek " + direction + frames + " frames, time:" + player.time());
}


// frame --> hh:mm:ss:ff
function toSMPTE (frame, fps) {
    var frameNumber = Number(frame);
    function wrap(n) { return ((n < 10) ? '0' + n : n); }
    var _hour = ((fps * 60) * 60), _minute = (fps * 60);
    var _hours = (frameNumber / _hour).toFixed(0);
    var _minutes = (Number((frameNumber / _minute).toString().split('.')[0]) % 60);
    var _seconds = (Number((frameNumber / fps).toString().split('.')[0]) % 60);
    var SMPTE = (wrap(_hours) + ':' + wrap(_minutes) + ':' + wrap(_seconds) + ':' 
            + wrap((frameNumber % fps).toFixed(0)));
    return SMPTE;
}

$("#tag").bind("click", function(e) {
    e.preventDefault();
    addTag ();
});

function addTag () {
    if (player.itemCount()<1) return;

    if (player.state() == 'playing') player.pause();

    $('#myModal').modal("show");
}

$("#screenShot").bind("click", function(e) {
    e.preventDefault();
    getScreenShot ();
});

$("#saveTag").bind("click", function(e) {
    e.preventDefault();
    var curFrame = getCurFrame ();
    var fps = player.fps();
    var timeStamp = toSMPTE(curFrame, fps);

    var remark = $('.modal-body input[type="text"]')[0].value;
    var decision = $('.modal-body input[name="decision"]:checked').val();
    remark = !remark ? "" : remark;
    decision = !decision ? 0: decision;
    
    var c = $("#videoFrameTable tbody tr:last").clone().show();
    c.find("td").each(function() {
        var a = $(this);
        if(a.hasClass("frameID")) a.html(1 + Number(a.html()));
        if(a.hasClass("frameSMPTE")) a.html(timeStamp);
        if(a.hasClass("frameDecision")) a.html(decision);
        if(a.hasClass("frameMark")) a.html(remark);
    });
    $("#videoFrameTable tbody").append(c);
    $("#videoFrameResults").fadeIn("500");

    var tag = {
        "timeStamp": timeStamp,
        "decidion": decision,
        "mark": remark
    };
    tags.push(tag);
    
    resetDialog ();
    $('#myModal').modal("hide");
});

function resetDialog () {
    $('.modal-body input[type="text"]')[0].value = '';
    $('.modal-body input[name="decision"]').each (function (){
        this.checked = false;
    });
}

$("#export").bind("click", function(e) {
    e.preventDefault();
    exportEdl ();
});

function exportEdl () {
    var chooser = $("#saveEdl");
    chooser.unbind ('change');
    chooser.change (function(evt) {  
        var jsonStr = JSON.stringify (tags);
        console.log (this.value);
        var fs = require ('fs');
        fs.writeFile (this.value, jsonStr, function(err) {
            if(err) {
                console.log ("error:" + err);
            }
        });
    });
    
    chooser.trigger ('click');
}

//TODO: screenshot is black, need fixed
function getScreenShot () {
    var video = $('.wcp-canvas')[0];
    var curFrame = getCurFrame ();
    var fps = player.fps();
    var c = toSMPTE(curFrame, fps);
    var width = player.width();
    var height = player.height();
    var a = document.createElement("canvas");
    var ctx = a.getContext("2d");
    a.width = width;
    a.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    var url = a.toDataURL("image/jpeg");
    $("#videoFrameScreenshots ul").append(
        '<li style="display:none;">' + 
            '<a href="javascript:void(0);" class="thumbnail"><img src="' + url + '" alt="' + c + '"/><p style="text-align:center">' + c + '</p>' + 
            '</a>' + 
        '</li>').after(function() {
            $("#videoFrameScreenshots li").fadeIn("500")
        });
    $("#videoFrameScreenshots").fadeIn("500");
}
