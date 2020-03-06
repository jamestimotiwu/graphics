// @ts-check
/**
 * @fileoverview Terrain - A simple 3D terrain using WebGL
 * @author Eric Shaffer
 */

/** Class implementing 3D terrain. */
class Terrain{   
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 */
    constructor(div,minX,maxX,minY,maxY){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;
        
        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");
        
        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext ==null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }
    
    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        //Your code here
        var vid = 3 * (i * (this.div + 1) + j);
        this.vBuffer[vid] = v[0];
        this.vBuffer[vid + 1] = v[1];
        this.vBuffer[vid + 2] = v[2];
    }
    
    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        //Your code here
        var vid = 3 * (i * (this.div + 1) + j);

        v[0] = this.vBuffer[vid];
        v[1] = this.vBuffer[vid + 1];
        v[2] = this.vBuffer[vid + 2];
    }

    /**
    * Set the normal of a vertex at location(i,j)
    * @param {Object} n an an array of length 3 holding normal
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
   setNormal(n,i,j)
   {
       //Your code here
       var vid = 3 * (i * (this.div + 1) + j);
       this.nBuffer[vid] = n[0];
       this.nBuffer[vid + 1] = n[1];
       this.nBuffer[vid + 2] = n[2];
   }

    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} n an an array of length 3 holding normal
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
   getNormal(n,i,j)
   {
       //Your code here
       var vid = 3 * (i * (this.div + 1) + j);

       n[0] = this.nBuffer[vid];
       n[1] = this.nBuffer[vid + 1];
       n[2] = this.nBuffer[vid + 2];
   }
    
    /**
    * Send the buffer objects to WebGL for rendering 
    */
    loadBuffers()
    {
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
    
        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
    
        // Specify faces of the terrain 
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");
    
        //Setup Edges  
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;
        
        console.log("triangulatedPlane: loadBuffers");
    }
    
    /**
    * Render the triangles 
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }
    
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges(){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
    }
/**
 * Fill the vertex and buffer arrays 
 */    
generateTriangles()
{
    //Your code here
    var deltaX = (this.maxX - this.minX) / this.div;
    var deltaY = (this.maxY - this.minY) / this.div;
    console.log(deltaX);
    console.log(deltaY);
    // Rand height
    // Create flat map
    for (var i = 0; i <= this.div; i++) {
        for (var j = 0; j <= this.div; j++) {
            this.vBuffer.push(this.minX + deltaX * j);
            this.vBuffer.push(this.minY + deltaY * i);
            this.vBuffer.push(0);

            this.nBuffer.push(0);
            this.nBuffer.push(0);
            this.nBuffer.push(1);
        }
    }

    for (var i = 0; i < this.div; i++) {
        for (var j = 0; j < this.div; j++) {
            var vid = i * (this.div + 1) + j;
            this.fBuffer.push(vid);
            this.fBuffer.push(vid + 1);
            this.fBuffer.push(vid + this.div + 1);

            this.fBuffer.push(vid + 1);
            this.fBuffer.push(vid + 1 + this.div + 1);
            this.fBuffer.push(vid + this.div + 1);
        }
    }
    
    //this.generateTerrain();
    //this.generateNormals();
    //this.updateTerrainNormals();
    console.log(this.vBuffer);
    console.log(this.nBuffer);
    console.log(this.fBuffer);
    //
    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;
}

crossProduct(v_1, v_2) {
    /* Given v_1, v_2 as array [x,y,z] */

    var product = [v_1[1] * v_2[2] - v_1[2] * v_2[1],
                v_1[2] * v_2[0] - v_1[0] * v_2[2],
                v_1[0] * v_2[1] - v_1[1] * v_2[2]];

    return product;
}

// crossProduct(v1,v2,v3)
// {
//   var bigN = [0.0,0.0,0.0];
//   var vecA = [0.0,0.0,0.0];
//   var vecB = [0.0,0.0,0.0];

//   vecA[0] = v2[0]-v1[0];
//   vecA[1] = v2[1]-v1[1];
//   vecA[2] = v2[2]-v1[2];

//   vecB[0] = v3[0]-v1[0];
//   vecB[1] = v3[1]-v1[1];
//   vecB[2] = v3[2]-v1[2];

//   bigN[0] = vecA[1]*vecB[2]-vecA[2]*vecB[1];
//   bigN[1] = vecA[2]*vecB[0]-vecA[0]*vecB[2];
//   bigN[2] = vecA[0]*vecB[1]-vecA[1]*vecB[0];

//   return bigN;
// }

