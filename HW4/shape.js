// Shape.js
// uses a vertex array object to handle gl buffers instead of purely vertex buffers
// allows one to draw a specified shape

class Shape {
    constructor(gl, program, vertices, indices, colors, normals) {
        this.gl = gl;
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.verlen = vertices.length;
        this.idxlen = indices.length;

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
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        this.cbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        this.nbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.idxlen, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.LINE_LOOP, this.idxlen, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

}