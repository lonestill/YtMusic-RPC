export function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 40
      canvas.height = 40
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve('#fc3c44'); return }

      ctx.drawImage(img, 0, 0, 40, 40)
      const data = ctx.getImageData(0, 0, 40, 40).data

      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 16) {
        // skip very dark and very light pixels
        const pr = data[i], pg = data[i+1], pb = data[i+2]
        const brightness = (pr + pg + pb) / 3
        if (brightness < 20 || brightness > 235) continue
        r += pr; g += pg; b += pb; count++
      }

      if (count === 0) { resolve('#fc3c44'); return }
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)

      // boost saturation so the color pops
      const max = Math.max(r, g, b)
      const factor = max > 0 ? Math.min(255 / max, 1.6) : 1
      r = Math.min(255, Math.round(r * factor))
      g = Math.min(255, Math.round(g * factor))
      b = Math.min(255, Math.round(b * factor))

      resolve(`rgb(${r},${g},${b})`)
    }
    img.onerror = () => resolve('#fc3c44')
    img.src = imageUrl
  })
}
