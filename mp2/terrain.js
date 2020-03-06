/**
 * @file Procedural Terrain Generator
 * @author James Timotiwu <jit2@illinois.edu>
*/

const { mat4, mat3, vec3 } = glMatrix;

/* Vertex buffer */
var vertexBuffer = [];

/* Triangle buffer */
var triangleBuffer = [];

/* Normal buffer */
var normalBuffer = [];

/* Vertex buffer program */
var vertexBufferProgram;

/* Triangle buffer program */
var triangleBufferProgram;

/* Normal buffer program */
var normalBufferProgram;

/* Terrain colors */
var colorBuffer = [];

/* Terrain color thresholds */
var colorThresholds = [];

/* Num vertices */
var numVertices = 0;

/* Num faces */
var numFaces = 0;

/* Num subdivisions */
var div;

/* 1. Write procedural generation */
/* Create flat triangulated surface */
/* Produce triangles */
/* Generate tessellated quadrilateral / divide rectangles up into triangles */
/* Generate tessellated quad using recursion / iteration */

/**
 * 
 * @param {*} div - number of subdivisions in plane
 * @param {*} min_x 
 * @param {*} max_x 
 * @param {*} min_y 
 * @param {*} max_y 
 * @param {*} vertex_array 
 */
function generatePlane(minX, maxX, minY, maxY) {
    console.log(div);
    /* Subdivided plane size */
    let deltaX = (maxX - minX) / div;
    let deltaY = (maxY - minY) / div;

    console.log(deltaX);
    console.log(deltaY);

    for (let i = 0; i <= div; i++) {
        for (let j = 0; j <= div; j++) {
            vertexBuffer.push(minX + deltaX * j);
            vertexBuffer.push(minY + deltaY * i);
            vertexBuffer.push(0);

            normalBuffer.push(0);
            normalBuffer.push(0);
            normalBuffer.push(0);
        }
    }

    for (let i = 0; i < div; i++) {
        for (let j = 0; j < div; j++) {
            let divAddr = i * (div + 1) + j;
            triangleBuffer.push(divAddr);
            triangleBuffer.push(divAddr + 1);
            triangleBuffer.push(divAddr + div + 1);

            triangleBuffer.push(divAddr + 1);
            triangleBuffer.push(divAddr + 1 + div + 1);
            triangleBuffer.push(divAddr + div + 1);
        }
    }

    numVertices = vertexBuffer.length/3;
    numFaces = triangleBuffer.length/3;
}

/**
 * 
 * @param {*} v 
 * @param {*} i 
 * @param {*} j 
 */
function setVertex(v, i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    
    /* Set vertex */
    vertexBuffer[divAddr] = v[0];
    vertexBuffer[divAddr + 1] = v[1];
    vertexBuffer[divAddr + 2] = v[2];
}

/**
 * 
 * @param {*} i 
 * @param {*} j 
 */
function getVertex(i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    let v = [0, 0, 0]

    /* Get vertex */
    v[0] = vertexBuffer[divAddr];
    v[1] = vertexBuffer[divAddr + 1];
    v[2] = vertexBuffer[divAddr + 2];

    return v;
}

/**
 * 
 * @param {*} n 
 * @param {*} i 
 * @param {*} j 
 */
function setNormal(n, i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    
    /* Set vertex */
    normalBuffer[divAddr] = n[0];
    normalBuffer[divAddr + 1] = n[1];
    normalBuffer[divAddr + 2] = n[2];
}

/**
 * 
 * @param {*} i 
 * @param {*} j 
 */
function getNormal(i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    let v = [0, 0, 0]

    /* Get vertex */
    v[0] = normalBuffer[divAddr];
    v[1] = normalBuffer[divAddr + 1];
    v[2] = normalBuffer[divAddr + 2];

    return v;    
}

/**
 * 
 * @param {*} div 
 * @param {*} minX 
 * @param {*} maxX 
 * @param {*} minY 
 * @param {*} maxY 
 */
