const APP_ID = "sketch_20231104_0"
let lines = []
let cur = []

let corners = []

let flag = false

const L = 70
const T = 20

function loadState() {
    let data = localStorage.getItem(APP_ID)
    if (!data) {
        return
    }
    let items = JSON.parse(data)
    for (let item of items) {
        lines.push(new Line(item))
    }
}

function saveState() {
    let data = []
    for (let line of lines) {
        data.push(line.points)
    }
    localStorage.setItem(APP_ID, JSON.stringify(data))
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    loadState()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function draw() {
    background("#FFFFFF")

    if (flag) {
        if (isFar()) {
            cur.push(getMouseSnapped())
        }

        noFill()
        strokeWeight(1)
        stroke("#999999")
        beginShape()
        for (const p of cur) {
            vertex(p.x, p.y)
        }
        vertex(mouseX, mouseY)
        endShape()
    }

    lines.forEach((line, i) => {
        if (line.closed) {
            fill("#bababa50")
        }else{
        noFill()
        }
        strokeWeight(1)
        stroke("#bababa")
        beginShape()
        for (const p of line.points) {
            vertex(p.x, p.y)
        }
        endShape()

        noFill()
        stroke("#000000")
        strokeWeight(5)
        point(line.end.x, line.end.y)

        fill("#000000")
        noStroke()
        textSize(14)
        text(`${i}`, line.end.x + 5, line.end.y + 3)
    })

    fill("#000000")
    noStroke()
    textSize(14)
    text(`frame=${frameCount}`, 20, 20)
    text(`lines=${lines.length}`, 20, 40)
    text(`corners=${corners.length}`, 20, 60)
}

function mousePressed() {
    flag = true
    cur = []
}

function mouseReleased() {
    flag = false
    if (cur.length) {
        cur.push(getMouseSnapped())
        lines.push(new Line(cur))
        lines = merge(lines)
        saveState()

        let seen = new Set()
        corners = lines
            .flatMap(line => [line.start, line.end])
            .reduce((acc, pnt) => {
                let hash = `${pnt.x}/${pnt.y}`
                if (seen.has(hash)) {
                    return acc
                }
                seen.add(hash)
                acc.push(pnt)
                return acc
            }, [])
    }
}

function keyTyped() {
    if (key === "r") {
        lines = []
        corners = []
        saveState()
    }
}

function getMouseSnapped() {
    for (let c of corners) {
        let d = dist(c.x, c.y, mouseX, mouseY)
        if (d < T) {
            return { x: c.x, y: c.y }
        }
    }
    return { x: mouseX, y: mouseY }
}

function isFar() {
    if (cur.length === 0) {
        return true
    }

    let last = cur[cur.length - 1]
    let d = dist(last.x, last.y, mouseX, mouseY)

    return d > L
}

function canMerge(a, b) {
    return a.endKey === b.startKey
}

function mergeTwo(a, b) {
    if (canMerge(a, b)) {
        return a.append(b)
    }

    if (canMerge(b, a)) {
        return b.append(a)
    }

    if (a.startKey === b.startKey) {
        return a.reverse().append(b)
    }

    if (a.endKey === b.endKey) {
        return a.append(b.reverse())
    }

    return null
}

function merge(lines) {
    let curr = [...lines]

    while (true) {
        let next = []
        let seen = new Set()
        for (let i = 0; i < curr.length; i++) {
            if (seen.has(i)) {
                continue
            }
            for (let j = 0; j < curr.length; j++) {
                if (i === j) {
                    continue
                }
                if (seen.has(j)) {
                    continue
                }

                let a = curr[i]
                let b = curr[j]

                let merged = mergeTwo(a, b)
                if (merged) {
                    next.push(merged)
                    seen.add(i)
                    seen.add(j)
                }
            }
        }

        // No merge happened at this loop -> Stop
        if (next.length === 0) {
            return curr
        }

        for (let i = 0; i < curr.length; i++) {
            if (seen.has(i)) {
                continue
            }
            next.push(curr[i])
        }

        curr = next
    }
}

function nextId() {
    let x = 0
    return () => x++
}

const id = nextId()

class Line {
    constructor(points) {
        this.id = id()
        this.points = points
    }

    get start() {
        return this.points[0]
    }

    get end() {
        let l = this.points.length - 1
        return this.points[l]
    }

    get startKey() {
        let p = this.points[0]
        return `${p.x}/${p.y}`
    }

    get endKey() {
        let l = this.points.length - 1
        let p = this.points[l]
        return `${p.x}/${p.y}`
    }

    get closed() {
        if (this.points.length < 3) {
            return false
        }
        return this.startKey === this.endKey
    }

    append(other) {
        return new Line([...this.points, ...other.points])
    }

    reverse() {
        let points = [...this.points]
        points.reverse()
        return new Line(points)
    }
}

