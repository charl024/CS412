// Shape.js
// uses a vertex array object to handle gl buffers instead of purely vertex buffers
// allows one to draw a specified shape

class ShapeBuffer {
    constructor(gl, program, vertices, indices, colors, normals, tex_coords) {
        this.gl = gl;
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.normals = normals;
        this.verlen = vertices.length;
        this.idxlen = indices.length;
        this.tex_coords = tex_coords;

        this.flat_shading_data = flat_shading_normals(vertices, indices, colors);

        if (vertices.length % 3 !== 0) 
            throw new Error("vertices not multiple of 3");
        if (normals.length  && normals.length !== vertices.length)
            throw new Error("normals length must equal vertices length");
        if (colors.length   && colors.length  !== vertices.length)
            throw new Error("colors length must equal vertices length");

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.cbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        this.nbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        this.tbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.tex_coords, gl.STATIC_DRAW);

        const texLoc = gl.getAttribLocation(program, "aTexCoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

        const normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

        const posLoc = gl.getAttribLocation(program, "aPosition");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        const colorLoc = gl.getAttribLocation(program, "aColor");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    enable_flat() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.flat_shading_data.normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.flat_shading_data.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.flat_shading_data.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.flat_shading_data.colors, gl.STATIC_DRAW);

        this.idxlen = this.flat_shading_data.indices.length;
    }

    enable_smooth() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        this.idxlen = this.indices.length;

    }

    render() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);

        if (shadingButton) {
            this.enable_flat();
        } else {
            this.enable_smooth();
        }

        gl.drawElements(gl.TRIANGLES, this.idxlen, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.LINE_LOOP, this.idxlen, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

}