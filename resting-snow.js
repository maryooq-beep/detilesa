(() => {
  const deepCopy = (value) => JSON.parse(JSON.stringify(value));
  const surfaceSelectors = {
    tree: '[data-snow-surface="tree"]',
    bison: '[data-snow-surface="bison"]',
    marten: '[data-snow-surface="marten"]',
    "season-winter": '[data-snow-surface="season-winter"]',
    "season-spring": '[data-snow-surface="season-spring"]',
    "season-summer": '[data-snow-surface="season-summer"]',
    "season-autumn": '[data-snow-surface="season-autumn"]'
  };
  let config = deepCopy(window.RESTING_SNOW_CONFIG || { version: 1, visible: true, elements: [] });
  const library = window.RESTING_SNOW_LIBRARY || [];
  const martenMovementGroups = {
    "marten-branch-2": "marten-ornament"
  };

  const surfaceNode = (id) => document.querySelector(surfaceSelectors[id]);
  const movementGroupFor = (item) => item.movementGroup || (item.surface === "marten" ? (martenMovementGroups[item.id] || "stationary-branch") : "surface");
  const layerHost = (surface, movementGroup = "surface") => document.querySelector(`[data-snow-layer-host="${surface}:${movementGroup}"]`) || document.querySelector(`[data-snow-layer-host="${surface}"]`) || surfaceNode(surface);
  const clearLayers = () => document.querySelectorAll(".resting-snow-layer").forEach((node) => node.remove());

  function createItem(item) {
    const node = document.createElement("div");
    node.className = "resting-snow-item";
    node.dataset.snowId = item.id;
    node.style.setProperty("--snow-x", `${item.x}%`);
    node.style.setProperty("--snow-y", `${item.y}%`);
    node.style.setProperty("--snow-width", `${item.width}%`);
    node.style.setProperty("--snow-ratio", `${item.width} / ${item.height}`);
    node.style.setProperty("--snow-rotation", `${item.rotation}deg`);
    node.style.setProperty("--snow-opacity", item.opacity);
    const asset = library.find((entry) => entry.id === item.asset);
    if (!asset) { node.dataset.missingAsset = item.asset || "unknown"; return node; }
    const image = document.createElement("img");
    image.src = asset.file;
    image.alt = "";
    image.draggable = false;
    node.append(image);
    return node;
  }

  function render() {
    clearLayers();
    Object.keys(surfaceSelectors).forEach((surface) => {
      const groups = new Map();
      config.elements.filter((item) => item.surface === surface).forEach((item) => {
        const level = Number.isFinite(Number(item.layer)) ? Number(item.layer) : 15;
        const movementGroup = movementGroupFor(item);
        const key = `${movementGroup}:${level}`;
        if (!groups.has(key)) groups.set(key, { level, movementGroup, items: [] });
        groups.get(key).items.push(item);
      });
      [...groups.values()].sort((a, b) => a.level - b.level).forEach(({ level, movementGroup, items }) => {
        const target = layerHost(surface, movementGroup);
        if (!target) return;
        const layer = document.createElement("div");
        layer.className = "resting-snow-layer";
        layer.dataset.snowLayer = surface;
        layer.dataset.snowLevel = level;
        layer.dataset.snowMovementGroup = movementGroup;
        layer.style.zIndex = level;
        layer.hidden = !config.visible;
        items.forEach((item) => layer.append(createItem(item)));
        target.append(layer);
      });
    });
    document.dispatchEvent(new CustomEvent("resting-snow:rendered"));
  }

  window.RestingSnowSystem = {
    surfaces: surfaceSelectors,
    getConfig: () => deepCopy(config),
    setConfig: (next) => { config = deepCopy(next); window.RESTING_SNOW_CONFIG = deepCopy(config); render(); },
    getElement: (id) => config.elements.find((item) => item.id === id),
    render,
    surfaceNode
  };
  render();
})();
