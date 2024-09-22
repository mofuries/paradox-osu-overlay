if (navigator.language === "ja-JP" && !window.location.href.includes("JP")) {
    window.location.href = window.location.href + encodeURIComponent("index_JP.html");
}

function checkUpdate() {
    document.getElementById('version').innerHTML = version;
    fetch('https://api.github.com/repos/mofuries/paradox-osu-overlay/releases/latest')
    .then(response => response.json())
    .then(data => {
        console.log(data.tag_name);
        if (channel != "Dev") {
            if (version === data.tag_name){
                document.getElementById('islatest').innerHTML = `up-to-date`;
                document.getElementById('islatest').style.background = "linear-gradient(to bottom, #7df06c, #70d761)";
            } else {
                document.getElementById('islatest').innerHTML = `update available`;
                document.getElementById('islatest').style.background = "linear-gradient(to bottom, #9a77f2, #8c6cdc)";
            }
        } else {
            document.getElementById('islatest').innerHTML = `Dev`;
            document.getElementById('islatest').style.background = "linear-gradient(to bottom, #505050, #404040)";
            document.getElementById('islatest').style.color = "#ffffff";
        }
    });
}

function setLocal(variableName, variableValue) {
    localStorage.setItem(variableName, JSON.stringify(variableValue));
}

function setImageToLocal(variableName, variableValue) {
    try {
        localStorage.setItem(variableName, JSON.stringify(variableValue));
        return true;
    } catch (error) {
        return false;
    }
}

function getLocal(variableName) {
    const value = localStorage.getItem(variableName);
    return value !== null ? JSON.parse(value) : null;
}

function getLocalAll() {
    return new Promise((resolve, reject) => {
        for (let key in saved) {
            const value = getLocal(key);
            if (value !== null) {
                if (typeof saved[key] === 'object' && typeof value === 'object') {
                    Object.assign(saved[key], value);
                } else {
                    saved[key] = value;
                }
            }
        }
        resolve(saved);
    });
}

function displayLocalStorage() {
    const localStorageKeys = Object.keys(localStorage);

    if (localStorageKeys.length === 0) {
        console.log("Localstorage is empty.");
    } else {
        localStorageKeys.forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`${key}: ${value}`);
        });
    }
}

function getUserData(user = tokenValue.banchoId) {
    if (saved.apiKey !== null) {
        const apiUrl = `https://osu.ppy.sh/api/get_user?k=${saved.apiKey}&u=${encodeURIComponent(user)}`;
        return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let userData = '';
            data.forEach(user => {
                for (const key in user) {
                    if (cacheUserData.hasOwnProperty(key)) {
                        userData += key + ': ' + user[key] + '<br>';
                        cacheUserData[key] = user[key];
                    }
                }
            });
            document.getElementById('apiconnect').style.color = "#99ccff";
            document.getElementById('apiconnect').innerHTML = "Connected.";
            return userData;
        })
        .catch(error => {
            document.getElementById('apiconnect').style.color = "#ff99cc";
            document.getElementById('apiconnect').innerHTML = "Failed. Wrong key?";
            console.error('Error fetching data:', error);
            throw error;
        });
    } else {
        return Promise.resolve('');
    }
}

