// using original library https://github.com/ko-yelie/kgl

/**
 * utils
 */
function loadImage(srcs, isCrossOrigin) {
  if (!(typeof srcs === 'object' && srcs.constructor.name === 'Array')) {
    srcs = [srcs]
  }
  let promises = []
  srcs.forEach(src => {
    const img = document.createElement('img')
    promises.push(
      new Promise(resolve => {
        img.addEventListener('load', () => {
          resolve(img)
        })
      })
    )
    if (isCrossOrigin) img.crossOrigin = 'anonymous'
    img.src = src
  })
  return Promise.all(promises)
}

function mix(x, y, a) {
  return x * (1 - a) + y * a
}

/**
 * main
 */
; (async function main() {
  const image = 'https://images.unsplash.com/photo-1519567770579-c2fc5436bcf9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1200&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ'
  // https://unsplash.com/photos/qwHHOC2z5Xs
  const speed = 0.4
  const maxStrength = 13
  const minStrength = 3
  const maxRadius = window.innerWidth < 768 ? 0.08 : 0.3
  const minRadius = window.innerWidth < 768 ? 0.01 : 0.05

  const [img] = await loadImage(image, true)

  const webgl = new Kgl({
    programs: {
      mask: {
        fragmentShaderId: 'mask',
        uniforms: {
          image: img,
          imageResolution: [img.width, img.height],
          progress: 0,
        }
      },
    },
    effects: [
      'godray',
    ],
    framebuffers: [
      'mask',
      'cache',
      'output'
    ],
    tick: time => {
      const progress = Math.sin(time * speed) * 0.5 + 0.5;

      webgl.bindFramebuffer('mask')
      webgl.programs['mask'].draw({
        progress
      })

      webgl.effects['godray'].draw(
        'mask',
        'cache',
        'output',
        mix(maxStrength, minStrength, progress),
        [
          mix(webgl.canvas.width * -0.2, webgl.canvas.width * 0.3, progress),
          webgl.canvas.height * 1.2,
        ],
        mix(maxRadius, minRadius, progress),
        true
      )
    },
  })
})()