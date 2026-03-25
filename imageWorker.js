self.addEventListener('message', function (e) {
  const { imageData, width, height } = e.data;
  const data = imageData.data;

  let minX = width, minY = height;
  let maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  self.postMessage({
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    x: minX,
    y: minY,
    imageData
  });
})