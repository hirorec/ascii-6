varying vec2 vUv;
uniform sampler2D iTexture;
uniform float iImageAspect;
uniform float iPlaneAspect;
uniform float iOffset;
uniform float iTime;
uniform float iProgress;
uniform int iType;

float PI = 3.1415926535897932384626433832795;

float random(in vec2 _st) {
  return fract(sin(dot(_st.xy, vec2(12.9898, 78.233)))*43758.5453123);
}

void main(){
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

  vec4 texture = texture2D(iTexture, fixedUv);
  vec4 color = vec4(0.0);

  float border = 1.;
  float h = 10.0;
  // float rnd = iProgress * (sin(vUv.x * 1320.0) * 0.3 + 1.0) / 2.0;
  float rnd = random(vec2(vUv.x));
  float maskValue1 = smoothstep(1. - h, 1., vUv.y + mix(-h/2., 1. - h/2., 1.0 - iProgress - rnd));
  float maskValue2 = smoothstep(1. - h, 1., vUv.x + mix(-h/2., 1. - h/2., 1.0 - iProgress - rnd));
  
  float mask = maskValue1 * 2.0;
  float borderGradient = 0.0001;
  float final = smoothstep(border, border + borderGradient , mask);
  vec4 transparent = vec4(0.0);
  color = mix(texture, transparent, final);
  color.a *= iProgress ;

  gl_FragColor = color;
}