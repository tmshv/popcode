let state = []
let nextState = []

const EMPTY = 0
const TREE = 1
const BURN = 2

const P = 0.005
const F = 0.0001

const S = 6
const NEIGHBORS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],

    [0, -1],
    // [0, 0],
    [0, 1],

    [1, -1],
    [1, 0],
    [1, 1],
]

const colors = new Map([
    [EMPTY, '#19201D'],
    [TREE, '#03B367'],
    [BURN, '#FF0000'],
])

function setup() {
    createCanvas(windowWidth, windowHeight)
    noStroke()

    const X = floor(width / S)
    const Y = floor(height / S)

    for (let x = 0; x < X; x++) {
        state.push([])
        nextState.push([])
        for (let y = 0; y < Y; y++) {
            state[x].push(EMPTY)
            nextState[x].push(EMPTY)
        }
    }

    for (let x = 0; x < state.length; x++) {
        const row = state[x]
        for (let y = 0; y < row.length; y++) {
            const r = random(0, 1) < 0.3 ? TREE : EMPTY
            state[x][y] = r
            nextState[x][y] = state[x][y]
        }
    }
}

function draw() {
    const X = state.length - 1
    const Y = state[0].length - 1

    scale(S)

    for (let x = 0; x < X; x++) {
        for (let y = 0; y < Y; y++) {
            fill(colors.get(state[x][y]))
            rect(x, y, 1, 1)
        }
    }

    ca()
}

function ca() {
    const X = state.length - 1
    const Y = state[0].length - 1

    for (let x = 0; x < X; x++) {
        for (let y = 0; y < Y; y++) {
            const cell = state[x][y]

            // 1. Burning cell moves to empty
            if (cell === BURN) {
                nextState[x][y] = EMPTY
                continue
            }

            // 2. A tree will burn if at least one neighbor is burning
            if (cell === TREE && hasBurningNeighbor(state, x, y)) {
                nextState[x][y] = BURN
                continue
            }

            // 3. A tree ignites with probability F even if no neighbor is burning
            if (cell === TREE && random(0, 1) < F) {
                nextState[x][y] = BURN
                continue
            }

            // 4. An empty space fills with a tree with probability P
            if (cell === EMPTY && random(0, 1) < P) {
                nextState[x][y] = TREE
                continue
            }
        }
    }

    state = nextState
}

function hasBurningNeighbor(matrix, x, y) {
    const X = matrix.length - 1
    const Y = matrix[0].length - 1

    for (let [dx, dy] of NEIGHBORS) {
        const ix = x + dx
        const iy = y + dy
        if (
            (ix > 0 && ix < X) &&
            (iy > 0 && iy < Y) &&
            matrix[ix][iy] === BURN
        ) {
            return true
        }
    }

    return false
}
