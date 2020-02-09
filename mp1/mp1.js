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
var positionBuffer;

/** @global Color buffer */
var colorBuffer;

/** Meshing globals */
/** @global Mesh position vertex set
 *  Indexes are mapped to same color index
*/
var meshSet = []

/** @global Color vertex set*/
var colorSet = []

/** Transformation globals */
/** @global Modelview matrix*/
var mvMatrix = glMatrix.mat4.create();

/** @global Angle of rotation */
var defAngle = 0;

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

/**
 * Set up Illini mesh, vertices, edges
 */
function generateIlliniGeometry() {
    /**
     * Set up adjustable offsets for the middle rectangle in the I figure
     */
    var border_size = 0.045;
    var base_height = 0.25;
    var base_width = 0.72;
    var column_height = 1.12;
    var column_width = 0.35;

    // Translate to clip in the middle
    var translated_base_h = base_height - base_height / 2.0;
    var translated_base_w = base_width - base_width / 2.0;
    var translated_column_h = column_height - column_height / 2.0;
    var translated_column_w = column_width - column_width / 2.0;

    var vertex_list = [
      // Top base rectangle
      [-translated_base_w, translated_column_h],
      [translated_base_w, translated_column_h],
      [-translated_base_w, translated_column_h - base_height],
      [translated_base_w, translated_column_h - base_height],
      // Column rectangle
      [-translated_column_w, translated_column_h],
      [translated_column_w, translated_column_h],
      [-translated_column_w, -translated_column_h],
      [translated_column_w, -translated_column_h],
      // Bottom base rectangle
      [-translated_base_w, -translated_column_h + base_height],
      [translated_base_w, -translated_column_h + base_height],
      [-translated_base_w, -translated_column_h],
      [translated_base_w, -translated_column_h]
    ]

    var vertex_list_border = [
      // Top base rectangle
      [-translated_base_w-border_size, translated_column_h+border_size],
      [translated_base_w+border_size, translated_column_h+border_size],
      [-translated_base_w-border_size, translated_column_h - base_height - border_size],
      [translated_base_w+border_size, translated_column_h - base_height - border_size],
      // Column rectangle
      [-translated_column_w-border_size, translated_column_h],
      [translated_column_w+border_size, translated_column_h],
      [-translated_column_w-border_size, -translated_column_h],
      [translated_column_w+border_size, -translated_column_h],
      // Bottom base rectangle
      [-translated_base_w-border_size, -translated_column_h + base_height + border_size],
      [translated_base_w+border_size, -translated_column_h + base_height + border_size],
      [-translated_base_w-border_size, -translated_column_h - border_size],
      [translated_base_w+border_size, -translated_column_h - border_size]
    ]

    var triangles = [
      // Top rectangle for border
      [1, 2, 3],
      [3, 2, 4],
      // Middle rectangle for border
      [5, 6, 7],
      [7, 6, 8],
      // Bottom rectangle for border
      [9, 10, 11],
      [12, 10, 11]
    ]
    var positions = [];

    // Border rectangles
    for (var i = 0; i < triangles.length; i++) {
      for (var j = 0; j < 3; j++) {
        positions.push(vertex_list_border[[triangles[i][j] - 1]][0]);
        positions.push(vertex_list_border[[triangles[i][j] - 1]][1]);
      }
    }

    // Shape rectangles
    for (var i = 0; i < triangles.length; i++) {
      for (var j = 0; j < 3; j++) {
        positions.push(vertex_list[[triangles[i][j] - 1]][0]);
        positions.push(vertex_list[[triangles[i][j] - 1]][1]);
      }
    }
    return positions;
}

function generateIlliniColors() {
  var colorBorder = [0.07, 0.16, 0.295, 1]
  var colorShape = [0.909, 0.29, 0.15, 1]
  var colors = [];
  // 6 triangles
  for (var i = 0; i < 18; i++) {
    // 3 vertices per triangle
      // r, g, b, l
    for (var j = 0; j < 4; j++) {
      colors.push(colorBorder[j]);
    }
  }

  // 6 triangles
  for (var i = 0; i < 18; i++) {
      // r, g, b, l
    for (var j = 0; j < 4; j++) {
      colors.push(colorShape[j]);
    }
  }
  return colors;
}

/**
 * Landscape for own animation
 */
function generateLandscapeGeometry() {
  // Set vertex list for landscape
  var vertex_list = [
    // Mountain 1
    [-5.0, -1.0],
    [-4.1, -0.1],
    [-2.5, -1.0],
    // Mountain 2
    [-4.0, -1.0],
    [-2.9, -0.3],
    [-2.0, -1.0],
    // Mountain 3
    [-3.1, -1.0],
    [-2.4, -0.2],
    [-1.7, -1.0],
    // Mountain 4
    [-2.7, -1.0],
    [-2.0, -0.1],
    [-1.0, -1.0],
    // Mountain 5
    [-2.0, -1.0],
    [-1.2, -0.3],
    [-0.4, -1.0],
    // Mountain 6
    [-1.1, -1.0],
    [-0.3, -0.4],
    [0.6, -1.0],
    // Mountain 7
    [-0.3, -1.0],
    [0.6, -0.15],
    [1.4, -1.0],
    // Ground
    [-5.0, -0.8],
    [1.0, -0.8],
    [-5.0, -1.0],
    [-5.0, -1.0],
    [1.0, -0.8],
    [1.0, -1.0]
  ];

  var positions = [];

  for (var i = 0; i < vertex_list.length; i++) {
    positions.push(vertex_list[i][0]);
    positions.push(vertex_list[i][1]);
  }

  return positions;
}

