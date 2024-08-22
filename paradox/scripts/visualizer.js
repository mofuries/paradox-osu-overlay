const audioVisualizer = (() => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 16384;
    const freqencyCut = 0.4;
    const MaxNumX = 60;
    const MaxNumY = 15;
    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    let speed;
    visualizer.style.filter = "drop-shadow(0px 0px 15px var(--accentcolorhalf)) drop-shadow(0px 0px 60px var(--accentcolor))";

    let audio = document.getElementById('audio');
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const observer = new MutationObserver(function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.target.id === 'currentbpm') {
                if (cache.currentBpm !== 0) {
                    speed = Math.max(Math.min(((1 - (cache.currentBpm * 2.5 / 1000)) * 1.14), 0.97), 0);
                    analyser.smoothingTimeConstant = speed;
                } else {
                    analyser.smoothingTimeConstant = 0.8;
                }
            }
        }
    });

    const targetNode = document.getElementById('currentbpm');
    const config = { childList: true };
    observer.observe(targetNode, config);

    function changeSaturation(rgb, amount) {

        const [r, g, b] = rgb;
        const avg = (r + g + b) / 3;
        const deltaR = r - avg;
        const deltaG = g - avg;
        const deltaB = b - avg;

        const newR = avg + deltaR * amount;
        const newG = avg + deltaG * amount;
        const newB = avg + deltaB * amount;

        return [newR, newG, newB].map(value => Math.round(Math.max(Math.min(value, 255), 0)));
    }

    const particlesColor = new Array(MaxNumX * MaxNumY).fill([0, 0, 0, 0]);
    const gl_v = visualizer.getContext('webgl2');

    const VISUALIZER_VERTEX_SHADER_SOURCE = 
        `#version 300 es

        out vec2 vVertexPosition;

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
        vVertexPosition = pos;
        gl_Position = vec4(pos, 0.0, 1.0);
        }
    `;

    const VISUALIZER_FRAGMENT_SHADER_SOURCE =
        `#version 300 es

        precision highp float;

        uniform vec4 u_colors[900];
        in vec2 vVertexPosition;
        out vec4 fragColor;
        float circle = 0.0;
        float margin = 1.0 / 60.0 * 2.0;
        float offset = (1.0 / 60.0 * 2.0) * (15.0 / 2.0);
        float centering = (1.0 / 60.0 * 2.0) / 2.0;
        float ratio = 0.012;

        uniform vec2 u_resolution;

        void main(void) {

            vec2 position = vec2(vVertexPosition.x / (u_resolution.x / u_resolution.x), vVertexPosition.y / (u_resolution.x / u_resolution.y));

            for (int i = 0; i < 60; i++) {
                for (int j = 0; j < 15; j++) {
                    vec2 center = vec2(float(i) * margin - 1.0 + centering, float(j) * margin - offset + centering);
                    float cSize = length(position - center) * (1.0 / ratio);
                    float cLength = smoothstep(0.8, 1.0, cSize);
                    circle += 1.0 - cLength;
                }
            }

            float normalizedX = gl_FragCoord.x / (u_resolution.x / 60.0);
            float normalizedY = gl_FragCoord.y / (u_resolution.y / 15.0);
            
            int xIndex = int(normalizedX);
            int yIndex = int(normalizedY);
            
            int colorIndex = yIndex * 60 + xIndex;

            vec4 circleColor = u_colors[colorIndex] * circle;
            fragColor = circleColor;
        }
    `;

    const visualizerProgram = createProgramFromSource(gl_v, VISUALIZER_VERTEX_SHADER_SOURCE, VISUALIZER_FRAGMENT_SHADER_SOURCE);
    const visualizerUniforms = getUniformLocations(gl_v, visualizerProgram, ['u_resolution', 'u_colors']);

    const setupVisualizer = function() {
        gl_v.viewport(0, 0, visualizer.width, visualizer.height);
        gl_v.clearColor(0, 0, 0, 1);
        gl_v.enable(gl_v.BLEND);
        gl_v.blendFunc(gl_v.SRC_ALPHA, gl_v.ONE_MINUS_SRC_ALPHA);
        const resolutionLocation = visualizerUniforms['u_resolution'];
        gl_v.uniform2f(resolutionLocation, visualizer.width, visualizer.height);
    }

    let requestId = null;
    const renderVisualizer = function() {
        if (requestId !== null) {
            cancelAnimationFrame(requestId);
            requestId = null;
        }

        const fadeParticlesColor = function() {
            particlesColor.forEach((color) => {
                if (color[3] >= 0) {
                    color[3] -= 0.05 * color[3] * (1.5 - speed);
                } else {
                    color = [0, 0, 0, 0];
                }
            });
        }

        const setParticlesColor = function() {
            analyser.getByteFrequencyData(frequencyData);
            for (let i = 0; i < MaxNumX; i++) {
                const barValue = Math.floor(frequencyData[Math.floor(i * bufferLength / (MaxNumX * ((MaxNumX + freqencyCut * 100) / MaxNumX)))] ** 2 / (65025 / MaxNumY));
                for (let j = barValue - 1; j >= 0; j--) {
                    
                    const magnification = j / barValue;
                    let color;
                    let alphaJ = (1 - magnification ** 2);
                    const satulationColor = changeSaturation(accentColor, alphaJ);
                    
                    color = satulationColor.map(value => Math.round(Math.max(Math.min(value / (magnification / 0.6), 255), 0)));
        
                    if (j === barValue - 1) {
                        color = satulationColor;
                    } else if (j === barValue - 2) {
                        alphaJ /= 12;
                    }
        
                    const glrgba = color.map(value => value / 255);
                    glrgba.push(alphaJ);
                    const index = j * MaxNumX + i;
                    particlesColor[index] = glrgba;
                }
            }
        }

        const renderParticles = function() {
            const colorLocation = visualizerUniforms['u_colors'];
            gl_v.useProgram(visualizerProgram);
            gl_v.clearColor(0, 0, 0, 0);
            gl_v.uniform4fv(colorLocation, new Float32Array(particlesColor.flat()));
            gl_v.drawArrays(gl_v.TRIANGLES, 0, 6);
        }

        const loop = function() {
            if (saved.enableAudioVisualizer === true && gl_v) {
                setParticlesColor();
                renderParticles();
                fadeParticlesColor();
                requestId = requestAnimationFrame(loop);
            } else {
                return;
            }
        };
        loop();
    };

    document.addEventListener('DOMContentLoaded', function() {
        setupVisualizer();
    });

    if (saved.enableAudioVisualizer === true && gl_v) {
        renderVisualizer();
    }
    return {
        renderVisualizer: renderVisualizer
    }
})();