import { EventEmitter } from 'events'
import * as THREE from 'three'
import ImagePlane from '~/objects/ImagePlane'
import BgPlane from '~/objects/BgPlane'

export default class ImagesScene extends EventEmitter {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private imagePlanes: ImagePlane[] = []
  private bgPlanes: BgPlane[] = []
  
  constructor(readonly renderer: THREE.Renderer, scene: THREE.Scene = new THREE.Scene(), camera: THREE.PerspectiveCamera | undefined = undefined) {
    super()
    
    if (camera) {
      this.camera = camera
    } else {
      this.camera = this.initCamera()
    }

    this.scene = scene
    
    this.initObjects()
  }

  private initCamera() {
    const width = window.innerWidth
    const height = window.innerHeight

    const fov = 60; // 視野角
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = height / 2 / Math.tan(fovRad);
    const camera = new THREE.PerspectiveCamera(
      fov,
      width / height,
      0.1,
      10000
    );
    camera.position.z = dist;

    return camera
  }

  private initObjects() {
    const images = [...document.querySelectorAll('.img')]
    const promises: Promise<THREE.Mesh>[] = []

    images.forEach((el) => {
      const img: HTMLImageElement = el as HTMLImageElement
      
      if (img) {
        const imagePlane = new ImagePlane(img)
        promises.push(imagePlane.createMesh(img))
        this.imagePlanes.push(imagePlane);

        // const bgPlane = new BgPlane(img)
        // bgPlane.mesh.position.set(0, 0, 0.1)
        // this.bgPlanes.push(bgPlane)
        // this.scene.add(bgPlane.mesh)
      }
    })
      
    Promise.all(promises).then((meshList) => {
      for (const mesh of meshList) {
        this.scene.add(mesh)
      }
      this.emit('onInit')
    })
  }
  
  // ---------------------------------
  // PUBLIC
  // ---------------------------------

  public resize () {
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public render(scrollOffset: number, elapsedTime: number, alphaList: any[] = []): void {
    this.imagePlanes.forEach((imagePlane, index) => {
      const alpha = alphaList[index] ? alphaList[index].alpha : 1
      imagePlane.update(scrollOffset, elapsedTime, alpha)
    })

    // this.bgPlanes.forEach((bgPlane, index) => {
    //   const alpha = alphaList[index] ? alphaList[index].alpha : 1
    //   bgPlane.update(scrollOffset, alpha)
    // })


    this.renderer.render(this.scene, this.camera)
  }
}
