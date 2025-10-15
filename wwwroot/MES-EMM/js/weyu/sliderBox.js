
const container = document.querySelector(".container");
const sliderWrapper = document.querySelector(".sliderWrapper");
const sliders = document.querySelectorAll(".sliders");
let currentIndex = 0;

function slideNext() {
  currentIndex += 1;
  if (currentIndex >= sliders.length) {
    currentIndex = 0;
  }
  updateSliderPosition();
}

function updateSliderPosition() {
  const translateX = -currentIndex * sliders[0].offsetWidth;
  sliderWrapper.style.transform = `translateX(${translateX}px)`;
}

/* 2nd */
const container2 = document.querySelector(".container2");
const sliderWrapper2 = document.querySelector(".sliderWrapper2");
const sliders2 = document.querySelectorAll(".sliders2");
let currentIndex2 = 0;

function slideNext2() {
  currentIndex2 += 1;
  if (currentIndex2 >= sliders2.length) {
    currentIndex2 = 0;
  }
  updateSliderPosition2();
}

function updateSliderPosition2() {
  const translateX = -currentIndex2 * sliders2[0].offsetWidth;
  sliderWrapper2.style.transform = `translateX(${translateX}px)`;
}