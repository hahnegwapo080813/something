
/* ================================
   ELEMENTS
================================ */

const envelope = document.getElementById("envelope");
const openButton = document.getElementById("openButton");
const particles = document.getElementById("particles");
const readingView = document.getElementById("readingView");
const instruction = document.querySelector(".instruction");
const letter = envelope.querySelector(".letter");

const welcomeScreen = document.getElementById("welcomeScreen");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const welcomeDescription = document.getElementById("welcomeDescription");

const notebookScreen = document.getElementById("notebookScreen");
const notebookTextOne = document.getElementById("notebookTextOne");
const notebookTextTwo = document.getElementById("notebookTextTwo");

const flowerRainScreen = document.getElementById("flowerRainScreen");
const flowerPetals = document.getElementById("flowerPetals");
const giftBoxWrap = document.getElementById("giftBoxWrap");
const giftBox = document.getElementById("giftBox");

const favoriteSong = document.getElementById("favoriteSong");
const bouquetScreen = document.getElementById("bouquetScreen");

const continueButton = document.getElementById("continueButton");
const finalScreen = document.getElementById("finalScreen");


/* ================================
   SECOND SONG
================================ */

let letterSong = document.getElementById("letterSong");

if (!letterSong) {
  letterSong = document.createElement("audio");
  letterSong.id = "letterSong";
  letterSong.src = "letter-song.mp3";
  letterSong.preload = "auto";
  document.body.appendChild(letterSong);
}

if (favoriteSong) {
  favoriteSong.loop = false;
  favoriteSong.preload = "auto";
  favoriteSong.setAttribute("playsinline", "");
}

letterSong.loop = false;
letterSong.preload = "auto";
letterSong.setAttribute("playsinline", "");


/* ================================
   STATE VARIABLES
================================ */

let isOpen = false;
let isDragging = false;
let isExtracted = false;
let canExtract = false;

let startY = 0;
let dragDistance = 0;
let activePointerId = null;

let boxOpened = false;
let bouquetAccepted = false;
let letterSongStarted = false;
let finalSceneOpened = false;
let audioUnlocked = false;

const fadeIntervals = new Map();


/* ================================
   MUSIC CONTROLS
================================ */

function fadeAudio(audio, targetVolume, duration, onComplete) {
  if (!audio) return;

  if (fadeIntervals.has(audio)) {
    clearInterval(fadeIntervals.get(audio));
    fadeIntervals.delete(audio);
  }

  const startingVolume = audio.volume;
  const steps = Math.max(1, Math.ceil(duration / 50));

  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;

    const progress = Math.min(currentStep / steps, 1);

    audio.volume =
      startingVolume + (targetVolume - startingVolume) * progress;

    if (progress >= 1) {
      clearInterval(interval);
      fadeIntervals.delete(audio);

      if (onComplete) onComplete();
    }
  }, 50);

  fadeIntervals.set(audio, interval);
}


// Prepare audio immediately when the visitor taps YES.
function unlockAudio() {
  if (audioUnlocked) return;

  audioUnlocked = true;

  const songs = [favoriteSong, letterSong];

  songs.forEach(audio => {
    if (!audio) return;

    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");
    audio.preload = "auto";

    audio.muted = true;
    audio.volume = 0;

    const playback = audio.play();

    if (playback && typeof playback.then === "function") {
      playback.then(() => {
        audio.pause();

        try {
          audio.currentTime = 0;
        } catch (error) {
          console.log("Audio reset:", error);
        }

        audio.muted = false;
        audio.volume = 0.65;

      }).catch(error => {
        console.log("Audio preparation:", error);
      });
    }
  });
}


// First song.
function playFavoriteSong() {
  if (!favoriteSong) return;

  favoriteSong.muted = false;
  favoriteSong.volume = 0.65;

  favoriteSong.play().catch(error => {
    console.log("Favorite song playback failed:", error);
  });
}


// Second song.
function switchToLetterSong() {
  if (!letterSong || letterSongStarted) return;

  letterSongStarted = true;

  letterSong.muted = false;
  letterSong.volume = 0;

  letterSong.play()
    .then(() => {

      if (favoriteSong && !favoriteSong.paused) {
        fadeAudio(favoriteSong, 0, 3000, () => {
          favoriteSong.pause();
          favoriteSong.currentTime = 0;
        });
      }

      fadeAudio(letterSong, 0.65, 3000);

    })
    .catch(error => {
      console.log("Letter song playback failed:", error);
    });
}


