var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  frontcanvas = document.querySelector('canvas'),
  colorScheme = ['#2c3531','#116466','#d9b08c','#ffcb9a','#d1e8e2'],
  wallwidth = 500000,
  mousePos={x:0,y:0};

var simulationArea = {
    canvas : document.querySelector('canvas'),
    width : document.querySelector('canvas').clientWidth,
    height : document.querySelector('canvas').clientHeight, 

    init : function() {
        this.interval = setInterval(update, 30);
        window.addEventListener('keydown', function (e) {
            simulationArea.keys = (simulationArea.keys || []);
            simulationArea.keys[e.keyCode] = (e.type == "keydown");
            myswarm.collection[0].applyForce(Vector.create(myswarm.collection[0].x,myswarm.collection[0].y), {x: 0, y: -0.005});
        });
        window.addEventListener('keyup', function (e) {
            simulationArea.keys[e.keyCode] = (e.type == "keydown");
            myswarm.collection[0].applyForce(Vector.create(myswarm.collection[0].x,myswarm.collection[0].y), {x: 0, y: -0.005});
            // Body.applyForce( myswarm.collection[0].body, {x: ball.position.x, y: ball.position.y}, {x: 0, y: -0.005});            
        });
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
        this.canvas.onmousemove=function(e) {
            mousePos.x=e.x,mousePos.y=e.y;
        };
        this.canvas.ontouchmove=function(e) {
            mousePos.x=e.touches[0].clientX,
            mousePos.y=e.touches[0].clientY;
        };
        this.canvas.onclick=function(e) {
            document.querySelector('canvas').dispatchEvent(exploreEvent);
            console.log('Visible'+document.querySelector('canvas').getContext('2d').getImageData(e.offsetX, e.offsetY, 1, 1).data);
            console.log('@offsetX '+e.offsetX + ' and offsetY '+e.offsetY);
            console.log('Invisible '+drawthis.getContext('2d').getImageData(e.offsetX, e.offsetY, 1, 1).data)
            let i =Math.floor(e.offsetY*simulationArea.width + e.offsetX);
            let dist = pixelData[i*4]+pixelData[i*4+1]+pixelData[i*4+2]+pixelData[i*4+3]
            console.log('PixelData is '+ pixelData.slice(i*4,i*4+4));
            console.log(dist*5)
        };
        this.canvas.addEventListener("exploreEvent",function (e) { 
            console.log("event triggered"); 
            for (let index = 0; index < swarmlist.length; index++) {
                swarmlist[index].explore();
            }},
            false);
    },
    run : function(myswarm) {
        (function loop(time){
            this.frameRequestId = _requestAnimationFrame(loop);
            myswarm.update();
        })();
    },
    stop : function(myswarm) {
        _cancelAnimationFrame(this.frameRequestId);
    },
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = colorScheme[1];
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var engine = Engine.create();
engine.world.gravity = {x:0,y:0}
var myswarm = Swarm.createSwarm(engine.world,3,Vector.create(100,100));
var swarmlist = [];
for (let index = 0; index < 150; index++) {
    swarmlist.push(Swarm.createSwarm(engine.world,3,Vector.create(100,100)));
}
// var newHunter =new  HunterParticle(engine.world,50,50,5,myswarm.collection[2]);
// var newHunter2 =new  HunterParticle(engine.world,50,50,5,myswarm.collection[0]);
var newfollow = new FollowerParticle(engine.world,simulationArea.width/2,simulationArea.height/2,20,mousePos)
// myswarm.addHunters([newHunter,newHunter2]);
// myswarm.addTarget(newfollow);
function update() {
    // myswarm.addTarget(mousePos);
    // newfollow.addTarget(mousePos);
    // newHunter.addTarget(mousePos);
    // newHunter.update();
    // newHunter2.update();
    myswarm.update();
    newfollow.update();
    for (let index = 0; index < swarmlist.length; index++) {
        swarmlist[index].update();
        // swarmlist[index].explore();
    }

}

if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                  || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                  || function(callback){ window.setTimeout(function() { callback(Common.now()); }, 1000 / 60); };

    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                  || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
}

var render = Render.create({
  canvas: simulationArea.canvas,
  engine: engine,
  options: {
        width: simulationArea.canvas.clientWidth,
        height: simulationArea.canvas.clientHeight,
        pixelRatio: window.devicePixelRatio || 1,
        background: colorScheme[1],
        wireframes: false,
        showAngleIndicator: false,
        showVelocity: false,
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
for (let index = 0; index < simulationArea.height; index+=1000) {
    for(let hor = 0; hor<simulationArea.width; hor+=1000)    
        var part = new Particle(engine.world, hor, index, 5,{
            restitution: 1,
            render: {
                fillStyle: colorScheme[2],
                strokeStyle: 'none',
                lineWidth: 1
        
        }
        });
}

World.add(engine.world, [topWall, leftWall, rightWall, bottomWall, ball,ball2]);



// var start = null;
// var element = document.getElementById('thisone');

// function step(timestamp) {
//   if (!start) start = timestamp;
//   var progress = timestamp - start;
//   element.style.transform = 'translateX(' +progress / 10 + 'px)';
//   console.log(myswarm.collection[0].x);

// //   myswarm.update();
//     window.requestAnimationFrame(step);
// }

// window.requestAnimationFrame(step);


simulationArea.init();
Engine.run(engine);
// simulationArea.run(myswarm);
Render.run(render);


