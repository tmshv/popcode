function repeat(times) {
    return fn => {
        const result = []

        for (let i = 0; i < times; i++) {
            result.push(fn(i))
        }

        return result
    }
}

function interpolate(min, max, ratio) {
    return min + (max - min) * ratio
}

class Flexbox {
    static new({ width, height, minWidth }) {
        const x = new Flexbox(width, height)
        x.minWidth = minWidth
        return x
    }

    constructor(width, height) {
        this.x = 0
        this.y = 0
        this.width = width
        this.height = height
        this.minWidth = 100
        this.flex = 1
        this.children = []

        this.actualX = 0
        this.actualY = 0
        this.actualWidth = 0
        this.actualHeight = 0
    }

    setContent(content) {
        this.content = content
        return this
    }

    size() {
        return this.children.length
    }

    shift(x, y) {
        this.shift = [x, y]
    }

    addChild(element) {
        this.children.push(element)
        return this
    }

    render() {
        if (typeof this.content === 'function') {
            this.content(this.actualX, this.actualY, this.actualWidth, this.actualHeight)
        }
        for (let e of this.children) {
            e.render()
        }
    }

    calc(parent, spaceLeft) {
        if (parent) {
            const s = parent.size()
            if (this.width) {
                this.actualWidth = this.width
            } else {
                this.actualWidth = parent.width / s
            }

            if (this.height) {
                this.actualHeight = this.height
            } else {
                this.actualHeight = parent.height / s
            }
        } else {
            this.actualWidth = this.width
            this.actualHeight = this.height
        }

        if (!this.spaceLeft) {
            spaceLeft = this.actualWidth
        }

        const min = this.children.reduce((total, e) => {
            return total + e.precalc()
        }, 0)
        spaceLeft = this.actualWidth - min
        const fr = this.children.reduce((total, e) => {
            return total + e.flex
        }, 0)
        // let cursor = 0
        // for (let e of this.children) {
        //     cursor = e.precalc()
        // }

        for (let e of this.children) {
            spaceLeft = e.calc(this, spaceLeft)
        }

        return spaceLeft
    }

    precalc() {
        let cursor = 0

        cursor += this.x
        cursor += this.minWidth

        return cursor
    }
}

class Vector {
    static new(x, y) {
        return new Vector(x, y)
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    constructor(x, y) {
        this.set(x, y)
    }

    set(x, y) {
        this.x = x
        this.y = y

        return this
    }

    add(vector) {
        this.x += vector.x
        this.y += vector.y

        return this
    }

    multiply(scalar) {
        this.x *= scalar
        this.y *= scalar

        return this
    }

    normalize() {
        const length = this.length
        this.x *= 1 / length
        this.y *= 1 / length

        return this
    }

    distance(vector) {
        const dx = this.x - vector.x
        const dy = this.y - vector.y

        return Math.sqrt(dx * dx + dy * dy)
    }
}

class Agent {
    constructor(x, y, mass) {
        this.location = new Vector(x, y)
        this.velocity = new Vector(1, 1)
        this.acceleration = new Vector(0, 0)

        this.mass = mass
        this.fitBorderFn = fitBorderBump
    }

    setFitBorderFn(fn) {
        this.fitBorderFn = fn
    }

    getVelocitySpeed(mouse) {
        return 1
    }

    direct(angle) {
        this.velocity.set(
            Math.cos(angle),
            Math.sin(angle),
        )

        return this
    }

    run({ border, mouse }) {
        const m = this.getVelocitySpeed(mouse)

        this.velocity.normalize()
        this.velocity.multiply(m)

        // this.velocity.add(this.acceleration)
        this.velocity.multiply(m)
        this.location.add(this.velocity)
        this.fitBorders(border.width, border.height)
        this.acceleration.set(0, 0)
    }

    fitBorders(width, height) {
        this.fitBorderFn(this, width, height)
    }

    addGraphic(g) {
        this.g = g
    }

    render() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x)

        this.g.rotation = angle
        this.g.x = this.location.x
        this.g.y = this.location.y
    }
}

class MetaballAgent extends Agent {
    run(options) {
        super.run(options)
        const {frame} = options
        this.radius = this.mass + Math.abs(Math.cos(frame * 0.01))
    }
}

function fitBorderBump(agent, width, height) {
    if (agent.location.x < 0) {
        agent.location.x = 1
        agent.velocity.x *= -1
    }
    if (agent.location.x > width) {
        agent.location.x = width - 1
        agent.velocity.x *= -1
    }
    if (agent.location.y < 0) {
        agent.location.y = 1
        agent.velocity.y *= -1
    }
    if (agent.location.y > height) {
        agent.location.y = height - 1
        agent.velocity.y *= -1
    }
}

function fitBorderTeleport(agent, width, height) {
    if (agent.location.x < 0) {
        agent.location.x = width
    }
    if (agent.location.x > width) {
        agent.location.x = 0
    }
    if (agent.location.y < 0) {
        agent.location.y = height
    }
    if (agent.location.y > height) {
        agent.location.y = 0
    }
}