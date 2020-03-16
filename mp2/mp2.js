/**
 * @file MP2 Terrain
 * @author James Timotiwu <jit2@illinois.edu>
 */

const { mat4, mat3, vec3, quat } = glMatrix;

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
var mvMatrix = mat4.create();

/** @global Modelview stack for hierarchical stack operations */
var mvMatrixStack = [];

/** @global Projection matrix */
var pMatrix = mat4.create();

/** @global Normal matrix */
var nMatrix = mat3.create();

/** @global Angle of rotation */
var defAngle = 0;

/** @global Angle of rotation around y axis for view*/
var viewRot = 10;

/** @global Quaternion for rotations and view movement */
var quatOrientation = quat.create();

/** View globals */
/** @global Camera location in world coordinates */
var eyePt = vec3.fromValues(0.0, 0.3, 2.0);

/** @global Direction of view in world coordinates (down -z axis)*/
var viewDir = vec3.fromValues(0.0, 0.0, -1.0);

/** @global Up vector in world coordinates (up y)*/
var up = vec3.fromValues(0.0, 1.0, 0.0);

/** @global Location of pt along view direction in world coordinates */
var viewPt = vec3.fromValues(0.0, 0.0, 1.0);


/** @global Elapsed tick */
var t = 0; 

/** Lighting parameters */
/** @global Light position in VIEW coordinates */
var lightPosition = [0,1,3];
/** @global Ambient light color/intensity for Phong reflection */
var lAmbient = [0.1,0.1,0.1];
/** @global Diffuse light color/intensity for Phong reflection */
var lDiffuse = [0.7,1.0,0.3];
/** @global Specular light color/intensity for Phong reflection */
var lSpecular =[0.2,0.5,1.0];

//Material parameters
/** @global Ambient material color/intensity for Phong reflection */
var kAmbient = [1.0,1.0,1.0];
/** @global Diffuse material color/intensity for Phong reflection */
var kTerrainDiffuse = [150.0/255.0,163.0/255.0,63.0/255.0];
/** @global Specular material color/intensity for Phong reflection */
var kSpecular = [1.0,1.0,1.0];
/** @global Shininess exponent for Phong reflection */
var shininess = 20;
/** @global Edge color fpr wireframeish rendering */
var kEdgeBlack = [0.0,0.0,0.0];
/** @global Edge color for wireframe rendering */
var kEdgeWhite = [1.0,1.0,1.0];


/** @global Fog density */
var fogDensity = 0.6

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

/**
 * Draw function to set up perspective, view, and terrain
 */
function draw() {
  let transformVec = vec3.create();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  generatePerspective();
  //gl.drawElements(gl.TRIANGLES, ,num)
  /* Generate view */
  generateView();
  /* Set terrain in front of view */
  //mvPush(mvMatrix);
  vec3.set(transformVec,0.0,-0.25, -0.3);
  //vec3.set(position, 0, -0.25, position[2] + 0.01)
  mat4.translate(mvMatrix, mvMatrix,transformVec);
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(viewRot + 30));
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(-70));
  //mvPush(mvMatrix);
  
  setShaderModelView();
  setShaderNormal(mvMatrix);
  //mvPop();

  setShaderProjection();
  
  setLightUniforms(lightPosition,lAmbient,lDiffuse,lSpecular);
  setFogUniform(fogDensity);
  setMaterialUniforms(shininess,kAmbient,kTerrainDiffuse,kSpecular);
  drawTerrain();
}

/**
 * Pass model view matrix in global to shader programs
 */
