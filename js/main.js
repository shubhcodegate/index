function startGame(){
    myGameArea.start();
    myGamePiece = new myParticle(0,0,30,100,"red");
    console.log(myGamePiece);
};
var myGameArea = {
    // canvas : document.querySelector('canvas'),
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y) {
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }
}

function updateGameArea() {
    myGameArea.clear();
    
    if (myGameArea.key && myGameArea.key == 37) {myGamePiece.applyForce(new Vector2D(-1,0));}
    if (myGameArea.key && myGameArea.key == 39) {myGamePiece.applyForce(new Vector2D(1,0));}
    if (myGameArea.key && myGameArea.key == 38) {myGamePiece.applyForce(new Vector2D(0,-1));}
    if (myGameArea.key && myGameArea.key == 40) {myGamePiece.applyForce(new Vector2D(0,1));}
    myGamePiece.move();    
    myGamePiece.draw();
}
