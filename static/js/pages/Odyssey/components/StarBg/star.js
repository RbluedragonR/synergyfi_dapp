import * as THREE from "three.js";
let container;
let camera, scene, renderer;
let uniforms;
let allowAnimation;

export function starInit(containerEl) {
  container = containerEl;
  camera = new THREE.Camera();
  camera.position.z = 1;

  scene = new THREE.Scene();

  const geometry = new THREE.PlaneBufferGeometry(2, 2);

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `void main() {
    		gl_Position = vec4( position, 1.0 );
    	}`,
    fragmentShader: `#ifdef GL_ES
        precision highp float;
    #endif
    
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    
    #define PI 3.141592653589793
    #define NUM_LAYERS 4.
    
    // Rotates a matrix, giving an angle
    mat2 Rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
    }
    
    // Makes a star at origin 0
    float Star(vec2 uv, float flare) {
    
        float d = length(uv);// distance
        float starSize = 0.1;
        float sun = starSize / d;// sets the initial light falloff
    
        float ninetyDeg = PI/4.;
        float starScale = 200.0;
        float dimSecondStar = 3.0;
    
        float rays = max(0.6 , 1.0 - abs(uv.x * uv.y * starScale));// 1 minus selects the inverse
        sun += rays * flare; // casts the rays with flare
        uv *= Rot(ninetyDeg);
        // Repeat the same as above after the rotation to create a shine effect
        rays = max(0.0 , 1.0 - abs(uv.x * uv.y * starScale));// 1 minus selects the inverse
        sun += rays * dimSecondStar * flare;
    
        sun *= smoothstep(0.9, .01, d); // smooth out to the edge of uv
        return sun;
    }
    
    // Returns the fractional component of a random number
    float Hash21(vec2 p) {
        p = fract (p * vec2(999.999, 666.666)); // these numbers are arbitrary
        p += dot(p, p + 420.00); // these numbers are arbitrary
        return fract(p.x * p.y);
    }
    
    vec3 StarLayer(vec2 uv) {
        vec3 col = vec3(0); // make it black
        vec2 gv = fract(uv) - .5; // subtract to recenter to the middle, keeps fractional component of a number
        vec2 id = floor(uv); // gets the integer component
        /*
            Loop through the neighboring uv's (shown as"x").
            At least 1 unit in all directions, which is 9.
    
            o | o | o
            o | x | o
            o | o | o
        */
        for (int y = -1; y <= 1; y++ ) {
            for(int x = -1; x <= 1; x++) {
    
                vec2 offset = vec2(x, y);
                float n = Hash21(id + offset); // random number between 0 and 1
                float n2 = fract(n * 1000.0);
    			float n3 = fract(n);
                float glowSize = fract(n * 0.3);
                float flareStrength = smoothstep(0.01, 1.0, glowSize);
                float star = Star(gv - offset - vec2(n, n2) + .5, flareStrength);
                vec3 starColor = sin(vec3(n, n2, n) * u_time * 10.1) * .5 + .5;
                float twinkle = 1.5;
                
                starColor += vec3(0.0, 0.4, 0.8); // modify the color strength
                star *= sin(u_time * twinkle + n * (PI * 2.)) * .5 + .5;
                col += star * glowSize * starColor;
            }
        }
        return col;
    }
    
    void main() {
    
        vec2 uv = (gl_FragCoord.xy - .5 * u_resolution.xy) / u_resolution.x;
        float speed = u_time * 0.05;
        float scaleUv = 1.0;
        vec3 col = vec3(0.0);
    
        uv *= scaleUv;
        uv *= Rot(cos(speed));
    
        for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYERS) {
            float depth = fract(i + speed);
            float starScale = mix(10.0, 1.15, depth);
            float fade = depth * smoothstep(1.0, .5, depth);
            col += StarLayer(uv * starScale + i * PI) * fade;
        }
    
        gl_FragColor = vec4(col, 1.0);
    }`,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

export function startShine() {
  allowAnimation = true;
  starAnimate();
}
export function starAnimate() {
  if (allowAnimation) {
    requestAnimationFrame(starAnimate);
    render();
  }
}

function render() {
  uniforms.u_time.value += 0.05;
  renderer.render(scene, camera);
}
export function stopAnimation() {
  allowAnimation = false;
}
