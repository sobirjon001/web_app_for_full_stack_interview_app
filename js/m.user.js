// wen elements
const playContainer = document.querySelector("#play-container");
const menueContainer = document.querySelector("#menue-container");
const mainButtonText = document.querySelector("#main-button-text");
const subjectsListing = document.querySelector("#subjects-listing");
const subjectsCheckboxContainer = document.querySelector(
  "#subjects-checkbox-container"
);
const updateSubjectsButton = document.querySelector("#update-subjects-button");
const darkLightStyleLink = document.querySelector("#dark-light-style");
const autoRecordingSwitch = document.querySelector(".auto-recording-switch");
const autoSolutionSwitch = document.querySelector(".auto-solution-switch");
const infoQuestionsCount = document.querySelector("#questions-count");
const infoQuestionId = document.querySelector("#question_id");
const infoSubjectName = document.querySelector("#suject-name");
const textDisplay = document.querySelector("#text-display");
const recMessage = document.querySelector("#rec-message");
const timerLabel = document.querySelector("#timer-label");
const video = document.querySelector("#video");
const buttonVideoRecord = document.querySelector("#video-record");
const buttonVideoPlay = document.querySelector("#video-play");
const buttonVideoPause = document.querySelector("#video-pause");
const buttonVideoDownload = document.querySelector("#video-download");

// global variables
let base_uri = "";
let userName = "";
let token = "";
let subjects = [];
let selectedSubjects = [];
let questions = [];
let question = {};
let timerIsEnabled = true;
let autoRecordingIsEnabled = false;
let autoSolutionIsEnabled = true;
let subject_name = "";
let tikTak = true;
let solutionNotShowedYet = true;
let timer_id = null;
let isNotPaused = true;

// video variables
let isVideoEnabled = false;
let isRecording = false;
let isRecordingPaused = false;
let isPlayPaused = false;
let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];
let video_local = null;
let recMessageIntervalID = null;

// event listeners

// functions
(() => {
  base_uri = sessionStorage.getItem("base_uri");
  token = sessionStorage.getItem("token");
  fetch(`${base_uri}/api/users/decode`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  }).then(async (response) => {
    let data = await response.json();
    userName = data.data.full_name;
    // navUserName.innerHTML = "Welcome " + userName;
    openMenueForm();
  });
})();

function openMenueForm() {
  if (isRecording) media_recorder.pause();
  isNotPaused = false;
  getAllActiveSubjects();
  if (selectedSubjects.length != 0) {
    subjectsCheckboxContainer.classList.add("grey");
    updateSubjectsButton.classList.remove("grey");
  } else {
    subjectsCheckboxContainer.classList.remove("grey");
    updateSubjectsButton.classList.add("grey");
  }
  subjectsListing.innerHTML =
    selectedSubjects.length > 0
      ? "If you want to update subjects<br />click on 'Update subjects list'"
      : "Please choose subjects<br />you want to practise today";
  subjectsListing.classList.remove("alert");
  playContainer.classList.add("inactive");
  menueContainer.classList.remove("hidden");
  mainButtonText.innerHTML = "Go!";
  animateOpenMenue();
}

function closeMenueForm() {
  if (isRecording) media_recorder.resume();
  isNotPaused = true;
  animateCloseMenue(() => {
    playContainer.classList.remove("inactive");
    menueContainer.classList.add("hidden");
    mainButtonText.innerHTML = "Menue";
  });
}

function getAllActiveSubjects() {
  fetch(`${base_uri}/api/questions/active_subjects`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  }).then(async (response) => {
    let data = await response.json();
    if (data.message.includes("No records found")) {
      subjectsListing.innerHTML =
        "No subjects recorded yet<br />Please contact administrator!";
    } else {
      subjects = [];
      subjects.push(...data.subjects);
      let checkboxes = "";
      subjects.forEach((subject) => {
        checkboxes += `<label class="subject-label dark-item"
        >
          ${subject.subject_name}
        <input
          type="checkbox"
          id="${subject.subject_name}"
          class="subject-checkbox dark-item"
        ></label>`;
      });
      subjectsCheckboxContainer.innerHTML = checkboxes;
    }
  });
}