/* ================================
   BOUQUET CHOICE BUTTONS
================================ */

const bouquetContent = bouquetScreen.querySelector(".bouquet-content");

const bouquetQuestion = document.createElement("p");
bouquetQuestion.className = "bouquet-question";
bouquetQuestion.textContent = "Would you accept this little gift?";

const bouquetChoices = document.createElement("div");
bouquetChoices.className = "bouquet-choices";

const acceptBouquetButton = document.createElement("button");
acceptBouquetButton.className = "accept-bouquet-button";
acceptBouquetButton.textContent = "Accept ♡";

const declineBouquetButton = document.createElement("button");
declineBouquetButton.className = "decline-bouquet-button";
declineBouquetButton.textContent = "Maybe not";

const bouquetDecision = document.createElement("p");
bouquetDecision.className = "bouquet-decision";
bouquetDecision.setAttribute("aria-live", "polite");

bouquetChoices.appendChild(acceptBouquetButton);
bouquetChoices.appendChild(declineBouquetButton);

bouquetContent.appendChild(bouquetQuestion);
bouquetContent.appendChild(bouquetChoices);
bouquetContent.appendChild(bouquetDecision);


/* ================================
   BOUQUET CHOICE STYLING
================================ */

const bouquetStyle = document.createElement("style");

bouquetStyle.textContent = `
  .bouquet-screen {
    transition: opacity 1s ease, visibility 1s ease;
  }

  .bouquet-screen.leaving {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .bouquet-question {
    color: #FFF4DF;
    font-size: 15px;
    margin-top: 25px;
    margin-bottom: 18px;
    letter-spacing: .5px;
  }

  .bouquet-choices {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 10px;
  }

  .bouquet-choices button {
    min-width: 125px;
    padding: 13px 22px;
    font-family: Georgia, serif;
    font-size: 14px;
    border-radius: 30px;
    transition: all .3s ease;
    cursor: pointer;
  }

  .accept-bouquet-button {
    background: #E8D7B8;
    color: #315B4B;
    border: 1px solid #E8D7B8;
  }

  .accept-bouquet-button:hover {
    background: #FFF4DF;
    color: #315B4B;
    transform: translateY(-3px);
  }

  .decline-bouquet-button {
    background: transparent;
    color: #FFF4DF;
    border: 1px solid rgba(255,255,255,.5);
  }

  .decline-bouquet-button:hover {
    background: rgba(255,255,255,.1);
  }

  .bouquet-decision {
    min-height: 24px;
    margin-top: 18px;
    color: #E8D7B8;
    font-size: 13px;
    line-height: 1.6;
    letter-spacing: .3px;
  }

  .bouquet-screen.accepted .bouquet-flowers {
    animation: bouquetAccepted 1.2s ease forwards;
  }

  .bouquet-screen.accepted .bouquet-question,
  .bouquet-screen.accepted .bouquet-choices,
  .bouquet-screen.accepted .bouquet-subtitle,
  .bouquet-screen.accepted .bouquet-content h2,
  .bouquet-screen.accepted .bouquet-message,
  .bouquet-screen.accepted .bouquet-decision {
    opacity: 0;
    transition: opacity .7s ease;
  }

  @keyframes bouquetAccepted {
    0% {
      transform: scale(1) rotate(0);
      filter: drop-shadow(0 15px 20px rgba(0,0,0,.25));
    }

    50% {
      transform: scale(1.12) rotate(-3deg);
      filter: drop-shadow(0 0 30px rgba(255,230,181,.8));
    }

    100% {
      transform: scale(1.05) rotate(0);
      filter: drop-shadow(0 0 40px rgba(255,230,181,.5));
    }
  }

  @media (max-width: 600px) {
    .bouquet-question {
      font-size: 14px;
      margin-top: 18px;
    }

    .bouquet-choices {
      gap: 10px;
    }

    .bouquet-choices button {
      min-width: 115px;
      padding: 12px 18px;
    }
  }
`;

document.head.appendChild(bouquetStyle);


/* ================================
   BOUQUET ACCEPTANCE
================================ */

