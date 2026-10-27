// Makes large photos smaller in the browser before upload: scaled down to `maxSide` pixels
// and saved as WebP. SVG and GIF (vector / animated) are sent as they are, and so is any
// photo the conversion would not make smaller.
export async function shrinkImage(file: File, maxSide: number, quality = 0.85): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size < 300 * 1024) {
    bitmap.close()
    return file
  }
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality))
  if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" })
}
