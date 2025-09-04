//REF
//https://www.facebook.com/worldwillchange/posts/978697762200253
//http://jsfiddle.net/hashem/Lw41nwx7

//TODO : draw a little circle and animate

var unit = 100,
    canvas, context, canvas2, context2,
    height, width, xAxis, yAxis,
    draw;

/**
 * Init function.
 * 
 * Initialize variables and begin the animation.
 */
function init() {
    
    canvas = document.getElementById("canvas");
    document.body.style.background = '#000';

    canvas.width = 400;
    canvas.height = 400;
    
    context = canvas.getContext("2d");
    context.font = '18px sans-serif';
    context.strokeStyle = '#FFF';
    context.lineJoin = 'round';
    context.lineWidth = 2;
    
    height = canvas.height;
    width = canvas.width;
    
    xAxis = Math.floor(height/2);
    yAxis = Math.floor(width/3);
    draw();
}

/**
 * Function to draw axes
 */
function drawAxes() {
    
    // Draw X and Y axes
    context.moveTo(0, xAxis);
    context.lineTo(width, xAxis);
    context.moveTo(yAxis, 0);
    context.lineTo(yAxis, height);
    
}

/*
 * Function to draw circle
 */
function drawCircle(a) {
    context.moveTo(yAxis+unit, xAxis);
    context.arc(yAxis, xAxis, unit*a, 0, 2*Math.PI, false);
}

function draw(){
    // Clear the canvas
    context.clearRect(0, 0, width, height);
    // Draw the axes in their own path
  
    context.beginPath();
    drawAxes();
    context.stroke();
  
    context.beginPath();
    drawCircle(1);
    drawSine(draw.t);
    context.stroke();
    // Draw the arrow at time t in its own path.
    drawArrow(draw.t);
    
    // Restore original styles
    context.restore();
// Update the time and draw again
    draw.seconds = draw.seconds - .007;
    draw.t = draw.seconds*Math.PI;
    setTimeout(draw, 35);
};
draw.seconds = 0;
draw.t = 0;

/**
 * Function to draw sine
 * 
 * The sine curve is drawn in 10px segments starting at the origin. 
 */
function drawSine(t) {

    // Set the initial x and y, starting at 0,0 and translating to the origin on
    // the canvas.
    var x = t;
    var y = Math.sin(x);
    context.moveTo(yAxis+150, unit*y+xAxis);
 
    
    // Loop to draw segments
    for (i = yAxis; i <= width; i += 10) {
        x = t+(-yAxis+i)/unit;
        y = Math.sin(x);
        context.lineTo(i+150, unit*y+xAxis);     
    }
}

/**
 * Function to draw arrow
 */
function drawArrow(t) {
    
    // Cache position of arrow on the circle
    var x = yAxis+unit*Math.cos(t);
    var y = xAxis+unit*Math.sin(t);
    
    // Draw the arrow line
    context.beginPath();
    context.moveTo(yAxis, xAxis);
    context.lineTo(x, y);
    context.stroke();
    
    // Draw the arrow bead
    context.beginPath();
    context.arc(x, y, 5, 0, 2*Math.PI, false);
    
    context.fill();
    context.stroke();
  
    // Draw dashed line to yAxis
    context.beginPath();
    
    var direction = (Math.cos(t) < 0) ? 1 : 1;
    var start = (direction==-1) ? -5 : 0;
    for (var i = x;  direction*i < 150+direction*yAxis-5; i = i+direction*10) {
        context.moveTo(i+direction*5, y);
        context.lineTo(i+direction*10, y);
    }
    
    context.stroke();
    
    // Draw yAxis bead
    context.beginPath();
    context.arc(yAxis+150, y, 5, 0, 2*Math.PI, false);
    context.fill();
    context.stroke();
}
init();