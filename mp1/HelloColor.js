
/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@eillinois.edu>  
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor"); 
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  setGeometry()
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 18;
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 3;  
}

/**
 * Draw model...render a frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
                          
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/**
 * Set up Illini mesh, vertices, edges
 */
function setGeometry() {
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
    [-0.5, 0.5],WWW
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

function setColors() {

}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  
  console.log("No bugs so far...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  draw();  
}

