// we import the polyfill on the test because on the lib is already imported on index.ts
import "./globalThis.polyfill.js"
import { getCookie } from "./cookie-getter"

describe('getCookie', () => {
  it('should return a correct value from the cookie stored', () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'CONSENT=YES+ES.es+V11; SEARCH_SAMESITE=CgQI3JAB',
    });
    expect(getCookie("CONSENT")).toEqual("YES+ES.es+V11")
    expect(getCookie("SEARCH_SAMESITE")).toEqual("CgQI3JAB")
  });
});
