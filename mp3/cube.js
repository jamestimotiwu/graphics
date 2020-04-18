
/**
 * @file Cube box object
 * @author James Timotiwu <jit2@illinois.edu>
*/

var vertexBuffer = [];
var numVertices;
var vertexBufProgram;

var triBuffer = [];
var triBufProgram;
var numFaces;

function generateCube(length) {
	let x = length / 2;
	let y = length / 2;
	let z = length / 2;
	
	/* Dummy vertex */
	vertexBuffer.push(0,0,0);

	/* +z cube corners */
	vertexBuffer.push(x, y, z);
	vertexBuffer.push(-x, y, z);
	vertexBuffer.push(-x, -y, z);
	vertexBuffer.push(+x, -y, z);

	/* -z cube corners */
	vertexBuffer.push(-x, -y, -z);
	vertexBuffer.push(x, -y, -z);
	vertexBuffer.push(x, y, -z);
	vertexBuffer.push(-x, y, -z);

	/* +x */
	triBuffer.push(7, 6, 4);
	triBuffer.push(4, 1, 7);

	/* -x */
	triBuffer.push(8, 2, 3);
	triBuffer.push(3, 5, 8);

	/* +y */
	triBuffer.push(7, 1, 2);
	triBuffer.push(2, 8, 7);

	/* -y */
	triBuffer.push(6, 4, 3);
	triBuffer.push(3, 5, 6);

	/* +z */
	triBuffer.push(2, 3, 4);
	triBuffer.push(4, 1, 2);

	/* -z */
	triBuffer.push(8, 5, 6);
	triBuffer.push(6, 7, 8);

	numVertices = vertexBuffer.length / 3;
	numFaces = triBuffer.length / 3;
}

function initializeCube() {
	let len = 1.0;
	generateCube(len);
    var ext = gl.getExtension('OES_element_index_uint');
    if (ext ==null){
        alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
    }
	initializeCubeBuffers();
}

function initializeCubeBuffers() {
	vertexBufProgram = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufProgram);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffer), gl.STATIC_DRAW);
	vertexBufProgram.itemSize = 3;
	vertexBufProgram.numItems = numVertices;

	/* Initialize faces */
	triBufProgram = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triBufProgram);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(triBuffer), gl.STATIC_DRAW);
	triBufProgram.itemSize = 1;
	triBufProgram.numItems = triBuffer.length;
}

function drawCube () {
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufProgram);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBufProgram.itemSize, 
                     gl.FLOAT, false, 0, 0);

	/* Draw triangles */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triBufProgram);
    gl.drawElements(gl.TRIANGLES, triBufProgram.numItems, gl.UNSIGNED_INT,0);

}

