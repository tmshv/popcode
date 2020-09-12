let colorPalette = ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff", "#f22318", "#52db30"];
let colors = [...colorPalette]

const videoWidth = 600
const videoHeight = 500

const agents = []
let mouse = null
let cursor = null
let trackMode = false

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class Agent {
    constructor({ dash, dashColor, mass }) {
        this.pos = createVector(0, 0)
        this.velocity = createVector(0, 0)
        this.acceleration = createVector(0, 0)

        this.dash = dash
        this.dashColor = dashColor
        this.mass = mass
    }

    force(v) {
        this.acceleration.add(v)
    }

    run() {
        this.velocity.add(this.acceleration)
        this.velocity.mult(0.98)
        this.pos.add(this.velocity)

        this.acceleration.mult(0)
    }

    distSq(v) {
        const dx = this.pos.x - v.x
        const dy = this.pos.y - v.y
        return dx * dx + dy * dy
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    // noLoop();

    mouse = createVector(0, 0)
    cursor = createVector(0, 0)
    randomSeed(2)

    for (let i = 0; i < 50; i++) {
        let x = random() * width
        let y = random() * height

        const agent = new Agent({
            dash: createDashPattern(5, 30),
            dashColor: random(colors),
            mass: random(2, 10),
        })
        agent.pos.set(x, y)
        agents.push(agent)
    }

    // setInterval(() => {
    //     shuffle(colors, true)
    // }, 100);

    // initVideo().then(video => {
    //     detectPose(video)
    // })
}

function draw() {
    // mouse.set(mouseX, mouseY)
    // cursor.set(mouse.x, mouse.y)

    // const bc = trackMode ? 'magenta' : 'white'
    const bc = '#fafa00'
    background(bc)
    noFill()

    // shuffle(colors, true)
    noiseSeed(0)
    // noiseSeed(frameCount * 0.001)

    for (let a of agents) {
        noiseLine(a)
        drawAgent(a)

        // if (mousePressed)
        if (trackMode) {
            const f = cursor.copy()
            f.sub(a.pos)
            f.mult(0.0005)
            a.force(f)

            a.dashColor = random(colors)
        }

        const f = createVector(random(-1, 1), random(-1, 1))
        f.mult(0.5)

        a.force(f)
        a.run()
    }

    fill('lime')
    noStroke()
    circle(cursor.x, cursor.y, 5)

    // for (let i = 0; i < 10; i++) {
    //     let x = random() * width
    //     let y = random() * height

    //     noiseLine(x, y)
    // }
}

function mousePressed() {
    for (let a of agents) {
        const f = createVector(mouseX, mouseY)
        f.sub(a.pos)
        f.mult(0.005)

        a.force(f)
    }
}

function drawAgent(a) {
    stroke('#fff')
    strokeWeight(5)
    point(a.pos.x, a.pos.y)
}

function createDashPattern(length, deviation) {
    const arr = []
    for (let i = 0; i < length; i++) {
        arr.push(random(deviation))
    }
    return arr
}

function noiseLine(agent) {
    let x = agent.pos.x
    let y = agent.pos.y

    let c = 500;
    let points = [];
    let col1 = 'black'

    const solidWeight = agent.mass
    const dashWeight = max(1, agent.mass - 4)

    for (let i = 0; i < c; i++) {
        let scl = 0.0008;
        let str = noise(x * scl, y * scl) * 100;
        let angle = noise(x * scl, y * scl, i * 0.0006) * str;
        points.push(createVector(x, y));
        x += cos(angle);
        y += sin(angle);
    }

    // draw solid line
    strokeWeight(solidWeight);
    stroke(col1);
    beginShape();
    for (let p of points) {
        vertex(p.x, p.y)
    }
    endShape();

    // draw dashed line
    push();
    stroke(agent.dashColor);
    strokeWeight(dashWeight);
    drawingContext.setLineDash(agent.dash);
    beginShape();
    for (let p of points) {
        vertex(p.x, p.y)
    }
    endShape();
    pop();
}

async function initVideo() {
    if (!navigator.getUserMedia) {
        throw new Error('Cannot get camera')
        // navigator.getUserMedia({ video: true }, handleVideo, videoError);
    }

    const video = document.querySelector('#video')
    video.width = videoWidth
    video.height = videoHeight
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            width: videoWidth,
            height: videoHeight,
            // width: mobile ? undefined : videoWidth,
            // height: mobile ? undefined : videoHeight,
        },
    });
    video.srcObject = stream;
    video.play()

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
    // return new Promise((resolve, reject) => {
    //     function handleVideo(stream) {
    //         // video.src = window.URL.createObjectURL(stream);
    //         // video.src = URL.createObjectURL(stream);
    //         video.srcObject = stream;

    //         resolve(video)
    //     }

    //     function videoError(e) {
    //         reject(e)
    //     }
    // })
}

function getPartPosition(pose, part, rate) {
    const index = new Map([
        ["nose", 0],
        // "leftEye 117.5749692211819 353.46057461393485", "rightEye 205.7178095361138 345.97651262691517", "leftEar 77.94602972245866 379.2998911341805", "rightEar 281.8690584531554 369.025287553958", "leftShoulder 335.8574031132204 526.1043444681725", "rightShoulder 345.20214083779183 534.4283048280946", "leftElbow 144.93267181040244 395.8721472595453", "rightElbow 160.2078358691026 360.22959905839616", "leftWrist 131.08590852611258 411.9703953368191", "rightWrist 194.16663310128888 360.38060763466683", "leftHip 122.3829839684156 495.65892794716683", "rightHip 184.57379459128765 369.88249901203795", "leftKnee 102.41561759028451 492.66939274531865", "rightKnee 150.81288663515318 366.61378140579404", "leftAnkle 140.4927560531675 357.98865886049975", "rightAnkle 148.1822951498662 358.1219268680083"
    ])

    const i = index.get(part)
    const p = pose.keypoints[i]

    if (p.score < rate) {
        return null
    }

    return p.position
}

async function detectPose(video) {
    const net = await posenet.load();

    // const image = document.querySelector('#img')
    // const image = document.querySelector('#video')
    // const image = document.querySelector('#video')

    while (true) {
        const pose = await net.estimateSinglePose(video, {
            flipHorizontal: true,
            decodingMethod: 'single-person'
        });

        // console.log(pose);
        // console.log(pose.keypoints[0].position);
        // const items = pose.keypoints.map(k => {
        //     const {x, y} = k.position
        //     return `${k.part} ${x} ${y}`
        // })
        // console.log(items)
        const pos = getPartPosition(pose, 'nose', 0.9)
        if (pos) {
            trackMode = true

            cursor.set(
                map(pos.x, 0, videoWidth, 0, width),
                map(pos.y, 0, videoHeight, 0, height),
            )
        } else {
            trackMode = false
        }

        // console.log(getPartPosition(pose, 'nose'))
        // console.log(cursor)

        await sleep(10)
    }
}