function reloadUserData(user = tokenValue.banchoId) {
    isPlaying = false;
    if (saved.apiKey !== null && saved.apiKey !== '') {
        if (user === "osu!") {
            user = tokenValue.banchoId;
        }
        if (user == null) {
            user = "";
        }
        if (tokenValue.osuIsRunning === 0) {
            return;
        }
        getUserData(user)
        .then(userData => {
            validUserdata = true;
            panelImage.src = `https://a.ppy.sh/${cacheUserData.user_id}`;
            showElement([avatar]);
            hideElement([document.getElementById('paddingleft'), document.getElementById('detailleft'), document.getElementById('paddingright'), document.getElementById('detailright')]);
            setTimeout(() => {
                item1.innerHTML = '<span class="profilelabel">Performance&nbsp;&nbsp;&nbsp;</span>' + `<span class="userpp">${addCommasToNumber(cacheUserData.pp_raw)}&nbsp;pp</span>`
                item2.innerHTML = '<span class="profilelabel">Ranked Score&nbsp;&nbsp;&nbsp;</span>' + `<span class="rankedscore">${addCommasToNumber(cacheUserData.ranked_score)}</span>`;
                item3.innerHTML = '<span class="colored hash hilight">#</span>' + `<span class="rank">${addCommasToNumber(cacheUserData.pp_rank)}</span>`;
                item4.innerHTML = '<span class="colored hash hilight">&nbsp;#</span>' + `<span class="ranksub">${addCommasToNumber(cacheUserData.pp_country_rank)}</span><img class="countryflag" src="assets/flags/${cacheUserData.country.toUpperCase()}.png">`;
                box1.innerHTML = `<span class="plus">${parseFloat(cacheUserData.pp_raw) >= parseFloat(saved.cacheUserData.pp_raw) ? '+' : '-'}</span>${addCommasToNumber(parseFloat(Math.abs(cacheUserData.pp_raw - saved.cacheUserData.pp_raw)).toFixed(2))}&nbsp;pp`;
                box2.innerHTML = `<span class="plus">${parseFloat(cacheUserData.ranked_score) >= parseFloat(saved.cacheUserData.ranked_score) ? '+' : '-'}</span>${addCommasToNumber(Math.abs(cacheUserData.ranked_score - saved.cacheUserData.ranked_score))}`;
                box3.innerHTML = `<span class="rankplus">${parseFloat(saved.cacheUserData.pp_rank) >= parseFloat(cacheUserData.pp_rank) ? '+' : '-'}</span><span class="countrank">${addCommasToNumber(Math.abs(cacheUserData.pp_rank - saved.cacheUserData.pp_rank))}</span>`;
                box4.innerHTML = `<span class="rankplus">${parseFloat(saved.cacheUserData.pp_country_rank) >= parseFloat(cacheUserData.pp_country_rank) ? '+' : '-'}</span><span class="countrank">${addCommasToNumber(Math.abs(cacheUserData.pp_country_rank - saved.cacheUserData.pp_country_rank))}</span>`;
                document.getElementById('detailitem1').innerHTML = `<span id="username">${cacheUserData.username}</span><img class="countryflag" src="assets/flags/${cacheUserData.country.toUpperCase()}.png">`;
                document.getElementById('detailitem2').innerHTML = '<span class="profilelabel">Level:&nbsp;&nbsp;&nbsp;</span>' + cacheUserData.level;
                document.getElementById('detailitem3').innerHTML = '<span class="profilelabel">Accuracy:&nbsp;&nbsp;&nbsp;</span>' + parseFloat(cacheUserData.accuracy).toFixed(2) + '%';
                document.getElementById('detailitem4').innerHTML = '<span class="profilelabel">Playcount:&nbsp;&nbsp;&nbsp;</span>' + addCommasToNumber(cacheUserData.playcount) + `&nbsp;&nbsp;(&nbsp;${Math.floor(cacheUserData.total_seconds_played / 3600)}&nbsp;hours&nbsp;)`;
                document.getElementById('detailitem5').innerHTML = '<span class="profilelabel">Join date:&nbsp;&nbsp;&nbsp;</span>' + cacheUserData.join_date;
                document.getElementById('detailbox2').innerHTML = `<span class="plus">${parseFloat(cacheUserData.level) >= parseFloat(saved.cacheUserData.level) ? '+' : '-'}</span>${Math.abs(cacheUserData.level - saved.cacheUserData.level).toFixed(3)}`;
                document.getElementById('detailbox3').innerHTML = `<span class="plus">${parseFloat(cacheUserData.accuracy) >= parseFloat(saved.cacheUserData.accuracy) ? '+' : '-'}</span>${parseFloat(Math.abs(cacheUserData.accuracy - saved.cacheUserData.accuracy)).toFixed(2)}%`;
                document.getElementById('detailbox4').innerHTML = `<span class="plus">${parseFloat(cacheUserData.playcount) >= parseFloat(saved.cacheUserData.playcount) ? '+' : '-'}</span>${addCommasToNumber(Math.abs(cacheUserData.playcount - saved.cacheUserData.playcount))}</span>`;
                showElement([document.getElementById('paddingleft'), document.getElementById('detailleft')]);
                if (user === tokenValue.banchoId) {
                    showElement([document.getElementById('paddingright'), document.getElementById('detailright')]);
                } else {
                    hideElement([document.getElementById('paddingright'), document.getElementById('detailright')]);
                }
            }, 250);        
        })
        .catch(error => {
            validUserdata = false;
            analyzerHide();
        });
    } else {
        validUserdata = false;
        analyzerHide();
        console.log('API key is wrong');
    }
}

