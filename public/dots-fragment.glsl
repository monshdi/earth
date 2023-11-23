uniform vec3 color;
uniform sampler2D pointTexture;

varying vec3 vColor;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha) * texture2D(pointTexture, gl_PointCoord);
}
