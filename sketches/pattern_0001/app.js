let seed = 0

function setup() {
    createCanvas(windowWidth, windowHeight)
    pixelDensity(2)

    strokeCap(SQUARE)
    background(255)
}

function draw() {
    background(255)

    if (mouseIsPressed) {
        seed ++
    }

    const s = 25
    const [sx, sy] = layout([width, height], s)

    randomSeed(seed + 0)
    rectGrid(sx, sy, (x, y) => {
        const size = s
        strokeWeight(1)
        push()
        translate(x * size, y * size)
        drawAgent(size)
        pop()
    })

    randomSeed(seed + 1)
    rectGrid(sx, sy, (x, y) => {
        const size = s
        strokeWeight(1)
        push()
        translate(x * size, y * size)
        drawAgent(size)
        pop()
    })

    randomSeed(seed + 2)
    rectGrid(sx, sy, (x, y) => {
        const size = s
        strokeWeight(4)
        push()
        translate(x * size, y * size)
        drawAgent(size)
        pop()
    })
}

function drawAgent(s) {
    const shift = Math.round(random(0, 4))
    const sa = HALF_PI * shift
    const ea = sa + HALF_PI

    arc(0, 0, s, s, sa, ea)
}

function layout([width, height], m) {
    const sx = Math.round(width / m)
    const sy = Math.round(height / m)

    return [sx + 1, sy + 1]
}

function rectGrid(rows, columns, fn) {
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < columns; y++) {
            fn(x, y)
        }
    }
}
