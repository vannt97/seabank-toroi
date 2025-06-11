const API_URL = "https://your-server.com/api/upload";
let resultImageURL = null;
let resultType = null;
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
  if (type == "video") {
    element.innerHTML = `<video id="result-video" controls>
  <source src="${url}" type="video/mp4">
</video>`;
  }
  if (type == "image") {
    element.innerHTML = `<img id="result-image" src="${url}" alt="" />`;
  }
}

function uploadSingleMedia() {
  const input = document.getElementById("mediaInput");
  const file = input.files[0];

  if (!file) {
    alert("Vui lòng chọn ảnh hoặc video!");
    return;
  }

  // Kiểm tra loại file: chỉ chấp nhận ảnh và video phổ biến
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];

  if (!validTypes.includes(file.type)) {
    alert("Chỉ được chọn ảnh hoặc video (jpeg/png/webp/mp4/webm)");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // key 'file' sẽ được xử lý ở server

  fetch("https://your-server.com/api/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw new Error("Upload thất bại");
      return res.json();
    })
    .then((data) => {
      console.log("Upload thành công:", data);
      alert("Upload thành công!");
    })
    .catch((err) => {
      console.error("Lỗi upload:", err);
      alert("Đã xảy ra lỗi khi upload!");
    });
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
