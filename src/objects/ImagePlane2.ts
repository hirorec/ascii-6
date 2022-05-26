import * as THREE from 'three'
import scrollObserver from '~/controls/ScrollObserver'
import App from '@/index'
import vertex from '../shaders/image.vert'
import fragment from '../shaders/image.frag'
import { FIX_SIZE } from '@/constants'

export default class ImagePlane {
  private _container: THREE.Object3D
  private _mesh: THREE.Mesh | undefined
  private size = {
    x: 0,
    y: 0,
  }
  
  public get container(): THREE.Object3D {
    return this._container
  }

  public get mesh(): THREE.Mesh | undefined {
    return this._mesh
  }

  constructor(readonly img: HTMLImageElement, size: { x: number, y: number }) {
    this.size = size
    this._container = new THREE.Object3D()
  }

  public createMesh(img: HTMLImageElement): Promise<THREE.Mesh> {
    // console.log((this.size.y+ 18) * 10 - window.innerHeight)
    const rect = this.img.getBoundingClientRect();
    const x = Math.floor(rect.width / FIX_SIZE)
    const y = Math.floor(rect.height / FIX_SIZE)
    
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
          iSegments: { value: new THREE.Vector2(x, y) },
          iColorMode: { value: 0 },
          iVisible: { value: false },
        };
        const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: vertex,
          fragmentShader: fragment,
          transparent: true,
          depthTest: true,
        });
        
        const mesh = new THREE.Mesh(geometry, material)
        this._mesh = mesh
        
        resolve(mesh)
      })
    })
  };

  public resize(size: { x: number, y: number }) {
    this.size = size

    const material: THREE.ShaderMaterial = this.mesh?.material as THREE.ShaderMaterial

    if (material) {
      const rect = this.img.getBoundingClientRect();
      const x = Math.floor(rect.width / FIX_SIZE)
      const y  = Math.floor(rect.height / FIX_SIZE)
      material.uniforms.iSegments.value = new THREE.Vector2(x, y)
    }
  }

  public update(time: number, progress: number, debug: boolean = false) {
    const width = window.innerWidth
    const height = window.innerHeight
    const rect = this.img.getBoundingClientRect();

    if (this.mesh) {
      this.mesh.scale.x = rect.width;
      this.mesh.scale.y = rect.height;

      const x = rect.left - width / 2 + rect.width / 2;
      const y = -rect.top + height / 2 - rect.height / 2;
      this.mesh.position.set(x, y, 0.1)

      const material: THREE.ShaderMaterial = this.mesh.material as THREE.ShaderMaterial

      if (debug) {
        // console.log(rect)
        // console.log(progress)
      }
      
      material.uniforms.iOffset.value = scrollObserver.currentScrollY / (window.innerHeight + 185)
      material.uniforms.iTime.value = time
      material.uniforms.iProgress.value = progress
      material.uniforms.iColorMode.value = App.colorMode
      material.uniforms.iPlaneAspect.value = this.img.clientWidth / this.img.clientHeight
    }
  }

  public setVisible(visible: boolean) {
    const material: THREE.ShaderMaterial = this.mesh?.material as THREE.ShaderMaterial
    if (material) {
      material.uniforms.iVisible.value = visible
    }
  }
}
