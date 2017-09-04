cs.loop = {
   run : true,
   endSteps: [],
   step : function(){
      if(cs.loop.run)
         setTimeout(function(){ cs.loop.step() }, 1000/60)

      cs.fps.update()
      cs.key.execute()
      cs.draw.debugReset()
      cs.camera.update()
      cs.surface.clearAll()

      var i = cs.obj.list.length; while(i--){
         if(cs.obj.list[i].live){
            var obj = cs.obj.list[i];
            cs.draw.setSurface(obj.surface);

            cs.particle.settings = obj.particle.settings;
            cs.particle.obj = obj;
            var step = cs.objects[obj.type].step;
            step.call(obj);
         }
      }

      cs.surface.resetAll()
      cs.key.reset()
      cs.touch.reset()

      //Resize Canvas
      cs.surface.checkResize()
      cs.surface.displayAll()
      if(cs.room.restarting === true)
         cs.room.reset()

      //Execute end steps
      while(this.endSteps.length)
         this.endSteps.pop()()
   },
   endStep: function(func){
      this.endSteps.push(func)
   }
}