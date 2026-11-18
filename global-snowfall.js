import { ForestSnowfall } from './forest-snow-web-effect-fixed/snowfall.js';

if (!document.getElementById('global-snowfall')) {
  window.globalSnowfall = new ForestSnowfall(document.body, {
    viewport: true,
    id: 'global-snowfall',
    density: 1.8,
    speed: 1.5,
    opacity: 0.55,
    wind: 0.34,
    maxParticles: 200
  });
}