function mainMenueButtonHandler(t) {
  if (t.getAttribute("value") == "0") {
    t.setAttribute("value", "1");
    openMenueForm();
    return;
  }
  if (selectedSubjects.length > 0) {
    t.setAttribute("value", "0");
    if (!timerIsEnabled) killTimer();
    closeMenueForm();
    return;
  }
  document.querySelectorAll(".subject-checkbox").forEach((checkbox) => {
    if (checkbox.checked) {
      selectedSubjects.push(checkbox.id);
    }
  });
  if (selectedSubjects.length > 0) {
    t.setAttribute("value", "0");
    closeMenueForm();
    getQuestionsByChosenSubjects();
    return;
  }
  subjectsListing.innerHTML =
    "You have to chouse at least one<br />subject to continue!";
  subjectsListing.classList.add("alert");
}

function animateOpenMenue() {
  let tl = gsap.timeline();
  tl.to("#video-on", 0.3, { x: "0px", y: "0px", ease: "power4.in" })
    .to("#video-record", 0.3, { x: "0px", y: "0px", ease: "power4.in" }, 0.1)
    .to("#video-play", 0.3, { x: "0px", y: "0px", ease: "power4.in" }, 0.2)
    .to("#video-pause", 0.3, { x: "0px", y: "0px", ease: "power4.in" }, 0.3)
    .to("#video-download", 0.3, { x: "0px", y: "0px", ease: "power4.in" }, 0.4)
    .to("#dark-light-form", 1, { x: "25px", ease: "power4.out" }, 0.4)
    .to("#timer-form", 1, { x: "10px", ease: "power4.out" }, 0.6)
    .to("#auto-recording-form", 1, { x: "0px", ease: "power4.out" }, 0.8)
    .to("#auto-solution-form", 1, { x: "0px", ease: "power4.out" }, 1)
    .to("#subjects-form", 1, { y: "0%", ease: "elastic.out" }, 1.2);
}

function animateCloseMenue(callback) {
  let tl = gsap.timeline();
  tl.to("#dark-light-form", 1, { x: "-1000px", ease: "power4.in" })
    .to("#timer-form", 1, { x: "-1000px", ease: "power4.in" }, 0.2)
    .to("#auto-recording-form", 1, { x: "-1000px", ease: "power4.in" }, 0.4)
    .to("#auto-solution-form", 1, { x: "-1000px", ease: "power4.in" }, 0.6)
    .to(
      "#subjects-form",
      1,
      { y: "-120%", ease: "elastic.in", onComplete: callback },
      0.6
    )
    .to("#video-on", 0.5, { x: "5px", y: "-100px", ease: "power4.in" }, 0.8)
    .to("#video-record", 0.5, { x: "-50px", y: "-95px", ease: "power4.in" }, 1)
    .to("#video-play", 0.5, { x: "-100px", y: "-60px", ease: "power4.in" }, 1.2)
    .to(
      "#video-pause",
      0.5,
      { x: "-120px", y: "-10px", ease: "power4.in" },
      1.4
    )
    .to(
      "#video-download",
      0.5,
      { x: "-115px", y: "40px", ease: "power4.in" },
      1.6
    );
}

function updateSubjectsButtonHandler() {
  selectedSubjects = [];
  subjectsCheckboxContainer.classList.remove("grey");
}

function generalSwitchButtonHandler(t) {
  if (t.getAttribute("value") == "on") {
    t.setAttribute("value", "off");
    t.setAttribute("src", "../img/switch_off.gif");
  } else {
    t.setAttribute("value", "on");
    t.setAttribute("src", "../img/switch_on.gif");
  }
  return t.getAttribute("value");
}

