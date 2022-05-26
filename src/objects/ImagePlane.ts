import * as THREE from 'three'
import vertex from '../shaders/thumbnail.vert'
import fragment from '../shaders/thumbnail.frag'
import Contents from '~/contents'

export default class ImagePlane {
  private static id = 0
  private _container: THREE.Object3D
  private _mesh: THREE.Mesh | undefined
  private index = 0
  
  public get container(): THREE.Object3D {
    return this._container
  }

  public get mesh(): THREE.Mesh | undefined {
    return this._mesh
  }

  constructor(readonly img: HTMLImageElement) {
    this.index = ImagePlane.id++
    this._container = new THREE.Object3D()
  }

  public createMesh(img: HTMLImageElement): Promise<THREE.Mesh> {


    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader()
      loader.load(img.src, (texture) => {
        const uniforms = {
          iTexture: { value: texture },
          iImageAspect: { value: img.naturalWidth / img.naturalHeight },
          iPlaneAspect: { value: img.clientWidth / img.clientHeight },
          iOffset: { value: 0 },
          iTime: { value: 0 },
          iProgress: { value: 0 },
          iType: { value: this.index % 3 },
        };
        const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1); // 後から画像のサイズにscaleするので1にしておく
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: vertex,
          fragmentShader: fragment,
          // transparent: true,
          depthTest: true,
        });
        
        const mesh = new THREE.Mesh(geometry, material)
        this._mesh = mesh
        
        resolve(mesh)
      })
    })
  };


  // ---------------------------------
  // PUBLIC
  // ---------------------------------

  update (scrollOffset: number, time: number, progress: number) {
    const width = window.innerWidth * Contents.dpr
    const height = window.innerHeight * Contents.dpr
    const rect = this.img.getBoundingClientRect();

    if (this.mesh) {
      this.mesh.scale.x = rect.width / Contents.dpr;
      this.mesh.scale.y = rect.height / Contents.dpr;

      const x = rect.left - width / 2 + rect.width / 2;
      const y = -rect.top + height / 2 - rect.height / 2;
      this.mesh.position.set(x / Contents.dpr, y / Contents.dpr, this.mesh.position.z)

      const material: THREE.ShaderMaterial = this.mesh.material as THREE.ShaderMaterial
      material.uniforms.iOffset.value = scrollOffset
      material.uniforms.iTime.value = time
      material.uniforms.iProgress.value = progress
      material.uniforms.iPlaneAspect.value = this.img.clientWidth / this.img.clientHeight
    }
  }
}
