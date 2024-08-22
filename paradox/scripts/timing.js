function drawTimingBar() {
    const timingCanvas = document.getElementById('timingbar');
    const timingBar = document.createElement('canvas');
    const ctx_timing = timingCanvas.getContext('2d');
    const ctx_timingBar = timingBar.getContext('2d');
    let hitErrors = [];
    let timing;
    let barThickness;
    let hitErrorWidth;
    let hitErrorHeight;
    let OD;
    let mods;
    let area300;
    let area100;
    let area50;
    let gradient;
    let normalizationFactor;

    const checkIsPlaying = function() {
        if (tokenValue.rawStatus !== 2 || saved.enableTimingBar === false) {
            cache.hitErrors = [];
            timingBarRunning = false;
            return false;
        } else {
            timingBarRunning = true;
            return true;
        }
    }

      const VariablesEqual = function() {
        const oldTimingObj = timing;
        const newTimingObj = saved.timing;
        const oldObjValue = Object.values(oldTimingObj);
        const newObjValue = Object.values(newTimingObj);
        const oldOD = OD;
        const newOD = tokenValue.od;
        const oldMods = mods;
        const newMods = cache.modsArray;

        const objIsEqual = oldObjValue.every((value, index) => value === newObjValue[index]);
        if (!objIsEqual || oldOD !== newOD || oldMods !== newMods) {
            return false;
        }
        return true;
    }

    const initializeVariables = function() {
        timing = { ...saved.timing };
        barThickness = 4 * timing.size;
        hitErrorWidth = 4 * timing.size;
        hitErrorHeight = 60 * timing.size;
        OD = tokenValue.od;
        mods = cache.modsArray;
    }

    const createGradient = function(color) {
        gradient = ctx_timing.createLinearGradient(0, timingCanvas.height / 2 - barThickness / 2, 0, timingCanvas.height / 2 - hitErrorHeight);
        gradient.addColorStop(0, `${color}ff`);
        gradient.addColorStop(1, `${color}00`);
    }

    const calculateTimingWindow = function() {
        let modOD = OD;
        if (Array.isArray(mods)) {
            if (cache.modsArray.includes("HR") || cache.modsArray.includes("Hard Rock")) {
                modOD = Math.min(OD * 1.4, 10);
            } else if (cache.modsArray.includes("EZ") || cache.modsArray.includes("Easy")) {
                modOD = OD / 2;
            }
        }
        const range300 = (79.5 - (modOD * 6));
        const range100 = (139.5 - (modOD * 8));
        const range50 = (199.5 - (modOD * 10));
        normalizationFactor = 150 / range50;
        
        if (timing.normalize === true) {
            area300 = range300 * normalizationFactor * timing.size;
            area100 = range100 * normalizationFactor * timing.size;
            area50 = range50 * normalizationFactor * timing.size;
        } else {
            area300 = range300 * timing.size;
            area100 = range100 * timing.size;
            area50 = range50 * timing.size;
        }
    }

    const setupVariables = function() {
        timingBar.width = timingCanvas.width = timingBar.height = timingCanvas.height = 1000 * timing.size;
        document.getElementById('timing').style.width = document.getElementById('timing').style.height = area50 * 2 + (50 * timing.size) + 'px';
        document.documentElement.style.setProperty('--timingcenter', -(timingCanvas.height / 2 - (area50 + (25 * timing.size))) + 'px');
        if (timing.rotate === 0 || timing.rotate === 180 || timing.rotate === -180) {
            if (timing.urPosition === 'top') {
                document.documentElement.style.setProperty('--urposition', `${-(hitErrorHeight / 2 + 50)}px`);
            } else if (timing.urPosition === 'bottom') {
                document.documentElement.style.setProperty('--urposition', `${hitErrorHeight / 2 + 50}px`);
            }
            document.documentElement.style.setProperty('--latehorizontal', `${-(area50 + 20)}px`);
            document.documentElement.style.setProperty('--aheadhorizontal', `${area50 + 20}px`);
            document.documentElement.style.setProperty('--latevertical', `0px`);
            document.documentElement.style.setProperty('--aheadvertical', `0px`);
        } else if (timing.rotate === 90 || timing.rotate === -90) {
            if (timing.urPosition === 'top') {
                document.documentElement.style.setProperty('--urposition', `${-(area50 + 50)}px`);
            } else if (timing.urPosition === 'bottom') {
                document.documentElement.style.setProperty('--urposition', `${area50 + 50}px`);
            }
            document.documentElement.style.setProperty('--latehorizontal', `0px`);
            document.documentElement.style.setProperty('--aheadhorizontal', `0px`);
            document.documentElement.style.setProperty('--latevertical', `${-(area50 + 20)}px`);
            document.documentElement.style.setProperty('--aheadvertical', `${area50 + 20}px`);
        }
        document.documentElement.style.setProperty('--timingoffsetX', timing.offsetX + 'px');
        document.documentElement.style.setProperty('--timingoffsetY', timing.offsetY + 'px');
        document.documentElement.style.setProperty('--timingrotate', `rotate(${timing.rotate}deg)`);
    }
    
    const createTimingBar = function() {
        ctx_timingBar.reset();
        ctx_timingBar.beginPath();
        ctx_timingBar.fillStyle = "#ffff61";
        ctx_timingBar.arc(timingCanvas.width / 2 - area50, timingCanvas.height / 2, barThickness, 0, Math.PI * 2);
        ctx_timingBar.arc(timingCanvas.width / 2 + area50, timingCanvas.height / 2, barThickness, 0, Math.PI * 2);
        ctx_timingBar.fill();
        ctx_timingBar.fillRect(timingCanvas.width / 2 - area50, timingCanvas.height / 2 - barThickness, area50 * 2, barThickness * 2);
        ctx_timingBar.fillStyle = "#58ff77";
        ctx_timingBar.fillRect(timingCanvas.width / 2 - area100, timingCanvas.height / 2 - barThickness, area100 * 2, barThickness * 2);
        ctx_timingBar.fillStyle = "#46b2ff";
        ctx_timingBar.fillRect(timingCanvas.width / 2 - area300, timingCanvas.height / 2 - barThickness, area300 * 2, barThickness * 2);
        ctx_timingBar.fillStyle = "#ffffff";
        ctx_timingBar.fillRect((timingCanvas.width / 2) - (hitErrorWidth / 2), timingCanvas.height / 2 - (hitErrorHeight / 2), hitErrorWidth, hitErrorHeight);
    }

    const renderHitErrors = function() {
        ctx_timing.reset();
        ctx_timing.globalCompositeOperation = "source-over";
        ctx_timing.drawImage(timingBar, 0, 0);
        ctx_timing.globalCompositeOperation = "lighter";
        hitErrors.forEach((hitError) => {
            let area;
            let color;
            let isExcellent;
            if (Math.abs(hitError.offset) < area300) {
                color = "#46b2ff";
                area = area300;
                isExcellent = true;
            } else if (Math.abs(hitError.offset) < area100) {
                color = "#58ff77";
                area = area100;
            } else {
                color = "#ffff61";
                area = area50;
            }
            createGradient(color);
            ctx_timing.fillRect((timingCanvas.width / 2 + hitError.offset) - (hitErrorWidth / 2), timingCanvas.height / 2 - (hitErrorHeight / 2), hitErrorWidth, hitErrorHeight);
            ctx_timing.fillStyle = gradient;
            ctx_timing.globalAlpha = hitError.delta;
            if (timing.moving === true) {
                if (color == "#46b2ff") {
                    ctx_timing.fillRect(timingCanvas.width / 2 - area300, timingCanvas.height / 2 - hitErrorHeight, area300 * 2, hitErrorHeight - barThickness);
                } else if (color == "#58ff77") {
                    if (hitError.offset < 0) {
                        ctx_timing.fillRect(timingCanvas.width / 2 - area100, timingCanvas.height / 2 - hitErrorHeight, area100 - area300, hitErrorHeight - barThickness);
                    } else {
                        ctx_timing.fillRect(timingCanvas.width / 2 + area300, timingCanvas.height / 2 - hitErrorHeight, area100 - area300, hitErrorHeight - barThickness);
                    }
                } else {
                    if (hitError.offset < 0) {
                        ctx_timing.fillRect(timingCanvas.width / 2 - area50, timingCanvas.height / 2 - hitErrorHeight, area50 - area100, hitErrorHeight - barThickness);
                    } else {
                        ctx_timing.fillRect(timingCanvas.width / 2 + area100, timingCanvas.height / 2 - hitErrorHeight, area50 - area100, hitErrorHeight - barThickness);
                    }
                }
            }
            hitError.alpha -= 0.02 * timing.speed;
            hitError.delta = Math.max(hitError.delta - 0.02 * timing.speed, 0);
            ctx_timing.fillStyle = color;
            ctx_timing.globalAlpha = hitError.alpha;
            if (timing.moving === true) {
                ctx_timing.fillRect((timingCanvas.width / 2 + hitError.offset) - (hitErrorWidth / 2), timingCanvas.height / 2 - (hitErrorHeight / 2) + hitError.moved, hitErrorWidth, hitErrorHeight);
                hitError.moved -= 6 * timing.speed;
            }
        });
    }

    const setHitErrors = function() {
        let currentHitErrors = [];
        let average;
        if (Array.isArray(tokenValue.hitErrors)) {
            currentHitErrors = tokenValue.hitErrors;
        }
        if (currentHitErrors.length === 0) {
            cache.hitErrors = [];
        }
        const previousHitErrors = cache.hitErrors;
        const sum = currentHitErrors.slice(-5).reduce((acc, curr) => acc + curr, 0) / 5;
        if (timing.normalize === true) {
            average = sum * normalizationFactor * timing.size;
        } else {
            average = sum * timing.size;
        }
        document.documentElement.style.setProperty('--hiterroraverage', `${average}px`);
        if (currentHitErrors.length > previousHitErrors.length) {
            const addedItems = currentHitErrors.slice(Math.max(previousHitErrors.length - currentHitErrors.length, -5));
            for (let i = 0; i < addedItems.length; i++) {
                let timingError;
                if (timing.normalize === true) {
                    timingError = addedItems[i] * normalizationFactor * timing.size;
                } else {
                    timingError = addedItems[i] * timing.size;
                }
                if (timing.rotate === 180 || timing.rotate === -180 || timing.rotate === -90) {
                    timingError = -(timingError);
                }
                const Error = {
                    offset: timingError,
                    moved: 0,
                    alpha: 1,
                    delta: 0.3,
                };

                hitErrors.push(Error);
            }
        }
        cache.hitErrors = currentHitErrors;
    }
    
    const animateHitErrors = function() {
        hitErrors.forEach((hitError, index) => {
            if (hitError.alpha <= 0) {
                hitErrors.splice(index, 1);
            }
        });
    }

    const loop = function() {
        if (checkIsPlaying() === true) {
            if (VariablesEqual() === false) {
                initializeVariables();
                calculateTimingWindow();
                setupVariables();
                createTimingBar();
            }
            setHitErrors();
            renderHitErrors();
            animateHitErrors();
            requestAnimationFrame(loop);
        }
    }
    initializeVariables();
    calculateTimingWindow();
    setupVariables();
    createTimingBar();
    loop();
}