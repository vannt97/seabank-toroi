function UnityOnReady(){
    console.log("Unity đã load xong");    
    document.getElementById("TopElelment").style.display = "none";    
    //if (nativeSide != undefined) { nativeSide.unityDone();}
}
function UnitiSetSound(isOn) {
    console.log("UnitiSetSound", isOn)
    //tắc mở âm thanh trong unity 1 (mở), 0 (tắc)
    if (isOn) { window.UnityGame.SendMessage("GameManager", 'SetSound', 1); }
    else { window.UnityGame.SendMessage("GameManager", 'SetSound', 0); }
}
//đẩy data vô unity
function UnitySendData(data){
    console.log("dataFormNative", data);
    window.UnityGame.SendMessage("GameManager", 'SetDataFromNative', data);            
    // { Token : "", LinkAPI: "", PlayTime: 0, MaxTime: 0, TotalPlay: "" }    
}
//gọi unity mở game
function UnityTriggerPlay(){
    console.log("Trigger play từ native");    
    window.UnityGame.SendMessage("GameManager", 'TriggerNewSession');
}
function UnitySetInstantWin(isInstant){
    //set dạng game intant win trong unity: 1 (instantWin), 0 (thường)
    console.log("SetInstantWin: " + isInstant);    
    window.UnityGame.SendMessage("GameManager", 'SetInstantGame', isInstant);
}
function UnitySetNoLogin(isNoLogin){
    //set dạng game no login no reward trong unity: 1 (no login), 0 (thường)
    console.log("SetNoLogin: " + isNoLogin);    
    window.UnityGame.SendMessage("GameManager", 'SetNoLogin', isNoLogin);
}
//native tắc screenShotPanel
function NativeCloseScreenShotpanel(isScreenShot){
    if (isScreenShot == true) { window.UnityGame.SendMessage("FilterManager", 'OnCloseScreenShotPanel'); }
    else { window.UnityGame.SendMessage("FilterManager", 'OnCloseVideoPanel'); }    
}
function NativeSoundTrigger(numSound) {    
    //if (nativeSide != undefined) { nativeSide.setSound(numSound); }
}
function NativeSendScore(score){
    console.log("Tổng điểm: " + score);
    //if (nativeSide != undefined) { nativeSide.sendScore(score);}
}
function NativeCallHome(){
    console.log("player hết lượt và mở home scene");
    //if (nativeSide != undefined) { nativeSide.backHome(); }
}
function NativeUpdateLife(life){
    console.log("update lượt chơi còn lại của Player: " + life);
    //if (nativeSide != undefined) { nativeSide.setPlayTimeRemain(life); }
}
/*
function NativeSendBase64(data){
    var dataBase64 = "data:image/png;base64," + data;
    console.log("gởi hình screenshot .png cho native. Base64: " + data);   
    //if (nativeSide != undefined) { nativeSide.showPopupPhoto(dataBase64); }
}
function NativeSendBlobUrl(blobUrl , isShow){
    console.log("gởi video blobUrl: " + blobUrl);    
    //if (nativeSide != undefined) { nativeSide.assignURLVideo(blobUrl, isShow); }
}
*/
function NativeShowResultPanel(){
    console.log("mở scene kết quả");        
    //if (nativeSide != undefined) { nativeSide.showFinishScreen(); }
}
//---new----------------------------------------------------------------------------------------------------------
//unity send signal for native to play game
function UnitySendStartGameSignal(){
    //if (nativeSide != undefined) { nativeSide.startApiGame(); }
}
//unity get response from "new-play" api (if native post api success)
function UnityGetPlayResponse(response){
    window.UnityGame.SendMessage("GameManager", 'GetPlayResponseFromNative', JSON.stringify(response));
}
//unity send signature for "new-finish" api
function UnitySendSignature(signature){
    //if (nativeSide != undefined) { nativeSide.finishApiGame(signature); }
}
//unity get signal when native post "new-finish" api success
function NativePostFinishSuccess(){
    window.UnityGame.SendMessage("GameManager", 'PostFinishSuccess');
}
