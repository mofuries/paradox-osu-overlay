const shader = (() => {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl2');

    const FILL_VIEWPORT_VERTEX_SHADER_SOURCE =
        `#version 300 es

        out vec2 v_uv;

        const vec2[4] POSITIONS = vec2[](
        vec2(-1.0, -1.0),
        vec2(1.0, -1.0),
        vec2(-1.0, 1.0),
        vec2(1.0, 1.0)
        );

        const int[6] INDICES = int[](
        0, 1, 2,
        3, 2, 1
        );

        void main(void) {
        vec2 pos = POSITIONS[INDICES[gl_VertexID]];
        v_uv = pos * 0.5 + 0.5;
        gl_Position = vec4(pos, 0.0, 1.0);
        }
    `

    const COPY_FRAGMENT_SHADER_SOURCE =
        `#version 300 es

        precision highp float;

        in vec2 v_uv;

        out vec4 o_color;

        uniform sampler2D u_texture;

        void main(void) {
        o_color = texture(u_texture, v_uv);
        }
    `;

    const SCREEN_FRAGMENT_SHADER_SOURCE =
        `#version 300 es

        precision highp float;

        in vec2 v_uv;

        out vec4 o_color;

        uniform sampler2D u_texture;
        uniform float u_alpha;

        void main(void) {
        vec4 color = texture(u_texture, v_uv);
        o_color = vec4(color.rgb, u_alpha);
        }
    `;

    const BLUR_FRAGMENT_SHADER_SOURCE =
        `#version 300 es
        precision highp float;
        out vec4 o_color;
        uniform sampler2D u_texture;
        uniform bool u_horizontal;
        uniform int u_sampleStep;
        const float[5] weights = float[](0.2270270, 0.1945945, 0.1216216, 0.0540540, 0.0162162);
        ivec2 clampCoord(ivec2 coord, ivec2 size) {
            return max(min(coord, size - 1), 0);
        }
        void main(void) {
            ivec2 coord = ivec2(gl_FragCoord.xy);
            ivec2 size = textureSize(u_texture, 0);
            vec4 sum = weights[0] * texelFetch(u_texture, coord, 0);
            for (int i = 1; i < 5; i++) {
                ivec2 offset = (u_horizontal ? ivec2(i, 0) : ivec2(0, i)) * u_sampleStep;
                sum += weights[i] * texelFetch(u_texture, clampCoord(coord + offset, size), 0);
                sum += weights[i] * texelFetch(u_texture, clampCoord(coord - offset, size), 0);
            }
            o_color = vec4(sum.rgb, sum.a);
        }
    `;

    const createFramebuffer = function(gl, width, height) {
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return {
            framebuffer: framebuffer,
            texture: texture,
            width: width,
            height: height
        };
    };

    const loadTextureFromCanvas = function(gl, canvas) {
        const texture = gl.createTexture();
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const ctx = canvas.getContext('2d');

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        return texture;
    };

    const copyProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, COPY_FRAGMENT_SHADER_SOURCE);
    const screenProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, SCREEN_FRAGMENT_SHADER_SOURCE);
    const blurProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, BLUR_FRAGMENT_SHADER_SOURCE);

    const copyUniforms = getUniformLocations(gl, copyProgram, ['u_texture']);
    const screenUniforms = getUniformLocations(gl, screenProgram, ['u_texture', 'u_alpha']);
    const blurUniforms = getUniformLocations(gl, blurProgram, ['u_texture', 'u_horizontal', 'u_sampleStep']);


    const applyShaderToCanvas = function(destinationCanvas, reductionRate, radius, alpha = 1.0, screen = false) {

        const blurWidth = Math.ceil(destinationCanvas.width / reductionRate);
        const blurHeight = Math.ceil(destinationCanvas.height / reductionRate);
        const sampleStep = 1;
        const texture = loadTextureFromCanvas(gl, destinationCanvas);

        let blurFbObjR = createFramebuffer(gl, blurWidth, blurHeight);
        let blurFbObjW = createFramebuffer(gl, blurWidth, blurHeight);
        const swapBlurFbObj = function() {
        const tmp = blurFbObjR;
        blurFbObjR = blurFbObjW;
        blurFbObjW = tmp;
        };
    
        const renderToReductionBuffer = function() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, blurFbObjW.framebuffer);
            gl.viewport(0.0, 0.0, blurFbObjW.width, blurFbObjW.height);
            gl.useProgram(copyProgram);
            setUniformTexture(gl, 0, texture, copyUniforms['u_texture']);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            swapBlurFbObj();
        };

        const applyBlur = function() {
            gl.viewport(0.0, 0.0, blurFbObjW.width, blurFbObjW.height);
            gl.useProgram(blurProgram);

            gl.uniform1i(blurUniforms['u_sampleStep'], sampleStep);
            for (let i = 0; i < radius; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, blurFbObjW.framebuffer);
            setUniformTexture(gl, 0, blurFbObjR.texture, blurUniforms['u_texture']);
            gl.uniform1f(blurUniforms['u_horizontal'], true);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            swapBlurFbObj();

            gl.bindFramebuffer(gl.FRAMEBUFFER, blurFbObjW.framebuffer);
            setUniformTexture(gl, 0, blurFbObjR.texture, blurUniforms['u_texture']);
            gl.uniform1f(blurUniforms['u_horizontal'], false);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            swapBlurFbObj();
            }
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };

        const applyScreenShader = function(texture) {
            gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            gl.useProgram(screenProgram);
            setUniformTexture(gl, 0, texture, copyUniforms['u_texture']);
            gl.uniform1f(screenUniforms['u_alpha'], alpha);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        const restoreFromTexture = function(texture) {
            gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            gl.useProgram(copyProgram);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            setUniformTexture(gl, 0, texture, copyUniforms['u_texture']);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.disable(gl.BLEND);
        };
    
        const copyToCanvas = function() {
            const destCtx = destinationCanvas.getContext('2d');
            destCtx.reset();
            destCtx.drawImage(canvas, 0, 0, destinationCanvas.width, destinationCanvas.height);
        };

    
        if (reductionRate === 0 && radius === 0) {
            if (screen === true) {
                applyScreenShader(texture);
                copyToCanvas();
            } else {
                restoreFromTexture(texture);
                copyToCanvas();
            }
        } else {
            if (screen === true) {
                renderToReductionBuffer();
                applyBlur();
                applyScreenShader(blurFbObjR.texture);
                copyToCanvas();
            } else {
                renderToReductionBuffer();
                applyBlur();
                restoreFromTexture(blurFbObjR.texture);
                copyToCanvas();
            }
        }
    };
    return {
        applyShaderToCanvas: applyShaderToCanvas
    };
})();
