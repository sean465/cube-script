// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/cs-engine/src/Camera.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: CAMERA |------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_CAMERA {
      constructor(cs) {
         this.cs = cs

         this.x = 0
         this.y = 0
         this.centerX = 0
         this.centerY = 0
         this.followPos = { x: 0, y: 0 }
         this.zoom = 1
         this.targetZoom = 1
         this.scale = 1
         this.width = 0
         this.height = 0
         this.maxWidth = 0
         this.maxHeight = 0
         this.smoothing = 1
         this.smoothingZoom = 1

         this.config = {
            maxWidth: 0,
            maxHeight: 0,
            scale: 1,
            zoom: 1,
            smoothing: 1, // 1 means 1:1 movement
            smoothingZoom: 1,
            fixedScaling: true,
         }
      }

      // should happen once
      setup(options) {
         this.configure(options)
         this.scale = this.config.scale
         this.maxWidth = this.config.maxWidth
         this.maxHeight = this.config.maxHeight
         this.cs.resize()
      }

      // can change anytime (zoom, smoothing, etc)
      configure({
         zoom,
         scale,
         maxWidth,
         maxHeight,
         smoothing,
         smoothingZoom,
         fixedScaling,
      }) {
         this.config.maxWidth = this.cs.default(maxWidth, this.config.maxWidth)
         this.config.maxHeight = this.cs.default(maxHeight, this.config.maxHeight)
         this.config.scale = this.cs.default(scale, this.config.scale)
         this.config.zoom = this.cs.default(zoom, this.config.zoom)
         this.config.smoothing = this.cs.default(smoothing, this.config.smoothing)
         this.config.smoothingZoom = this.cs.default(smoothingZoom, this.config.smoothingZoom)
         this.config.fixedScaling = this.cs.default(fixedScaling, this.config.fixedScaling)

         this.smoothing = this.config.smoothing
         this.smoothingZoom = this.config.smoothingZoom
      }

      resize() {
         const w = this.cs.canvas.width
         const h = this.cs.canvas.height

         if (this.maxWidth && this.maxHeight) {
            this.scale = this.config.fixedScaling
               ? Math.max(1, Math.ceil(h / this.maxHeight))
               : h / this.maxHeight

            if (this.scale < w / this.maxWidth) {
               this.scale = this.config.fixedScaling
                  ? Math.max(1, Math.ceil(w / this.maxWidth))
                  : w / this.maxWidth
            }
         }

         this.width = w / this.scale
         this.height = h / this.scale
      }

      snap({ x, y }) {
         this.follow({ x, y })
         this.update(1)
      }

      follow({ x, y }) {
         this.followPos = {
            x: x,
            y: y,
         }
      }

      update(smoothing) {
         smoothing = this.cs.default(smoothing, this.smoothing)

         // smooth zooming
         const differenceZoom = this.config.zoom - this.zoom
         this.zoom += differenceZoom / this.smoothingZoom
         // if zooming turn smoothing off
         if (differenceZoom) smoothing = 1

         const scale = this.info().zScale
         this.width = this.cs.canvas.width / scale
         this.height = this.cs.canvas.height / scale

         const differenceX = this.followPos.x - (this.x + this.width / 2)
         const differenceY = this.followPos.y - (this.y + this.height / 2)

         this.x = this.x + differenceX / smoothing
         this.y = this.y + differenceY / smoothing

         if (this.x < 0) this.x = 0
         if (this.y < 0) this.y = 0

         if (this.x + this.width > this.cs.room.width) {
            this.x = (this.cs.room.width - this.width)
               / (this.cs.room.width < this.width ? 2 : 1)
         }

         if (this.y + this.height > this.cs.room.height) {
            this.y = (this.cs.room.height - this.height)
               / (this.cs.room.height < this.height ? 2 : 1)
         }

         this.centerX = this.x + this.width / 2
         this.centerY = this.y + this.height / 2
      }

      zoomOut() {
         if (this.config.zoom >= 2) this.config.zoom -= 1
      }

      zoomIn() {
         this.config.zoom += 1
      }

      outside({ x, y, width, height }) {
         if (x + width < this.x
            || x > this.x + this.width
            || y + height < this.y
            || y > this.y + this.height
         ) {
            return true
         }
         return false
      }

      info() {
         return {
            zoom: Math.round(this.zoom * 1000) / 1000,
            scale: Math.round(this.scale * 1000) / 1000,
            zScale: Math.round(this.scale * this.zoom * 1000) / 1000,
            x: Math.round(this.x * 1000) / 1000 - 0.005, // prevent 0.5 artifacts
            y: Math.round(this.y * 1000) / 1000 - 0.005,
            width: Math.round(this.width * 1000 + 0.010) / 1000,
            height: Math.round(this.height * 1000 + 0.010) / 1000,
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_CAMERA
   else cs.camera = new CSENGINE_CAMERA(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Destroy.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: DESTROY |------------------------ //
// -------------------------------------------------------------------------- //

(() => {
   const CSENGINE_DESTROY = function() {
      console.log('cs-engine destroying')
      this.loop.stop()
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_DESTROY
   else cs.destroy = CSENGINE_DESTROY // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Draw.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------------| CS ENGINE: DRAW |-------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_DRAW {
      constructor(cs) {
         this.cs = cs
         this.debug = {}
         this.surface = undefined
         this.config = {
            defaults: {
               alpha: 1,
               width: 1,
               font: { size: 12, family: 'Arial' },
               textAlign: 'start',
               textBaseline: 'top',
               color: '#000',
               lineHeight: 10,
               lineDash: [],
               operation: 'source-over',
            },
            current: {}, // will clone on settingsDefault()
         }
      }

      setSurface(surfaceName) {
         this.surface = this.cs.surface.list[surfaceName]
         this.scale = 1
         this.cameraX = 0
         this.cameraY = 0
         this.cameraWidth = this.surface.width
         this.cameraHeight = this.surface.height
         this.zScaleHack = 0

         if (this.surface.useCamera && this.surface.oneToOne) {
            const camera = this.cs.camera.info()

            this.scale = camera.zScale
            this.cameraX = camera.x
            this.cameraY = camera.y
            this.cameraWidth = camera.width
            this.cameraHeight = camera.height

            // helps sync up scaled surfaces with unscaled
            if (this.surface.oneToOne && camera.scale > 1) {
               this.zScaleHack = 1
            }
         }

         this.settingsDefault()
      }

      debugReset() {
         this.debug = {
            spritesSkipped: this.debug.spritesSkippedCount,
            spritesDrawn: this.debug.spritesDrawnCount,
            rectanglesSkipped: this.debug.rectanglesSkippedCount,
            rectanglesDrawn: this.debug.rectanglesDrawnCount,
            shapesSkipped: this.debug.shapesSkippedCount,
            shapesDrawn: this.debug.shapesDrawnCount,
            circlesSkipped: this.debug.circlesSkippedCount,
            circlesDrawn: this.debug.circlesDrawnCount,
            spritesSkippedCount: 0,
            spritesDrawnCount: 0,
            rectanglesSkippedCount: 0,
            rectanglesDrawnCount: 0,
            shapesSkippedCount: 0,
            shapesDrawnCount: 0,
            circlesSkippedCount: 0,
            circlesDrawnCount: 0,
         }
      }

      outside(o) {
         return (
            o.x + o.width < this.cameraX
            || o.x > this.cameraX + this.cameraWidth
            || o.y + o.height < this.cameraY
            || o.y > this.cameraY + this.cameraHeight
         )
      }

      sprite(options) {
         const { scale } = this
         const info = this.cs.sprite.info(options)
         const { frame } = info
         const xOff = info.xoff
         const yOff = info.yoff

         // dest
         let dx = options.x - this.cameraX
         let dy = options.y - this.cameraY
         let dWidth = info.width
         let dHeight = info.height

         // source
         const sx = 0
         const sy = 0
         let sWidth = info.fWidth
         let sHeight = info.fHeight

         // trimming
         if (options.hTrim) {
            sHeight -= options.hTrim
            dHeight -= options.hTrim
         }

         if (options.wTrim) {
            sWidth -= options.wTrim
            dWidth -= options.wTrim
         }

         // when flipping match the pixel
         if (info.scaleX < 0 && xOff) dx += 1
         if (info.scaleY < 0 && yOff) dy += 1

         const rotateOrSomething = (info.scaleX < 0 || info.scaleY < 0 || info.angle)
         if (rotateOrSomething) {
            this.surface.ctx.save()
            this.surface.ctx.translate((dx * scale), (dy * scale))
            this.surface.ctx.rotate((options.angle * Math.PI) / 180)
            this.surface.ctx.scale(info.scaleX, info.scaleY)

            this.surface.ctx.drawImage(
               frame,
               sx, sy, sWidth, sHeight,
               (-xOff * scale),
               (-yOff * scale + this.zScaleHack),
               (dWidth * scale),
               (dHeight * scale),
            )

            this.surface.ctx.restore()
         } else {
            this.surface.ctx.drawImage(
               frame,
               sx, sy, sWidth, sHeight,
               ((dx - xOff) * scale),
               ((dy - yOff) * scale) + this.zScaleHack,
               (dWidth * scale),
               (dHeight * scale),
            )
         }

         this.debug.spritesDrawnCount += 1
         this.settingsDefault()
      }

      textInfo(options) {
         // Guessing the size
         const textArr = (options.text.toString()).split('')
         const lines = []
         let curLine = []

         // Setup the lines
         for (const pos in textArr) {
            curLine.push(textArr[pos])

            if (this.surface.ctx.measureText(curLine.join('')).width > options.width) {
               // Try to find a space
               let o = curLine.length
               for (o; o > 0; o -= 1) {
                  if (curLine[o] === ' ') break
               }

               // If no space add a dash
               if (!o) {
                  o = curLine.length - 2
                  curLine.splice(o - 1, 0, '-')
               }

               // Draw and reset
               lines.push(curLine.slice(0, o).join('').trim())
               curLine = curLine.slice(o, curLine.length)
            }

            if (pos === textArr.length - 1) {
               lines.push(curLine.join('').trim())
            }
         }

         return {
            lines: lines,
            lineHeight: options.lineHeight,
            width: options.width,
            height: lines.length * options.lineHeight,
         }
      }

      text(options) {
         const x = options.x - this.cameraX
         const y = options.y - this.cameraY
         const { scale } = this

         if (options.center) this.cs.draw.setTextCenter()

         if (options.lines) {
            for (const line in options.lines) {
               const lineYOffset = (line * (options.lineHeight || this.surface.ctx.lineHeight))
               this.surface.ctx.fillText(
                  options.lines[line],
                  x * scale,
                  (y + lineYOffset) * scale,
               )
            }
         } else {
            this.surface.ctx.fillText(
               options.text,
               Math.floor(x * scale),
               Math.floor(y * scale),
            )
         }
         this.settingsDefault()
      }

      textWidth(str) {
         return this.surface.ctx.measureText(str).width
      }

      line(options) {
         const { scale } = this
         const { lineWidth } = this.surface.ctx
         const lineWidthAdjust = lineWidth / 2 / scale

         const x1 = options.points[0].x * scale + lineWidthAdjust - this.cameraX * scale
         const x2 = options.points[1].x * scale + lineWidthAdjust - this.cameraX * scale
         const y1 = options.points[0].y * scale - lineWidthAdjust - this.cameraY * scale
         const y2 = options.points[1].y * scale - lineWidthAdjust - this.cameraY * scale

         this.surface.ctx.beginPath()
         this.surface.ctx.moveTo(x1, y1)
         this.surface.ctx.lineTo(x2, y2)
         this.surface.ctx.stroke()
         this.settingsDefault()
      }

      fillRect(args) {
         // console.log('drawing', args)
         const { scale } = this
         const width = this.cs.default(args.width, args.size)
         const height = this.cs.default(args.height, args.size)
         let { x, y } = args

         if (args.center) {
            x -= width / 2
            y -= height / 2
         }

         if (this.outside({ x: x, y: y, width: width, height: height })) {
            this.debug.rectanglesSkippedCount += 1
            this.settingsDefault()
            return
         }

         this.debug.rectanglesDrawnCount += 1

         this.surface.ctx.fillRect(
            (x - this.cameraX) * scale,
            (y - this.cameraY) * scale,
            width * scale,
            height * scale,
         )
         this.settingsDefault()
      }

      strokeRect(args) {
         const { scale } = this
         const { lineWidth } = this.surface.ctx
         const lineWidthAdjust = lineWidth / 2 / scale

         let x = args.x + lineWidthAdjust
         let y = args.y + lineWidthAdjust
         const width = this.cs.default(args.width, args.size) - lineWidthAdjust * 2
         const height = this.cs.default(args.height, args.size) - lineWidthAdjust * 2

         if (args.center) {
            x -= width / 2
            y -= height / 2
         }

         if (this.outside({ x: x, y: y, width: width, height: height })) {
            this.debug.rectanglesSkippedCount += 1
            this.settingsDefault()
            return
         }

         this.debug.rectanglesDrawnCount += 1

         this.surface.ctx.strokeRect(
            (x - this.cameraX) * scale,
            (y - this.cameraY) * scale,
            width * scale,
            height * scale,
         )

         this.settingsDefault()
      }

      circle(options) {
         const { radius, fill } = options
         const { scale } = this
         const x = options.pos ? options.pos.x : options.x
         const y = options.pos ? options.pos.y : options.y
         const start = (this.cs.default(options.start, 0) - 90) * (Math.PI / 180)
         const end = (this.cs.default(options.end, 360) - 90) * (Math.PI / 180)

         if (this.outside({
            x: x - radius,
            y: y - radius,
            width: radius * 2,
            height: radius * 2,
         })) {
            this.debug.circlesSkippedCount += 1
            this.settingsDefault()
            return
         }

         this.debug.circleDrawnCount += 1

         this.surface.ctx.beginPath()
         this.surface.ctx.arc(
            (x - this.cameraX) * scale,
            (y - this.cameraY) * scale,
            radius * scale,
            start,
            end,
         )

         if (fill) this.surface.ctx.fill()
         else this.surface.ctx.stroke()

         this.settingsDefault()
      }

      circleGradient(options) {
         const { scale } = this
         const { radius, colorStart, colorEnd } = options
         const x = options.x - this.cameraX
         const y = options.y - this.cameraY
         const g = this.surface.ctx.createRadialGradient(
            x * scale,
            y * scale,
            0,
            x * scale,
            y * scale,
            radius * scale,
         )

         g.addColorStop(1, colorEnd)
         g.addColorStop(0, colorStart)
         this.surface.ctx.fillStyle = g
         this.surface.ctx.beginPath()
         this.surface.ctx.arc(
            x * scale,
            y * scale,
            radius * scale,
            0, Math.PI * 2,
            true,
         )
         this.surface.ctx.closePath()
         this.surface.ctx.fill()
         this.settingsDefault()
      }

      shape(options) {
         const { vertices } = options
         const { scale } = this
         const relative = this.cs.default(options.relative, { x: 0, y: 0 })

         const bounds = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
         for (let i = 0; i < vertices.length; i += 1) {
            bounds.xmin = Math.min(relative.x + vertices[i].x, bounds.xmin)
            bounds.ymin = Math.min(relative.y + vertices[i].y, bounds.ymin)
            bounds.xmax = Math.max(relative.x + vertices[i].x, bounds.xmax)
            bounds.ymax = Math.max(relative.y + vertices[i].y, bounds.ymax)
         }

         if (this.outside({
            x: bounds.xmin,
            y: bounds.ymin,
            width: bounds.xmax - bounds.xmin,
            height: bounds.ymax - bounds.ymin,
         })) {
            this.debug.shapesSkippedCount += 1
            this.settingsDefault()
            return
         }

         this.debug.shapesDrawnCount += 1

         this.surface.ctx.beginPath()
         this.surface.ctx.moveTo(
            (relative.x + vertices[0].x - this.cameraX) * scale,
            (relative.y + vertices[0].y - this.cameraY) * scale,
         )

         for (let i = 1; i < vertices.length; i += 1) {
            this.surface.ctx.lineTo(
               (relative.x + vertices[i].x - this.cameraX) * scale,
               (relative.y + vertices[i].y - this.cameraY) * scale,
            )
         }

         this.surface.ctx.closePath(
            (relative.x + vertices[0].x - this.cameraX) * scale,
            (relative.y + vertices[0].y - this.cameraY) * scale,
         )

         if (!options.fill) this.surface.ctx.stroke()
         if (options.fill) this.surface.ctx.fill()
         this.settingsDefault()
      }

      setColor(color) {
         if (this.surface.ctx.fillStyle === color && this.surface.ctx.strokeStyle === color) return
         this.surface.ctx.fillStyle = color
         this.surface.ctx.strokeStyle = color
      }

      setAlpha(alpha) {
         if (this.surface.ctx.globalAlpha === alpha) return
         this.surface.ctx.globalAlpha = alpha
      }

      setWidth(width) {
         if (this.surface.ctx.lineWidth === width * this.scale) return
         this.surface.ctx.lineWidth = width * this.scale
      }

      setFont(options) {
         if (
            this.surface.ctx.fontSize === options.size
            && this.surface.ctx.fontFamily === options.family
            && !this.surface.clear
         ) return

         if (options.size) this.surface.ctx.fontSize = options.size
         if (options.family) this.surface.ctx.fontFamily = options.family

         const effect = options.effect ? options.effect + ' ' : ''
         const { fontFamily } = this.surface.ctx
         const fontSize = this.surface.ctx.fontSize + 'px'
         this.surface.ctx.font = effect + ' ' + fontSize + ' ' + fontFamily
      }

      setLineHeight(height) {
         if (this.surface.ctx.lineHeight === height / this.scale) return
         this.surface.ctx.lineHeight = height / this.scale
      }

      setLineDash(lineDash) {
         this.surface.ctx.setLineDash(lineDash)
      }

      setTextAlign(alignment) {
         if (this.surface.ctx.textAlign === alignment) return
         this.surface.ctx.textAlign = alignment
      }

      setTextBaseline(alignment) {
         if (this.surface.ctx.textBaseline === alignment) return
         this.surface.ctx.textBaseline = alignment
      }

      setTextCenter() {
         this.setTextAlign('center')
         this.setTextBaseline('middle')
      }

      setOperation(operation) {
         if (this.surface.ctx.globalCompositeOperation === operation) return
         this.surface.ctx.globalCompositeOperation = operation
      }

      settings(settings) {
         for (const setting in settings) {
            this.config.current[setting] = settings[setting]
         }
         this.settingsUpdate()
      }

      default(settings) {
         for (const setting in settings) {
            this.config.defaults[setting] = settings[setting]
         }

         this.settingsDefault()
      }

      settingsUpdate() {
         this.setAlpha(this.config.current.alpha)
         this.setWidth(this.config.current.width)
         this.setFont(this.config.current.font)
         this.setTextAlign(this.config.current.textAlign)
         this.setLineHeight(this.config.current.lineHeight)
         this.setTextBaseline(this.config.current.textBaseline)
         this.setColor(this.config.current.color)
         this.setOperation(this.config.current.operation)
         this.setLineDash(this.config.current.lineDash)
      }

      settingsDefault() {
         for (const setting in this.config.defaults) {
            this.config.current[setting] = this.config.defaults[setting]
         }

         if (this.surface) this.settingsUpdate()
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_DRAW
   else cs.draw = new CSENGINE_DRAW(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Fps.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------------| CS ENGINE: FPS |--------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_FPS {
      constructor(cs) {
         this.cs = cs

         this.rate = 0
         this.frame = 0
         this.check = Date.now()
      }

      update() {
         if (this.checkReset()) this.frame += 1
         else this.reset()
      }

      checkReset() {
         return Date.now() - this.check < 1000
      }

      reset() {
         this.check = Date.now()
         this.rate = this.frame
         this.frame = 0
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_FPS
   else cs.fps = new CSENGINE_FPS(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Fullscreen.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -------------------------| CS ENGINE: FULLSCREEN |------------------------ //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_FULLSCREEN {
      constructor(cs) {
         this.cs = cs
      }

      possible() {
         return this.normalize('possible')
      }

      is() {
         return this.normalize('element')
      }

      toggle() {
         if (this.possible()) {
            if (this.normalize('element')) this.exit()
            else this.enter()
         }
      }

      enter() {
         if (this.possible()) this.normalize('request')
      }

      exit() {
         if (this.possible()) this.normalize('exit')
      }

      normalize(func) {
         for (const prefix of [undefined, 'moz', 'webkit']) {
            let requestFullscreen = prefix + 'RequestFullscreen'
            let fullscreenElement = prefix + 'FullscreenElement'
            let fullscreenEnabled = prefix + 'FullscreenEnabled'
            let exitFullscreen = prefix + 'ExitFullscreen'

            if (!prefix) {
               requestFullscreen = 'requestFullscreen'
               fullscreenElement = 'fullscreenElement'
               fullscreenEnabled = 'fullscreenEnabled'
               exitFullscreen = 'exitFullscreen'
            }

            if (document.documentElement[requestFullscreen] !== undefined) {
               if (func === 'possible') return document.documentElement[requestFullscreen]
               if (func === 'element') return document[fullscreenElement]
               if (func === 'exit') return document[exitFullscreen]()
               if (func === 'request') return document.documentElement[requestFullscreen]()
               if (func === 'enabled') return document[fullscreenEnabled]
            }
         }

         return undefined
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_FULLSCREEN
   else cs.fullscreen = new CSENGINE_FULLSCREEN(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/InputKeyboard.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------| CS ENGINE: INPUT KEYBOARD |---------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_INPUT_KEYBOARD {
      constructor(cs) {
         this.cs = cs

         this.upList = {}
         this.downList = {}
         this.heldList = {}
         this.events = []
      }

      addEvent(keyCode, eventType) {
         const num = this.events.length
         this.events[num] = {
            event: eventType,
            key: keyCode,
         }
      }

      execute() {
         for (let i = 0; i < this.events.length; i += 1) {
            const { event, key } = this.events[i]
            this.processEvent(key, event)
         }
         this.events = []
      }

      processEvent(keyCode, type) {
         if (type === 'up') {
            if (!this.heldList[keyCode]) return
            this.upList[keyCode] = performance.now()
            return
         }

         this.downList[keyCode] = performance.now()
         this.heldList[keyCode] = performance.now()
      }

      reset() {
         for (const tmp in this.downList) {
            this.downList[tmp] = false
            if (this.upList[tmp]) {
               this.heldList[tmp] = false
            }

            this.upList[tmp] = false
         }
      }

      blur() {
         for (const keyId in this.downList) {
            this.downList[keyId] = false
            this.heldList[keyId] = false
            this.upList[keyId] = false
         }

         this.events = []
      }

      eventDown(keyEvent) {
         keyEvent.preventDefault()
         if (!keyEvent.repeat) {
            this.virtualDown(Number(keyEvent.keyCode))
         }
      }

      eventUp(keyEvent) {
         this.virtualUp(Number(keyEvent.keyCode))
      }

      virtualDown(keyCode) {
         this.addEvent(Number(keyCode), 'down')
      }

      virtualUp(keyCode) {
         this.addEvent(Number(keyCode), 'up')
      }

      virtualPress(key) {
         this.virtualDown(key)
         this.virtualUp(key)
      }

      up(keyID) {
         return this.upList[keyID] || false
      }

      down(keyID) {
         return this.downList[keyID] || false
      }

      held(keyID) {
         return this.heldList[keyID] || false
      }

      isUp(keyID) {
         return this.upList[keyID] ? true : false
      }

      isDown(keyID) {
         return this.downList[keyID] ? true : false
      }

      isHeld(keyID) {
         return this.heldList[keyID] ? true : false
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_INPUT_KEYBOARD
   else cs.inputKeyboard = new CSENGINE_INPUT_KEYBOARD(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/InputMouse.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -------------------------| CS ENGINE: INPUT MOUSE |----------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_INPUT_MOUSE {
      constructor(cs) {
         this.cs = cs

         this.x = undefined
         this.y = undefined
      }

      pos() {
         const convert = this.cs.inputTouch.convertToGameCords(this.x, this.y)
         return (this.cs.draw.raw)
            ? { x: this.x, y: this.y }
            : { x: convert.x, y: convert.y }
      }

      eventDown(e) {
         this.cs.inputTouch.touchUse(-1)
         this.x = e.clientX
         this.y = e.clientY

         this.cs.inputTouch.eventsDownMove.push({
            type: 'down',
            id: -1,
            x: this.x,
            y: this.y,
         })

         this.eventMove(e)
      }

      eventMove(e) {
         this.x = e.clientX
         this.y = e.clientY

         this.cs.inputTouch.eventsDownMove.push({
            type: 'move',
            id: -1,
            x: this.x,
            y: this.y,
         })
      }

      eventUp() {
         this.cs.inputTouch.eventsUp.push({
            type: 'up',
            id: -1,
         })
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_INPUT_MOUSE
   else cs.inputMouse = new CSENGINE_INPUT_MOUSE(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/InputTouch.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -------------------------| CS ENGINE: INPUT TOUCH |----------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_INPUT_TOUCH {
      constructor(cs) {
         this.cs = cs
         this.eventsDownMove = []
         this.eventsUp = []
         this.list = [
            { id: -1, x: undefined, y: undefined, used: false }, // mouse
         ]

         this.eventFunctions = {
            down: this.eventFunctionDown.bind(this),
            move: this.eventFunctionMove.bind(this),
            up: this.eventFunctionUp.bind(this),
         }
      }

      batchDownMove() {
         while (this.eventsDownMove.length) {
            const event = this.eventsDownMove.shift()
            this.eventFunctions[event.type](event)
         }
      }

      batchUp() {
         while (this.eventsUp.length) {
            const event = this.eventsUp.shift()
            this.eventFunctions[event.type](event) // ok.... -.O
         }
      }

      eventFunctionDown(vEvent) {
         this.touchUse(vEvent.id)
      }

      eventFunctionUp(vEvent) {
         this.touchUnuse(vEvent.id)
      }

      eventFunctionMove(vEvent) {
         this.touchUpdate({
            id: vEvent.id,
            x: vEvent.x,
            y: vEvent.y,
         })
      }

      // modern pointers
      eventPointerDown(e) {
         e.preventDefault()

         this.eventsDownMove.push({
            type: 'down',
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
         })

         this.eventPointerMove(e)
      }

      eventPointerMove(e) {
         e.preventDefault()

         this.cs.inputMouse.x = e.clientX
         this.cs.inputMouse.y = e.clientY

         this.eventsDownMove.push({
            type: 'move',
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
         })
      }

      eventPointerUp(e) {
         e.preventDefault()

         this.eventsUp.push({
            type: 'up',
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
         })
      }

      // old touch
      eventTouchDown(e) {
         e.preventDefault()

         for (const touch of e.changedTouches) {
            this.eventsDownMove.push({
               type: 'down',
               id: touch.identifier,
               x: touch.clientX,
               y: touch.clientY,
            })

            this.eventTouchMove(e)
         }
      }

      eventTouchMove(e) {
         e.preventDefault()

         for (const touch of e.changedTouches) {
            this.eventsDownMove.push({
               type: 'move',
               id: touch.identifier,
               x: touch.clientX,
               y: touch.clientY,
            })
         }
      }

      eventTouchUp(e) {
         e.preventDefault()

         for (const touch of e.changedTouches) {
            this.eventsUp.push({
               type: 'up',
               id: touch.identifier,
               x: touch.clientX,
               y: touch.clientY,
            })
         }
      }

      touchUse(id) {
         // reuse from list or add to end
         let i = 0
         for (i = 0; i < this.list.length; i += 1) {
            const touch = this.list[i]
            if (!touch.used && !touch.new) break
         }

         this.list[i] = {
            id: id,
            used: false,
            new: true,
            down: true,
            held: true,
            up: false,
            x: undefined,
            y: undefined,
         }
      }

      touchUnuse(id) {
         const touch = this.list.find(t => t.id === id)
         if (!touch) {
            return
         }

         touch.used = false
         touch.held = false
         touch.up = true
      }

      touchUpdate(eTouch) {
         const touch = this.list.find(t => t.id === eTouch.id)
         if (!touch) return

         touch.x = (eTouch.x / this.cs.width) * this.cs.clampWidth
         touch.y = (eTouch.y / this.cs.height) * this.cs.clampHeight
      }

      observer(useGameCords) {
         return {
            parent: this,
            touch: undefined,
            observing: false,
            useGameCords: useGameCords,
            down: false,
            held: false,
            up: false,
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            check: function (area) {
               if (this.observing) this.observe()
               else this.findTouchToObserve(area)
            },
            uncheck: function () {
               this.observing = false
            },
            observe: function () {
               // im observing. lets update my values
               if (this.observing) {
                  this.x = this.touch.x
                  this.y = this.touch.y

                  if (this.useGameCords) {
                     const convertedToGameCords = this.parent.convertToGameCords(this.x, this.y)
                     this.x = convertedToGameCords.x
                     this.y = convertedToGameCords.y
                  }

                  this.down = this.touch.down
                  this.held = this.touch.held
                  this.up = this.touch.up

                  if (this.up) this.observing = false
               }
            },
            findTouchToObserve(area) {
               // find a touch to observe
               for (const touch of this.parent.list) {
                  // this touch is being observed or not available to latch
                  if (touch.used || !touch.down) continue

                  let touchX = touch.x
                  let touchY = touch.y
                  if (this.useGameCords) {
                     const convertedToGameCords = this.parent.convertToGameCords(touchX, touchY)
                     touchX = convertedToGameCords.x
                     touchY = convertedToGameCords.y
                  }

                  // check if within
                  if (
                     touchX > area.x && touchX < area.x + (area.width || area.size)
                     && touchY > area.y && touchY < area.y + (area.height || area.size)
                  ) {
                     // observe this touch!
                     touch.used = true

                     // setup
                     this.observing = true
                     this.touch = touch
                     // handy
                     this.offsetX = touchX - area.x
                     this.offsetY = touchY - area.y

                     this.observe()
                     break
                  }
               }
            },
            isDown: function () {
               return this.touch && this.touch.down
            },
            isUp: function () {
               return this.touch && this.touch.up
            },
            isHeld: function () {
               return this.touch && this.touch.held
            },
            isWithin: function (rect) {
               const width = this.parent.cs.default(rect.width, rect.size || 0)
               const height = this.parent.cs.default(rect.height, rect.size || 0)

               return (
                  this.x > rect.x && this.x < rect.x + width
                  && this.y > rect.y && this.y < rect.y + height
               )
            },
         }
      }

      reset() {
         // up and down state only last one step
         for (const touch of this.list) {
            touch.down = false
            touch.up = false
            touch.new = false
         }
      }

      convertToGameCords(x, y) {
         const rect = this.cs.canvas.getBoundingClientRect()

         const physicalViewWidth = rect.width
         const physicalViewHeight = rect.height
         const hortPercent = (x - rect.left) / physicalViewWidth
         const vertPercent = (y - rect.top) / physicalViewHeight

         let gamex = Math.round(hortPercent * (this.cs.camera.width / this.cs.camera.zoom))
         let gamey = Math.round(vertPercent * (this.cs.camera.height / this.cs.camera.zoom))
         gamex += this.cs.camera.x
         gamey += this.cs.camera.y
         return { x: gamex, y: gamey }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_INPUT_TOUCH
   else cs.inputTouch = new CSENGINE_INPUT_TOUCH(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Loader.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ---------------------------| CS ENGINE: LOADER |-------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_LOADER {
      constructor(cs) {
         this.cs = cs

         this.start = 0
         this.loading = cs.assets.sprites.length
            + cs.assets.scripts.length
            + cs.assets.sounds.length
            + cs.assets.storages.length

         this.loadTotal = this.loading
      }

      load() {
         if (!this.loading) {
            return this.cs.setup.run()
         }

         this.start = Date.now()
         console.groupCollapsed('Loading Assets...')

         this.loadScripts()
         this.loadSounds()
         this.loadSprites()
         this.loadStorages()

         return false
      }

      checkDone() {
         this.loading -= 1

         const loadInfo = {
            percent: Math.floor((this.loadTotal - this.loading) / (this.loadTotal * 100)),
            finished: !this.loading,
            current: this.loading,
            totalRequired: this.loadTotal,
         }

         this.cs.progress(loadInfo)

         if (!this.loading) {
            console.groupEnd()
            const assetsLoadTime = Math.round(Date.now() - this.start)
            console.log(`Assets Loaded in ${assetsLoadTime}ms`)
            // run setup
            this.cs.setup.run()
         }
      }

      loadScripts() {
         for (const script of this.cs.assets.scripts) {
            console.log('Loading Script: ' + script.path)
            const htmlScript = document.createElement('script')
            htmlScript.src = script.path + '.js?v=' + this.cs.version
            htmlScript.onload = this.checkDone.bind(this)
            document.body.appendChild(htmlScript)
         }
      }

      loadSprites() {
         for (const sprite of this.cs.assets.sprites) {
            this.cs.sprites.push(sprite)
            console.log(`Loading Sprite: ${sprite.path}`)
            sprite.html = document.createElement('img')
            sprite.html.src = sprite.path + '.png?v=' + this.cs.version
            sprite.html.onload = this.checkDone.bind(this)
         }
      }

      loadSounds() {
         for (const sound of this.cs.assets.sounds) {
            this.cs.sounds.push(sound)
            console.log(`Loading Sound: ${sound.path}`)
            sound.loaded = false
            sound.src = sound.path + '.wav?v=' + this.version
            sound.buffer = null
            sound.request = new XMLHttpRequest()

            sound.request.open('GET', sound.src, true)
            sound.request.responseType = 'arraybuffer'

            sound.request.onload = (data) => {
               window.AudioContext = window.AudioContext || window.webkitAudioContext
               if (window.AudioContext) {
                  new AudioContext().decodeAudioData(data.currentTarget.response, (buffer) => {
                     sound.buffer = buffer
                  })
               }
               this.checkDone()
            }
            sound.request.send()
         }
      }

      loadStorages() {
         for (const storage of this.cs.assets.storages) {
            console.log('Loading Storage: ' + storage.path)
            this.cs.storages.push(storage)
            storage.data = {}

            // attempt to use localstorage
            if (!storage.path) {
               storage.data = JSON.parse(window.localStorage.getItem(storage.location))
               this.checkDone()
            }

            // fetch the storage .json
            if (storage.path) {
               storage.request = new XMLHttpRequest()
               storage.request.onreadystatechange = () => {
                  if (storage.request.readyState === 4) {
                     const data = JSON.parse(storage.request.responseText)
                     storage.data = data
                     this.checkDone()
                  }
               }

               storage.request.open('GET', './' + storage.path + '.json?v=' + this.version, true)
               storage.request.send()
            }
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_LOADER
   else cs.loader = new CSENGINE_LOADER(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Loop.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------------| CS ENGINE: LOOP |-------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_LOOP {
      constructor(cs) {
         this.cs = cs

         this.run = false
         this.endSteps = []
         this.beforeSteps = []
         this.speed = 1000 / 60
         this.last = Date.now()
         this.id = 0
         this.timeout = undefined
      }

      step(once) {
         this.id += 1

         // delta fixing
         const now = Date.now()
         this.delta = (now - this.last) / this.speed
         this.last = now

         if (!this.run || once) return
         this.timeout = setTimeout(() => this.step(), this.speed)

         const { headless } = this.cs

         if (!headless) {
            this.cs.draw.debugReset()

            this.cs.surface.clearAll()

            // input
            this.cs.inputKeyboard.execute()
            this.cs.inputTouch.batchDownMove()
            // move camera before clear
            this.cs.camera.update()
         }

         this.cs.fps.update()
         this.cs.network.read()

         this.cs.object.addNewObjects()

         // Execute before steps
         // disconnect to allow adding within a beforestep
         const temporaryBeforeSteps = []
         while (this.beforeSteps.length) { temporaryBeforeSteps.push(this.beforeSteps.pop()) }
         while (temporaryBeforeSteps.length) { temporaryBeforeSteps.pop()() }

         if (this.cs.userStep) this.cs.userStep({ cs: this.cs })

         this.cs.object.loop((object) => {
            if (!object.core.active || !object.core.live) return
            if (!headless) this.cs.draw.setSurface(object.core.surface)
            if (object.step) object.step({ object, cs: this.cs })
         })

         if (!headless) {
            if (this.cs.userDraw) this.cs.userDraw({ cs: this.cs })

            this.cs.object.loop((object) => {
               if (!object.core.active || !object.core.live) return
               this.cs.draw.setSurface(object.core.surface)

               if (object.drawOnce) {
                  const surface = this.cs.surface.list[object.core.surface]
                  if (surface.clear || !object.core.drawn) {
                     object.core.drawn = true
                     object.drawOnce({ object, cs: this.cs })
                  }
               }

               if (object.draw) object.draw({ object, cs: this.cs })
            })
         }

         // timers
         this.cs.timer.loop()

         if (!headless) {
            // Touch / Keyboard
            this.cs.surface.displayAll()
            this.cs.inputKeyboard.reset()
            this.cs.inputTouch.reset()
            this.cs.inputTouch.batchUp()
         }

         // Execute next steps
         while (this.endSteps.length) {
            this.endSteps.pop()()
         }

         // could clearup !live objects here
         this.cs.object.clean()

         // network metrics
         if (this.cs.network.status) {
            this.cs.network.updateMetrics()
         }
      }

      beforeStep(func) {
         this.beforeSteps.push(func)
      }

      endStep(func) {
         this.endSteps.push(func)
      }

      start() {
         this.run = true
         this.timeout = setTimeout(() => this.step(), this.speed)
      }

      stop() {
         this.run = false
         clearTimeout(this.timeout)
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_LOOP
   else cs.loop = new CSENGINE_LOOP(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Math.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: MATH |--------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_MATH {
      constructor(cs) {
         this.cs = cs
      }

      sign(number) {
         if (!number) return 0
         return number < 0 ? -1 : 1
      }

      round(number, tenths = 1) {
         return Math.round(number * tenths) / tenths
      }

      between(num, min, max) {
         if (num < min) return min
         if (num > max) return max
         return num
      }

      isBetween(num, min, max) {
         return num >= Math.min(min, max) && num <= Math.max(min, max)
      }

      isOutside(num, min, max) {
         return num < Math.min(min, max) || num > Math.max(min, max)
      }

      randomRange(min, max) {
         return (min + Math.random() * (max - min))
      }

      iRandomRange(min, max) {
         return Math.round(this.randomRange(min, max))
      }

      choose(array) {
         return array[this.iRandomRange(0, array.length - 1)]
      }

      chooseRatio(ratios) {
         // ratios = { "50": "Choice1", "100": "Choice2" }
         const random = Math.random() * 100
         let ratio
         for (ratio in ratios) {
            if (Number(ratio) > random) {
               return ratios[ratio]
            }
         }

         return ratios[ratio]
      }

      brakingDistance(options) {
         return (Math.abs(options.speed) * options.friction) / (1 - options.friction)
      }

      requiredSpeed(options) {
         return Math.sqrt(2 * options.friction * options.distance)
      }

      inRange(options) {
         return options.num > options.min && options.num < options.max
      }

      sin(angleInDegrees) {
         return Math.sin((angleInDegrees - 90) * (Math.PI / 180))
      }

      cos(angleInDegrees) {
         return Math.cos((angleInDegrees - 90) * (Math.PI / 180))
      }

      degrees(radians) {
         return radians * (180 / Math.PI)
      }

      radians(degree) {
         return degree * (Math.PI / 180)
      }

      distance(p1, p2) {
         // a^2 + b^2 = c^2
         const a2 = (p1.x - p2.x) * (p1.x - p2.x)
         const b2 = (p1.y - p2.y) * (p1.y - p2.y)

         return Math.sqrt(a2 + b2)
      }

      anglePointToPoint(p1, p2) {
         if (!p2) {
            p2 = p1
            p1 = { x: 0, y: 0 }
         }

         const xOff = p2.x - p1.x
         const yOff = p2.y - p1.y

         return this.angleXY(xOff, yOff)
      }

      angleXY(xOff, yOff) {
         const beforeTurn = this.degrees(Math.atan2(xOff, -yOff)) + 180
         let afterTurn = beforeTurn + 180
         if (afterTurn > 360) {
            afterTurn -= 360
         }
         return afterTurn
      }

      angleToAngle(d1, d2) {
         let right = d2 - d1
         if (right < 0) {
            right = 360 + right
         }

         let left = d1 - d2
         if (left < 0) {
            left = 360 + left
         }

         return right > left ? -left : right
      }

      stepsToSeconds(steps, decimals = 1) {
         return Math.ceil((steps / 60) * decimals) / decimals
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_MATH
   else cs.math = new CSENGINE_MATH(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Network.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ---------------------------| CS ENGINE: NETWORK |------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_NETWORK {
      constructor(cs) {
         this.cs = cs

         this.ws = {}
         this.status = false
         this.buffer = []

         this.metrics = {
            upNow: 0,
            downNow: 0,
            upAverage: 0,
            downAverage: 0,
            upTotal: 0,
            downTotal: 0,
            upWatch: 0,
            downWatch: 0,
            last: Date.now(),
            count: 0,
         }

         this.overrides = {
            connect: undefined,
            disconnect: undefined,
            message: undefined,
         }
      }

      updateMetrics() {
         const { metrics } = this.cs.network
         const now = Date.now()
         if (now - metrics.last > 1000) {
            metrics.count += 1
            metrics.last = now
            metrics.upNow = metrics.upWatch
            metrics.downNow = metrics.downWatch
            metrics.upTotal += metrics.upWatch
            metrics.downTotal += metrics.downWatch
            metrics.upAverage = metrics.upTotal / metrics.count
            metrics.downAverage = metrics.downTotal / metrics.count

            metrics.upWatch = 0
            metrics.downWatch = 0
         }
      }

      connect(options) {
         // console.log('this.cs.network.connect', options)
         try {
            const host = options.host || window.location.hostname
            let url = 'wss://' + host + ':' + options.port

            if (options.ssl === undefined || options.ssl === false) {
               url = 'ws://' + host + ':' + options.port
            }

            const ws = new WebSocket(url)
            ws.onopen = () => {
               this.cs.network.onconnect()
            }
            ws.onclose = () => { this.cs.network.ondisconnect() }
            ws.onmessage = (event) => { this.cs.network.onmessage(event.data) }
            this.cs.network.ws = ws
         } catch (e) {
            console.log(e)
         }
      }

      isConnected() {
         return this.cs.network.ws.readyState !== this.cs.network.ws.CLOSED
      }

      send(data) {
         if (!this.status) return
         if (typeof data !== 'string') {
            data = JSON.stringify(data)
         }
         this.cs.network.metrics.upWatch += data.length
         this.cs.network.ws.send(data)
      }

      read() {
         while (this.buffer.length) {
            const message = this.buffer.shift()
            this.cs.network.metrics.downWatch += message.length
            try {
               this.overrides.message({
                  cs: this.cs,
                  message: message,
               })
            } catch (e) {
               console.error('could not parse message', e)
            }
         }
      }

      onconnect() {
         this.cs.network.status = true
         if (this.overrides.connect) this.overrides.connect({ cs: this.cs })
      }

      ondisconnect() {
         this.cs.network.status = false
         if (this.overrides.disconnect) this.overrides.disconnect({ cs: this.cs })
      }

      onmessage(message) {
         this.buffer.push(message)
      }

      setup(options) {
         for (const optionName in options) {
            this.cs.network.overrides[optionName] = options[optionName]
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_NETWORK
   else cs.network = new CSENGINE_NETWORK(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Object.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: OBJECT |------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_OBJECT {
      constructor(cs) {
         this.cs = cs
         this.list = [] // all objects
         this.new = [] // newly added objects
         this.unique = 0
         this.types = {}
         this.objGroups = {}
         this.shouldClean = false
         this.objectTemplates = {}
      }

      init() {
         for (const objectName in this.cs.objects) {
            const template = this.cs.objects[objectName]
            this.addTemplate(objectName, template)
         }
      }

      addTemplate(objectName, template) {
         this.cs.objects[objectName] = template
         this.objectTemplates[objectName] = class GAMEOBJECT {
            constructor(cs) { this.cs = cs }
         }

         for (const prop in this.cs.objects[objectName]) {
            const propValue = this.cs.objects[objectName][prop]

            if (typeof propValue === 'function') {
               this.objectTemplates[objectName].prototype[prop] = propValue
            }
         }
      }

      loop(call) {
         for (let i = this.list.length - 1; i >= 0; i -= 1) {
            call(this.list[i])
         }
      }

      create(options) {
         if (!this.cs.objects[options.type]) {
            console.log('object type "' + options.type + '" does not exist')
            return undefined
         }

         const { attr } = options
         const Generator = this.objectTemplates[options.type]
         const template = this.cs.objects[options.type]
         const zIndex = options.zIndex || template.zIndex || 0

         // create the object
         const newObject = new Generator(this.cs)
         newObject.core = {
            zIndex: zIndex,
            live: true,
            active: true,
            drawn: false,
            type: options.type,
            id: this.unique,
            surface: this.cs.default(template.surface, 'game'),
         }

         // predefined / custom Attr
         for (const name in template.attr) { newObject[name] = template.attr[name] }

         // run create event
         if (newObject.create) {
            newObject.create({
               object: newObject,
               cs: this.cs,
               attr: attr || {},
            })
         }

         // add to list
         this.new.push({ obj: newObject, zIndex: zIndex })
         this.unique += 1

         // grouping
         if (!this.objGroups[options.type]) this.objGroups[options.type] = []
         this.objGroups[options.type].push(newObject)

         return newObject
      }

      addNewObjects() {
         while (this.new.length) {
            const { obj } = this.new.shift()
            this.list.push(obj)
         }

         this.orderObjectsByZIndex()
      }

      orderObjectsByZIndex() {
         this.order = this.list.sort((a, b) => {
            return b.core.zIndex === a.core.zIndex
               ? b.core.id - a.core.id
               : b.core.zIndex - a.core.zIndex
         })
      }

      changeZIndex(object, zIndex) {
         const listObject = object.list.find((findListObject) => {
            return findListObject.obj.core.id === object.core.id
         })

         listObject.core.zIndex = zIndex

         this.orderObjectsByZIndex()
      }

      destroy(destroyObjOrID, fadeTimer) {
         this.shouldClean = true
         const destroyObj = (typeof destroyObjOrID === 'number')
            ? this.id(destroyObjOrID)
            : destroyObjOrID

         destroyObj.core.live = false
         destroyObj.core.active = false
         destroyObj.core.fadeTimer = fadeTimer || 0

         // remove from objGroup
         const { type } = destroyObj.core
         if (this.cs.objects[type].destroy) {
            this.cs.objects[type].destroy.call(destroyObj, { object: destroyObj, cs: this.cs })
         }
         this.objGroups[type] = this.objGroups[type].filter(o => o.core.live)
      }

      clean() {
         if (!this.shouldClean) return
         this.list = this.list.filter(o => o.core.live)
      }

      every() {
         return this.list.concat(this.new.map(o => o.obj))
      }

      all(type) {
         return this.objGroups[type] || []
      }

      find(type) {
         if (!this.objGroups[type]) {
            return undefined
         }
         return this.objGroups[type][0]
      }

      search(call) {
         return this.every().find((obj) => {
            if (!obj.core.live) return false
            return call(obj)
         })
      }

      id(id) {
         return this.list.find((obj) => obj.core.id === id)
      }

      count(type) {
         return this.objGroups[type] ? this.objGroups[type].length : 0
      }

      countAll() {
         return this.list.length + this.new.length
      }

      reset() {
         this.list = []
         this.new = []
         this.objGroups = {}
         this.unique = 0
      }

      resize() {
         for (const object of this.list) {
            object.core.drawn = false
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_OBJECT
   else cs.object = new CSENGINE_OBJECT(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Room.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------------| CS ENGINE: ROOM |-------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_ROOM {
      constructor(cs) {
         this.cs = cs

         this.width = cs.default(cs.options.room && cs.options.room.width, 100)
         this.height = cs.default(cs.options.room && cs.options.room.width, 100)
         this.rect = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
         }
      }

      setup(info) {
         this.width = info.width
         this.height = info.height
         if (info.background) this.cs.canvas.style.background = info.background
         this.rect = { x: 0, y: 0, width: this.width, height: this.height }
         this.cs.resize()
      }

      outside(rect) {
         const width = this.cs.default(rect.width, 0)
         const height = this.cs.default(rect.height, 0)

         return (
            rect.x < 0
            || rect.y < 0
            || rect.x + width > this.width
            || rect.y + height > this.height
         )
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_ROOM
   else cs.room = new CSENGINE_ROOM(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Scripts.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: SCRIPTS |------------------------ //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_SCRIPTS {
      constructor(cs) {
         this.cs = cs
      }

      init() {
         for (const scriptName in this.cs.script) {
            this.add(scriptName, this.cs.script[scriptName])
         }
      }

      add(scriptName, object) {
         this.cs.script[scriptName] = object
         this.applyCsToScope('', object, object)
      }

      applyCsToScope(path, object, parent) {
         if (typeof object !== 'object' || Array.isArray(object)) return

         for (const scriptName in object) {
            // keep base parent this scope through scripts (allows nesting)
            if (scriptName === 'cs') continue

            parent.cs = this.cs
            if (typeof object[scriptName] === 'function') {
               object[scriptName] = object[scriptName].bind(parent)
            }

            this.applyCsToScope(scriptName + '.', object[scriptName], parent)
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_SCRIPTS
   else cs.scripts = new CSENGINE_SCRIPTS(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Setup.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------------| CS ENGINE: SETUP |------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_SETUP {
      constructor(cs) {
         this.cs = cs
      }

      run() {
         // Initiate Inputs
         if (!this.cs.headless) {
            this.cs.ctx = this.cs.canvas.getContext('2d')
            this.cs.canvas.tabIndex = 0
            this.cs.canvas.style.outline = 'none'
            this.cs.canvas.style.touchAction = 'none'

            this.cs.canvas.addEventListener('click', () => {
               this.cs.sound.enable()
               this.cs.canvas.focus()
            })

            this.cs.canvas.addEventListener('keydown', (e) => this.cs.inputKeyboard.eventDown(e))
            this.cs.canvas.addEventListener('keyup', (e) => this.cs.inputKeyboard.eventUp(e))

            if (this.cs.canvas.setPointerCapture) {
               this.cs.canvas.addEventListener('pointerdown', (e) => this.cs.inputTouch.eventPointerDown(e))
               this.cs.canvas.addEventListener('pointermove', (e) => this.cs.inputTouch.eventPointerMove(e))
               this.cs.canvas.addEventListener('pointerup', (e) => this.cs.inputTouch.eventPointerUp(e))
               this.cs.canvas.addEventListener('pointerout', (e) => this.cs.inputTouch.eventPointerUp(e))
            } else {
               this.cs.canvas.addEventListener('touchstart', (e) => this.cs.inputTouch.eventTouchDown(e))
               this.cs.canvas.addEventListener('touchmove', (e) => this.cs.inputTouch.eventTouchMove(e))
               this.cs.canvas.addEventListener('touchend', (e) => this.cs.inputTouch.eventTouchUp(e))

               this.cs.canvas.addEventListener('mousedown', (e) => this.cs.inputMouse.eventDown(e))
               this.cs.canvas.addEventListener('mousemove', (e) => this.cs.inputMouse.eventMove(e))
               this.cs.canvas.addEventListener('mouseup', (e) => this.cs.inputMouse.eventUp(e))
               this.cs.canvas.addEventListener('mouseout', (e) => this.cs.inputMouse.eventUp(e))
            }

            // View, Game and GUI surfaces
            this.cs.surface.create({ name: 'gui', oneToOne: true, useCamera: false, depth: 0 })
            this.cs.surface.create({ name: 'game', oneToOne: true, useCamera: true, depth: 10 })

            // Sound
            // this.cs.sound.active = this.cs.sound.init();

            // watch for resizing
            this.cs.resize = () => {
               const { maxSize } = this.cs
               this.cs.width = this.cs.canvas.clientWidth
               this.cs.height = this.cs.canvas.clientHeight
               this.cs.clampWidth = this.cs.width
               this.cs.clampHeight = this.cs.height

               if (this.cs.clampWidth > maxSize) {
                  this.cs.clampHeight = (this.cs.clampHeight / this.cs.clampWidth) * maxSize
                  this.cs.clampWidth = maxSize
               }

               if (this.cs.clampHeight > maxSize) {
                  this.cs.clampWidth = (this.cs.clampWidth / this.cs.clampHeight) * maxSize
                  this.cs.clampHeight = maxSize
               }

               this.cs.clampWidth = Math.ceil(this.cs.clampWidth)
               this.cs.clampHeight = Math.ceil(this.cs.clampHeight)

               this.cs.canvas.width = this.cs.clampWidth
               this.cs.canvas.height = this.cs.clampHeight

               this.cs.camera.resize()
               this.cs.surface.resize()
               this.cs.object.resize()
            }

            // room/camera
            this.cs.room.setup({
               width: this.cs.canvas.getBoundingClientRect().width,
               height: this.cs.canvas.getBoundingClientRect().height,
            })

            this.cs.camera.setup({
               width: this.cs.canvas.getBoundingClientRect().width,
               height: this.cs.canvas.getBoundingClientRect().height,
            })

            // window global functions
            if (window) {
               window.onerror = (errorMsg, url, lineNumber) => {
                  console.log('error', errorMsg, url, lineNumber)
                  this.cs.loop.stop()
               }

               window.onfocus = (e) => {
                  this.cs.focus(true, e)
               }

               window.onblur = (e) => {
                  this.cs.focus(false, e)
                  this.cs.sound.toggleActive(false, e)
                  this.cs.inputKeyboard.blur()
               }

               window.onresize = this.cs.resize.bind(this)
            }
            this.cs.resize()
            this.cs.sprite.init()
         }

         // Sprites/Storage/Sound/Scripts
         this.cs.storage.init()
         this.cs.object.init()
         this.cs.scripts.init()

         // bootstrapping
         this.cs.start({ cs: this.cs })
         this.cs.loop.start()
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_SETUP
   else cs.setup = new CSENGINE_SETUP(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Sound.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: SOUND |-------------------------- //
// -------------------------------------------------------------------------- //
(() => {
   class CSENGINE_SOUND {
      constructor(cs) {
         this.cs = cs

         this.list = {}
         this.playList = []
         this.initiated = false
         this.context = undefined
         this.canPlayAudio = false
         this.mute = false
         this.active = true
         this.volume = undefined
      }

      enable() {
         if (!this.initiated) this.init()
         if (this.initiated && !this.canPlayAudio) return
         if (!this.context) return

         this.cs.sound.toggleActive(true)
         const source = this.context.createBufferSource()
         source.buffer = this.context.createBuffer(1, 1, 22050)
         source.connect(this.context.destination)
         source.start(0)
      }

      init() {
         this.initiated = true
         window.AudioContext = window.AudioContext || window.webkitAudioContext
         if (window.AudioContext) {
            this.context = new AudioContext()
            this.canPlayAudio = true
         }
         this.loadSounds()
      }

      loadSounds() {
         for (const sound of this.cs.sounds) {
            const name = sound.name || sound.path.split('/').pop()
            this.list[name] = sound
         }
      }

      play(audioName, options) {
         const sound = this.list[audioName]
         if (this.canPlayAudio && sound) {
            this.playList.forEach(audioObj => {
               if (audioObj.name === audioName) {
                  // console.log('Reuse this sound');
               }
            })

            const csAudioObj = this.context.createBufferSource()
            csAudioObj.name = audioName
            csAudioObj.buffer = sound.buffer
            for (const opt in options) { csAudioObj[opt] = options[opt] }
            csAudioObj.gainNode = this.context.createGain()
            csAudioObj.connect(csAudioObj.gainNode)
            csAudioObj.gainNode.connect(this.context.destination)
            csAudioObj.gainNode.gain.value = this.cs.sound.mute ? 0 : 1
            csAudioObj.start(0)
            this.playList.push(csAudioObj)
            return csAudioObj
         }

         return undefined
      }

      reset() {
         for (const sound in this.playList) {
            // TODO there is an error here take a look in a second I got to go wash my cloths~!!!
            if (!this.playList) return
            this.playList[sound].stop()
            this.playList[sound].disconnect()
         }
      }

      toggleMute(bool) {
         this.mute = bool
         if (bool) this.setGain(0)
         else this.setGain(1)
      }

      setGain(gainValue) {
         // console.log(`GainValue: ${gainValue}`)

         for (const audioObj in this.playList) {
            // console.log('Muting...', audioObj)
            this.playList[audioObj].gainNode.gain.value = gainValue
         }
      }

      toggleActive(bool) {
         if (bool && !this.initiated) {
            this.init()
         }

         if (this.context) {
            this.context[bool ? 'resume' : 'suspend']()
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_SOUND
   else cs.sound = new CSENGINE_SOUND(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Sprite.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// -----------------------------| CS ENGINE: SPRITE |------------------------ //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_SPRITE {
      constructor(cs) {
         this.cs = cs
         this.list = {}
      }

      init() {
         for (const sprite of this.cs.sprites) {
            this.initSprite(sprite)
         }
      }

      initSprite(options) {
         // create Sprite
         const width = this.cs.default(options.fwidth, options.html.width)
         const height = this.cs.default(options.fheight, options.html.height)

         let maskWidth = width
         let maskHeight = height

         if (options.mask) {
            if (options.mask.width) maskWidth = options.maskWidth
            else maskWidth = width - (options.mask.left || 0) - (options.mask.right || 0)

            if (options.mask.height) maskHeight = options.maskHeight
            else maskHeight = height - (options.mask.top || 0) - (options.mask.bottom || 0)
         }

         const newSprite = {
            html: options.html,
            name: options.name || options.path.split('/').pop(),
            texture: document.createElement('canvas'),
            fwidth: width,
            fheight: height,
            xoff: options.xoff || 0,
            yoff: options.yoff || 0,
            mask: {
               width: maskWidth,
               height: maskHeight,
            },
            frames: [],
         }

         // handle Frames
         let dx = 0
         let dy = 0

         while (dx < newSprite.html.width && dy < newSprite.html.height) {
            const frame = {}
            frame.canvas = document.createElement('canvas')
            frame.canvas.width = newSprite.fwidth
            frame.canvas.height = newSprite.fheight
            frame.canvas.ctx = frame.canvas.getContext('2d')

            frame.canvas.ctx.drawImage(newSprite.html, dx, dy, newSprite.fwidth, newSprite.fheight,
               0, 0, newSprite.fwidth, newSprite.fheight)
            newSprite.frames.push(frame.canvas)

            dx += newSprite.fwidth
            if (dx === newSprite.html.width) {
               dx = 0
               dy += newSprite.fheight
            }
         }

         this.cs.sprite.list[newSprite.name] = newSprite
      }

      texture(spriteName, width, height) {
         const sprite = this.cs.sprite.list[spriteName]
         sprite.texture = document.createElement('canvas')
         sprite.texture.ctx = sprite.texture.getContext('2d')
         sprite.texture.width = width
         sprite.texture.height = height
         sprite.texture.fwidth = width
         sprite.texture.fheight = height

         let x = 0
         while (x < width) {
            let y = 0
            while (y < height) {
               sprite.texture.ctx.drawImage(sprite.html, x, y)
               y += sprite.html.height
            }
            x += sprite.html.width
         }
      }

      info(options) {
         // we need something to return info on sprites based on scale etc
         const sprite = this.list[options.spr]
         const frame = this.cs.default(options.frame, 0)
         const scaleX = this.cs.default(options.scaleX, 1)
         const scaleY = this.cs.default(options.scaleY, 1)
         const angle = this.cs.default(options.angle, 0)
         let width = this.cs.default(options.width, sprite.fwidth)
         let height = this.cs.default(options.height, sprite.fheight)
         let xoff = this.cs.default(options.xoff, sprite.xoff)
         let yoff = this.cs.default(options.yoff, sprite.yoff)

         if (options.size) {
            const tall = height > width
            const ratio = height / width

            width = tall ? options.size / ratio : options.size
            height = tall ? options.size : options.size * ratio
         }

         if (options.xCenter) xoff = width / 2
         if (options.yCenter) yoff = height / 2
         if (options.center) {
            xoff = width / 2
            yoff = height / 2
         }

         return {
            name: options.spr,
            fWidth: sprite.fwidth,
            fHeight: sprite.fheight,
            width: (options.texture ? sprite.texture.fwidth : width),
            height: (options.texture ? sprite.texture.fheight : height),
            scaleX: scaleX,
            scaleY: scaleY,
            angle: angle,
            xoff: xoff,
            yoff: yoff,
            frames: options.texture ? [sprite.texture] : sprite.frames,
            frame: sprite.frames[frame],
            mask: {
               width: sprite.mask.width,
               height: sprite.mask.height,
            },
         }
      }

      exists(name) {
         return this.list[name]
      }
   }

   if (typeof module !== 'undefined') module.exports = CSENGINE_SPRITE
   else cs.sprite = new CSENGINE_SPRITE(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Surface.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: SURFACE |------------------------ //
// -------------------------------------------------------------------------- //
/*
Types of surfaces
   - GUI
   - matches device pixels
   - draw calls match pixels
   - GAME
   - matches device pixels
   - draw calls will offset by camera
   - MAP
   - matches room size
*/

(() => {
   class CSENGINE_SURFACE {
      constructor(cs) {
         this.cs = cs

         this.list = {}
         this.order = []
         this.imageSmoothing = false
      }

      create(config) {
         const canvas = document.createElement('canvas')

         const oneToOne = this.cs.default(config.oneToOne, true)
         const useCamera = this.cs.default(config.useCamera, true)
         const drawOutside = this.cs.default(config.drawOutside, false)
         const manualClear = this.cs.default(config.manualClear, false)

         this.list[config.name] = {
            name: config.name,
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            depth: this.cs.default(config.depth, 0),
            width: 0,
            height: 0,
            scale: 1,
            oneToOne: oneToOne,
            useCamera: useCamera,
            drawOutside: drawOutside,
            manualClear: manualClear,
            clearRequest: false,
            clear: true,
         }

         // Add and fix size
         this.addToOrder(this.list[config.name])
         this.resize()

         // Return the element
         return this.list[config.name]
      }

      addToOrder(surface) {
         let i = 0
         for (i; i < this.order.length; i += 1) {
            if (this.order[i].depth > surface.depth) {
               break
            }
         }

         this.order.splice(i, 0, surface)
      }

      clearAll() {
         this.cs.ctx.clearRect(0, 0, this.cs.canvas.width, this.cs.canvas.height)
         for (const surface of this.order) {
            if (!surface.manualClear || surface.clearRequest) {
               let clearRect = {
                  x: 0, y: 0,
                  width: surface.canvas.width,
                  height: surface.canvas.height,
               }

               if (surface.clearRequest) clearRect = surface.clearRequest

               surface.ctx.clearRect(clearRect.x, clearRect.y, clearRect.width, clearRect.height)
               surface.clearRequest = undefined
               surface.clear = true
               continue
            }

            surface.clear = false
         }
      }

      clear(options) {
         const surface = this.list[options.name]
         surface.clearRequest = {
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || surface.canvas.width,
            height: options.height || surface.canvas.height,
         }
      }

      displayAll() {
         let i = this.order.length
         while (i) {
            i -= 1
            this.display(this.order[i].name)
         }
      }

      display(surfaceName) {
         const surface = this.list[surfaceName]
         // destination
         let dx = 0
         let dy = 0
         let dWidth = this.cs.canvas.width
         let dHeight = this.cs.canvas.height

         // source
         let sx = dx
         let sy = dy
         let sWidth = dWidth
         let sHeight = dHeight

         if (!surface.oneToOne) {
            const cameraRect = this.cs.camera.info()
            sx = cameraRect.x
            sy = cameraRect.y
            sWidth = cameraRect.width
            sHeight = cameraRect.height

            // safari does not allow negative source
            if (sy < 0) {
               dy -= sy * cameraRect.zScale
               sy = 0
               sHeight = surface.height
               dHeight = sHeight * cameraRect.zScale
            }

            if (sx < 0) {
               dx -= sx * cameraRect.zScale
               sx = 0
               sWidth = surface.width
               dWidth = sWidth * cameraRect.zScale
            }
         }

         this.cs.ctx.drawImage(surface.canvas,
            sx, sy, sWidth, sHeight,
            (dx), (dy), (dWidth), (dHeight))
      }

      resize() {
         const width = this.cs.clampWidth
         const height = this.cs.clampHeight

         // set main canvas
         this.ctxImageSmoothing(this.cs.ctx)

         // loop over the surfaces to match
         // a surface can be raw (screen coordinates) or not (the size of the room)
         for (const surface of this.order) {
            let save = false
            if (this.cs.loop.run) {
               save = surface.ctx.getImageData(0, 0, surface.canvas.width, surface.canvas.height)
            }

            surface.canvas.width = surface.oneToOne ? width : this.cs.room.width
            surface.canvas.height = surface.oneToOne ? height : this.cs.room.height
            surface.width = surface.canvas.width
            surface.height = surface.canvas.height
            this.clear({ name: surface.name })
            this.ctxImageSmoothing(surface.ctx)

            if (this.cs.loop.run) surface.ctx.putImageData(save, 0, 0)
         }
      }

      ctxImageSmoothing(ctx) {
         ctx.webkitImageSmoothingEnabled = this.imageSmoothing
         ctx.mozImageSmoothingEnabled = this.imageSmoothing
         ctx.msImageSmoothingEnabled = this.imageSmoothing
         ctx.imageSmoothingEnabled = this.imageSmoothing
      }

      info(surfaceName) {
         return {
            canvas: this.list[surfaceName].canvas,
            width: this.list[surfaceName].width,
            height: this.list[surfaceName].height,
         }
      }

      debug(surfaceName) {
         const { canvas } = this.cs.surface.list[surfaceName]
         canvas.style.position = 'fixed'
         canvas.style.top = '50%'
         canvas.style.left = '50%'
         canvas.style.transform = 'translateX(-50%) translateY(-50%)'
         canvas.style.background = '#222'
         canvas.style.border = '2px solid #000'

         document.body.appendChild(canvas)
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_SURFACE
   else cs.surface = new CSENGINE_SURFACE(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Storage.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: STORAGE |------------------------ //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_STORAGE {
      constructor(cs) {
         this.cs = cs
         this.data = {}
      }

      init() {
         for (const storage of this.cs.storages) {
            this.write(storage)
         }
      }

      read(location) {
         return JSON.parse(this.data[location])
      }

      write(options) {
         this.data[options.location] = JSON.stringify(options.data)
         if (options.save) this.save(options.location)
      }

      // reminds me of bash ls command
      ls(location) {
         const startsWith = this.cs.default(location, '')
         const list = []
         for (const storageName of Object.keys(this.data)) {
            if (storageName.startsWith(startsWith)) {
               list.push(storageName)
            }
         }
         return list
      }

      save(location) {
         // local storage
         window.localStorage.setItem(location, this.data[location])
      }

      reset() {

      }
   }

   if (typeof module !== 'undefined') module.exports = CSENGINE_STORAGE
   else cs.storage = new CSENGINE_STORAGE(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Timer.js":[function(require,module,exports) {
// --------------------------------------------------------------------------- //
// ------------------------------| CS ENGINE: TIMER |------------------------- //
// --------------------------------------------------------------------------- //

(() => {
   class CSENGINE_TIMER {
      constructor(cs) {
         this.cs = cs

         this.list = []
         this.count = 0
      }

      loop() {
         this.list.forEach(timer => {
            if (timer.time) timer.time += 1

            timer.percent = timer.time / timer.duration

            if (timer.percent === 1) {
               timer.running = false
               this.unWatch(timer)
               if (timer.onEnd) timer.onEnd()
            }
         })
      }

      create(options) {
         this.count += 1

         const timer = {
            id: this.count,
            onStart: options.onStart,
            onEnd: options.onEnd,
            duration: options.duration,
            time: 0,
            percent: 0,
            running: false
         }

         if (options.start) {
            this.start(timer)
         }

         return timer
      }

      start(timer) {
         if (timer.running) return false

         if (timer.onStart) timer.onStart()
         timer.running = true
         timer.time = 1
         timer.percent = 0
         this.watch(timer)

         return true
      }

      reset(timer) {
         if (!timer.running) {
            return this.start(timer)
         }

         timer.time = 1
         timer.percent = 0
      }

      watch(timer) {
         this.list.push(timer)
      }

      unWatch(timer) {
         this.list = this.list.filter(num => num.id !== timer.id)
      }

      isOn(timer) {
         return timer.running
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_TIMER
   else cs.timer = new CSENGINE_TIMER(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/src/Vector.js":[function(require,module,exports) {
// -------------------------------------------------------------------------- //
// ----------------------------| CS ENGINE: VECTOR |------------------------- //
// -------------------------------------------------------------------------- //

(() => {
   class CSENGINE_VECTOR {
      constructor(cs) {
         this.cs = cs
      }

      create(x, y) {
         return { x, y }
      }

      createPolar(angle, length) {
         const { cs } = this
         return {
            x: cs.math.cos(angle) * length,
            y: cs.math.sin(angle) * length
         }
      }

      clone(v) {
         return this.cs.vector.create(v.x, v.y)
      }

      add(v0, v1) {
         return this.cs.vector.create(
            v0.x + v1.x,
            v0.y + v1.y,
         )
      }

      min(v0, v1) {
         return this.cs.vector.create(
            v0.x - v1.x,
            v0.y - v1.y,
         )
      }

      scale(v, s) {
         return this.cs.vector.create(
            v.x * s,
            v.y * s,
         )
      }

      dot(v0, v1) {
         return v0.x * v1.x + v0.y * v1.y
      }

      length(v) {
         return Math.sqrt(v.x * v.x + v.y * v.y)
      }

      unit(v) {
         return this.cs.vector.scale(v, 1 / this.cs.vector.length(v))
      }

      distance(v0, v1) {
         return this.cs.vector.length(this.cs.vector.min(v0, v1))
      }

      cross(v) {
         return this.cs.vector.create(-v.y, v.x)
      }

      direction(v0, v1) {
         return this.cs.vector.unit(this.cs.vector.min(v1, v0))
      }

      round(v0, hundreths = 1) {
         return {
            x: Math.round(v0.x * hundreths) / hundreths,
            y: Math.round(v0.y * hundreths) / hundreths,
         }
      }
   }

   // export (node / web)
   if (typeof module !== 'undefined') module.exports = CSENGINE_VECTOR
   else cs.vector = new CSENGINE_VECTOR(cs) // eslint-disable-line no-undef
})()

},{}],"../node_modules/cs-engine/main.require.js":[function(require,module,exports) {
const PartCamera = require('./src/Camera')
const PartDestroy = require('./src/Destroy')
const PartDraw = require('./src/Draw')
const PartFps = require('./src/Fps')
const PartFullscreen = require('./src/Fullscreen')
const PartInputKeyboard = require('./src/InputKeyboard')
const PartInputMouse = require('./src/InputMouse')
const PartInputTouch = require('./src/InputTouch')
const PartLoader = require('./src/Loader')
const PartLoop = require('./src/Loop')
const PartMath = require('./src/Math')
const PartNetwork = require('./src/Network')
const PartObject = require('./src/Object')
const PartRoom = require('./src/Room')
const PartScripts = require('./src/Scripts')
const PartSetup = require('./src/Setup')
const PartSound = require('./src/Sound')
const PartSprite = require('./src/Sprite')
const PartSurface = require('./src/Surface')
const PartStorage = require('./src/Storage')
const PartTimer = require('./src/Timer')
const PartVector = require('./src/Vector')

module.exports = class cs {
   constructor(options) {
      this.options = options

      // handy
      this.clone = (object) => { return JSON.parse(JSON.stringify(object)) }
      this.default = (want, ifnot) => { return want === undefined ? ifnot : want }
      
      // 1. setup
      this.cs = this
      this.canvas = options.canvas
      this.ctx = this.canvas.getContext('2d')

      this.path = options.path
      this.maxSize = options.maxSize || 2000
      this.start = options.start
      this.userStep = options.step
      this.userDraw = options.draw
      this.progress = options.progress || function () {}
      this.focus = options.focus || function () {}
      this.version = options.version || Math.random()
      this.global = options.global || {}
      this.progress = options.progress || function () {}
      this.focus = options.focus || function () {}


      this.objects = options.objects || {}
      this.script = options.scripts || {}
      this.sprites = options.sprites || []
      this.storages = options.storages || []
      this.sounds = options.sounds || []

      this.assets = {
         scripts: options.assets && options.assets.scripts ? options.assets.scripts : [],
         sprites: options.assets && options.assets.sprites ? options.assets.sprites : [],
         storages: options.assets && options.assets.storages ? options.assets.storages : [],
         sounds: options.assets && options.assets.sounds ? options.assets.sounds : [],
      }

      this.camera = new PartCamera(this)
      this.destroy = PartDestroy
      this.draw = new PartDraw(this)
      this.fps = new PartFps(this)
      this.fullscreen = new PartFullscreen(this)
      this.inputKeyboard = new PartInputKeyboard(this)
      this.inputMouse = new PartInputMouse(this)
      this.inputTouch = new PartInputTouch(this)
      this.loader = new PartLoader(this)
      this.loop = new PartLoop(this)
      this.math = new PartMath(this)
      this.network = new PartNetwork(this)
      this.object = new PartObject(this)
      this.room = new PartRoom(this)
      this.scripts = new PartScripts(this)
      this.setup = new PartSetup(this)
      this.sound = new PartSound(this)
      this.sprite = new PartSprite(this)
      this.storage = new PartStorage(this)
      this.surface = new PartSurface(this)
      this.timer = new PartTimer(this)
      this.vector = new PartVector(this)

      // load
      this.loader.load() // loader will call cs.start()
   }
}

},{"./src/Camera":"../node_modules/cs-engine/src/Camera.js","./src/Destroy":"../node_modules/cs-engine/src/Destroy.js","./src/Draw":"../node_modules/cs-engine/src/Draw.js","./src/Fps":"../node_modules/cs-engine/src/Fps.js","./src/Fullscreen":"../node_modules/cs-engine/src/Fullscreen.js","./src/InputKeyboard":"../node_modules/cs-engine/src/InputKeyboard.js","./src/InputMouse":"../node_modules/cs-engine/src/InputMouse.js","./src/InputTouch":"../node_modules/cs-engine/src/InputTouch.js","./src/Loader":"../node_modules/cs-engine/src/Loader.js","./src/Loop":"../node_modules/cs-engine/src/Loop.js","./src/Math":"../node_modules/cs-engine/src/Math.js","./src/Network":"../node_modules/cs-engine/src/Network.js","./src/Object":"../node_modules/cs-engine/src/Object.js","./src/Room":"../node_modules/cs-engine/src/Room.js","./src/Scripts":"../node_modules/cs-engine/src/Scripts.js","./src/Setup":"../node_modules/cs-engine/src/Setup.js","./src/Sound":"../node_modules/cs-engine/src/Sound.js","./src/Sprite":"../node_modules/cs-engine/src/Sprite.js","./src/Surface":"../node_modules/cs-engine/src/Surface.js","./src/Storage":"../node_modules/cs-engine/src/Storage.js","./src/Timer":"../node_modules/cs-engine/src/Timer.js","./src/Vector":"../node_modules/cs-engine/src/Vector.js"}],"objects/block.js":[function(require,module,exports) {
module.exports = {
  draw: function draw(_ref) {
    var object = _ref.object,
        cs = _ref.cs;
    cs.draw.setColor('red');
    cs.draw.fillRect({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
  }
};
},{}],"index.js":[function(require,module,exports) {
// exmaple of a server side engine!
var CS = require('cs-engine');

window.cs = new CS({
  canvas: canvas,
  objects: {
    'block': require('./objects/block')
  },
  start: function start(_ref) {
    var cs = _ref.cs;
    console.log('running start');
    cs.object.create({
      type: 'block'
    });
  }
});
},{"cs-engine":"../node_modules/cs-engine/main.require.js","./objects/block":"objects/block.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62729" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map