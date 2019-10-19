let agents = []

function sign(value) {
    if (value < 0) {
        return -1
    } else if (value > 0) {
        return 1
    } else {
        return 0
    }
}

function superellipse(angle, n, a, b) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const p = 2 / n
    const x = Math.pow(Math.abs(cos), p) * a * sign(cos)
    const y = Math.pow(Math.abs(sin), p) * b * sign(sin)

    return [x, y]
}

class Agent {
    // constructor(loc, angle, fill) {
    constructor(loc) {
        this.loc = loc
        // this.angle = angle
        // this.fill = fill

        // this.ttl = 1
    }

    setShapeQuality(value) {
        this.shapeQuality = value

        return this
    }

    setSuperellipseParameters(n, a, b) {
        this.n = n
        this.a = a
        this.b = b

        return this
    }

    run() {
        const k = Math.sqrt(width * width + height * height)
        const d = dist(this.loc.x, this.loc.y, mouseX, mouseY)
        // const d2 = d * 2
        this.n = map(d, 0, k, 0, 4)
        // this.n = map(d2, 0, k, 3, 0, true)
    }

    draw() {
        const length = this.shapeQuality
        const m = TWO_PI / length

        translate(this.loc.x, this.loc.y)
        noFill()
        stroke(0)
        beginShape()

        for (let i = 0; i < length; i++) {
            const angle = i * m
            const [x, y] = superellipse(angle, this.n, this.a, this.b)

            vertex(x, y)
            // ellipse(x, y, s, s)
        }
        endShape(CLOSE)
    }
}

function setup() {
    // createCanvas(300, 300)
    createCanvas(windowWidth, windowHeight)
    pixelDensity(2)

    background(255)

    const s = 60
    const [sx, sy] = layout([width, height], s)
    rectGrid(sx + 1, sy + 1, (x, y) => {
        createAgent(x, y, s)
    })

    // noLoop()
}

function createAgent(r, c, size) {
    const x = r * size
    const y = c * size
    // const a = Math.random() * Math.PI * 2
    const v = createVector(x, y)
    // const f = random([
    //     a => {
    //         const r = map(a.ttl, 0, 1, 0, 150)
    //         fill(255, r, r)
    //     },
    //     a => {
    //         const r = map(a.ttl, 0, 1, 0, 255)
    //         const b = map(a.ttl, 1, 0, 0, 255)
    //         fill(r, 255, b)
    //     },
    //     a => {
    //         const r = map(a.ttl, 0, 1, 0, 255)
    //         const g = map(a.ttl, 1, 0, 0, 255)
    //         fill(r, g, 255)
    //     },
    //     a => {
    //         const r = map(a.ttl, 0, 1, 0, 255)
    //         const g = map(a.ttl, 1, 0, 0, 255)
    //         const b = map(a.ttl, 1, 0, 255, 0)
    //         fill(r, g, b)
    //     },
    // ])

    const a = size * 0.45
    const b = size * 0.45
    // const n = map(x, 0, width, 0, 5)
    const n = random(0.5, 3)

    const agent = (new Agent(v))
        .setShapeQuality(50)
        .setSuperellipseParameters(n, a, b)

    agents.push(agent)
}

function draw() {
    // background(0, 0, 0, 5);
    background(255)

    for (const a of agents) {
        push()
        a.run()
        a.draw()
        pop()
    }
}

function layout([width, height], m) {
    const sx = Math.round(width / m)
    const sy = Math.round(height / m)

    return [sx, sy]
}

function rectGrid(rows, columns, fn) {
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < columns; y++) {
            fn(x, y)
        }
    }
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