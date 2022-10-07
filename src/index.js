// DOM getters
const deleteShownBtn = document.getElementById("delete-shown-btn");
const imagesList = document.getElementById("images-list");
const detailRow = document.getElementById("detail-row");
const imageCanvas = document.getElementById("image-canvas");
const tagsCanvas = document.getElementById("tags-canvas");
const selectionCanvas = document.getElementById("selection-canvas");
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-btn");
const imageLoader = document.getElementById("image-loader");

// get canvas context
const imageContext = imageCanvas.getContext("2d");
const tagsContext = tagsCanvas.getContext("2d");
const selectionContext = selectionCanvas.getContext("2d");

// initiate state
let state = {
  images: [], // array of image object, containing name, data, and tags
  shownIndex: 0,
  selectionStartPoint: null,
};

// don't mutate state anywhere else. use below function instead
function setState(newState) {
  state = { ...state, ...newState };
}

function addImage(newImage) {
  setState({
    images: [...state.images, newImage],
  });

  // show hidden elements
  detailRow.classList.remove("hide");
  deleteShownBtn.classList.remove("hide");
  imagesList.classList.remove("hide");

  const liDeleteBtn = document.createElement("button");
  liDeleteBtn.className = "li-delete-btn blue-button";
  liDeleteBtn.innerHTML = "Delete";

  // append image names to images-list
  imagesList
    .appendChild(document.createElement("li"))
    .append(newImage.name, " ", liDeleteBtn);
}

function drawRectangle(canvasContext, strokeStyle, rect) {
  canvasContext.strokeStyle = strokeStyle;
  canvasContext.beginPath();
  canvasContext.rect(...rect);
  canvasContext.stroke();
}

function clearRectangle(canvasContext) {
  const { width, height } = selectionCanvas;
  canvasContext.clearRect(0, 0, width, height);
}

function drawTag(name, rect) {
  const strokeStyle = "#888";
  drawRectangle(tagsContext, strokeStyle, rect);
}

function addTag(name, e) {
  const { images, selectionStartPoint: startPoint, shownIndex: index } = state;
  const prevImage = images[index];
  const rect = [
    startPoint.x,
    startPoint.y,
    e.offsetX - startPoint.x,
    e.offsetY - startPoint.y,
  ];

  const updatedImage = {
    ...prevImage,
    tags: [...prevImage.tags, { name, rect }],
  };

  setState({
    images: [
      ...images.slice(0, index),
      updatedImage,
      ...images.slice(index + 1),
    ],
  });
  drawTag(name, rect);
}

function drawImage(image) {
  const img = new Image();
  img.onload = function () {
    imageCanvas.width = img.width;
    imageCanvas.height = img.height;
    imageContext.drawImage(img, 0, 0);

    const boundingClientRect = imageCanvas.getBoundingClientRect();
    selectionCanvas.width = boundingClientRect.width;
    selectionCanvas.height = boundingClientRect.height;
    tagsCanvas.width = boundingClientRect.width;
    tagsCanvas.height = boundingClientRect.height;

    selectionContext.setLineDash([5, 5]);
  };
  img.src = image;
}

function showImage(index) {
  const { images } = state;

  setState({ shownIndex: index });

  drawImage(images[index].data);

  const paginationText = `${index + 1} of ${images.length}`;
  document.getElementById("image-title").setHTML(images[index].name);
  document.getElementById("pagination").setHTML(paginationText);

  index === 0
    ? backBtn.classList.add("disabled")
    : backBtn.classList.remove("disabled");

  index === images.length - 1
    ? nextBtn.classList.add("disabled")
    : nextBtn.classList.remove("disabled");
}

async function handleImage(e) {
  // convert FileList to array
  const files = Array.prototype.slice.call(e.target.files);

  // read as data URL
  const imageData = await Promise.all(
    files.map((file) => {
      const reader = new FileReader();
      return new Promise(function (resolve) {
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    })
  );

  // add image data to state
  imageData.forEach((data, index) =>
    addImage({
      data,
      name: files[index].name,
      tags: [],
    })
  );

  // show the last uploaded image
  showImage(state.images.length - 1);
}

// register handleImage listener
imageLoader.onchange = handleImage;

backBtn.onclick = () => {
  if (state.shownIndex > 0) {
    showImage(state.shownIndex - 1);
  }
};

nextBtn.onclick = () => {
  if (state.shownIndex < state.images.length - 1) {
    showImage(state.shownIndex + 1);
  }
};

// Selection

function handleResizeSelection(e) {
  const { selectionStartPoint: startPoint } = state;
  const strokeStyle = "#ff0000";
  const rect = [
    startPoint.x,
    startPoint.y,
    e.offsetX - startPoint.x,
    e.offsetY - startPoint.y,
  ];

  clearRectangle(selectionContext);
  drawRectangle(selectionContext, strokeStyle, rect);
}

function handleStartSelecting(e) {
  if (state.images.length) {
    const origin = { x: e.offsetX, y: e.offsetY };
    setState({ selectionStartPoint: origin });
  }
}

selectionCanvas.onmousemove = (e) => {
  if (state.selectionStartPoint) {
    handleResizeSelection(e);
  }
};

selectionCanvas.onmousedown = handleStartSelecting;

function handleFinishSelecting(e) {
  const newTagIndex = 0;
  const tagName = prompt("Give your new tag a name", `Tag ${newTagIndex + 1}`);
  if (tagName !== null) {
    addTag(tagName, e);
  }
  clearRectangle(selectionContext);
  setState({ selectionStartPoint: null });
}

window.onmouseup = (e) => {
  if (state.selectionStartPoint) {
    handleFinishSelecting(e);
  }
};
