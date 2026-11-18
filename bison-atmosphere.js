(() => {
  const config = window.BISON_ATMOSPHERE_CONFIG;
  if (!config) return;
  Object.entries(config).forEach(([id, values]) => {
    if (id === "version") return;
    const node = document.querySelector(`[data-bison-atmosphere="${id}"]`);
    if (!node) return;
    node.style.setProperty("--atmosphere-x", `${values.x}%`);
    node.style.setProperty("--atmosphere-y", `${values.y}%`);
    node.style.setProperty("--atmosphere-width", `${values.width}%`);
    node.style.setProperty("--atmosphere-scale", values.scale);
    node.style.setProperty("--atmosphere-rotation", `${values.rotation || 0}deg`);
    node.style.setProperty("--atmosphere-opacity", values.opacity);
  });
})();