function settingHide() {
    setting.style.left = "-510px";
    setting.style.opacity = 0;
    setTimeout(() => {
        setting.style.visibility = "hidden";
        settingVisible = false;
    }, 250);
}

function settingShow() {
    setting.style.visibility = "visible";
    setting.style.opacity = 1;
    setting.style.left = 0;
    setTimeout(() => {
        settingVisible = true;
    }, 250);
}

function optionShow(Element) {
    Element.style.visibility = "visible";
    Element.style.height = Element.scrollHeight + 'px';
    Element.classList.add('padding');
    setTimeout(() => {
        Element.style.opacity = 1;
    }, 250);
}

function optionHide(Element) {
    Element.style.opacity = 0;
    setTimeout(() => {
        Element.style.visibility = "hidden";
        Element.style.height = "0px";
        Element.classList.remove('padding');
    }, 250);
}

function interfaceShow() {
    if (validUserdata === true || tokenValue.rawStatus === 2 || tokenValue.rawStatus === 7) {
        analyzerPanel.style.right = "8px";
        analyzerPanel.style.opacity = 1;
    }
    document.getElementById('cornershadow').style.opacity = 1;
    mapPanel.style.left = 0;
    mapPanel.style.opacity = 1;
    mapdetailPanel.style.left = 0;
    mapdetailPanel.style.opacity = 1;
}

function interfaceHide() {
    analyzerPanel.style.right = "-600px";
    analyzerPanel.style.opacity = 0;
    document.getElementById('cornershadow').style.opacity = 0;
    mapPanel.style.left = "-600px";
    mapPanel.style.opacity = 0;
    mapdetailPanel.style.left = `${-(mapdetail.getBoundingClientRect().width)}px`;
    mapdetailPanel.style.opacity = 0;
}

function analyzerChangeToProfile() {
    mods.style.opacity = 0;
    visualizer.style.opacity = 0;
    avatar.style.opacity = 1;
}

function analyzerChangeToScore() {
    avatar.style.opacity = 0;
    mods.style.opacity = 1;
    visualizer.style.opacity = 1;
}

function analyzerHide() {
    analyzerPanel.style.right = "-600px";
    analyzerPanel.style.opacity = 0;
}

function analyzerShow() {
    analyzerPanel.style.right = "8px";
    analyzerPanel.style.opacity = 1;
}

function showElement(elements) {
    if (Array.isArray(elements) === false) {
        elements = [elements];
    }
    elements.forEach(element => {
        element.style.opacity = 1;
    });
}

function hideElement(elements) {
    if (Array.isArray(elements) === false) {
        elements = [elements];
    }
    elements.forEach(element => {
        element.style.opacity = 0;
    });
}

function dataURLtoBlob(dataURL) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function extractFileNameFromDataURL(dataURL) {
    const matches = dataURL.match(/^data:[^;]+;filename=([^;]+)/);
    if (matches) {
        return matches[1];
    }
    return null;
}

