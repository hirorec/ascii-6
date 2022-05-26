export const createCharsMap = (black: boolean = false, transparent: boolean = false) => {
  const canvas = document.querySelector('canvas.chars') as HTMLCanvasElement;
  canvas.width = 1320
  canvas.height = 20

  const fontSize = 20
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  if (!transparent) {
    if (black) {
      ctx.fillStyle = '#000000'
    } else {
      ctx.fillStyle = '#ffffff'
    }
    
    ctx.fillRect(0, 0, 1320, 20)
  }
  
  ctx.font = `100 ${fontSize}px 'helvetica'`
  ctx.textAlign = 'left';
  ctx.textBaseline = "top"
  
  const str = '`,:;_-^"Il!i><~+?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
  // console.log(str.length, str.length * 20)

  if (black) { 
    ctx.fillStyle = '#ffffff'
  } else {
    ctx.fillStyle = '#000000'
  }
  
  str.split('').forEach((char, i) => {
    ctx.fillText(char, fontSize * i + 4, 1)
  })

  return canvas.toDataURL()
};