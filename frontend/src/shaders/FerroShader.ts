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
uniform float uThinkingState;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Fluid wave function
vec3 fluidWave(vec3 pos, float time, float magnitude) {
    float wave1 = sin(pos.y * 4.0 + time * 1.2) * cos(pos.z * 4.0 + time * 0.8);
    float wave2 = sin(pos.z * 3.0 - time * 0.9) * cos(pos.x * 3.0 + time * 1.1);
    float wave3 = sin(pos.x * 3.5 + time * 1.0) * cos(pos.y * 3.5 - time * 0.9);
    
    // Add secondary waves for more complexity
    float secondary1 = sin(pos.x * 6.0 + time * 0.7) * cos(pos.y * 6.0 - time * 0.5);
    float secondary2 = sin(pos.z * 5.0 - time * 0.6) * cos(pos.x * 5.0 + time * 0.4);
    
    return vec3(
        (wave1 + secondary1 * 0.3) * magnitude,
        (wave2 + secondary2 * 0.3) * magnitude,
        (wave3 + secondary1 * secondary2 * 0.3) * magnitude
    );
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // Multi-layer noise for organic movement
  float macroNoise = snoise(position * 3.0 + uTime * 0.1);
  float microNoise = snoise(position * 20.0 + uTime * 0.5) * 0.02;
  
  // Base position with organic movement
  vec3 pos = position + normal * (macroNoise * uDistortion * 0.3 + microNoise * uActivity);
  
  // Thinking state transformation
  if (uThinkingState > 0.0) {
    // Scale down slightly in thinking state
    float scale = 1.0 - (uThinkingState * 0.04);
    pos *= scale;
    
    // Create dynamic fluid motion
    vec3 fluidMotion = fluidWave(position, uTime, 0.15);
    
    // Split into fluid streams that orbit center
    float angle = uTime * 0.4; // Slower rotation
    float wobble = sin(uTime * 1.0) * 0.2; // Slower wobble
    mat3 orbitMatrix = mat3(
      cos(angle), wobble * sin(uTime * 1.5), sin(angle),
      -wobble * sin(uTime * 1.5), 1.0, wobble * cos(uTime * 1.5),
      -sin(angle), -wobble * cos(uTime * 1.5), cos(angle)
    );
    
    // Create two orbiting centers with dynamic radius
    float radiusPulse = 1.0 + sin(uTime * 0.8) * 0.1;
    vec3 center1 = orbitMatrix * vec3(0.25 * radiusPulse, 0.0, 0.0);
    vec3 center2 = -center1;
    
    // Calculate influence from each center
    float dist1 = length(pos - center1);
    float dist2 = length(pos - center2);
    float influence1 = smoothstep(0.8, 0.0, dist1);
    float influence2 = smoothstep(0.8, 0.0, dist2);
    
    // Create stretching effect between centers with added complexity
    vec3 stretch = normalize(center2 - center1) * 
                  (sin(uTime * 1.5) * 0.1 + sin(uTime * 2.5) * 0.02);
    
    // Add spiraling effect
    float spiral = sin(atan(pos.y, pos.x) * 4.0 + uTime * 1.0) * 0.05;
    
    // Combine all transformations
    vec3 newPos = pos;
    newPos += fluidMotion * uThinkingState;
    newPos += (normalize(pos - center1) * influence1 + normalize(pos - center2) * influence2) * 0.2 * uThinkingState;
    newPos += stretch * sin(length(pos) * 10.0 + uTime * 1.0) * uThinkingState;
    newPos += normal * spiral * uThinkingState;
    
    // Enhanced surface detail during thinking
    float thinkingDetail = snoise(pos * 8.0 + uTime * 0.25) * 0.05;
    newPos += normal * thinkingDetail * uThinkingState;
    
    // Ensure we stay within bounds
    float maxLength = scale * 1.1;
    if (length(newPos) > maxLength) {
        newPos = normalize(newPos) * maxLength;
    }
    
    // Smooth transition
    pos = mix(pos, newPos, uThinkingState);
  }
  
  // Enhanced magnetic field distortion
  vec3 fieldDistortion = vec3(
    snoise(pos * 5.0 + uTime * 0.15),
    snoise(pos * 5.0 + uTime * 0.15 + 100.0),
    snoise(pos * 5.0 + uTime * 0.15 + 200.0)
  ) * uDistortion * 0.15;
  
  // Combine all displacements
  vec3 finalPos = pos + fieldDistortion;
  
  // System pulse animation
  float systemPulse = sin(uTime * 1.0) * 0.005 * uActivity;
  finalPos *= 1.0 + systemPulse + uProgress * 0.01;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}
`;

export const fragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uActivity;
uniform float uProgress;
uniform float uThinkingState;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Enhanced surface flow pattern
  float surfaceFlow = sin(vPosition.x * 30.0 + uTime) * 
                     cos(vPosition.y * 30.0 + uTime) *
                     sin(vPosition.z * 30.0 + uTime);
  surfaceFlow = smoothstep(-0.5, 0.5, surfaceFlow);
  
  // Dynamic flow during thinking state
  if (uThinkingState > 0.0) {
    float thinkingFlow = sin(vPosition.x * 20.0 + uTime * 2.0) * 
                        cos(vPosition.y * 20.0 - uTime * 1.5) *
                        sin(vPosition.z * 20.0 + uTime * 1.8);
    surfaceFlow = mix(surfaceFlow, thinkingFlow, uThinkingState);
  }
  
  // Base metallic color with enhanced thinking state
  vec3 baseColor = mix(
    uColor * 0.7,
    uColor * 1.2,
    surfaceFlow * (uActivity + uThinkingState * 0.5)
  );
  
  // Energy core effect
  float energyCore = smoothstep(0.3, 0.8, 
    sin(length(vPosition) * 15.0 - uTime * 2.0)
  );
  
  // Enhanced magnetic field lines with thinking state variation
  float fieldLines = step(0.97, fract(vPosition.y * 10.0 + uTime));
  if (uThinkingState > 0.0) {
    float thinkingLines = step(0.95, 
      fract(
        sin(vPosition.x * 15.0 + uTime * 1.5) * 
        cos(vPosition.y * 15.0 - uTime) * 
        sin(vPosition.z * 15.0 + uTime * 2.0)
      )
    );
    fieldLines = mix(fieldLines, thinkingLines, uThinkingState);
  }
  
  // Combine all effects
  vec3 finalColor = baseColor;
  finalColor += uColor * energyCore * 0.3;
  finalColor += uColor * fieldLines * (uActivity + uThinkingState) * 0.3;
  
  // Enhanced fresnel effect
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
  finalColor += uColor * fresnel * 0.3;
  
  // Advanced alpha control with thinking state enhancement
  float alpha = mix(0.8, 0.95, energyCore + uThinkingState * 0.1);
  alpha *= 1.0 - smoothstep(0.7, 1.0, fresnel);

  gl_FragColor = vec4(finalColor, alpha);
}
`; 