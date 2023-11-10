/**
 * @author James J Kerr <jamesjoshuakerr@gmail.com>
 * @file Contains all the .js scripts for Profile Pic Maker site
 * @copyright James J Kerr 2023
 */

// Constants

const CANVAS_W = 400,
  CANVAS_H = 400;
const CANVAS = document.getElementById('canvas');
const CONTEXT = CANVAS.getContext('2d');
const IMAGE_FILE_UPLOAD = document.getElementById('image-file-upload');

let image;
let imageDrawn = false;
let mouseDown = false;

const imageXY = {
  x: 0,
  y: 0,
};

const mouseXY = {
  x: -1,
  y: -1,
};

const diffXY = {
  x: 0,
  y: 0,
};

CANVAS.setAttribute('width', CANVAS_W);
CANVAS.setAttribute('height', CANVAS_H);

// Use an offscreen canvas to hold the border image, to efficiently
// repaint the border 'layer' when an file is uploaded or changed
const OFFSCREEN_CANVAS = new OffscreenCanvas(CANVAS_W, CANVAS_H);
const OFFSCREEN_CONTEXT = OFFSCREEN_CANVAS.getContext('2d');
const borderImg = new Image();
borderImg.src = './static/images/border.png';
borderImg.onload = () => {
  OFFSCREEN_CONTEXT.drawImage(borderImg, 0, 0, CANVAS_W, CANVAS_H);
};

// Event Listeners

window.onload = () => {
  drawBackgroundPlaceholder();
  drawBorder();
};

CANVAS.addEventListener('mousedown', function (e) {
  mouseDown = true;
  mouseXY.x = e.offsetX;
  mouseXY.y = e.offsetY;
  updateDiff();
});

CANVAS.addEventListener('mouseup', (e) => {
  mouseDown = false;
});

CANVAS.addEventListener('mousemove', function (e) {
  if (!mouseDown || !imageDrawn) return;
  window.requestAnimationFrame(function () {
    clearCanvas();
    imageXY.x = e.offsetX - diffXY.x;
    imageXY.y = e.offsetY - diffXY.y;
    draw(CONTEXT, image, imageXY.x, imageXY.y);
    drawBorder();
  });
});

IMAGE_FILE_UPLOAD.addEventListener('change', function () {
  reset();
  const file = this.files[0];
  if (!file) return;
  image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    draw(CONTEXT, image);
    URL.revokeObjectURL(file);
  };
  this.value = '';
});

document.getElementById('upload-btn').addEventListener('click', function (e) {
  IMAGE_FILE_UPLOAD.click();
});

document
  .getElementById('clear-btn')
  .addEventListener('click', resetImageUpload);

document.getElementById('save-btn').addEventListener('click', saveImageUpload);

// Functions

function calcAspectRatio(imgWidth, imgHeight) {
  return imgWidth / imgHeight;
}

function calcResolution(imgWidth, imgHeight) {
  const aspectRatio = calcAspectRatio(imgWidth, imgHeight);

  if (aspectRatio === 1) {
    return { w: CANVAS_W, h: CANVAS_H };
  }

  if (aspectRatio > 1) {
    return { w: CANVAS_W * aspectRatio, h: CANVAS_H };
  }

  return { w: CANVAS_W, h: CANVAS_H * aspectRatio };
}

function isValidImage(imgFile) {}

function clearCanvas() {
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  imageDrawn = false;
}

function draw(context, image, x = 0, y = 0, intrinsic = true) {
  clearCanvas();
  intrinsic ? drawIntrinsic(context, image, x, y) : drawCover(context, image);
  drawBorder();
  imageDrawn = true;
}

function drawIntrinsic(context, image, x, y) {
  context.drawImage(image, x, y);
}

function drawCover(context, image) {
  const { height, width } = image;
  const resolution = calcResolution(height, width);
  context.drawImage(image, 0, 0, resolution.x, resolution.y);
}

function reset() {
  imageXY.x = imageXY.y = mouseXY.x = mouseXY.y = diffXY.x = diffXY.y = 0;
  imageDrawn = false;
}

function resetImageUpload() {
  clearCanvas();
  drawBackgroundPlaceholder();
  drawBorder();
}

function saveImageUpload() {
  if (!imageDrawn) return;
  crop();
  const img = CANVAS.toDataURL();
  document.getElementById('preview').src = img;
}

function drawBackgroundPlaceholder() {
  const dimension = 20;
  let offset = 0;
  for (let row = 0; row < 400; row = row + dimension) {
    for (let col = 0; col < 400; col = col + dimension * 2) {
      drawRectangle(CONTEXT, col + offset, row, dimension, dimension);
    }
    offset === 0 ? (offset = dimension) : (offset = 0);
  }
}

function drawBorder() {
  CONTEXT.drawImage(OFFSCREEN_CANVAS, 0, 0, CANVAS_W, CANVAS_H);
}

function drawRectangle(context, x, y, w, h) {
  context.fillStyle = 'rgba(100, 100, 100, 0.2)';
  context.fillRect(x, y, w, h);
}

function crop() {
  const dim = CANVAS_W / 2;
  CONTEXT.globalCompositeOperation = 'destination-in';
  CONTEXT.beginPath();
  CONTEXT.arc(dim, dim, dim, 0, 360);
  CONTEXT.closePath();
  CONTEXT.fillStyle = 'rgba(0, 0, 0, 1)';
  CONTEXT.fill();
  CONTEXT.globalCompositeOperation = 'source-over';
}

function updateDiff() {
  diffXY.x = mouseXY.x - imageXY.x;
  diffXY.y = mouseXY.y - imageXY.y;
}
