# CS-Engine
engine for building 2D games

> Please no pull requests/forks on this project. This is a personal project of mine. Not made to compete with other game development solutions. Meant as read-only

# What's included

    cs-engine/
    ├── engine/
    │   ├── style.css
    │   ├── scr_core.js
    │   ├── template.html
    │   └── parts/
    │       ├── camera.js
    │       ├── draw.js
    │       ├── fps.js
    │       ├── input.js
    │       ├── keys.js
    │       ├── loop.js
    │       ├── math.js
    │       ├── mouse.js
    │       ├── network.js
    │       ├── object.js
    │       ├── particle.js
    │       ├── room.js
    │       ├── setup.js
    │       ├── setup.js
    │       ├── sound.js
    │       ├── sprite.js
    │       ├── storage.js
    │       ├── surface.js
    │       ├── text.js
    │       └── touch.js
    └── example/
        ├── bird
        ├── cube
        └── warrior

# Setup
The engine requires the CSS and Javascript file. Here is a template for a project
```html
<!DOCTYPE html>
<html>
   <head>
      <!-- Title/Meta Setup -->
      <title>cs-engine</title>
      <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no">

      <!-- Game Engine -->
      <link rel="stylesheet" type="text/css" href="/engine/css.css" />
      <script src='/engine/scr_core.js'></script>
   </head>
   <body>
      <!--Game Area-->
      <div id="cs-view"></div>

      <!-- Initialize -->
      <script>
         cs.load({
            canvas: 'cs-view',
            sprites: [
               { path: 'sprites/spr_player' }
            ],
            scripts: [
               { path: 'objects/obj_player' }
            ],
            start: function(){
               // Room / Camera setup
               cs.room.setup({ width: 192, height: 192, background: "#222" })
               cs.camera.setup({ maxWidth:300, maxHeight:200 })

               //Create Objects
               cs.obj.create({ type:'obj_player', attr: { x:50, y:50 }})
            }
         })
      </script>
   </body>
</html>
```

# Initialization
The cs.load function loads the assets and initializes a canvas

```js
/**
* load function
* @arg {object} options - the options
* @arg {string} options.canvas - the id of the canvas to use
* @arg {array of objects} options.sprites - the list of sprites to load
* @arg {array of objects} options.scripts - the list of sprites to load
* @arg {array of objects} options.sounds - the list of sounds to load
* @arg {array of objects} options.storages - the list of storages to load
* @arg {function} options.start - called when finished loading
**/
```

# Sprite Loading Options
When loading sprites we can specify some options. Only path is required

```js
/**
* sprite load
* @arg {object} options - the options
* @arg {string} options.path - the id of the canvas to use
* @arg {string} [options.name=calculated] - override the filename and set sprite name]
* @arg {number} [options.frames=0] - how many frames in the sprite sheet
* @arg {number} [options.width=calculated] - The width of a frame
* @arg {number} [options.height=calculated] - The height of a frame
* @arg {number} [options.xoff=0] - The horizontal offset when drawing
* @arg {number} [options.yoff=0] - The vertical offset when drawing
* @arg {object} [options.mask=calculated] - And object with { x, y, width, height }
**/
```

# Script Loading Options
Any `.js` files that are required for the project
```js
/**
* script load
* @arg {object} options - the options
* @arg {string} options.path - the id of the canvas to use
**/
```

# Room
In the start function define the room size.

> note: This can be changed at any time

```js
// example room 192px by 192px and a grey background
cs.room.setup({ width: 192, height: 192, background: "#222" })

/**
* room setup
* @arg {object} options - the options
* @arg {number} [options.width] - The width of a room
* @arg {number} [options.height] - The height of a room
* @arg {string} [options.background] - The background of the room
**/

```


# Camera
The camera is the area the game and GUI is drawn to. The game/gui surfaces are drawn to hidden canvases separately then drawn to the view/camera canvas. There are a couple settings that can be tweaked to change the view.

