/**
 * Leitor de literais JavaScript (objetos, arrays, strings, números).
 * Lê dados embutidos em bundles de outras lojas SEM executar código (nada de eval).
 */

export type Lit = string | number | boolean | null | Lit[] | { [k: string]: Lit };

export function parseLiteral(src: string, start = 0): { value: Lit; end: number } {
  let i = start;

  const ws = () => {
    while (i < src.length && /\s/.test(src[i])) i++;
  };

  const str = (q: string): string => {
    i++; // abre
    let out = "";
    while (i < src.length) {
      const ch = src[i];
      if (ch === "\\") {
        const n = src[i + 1];
        const map: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" };
        if (n === "u") {
          if (src[i + 2] === "{") {
            const close = src.indexOf("}", i);
            out += String.fromCodePoint(parseInt(src.slice(i + 3, close), 16));
            i = close + 1;
          } else {
            out += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16));
            i += 6;
          }
          continue;
        }
        if (n === "x") {
          out += String.fromCharCode(parseInt(src.slice(i + 2, i + 4), 16));
          i += 4;
          continue;
        }
        if (n === "\n") {
          i += 2;
          continue;
        }
        out += map[n] ?? n;
        i += 2;
        continue;
      }
      if (q === "`" && ch === "$" && src[i + 1] === "{") throw new Error("template com expressão não suportado");
      if (ch === q) {
        i++;
        return out;
      }
      out += ch;
      i++;
    }
    throw new Error("string não fechada");
  };

  const ident = () => {
    const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 64));
    if (!m) throw new Error(`token inesperado em ${i}: ${src.slice(i, i + 20)}`);
    i += m[0].length;
    return m[0];
  };

  const value = (): Lit => {
    ws();
    const ch = src[i];
    if (ch === "{") {
      i++;
      const obj: Record<string, Lit> = {};
      for (;;) {
        ws();
        if (src[i] === "}") {
          i++;
          return obj;
        }
        const key = src[i] === '"' || src[i] === "'" || src[i] === "`" ? str(src[i]) : /\d/.test(src[i]) ? String(num()) : ident();
        ws();
        if (src[i] !== ":") throw new Error(`esperado ":" em ${i}`);
        i++;
        obj[key] = value();
        ws();
        if (src[i] === ",") i++;
      }
    }
    if (ch === "[") {
      i++;
      const arr: Lit[] = [];
      for (;;) {
        ws();
        if (src[i] === "]") {
          i++;
          return arr;
        }
        if (src[i] === ",") {
          arr.push(null);
          i++;
          continue;
        }
        arr.push(value());
        ws();
        if (src[i] === ",") i++;
      }
    }
    if (ch === '"' || ch === "'" || ch === "`") return str(ch);
    if (ch === "!") {
      // !0 = true, !1 = false (código minificado)
      i++;
      const n = num();
      return !n;
    }
    if (ch === "-" || ch === "." || /\d/.test(ch)) return num();
    const id = ident();
    if (id === "true") return true;
    if (id === "false") return false;
    if (id === "null") return null;
    if (id === "void") {
      ws();
      num();
      return null;
    }
    if (id === "undefined") return null;
    throw new Error(`identificador não suportado: ${id}`);
  };

  const num = (): number => {
    const m = /^-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)/i.exec(src.slice(i, i + 40));
    if (!m) throw new Error(`número inválido em ${i}`);
    i += m[0].length;
    return Number(m[0]);
  };

  const v = value();
  return { value: v, end: i };
}
