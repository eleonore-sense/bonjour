var x = 1;
// how many times to fire the event per second
const timesPerSecond = 0.01;

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
  var size= 600;
  var sizepx= size+'px';
  image.style.position= 'fixed';

  image.style.top=  e.pageY - size/2 + 'px';
  image.style.left= e.pageX - size/2 + 'px';

  image.style.width= sizepx;
  image.style.height= sizepx;
    
  image.style.backgroundImage = 'url(img/'+x+'.jpg)';
  image.style.backgroundSize = 'contain';
  image.style.backgroundRepeat = 'no-repeat';

  image.style.pointerEvents= 'none';
  image.style.zIndex= 1;
  document.body.appendChild(image);


};

window.onload= function() {

  window.addEventListener('mousemove', function(e) {
      animate(e);
    
  });

  window.addEventListener('click', function(e) {
    if(x>15){
      x=1;
    }else{
            x=x+1;
    var image= document.createElement('div'); //create a div named bubble
  image.classList.add('trail');
  var size= 600;
  var sizepx= size+'px';
  image.style.position= 'fixed';

  image.style.top=  e.pageY - size/2 + 'px';
  image.style.left= e.pageX - size/2 + 'px';

  image.style.width= sizepx;
  image.style.height= sizepx;
    
  image.style.backgroundImage = 'url(img/'+x+'.jpg)';
  image.style.backgroundSize = 'contain';
  image.style.backgroundRepeat = 'no-repeat';

  image.style.pointerEvents= 'none';
  image.style.zIndex= 1;
  document.body.appendChild(image);
    }
  });


};