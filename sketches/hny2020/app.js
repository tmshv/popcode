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

    const v = Math.round(square * 0.005)
    const circlesDensity = Math.round(square * 0.02)

    console.log('width', width)
    console.log('height', height)
    console.log('square', square)

    const metaballAgents = repeat(20)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const mass = width * Math.random() * 0.15
        const angle = Math.random() * (-Math.PI * 0.25)

        const agent = new Agent(x, y, mass)
        agent.direct(angle)
        agent.getVelocitySpeed = () => 2// + Math.random()
        agent.setFitBorderFn(fitBorderTeleport)

        return agent
    })

    const maskLines = new PIXI.Graphics()
    app.stage.addChild(maskLines)

    const maskLines2 = new PIXI.Graphics()
    app.stage.addChild(maskLines2)

    const container = setupContainer(new PIXI.Container(), 0.5, [width, height], [
        app.screen.width / 2,
        app.screen.height / 2,
    ])
    app.stage.addChild(container)

    const containerCircles = new PIXI.Container()
    container.addChild(containerCircles)

    const containerLines = new PIXI.Container()
    container.addChild(containerLines)

    const containerLines2 = new PIXI.Container()
    container.addChild(containerLines2)

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

        const color = 0x1ac4ff
        const alpha = Math.random()
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
        agent.run = () => { }

        const color = 0xff00ff
        const g = new PIXI.Graphics()
        g.lineStyle(5, color, 1)
        g.lineTo(30, 0)
        g.endFill()
        containerLines.addChild(g)

        agent.addGraphic(g)

        return agent
    })

    const lineAgents2 = repeat(v)(i => {
        const x = Math.random() * width
        const y = Math.random() * height
        const angle = Math.random() * Math.PI * 2

        const agent = (new Agent(x, y)).direct(angle)
        agent.getVelocitySpeed = (mouse) => {
            return 1
            // const dist = agent.location.distance(mouse)
            // return interpolate(5, 1, (dist / width))
        }
        agent.run = () => { }

        const color = 0xff7e00
        const g = new PIXI.Graphics()
        g.lineStyle(5, color, 1)
        g.lineTo(30, 0)
        g.endFill()
        containerLines2.addChild(g)

        agent.addGraphic(g)

        return agent
    })

    const agents = [...circleAgents, ...lineAgents, ...lineAgents2]

    const title = new PIXI.Sprite(resources.title.texture)
    title.scale.set(0.35)

    // MASK AGENTS WITH METABALLS
    containerLines.mask = maskLines
    containerLines2.mask = maskLines2

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

        maskLines.clear()
        maskLines2.clear()
        for (const agent of metaballAgents) {
            agent.run({
                border: {
                    width,
                    height
                }
            })
            maskLines.beginFill(0x000077, 1)
            maskLines.drawCircle(agent.location.x, agent.location.y, agent.mass)

            maskLines2.beginFill(0x000077, 1)
            maskLines2.drawCircle(agent.location.x, agent.location.y, agent.mass * 0.5)
        }
    })
}

function main() {
    app.loader
        .add('title', '2020.png')
        .load((loader, resources) => {
            initApp(app, resources)
        })
}
main()