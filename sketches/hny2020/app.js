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
    const padding = 0
    const width = app.screen.width - (padding * 2)
    const height = app.screen.height - (padding * 2)
    // const height = width * 0.275
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
    const circlesDensity = Math.round(square * 0.02)

    console.log('width', width)
    console.log('height', height)
    console.log('square', square)

    const metaballAgents = repeat(30)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const mass = width * 0.25 //0.15
        const angle = Math.random() * (-Math.PI * 0.25)

        const agent = new Agent(x, y, mass)
        agent.direct(angle)
        agent.getVelocitySpeed = () => 2// + Math.random()
        agent.setFitBorderFn(fitBorderTeleport)

        return agent
    })

    // const circlesMask = (new MetaballTextureBuilder())
    //     .setFrame(width, height)
    //     .setBlurValue(15)
    //     .setContrastValue(1000)
    //     .setAgents(metaballAgents)
    //     .setRenderStep(4)
    //     .setAgentMassMultipier(0.1)
    //     .build()
    const linesMask = (new MetaballTextureBuilder())
        .setFrame(width, height)
        .setBlurValue(15)
        .setContrastValue(1000)
        .setAgents(metaballAgents)
        .setRenderStep(4)
        .setAgentMassMultipier(0.01)
        .build()

    // const maskSpriteCircles = circlesMask.sprite
    // maskSpriteCircles.anchor.set(0.5)
    // maskSpriteCircles.position.set(
    //     app.screen.width / 2,
    //     app.screen.height / 2,
    // )
    // app.stage.addChild(maskSpriteCircles)

    const maskSpriteLines = linesMask.sprite
    maskSpriteLines.anchor.set(0.5)
    maskSpriteLines.position.set(
        app.screen.width / 2,
        app.screen.height / 2,
    )
    app.stage.addChild(maskSpriteLines)

    const container = setupContainer(new PIXI.Container(), 0.5, [width, height], [
        app.screen.width / 2,
        app.screen.height / 2,
    ])
    app.stage.addChild(container)

    const containerCircles = new PIXI.Container()
    container.addChild(containerCircles)

    const containerLines = new PIXI.Container()
    container.addChild(containerLines)

    const circleAgents = repeat(circlesDensity)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const angle = Math.random() * Math.PI * 0.5
        const radius = 2 + Math.round(
            Math.random() * 2
        )

        const agent = (new Agent(x, y))
            .direct(angle)
        agent.setFitBorderFn(fitBorderTeleport)
        agent.getVelocitySpeed = mouse => {
            return 1
            // const dist = agent.location.distance(mouse)
            // return interpolate(.1, 3, (dist / width))
        }

        // color = 0xff7e00
        const color = 0x1ac4ff
        const alpha = 0.5 + Math.random() * 0.5
        const g = new PIXI.Graphics()
        g.lineStyle(0)
        g.beginFill(color, alpha)
        g.drawCircle(0, 0, radius)
        g.endFill()
        containerCircles.addChild(g)

        agent.addGraphic(g)

        return agent
    })
    const lineAgents = repeat(v)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const angle = Math.random() * Math.PI * 2

        const agent = (new Agent(x, y)).direct(angle)
        agent.getVelocitySpeed = (mouse) => {
            return 1
            // const dist = agent.location.distance(mouse)
            // return interpolate(5, 1, (dist / width))
        }
        agent.run = () => {}

        color = 0xff7e00
        const g = new PIXI.Graphics()
        g.lineStyle(5, color, 1)
        g.lineTo(30, 0)
        g.endFill()
        containerLines.addChild(g)

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

    // MASK AGENTS WITH METABALLS
    // containerCircles.mask = maskSpriteCircles
    containerLines.mask = maskSpriteLines

    // const patternContainer = setupContainer(new PIXI.Graphics(), 0.5, [width, height], [
    //     app.screen.width / 2,
    //     app.screen.height / 2,
    // ])
    // const patternGraphic = new PIXI.Graphics()
    // patternContainer.addChild(patternGraphic)
    // patternContainer.mask = title
    // app.stage.addChild(patternContainer)

    // app.stage.addChild(title2)
    // app.stage.addChild(patternContainer)
    app.stage.addChild(title)
    container.mask = title

    app.stage.addChild(container)

    function onPointerMove(event) {
        mouse = event.data.global
    }

    app.stage
        .on('mousemove', onPointerMove)
        .on('touchmove', onPointerMove)

    const patternStep = 13
    let patternTime = 0
    const patternWidth = (width + (height * 2)) // plus two heights cause 45 degrees
    const patternLines = Math.round(
        patternWidth / patternStep
    )
    const skipIndex = Math.round(
        height / patternStep
    )

    app.ticker.add(() => {
        // update magenta pattern
        // patternGraphic.clear(5, 0x00ffff, 1)
        // repeat(patternLines)(index => {
        //     i = index - skipIndex
        //     const angle = patternTime * i
        //     const t = 2 + (1 + Math.cos(angle)) * 2
        //     patternGraphic.lineStyle(t, 0x00ffff, 1)
        //     patternGraphic.moveTo(i * patternStep, 0)
        //     patternGraphic.lineTo(i * patternStep + height, height)
        // })
        // patternTime += 0.001

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

        // circlesMask.update(app)
        linesMask.update(app)
    })
}

function main() {
    app.loader
        // .add('title', '2020_white_inverse.png')
        .add('title', '2020_2.png')
        .load((loader, resources) => {
            initApp(app, resources)
        })
    // const container = new PIXI.Container()
    // app.stage.addChild(container)
    // const g = new PIXI.Graphics()
    // container.addChild(g)

    // g.beginFill(0x000077, 1)
    // g.drawRect(10, 10, 50, 50)

    // const body = new Flexbox(app.screen.width, app.screen.height)

    // const item1 = Flexbox.new({
    //     width: null,
    //     height: 50,
    //     minWidth: 50,
    // }).setContent((x, y, w, h) => {
    //     g.beginFill(0xff00ff, 1)
    //     g.drawRect(x, y, w, h)
    // })

    // const item2 = Flexbox.new({
    //     width: null,
    //     height: 50,
    //     minWidth: 50,
    // }).setContent((x, y, w, h) => {
    //     g.beginFill(0xff0000, 1)
    //     g.drawRect(x, y, w, h)
    // })

    // body.addChild(item1)
    // body.addChild(item2)

    // body.calc()
    // body.render()
}
main()