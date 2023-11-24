class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    set(x, y) {
        this.x = x
        this.y = y
    }

    setFrom(other) {
        this.x = other.x
        this.y = other.y
    }

    add(other) {
        this.x += other.x
        this.y += other.y
    }

    mult(scalar) {
        this.x *= scalar
        this.y *= scalar
    }
}

class Particle {
    constructor(power) {
        this.dump = 0.99
        this.pos = new Vector(0, 0)
        this.vel = new Vector(0, 0)
        this.acc = new Vector(0, 0)
        this.power = power
    }

    force(f) {
        this.acc.add(f)
    }

    move() {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.vel.mult(this.dump)
        this.acc.set(0, 0)
    }
}

class Emitter {
    constructor(ttl) {
        this.pos = new Vector(0, 0)
        this.maxTtl = ttl
        this.ttl = ttl
    }

    *emit(n) {
        for (let i = 0; i < n; i++) {
            let p = new Particle(random(1))
            p.pos.setFrom(this.pos)
            p.force(wind(p.pos.x, p.pos.y, 1))
            yield p
        }
    }

    run() {
        this.ttl--
        return this.ttl > 0
    }

    get ttlRatio() {
        return this.ttl / this.maxTtl
    }
}

class EmitterController {
    constructor() {
        this.last = new Vector(0, 0)
        this.dist = 30
        this.maxTtl = 75
    }

    create() {
        if (!mouseIsPressed) {
            return null
        }
        if (dist(this.last.x, this.last.y, mouseX, mouseY) < this.dist) {
            return null
        }

        this.last.set(mouseX, mouseY)
        let e = new Emitter(this.maxTtl)
        e.pos.set(
            mouseX,
            mouseY,
        )
        return e
    }
}

let particles = []
let emitters = []
let emitCtrl = new EmitterController()

function setup() {
    createCanvas(windowWidth, windowHeight)

    for (let i = 0; i < 1000; i++) {
        let p = new Particle(
            random(1),
        )
        p.pos.set(
            random(width),
            random(height),
        )
        particles.push(p)
    }
}

function wind(x, y, f) {
    let a = random(Math.PI * 2)
    return new Vector(
        Math.cos(a) * f,
        Math.sin(a) * f,
    )
}

function outOfBox(p) {
    if (p.pos.x < 0 || p.pos.x > width) {
        return true
    }
    if (p.pos.y < 0 || p.pos.y > height) {
        return true
    }
}

function up(x, y, f) {
    return new Vector(0, -random(f))
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function draw() {
    background("#191724")

    loopEmitters()
    loopParticles()
}

function loopParticles() {
    let next = []
    for (let p of particles) {
        p.force(wind(p.pos.x, p.pos.y, 0.01))
        p.force(up(p.pos.x, p.pos.y, 0.025))
        p.move()

        if (outOfBox(p)) {
            if (next.length < 1000) {
                p.pos.x = random(width)
                p.pos.y = height
                p.vel.set(0, 0)
                p.acc.set(0, 0)
                next.push(p)
            }
        } else {
            next.push(p)
        }

        // DRAW
        noFill()
        stroke((1 - p.power) * 255)
        strokeWeight(map(p.power, 1, 0, 1, 3))
        point(p.pos.x, p.pos.y)
    }
    particles = next
}

function loopEmitters() {
    let e = emitCtrl.create()
    if (e) {
        emitters.push(e)
    }

    let next = []
    for (let e of emitters) {
        let n = map(e.ttlRatio, 0, 1, 1, 5)
        for (let p of e.emit(n)) {
            if (particles.length < 10000) {
                particles.push(p)
            }
        }

        if (e.run()) {
            next.push(e)
        }

    }
    emitters = next
}
