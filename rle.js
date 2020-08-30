// We don't need to represent 0 in run lengths, so the range is [1, maxRun].
const maxRun = 36;

class RLE {
  // Returns two strings in a JSON-encoded array:
  // 0: the individual characters, one per run, concatenated as a string.
  // 1: the length of the runs, one char per run, each char a number encoded in base 36, concatenated as a string.
  static encode(s) {
    let chars = '';
    let runs = '';
    let lastC = s[0];
    let run=1;
    for(let i=1; i<s.length; i++) {
      let c = s[i];

      if (c != lastC || run >= maxRun) {
        chars += lastC;
        runs += ((run-1).toString(maxRun));
        run = 1;
      } else {
        run++;
      }
      lastC = c;
    }
    chars += lastC;
    runs += ((run-1).toString(maxRun));

    return JSON.stringify([chars, runs]);
  }

  static decode(s) {
    let parts = JSON.parse(s);
    let chars = parts[0];
    let runs = parts[1];
    let ret = '';
    for(let i=0; i<chars.length; i++) {
      ret += chars[i].repeat(parseInt(runs[i], maxRun)+1);
    }
    return ret;
  }
}

export { RLE };
