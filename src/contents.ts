import '@/assets/scss/style.scss'
import { EventEmitter } from 'events'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { FIX_SIZE } from '@/constants'
import Scene from '@/scenes/ImagesScene'
import scrollObserver from './controls/ScrollObserver'

export default class Contents extends EventEmitter {
  public static dpr = Math.min(1.5, window.devicePixelRatio)
  private scene: Scene
  public renderer: THREE.WebGLRenderer
  public canvas: HTMLCanvasElement
  public context: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  public alphaList: any[] =[]

  public get contentsSize() {
    return {
      width: window.innerWidth / FIX_SIZE,
      height: window.innerHeight / FIX_SIZE,
    }
  }

  constructor() {
    super()

    this.canvas = document.querySelector('canvas.contents') as HTMLCanvasElement
    this.drawCanvas = document.querySelector('canvas.drawCanvas') as HTMLCanvasElement
    this.context = this.drawCanvas.getContext('2d') as CanvasRenderingContext2D
    document.body.appendChild(this.drawCanvas)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // antialias: true,
      alpha: true,
      // preserveDrawingBuffer: true
    })
    this.renderer.setPixelRatio(Contents.dpr)
    // this.renderer.setClearColor(0xFF0000)

    this.scene = new Scene(this.renderer)
    this.resize()

    this.scene.on('onInit', () => {
      this.emit('onInit')
    })
    // this.initScroll()
  }

  public initScroll() {
    const elements = document.querySelectorAll('.image-item')
    
    elements.forEach((el, index) => {
      const img: HTMLImageElement = el.querySelector('.img') as HTMLImageElement 
      this.alphaList.push({
        alpha: 0,
      })

      const data = this.alphaList[index]
      gsap.fromTo(data, {
        alpha: 0,
      }, {
        alpha: 2,
        duration: 1,
        scrollTrigger: {
          trigger: el,
          start: '50% center',
          end: '100% center',
          scrub: true,
          pin: true,
          markers: true,
          onUpdate: ({ progress }) => {
            // console.log(progress)
            this.emit('onUpdate', progress)
          },
          onEnter: () => {
            img.classList.remove('visible')
            this.emit('onEnter', index)
          },
          onLeave: () => {
            img.classList.add('visible')
            this.emit('onLeave', index)
          },
          onEnterBack: () => {
            img.classList.remove('visible')
            this.emit('onEnterBack', index)
          }
        },
      })
    })
  }

  public resize() {
    this.renderer.setSize(this.contentsSize.width, this.contentsSize.height)

    this.drawCanvas.width = this.contentsSize.width
    this.drawCanvas.height = this.contentsSize.height
    
    this.scene.resize()
  }

  public render(elapsedTime: number) {
    this.scene.render(scrollObserver.scrollOffset, elapsedTime, this.alphaList)
  }
}
