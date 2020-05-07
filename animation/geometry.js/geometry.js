function initializeGeometry() {
    /**
     * Set up adjustable offsets for the middle rectangle in the I figure
     */
    /* 
    var left_offset = 10 + I_rect_width;
    var right_offset = 100 - I_rect_height;
    var top_offset = 10 + I_rect_height;
    var bottom_offset = 100 - I_rect_height; */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var border_size = 0.01;

    var base_height = 0.25;
    var base_width = 0.75;
    var column_height = 1.0;
    var column_width = 0.4;

    // Translate to clip
    // var translated_base_h = base_height - base_height / 2.0;
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

    var vertex_list_border = [
      // Top base rectangle
      [-translated_base_w-border_size, translated_column_h+border_size],
      [translated_base_w+border_size, translated_column_h+border_size],
      [-translated_base_w-border_size, translated_column_h - base_height - border_size],
      [translated_base_w+border_size, translated_column_h - base_height - border_size],
      // Column rectangle
      [-translated_column_w-border_size, translated_column_h],
      [translated_column_w+border_size, translated_column_h],
      [-translated_column_w-border_size, -translated_column_h],
      [translated_column_w+border_size, -translated_column_h],
      // Bottom base rectangle
      [-translated_base_w-border_size, -translated_column_h + base_height],
      [translated_base_w+border_size, -translated_column_h + base_height],
      [-translated_base_w-border_size, -translated_column_h],
      [translated_base_w+border_size, -translated_column_h]
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
      for (var j = 0; j < 3; j++) {
        positions.push(vertex_list_border[[edge_list[i][j] - 1]][0]);
        positions.push(vertex_list_border[[edge_list[i][j] - 1]][1]);
      }
/*       for (var j = 0; j < 3; j++) {
        positions.push(vertex_list[[edge_list[i][j] - 1]][0]);
        positions.push(vertex_list[[edge_list[i][j] - 1]][1]);        
      } */
    }

    console.log(positions)
    
    // Add vertices into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    positionBuffer.itemSize = 3;
    positionBuffer.numberOfItems = 48;
  }
  
  function colorGeometry() {
    //colorBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var color_arrays = [
      0.909, 0.29, 0.15, 1,
      0.07, 0.16, 0.295, 1
    ];
  
    var colors = [];
  
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 8; j++) {
        colors.push(color_arrays[j])
      }
    }
  
    console.log(colors);
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    colorBuffer.itemSize = 4;
    colorBuffer.numberOfItems = 48;
  }