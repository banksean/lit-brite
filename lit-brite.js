import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element/lit-element.js?module";
import { Huffman } from "./huffman.js";
import { RLE } from "./rle.js";

const colors = [
    "blank",
    "red",
    "blue",
    "orange",
    "white",
    "green",
    "yellow",
    "pink",
];

class LitBritePeg extends LitElement {
  constructor() {
    super();
    this.color = "blank";
  }

  static get properties() {
    return {
      color: { type: String },
      gen: { type: Number }
    };
  }

  static colorStyles() {
    // TODO: templatize this and build it from the colors array const.
    return css`
      .red {
        --color: red;
        background: red;
        filter: drop-shadow(0 0 0.75rem red);
      }
      .blue {
        --color: blue;
        background: blue;
        filter: drop-shadow(0 0 0.75rem blue);
      }
      .orange {
        --color: orange;
        background: orange;
        filter: drop-shadow(0 0 0.75rem orange);
      }
      .white {
        --color: white;
        background: white;
        filter: drop-shadow(0 0 0.75rem white);
      }
      .green {
        --color: green;
        background: green;
        filter: drop-shadow(0 0 0.75rem green);
      }
      .yellow {
        --color: yellow;
        background: yellow;
        filter: drop-shadow(0 0 0.75rem yellow);
      }
      .pink {
        --color: violet;
        background: violet;
        filter: drop-shadow(0 0 0.75rem violet);
      }
     .blank {
        --color: #333;
        background: #333;
      }
      div {
        background: var(--color);
        filter: drop-shadow(0 0 0.75rem var(--color));
      }
    `;
  }

  static get styles() {
    return css`
      div {
        border-radius: 50%;
        height: 0.21in;
        width: 0.21in;
        margin: 0.02in;
        color: black;
        text-align: center;
        font-size: 0.15in;
      }
      ${LitBritePeg.colorStyles()}
    `;
  }

  render() {
    return html`<div class=${this.color}><slot></slot></div>`;
  }
}

customElements.define("lit-brite-peg", LitBritePeg);


const numPegs = 12 * (30 + 31); // 24 alternating rows of 30 and 31 cols.
class LitBrite extends LitElement {
    static get properties() {
        return {
            colors: { type: String },
            pegs: { type: Array },
            colorCounts: { type: Map }
        };
    }

    constructor() {
        super();

        this.pegs = [];
        for (let i = 0; i < numPegs; i++) {
            this.pegs.push({ color: "blank" });
        }
        this.colors = colors.map((c) => {
            return { name: c, count: c == "blank" ? "" : 0 };
        });
        this.load();
    }

    // Returns a query string containing the serialized pegs, given an array of pegs.
    packPegs(pegs) {
        let ret = "";
        pegs.forEach((peg) => {
            ret += colors.indexOf(peg.color);
        });
        let h = Huffman.encode(ret);
        let r = RLE.encode(ret);
        // console.log('rle len:', r.length, 'huffman len:', h.length);
        // There's a problem with the Huffman encoding whenever you set the very first
        // peg value. Off by ONE!!!! Strikes again.
        if (true) { // (r.length < h.length) {
            return 'r=' + encodeURIComponent(r);
        } else {
          return 'h=' + encodeURIComponent(h);
        }
    }

    // Returns an array of pegs, given a query string containing the serialized pegs.
    unpackPegs(pegString) {
        if (pegString.indexOf('h=') == 0) {
            pegString = Huffman.decode(decodeURIComponent(pegString.substring(2)));
        } else if (pegString.indexOf('r=') == 0) {
            pegString = RLE.decode(decodeURIComponent(pegString.substring(2)));
        }
        let ret = [];
        for (let i = 0; i < pegString.length; i++) {
            ret.push({ color: colors[Number(pegString[i])] });
        }
        return ret;
    }

