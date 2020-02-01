/**
 * @file MP1 Illini Animation
 * @author James Timotiwu <jit2@illinois.edu>
 */


/** @global WebGL context */
var gl_context;

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
    gl_context = getGLContext(canvas)

    /**
     * 1. Draw geometry for Illini
     * 2. Use two triangles overlapped to create the border
     * 3. Scale the background triangle slightly larger than the first
     *  1. Set background I to orange
     *  2. Set foreground I to blue
     *  3. Maintain origin for triangles
     * 4. Animate using affine transformations (update geometry for every frame)
     */

    gl_context.clearColor(0.0, 0.0, 0.0, 0.0) // Specifies color for clear canvas

}

function setIlliniVertices(gl) {
    // Initialize vertexes and edge sets for all triangles
    var vertex_set = [[10, 10], [20, 10], [10, 30], [20, 30], [90, 10], [100, 10], [90, 30], [100,30], [10, 80], [20, 80], [10, 100], [20, 100], [90, 80], [100, 80], [90, 100], [100,100]]
    var edge_set = [[1, 2, 3], [3, 2, 4], [2, 5, 4], [4, 5, 7], [5, 6, 7], [7, 6, 8], [4, 7, 10], [10, 7, 13], [9, 10, 11], [11, 10, 12], [10, 13, 12], [12, 13, 15], [13, 14, 15], [15, 14, 16]]
    var positions = []
    
    // Iterate over all vertexes in each edge - 1
    // Insert all vertexes in each edge
    // Insert value into new array
    // Iterate over all edges
    // Insert value into array based on every edge
    for (var i = 0; i < edge_set.length; i++) {
        // positions.push
      for (var j = 0; j < 3; j++) {
          positions.push(vertex_set[[edge_set[i][j] - 1]][0])
        positions.push(vertex_set[[edge_set[i][j] - 1]][1])
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    
}

// Fill the buffer with the values that define a letter 'F'.
function setupGeometry2(gl) {
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

/**
 * Initialize shaders
 * @param {string} id of vertex/fragment shader to load
 */
function initializeShaders(id)
{
  /**
   * TODO
   */
}

/**
 * Initialize shader programs (for vertex and fragment shader)
 */

 /**
  * Hello Color
  * attribute vec4 aVertexColor;
attribute vec3 aVertexPosition;
varying vec4 vColor;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
}
</script>
  
<script id="shader-fs" type="x-shader/x-fragment">
precision mediump float;
varying vec4 vColor;
void main(void) {
        gl_FragColor = vColor;
 }
  * 
  */

/* Hello Triangle
 var vertexShaderSource = 
 "attribute vec3 aVertexPosition;                 \n" +
 "void main() {                                   \n" +
 "  gl_Position = vec4(aVertexPosition, 1.0);     \n" +
 "}                                               \n";           

var fragmentShaderSource = 
  "precision mediump float;                    \n"+
  "void main() {                               \n"+
  "  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);  \n"+
  "}                                           \n";
  
**/