/**
 * Generate colors for landscape
 */
function generateLandscapeColors() {
  var landscapeColors = [
    // Mountain 1
    [204/255, 204/255, 204/255, 1],
    [180/255, 180/255, 180/255, 1],
    [204/255, 204/255, 204/255, 1],
    // Mountain 2
    [83/255, 130/255, 74/255, 1],
    [83/255, 160/255, 74/255, 1],
    [83/255, 130/255, 74/255, 1],
    // Mountain 3
    [170/255, 170/255, 170/255, 1],
    [140/255, 140/255, 140/255, 1],
    [170/255, 170/255, 170/255, 1],
    // Mountain 4
    [180/255, 180/255, 180/255, 1],
    [130/255, 130/255, 130/255, 1],
    [180/255, 180/255, 180/255, 1],
    // Mountain 5
    [83/255, 130/255, 74/255, 1],
    [90/255, 170/255, 74/255, 1],
    [83/255, 130/255, 74/255, 1],
    // Mountain 6
    [97/255, 179/255, 80/255, 1],
    [110/255, 190/255, 95/255, 1],
    [97/255, 179/255, 80/255, 1],
    // Mountain 7
    [170/255, 170/255, 170/255, 1],
    [210/255, 190/255, 210/255, 1],
    [170/255, 170/255, 170/255, 1]
  ];

  var groundColors = [26/255, 166/255, 0/255, 1];
  var colors = [];
  for (var i = 0; i < landscapeColors.length; i++) {
    for (var j = 0; j < 4; j++) {
      colors.push(landscapeColors[i][j]);
    }
  }

  // Push ground colors
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 4; j++) {
      colors.push(groundColors[j]);
    }
  }

  return colors;
}

/**
 * Buffer vertices for geometry
 * @param {Array} positions 
 */
function bufferGeometry(positions) {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

/**
 * Buffer colors for geometry
 * @param {Array} colors 
 */
function bufferColors(colors) {
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}  

/**
 * Draws Illini hopping around
 * @param {*} positions 
 * @param {*} colors 
 */
function draw(positions, colors) {
  bufferGeometry(positions);
  bufferColors(colors);
  // Create transformation, use handle to send to shader
  glMatrix.mat4.identity(mvMatrix);
  //glMatrix.mat4.rotateX(mvMatrix, mvMatrix, defAngle * Math.PI / 180)
  glMatrix.mat4.translate(mvMatrix, mvMatrix, [(t % Math.PI) - 1.5, Math.sin(6*t)/(1.2+(t % Math.PI)/1.5), 0.4]);
  glMatrix.mat4.scale(mvMatrix, mvMatrix, [0.3, Math.sin(6*t)/8.0 + 0.3, 0.3]);

  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 36)
}

/**
 * Draws moving landscape
 * @param {*} positions 
 * @param {*} colors 
 */
function draw2(positions, colors) {
  bufferGeometry(positions);
  bufferColors(colors);
  glMatrix.mat4.identity(mvMatrix);
  glMatrix.mat4.translate(mvMatrix, mvMatrix, [(t/6)%3.5, 0, 0]);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 27)
}

/**
 * Draw rising illini sun
 * @param {*} positions 
 * @param {*} colors 
 */
function draw3(positions, colors) {
  bufferGeometry(positions);
  bufferColors(colors);
  glMatrix.mat4.identity(mvMatrix);
  glMatrix.mat4.translate(mvMatrix, mvMatrix, [0, (t/6)%3.5 - 2.4, 0]);
  glMatrix.mat4.scale(mvMatrix, mvMatrix, [Math.log((t/6)%3.5+0.4)-1.7, Math.log((t/6)%3.5+0.4)-1.7, 0.3]);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  console.log(t)
  gl.drawArrays(gl.TRIANGLES, 0, 36)
}
/**
 * Initialize buffer for vertex position
 */
function initializeBuffers() {
  var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
  var colorAttributeLocation = gl.getAttribLocation(shaderProgram, "a_color");
  positionBuffer = gl.createBuffer();
  colorBuffer = gl.createBuffer();

   // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(shaderProgram);
  // Set window resolution
  gl.uniform2f(gl.getUniformLocation(shaderProgram, "u_resolution"), gl.canvas.width, gl.canvas.height);
  
  // Enable vertex buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
 * @param {*} type fragment or vertex(gl.VERTEX_SHADER, gl.FRAGMENT_SHADER)
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
 * Animation tick with radio button
 */
function tick() {
  requestAnimationFrame(tick);

  if (document.getElementById('r1').checked) {
    // Illini Animation
    // meshSet[0], colorSet[0] store Illni mesh and colors
    draw(meshSet[0], colorSet[0]);
    animate();
  } else {
    // Own animation
    // Set background to sky color
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(84/255*(t/15 % 1.4), 204/255*(t/15 % 1.4), 249/255*(t/15 % 1.4), 1.0);
    draw3(meshSet[0], colorSet[0]);
    draw2(meshSet[1], colorSet[1]);
    animate();
  }
}

function animate() {
  defAngle = (defAngle + 3.0) % 360;
  t = t + 0.03;
  // Elapsed time is useful, basing transformation on elapsedTime instead of frame count
  // framerates may vary
  // Interpolation, key frames (artist generated geometry)
  // Interpolation: calculated intermediate frames
}

function Meshes() {
  meshSet.push(generateIlliniGeometry());
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
  Meshes();
  initializeShaderProgram();
  initializeBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  tick();
}