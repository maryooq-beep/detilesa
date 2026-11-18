window.enhanceGlossyButtons = function enhanceGlossyButtons(root = document) {
  root.querySelectorAll?.(".button, .donation-form button").forEach((control) => {
    if (control.classList.contains("glossy-control")) return;
    const label = document.createElement("span");
    label.className = "glossy-control__label";
    while (control.firstChild) label.append(control.firstChild);
    control.append(label);
    control.classList.add("glossy-control");
  });
};
window.enhanceGlossyButtons();

document.querySelectorAll("fieldset").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (!button) return;
    group.querySelectorAll("[data-choice]").forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");

    if (button.dataset.period) {
      const submitLabel = document.querySelector("[data-submit-label]");
      const label = submitLabel.querySelector(".glossy-control__label") || submitLabel;
      label.textContent = button.dataset.period === "once" ? "Пожертвовать" : "Помогать каждый месяц";
    }
  });
});

document.querySelector("[data-donation-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
});

window.applyAnimalPositionConfig = function applyAnimalPositionConfig(config = window.ANIMAL_POSITION_CONFIG) {
  if (!config?.animals) return;
  Object.entries(config.animals).forEach(([id, data]) => {
    const node = document.querySelector(`[data-animal="${id}"]`);
    if (!node) return;
    node.style.setProperty("--x", `${data.x}%`);
    node.style.setProperty("--y", `${data.y}%`);
    node.style.setProperty("--base-size", `${data.baseSize}%`);
    node.style.setProperty("--scale", data.scale);
    node.style.setProperty("--rotation", `${data.rotation}deg`);
    node.style.setProperty("--visual-offset-x", `${data.visualOffsetX || 0}%`);
    node.style.setProperty("--visual-offset-y", `${data.visualOffsetY || 0}%`);
    if (data.hitbox) {
      node.style.setProperty("--hit-x", `${data.hitbox.x}%`);
      node.style.setProperty("--hit-y", `${data.hitbox.y}%`);
      node.style.setProperty("--hit-w", `${data.hitbox.width}%`);
      node.style.setProperty("--hit-h", `${data.hitbox.height}%`);
    }
  });
};

window.applyAnimalPositionConfig();

window.applyBisonPositionConfig = function applyBisonPositionConfig(config = window.BISON_POSITION_CONFIG) {
  const node = document.querySelector(".bison-ornament");
  const data = config?.ornament;
  if (!node || !data) return;
  node.style.setProperty("--bison-x", `${data.x}%`);
  node.style.setProperty("--bison-y", `${data.y}%`);
  node.style.setProperty("--bison-size", `${data.size}%`);
  node.style.setProperty("--bison-scale", data.scale);
  node.style.setProperty("--bison-rotation", `${data.rotation}deg`);
  node.style.setProperty("--bison-offset-x", `${data.visualOffsetX || 0}%`);
  node.style.setProperty("--bison-offset-y", `${data.visualOffsetY || 0}%`);
};

window.applyBisonPositionConfig();
