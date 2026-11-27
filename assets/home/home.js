const photoLinks = [...document.querySelectorAll(".gallery a")];
const viewer = document.querySelector("#photo-viewer");
const photo = viewer.querySelector("img");
const caption = viewer.querySelector("figcaption");
const count = viewer.querySelector(".photo-count");
const closeButton = viewer.querySelector(".viewer-close");
let current = 0;

function showPhoto(index) {
  current = (index + photoLinks.length) % photoLinks.length;
  const link = photoLinks[current];
  photo.alt = link.querySelector("img").alt;
  photo.src = link.href;
  caption.textContent = photo.alt;
  count.textContent = `${current + 1} / ${photoLinks.length}`;
}

photoLinks.forEach((link, index) => {
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !viewer.showModal) return;
    event.preventDefault();
    showPhoto(index);
    viewer.showModal();
    closeButton.focus();
  });
});

closeButton.addEventListener("click", () => viewer.close());
viewer.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => showPhoto(current + Number(button.dataset.step)));
});
viewer.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  showPhoto(current + (event.key === "ArrowLeft" ? -1 : 1));
});
