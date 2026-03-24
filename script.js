const birthInfo = {
  day: 1,
  month: 6,
  year: 1996
};

const elements = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  status: document.getElementById("status"),
  targetDate: document.getElementById("target-date")
};
const cards = document.querySelectorAll(".hero, .countdown-card, .about-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pad = (value) => String(value).padStart(2, "0");
const uiScale = getUIScale();

function isBirthdayToday(now) {
  return now.getDate() === birthInfo.day && now.getMonth() === birthInfo.month - 1;
}

function getNextBirthday(now) {
  const monthIndex = birthInfo.month - 1;
  const hasPassedThisYear =
    now.getMonth() > monthIndex ||
    (now.getMonth() === monthIndex && now.getDate() > birthInfo.day);

  const targetYear = hasPassedThisYear ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(targetYear, monthIndex, birthInfo.day, 0, 0, 0, 0);
}

function formatTargetDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function setValues(days, hours, minutes, seconds) {
  elements.days.textContent = pad(days);
  elements.hours.textContent = pad(hours);
  elements.minutes.textContent = pad(minutes);
  elements.seconds.textContent = pad(seconds);
}

function updateCountdown() {
  const now = new Date();
  const target = getNextBirthday(now);
  elements.targetDate.textContent = formatTargetDate(target);

  if (isBirthdayToday(now)) {
    setValues(0, 0, 0, 0);
    const ageNow = now.getFullYear() - birthInfo.year;
    elements.status.textContent = `Hoje é o aniversário da Paloma. Parabéns pelos ${ageNow} anos!`;
    return;
  }

  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    setValues(0, 0, 0, 0);
    elements.status.textContent = "Hora da festa! O grande dia chegou.";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  const dayWord = days === 1 ? "dia" : "dias";

  setValues(days, hours, minutes, seconds);
  elements.status.textContent = `Faltam ${days} ${dayWord} para Paloma completar 30 aninhos. Estamos todos aguardando por uma arraiá animada e muita diversão!`;
}

updateCountdown();
setInterval(updateCountdown, 1000);
setupRaceMotionPath();

if (!prefersReducedMotion) {
  setupCardTilt();
  setupFlagBurst();
}

function setupRaceMotionPath() {
  const raceFrame = document.querySelector(".race-frame");
  const runnerGroups = document.querySelectorAll(".runner-group");

  if (!raceFrame || runnerGroups.length === 0) {
    return;
  }

  const supportsMotionPath =
    typeof CSS !== "undefined" &&
    (CSS.supports("offset-path", 'path("M 0 0 L 1 1")') ||
      CSS.supports("-webkit-offset-path", 'path("M 0 0 L 1 1")'));

  if (!supportsMotionPath) {
    return;
  }

  document.body.classList.add("motion-path-ready");
  let rafId = 0;

  const updatePath = () => {
    rafId = 0;
    const styles = getComputedStyle(raceFrame);
    const laneCenter = parseFloat(styles.getPropertyValue("--lane-center")) || 16;
    const cornerRaw = parseFloat(styles.getPropertyValue("--corner-nudge")) || 20;
    const width = raceFrame.clientWidth;
    const height = raceFrame.clientHeight;

    if (width < laneCenter * 2 + 4 || height < laneCenter * 2 + 4) {
      return;
    }

    const left = laneCenter;
    const right = width - laneCenter;
    const top = laneCenter;
    const bottom = height - laneCenter;
    const halfWidth = (right - left) / 2;
    const halfHeight = (bottom - top) / 2;
    const corner = Math.max(6, Math.min(cornerRaw, halfWidth - 2, halfHeight - 2));
    const topCenter = width / 2;

    const path = [
      `M ${topCenter.toFixed(2)} ${top.toFixed(2)}`,
      `L ${(right - corner).toFixed(2)} ${top.toFixed(2)}`,
      `L ${right.toFixed(2)} ${(top + corner).toFixed(2)}`,
      `L ${right.toFixed(2)} ${(bottom - corner).toFixed(2)}`,
      `L ${(right - corner).toFixed(2)} ${bottom.toFixed(2)}`,
      `L ${(left + corner).toFixed(2)} ${bottom.toFixed(2)}`,
      `L ${left.toFixed(2)} ${(bottom - corner).toFixed(2)}`,
      `L ${left.toFixed(2)} ${(top + corner).toFixed(2)}`,
      `L ${(left + corner).toFixed(2)} ${top.toFixed(2)}`,
      `L ${topCenter.toFixed(2)} ${top.toFixed(2)}`
    ].join(" ");

    const pathValue = `path("${path}")`;
    runnerGroups.forEach((runner) => {
      runner.style.offsetPath = pathValue;
      runner.style.webkitOffsetPath = pathValue;
    });
  };

  const requestPathUpdate = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(updatePath);
  };

  requestPathUpdate();
  window.addEventListener("resize", requestPathUpdate, { passive: true });
}

