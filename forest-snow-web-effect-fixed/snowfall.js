/* Forest Snow · transparent, responsive canvas snowfall (no external dependencies). */
export class ForestSnowfall {
  constructor(host, options = {}) {
    if (!(host instanceof HTMLElement)) throw new Error('ForestSnowfall requires a DOM element');
    this.host = host;
    this.options = { density: 1.8, speed: 1.5, wind: 0.34, opacity: 0.55, maxParticles: 200, viewport: false, id: '', ...options };
    this.viewport = this.options.viewport === true;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'forest-snow-canvas';
    if (this.options.id) this.canvas.id = this.options.id;
    this.canvas.setAttribute('aria-hidden', 'true');
    Object.assign(this.canvas.style, {position:this.viewport?'fixed':'absolute',inset:'0',width:'100%',height:'100%',display:'block',pointerEvents:'none',zIndex:this.viewport?'100':'5'});
    if (!this.viewport) {
      const computed = getComputedStyle(host).position;
      if (computed === 'static') host.style.position = 'relative';
    }
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', {alpha:true});
    this.flakes = [];
    this.last = 0;
    this.t = 0;
    this.running = false;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.onMotionChange = () => this.updateMotion();
    this.onResize = () => this.resize();
    this.onVisibilityChange = () => this.updateMotion();
    this.reducedMotion.addEventListener?.('change', this.onMotionChange);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    if (this.viewport) {
      addEventListener('resize', this.onResize, {passive:true});
      addEventListener('orientationchange', this.onResize, {passive:true});
    } else {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(host);
    }
    this.resize();
    this.updateMotion();
  }
  setOptions(patch) { Object.assign(this.options, patch); this.adjustPopulation(); }
  rand(a,b) {return a + Math.random()*(b-a)}
  makeFlake(fromTop=false) {
    const small=Math.random()<0.79;
    const radius=small?this.rand(1.25,3.2):this.rand(3.2,6.4);
    return {x:this.rand(0,this.w), y:fromTop?this.rand(-this.h*.2,-8):this.rand(0,this.h), radius,
      vy:this.rand(14,34)*(small?0.82:1.05), phase:this.rand(0,Math.PI*2), spin:this.rand(-.28,.28),
      tilt:this.rand(-.36,.36), drift:this.rand(2,13), opacity:this.rand(.23,.75), shape:Math.floor(Math.random()*10),
      hue:Math.random()<.20?'#D5DBD7':Math.random()<.40?'#FFF6E8':'#FFFFFF'};
  }
  resize() {
    const rect=this.viewport?{width:innerWidth,height:innerHeight}:this.host.getBoundingClientRect();
    this.w=Math.max(1,rect.width);this.h=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);
    this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.adjustPopulation();
    if (this.reducedMotion.matches) this.draw();
  }
  adjustPopulation() {
    // Density expressed as a multiplier over ~60 flakes / 600x750px.
    const area=this.w*this.h;
    const mobile=window.matchMedia('(max-width: 600px)').matches?0.72:1;
    const target=Math.max(15,Math.min(this.options.maxParticles,Math.round((area/450000)*60*this.options.density*mobile)));
    while(this.flakes.length<target)this.flakes.push(this.makeFlake());
    if(this.flakes.length>target)this.flakes.length=target;
  }
  updateMotion() { if(this.reducedMotion.matches||document.hidden){this.stop();this.draw();}else this.start(); }
  start(){if(this.running)return;this.running=true;this.last=0;this.raf=requestAnimationFrame(t=>this.frame(t));}
  stop(){this.running=false;cancelAnimationFrame(this.raf);this.last=0;}
  frame(now){if(!this.running)return;const dt=this.last?Math.min((now-this.last)/1000,.045):0;this.last=now;this.t+=dt;
    for(const p of this.flakes){
      const gust=Math.sin(this.t*.64)*.55+Math.sin(this.t*.21+1.5)*.45;
      p.y += p.vy*this.options.speed*dt;
      p.x += (gust*this.options.wind*26 + Math.sin(this.t*1.1+p.phase)*p.drift*.7)*dt;
      p.phase += p.spin*dt;
      if(p.y>this.h+12){Object.assign(p,this.makeFlake(true));p.y=-12;}
      if(p.x<-18)p.x=this.w+12;else if(p.x>this.w+18)p.x=-12;
    }
    this.draw();this.raf=requestAnimationFrame(t=>this.frame(t));
  }
  draw() {
    const c=this.ctx;c.clearRect(0,0,this.w,this.h);
    const o=this.options.opacity;
    for(const p of this.flakes){
      c.save();c.translate(p.x,p.y);c.rotate(p.tilt+p.phase*.06);
      c.strokeStyle=p.hue;c.lineCap='round';c.lineJoin='round';
      c.globalAlpha=Math.min(.8,p.opacity*o);
      c.lineWidth=p.radius<3?.64:.84;
      // Six-arm crystal with a distinct branching pattern for each of 10 variants.
      const arms=p.shape%2===0?6:8;
      for(let a=0;a<arms;a++){
        c.save();c.rotate(a*Math.PI*2/arms);
        c.beginPath();c.moveTo(0,0);c.lineTo(0,-p.radius);
        if(p.radius>2.2){
          const b=p.radius*(.43+(p.shape%3)*.09),tail=p.radius*(.19+(p.shape%4)*.04);
          c.moveTo(0,-b);c.lineTo(-tail,-b-tail*.65);
          c.moveTo(0,-b);c.lineTo(tail,-b-tail*.65);
        }
        c.stroke();c.restore();
      }
      c.fillStyle=p.hue;c.beginPath();c.arc(0,0,.45,0,Math.PI*2);c.fill();c.restore();
    }
  }
  destroy(){this.stop();this.resizeObserver?.disconnect();removeEventListener('resize',this.onResize);removeEventListener('orientationchange',this.onResize);document.removeEventListener('visibilitychange',this.onVisibilityChange);this.reducedMotion.removeEventListener?.('change',this.onMotionChange);this.canvas.remove();}
}
