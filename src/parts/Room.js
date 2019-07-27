//----------------------------------------------------------------------------//
//------------------------------| CS ENGINE: ROOM |---------------------------//
//----------------------------------------------------------------------------//
(() => {
   class CSENGINE_ROOM {
      constructor(cs) {
         this.cs = cs

         this.width = 100
         this.height = 100
         this.rect = {
            x: 0,
            y: 0,
            width: 100,
            height: 100
         }
      }

      setup(info) {
         this.width = info.width
         this.height = info.height
         if (info.background) cs.canvas.style.background = info.background
         this.rect = { x: 0, y: 0, width: this.width, height: this.height }
         this.cs.resize()
      }

      outside(rect) {
         var width = this.cs.default(rect.width, 0)
         var height = this.cs.default(rect.height, 0)

         return (
            rect.x < 0 ||
            rect.y < 0 ||
            rect.x + width > this.width ||
            rect.y + height > this.height
         )
      }
   }

   // export (node / web)
   typeof module !== 'undefined'
      ? module.exports = CSENGINE_ROOM
      : cs.room = new CSENGINE_ROOM(cs)
})()