function generateTerrain(minX, maxX, minY, maxY) {
    let deltaZ = 0.005;
    let iterations = 60;
    /* 0. Iterate over randomly generated planes follow below */
    for (var o = 0; o <= iterations; o++) {
        /* 1. Choose random point within maxX and minX */
        let randomX = minX + Math.random()*(maxX - minX);
        let randomY = minY + Math.random()*(maxY - minY);

        /* 2. Generate random normal vector n for the plane <X_n, Y_n, 0> */
        let randomX_n = Math.cos(Math.random() * (Math.PI * 2));
        let randomY_n = Math.sin(Math.random() * (Math.PI * 2));

        for (let i = 0; i <= div; i++) {
            for (let j = 0; j <= div; j++) {
                /* 3. Given vertex b, test which side of plane that vertex falls on using dot product test*/

                let curr = [0, 0, 0];
                curr = getVertex(i, j); 

                /* 4. Dot product test: (b-p) * n > 0 s.t. b is the current vertex, p is the random point*/
                let side = vec3.fromValues(curr[0] - randomX, curr[1] - randomY, 0);
                let dot_p = vec3.dot(side, vec3.fromValues(randomX_n, randomY_n, 0));

                if (dot_p > 0) {
                    curr[2] += deltaZ;
                } else {
                    curr[2] -= deltaZ;
                }

                setVertex(curr, i, j);
            }
        }
    }
}

/**
 * 
 * @param {*} div 
 * @param {*} minX 
 * @param {*} maxX 
 * @param {*} minY 
 * @param {*} maxY 
 */
function generateNormals(minX, maxX, minY, maxY) {
    /* Iterate over grid */
    for (var i = 0; i < div; i++) {
        for (var j = 0; j < div; j++) {
            /* Get vertices from every triangle (upper) */
            /* Upper triangle face */
            let v_1 = getVertex(i, j);
            let v_2 = getVertex(i, j + 1);
            let v_3 = getVertex(i + 1, j + 1);
            let product = vec3.create();

            /* (v2 - v1) x (v3 - v1) */
            vec3.cross(product,
                        vec3.fromValues(v_2[0] - v_1[0],
                             v_2[1] - v_1[1], 
                             v_2[2] - v_1[2]),
                        vec3.fromValues(v_3[0] - v_1[0], 
                            v_3[1] - v_1[1], 
                            v_3[2] - v_1[2]));

            let n_1 = getNormal(i, j);
            let n_2 = getNormal(i, j + 1);
            let n_3 = getNormal(i + 1, j);

            /* Update normals with calculated normal */
            n_1[0] += product[0];
            n_2[0] += product[0];
            n_3[0] += product[0];

            n_1[1] += product[1];
            n_2[1] += product[1];
            n_3[1] += product[1];

            n_1[2] += product[2];
            n_2[2] += product[2];
            n_3[2] += product[2];

            /* Set normals to normal buffer nBuffer */
            setNormal(n_1, i, j);
            setNormal(n_2, i, j + 1);
            setNormal(n_3, i + 1, j);

            /* Lower triangle face */
            v_1 = getVertex(i, j + 1);
            v_2 = getVertex(i + 1, j + 1);
            v_3 = getVertex(i, j + 1);

            /* (v2 - v1) x (v3 - v1) */
            vec3.cross(product, 
                       vec3.fromValues(v_2[0] - v_1[0],
                                   v_2[1] - v_1[1], 
                                   v_2[2] - v_1[2]),
                       vec3.fromValues(v_3[0] - v_1[0], 
                                   v_3[1] - v_1[1], 
                                   v_3[2] - v_1[2]));
            
            n_1 = getNormal(i, j + 1);
            n_2 = getNormal(i + 1, j + 1);
            n_3 = getNormal(i, j + 1);

            /* Update normals with calculated normal */
            n_1[0] += product[0];
            n_2[0] += product[0];
            n_3[0] += product[0];

            n_1[1] += product[1];
            n_2[1] += product[1];
            n_3[1] += product[1];

            n_1[2] += product[2];
            n_2[2] += product[2];
            n_3[2] += product[2];

            /* Set normals to normal buffer nBuffer */
            setNormal(n_1, i, j + 1);
            setNormal(n_2, i + 1, j + 1);
            setNormal(n_3, i, j + 1);
        }
    }

    /* Normalize all normals in nBuffer */
    for (var i = 0; i <= div; i++) {
        for (var j = 0; j <= div; j++) {
            let n_1 = getNormal(i, j);
            n_1 = vec3.fromValues(n_1[0], n_1[1], n_1[2]);
            vec3.normalize(n_1, n_1);
            setNormal(n_1, i, j);
        }
    }
}

