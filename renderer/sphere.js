/* Vertex buffer */
var vertexBuffer = [];

/* Normal buffer */
var normalBuffer = [];

/* Vertex buffer program */
var vertexBufferProgram;

/* Normal buffer program */
var normalBufferProgram;

/* Number of vertices */
var numVertices;

/** Sphere class with particle states (position and velocity and size */
class Sphere {
	constructor() {
		this.pos = vec3.create();
		this.velocity = vec3.create();
		this.radius = Math.random()/70 + 0.03;
		this.radiusVec = vec3.fromValues(this.radius, this.radius, this.radius)
		this.color = vec3.fromValues(Math.random(), 
									Math.random(), 
									Math.random())
		vec3.random(this.velocity, 0.5);
	}

	/**
	 * Draw call for sphere at certain position including movement update
	 */
	draw() {	
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		generatePerspective();
		generateView();
		mvPush(mvMatrix);
	
		mat4.scale(mvMatrix, mvMatrix, this.radiusVec);
		mat4.translate(mvMatrix, mvMatrix, this.pos);
		setShaderModelView();
		setShaderNormal(mvMatrix);
		mvPop();

		setShaderProjection();
		
		setLightUniforms(lightPosition,lAmbient,lDiffuse,lSpecular);
		setMaterialUniforms(shininess,kAmbient,this.color,kSpecular);
		drawSphere();
	}

	/**
	 * Updates position, velocity based on physics calculation
	 */
	moveSphere() {
		let new_accel = vec3.create()
		// Euler integration (t=0.1): acceleration * 0.1 + v * d^0.1
		vec3.scale(this.velocity, this.velocity, Math.pow(drag, 0.1));
		vec3.add(this.velocity, this.velocity, accel);
		
		/* position = position + velocity */
		vec3.add(this.pos, this.pos, this.velocity);
		/* detect collision */
		for (let i = 0; i < this.pos.length; i++) {
			/* If position at certain bounds, set position to that value */
			if (this.pos[i] < -12 || this.pos[i] > 12) {
				if (this.pos[i] < 0) {
					this.pos[i] = -12;
				} else {
					this.pos[i] = 12;
				}
				/* Change velocity direction for bounce effect */
				this.velocity[i] = -this.velocity[i];
			}
		}	
		
	}	
}

/**
 * Initialize sphere buffers
 */
function initializeSphereBuffers() {
    /* Initialize vertex buffer */
    vertexBufferProgram = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferProgram);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffer), gl.STATIC_DRAW);
    vertexBufferProgram.itemSize = 3;
    vertexBufferProgram.numItems = numVertices;
    console.log("Loaded ", vertexBufferProgram.numItems, " vertices");

    /* Initialize normals buffer */
    normalBufferProgram = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferProgram);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer),
    gl.STATIC_DRAW);
    normalBufferProgram.itemSize = 3;
    normalBufferProgram.numItems = numVertices;
    console.log("Loaded ", normalBufferProgram.numItems, " normals");
}

/**
 * Function to initialze sphere mesh and buffers
 */
function initializeSphere() {
	let num_t = 0;

	num_t = sphereFromSubdivision(6, vertexBuffer, normalBuffer)
	numVertices = num_t * 3
	initializeSphereBuffers();

}

/**
 * Sphere draw call
 */
function drawSphere() { 
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferProgram);
    //console.log(shaderProgram);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBufferProgram.itemSize, 
                     gl.FLOAT, false, 0, 0);
    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferProgram);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                       normalBufferProgram.itemSize,
                       gl.FLOAT, false, 0, 0);   

    gl.drawArrays(gl.TRIANGLES, 0, vertexBufferProgram.numItems);
}

//-------------------------------------------------------------------------
function planeFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray)
{
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(maxY-deltaY*i);
           vertexArray.push(0);
       }

    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+(n+1));
           faceArray.push(vid+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+(n+1));
           faceArray.push((vid+1) +(n+1));
       }
    //console.log(vertexArray);
    //console.log(faceArray);
}

//-------------------------------------------------------------------------

