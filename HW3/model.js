class Model {
    constructor(num_segments, model_view_matrix, figure) {
        this.num_segments = num_segments;
        this.model_view_matrix = model_view_matrix;
        this.figure = figure;
        this.mat_stack = [];

        this.figure_init(this.num_segments);

        for (var i = 0; i < this.num_segments; i++) {
            this.init_node(i);
        }
    }

    set_mvm(matrix) {
        this.model_view_matrix = matrix;
    }

    traverse(idx) {
        if (idx == null) {
            return;
        }

        this.mat_stack.push(this.model_view_matrix);
        this.model_view_matrix = multiplyMat4(this.model_view_matrix, this.figure[idx].transform);
        this.figure[idx].render();

        if (this.figure[idx].children != null) {
            this.traverse(this.figure[idx].children);
        }

        this.model_view_matrix = this.mat_stack.pop();
    }

    create_node(idx, transform, render, children) {
        var node = {
            idx: idx,
            transform: transform,
            render: render,
            children: children
        };
        return node;
    }

    add_children(parent_idx, child_idx) {
        if (this.figure[parent_idx].children == null) {
            this.figure[parent_idx].children = [];
        }
        this.figure[parent_idx].children.push(child_idx);
    }

    figure_init(num_segments) {
        for (var i = 0; i < num_segments; i++) {
            let new_node = this.create_node(i, mat4Identity(), null, null);
            this.figure.push(new_node);
        }
    }

    init_node(idx) {
        var matrix = mat4Identity();
        
        switch (idx) {
            case 0:
                matrix = mat4RotateX(matrix, 60);
                this.figure[idx] = this.create_node(idx, matrix, () => this.base_segment(), null);
                break;
            case 1:
                matrix = mat4Translate(matrix, [0.0, 1.5, 0.0]);
                this.figure[idx] = this.create_node(idx, matrix, () => this.base_segment(), null);
                break;
            default:
                break;
        }
    }

    base_segment() {
        let segment_mat = mat4Translate(this.model_view_matrix, [0.0, 0.0, 0.0]);
        segment_mat = mat4Scale(segment_mat, [2.0, 0.5, 2.0]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
        drawCube();
    }

    upper_segment() {
        let segment_mat = mat4Translate(this.model_view_matrix, [0.0, 2.0, 0.0]);
        segment_mat = mat4Scale(segment_mat, [2.0, 0.5, 2.0]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
        drawCube();
    }
}

