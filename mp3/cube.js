
/**
 * @file Cube box object
 * @author James Timotiwu <jit2@illinois.edu>
*/

/**
 * @global Vertex buffers
 */
var vertexBuffer = [];
var numVertices;
var vertexBufProgram;

/**
 * @global triangle buffers
 */
var triBuffer = [];
var triBufProgram;
var numFaces;

/**
 * @global normal buffers
 */
var normalBuffer = [];
var normBufProgram;
var numNorms;

/**
 * generateCube - Generates a cube of given length
 * @param {float} length 
 */
function generateCube(length) {
	let x = length / 2.0;
	let y = length / 2.0;
	let z = length / 2.0;
	
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
	console.log(vertexBuffer);
	numVertices = vertexBuffer.length / 3;
	numFaces = triBuffer.length / 3;
}

/**
 * textureCube - Cube texture setup
 */
function textureCube() {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	/** Load all images */
	const faceInfos = [
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
	faceInfos.forEach((faceInfo) => {
		// Reference from WebGL Fundamentals
		const {target, url} = faceInfo;
		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 512;
		const height = 512;
		const format = gl.RGBA;
		const type = gl.UNSIGNED_BYTE;
	
		gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
		const image = new Image();
		image.src = url;
		
		image.addEventListener('load', function() {
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.texImage2D(target, level, internalFormat, format, type, image);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		});
	});
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.activeTexture(gl.TEXTURE0);
}

/**
 * initializeCube - generates Cube mesh given the length and loads it into the Cube buffers
 */
function initializeCube() {
	let len = 100.0;
	generateCube(len);
    var ext = gl.getExtension('OES_element_index_uint');
    if (ext ==null){
        alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
    }
	initializeCubeBuffers();

}

/**
 * initializeCubeBUffers - initialize buffers related to cube
 */
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

/**
 * drawCube - draw call for Cube to skybox shader program
 */
function drawCube () {
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufProgram);
    gl.vertexAttribPointer(skyboxShaderProgram.vertexPositionAttribute, vertexBufProgram.itemSize, 
                     gl.FLOAT, false, 0, 0);

	/* Draw triangles */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triBufProgram);
    gl.drawElements(gl.TRIANGLES, triBufProgram.numItems, gl.UNSIGNED_INT,0);

}

