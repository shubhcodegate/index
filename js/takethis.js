var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  frontcanvas = document.querySelector('canvas'),
  colorScheme = ['#2c3531','#116466','#d9b08c','#ffcb9a','#d1e8e2'],
  wallwidth = 50000;
var engine = Engine.create();

if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                  || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                  || function(callback){ window.setTimeout(function() { callback(Common.now()); }, 1000 / 60); };

    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                  || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
}

var simulationArea = {
    canvas : document.querySelector('canvas'),
    width : document.querySelector('canvas').clientWidth,
    height : document.querySelector('canvas').clientHeight, 

    init : function() {
        // this.interval = setInterval(myswarm.update(), 20);
        window.addEventListener('keydown', function (e) {
            simulationArea.keys = (simulationArea.keys || []);
            simulationArea.keys[e.keyCode] = (e.type == "keydown");
        });
        window.addEventListener('keyup', function (e) {
            simulationArea.keys[e.keyCode] = (e.type == "keydown");
            Body.applyForce( ball, {x: ball.position.x, y: ball.position.y}, {x: 0, y: -0.5});            
        });
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
        this.canvas.onmousemove=function(e) {
            mousePos = {x:e.x,y:e.y};
        };
        this.canvas.ontouchmove=function(e) {
            mousePos = {x:e.touches[0].clientX,
                        y:e.touches[0].clientY};
        };
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = colorScheme[1];
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
var render = Render.create({
  canvas: simulationArea.canvas,
  engine: engine,
  options: {
        width: simulationArea.canvas.clientWidth,
        height: simulationArea.canvas.clientHeight,
        pixelRatio: window.devicePixelRatio || 1,
        background: colorScheme[1],
        wireframes: false
  }
});


var topWall = Bodies.rectangle(simulationArea.width/2, -wallwidth/2, simulationArea.width, wallwidth, { 
    isStatic: true, 
    render: {
        fillStyle: 'transparent',
        strokeStyle: 'none',
        lineWidth: 1

   }});
var leftWall = Bodies.rectangle(-wallwidth/2, simulationArea.height/2, wallwidth, simulationArea.height, { 
    isStatic: true, 
    render: {
        fillStyle: 'transparent',
        strokeStyle: 'none',
        lineWidth: 1

   }});
var rightWall = Bodies.rectangle(simulationArea.width + wallwidth/2, simulationArea.height/2, wallwidth, simulationArea.height, { 
    isStatic: true, 
    render: {
        fillStyle: 'transparent',
        strokeStyle: 'none',
        lineWidth: 1

   }});
var bottomWall = Bodies.rectangle(simulationArea.width/2, simulationArea.height+wallwidth/2, simulationArea.width, wallwidth, { 
    isStatic: true, 
    render: {
        fillStyle: 'transparent',
        strokeStyle: 'none',
        lineWidth: 1

   }});

var ball = Bodies.circle(90, 280, 20,{
    restitution: 1,
    render: {
        fillStyle: colorScheme[2],
        strokeStyle: 'none',
        lineWidth: 1

   }
});

var ball2 = Bodies.circle(90, 280, 20,{
    restitution: 1,
    render: {
        fillStyle: colorScheme[2],
        strokeStyle: 'none',
        lineWidth: 1

   }
});
balls = [];
for (let index = 0; index < simulationArea.height; index+=50) {
    for(let hor = 0; hor<simulationArea.width; hor+=70)    
        var part = new Particle(engine.world, hor, index, 5,{
            restitution: 1,
            render: {
                fillStyle: colorScheme[2],
                strokeStyle: 'none',
                lineWidth: 1
        
        }
        });
}
// var myswarm = Swarm.createSwarm(engine.world,5,{x:100,y:100});
World.add(engine.world, [topWall, leftWall, rightWall, bottomWall, ball,ball2]);

simulationArea.init();
Engine.run(engine);

Render.run(render);


