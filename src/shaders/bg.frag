varying vec2 vUv;
uniform float iTime;
uniform float iProgress;

void main() {
  float a = fract(vUv.y * 1.);
  vec4 color = vec4(vec3(0.099), 1.0);

  gl_FragColor = color;
}