function initializeSetting() {
    document.getElementById('apikey').value = saved.apiKey;
    document.getElementById('enableaudiovisualizer').checked = saved.enableAudioVisualizer;
    document.getElementById('enableaudiovisualizer').dispatchEvent(new Event('change'));
    document.getElementById('Accentcustom').checked = saved.enableCustomColor;
    if (document.getElementById('Accentcustom').checked) {
        optionShow(document.getElementById('rgbpalette'));
    } else {
        optionHide(document.getElementById('rgbpalette'));
    }
    const colorSlidersProperties = ['0', '1', '2'];
    colorSlidersProperties.forEach((property, index) => {
        const sliders = document.querySelectorAll('.colorsliders');
        const outputs = document.querySelectorAll('.colorslidersoutputs');
        sliders[index].value = outputs[index].value = saved.customColor[property];
    });
    document.getElementById('enablebackground').checked = saved.enableBackground;
    document.getElementById('backgroundnormalizebrightness').checked = saved.background.normalizeBrightness;
    const backgroundSlidersProperties = ['opacity', 'blur', 'contrast'];
    backgroundSlidersProperties.forEach((property, index) => {
        const sliders = document.querySelectorAll('.backgroundsliders');
        const outputs = document.querySelectorAll('.backgroundslidersoutputs');
        sliders[index].value = outputs[index].value = saved.background[property];
    });
    if (saved.customImage !== null) {
        customImage.src = saved.customImage;
        document.getElementById('custompanelbgfilename').innerHTML = extractFileNameFromDataURL(saved.customImage);
        document.getElementById('wrap').style.opacity = 1;
    }
    document.getElementById('enablehideinterface').checked = saved.enableHideInterface;
    document.getElementById('enablehideinterface').dispatchEvent(new Event('change'));
    document.getElementById('enablenotifybpmchanges').checked = saved.enableNotifyBpmChanges;
    document.getElementById('enablehpbar').checked = saved.enableHpBar;
    document.getElementById('enablekeyoverlay').checked = saved.enableKeyOverlay;
    document.getElementById('enablekeyoverlay').dispatchEvent(new Event('change'));
    document.getElementById('keyhidegameui').checked = saved.key.hideGameUI;
    document.getElementById('keyall').checked = saved.key.all;
    document.getElementById('keyinvert').checked = saved.key.invert;
    document.getElementById('keymerge').checked = saved.key.merge;
    const keySlidersProperties = ['offsetX', 'offsetY', 'rotate', 'size', 'thickness', 'margin'];
    keySlidersProperties.forEach((property, index) => {
        const sliders = document.querySelectorAll('.keysliders');
        const outputs = document.querySelectorAll('.keyslidersoutputs');
        sliders[index].value = outputs[index].value = saved.key[property];
    });
    const timingSlidersProperties = ['offsetX', 'offsetY', 'rotate', 'size', 'speed'];
    timingSlidersProperties.forEach((property, index) => {
        const sliders = document.querySelectorAll('.timingsliders');
        const outputs = document.querySelectorAll('.timingslidersoutputs');
        sliders[index].value = outputs[index].value = saved.timing[property];
    });
    document.getElementById('enabletimingbar').checked = saved.enableTimingBar;
    document.getElementById('timinghidegameui').checked = saved.timing.hideGameUI;
    document.getElementById('timingmoving').checked = saved.timing.moving;
    document.getElementById('timingnormalize').checked = saved.timing.normalize;
    document.getElementById('urposition1').checked = (saved.timing.urPosition === 'top');
    document.getElementById('urposition2').checked = (saved.timing.urPosition === 'bottom');
}

document.addEventListener('DOMContentLoaded', function() {
    checkUpdate();
    getLocalAll()
    .then(saved => {
        initializeSetting();
        if (saved.warning === true) {
            document.getElementById('startup').style.visibility = "visible";
            document.getElementById('startup').style.opacity = 1;
        }
    })
    .catch(error => {
        console.error('Error in getLocalAll:', error);
    });
    backgroundRefresh();
    hideGameUIRefresh();
    drawTriangles();
});

document.getElementById('Dontshow').addEventListener('change', function(event) {
    if (this.checked) {
        saved.warning = false;
        setLocal('warning', saved.warning);
    } else {
        saved.warning = true;
        setLocal('warning', saved.warning);
    }
});

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const inputText = document.getElementById('apikey').value;
        saved.apiKey = inputText;
        setLocal('apiKey', saved.apiKey);
        reloadUserData();
    }
}

document.getElementById('custompanelbg').addEventListener("change", function(event) {
    const file = document.getElementById('custompanelbg').files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const dataURL = event.target.result;
        const base64Data = dataURL.split(",")[1];
        const dataURLwithFilename = `data:${file.type};filename=${file.name};base64,${base64Data}`;
        const result = setImageToLocal('customImage', dataURLwithFilename);
        document.getElementById('wrap').style.opacity = 1;
        if (result === true) {
            document.getElementById('custompanelbgfilename').style.color = "#fff";
            document.getElementById('custompanelbgfilename').innerHTML = file.name;
            saved.customImage = dataURLwithFilename;
            customImage.src = saved.customImage;
        } else {
            document.getElementById('custompanelbgfilename').style.color = "#ff5555";
            document.getElementById('custompanelbgfilename').innerHTML = "File size is too large.";
        }
      };
      reader.readAsDataURL(file);
    }
  });

