varying vec2 vUv;
varying float vScale;
varying float vRandomOffset;
varying vec4 vRgba;
uniform sampler2D iChars;
uniform float iTime;
uniform int iColorMode;
uniform float iProgress;

#define R_LUMINANCE 0.298912
#define G_LUMINANCE 0.586611
#define B_LUMINANCE 0.114478
const vec3 monochromeScale = vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE);

void main() {
  // float size = 256.0;
  float size = 66.0; 
  vec2 newUV = vUv;

  float s = vScale;

  if (s > 0.0) {
    s += sin(iTime * vRandomOffset*2.) * 0.05;
    s = min(s, 0.999);
  }
  

  newUV.x = vUv.x / size + floor(s * size) / size;

  if (iColorMode == 0) {
    float scale = 1.0 - vScale;

    if (scale >= 1.) {
      scale = 0.0;
    }

    newUV.x = vUv.x / size + floor(scale * size) / size;
  }
  
  vec4 color = texture2D(iChars, newUV);

  if (iProgress >= 1.0) {
    s = 0.0;
    newUV.x = vUv.x / size + floor(s * size) / size;
    color = texture2D(iChars, newUV);
    gl_FragColor = color;
    return;
  }

  float grad = (1.0 - vUv.y) - (1.0 - iProgress);

  float grayColor = dot(vRgba.rgb, monochromeScale);
  grayColor = 1.0 * min(iProgress * 2.0, 1.0) - grayColor;

  if (grayColor > 0.001 && newUV.x > 0.1) {
    float g = 1.0 - grayColor;
    // color.rgb *= vec3(g);

    float threshold = 0.85;

    // color.rgb = mix(color.rgb, vRgba.rgb, iProgress);

    if (grayColor > 0.4) {
      color.rgb = mix(color.rgb, vRgba.rgb, iProgress);
    }
    // float grayColor2 = dot(vRgba.rgb, monochromeScale);
    // color.a = step(threshold, mix(grayColor2, grad, 0.8));

    // if (iColorMode == 1) {
    //   float g = pow((1.0 - grayColor) * 1.5, 0.3);

    //   color.rgb *= vec3(g);
      
    // } else {
    //   float g = grayColor * 0.5;
    //   color.rgb += vec3(g); 
    // }

    
  }

  gl_FragColor = color;
}