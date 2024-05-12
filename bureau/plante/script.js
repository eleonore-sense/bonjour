const numberOfImages = 10;
const imageSources = Array.from(Array(numberOfImages).keys()).map((i) => 'https://source.unsplash.com/collection/9948714?' + i);
// how many times to fire the event per second
const timesPerSecond = .1;

function preloadImages(images) {
  for (i = 0; i < images.length; i++) {
    let l = document.createElement('link')
    l.rel = 'preload'
    l.as = 'image'
    l.href = images[i]
    document.head.appendChild(l);
  }
}

function animate(e) {
  var image= document.createElement('div'); //create a div named bubble
  image.classList.add('trail');
  var size= 60;
  var sizepx= size+'px';
  image.style.transition='2s ease';
  image.style.position= 'fixed';

  image.style.top=  e.pageY - size/2 + 'px';
  image.style.left= e.pageX - size/2 + 'px';

  image.style.width= sizepx;
  image.style.height= sizepx;
    
  image.style.backgroundImage = 'url(https://source.unsplash.com/collection/9948714?'+  Math.floor(Math.random()*numberOfImages) +')';
  image.style.backgroundSize = 'cover';
  image.style.border= 'white 1px solid';

  image.style.pointerEvents= 'none';
  image.style.zIndex= 1;
  document.body.appendChild(image);

  //opacity and blur animations
  window.setTimeout(function() {
    image.style.opacity = 0;
    image.style.filter = 'blur(6px)';
  }, 80);   

  window.setTimeout(function() {
    document.body.removeChild(image);
  }, 2100);
};

window.onload= function() {
preloadImages(imageSources);
var wait = false;

  window.addEventListener('mousemove', function(e) {
    if (!wait) {
      wait = true;
      setTimeout(() => { wait = false }, timesPerSecond * 1000);
      animate(e);
    }
  });
};