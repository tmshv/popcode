let agents = []
let currentAgent = null

class Agent {
  constructor(n, startX, startY){
    this.mass = 1
    this.dump = 1
    this.color = 255
    this.targetX = 0
    this.targetY = 0
    
    this.circles = []
    for(let i=0; i<n; i++){
      const c = {
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
      }
      this.circles.push(c)
    }
  }
  
  calcKinetic() {
    return this.circles.reduce((acc, item) => {
      const s = dist(0, 0, item.vx, item.vy)

      return acc + 0.5 * this.mass * s * s  
    }, 0)
  }
  
  setTarget(x, y){
    this.targetX = x
    this.targetY = y
  }
  
  setDump(value){
    this.dump = value
  }
  
  setColor(value){
    this.color = value
  }
  
  run(){
    const dump = this.dump
    const length = this.circles.length
    for(let i = 0; i<length; i++ ){
      const c = this.circles[i]

      let tx = this.targetX
      let ty = this.targetY
      if(i != 0) {
        const prev = this.circles[i - 1]
        tx = prev.x
        ty = prev.y
      }

      const dx = tx - c.x
      const dy = ty - c.y
      c.vx = dx * dump
      c.vy = dy * dump
      c.x = c.x + c.vx
      c.y = c.y + c.vy

      const s = map(dist(0, 0, dx, dy), 0, 30, 5, 15)
      fill(this.color)
      circle(c.x, c.y, s)
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  
  // const a = new Agent(20, width/2, height/2)
  // a.setTarget(random(width), random(height))
  // a.setDump(0.05)
  // agents.push(a)
}

function draw() {
  // background(255)
  
  const dump = map(
    dist(0, 0, movedX, movedY), 0, 100, 0.05, 0.95
  )
  
  if(currentAgent) {
    currentAgent.setTarget(mouseX, mouseY)
    currentAgent.setDump(dump)
  }
  
  let i = 0
  while(i<agents.length){
    const a = agents[i]
    
    a.run()
    
    const e = a.calcKinetic()
    if(e < 0.001 && a !== currentAgent){
      agents = agents.filter(x => x !== a)
    } else {
      i ++
    }
  }
}

function mousePressed(){
  const a = new Agent(20, mouseX, mouseY)
  // const c = frameCount % 255
  // a.setColor(c)
  agents.push(a)
  
  currentAgent = a
}

function mouseReleased(){
  currentAgent = null
}

function keyPressed(){
  if(keyCode == DELETE){
    agents = []
    background(255)
  }
}

