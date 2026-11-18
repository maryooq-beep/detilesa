(() => {
  const animationConfig = window.ANIMAL_ANIMATION_CONFIG || {};
  const videoConfig = window.VIDEO_DISPLAY_CONFIG || { focalPoints: {} };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileInteraction = window.matchMedia("(hover: none), (pointer: coarse)");
  const calibrating = new URLSearchParams(location.search).get("calibrate") === "1";
  const frameCache = new Map();
  const playback = new Map();
  const touchTimers = new Map();
  let lastTouchAt = 0;

  window.applyGarlandPositionConfig = function applyGarlandPositionConfig(config = window.GARLAND_POSITION_CONFIG) {
    const node = document.querySelector("[data-garland-layer]");
    if (!node || !config) return;
    node.hidden = config.visible === false;
    node.style.setProperty("--garland-x", `${config.x}%`);
    node.style.setProperty("--garland-y", `${config.y}%`);
    node.style.setProperty("--garland-width", `${config.width}%`);
    node.style.setProperty("--garland-scale", config.scale);
    node.style.setProperty("--garland-rotation", `${config.rotation || 0}deg`);
    node.style.setProperty("--garland-opacity", config.opacity);
    node.style.setProperty("--garland-intensity", config.intensity || 1);
  };
  window.applyGarlandPositionConfig();

  function restartMobileGarland() {
    if (!mobileInteraction.matches || reducedMotion.matches) return;
    const image = document.querySelector(".garland-motion");
    const source = image?.getAttribute("src");
    if (!image || !source) return;
    const replacement = image.cloneNode(false);
    replacement.removeAttribute("src");
    image.replaceWith(replacement);
    requestAnimationFrame(() => { replacement.src = source; });
  }
  addEventListener("load", restartMobileGarland, { once: true });
  addEventListener("pageshow", (event) => { if (event.persisted) restartMobileGarland(); });

  const framePath = (data, index) => `${data.directory}/frame-${String(index + 1).padStart(3, "0")}.png`;
  function loadFrames(id) {
    if (frameCache.has(id)) return frameCache.get(id);
    const data = animationConfig[id];
    const promise = Promise.all(Array.from({ length: data.frames }, (_, index) => new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image.src);
      image.onerror = () => reject(new Error(`Не загружен кадр ${id} ${index + 1}`));
      image.src = framePath(data, index);
    })));
    frameCache.set(id, promise);
    return promise;
  }

  async function playAnimal(id) {
    if (reducedMotion.matches || playback.get(id)?.playing) return;
    const node = document.querySelector(`[data-animal="${id}"]`);
    const frame = node?.querySelector(".animal-animation-frame");
    const data = animationConfig[id];
    if (!node || !frame || !data?.frames) return;
    const state = { playing: true, timers: [] };
    playback.set(id, state);
    node.classList.add("is-loading");
    try {
      const sources = await loadFrames(id);
      node.classList.remove("is-loading");
      frame.src = sources[0];
      node.classList.add("is-playing");
      data.times.slice(1).forEach((time, index) => {
        state.timers.push(setTimeout(() => { frame.src = sources[index + 1]; }, time * 1000));
      });
      state.timers.push(setTimeout(() => {
        node.classList.remove("is-playing");
        frame.removeAttribute("src");
        state.playing = false;
      }, data.duration * 1000));
    } catch (error) {
      console.error(error);
      node.classList.remove("is-loading", "is-playing");
      state.playing = false;
    }
  }

  async function startMobileAnimalSequence() {
    if (!mobileInteraction.matches || reducedMotion.matches || calibrating) return;
    const order = ["tit", "heron", "fox", "roe", "moose"];
    try {
      await Promise.all(order.map(loadFrames));
      order.forEach((id, index) => setTimeout(() => playAnimal(id), index * 500));
    } catch (error) {
      console.error(error);
    }
  }

  function shimmerMarten() {
    if (reducedMotion.matches) return;
    const node = document.querySelector("[data-marten-interactive]");
    if (!node || node.classList.contains("is-shimmering")) return;
    node.classList.add("is-shimmering");
    setTimeout(() => node.classList.remove("is-shimmering"), 3000);
  }

  const popover = document.createElement("div");
  popover.className = "wildlife-popover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-label", "Видео с лесным животным");
  popover.hidden = true;
  popover.innerHTML = `<button class="wildlife-close" type="button" aria-label="Закрыть видео">×</button><video controls playsinline muted preload="none"></video>`;
  document.body.append(popover);
  const video = popover.querySelector("video");
  const closeButton = popover.querySelector(".wildlife-close");
  popover.style.setProperty("--video-circle-size", `${videoConfig.circularSize || 316}px`);
  popover.style.setProperty("--video-marten-width", `${videoConfig.martenWidth || 720}px`);
  let videoAnchor = null;

  function positionVideo() {
    if (!videoAnchor || popover.hidden) return;
    const rect = videoAnchor.getBoundingClientRect();
    const halfW = popover.offsetWidth / 2 + 14;
    const halfH = popover.offsetHeight / 2 + 14;
    const x = Math.max(halfW, Math.min(innerWidth - halfW, rect.left + rect.width / 2));
    const y = Math.max(halfH, Math.min(innerHeight - halfH, rect.top + rect.height / 2));
    popover.style.setProperty("--video-x", `${x}px`);
    popover.style.setProperty("--video-y", `${y}px`);
  }
  function closeVideo(restoreFocus = true) {
    const previousAnchor = videoAnchor;
    video.pause();
    video.removeAttribute("src");
    video.load();
    popover.hidden = true;
    popover.classList.remove("is-marten");
    videoAnchor = null;
    if (restoreFocus) previousAnchor?.focus?.({ preventScroll: true });
  }
  async function openVideo(id, anchor) {
    const data = animationConfig[id];
    if (!data?.video || !anchor) return;
    if (!popover.hidden) closeVideo(false);
    videoAnchor = anchor;
    popover.classList.toggle("is-marten", id === "marten");
    const focal = (window.VIDEO_DISPLAY_CONFIG || videoConfig).focalPoints?.[id];
    popover.style.setProperty("--video-focal", focal ? `${focal.x}% ${focal.y}%` : (data.focal || "50% 50%"));
    video.poster = data.poster || "";
    video.src = data.video;
    popover.hidden = false;
    positionVideo();
    closeButton.focus({ preventScroll: true });
    try { await video.play(); } catch { /* controls remain available when autoplay is blocked */ }
  }
  closeButton.addEventListener("click", closeVideo);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !popover.hidden) closeVideo(); });
  document.addEventListener("pointerdown", (event) => {
    if (!popover.hidden && !popover.contains(event.target) && !event.target.closest("[data-animal],[data-marten-interactive]")) closeVideo();
  });
  addEventListener("resize", positionVideo, { passive: true });
  addEventListener("scroll", positionVideo, { passive: true });
  window.openWildlifeVideo = openVideo;
  window.closeWildlifeVideo = closeVideo;

  if (calibrating) return;

  addEventListener("load", startMobileAnimalSequence, { once: true });

  document.querySelectorAll("[data-animal]").forEach((node) => {
    const id = node.dataset.animal;
    node.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") playAnimal(id); });
    node.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      lastTouchAt = Date.now();
      openVideo(id, node);
    });
    node.addEventListener("click", () => { if (Date.now() - lastTouchAt > 500) openVideo(id, node); });
    node.addEventListener("keydown", (event) => {
      if (event.key === " ") { event.preventDefault(); playAnimal(id); }
      if (event.key === "Enter") { event.preventDefault(); openVideo(id, node); }
    });
  });

  const marten = document.querySelector("[data-marten-interactive]");
  marten?.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") shimmerMarten(); });
  marten?.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;
    event.preventDefault();
    lastTouchAt = Date.now();
    const pending = touchTimers.get("marten");
    if (pending) { clearTimeout(pending); touchTimers.delete("marten"); openVideo("marten", marten); }
    else touchTimers.set("marten", setTimeout(() => { touchTimers.delete("marten"); shimmerMarten(); }, 280));
  });
  marten?.addEventListener("click", () => { if (Date.now() - lastTouchAt > 500) openVideo("marten", marten); });
  marten?.addEventListener("focus", shimmerMarten);
  marten?.addEventListener("keydown", (event) => {
    if (event.key === " ") { event.preventDefault(); shimmerMarten(); }
    if (event.key === "Enter") { event.preventDefault(); openVideo("marten", marten); }
  });

  const bison = document.querySelector(".bison-art");
  if (mobileInteraction.matches && bison) {
    let shimmerPlayed = false;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!shimmerPlayed && entry?.isIntersecting && entry.intersectionRatio >= .45) {
        shimmerPlayed = true;
        bison.querySelector(".bison-composition")?.classList.add("is-shimmering");
        observer.disconnect();
      }
    }, { threshold: [.45] });
    observer.observe(bison);
    bison.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse") return;
      openVideo("bison", bison);
    });
  }
})();