function pushVertex(v, vArray)
{
 for(i=0;i<3;i++)
 {
     vArray.push(v[i]);
 }  
}

//-------------------------------------------------------------------------
function divideTriangle(a,b,c,numSubDivs, vertexArray)
{
    if (numSubDivs>0)
    {
        var numT=0;
        var ab =  vec4.create();
        vec4.lerp(ab,a,b,0.5);
        var ac =  vec4.create();
        vec4.lerp(ac,a,c,0.5);
        var bc =  vec4.create();
        vec4.lerp(bc,b,c,0.5);
        
        numT+=divideTriangle(a,ab,ac,numSubDivs-1, vertexArray);
        numT+=divideTriangle(ab,b,bc,numSubDivs-1, vertexArray);
        numT+=divideTriangle(bc,c,ac,numSubDivs-1, vertexArray);
        numT+=divideTriangle(ab,bc,ac,numSubDivs-1, vertexArray);
        return numT;
    }
    else
    {
        // Add 3 vertices to the array
        
        pushVertex(a,vertexArray);
        pushVertex(b,vertexArray);
        pushVertex(c,vertexArray);
        return 1;
        
    }   
}

//-------------------------------------------------------------------------
function planeFromSubdivision(n, minX,maxX,minY,maxY, vertexArray)
{
    var numT=0;
    var va = vec4.fromValues(minX,minY,0,0);
    var vb = vec4.fromValues(maxX,minY,0,0);
    var vc = vec4.fromValues(maxX,maxY,0,0);
    var vd = vec4.fromValues(minX,maxY,0,0);
    
    numT+=divideTriangle(va,vb,vd,n, vertexArray);
    numT+=divideTriangle(vb,vc,vd,n, vertexArray);
    return numT;
    
}

//-----------------------------------------------------------
function sphDivideTriangle(a,b,c,numSubDivs, vertexArray,normalArray)
{
    //Fill this in
    if (numSubDivs > 0) {
        var numT = 0;

        var ab = vec4.create();
        vec4.lerp(ab, a, b, 0.5);
        vec4.normalize(ab, ab); // use normalize to get normalized triangles
        var ac = vec4.create();
        vec4.lerp(ac, a, c, 0.5);
        vec4.normalize(ac, ac);
        var bc = vec4.create();
        vec4.lerp(bc, b, c, 0.5);
        vec4.normalize(bc, bc);

        numT += sphDivideTriangle(a, ab, ac, numSubDivs - 1, vertexArray, normalArray);
        numT += sphDivideTriangle(ab, b, bc, numSubDivs - 1, vertexArray, normalArray);
        numT += sphDivideTriangle(bc, c, ac, numSubDivs - 1, vertexArray, normalArray);
        numT += sphDivideTriangle(ab, bc, ac, numSubDivs - 1, vertexArray, normalArray);

        return numT;
    } else {
        // Add 3 verts to array
        pushVertex(a, vertexArray);
        pushVertex(b, vertexArray);
        pushVertex(c, vertexArray);

        pushVertex(a, normalArray);
        pushVertex(b, normalArray);
        pushVertex(c, normalArray);
        return 1;
    }
}

//-------------------------------------------------------------------------
function sphereFromSubdivision(numSubDivs, vertexArray, normalArray)
{
    var numT=0;
    var a = vec4.fromValues(0.0,0.0,-1.0,0);
    var b = vec4.fromValues(0.0,0.942809,0.333333,0);
    var c = vec4.fromValues(-0.816497,-0.471405,0.333333,0);
    var d = vec4.fromValues(0.816497,-0.471405,0.333333,0);
    
    numT+=sphDivideTriangle(a,b,c,numSubDivs, vertexArray, normalArray);
    numT+=sphDivideTriangle(d,c,b,numSubDivs, vertexArray, normalArray);
    numT+=sphDivideTriangle(a,d,b,numSubDivs, vertexArray, normalArray);
    numT+=sphDivideTriangle(a,c,d,numSubDivs, vertexArray, normalArray);
    return numT;
}


    
    
