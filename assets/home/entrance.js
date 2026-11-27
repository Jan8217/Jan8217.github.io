const entrance = document.querySelector(".entrance");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const entranceKey = "homepage-entrance-v2";

function seenEntrance() {
  try {
    return sessionStorage.getItem(entranceKey) === "seen";
  } catch {
    return false;
  }
}

async function playEntrance() {
  const video = entrance.querySelector("video");
  const skip = entrance.querySelector(".entrance-skip");
  let timeout;
  let fade;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    fade?.cancel();
    video.pause();
    if (!entrance.open) return;
    entrance.close();
    if (document.activeElement === document.body) {
      const heading = document.querySelector(".hero h1");
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    try {
      sessionStorage.setItem(entranceKey, "seen");
    } catch {
      // The page remains usable when storage is disabled.
    }
  }

  skip.addEventListener("click", finish);
  entrance.addEventListener("cancel", (event) => { event.preventDefault(); finish(); });
  motion.addEventListener("change", (event) => { if (event.matches) finish(); });
  video.addEventListener("error", finish);
  video.addEventListener("ended", () => {
    fade = entrance.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 420, fill: "forwards", easing: "ease-in-out",
    });
    fade.onfinish = finish;
  });
  video.src = video.dataset.src;
  timeout = setTimeout(finish, 2200);

  try {
    await video.play();
    if (finished || location.hash || scrollY > 60 || motion.matches) { finish(); return; }
    clearTimeout(timeout);
    entrance.showModal();
    timeout = setTimeout(finish, 5000);
  } catch {
    finish();
  }
}

if (!location.hash && !motion.matches && !seenEntrance() && entrance.showModal) playEntrance();