document.getElementById('custompanelbgreset').addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('wrap').style.opacity = 0;
    document.getElementById('custompanelbgfilename').innerHTML = '';
    document.getElementById('custompanelbg').value = '';
    customImage.removeAttribute("src");
    saved.customImage = null;
    setLocal('customImage', saved.customImage);
    fade(panelBackground, resizeImage(panelImage, panelBackground.width, panelBackground.height), 500);
});


document.getElementById('continue').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('startup').style.opacity = 0;
    setTimeout(() => {
        document.getElementById('startup').style.visibility = "hidden";
        saved.startup = false;
    }, 250)
});

document.addEventListener("mousedown", function(event) {
    if (!event.target.closest("#setting") && !event.target.closest("#profiledetail") && !event.target.closest("#profilewrapper") && document.getElementById('startup').style.opacity == 0) {
      if (settingVisible === true) {
        settingHide();
      } else {
        settingShow();
      }
    }
    if (event.target.closest("#profilewrapper") && cache.rawStatus !== 2 && document.getElementById('startup').style.opacity == 0) {
        if (document.getElementById('profiledetail').style.height === '305px') {
            document.getElementById('profiledetail').style.height = '100px';
            document.getElementById('profiledetail').style.borderRadius = '20px 15px 15px 50px';
        } else {
            document.getElementById('profiledetail').style.height = '305px';
            document.getElementById('profiledetail').style.borderRadius = '20px 20px 20px 20px';
        }
    }
    if (event.target.closest("#reset")) {
        Object.keys(cacheUserData).forEach(key => {
            if (saved.cacheUserData.hasOwnProperty(key)) {
                saved.cacheUserData[key] = cacheUserData[key];
            }
        });
        setLocal('cacheUserData', saved.cacheUserData);
        reloadUserData();
    }
});

document.querySelectorAll('.optionbutton').forEach((button, index) => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const options = document.querySelectorAll('.option');
      const option = options[index];
      const open = "";
      const close = "";
      if (button.innerHTML == open) {
        button.innerHTML = close;
        optionHide(option);
      } else if (button.innerHTML == close) {
        button.innerHTML = open;
        optionShow(option);
      }
    });
  });
  
document.querySelectorAll('input[name="accentColor"]').forEach((radio) => {
  radio.addEventListener('change', function() {
    if (this.value === 'custom') {
        saved.enableCustomColor = true;
        setLocal('enableCustomColor', saved.enableCustomColor);
        optionShow(document.getElementById('rgbpalette'));
        cache.background.fullPath = null;
    } else {
        saved.enableCustomColor = false;
        setLocal('enableCustomColor', saved.enableCustomColor);
        optionHide(document.getElementById('rgbpalette'));
        cache.background.fullPath = null;
    }
  });
});

document.querySelectorAll('.colorsliders').forEach(slider => {
    slider.addEventListener('input', function() {
        const outputs = document.querySelectorAll('.colorslidersoutputs');
        let output;
        if (this.id === 'Rslider') {
            output = outputs[0];
            saved.customColor[0] = parseInt(this.value);
            accentColor[0] = parseInt(this.value);
        } else if (this.id === 'Gslider') {
            output = outputs[1];
            saved.customColor[1] = parseInt(this.value);
            accentColor[1] = parseInt(this.value);
        } else if (this.id === 'Bslider') {
            output = outputs[2];
            saved.customColor[2] = parseInt(this.value);
            accentColor[2] = parseInt(this.value);
        }
        document.documentElement.style.setProperty('--accentcolor', `rgb(${saved.customColor[0]}, ${saved.customColor[1]}, ${saved.customColor[2]})`);
        document.documentElement.style.setProperty('--accentcolorhalf', `rgba(${saved.customColor[0]}, ${saved.customColor[1]}, ${saved.customColor[2]}, 0.5)`);
        output.textContent = this.value;
        setLocal('customColor', saved.customColor);
    });
});

document.getElementById('backgroundnormalizebrightness').addEventListener('change', function(event) {
    if (this.checked) {
        saved.background.normalizeBrightness = true;
        setLocal('background', saved.background);
        backgroundRefresh();
    } else {
        saved.background.normalizeBrightness = false;
        setLocal('background', saved.background);
        backgroundRefresh();
    }
});

