varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D iTexture;
uniform float iImageAspect;
uniform float iPlaneAspect;
uniform float iOffset;
uniform float iTime;
uniform float iProgress;
uniform vec2 iSegments;
uniform vec2 iResolution;
uniform vec2 iPlaneSize;
uniform float iGridSize;
uniform int iColorMode;
uniform bool iVisible;

#define R_LUMINANCE 0.298912
#define G_LUMINANCE 0.586611
#define B_LUMINANCE 0.114478
const vec3 monochromeScale = vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE);

float random(in vec2 _st) {
  return fract(sin(dot(_st.xy, vec2(12.9898, 78.233)))*43758.5453123);
}

void main(){
  if (!iVisible) {
    discard;
    return;
  }

  // 画像のアスペクトとプレーンオブジェクトのアスペクトを比較し、短い方に合わせる
  vec2 ratio = vec2(
    min(iPlaneAspect / iImageAspect, 1.0),
    min((1.0 / iPlaneAspect) / (1.0 / iImageAspect), 1.0)
  );

  // 計算結果を用いてテクスチャを中央に配置
  vec2 fixedUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 texture1 = texture2D(iTexture, fixedUv);

  vec2 size = iSegments * (iPlaneSize / iResolution);
  vec2 uv = vUv;
  uv -= 0.5;
  uv = floor(uv * size) / size;
  uv += 0.5;
  
  vec4 texture2 = texture2D(iTexture, uv);
  float grayColor = dot(texture2.rgb, monochromeScale);
  grayColor = 1.0 - smoothstep(0.0, 1.0, grayColor);

  // vec4 texture3 = texture2D(iTexture, fixedUv);
  // float grayColor2 = dot(texture3.rgb, monochromeScale);
  // grayColor2 = 1.0 - smoothstep(0.0, 1.0, grayColor2);

  // float threshold = 0.1;
  // float a = step(threshold, (1.0 - x) * iProgress);

  vec4 color = texture1;
  vec4 gray = vec4(1.0 - grayColor);

  // if (iColorMode == 0) {
  //   gray = vec4(grayColor);
  // }

  float p = iProgress / 2.0;
  p = pow(p, 1.8);

  // color.rgb = mix(vec4(1.0 - grayColor2).rgb, color.rgb, smoothstep(1.7, 2.0, iProgress));
  
  float grad = (1.0 - vUv.y) - (1.0 - iProgress);
  float threshold = 0.85;

  if (color.a > 0.0) {
    if (iColorMode == 0) {
      // color.a = smoothstep(0.85, 1.0, (((1.0 - grayColor) * p) + p));
      color.a = step(threshold, (((1.0 - grayColor) * p) + p));
    } else {
      // color.a = smoothstep(0.85, 1.0, ((grayColor * p) + p));
      if (iProgress > threshold) {
        // color.a = step(threshold, mix(grayColor, grad, 0.8));
        // color.a = smoothstep(threshold, 1.0, mix(grayColor, grad, iProgress));
        color.a = step(threshold, ((grayColor * p) + p));
      } else {
        color.a = 0.0;
      }
      
      // color.a = smoothstep(0.85, 1.0, mix(grayColor, grad, iProgress));
      // color.a *= iProgress;
    }
  }
  
  // color.a = 0.0;
  
  // color.a = step(0.9, ((grayColor * p) + p) / 1.0);

  // float border = 1.;
  // float h = 2000.0;
	// float maskValue = smoothstep(1. - h, 1., x + mix(-h/2., 1. - h/2., 1.0 - iProgress));
  // float mask = maskValue * 2.0;
  // float borderGradient = 0.0001;
  // float final = smoothstep(border, border + borderGradient , mask);
  // vec4 transparent = vec4(0.0);
  // color = mix(texture1, transparent, final);

  // gl_FragColor = vec4(vec3(color.a), 1.0);
  gl_FragColor = color;
  // gl_FragColor = vec4(vec3(texture2.rgb), 0.8);
  // gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}