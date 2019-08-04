cs.load({
   path: "/cs-engine/",
   canvas: canvas,

   assets: {
      scripts: [
         { path: '/objects/background' },
         { path: '/objects/player' },
         { path: '/objects/joystick' },
         { path: '/objects/controller' },
         { path: '/scripts/network' },
         { path: '/scripts/networkFunctions' },
      ],
      storages: [
         { path: '/storage/keymap', location: 'keymap' },
      ]
   },

   start: () => {
      cs.room.setup({
         width: 300,
         height: 300
      })

      cs.camera.setup({
         maxWidth: 150,
         maxHeight: 150,
         smoothing: 10
      })

      cs.surface.create({ name: 'background', oneToOne: false, drawOutside: true, manualClear: true, depth: 100 })

      cs.global.keymap = cs.storage.read('keymap')
      cs.global.self = undefined

      cs.global.joystick = cs.object.create({ type: 'joystick' })
      cs.global.controller = cs.object.create({ type: 'controller' })
      cs.object.create({ type: 'background' })
      cs.script.network.init()

      window.addEventListener('keydown', () => {
         cs.object.destroy(cs.global.joystick)
      })
   },

   step: () => {

   },

   draw: () => {
      cs.draw.setSurface('gui')
      // debug info
      cs.draw.setColor('#FFF')
      cs.draw.text({
         x: 10,
         y: 10,
         text: cs.global.ping + 'ms'
      })

      cs.draw.setColor('#FFF')
      cs.draw.text({
         x: 10,
         y: 24,
         text: Math.round(cs.network.metrics.downAverage / 1000) + 'kb'
      })
   }
})