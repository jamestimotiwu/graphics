/**
 * @file MP1 Illini Animation
 * @author James Timotiwu <jit2@illinois.edu>
 */

/** Rendering globals */
/** @global WebGL context */
var gl;

/** @global Shader program */
var shaderProgram;

/** @global Position buffer */
var vertexBuffer;

/** Meshing globals */
/** @global Mesh position vertex set
 *  Indexes are mapped to same color index
*/
var meshSet = []

/** Transformation globals */
/** @global Modelview matrix*/
var mvMatrix = glMatrix.mat4.create();

/** @global Projection matrix */
var pMatrix = glMatrix.mat4.create();

/** @global Angle of rotation */
var defAngle = 0;

/** View globals */
/** @global Camera location in world coordinates */
var eyePt = vec3.fromValues(0.0, 0.0, 0.0);

/** @global Direction of view in world coordinates (down -z axis)*/
var viewDir = vec3.fromValues(0.0, 0.0, -1.0);

/** @global Up vector in world coordinates (up y)*/
var up = vec3.fromValues(0.0, 1.0, 0.0);

/** @global Location of pt along view direction in world coordinates */
var viewPt = vec3.fromValues(0.0, 0.0, 0.0);

/** @global Elapsed tick */
var t = 0; 

/**
 * Get WebGL context for canvas
 * @param {element} canvas canvas
 * @return {Object} WebGL context
 */
function getGLContext(canvas) {
     var context = canvas.getContext("webgl");

     if (context) {
         context.viewportWidth = canvas.width;
         context.viewportHeight = canvas.height;
     }
     else {
         console.log("Failed to create context")
         return null;
     }

     return context;
}

function draw(vertexBuffer) {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //gl.drawElements(gl.TRIANGLES, ,num)
  /* Generate view */
  generateView();

  /* Draw terrain */

  bufferGeometry(vertexBuffer);
  /* Set terrain in front of view */
  vec3.set(transformVec,0.0,-0.25,-2.0);
  mat4.translate(mvMatrix, mvMatrix,transformVec);
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(viewRot));
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(-75));


}

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

/**
 * Buffer vertices for geometry
 * @param {Array} positions 
 */
function bufferGeometry(positions) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

/**
 * Initialize buffer for vertex position
 */
function initializeBuffers() {
  var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
  var colorAttributeLocation = gl.getAttribLocation(shaderProgram, "a_color");
  vertexBuffer = gl.createBuffer();
  colorBuffer = gl.createBuffer();

   // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(shaderProgram);
  // Set window resolution
  gl.uniform2f(gl.getUniformLocation(shaderProgram, "u_resolution"), gl.canvas.width, gl.canvas.height);
  
  // Enable vertex buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 2 components per iteration
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // Enable color buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

}

/**
 * Initializes shader program based on shader code in DOM
 */
function initializeShaderProgram() {
  var vertexShader = initializeShader("vertex-shader", gl.VERTEX_SHADER)
  var fragmentShader = initializeShader("fragment-shader", gl.FRAGMENT_SHADER)

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "u_color");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    return shaderProgram;
  }

  console.log("initializeShader: Error setting up shaders")
}

/**
 * Initialize shaders
 * @param {string} id document id of vertex/fragment shader to load from DOM
 * @param {element} type fragment or vertex(gl.VERTEX_SHADER, gl.FRAGMENT_SHADER)
 */
function initializeShader(id, type) {
  var shaderSource = document.getElementById(id).text;
  var shader = gl.createShader(type);

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.log("initializeShaders: Error compiling shader" + gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

/**
 * Loads meshes for animation
 */
function initializeMeshes() {
  meshSet.push(generateIlliniGeometry(0,0));
  colorSet.push(generateIlliniColors());

  meshSet.push(generateLandscapeGeometry());
  colorSet.push(generateLandscapeColors());
}

/**
 * Initialize WebGL canvas, context, shaders, rendering engines
 */
function startup() {
  /**
   * 1. Retrieve canvas element by id
   * 2. Get rendering context
   * 3. Set up shaders and buffers
   * 3. Draw graphics from element
   */
  var canvas = document.getElementById("mp1GLCanvas")
  gl = getGLContext(canvas)
  //initializeMeshes();
  initializeTerrain();
  initializeShaderProgram();
  initializeBuffers();
  gl.clear(gl.COLOR_BUFFER_BIT);
}