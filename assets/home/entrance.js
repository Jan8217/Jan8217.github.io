const entrance = document.querySelector(".entrance");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function seenEntrance() {
  try {
    return sessionStorage.getItem("homepage-entrance") === "seen";
  } catch {
    return false;
  }
}

function playEntrance() {
  const canvas = entrance.querySelector("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  const reveal = entrance.querySelector(".entrance-reveal");
  const skip = entrance.querySelector(".entrance-skip");
  const duration = 3300;
  let frame;
  let fade;
  let start;

  function finish() {
    cancelAnimationFrame(frame);
    fade?.cancel();
    if (!entrance.open) return;
    entrance.close();
    if (document.activeElement === document.body) {
      const heading = document.querySelector(".hero h1");
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    try {
      sessionStorage.setItem("homepage-entrance", "seen");
    } catch {
      // The intro still works when storage is disabled.
    }
  }

  function draw(timestamp) {
    start ??= timestamp;
    const elapsed = timestamp - start;
    if (elapsed >= duration) {
      fade = entrance.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, fill: "forwards" });
      fade.onfinish = finish;
      return;
    }

    const scale = Math.min(devicePixelRatio, 1.5);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) { finish(); return; }
    const pixelWidth = Math.round(width * scale);
    const pixelHeight = Math.round(height * scale);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const x = width / 2;
    const y = height / 2;
    const radius = Math.hypot(x, y);
    const sky = context.createRadialGradient(x, y, 0, x, y, radius);
    sky.addColorStop(0, "#b5f0df");
    sky.addColorStop(.08, "#20657c");
    sky.addColorStop(.44, "#0c253d");
    sky.addColorStop(1, "#030c16");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    const travel = elapsed / 730 + (elapsed / 1750) ** 2;

    for (let index = 0; index < 15; index += 1) {
      const depth = ((index / 15 + travel / 7) % 1);
      const ring = radius * .035 * 38 ** depth;
      const rotation = elapsed / 3700 + depth * .8;
      context.beginPath();
      for (let edge = 0; edge <= 16; edge += 1) {
        const angle = edge * Math.PI / 8 + rotation;
        context.lineTo(x + Math.cos(angle) * ring, y + Math.sin(angle) * ring * .68);
      }
      context.strokeStyle = `rgba(117, 227, 238, ${Math.sin(depth * Math.PI) * .72})`;
      context.lineWidth = 1 + depth * 1.6;
      context.stroke();
    }

    for (let index = 0; index < 42; index += 1) {
      const depth = ((index * .618033 + travel / 4) % 1);
      const angle = index * 2.39996 + elapsed / 5900;
      const distance = radius * .035 * 38 ** depth;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance * .73;
      context.beginPath();
      context.moveTo(x + dx * .68, y + dy * .68);
      context.lineTo(x + dx, y + dy);
      context.strokeStyle = `rgba(206, 250, 235, ${Math.sin(depth * Math.PI) * .8})`;
      context.lineWidth = 1.2;
      context.stroke();
    }

    const opening = Math.min(1, Math.max(0, (elapsed - 1700) / 1030));
    reveal.style.clipPath = `circle(${(opening * opening * (3 - 2 * opening)) * (radius + 1)}px at 50% 50%)`;
    frame = requestAnimationFrame(draw);
  }

  skip.addEventListener("click", finish);
  entrance.addEventListener("cancel", (event) => { event.preventDefault(); finish(); });
  motion.addEventListener("change", (event) => { if (event.matches) finish(); });
  entrance.showModal();
  frame = requestAnimationFrame(draw);
}

if (!location.hash && !motion.matches && !seenEntrance() && entrance.showModal) playEntrance();
