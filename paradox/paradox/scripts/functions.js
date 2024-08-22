function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function saveCanvas(canvas) {
    const savedCanvas = document.createElement('canvas');
    savedCanvas.width = canvas.width;
    savedCanvas.height = canvas.height;
    const ctx = savedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    return savedCanvas;
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h, s, v;
  
    if (delta === 0) {
      h = 0;
    } else if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * (((b - r) / delta) + 2);
    } else {
      h = 60 * (((r - g) / delta) + 4);
    }
  
    if (h < 0) {
      h += 360;
    }
  
    if (max === 0) {
      s = 0;
    } else {
      s = (delta / max) * 100;
    }
  
    v = max * 100;
  
    return [Math.round(h), Math.round(s), Math.round(v)];
  }

function hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;
  
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
  
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
  
    return [r, g, b];
  }

function colorBlend(backRgb, frontRgb, alpha) {
    const [Rb, Gb, Bb] = backRgb;
    const [Rf, Gf, Bf] = frontRgb;
    const R = alpha * Rf + (1 - alpha) * Rb;
    const G = alpha * Gf + (1 - alpha) * Gb;
    const B = alpha * Bf + (1 - alpha) * Bb;
    testrgb = [Math.round(R), Math.round(G), Math.round(B)];
    return [Math.round(R), Math.round(G), Math.round(B)];
}

function calculateLuminanceFactor(rgb) {
    const [R, G, B] = rgb;
    const brightness = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
    const LuminanceFactor = (-2/3) * brightness + 1
    //const LuminanceFactor = brightness ** 2 - 2.5 * brightness + 2;
    return LuminanceFactor;
}

function average(img) {
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    ctx_virtual.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, virtual.width, virtual.height);
    const rawrgb = ctx_virtual.getImageData(0, 0, virtual.width, virtual.height).data;
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = rawrgb.length / 4;
    for (let i = 0; i < rawrgb.length; i += 4) {
        totalR += rawrgb[i];
        totalG += rawrgb[i + 1];
        totalB += rawrgb[i + 2];
    }
    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);
    const avgRgb = [avgR, avgG, avgB];
    const hsv = rgbToHsv(avgR, avgG, avgB);
    let adjustS = hsv[1];
    let adjustV = hsv[2];
    if (hsv[1] !== 0) {
        adjustS = hsv[1] - ((hsv[1] - 50) / 2);
    }
    adjustV = hsv[2] - ((hsv[2] - 50) / 2);
    const adjustRgb = hsvToRgb(hsv[0], adjustS, adjustV);
    
    const blendColor = colorBlend(avgRgb, adjustRgb, 1 - saved.background.contrast);
    backgroundLuminanceFactor = calculateLuminanceFactor(blendColor);

    let rgb = adjustRgb;
    if (rgb[0] + rgb[1] + rgb[2] == 0) {
        
    } else {
        for (;;) {
            if (rgb[0] + rgb[1] + rgb[2] > 255) {
            break;
            }
            rgb[0] *= 1.1;
            rgb[1] *= 1.1;
            rgb[2] *= 1.1;
        }
    }
    return rgb;
}

