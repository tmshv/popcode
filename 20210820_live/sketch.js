// let agents = []

// class Agent {
//     constructor(loc, angle) {
//         this.loc = loc
//         this.angle = angle

//         this.ttl = 1
//         this.ttlStep = 0.05 + Math.random() * 0.1

//         const r = 100
//         const g = 100
//         const b = 100 + Math.random() * 150
//         // const b = 255
//         this.fillColor = [r, g, b]
//     }

//     run() {
//         const vx = Math.cos(this.angle)
//         const vy = Math.sin(this.angle)
//         const f = 1
//         this.loc.x += vx * f
//         this.loc.y += vy * f

//         this.ttl -= this.ttlStep
//     }

//     draw() {
//         const s = 1 + (this.ttl * 2)

//         translate(this.loc.x, this.loc.y)
//         rotate(this.angle)
//         fill(...this.fillColor)
//         noStroke()
//         ellipse(0, 0, s, s)
//     }
// }

// function setup() {
//     // createCanvas(300, 300)
//     createCanvas(windowWidth, windowHeight)
//     // pixelDensity(1)

//     background(255)

//     grid(generate, ...layout(30))
// }

// function generate(x, y) {
//     let a = Math.random() * Math.PI * 2
//     const step = Math.PI / 3
//     x += Math.random() * 5
//     y += Math.random() * 5

//     a += step
//     createAgent(x, y, a)

//     a += step
//     createAgent(x, y, a)

//     a += step
//     createAgent(x, y, a)

//     a += step
//     createAgent(x, y, a)

//     a += step
//     createAgent(x, y, a)

//     a += step
//     createAgent(x, y, a)
// }

// function createAgent(x, y, angle) {
//     const v = createVector(x, y)

//     agents.push(new Agent(v, angle))
// }

// function draw() {
//     // background(255, 255, 255, 5)

//     for (const a of agents) {
//         push()
//         a.run()
//         a.draw()
//         pop()
//     }

//     agents = agents.filter(x => x.ttl > 0)
// }

// function layout(m) {
//     const sx = Math.round(width / m)
//     const sy = Math.round(height / m)
//     return [sx, sy, m]
// }

// function grid(f, stepsX, stepsY, m) {
//     const result = []
//     const xm = m / 2

//     for (let y = 0; y < stepsY; y++) {
//         const shift = y % 2 == 0 ? xm : 0

//         for (let x = 0; x < stepsX; x++) {
//             const item = f(
//                 (x * m) + shift,
//                 (y * m)
//             )
//             result.push(item)
//         }
//     }

//     return result
// }

// function mouseClicked() {
//     // save('8m19', 'png');
//     // if (key === 's') {
//     //     // photo.
//     // }
// }

let mic;

function setup() {
    let cnv = createCanvas(100, 100);
    // cnv.mousePressed(userStartAudio);
    textAlign(CENTER);
    mic = new p5.AudioIn();
    mic.start();
}

function draw() {
    background(0);
    fill(255);
    text('tap to start', width / 2, 20);

    micLevel = mic.getLevel();
    let y = height - micLevel * height;
    ellipse(width / 2, y, 10, 10);
}