class Agent {
    constructor() {
        this.pos = createVector(0, 0)
        this.velocity = createVector(0, 0)
        this.acceleration = createVector(0, 0)
    }

    force(vx, vy) {
        this.acceleration.add(createVector(vx, vy))
    }

    run() {
        this.acceleration.limit(0.02)
        // this.acceleration.setMag(0.01)
        this.velocity.add(this.acceleration)
        this.velocity.mult(0.98)
        this.pos.add(this.velocity)
    }

    distSq(v) {
        const dx = this.pos.x - v.x
        const dy = this.pos.y - v.y
        return dx * dx + dy * dy
    }
}

let agents = []
let forces = []

function setup() {
    // createCanvas(windowWidth, windowHeight, WEBGL)
    createCanvas(windowWidth, windowHeight)

    for (let i = 0; i < 5000; i++) {
        const agent = new Agent()
        // agent.pos.set(width / 2, height / 2)
        agent.pos.set(
            random(width),
            random(height),
        )

        agents.push(agent)
    }

    const s = 0.01
    for (let x = 0; x < width; x += 1) {
        const forceRow = []
        forces.push(forceRow)
        for (let y = 0; y < height; y += 1) {
            // const angle = random(TWO_PI)
            const angle = noise(x * s, y * s) * TWO_PI
            const v = p5.Vector.fromAngle(angle, 5)

            forces[x][y] = {
                pos: createVector(x, y),
                force: v,
            }
        }
    }
}

function draw() {
    // background(255)

    const f = 0.25

    // for (let f of forces) {
    //     // push()
    //     // translate(f.pos.x, f.pos.y)

    //     // // stroke(200)
    //     // // strokeWeight(1)
    //     // // line(0, 0, f.force.x, f.force.y)

    //     // // stroke(0)
    //     // // strokeWeight(3)
    //     // // point(0, 0)

    //     // stroke(0)

    //     // pop()
    // }

    for (let agent of agents) {
        const x = int(agent.pos.x)
        const y = int(agent.pos.y)
        try {
            const f = forces[x][y]
            // const dist = agent.pos.dist(f.pos)
            const d2 = agent.distSq(f.pos)
            const power = f.force.mag() / d2
            const ff = f.force.copy().setMag(power)
            agent.force(ff.x, ff.y)
        } catch (e) {

        }
    }

    stroke(0, 0, 0, 10)
    // stroke(0)
    for (let agent of agents) {
        push()

        if (mouseIsPressed) {
            forceToMouse(agent)
        } else {
            // forceFromMouse(agent)
        }

        agent.force(random(-f, f), random(-f, f))
        agent.run()

        translate(agent.pos.x, agent.pos.y)
        // const sw = map(agent.velocity.mag(), 0, 3, 1, 5)
        // strokeWeight(sw)
        drawShape()

        agent.acceleration.mult(0)
        pop()
    }
}

// function mousePressed() {
//     for (let i = 0; i < 1; i++) {
//         const a = new Agent()
//         a.pos.set(mouseX, mouseY)
//         const shift = p5.Vector.fromAngle(random(TWO_PI))
//         shift.mult(random(5))
//         a.pos.add(shift)
//         agents.push(a)
//     }
// }

function drawShape() {
    strokeWeight(1)
    point(0, 0)
    // rect(0, 0, 50, 50)
    // line(0, 0, 50, 50)
}

function forceToMouse(agent) {
    let dx = mouseX - agent.pos.x
    let dy = mouseY - agent.pos.y

    dx *= 0.5
    dy *= 0.5

    agent.force(dx, dy)
}

function forceFromMouse(agent) {
    let dx = agent.pos.x - mouseX
    let dy = agent.pos.y - mouseY

    dx *= 0.1
    dy *= 0.1

    agent.force(dx, dy)
}
