
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

var normalBuffer = [];
var normBufProgram;
var numNorms;

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

function textureCube() {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	const faces = [
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			url: 'London/pos-x.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			url: 'London/neg-x.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			url: 'London/pos-y.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			url: 'London/neg-y.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			url: 'London/pos-z.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
			url: 'London/neg-z.png',
		},
	];
	faces.forEach((face) => {
	const {target, url} = face;

	// Setup canvas
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 512;
	const height = 512;
	const format = gl.RGBA;
	const type = gl.UNSIGNED_BYTE;

	// Create texture
	gl.texImage2D(gl.TEXTURE_2D,
				0, 
				gl.RGBA, 
				512,
				512,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				null);
	
	/* Load images */
	const image = new Image();
	image.src = url;
	image.addEventListener('load', function() {
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		gl.texImage2D(target, level, internalFormat, format, type, image);
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	});
});
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP, LINEAR);
		

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