acceptBouquetButton.addEventListener("click", () => {
  if (bouquetAccepted) return;

  bouquetAccepted = true;

  acceptBouquetButton.disabled = true;
  declineBouquetButton.disabled = true;

  bouquetDecision.textContent = "A little gift, happily accepted. ♡";

  bouquetScreen.classList.add("accepted");

  setTimeout(() => {
    bouquetScreen.classList.add("leaving");

    setTimeout(() => {
      bouquetScreen.classList.remove(
        "active",
        "accepted",
        "leaving"
      );

      bouquetAccepted = false;

      acceptBouquetButton.disabled = false;
      declineBouquetButton.disabled = false;

      bouquetDecision.textContent = "";

    }, 1100);

  }, 1300);
});


/* ================================
   BOUQUET DECLINED
================================ */

declineBouquetButton.addEventListener("click", () => {
  bouquetDecision.textContent =
    "That's okay. No pressure. I hope the flowers still made you smile. ♡";

  declineBouquetButton.textContent = "Maybe later ♡";
});


/* ================================
   FLOWER IMAGE COLLECTION
================================ */

const flowerFiles = [
  "flowers/pink_rose_1.png",
  "flowers/pink_rose_2.png",

  "flowers/white_daisy_1.png",
  "flowers/white_daisy_2.png",
  "flowers/white_daisy_3.png",
  "flowers/white_daisy_4.png",
  "flowers/white_daisy_5.png",

  "flowers/sunflower_1.png",
  "flowers/sunflower_2.png",

  "flowers/pink_carnation_1.png",
  "flowers/pink_carnation_2.png",
  "flowers/pink_carnation_3.png",

  "flowers/baby_breath_1.png",
  "flowers/baby_breath_2.png"
];


/* ================================
   FLOATING PARTICLES
================================ */

for (let i = 0; i < 30; i++) {
  const particle = document.createElement("span");

  particle.classList.add("particle");
  particle.style.left = Math.random() * 100 + "%";
  particle.style.animationDuration = (8 + Math.random() * 12) + "s";
  particle.style.animationDelay = Math.random() * 10 + "s";
  particle.style.width = (2 + Math.random() * 4) + "px";
  particle.style.height = particle.style.width;

  particles.appendChild(particle);
}


/* ================================
   WELCOME SCREEN
================================ */

yesButton.addEventListener("click", () => {

  // Prepare both songs immediately from the user's tap.
  unlockAudio();

  yesButton.disabled = true;
  noButton.disabled = true;

  welcomeScreen.classList.add("leaving");
  welcomeScreen.style.display = "none";

  notebookScreen.classList.add("active");

  setTimeout(startNotebookTyping, 1500);
});

noButton.addEventListener("click", () => {
  welcomeDescription.textContent =
    "That's okay. You can come back whenever you're ready. ♡";
});


/* ================================
   NOTEBOOK MESSAGE
================================ */

function startNotebookTyping() {
  const lineOne = "But first,";
  const lineTwo = "let me play your favorite song...";

  notebookTextOne.textContent = "";
  notebookTextTwo.textContent = "";

  const firstLine = notebookTextOne.parentElement;
  const secondLine = notebookTextTwo.parentElement;

  firstLine.classList.remove("typed", "typing");
  secondLine.classList.remove("typed", "typing");

  firstLine.classList.add("typing");

  let index = 0;

  function typeFirstLine() {
    if (index < lineOne.length) {
      notebookTextOne.textContent += lineOne.charAt(index);
      index++;

      setTimeout(typeFirstLine, 110);
    } else {
      firstLine.classList.remove("typing");
      firstLine.classList.add("typed");

      secondLine.classList.add("typing");

      index = 0;
      setTimeout(typeSecondLine, 500);
    }
  }

  function typeSecondLine() {
    if (index < lineTwo.length) {
      notebookTextTwo.textContent += lineTwo.charAt(index);
      index++;

      setTimeout(typeSecondLine, 90);
    } else {
      secondLine.classList.remove("typing");
      secondLine.classList.add("typed");

      setTimeout(() => {
        notebookScreen.classList.add("finished");

        // Start the first song after the typing animation.
        playFavoriteSong();

        // Keep notebook visible for 15 seconds.
        setTimeout(() => {

          notebookScreen.classList.add("transition-out");

          flowerPetals.innerHTML = "";

          flowerRainScreen.classList.remove(
            "clearing",
            "curtain-lift"
          );

          giftBoxWrap.classList.remove(
            "opened",
            "disappearing",
            "ready-to-burst"
          );

          bouquetScreen.classList.remove(
            "active",
            "accepted",
            "leaving"
          );

          bouquetDecision.textContent = "";
          declineBouquetButton.textContent = "Maybe not";

          acceptBouquetButton.disabled = false;
          declineBouquetButton.disabled = false;

          bouquetAccepted = false;
          boxOpened = false;

          flowerRainScreen.classList.add("active", "entering");

          setTimeout(() => {
            notebookScreen.classList.remove("active", "finished");

            setTimeout(() => {
              notebookScreen.classList.remove("transition-out");

              notebookTextOne.textContent = "";
              notebookTextTwo.textContent = "";

              firstLine.classList.remove("typed");
              secondLine.classList.remove("typed");

            }, 1250);

          }, 1300);

          setTimeout(() => {
            flowerRainScreen.classList.remove("entering");
          }, 1450);

        }, 15000);

      }, 500);
    }
  }

  setTimeout(typeFirstLine, 500);
}


