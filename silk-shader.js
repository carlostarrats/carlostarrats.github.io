// Silk Shader Skeleton
// Adapted from Giorgi Azmaipharashvili (MIT License)
// https://www.shadertoy.com/view/X3yXRd

(function() {
  var vertSrc =
    'attribute vec2 a_position;' +
    'void main(){gl_Position=vec4(a_position,0.0,1.0);}';

  var fragSrc =
    'precision mediump float;' +
    'uniform float u_time;' +
    'uniform vec2 u_resolution;' +

    'float noise(vec2 p){' +
    '  return smoothstep(-0.5,0.9,sin((p.x-p.y)*555.0)*sin(p.y*1444.0))-0.4;' +
    '}' +

    'float fabric(vec2 p){' +
    '  mat2 m=mat2(1.6,1.2,-1.2,1.6);' +
    '  float f=0.4*noise(p);' +
    '  f+=0.3*noise(p=m*p);' +
    '  f+=0.2*noise(p=m*p);' +
    '  return f+0.1*noise(m*p);' +
    '}' +

    'float silk(vec2 uv,float t){' +
    '  float s=sin(5.0*(uv.x+uv.y+cos(2.0*uv.x+5.0*uv.y))+sin(12.0*(uv.x+uv.y))-t);' +
    '  s=0.7+0.3*(s*s*0.5+s);' +
    '  s*=0.9+0.6*fabric(uv*min(u_resolution.x,u_resolution.y)*0.0006);' +
    '  return s*0.9+0.1;' +
    '}' +

    'float silkd(vec2 uv,float t){' +
    '  float xy=uv.x+uv.y;' +
    '  float d=(5.0*(1.0-2.0*sin(2.0*uv.x+5.0*uv.y))+12.0*cos(12.0*xy))' +
    '    *cos(5.0*(cos(2.0*uv.x+5.0*uv.y)+xy)+sin(12.0*xy)-t);' +
    '  return 0.005*d*(sign(d)+3.0);' +
    '}' +

    'void main(){' +
    '  float mr=min(u_resolution.x,u_resolution.y);' +
    '  vec2 uv=gl_FragCoord.xy/mr;' +
    '  float t=u_time*1.7;' +
    '  uv.x+=0.05*t;' +
    '  uv.y+=0.03*sin(8.0*uv.x-t);' +
    '  float s=sqrt(silk(uv,t));' +
    '  float d=silkd(uv,t);' +
    '  vec3 c=vec3(s);' +
    '  c+=0.7*vec3(0.4,0.35,0.5)*d;' +
    '  c*=1.0-max(0.0,0.8*d);' +
    '  c=pow(c,0.3/vec3(0.52,0.5,0.4));' +
    '  c=1.0-c;' +
    '  c=c*0.15;' +
    '  c=pow(c,vec3(0.9));' +
    '  c.r+=0.25*0.04;' +
    '  c.g+=0.25*0.01;' +
    '  c.b-=0.25*0.04;' +
    '  gl_FragColor=vec4(c,1.0);' +
    '}';

  var instances = [];
  var rafId = null;
  var startTime = performance.now();

  function initGL(canvas) {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return null;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    var vs = compile(gl.VERTEX_SHADER, vertSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    return {
      gl: gl,
      uTime: gl.getUniformLocation(prog, 'u_time'),
      uRes: gl.getUniformLocation(prog, 'u_resolution')
    };
  }

  function attachShader(el) {
    if (el._silkShader || el.classList.contains('is-loaded')) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    el.appendChild(canvas);

    var rect = el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    var ctx = initGL(canvas);
    if (!ctx) {
      el.removeChild(canvas);
      return;
    }
    ctx.gl.viewport(0, 0, canvas.width, canvas.height);

    var inst = { el: el, canvas: canvas, ctx: ctx };
    el._silkShader = inst;
    instances.push(inst);

    if (!rafId) startLoop();
  }

  function detachShader(el) {
    var inst = el._silkShader;
    if (!inst) return;

    inst.canvas.style.transition = 'opacity 0.3s ease';
    inst.canvas.style.opacity = '0';
    setTimeout(function() {
      if (inst.canvas.parentNode) inst.canvas.parentNode.removeChild(inst.canvas);
      var ext = inst.ctx.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }, 300);

    el._silkShader = null;
    instances = instances.filter(function(i) { return i !== inst; });

    if (instances.length === 0 && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function resize(inst) {
    var rect = inst.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = rect.width * dpr;
    var h = rect.height * dpr;
    if (inst.canvas.width !== w || inst.canvas.height !== h) {
      inst.canvas.width = w;
      inst.canvas.height = h;
      inst.ctx.gl.viewport(0, 0, w, h);
    }
  }

  function render() {
    var t = (performance.now() - startTime) / 1000;
    for (var i = 0; i < instances.length; i++) {
      var ctx = instances[i].ctx;
      var gl = ctx.gl;
      gl.uniform1f(ctx.uTime, t);
      gl.uniform2f(ctx.uRes, instances[i].canvas.width, instances[i].canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (instances.length > 0) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  }

  function startLoop() {
    if (rafId) return;
    rafId = requestAnimationFrame(render);
  }

  // Observe is-loaded on element itself or any child (e.g. img inside wrapper)
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        var el = m.target;
        if (el.classList.contains('is-loaded')) {
          // Check if this element has the shader
          if (el._silkShader) {
            detachShader(el);
          }
          // Check if parent has the shader (img.is-loaded inside wrapper)
          if (el.parentNode && el.parentNode._silkShader) {
            detachShader(el.parentNode);
          }
        }
      }
    });
  });

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      instances.forEach(resize);
    }, 100);
  });

  window.SilkShader = {
    attach: function(selector) {
      var els = document.querySelectorAll(selector);
      els.forEach(function(el) {
        var pos = getComputedStyle(el).position;
        if (pos === 'static') el.style.position = 'relative';

        attachShader(el);
        observer.observe(el, { attributes: true, attributeFilter: ['class'], subtree: true });
      });
    },
    detach: detachShader
  };
})();
