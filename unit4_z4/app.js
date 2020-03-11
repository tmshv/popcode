const app = new PIXI.Application({
    // width: 512,
    // height: 512,
    antialias: true,
    transparent: true,
    backgroundColor: '0xFFFFFF',
    // backgroundColor: '#14141e',
    // backgroundColor: '0x000000',
    // resolution: 1
    resizeTo: window,
    autoDensity: true,
    resolution: devicePixelRatio,
});
document.body.appendChild(app.view)

app.loader
    .add('p01', '01.jpg')
    .add('p02', '02.jpg')
    .add('p03', '03.jpg')
    .add('p04', '04.jpg')
    .add('p05', '05.jpg')
    .add('p06', '06.jpg')
    .add('p07', '07.jpg')
    .add('p08', '08.jpg')
    .add('p09', '09.jpg')
    .add('p10', '10.jpg')
    .add('p11', '11.jpg')
    .add('p12', '12.jpg')
    .add('p13', '13.jpg')
    .add('p14', '14.jpg')
    .add('p15', '15.jpg')
    .add('p16', '16.jpg')
    .add('p17', '17.jpg')
    .add('p18', '18.jpg')
    .add('p19', '19.jpg')
    .load((loader, resources) => {
        initApp(resources)
    })

function createMask() {
    const graphics = new PIXI.Graphics()

    // Rectangle
    graphics.beginFill('0xffffff')
    graphics.drawRect(0, 0, 1024, 512)
    graphics.endFill()

    // Rectangle
    graphics.beginFill('0x000000')
    graphics.drawRect(150, 250, 100, 500)
    graphics.endFill()

    // Rectangle
    graphics.beginFill('0x000000')
    graphics.drawRect(500, 150, 300, 200)
    graphics.endFill()

    // // Rectangle
    // graphics.beginFill('0xCCCCCC')
    // graphics.drawRect(300, 300, 100, 100)
    // graphics.endFill()

    return graphics
}

function setPositionCenter(sprite) {
    sprite.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    );

    return sprite
}

function setupChannelSprite(img) {
    const scale = (app.screen.width / img.width) * 0.75
    img.scale.set(scale)
    img.anchor.set(0.5)

    return setPositionCenter(img)
}

function grid(x, y, { include = false, reverse = false }) {
    const result = []
    if (include) {
        x += 1
        y += 1
    }
    for (let j = 0; j < y; j++) {
        for (let i = 0; i < x; i++) {
            result.push([i, j])
        }
    }
    if (reverse) {
        result.reverse()
    }
    return result
}

function repeat(x, { reverse = false }) {
    const result = []
    for (let i = 0; i < x; i++) {
        result.push(i)
    }
    if (reverse) {
        result.reverse()
    }
    return result
}

function isEven(v) {
    return v % 2 === 0
}

class Agent {
    constructor(s) {
        this.sprite = s

        this.hueShift = 0
        this.speedMult = Math.random() * 0.1

        this.colorMatrix = new PIXI.filters.ColorMatrixFilter()
        s.filters = [this.colorMatrix]
    }

    getHueRange() {
        return [0, 180]
    }

    setCoord(x, y) {
        this.sprite.x = x
        this.sprite.y = y
    }

    update(time) {
        const speedMult = this.speedMult
        this.hueShift += time * speedMult
        const v = Math.sin(this.hueShift)

        const [min, max] = this.getHueRange()
        const hue = min + (max - min) * v
        this.colorMatrix.hue(hue)
    }
}

function initApp(resources) {
    app.stage.interactive = true
    const size = 100

    let interferenceStep = 20
    let speedMult = 0.05

    const container = new PIXI.Container();
    app.stage.addChild(container);

    const textures = [
        resources.p01.texture,
        resources.p02.texture,
        resources.p03.texture,
        resources.p04.texture,
        resources.p05.texture,
        resources.p06.texture,
        resources.p07.texture,
        resources.p08.texture,
        resources.p09.texture,
        resources.p10.texture,
        resources.p11.texture,
        resources.p12.texture,
        resources.p13.texture,
        resources.p14.texture,
        resources.p15.texture,
        resources.p16.texture,
        resources.p17.texture,
        resources.p18.texture,
        resources.p19.texture,
    ]

    const agents = grid(
        Math.round(app.screen.width / size),
        Math.round(app.screen.height / size),
        { include: true }
    ).map(([x, y], i) => {
        const index = i % textures.length
        const t = textures[index]
        const s = new PIXI.Sprite(t)
        s.width = size
        s.height = size
        container.addChild(s)

        const agent = new Agent(s)
        agent.setCoord(
            x * size,
            y * size,
        )

        return agent
    })

    // const displacementSprite = new PIXI.Sprite(resources.displacementMap.texture)
    // const displacementSprite = PIXI.Sprite.from('examples/assets/pixi-filters/displace.png');
    // const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    // app.stage.addChild(displacementSprite);
    // container.filters = [displacementFilter];

    // let lastMouseX = 0
    // let lastMouseY = 0
    // let mouseSpeed = 0

    // const chContainer = new PIXI.Container()
    // app.stage.addChild(chContainer)

    function onPointerMove(event) {
        const { x, y } = event.data.global

        const v = x / app.screen.width

        // interferenceStep = Math.round(v * 180)
        // speedMult = v * 0.001


        //     mouseSpeed = Math.sqrt((lastMouseX - x) ** 2, (lastMouseY - y) ** 2)
        //     lastMouseX = x
        //     lastMouseY = y
    }

    app.stage
        .on('mousemove', onPointerMove)
        .on('touchmove', onPointerMove)

    app.ticker.add((time) => {
        for (const agent of agents) {
            agent.update(time)
        }
    })
}