document.querySelectorAll('.backgroundsliders').forEach(slider => {
    slider.addEventListener('input', function() {
        const outputs = document.querySelectorAll('.backgroundslidersoutputs');
        let output;
        if (this.id === 'opacity') {
            output = outputs[0];
            saved.background.opacity = parseInt(this.value);
        } else if (this.id === 'blur') {
            output = outputs[1];
            saved.background.blur = parseFloat(this.value);
        } else if (this.id === 'contrast') {
            output = outputs[2];
            saved.background.contrast = parseFloat(this.value);
        }
        output.textContent = this.value;
        setLocal('background', saved.background);
        backgroundRefresh();
    });
});

document.getElementById('enabletimingbar').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableTimingBar = true;
        setLocal('enableTimingBar', saved.enableTimingBar);
        document.getElementById('timing').style.opacity = 1;
        drawTimingBar();
    } else {
        saved.enableTimingBar = false;
        setLocal('enableTimingBar', saved.enableTimingBar);
        document.getElementById('timing').style.opacity = 0;
    }
});

document.getElementById('timinghidegameui').addEventListener('change', function(event) {
    if (this.checked) {
        saved.timing.hideGameUI = true;
        setLocal('timing', saved.timing);
    } else {
        saved.timing.hideGameUI = false;
        setLocal('timing', saved.timing);
    }
    hideGameUIRefresh();
});

document.getElementById('timingmoving').addEventListener('change', function(event) {
    if (this.checked) {
        saved.timing.moving = true;
        setLocal('timing', saved.timing);
    } else {
        saved.timing.moving = false;
        setLocal('timing', saved.timing);
    }
});

document.getElementById('timingnormalize').addEventListener('change', function(event) {
    if (this.checked) {
        saved.timing.normalize = true;
        setLocal('timing', saved.timing);
    } else {
        saved.timing.normalize = false;
        setLocal('timing', saved.timing);
    }
});

document.querySelectorAll('.timingsliders').forEach(slider => {
    slider.addEventListener('input', function() {
        const outputs = document.querySelectorAll('.timingslidersoutputs');
        let output;
        if (this.id === 'timingX') {
            output = outputs[0];
            saved.timing.offsetX = parseInt(this.value);
        } else if (this.id === 'timingY') {
            output = outputs[1];
            saved.timing.offsetY = parseInt(this.value);
        } else if (this.id === 'timingrotate') {
            output = outputs[2];
            saved.timing.rotate = parseInt(this.value);
        } else if (this.id === 'timingsize') {
            output = outputs[3];
            saved.timing.size = parseFloat(this.value);
        } else if (this.id === 'timingspeed') {
            output = outputs[4];
            saved.timing.speed = parseFloat(this.value);
        }
        output.textContent = this.value;
        setLocal('timing', saved.timing);
    });
    slider.addEventListener('mousedown', function(event) {
        document.getElementById('timing').classList.add('dragging');
        document.getElementById('setting').style.backgroundColor = "rgba(10, 10, 10, 0.5)";
    });
});

window.addEventListener('mouseup', function(event) {
    document.getElementById('timing').classList.remove('dragging');
    document.getElementById('keyoverlay').classList.remove('dragging');
    document.getElementById('setting').style.backgroundColor = "rgba(10, 10, 10, 0.95)";
});

document.getElementById('enableaudiovisualizer').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableAudioVisualizer = true;
        setLocal('enableAudioVisualizer', saved.enableAudioVisualizer);
        document.getElementById('visualizer').style.opacity = 1;
        audioVisualizer.renderVisualizer();
    } else {
        saved.enableAudioVisualizer = false;
        setLocal('enableAudioVisualizer', saved.enableAudioVisualizer);
        document.getElementById('visualizer').style.opacity = 0;
    }
});

document.getElementById('enablebackground').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableBackground = true;
        setLocal('enableBackground', saved.enableBackground);
        document.getElementById('backgroundwrapper').style.opacity = 1;
    } else {
        saved.enableBackground = false;
        setLocal('enableBackground', saved.enableBackground);
        document.getElementById('backgroundwrapper').style.opacity = 0;
    }
});

