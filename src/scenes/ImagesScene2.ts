import * as THREE from 'three'
import ImagePlane from '~/objects/ImagePlane2'

export default class ImagesScene {
  private size = {
    x: 0,
    y: 0,
  }
  private imagePlanes: ImagePlane[] = []
  
  constructor(readonly renderer: THREE.Renderer, size: { x: number, y: number }, readonly camera: THREE.PerspectiveCamera, readonly scene: THREE.Scene) {
    this.size = size;
    this.initObjects()
  }

  private initObjects() {
    const images = [...document.querySelectorAll('.img')]
    const promises: Promise<THREE.Mesh>[] = []

    images.forEach((el) => {
      const img: HTMLImageElement = el as HTMLImageElement
      
      if (img) {
        const imagePlane = new ImagePlane(img, this.size)
        promises.push(imagePlane.createMesh(img))
        this.imagePlanes.push(imagePlane);
      }
    })
      
    Promise.all(promises).then((meshList) => {
      for (const mesh of meshList) {
        this.scene.add(mesh)
      }
    })
  }
  
  // ---------------------------------
  // PUBLIC
  // ---------------------------------

  public resize (size: { x: number, y: number }) {
    for (let imagePlane of this.imagePlanes) {
      imagePlane.resize(size)
    }
  }

  public render(elapsedTime: number, alphaList: any[] = []): void {
    // console.log(scrollOffset)
    this.imagePlanes.forEach((imagePlane, index) => {
      if (alphaList[index]) {
        const alpha = alphaList[index].alpha;
        imagePlane.update(elapsedTime, alpha, index===0)
      }
    })
    
    this.renderer.render(this.scene, this.camera)
  }

  setVisible(visible: boolean, index: number): void {
    this.imagePlanes[index]?.setVisible(visible)
  }
}
