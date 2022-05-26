import { lerp } from '~/utils'

const LERP_MULTIPLIER = 0.5

class ScrollObserver {
  private scrollArea: HTMLDivElement
  private targetScrollY: number = 0 // 本来のスクロール位置
  public currentScrollY: number = 0 // 線形補間を適用した現在のスクロール位置
  private _scrollOffset: number = 0 // 上記2つの差分
  private fixedElements: any = []

  public get scrollOffset(): number {
    return this._scrollOffset
  }

  constructor () {
    this.scrollArea = document.querySelector('.scrollable') as HTMLDivElement
    document.body.style.height = `${this.scrollArea.getBoundingClientRect().height}px`;

    this.fixedElements =  document.querySelectorAll('.fixed')
  }

  // ---------------------------------
  // PUBLIC
  // ---------------------------------

  public update() {
    this.targetScrollY = document.documentElement.scrollTop
    this.currentScrollY = lerp(this.currentScrollY, this.targetScrollY, LERP_MULTIPLIER)
    this._scrollOffset = this.targetScrollY - this.currentScrollY

    this.scrollArea.style.transform = `translate3d(0, ${-this.currentScrollY}px, 0)`

    this.fixedElements.forEach((element: any) => {
      element.style.transform = `translate3d(0, ${this.currentScrollY}px, 0)`
    })
  }
}

export default new ScrollObserver()
