import * as THREE from 'three'
import vertex from '../shaders/bg.vert'
import fragment from '../shaders/bg.frag'

export default class BgPlane {
  public mesh: THREE.Mesh
  
  constructor(readonly img: HTMLImageElement) {
    const uniforms = {
      iTime: { value: 0 },
      iProgress: { value: 0 },
    };
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: true,
      blending: THREE.AdditiveBlending
    });
    
    const mesh = new THREE.Mesh(geometry, material)
    this.mesh = mesh
  }

  public update(time: number, alpha: number) {
    const width = window.innerWidth
    const height = window.innerHeight
    const rect = this.img.getBoundingClientRect();

    if (this.mesh) {
      this.mesh.scale.x = width;
      this.mesh.scale.y = height;

      const x = rect.left - width / 2 + rect.width / 2;
      const y = -rect.top + height / 2 - rect.height / 2;
      this.mesh.position.set(x, y, this.mesh.position.z)

      const material: any = this.mesh.material as THREE.ShaderMaterial
      material.uniforms.iTime.value = time
      material.uniforms.iProgress.value = alpha
    }
  }
}
