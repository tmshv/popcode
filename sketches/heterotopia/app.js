function repeat(times) {
    return fn => {
        const result = []

        for (let i = 0; i < times; i++) {
            result.push(fn(i))
        }

        return result
    }
}

const app = new PIXI.Application({
    // width: 512,
    // height: 512,
    antialias: true,
    transparent: true,
    // backgroundColor: '0xFFFFFF',
    // backgroundColor: 0xffffff,
    // backgroundColor: '0x000000',
    // resolution: 1
    resizeTo: window,
    autoDensity: true,
    resolution: devicePixelRatio,
});
document.body.appendChild(app.view)

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
        if (this.location.x < 0) {
            this.location.x = 1
            this.velocity.x *= -1
        }
        if (this.location.x > width) {
            this.location.x = width - 1
            this.velocity.x *= -1
        }
        if (this.location.y < 0) {
            this.location.y = 1
            this.velocity.y *= -1
        }
        if (this.location.y > height) {
            this.location.y = height - 1
            this.velocity.y *= -1
        }
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

app.loader
    .add('title', 'title.svg')
    .add('titleBlack', 'title_black.svg')
    .add('noise', 'noise.jpg')
    .add('test', 'test.jpg')
    .add('test2', 'test2.jpg')
    .add('noise1', 'noise1_b.jpg')
    .add('noise2', 'noise2_b.jpg')
    .load((loader, resources) => {
        // initTest(app, resources)
        initApp(app, resources)
    })

function renderMetaball(g, massMultiplier, step, width, height, agents, color) {
    g.lineStyle(0)
    g.beginFill(color, 1)

    for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
            let sum = 0;

            for (const a of agents) {
                const dx = x - a.location.x;
                const dy = y - a.location.y;
                const massQuad = a.mass * a.mass * massMultiplier

                sum += massQuad / (dx * dx + dy * dy)
            }

            if (sum > 1) {
                g.drawRect(x, y, step, step)
            }
        }
    }

    g.endFill()
}

class MetaballTextureBuilder {
    setFrame(width, height) {
        this.frame = [width, height]
        return this
    }

    setBlurValue(value) {
        this.blur = value
        return this
    }

    setContrastValue(value) {
        this.contrast = value
        return this
    }

    setAgents(value) {
        this.agents = value
        return this
    }

    setRenderStep(value) {
        this.step = value
        return this
    }

    setAgentMassMultipier(value) {
        this.massMultiplier = value
        return this
    }

    build() {
        const [width, height] = this.frame

        const contrastFilter = new PIXI.filters.ColorMatrixFilter()
        contrastFilter.contrast(this.contrast)

        const metaballContainer = new PIXI.Container()
        metaballContainer.filters = [
            new PIXI.filters.BlurFilter(this.blur),
            contrastFilter,
        ]

        const metaballGraphics = new PIXI.Graphics()
        metaballContainer.addChild(metaballGraphics)

        const baseTexture = new PIXI.BaseRenderTexture(width, height, PIXI.SCALE_MODES.LINEAR, 1)
        const renderTexture = new PIXI.RenderTexture(baseTexture)
        const metaballSprite = new PIXI.Sprite(renderTexture)

        return {
            sprite: metaballSprite,
            update: (app) => {
                metaballGraphics.clear()
                renderMetaball(
                    metaballGraphics,
                    this.massMultiplier,
                    this.step,
                    width,
                    height,
                    this.agents,
                    0xffffff
                )

                app.renderer.render(metaballContainer, renderTexture)
            }
        }
    }
}

function calcScale(app, padding, width) {
    const w = app.screen.width - (padding * 2)

    return w / width
}

function initTest(app, resources) {
    const padding = 10
    const width = app.screen.width - (padding * 2)
    const height = width * 0.275
    const square = width * height

    console.log('width', width)
    console.log('height', height)
    console.log('square', square)

    const metaballAgents = repeat(15)(i => {
        const x = Math.random() * width
        const y = Math.random() * height

        const mass = width * 0.15

        const agent = new Agent(x, y, mass)
        agent.getVelocitySpeed = () => 1 + Math.random()

        return agent
    })

    const mask1 = (new MetaballTextureBuilder())
        .setFrame(width, height)
        .setBlurValue(15)
        .setContrastValue(1000)
        .setAgents(metaballAgents)
        .setRenderStep(4)
        .setAgentMassMultipier(0.1)
        .build()
    const mask2 = (new MetaballTextureBuilder())
        .setFrame(width, height)
        .setBlurValue(15)
        .setContrastValue(1000)
        .setAgents(metaballAgents)
        .setRenderStep(4)
        .setAgentMassMultipier(0.01)
        .build()

    const maskSprite1 = mask1.sprite
    maskSprite1.anchor.set(0.5)
    maskSprite1.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )
    app.stage.addChild(maskSprite1)

    const maskSprite2 = mask2.sprite
    maskSprite2.anchor.set(0.5)
    maskSprite2.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )
    app.stage.addChild(maskSprite2)

    const layoutContainer = new PIXI.Container()
    app.stage.addChild(layoutContainer)

    const sprite1 = new PIXI.Sprite(resources.test.texture)
    sprite1.mask = maskSprite1
    layoutContainer.addChild(sprite1)

    const sprite2 = new PIXI.Sprite(resources.test2.texture)
    sprite2.mask = maskSprite2
    layoutContainer.addChild(sprite2)

    app.ticker.add(() => {
        for (const agent of metaballAgents) {
            agent.run({
                border: {
                    width,
                    height
                }
            })
        }

        mask1.update(app)
        mask2.update(app)
    })
}

