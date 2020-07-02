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
    createCanvas(windowWidth, windowHeight)

    for (let i = 0; i < 5000; i++) {
        const agent = new Agent()
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
        drawShape()

        agent.acceleration.mult(0)
        pop()
    }
}

function drawShape() {
    strokeWeight(1)
    point(0, 0)
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
