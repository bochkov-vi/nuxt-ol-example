export function tileToBBOX(z: number, x: number, y: number) {
  const tileSize = 256 // Standard tile size

  // Calculate the top-left point of the tile in pixel coordinates
  const topLeftPixelX = x * tileSize
  const topLeftPixelY = y * tileSize

  // Calculate the bottom-right point of the tile in pixel coordinates
  const bottomRightPixelX = (x + 1) * tileSize
  const bottomRightPixelY = (y + 1) * tileSize

  // Function to convert pixel coordinates to longitude
  function pixelXToLon(pixelX: number, zoom: number) {
    const worldSize = tileSize * Math.pow(2, zoom)
    const xCoord = (pixelX / worldSize) * 2 * Math.PI - Math.PI
    return (xCoord * 180) / Math.PI
  }

  // Function to convert pixel coordinates to latitude
  function pixelYToLat(pixelY: number, zoom: number) {
    const worldSize = tileSize * Math.pow(2, zoom)
    const yCoord = Math.PI - (pixelY / worldSize) * 2 * Math.PI
    return (Math.atan(Math.exp(yCoord)) * 360) / Math.PI - 90
  }

  const north = pixelYToLat(topLeftPixelY, z)
  const south = pixelYToLat(bottomRightPixelY, z)
  const west = pixelXToLon(topLeftPixelX, z)
  const east = pixelXToLon(bottomRightPixelX, z)

  return {west, south, east, north}
}
