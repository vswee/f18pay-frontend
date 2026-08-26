const parseImgSrc = (logo) => {
  const empty = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  if (!logo) {
    return empty;
  }

  const toDataUrl = (bytes) => {
    if (!bytes.length) {
      return empty;
    }

    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    let mimeType = 'image/png';
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      mimeType = 'image/jpeg';
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      mimeType = 'image/gif';
    } else if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      mimeType = 'image/webp';
    }

    return `data:${mimeType};base64,${btoa(binary)}`;
  };

  let value = logo;
  for (let depth = 0; depth < 8; depth += 1) {
    if (typeof value === 'string') {
      if (!value.length || value === '\\x') {
        return empty;
      }

      if (value.startsWith('data:image/')) {
        return value;
      }

      if (value.startsWith('{')) {
        try {
          value = JSON.parse(value);
          continue;
        } catch {
          return empty;
        }
      }

      if (value.startsWith('\\x')) {
        const hex = value.slice(2);
        if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
          return empty;
        }

        const bytes = new Uint8Array(hex.length / 2);
        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
        }
        value = bytes;
        continue;
      }

      return value;
    }

    if (!value || typeof value !== 'object' || !value.data) {
      return empty;
    }

    const data = value.data;
    if (typeof data === 'string') {
      value = data;
      continue;
    }

    if (Array.isArray(data) || ArrayBuffer.isView(data)) {
      const bytes = Uint8Array.from(data);
      const decoded = new TextDecoder().decode(bytes);

      if (decoded.startsWith('{') || decoded.startsWith('data:image/')) {
        value = decoded;
        continue;
      }

      return toDataUrl(bytes);
    }

    return empty;
  }

  return empty;
}

export {parseImgSrc}
