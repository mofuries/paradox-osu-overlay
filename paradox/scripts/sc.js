const sc = new WebSocket(`ws://${hostname}:${port}/tokens?LiveTokens&updatesPerSecond=20`);

sc.onopen = () => {
  console.log("Successfully Connected")
  sc.send(JSON.stringify(requestList));
};

sc.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};

sc.onerror = (error) => {
  console.log("Socket Error: ", error);
};

let place = {
  overlay: `http://${hostname}:${port}/overlays/paradox`,
  beatmap: `http://${hostname}:${port}/Songs`,
  skin: `http://${hostname}:${port}/Skins/`
};

sc.onmessage = (event) => {

      try {

/*receive*/ Object.assign(tokenValue, JSON.parse(event.data));
            Object.assign(tokenValue, JSON.parse(tokenValue.keyOverlay));
            tokenValue.audio.fullPath = encodeURIComponent(`${tokenValue.dir}/${tokenValue.mp3Name}`);
            tokenValue.background.fullPath = encodeURIComponent(`${tokenValue.dir}/${tokenValue.backgroundImageFileName}`);
            place.skin = `http://${hostname}:${port}/Skins/${tokenValue.skin}`;

            let tokenList = '';
            for (const key in tokenValue) {
              if (tokenValue.hasOwnProperty(key)) {
                tokenList += `${key}: ${tokenValue[key]}<br>`;
              }
            }

/*time*/    cache.time = tokenValue.time;
            adjustedTime = Math.max((cache.time + 0.1).toFixed(2),0);
            timeDifference = (Math.abs(getCurrentTime() - adjustedTime)).toFixed(2);
            
            if (cache.rawStatus !== tokenValue.rawStatus) {
              if (tokenValue.rawStatus !== 2) {
                background.classList = dimClass;
                hideElement([visualizer, mods, gameOverlay, grade, pp, document.getElementById('progress'), document.getElementById('uihide')]);         
              }

              if (tokenValue.rawStatus !== 2 && tokenValue.rawStatus !== 7) { //!playing !result
                if (saved.enableHideInterface === true || tokenValue.rawStatus === 1) { //editing || uihide
                  interfaceHide();
                } else {
                  interfaceShow();
                }
                setTimeout(() => {
                  reloadUserData();
                }, 100);
              }

              if (tokenValue.rawStatus === 7) { //result
                setTimeout(() => {
                  reloadUserData(tokenValue.username);
                  if (saved.apiKey !== null && saved.apiKey !== '') {
                    interfaceShow();
                  }
                }, 100);
              }

              if (tokenValue.rawStatus === 2) { //playing || watching
                settingHide();
                interfaceShow();
                panelImage.src = currentBG.src;
                profileDetail.style.height = '100px';
                background.classList = "";
                showElement([visualizer, mods, gameOverlay, grade, pp, document.getElementById('progress'), document.getElementById('uihide')]);
                hideElement([avatar, document.getElementById('paddingleft'), document.getElementById('paddingright')]);
                if (keyOverlayRunning === false) {
                  drawKeyOverlay();
                }
                if (timingBarRunning === false) {
                  drawTimingBar();
                }
                setTimeout(() => {
                  cache.rawStatus = tokenValue.rawStatus;
                  document.documentElement.style.setProperty('--scoresize', '0.75rem');
                  showElement([document.getElementById('paddingleft'), document.getElementById('paddingright')]);
                  mods.style.right = box1.scrollWidth + 20 + 'px';
                  unstableRate.innerHTML = `${tokenValue.convertedUnstableRate.toFixed(2)}`;
                  item1.innerHTML = `<span id="score">${addCommasToNumber(tokenValue.score)}</span>`;
                  item2.innerHTML = "";
                  item3.innerHTML = `<span id="acc">${tokenValue.acc.toFixed(2)}<span class="colored margin">%</span></span>`;
                  item4.innerHTML = `<span id="pp">${addCommasToNumber(Math.round(tokenValue.ppIfMapEndsNow))}<span class="colored margin">pp</span></span>`;
                  box1.innerHTML = `<span class="green">100:&nbsp;&nbsp;</span>${tokenValue.c100}`;
                  box2.innerHTML = `<span class="skyblue">50:&nbsp;&nbsp;</span>${tokenValue.c50}`;
                  box3.innerHTML = `<span class="yellow">SB:&nbsp;&nbsp;</span>${tokenValue.sliderBreaks}`;
                  box4.innerHTML = `<span class="red">miss:&nbsp;&nbsp;</span>${tokenValue.miss}`;
                  adjustFontSize(0.75);
                  isPlaying = true;
                }, 250);
              }
              cache.rawStatus = tokenValue.rawStatus;
            }

/*pp*/      if (isPlaying === true){
              mods.style.right = box1.scrollWidth + 20 + 'px';
              unstableRate.innerHTML = `${tokenValue.convertedUnstableRate.toFixed(2)}`;
              item1.innerHTML = `<span id="score">${addCommasToNumber(tokenValue.score)}</span>`;
              item2.innerHTML = "";
              item3.innerHTML = `<span id="acc">${tokenValue.acc.toFixed(2)}<span class="colored hilight margin">%</span></span>`;
              item4.innerHTML = `<span id="pp">${addCommasToNumber(Math.round(tokenValue.ppIfMapEndsNow))}<span class="colored hilight margin">pp</span></span>`;
              box1.innerHTML = `<span class="green">100:&nbsp;&nbsp;</span>${tokenValue.c100}`;
              box2.innerHTML = `<span class="skyblue">50:&nbsp;&nbsp;</span>${tokenValue.c50}`;
              box3.innerHTML = `<span class="yellow">SB:&nbsp;&nbsp;</span>${tokenValue.sliderBreaks}`;
              box4.innerHTML = `<span class="red">miss:&nbsp;&nbsp;</span>${tokenValue.miss}`;
              adjustFontSize(0.75);
              drawClock(clock, ctx_clock);
              if (cache.combo !== tokenValue.combo && cache.ingameInterfaceIsEnabled === 0) {
                cache.combo = tokenValue.combo;
                if (tokenValue.combo !== 0) {
                  combo.innerHTML = comboflash.innerHTML = tokenValue.combo + '<span class="colored margin nonwidth">x</span>';
                  combo.style.transition = "all 0s";
                  combo.style.fontSize = "1.5rem";
                  comboflash.style.transition = "all 0s";
                  comboflash.style.opacity = 0.3;
                  comboflash.style.fontSize = "2.2rem";
                  comboflash.style.margin = "0px 0px -5px -5px";
                  setTimeout(() => {
                    combo.style.transition = "all 1s cubic-bezier(0.16, 1, 0.3, 1)";
                    combo.style.fontSize = "1.3rem";
                    comboflash.style.transition = "all 1s cubic-bezier(0.16, 1, 0.3, 1)";
                    comboflash.style.opacity = 0.2;
                    comboflash.style.fontSize = "1.3rem";
                    comboflash.style.margin = "0px";
                  }, 10);
                } else {
                  combo.innerHTML = comboflash.innerHTML = '';
                }
              }
            }

/*bpm*/     if (cache.currentBpm !== tokenValue.currentBpm) {
              if (cache.currentBpm > tokenValue.currentBpm) {
                cache.currentBpm = tokenValue.currentBpm;
                Bpm.classList = "slotdown";
                setTimeout(() => {
                  Bpm.innerHTML = Math.round(cache.currentBpm);
                  setTimeout(() => {
                    Bpm.classList = "";
                  }, 250);
                }, 250);
              } else {
                cache.currentBpm = tokenValue.currentBpm;
                Bpm.classList = "slotup";
                setTimeout(() => {
                  Bpm.innerHTML = Math.round(cache.currentBpm);
                  setTimeout(() => {
                    Bpm.classList = "";
                  }, 250);
                }, 250);
              }
              currentBpm.innerHTML = Math.round(cache.currentBpm);
              if (tokenValue.currentBpm !== 0 && tokenValue.rawStatus === 2 && saved.enableNotifyBpmChanges) {
                currentBpm.style.transition = "all 0s";
                currentBpm.style.opacity = 0.15;
                setTimeout(() => {
                  currentBpm.style.transition = "all 3s cubic-bezier(0.16, 1, 0.3, 1)";
                  currentBpm.style.opacity = 0;
                }, 10);
              }
            }

/*grade*/   if (cache.grade !== tokenValue.grade) {
              if (tokenValue.rawStatus === 2) {
                cache.grade = tokenValue.grade;
                grade.style.opacity = 1;
                grade.src = gradeImgs[tokenValue.grade];
              } else {
                grade.style.opacity = 0;
              }
            }

            if (cache.ingameInterfaceIsEnabled !== tokenValue.ingameInterfaceIsEnabled) {
              cache.ingameInterfaceIsEnabled = tokenValue.ingameInterfaceIsEnabled;
              if (cache.ingameInterfaceIsEnabled === 0) {
                combo.style.opacity = 1;
              } else {
                combo.style.opacity = 0;
              }
            }

/*artist*/  if (cache.artistRoman !== tokenValue.artistRoman) {
              cache.artistRoman = tokenValue.artistRoman;
              artistcontainer.style.transition = "all 0.2s";
              artistcontainer.style.opacity = 0;
              setTimeout(() => {
                artist.innerHTML = cache.artistRoman;
                const artistwidth = artist.getBoundingClientRect().width;
                setTimeout(() => {
                  if (artistwidth > 520) {
                    artist.style.transition = "all 0.5s";
                    artistcontainer.style.opacity = 1;
                    artist.style.paddingLeft = "0px";
                    artist.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="artisticon"></span>&nbsp;&nbsp;' + cache.artistRoman + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="artisticon"></span>&nbsp;&nbsp;' + cache.artistRoman;
                    artist.style.animationDuration = artistwidth / 45 + "s";
                    artist.classList = "scroll";
                    artistcontainer.classList = "fadescroll";
                  } else {
                    artistcontainer.style.transition = "all 0s";
                    artistcontainer.style.transform = "translateX(-100%)";
                    artist.style.paddingLeft = "16px";
                    artist.classList = "";
                    artistcontainer.classList = "";
                    setTimeout(() => {
                      artistcontainer.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                      artistcontainer.style.opacity = 1;
                      artistcontainer.style.transform = "translateX(0%)";
                    },10);
                  }
                },20);
              },200);
            }

/*title*/   if (cache.titleRoman !== tokenValue.titleRoman) {
              cache.titleRoman = tokenValue.titleRoman;
              titlecontainer.style.transition = "all 0.2s";
              titlecontainer.style.opacity = 0;
              setTimeout(() => {
                title.innerHTML = cache.titleRoman;
                const titlewidth = title.getBoundingClientRect().width;
                setTimeout(() => {
                  if (titlewidth > 520) {
                    titlecontainer.style.transition = "all 0.5s";
                    titlecontainer.style.opacity = 1;
                    title.style.paddingLeft = "0px";
                    title.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="titleicon"></span>&nbsp;&nbsp;' + cache.titleRoman + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="titleicon"></span>&nbsp;&nbsp;' + cache.titleRoman;
                    title.style.animationDuration = titlewidth / 45 + "s";
                    title.classList = "scroll";
                    titlecontainer.classList = "fadescroll";
                  } else {
                    titlecontainer.style.transition = "all 0s";
                    titlecontainer.style.transform = "translateX(-100%)";
                    title.style.paddingLeft = "16px";
                    title.classList = "";
                    titlecontainer.classList = "";
                    setTimeout(() => {
                      titlecontainer.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                      titlecontainer.style.opacity = 1;
                      titlecontainer.style.transform = "translateX(0%)";
                    },10);
                  }
                },20);
              },200);
            }

/*diff*/    if (cache.diffName !== tokenValue.diffName || cache.creator !== tokenValue.creator) {
              cache.diffName = tokenValue.diffName;
              cache.creator = tokenValue.creator;
              formatTime = { minute: Math.floor(tokenValue.totaltime / 60000) , second: Math.floor(tokenValue.totaltime / 1000 % 60) };
              diffcontainer.style.transition = "all 0.2s";
              diffcontainer.style.opacity = 0;
              setTimeout(() => {
                difflavel.innerHTML = cache.diffName;
                totalTime.innerHTML = `(${formatTime.minute < 10 ? '0' : ''}${formatTime.minute}:${formatTime.second < 10 ? '0' : ''}${formatTime.second})`;
                mapper.innerHTML = `&nbsp;<div class="mapper"><span class="secondary-font">//</span>&nbsp;${cache.creator}`;
                difflavel.style.width = 'auto';
                diff.style.width = 'auto';
                diffcontainer.style.transition = "all 0s";
                diffcontainer.style.transform = "translateX(-100%)";
                const diffwidth = diff.getBoundingClientRect().width;
                const diffwidthlimit = 520 - mapperClass[0].getBoundingClientRect().width - 60;
                if (diffwidth > diffwidthlimit) {
                  const difflavelwidthlimit = diffwidthlimit - 30 - totalTime.getBoundingClientRect().width;
                  diff.style.width = diffwidthlimit + 'px';
                  difflavel.style.width = difflavelwidthlimit + 'px';
                  difflavel.classList = "faderight";
                } else {
                  difflavel.classList = "";
                }
                setTimeout(() => {
                  diffcontainer.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                  diffcontainer.style.opacity = 1;
                  diffcontainer.style.transform = "translateX(0%)";
                },30);

/*ranked*/      if (tokenValue.rankedStatus === 7) {
                  mapRank.innerHTML = "";
                  mapRank.style.color = "#ff81c5";
                } else if (tokenValue.rankedStatus === 4) {
                  mapRank.innerHTML = "";
                  mapRank.style.color = "#80e6ff";
                } else if (tokenValue.rankedStatus === 5) {
                  mapRank.innerHTML = "";
                  mapRank.style.color = "#ff5b15";
                } else if (tokenValue.rankedStatus === 6) {
                  mapRank.innerHTML = "";
                  mapRank.style.color = "#c0e71b";
                } else {
                  mapRank.innerHTML = "";
                  mapRank.style.color = "#929292";
                }
              },200);
            }

/*detail*/  if (cache.mCS !== tokenValue.mCS ||
                cache.mAR !== tokenValue.mAR ||
                cache.mOD !== tokenValue.mOD ||
                cache.mHP !== tokenValue.mHP ||
                cache.mStars !== tokenValue.mStars ||
                cache.mBpm !== tokenValue.mBpm) 
            {
              cache.mCS = tokenValue.mCS;
              cache.mAR = tokenValue.mAR;
              cache.mOD = tokenValue.mOD;
              cache.mHP = tokenValue.mHP;
              cache.mStars = tokenValue.mStars;
              cache.mBpm = tokenValue.mBpm;
              mapdetail.style.transition = "all 0.2s";
              mapdetail.style.opacity = 0;
              const details = ['cs', 'ar', 'od', 'hp', 'mCS', 'mAR', 'mOD', 'mHP'];
              setTimeout(() => {
                for (i = 0; i < details.length / 2; i++) {
                  const NomodValue = typeof tokenValue[details[i]] === 'string' ? parseInt((tokenValue[details[i]].match(/\d+/g) || []).join(""), 10) : tokenValue[details[i]];
                  const ModedValue = typeof tokenValue[details[i + 5]] === 'string' ? parseInt((tokenValue[details[i + 4]].match(/\d+/g) || []).join(""), 10) : tokenValue[details[i + 4]];

                    if (NomodValue > ModedValue) {
                      const element = document.getElementById(details[i]);
                      element.innerHTML = tokenValue[details[i + 4]] + '&nbsp;<span class="down"></span>';
                    } else if (NomodValue < ModedValue) {
                      const element = document.getElementById(details[i]);
                      element.innerHTML = tokenValue[details[i + 4]] + '&nbsp;<span class="up"></span>';
                    } else {
                      const element = document.getElementById(details[i]);
                      element.innerHTML = tokenValue[details[i + 4]];
                      element.style.color = "#ffffff";
                    }
                }
                const mStarsParts = tokenValue.mStars.toFixed(2).split(".");
                const mStarsInteger = mStarsParts[0];
                const mStarsDecimal = mStarsParts[1];
              
                SR.innerHTML = `${mStarsInteger}<span id="dot">.</span><span id="srdecimal">${mStarsDecimal}</span>`;
                mapdetail.style.transition = "all 0s";
                mapdetail.style.transform = "translateY(-100%)";
                
                setTimeout(() => {
                    mapdetail.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                    mapdetail.style.opacity = 1;
                    mapdetail.style.transform = "translateY(0%)";
                },30);

/*srcolor*/   if (tokenValue.mStars.toFixed(2) >= 10) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#222222");
                  document.documentElement.style.setProperty('--mtextcolor', "#f7d45c");
                } else if (tokenValue.mStars.toFixed(2) >= 9) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#361018");
                  document.documentElement.style.setProperty('--mtextcolor', "#f7d45c");
                } else if (tokenValue.mStars.toFixed(2) >= 8) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#181852");
                  document.documentElement.style.setProperty('--mtextcolor', "#f7d45c");
                } else if (tokenValue.mStars.toFixed(2) >= 7.5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#26257f");
                  document.documentElement.style.setProperty('--mtextcolor', "#f7d45c");
                } else if (tokenValue.mStars.toFixed(2) >= 7) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#312f9f");
                  document.documentElement.style.setProperty('--mtextcolor', "#f7d45c");
                } else if (tokenValue.mStars.toFixed(2) >= 6.5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#4942b3");
                  document.documentElement.style.setProperty('--mtextcolor', "#f7d45c");
                } else if (tokenValue.mStars.toFixed(2) >= 6) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#7d4ec2");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 5.5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#c351da");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#fb588e");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 4.5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#ff646c");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 4) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#fe9267");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 3.5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#fcb764");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 3) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#e4fa53");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 2.5) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#7cfa53");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 2) {
                  document.documentElement.style.setProperty('--mdiffcolor', "#3fd6af");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else if (tokenValue.mStars.toFixed(2) >= 1){
                  document.documentElement.style.setProperty('--mdiffcolor', "#4fd0f5");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                } else {
                  document.documentElement.style.setProperty('--mdiffcolor', "#469efc");
                  document.documentElement.style.setProperty('--mtextcolor', "#ffffff");
                }
                starRating.style.width = `${sr.scrollWidth + srdecimal.scrollWidth + 45}px`;
                starRatingGradient.style.width = starRating.style.width;
                mods.style.right = `${sr.scrollWidth + srdecimal.scrollWidth + 100}px`;
              },200);
            }

