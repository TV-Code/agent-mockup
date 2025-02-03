// Simplex 3D Noise implementation
const noiseFunction = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i); 
  vec4 p = permute(permute(permute( 
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const vertexShader = `
${noiseFunction}

uniform float uTime;
uniform float uDistortion;
uniform float uActivity;
uniform float uProgress;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // Multi-layer noise generation
  float macroNoise = snoise(position * 3.0 + uTime * 0.2);
  float microNoise = snoise(position * 20.0 + uTime) * 0.02;
  
  // Magnetic field distortion
  vec3 fieldDistortion = vec3(
    snoise(position * 5.0 + uTime * 0.3),
    snoise(position * 5.0 + uTime * 0.3 + 100.0),
    snoise(position * 5.0 + uTime * 0.3 + 200.0)
  ) * uDistortion * 0.15;
  
  // Vertex displacement calculation
  vec3 displaced = position + 
    normal * (macroNoise * uDistortion * 0.3 + microNoise * uActivity) +
    fieldDistortion;
  
  // System pulse animation
  float systemPulse = sin(uTime * 2.0) * 0.005 * uActivity;
  displaced *= 1.0 + systemPulse + uProgress * 0.01;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const fragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uActivity;
uniform float uProgress;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Surface flow pattern
  float surfaceFlow = sin(vPosition.x * 30.0 + uTime) * 
                     cos(vPosition.y * 30.0 + uTime) *
                     sin(vPosition.z * 30.0 + uTime);
  surfaceFlow = smoothstep(-0.5, 0.5, surfaceFlow);
  
  // Base metallic color
  vec3 baseColor = mix(
    uColor * 0.7,       // Dark areas
    uColor * 1.2,       // Bright areas
    surfaceFlow * uActivity
  );
  
  // Energy core effect
  float energyCore = smoothstep(0.3, 0.8, 
    sin(length(vPosition) * 15.0 - uTime * 2.0)
  );
  vec3 finalColor = mix(baseColor, vec3(1.0), energyCore * 0.3);

  // Magnetic field lines
  float fieldLines = step(0.9, fract(vPosition.y * 10.0 + uTime));
  finalColor += fieldLines * vec3(0.9, 1.0, 1.0) * uActivity;
  
  // Advanced alpha control
  float fresnel = pow(1.0 - dot(normalize(cameraPosition - vPosition), vNormal), 5.0);
  float alpha = mix(0.8, 0.95, energyCore);
  alpha *= 1.0 - smoothstep(0.7, 1.0, fresnel);

  gl_FragColor = vec4(finalColor, alpha);
}
`; 