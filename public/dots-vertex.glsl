attribute float size;
attribute vec3 customColor;
attribute float customAlpha;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = customColor;
  vAlpha = customAlpha;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (50.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
