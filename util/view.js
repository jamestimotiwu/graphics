/** View globals */
/** @global Camera location in world coordinates */
var eyePt = vec3.fromValues(0.0, 0.0, 0.0);

/** @global Direction of view in world coordinates (down -z axis)*/
var viewDir = vec3.fromValues(0.0, 0.0, -1.0);

/** @global Up vector in world coordinates (up y)*/
var up = vec3.fromValues(0.0, 1.0, 0.0);

/** @global Location of pt along view direction in world coordinates */
var viewPt = vec3.fromValues(0.0, 0.0, 1.0);

/** Transformation globals */
/** @global Modelview matrix*/
var mvMatrix = mat4.create();

var orientationQuat = quat.create();

/** @global Modelview stack for hierarchical stack operations */
var mvMatrixStack = [];

/** Set up MV matrix */

/** Euler to quaternion */

/** Quaternion to euler */

/** Update quaternion with euler key presses */

/**
 * Generate perspective given viewport height and width to projection matrix pMatrix
 */
function generatePerspective() {
  mat4.perspective(pMatrix, degToRad(45), 
  gl.viewportWidth / gl.viewportHeight,
  0.1, 200.0);
}

/**
 * Generate lookAt vector and initialize MV matrix with calculated view
 */
function generateView() {
  /* Look down -z; viewPt, eyePt, viewDir*/
  vec3.add(viewPt, eyePt, viewDir);
  mat4.lookAt(mvMatrix, eyePt, viewPt, up);
}

/** mvMatrix Stack Operations */
/** mvMatrix stack push operation */
function mvPush() {
  let copy = mat4.clone(mvMatrix);
  mvMatrixStack.push(copy);
}

/** mvMatrix stack pop operation */
function mvPop() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

/**
 * Pass model view matrix in global to shader programs
 */
function setShaderModelView() {
  /* Usage of sending uniform matrix down to shader here */
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function updateView() {
  mvPush(mvMatrix);
  vec3.set(transformVec,0.0,-0.25,-3.0);
  mat4.translate(mvMatrix, mvMatrix,transformVec);
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(viewRot + 30));
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(-70));
  
  setShaderModelView();
  mvPop();
}
