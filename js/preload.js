var pixelData,drawthis;
function loadPixels(){
    var myimage = new Image();
    myimage.src = "img/Sclear.png";
    myimage.onload = function(){
        var newcanvas = document.createElement('canvas');
        newcanvas.width = simulationArea.width;
        newcanvas.height = simulationArea.height;
        newcanvas.id = 'testid';
        context = newcanvas.getContext('2d');
        context.drawImage(myimage, 0, 0, simulationArea.width, simulationArea.height);
        pixelData = context.getImageData(0, 0, simulationArea.width, simulationArea.height).data;//[1] (index*4+1) index is required data.
        console.log('PixelData Loaded');
        drawthis = newcanvas;
    }
}
loadPixels();