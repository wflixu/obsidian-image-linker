function buildMultipartBody(formData: FormData, boundary: string): Blob {
  const multipartPirces: Array<string | Blob> = multipartPiecesFrom(formData)
  return composeMultipartBodyFrom(multipartPirces, boundary)
}

export { buildMultipartBody }

function multipartPiecesFrom(formData: FormData) {
  const pieces: Array<string | Blob> = []
  formData.forEach((content, name) => {
    if (typeof content === 'string') {
      pieces.push(stringToFormDataSection(name, content))
    } else if (content instanceof File) {
      pieces.push(fileToFormDataSection(name, content))
    }
  })
  return pieces
}

const MIME_LINE_BREAK = '\r\n'
const DOUBLE_LINE_BREAK = `${MIME_LINE_BREAK}${MIME_LINE_BREAK}`

function stringToFormDataSection(formName: string, strValue: string): string {
  return `Content-Disposition: form-data; name="${formName}"${DOUBLE_LINE_BREAK}${strValue}`
}

function fileToFormDataSection(formName: string, file: File): Blob {
  const firstLine = `Content-Disposition: form-data; name="${formName}"; filename="${file.name}"`
  const contentType = file.type ? [MIME_LINE_BREAK, `Content-Type: ${file.type}`] : ['']
  return new Blob([firstLine, ...contentType, DOUBLE_LINE_BREAK, file])
}

function composeMultipartBodyFrom(multipartPieces: (string | Blob)[], boundaryLine: string) {
  const allPieces = addMultipartBoundaries(multipartPieces, boundaryLine)
  const singleBlob = new Blob(addLineBreaks(allPieces))
  return singleBlob
}

function addMultipartBoundaries(multipartPieces: BlobPart[], boundary: string) {
  const boundaryLine = `--${boundary}`
  const allPieces = multipartPieces.flatMap((p) => [boundaryLine, p])
  const finalBoundaryLine = `--${boundary}--`
  allPieces.push(finalBoundaryLine)
  return allPieces
}

function addLineBreaks(allPieces: BlobPart[]): BlobPart[] {
  const result = []
  for (let i = 0; i < allPieces.length; i++) {
    result.push(allPieces[i])
    if (i !== allPieces.length - 1) {
      result.push(MIME_LINE_BREAK)
    }
  }
  return result
}
