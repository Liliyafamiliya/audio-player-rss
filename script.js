// =============================VARIABLES=====================
const playBtn = document.querySelector(".btn-play");
const pauseBtn = document.querySelector(".btn-pause");
const prevBtn = document.querySelector(".btn-prev");
const nextBtn = document.querySelector(".btn-next");
const repeatBtn = document.querySelector(".btn-repeat");
const soundControlBtn = document.querySelector(".btn-sound-control");
const redCircles = document.querySelectorAll(".red-circle");
const pictureContainer = document.querySelector(".picture-container");
const audio = document.querySelector(".audio");
const trackSinger = document.querySelector(".track-singer");
const trackName = document.querySelector(".track-name");
const progressContainer = document.querySelector(".progress-container");
const filledProgress = document.querySelector(".filled-progress");
const volumeContainer = document.querySelector(".volume-container");
const filledVolume = document.querySelector(".filled-volume");
const trackCurrentTime = document.querySelector(".track-current-time");
const trackDuration = document.querySelector(".track-duration");

// =============================FORMAT-TIME=====================
const formatTime = (seconds) => {
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${s}`.length === 1 ? `${m}:0${s}` : `${m}:${s}`;
};

audio.addEventListener("loadedmetadata", () => {
  trackDuration.innerHTML = formatTime(audio.duration);
});

// =============================VISUALYZER=====================
let context, analyser, src, array;

const preparation = () => {
  context = new AudioContext();
  analyser = context.createAnalyser();
  src = context.createMediaElementSource(audio);
  src.connect(analyser);
  analyser.connect(context.destination);
  loop();
};

const loop = () => {
  if (!audio.paused) {
    window.requestAnimationFrame(loop);
  }
  trackCurrentTime.innerHTML = formatTime(audio.currentTime);
  array = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(array);

  redCircles[0].style.minHeight = array[0] - 100 + "px";
  redCircles[0].style.width = array[0] - 100 + "px";
  redCircles[1].style.minHeight = array[0] - 50 + "px";
  redCircles[1].style.width = array[0] - 50 + "px";
  redCircles[2].style.minHeight = array[0] + "px";
  redCircles[2].style.width = array[0] + "px";
  redCircles[3].style.minHeight = array[0] + 50 + "px";
  redCircles[3].style.width = array[0] + 50 + "px";
  redCircles[4].style.minHeight = array[0] + 100 + "px";
  redCircles[4].style.width = array[0] + 100 + "px";
};

// ========================TOGGLE-TRACK========================
const toggleTrack = () => {
  if (!context) {
    preparation();
  }
  if (audio.paused) {
    audio.play();
    loop();
    pauseBtn.style.display = "block";
    playBtn.style.display = "none";
  } else {
    audio.pause();
    pauseBtn.style.display = "none";
    playBtn.style.display = "block";
  }
};
playBtn.addEventListener("click", toggleTrack);
pauseBtn.addEventListener("click", toggleTrack);

// ========================UPDATE-PROGRESS-BAR========================
const updateProgressBar = () => {
  const currentTime = audio.currentTime;
  const duration = audio.duration;
  const progressPercentage = (currentTime / duration) * 100 || 0;
  filledProgress.style.width = `${progressPercentage}%`;
};

audio.addEventListener("timeupdate", updateProgressBar);

// ========================USER-SET-NEW-TRACK-WIDTH========================
const userSetNewTrackWidth = (e) => {
  const progressContainerCoordinates =
    progressContainer.getBoundingClientRect();
  const clickX = e.clientX - progressContainerCoordinates.left;
  const newWidth = (clickX / progressContainerCoordinates.width) * 100;
  const duration = audio.duration;
  const newTime = (newWidth / 100) * duration;
  filledProgress.style.width = newWidth + "%";
  audio.currentTime = newTime;
};

// ========================TRACK-CONTAINER-MOVING========================
let isProgressDragging = false;

progressContainer.addEventListener("mousedown", () => {
  isProgressDragging = true;

  progressContainer.addEventListener("mousemove", (e) => {
    if (isProgressDragging) {
      userSetNewTrackWidth(e);
    }
  });

  progressContainer.addEventListener("mouseup", () => {
    isProgressDragging = false;
  });
});

document.addEventListener("mouseup", () => {
  isProgressDragging = false;
});

// ========================TRACK-CLICK-CHANGING========================
progressContainer.addEventListener("click", (e) => {
  userSetNewTrackWidth(e);
});
// ========================USER-SET-NEW-VOLUME-WIDTH========================
const userSetNewVolumeWidth = (e) => {
  const volumeContainerCoordinates = volumeContainer.getBoundingClientRect();
  const clickX = e.clientX - volumeContainerCoordinates.left;
  const newWidth = (clickX / volumeContainerCoordinates.width) * 100;
  const newVolumeLevel = newWidth / 100;
  filledVolume.style.width = newWidth + "%";
  audio.volume = newVolumeLevel;
};

// ========================VOLUME-CONTAINER-MOVING========================
let isVolumeDragging = false;

volumeContainer.addEventListener("mousedown", () => {
  isVolumeDragging = true;

  volumeContainer.addEventListener("mousemove", (e) => {
    if (isVolumeDragging) {
      userSetNewVolumeWidth(e);
    }
  });

  volumeContainer.addEventListener("mouseup", () => {
    isVolumeDragging = false;
  });
});

document.addEventListener("mouseup", () => {
  isVolumeDragging = false;
});

// ========================VOLUME-CLICK-CHANGING========================
volumeContainer.addEventListener("click", () => {
  volumeContainer.addEventListener("click", (e) => {
    userSetNewVolumeWidth(e);
  });
});

// ========================TOGGLE-MUTE========================
const toggleMute = () => {
  if (audio.volume > 0) {
    prevVolumeLevel = audio.volume;
    audio.volume = 0;
    filledVolume.style.width = "0%";
  } else {
    audio.volume = prevVolumeLevel;
    filledVolume.style.width = prevVolumeLevel * 100 + "%";
  }
};

const toggleMuteImg = (event) => {
  event.target.classList.toggle("mute");
};

soundControlBtn.addEventListener("click", toggleMuteImg);
soundControlBtn.addEventListener("click", toggleMute);

// ========================TRACKS-CHANGING========================
let currentTrack = 0;

nextBtn.addEventListener("click", () => {
  if (currentTrack < tracks.length - 1) {
    currentTrack++;
  } else {
    currentTrack = 0;
  }
  callLoadTrack();
  pauseBtn.style.display = "none";
  playBtn.style.display = "block";
});

prevBtn.addEventListener("click", () => {
  if (currentTrack === 0) {
    currentTrack = tracks.length - 1;
  } else {
    currentTrack--;
  }
  callLoadTrack();
  pauseBtn.style.display = "none";
  playBtn.style.display = "block";
});

const callLoadTrack = () => {
  loadTrack(
    tracks[currentTrack].src,
    tracks[currentTrack].trackSinger,
    tracks[currentTrack].trackName,
    tracks[currentTrack].url
  );
};

// ========================LOAD-TRACK========================
const tracks = [
  {
    src: "./assets/tracks/Redondo - Jack My Body (Extended Mix).mp3",
    trackSinger: "Redondo",
    trackName: "Jack",
    url: "./assets/pictures/jack-img.jpg",
  },
  {
    src: "./assets/tracks/tiesto_-_wow.mp3",
    trackSinger: "Tiesto",
    trackName: "Wow",
    url: "./assets/pictures/tiesto-img.jpeg",
  },
];

const loadTrack = (src, artist, songName, url) => {
  audio.src = src;
  audio.load();
  trackSinger.innerHTML = `${artist} - `;
  trackName.innerHTML = songName;
  pictureContainer.style = `background-image: url(${url})`;
  trackDuration.innerHTML = audio.duration;
};

callLoadTrack();

// ========================REPEAT-TRACK========================
let isRepeatOn = false;

repeatBtn.addEventListener("click", () => {
  isRepeatOn = !isRepeatOn;
  repeatBtn.classList.toggle("repeat-on", isRepeatOn);
});

audio.addEventListener("ended", () => {
  if (isRepeatOn) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextBtn.click();
    audio.play();
    pauseBtn.style.display = "block";
    playBtn.style.display = "none";
  }
});
