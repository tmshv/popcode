let x = 10
let y = 10
let vx = 0
let vy = 0
let ax = 0
let ay = 0
  
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  x = width / 2
  y = height / 2
}

function draw() {
  // background(220);

  const f = 0.5
  force(random(-f, f), random(-f, f))
  
  if (mouseIsPressed) {
    forceToMouse()
  }
  
  vx += ax
  vy += ay
  vx *= 0.98
  vy *= 0.98
  x += vx
  y += vy
  
  translate(x, y)
  drawShape()
  
  ax = 0
  ay = 0
}

function force(vx, vy) {
  ax += vx
  ay += vy
}

function drawShape(){
  strokeWeight(3)
  point(0, 0)
  // rect(0, 0, 50, 50)
  // line(0, 0, 50, 50)
}

function forceToMouse() {
  let dx = mouseX - x
  let dy = mouseY - y
  
  dx *= 0.001
  dy *= 0.001
  
  force(dx, dy)
}