function setupContainer(container, anchor, frame, pos) {
    const [x, y] = pos
    const [width, height] = frame

    container.pivot.x = anchor * width / container.scale.x
    container.pivot.y = anchor * height / container.scale.y

    container.x = x
    container.y = y

    return container
}

function initApp(app, resources) {
    const padding = 50
    const width = app.screen.width - (padding * 2)
    const height = width * 0.275
    const square = width * height

    mouse = {
        x: 0,
        y: 0,
    }
    app.stage.interactive = true

    console.log(`${app.screen.width}x${app.screen.height}`)

    const v = Math.round(
        (width * height) * 0.01
    )

    console.log('width', width)
    console.log('height', height)
    console.log('square', square)

    const metaballAgents = repeat(15)(i => {
        const x = Math.random() * width
        const y = Math.random() * height

        const mass = width * 0.15

        const agent = new Agent(x, y, mass)
        agent.getVelocitySpeed = () => 1 + Math.random()

        return agent
    })

    const mask1 = (new MetaballTextureBuilder())
        .setFrame(width, height)
        .setBlurValue(15)
        .setContrastValue(1000)
        .setAgents(metaballAgents)
        .setRenderStep(4)
        .setAgentMassMultipier(0.1)
        .build()
    const mask2 = (new MetaballTextureBuilder())
        .setFrame(width, height)
        .setBlurValue(15)
        .setContrastValue(1000)
        .setAgents(metaballAgents)
        .setRenderStep(4)
        .setAgentMassMultipier(0.01)
        .build()

    const maskSprite1 = mask1.sprite
    maskSprite1.anchor.set(0.5)
    maskSprite1.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )
    app.stage.addChild(maskSprite1)

    const maskSprite2 = mask2.sprite
    maskSprite2.anchor.set(0.5)
    maskSprite2.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )
    app.stage.addChild(maskSprite2)

    const container = setupContainer(new PIXI.Container(), 0.5, [width, height], [
        app.screen.width / 2,
        app.screen.height / 2,
    ])
    app.stage.addChild(container)

    const container1 = new PIXI.Container()
    container.addChild(container1)

    const container2 = new PIXI.Container()
    container.addChild(container2)

    const circleAgents = repeat(v)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const angle = Math.random() * Math.PI * 2
        const radius = 3 + Math.round(
            Math.random() * 2
        )

        const agent = (new Agent(x, y))
            .direct(angle)
        agent.getVelocitySpeed = mouse => {
            const dist = agent.location.distance(mouse)

            return dist * 0.0025
        }

        const g = new PIXI.Graphics()
        g.lineStyle(0)
        g.beginFill(0xff7e00, 1)
        g.drawCircle(0, 0, radius)
        g.endFill()
        container1.addChild(g)

        agent.addGraphic(g)

        return agent
    })
    const lineAgents = repeat(v)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const angle = Math.random() * Math.PI * 2

        const agent = (new Agent(x, y))
            .direct(angle)
        agent.getVelocitySpeed = (mouse) => {
            const dist = agent.location.distance(mouse)

            return m = 1 / (dist * 0.009)
        }

        const g = new PIXI.Graphics()
        g.lineStyle(5, 0x1ac4ff, 1)
        // g.beginFill(0x1ac4ff, 1)
        g.lineTo(30, 0)
        g.endFill()
        container2.addChild(g)

        agent.addGraphic(g)

        return agent
    })

    const agents = [...circleAgents, ...lineAgents]

    const title = new PIXI.Sprite(resources.title.texture)
    title.scale.set(calcScale(app, padding, title.width))
    title.anchor.set(0.5)
    title.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )

    const title2 = new PIXI.Sprite(resources.titleBlack.texture)
    title2.scale.set(calcScale(app, padding, title2.width))
    title2.anchor.set(0.5)
    title2.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )

    container1.mask = maskSprite1
    container2.mask = maskSprite2

    app.stage.addChild(title2)
    app.stage.addChild(title)
    container.mask = title

    app.stage.addChild(container)

    function onPointerMove(event) {
        mouse = event.data.global
    }

    app.stage
        .on('mousemove', onPointerMove)
        .on('touchmove', onPointerMove)

    app.ticker.add(() => {
        for (const agent of agents) {
            agent.run({
                mouse,
                border: {
                    width,
                    height,
                }
            })
            agent.render()
        }

        for (const agent of metaballAgents) {
            agent.run({
                border: {
                    width,
                    height
                }
            })
        }

        mask1.update(app)
        mask2.update(app)
    })
}
