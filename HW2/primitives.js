// cube
const pyramid_vertices = new Float32Array([
  -1, -1, -1,  // 0
   1, -1, -1,  // 1
   1,  1, -1,  // 2
  -1,  1, -1,  // 3
  -1, -1,  1,  // 4
   1, -1,  1,  // 5
   1,  1,  1,  // 6
  -1,  1,  1,  // 7
   0,  1,  0   // 8
]);

const pyramid_indices = new Uint16Array([
  // bottom
  0, 1, 5,   0, 5, 4,
  // right face
  1, 5, 8,
  // back face
  5, 4, 8,
  // left face
  4, 0, 8,
  //front face
  0, 1, 8

]);

const pyramid_colors = new Float32Array([
  1,0,0,  0,1,0,  0,0,1,  1,1,0,  1,0,1,  0,1,1,  1,1,0,  1,0,1,  0.5,0.5,0.5
]);

// cube
const cube_vertices = new Float32Array([
  -1, -1, -1,  // 0
   1, -1, -1,  // 1
   1,  1, -1,  // 2
  -1,  1, -1,  // 3
  -1, -1,  1,  // 4
   1, -1,  1,  // 5
   1,  1,  1,  // 6
  -1,  1,  1,  // 7
]);

const cube_indices = new Uint16Array([
  // Front
  4, 5, 6,   4, 6, 7,
  // Back
  1, 0, 3,   1, 3, 2,
  // Top
  3, 7, 6,   3, 6, 2,
  // Bottom
  0, 1, 5,   0, 5, 4,
  // Right
  1, 2, 6,   1, 6, 5,
  // Left
  0, 4, 7,   0, 7, 3,
]);

const sphere = function (u_steps, v_steps, r) {
  let vertices = [];
  let indices = [];

  for (let i = 0; i <= v_steps; i++) {
    const v = i * Math.PI / v_steps;
    const sinv = Math.sin(v);
    const cosv = Math.cos(v);
    
    for ( let j = 0; j <= u_steps; j++) {
      const u = j * 2 * Math.PI/u_steps;
      const sinu = Math.sin(u);
      const cosu = Math.cos(u);
      const x = cosu * sinv;
      const y = cosv;
      const z = sinu * sinv;
      vertices.push(r * x, r * y, r * z);
    }
  }

  for (let i = 0; i < v_steps; i++) {
    for (let j = 0; j < u_steps; j++) {
      const k1 = (i * (u_steps + 1)) + j;
      const k2 = k1 + u_steps + 1;
      indices.push(k1, k2, k1 + 1);
      indices.push(k2, k2 + 1, k1 + 1);
    }
  }

  let vert_arr = new Float32Array(vertices);
  let indx_arr = new Uint16Array(indices);

  return {sphere_vertices: vert_arr, sphere_indices: indx_arr};
}

const sphere_colors = function (indices_length) {
  let colors = [];
  let r = 0.5;
  let g = 1.0;
  let b = 1.0;
  for (let i = 0; i < indices_length; i++) {
  
    colors.push(r, g, b);
  }

  col_arr = new Float32Array(colors);
  return col_arr;
}