document.getElementById('enablehideinterface').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableHideInterface = true;
        setLocal('enableHideInterface', saved.enableHideInterface);
        if (tokenValue.rawStatus === 5) {
            interfaceHide();
            background.classList = dimClass;
        }
    } else {
        saved.enableHideInterface = false;
        setLocal('enableHideInterface', saved.enableHideInterface);
        interfaceShow();
        if (tokenValue.rawStatus === 5) {
            background.classList = dimClass;
        }
    }
});

document.getElementById('enablenotifybpmchanges').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableNotifyBpmChanges = true;
        setLocal('enableNotifyBpmChanges', saved.enableNotifyBpmChanges);
    } else {
        saved.enableNotifyBpmChanges = false;
        setLocal('enableNotifyBpmChanges', saved.enableNotifyBpmChanges);
    }
});

document.getElementById('enablehpbar').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableHpBar = true;
        setLocal('enableHpBar', saved.enableHpBar);
    } else {
        saved.enableHpBar = false;
        setLocal('enableHpBar', saved.enableHpBar);
        document.documentElement.style.setProperty('--playerhp', "0%");
    }
});

document.getElementById('enablekeyoverlay').addEventListener('change', function(event) {
    if (this.checked) {
        saved.enableKeyOverlay = true;
        setLocal('enableKeyOverlay', saved.enableKeyOverlay);
        document.getElementById('key').style.opacity = 1;
        drawKeyOverlay();
    } else {
        saved.enableKeyOverlay = false;
        setLocal('enableKeyOverlay', saved.enableKeyOverlay);
        document.getElementById('key').style.opacity = 0;
    }
});

document.getElementById('keyhidegameui').addEventListener('change', function(event) {
    if (this.checked) {
        saved.key.hideGameUI = true;
        setLocal('key', saved.key);
    } else {
        saved.key.hideGameUI = false;
        setLocal('key', saved.key);
    }
    hideGameUIRefresh();
});

document.getElementById('keyall').addEventListener('change', function(event) {
    if (this.checked) {
        saved.key.all = true;
        setLocal('key', saved.key);
    } else {
        saved.key.all = false;
        setLocal('key', saved.key);
    }
});

document.getElementById('keyinvert').addEventListener('change', function(event) {
    if (this.checked) {
        saved.key.invert = true;
        setLocal('key', saved.key);
    } else {
        saved.key.invert = false;
        setLocal('key', saved.key);
    }
});

document.getElementById('keymerge').addEventListener('change', function(event) {
    if (this.checked) {
        saved.key.merge = true;
        setLocal('key', saved.key);
    } else {
        saved.key.merge = false;
        setLocal('key', saved.key);
    }
});

document.querySelectorAll('.keysliders').forEach(slider => {
    slider.addEventListener('input', function() {
        const outputs = document.querySelectorAll('.keyslidersoutputs');
        let output;
        if (this.id === 'keyX') {
            output = outputs[0];
            saved.key.offsetX = parseInt(this.value);
        } else if (this.id === 'keyY') {
            output = outputs[1];
            saved.key.offsetY = parseInt(this.value);
        } else if (this.id === 'keyrotate') {
            output = outputs[2];
            saved.key.rotate = parseInt(this.value);
        } else if (this.id === 'keysize') {
            output = outputs[3];
            saved.key.size = parseInt(this.value);
        } else if (this.id === 'keythickness') {
            output = outputs[4];
            saved.key.thickness = parseInt(this.value);
        } else if (this.id === 'keymargin') {
            output = outputs[5];
            saved.key.margin = parseInt(this.value);
        }
        output.textContent = this.value;
        setLocal('key', saved.key);
    });
    slider.addEventListener('mousedown', function(event) {
        document.getElementById('keyoverlay').classList.add('dragging');
        document.getElementById('setting').style.backgroundColor = "rgba(10, 10, 10, 0.5)";
    });
});

document.querySelectorAll('input[name="urposition"]').forEach((radio) => {
    radio.addEventListener('change', function() {
      if (this.value === 'top') {
        saved.timing.urPosition = 'top';
      } else if (this.value === 'bottom') {
        saved.timing.urPosition = 'bottom';
      }
      setLocal('timing', saved.timing);
    });
  });

function addCommasToNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

function adjustFontSize(defalutsize) {
    const score = document.getElementById('score');
    while (score.clientWidth < score.scrollWidth && defalutsize > 0) {
        defalutsize -= 0.01;
        document.documentElement.style.setProperty('--scoresize', `${defalutsize}rem`);
    }
}