function darkLightSwitchHandler(t) {
  let status = generalSwitchButtonHandler(t);
  if (status == "on") {
    darkLightStyleLink.href = "../css/user.light.style.css";
    console.log(darkLightStyleLink.href);
  } else {
    darkLightStyleLink.href = "../css/user.dark.style.css";
  }
}

function timerSwitchHandler(t) {
  let status = generalSwitchButtonHandler(t);
  timerIsEnabled = status == "on";
  if (timerIsEnabled) {
    autoRecordingSwitch.classList.remove("grey");
    autoSolutionSwitch.classList.remove("grey");
  } else {
    autoRecordingIsEnabled = false;
    autoSolutionIsEnabled = false;
    for (let switchButton of [autoRecordingSwitch, autoSolutionSwitch]) {
      switchButton.setAttribute("src", "../img/switch_off.gif");
      switchButton.setAttribute("value", "off");
      switchButton.classList.add("grey");
    }
  }
}

function autoRecordingSwitchHandler(t) {
  let status = generalSwitchButtonHandler(t);
  autoRecordingIsEnabled = status == "on";
  if (autoRecordingIsEnabled) {
    videoPowerButtonHandler();
  }
}

function autoSolutionSwitchHandler(t) {
  let status = generalSwitchButtonHandler(t);
  autoSolutionIsEnabled = status == "on";
}

function getQuestionsByChosenSubjects() {
  let tempSubjectList = [...selectedSubjects];
  questions = [];
  recurringCallToGetQuestions(tempSubjectList, 1, 0);
}

function recurringCallToGetQuestions(subjectsList, current_page, total_pages) {
  if (current_page > total_pages) {
    if (subjectsList.length == 0) {
      runGame();
      return;
    }
    subject_name = subjectsList.splice(0, 1);
    current_page = 1;
  }
  fetch(`${base_uri}/api/questions/by_subject`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      subject: subject_name,
      page: current_page,
    },
  }).then(async (response) => {
    let data = await response.json();
    if (data.message.includes("No records found")) {
      questions = [];
      infoQuestionsCount.innerHTML = 0 + " questions";
    } else {
      questions.push(...data.questions);
    }
    total_pages = parseInt(data.total_pages);
    if (current_page <= total_pages) {
      recurringCallToGetQuestions(subjectsList, ++current_page, total_pages);
    }
  });
}

function runGame() {
  if (isVideoEnabled && autoRecordingIsEnabled) {
    startRecord();
  }
  killTimer();
  solutionNotShowedYet = true;
  console.log(questions);
  if (questions.length == 0) {
    textDisplay.innerHTML = "This was last question";
    timerLabel.innerHTML = "00:00";
    return;
  }
  let randomIndex = Math.floor(Math.random() * questions.length);
  question = questions.splice(randomIndex, 1)[0];
  infoQuestionsCount.innerHTML = questions.length + " questions";
  console.log(question);
  infoQuestionId.innerHTML = "id: " + question.question_id;
  infoSubjectName.innerHTML = question.subject_name;
  textDisplay.innerHTML = question.question;
  timerLabel.innerHTML = "00:00";
  if (timerIsEnabled) {
    runTimer(question.time - 1, 60);
  }
}

function runTimer(min, sec) {
  timer_id = setInterval(() => {
    if (isNotPaused) {
      if (sec > 0) sec--;
      timerLabel.innerHTML =
        "0" + min + (tikTak ? ":" : " ") + (sec < 10 ? "0" : "") + sec;
      tikTak = !tikTak;
      if (sec == 0) {
        if (min > 0) {
          sec = 60;
          min--;
        } else {
          clearInterval(timer_id);
          timer_id = null;
          timerEndedHandler();
        }
      }
    }
  }, 1000);
}

function timerEndedHandler() {
  if (autoSolutionIsEnabled && solutionNotShowedYet) {
    if (isVideoEnabled && isRecording) {
      videoPlayButtonHandler();
    }
    textDisplay.innerHTML = question.solution;
    solutionNotShowedYet = false;
    runTimer(question.time - 1, 60);
  } else {
    runGame();
  }
}

