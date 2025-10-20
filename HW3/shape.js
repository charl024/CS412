// Shape.js
// uses a vertex array object to handle gl buffers instead of purely vertex buffers
// allows one to draw a specified shape

class Shape {
    constructor(gl, program, vertices, indices, colors) {
        this.gl = gl;
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.verlen = vertices.length;
        this.idxlen = indices.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        this.nbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, "aPosition");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        const colorLoc = gl.getAttribLocation(program, "aColor");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
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