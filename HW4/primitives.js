
function pyramid_data() {
	let pyramid_vertices =[
		-1, -1, -1,  // 0
		1, -1, -1,  // 1
		1,  1, -1,  // 2
		-1,  1, -1,  // 3
		-1, -1,  1,  // 4
		1, -1,  1,  // 5
		1,  1,  1,  // 6
		-1,  1,  1,  // 7
		0,  1,  0   // 8
	];

	let pyramid_indices = [
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

	];

	return {
        vertices: new Float32Array(pyramid_vertices),
        indices: new Uint16Array(pyramid_indices)
    };
}

function cube_data() {
	// cube
	let cube_vertices = [
	-1, -1, -1,  // 0
	1, -1, -1,  // 1
	1,  1, -1,  // 2
	-1,  1, -1,  // 3
	-1, -1,  1,  // 4
	1, -1,  1,  // 5
	1,  1,  1,  // 6
	-1,  1,  1,  // 7
	];

	let cube_indices = [
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
	];

	return {
        vertices: new Float32Array(cube_vertices),
        indices: new Uint16Array(cube_indices)
    };
};

function sphere_data (u_steps, v_steps, r) {
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

	return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
}

function cone_data(u_steps, v_steps, r, h) {
	let vertices = [];
	let indices = [];
	let normals = [];

	for (let i = 0; i <= v_steps; i++) {
		const y = i * h / v_steps;
		const radius = r * (1 - i / v_steps);

		for (let j = 0; j <= u_steps; j++) {
            const u = j * 2 * Math.PI / u_steps;
            const cosu = Math.cos(u);
            const sinu = Math.sin(u);
            const x = radius * cosu;
            const z = radius * sinu;

            vertices.push(x, y, z);
			const ru = r * y;
			const hcos = h * cosu;
			normals.push()
        }
	}

	 for (let i = 0; i < v_steps; i++) {
        for (let j = 0; j < u_steps; j++) {
            const k1 = i * (u_steps + 1) + j;
            const k2 = k1 + u_steps + 1;
            indices.push(k1, k2, k1 + 1);
            indices.push(k2, k2 + 1, k1 + 1);
        }
    }

	let base_idx = vertices.length / 3;
	vertices.push(0, 0, 0);

	const base_start = 0;
	for (let j = 0; j < u_steps; j++) {
		const k1 = base_start + j;
		const k2 = base_start + (j + 1) % (u_steps + 1);
		indices.push(base_idx, k2, k1);
	}

	return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
};

function cylinder_data(u_steps, v_steps, r, h) {
    let vertices = [];
    let indices = [];

    for (let i = 0; i <= v_steps; i++) {
        const y = i * h / v_steps;

        for (let j = 0; j <= u_steps; j++) {
            const u = j * 2 * Math.PI / u_steps;
            const cosu = Math.cos(u);
            const sinu = Math.sin(u);
            const x = r * cosu;
            const z = r * sinu;
            vertices.push(x, y, z);
        }
    }

    for (let i = 0; i < v_steps; i++) {
        for (let j = 0; j < u_steps; j++) {
            const k1 = i * (u_steps + 1) + j;
            const k2 = k1 + u_steps + 1;
            indices.push(k1, k2, k1 + 1);
            indices.push(k2, k2 + 1, k1 + 1);
        }
    }

    let top_center_index = vertices.length / 3;
    vertices.push(0, h, 0);
    const top_row_start = v_steps * (u_steps + 1);

    for (let j = 0; j < u_steps; j++) {
        const k1 = top_row_start + j;
        const k2 = top_row_start + (j + 1) % (u_steps + 1);
        indices.push(top_center_index, k1, k2);
    }

    let bottom_center_index = vertices.length / 3;
    vertices.push(0, 0, 0);

    const bottom_row_start = 0;
    for (let j = 0; j < u_steps; j++) {
        const k1 = bottom_row_start + j;
        const k2 = bottom_row_start + (j + 1) % (u_steps + 1);
        indices.push(bottom_center_index, k2, k1);
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
};

function generate_colors(rgb, num_idx) {
	let colors = [];
	for (let i = 0; i < num_idx; i++) {
        colors.push(rgb[0], rgb[1], rgb[2]);
    }
	return new Float32Array(colors);
}