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
    // createCanvas(300, 300)
    createCanvas(windowWidth, windowHeight)
    // pixelDensity(1)

    // background(0);
    background(255);

    const f = (x, y) => {
        createAgent(x, y)
        createAgent(x, y)
        createAgent(x, y)
        createAgent(x, y)
        createAgent(x, y)
        createAgent(x, y)
        createAgent(x, y)
    }

    grid(f, ...layout(30))
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
    // background(0, 0, 0, 5);

    for (const a of agents) {
        push()
        a.run()
        a.draw()
        pop()
    }

    agents = agents.filter(x => x.ttl > 0)
}

function drawAgent5(x, y) {
    const s = random(10, 15)

    fill(200, 0, 0)
    ellipse(x, y, s, s)
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

function mouseClicked() {
    // save('8m19', 'png');
    // if (key === 's') {
    //     // photo.
    // }
}