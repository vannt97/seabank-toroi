import {
  HandLandmarker,
  FilesetResolver,
} from "https://client-resource.marvyco.com/service/mediapipe/tasks-vision@0.10.0.js";
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let isSent = false;
let isLandMarkCreated = false;
let video;
let isVideoTabCreated = false;
let dataToUnity = {
  crossA: { x: 0.0, y: 0.0, z: 0.0 },
  crossB: { x: 0.0, y: 0.0, z: 0.0 },
  wrist: { x: 0.0, y: 0.0, z: 0.0 },
  upVector: { x: 0.0, y: 0.0, z: 0.0 },
  scaleRate: 0.0,
  Left: 0,
};
let isReady = false;

// Before we can use HandLandmarker class we must wait for it to finish loading. Machine Learning models can be large and take a moment to get everything needed to run.
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://client-resource.marvyco.com/service/mediapipe/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://client-resource.marvyco.com/service/mediapipe/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 1,
  });
};
createHandLandmarker();
waitForExisting();

function waitForExisting() {
  var timeOut = setTimeout(function () {
    if (handLandmarker == undefined) {
      console.log("Wait for handlandmark");
      waitForExisting();
    } //console.log("wait for HAND LAND MARK");
    else if (isVideoTabCreated == false) {
      if (window.videoElement != undefined) {
        enableWebcamButton = document.getElementById("TopElelment");
        video = window.videoElement;
        isVideoTabCreated = true;
        hiddenSceneLoading();
      }
      console.log("Wait for video tab");
      waitForExisting();
    } //console.log("wait for CAM");
    else {
      clearTimeout(timeOut);
      isLandMarkCreated = true;
      enableCam();
    }
  }, 100);
}

let _isPredictionReady = false;
let isTrackDetected = false;
let trackCount = 0;
let isMobile = false;

function enableCam() {
  if (!handLandmarker) {
    return;
  } //console.log("Wait! objectDetector not loaded yet.");
  window.AddProgress(); //************************************************************* */
  predictWebcam();
  enableWebcamButton.style.display = "none";
  isReady = true;
}
let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await handLandmarker.setOptions({ runningMode: "VIDEO" });
    return;
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = handLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.landmarks) {
    if (results.landmarks.length > 0) {
      if (_isPredictionReady == false) {
        _isPredictionReady = true;
      }
      dataToUnity.wrist.x = FlipHorizontal(
        (results.landmarks[0][0].x +
          results.landmarks[0][1].x +
          results.landmarks[0][5].x +
          results.landmarks[0][17].x) /
          4.0
      ); // * dataScreen.width;
      dataToUnity.wrist.y =
        (results.landmarks[0][0].y +
          results.landmarks[0][1].y +
          results.landmarks[0][5].y +
          results.landmarks[0][17].y) /
        4.0;
      dataToUnity.wrist.z =
        (results.landmarks[0][0].z +
          results.landmarks[0][1].z +
          results.landmarks[0][5].z +
          results.landmarks[0][17].z) /
        4.0;

      dataToUnity.crossA.x =
        (FlipHorizontal(results.landmarks[0][5].x) -
          FlipHorizontal(results.landmarks[0][0].x)) *
        video.videoWidth;
      dataToUnity.crossA.y =
        (results.landmarks[0][5].y - results.landmarks[0][0].y) *
        video.videoHeight;
      dataToUnity.crossA.z =
        (results.landmarks[0][5].z - results.landmarks[0][0].z) *
        video.videoWidth;

      dataToUnity.crossB.x =
        (FlipHorizontal(results.landmarks[0][17].x) -
          FlipHorizontal(results.landmarks[0][1].x)) *
        video.videoWidth;
      dataToUnity.crossB.y =
        (results.landmarks[0][17].y - results.landmarks[0][1].y) *
        video.videoHeight;
      dataToUnity.crossB.z =
        (results.landmarks[0][17].z - results.landmarks[0][1].z) *
        video.videoWidth;

      dataToUnity.upVector.x =
        (FlipHorizontal(results.landmarks[0][9].x) -
          FlipHorizontal(results.landmarks[0][0].x)) *
        video.videoWidth;
      dataToUnity.upVector.y =
        (results.landmarks[0][9].y - results.landmarks[0][0].y) *
        video.videoHeight;
      dataToUnity.upVector.z =
        (results.landmarks[0][9].z - results.landmarks[0][0].z) *
        video.videoWidth;

      dataToUnity.scaleRate =
        Math.sqrt(
          dataToUnity.upVector.x * dataToUnity.upVector.x +
            dataToUnity.upVector.y * dataToUnity.upVector.y +
            dataToUnity.upVector.z * dataToUnity.upVector.z
        ) / video.videoWidth;

      if (results.handednesses[0][0].categoryName === "Left") {
        dataToUnity.Left = 0;
      } //{ dataToUnity.Left = isMobile ? 0 : 1; }
      else {
        dataToUnity.Left = 1;
      } //{ dataToUnity.Left = dataToUnity.Left = isMobile ? 1 : 0; }

      if (window.UnityGame != undefined) {
        window.UnityGame.SendMessage(
          "FilterManager",
          "StreamData",
          JSON.stringify(dataToUnity)
        ); //console.log(results.handednesses[0][0].categoryName);
        isSent = true;
      }
      trackCount = results.landmarks.length;
    } else {
      trackCount = 0;
    }
  }
  if (trackCount > 0) {
    if (isTrackDetected == false) {
      isTrackDetected = true;
      window.UnityGame.SendMessage(
        "FilterManager",
        "UpdateTrackCount",
        trackCount
      );
    }
  } else {
    if (isTrackDetected == true) {
      isTrackDetected = false;
      window.UnityGame.SendMessage(
        "FilterManager",
        "UpdateTrackCount",
        trackCount
      );
    }
  }
}
function CheckMobile() {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

isMobile = CheckMobile();
function FlipHorizontal(horizonValue) {
  return 1.0 - horizonValue;
}

export function sampleFunction() {
  /*console.log("log from module acript.js*********");*/
}
export function RequestPrediction() {
  if (isReady) {
    predictWebcam();
  } else {
    console.log("tracking system is not ready");
  }
}
