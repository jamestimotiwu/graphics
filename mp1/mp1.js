/**
 * @file MP1 Illini Animation
 * @author James Timotiwu <jit2@illinois.edu>
 */

/** @global WebGL context */
var gl;

/** @global Shader program */
var shaderProgram;

/** @global Position buffer */
var positionBuffer;

/** @global Color buffer */
var colorBuffer;

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
 * Transformations:
 * Scale
 * Rotation
 * Translation
 */
function updateTransforms() {
    var scale = [1.1, 1.5]
    var translation = [100, 150]
    var rotation = [0, 1]
}

/**
 * Set up Illini mesh, vertices, edges
 */
function initializeGeometry() {
    /**
     * Set up adjustable offsets for the middle rectangle in the I figure
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
    // Set positions based on edges and verticies

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
    
    // Add vertices into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

/**
 * Set up Illini colors for border and shape
 */
function initializeColor() {
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
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

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}  

/**
 * Draws function with transformation factor on positions
 */
function draw() {
  initializeGeometry()
  initializeColor();
  // Create transformation, use handle to send to shader
  glMatrix.mat4.identity(mvMatrix);
  //glMatrix.mat4.rotateZ(mvMatrix, mvMatrix, defAngle * Math.PI) / 180)
  glMatrix.mat4.translate(mvMatrix, mvMatrix, [(t % Math.PI) - 1.0, Math.sin(6*t)/2.0, 0.4]);
  glMatrix.mat4.scale(mvMatrix, mvMatrix, [0.5, 0.5, 0.5]);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

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

function tick() {
  requestAnimationFrame(tick);
  draw();
  animate();
}

function bounce() {
  // y(t) = y0 + vyt + 1/2gt^2
}

/**
 * Linear interpolation for 2D points
 * @param {*} Out 
 * @param {*} A 
 * @param {*} B 
 * @param {*} t 
 */
function lerp(Out, A, B, t) {
  Out[0] = A[0] + (B[0] - A[0])*t;
  Out[1] = A[1] + (B[1] - A[1])*t;
}

function animate() {
  defAngle = (defAngle + 3.0) % 360;
  t = t + 0.03;
  // Elapsed time is useful, basing transformation on elapsedTime instead of frame count
  // framerates may vary
  // Interpolation, key frames (artist generated geometry)
  // Interpolation: calculated intermediate frames
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

  initializeShaderProgram();
  initializeBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  tick();
  //draw();
}