function buildTransformString(drawable) {
  validateDrawable(drawable);
  var angle = drawable.angle || 0;

  var positionX = drawable.position.x;
  var positionY = drawable.position.y;

  var offsetX = 0, offsetY = 0;
  if (drawable.drawOffset) {
    offsetX = drawable.drawOffset.x || offsetX;
    offsetY = drawable.drawOffset.y || offsetY;
    positionX -= offsetX;
    positionY -= offsetY;
  }

  return "translate(" + positionX + "," + positionY + ") rotate(" + angle + " " + offsetX + " " + offsetY + ")";
}

function validateDrawable(obj) {
  if (typeof obj === "undefined")
    throw new Error("obj was not drawable, it was undefined");

  var requiredProperties = ['position'];
  for(var i = 0; i < requiredProperties.length; i++) { 
    var property = requiredProperties[i];
    if (typeof obj[property] === "undefined") {
      throw new Error("obj was not drawable, it was missing " + property);
    }
  }
}

exports.buildTransformString = buildTransformString;