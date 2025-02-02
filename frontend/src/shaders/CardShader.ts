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

export const cardVertexShader = `
${noiseFunction}

uniform float uTime;
uniform float uActivity;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vNormal;
varying float vFresnel;
varying vec3 vEyeVector;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate eye vector for fresnel
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec3 eyeVector = normalize(cameraPosition - worldPosition.xyz);
  vEyeVector = eyeVector;
  
  // Calculate fresnel effect
  vFresnel = pow(1.0 - max(0.0, dot(eyeVector, vNormal)), 2.0);
  
  // Very subtle surface distortion for frosted effect
  float frostNoise = snoise(position * 50.0 + uTime * 0.1) * 0.0015;
  vec3 pos = position + normal * frostNoise;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const cardFragmentShader = `
${noiseFunction}

uniform float uTime;
uniform vec3 uColor;
uniform float uActivity;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormal;
varying float vFresnel;
varying vec3 vEyeVector;

void main() {
  // Create frosted glass effect
  float frost = snoise(vec3(vUv * 50.0, uTime * 0.1)) * 0.07;
  frost += snoise(vec3(vUv * 100.0, uTime * 0.05)) * 0.03;
  
  // Background swirl animation based on activity
  float swirl = 0.0;
  if (uActivity > 0.0) {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    
    float angle = atan(center.y, center.x);
    float swirlTime = uTime * 0.2;
    
    swirl = snoise(vec3(
      dist * 3.0 + swirlTime,
      angle * 2.0,
      swirlTime * 0.5
    )) * uActivity;
  }
  
  // Glass color
  vec3 glassColor = mix(
    uColor * 0.95,
    uColor * 1.1,
    frost + vFresnel * 0.3
  );
  
  // Add swirl effect behind glass
  vec3 swirlColor = mix(
    uColor * 1.3,
    vec3(1.0),
    swirl * 0.5
  );
  
  // Combine effects
  vec3 finalColor = mix(
    glassColor,
    swirlColor,
    uActivity * 0.3 * (1.0 - vFresnel)
  );
  
  // Edge highlighting
  finalColor += vec3(vFresnel * 0.2);
  
  // Subtle sparkles in the frost
  float sparkle = step(0.97, snoise(vec3(vUv * 200.0, uTime * 3.0)));
  finalColor += sparkle * 0.1;
  
  // Final transparency
  float alpha = mix(0.7, 0.9, vFresnel);
  alpha = mix(alpha, 0.95, uActivity * 0.2) * uOpacity;

  gl_FragColor = vec4(finalColor, alpha);
}
`; 