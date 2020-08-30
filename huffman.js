class Huffman {
  static newEncoder(s) {
    let enc = new Huffman();

    enc.f = {};
    for (let i = 0; i < s.length; i++) {
      let c = s[i];
      enc.f[c] = (enc.f[c] ? enc.f[c] : 0) + 1;
    }

    const queue = [];
    Object.keys(enc.f).forEach((k) => {
      queue.push({ k: k, f: enc.f[k] });
    });

    while (queue.length > 1) {
      queue.sort((a, b) => {
        return a.f > b.f ? -1 : 1;
      });
      let smallest = queue.pop();
      let nextSmallest = queue.pop();

      let newNode = {
        left: smallest,
        right: nextSmallest,
        k: smallest.k + nextSmallest.k,
        f: smallest.f + nextSmallest.f
      };
      queue.push(newNode);
    }
    enc.root = queue[0];
    enc.charMap = {};
    Object.keys(enc.f).forEach((k) => {
      enc.charMap[k] = enc.bits(enc.root, k);
    });

    enc.encoded = JSON.stringify([
      enc.charMap,
      BigInt("0b" + enc._encode(s)).toString(36)
    ]);

    return enc;
  }

  // Credit: https://stackoverflow.com/questions/55646698/base-36-to-bigint
  // BigInt will *format* to base 36, but will not *parse* it. Fuckin' ECMA, man.
  _parseBase(value, radix) {
    var size = 10,
      factor = BigInt(radix ** size),
      i = value.length % size || size,
      parts = [value.slice(0, i)];

    while (i < value.length) parts.push(value.slice(i, (i += size)));

    return parts.reduce((r, v) => r * factor + BigInt(parseInt(v, radix)), 0n);
  }

  _decode(enc) {
    let bi = this._parseBase(enc, 36).toString(2);
    let ret = "";
    let keys = Object.keys(this.bitsMap);
    let decoded = true;
    while (bi.length > 0 && decoded) {
      let decoded = false;
      keys.forEach((k) => {
        if (bi.indexOf(k) == 0) {
          ret += this.bitsMap[k];
          bi = bi.substring(k.length);
          decoded = true;
          return; // break
        }
      });
    }
    return ret;
  }

  static newDecoder(enc) {
    let ret = "";
    let decParts = JSON.parse(enc);
    let dec = new Huffman();
    dec.charMap = decParts[0];
    dec.bitsMap = {};
    Object.keys(dec.charMap).forEach((k) => {
      dec.bitsMap[dec.charMap[k].toString(2)] = k;
    });

    dec.decoded = dec._decode(decParts[1]);
    return dec;
  }

  bits(node, c) {
    if (node.k == c) {
      return "";
    }
    if (node.left.k.indexOf(c) != -1) {
      return "0" + this.bits(node.left, c);
    }
    if (node.right.k.indexOf(c) != -1) {
      return "1" + this.bits(node.right, c);
    }
    throw "shouldn't get here";
  }

  _encode(s) {
    let ret = "";
    for (let i = 0; i < s.length; i++) {
      ret += this.charMap[s[i]];
    }
    return ret;
  }

  // Returns a JSON-encoded array that contains [charMap, encodedBitsBase36]
  static encode(s) {
    let ht = Huffman.newEncoder(s);
    return ht.encoded;
  }

  // Parses a JSON-encoded array that contains [charMap, encodedBitsBase36] and
  // returns the original unencoded string.
  static decode(s) {
    let hd = Huffman.newDecoder(s);
    return hd.decoded;
  }
}

export { Huffman };
