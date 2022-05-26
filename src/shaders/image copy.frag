varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D iTexture;
uniform float iImageAspect;
uniform float iPlaneAspect;
uniform float iOffset;
uniform float iTime;
uniform float iProgress;
uniform vec2 iSegments;
uniform float iSegmentSize;
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

  float x = (fixedUv.x / iSegments.x) + floor(fixedUv.x * iSegments.x) / iSegments.x;
  float y = (fixedUv.y / iSegments.y) + floor(fixedUv.y * iSegments.y) / iSegments.y; //- (mod(1.0, iOffset));
  
  vec4 texture2 = texture2D(iTexture, fixedUv);
  // vec4 texture2 = texture2D(iTexture, vec2(x, y));
  float grayColor = dot(texture2.rgb, monochromeScale);
  grayColor = 1.0 - smoothstep(0.0, 1.0, grayColor);

  // float threshold = 0.1;
  // float a = step(threshold, (1.0 - x) * iProgress);

  vec4 color = texture1;
  vec4 gray = vec4(1.0 - grayColor);

  // if (iColorMode == 0) {
  //   gray = vec4(grayColor);
  // }

  float p = iProgress / 2.0;
  p = pow(p, 1.8);

  color.rgb = mix(gray.rgb, color.rgb, smoothstep(1.7, 2.0, iProgress));
  
  if (color.a > 0.01) {
    if (iColorMode == 0) {
      color.a = smoothstep(0.85, 1.0, (((1.0 - grayColor) * p) + p));
    } else {
      color.a = smoothstep(0.85, 1.0, ((grayColor * p) + p));
      // color.a = step(0.85, ((grayColor * p) + p));
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

  gl_FragColor = color;
  // gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}