/* ================================
   GIFT BOX SCENE
================================ */

function showGiftBox() {
  flowerPetals.innerHTML = "";

  flowerRainScreen.classList.remove(
    "clearing",
    "entering",
    "curtain-lift"
  );

  giftBoxWrap.classList.remove(
    "opened",
    "disappearing",
    "ready-to-burst"
  );

  bouquetScreen.classList.remove(
    "active",
    "accepted",
    "leaving"
  );

  bouquetDecision.textContent = "";
  declineBouquetButton.textContent = "Maybe not";

  acceptBouquetButton.disabled = false;
  declineBouquetButton.disabled = false;

  bouquetAccepted = false;
  boxOpened = false;

  flowerRainScreen.classList.add("active");
}

giftBox.addEventListener("click", () => {
  if (boxOpened) return;

  boxOpened = true;

  giftBoxWrap.classList.remove("ready-to-burst");
  giftBoxWrap.classList.add("opened");

  setTimeout(() => {
    releaseFlowers();
  }, 650);
});


/* ================================
   FLOWER VOLCANO ERUPTION
================================ */

function releaseFlowers() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  flowerPetals.innerHTML = "";
  flowerRainScreen.classList.remove("curtain-lift");

  const totalFlowers = 350;

  const launchX = screenWidth / 2;
  const launchY = screenHeight * 0.62;

  for (let i = 0; i < totalFlowers; i++) {
    const flower = document.createElement("img");

    const randomFlower =
      flowerFiles[Math.floor(Math.random() * flowerFiles.length)];

    flower.src = randomFlower;
    flower.classList.add("bloom");

    flower.alt = "";
    flower.draggable = false;

    const size = window.innerWidth <= 600
      ? 50 + Math.random() * 55
      : 75 + Math.random() * 75;

    const left = Math.random() * Math.max(0, screenWidth - size);
    const bottom = Math.random() * Math.max(0, screenHeight - size);

    const targetCenterX = left + size / 2;
    const targetCenterY = screenHeight - bottom - size / 2;

    const startX = launchX - targetCenterX;
    const startY = launchY - targetCenterY;

    const delay = Math.random() * 3.5;
    const duration = 2 + Math.random() * 1.2;

    const rotation = Math.random() * 120 - 60;
    const drift = Math.random() * 100 - 50;

    flower.style.setProperty("--size", `${size}px`);
    flower.style.setProperty("--left", `${left}px`);
    flower.style.setProperty("--bottom", `${bottom}px`);

    flower.style.setProperty("--start-x", `${startX}px`);
    flower.style.setProperty("--start-y", `${startY}px`);

    flower.style.setProperty("--delay", `${delay}s`);
    flower.style.setProperty("--duration", `${duration}s`);

    flower.style.setProperty("--rotation", `${rotation}deg`);
    flower.style.setProperty("--drift", `${drift}px`);

    flowerPetals.appendChild(flower);
  }

  const eruptionDuration = 5000;

  setTimeout(() => {

    giftBoxWrap.classList.add("disappearing");

    setTimeout(() => {

      bouquetScreen.classList.add("active");

      flowerRainScreen.classList.add("curtain-lift");

      setTimeout(() => {
        flowerRainScreen.classList.remove(
          "active",
          "curtain-lift"
        );

        flowerPetals.innerHTML = "";

      }, 2500);

    }, 10000);

  }, eruptionDuration);
}


/* ================================
   OPEN ENVELOPE
================================ */

