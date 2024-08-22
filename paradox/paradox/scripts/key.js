function drawKeyOverlay() {
  const keyCanvas = document.getElementById('keyoverlay');
  const keyCanvasCache = document.createElement('canvas');
  const ctx_key = keyCanvas.getContext('2d');
  const ctx_keyCache = keyCanvasCache.getContext('2d');
  let key;
  let speed;
  let gradient;

  const checkIsPlaying = function() {
    if (tokenValue.rawStatus !== 2 || saved.enableKeyOverlay === false) {
      keyOverlayRunning = false;
      return false;
    } else {
      keyOverlayRunning = true;
      return true;
    }
  }

  const VariablesEqual = function() {
    const oldKeyObj = key;
    const newKeyObj = saved.key;

    const oldObjValue = Object.values(oldKeyObj);
    const newObjValue = Object.values(newKeyObj);

    const objIsEqual = oldObjValue.every((value, index) => value === newObjValue[index]);

    if (!objIsEqual) {
        return false;
    }
    return true;
  }

  const initializeVariables = function() {
    key = { ...saved.key };
  }

  const setupVariables = function() {
    let keyName = ['K1', 'K2', 'M1', 'M2'];
    keyCanvas.width = keyCanvasCache.width = key.size;
    document.documentElement.style.setProperty('--keywidth', `${key.size}px`);
    document.documentElement.style.setProperty('--keywidtheach', `${key.thickness * 1.33}px`);
    document.documentElement.style.setProperty('--keyheighteach', `${key.thickness}px`);
    document.documentElement.style.setProperty('--keyglowwidth', `${key.thickness * 1.33 * 2}px`);
    document.documentElement.style.setProperty('--keyglowpositionX', `${key.size - key.thickness / 5 - key.thickness * 1.33}px`);
    document.documentElement.style.setProperty('--keymargin', `${key.margin}px`);
    document.documentElement.style.setProperty('--keypositionX', `${key.size - key.thickness / 5}px`);
    document.documentElement.style.setProperty('--keypositionY2', `${key.thickness + key.margin}px`);
    document.documentElement.style.setProperty('--keypositionY3', `${(key.thickness + key.margin) * 2}px`);
    document.documentElement.style.setProperty('--keypositionY4', `${(key.thickness + key.margin) * 3}px`);
    document.documentElement.style.setProperty('--keyrotate', `rotate(${key.rotate}deg)`);
    document.documentElement.style.setProperty('--keynorotate', `rotate(${-(key.rotate)}deg)`);
    document.documentElement.style.setProperty('--keyoffsetX', key.offsetX + 'px');
    document.documentElement.style.setProperty('--keyoffsetY', key.offsetY + 'px');
    document.documentElement.style.setProperty('--keyfontsize', key.thickness * 0.0075 + 'rem');
    document.documentElement.style.setProperty('--keyradius', key.thickness / 5 + 'px');
    if (key.merge === true) {
      keyName = ['B1', 'B2'];
      keyCanvas.height = keyCanvasCache.height = key.thickness * 2 + key.margin;
      document.documentElement.style.setProperty('--keyheight', `${key.thickness * 2 + key.margin}px`);
      document.documentElement.style.setProperty('--keymerge', `hidden`);
    } else {
      keyCanvas.height = keyCanvasCache.height = key.thickness * 4 + key.margin * 3;
      document.documentElement.style.setProperty('--keyheight', `${key.thickness * 4 + key.margin * 3}px`);
      document.documentElement.style.setProperty('--keymerge', `visible`);
    }
    if (key.invert === true) {
      keyName.reverse();
    }
    for (i = 0; i < keyName.length; i++) {
      document.documentElement.style.setProperty(`--keyname${i + 1}`, `"${keyName[i]}\\a 　"`);
      document.documentElement.style.setProperty(`--keycount${i + 1}`, `"\\a ${"0"}"`);
      document.documentElement.style.setProperty(`--keyfontsize${i + 1}`, key.thickness * 0.021 / 3 + 'rem');
    }
  }

  const createGradient = function() {
    gradient = ctx_key.createLinearGradient(0, 0, keyCanvas.width, 0);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0.8)`);
    gradient.addColorStop(0.5, `rgba(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]}, 0.4)`); // グラデーションの中間点
    gradient.addColorStop(0, `rgba(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]}, 0.0)`);
  }

  const setKeyStatus = function(){
    speed = Math.max(Math.round(6 * tokenValue.currentBpm / 200), 2);
    let keyStatus = [tokenValue.K1Pressed, tokenValue.K2Pressed, tokenValue.M1Pressed, tokenValue.M2Pressed];
    let keyCount = [tokenValue.K1Count, tokenValue.K2Count, tokenValue.M1Count, tokenValue.M2Count];
    if (key.invert === true) {
      keyStatus.reverse();
      keyCount.reverse();
    }
    if (key.merge === true) {
      keyStatus = [(keyStatus[0] || keyStatus[2]), (keyStatus[1] || keyStatus[3])];
      keyCount = [keyCount[0] + keyCount[2], keyCount[1] + keyCount[3]];
    }
    if (key.all === true) {
      document.getElementById('keycounts').style.opacity = 1;
    } else {
      document.getElementById('keycounts').style.opacity = 0;
    }
    ctx_keyCache.fillStyle = "rgb(255, 255, 255)";
    ctx_keyCache.globalCompositeOperation = 'copy';
    ctx_keyCache.drawImage(keyCanvasCache, -speed, 0, keyCanvas.width, keyCanvas.height);
    ctx_keyCache.globalCompositeOperation = 'source-over';
    for (let i = 0; i < keyStatus.length; i++) {
        if (keyStatus[i] === true) {
          ctx_keyCache.fillRect(keyCanvas.width - speed, key.thickness * i + key.margin * i, speed, key.thickness);
          if (key.all === true) {
            document.getElementById(`k${i + 1}light`).style.opacity = 1;
            document.getElementById(`k${i + 1}light`).style.filter = "drop-shadow(0px 0px 10px var(--accentcolor)) drop-shadow(0px 0px 10px var(--accentcolor))";
            document.getElementById(`k${i + 1}`).style.background = "var(--accentcolor)";
            document.getElementById(`k${i + 1}`).style.filter = "brightness(160%) saturate(50%)";
            document.documentElement.style.setProperty(`--keypress${i + 1}`, `0`);
            document.documentElement.style.setProperty(`--keycount${i + 1}`, `"\\a ${keyCount[i]}"`);
            document.documentElement.style.setProperty(`--keyfontsize${i + 1}`, Math.min(key.thickness * 0.021 / keyCount[i].toString().length, key.thickness * 0.023 / 3) + 'rem');
          }
        } else {
          ctx_keyCache.clearRect(keyCanvas.width - speed, key.thickness * i + key.margin * i, speed, key.thickness);
          if (key.all === true) {
            document.getElementById(`k${i + 1}light`).style.opacity = 0;
            document.getElementById(`k${i + 1}light`).style.filter = "none";
            document.getElementById(`k${i + 1}`).style.background = "none";
            document.getElementById(`k${i + 1}`).style.filter = "brightness(100%) saturate(70%)";
            document.documentElement.style.setProperty(`--keypress${i + 1}`, -(key.thickness / 5) + 'px');
        }
      }
    }
  }

  const renderKeyStatus = function() {
    //ctx_key.reset();
    ctx_key.fillStyle = `rgba(255, 255, 255, 0.8)`;
    ctx_key.fillRect(0, 0, key.size, keyCanvas.height);
    ctx_key.globalCompositeOperation = 'source-over';
    ctx_key.drawImage(keyCanvasCache, 0, 0, keyCanvas.width, keyCanvas.height);
    ctx_key.globalCompositeOperation = 'source-in';
    ctx_key.fillStyle = gradient;
    ctx_key.fillRect(0, 0, key.size, keyCanvas.height);
  }

  const loop = function() {
    if (checkIsPlaying() === true) {
      if (VariablesEqual() === false) {
        initializeVariables();
        setupVariables();
      }
      createGradient();
      setKeyStatus();
      renderKeyStatus();
      requestAnimationFrame(loop);
    }
  }
  initializeVariables();
  setupVariables();
  createGradient();
  loop();
  }