function setShaderModelView() {
  /* Usage of sending uniform matrix down to shader here */
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
 * Pass projection matrix in global to shader programs
 */
function setShaderProjection() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

/**
 * Pass shader normals in global to shader programs
 * @param {*} viewMatrix 
 */
function setShaderNormal(viewMatrix) {
  mat3.fromMat4(nMatrix,viewMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  console.log(nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
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

/** mvMatrix Stack Operations */
/** mvMatrix stack push operation */
function mvPush(matrix) {
  let copy = mat4.clone(matrix);
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
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(shaderProgram);  
  // Set window resolution
  gl.uniform2f(gl.getUniformLocation(shaderProgram, "u_resolution"), gl.canvas.width, gl.canvas.height);
}

/**
 * Initializes shader program based on shader code in DOM
 */
function initializeShaderProgram() {
  var vertexShader = initializeShader("vertex-shader", gl.VERTEX_SHADER)
  var fragmentShader = initializeShader("fragment-shader", gl.FRAGMENT_SHADER)

  console.log(vertexShader);
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_vertex");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "a_normal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    initializeUniforms();
    return shaderProgram;
  }

  console.log("initializeShader: Error setting up shaders")
}

/**
 * Initialize all uniform variables for matricies and fragment shading
 */
function initializeUniforms() {
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
  shaderProgram.uniformShininessLoc = gl.getUniformLocation(shaderProgram, "uShininess");    
  shaderProgram.uniformAmbientMaterialColorLoc = gl.getUniformLocation(shaderProgram, "uKAmbient");  
  shaderProgram.uniformDiffuseMaterialColorLoc = gl.getUniformLocation(shaderProgram, "uKDiffuse");
  shaderProgram.uniformSpecularMaterialColorLoc = gl.getUniformLocation(shaderProgram, "uKSpecular");
  shaderProgram.uniformFogDensityLoc = gl.getUniformLocation(shaderProgram, "uFogDensity");
}

/**
 * Sends material information to the shader
 * @param {Float32} alpha shininess coefficient
 * @param {Float32Array} a Ambient material color
 * @param {Float32Array} d Diffuse material color
 * @param {Float32Array} s Specular material color
 */
function setMaterialUniforms(alpha,a,d,s) {
  gl.uniform1f(shaderProgram.uniformShininessLoc, alpha);
  gl.uniform3fv(shaderProgram.uniformAmbientMaterialColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularMaterialColorLoc, s);
}

/**
 * Sends light information to the shader
 * @param {Float32Array} loc Location of light source
 * @param {Float32Array} a Ambient light strength
 * @param {Float32Array} d Diffuse light strength
 * @param {Float32Array} s Specular light strength
 */
function setLightUniforms(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

/**
 * Sets fog density for the shader to properly mix fog
 * @param {} fog_density 
 */
function setFogUniform(fog_density) {
  gl.uniform1f(shaderProgram.uniformFogDensityLoc, fog_density);
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
  //initializeTerrain();
  initializeShaderProgram();
  initializeBuffers();
  initializeTerrain();
  gl.clear(gl.COLOR_BUFFER_BIT);
  draw();
  tick();
}

/** Keyboard handler */
document.addEventListener('keydown', keyboardHandler);

/** Current euler angle values */
var rollAngle = 0.0;
var pitchAngle = 0.0;
var velocity = 0.001;

/** Keyboard event handler  */
function keyboardHandler(evt) {
  // Roll left -> left arrow
  if (evt.code == "ArrowLeft") {
    rollAngle += 0.05;
  }

  // Roll right -> right arrow
  if (evt.code == "ArrowRight") {
    rollAngle -= 0.05;
  }

  // Pitch up -> up arrow
  if (evt.code == "ArrowUp") {
    pitchAngle += 0.05;
  }

  // Pitch down -> down arrow
  if (evt.code == "ArrowDown") {
    pitchAngle -= 0.05;
  }

  // Increase speed -> +
  if (evt.code == "Equal") {
    // Camera travels down -z axis, so "negative" velocity when moving forward
    velocity += 0.001;
  }  

  // Decrease speed -> -
  if (evt.code == "Minus") {
    velocity -= 0.001;
  }
}

/** Flight simulator view update */
function tick() {
  requestAnimationFrame(tick);
  let translationVec = vec3.create();

  /** Euler to quaternion */
  quat.fromEuler(quatOrientation, pitchAngle, 0.0, rollAngle);
  vec3.transformQuat(up, up, quatOrientation);
  vec3.transformQuat(viewDir, viewDir, quatOrientation);

  // Scale by view direction so camera travels towards eyepoint
  vec3.scale(translationVec, viewDir, velocity);
  vec3.add(eyePt, eyePt, translationVec);

  // Update view vectors (up, viewDir, eyePt)
  generateView();
  
  mvPush(mvMatrix);

  // Standard view matrix
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(viewRot + 30));
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(-70));

  setShaderModelView();
  setShaderNormal(mvMatrix);
  mvPop();

  setShaderProjection();

  // Check if fog should be enabled
  if(document.getElementById('r1').checked) {
    fogDensity = 0.6;
  } else {
    fogDensity = 0.0
  }

  // Display pitch on html
  document.getElementById("pitch").innerHTML = "Pitch: " + pitchAngle + " Roll: " + rollAngle + " Speed: " + velocity * 1000;

  setFogUniform(fogDensity);

  // Draw call
  drawTerrain();
}

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}