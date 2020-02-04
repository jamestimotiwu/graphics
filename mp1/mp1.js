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
    /* 
    var left_offset = 10 + I_rect_width;
    var right_offset = 100 - I_rect_height;
    var top_offset = 10 + I_rect_height;
    var bottom_offset = 100 - I_rect_height;
    var border_size = 0.01; */

    var base_height = 0.25;
    var base_width = 0.75;
    var column_height = 1.0;
    var column_width = 0.4;

    // Translate to clip
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

    var edge_list = [
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
/*     var vertex_list = [
      // Top rectangle for border
      [-0.5, 0.5],
      [0.5, 0.5],
      [-0.5, 0.3],
      [0.5, 0.3],
      // Middle rectangle for border
      [-0.3, 0.5],
      [0.3, 0.5],
      [-0.3, -0.5],
      [0.3, -0.5],
      // Bottom rectangle for border
      [-0.5, -0.3],
      [0.5, -0.3],
      [-0.5, -0.5],
      [0.5, -0.5],
      // Top rectangle

      // Middle rectangle
      
      // Bottom rectangle
    ]

    var vertex_list_border = [

    ]

    var edge_list = [
      // Top rectangle for border
      [1, 2, 3],
      [3, 2, 4],
      // Middle rectangle for border
      [5, 6, 7],
      [7, 6, 8],
      // Bottom rectangle for border
      [9, 10, 11],
      [12, 10, 11]
      // Top rectangle

      // Middle rectangle 

      // Bottom rectangle
    ]
 */
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
function draw(scale, translation, color) {
  /**
  var resolution;
  var translation;
  var scale;
  */
 // var scale = [1.08, 1.41]
 // var translation = [100, 150];
  // Draw geometry (primitive type, offset, number of points in all triangles)
  initializeGeometry()

  // Set translation
  gl.uniform2fv(gl.getUniformLocation(shaderProgram, "u_translation"), translation);
  // Set scaling magnitude 
  gl.uniform2fv(gl.getUniformLocation(shaderProgram, "u_scale"), scale);
  // Set color
  gl.uniform4fv(gl.getUniformLocation(shaderProgram, "u_color"), color)

  gl.drawArrays(gl.TRIANGLES, 0, 18)
}

/**
 * Initialize buffer for vertex position
 */
function initializeBuffers() {
  var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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

  draw([1.08, 1.41], [0, 0], [0.07, 0.16, 0.295, 1]);
  draw([1.0, 1.41], [0, 0], [0.909, 0.29, 0.15, 1]);

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