The maxWidth and maxHeight set the maximum literal pixel size of the canvas. The engine will then try to get the closest aspect ratio to the size you set. Then it will be stretched with CSS to fill the entire screen.

In the start function define the camera settings.

> note: this can be changed at any time

```js
// example camera maxWidth and Height
cs.camera.setup({ maxWidth:300, maxHeight:200 })

/**
* camera setup
* @arg {object} options - the options
* @arg {number} [options.maxWidth] - The max width of the camera
* @arg {number} [options.maxHeight] - The max height of the camera
**/

```

# Game Objects
Inside a script file you can create the object by using:
```js
 cs.objects['obj_name'] = {
	create: function() { console.log('i run when created') },
	step: function() { console.log('i run each frame of the game') }
 }
```

Create an object using `cs.obj.create()`
```js
cs.obj.create({
   type: 'obj_name',
   attr: {
      // Attributes to add to the game object example x/y
      x: 50,
      y: 50
   }
})
```

# Drawing

## Sprites
```js
// example drawing player sprite at coordinated (50, 50)
cs.draw.sprite({ spr: 'spr_player', x: 50, y: 50 })

/**
* @arg {object} options - the options
* @arg {string} options.spr - The name of the sprite
* @arg {number} [options.x] - The x position
* @arg {number} [options.y] - the y position
* @arg {number} [options.width=width] - The width to draw the sprite
* @arg {number} [options.height=height] - The height to draw the sprite
* @arg {number} [options.scaleX=1] - Horizontal scaling
* @arg {number} [options.scaleY=1] - Vertical scaling
**/
```

## Text
```js
// example drawing text 'hello world' at coordinated (50, 50)
cs.draw.text({ text: 'hello world', x: 50, y: 50 })

/**
* @arg {object} options - the options
* @arg {string} options.text - The text to draw
* @arg {number} [options.x] - The x position
* @arg {number} [options.y] - the y position
**/
```

## Shapes

##### Fill Recangle
```js
// example fill rectangle in top corner with width 50 and height 50
cs.draw.fillRect({ x:0, y:0, width:50, height: 50 })

/**
* @arg {object} options - the options
* @arg {number} [options.x] - The x position
* @arg {number} [options.y] - the y position
* @arg {number} [options.width] - the width
* @arg {number} [options.height] - the height
**/
```

##### Stroke Rectangle
```js
// example outlined rectangle in top corner with width 50 and height 50
cs.draw.strokeRect({ x:0, y:0, width:50, height: 50 })

/**
* @arg {object} options - the options
* @arg {number} [options.x] - The x position
* @arg {number} [options.y] - the y position
* @arg {number} [options.width] - the width
* @arg {number} [options.height] - the height
**/
```

##### Line
```js
// example of a line starting in top left corner to (50, 50)
cs.draw.line({ x1:0, y1:0, x2:50, y2: 50 })

/**
* @arg {object} options - the options
* @arg {number} [options.x1] - The start x position
* @arg {number} [options.y1] - the start y position
* @arg {number} [options.x2] - the end x position
* @arg {number} [options.y2] - the end y position
**/
```

##### Draw Settings
```js
// example setting draw color to red and font to 16px arial
cs.draw.settings({ color:'red', font:'16px Arial' })

/**
* @arg {object} options - the options
* @arg {number} [options.color='#000'] - HEX/RGB/String value of color
* @arg {number} [options.font='12px Arial'] - Font setting. Font Size space Font Name
* @arg {number} [options.width=1] - line width for stroke functions
* @arg {number} [options.alpha=1] - 0 being invisible 1 being fully visible
* @arg {number} [options.textAlign='start'] - start/middle/end horizontal align
* @arg {number} [options.textBaseline='top'] - top/bottom/middle/baseline vertical align
* @arg {number} [options.lineHeight=10] - line height spacing for text
* @arg {number} [options.operation='source-over'] - set canvas manual on draw operations
**/
```

Note: Draw settings are reset after any drawing event! They are layer specific and the layer resets after each draw event. Use right before your drawing event

# The Game Camera
