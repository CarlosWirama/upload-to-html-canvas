// Constants
const MINIMUM_SELECTION_WIDTH = 25;
const MINIMUM_SELECTION_HEIGHT = 25;

// DOM getters
const clearTagsBtn = document.getElementById("clear-tags-btn");
const deleteShownBtn = document.getElementById("delete-shown-btn");
const tagsList = document.getElementById("tags-list");
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

function modifyCurrentImage(newImage) {
  const { images, shownIndex: index } = state;
  setState({
    images: [
      ...images.slice(0, index),
      {
        ...images[index],
        ...newImage,
      },
      ...images.slice(index + 1),
    ],
  });
}

function deleteImage(index) {
  const { images: prevImages } = state;
  setState({
    images: [...prevImages.slice(0, index), ...prevImages.slice(index + 1)],
  });
  const { images: newImages } = state;
  console.log({ index, prevImages, newImages });
  document.querySelector(`#images-list :nth-child(${index + 1})`).remove();

  if (newImages.length === 0) {
    clearTags();
    clearRectangle(imageContext);

    detailRow.classList.add("hide");
    deleteShownBtn.classList.add("hide");
    imagesList.classList.add("hide");
  } else {
    // show the next image in the list.
    // if the deleted image was the latest, show the new latest image
    showImage(index === newImages.length ? index - 1 : index);
  }
  console.log(newImages, index);
}

function addImage(newImage) {
  // show hidden elements
  detailRow.classList.remove("hide");
  deleteShownBtn.classList.remove("hide");
  imagesList.classList.remove("hide");

  const liDeleteBtn = document.createElement("button");
  liDeleteBtn.className = "li-delete-btn blue-button";
  liDeleteBtn.innerHTML = "Delete";

  const li = document.createElement("li");
  li.append(newImage.name, " ", liDeleteBtn);

  const newIndex = state.images.length;
  liDeleteBtn.onclick = () => {
    deleteImage(newIndex);
  };

  // append image names to images-list
  imagesList.appendChild(li);

  setState({
    images: [...state.images, newImage],
  });
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

function drawTag(name, index, rect) {
  const strokeStyle = "#888";
  tagsContext.fillStyle = "#888";
  const [x, y, width] = rect;
  tagsContext.fillText(name, x + 2, y + 10, width);
  drawRectangle(tagsContext, strokeStyle, rect);

  // put on tags-list
  // NOTE: this is not ideal, as we're adding a side effect to "drawTag"
  // but since we're always do the code below everytime we call drawTag
  // and I don't want this to be skipped, I'm putting here for now.
  // In the future, we can wrap drawTag and below function to a separate function
  // and call that new function instead
  const deleteTagBtn = document.createElement("button");
  deleteTagBtn.className = "blue-button";
  deleteTagBtn.innerHTML = "Delete";

  const li = document.createElement("li");
  li.append(name, " ", deleteTagBtn);

  deleteTagBtn.onclick = () => {
    tagsList.removeChild(li);

    const prevTags = state.images[state.shownIndex].tags;
    const tags = [...prevTags.slice(0, index), ...prevTags.slice(index + 1)];
    modifyCurrentImage({ tags });
    showTags();
  };

  tagsList.appendChild(li);
}

function addTag(name, rect) {
  const { images, shownIndex } = state;
  const currTags = images[shownIndex].tags;

  const tags = [...currTags, { name, rect }];
  modifyCurrentImage({ tags });

  drawTag(name, currTags.length, rect);
  clearTagsBtn.classList.remove("hide");
}

function clearTags() {
  clearRectangle(tagsContext);
  while (tagsList.firstChild) {
    tagsList.removeChild(tagsList.firstChild);
  }
}

clearTagsBtn.onclick = () => {
  clearTags();
  clearTagsBtn.classList.add("hide");
  modifyCurrentImage({ tags: [] });
};

function showTags() {
  clearTags();
  const tags = state.images[state.shownIndex]?.tags || [];
  tags.forEach((tag, index) => drawTag(tag.name, index, tag.rect));
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

    showTags();

    selectionContext.setLineDash([5, 5]);
  };
  img.src = image;
}

function showImage(index) {
  const { images } = state;
  const { name, data } = images[index];

  setState({ shownIndex: index });

  drawImage(data);

  const paginationText = `${index + 1} of ${images.length}`;
  document.getElementById("image-title").setHTML(name);
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

deleteShownBtn.onclick = () => {
  deleteImage(state.shownIndex);
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
  const { x, y } = state.selectionStartPoint;
  const width = e.offsetX - x;
  const height = e.offsetY - y;

  if (width >= MINIMUM_SELECTION_WIDTH && height >= MINIMUM_SELECTION_HEIGHT) {
    const newTagIndex = state.images[state.shownIndex].tags.length;
    const rect = [x, y, width, height];
    const tagName = prompt(
      "Give your new tag a name",
      `Tag ${newTagIndex + 1}`
    );
    if (tagName !== null) {
      addTag(tagName, rect);
    }
  }
  clearRectangle(selectionContext);
  setState({ selectionStartPoint: null });
}

window.onmouseup = (e) => {
  if (state.selectionStartPoint) {
    handleFinishSelecting(e);
  }
};
