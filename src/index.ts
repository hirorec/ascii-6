import '@/assets/scss/style.scss'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { FIX_SIZE } from '@/constants'
import Contents from './contents'
import ImageScene from '@/scenes/ImagesScene2'
// import scrollObserver from './controls/ScrollObserver'
import { createCharsMap } from '@/utils/chars'

import vertex from './shaders/ascii.vert'
import fragment from './shaders/ascii.frag'

const Stats = require('stats-js')
gsap.registerPlugin(ScrollTrigger)

export default class App {
  public static colorMode = 1

  private renderer: THREE.WebGLRenderer
  private stats: any
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private gridSize = 1
  private sizeX = 0
  private sizeY = 0
  private fixSize = FIX_SIZE
  private mesh: THREE.Mesh | null = null
  private contents: Contents
  private material: THREE.ShaderMaterial | null = null
  private clock: THREE.Clock = new THREE.Clock()
  private imageScene: ImageScene | null = null

  get cellSizeX() {
    return this.gridSize / this.sizeX
  }

  get cellSizeY() {
    return this.gridSize / this.sizeY
  }

  constructor(readonly canvas: HTMLCanvasElement) {
    createCharsMap()

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    })
    // this.renderer.setClearColor(0x000000, 0.0)

    this.updateSize()
    
    this.contents = new Contents()
    this.contents.on('onEnter', (index) => {
      console.log('onEnter', index)
      this.imageScene?.setVisible(true, index)
    })
    this.contents.on('onLeave', (index) => {
      console.log('onLeave', index)
      this.imageScene?.setVisible(false, index)
    })
    this.contents.on('onEnterBack', (index) => {
      console.log('onEnterBack', index)
      this.imageScene?.setVisible(true, index)
    })
    this.contents.on('onUpdate', (progress) => {
      // console.log('onUpdate', progress)
      if (this.material) {
        this.material.uniforms.iProgress.value = progress;
      }
    })
    this.contents.on('onInit', () => {
      this.contents.initScroll()
    })
    

    this.initStats()
    this.initScene()
    // this.updateObjects()

    this.imageScene = new ImageScene(this.renderer, { x: this.sizeX, y: this.sizeY }, this.camera!, this.scene!)
    
    this.initResize()
    this.initScroll()
    this.animate()
  }

  initStats() {
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)
  }

  initResize() {
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
  }

  initScene() {
    this.scene = new THREE.Scene()

    const width = window.innerWidth
    const height = window.innerHeight

    const fov = 60
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = height / 2 / Math.tan(fovRad);
    this.camera = new THREE.PerspectiveCamera(
      fov,
      width / height,
      0.1,
      10000
    );
    this.camera.position.z = dist;
  }

  updateSize() {
    const width = window.innerWidth 
    const height = window.innerHeight
    this.sizeX = Math.floor(width / this.fixSize)
    this.sizeY = Math.floor(height / this.fixSize)
  }

  updateObjects() {
    const width = window.innerWidth 
    const height = window.innerHeight
    const scene = this.scene!

    if (this.mesh) {
      this.mesh.clear()
      scene.remove(this.mesh)
    }
    
    this.material?.dispose()

    const uniforms = {
      iTime: { value: 0 },
      iProgress: { value: 0 },
      iChars: { value: new THREE.TextureLoader().load(createCharsMap()) },
      iChars2: { value: new THREE.TextureLoader().load(createCharsMap(false, true)) },
      iColorMode: { value: App.colorMode },
    }

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      transparent: true,
    })
    
    const size = Math.max(this.sizeX, this.sizeY)
    const geometry = new THREE.PlaneGeometry(this.cellSizeX, this.cellSizeY, 1, 1)
    const mesh = new THREE.InstancedMesh(geometry, material, size * size)
    const dummy = new THREE.Object3D();
    let count = 0
    const scales = new Float32Array(size * size)
    const randomOffset = new Float32Array(size * size)
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = j * this.cellSizeX - 0.5 + this.cellSizeX / 2
        const y = -i * this.cellSizeY + 0.5 - this.cellSizeY / 2
        dummy.position.set(x, y, 0)
        dummy.updateMatrix()
        // scales.set([Math.random()], count)
        mesh.setMatrixAt(count, dummy.matrix)
        randomOffset.set([Math.random()], count)
        count++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1))
    mesh.geometry.setAttribute('randomOffset', new THREE.InstancedBufferAttribute(randomOffset, 1))
    // mesh.geometry.setAttribute('rgb', new THREE.InstancedBufferAttribute(new Float32Array, 1))
    
    scene.add(mesh)
    mesh.scale.set(width, height, 1)

    this.mesh = mesh
    this.material = material
  }

  initScroll() {
    gsap.to(this, {
      scrollTrigger: {
        trigger: '#color-trigger1',
        start: 'top center',
        end: 'top center',
        // markers: true,
        onEnter: () => {
          console.log('onEnter')
          this.changeColor(true)
          App.colorMode = 0
        },
        onEnterBack: () => {
          console.log('onEnterBack')
          this.changeColor(false)
          App.colorMode = 1
        }
      },
    })

    gsap.to(this, {
      scrollTrigger: {
        trigger: '#color-trigger2',
        start: 'top center',
        end: 'top center',
        markers: true,
        onEnter: () => {
          console.log('onEnter')
          this.changeColor(false)
          App.colorMode = 1
        },
        onEnterBack: () => {
          console.log('onEnterBack')
          this.changeColor(true)
          App.colorMode = 0
        }
      },
    })
  }

  changeColor(black: boolean) {
    if (this.material) {
      if (black) {
        document.body.classList.add('black')
        this.material.uniforms.iChars.value = new THREE.TextureLoader().load(createCharsMap(true))
      } else {
        document.body.classList.remove('black')
        this.material.uniforms.iChars.value = new THREE.TextureLoader().load(createCharsMap())
      }
    }
  }

  animate() {
    this.stats.begin()
    this.render()
    this.stats.end()
    requestAnimationFrame(this.animate.bind(this))
  }

  resize() {
    this.updateSize()

    const width = window.innerWidth 
    const height = window.innerHeight
    
    if (this.camera) {
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height)
    this.updateObjects()
    this.imageScene?.resize({
      x: this.sizeX,
      y: this.sizeY,
    })
    this.contents.resize()
  }

  render() {
    if (!this.scene || !this.camera) {
      return
    }

    const elapsedTime = this.clock.getElapsedTime()
    
    // scrollObserver.update()
    
    this.renderer.render(this.scene, this.camera)
    this.renderContents(elapsedTime)
    this.imageScene?.render(elapsedTime, this.contents.alphaList)
  }

  renderContents(elapsedTime: number) {
    this.contents.render(elapsedTime)
    
    const size = Math.max(this.sizeX, this.sizeY)
    const { width, height } = this.contents.contentsSize
    const scales = new Float32Array(size * size)
    
    this.contents.context.clearRect(0, 0, width, height)
    this.contents.context.drawImage(this.contents.renderer.domElement, 0, 0, width, height, 0, 0, width, height)

    const imageData = this.contents.context.getImageData(0, 0, size, size)
    const rgba = new THREE.InstancedBufferAttribute(new Float32Array(imageData.data.length), 4)

    if (imageData) {
      let i = 0;
      let j = 0;
      while( i < imageData.data.length){
        rgba.setXYZW(j++, imageData.data[i++]/255, imageData.data[i++]/255, imageData.data[i++]/255, imageData.data[i++]/255)
      }

      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = imageData.data[i]

        if (value > 0) {
          scales.set([1 - imageData.data[i] / 255], i / 4)
        } else {
          scales.set([0], i / 4)
        }
      }
    }
    
    if (this.mesh) {
      this.mesh.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1))
      this.mesh.geometry.setAttribute('rgba', rgba)
      this.mesh.geometry.attributes.instanceScale.needsUpdate = true
    }

    if (this.material) {
      this.material.uniforms.iTime.value = elapsedTime;
      this.material.uniforms.iColorMode.value = App.colorMode;
    }
  }
}


new App(document.querySelector('canvas.webgl') as HTMLCanvasElement)