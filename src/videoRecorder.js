var blob;
var videoURL;
var canvasUnity;
var listAudioElement = []; 
var mediaRecorder = null;
var listLink = [];
var mediaStream = null;
var video = document.querySelector("video");
var containerType = "video/webm";

function NativeSetCanvasRecorder(fileName){
    
    console.log("in: "+_jSonNames);
    var _jSonNames = JSON.parse(fileName)    
    for (let i=0;i<_jSonNames.length;i++) { listLink.push("./StreamingAssets/Audios/"+_jSonNames[i]+".mp3"); }    
    console.log("out: "+listLink);

    canvasUnity = document.querySelector("#unity-canvas");
    listLink.forEach((link, index) => {
        let audioNode = document.createElement("audio");
        audioNode.id = `audio-${index}`;
        audioNode.src  = link;
        audioNode.controls = true;
        audioNode.loop = true;        
        document.body.append(audioNode);
        listAudioElement.push(audioNode);
    });
    listLink.forEach((link, index) =>{        
        if(index == 0) { listAudioElement[index].play; }
        else {
            console.log("sound ",index," checked");
            listAudioElement[index].onended = function() {
                console.log("sound ",index," ended");
                StopAudio(index);
            };
        }
    });
    document.addEventListener(
        "pointerup",
        function () {
            console.log("dsadasdds");
            initAudioPlayPause();
            //listAudioElement[0].play();
        },
        {once: true}
    );
}

function PlayAudio(id){
    if (listAudioElement.length > 0 && id < listAudioElement.length && id >= 0) { listAudioElement[id].play(); }
}
function StopAudio(id){
    if (listAudioElement.length > 0 && id < listAudioElement.length && id >= 0) {
        listAudioElement[id].currentTime = 0;
        listAudioElement[id].pause();
    }
}
 
function getMediaStreams(){
    var videoStream = canvasUnity.captureStream(30);
    var audioStream = initAudioStream();
    var combinedStream = new MediaStream();
    videoStream.getTracks().forEach(track => {
        console.log("tracksVideo", track);
        combinedStream.addTrack(track);
    });        
    audioStream.getTracks().forEach(track => {
        console.log("tracksAudio", track);
        combinedStream.addTrack(track);
    });
    console.log("combinedStream", combinedStream)
    return combinedStream;
}
function initAudioStream(){
    var audioCtx = new AudioContext();                              // create a stream from our AudioContext            
    var dest = audioCtx.createMediaStreamDestination();             // connect our video element's output to the stream
    var listSourceNote = {};
    listLink.forEach((link, index) => {
        listSourceNote[`sourceNode${index}`] = audioCtx.createMediaElementSource(listAudioElement[index]);
        listSourceNote[`sourceNode${index}`].connect(dest);                
        listSourceNote[`sourceNode${index}`].connect(audioCtx.destination);
    })
    console.log("dest stream", dest.stream, listSourceNote)
    return dest.stream;
}
function mediaStart(){
    if(mediaStream == null) { mediaStream = getMediaStreams(); }
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) { var options = {mimeType: 'video/webm;codecs=vp9'}; }
    else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) { var options = {mimeType: 'video/webm;codecs=h264'}; }
    else if (MediaRecorder.isTypeSupported('video/webm')) { var options = {mimeType: 'video/webm'}; }
    else if (MediaRecorder.isTypeSupported('video/mp4')) {//Safari 14.0.2 has an EXPERIMENTAL version of MediaRecorder enabled by default
        containerType = "video/mp4";
        var options = {mimeType: 'video/mp4'};
    }
    mediaRecorder = new MediaRecorder(mediaStream, options);
    mediaRecorder.start();

    var chunks = [];
    mediaRecorder.ondataavailable = function (e) { chunks.push(e.data); };    
    mediaRecorder.onstop = function (e) {
        console.log("Chunks", chunks)
        blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        chunks = [];
        videoURL = URL.createObjectURL(blob);
        //console.log("videoURL", videoURL)
        //video.src = videoURL;
        if (typeof window.NativeSendBlobUrl !== "undefined") { window.NativeSendBlobUrl(videoURL); }//, isShow); }
        else { downloadVideo(); }
    };
}
function mediaStop() {
    console.log("mediaRecorder", mediaRecorder);
    mediaRecorder.stop();
}
function initAudioPlayPause(){
    listLink.forEach((link, index) => {// start the video, pause output to our headphones                
        listAudioElement[index].play();
        listAudioElement[index].pause();
    });
}
function downloadVideo() {
    var link = document.createElement("a");
    switch(containerType){
        case "video/mp4": var name  = "video-recording.mp4" ; break;
        default: var name  = "video-recording.webm" ; break;
    }
    link.download = name;
    link.href = videoURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}
document.addEventListener("visibilitychange", event => {
    if (document.visibilityState === "visible") {//console.log("tab is active")        
        if (listAudioElement.length > 0) {//console.log("listAudioElement is set");
            if (listAudioElement[0].paused) { listAudioElement[0].play(); }//console.log("listAudioElement[0] is paused");
        }
    } else {//console.log("tab is inactive")      
        if (listAudioElement.length > 0) {
            for (let i=0;i<listAudioElement.length;i++) { listAudioElement[i].pause(); }
        }    
    }
});