function openEnvelope() {
  if (isOpen) return;

  isOpen = true;

  envelope.classList.add("open");
  openButton.style.display = "none";

  instruction.textContent = "Opening your letter...";

  setTimeout(() => {
    envelope.classList.add("letter-ready");

    instruction.textContent = "A little something inside...";

    setTimeout(() => {
      canExtract = true;
      instruction.textContent = "Gently pull the letter upward ↑";
    }, 1800);

  }, 1400);
}

openButton.addEventListener("click", openEnvelope);


/* ================================
   DRAG LETTER
================================ */

letter.addEventListener("pointerdown", (event) => {
  if (!canExtract || isExtracted || isDragging) return;

  event.preventDefault();

  isDragging = true;
  activePointerId = event.pointerId;
  startY = event.clientY;
  dragDistance = 0;

  letter.style.transition = "none";
  letter.setPointerCapture(event.pointerId);
});

letter.addEventListener("pointermove", (event) => {
  if (!isDragging || event.pointerId !== activePointerId) return;

  dragDistance = Math.min(0, event.clientY - startY);

  letter.style.setProperty("--drag-y", `${dragDistance}px`);
});

function finishDragging(event) {
  if (!isDragging) return;

  if (
    event &&
    activePointerId !== null &&
    event.pointerId !== activePointerId
  ) return;

  isDragging = false;
  activePointerId = null;

  if (dragDistance <= -100) {
    extractLetter();
  } else {
    letter.style.transition =
      "transform 1.2s cubic-bezier(.22,1,.36,1)";

    letter.style.setProperty("--drag-y", "0px");
    dragDistance = 0;
  }
}

letter.addEventListener("pointerup", finishDragging);
letter.addEventListener("pointercancel", finishDragging);


/* ================================
   EXTRACT LETTER
================================ */

function extractLetter() {
  if (isExtracted) return;

  isExtracted = true;
  canExtract = false;

  envelope.classList.add("extracted");

  instruction.textContent = "Opening your letter...";

  setTimeout(() => {
    document.body.classList.add("reading");

    readingView.classList.add("active");
    readingView.setAttribute("aria-hidden", "false");

    switchToLetterSong();

    startLetterTyping();

  }, 650);
}


/* ================================
   MAIN LETTER TYPEWRITER
================================ */

function startLetterTyping() {
  const greeting = document.querySelector(".letter-greeting");
  const paragraphs = document.querySelectorAll(".letter-content p");
  const signature = document.querySelector(".letter-signature");

  if (!greeting || !paragraphs.length || !signature) {
    console.error("Letter elements could not be found.");
    return;
  }

  const letterParts = [
    greeting,
    ...paragraphs,
    signature
  ];

  const originalTexts = letterParts.map(element =>
    element.textContent.trim().replace(/\s+/g, " ")
  );

  letterParts.forEach(element => {
    element.textContent = "";
    element.classList.remove("typing");
  });

  continueButton.classList.remove("visible");
  continueButton.disabled = true;

  let partIndex = 0;
  let charIndex = 0;

  const typingSpeed = 28;
  const paragraphPause = 650;

  function typeNextCharacter() {

    if (partIndex >= letterParts.length) {

      setTimeout(() => {
        continueButton.classList.add("visible");
        continueButton.disabled = false;
      }, 900);

      return;
    }

    const currentElement = letterParts[partIndex];
    const currentText = originalTexts[partIndex];

    currentElement.classList.add("typing");

    if (charIndex < currentText.length) {
      currentElement.textContent += currentText.charAt(charIndex);
      charIndex++;

      setTimeout(typeNextCharacter, typingSpeed);
    } else {
      currentElement.classList.remove("typing");

      partIndex++;
      charIndex = 0;

      setTimeout(typeNextCharacter, paragraphPause);
    }
  }

  setTimeout(typeNextCharacter, 700);
}


/* ================================
   FINAL NO-PRESSURE SCENE
================================ */

continueButton.addEventListener("click", () => {

  if (finalSceneOpened) return;

  finalSceneOpened = true;
  continueButton.disabled = true;

  readingView.classList.add("leaving");

  setTimeout(() => {

    readingView.classList.remove("active");
    readingView.setAttribute("aria-hidden", "true");

    finalScreen.classList.add("active");
    finalScreen.setAttribute("aria-hidden", "false");

  }, 1100);

  // Leave the letter song playing naturally.

});