    save() {
        let pegStr = this.packPegs(this.pegs);
        history.replaceState({}, location.pathname, '?' + pegStr);
    }

    load() {
        if (!location.search) {
            return;
        }
        // TODO: smarter parsing for the peg string.
        let params = {};
        let query = location.search.substring(1);
        let vars = query.split('&');
        let pegStr = undefined;
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            params[pair[0]] = decodeURIComponent(pair[1]);
            if (pair[0] == 'r' || pair[0] == 'h') {
                pegStr = pair.join('=');
            }
        }
        if (pegStr) {
            this.pegs = this.unpackPegs(pegStr);
            this.updateColorCounts();
        }
    }

    static get styles() {
        return css `
      :host {
        display: flex;
        flex-direction: column;
        color: white;
        background-color: black;
        height: 7.25in;
        width: 8in;
      }
      #controls {
        padding: 0.25in;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        justify-content: space-around;
      }
      label > lit-brite-peg {
        display: flex;
      }
      input[type="radio"] {
        appearance: unset;
      }
      .color-selection,
      button {
        width: 0.5in;
        height: 0.5in;
        border-radius: 50%;
        background: #333;
        border: 0;
        outline: none;
      }
      button:hover {
        filter: drop-shadow(0 0 0.75rem white);
      }
      #clear:hover {
        filter: drop-shadow(0 0 0.75rem red);
      }
      .controls:hover {
        background: #666;
      }
      #peg-grid {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        margin-left: 0.125in;
      }
      lit-brite-peg:nth-child(61n + 1) {
        margin-left: 0.125in;
      }
      lit-brite-peg:nth-child(61n-31) {
        margin-right: 0.25in;
      }
     ${LitBritePeg.colorStyles()}
     .color-selection {
        text-align: center;
        filter: brightness(0.5);
        color: black;
        line-height: 0.5in;
      }
      input[type="radio"]:checked+.color-selection {
         filter: drop-shadow(0 0 0.75rem var(--color)) brightness(1.0);
      } 
    `;
    }

    pegClicked(evt) {
        let idx = Array.from(evt.target.parentNode.children).indexOf(evt.target);
        this.pegs[idx].color = this.shadowRoot.querySelector(
            'input[name="colorRadio"]:checked'
        ).value;
        this.pegs = [...this.pegs];
        this.updateColorCounts();
    }

    updateColorCounts() {
        let counts = {};
        this.pegs.forEach((peg) => {
            counts[peg.color] = (counts[peg.color] || 0) + 1;
        });
        this.colors.forEach((color) => {
            if (color.name != "blank") {
                color.count = counts[color.name] || 0;
            }
        });
        this.colors = [...this.colors];
    }

    saveClicked(evt) {
        this.save();
    }

    clearClicked(evt) {
        this.pegs.forEach((peg) => {
            peg.color = "blank";
        });
        this.pegs = [...this.pegs];
        this.updateColorCounts();
    }

    pegMouseOver(evt) {
        if (evt.buttons > 0) {
            this.pegClicked(evt);
        }
    }

    render() {
            return html `
      <div id="controls">
        ${this.colors.map(
          (color, i) => html`<label>
            <input
              value="${color.name}"
              name="colorRadio"
              type="radio"
              ?checked=${i == 0}
            />
            <div class="color-selection ${color.name}">${color.count}</div>
          </label> `
        )}
        <button id="save" title="Save (create a permalink)" @click=${this.saveClicked}>🔗</button>
        <button id="clear" title="Clear (there is no undo)" @click=${this.clearClicked}>🗑️</button>
      </div>
      <div id="peg-grid">
        ${this.pegs.map((peg, i) => {
          return html` <lit-brite-peg
            .color=${peg.color}
            @click=${this.pegClicked}
            @mouseover=${this.pegMouseOver}
          >
          </lit-brite-peg>`;
        })}
      </div>
    `;
  }
}

customElements.define("lit-brite", LitBrite);
