varying vec2 vUv;

attribute float instanceScale;
attribute float randomOffset;
attribute vec4 rgba;
varying float vScale;
varying vec4 vRgba;
varying float vRandomOffset;

void main() {
  vUv = uv;
  vScale = instanceScale;
  vRgba = rgba;
  vRandomOffset = randomOffset;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
}