const app = new PIXI.Application({
    width: 512,
    height: 512,
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
document.body.appendChild(app.view);

app.loader
    .add('unit4', 'unit4.png')
    // .add('unit4', 'unit4_transparent.png')
    .add('displacementMap', 'displacement_map_repeat.jpg')
    .load((loader, resources) => {
        // initTestApp(resources)
        initApp(resources)
    })

function initTestApp(resources) {
    let ch
    ch = setupChannelSprite(new PIXI.Sprite(resources.unit4.texture))
    ch.filters = [
        createInvertColorFilter(),
        createChannelFilter([1, 0, 1]),
    ]

    ch = setupChannelSprite(new PIXI.Sprite(resources.unit4.texture))
    ch.filters = [
        createInvertColorFilter(),
        createChannelFilter([1, 1, 0]),
    ]

    ch = setupChannelSprite(new PIXI.Sprite(resources.unit4.texture))
    ch.filters = [
        createInvertColorFilter(),
        createChannelFilter([0, 1, 1]),
    ]

    app.stage.addChild(ch)
}

function createInvertColorFilter() {
    const v = -1
    const f = new PIXI.filters.ColorMatrixFilter()
    f.matrix = [
        v, 0, 0, 0, 1,
        0, v, 0, 0, 1,
        0, 0, v, 0, 1,
        0, 0, 0, 1, 0,
    ]

    return f
}

function createChannelFilter([r, g, b]) {
    const f = new PIXI.filters.ColorMatrixFilter()
    f.matrix = [
        1, 0, 0, 0, r,
        0, 1, 0, 0, g,
        0, 0, 1, 0, b,
        0, 0, 0, 1, 0,
    ]

    return f
}

function createDisplacementFilter(sprite, scale) {
    const filter = new PIXI.filters.DisplacementFilter(sprite)
    filter.blendMode = PIXI.BLEND_MODES.MULTIPLY
    // filter.blendMode = PIXI.BLEND_MODES.SCREEN
    filter.scale.set(scale)
    // displacementFilter.padding = 10;

    return filter
}

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

function initApp(resources) {
    let lastMouseX = 0
    let lastMouseY = 0
    let mouseSpeed = 0

    app.stage.interactive = true

    const chContainer = new PIXI.Container()
    app.stage.addChild(chContainer)

    const displacementSprite = setPositionCenter(new PIXI.Sprite(resources.displacementMap.texture))
    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
    app.stage.addChild(displacementSprite)

    const displacementSprite2 = setPositionCenter(new PIXI.Sprite(resources.displacementMap.texture))
    displacementSprite2.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
    app.stage.addChild(displacementSprite2)

    let texture = app.renderer.generateTexture(createMask())
    const displacementSprite3 = new PIXI.Sprite(texture)
    app.stage.addChild(displacementSprite3)

    let ch
    ch = setupChannelSprite(new PIXI.Sprite(resources.unit4.texture))
    ch.filters = [
        // createInvertColorFilter(),
        createChannelFilter([1, 0, 1]),
        createDisplacementFilter(displacementSprite, 30),
    ]
    chContainer.addChild(ch)
    const ch1 = ch

    ch = setupChannelSprite(new PIXI.Sprite(resources.unit4.texture))
    ch.filters = [
        // createInvertColorFilter(),
        createChannelFilter([1, 1, 0]),
        createDisplacementFilter(displacementSprite2, 60),
    ]
    chContainer.addChild(ch)
    const ch2 = ch

    ch = setupChannelSprite(new PIXI.Sprite(resources.unit4.texture))
    ch.filters = [
        // createInvertColorFilter(),
        createChannelFilter([0, 1, 1]),
        createDisplacementFilter(displacementSprite3, 10),
    ]
    chContainer.addChild(ch)
    const ch3 = ch

    function onPointerMove(event) {
        const { x, y } = event.data.global

        mouseSpeed = Math.sqrt((lastMouseX - x) ** 2, (lastMouseY - y) ** 2)
        lastMouseX = x
        lastMouseY = y
    }

    app.stage
        .on('mousemove', onPointerMove)
        .on('touchmove', onPointerMove)

    const imgScale = ch1.scale.x

    app.ticker.add(() => {
        // displacementSprite.x += Math.max(10, mouseSpeed)
        displacementSprite.x += 10 * mouseSpeed
        // Reset x to 0 when it's over width to keep values from going to very huge numbers.
        if (displacementSprite.x > displacementSprite.width) {
            displacementSprite.x = 0;
        }

        // displacementSprite2.x -= Math.max(5, mouseSpeed)
        displacementSprite2.y -= 10 * mouseSpeed
        if (displacementSprite2.y < 0) {
            displacementSprite2.y = displacementSprite2.height + displacementSprite2.y
        }

        if (Math.random() < 0.5) {
            displacementSprite3.position.set(
                Math.random() * displacementSprite3.width,
                Math.random() * displacementSprite3.height,
            )
        }

        const prob = 0.0005 * mouseSpeed
        // const prob = 0.05

        if (Math.random() < prob) {
            ch1.scale.set(
                1 + Math.random() * 1,
                1,
            )
        } else {
            ch1.scale.set(imgScale)
        }

        if (Math.random() < prob) {
            ch2.scale.set(
                1 + Math.random() * 0.5,
                1,
            )
            // ch2.position.set(
            //     1 + Math.random() * 0.5,
            //     1,
            // )
        } else {
            ch2.scale.set(imgScale)
        }

        if (Math.random() < prob) {
            ch3.scale.set(
                1 + Math.random() * 0.5,
                1,
            )
        } else {
            ch3.scale.set(imgScale)
        }
    })
}