/*mods*/    if (cache.mods !== tokenValue.mods){
              cache.mods = tokenValue.mods;
              mods.innerHTML = '';
              let modsApplied = cache.mods.split(',');
              cache.modsArray = modsApplied;

              if (!modsApplied[0]) {
                modsApplied.push("NM");
              }
            
              if (modsApplied.length === 1) {
                if (modsApplied.includes("AU") || modsApplied.includes("AT") || modsApplied.includes("AutoPlay") || modsApplied.includes("SV2") || modsApplied.includes("Score V2")) {
                  modsApplied.push("NM");
                }
              }

              modsApplied = modsApplied.filter(name => name !== '');
              modsApplied.forEach(name => {
                let modImg = document.createElement('img');
                modImg.setAttribute('src', modsImgs[name]);
                mods.appendChild(modImg);
                
              });
              const modImages = Array.from(document.querySelectorAll('#mods img'));
              for (let i = 0; i < modImages.length; i++) {
                modImages[i].style.zIndex = -i;
              }
            }

/*avatar*/  if (cache.banchoId !== tokenValue.banchoId) {
              cache.banchoId = tokenValue.banchoId;
            }

            if (cache.skin !== tokenValue.skin) {
              cache.skin = tokenValue.skin;
              skinBG.src = `${place.skin}/${encodeURIComponent('menu-background.jpg')}`;
            }

            if (cache.osuIsRunning !== tokenValue.osuIsRunning) {
              cache.osuIsRunning = tokenValue.osuIsRunning;
              if (tokenValue.osuIsRunning === 0) {
                interfaceHide();
              }
            }

