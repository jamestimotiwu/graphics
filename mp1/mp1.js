/**
 * @file MP1 Illini Animation
 * @author James Timotiwu <jit2@illinois.edu>
 */


/** @global WebGL context */
var gl;

/**
 * Get WebGL context for canvas
 * @param {element} canvas canvas
 * @return {Object} WebGL context
 */
function getGLContext(canvas) {
     var context = getContext("webgl");

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

function updateColor() {
    var color = [0, 0, 0, 1]
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
console.log(positions)

function initalizeBuffers() {
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positiionBuffer)
}

function initalizeShaders() {
  var vertexShader = initializeShader("vertex-shader", gl.VERTEX_SHADER)
  var fragmentShader = initializeShader("fragment-shader", gl.FRAGMENT_SHADER)

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor"); 
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

  initializeShaders();
  initializeBuffers();
  initializeGeometry();

  /**
   * 1. Draw geometry for Illini
   * 2. Use two triangles overlapped to create the border
   * 3. Scale the background triangle slightly larger than the first
   *  1. Set background I to orange
   *  2. Set foreground I to blue
   *  3. Maintain origin for triangles
   * 4. Animate using affine transformations (update geometry for every frame)
   */

  gl.clearColor(0.0, 0.0, 0.0, 0.0) // Specifies color for clear canvas

}