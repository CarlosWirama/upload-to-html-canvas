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

const storedImages = localStorage.getItem("images");
// initiate state
let state = {
  images: [], // array of image object, containing name, data, and tags
  shownIndex: 0,
  dragStartPoint: null,
  selectedTagIndex: null,
};

// don't mutate state anywhere else. use below function instead
function setState(newState) {
  state = { ...state, ...newState };
}

if (storedImages) {
  setState({ images: JSON.parse(storedImages) });
  showImage(state.images.length - 1);
  renderImagesList();

  // show hidden elements
  detailRow.classList.remove("hide");
  deleteShownBtn.classList.remove("hide");
  imagesList.classList.remove("hide");
}

function setImages(images) {
  setState({ images });
  localStorage.setItem("images", JSON.stringify(state.images));
}

function modifyCurrentImage(newImage) {
  const { images, shownIndex: index } = state;

  setImages([
    ...images.slice(0, index),
    {
      ...images[index],
      ...newImage,
    },
    ...images.slice(index + 1),
  ]);
}

function modifyCurrentTag(newTag) {
  const { images, shownIndex, selectedTagIndex } = state;
  const currTags = images[shownIndex].tags;

  const tags = [
    ...currTags.slice(0, selectedTagIndex),
    {
      ...currTags[selectedTagIndex],
      ...newTag,
    },
    ...currTags.slice(selectedTagIndex + 1),
  ];
  modifyCurrentImage({ tags });
}

function deleteImage(index) {
  const { images: prevImages } = state;
  setImages([...prevImages.slice(0, index), ...prevImages.slice(index + 1)]);
  const { images: newImages } = state;
  renderImagesList();

  if (newImages.length === 0) {
    clearTags();
    clearTagsBtn.classList.add("hide");
    clearRectangle(imageCanvas);

    detailRow.classList.add("hide");
    deleteShownBtn.classList.add("hide");
    imagesList.classList.add("hide");
  } else {
    // show the next image in the list.
    // if the deleted image was the latest, show the new latest image
    showImage(index === newImages.length ? index - 1 : index);
  }
}

function addImage(newImage) {
  setImages([...state.images, newImage]);

  // show hidden elements
  detailRow.classList.remove("hide");
  deleteShownBtn.classList.remove("hide");
  imagesList.classList.remove("hide");
}

function drawRectangle(canvasContext, strokeStyle, rect) {
  canvasContext.strokeStyle = strokeStyle;
  canvasContext.beginPath();
  canvasContext.rect(...rect);
  canvasContext.stroke();
}

function clearRectangle(canvas) {
  const { width, height } = canvas;
  canvas.getContext("2d").clearRect(0, 0, width, height);
}

function drawTag(name, index, rect) {
  const strokeStyle = state.selectedTagIndex === index ? "#ff0" : "#888";
  const [x, y, width] = rect;
  tagsContext.fillStyle = strokeStyle;
  tagsContext.fillText(name, x + 2, y + 10, width);
  drawRectangle(tagsContext, strokeStyle, rect);
}

function createTagElement(name, index) {
  // put on tags-list
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

  const tagIndex = currTags.length;
  setState({ selectedTagIndex: tagIndex });
  drawTag(name, tagIndex, rect);
  createTagElement(name, tagIndex);
  clearTagsBtn.classList.remove("hide");
}

function clearTags() {
  clearRectangle(tagsCanvas);
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
  tags.forEach((tag, index) => {
    drawTag(tag.name, index, tag.rect);
    createTagElement(tag.name, index);
  });
}

function drawImage(image) {
  const img = new Image();
  img.onload = function () {
    imageCanvas.width = img.width;
    imageCanvas.height = img.height;
    imageContext.drawImage(img, 0, 0);

    const { width, height } = imageCanvas.getBoundingClientRect();
    selectionCanvas.width = width;
    selectionCanvas.height = height;
    tagsCanvas.width = width;
    tagsCanvas.height = height;

    showTags();

    selectionContext.setLineDash([5, 5]);
  };
  img.src = image;
}

function renderImagesList() {
  // clear list
  while (imagesList.firstChild) {
    imagesList.removeChild(imagesList.firstChild);
  }

  // render each list item
  state.images.forEach((image, index) => {
    const liDeleteBtn = document.createElement("button");
    liDeleteBtn.className = "blue-button";
    liDeleteBtn.innerHTML = "Delete";

    const li = document.createElement("li");
    li.append(image.name, " ", liDeleteBtn);

    liDeleteBtn.onclick = () => deleteImage(index);

    // append image names to images-list
    imagesList.appendChild(li);
  });
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
  renderImagesList();
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
  const { dragStartPoint } = state;
  const strokeStyle = "#ff0000";
  const rect = [
    dragStartPoint.x,
    dragStartPoint.y,
    e.offsetX - dragStartPoint.x,
    e.offsetY - dragStartPoint.y,
  ];

  clearRectangle(selectionCanvas);
  drawRectangle(selectionContext, strokeStyle, rect);
}

function handleMoveTag(e) {
  const { images, shownIndex, selectedTagIndex, dragStartPoint } = state;
  const tag = images[shownIndex].tags[selectedTagIndex];
  const [x, y, w, h] = tag.rect;

  // move tag x and y
  const rect = [
    x + e.offsetX - dragStartPoint.x,
    y + e.offsetY - dragStartPoint.y,
    w,
    h,
  ];

  // technically I can modify the tag object directly, so I don't have to set the state again
  // but to make this consistent, assume I can only modify the state by firing setState
  modifyCurrentTag({ ...tag, rect });

  // update the dragStartPoint to the current mouse position
  handleStartDragging(e);

  showTags();
}

function handleHoverTag(e) {
  const { tags } = state.images[state.shownIndex];

  // check if the pointer is inside a tag, checking from the last tag created
  const foundIndex = tags.findLastIndex((tag, index) => {
    drawTag(tag.name, index, tag.rect);
    return tagsContext.isPointInPath(e.offsetX, e.offsetY);
  });

  // highlight tag
  setState({ selectedTagIndex: foundIndex === -1 ? null : foundIndex });

  showTags();
}

selectionCanvas.onmousemove = (e) => {
  if (state.dragStartPoint === null) {
    handleHoverTag(e);
  } else if (state.selectedTagIndex === null) {
    handleResizeSelection(e);
  } else {
    handleMoveTag(e);
  }
};

function handleStartDragging(e) {
  if (state.images.length) {
    const dragStartPoint = { x: e.offsetX, y: e.offsetY };
    setState({ dragStartPoint });
  }
}

selectionCanvas.onmousedown = handleStartDragging;

function handleFinishSelecting(e) {
  const { x, y } = state.dragStartPoint;
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
  clearRectangle(selectionCanvas);
}

window.onmouseup = (e) => {
  if (state.dragStartPoint) {
    if (state.selectedTagIndex === null) {
      handleFinishSelecting(e);
    }
    setState({ dragStartPoint: null });
  }
};