function setupCardTilt() {
  const supportsHover = window.matchMedia("(hover: hover)").matches;

  if (!supportsHover) {
    return;
  }

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = -py * 3.6;
      const rotateY = px * 5.2;
      card.style.transform =
        `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      card.style.boxShadow = "0 22px 40px rgba(59, 27, 8, 0.2)";
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });
}

function setupFlagBurst() {
  const palette = ["#c13a2a", "#f5b700", "#2f6db2", "#3d8f3d", "#ff7d4d"];
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
  let lastTrailTime = 0;

  document.addEventListener("pointerdown", (event) => {
    const point = mapPointerToScene(event.clientX, event.clientY);
    createBurst(point.x, point.y, palette);
  });

  if (!supportsFinePointer) {
    return;
  }

  document.addEventListener("pointermove", (event) => {
    const now = performance.now();

    if (now - lastTrailTime < 50) {
      return;
    }

    lastTrailTime = now;
    const point = mapPointerToScene(event.clientX, event.clientY);
    createBurst(point.x, point.y, palette, {
      pieces: 4,
      minDistance: 10,
      maxDistance: 28,
      dyBias: 6,
      jitter: 0.22,
      maxRotation: 150,
      opacity: 0.5,
      durationMs: 620,
      scaleFrom: 0.22,
      scaleTo: 0.65,
      width: 8,
      height: 10
    });
  });
}

function getUIScale() {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-scale"));

  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return value;
}

function mapPointerToScene(x, y) {
  if (uiScale === 1) {
    return { x, y };
  }

  return {
    x: x / uiScale,
    y: y / uiScale
  };
}

function createBurst(x, y, palette, options = {}) {
  const {
    pieces = 18,
    minDistance = 36,
    maxDistance = 108,
    dyBias = 24,
    jitter = 0.35,
    maxRotation = 330,
    opacity = 1,
    durationMs = 920,
    scaleFrom = 0.35,
    scaleTo = 1,
    width = 12,
    height = 15
  } = options;
  const distanceRange = Math.max(maxDistance - minDistance, 0);

  for (let index = 0; index < pieces; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / pieces + Math.random() * jitter;
    const distance = minDistance + Math.random() * distanceRange;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance + dyBias;
    const rotation = Math.floor(Math.random() * maxRotation);

    spark.className = "spark";
    spark.style.setProperty("--x", `${x}px`);
    spark.style.setProperty("--y", `${y}px`);
    spark.style.setProperty("--dx", `${dx.toFixed(2)}px`);
    spark.style.setProperty("--dy", `${dy.toFixed(2)}px`);
    spark.style.setProperty("--rot", `${rotation}deg`);
    spark.style.setProperty("--spark-color", palette[index % palette.length]);
    spark.style.setProperty("--spark-opacity", opacity.toFixed(2));
    spark.style.setProperty("--spark-duration", `${durationMs}ms`);
    spark.style.setProperty("--spark-scale-from", scaleFrom.toFixed(2));
    spark.style.setProperty("--spark-scale-to", scaleTo.toFixed(2));
    spark.style.setProperty("--spark-width", `${width}px`);
    spark.style.setProperty("--spark-height", `${height}px`);
    document.body.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}

