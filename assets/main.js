const API_URL = "https://seabank-uat.marvy-uat.xyz/api/";
const S3_URL =
  "https://s3.ap-southeast-1.amazonaws.com/octokit-assets/uploads/";
let resultImageURL = null;
let resultType = null;
const isProduction = false;
function findHomeElement() {
  let element = document.getElementById("home");
  return element;
}
function findSceneLoadingElement() {
  let element = document.getElementById("loading");
  return element;
}
function findErrorElement() {
  let element = document.getElementById("error");
  return element;
}
function findShareElement() {
  let element = document.getElementById("share");
  return element;
}
function findBgWrapperElement() {
  let element = document.querySelector(".bg-wrapper");
  return element;
}
function findBlockBtnsWrapperElement() {
  let element = document.querySelector(".block-btns-wrapper");
  return element;
}
function hiddenHome() {
  let element = findHomeElement();
  if (element) element.style.display = "none";
}
function showHome() {
  let element = findHomeElement();
  if (element) element.style.display = "block";
}
function hiddenSceneLoading() {
  let element = findSceneLoadingElement();
  if (element) element.style.display = "none";
}
function showSceneLoading() {
  let element = findSceneLoadingElement();
  if (element) element.style.display = "block";
}
function hiddenErrorElement() {
  let element = findErrorElement();
  if (element) element.style.display = "none";
}
function showErrorElement() {
  let element = findErrorElement();
  if (element) element.style.display = "block";
}
function hiddenShareElement() {
  let element = findShareElement();
  if (element) element.style.display = "none";
}
function showShareElement() {
  let element = findShareElement();
  if (element) element.style.display = "block";
}

function navigatorShareFile(
  url,
  callbackSuccess,
  callbackFailed,
  text,
  fileName
) {
  fetch(url)
    .then((data) => data.blob())
    .then(async (data) => {
      let file = new File([data], `${fileName}`, { type: data.type });
      let files = [file];

      if (navigator.canShare({ files })) {
        try {
          await navigator.share({
            files,
            title: "Video Files",
            text,
          });
          callbackSuccess();
        } catch (error) {
          callbackFailed(error.message);
        }
      } else {
        callbackFailed("Your system doesn't support sharing these files.");
      }
    })
    .catch((err) => {
      callbackFailed("Your system doesn't support sharing these files.");
    })
    .finally(() => {});
}

function handleSaveBtn() {
  let fileName = getFileName();
  downloadFileFromURL(resultUrl, fileName);
}

function getFileName() {
  let fileName = null;
  if (resultType == "image") {
    fileName = "image.png";
  }
  if (resultType == "video") {
    fileName = "video.mp4";
  }
  return fileName;
}
function downloadFileFromURL(url, fileName) {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function handleShareBtn() {
  let fileName = getFileName();
  navigatorShareFile(
    resultUrl,
    () => {},
    () => {},
    "#TheSeABizUltraCash",
    fileName
  );
}

function setResultMedia(url, type) {
  let element = findBgWrapperElement();
  const renderContent = (content) => {
    return `<div id="result-wrapper" style="aspect-ratio: ${window.innerWidth}/${window.innerHeight}">${content}</div>`;
  };
  if (type == "video") {
    element.innerHTML = renderContent(`<video id="result-video" controls>
    <source src="${url}" type="video/mp4">
  </video>`);
  }
  if (type == "image") {
    element.innerHTML = renderContent(
      `<img id="result-image" src="${url}" alt="" />`
    );
  }
}

function getURLFromBlob(blob) {
  return URL.createObjectURL(blob); // Tạo đường dẫn tạm
}

function showBlockBtnsElement() {
  let element = findBlockBtnsWrapperElement();
  if (resultType == "image") {
    element.innerHTML = `<p style="margin-bottom: 2rem">
            Ấn giữ vào tấm hình để tải hình về máy
          </p>

          <img
            onclick="handleShareBtn()"
            class="experience-btn"
            src="assets/images/share-btn.png"
            alt=""
            style="margin-bottom: 2rem"
          />
          <p onclick="hiddenShareElement()">Quay lại</p>`;
  }
  if (resultType == "video") {
    element.innerHTML = `<img
            onclick="handleShareBtn()"
            class="experience-btn"
            src="assets/images/share-btn.png"
            alt=""
          />
          <div class="btns-wrapper">
            <img
              onclick="handleSaveBtn()"
              src="assets/images/save-btn.png"
              alt=""
            />
            <img
              onclick="hiddenShareElement()"
              src="assets/images/back-btn.png"
              alt=""
            />
          </div>`;
  }
}

async function getPresignedUrl(file) {
  const res = await fetch(
    `${API_URL}get-presigned-url?file_type=${file.type}&expiration=60`,
    {
      method: "GET",
    }
  );

  const presignedData = await res.json();
  const { file_key, upload_url } = presignedData.data;
  return { file_key, upload_url };
}

async function uploadSingleMedia(file, s3Url) {
  console.log("file: ", file);
  // const validTypes = [
  //   "image/jpeg",
  //   "image/png",
  //   "image/webp",
  //   "video/mp4",
  //   "video/webm",
  // ];

  // if (!validTypes.includes(file.type)) {
  //   alert("Chỉ được chọn ảnh hoặc video (jpeg/png/webp/mp4/webm)");
  //   return;
  // }

  const uploadRes = await fetch(s3Url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (uploadRes.ok) {
    console.log("Upload thành công!");
  } else {
    console.error("Upload thất bại!");
  }
}

async function handleUploadPresignedS3(file) {
  let { file_key, upload_url } = await getPresignedUrl(file);
  await uploadSingleMedia(file, upload_url);
}