dotProduct(v_1, v_2) {
    /* Given v_1, v_2, v_3 as array [x,y,z] */
    var product = v_1[0]*v_2[0] + v_1[1]*v_2[1];
    return product;
}

generateTerrain() {
    var deltaZ = 0.005;
    var iterations = 60;
    /* 0. Iterate over randomly generated planes follow below */
    for (var o = 0; o <= iterations; o++) {
        /* 1. Choose random point within maxX and minX */
        var random_x = this.minX + Math.random()*(this.maxX - this.minX);
        var random_y = this.minY + Math.random()*(this.maxY - this.minY);

        /* 2. Generate random normal vector n for the plane <X_n, Y_n, 0> */
        //var random_x_n = Math.random() - 0.5;
        //var random_y_n = Math.random() - 0.5;
        var random_x_n = Math.cos(Math.random() * (Math.PI * 2));
        var random_y_n = Math.sin(Math.random() * (Math.PI * 2));

        for (var i = 0; i <= this.div; i++) {
            for (var j = 0; j <= this.div; j++) {
                /* 3. Given vertex b, test which side of plane that vertex falls on using dot product test*/

                var curr = [3];
                this.getVertex(curr, i, j);

                /* 4. Dot product test: (b-p) * n > 0 s.t. b is the current vertex, p is the random point*/
                var side = [curr[0] - random_x, curr[1] - random_y, 0];
                var dot_p = this.dotProduct(side, [random_x_n, random_y_n, 0]);
                if (dot_p > 0) {
                    curr[2] += deltaZ;
                } else {
                    curr[2] -= deltaZ;
                }

                this.setVertex(curr, i, j);
            }
        }
    }
}

generateNormals() {
    /* Iterate over grid */
    for (var i = 0; i < this.div; i++) {
        for (var j = 0; j < this.div; j++) {
            /* Get vertices from every triangle (upper) */
            var v_1 = [0, 0, 0];
            var v_2 = [0, 0, 0];
            var v_3 = [0, 0, 0];
            //var product = [0, 0, 0];

            /* Upper triangle face */
            this.getVertex(v_1, i, j);
            this.getVertex(v_2, i, j + 1);
            this.getVertex(v_3, i + 1, j + 1);

            /* (v2 - v1) x (v3 - v1) */
            var product = this.crossProduct([v_2[0] - v_1[0],
                                         v_2[1] - v_1[1], 
                                         v_2[2] - v_1[2]],
                                        [v_3[0] - v_1[0], 
                                        v_3[1] - v_1[1], 
                                        v_3[2] - v_1[2]]);

            var n_1 = [0,0,0];
            var n_2 = [0,0,0];
            var n_3 = [0,0,0];

            this.getNormal(n_1, i, j);
            this.getNormal(n_2, i, j + 1);
            this.getNormal(n_3, i + 1, j);

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
            this.setNormal(n_1, i, j);
            this.setNormal(n_2, i, j + 1);
            this.setNormal(n_3, i + 1, j);

            /* Lower triangle face */
            this.getVertex(v_1, i, j + 1);
            this.getVertex(v_2, i + 1, j + 1);
            this.getVertex(v_3, i, j + 1);

            /* (v2 - v1) x (v3 - v1) */
            product = this.crossProduct([v_2[0] - v_1[0],
                                        v_2[1] - v_1[1], 
                                        v_2[2] - v_1[2]],
                                       [v_3[0] - v_1[0], 
                                       v_3[1] - v_1[1], 
                                       v_3[2] - v_1[2]]);
            
            this.getNormal(n_1, i, j + 1);
            this.getNormal(n_2, i + 1, j + 1);
            this.getNormal(n_3, i, j + 1);

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
            this.setNormal(n_1, i, j + 1);
            this.setNormal(n_2, i + 1, j + 1);
            this.setNormal(n_3, i, j + 1);

        }
    }

    /* Normalize all normals in nBuffer */
    for (var i = 0; i <= this.div; i++) {
        for (var j = 0; j <= this.div; j++) {
            var n_1 = [0,0,0];
            this.getNormal(n_1, i, j);
            //var normalize = this.normalize(n_1);
            var norm = Math.sqrt(n_1[0]*n_1[0] + n_1[1]*n_1[1] + n_1[2]*n_1[2]);

            n_1[0] = n_1[0]/norm;
            n_1[1] = n_1[1]/norm;
            n_1[2] = n_1[2]/norm;
            this.setNormal(n_1, i, j);
        }
    }
}

/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ", 
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ", 
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");
                       
          }
        
    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);
        
        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);
        
        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]);
    }
    
}
    
}