function coordinate(image, colorAmount) {

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    const saturate = 100 + (saved.background.blur * 5);
    ctx.filter = `saturate(${saturate}%)`;

    let maskColor;
    
    if (saved.enableCustomColor === true) {
        maskColor = saved.customColor;
    } else {
        maskColor = averageColor;
    }
 
    ctx.drawImage(image, 0, 0);
    
    ctx.fillStyle = `rgba(${Math.min(Math.max(maskColor[0], 0), 255)}, 
                         ${Math.min(Math.max(maskColor[1], 0), 255)}, 
                         ${Math.min(Math.max(maskColor[2], 0), 255)}, ${colorAmount})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (saved.background.normalizeBrightness === true)
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - (saved.background.opacity / 100 * backgroundLuminanceFactor)})`;
    else {
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - (saved.background.opacity / 100)})`;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
}

async function fade(targetCanvas, to, duration, RGBA = false) {

    await Promise.all([
        to.onload ? to.onload : Promise.resolve()
    ]);

    return new Promise((resolve, reject) => {
    
    const from = saveCanvas(targetCanvas);
    const ctx_targetCanvas = targetCanvas.getContext('2d');
    let startTime;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutQuad(progress);
        const fadeInAlpha = easedProgress;
        let fadeOutAlpha;
        if (RGBA === true) {
            fadeOutAlpha = (1 - easedProgress);
        } else {
            fadeOutAlpha = 1;
        }

        ctx_targetCanvas.reset();
        ctx_targetCanvas.globalAlpha = fadeOutAlpha;
        ctx_targetCanvas.drawImage(from, 0, 0);
        ctx_targetCanvas.globalAlpha = fadeInAlpha;
        ctx_targetCanvas.drawImage(to, 0, 0);

        if (elapsed >= duration) {
            resolve();
            return;
        }
        requestAnimationFrame(animate);
    }
    animate(performance.now());
    });
}

function colorFade(targetColor, duration) {
    return new Promise((resolve, reject) => {
    initialColor = accentColor;
    if (firstLoad) {
        initialColor = targetColor = [100, 100, 100];
    }
    let startTime;
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutQuad(progress);
    
        const currentColor = {
        r: initialColor[0] + (targetColor[0] - initialColor[0]) * easedProgress,
        g: initialColor[1] + (targetColor[1] - initialColor[1]) * easedProgress,
        b: initialColor[2] + (targetColor[2] - initialColor[2]) * easedProgress
        };
        
        accentColor = [currentColor.r, currentColor.g, currentColor.b];

        document.documentElement.style.setProperty('--accentcolor', `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`);
        document.documentElement.style.setProperty('--accentcolorhalf', `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0.4)`);
    
        if (elapsed >= duration) {
        resolve();
        return;
        }
        requestAnimationFrame(animate);
    }
    animate(performance.now());
    });
}

function resizeImage(img, width, height) {

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if ((imgWidth * height / width) < imgHeight) { //指定した解像度より縦長の場合
        const aspectError = (imgHeight - (imgWidth * height / width)) / 2;
        ctx.drawImage(img, 0, aspectError, imgWidth, (imgWidth * height / width), 0, 0, width, height);
    } else { //指定した解像度より横長の場合
        const aspectError = (imgWidth - (imgHeight * width / height)) / 2;
        ctx.drawImage(img, aspectError, 0, (imgHeight * width / height), imgHeight, 0, 0, width, height);
    }

    return canvas;
}

function backgroundRefresh() {
    average(currentBG);
    const shadedCanvas = coordinate(resizeImage(currentBG, background.width, background.height), 1 - (saved.background.contrast));
    shader.applyShaderToCanvas(shadedCanvas, saved.background.blur, saved.background.blur, 0, true);
    ctx_background.reset();
    ctx_background.drawImage(shadedCanvas, 0, 0);
}

function hideGameUIRefresh() {
    const canvas = document.getElementById('uihide');
    const ctx = canvas.getContext('2d');
    const timingWidth = 800;
    const timingHeight = 120;
    const keyWidth = 200;
    const keyHeight = 120;
    ctx.reset();
    ctx.fillStyle = "#000000";
    if(saved.timing.hideGameUI === true) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - timingWidth / 2, canvas.height, timingHeight, 0, Math.PI * 2);
      ctx.arc(canvas.width / 2 + timingWidth / 2, canvas.height, timingHeight, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(canvas.width / 2 - timingWidth / 2, canvas.height - timingHeight, timingWidth, timingHeight);
    }
    if(saved.key.hideGameUI === true) {
      ctx.beginPath();
      ctx.arc(canvas.width, canvas.height / 2 + 55 - keyWidth / 2, keyHeight, 0, Math.PI * 2);
      ctx.arc(canvas.width, canvas.height / 2 + 55 + keyWidth / 2, keyHeight, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(canvas.width - keyHeight, canvas.height / 2 - keyWidth / 2, keyHeight, keyWidth);
    }
    shader.applyShaderToCanvas(canvas, 5, 5);
    // ctx.globalCompositeOperation = 'difference';
    // ctx.fillStyle = "#ffffff";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
}