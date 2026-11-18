(() => {
  const layer = document.querySelector("[data-forest-background]");
  if (!layer) return;

  window.applyForestBackgroundConfig = function applyForestBackgroundConfig(config = window.FOREST_BACKGROUND_CONFIG) {
    if (!config) return;
    layer.hidden = config.visible === false;
    layer.style.setProperty("--forest-x", `${config.x}%`);
    layer.style.setProperty("--forest-y", `${config.y}%`);
    layer.style.setProperty("--forest-scale", config.scale);
    layer.style.setProperty("--forest-opacity", config.opacity);
  };

  window.applyForestBackgroundConfig();
})();