/**
 * 
 */
function initializeTerrain() {
    div = 64;
    let minX = -0.5;
    let minY = -0.5;
    let maxX = 0.5;
    let maxY = 0.5;

    generatePlane(minX, maxX, minY, maxY);
    generateTerrain(minX, maxX, minY, maxY);
    generateNormals(minX, maxX, minY, maxY);

    // Get extension for 4 byte integer indices for drwElements
    var ext = gl.getExtension('OES_element_index_uint');
    if (ext ==null){
        alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
    }
    //generateTerrain(minX, maxX, minY, maxY);
    //generateNormals(minX, maxX, minY, maxY);
    console.log(vertexBuffer);
    console.log(normalBuffer);
    console.log(triangleBuffer);
    initializeTerrainBuffers();
}

/**
 * Initializes buffer for terrain data drawing
 */
function initializeTerrainBuffers() {
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

    /* Initialize triangle face buffer */
    triangleBufferProgram = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBufferProgram);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(triangleBuffer),
    gl.STATIC_DRAW);
    triangleBufferProgram.itemSize = 1;
    triangleBufferProgram.numItems = triangleBuffer.length;
    console.log("Loaded ", triangleBufferProgram.numItems, " triangles");
}

function drawTerrain() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferProgram);
    //console.log(shaderProgram);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBufferProgram.itemSize, 
                     gl.FLOAT, false, 0, 0);
    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferProgram);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                       normalBufferProgram.itemSize,
                       gl.FLOAT, false, 0, 0);   

    //Draw 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBufferProgram);
    gl.drawElements(gl.TRIANGLES, triangleBufferProgram.numItems, gl.UNSIGNED_INT,0);
}

/**
//  * Initialize buffer attributes related to terrain mesh
//  */
// function initializeTerrainBufferAttributes() {
//     gl.useProgram(shaderProgram);
    
//     /* Initialize vertex attribute location and enable for vertex buffer*/
//     let vertexAttributeLocation = gl.getAttribLocation(shaderProgram, "a_vertex");
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferProgram);
//     gl.enableVertexAttribArray(vertexAttributeLocation);
//     gl.vertexAttribPointer(vertexAttributeLocation, vertexBufferProgram.itemSize, gl.FLOAT, false, 0, 0);

//     /* Initialize normal attribute location*/
//     let normalAttributeLocation = gl.getAttribLocation(shaderProgram, "a_normal");
//     gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferProgram);
//     gl.enableVertexAttribArray(normalAttributeLocation);
//     gl.vertexAttribPointer(normalAttributeLocation, normalBufferProgram.itemSize, gl.FLOAT, false, 0, 0);

//     //let triangleAttributeLocation = gl.getAttribLocation(shaderProgram, "a_");
// }


function printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vertexBuffer[i*3], " ", 
                             this.vertexBuffer[i*3 + 1], " ",
                             this.vertexBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.normalBuffer[i*3], " ", 
                             this.normalBuffer[i*3 + 1], " ",
                             this.normalBuffer[i*3 + 2], " ");
                       
          }
        
    }
