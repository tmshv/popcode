let agents = []

class Agent {
    constructor(loc, angle, fill) {
        this.loc = loc
        this.angle = angle
        this.fill = fill

        this.ttl = 1
    }

    run() {
        const vx = Math.cos(this.angle)
        const vy = Math.sin(this.angle)
        const f = 1
        this.loc.x += vx * f
        this.loc.y += vy * f

        this.ttl -= .1
    }

    draw() {
        const s = 3 - (this.ttl * 2)

        translate(this.loc.x, this.loc.y)
        rotate(this.angle)
        this.fill(this)
        noStroke()
        ellipse(0, 0, s, s)
    }
}

function setup() {
    createCanvas(300, 300)
    // createCanvas(windowWidth, windowHeight)
    // pixelDensity(1)

    // background(0);
    background(255);

    // const f = (x, y) => {
    //     createAgent(x, y)
    // }

    // grid(f, ...layout(30))
}

function renderNoise(sx, sy, sz) {
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            const z = frameCount * sz
            const n = noise(x * sx, y * sy, z)
            const c = map(n, 0, 1, 0, 256)

            stroke(c)
            point(x, y)
        }   
    }
}

function createAgent(x, y) {
    const a = Math.random() * Math.PI * 2
    const v = createVector(x, y)
    const f = random([
        a => {
            const r = map(a.ttl, 0, 1, 0, 150)
            fill(255, r, r)
        },
        a => {
            const r = map(a.ttl, 0, 1, 0, 255)
            const b = map(a.ttl, 1, 0, 0, 255)
            fill(r, 255, b)
        },
        a => {
            const r = map(a.ttl, 0, 1, 0, 255)
            const g = map(a.ttl, 1, 0, 0, 255)
            fill(r, g, 255)
        },
        a => {
            const r = map(a.ttl, 0, 1, 0, 255)
            const g = map(a.ttl, 1, 0, 0, 255)
            const b = map(a.ttl, 1, 0, 255, 0)
            fill(r, g, b)
        },
    ])

    agents.push(new Agent(v, a, f))
}

function draw() {
    background(255);

    // renderNoise(0.025, 0.025, 0.05)
    
    // const gridSize = 10
    // for (let x = 0; x < width; x+=gridSize){
    //     for (let y = 0; y < height; y+=gridSize){
    //         drawAgent1(x, y)  
    //     }
    // }
            
    const radius = width / 2
    const centerX = width / 2
    const centerY = height / 2
    translate(centerX, centerY)
    randomSeed(0)
    for (let i = 0; i < 10000; i++){
        const a = random(0, TWO_PI)
        const r = random(0, radius)
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r

        drawAgent2(x, y)
    }
}

function drawAgent1(x, y) {
    const z = frameCount * 0.05
    const s = 0.05
    const n = noise(x * s, y * s, z)
    const v = map(n, 0, 1, 0, 30)

    const a = map(n, 0, 1, 0, TWO_PI)

    const vx = x + Math.cos(a) * v
    const vy = y + Math.sin(a) * v

    stroke(100)
    line(x, y, vx, vy)
}

function drawAgent2(x, y) {
    const radius = width / 2
    const d = Math.sqrt(x*x + y*y)

    const L = 100
    const scale = 0.01
    const t = frameCount * 0.005
    const z = Math.cos(TWO_PI * t)

    const mx = mouseX / 250
    const my = mouseY / 250

    const nx = noise(mx + 000 + x*scale, y*scale, z)
    const ny = noise(my + 100 + x*scale, y*scale, z)

    const intensity = pow(map(d, 0, radius, 1, 0), 0.75)
    const vx = x + intensity * L * map(nx, 0, 1, -1, 1)
    const vy = y + intensity * L * map(ny, 0, 1, -1, 1)

    // const vx = x + intensity * L * (float) noise.eval(scale*x, scale*y, R*cos(TWO_PI*t), R*sin(TWO_PI*t));
    // const vy = y + intensity*L*(float)noise.eval(100+scale*x,scale*y,R*cos(TWO_PI*t),R*sin(TWO_PI*t));

    stroke(100)
    // line(x, y, vx, vy)
    point(vx, vy)
}

function layout(m) {
    const sx = Math.round(width / m)
    const sy = Math.round(height / m)
    return [sx, sy, m]
}

function grid(f, stepsX, stepsY, m) {
    const xm = m / 2

    for (let y = 0; y < stepsY; y++) {
        const shift = y % 2 == 0 ? xm : 0

        for (let x = 0; x < stepsX; x++) {
            f(
                (x * m) + shift,
                (y * m)
            )
        }
    }
}
