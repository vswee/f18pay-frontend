const parseImgSrc = (logo) => {
  if(!logo.data.length){return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}
  let bufferArray = new Uint8Array(logo.data)
  let binary = '';
  const bytes = new Uint8Array(bufferArray);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64String = binary//btoa(btoa(binary))
  let storeLogo = `${base64String}`
  return storeLogo
}

export {parseImgSrc}