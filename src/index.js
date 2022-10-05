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
  document.getElementById("detail-row").classList.remove("hide");
  document.getElementById("delete-shown-btn").classList.remove("hide");
  document.getElementById("images-list").classList.remove("hide");
}

// get canvas context
const canvas = document.getElementById("image-canvas");
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

  const backBtn = document.getElementById("back-btn");
  index === 0
    ? backBtn.classList.add("disabled")
    : backBtn.classList.remove("disabled");

  const nextBtn = document.getElementById("next-btn");
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
const imageLoader = document.getElementById("image-loader");
imageLoader.addEventListener("change", handleImage, false);
