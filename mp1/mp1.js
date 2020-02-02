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

function setColor() {
  var r1;
  var g1;
  var b1;

  var color = [r1, g1, b1, 1];
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");
  gl.uniform4f(colorUniformLocation, r1, g1, b1, 1)
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(color),
    gl.STATIC_DRAW);
}

/**
 * Set up Illini mesh, vertices, edges
 */
function initializeGeometry() {
    /**
     * Set up adjustable offsets for the middle rectangle in the I figure
     */
    var I_rect_width = 20;
    var I_rect_height = 20;
    
    var left_offset = 10 + I_rect_width;
    var right_offset = 100 - I_rect_height;
    var top_offset = 10 + I_rect_height;
    var bottom_offset = 100 - I_rect_height;

    var vertex_list = [
     [10, 10],
     [left_offset, 10], 
     [10, top_offset], 
     [left_offset, top_offset], 
     [right_offset, 10], 
     [100, 10], 
     [right_offset, top_offset], 
     [100,top_offset], 
     [10, bottom_offset], 
     [left_offset, bottom_offset], 
     [10, 100], 
     [left_offset, 100], 
     [right_offset, bottom_offset], 
     [100, bottom_offset], 
     [right_offset, 100], 
     [100,100]];

    var edge_list = [[1, 2, 3], [3, 2, 4], [2, 5, 4], [4, 5, 7], [5, 6, 7], [7, 6, 8], [4, 7, 10], [10, 7, 13], [9, 10, 11], [11, 10, 12], [10, 13, 12], [12, 13, 15], [13, 14, 15], [15, 14, 16]];
    var positions = [];
  
    // Set positions based on edges and verticies
    for (var i = 0; i < edge_list.length; i++) {
      for (var j = 0; j < 3; j++) {
        positions.push(vertex_list[[edge_list[i][j] - 1]][0]);
        positions.push(vertex_list[[edge_list[i][j] - 1]][1]);
      }
    }
    
    // Add vertices into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }

/**
 * Draws function with transformation factor on positions
 */
function draw(scale, translation) {
  /**
  var resolution;
  var translation;
  var scale;
  */
 // var scale = [1.08, 1.41]
 // var translation = [100, 150];
 var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
 
 // Tell WebGL how to convert from clip space to pixels
 gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 // Clear canvas
 gl.clear(gl.COLOR_BUFFER_BIT);
 gl.useProgram(shaderProgram);
 
  // Set window resolution
  gl.uniform2f(gl.getUniformLocation(shaderProgram, "u_resolution"), gl.canvas.width, gl.canvas.height);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 2 components per iteration
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Draw geometry (primitive type, offset, number of points in all triangles)
  initializeGeometry()

  // Set translation
  gl.uniform2fv(gl.getUniformLocation(shaderProgram, "u_translation"), translation);
  // Set scaling magnitude 
  gl.uniform2fv(gl.getUniformLocation(shaderProgram, "u_scale"), scale);
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
  // Set color
  gl.uniform4f(gl.getUniformLocation(shaderProgram, "u_color"), 0, 1, 1, 1)

  gl.drawArrays(gl.TRIANGLES, 0, 42)
}

/**
 * Initialize buffer for vertex position
 */
function initializeBuffers() {
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
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
  draw([1.08, 1.41], [110, 150]);
  draw([1.50, 1.41], [100, 150]);

  /**
   * 1. Draw geometry for Illini
   * 2. Use two triangles overlapped to create the border
   * 3. Scale the background triangle slightly larger than the first
   *  1. Set background I to orange
   *  2. Set foreground I to blue
   *  3. Maintain origin for triangles
   * 4. Animate using affine transformations (update geometry for every frame)
   */

   /* const numInstances = 2;
   const matricies = [
     m4.identity(),
     m4.identity()
   ]

   const colors = [
     [1, 0, 1, 1
    [1, 1, 0, 1]]
   ] */
}