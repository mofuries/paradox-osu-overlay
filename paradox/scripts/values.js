const version = "v1.1.1";
const channel = "";
let isLatest;

let saved = {
    apiKey: null,
    warning: true,
    enableAudioVisualizer: true,
    enableCustomColor: false,
    customColor: [100, 100, 100],
    enableBackground: true,
    background: {
      normalizeBrightness: true,
      opacity: 30,
      blur: 10.0,
      contrast: 0.7
    },
    customImage: null,
    enableHideInterface: false,
    enableNotifyBpmChanges: true,
    enableKeyOverlay: true,
    enableTimingBar: true,
    key: {
      hideGameUI: false,
      all: false,
      invert: false,
      merge: false,
      offsetX: 740,
      offsetY: 53,
      rotate: 0,
      size: 300,
      thickness: 60,
      margin: 6
    },
    timing: {
      hideGameUI: true,
      moving: true,
      normalize: false,
      urPosition: 'top',
      offsetX: 0,
      offsetY: 490,
      rotate: 0,
      size: 1.5,
      speed: 1
    },
    cacheUserData: {
      pp_raw: 0,
      ranked_score: 0,
      pp_rank: 0,
      pp_country_rank: 0,
      level: 0,
      accuracy: 0,
      playcount: 0,
      total_seconds_played: 0
    },
    enableHpBar: true,
    enableUnstableRate: false
};

const url = new URL(window.location.href);
const hostname = url.hostname;
const port = url.port;

let settingVisible = false;
let averageColor = [255, 255, 255];
let accentColor = [255, 255, 255];
let backgroundLuminanceFactor;
let maxrgb;
let rgbtest;
let dimClass = "transparent";

const consolevalue = document.getElementById('consolevalue');

const mapPanel = document.getElementById('mapwrapper');
const artworkDim = document.getElementById('artworkdim');
const audiostatus = document.getElementById('audiostatus');
const artistcontainer = document.getElementById('artistcontainer');
const artist = document.getElementById('artist');
const titlecontainer = document.getElementById('titlecontainer');
const title = document.getElementById('title');
const diffcontainer = document.getElementById('diffcontainer');
const gamemode = document.getElementById('gamemode');
const difflavel = document.getElementById('difflavel');
const totalTime = document.getElementById('totaltime');
const diff = document.getElementById('diff');
const mapRank = document.getElementById('mapRank');
const mapperClass = document.getElementsByClassName('mapper');
const mapper = document.getElementById('mapper');

const mapdetailPanel = document.getElementById('mapdetailcontainer');
const mapdetail = document.getElementById('mapdetail');
const starRating = document.getElementById('starrating');
const SR = document.getElementById('sr');
const SRdecimal = document.getElementById('srdecimal');
const starRatingGradient = document.getElementById('starratinggradient');
const CS = document.getElementById('cs');
const AR = document.getElementById('ar');
const OD = document.getElementById('od');
const HP = document.getElementById('hp');

const analyzerPanel = document.getElementById('analyzer');
const item1 = document.getElementById('item1');
const item2 = document.getElementById('item2');
const item3 = document.getElementById('item3');
const item4 = document.getElementById('item4');
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');
const box3 = document.getElementById('box3');
const box4 = document.getElementById('box4');
const mods = document.getElementById('mods');
const grade = document.getElementById('grade');
const score = document.getElementById('score');
const pp = document.getElementById('ppcontainer');
const profileDetail = document.getElementById('profiledetail');

const gameOverlay = document.getElementById('gameoverlay');
const Bpm = document.getElementById('bpm');
const currentBpm = document.getElementById('currentbpm');
const unstableRate = document.getElementById('ur');
const combo = document.getElementById('combo');
const comboflash = document.getElementById('comboflash');
const audioError = document.getElementById('audioerror');

const audioElement = document.getElementById('audio');

const currentBG = new Image();
const panelImage = new Image();
const customImage = new Image();
const skinBG = new Image();

const virtual = document.createElement('canvas');
const ctx_virtual = virtual.getContext('2d', {willReadFrequently: true});
const visualizer = document.getElementById('visualizer');
const background = document.getElementById('background');
const ctx_background = background.getContext('2d');
const artwork = document.getElementById('artwork');
const ctx_art = artwork.getContext('2d');
const banner = document.getElementById('banner');
const ctx_banner = banner.getContext('2d');
const panelBackground = document.getElementById('panelbackground');
const ctx_panel = panelBackground.getContext('2d');
const avatar = document.getElementById('avatar');
const clock = document.getElementById('clock');
const ctx_clock = clock.getContext('2d');

