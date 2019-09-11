let grid = []
let next = []

let gridWidth = 100
let gridHeight = 100

const dA = 1
const dB = 0.5
const feed = 0.055
const k = 0.062

const S = 4

function setup() {
    createCanvas(gridWidth * S, gridHeight * S)
    pixelDensity(1)

    const f = () => ({
        a: 1,
        b: 0,
    })
    grid = createGrid(gridWidth, gridHeight, f)
    next = createGrid(gridWidth, gridHeight, f)

    for (let i = 0; i < 40; i++) {
        const x = Math.floor(Math.random() * gridWidth)
        const y = Math.floor(Math.random() * gridHeight)
        fillRectInGrid(grid, x, y, 2, x => ({
            ...x,
            b: 1,
        }))
    }

    // const s = 2
    // const offset = 10
    // const l = x => gridWidth - s - x
    // const b = x => gridHeight - s - x
    // fillRectInGrid(grid, offset, offset, s, x => ({
    //     ...x,
    //     b: 1
    // }))
    // fillRectInGrid(grid, l(offset), offset, s, x => ({
    //     ...x,
    //     b: 1
    // }))
    // fillRectInGrid(grid, l(offset), b(offset), s, x => ({
    //     ...x,
    //     b: 1
    // }))
    // fillRectInGrid(grid, offset, b(offset), s, x => ({
    //     ...x,
    //     b: 1
    // }))
}

function gridForEach(width, height, each) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            each(x, y, width, height)
        }
    }
}

function fillRectInGrid(grid, sx, sy, s, f) {
    gridForEach(s, s, (x, y) => {
        const xx = x + sx
        const yy = y + sy
        grid[xx][yy] = f(grid[xx][yy])
    })
}

function runSimulation() {
    for (let x = 1; x < gridWidth - 1; x++) {
        for (let y = 1; y < gridHeight - 1; y++) {
            const a = grid[x][y].a
            const b = grid[x][y].b

            const t = 1
            const na = a + ((dA * laplace(grid, x, y, 'a')) - (a * b * b) + (feed * (1 - a))) * t
            const nb = b + ((dB * laplace(grid, x, y, 'b')) + (a * b * b) - ((k + feed) * b)) * t

            next[x][y].a = constrain(na, 0, 1)
            next[x][y].b = constrain(nb, 0, 1)
        }
    }

    swap()
}

function draw() {
    background(0)
    scale(S)
    runSimulation()

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const a = grid[x][y].a
            const b = grid[x][y].b

            let c = Math.floor((a - b) * 255)
            c = constrain(c, 0, 255)
            // c = c < 128 ? 0 : 255

            stroke(c)
            point(x, y)
        }
    }
}

// function windowResized() {
//     gridWidth = windowWidth
//     gridHeight = windowHeight

//     resizeCanvas(windowWidth, windowHeight);
// }

function laplace(grid, x, y, v) {
    let sum = 0

    sum += grid[x][y][v] * -1
    sum += grid[x - 1][y][v] * 0.2
    sum += grid[x + 1][y][v] * 0.2
    sum += grid[x][y - 1][v] * 0.2
    sum += grid[x][y + 1][v] * 0.2
    sum += grid[x - 1][y - 1][v] * 0.05
    sum += grid[x + 1][y - 1][v] * 0.05
    sum += grid[x + 1][y + 1][v] * 0.05
    sum += grid[x - 1][y + 1][v] * 0.05

    return sum
}

function swap() {
    // [grid, next] = [next, grid]
    const temp = grid
    grid = next
    next = temp
}

function createGrid(width, height, factory) {
    const grid = []

    for (let x = 0; x < width; x++) {
        grid[x] = []

        for (let y = 0; y < height; y++) {
            grid[x][y] = factory(x, y, width, height)
        }
    }

    return grid
}