/*audio*/   if (cache.audio.fullPath !== tokenValue.audio.fullPath) {
              audiostatus.style.opacity = 0;
              playingCount = 0;
              cache.audio.fullPath = tokenValue.audio.fullPath;
              const audioURL = `${place.beatmap}/${tokenValue.audio.fullPath}?a=${Math.random(10000)}`;
              fetchAudio(audioURL)
                .then(() => {
                  playAudio();
                  handleAudioError();
                })
                .catch(error => {
                  handleAudioError("error");
                });
            }

/*bg*/      if (cache.background.fullPath !== tokenValue.background.fullPath && backgroundReady === true) {
              backgroundReady = false;
              cache.background.fullPath = tokenValue.background.fullPath;
              currentBG.src = `${place.beatmap}/${tokenValue.background.fullPath}?a=${Math.random(10000)}`;
            }
      } catch (err) { console.log(err); };
};

currentBG.onload = () => {

  if (loadingBGcount === 1 && currentBG.src === `${place.overlay}/assets/loading.png`) {
    if (skinBG.naturalWidth !== 0) {
      currentBG.src = skinBG.src;
    } else {
      currentBG.src = "./assets/nobg.png";
    } 
  } else {
    averageColor = average(currentBG);

    if (saved.enableCustomColor === true) {
      colorFade(saved.customColor, 1000);
    } else {
      colorFade(averageColor, 1000);
    }
  
    const shadedCanvas = coordinate(resizeImage(currentBG, background.width, background.height), 1 - (saved.background.contrast));
    shader.applyShaderToCanvas(shadedCanvas, saved.background.blur, saved.background.blur, 0, true);

    const shadedBannerCanvas = resizeImage(currentBG, banner.width, banner.height);
    shader.applyShaderToCanvas(shadedBannerCanvas, 1, 5);

    fade(background, shadedCanvas, 1000, true);
    fade(banner, shadedBannerCanvas, 1000);
    fade(artwork, resizeImage(currentBG, artwork.width, artwork.height), 1000).then(() => {
      if (currentBG.src === `${place.overlay}/assets/loading.png` && loadingBGcount !== 1) {
        loadingBGcount++;
        cache.background.fullPath = null;
      } else if (firstLoad) {
        firstLoad = false;
        loadingBGcount = 0;
        cache.background.fullPath = null;
      } else {
        loadingBGcount = 0;
      }
      backgroundReady = true;
      });
    }
  };

