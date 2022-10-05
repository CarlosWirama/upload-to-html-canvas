// DOM getters
const deleteShownBtn = document.getElementById("delete-shown-btn");
const imagesList = document.getElementById("images-list");
const detailRow = document.getElementById("detail-row");
const canvas = document.getElementById("image-canvas");
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-btn");
const imageLoader = document.getElementById("image-loader");

// initiate state
let state = {
  images: [], // array of image object, containing name, data, and tags
  shownIndex: 0,
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

// get canvas context
const ctx = canvas.getContext("2d");

function drawImage(image) {
  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
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
imageLoader.addEventListener("change", handleImage, false);

// button listeners
backBtn.addEventListener("click", () => {
  if (state.shownIndex > 0) {
    showImage(state.shownIndex - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (state.shownIndex < state.images.length - 1) {
    showImage(state.shownIndex + 1);
  }
});
