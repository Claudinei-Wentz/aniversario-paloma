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
const cards = document.querySelectorAll(".hero, .countdown-card, .about-card, .track-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pad = (value) => String(value).padStart(2, "0");

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
  const ageOnNextBirthday = target.getFullYear() - birthInfo.year;
  const dayWord = days === 1 ? "dia" : "dias";

  setValues(days, hours, minutes, seconds);
  elements.status.textContent = `Faltam ${days} ${dayWord} para a Paloma completar ${ageOnNextBirthday} anos.`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

if (!prefersReducedMotion) {
  setupCardTilt();
  setupFlagBurst();
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

  document.addEventListener("pointerdown", (event) => {
    createBurst(event.clientX, event.clientY, palette);
  });
}

function createBurst(x, y, palette) {
  const pieces = 18;

  for (let index = 0; index < pieces; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / pieces + Math.random() * 0.35;
    const distance = 36 + Math.random() * 72;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance + 24;
    const rotation = Math.floor(Math.random() * 330);

    spark.className = "spark";
    spark.style.setProperty("--x", `${x}px`);
    spark.style.setProperty("--y", `${y}px`);
    spark.style.setProperty("--dx", `${dx.toFixed(2)}px`);
    spark.style.setProperty("--dy", `${dy.toFixed(2)}px`);
    spark.style.setProperty("--rot", `${rotation}deg`);
    spark.style.setProperty("--spark-color", palette[index % palette.length]);
    document.body.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}