currentBG.onerror = () => {
  currentBG.src = "./assets/loading.png";
};

panelImage.onload = () => {
  fade(avatar, resizeImage(panelImage, avatar.width, avatar.height), 500);
  if (!customImage.src) {
    fade(panelBackground, resizeImage(panelImage, panelBackground.width, panelBackground.height), 500);
  }
};

panelImage.onerror = () => {
  panelImage.src = currentBG.src;
};

customImage.onload = () => {
  fade(panelBackground, resizeImage(customImage, panelBackground.width, panelBackground.height), 500);
}

audiostatus.addEventListener('animationend', () => {
  audiostatus.classList = "";
})

function handleAudioError(status) {
  if (status === "error") {
    audioReadError = true;
    audioError.classList = "popuperror";
    audioError.style.opacity = 1;
  } else {
    audioReadError = false;
    audioError.classList = "";
    audioError.style.opacity = 0;
  }
}

function drawClock(canvas, ctx) {
  ctx.reset();
  const progress = (tokenValue.time / tokenValue.totaltime * 100000).toFixed(2);
  const center = canvas.width / 2;
  const startAngle = -Math.PI / 2;
  const currentTimeAngle = (3.6 * progress) * Math.PI / 180;
  ctx.beginPath();
  ctx.arc(center, center, center, startAngle, startAngle + currentTimeAngle);
  ctx.lineTo(center, center);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

const audioControl = setInterval(() => {

  if (audioReadError === false && saved.enableAudioCapture === true) {
    if (cache.rawStatus === 2){
      if (cache.modsArray.includes("DT") || cache.modsArray.includes("NC") || cache.modsArray.includes("Double Time") || cache.modsArray.includes("Nightcore")) {
        changePlaybackRateAudio(1.5);
        modSpeed = 1.5;
      } else if (cache.modsArray.includes("HT") || cache.modsArray.includes("Half Time")) {
        changePlaybackRateAudio(0.75);
        modSpeed = 0.75;
      }
    } else {
      changePlaybackRateAudio(1.0);
    }
  
    if (timeDifference >= 0.1 && sourceNode && audioPlaying && cache.rawStatus !== 7) {
      if (adjustedTime > 0) {
        seekAudio(adjustedTime);
        playAudio();
      } else {
        pauseAudio();
      }
    }
  
    if (prevTime !== null) {
      if (adjustedTime === prevTime) {
        consecutiveCount++;
        playingCount = 0;
      } else {
        playingCount++;
        consecutiveCount = 0;
      }
  
      if (consecutiveCount >= 1 && sourceNode && audioPlaying && cache.rawStatus !== 7) {
        pauseAudio();
        consecutiveCount = 0;
        audioError.style.opacity = 0;
        audiostatus.innerHTML = "";
        audiostatus.classList = "popup";
        audiostatus.style.opacity = 1;
        artworkDim.style.opacity = 1;
      }
  
      if (playingCount >= 1 && audioPlaying === false) {
        seekAudio(adjustedTime);
        playAudio();
        playingCount = 0;
        audioError.style.opacity = 0;
        audiostatus.innerHTML = "";
        audiostatus.classList = "popupfade";
        audiostatus.style.opacity = 0;
        artworkDim.style.opacity = 0;
      }
    }
    prevTime = adjustedTime;
  } else {
    stopAudio();
  }
}, 200);