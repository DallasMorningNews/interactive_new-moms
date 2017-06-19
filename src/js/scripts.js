/* global document: true, window: true */

import $ from 'jquery';

import './furniture';
import './easyslide';

$(document).ready(() => {
/*
********************************************************************************
SETTING UP THE OPENING ANIMATION
********************************************************************************
*/

  // total number of slides
  const MAXSLIDES = 5;
  // css animation speed
  const ANIMATION = 1000;

  let currentSlide = 0;
  let advanceTimer;

  // our counter for our progress bar
  let counter = 0;

  // hides the timer and skip button when the skip button is clicked
  function skipSlides() {
    $('#slide__timer, #slides__skip').fadeOut(ANIMATION);
    $('#story-head').addClass('viewable');
  }

  function advanceSlides() {
    // bump currentSlide count
    currentSlide += 1;

    // if one itertion past the max number of slides, clear the interval and break
    if (currentSlide > MAXSLIDES) {
      clearInterval(advanceTimer);
      return;
    }

    // if on our last slide, fade out the timer
    if (currentSlide === MAXSLIDES) {
      setTimeout(() => { skipSlides(); }, 1000);
      $(window).off('scroll', scrollSkip);
    }

    // if on the first slide, fade the slides container into view
    // else, fade the current slide out, then fade the next slide in
    if (currentSlide === 1) {
      $('#slides').addClass('viewable');
    } else {
      $('.intro-slide').removeClass('viewable');
      setTimeout(() => {
        $(`#slide-${currentSlide}`).addClass('viewable');
      }, ANIMATION);
    }
  }

  // scrollSkip skips the animation when the window is scrolled beyond 200 pixels
  // then clears the advanceTimer interval, then removes itself from the scroll event
  function scrollSkip() {
    // our variable skip point depending on screen size
    const skipPoint = $(window).height() * 0.1;

    if ($(window).scrollTop() > skipPoint) {
      currentSlide = 4;
      advanceSlides();
      clearInterval(advanceTimer);
      setTimeout(() => { skipSlides(); }, 1000);
    }
  }

  $(window).on('scroll', scrollSkip);

  // our initial animation start. 1500 milliseconds after the page loads, advance
  // to our first slide, then set the advanceTimer interval to advance every 6 seconds
  // after that
  setTimeout(() => {
    advanceSlides();
    advanceTimer = setInterval(() => { advanceSlides(); }, 6000);

    // also, start the progress interval to animate our progress through the slides
    const progress = setInterval(() => {
      if (counter < 24000) {
        counter += 50;
        const percentage = (counter / 24000) * 100;
        $('#slide__progress').css('width', `${percentage}%`);
      } else {
        clearInterval(progress);
      }
    }, 50);
  }, 1500);


  // when the intro skip button i sclicked, hide the timer and the button,
  // set the currentSlide counter to 3 so it will advance to the last slide
  // when advanceSlides is called
  $('#slides__skip').click(() => {
    currentSlide = 4;
    advanceSlides();
    setTimeout(() => { skipSlides(); }, 1000);
    $(window).off('scroll', scrollSkip);
  });


/*
********************************************************************************
DISPLAYING AND HIDING THE OVERLAYS
********************************************************************************
*/

  // clicking an lg__item within the grid ...
  $('.lg__item').click(function () {
    // ... gets the index value of the lg__item clicked
    const target = $(this).index();

    // ... adds the no-scroll class to the body, locking down the story text
    $('body').addClass('no-scroll');

    // ... and displays the corresponding lg__overlay
    $(`#lg__overlay-${target}`).fadeIn(500);
  });


  // clicking the close button within the overlay ...
  $('.lg__close').click(() => {
    // ... removes the lg--view class, effectively hiding the overlay
    $('.lg__wrapper').fadeOut(500);

    // ... then unlocks the body text by removing the no-scroll class
    $('body').removeClass('no-scroll');
  });

  $('#portraits').easyslide();
  $('#phone').easyslide();
// -----------------------------------------------------------------------------
});