function killTimer() {
  if (timer_id != null) {
    clearInterval(timer_id);
    timer_id = null;
    timerLabel.innerHTML = "00:00";
  }
}

function showSolutionButtonHandler() {
  if (!solutionNotShowedYet) return;
  solutionNotShowedYet = false;
  textDisplay.innerHTML = question.solution;
  killTimer();
  if (isVideoEnabled && isRecording) {
    videoPlayButtonHandler();
  }
  if (timerIsEnabled) runTimer(question.time - 1, 60);
}

// video functions
function videoPowerButtonHandler() {
  isVideoEnabled = !isVideoEnabled;
  if (!isVideoEnabled) {
    stopRecord();
    recMessage.innerHTML = "rec disabled";
    for (let x of [buttonVideoRecord, buttonVideoPlay, buttonVideoPause]) {
      x.classList.add("grey");
    }
  } else {
    recMessage.innerHTML = "stop";
    for (let x of [buttonVideoRecord, buttonVideoPlay, buttonVideoPause]) {
      x.classList.remove("grey");
    }
  }
  toggleVideo();
  buttonVideoDownload.classList.add("grey");
}

async function toggleVideo() {
  if (isVideoEnabled) {
    camera_stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 350,
        height: 430,
      },
      audio: true,
    });
    video.srcObject = camera_stream;
    video.controls = false;
    video.muted = true;
    // set MIME type of recording as video/webm
    media_recorder = new MediaRecorder(camera_stream, {
      mimeType: "video/webm;codecs=vp9,opus",
    });
    // event : new recorded video blob available
    media_recorder.addEventListener("dataavailable", function (e) {
      blobs_recorded.push(e.data);
    });
    // event : recording stopped & all blobs sent
    media_recorder.addEventListener("stop", function () {
      // create local object URL from the recorded video blobs
      video_local = null;
      video_local = URL.createObjectURL(
        new Blob(blobs_recorded, { type: "video/webm" })
      );
      buttonVideoDownload.href = video_local;
    });
  } else {
    camera_stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    camera_stream = null;
    video.removeAttribute("src");
    video_local = null;
  }
}

function startRecord() {
  blobs_recorded = [];
  isRecording = true;
  video.src = null;
  video.srcObject = camera_stream;
  video.controls = false;
  video.muted = true;
  recMessage.innerHTML = "rec";
  // start recording with each recorded blob
  media_recorder.start();
  buttonVideoDownload.classList.add("grey");
}

function stopRecord() {
  if (isRecording) {
    isRecording = false;
    recMessage.innerHTML = "stop";
    media_recorder.stop();
    buttonVideoDownload.classList.remove("grey");
  }
}

function videoRecordButtonHandler() {
  if (isRecording && isRecordingPaused) {
    videoPauseButtonHandler();
    return;
  }
  if (isRecording === false) {
    startRecord();
  } else {
    stopRecord();
  }
}

function videoPlayButtonHandler() {
  if (isRecording) {
    stopRecord();
  }
  setTimeout(() => {
    video.srcObject = null;
    video.src = video_local;
    video.muted = false;
    if (isPlayPaused) {
      isPlayPaused = false;
      video.resume();
    } else {
      if (video_local !== null) {
        video.play();
      } else {
        alert("No videos recorded yet!");
      }
    }
  }, 300);
}

function videoPauseButtonHandler() {
  isRecordingPaused = !isRecordingPaused;
  if (isRecording) {
    if (isRecordingPaused) {
      recMessage.innerHTML = "rec-pause";
      isNotPaused = false;
      media_recorder.pause();
      buttonVideoDownload.classList.remove("grey");
    } else {
      recMessage.innerHTML = "rec";
      isNotPaused = true;
      media_recorder.resume();
      buttonVideoDownload.classList.add("grey");
    }
  } else {
    isPlayPaused = !isPlayPaused;
    if (isPlayPaused) {
      isNotPaused = false;
      video.pause();
    } else {
      isNotPaused = true;
      video.resume();
    }
  }
}
