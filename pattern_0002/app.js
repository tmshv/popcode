let seed = 0

function setup() {
    createCanvas(windowWidth, windowHeight)
    pixelDensity(2)

    background(255)
}

function draw() {
    background(255)

    if (mouseIsPressed) {
        seed++
    }

    const ratio = 0.35
    const s = 50
    const [sx, sy] = layout([width, height], s, s * ratio)

    randomSeed(seed + 0)
    rectGrid(sx, sy, (x, y) => {
        x = x
        y = y * ratio
        const size = s
        strokeWeight(1)
        push()
        translate(x * size, y * size)
        drawAgent(size)
        pop()
    })
}

function testGaussian() {
    const mean = mouseX
    const sd = map(mouseY, 0, height, 1, 100)
    const m = 1

    translate(0, height / 2)
    for (let i = 0; i < 100; i++) {
        let r = randomGaussian(mean, sd)
        r = align(r, mean)

        point(r, 0)
    }
}

function align(a, b) {
    if (a < b) {
        return b + (b - a)
    }
    return a
}

function randomGaussian2(mean, sd) {
    const x = randomGaussian(mean, sd)
    return align(x, mean)
}

function drawAgent(s) {
    const mean = 0
    const segments = Math.round(s / 5)
    const s2 = segments * 0.5
    const m = 0.5
    let coords = splitRange(0, s, segments, true)
        .map(x => {
            return [x, random(s2)]
        })

    const c1 = coords.map(([x, y], sd) => {
        y += randomGaussian2(mean, sd * m)
        return [x, y]
    })
    const c2 = coords.map(([x, y], sd) => {
        y -= randomGaussian2(mean, sd * m)
        return [x, y]
    })
    const shape = [...c1, ...c2.reverse()]

    fill(0)
    beginShape()
    for (let [x, y] of shape) {
        vertex(x, y)
    }
    endShape(CLOSE)
}

function* range(n, f) {
    if (f) {
        for (var i = 0; i <= n; i++) {
            yield i
        }
        return
    }

    for (var i = 0; i < n; i++) {
        yield i
    }
}

function splitRange(min, max, n, f) {
    const d = max - min
    const r = d / n
    return [...range(n, f)].map(x => min + x * r)
}

function domains(xs) {
    return zip(init(xs), tail(xs))
}

function init(xs) {
    return xs.slice(0, length - 1)
}

function tail(xs) {
    return xs.slice(1, xs.length)
}

function zip(a, b) {
    return a.map((x, i) => [x, b[i]])
}

function layout([width, height], w, h) {
    const sx = Math.round(width / w)
    const sy = Math.round(height / h)

    return [sx + 1, sy + 1]
}

function rectGrid(rows, columns, fn) {
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < columns; y++) {
            fn(x, y)
        }
    }
}
