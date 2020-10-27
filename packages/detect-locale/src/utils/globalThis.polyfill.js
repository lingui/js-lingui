// https://mathiasbynens.be/notes/globalthis
// We polyfill the globalThis instance for node10 environments
// since globalThis only exists since node12+
(function (Object) {
  typeof globalThis !== 'object' && (
    this ?
      get() :
      (Object.defineProperty(Object.prototype, '_T_', {
        configurable: true,
        get: get
      }), _T_)
  );
  function get() {
    this.globalThis = this;
    delete Object.prototype._T_;
  }
}(Object));
export default globalThis;