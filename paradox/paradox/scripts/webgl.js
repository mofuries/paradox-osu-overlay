function createShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) + source);
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

function createProgramFromSource(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  return createProgram(gl, vertexShader, fragmentShader);
}

function createVbo(gl, array, usage) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, array, usage !== undefined ? usage : gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

function createIbo(gl, array) {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
}

function createVao(gl, vboObjs, ibo) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  if (ibo !== undefined) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  }
  vboObjs.forEach((vboObj) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vboObj.buffer);
    gl.enableVertexAttribArray(vboObj.index);
    gl.vertexAttribPointer(vboObj.index, vboObj.size, gl.FLOAT, false, 0, 0);
  });
  gl.bindVertexArray(null);
  if (ibo !== undefined) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vao;
}

function getUniformLocations(gl, program, keys) {
  const locations = {};
  keys.forEach(key => {
      locations[key] = gl.getUniformLocation(program, key);
  });
  return locations;
}

function setUniformTexture(gl, index, texture, location) {
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(location, index);
}

function setUniformCubeMapTexture(gl, index, texture, location) {
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.uniform1i(location, index);
}