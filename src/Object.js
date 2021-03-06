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
         this.autoApplyAttr = true
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
         if (this.autoApplyAttr) for (const name in attr) { newObject[name] = attr[name] }
         for (const name in template.attr) { newObject[name] = template.attr[name] }

         // add to list
         this.new.push(newObject)
         this.unique += 1

         // grouping
         if (!this.objGroups[options.type]) this.objGroups[options.type] = []
         this.objGroups[options.type].push(newObject)

         // run create event
         if (newObject.create) {
            newObject.create({
               object: newObject,
               cs: this.cs,
               attr: attr || {},
            })
         }

         return newObject
      }

      addNewObjects() {
         this.list = this.list.concat(this.new)
         this.new = []
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
         object.core.zIndex = zIndex
         this.orderObjectsByZIndex()
      }

      destroy(destroyObjOrID, fadeTimer) {
         const destroyObj = (typeof destroyObjOrID === 'number')
            ? this.id(destroyObjOrID)
            : destroyObjOrID

         if (destroyObj.core.live === false) return

         destroyObj.core.live = false
         destroyObj.core.active = false
         destroyObj.core.fadeTimer = fadeTimer || 0

         // remove from objGroup
         const { type } = destroyObj.core
         this.objGroups[type] = this.objGroups[type].filter(o => o.core.live)
         this.new = this.new.filter(o => o.core.live)
         
         // call destroy function
         if (destroyObj.destroy) {
            destroyObj.destroy({ object: destroyObj, cs: this.cs })
         }
      }

      clean() {
         this.new = this.new.filter(o => o.core.live)
         this.list = this.list.filter(o => o.core.live)
      }

      every() {
         return this.list.concat(this.new)
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

   // export (web / node)
   if (typeof cs !== 'undefined') cs.object = new CSENGINE_OBJECT(cs) // eslint-disable-line no-undef
   else module.exports = CSENGINE_OBJECT
})()