virtual.width = 10;
virtual.height = 10;

const modsImgs = {
  '': './assets/nomod.png',
  'None': './assets/nomod.png',
  'Nomod': './assets/nomod.png',
  'NM': './assets/nomod.png',
  'EZ': './assets/easy.png',
  'Easy': './assets/easy.png',
  'NF': './assets/nofail.png',
  'No Fail': './assets/nofail.png',
  'HT': './assets/halftime.png',
  'Half Time': './assets/halftime.png',
  'HR': './assets/hardrock.png',
  'Hard Rock': './assets/hardrock.png',
  'SD': './assets/suddendeath.png',
  'Sudden Death': './assets/suddendeath.png',
  'PF': './assets/perfect.png',
  'Perfect': './assets/perfect.png',
  'DT': './assets/doubletime.png',
  'Double Time': './assets/doubletime.png',
  'NC': './assets/nightcore.png',
  'Nightcore': './assets/nightcore.png',
  'HD': './assets/hidden.png',
  'Hidden': './assets/hidden.png',
  'FL': './assets/flashlight.png',
  'Flashlight': './assets/flashlight.png',
  'RX': './assets/relax.png',
  'Relax': './assets/relax.png',
  'AP': './assets/autopilot.png',
  'AutoPilot': './assets/autopilot.png',
  'SO': './assets/spunout.png',
  'Spun Out': './assets/spunout.png',
  'AU': './assets/autoplay.png',
  'AT': './assets/autoplay.png',
  'AutoPlay': './assets/autoplay.png',
  'CN': './assets/none.png',
  'Cinema': './assets/none.png',
  'SV2': './assets/v2.png',
  'V2': './assets/v2.png',
  'Score V2': './assets/v2.png'
};
    
const gradeImgs = {
  '0': './assets/SSH.svg',
  '1': './assets/SH.svg',
  '2': './assets/SS.svg',
  '3': './assets/S.svg',
  '4': './assets/A.svg',
  '5': './assets/B.svg',
  '6': './assets/C.svg',
  '7': './assets/D.svg',
  '8': './assets/none.png',
  '9': './assets/none.png',
  'XH': './assets/SSH.svg',
  'X': './assets/SH.svg',
  'SH': './assets/SS.svg',
  'S': './assets/S.svg',
  'A': './assets/A.svg',
  'B': './assets/B.svg',
  'C': './assets/C.svg',
  'D': './assets/D.svg',
  'E': './assets/none.png',
  'F': './assets/none.png',
};

let prevTime = null;
let adjustedTime = null;
let timeDifference = null;
let consecutiveCount = 0;
let playingCount = 0;

let loadingBGcount = 0;
let modSpeed = 1;
let keyOverlayRunning = false;
let timingBarRunning = false;
let audioReadError = false;
let backgroundReady = true;
let firstLoad = true;
let isPlaying = false;
let validUserdata = false;

let tokenValue = {
  hitErrors: [],
  audio: {
    fullPath: ''
  },
  background: {
    fullPath: ''
  }
};

let cacheUserData = {
  username: '',
  user_id: '',
  ranked_score: '',
  pp_rank: '',
  pp_raw: '',
  accuracy: '',
  country: '',
  pp_country_rank: '',
  accuracy: '',
  playcount: '',
  join_date: '',
  level: '',
  total_seconds_played: ''
};

let cache = {
  audio: {
    fullPath: ''
  },
  background: {
    fullPath: ''
  },
  modsArray: null,
  username: '',  
  artistRoman: '',
  artistUnicode: '',
  titleRoman: '',
  titleUnicode: '',
  c100: '',
  c50: '',
  miss: '',
  sliderBreaks: '',
  score: '',
  acc: '',
  combo: '',
  ingameInterfaceIsEnabled: '',
  convertedUnstableRate: '',
  dir: '',
  backgroundImageFileName: '',
  skin: '',
  currentBpm: 100,
  banchoId: '',
  grade: '',
  playerHpSmooth: 0,
  ppIfMapEndsNow: 0,
  keyOverlay: '',
  hitErrors: [],
  time: 0,
  creator: '',
  diffName: '',
  mode: '',
  starsNomod: 0,
  totaltime: 0,
  bpm: 0,
  cs: 0,
  ar: 0,
  od: 0,
  hp: 0,
  mBpm: 0,
  mCS: 0,
  mAR: 0,
  mOD: 0,
  mHP: 0,
  mods: 0,
  mp3Name: 0,
  mStars: 0,
  rankedStatus: 0,
  rawStatus: 0,
  totalAudioTime: 0,
  osuIsRunning: ''
};

const requestList = Object.keys(cache);