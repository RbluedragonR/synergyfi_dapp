(self.webpackChunk_synfutures_v3_app =
  self.webpackChunk_synfutures_v3_app || []).push([
  [886],
  {
    63416: function (e, t, n) {
      "use strict";
      var r = n(34756),
        s = n(4349),
        i = s(r("String.prototype.indexOf"));
      e.exports = function (e, t) {
        var n = r(e, !!t);
        return "function" === typeof n && i(e, ".prototype.") > -1 ? s(n) : n;
      };
    },
    4349: function (e, t, n) {
      "use strict";
      var r = n(62376),
        s = n(34756),
        i = s("%Function.prototype.apply%"),
        a = s("%Function.prototype.call%"),
        o = s("%Reflect.apply%", !0) || r.call(a, i),
        c = s("%Object.getOwnPropertyDescriptor%", !0),
        u = s("%Object.defineProperty%", !0),
        d = s("%Math.max%");
      if (u)
        try {
          u({}, "a", { value: 1 });
        } catch (h) {
          u = null;
        }
      e.exports = function (e) {
        var t = o(r, a, arguments);
        c &&
          u &&
          c(t, "length").configurable &&
          u(t, "length", {
            value: 1 + d(0, e.length - (arguments.length - 1)),
          });
        return t;
      };
      var l = function () {
        return o(r, i, arguments);
      };
      u ? u(e.exports, "apply", { value: l }) : (e.exports.apply = l);
    },
    75867: function (e) {
      "use strict";
      var t = Array.prototype.slice,
        n = Object.prototype.toString;
      e.exports = function (e) {
        var r = this;
        if ("function" !== typeof r || "[object Function]" !== n.call(r))
          throw new TypeError(
            "Function.prototype.bind called on incompatible " + r
          );
        for (
          var s,
            i = t.call(arguments, 1),
            a = Math.max(0, r.length - i.length),
            o = [],
            c = 0;
          c < a;
          c++
        )
          o.push("$" + c);
        if (
          ((s = Function(
            "binder",
            "return function (" +
              o.join(",") +
              "){ return binder.apply(this,arguments); }"
          )(function () {
            if (this instanceof s) {
              var n = r.apply(this, i.concat(t.call(arguments)));
              return Object(n) === n ? n : this;
            }
            return r.apply(e, i.concat(t.call(arguments)));
          })),
          r.prototype)
        ) {
          var u = function () {};
          (u.prototype = r.prototype),
            (s.prototype = new u()),
            (u.prototype = null);
        }
        return s;
      };
    },
    62376: function (e, t, n) {
      "use strict";
      var r = n(75867);
      e.exports = Function.prototype.bind || r;
    },
    31634: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.CoinbaseWalletSDK = void 0);
      var i = n(36452),
        a = n(62621),
        o = n(30246),
        c = n(5526),
        u = n(61211),
        d = n(16887),
        l = n(95867),
        h = n(57600),
        f = n(73092),
        p = n(7084),
        g = n(60710),
        v = (function () {
          function e(t) {
            var n, s, i;
            r(this, e),
              (this._appName = ""),
              (this._appLogoUrl = null),
              (this._relay = null),
              (this._relayEventManager = null);
            var u = t.linkAPIUrl || a.LINK_API_URL;
            "undefined" === typeof t.overrideIsMetaMask
              ? (this._overrideIsMetaMask = !1)
              : (this._overrideIsMetaMask = t.overrideIsMetaMask),
              (this._overrideIsCoinbaseWallet =
                null === (n = t.overrideIsCoinbaseWallet) || void 0 === n || n),
              (this._overrideIsCoinbaseBrowser =
                null !== (s = t.overrideIsCoinbaseBrowser) &&
                void 0 !== s &&
                s),
              (this._diagnosticLogger = t.diagnosticLogger),
              (this._reloadOnDisconnect =
                null === (i = t.reloadOnDisconnect) || void 0 === i || i);
            var v = new URL(u),
              m = "".concat(v.protocol, "//").concat(v.host);
            if (
              ((this._storage = new c.ScopedLocalStorage(
                "-walletlink:".concat(m)
              )),
              this._storage.setItem("version", e.VERSION),
              !this.walletExtension && !this.coinbaseBrowser)
            ) {
              this._relayEventManager = new h.RelayEventManager();
              var b = (0, o.isMobileWeb)(),
                w =
                  t.uiConstructor ||
                  function (e) {
                    return b
                      ? new l.MobileRelayUI(e)
                      : new f.WalletLinkRelayUI(e);
                  },
                k = {
                  linkAPIUrl: u,
                  version: g.LIB_VERSION,
                  darkMode: !!t.darkMode,
                  headlessMode: !!t.headlessMode,
                  uiConstructor: w,
                  storage: this._storage,
                  relayEventManager: this._relayEventManager,
                  diagnosticLogger: this._diagnosticLogger,
                  reloadOnDisconnect: this._reloadOnDisconnect,
                  enableMobileWalletLink: t.enableMobileWalletLink,
                };
              (this._relay = b
                ? new d.MobileRelay(k)
                : new p.WalletLinkRelay(k)),
                this.setAppInfo("SynergyFi", t.appLogoUrl),
                t.headlessMode || this._relay.attachUI();
            }
          }
          return (
            s(e, [
              {
                key: "makeWeb3Provider",
                value: function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : "",
                    t =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : 1,
                    n = this.walletExtension;
                  if (n)
                    return (
                      this.isCipherProvider(n) || n.setProviderInfo(e, t),
                      !1 === this._reloadOnDisconnect &&
                        "function" === typeof n.disableReloadOnDisconnect &&
                        n.disableReloadOnDisconnect(),
                      n
                    );
                  var r = this.coinbaseBrowser;
                  if (r) return r;
                  var s = this._relay;
                  if (!s || !this._relayEventManager || !this._storage)
                    throw new Error(
                      "Relay not initialized, should never happen"
                    );
                  return (
                    e || s.setConnectDisabled(!0),
                    new u.CoinbaseWalletProvider({
                      relayProvider: function () {
                        return Promise.resolve(s);
                      },
                      relayEventManager: this._relayEventManager,
                      storage: this._storage,
                      jsonRpcUrl: e,
                      chainId: t,
                      qrUrl: this.getQrUrl(),
                      diagnosticLogger: this._diagnosticLogger,
                      overrideIsMetaMask: this._overrideIsMetaMask,
                      overrideIsCoinbaseWallet: this._overrideIsCoinbaseWallet,
                      overrideIsCoinbaseBrowser:
                        this._overrideIsCoinbaseBrowser,
                    })
                  );
                },
              },
              {
                key: "setAppInfo",
                value: function (e, t) {
                  var n;
                  (this._appName = "SynergyFi" || "DApp"),
                    (this._appLogoUrl = t || (0, o.getFavicon)());
                  var r = this.walletExtension;
                  r
                    ? this.isCipherProvider(r) ||
                      r.setAppInfo("SynergyFi", this._appLogoUrl)
                    : null === (n = this._relay) ||
                      void 0 === n ||
                      n.setAppInfo("SynergyFi", this._appLogoUrl);
                },
              },
              {
                key: "disconnect",
                value: function () {
                  var e,
                    t =
                      null === this || void 0 === this
                        ? void 0
                        : this.walletExtension;
                  t
                    ? t.close()
                    : null === (e = this._relay) ||
                      void 0 === e ||
                      e.resetAndReload();
                },
              },
              {
                key: "getQrUrl",
                value: function () {
                  var e, t;
                  return null !==
                    (t =
                      null === (e = this._relay) || void 0 === e
                        ? void 0
                        : e.getQRCodeUrl()) && void 0 !== t
                    ? t
                    : null;
                },
              },
              {
                key: "getCoinbaseWalletLogo",
                value: function (e) {
                  var t =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : 240;
                  return (0, i.walletLogo)(e, t);
                },
              },
              {
                key: "walletExtension",
                get: function () {
                  var e;
                  return null !== (e = window.coinbaseWalletExtension) &&
                    void 0 !== e
                    ? e
                    : window.walletLinkExtension;
                },
              },
              {
                key: "coinbaseBrowser",
                get: function () {
                  var e, t;
                  try {
                    var n =
                      null !== (e = window.ethereum) && void 0 !== e
                        ? e
                        : null === (t = window.top) || void 0 === t
                        ? void 0
                        : t.ethereum;
                    if (!n) return;
                    return "isCoinbaseBrowser" in n && n.isCoinbaseBrowser
                      ? n
                      : void 0;
                  } catch (r) {
                    return;
                  }
                },
              },
              {
                key: "isCipherProvider",
                value: function (e) {
                  return "boolean" === typeof e.isCipher && e.isCipher;
                },
              },
            ]),
            e
          );
        })();
      (t.CoinbaseWalletSDK = v), (v.VERSION = g.LIB_VERSION);
    },
    36452: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.walletLogo = void 0);
      t.walletLogo = function (e, t) {
        var n;
        switch (e) {
          case "standard":
          default:
            return (
              (n = t),
              "data:image/svg+xml,%3Csvg width='"
                .concat(t, "' height='")
                .concat(
                  n,
                  "' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Crect width='1024' height='1024' fill='%230052FF'/%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M152 512C152 710.823 313.177 872 512 872C710.823 872 872 710.823 872 512C872 313.177 710.823 152 512 152C313.177 152 152 313.177 152 512ZM420 396C406.745 396 396 406.745 396 420V604C396 617.255 406.745 628 420 628H604C617.255 628 628 617.255 628 604V420C628 406.745 617.255 396 604 396H420Z' fill='white'/%3E %3C/svg%3E "
                )
            );
          case "circle":
            return (
              (n = t),
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='"
                .concat(t, "' height='")
                .concat(
                  n,
                  "' viewBox='0 0 999.81 999.81'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%230052fe;%7D.cls-2%7Bfill:%23fefefe;%7D.cls-3%7Bfill:%230152fe;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M655-115.9h56c.83,1.59,2.36.88,3.56,1a478,478,0,0,1,75.06,10.42C891.4-81.76,978.33-32.58,1049.19,44q116.7,126,131.94,297.61c.38,4.14-.34,8.53,1.78,12.45v59c-1.58.84-.91,2.35-1,3.56a482.05,482.05,0,0,1-10.38,74.05c-24,106.72-76.64,196.76-158.83,268.93s-178.18,112.82-287.2,122.6c-4.83.43-9.86-.25-14.51,1.77H654c-1-1.68-2.69-.91-4.06-1a496.89,496.89,0,0,1-105.9-18.59c-93.54-27.42-172.78-77.59-236.91-150.94Q199.34,590.1,184.87,426.58c-.47-5.19.25-10.56-1.77-15.59V355c1.68-1,.91-2.7,1-4.06a498.12,498.12,0,0,1,18.58-105.9c26-88.75,72.64-164.9,140.6-227.57q126-116.27,297.21-131.61C645.32-114.57,650.35-113.88,655-115.9Zm377.92,500c0-192.44-156.31-349.49-347.56-350.15-194.13-.68-350.94,155.13-352.29,347.42-1.37,194.55,155.51,352.1,348.56,352.47C876.15,734.23,1032.93,577.84,1032.93,384.11Z' transform='translate(-183.1 115.9)'/%3E%3Cpath class='cls-2' d='M1032.93,384.11c0,193.73-156.78,350.12-351.29,349.74-193-.37-349.93-157.92-348.56-352.47C334.43,189.09,491.24,33.28,685.37,34,876.62,34.62,1032.94,191.67,1032.93,384.11ZM683,496.81q43.74,0,87.48,0c15.55,0,25.32-9.72,25.33-25.21q0-87.48,0-175c0-15.83-9.68-25.46-25.59-25.46H595.77c-15.88,0-25.57,9.64-25.58,25.46q0,87.23,0,174.45c0,16.18,9.59,25.7,25.84,25.71Z' transform='translate(-183.1 115.9)'/%3E%3Cpath class='cls-3' d='M683,496.81H596c-16.25,0-25.84-9.53-25.84-25.71q0-87.23,0-174.45c0-15.82,9.7-25.46,25.58-25.46H770.22c15.91,0,25.59,9.63,25.59,25.46q0,87.47,0,175c0,15.49-9.78,25.2-25.33,25.21Q726.74,496.84,683,496.81Z' transform='translate(-183.1 115.9)'/%3E%3C/svg%3E"
                )
            );
          case "text":
            return (
              (n = (0.1 * t).toFixed(2)),
              "data:image/svg+xml,%3Csvg width='"
                .concat(t, "' height='")
                .concat(
                  n,
                  "' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 528.15 53.64'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%230052ff;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3ECoinbase_Wordmark_SubBrands_ALL%3C/title%3E%3Cpath class='cls-1' d='M164.45,15a15,15,0,0,0-11.74,5.4V0h-8.64V52.92h8.5V48a15,15,0,0,0,11.88,5.62c10.37,0,18.21-8.21,18.21-19.3S174.67,15,164.45,15Zm-1.3,30.67c-6.19,0-10.73-4.83-10.73-11.31S157,23,163.22,23s10.66,4.82,10.66,11.37S169.34,45.65,163.15,45.65Zm83.31-14.91-6.34-.93c-3-.43-5.18-1.44-5.18-3.82,0-2.59,2.8-3.89,6.62-3.89,4.18,0,6.84,1.8,7.42,4.76h8.35c-.94-7.49-6.7-11.88-15.55-11.88-9.15,0-15.2,4.68-15.2,11.3,0,6.34,4,10,12,11.16l6.33.94c3.1.43,4.83,1.65,4.83,4,0,2.95-3,4.17-7.2,4.17-5.12,0-8-2.09-8.43-5.25h-8.49c.79,7.27,6.48,12.38,16.84,12.38,9.44,0,15.7-4.32,15.7-11.74C258.12,35.28,253.58,31.82,246.46,30.74Zm-27.65-2.3c0-8.06-4.9-13.46-15.27-13.46-9.79,0-15.26,5-16.34,12.6h8.57c.43-3,2.73-5.4,7.63-5.4,4.39,0,6.55,1.94,6.55,4.32,0,3.09-4,3.88-8.85,4.39-6.63.72-14.84,3-14.84,11.66,0,6.7,5,11,12.89,11,6.19,0,10.08-2.59,12-6.7.28,3.67,3,6.05,6.84,6.05h5v-7.7h-4.25Zm-8.5,9.36c0,5-4.32,8.64-9.57,8.64-3.24,0-6-1.37-6-4.25,0-3.67,4.39-4.68,8.42-5.11s6-1.22,7.13-2.88ZM281.09,15c-11.09,0-19.23,8.35-19.23,19.36,0,11.6,8.72,19.3,19.37,19.3,9,0,16.06-5.33,17.86-12.89h-9c-1.3,3.31-4.47,5.19-8.71,5.19-5.55,0-9.72-3.46-10.66-9.51H299.3V33.12C299.3,22.46,291.53,15,281.09,15Zm-9.87,15.26c1.37-5.18,5.26-7.7,9.72-7.7,4.9,0,8.64,2.8,9.51,7.7ZM19.3,23a9.84,9.84,0,0,1,9.5,7h9.14c-1.65-8.93-9-15-18.57-15A19,19,0,0,0,0,34.34c0,11.09,8.28,19.3,19.37,19.3,9.36,0,16.85-6,18.5-15H28.8a9.75,9.75,0,0,1-9.43,7.06c-6.27,0-10.66-4.83-10.66-11.31S13,23,19.3,23Zm41.11-8A19,19,0,0,0,41,34.34c0,11.09,8.28,19.3,19.37,19.3A19,19,0,0,0,79.92,34.27C79.92,23.33,71.64,15,60.41,15Zm.07,30.67c-6.19,0-10.73-4.83-10.73-11.31S54.22,23,60.41,23s10.8,4.89,10.8,11.37S66.67,45.65,60.48,45.65ZM123.41,15c-5.62,0-9.29,2.3-11.45,5.54V15.7h-8.57V52.92H112V32.69C112,27,115.63,23,121,23c5,0,8.06,3.53,8.06,8.64V52.92h8.64V31C137.66,21.6,132.84,15,123.41,15ZM92,.36a5.36,5.36,0,0,0-5.55,5.47,5.55,5.55,0,0,0,11.09,0A5.35,5.35,0,0,0,92,.36Zm-9.72,23h5.4V52.92h8.64V15.7h-14Zm298.17-7.7L366.2,52.92H372L375.29,44H392l3.33,8.88h6L386.87,15.7ZM377,39.23l6.45-17.56h.1l6.56,17.56ZM362.66,15.7l-7.88,29h-.11l-8.14-29H341l-8,28.93h-.1l-8-28.87H319L329.82,53h5.45l8.19-29.24h.11L352,53h5.66L368.1,15.7Zm135.25,0v4.86h12.32V52.92h5.6V20.56h12.32V15.7ZM467.82,52.92h25.54V48.06H473.43v-12h18.35V31.35H473.43V20.56h19.93V15.7H467.82ZM443,15.7h-5.6V52.92h24.32V48.06H443Zm-30.45,0h-5.61V52.92h24.32V48.06H412.52Z'/%3E%3C/svg%3E"
                )
            );
          case "textWithLogo":
            return (
              (n = (0.25 * t).toFixed(2)),
              "data:image/svg+xml,%3Csvg width='"
                .concat(t, "' height='")
                .concat(
                  n,
                  "' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 308.44 77.61'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%230052ff;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M142.94,20.2l-7.88,29H135l-8.15-29h-5.55l-8,28.93h-.11l-8-28.87H99.27l10.84,37.27h5.44l8.2-29.24h.1l8.41,29.24h5.66L148.39,20.2Zm17.82,0L146.48,57.42h5.82l3.28-8.88h16.65l3.34,8.88h6L167.16,20.2Zm-3.44,23.52,6.45-17.55h.11l6.56,17.55ZM278.2,20.2v4.86h12.32V57.42h5.6V25.06h12.32V20.2ZM248.11,57.42h25.54V52.55H253.71V40.61h18.35V35.85H253.71V25.06h19.94V20.2H248.11ZM223.26,20.2h-5.61V57.42H242V52.55H223.26Zm-30.46,0h-5.6V57.42h24.32V52.55H192.8Zm-154,38A19.41,19.41,0,1,1,57.92,35.57H77.47a38.81,38.81,0,1,0,0,6.47H57.92A19.39,19.39,0,0,1,38.81,58.21Z'/%3E%3C/svg%3E"
                )
            );
          case "textLight":
            return (
              (n = (0.1 * t).toFixed(2)),
              "data:image/svg+xml,%3Csvg width='"
                .concat(t, "' height='")
                .concat(
                  n,
                  "' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 528.15 53.64'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23fefefe;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3ECoinbase_Wordmark_SubBrands_ALL%3C/title%3E%3Cpath class='cls-1' d='M164.45,15a15,15,0,0,0-11.74,5.4V0h-8.64V52.92h8.5V48a15,15,0,0,0,11.88,5.62c10.37,0,18.21-8.21,18.21-19.3S174.67,15,164.45,15Zm-1.3,30.67c-6.19,0-10.73-4.83-10.73-11.31S157,23,163.22,23s10.66,4.82,10.66,11.37S169.34,45.65,163.15,45.65Zm83.31-14.91-6.34-.93c-3-.43-5.18-1.44-5.18-3.82,0-2.59,2.8-3.89,6.62-3.89,4.18,0,6.84,1.8,7.42,4.76h8.35c-.94-7.49-6.7-11.88-15.55-11.88-9.15,0-15.2,4.68-15.2,11.3,0,6.34,4,10,12,11.16l6.33.94c3.1.43,4.83,1.65,4.83,4,0,2.95-3,4.17-7.2,4.17-5.12,0-8-2.09-8.43-5.25h-8.49c.79,7.27,6.48,12.38,16.84,12.38,9.44,0,15.7-4.32,15.7-11.74C258.12,35.28,253.58,31.82,246.46,30.74Zm-27.65-2.3c0-8.06-4.9-13.46-15.27-13.46-9.79,0-15.26,5-16.34,12.6h8.57c.43-3,2.73-5.4,7.63-5.4,4.39,0,6.55,1.94,6.55,4.32,0,3.09-4,3.88-8.85,4.39-6.63.72-14.84,3-14.84,11.66,0,6.7,5,11,12.89,11,6.19,0,10.08-2.59,12-6.7.28,3.67,3,6.05,6.84,6.05h5v-7.7h-4.25Zm-8.5,9.36c0,5-4.32,8.64-9.57,8.64-3.24,0-6-1.37-6-4.25,0-3.67,4.39-4.68,8.42-5.11s6-1.22,7.13-2.88ZM281.09,15c-11.09,0-19.23,8.35-19.23,19.36,0,11.6,8.72,19.3,19.37,19.3,9,0,16.06-5.33,17.86-12.89h-9c-1.3,3.31-4.47,5.19-8.71,5.19-5.55,0-9.72-3.46-10.66-9.51H299.3V33.12C299.3,22.46,291.53,15,281.09,15Zm-9.87,15.26c1.37-5.18,5.26-7.7,9.72-7.7,4.9,0,8.64,2.8,9.51,7.7ZM19.3,23a9.84,9.84,0,0,1,9.5,7h9.14c-1.65-8.93-9-15-18.57-15A19,19,0,0,0,0,34.34c0,11.09,8.28,19.3,19.37,19.3,9.36,0,16.85-6,18.5-15H28.8a9.75,9.75,0,0,1-9.43,7.06c-6.27,0-10.66-4.83-10.66-11.31S13,23,19.3,23Zm41.11-8A19,19,0,0,0,41,34.34c0,11.09,8.28,19.3,19.37,19.3A19,19,0,0,0,79.92,34.27C79.92,23.33,71.64,15,60.41,15Zm.07,30.67c-6.19,0-10.73-4.83-10.73-11.31S54.22,23,60.41,23s10.8,4.89,10.8,11.37S66.67,45.65,60.48,45.65ZM123.41,15c-5.62,0-9.29,2.3-11.45,5.54V15.7h-8.57V52.92H112V32.69C112,27,115.63,23,121,23c5,0,8.06,3.53,8.06,8.64V52.92h8.64V31C137.66,21.6,132.84,15,123.41,15ZM92,.36a5.36,5.36,0,0,0-5.55,5.47,5.55,5.55,0,0,0,11.09,0A5.35,5.35,0,0,0,92,.36Zm-9.72,23h5.4V52.92h8.64V15.7h-14Zm298.17-7.7L366.2,52.92H372L375.29,44H392l3.33,8.88h6L386.87,15.7ZM377,39.23l6.45-17.56h.1l6.56,17.56ZM362.66,15.7l-7.88,29h-.11l-8.14-29H341l-8,28.93h-.1l-8-28.87H319L329.82,53h5.45l8.19-29.24h.11L352,53h5.66L368.1,15.7Zm135.25,0v4.86h12.32V52.92h5.6V20.56h12.32V15.7ZM467.82,52.92h25.54V48.06H473.43v-12h18.35V31.35H473.43V20.56h19.93V15.7H467.82ZM443,15.7h-5.6V52.92h24.32V48.06H443Zm-30.45,0h-5.61V52.92h24.32V48.06H412.52Z'/%3E%3C/svg%3E"
                )
            );
          case "textWithLogoLight":
            return (
              (n = (0.25 * t).toFixed(2)),
              "data:image/svg+xml,%3Csvg width='"
                .concat(t, "' height='")
                .concat(
                  n,
                  "' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 308.44 77.61'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23fefefe;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M142.94,20.2l-7.88,29H135l-8.15-29h-5.55l-8,28.93h-.11l-8-28.87H99.27l10.84,37.27h5.44l8.2-29.24h.1l8.41,29.24h5.66L148.39,20.2Zm17.82,0L146.48,57.42h5.82l3.28-8.88h16.65l3.34,8.88h6L167.16,20.2Zm-3.44,23.52,6.45-17.55h.11l6.56,17.55ZM278.2,20.2v4.86h12.32V57.42h5.6V25.06h12.32V20.2ZM248.11,57.42h25.54V52.55H253.71V40.61h18.35V35.85H253.71V25.06h19.94V20.2H248.11ZM223.26,20.2h-5.61V57.42H242V52.55H223.26Zm-30.46,0h-5.6V57.42h24.32V52.55H192.8Zm-154,38A19.41,19.41,0,1,1,57.92,35.57H77.47a38.81,38.81,0,1,0,0,6.47H57.92A19.39,19.39,0,0,1,38.81,58.21Z'/%3E%3C/svg%3E"
                )
            );
        }
      };
    },
    62621: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.LINK_API_URL = void 0),
        (t.LINK_API_URL = "https://www.walletlink.org");
    },
    64146: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.errorValues = t.standardErrorCodes = void 0),
        (t.standardErrorCodes = {
          rpc: {
            invalidInput: -32e3,
            resourceNotFound: -32001,
            resourceUnavailable: -32002,
            transactionRejected: -32003,
            methodNotSupported: -32004,
            limitExceeded: -32005,
            parse: -32700,
            invalidRequest: -32600,
            methodNotFound: -32601,
            invalidParams: -32602,
            internal: -32603,
          },
          provider: {
            userRejectedRequest: 4001,
            unauthorized: 4100,
            unsupportedMethod: 4200,
            disconnected: 4900,
            chainDisconnected: 4901,
            unsupportedChain: 4902,
          },
        }),
        (t.errorValues = {
          "-32700": {
            standard: "JSON RPC 2.0",
            message:
              "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.",
          },
          "-32600": {
            standard: "JSON RPC 2.0",
            message: "The JSON sent is not a valid Request object.",
          },
          "-32601": {
            standard: "JSON RPC 2.0",
            message: "The method does not exist / is not available.",
          },
          "-32602": {
            standard: "JSON RPC 2.0",
            message: "Invalid method parameter(s).",
          },
          "-32603": {
            standard: "JSON RPC 2.0",
            message: "Internal JSON-RPC error.",
          },
          "-32000": { standard: "EIP-1474", message: "Invalid input." },
          "-32001": { standard: "EIP-1474", message: "Resource not found." },
          "-32002": { standard: "EIP-1474", message: "Resource unavailable." },
          "-32003": { standard: "EIP-1474", message: "Transaction rejected." },
          "-32004": { standard: "EIP-1474", message: "Method not supported." },
          "-32005": {
            standard: "EIP-1474",
            message: "Request limit exceeded.",
          },
          4001: { standard: "EIP-1193", message: "User rejected the request." },
          4100: {
            standard: "EIP-1193",
            message:
              "The requested account and/or method has not been authorized by the user.",
          },
          4200: {
            standard: "EIP-1193",
            message:
              "The requested method is not supported by this Ethereum provider.",
          },
          4900: {
            standard: "EIP-1193",
            message: "The provider is disconnected from all chains.",
          },
          4901: {
            standard: "EIP-1193",
            message: "The provider is disconnected from the specified chain.",
          },
          4902: { standard: "EIP-3085", message: "Unrecognized chain ID." },
        });
    },
    2171: function (e, t, n) {
      "use strict";
      var r = n(89728).default,
        s = n(56690).default,
        i = n(61655).default,
        a = n(26389).default,
        o = n(33496).default,
        c = n(27424).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.standardErrors = void 0);
      var u = n(64146),
        d = n(25228);
      function l(e, t) {
        var n = f(t),
          r = c(n, 2),
          s = r[0],
          i = r[1];
        return new p(e, s || (0, d.getMessageFromCode)(e), i);
      }
      function h(e, t) {
        var n = f(t),
          r = c(n, 2),
          s = r[0],
          i = r[1];
        return new g(e, s || (0, d.getMessageFromCode)(e), i);
      }
      function f(e) {
        if (e) {
          if ("string" === typeof e) return [e];
          if ("object" === typeof e && !Array.isArray(e)) {
            var t = e.message,
              n = e.data;
            if (t && "string" !== typeof t)
              throw new Error("Must specify string message.");
            return [t || void 0, n];
          }
        }
        return [];
      }
      t.standardErrors = {
        rpc: {
          parse: function (e) {
            return l(u.standardErrorCodes.rpc.parse, e);
          },
          invalidRequest: function (e) {
            return l(u.standardErrorCodes.rpc.invalidRequest, e);
          },
          invalidParams: function (e) {
            return l(u.standardErrorCodes.rpc.invalidParams, e);
          },
          methodNotFound: function (e) {
            return l(u.standardErrorCodes.rpc.methodNotFound, e);
          },
          internal: function (e) {
            return l(u.standardErrorCodes.rpc.internal, e);
          },
          server: function (e) {
            if (!e || "object" !== typeof e || Array.isArray(e))
              throw new Error(
                "Ethereum RPC Server errors must provide single object argument."
              );
            var t = e.code;
            if (!Number.isInteger(t) || t > -32005 || t < -32099)
              throw new Error(
                '"code" must be an integer such that: -32099 <= code <= -32005'
              );
            return l(t, e);
          },
          invalidInput: function (e) {
            return l(u.standardErrorCodes.rpc.invalidInput, e);
          },
          resourceNotFound: function (e) {
            return l(u.standardErrorCodes.rpc.resourceNotFound, e);
          },
          resourceUnavailable: function (e) {
            return l(u.standardErrorCodes.rpc.resourceUnavailable, e);
          },
          transactionRejected: function (e) {
            return l(u.standardErrorCodes.rpc.transactionRejected, e);
          },
          methodNotSupported: function (e) {
            return l(u.standardErrorCodes.rpc.methodNotSupported, e);
          },
          limitExceeded: function (e) {
            return l(u.standardErrorCodes.rpc.limitExceeded, e);
          },
        },
        provider: {
          userRejectedRequest: function (e) {
            return h(u.standardErrorCodes.provider.userRejectedRequest, e);
          },
          unauthorized: function (e) {
            return h(u.standardErrorCodes.provider.unauthorized, e);
          },
          unsupportedMethod: function (e) {
            return h(u.standardErrorCodes.provider.unsupportedMethod, e);
          },
          disconnected: function (e) {
            return h(u.standardErrorCodes.provider.disconnected, e);
          },
          chainDisconnected: function (e) {
            return h(u.standardErrorCodes.provider.chainDisconnected, e);
          },
          unsupportedChain: function (e) {
            return h(u.standardErrorCodes.provider.unsupportedChain, e);
          },
          custom: function (e) {
            if (!e || "object" !== typeof e || Array.isArray(e))
              throw new Error(
                "Ethereum Provider custom errors must provide single object argument."
              );
            var t = e.code,
              n = e.message,
              r = e.data;
            if (!n || "string" !== typeof n)
              throw new Error('"message" must be a nonempty string');
            return new g(t, n, r);
          },
        },
      };
      var p = (function (e) {
          i(n, e);
          var t = a(n);
          function n(e, r, i) {
            var a;
            if ((s(this, n), !Number.isInteger(e)))
              throw new Error('"code" must be an integer.');
            if (!r || "string" !== typeof r)
              throw new Error('"message" must be a nonempty string.');
            return (
              ((a = t.call(this, r)).code = e), void 0 !== i && (a.data = i), a
            );
          }
          return r(n);
        })(o(Error)),
        g = (function (e) {
          i(n, e);
          var t = a(n);
          function n(e, r, i) {
            if (
              (s(this, n),
              !(function (e) {
                return Number.isInteger(e) && e >= 1e3 && e <= 4999;
              })(e))
            )
              throw new Error(
                '"code" must be an integer such that: 1000 <= code <= 4999'
              );
            return t.call(this, e, r, i);
          }
          return r(n);
        })(p);
    },
    28638: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.standardErrors =
          t.standardErrorCodes =
          t.serializeError =
          t.getMessageFromCode =
          t.getErrorCode =
            void 0);
      var r = n(64146);
      Object.defineProperty(t, "standardErrorCodes", {
        enumerable: !0,
        get: function () {
          return r.standardErrorCodes;
        },
      });
      var s = n(2171);
      Object.defineProperty(t, "standardErrors", {
        enumerable: !0,
        get: function () {
          return s.standardErrors;
        },
      });
      var i = n(85344);
      Object.defineProperty(t, "serializeError", {
        enumerable: !0,
        get: function () {
          return i.serializeError;
        },
      });
      var a = n(25228);
      Object.defineProperty(t, "getErrorCode", {
        enumerable: !0,
        get: function () {
          return a.getErrorCode;
        },
      }),
        Object.defineProperty(t, "getMessageFromCode", {
          enumerable: !0,
          get: function () {
            return a.getMessageFromCode;
          },
        });
    },
    85344: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.serializeError = void 0);
      var r = n(22953),
        s = n(60710),
        i = n(64146),
        a = n(25228);
      t.serializeError = function (e, t) {
        var n = (0, a.serialize)(
            (function (e) {
              if ("string" === typeof e)
                return { message: e, code: i.standardErrorCodes.rpc.internal };
              if ((0, r.isErrorResponse)(e))
                return Object.assign(Object.assign({}, e), {
                  message: e.errorMessage,
                  code: e.errorCode,
                  data: { method: e.method },
                });
              return e;
            })(e),
            { shouldIncludeStack: !0 }
          ),
          o = new URL("https://docs.cloud.coinbase.com/wallet-sdk/docs/errors");
        o.searchParams.set("version", s.LIB_VERSION),
          o.searchParams.set("code", n.code.toString());
        var c = (function (e, t) {
          var n = null === e || void 0 === e ? void 0 : e.method;
          if (n) return n;
          if (void 0 === t) return;
          if ("string" === typeof t) return t;
          if (!Array.isArray(t)) return t.method;
          if (t.length > 0) return t[0].method;
          return;
        })(n.data, t);
        return (
          c && o.searchParams.set("method", c),
          o.searchParams.set("message", n.message),
          Object.assign(Object.assign({}, n), { docUrl: o.href })
        );
      };
    },
    25228: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.serialize =
          t.getErrorCode =
          t.isValidCode =
          t.getMessageFromCode =
          t.JSON_RPC_SERVER_ERROR_MESSAGE =
            void 0);
      var r = n(64146),
        s = "Unspecified error message.";
      function i(e) {
        var n =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : s;
        if (e && Number.isInteger(e)) {
          var i = e.toString();
          if (u(r.errorValues, i)) return r.errorValues[i].message;
          if (o(e)) return t.JSON_RPC_SERVER_ERROR_MESSAGE;
        }
        return n;
      }
      function a(e) {
        if (!Number.isInteger(e)) return !1;
        var t = e.toString();
        return !!r.errorValues[t] || !!o(e);
      }
      function o(e) {
        return e >= -32099 && e <= -32e3;
      }
      function c(e) {
        return e && "object" === typeof e && !Array.isArray(e)
          ? Object.assign({}, e)
          : e;
      }
      function u(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }
      function d(e, t) {
        return (
          "object" === typeof e &&
          null !== e &&
          t in e &&
          "string" === typeof e[t]
        );
      }
      (t.JSON_RPC_SERVER_ERROR_MESSAGE = "Unspecified server error."),
        (t.getMessageFromCode = i),
        (t.isValidCode = a),
        (t.getErrorCode = function (e) {
          var t;
          return "number" === typeof e
            ? e
            : (function (e) {
                return (
                  "object" === typeof e &&
                  null !== e &&
                  ("number" === typeof e.code ||
                    "number" === typeof e.errorCode)
                );
              })(e)
            ? null !== (t = e.code) && void 0 !== t
              ? t
              : e.errorCode
            : void 0;
        }),
        (t.serialize = function (e) {
          var t = (
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {}
            ).shouldIncludeStack,
            n = void 0 !== t && t,
            o = {};
          if (
            e &&
            "object" === typeof e &&
            !Array.isArray(e) &&
            u(e, "code") &&
            a(e.code)
          ) {
            var l = e;
            (o.code = l.code),
              l.message && "string" === typeof l.message
                ? ((o.message = l.message), u(l, "data") && (o.data = l.data))
                : ((o.message = i(o.code)), (o.data = { originalError: c(e) }));
          } else
            (o.code = r.standardErrorCodes.rpc.internal),
              (o.message = d(e, "message") ? e.message : s),
              (o.data = { originalError: c(e) });
          return n && (o.stack = d(e, "stack") ? e.stack : void 0), o;
        });
    },
    29213: function (e, t) {
      "use strict";
      function n() {
        return function (e) {
          return e;
        };
      }
      var r;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ProviderType =
          t.RegExpString =
          t.IntNumber =
          t.BigIntString =
          t.AddressString =
          t.HexString =
          t.OpaqueType =
            void 0),
        (t.OpaqueType = n),
        (t.HexString = function (e) {
          return e;
        }),
        (t.AddressString = function (e) {
          return e;
        }),
        (t.BigIntString = function (e) {
          return e;
        }),
        (t.IntNumber = function (e) {
          return Math.floor(e);
        }),
        (t.RegExpString = function (e) {
          return e;
        }),
        (function (e) {
          (e.CoinbaseWallet = "CoinbaseWallet"),
            (e.MetaMask = "MetaMask"),
            (e.Unselected = "");
        })(r || (t.ProviderType = r = {}));
    },
    30246: function (e, t, n) {
      "use strict";
      var r = n(8901).Buffer,
        s = n(38416).default,
        i = n(861).default,
        a =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.isMobileWeb =
          t.getLocation =
          t.isInIFrame =
          t.createQrUrl =
          t.getFavicon =
          t.range =
          t.isBigNumber =
          t.ensureParsedJSONObject =
          t.ensureBN =
          t.ensureRegExpString =
          t.ensureIntNumber =
          t.ensureBuffer =
          t.ensureAddressString =
          t.ensureEvenLengthHexString =
          t.ensureHexString =
          t.isHexString =
          t.prepend0x =
          t.strip0x =
          t.has0xPrefix =
          t.hexStringFromIntNumber =
          t.intNumberFromHexString =
          t.bigIntStringFromBN =
          t.hexStringFromBuffer =
          t.hexStringToUint8Array =
          t.uint8ArrayToHex =
          t.randomBytesHex =
            void 0);
      var o = a(n(43413)),
        c = n(28638),
        u = n(29213),
        d = /^[0-9]*$/,
        l = /^[a-f0-9]*$/;
      function h(e) {
        return i(e)
          .map(function (e) {
            return e.toString(16).padStart(2, "0");
          })
          .join("");
      }
      function f(e) {
        return e.startsWith("0x") || e.startsWith("0X");
      }
      function p(e) {
        return f(e) ? e.slice(2) : e;
      }
      function g(e) {
        return f(e) ? "0x".concat(e.slice(2)) : "0x".concat(e);
      }
      function v(e) {
        if ("string" !== typeof e) return !1;
        var t = p(e).toLowerCase();
        return l.test(t);
      }
      function m(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        if ("string" === typeof e) {
          var n = p(e).toLowerCase();
          if (l.test(n)) return (0, u.HexString)(t ? "0x".concat(n) : n);
        }
        throw c.standardErrors.rpc.invalidParams(
          '"'.concat(String(e), '" is not a hexadecimal string')
        );
      }
      function b(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
          n = m(e, !1);
        return (
          n.length % 2 === 1 && (n = (0, u.HexString)("0".concat(n))),
          t ? (0, u.HexString)("0x".concat(n)) : n
        );
      }
      function w(e) {
        if ("number" === typeof e && Number.isInteger(e))
          return (0, u.IntNumber)(e);
        if ("string" === typeof e) {
          if (d.test(e)) return (0, u.IntNumber)(Number(e));
          if (v(e))
            return (0, u.IntNumber)(new o.default(b(e, !1), 16).toNumber());
        }
        throw c.standardErrors.rpc.invalidParams(
          "Not an integer: ".concat(String(e))
        );
      }
      function k(e) {
        if (null == e || "function" !== typeof e.constructor) return !1;
        var t = e.constructor;
        return "function" === typeof t.config && "number" === typeof t.EUCLID;
      }
      function y() {
        try {
          return null !== window.frameElement;
        } catch (e) {
          return !1;
        }
      }
      (t.randomBytesHex = function (e) {
        return h(crypto.getRandomValues(new Uint8Array(e)));
      }),
        (t.uint8ArrayToHex = h),
        (t.hexStringToUint8Array = function (e) {
          return new Uint8Array(
            e.match(/.{1,2}/g).map(function (e) {
              return parseInt(e, 16);
            })
          );
        }),
        (t.hexStringFromBuffer = function (e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
            n = e.toString("hex");
          return (0, u.HexString)(t ? "0x".concat(n) : n);
        }),
        (t.bigIntStringFromBN = function (e) {
          return (0, u.BigIntString)(e.toString(10));
        }),
        (t.intNumberFromHexString = function (e) {
          return (0, u.IntNumber)(new o.default(b(e, !1), 16).toNumber());
        }),
        (t.hexStringFromIntNumber = function (e) {
          return (0, u.HexString)("0x".concat(new o.default(e).toString(16)));
        }),
        (t.has0xPrefix = f),
        (t.strip0x = p),
        (t.prepend0x = g),
        (t.isHexString = v),
        (t.ensureHexString = m),
        (t.ensureEvenLengthHexString = b),
        (t.ensureAddressString = function (e) {
          if ("string" === typeof e) {
            var t = p(e).toLowerCase();
            if (v(t) && 40 === t.length) return (0, u.AddressString)(g(t));
          }
          throw c.standardErrors.rpc.invalidParams(
            "Invalid Ethereum address: ".concat(String(e))
          );
        }),
        (t.ensureBuffer = function (e) {
          if (r.isBuffer(e)) return e;
          if ("string" === typeof e) {
            if (v(e)) {
              var t = b(e, !1);
              return r.from(t, "hex");
            }
            return r.from(e, "utf8");
          }
          throw c.standardErrors.rpc.invalidParams(
            "Not binary data: ".concat(String(e))
          );
        }),
        (t.ensureIntNumber = w),
        (t.ensureRegExpString = function (e) {
          if (e instanceof RegExp) return (0, u.RegExpString)(e.toString());
          throw c.standardErrors.rpc.invalidParams(
            "Not a RegExp: ".concat(String(e))
          );
        }),
        (t.ensureBN = function (e) {
          if (null !== e && (o.default.isBN(e) || k(e)))
            return new o.default(e.toString(10), 10);
          if ("number" === typeof e) return new o.default(w(e));
          if ("string" === typeof e) {
            if (d.test(e)) return new o.default(e, 10);
            if (v(e)) return new o.default(b(e, !1), 16);
          }
          throw c.standardErrors.rpc.invalidParams(
            "Not an integer: ".concat(String(e))
          );
        }),
        (t.ensureParsedJSONObject = function (e) {
          if ("string" === typeof e) return JSON.parse(e);
          if ("object" === typeof e) return e;
          throw c.standardErrors.rpc.invalidParams(
            "Not a JSON string or an object: ".concat(String(e))
          );
        }),
        (t.isBigNumber = k),
        (t.range = function (e, t) {
          return Array.from({ length: t - e }, function (t, n) {
            return e + n;
          });
        }),
        (t.getFavicon = function () {
          var e =
              document.querySelector('link[sizes="192x192"]') ||
              document.querySelector('link[sizes="180x180"]') ||
              document.querySelector('link[rel="icon"]') ||
              document.querySelector('link[rel="shortcut icon"]'),
            t = document.location,
            n = t.protocol,
            r = t.host,
            s = e ? e.getAttribute("href") : null;
          return !s || s.startsWith("javascript:") || s.startsWith("vbscript:")
            ? null
            : s.startsWith("http://") ||
              s.startsWith("https://") ||
              s.startsWith("data:")
            ? s
            : s.startsWith("//")
            ? n + s
            : "".concat(n, "//").concat(r).concat(s);
        }),
        (t.createQrUrl = function (e, t, n, r, i, a) {
          var o,
            c = new URLSearchParams(
              ((o = {}),
              s(o, r ? "parent-id" : "id", e),
              s(o, "secret", t),
              s(o, "server", n),
              s(o, "v", i),
              s(o, "chainId", a.toString()),
              o)
            ).toString();
          return "".concat(n, "/#/link?").concat(c);
        }),
        (t.isInIFrame = y),
        (t.getLocation = function () {
          try {
            return y() && window.top ? window.top.location : window.location;
          } catch (e) {
            return window.location;
          }
        }),
        (t.isMobileWeb = function () {
          var e;
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            null ===
              (e =
                null === window || void 0 === window
                  ? void 0
                  : window.navigator) || void 0 === e
              ? void 0
              : e.userAgent
          );
        });
    },
    54512: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.CoinbaseWalletProvider = t.CoinbaseWalletSDK = void 0);
      var r = n(31634),
        s = n(61211),
        i = n(31634);
      Object.defineProperty(t, "CoinbaseWalletSDK", {
        enumerable: !0,
        get: function () {
          return i.CoinbaseWalletSDK;
        },
      });
      var a = n(61211);
      Object.defineProperty(t, "CoinbaseWalletProvider", {
        enumerable: !0,
        get: function () {
          return a.CoinbaseWalletProvider;
        },
      }),
        (t.default = r.CoinbaseWalletSDK),
        "undefined" !== typeof window &&
          ((window.CoinbaseWalletSDK = r.CoinbaseWalletSDK),
          (window.CoinbaseWalletProvider = s.CoinbaseWalletProvider),
          (window.WalletLink = r.CoinbaseWalletSDK),
          (window.WalletLinkProvider = s.CoinbaseWalletProvider));
    },
    80606: function (e, t, n) {
      "use strict";
      var r = n(17061).default,
        s = n(861).default,
        i = n(17156).default,
        a = n(56690).default,
        o = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.Cipher = void 0);
      var c = n(30246),
        u = (function () {
          function e(t) {
            a(this, e), (this.secret = t);
          }
          return (
            o(e, [
              {
                key: "encrypt",
                value: (function () {
                  var e = i(
                    r().mark(function e(t) {
                      var n, i, a, o, u, d, l, h, f, p;
                      return r().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (64 === (n = this.secret).length) {
                                  e.next = 3;
                                  break;
                                }
                                throw Error("secret must be 256 bits");
                              case 3:
                                return (
                                  (i = crypto.getRandomValues(
                                    new Uint8Array(12)
                                  )),
                                  (e.next = 6),
                                  crypto.subtle.importKey(
                                    "raw",
                                    (0, c.hexStringToUint8Array)(n),
                                    { name: "aes-gcm" },
                                    !1,
                                    ["encrypt", "decrypt"]
                                  )
                                );
                              case 6:
                                return (
                                  (a = e.sent),
                                  (o = new TextEncoder()),
                                  (e.next = 10),
                                  window.crypto.subtle.encrypt(
                                    { name: "AES-GCM", iv: i },
                                    a,
                                    o.encode(t)
                                  )
                                );
                              case 10:
                                return (
                                  (u = e.sent),
                                  16,
                                  (d = u.slice(u.byteLength - 16)),
                                  (l = u.slice(0, u.byteLength - 16)),
                                  (h = new Uint8Array(d)),
                                  (f = new Uint8Array(l)),
                                  (p = new Uint8Array(
                                    [].concat(s(i), s(h), s(f))
                                  )),
                                  e.abrupt("return", (0, c.uint8ArrayToHex)(p))
                                );
                              case 18:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "decrypt",
                value: (function () {
                  var e = i(
                    r().mark(function e(t) {
                      var n;
                      return r().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (64 === (n = this.secret).length) {
                                  e.next = 3;
                                  break;
                                }
                                throw Error("secret must be 256 bits");
                              case 3:
                                return e.abrupt(
                                  "return",
                                  new Promise(function (e, a) {
                                    i(
                                      r().mark(function i() {
                                        var o, u, d, l, h, f, p, g, v;
                                        return r().wrap(
                                          function (r) {
                                            for (;;)
                                              switch ((r.prev = r.next)) {
                                                case 0:
                                                  return (
                                                    (r.next = 2),
                                                    crypto.subtle.importKey(
                                                      "raw",
                                                      (0,
                                                      c.hexStringToUint8Array)(
                                                        n
                                                      ),
                                                      { name: "aes-gcm" },
                                                      !1,
                                                      ["encrypt", "decrypt"]
                                                    )
                                                  );
                                                case 2:
                                                  return (
                                                    (o = r.sent),
                                                    (u = (0,
                                                    c.hexStringToUint8Array)(
                                                      t
                                                    )),
                                                    (d = u.slice(0, 12)),
                                                    (l = u.slice(12, 28)),
                                                    (h = u.slice(28)),
                                                    (f = new Uint8Array(
                                                      [].concat(s(h), s(l))
                                                    )),
                                                    (p = {
                                                      name: "AES-GCM",
                                                      iv: new Uint8Array(d),
                                                    }),
                                                    (r.prev = 9),
                                                    (r.next = 12),
                                                    window.crypto.subtle.decrypt(
                                                      p,
                                                      o,
                                                      f
                                                    )
                                                  );
                                                case 12:
                                                  (g = r.sent),
                                                    (v = new TextDecoder()),
                                                    e(v.decode(g)),
                                                    (r.next = 20);
                                                  break;
                                                case 17:
                                                  (r.prev = 17),
                                                    (r.t0 = r.catch(9)),
                                                    a(r.t0);
                                                case 20:
                                                case "end":
                                                  return r.stop();
                                              }
                                          },
                                          i,
                                          null,
                                          [[9, 17]]
                                        );
                                      })
                                    )();
                                  })
                                );
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
            ]),
            e
          );
        })();
      t.Cipher = u;
    },
    5526: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ScopedLocalStorage = void 0);
      var i = (function () {
        function e(t) {
          r(this, e), (this.scope = t);
        }
        return (
          s(e, [
            {
              key: "setItem",
              value: function (e, t) {
                localStorage.setItem(this.scopedKey(e), t);
              },
            },
            {
              key: "getItem",
              value: function (e) {
                return localStorage.getItem(this.scopedKey(e));
              },
            },
            {
              key: "removeItem",
              value: function (e) {
                localStorage.removeItem(this.scopedKey(e));
              },
            },
            {
              key: "clear",
              value: function () {
                for (
                  var e = this.scopedKey(""), t = [], n = 0;
                  n < localStorage.length;
                  n++
                ) {
                  var r = localStorage.key(n);
                  "string" === typeof r && r.startsWith(e) && t.push(r);
                }
                t.forEach(function (e) {
                  return localStorage.removeItem(e);
                });
              },
            },
            {
              key: "scopedKey",
              value: function (e) {
                return "".concat(this.scope, ":").concat(e);
              },
            },
          ]),
          e
        );
      })();
      t.ScopedLocalStorage = i;
    },
    48247: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          '@namespace svg "http://www.w3.org/2000/svg";.-cbwsdk-css-reset,.-cbwsdk-css-reset *{animation:none;animation-delay:0;animation-direction:normal;animation-duration:0;animation-fill-mode:none;animation-iteration-count:1;animation-name:none;animation-play-state:running;animation-timing-function:ease;backface-visibility:visible;background:0;background-attachment:scroll;background-clip:border-box;background-color:rgba(0,0,0,0);background-image:none;background-origin:padding-box;background-position:0 0;background-position-x:0;background-position-y:0;background-repeat:repeat;background-size:auto auto;border:0;border-style:none;border-width:medium;border-color:inherit;border-bottom:0;border-bottom-color:inherit;border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-style:none;border-bottom-width:medium;border-collapse:separate;border-image:none;border-left:0;border-left-color:inherit;border-left-style:none;border-left-width:medium;border-radius:0;border-right:0;border-right-color:inherit;border-right-style:none;border-right-width:medium;border-spacing:0;border-top:0;border-top-color:inherit;border-top-left-radius:0;border-top-right-radius:0;border-top-style:none;border-top-width:medium;box-shadow:none;box-sizing:border-box;caption-side:top;clear:none;clip:auto;color:inherit;columns:auto;column-count:auto;column-fill:balance;column-gap:normal;column-rule:medium none currentColor;column-rule-color:currentColor;column-rule-style:none;column-rule-width:none;column-span:1;column-width:auto;counter-increment:none;counter-reset:none;direction:ltr;empty-cells:show;float:none;font:normal;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;font-size:medium;font-style:normal;font-variant:normal;font-weight:normal;height:auto;hyphens:none;letter-spacing:normal;line-height:normal;list-style:none;list-style-image:none;list-style-position:outside;list-style-type:disc;margin:0;margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;opacity:1;orphans:0;outline:0;outline-color:invert;outline-style:none;outline-width:medium;overflow:visible;overflow-x:visible;overflow-y:visible;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;page-break-after:auto;page-break-before:auto;page-break-inside:auto;perspective:none;perspective-origin:50% 50%;pointer-events:auto;position:static;quotes:"\\201C" "\\201D" "\\2018" "\\2019";tab-size:8;table-layout:auto;text-align:inherit;text-align-last:auto;text-decoration:none;text-decoration-color:inherit;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-shadow:none;text-transform:none;transform:none;transform-style:flat;transition:none;transition-delay:0s;transition-duration:0s;transition-property:none;transition-timing-function:ease;unicode-bidi:normal;vertical-align:baseline;visibility:visible;white-space:normal;widows:0;word-spacing:normal;z-index:auto}.-cbwsdk-css-reset strong{font-weight:bold}.-cbwsdk-css-reset *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;line-height:1}.-cbwsdk-css-reset [class*=container]{margin:0;padding:0}.-cbwsdk-css-reset style{display:none}');
    },
    19448: function (e, t, n) {
      "use strict";
      var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.injectCssReset = void 0);
      var s = r(n(48247));
      t.injectCssReset = function () {
        var e = document.createElement("style");
        (e.type = "text/css"),
          e.appendChild(document.createTextNode(s.default)),
          document.documentElement.appendChild(e);
      };
    },
    61211: function (e, t, n) {
      "use strict";
      var r = n(8901).Buffer,
        s = n(861).default,
        i = n(17061).default,
        a = n(17156).default,
        o = n(56690).default,
        c = n(89728).default,
        u = n(66115).default,
        d = n(61655).default,
        l = n(26389).default,
        h =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.CoinbaseWalletProvider = void 0);
      var f = h(n(43413)),
        p = n(86115),
        g = n(28638),
        v = n(30246),
        m = n(16887),
        b = n(35779),
        w = n(35429),
        k = n(22953),
        y = h(n(73297)),
        E = n(4995),
        x = n(21843),
        C = n(45908),
        _ = "DefaultChainId",
        S = "DefaultJsonRpcUrl",
        I = (function (e) {
          d(n, e);
          var t = l(n);
          function n(e) {
            var r, s, i;
            o(this, n),
              ((r = t.call(this))._filterPolyfill = new x.FilterPolyfill(u(r))),
              (r._subscriptionManager = new C.SubscriptionManager(u(r))),
              (r._relay = null),
              (r._addresses = []),
              (r.hasMadeFirstChainChangedEmission = !1),
              (r.setProviderInfo = r.setProviderInfo.bind(u(r))),
              (r.updateProviderInfo = r.updateProviderInfo.bind(u(r))),
              (r.getChainId = r.getChainId.bind(u(r))),
              (r.setAppInfo = r.setAppInfo.bind(u(r))),
              (r.enable = r.enable.bind(u(r))),
              (r.close = r.close.bind(u(r))),
              (r.send = r.send.bind(u(r))),
              (r.sendAsync = r.sendAsync.bind(u(r))),
              (r.request = r.request.bind(u(r))),
              (r._setAddresses = r._setAddresses.bind(u(r))),
              (r.scanQRCode = r.scanQRCode.bind(u(r))),
              (r.genericRequest = r.genericRequest.bind(u(r))),
              (r._chainIdFromOpts = e.chainId),
              (r._jsonRpcUrlFromOpts = e.jsonRpcUrl),
              (r._overrideIsMetaMask = e.overrideIsMetaMask),
              (r._relayProvider = e.relayProvider),
              (r._storage = e.storage),
              (r._relayEventManager = e.relayEventManager),
              (r.diagnostic = e.diagnosticLogger),
              (r.reloadOnDisconnect = !0),
              (r.isCoinbaseWallet =
                null === (s = e.overrideIsCoinbaseWallet) || void 0 === s || s),
              (r.isCoinbaseBrowser =
                null !== (i = e.overrideIsCoinbaseBrowser) &&
                void 0 !== i &&
                i),
              (r.qrUrl = e.qrUrl);
            var a = r.getChainId(),
              c = (0, v.prepend0x)(a.toString(16));
            r.emit("connect", { chainIdStr: c });
            var d = r._storage.getItem(b.LOCAL_STORAGE_ADDRESSES_KEY);
            if (d) {
              var l = d.split(" ");
              "" !== l[0] &&
                ((r._addresses = l.map(function (e) {
                  return (0, v.ensureAddressString)(e);
                })),
                r.emit("accountsChanged", l));
            }
            return (
              r._subscriptionManager.events.on("notification", function (e) {
                r.emit("message", { type: e.method, data: e.params });
              }),
              r._isAuthorized() && r.initializeRelay(),
              window.addEventListener("message", function (e) {
                var t;
                if (
                  e.origin === location.origin &&
                  e.source === window &&
                  "walletLinkMessage" === e.data.type &&
                  "dappChainSwitched" === e.data.data.action
                ) {
                  var n = e.data.data.chainId,
                    s =
                      null !== (t = e.data.data.jsonRpcUrl) && void 0 !== t
                        ? t
                        : r.jsonRpcUrl;
                  r.updateProviderInfo(s, Number(n));
                }
              }),
              r
            );
          }
          return (
            c(n, [
              {
                key: "selectedAddress",
                get: function () {
                  return this._addresses[0] || void 0;
                },
              },
              {
                key: "networkVersion",
                get: function () {
                  return this.getChainId().toString(10);
                },
              },
              {
                key: "chainId",
                get: function () {
                  return (0, v.prepend0x)(this.getChainId().toString(16));
                },
              },
              {
                key: "isWalletLink",
                get: function () {
                  return !0;
                },
              },
              {
                key: "isMetaMask",
                get: function () {
                  return this._overrideIsMetaMask;
                },
              },
              {
                key: "host",
                get: function () {
                  return this.jsonRpcUrl;
                },
              },
              {
                key: "connected",
                get: function () {
                  return !0;
                },
              },
              {
                key: "isConnected",
                value: function () {
                  return !0;
                },
              },
              {
                key: "jsonRpcUrl",
                get: function () {
                  var e;
                  return null !== (e = this._storage.getItem(S)) && void 0 !== e
                    ? e
                    : this._jsonRpcUrlFromOpts;
                },
                set: function (e) {
                  this._storage.setItem(S, e);
                },
              },
              {
                key: "disableReloadOnDisconnect",
                value: function () {
                  this.reloadOnDisconnect = !1;
                },
              },
              {
                key: "setProviderInfo",
                value: function (e, t) {
                  this.isCoinbaseBrowser ||
                    ((this._chainIdFromOpts = t),
                    (this._jsonRpcUrlFromOpts = e)),
                    this.updateProviderInfo(this.jsonRpcUrl, this.getChainId());
                },
              },
              {
                key: "updateProviderInfo",
                value: function (e, t) {
                  this.jsonRpcUrl = e;
                  var n = this.getChainId();
                  this._storage.setItem(_, t.toString(10)),
                    (!((0, v.ensureIntNumber)(t) !== n) &&
                      this.hasMadeFirstChainChangedEmission) ||
                      (this.emit("chainChanged", this.getChainId()),
                      (this.hasMadeFirstChainChangedEmission = !0));
                },
              },
              {
                key: "watchAsset",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n, r, s, a, o) {
                      var c, u;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                return (
                                  (c = e.sent),
                                  (e.next = 5),
                                  c.watchAsset(
                                    t,
                                    n,
                                    r,
                                    s,
                                    a,
                                    null === o || void 0 === o
                                      ? void 0
                                      : o.toString()
                                  ).promise
                                );
                              case 5:
                                if (
                                  ((u = e.sent), !(0, k.isErrorResponse)(u))
                                ) {
                                  e.next = 8;
                                  break;
                                }
                                return e.abrupt("return", !1);
                              case 8:
                                return e.abrupt("return", !!u.result);
                              case 9:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n, r, s, i, a) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "addEthereumChain",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n, r, s, a, o) {
                      var c, u, d, l, h;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  (0, v.ensureIntNumber)(t) !==
                                  this.getChainId()
                                ) {
                                  e.next = 2;
                                  break;
                                }
                                return e.abrupt("return", !1);
                              case 2:
                                return (e.next = 4), this.initializeRelay();
                              case 4:
                                if (
                                  ((d = e.sent),
                                  (l = d.inlineAddEthereumChain(t.toString())),
                                  this._isAuthorized() || l)
                                ) {
                                  e.next = 9;
                                  break;
                                }
                                return (
                                  (e.next = 9),
                                  d.requestEthereumAccounts().promise
                                );
                              case 9:
                                return (
                                  (e.next = 11),
                                  d.addEthereumChain(
                                    t.toString(),
                                    n,
                                    a,
                                    r,
                                    s,
                                    o
                                  ).promise
                                );
                              case 11:
                                if (
                                  ((h = e.sent), !(0, k.isErrorResponse)(h))
                                ) {
                                  e.next = 14;
                                  break;
                                }
                                return e.abrupt("return", !1);
                              case 14:
                                return (
                                  !0 ===
                                    (null === (c = h.result) || void 0 === c
                                      ? void 0
                                      : c.isApproved) &&
                                    this.updateProviderInfo(n[0], t),
                                  e.abrupt(
                                    "return",
                                    !0 ===
                                      (null === (u = h.result) || void 0 === u
                                        ? void 0
                                        : u.isApproved)
                                  )
                                );
                              case 16:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n, r, s, i, a) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "switchEthereumChain",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                return (
                                  (n = e.sent),
                                  (e.next = 5),
                                  n.switchEthereumChain(
                                    t.toString(10),
                                    this.selectedAddress || void 0
                                  ).promise
                                );
                              case 5:
                                if (
                                  ((r = e.sent), !(0, k.isErrorResponse)(r))
                                ) {
                                  e.next = 14;
                                  break;
                                }
                                if (r.errorCode) {
                                  e.next = 9;
                                  break;
                                }
                                return e.abrupt("return");
                              case 9:
                                if (
                                  r.errorCode !==
                                  g.standardErrorCodes.provider.unsupportedChain
                                ) {
                                  e.next = 13;
                                  break;
                                }
                                throw g.standardErrors.provider.unsupportedChain();
                              case 13:
                                throw g.standardErrors.provider.custom({
                                  message: r.errorMessage,
                                  code: r.errorCode,
                                });
                              case 14:
                                (s = r.result).isApproved &&
                                  s.rpcUrl.length > 0 &&
                                  this.updateProviderInfo(s.rpcUrl, t);
                              case 16:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "setAppInfo",
                value: function (e, t) {
                  this.initializeRelay().then(function (n) {
                    return n.setAppInfo(e, t);
                  });
                },
              },
              {
                key: "enable",
                value: (function () {
                  var e = a(
                    i().mark(function e() {
                      var t;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  (null === (t = this.diagnostic) ||
                                    void 0 === t ||
                                    t.log(E.EVENTS.ETH_ACCOUNTS_STATE, {
                                      method: "provider::enable",
                                      addresses_length: this._addresses.length,
                                      sessionIdHash: this._relay
                                        ? w.Session.hash(this._relay.session.id)
                                        : void 0,
                                    }),
                                  !this._isAuthorized())
                                ) {
                                  e.next = 3;
                                  break;
                                }
                                return e.abrupt("return", s(this._addresses));
                              case 3:
                                return (
                                  (e.next = 5), this.send("eth_requestAccounts")
                                );
                              case 5:
                                return e.abrupt("return", e.sent);
                              case 6:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "close",
                value: (function () {
                  var e = a(
                    i().mark(function e() {
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                e.sent.resetAndReload();
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "send",
                value: function (e, t) {
                  try {
                    var n = this._send(e, t);
                    if (n instanceof Promise)
                      return n.catch(function (t) {
                        throw (0, g.serializeError)(t, e);
                      });
                  } catch (r) {
                    throw (0, g.serializeError)(r, e);
                  }
                },
              },
              {
                key: "_send",
                value: function (e, t) {
                  var n = this;
                  if ("string" === typeof e) {
                    var r = {
                      jsonrpc: "2.0",
                      id: 0,
                      method: e,
                      params: Array.isArray(t) ? t : void 0 !== t ? [t] : [],
                    };
                    return this._sendRequestAsync(r).then(function (e) {
                      return e.result;
                    });
                  }
                  if ("function" === typeof t) {
                    var s = e,
                      i = t;
                    return this._sendAsync(s, i);
                  }
                  if (Array.isArray(e))
                    return e.map(function (e) {
                      return n._sendRequest(e);
                    });
                  var a = e;
                  return this._sendRequest(a);
                },
              },
              {
                key: "sendAsync",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n) {
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.prev = 0),
                                  e.abrupt(
                                    "return",
                                    this._sendAsync(t, n).catch(function (e) {
                                      throw (0, g.serializeError)(e, t);
                                    })
                                  )
                                );
                              case 4:
                                return (
                                  (e.prev = 4),
                                  (e.t0 = e.catch(0)),
                                  e.abrupt(
                                    "return",
                                    Promise.reject(
                                      (0, g.serializeError)(e.t0, t)
                                    )
                                  )
                                );
                              case 7:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 4]]
                      );
                    })
                  );
                  return function (t, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_sendAsync",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n) {
                      var r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if ("function" === typeof n) {
                                  e.next = 2;
                                  break;
                                }
                                throw new Error("callback is required");
                              case 2:
                                if (!Array.isArray(t)) {
                                  e.next = 6;
                                  break;
                                }
                                return (
                                  (r = n),
                                  this._sendMultipleRequestsAsync(t)
                                    .then(function (e) {
                                      return r(null, e);
                                    })
                                    .catch(function (e) {
                                      return r(e, null);
                                    }),
                                  e.abrupt("return")
                                );
                              case 6:
                                return (
                                  (s = n),
                                  e.abrupt(
                                    "return",
                                    this._sendRequestAsync(t)
                                      .then(function (e) {
                                        return s(null, e);
                                      })
                                      .catch(function (e) {
                                        return s(e, null);
                                      })
                                  )
                                );
                              case 8:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "request",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.prev = 0),
                                  e.abrupt(
                                    "return",
                                    this._request(t).catch(function (e) {
                                      throw (0, g.serializeError)(e, t.method);
                                    })
                                  )
                                );
                              case 4:
                                return (
                                  (e.prev = 4),
                                  (e.t0 = e.catch(0)),
                                  e.abrupt(
                                    "return",
                                    Promise.reject(
                                      (0, g.serializeError)(e.t0, t.method)
                                    )
                                  )
                                );
                              case 7:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 4]]
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_request",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a, o;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  t &&
                                  "object" === typeof t &&
                                  !Array.isArray(t)
                                ) {
                                  e.next = 2;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidRequest({
                                  message:
                                    "Expected a single, non-array, object argument.",
                                  data: t,
                                });
                              case 2:
                                if (
                                  ((n = t.method),
                                  (r = t.params),
                                  "string" === typeof n && 0 !== n.length)
                                ) {
                                  e.next = 5;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidRequest({
                                  message:
                                    "'args.method' must be a non-empty string.",
                                  data: t,
                                });
                              case 5:
                                if (
                                  void 0 === r ||
                                  Array.isArray(r) ||
                                  ("object" === typeof r && null !== r)
                                ) {
                                  e.next = 7;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidRequest({
                                  message:
                                    "'args.params' must be an object or array if provided.",
                                  data: t,
                                });
                              case 7:
                                return (
                                  (s = void 0 === r ? [] : r),
                                  (a = this._relayEventManager.makeRequestId()),
                                  (e.next = 11),
                                  this._sendRequestAsync({
                                    method: n,
                                    params: s,
                                    jsonrpc: "2.0",
                                    id: a,
                                  })
                                );
                              case 11:
                                return (
                                  (o = e.sent), e.abrupt("return", o.result)
                                );
                              case 13:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "scanQRCode",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                return (
                                  (n = e.sent),
                                  (e.next = 5),
                                  n.scanQRCode((0, v.ensureRegExpString)(t))
                                    .promise
                                );
                              case 5:
                                if (
                                  ((r = e.sent), !(0, k.isErrorResponse)(r))
                                ) {
                                  e.next = 10;
                                  break;
                                }
                                throw (0, g.serializeError)(
                                  r.errorMessage,
                                  "scanQRCode"
                                );
                              case 10:
                                if ("string" === typeof r.result) {
                                  e.next = 12;
                                  break;
                                }
                                throw (0, g.serializeError)(
                                  "result was not a string",
                                  "scanQRCode"
                                );
                              case 12:
                                return e.abrupt("return", r.result);
                              case 13:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "genericRequest",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n) {
                      var r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                return (
                                  (r = e.sent),
                                  (e.next = 5),
                                  r.genericRequest(t, n).promise
                                );
                              case 5:
                                if (
                                  ((s = e.sent), !(0, k.isErrorResponse)(s))
                                ) {
                                  e.next = 10;
                                  break;
                                }
                                throw (0, g.serializeError)(
                                  s.errorMessage,
                                  "generic"
                                );
                              case 10:
                                if ("string" === typeof s.result) {
                                  e.next = 12;
                                  break;
                                }
                                throw (0, g.serializeError)(
                                  "result was not a string",
                                  "generic"
                                );
                              case 12:
                                return e.abrupt("return", s.result);
                              case 13:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "connectAndSignIn",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  null === (n = this.diagnostic) ||
                                    void 0 === n ||
                                    n.log(E.EVENTS.ETH_ACCOUNTS_STATE, {
                                      method: "provider::connectAndSignIn",
                                      sessionIdHash: this._relay
                                        ? w.Session.hash(this._relay.session.id)
                                        : void 0,
                                    }),
                                  (e.prev = 1),
                                  (e.next = 4),
                                  this.initializeRelay()
                                );
                              case 4:
                                if ((s = e.sent) instanceof m.MobileRelay) {
                                  e.next = 7;
                                  break;
                                }
                                throw new Error(
                                  "connectAndSignIn is only supported on mobile"
                                );
                              case 7:
                                return (
                                  (e.next = 9), s.connectAndSignIn(t).promise
                                );
                              case 9:
                                if (
                                  ((r = e.sent), !(0, k.isErrorResponse)(r))
                                ) {
                                  e.next = 12;
                                  break;
                                }
                                throw new Error(r.errorMessage);
                              case 12:
                                e.next = 19;
                                break;
                              case 14:
                                if (
                                  ((e.prev = 14),
                                  (e.t0 = e.catch(1)),
                                  "string" !== typeof e.t0.message ||
                                    !e.t0.message.match(/(denied|rejected)/i))
                                ) {
                                  e.next = 18;
                                  break;
                                }
                                throw g.standardErrors.provider.userRejectedRequest(
                                  "User denied account authorization"
                                );
                              case 18:
                                throw e.t0;
                              case 19:
                                if (r.result) {
                                  e.next = 21;
                                  break;
                                }
                                throw new Error("accounts received is empty");
                              case 21:
                                if (
                                  ((a = r.result.accounts),
                                  this._setAddresses(a),
                                  this.isCoinbaseBrowser)
                                ) {
                                  e.next = 26;
                                  break;
                                }
                                return (
                                  (e.next = 26),
                                  this.switchEthereumChain(this.getChainId())
                                );
                              case 26:
                                return e.abrupt("return", r.result);
                              case 27:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[1, 14]]
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "selectProvider",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                return (
                                  (n = e.sent),
                                  (e.next = 5),
                                  n.selectProvider(t).promise
                                );
                              case 5:
                                if (
                                  ((r = e.sent), !(0, k.isErrorResponse)(r))
                                ) {
                                  e.next = 10;
                                  break;
                                }
                                throw (0, g.serializeError)(
                                  r.errorMessage,
                                  "selectProvider"
                                );
                              case 10:
                                if ("string" === typeof r.result) {
                                  e.next = 12;
                                  break;
                                }
                                throw (0, g.serializeError)(
                                  "result was not a string",
                                  "selectProvider"
                                );
                              case 12:
                                return e.abrupt("return", r.result);
                              case 13:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "supportsSubscriptions",
                value: function () {
                  return !1;
                },
              },
              {
                key: "subscribe",
                value: function () {
                  throw new Error("Subscriptions are not supported");
                },
              },
              {
                key: "unsubscribe",
                value: function () {
                  throw new Error("Subscriptions are not supported");
                },
              },
              {
                key: "disconnect",
                value: function () {
                  return !0;
                },
              },
              {
                key: "_sendRequest",
                value: function (e) {
                  var t = { jsonrpc: "2.0", id: e.id },
                    n = e.method;
                  if (
                    ((t.result = this._handleSynchronousMethods(e)),
                    void 0 === t.result)
                  )
                    throw new Error(
                      "Coinbase Wallet does not support calling ".concat(
                        n,
                        " synchronously without "
                      ) +
                        "a callback. Please provide a callback parameter to call ".concat(
                          n,
                          " "
                        ) +
                        "asynchronously."
                    );
                  return t;
                },
              },
              {
                key: "_setAddresses",
                value: function (e, t) {
                  if (!Array.isArray(e))
                    throw new Error("addresses is not an array");
                  var n = e.map(function (e) {
                    return (0, v.ensureAddressString)(e);
                  });
                  JSON.stringify(n) !== JSON.stringify(this._addresses) &&
                    ((this._addresses = n),
                    this.emit("accountsChanged", this._addresses),
                    this._storage.setItem(
                      b.LOCAL_STORAGE_ADDRESSES_KEY,
                      n.join(" ")
                    ));
                },
              },
              {
                key: "_sendRequestAsync",
                value: function (e) {
                  var t = this;
                  return new Promise(function (n, r) {
                    try {
                      var s = t._handleSynchronousMethods(e);
                      if (void 0 !== s)
                        return n({ jsonrpc: "2.0", id: e.id, result: s });
                      var i = t._handleAsynchronousFilterMethods(e);
                      if (void 0 !== i)
                        return void i
                          .then(function (t) {
                            return n(
                              Object.assign(Object.assign({}, t), { id: e.id })
                            );
                          })
                          .catch(function (e) {
                            return r(e);
                          });
                      var a = t._handleSubscriptionMethods(e);
                      if (void 0 !== a)
                        return void a
                          .then(function (t) {
                            return n({
                              jsonrpc: "2.0",
                              id: e.id,
                              result: t.result,
                            });
                          })
                          .catch(function (e) {
                            return r(e);
                          });
                    } catch (o) {
                      return r(o);
                    }
                    t._handleAsynchronousMethods(e)
                      .then(function (t) {
                        return (
                          t &&
                          n(Object.assign(Object.assign({}, t), { id: e.id }))
                        );
                      })
                      .catch(function (e) {
                        return r(e);
                      });
                  });
                },
              },
              {
                key: "_sendMultipleRequestsAsync",
                value: function (e) {
                  var t = this;
                  return Promise.all(
                    e.map(function (e) {
                      return t._sendRequestAsync(e);
                    })
                  );
                },
              },
              {
                key: "_handleSynchronousMethods",
                value: function (e) {
                  var t = e.method,
                    n = e.params || [];
                  switch (t) {
                    case "eth_accounts":
                      return this._eth_accounts();
                    case "eth_coinbase":
                      return this._eth_coinbase();
                    case "eth_uninstallFilter":
                      return this._eth_uninstallFilter(n);
                    case "net_version":
                      return this._net_version();
                    case "eth_chainId":
                      return this._eth_chainId();
                    default:
                      return;
                  }
                },
              },
              {
                key: "_handleAsynchronousMethods",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n,
                        r,
                        s,
                        a = this;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                (n = t.method),
                                  (r = t.params || []),
                                  (e.t0 = n),
                                  (e.next =
                                    "eth_requestAccounts" === e.t0
                                      ? 5
                                      : "eth_sign" === e.t0
                                      ? 6
                                      : "eth_ecRecover" === e.t0
                                      ? 7
                                      : "personal_sign" === e.t0
                                      ? 8
                                      : "personal_ecRecover" === e.t0
                                      ? 9
                                      : "eth_signTransaction" === e.t0
                                      ? 10
                                      : "eth_sendRawTransaction" === e.t0
                                      ? 11
                                      : "eth_sendTransaction" === e.t0
                                      ? 12
                                      : "eth_signTypedData_v1" === e.t0
                                      ? 13
                                      : "eth_signTypedData_v2" === e.t0
                                      ? 14
                                      : "eth_signTypedData_v3" === e.t0
                                      ? 15
                                      : "eth_signTypedData_v4" === e.t0 ||
                                        "eth_signTypedData" === e.t0
                                      ? 16
                                      : "cbWallet_arbitrary" === e.t0
                                      ? 17
                                      : "wallet_addEthereumChain" === e.t0
                                      ? 18
                                      : "wallet_switchEthereumChain" === e.t0
                                      ? 19
                                      : "wallet_watchAsset" === e.t0
                                      ? 20
                                      : 21);
                                break;
                              case 5:
                                return e.abrupt(
                                  "return",
                                  this._eth_requestAccounts()
                                );
                              case 6:
                                return e.abrupt("return", this._eth_sign(r));
                              case 7:
                                return e.abrupt(
                                  "return",
                                  this._eth_ecRecover(r)
                                );
                              case 8:
                                return e.abrupt(
                                  "return",
                                  this._personal_sign(r)
                                );
                              case 9:
                                return e.abrupt(
                                  "return",
                                  this._personal_ecRecover(r)
                                );
                              case 10:
                                return e.abrupt(
                                  "return",
                                  this._eth_signTransaction(r)
                                );
                              case 11:
                                return e.abrupt(
                                  "return",
                                  this._eth_sendRawTransaction(r)
                                );
                              case 12:
                                return e.abrupt(
                                  "return",
                                  this._eth_sendTransaction(r)
                                );
                              case 13:
                                return e.abrupt(
                                  "return",
                                  this._eth_signTypedData_v1(r)
                                );
                              case 14:
                                return e.abrupt(
                                  "return",
                                  this._throwUnsupportedMethodError()
                                );
                              case 15:
                                return e.abrupt(
                                  "return",
                                  this._eth_signTypedData_v3(r)
                                );
                              case 16:
                                return e.abrupt(
                                  "return",
                                  this._eth_signTypedData_v4(r)
                                );
                              case 17:
                                return e.abrupt(
                                  "return",
                                  this._cbwallet_arbitrary(r)
                                );
                              case 18:
                                return e.abrupt(
                                  "return",
                                  this._wallet_addEthereumChain(r)
                                );
                              case 19:
                                return e.abrupt(
                                  "return",
                                  this._wallet_switchEthereumChain(r)
                                );
                              case 20:
                                return e.abrupt(
                                  "return",
                                  this._wallet_watchAsset(r)
                                );
                              case 21:
                                return (e.next = 23), this.initializeRelay();
                              case 23:
                                return (
                                  (s = e.sent),
                                  e.abrupt(
                                    "return",
                                    s
                                      .makeEthereumJSONRPCRequest(
                                        t,
                                        this.jsonRpcUrl
                                      )
                                      .catch(function (e) {
                                        var n;
                                        throw (
                                          ((e.code !==
                                            g.standardErrorCodes.rpc
                                              .methodNotFound &&
                                            e.code !==
                                              g.standardErrorCodes.rpc
                                                .methodNotSupported) ||
                                            null === (n = a.diagnostic) ||
                                            void 0 === n ||
                                            n.log(
                                              E.EVENTS.METHOD_NOT_IMPLEMENTED,
                                              {
                                                method: t.method,
                                                sessionIdHash: a._relay
                                                  ? w.Session.hash(
                                                      a._relay.session.id
                                                    )
                                                  : void 0,
                                              }
                                            ),
                                          e)
                                        );
                                      })
                                  )
                                );
                              case 25:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_handleAsynchronousFilterMethods",
                value: function (e) {
                  var t = e.method,
                    n = e.params || [];
                  switch (t) {
                    case "eth_newFilter":
                      return this._eth_newFilter(n);
                    case "eth_newBlockFilter":
                      return this._eth_newBlockFilter();
                    case "eth_newPendingTransactionFilter":
                      return this._eth_newPendingTransactionFilter();
                    case "eth_getFilterChanges":
                      return this._eth_getFilterChanges(n);
                    case "eth_getFilterLogs":
                      return this._eth_getFilterLogs(n);
                  }
                },
              },
              {
                key: "_handleSubscriptionMethods",
                value: function (e) {
                  switch (e.method) {
                    case "eth_subscribe":
                    case "eth_unsubscribe":
                      return this._subscriptionManager.handleRequest(e);
                  }
                },
              },
              {
                key: "_isKnownAddress",
                value: function (e) {
                  try {
                    var t = (0, v.ensureAddressString)(e);
                    return this._addresses
                      .map(function (e) {
                        return (0, v.ensureAddressString)(e);
                      })
                      .includes(t);
                  } catch (n) {}
                  return !1;
                },
              },
              {
                key: "_ensureKnownAddress",
                value: function (e) {
                  var t;
                  if (!this._isKnownAddress(e))
                    throw (
                      (null === (t = this.diagnostic) ||
                        void 0 === t ||
                        t.log(E.EVENTS.UNKNOWN_ADDRESS_ENCOUNTERED),
                      new Error("Unknown Ethereum address"))
                    );
                },
              },
              {
                key: "_prepareTransactionParams",
                value: function (e) {
                  var t = e.from
                    ? (0, v.ensureAddressString)(e.from)
                    : this.selectedAddress;
                  if (!t) throw new Error("Ethereum address is unavailable");
                  return (
                    this._ensureKnownAddress(t),
                    {
                      fromAddress: t,
                      toAddress: e.to ? (0, v.ensureAddressString)(e.to) : null,
                      weiValue:
                        null != e.value
                          ? (0, v.ensureBN)(e.value)
                          : new f.default(0),
                      data: e.data ? (0, v.ensureBuffer)(e.data) : r.alloc(0),
                      nonce:
                        null != e.nonce
                          ? (0, v.ensureIntNumber)(e.nonce)
                          : null,
                      gasPriceInWei:
                        null != e.gasPrice ? (0, v.ensureBN)(e.gasPrice) : null,
                      maxFeePerGas:
                        null != e.maxFeePerGas
                          ? (0, v.ensureBN)(e.maxFeePerGas)
                          : null,
                      maxPriorityFeePerGas:
                        null != e.maxPriorityFeePerGas
                          ? (0, v.ensureBN)(e.maxPriorityFeePerGas)
                          : null,
                      gasLimit: null != e.gas ? (0, v.ensureBN)(e.gas) : null,
                      chainId: e.chainId
                        ? (0, v.ensureIntNumber)(e.chainId)
                        : this.getChainId(),
                    }
                  );
                },
              },
              {
                key: "_isAuthorized",
                value: function () {
                  return this._addresses.length > 0;
                },
              },
              {
                key: "_requireAuthorization",
                value: function () {
                  if (!this._isAuthorized())
                    throw g.standardErrors.provider.unauthorized({});
                },
              },
              {
                key: "_throwUnsupportedMethodError",
                value: function () {
                  throw g.standardErrors.provider.unsupportedMethod({});
                },
              },
              {
                key: "_signEthereumMessage",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n, r, s) {
                      var a, o;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  this._ensureKnownAddress(n),
                                  (e.prev = 1),
                                  (e.next = 4),
                                  this.initializeRelay()
                                );
                              case 4:
                                return (
                                  (a = e.sent),
                                  (e.next = 7),
                                  a.signEthereumMessage(t, n, r, s).promise
                                );
                              case 7:
                                if (
                                  ((o = e.sent), !(0, k.isErrorResponse)(o))
                                ) {
                                  e.next = 10;
                                  break;
                                }
                                throw new Error(o.errorMessage);
                              case 10:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: o.result,
                                });
                              case 13:
                                if (
                                  ((e.prev = 13),
                                  (e.t0 = e.catch(1)),
                                  "string" !== typeof e.t0.message ||
                                    !e.t0.message.match(/(denied|rejected)/i))
                                ) {
                                  e.next = 17;
                                  break;
                                }
                                throw g.standardErrors.provider.userRejectedRequest(
                                  "User denied message signature"
                                );
                              case 17:
                                throw e.t0;
                              case 18:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[1, 13]]
                      );
                    })
                  );
                  return function (t, n, r, s) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_ethereumAddressFromSignedMessage",
                value: (function () {
                  var e = a(
                    i().mark(function e(t, n, r) {
                      var s, a;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), this.initializeRelay();
                              case 2:
                                return (
                                  (s = e.sent),
                                  (e.next = 5),
                                  s.ethereumAddressFromSignedMessage(t, n, r)
                                    .promise
                                );
                              case 5:
                                if (
                                  ((a = e.sent), !(0, k.isErrorResponse)(a))
                                ) {
                                  e.next = 8;
                                  break;
                                }
                                throw new Error(a.errorMessage);
                              case 8:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: a.result,
                                });
                              case 9:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n, r) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_accounts",
                value: function () {
                  return s(this._addresses);
                },
              },
              {
                key: "_eth_coinbase",
                value: function () {
                  return this.selectedAddress || null;
                },
              },
              {
                key: "_net_version",
                value: function () {
                  return this.getChainId().toString(10);
                },
              },
              {
                key: "_eth_chainId",
                value: function () {
                  return (0, v.hexStringFromIntNumber)(this.getChainId());
                },
              },
              {
                key: "getChainId",
                value: function () {
                  var e = this._storage.getItem(_);
                  if (!e) return (0, v.ensureIntNumber)(this._chainIdFromOpts);
                  var t = parseInt(e, 10);
                  return (0, v.ensureIntNumber)(t);
                },
              },
              {
                key: "_eth_requestAccounts",
                value: (function () {
                  var e = a(
                    i().mark(function e() {
                      var t, n, r;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  (null === (t = this.diagnostic) ||
                                    void 0 === t ||
                                    t.log(E.EVENTS.ETH_ACCOUNTS_STATE, {
                                      method: "provider::_eth_requestAccounts",
                                      addresses_length: this._addresses.length,
                                      sessionIdHash: this._relay
                                        ? w.Session.hash(this._relay.session.id)
                                        : void 0,
                                    }),
                                  !this._isAuthorized())
                                ) {
                                  e.next = 3;
                                  break;
                                }
                                return e.abrupt(
                                  "return",
                                  Promise.resolve({
                                    jsonrpc: "2.0",
                                    id: 0,
                                    result: this._addresses,
                                  })
                                );
                              case 3:
                                return (
                                  (e.prev = 3),
                                  (e.next = 6),
                                  this.initializeRelay()
                                );
                              case 6:
                                return (
                                  (r = e.sent),
                                  (e.next = 9),
                                  r.requestEthereumAccounts().promise
                                );
                              case 9:
                                if (
                                  ((n = e.sent), !(0, k.isErrorResponse)(n))
                                ) {
                                  e.next = 12;
                                  break;
                                }
                                throw new Error(n.errorMessage);
                              case 12:
                                e.next = 19;
                                break;
                              case 14:
                                if (
                                  ((e.prev = 14),
                                  (e.t0 = e.catch(3)),
                                  "string" !== typeof e.t0.message ||
                                    !e.t0.message.match(/(denied|rejected)/i))
                                ) {
                                  e.next = 18;
                                  break;
                                }
                                throw g.standardErrors.provider.userRejectedRequest(
                                  "User denied account authorization"
                                );
                              case 18:
                                throw e.t0;
                              case 19:
                                if (n.result) {
                                  e.next = 21;
                                  break;
                                }
                                throw new Error("accounts received is empty");
                              case 21:
                                if (
                                  (this._setAddresses(n.result),
                                  this.isCoinbaseBrowser)
                                ) {
                                  e.next = 25;
                                  break;
                                }
                                return (
                                  (e.next = 25),
                                  this.switchEthereumChain(this.getChainId())
                                );
                              case 25:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: this._addresses,
                                });
                              case 26:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[3, 14]]
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_sign",
                value: function (e) {
                  this._requireAuthorization();
                  var t = (0, v.ensureAddressString)(e[0]),
                    n = (0, v.ensureBuffer)(e[1]);
                  return this._signEthereumMessage(n, t, !1);
                },
              },
              {
                key: "_eth_ecRecover",
                value: function (e) {
                  var t = (0, v.ensureBuffer)(e[0]),
                    n = (0, v.ensureBuffer)(e[1]);
                  return this._ethereumAddressFromSignedMessage(t, n, !1);
                },
              },
              {
                key: "_personal_sign",
                value: function (e) {
                  this._requireAuthorization();
                  var t = (0, v.ensureBuffer)(e[0]),
                    n = (0, v.ensureAddressString)(e[1]);
                  return this._signEthereumMessage(t, n, !0);
                },
              },
              {
                key: "_personal_ecRecover",
                value: function (e) {
                  var t = (0, v.ensureBuffer)(e[0]),
                    n = (0, v.ensureBuffer)(e[1]);
                  return this._ethereumAddressFromSignedMessage(t, n, !0);
                },
              },
              {
                key: "_eth_signTransaction",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  this._requireAuthorization(),
                                  (n = this._prepareTransactionParams(
                                    t[0] || {}
                                  )),
                                  (e.prev = 2),
                                  (e.next = 5),
                                  this.initializeRelay()
                                );
                              case 5:
                                return (
                                  (r = e.sent),
                                  (e.next = 8),
                                  r.signEthereumTransaction(n).promise
                                );
                              case 8:
                                if (
                                  ((s = e.sent), !(0, k.isErrorResponse)(s))
                                ) {
                                  e.next = 11;
                                  break;
                                }
                                throw new Error(s.errorMessage);
                              case 11:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: s.result,
                                });
                              case 14:
                                if (
                                  ((e.prev = 14),
                                  (e.t0 = e.catch(2)),
                                  "string" !== typeof e.t0.message ||
                                    !e.t0.message.match(/(denied|rejected)/i))
                                ) {
                                  e.next = 18;
                                  break;
                                }
                                throw g.standardErrors.provider.userRejectedRequest(
                                  "User denied transaction signature"
                                );
                              case 18:
                                throw e.t0;
                              case 19:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[2, 14]]
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_sendRawTransaction",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (n = (0, v.ensureBuffer)(t[0])),
                                  (e.next = 3),
                                  this.initializeRelay()
                                );
                              case 3:
                                return (
                                  (r = e.sent),
                                  (e.next = 6),
                                  r.submitEthereumTransaction(
                                    n,
                                    this.getChainId()
                                  ).promise
                                );
                              case 6:
                                if (
                                  ((s = e.sent), !(0, k.isErrorResponse)(s))
                                ) {
                                  e.next = 9;
                                  break;
                                }
                                throw new Error(s.errorMessage);
                              case 9:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: s.result,
                                });
                              case 10:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_sendTransaction",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  this._requireAuthorization(),
                                  (n = this._prepareTransactionParams(
                                    t[0] || {}
                                  )),
                                  (e.prev = 2),
                                  (e.next = 5),
                                  this.initializeRelay()
                                );
                              case 5:
                                return (
                                  (r = e.sent),
                                  (e.next = 8),
                                  r.signAndSubmitEthereumTransaction(n).promise
                                );
                              case 8:
                                if (
                                  ((s = e.sent), !(0, k.isErrorResponse)(s))
                                ) {
                                  e.next = 11;
                                  break;
                                }
                                throw new Error(s.errorMessage);
                              case 11:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: s.result,
                                });
                              case 14:
                                if (
                                  ((e.prev = 14),
                                  (e.t0 = e.catch(2)),
                                  "string" !== typeof e.t0.message ||
                                    !e.t0.message.match(/(denied|rejected)/i))
                                ) {
                                  e.next = 18;
                                  break;
                                }
                                throw g.standardErrors.provider.userRejectedRequest(
                                  "User denied transaction signature"
                                );
                              case 18:
                                throw e.t0;
                              case 19:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[2, 14]]
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_signTypedData_v1",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  this._requireAuthorization(),
                                  (n = (0, v.ensureParsedJSONObject)(t[0])),
                                  (r = (0, v.ensureAddressString)(t[1])),
                                  this._ensureKnownAddress(r),
                                  (s = y.default.hashForSignTypedDataLegacy({
                                    data: n,
                                  })),
                                  (a = JSON.stringify(n, null, 2)),
                                  e.abrupt(
                                    "return",
                                    this._signEthereumMessage(s, r, !1, a)
                                  )
                                );
                              case 7:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_signTypedData_v3",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  this._requireAuthorization(),
                                  (n = (0, v.ensureAddressString)(t[0])),
                                  (r = (0, v.ensureParsedJSONObject)(t[1])),
                                  this._ensureKnownAddress(n),
                                  (s = y.default.hashForSignTypedData_v3({
                                    data: r,
                                  })),
                                  (a = JSON.stringify(r, null, 2)),
                                  e.abrupt(
                                    "return",
                                    this._signEthereumMessage(s, n, !1, a)
                                  )
                                );
                              case 7:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_signTypedData_v4",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  this._requireAuthorization(),
                                  (n = (0, v.ensureAddressString)(t[0])),
                                  (r = (0, v.ensureParsedJSONObject)(t[1])),
                                  this._ensureKnownAddress(n),
                                  (s = y.default.hashForSignTypedData_v4({
                                    data: r,
                                  })),
                                  (a = JSON.stringify(r, null, 2)),
                                  e.abrupt(
                                    "return",
                                    this._signEthereumMessage(s, n, !1, a)
                                  )
                                );
                              case 7:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_cbwallet_arbitrary",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((n = t[0]), "string" === typeof (r = t[1]))
                                ) {
                                  e.next = 4;
                                  break;
                                }
                                throw new Error("parameter must be a string");
                              case 4:
                                if ("object" === typeof n && null !== n) {
                                  e.next = 6;
                                  break;
                                }
                                throw new Error("parameter must be an object");
                              case 6:
                                return (e.next = 8), this.genericRequest(n, r);
                              case 8:
                                return (
                                  (s = e.sent),
                                  e.abrupt("return", {
                                    jsonrpc: "2.0",
                                    id: 0,
                                    result: s,
                                  })
                                );
                              case 10:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_wallet_addEthereumChain",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a, o, c;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((o = t[0]),
                                  0 !==
                                    (null === (n = o.rpcUrls) || void 0 === n
                                      ? void 0
                                      : n.length))
                                ) {
                                  e.next = 3;
                                  break;
                                }
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  error: {
                                    code: 2,
                                    message: "please pass in at least 1 rpcUrl",
                                  },
                                });
                              case 3:
                                if (o.chainName && "" !== o.chainName.trim()) {
                                  e.next = 5;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidParams(
                                  "chainName is a required field"
                                );
                              case 5:
                                if (o.nativeCurrency) {
                                  e.next = 7;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidParams(
                                  "nativeCurrency is a required field"
                                );
                              case 7:
                                return (
                                  (c = parseInt(o.chainId, 16)),
                                  (e.next = 10),
                                  this.addEthereumChain(
                                    c,
                                    null !== (r = o.rpcUrls) && void 0 !== r
                                      ? r
                                      : [],
                                    null !== (s = o.blockExplorerUrls) &&
                                      void 0 !== s
                                      ? s
                                      : [],
                                    o.chainName,
                                    null !== (a = o.iconUrls) && void 0 !== a
                                      ? a
                                      : [],
                                    o.nativeCurrency
                                  )
                                );
                              case 10:
                                if (!e.sent) {
                                  e.next = 13;
                                  break;
                                }
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: null,
                                });
                              case 13:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  error: {
                                    code: 2,
                                    message: "unable to add ethereum chain",
                                  },
                                });
                              case 14:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_wallet_switchEthereumChain",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (n = t[0]),
                                  (e.next = 3),
                                  this.switchEthereumChain(
                                    parseInt(n.chainId, 16)
                                  )
                                );
                              case 3:
                                return e.abrupt("return", {
                                  jsonrpc: "2.0",
                                  id: 0,
                                  result: null,
                                });
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_wallet_watchAsset",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r, s, a, o, c, u, d;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if ((n = Array.isArray(t) ? t[0] : t).type) {
                                  e.next = 3;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidParams(
                                  "Type is required"
                                );
                              case 3:
                                if (
                                  "ERC20" ===
                                  (null === n || void 0 === n ? void 0 : n.type)
                                ) {
                                  e.next = 5;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidParams(
                                  "Asset of type '".concat(
                                    n.type,
                                    "' is not supported"
                                  )
                                );
                              case 5:
                                if (
                                  null === n || void 0 === n
                                    ? void 0
                                    : n.options
                                ) {
                                  e.next = 7;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidParams(
                                  "Options are required"
                                );
                              case 7:
                                if (
                                  null === n || void 0 === n
                                    ? void 0
                                    : n.options.address
                                ) {
                                  e.next = 9;
                                  break;
                                }
                                throw g.standardErrors.rpc.invalidParams(
                                  "Address is required"
                                );
                              case 9:
                                return (
                                  (r = this.getChainId()),
                                  (s = n.options),
                                  (a = s.address),
                                  (o = s.symbol),
                                  (c = s.image),
                                  (u = s.decimals),
                                  (e.next = 13),
                                  this.watchAsset(n.type, a, o, u, c, r)
                                );
                              case 13:
                                return (
                                  (d = e.sent),
                                  e.abrupt("return", {
                                    jsonrpc: "2.0",
                                    id: 0,
                                    result: d,
                                  })
                                );
                              case 15:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_uninstallFilter",
                value: function (e) {
                  var t = (0, v.ensureHexString)(e[0]);
                  return this._filterPolyfill.uninstallFilter(t);
                },
              },
              {
                key: "_eth_newFilter",
                value: (function () {
                  var e = a(
                    i().mark(function e(t) {
                      var n, r;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (n = t[0]),
                                  (e.next = 3),
                                  this._filterPolyfill.newFilter(n)
                                );
                              case 3:
                                return (
                                  (r = e.sent),
                                  e.abrupt("return", {
                                    jsonrpc: "2.0",
                                    id: 0,
                                    result: r,
                                  })
                                );
                              case 5:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_newBlockFilter",
                value: (function () {
                  var e = a(
                    i().mark(function e() {
                      var t;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.next = 2),
                                  this._filterPolyfill.newBlockFilter()
                                );
                              case 2:
                                return (
                                  (t = e.sent),
                                  e.abrupt("return", {
                                    jsonrpc: "2.0",
                                    id: 0,
                                    result: t,
                                  })
                                );
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_newPendingTransactionFilter",
                value: (function () {
                  var e = a(
                    i().mark(function e() {
                      var t;
                      return i().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.next = 2),
                                  this._filterPolyfill.newPendingTransactionFilter()
                                );
                              case 2:
                                return (
                                  (t = e.sent),
                                  e.abrupt("return", {
                                    jsonrpc: "2.0",
                                    id: 0,
                                    result: t,
                                  })
                                );
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_eth_getFilterChanges",
                value: function (e) {
                  var t = (0, v.ensureHexString)(e[0]);
                  return this._filterPolyfill.getFilterChanges(t);
                },
              },
              {
                key: "_eth_getFilterLogs",
                value: function (e) {
                  var t = (0, v.ensureHexString)(e[0]);
                  return this._filterPolyfill.getFilterLogs(t);
                },
              },
              {
                key: "initializeRelay",
                value: function () {
                  var e = this;
                  return this._relay
                    ? Promise.resolve(this._relay)
                    : this._relayProvider().then(function (t) {
                        return (
                          t.setAccountsCallback(function (t, n) {
                            return e._setAddresses(t, n);
                          }),
                          t.setChainCallback(function (t, n) {
                            e.updateProviderInfo(n, parseInt(t, 10));
                          }),
                          t.setDappDefaultChainCallback(e._chainIdFromOpts),
                          (e._relay = t),
                          t
                        );
                      });
                },
              },
            ]),
            n
          );
        })(p.EventEmitter);
      t.CoinbaseWalletProvider = I;
    },
    4995: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.EVENTS = void 0),
        (t.EVENTS = {
          STARTED_CONNECTING: "walletlink_sdk.started.connecting",
          CONNECTED_STATE_CHANGE: "walletlink_sdk.connected",
          DISCONNECTED: "walletlink_sdk.disconnected",
          METADATA_DESTROYED: "walletlink_sdk_metadata_destroyed",
          LINKED: "walletlink_sdk.linked",
          FAILURE: "walletlink_sdk.generic_failure",
          SESSION_CONFIG_RECEIVED:
            "walletlink_sdk.session_config_event_received",
          ETH_ACCOUNTS_STATE: "walletlink_sdk.eth_accounts_state",
          SESSION_STATE_CHANGE: "walletlink_sdk.session_state_change",
          UNLINKED_ERROR_STATE: "walletlink_sdk.unlinked_error_state",
          SKIPPED_CLEARING_SESSION: "walletlink_sdk.skipped_clearing_session",
          GENERAL_ERROR: "walletlink_sdk.general_error",
          WEB3_REQUEST: "walletlink_sdk.web3.request",
          WEB3_REQUEST_PUBLISHED: "walletlink_sdk.web3.request_published",
          WEB3_RESPONSE: "walletlink_sdk.web3.response",
          METHOD_NOT_IMPLEMENTED: "walletlink_sdk.method_not_implemented",
          UNKNOWN_ADDRESS_ENCOUNTERED:
            "walletlink_sdk.unknown_address_encountered",
        });
    },
    21843: function (e, t, n) {
      "use strict";
      var r = n(861).default,
        s = n(17061).default,
        i = n(17156).default,
        a = n(56690).default,
        o = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.filterFromParam = t.FilterPolyfill = void 0);
      var c = n(29213),
        u = n(30246),
        d = { jsonrpc: "2.0", id: 0 },
        l = (function () {
          function e(t) {
            a(this, e),
              (this.logFilters = new Map()),
              (this.blockFilters = new Set()),
              (this.pendingTransactionFilters = new Set()),
              (this.cursors = new Map()),
              (this.timeouts = new Map()),
              (this.nextFilterId = (0, c.IntNumber)(1)),
              (this.REQUEST_THROTTLE_INTERVAL = 1e3),
              (this.lastFetchTimestamp = new Date(0)),
              (this.resolvers = []),
              (this.provider = t);
          }
          return (
            o(e, [
              {
                key: "newFilter",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n, r;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (n = h(t)),
                                  (r = this.makeFilterId()),
                                  (e.next = 4),
                                  this.setInitialCursorPosition(r, n.fromBlock)
                                );
                              case 4:
                                return (
                                  e.sent,
                                  this.logFilters.set(r, n),
                                  this.setFilterTimeout(r),
                                  e.abrupt(
                                    "return",
                                    (0, u.hexStringFromIntNumber)(r)
                                  )
                                );
                              case 9:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "newBlockFilter",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      var t;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (t = this.makeFilterId()),
                                  (e.next = 3),
                                  this.setInitialCursorPosition(t, "latest")
                                );
                              case 3:
                                return (
                                  e.sent,
                                  this.blockFilters.add(t),
                                  this.setFilterTimeout(t),
                                  e.abrupt(
                                    "return",
                                    (0, u.hexStringFromIntNumber)(t)
                                  )
                                );
                              case 8:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "newPendingTransactionFilter",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      var t;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (t = this.makeFilterId()),
                                  (e.next = 3),
                                  this.setInitialCursorPosition(t, "latest")
                                );
                              case 3:
                                return (
                                  e.sent,
                                  this.pendingTransactionFilters.add(t),
                                  this.setFilterTimeout(t),
                                  e.abrupt(
                                    "return",
                                    (0, u.hexStringFromIntNumber)(t)
                                  )
                                );
                              case 8:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "uninstallFilter",
                value: function (e) {
                  var t = (0, u.intNumberFromHexString)(e);
                  return this.deleteFilter(t), !0;
                },
              },
              {
                key: "getFilterChanges",
                value: function (e) {
                  var t = (0, u.intNumberFromHexString)(e);
                  return (
                    this.timeouts.has(t) && this.setFilterTimeout(t),
                    this.logFilters.has(t)
                      ? this.getLogFilterChanges(t)
                      : this.blockFilters.has(t)
                      ? this.getBlockFilterChanges(t)
                      : this.pendingTransactionFilters.has(t)
                      ? this.getPendingTransactionFilterChanges(t)
                      : Promise.resolve(v())
                  );
                },
              },
              {
                key: "getFilterLogs",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n, r;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((n = (0, u.intNumberFromHexString)(t)),
                                  (r = this.logFilters.get(n)))
                                ) {
                                  e.next = 4;
                                  break;
                                }
                                return e.abrupt("return", v());
                              case 4:
                                return e.abrupt(
                                  "return",
                                  this.sendAsyncPromise(
                                    Object.assign(Object.assign({}, d), {
                                      method: "eth_getLogs",
                                      params: [f(r)],
                                    })
                                  )
                                );
                              case 5:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "makeFilterId",
                value: function () {
                  return (0, c.IntNumber)(++this.nextFilterId);
                },
              },
              {
                key: "sendAsyncPromise",
                value: function (e) {
                  var t = this;
                  return new Promise(function (n, r) {
                    t.provider.sendAsync(e, function (e, t) {
                      return e
                        ? r(e)
                        : Array.isArray(t) || null == t
                        ? r(
                            new Error(
                              "unexpected response received: ".concat(
                                JSON.stringify(t)
                              )
                            )
                          )
                        : void n(t);
                    });
                  });
                },
              },
              {
                key: "deleteFilter",
                value: function (e) {
                  this.logFilters.delete(e),
                    this.blockFilters.delete(e),
                    this.pendingTransactionFilters.delete(e),
                    this.cursors.delete(e),
                    this.timeouts.delete(e);
                },
              },
              {
                key: "getLogFilterChanges",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n, i, a, o, l, h, p, g;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((n = this.logFilters.get(t)),
                                  (i = this.cursors.get(t)) && n)
                                ) {
                                  e.next = 4;
                                  break;
                                }
                                return e.abrupt("return", v());
                              case 4:
                                return (
                                  (e.next = 6), this.getCurrentBlockHeight()
                                );
                              case 6:
                                if (
                                  ((a = e.sent),
                                  (o = "latest" === n.toBlock ? a : n.toBlock),
                                  !(i > a))
                                ) {
                                  e.next = 10;
                                  break;
                                }
                                return e.abrupt("return", m());
                              case 10:
                                if (!(i > Number(n.toBlock))) {
                                  e.next = 12;
                                  break;
                                }
                                return e.abrupt("return", m());
                              case 12:
                                return (
                                  (e.next = 15),
                                  this.sendAsyncPromise(
                                    Object.assign(Object.assign({}, d), {
                                      method: "eth_getLogs",
                                      params: [
                                        f(
                                          Object.assign(Object.assign({}, n), {
                                            fromBlock: i,
                                            toBlock: o,
                                          })
                                        ),
                                      ],
                                    })
                                  )
                                );
                              case 15:
                                return (
                                  (l = e.sent),
                                  Array.isArray(l.result) &&
                                    ((h = l.result.map(function (e) {
                                      return (0,
                                      u.intNumberFromHexString)(e.blockNumber || "0x0");
                                    })),
                                    (p = Math.max.apply(Math, r(h))) &&
                                      p > i &&
                                      ((g = (0, c.IntNumber)(p + 1)),
                                      this.cursors.set(t, g))),
                                  e.abrupt("return", l)
                                );
                              case 18:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "getBlockFilterChanges",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n,
                        r,
                        i,
                        a,
                        o = this;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if ((n = this.cursors.get(t))) {
                                  e.next = 3;
                                  break;
                                }
                                return e.abrupt("return", v());
                              case 3:
                                return (
                                  (e.next = 5), this.getCurrentBlockHeight()
                                );
                              case 5:
                                if (((r = e.sent), !(n > r))) {
                                  e.next = 8;
                                  break;
                                }
                                return e.abrupt("return", m());
                              case 8:
                                return (
                                  (e.next = 11),
                                  Promise.all(
                                    (0, u.range)(n, r + 1).map(function (e) {
                                      return o.getBlockHashByNumber(
                                        (0, c.IntNumber)(e)
                                      );
                                    })
                                  )
                                );
                              case 11:
                                return (
                                  (i = e.sent.filter(function (e) {
                                    return !!e;
                                  })),
                                  (a = (0, c.IntNumber)(n + i.length)),
                                  this.cursors.set(t, a),
                                  e.abrupt(
                                    "return",
                                    Object.assign(Object.assign({}, d), {
                                      result: i,
                                    })
                                  )
                                );
                              case 16:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "getPendingTransactionFilterChanges",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      return s().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return e.abrupt("return", Promise.resolve(m()));
                            case 1:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "setInitialCursorPosition",
                value: (function () {
                  var e = i(
                    s().mark(function e(t, n) {
                      var r, i;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.next = 2), this.getCurrentBlockHeight()
                                );
                              case 2:
                                return (
                                  (r = e.sent),
                                  (i = "number" === typeof n && n > r ? n : r),
                                  this.cursors.set(t, i),
                                  e.abrupt("return", i)
                                );
                              case 6:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "setFilterTimeout",
                value: function (e) {
                  var t = this,
                    n = this.timeouts.get(e);
                  n && window.clearTimeout(n);
                  var r = window.setTimeout(function () {
                    t.deleteFilter(e);
                  }, 3e5);
                  this.timeouts.set(e, r);
                },
              },
              {
                key: "getCurrentBlockHeight",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      var t,
                        n,
                        r = this;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  !(
                                    (t = new Date()).getTime() -
                                      this.lastFetchTimestamp.getTime() >
                                    this.REQUEST_THROTTLE_INTERVAL
                                  )
                                ) {
                                  e.next = 9;
                                  break;
                                }
                                return (
                                  (this.lastFetchTimestamp = t),
                                  (e.next = 5),
                                  this._getCurrentBlockHeight()
                                );
                              case 5:
                                (n = e.sent),
                                  (this.currentBlockHeight = n),
                                  this.resolvers.forEach(function (e) {
                                    return e(n);
                                  }),
                                  (this.resolvers = []);
                              case 9:
                                if (this.currentBlockHeight) {
                                  e.next = 11;
                                  break;
                                }
                                return e.abrupt(
                                  "return",
                                  new Promise(function (e) {
                                    return r.resolvers.push(e);
                                  })
                                );
                              case 11:
                                return e.abrupt(
                                  "return",
                                  this.currentBlockHeight
                                );
                              case 12:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "_getCurrentBlockHeight",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      var t, n;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.next = 2),
                                  this.sendAsyncPromise(
                                    Object.assign(Object.assign({}, d), {
                                      method: "eth_blockNumber",
                                      params: [],
                                    })
                                  )
                                );
                              case 2:
                                return (
                                  (t = e.sent),
                                  (n = t.result),
                                  e.abrupt(
                                    "return",
                                    (0, u.intNumberFromHexString)(
                                      (0, u.ensureHexString)(n)
                                    )
                                  )
                                );
                              case 5:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "getBlockHashByNumber",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.next = 2),
                                  this.sendAsyncPromise(
                                    Object.assign(Object.assign({}, d), {
                                      method: "eth_getBlockByNumber",
                                      params: [
                                        (0, u.hexStringFromIntNumber)(t),
                                        !1,
                                      ],
                                    })
                                  )
                                );
                              case 2:
                                if (
                                  !(n = e.sent).result ||
                                  "string" !== typeof n.result.hash
                                ) {
                                  e.next = 5;
                                  break;
                                }
                                return e.abrupt(
                                  "return",
                                  (0, u.ensureHexString)(n.result.hash)
                                );
                              case 5:
                                return e.abrupt("return", null);
                              case 6:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
            ]),
            e
          );
        })();
      function h(e) {
        return {
          fromBlock: p(e.fromBlock),
          toBlock: p(e.toBlock),
          addresses:
            void 0 === e.address
              ? null
              : Array.isArray(e.address)
              ? e.address
              : [e.address],
          topics: e.topics || [],
        };
      }
      function f(e) {
        var t = {
          fromBlock: g(e.fromBlock),
          toBlock: g(e.toBlock),
          topics: e.topics,
        };
        return null !== e.addresses && (t.address = e.addresses), t;
      }
      function p(e) {
        if (void 0 === e || "latest" === e || "pending" === e) return "latest";
        if ("earliest" === e) return (0, c.IntNumber)(0);
        if ((0, u.isHexString)(e)) return (0, u.intNumberFromHexString)(e);
        throw new Error("Invalid block option: ".concat(String(e)));
      }
      function g(e) {
        return "latest" === e ? e : (0, u.hexStringFromIntNumber)(e);
      }
      function v() {
        return Object.assign(Object.assign({}, d), {
          error: { code: -32e3, message: "filter not found" },
        });
      }
      function m() {
        return Object.assign(Object.assign({}, d), { result: [] });
      }
      (t.FilterPolyfill = l), (t.filterFromParam = h);
    },
    45908: function (e, t, n) {
      "use strict";
      var r = n(17061).default,
        s = n(17156).default,
        i = n(56690).default,
        a = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.SubscriptionManager = void 0);
      var o = n(82248),
        c = n(84957),
        u = function () {},
        d = (function () {
          function e(t) {
            i(this, e);
            var n = new o.PollingBlockTracker({
                provider: t,
                pollingInterval: 15e3,
                setSkipCacheFlag: !0,
              }),
              r = c({ blockTracker: n, provider: t }),
              s = r.events,
              a = r.middleware;
            (this.events = s), (this.subscriptionMiddleware = a);
          }
          return (
            a(e, [
              {
                key: "handleRequest",
                value: (function () {
                  var e = s(
                    r().mark(function e(t) {
                      var n;
                      return r().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (n = {}),
                                  (e.next = 3),
                                  this.subscriptionMiddleware(t, n, u, u)
                                );
                              case 3:
                                return e.abrupt("return", n);
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "destroy",
                value: function () {
                  this.subscriptionMiddleware.destroy();
                },
              },
            ]),
            e
          );
        })();
      t.SubscriptionManager = d;
    },
    35779: function (e, t, n) {
      "use strict";
      var r = n(17061).default,
        s = n(17156).default,
        i = n(56690).default,
        a = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.RelayAbstract =
          t.APP_VERSION_KEY =
          t.LOCAL_STORAGE_ADDRESSES_KEY =
          t.WALLET_USER_NAME_KEY =
            void 0);
      var o = n(28638);
      (t.WALLET_USER_NAME_KEY = "walletUsername"),
        (t.LOCAL_STORAGE_ADDRESSES_KEY = "Addresses"),
        (t.APP_VERSION_KEY = "AppVersion");
      var c = (function () {
        function e() {
          i(this, e);
        }
        return (
          a(e, [
            {
              key: "makeEthereumJSONRPCRequest",
              value: (function () {
                var e = s(
                  r().mark(function e(t, n) {
                    return r().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (n) {
                              e.next = 2;
                              break;
                            }
                            throw new Error("Error: No jsonRpcUrl provided");
                          case 2:
                            return e.abrupt(
                              "return",
                              window
                                .fetch(n, {
                                  method: "POST",
                                  body: JSON.stringify(t),
                                  mode: "cors",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                })
                                .then(function (e) {
                                  return e.json();
                                })
                                .then(function (e) {
                                  if (!e) throw o.standardErrors.rpc.parse({});
                                  var n = e,
                                    r = n.error;
                                  if (r)
                                    throw (0, o.serializeError)(r, t.method);
                                  return n;
                                })
                            );
                          case 3:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })(),
            },
          ]),
          e
        );
      })();
      t.RelayAbstract = c;
    },
    57600: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.RelayEventManager = void 0);
      var i = n(30246),
        a = (function () {
          function e() {
            r(this, e), (this._nextRequestId = 0), (this.callbacks = new Map());
          }
          return (
            s(e, [
              {
                key: "makeRequestId",
                value: function () {
                  this._nextRequestId = (this._nextRequestId + 1) % 2147483647;
                  var e = this._nextRequestId,
                    t = (0, i.prepend0x)(e.toString(16));
                  return this.callbacks.get(t) && this.callbacks.delete(t), e;
                },
              },
            ]),
            e
          );
        })();
      t.RelayEventManager = a;
    },
    35429: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.Session = void 0);
      var i = n(63079),
        a = n(30246),
        o = "session:id",
        c = "session:secret",
        u = "session:linked",
        d = (function () {
          function e(t, n, s, o) {
            r(this, e),
              (this._storage = t),
              (this._id = n || (0, a.randomBytesHex)(16)),
              (this._secret = s || (0, a.randomBytesHex)(32)),
              (this._key = new i.sha256()
                .update(
                  "".concat(this._id, ", ").concat(this._secret, " WalletLink")
                )
                .digest("hex")),
              (this._linked = !!o);
          }
          return (
            s(
              e,
              [
                {
                  key: "id",
                  get: function () {
                    return this._id;
                  },
                },
                {
                  key: "secret",
                  get: function () {
                    return this._secret;
                  },
                },
                {
                  key: "key",
                  get: function () {
                    return this._key;
                  },
                },
                {
                  key: "linked",
                  get: function () {
                    return this._linked;
                  },
                  set: function (e) {
                    (this._linked = e), this.persistLinked();
                  },
                },
                {
                  key: "save",
                  value: function () {
                    return (
                      this._storage.setItem(o, this._id),
                      this._storage.setItem(c, this._secret),
                      this.persistLinked(),
                      this
                    );
                  },
                },
                {
                  key: "persistLinked",
                  value: function () {
                    this._storage.setItem(u, this._linked ? "1" : "0");
                  },
                },
              ],
              [
                {
                  key: "load",
                  value: function (t) {
                    var n = t.getItem(o),
                      r = t.getItem(u),
                      s = t.getItem(c);
                    return n && s ? new e(t, n, s, "1" === r) : null;
                  },
                },
                {
                  key: "hash",
                  value: function (e) {
                    return new i.sha256().update(e).digest("hex");
                  },
                },
              ]
            ),
            e
          );
        })();
      t.Session = d;
    },
    16887: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default,
        i = n(41588).default,
        a = n(73808).default,
        o = n(61655).default,
        c = n(26389).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.MobileRelay = void 0);
      var u = n(30246),
        d = n(7084),
        l = n(95867),
        h = (function (e) {
          o(n, e);
          var t = c(n);
          function n(e) {
            var s, i;
            return (
              r(this, n),
              ((s = t.call(this, e))._enableMobileWalletLink =
                null !== (i = e.enableMobileWalletLink) && void 0 !== i && i),
              s
            );
          }
          return (
            s(n, [
              {
                key: "requestEthereumAccounts",
                value: function () {
                  return this._enableMobileWalletLink
                    ? i(a(n.prototype), "requestEthereumAccounts", this).call(
                        this
                      )
                    : {
                        promise: new Promise(function () {
                          var e = (0, u.getLocation)();
                          e.href = "https://go.cb-w.com/dapp?cb_url=".concat(
                            encodeURIComponent(e.href)
                          );
                        }),
                        cancel: function () {},
                      };
                },
              },
              {
                key: "publishWeb3RequestEvent",
                value: function (e, t) {
                  var r = this;
                  if (
                    (i(a(n.prototype), "publishWeb3RequestEvent", this).call(
                      this,
                      e,
                      t
                    ),
                    this._enableMobileWalletLink &&
                      this.ui instanceof l.MobileRelayUI)
                  ) {
                    var s = !1;
                    switch (t.method) {
                      case "requestEthereumAccounts":
                      case "connectAndSignIn":
                        (s = !0),
                          this.ui.openCoinbaseWalletDeeplink(
                            this.getQRCodeUrl()
                          );
                        break;
                      case "switchEthereumChain":
                        return;
                      default:
                        (s = !0), this.ui.openCoinbaseWalletDeeplink();
                    }
                    s &&
                      window.addEventListener(
                        "blur",
                        function () {
                          window.addEventListener(
                            "focus",
                            function () {
                              r.connection.checkUnseenEvents();
                            },
                            { once: !0 }
                          );
                        },
                        { once: !0 }
                      );
                  }
                },
              },
              {
                key: "handleWeb3ResponseMessage",
                value: function (e) {
                  i(a(n.prototype), "handleWeb3ResponseMessage", this).call(
                    this,
                    e
                  );
                },
              },
              {
                key: "connectAndSignIn",
                value: function (e) {
                  if (!this._enableMobileWalletLink)
                    throw new Error(
                      "connectAndSignIn is supported only when enableMobileWalletLink is on"
                    );
                  return this.sendRequest({
                    method: "connectAndSignIn",
                    params: {
                      appName: this.appName,
                      appLogoUrl: this.appLogoUrl,
                      domain: window.location.hostname,
                      aud: window.location.href,
                      version: "1",
                      type: "eip4361",
                      nonce: e.nonce,
                      iat: new Date().toISOString(),
                      chainId: "eip155:".concat(this.dappDefaultChain),
                      statement: e.statement,
                      resources: e.resources,
                    },
                  });
                },
              },
            ]),
            n
          );
        })(d.WalletLinkRelay);
      t.MobileRelay = h;
    },
    95867: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.MobileRelayUI = void 0);
      var i = n(61736),
        a = (function () {
          function e(t) {
            r(this, e),
              (this.attached = !1),
              (this.darkMode = !1),
              (this.redirectDialog = new i.RedirectDialog()),
              (this.darkMode = t.darkMode);
          }
          return (
            s(e, [
              {
                key: "attach",
                value: function () {
                  if (this.attached)
                    throw new Error(
                      "Coinbase Wallet SDK UI is already attached"
                    );
                  this.redirectDialog.attach(), (this.attached = !0);
                },
              },
              { key: "setConnected", value: function (e) {} },
              {
                key: "redirectToCoinbaseWallet",
                value: function (e) {
                  var t = new URL("https://go.cb-w.com/walletlink");
                  t.searchParams.append("redirect_url", window.location.href),
                    e && t.searchParams.append("wl_url", e);
                  var n = document.createElement("a");
                  (n.target = "cbw-opener"),
                    (n.href = t.href),
                    (n.rel = "noreferrer noopener"),
                    n.click();
                },
              },
              {
                key: "openCoinbaseWalletDeeplink",
                value: function (e) {
                  var t = this;
                  this.redirectDialog.present({
                    title: "Redirecting to Coinbase Wallet...",
                    buttonText: "Open",
                    darkMode: this.darkMode,
                    onButtonClick: function () {
                      t.redirectToCoinbaseWallet(e);
                    },
                  }),
                    setTimeout(function () {
                      t.redirectToCoinbaseWallet(e);
                    }, 99);
                },
              },
              {
                key: "showConnecting",
                value: function (e) {
                  var t = this;
                  return function () {
                    t.redirectDialog.clear();
                  };
                },
              },
              {
                key: "hideRequestEthereumAccounts",
                value: function () {
                  this.redirectDialog.clear();
                },
              },
              { key: "requestEthereumAccounts", value: function () {} },
              { key: "addEthereumChain", value: function () {} },
              { key: "watchAsset", value: function () {} },
              { key: "selectProvider", value: function () {} },
              { key: "switchEthereumChain", value: function () {} },
              { key: "signEthereumMessage", value: function () {} },
              { key: "signEthereumTransaction", value: function () {} },
              { key: "submitEthereumTransaction", value: function () {} },
              {
                key: "ethereumAddressFromSignedMessage",
                value: function () {},
              },
              { key: "reloadUI", value: function () {} },
              { key: "setStandalone", value: function () {} },
              { key: "setConnectDisabled", value: function () {} },
              {
                key: "inlineAccountsResponse",
                value: function () {
                  return !1;
                },
              },
              {
                key: "inlineAddEthereumChain",
                value: function () {
                  return !1;
                },
              },
              {
                key: "inlineWatchAsset",
                value: function () {
                  return !1;
                },
              },
              {
                key: "inlineSwitchEthereumChain",
                value: function () {
                  return !1;
                },
              },
              {
                key: "isStandalone",
                value: function () {
                  return !1;
                },
              },
            ]),
            e
          );
        })();
      t.MobileRelayUI = a;
    },
    7084: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default,
        i = n(66115).default,
        a = n(61655).default,
        o = n(26389).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.WalletLinkRelay = void 0);
      var c = n(28638),
        u = n(29213),
        d = n(30246),
        l = n(4995),
        h = n(35779),
        f = n(35429),
        p = n(38453),
        g = n(22953),
        v = n(73092),
        m = (function (e) {
          a(n, e);
          var t = o(n);
          function n(e) {
            var s, a;
            r(this, n),
              ((s = t.call(this)).accountsCallback = null),
              (s.chainCallbackParams = { chainId: "", jsonRpcUrl: "" }),
              (s.chainCallback = null),
              (s.dappDefaultChain = 1),
              (s.appName = ""),
              (s.appLogoUrl = null),
              (s.linkedUpdated = function (e) {
                var t;
                s.isLinked = e;
                var n = s.storage.getItem(h.LOCAL_STORAGE_ADDRESSES_KEY);
                if (
                  (e && (s.session.linked = e),
                  (s.isUnlinkedErrorState = !1),
                  n)
                ) {
                  var r = n.split(" "),
                    i = "true" === s.storage.getItem("IsStandaloneSigning");
                  if ("" !== r[0] && !e && s.session.linked && !i) {
                    s.isUnlinkedErrorState = !0;
                    var a = s.getSessionIdHash();
                    null === (t = s.diagnostic) ||
                      void 0 === t ||
                      t.log(l.EVENTS.UNLINKED_ERROR_STATE, {
                        sessionIdHash: a,
                      });
                  }
                }
              }),
              (s.metadataUpdated = function (e, t) {
                s.storage.setItem(e, t);
              }),
              (s.chainUpdated = function (e, t) {
                (s.chainCallbackParams.chainId === e &&
                  s.chainCallbackParams.jsonRpcUrl === t) ||
                  ((s.chainCallbackParams = { chainId: e, jsonRpcUrl: t }),
                  s.chainCallback && s.chainCallback(e, t));
              }),
              (s.accountUpdated = function (e) {
                s.accountsCallback && s.accountsCallback([e]),
                  n.accountRequestCallbackIds.size > 0 &&
                    (Array.from(n.accountRequestCallbackIds.values()).forEach(
                      function (t) {
                        var n = {
                          type: "WEB3_RESPONSE",
                          id: t,
                          response: {
                            method: "requestEthereumAccounts",
                            result: [e],
                          },
                        };
                        s.invokeCallback(
                          Object.assign(Object.assign({}, n), { id: t })
                        );
                      }
                    ),
                    n.accountRequestCallbackIds.clear());
              }),
              (s.connectedUpdated = function (e) {
                s.ui.setConnected(e);
              }),
              (s.resetAndReload = s.resetAndReload.bind(i(s))),
              (s.linkAPIUrl = e.linkAPIUrl),
              (s.storage = e.storage),
              (s.options = e);
            var o = s.subscribe(),
              c = o.session,
              u = o.ui,
              d = o.connection;
            return (
              (s._session = c),
              (s.connection = d),
              (s.relayEventManager = e.relayEventManager),
              (s.diagnostic = e.diagnosticLogger),
              (s._reloadOnDisconnect =
                null === (a = e.reloadOnDisconnect) || void 0 === a || a),
              (s.ui = u),
              s
            );
          }
          return (
            s(n, [
              {
                key: "subscribe",
                value: function () {
                  var e =
                      f.Session.load(this.storage) ||
                      new f.Session(this.storage).save(),
                    t = this.linkAPIUrl,
                    n = this.diagnostic,
                    r = new p.WalletLinkConnection({
                      session: e,
                      linkAPIUrl: t,
                      diagnostic: n,
                      listener: this,
                    }),
                    s = this.options,
                    i = s.version,
                    a = s.darkMode,
                    o = this.options.uiConstructor({
                      linkAPIUrl: t,
                      version: i,
                      darkMode: a,
                      session: e,
                    });
                  return r.connect(), { session: e, ui: o, connection: r };
                },
              },
              {
                key: "attachUI",
                value: function () {
                  this.ui.attach();
                },
              },
              {
                key: "resetAndReload",
                value: function () {
                  var e = this;
                  Promise.race([
                    this.connection.setSessionMetadata("__destroyed", "1"),
                    new Promise(function (e) {
                      return setTimeout(function () {
                        return e(null);
                      }, 1e3);
                    }),
                  ])
                    .then(function () {
                      var t,
                        n,
                        r = e.ui.isStandalone();
                      null === (t = e.diagnostic) ||
                        void 0 === t ||
                        t.log(l.EVENTS.SESSION_STATE_CHANGE, {
                          method: "relay::resetAndReload",
                          sessionMetadataChange: "__destroyed, 1",
                          sessionIdHash: e.getSessionIdHash(),
                        }),
                        e.connection.destroy();
                      var s = f.Session.load(e.storage);
                      if (
                        ((null === s || void 0 === s ? void 0 : s.id) ===
                        e._session.id
                          ? e.storage.clear()
                          : s &&
                            (null === (n = e.diagnostic) ||
                              void 0 === n ||
                              n.log(l.EVENTS.SKIPPED_CLEARING_SESSION, {
                                sessionIdHash: e.getSessionIdHash(),
                                storedSessionIdHash: f.Session.hash(s.id),
                              })),
                        e._reloadOnDisconnect)
                      )
                        e.ui.reloadUI();
                      else {
                        e.accountsCallback && e.accountsCallback([], !0);
                        var i = e.subscribe(),
                          a = i.session,
                          o = i.ui,
                          c = i.connection;
                        (e._session = a),
                          (e.connection = c),
                          (e.ui = o),
                          r && e.ui.setStandalone && e.ui.setStandalone(!0),
                          e.options.headlessMode || e.attachUI();
                      }
                    })
                    .catch(function (t) {
                      var n;
                      null === (n = e.diagnostic) ||
                        void 0 === n ||
                        n.log(l.EVENTS.FAILURE, {
                          method: "relay::resetAndReload",
                          message: "failed to reset and reload with ".concat(t),
                          sessionIdHash: e.getSessionIdHash(),
                        });
                    });
                },
              },
              {
                key: "setAppInfo",
                value: function (e, t) {
                  (this.appName = e), (this.appLogoUrl = t);
                },
              },
              {
                key: "getStorageItem",
                value: function (e) {
                  return this.storage.getItem(e);
                },
              },
              {
                key: "session",
                get: function () {
                  return this._session;
                },
              },
              {
                key: "setStorageItem",
                value: function (e, t) {
                  this.storage.setItem(e, t);
                },
              },
              {
                key: "signEthereumMessage",
                value: function (e, t, n, r) {
                  return this.sendRequest({
                    method: "signEthereumMessage",
                    params: {
                      message: (0, d.hexStringFromBuffer)(e, !0),
                      address: t,
                      addPrefix: n,
                      typedDataJson: r || null,
                    },
                  });
                },
              },
              {
                key: "ethereumAddressFromSignedMessage",
                value: function (e, t, n) {
                  return this.sendRequest({
                    method: "ethereumAddressFromSignedMessage",
                    params: {
                      message: (0, d.hexStringFromBuffer)(e, !0),
                      signature: (0, d.hexStringFromBuffer)(t, !0),
                      addPrefix: n,
                    },
                  });
                },
              },
              {
                key: "signEthereumTransaction",
                value: function (e) {
                  return this.sendRequest({
                    method: "signEthereumTransaction",
                    params: {
                      fromAddress: e.fromAddress,
                      toAddress: e.toAddress,
                      weiValue: (0, d.bigIntStringFromBN)(e.weiValue),
                      data: (0, d.hexStringFromBuffer)(e.data, !0),
                      nonce: e.nonce,
                      gasPriceInWei: e.gasPriceInWei
                        ? (0, d.bigIntStringFromBN)(e.gasPriceInWei)
                        : null,
                      maxFeePerGas: e.gasPriceInWei
                        ? (0, d.bigIntStringFromBN)(e.gasPriceInWei)
                        : null,
                      maxPriorityFeePerGas: e.gasPriceInWei
                        ? (0, d.bigIntStringFromBN)(e.gasPriceInWei)
                        : null,
                      gasLimit: e.gasLimit
                        ? (0, d.bigIntStringFromBN)(e.gasLimit)
                        : null,
                      chainId: e.chainId,
                      shouldSubmit: !1,
                    },
                  });
                },
              },
              {
                key: "signAndSubmitEthereumTransaction",
                value: function (e) {
                  return this.sendRequest({
                    method: "signEthereumTransaction",
                    params: {
                      fromAddress: e.fromAddress,
                      toAddress: e.toAddress,
                      weiValue: (0, d.bigIntStringFromBN)(e.weiValue),
                      data: (0, d.hexStringFromBuffer)(e.data, !0),
                      nonce: e.nonce,
                      gasPriceInWei: e.gasPriceInWei
                        ? (0, d.bigIntStringFromBN)(e.gasPriceInWei)
                        : null,
                      maxFeePerGas: e.maxFeePerGas
                        ? (0, d.bigIntStringFromBN)(e.maxFeePerGas)
                        : null,
                      maxPriorityFeePerGas: e.maxPriorityFeePerGas
                        ? (0, d.bigIntStringFromBN)(e.maxPriorityFeePerGas)
                        : null,
                      gasLimit: e.gasLimit
                        ? (0, d.bigIntStringFromBN)(e.gasLimit)
                        : null,
                      chainId: e.chainId,
                      shouldSubmit: !0,
                    },
                  });
                },
              },
              {
                key: "submitEthereumTransaction",
                value: function (e, t) {
                  return this.sendRequest({
                    method: "submitEthereumTransaction",
                    params: {
                      signedTransaction: (0, d.hexStringFromBuffer)(e, !0),
                      chainId: t,
                    },
                  });
                },
              },
              {
                key: "scanQRCode",
                value: function (e) {
                  return this.sendRequest({
                    method: "scanQRCode",
                    params: { regExp: e },
                  });
                },
              },
              {
                key: "getQRCodeUrl",
                value: function () {
                  return (0, d.createQrUrl)(
                    this._session.id,
                    this._session.secret,
                    this.linkAPIUrl,
                    !1,
                    this.options.version,
                    this.dappDefaultChain
                  );
                },
              },
              {
                key: "genericRequest",
                value: function (e, t) {
                  return this.sendRequest({
                    method: "generic",
                    params: { action: t, data: e },
                  });
                },
              },
              {
                key: "sendGenericMessage",
                value: function (e) {
                  return this.sendRequest(e);
                },
              },
              {
                key: "sendRequest",
                value: function (e) {
                  var t = this,
                    n = null,
                    r = (0, d.randomBytesHex)(8),
                    s = function (s) {
                      t.publishWeb3RequestCanceledEvent(r),
                        t.handleErrorResponse(r, e.method, s),
                        null === n || void 0 === n || n();
                    };
                  return {
                    promise: new Promise(function (i, a) {
                      t.ui.isStandalone() ||
                        (n = t.ui.showConnecting({
                          isUnlinkedErrorState: t.isUnlinkedErrorState,
                          onCancel: s,
                          onResetConnection: t.resetAndReload,
                        })),
                        t.relayEventManager.callbacks.set(r, function (e) {
                          if (
                            (null === n || void 0 === n || n(),
                            (0, g.isErrorResponse)(e))
                          )
                            return a(new Error(e.errorMessage));
                          i(e);
                        }),
                        t.ui.isStandalone()
                          ? t.sendRequestStandalone(r, e)
                          : t.publishWeb3RequestEvent(r, e);
                    }),
                    cancel: s,
                  };
                },
              },
              {
                key: "setConnectDisabled",
                value: function (e) {
                  this.ui.setConnectDisabled(e);
                },
              },
              {
                key: "setAccountsCallback",
                value: function (e) {
                  this.accountsCallback = e;
                },
              },
              {
                key: "setChainCallback",
                value: function (e) {
                  this.chainCallback = e;
                },
              },
              {
                key: "setDappDefaultChainCallback",
                value: function (e) {
                  (this.dappDefaultChain = e),
                    this.ui instanceof v.WalletLinkRelayUI &&
                      this.ui.setChainId(e);
                },
              },
              {
                key: "publishWeb3RequestEvent",
                value: function (e, t) {
                  var n,
                    r = this,
                    s = { type: "WEB3_REQUEST", id: e, request: t },
                    i = f.Session.load(this.storage);
                  null === (n = this.diagnostic) ||
                    void 0 === n ||
                    n.log(l.EVENTS.WEB3_REQUEST, {
                      eventId: s.id,
                      method: "relay::".concat(t.method),
                      sessionIdHash: this.getSessionIdHash(),
                      storedSessionIdHash: i ? f.Session.hash(i.id) : "",
                      isSessionMismatched: (
                        (null === i || void 0 === i ? void 0 : i.id) !==
                        this._session.id
                      ).toString(),
                    }),
                    this.publishEvent("Web3Request", s, !0)
                      .then(function (e) {
                        var n;
                        null === (n = r.diagnostic) ||
                          void 0 === n ||
                          n.log(l.EVENTS.WEB3_REQUEST_PUBLISHED, {
                            eventId: s.id,
                            method: "relay::".concat(t.method),
                            sessionIdHash: r.getSessionIdHash(),
                            storedSessionIdHash: i ? f.Session.hash(i.id) : "",
                            isSessionMismatched: (
                              (null === i || void 0 === i ? void 0 : i.id) !==
                              r._session.id
                            ).toString(),
                          });
                      })
                      .catch(function (e) {
                        r.handleWeb3ResponseMessage({
                          type: "WEB3_RESPONSE",
                          id: s.id,
                          response: {
                            method: t.method,
                            errorMessage: e.message,
                          },
                        });
                      });
                },
              },
              {
                key: "publishWeb3RequestCanceledEvent",
                value: function (e) {
                  var t = { type: "WEB3_REQUEST_CANCELED", id: e };
                  this.publishEvent("Web3RequestCanceled", t, !1).then();
                },
              },
              {
                key: "publishEvent",
                value: function (e, t, n) {
                  return this.connection.publishEvent(e, t, n);
                },
              },
              {
                key: "handleWeb3ResponseMessage",
                value: function (e) {
                  var t,
                    r = this,
                    s = e.response;
                  if (
                    (null === (t = this.diagnostic) ||
                      void 0 === t ||
                      t.log(l.EVENTS.WEB3_RESPONSE, {
                        eventId: e.id,
                        method: "relay::".concat(s.method),
                        sessionIdHash: this.getSessionIdHash(),
                      }),
                    "requestEthereumAccounts" === s.method)
                  )
                    return (
                      n.accountRequestCallbackIds.forEach(function (t) {
                        return r.invokeCallback(
                          Object.assign(Object.assign({}, e), { id: t })
                        );
                      }),
                      void n.accountRequestCallbackIds.clear()
                    );
                  this.invokeCallback(e);
                },
              },
              {
                key: "handleErrorResponse",
                value: function (e, t, n, r) {
                  var s,
                    i =
                      null !==
                        (s = null === n || void 0 === n ? void 0 : n.message) &&
                      void 0 !== s
                        ? s
                        : (0, c.getMessageFromCode)(r);
                  this.handleWeb3ResponseMessage({
                    type: "WEB3_RESPONSE",
                    id: e,
                    response: { method: t, errorMessage: i, errorCode: r },
                  });
                },
              },
              {
                key: "invokeCallback",
                value: function (e) {
                  var t = this.relayEventManager.callbacks.get(e.id);
                  t &&
                    (t(e.response),
                    this.relayEventManager.callbacks.delete(e.id));
                },
              },
              {
                key: "requestEthereumAccounts",
                value: function () {
                  var e = this,
                    t = {
                      method: "requestEthereumAccounts",
                      params: {
                        appName: this.appName,
                        appLogoUrl: this.appLogoUrl || null,
                      },
                    },
                    r = (0, d.randomBytesHex)(8),
                    s = function (n) {
                      e.publishWeb3RequestCanceledEvent(r),
                        e.handleErrorResponse(r, t.method, n);
                    };
                  return {
                    promise: new Promise(function (i, a) {
                      if (
                        (e.relayEventManager.callbacks.set(r, function (t) {
                          if (
                            (e.ui.hideRequestEthereumAccounts(),
                            (0, g.isErrorResponse)(t))
                          )
                            return a(new Error(t.errorMessage));
                          i(t);
                        }),
                        e.ui.inlineAccountsResponse())
                      ) {
                        e.ui.requestEthereumAccounts({
                          onCancel: s,
                          onAccounts: function (t) {
                            e.handleWeb3ResponseMessage({
                              type: "WEB3_RESPONSE",
                              id: r,
                              response: {
                                method: "requestEthereumAccounts",
                                result: t,
                              },
                            });
                          },
                        });
                      } else {
                        var o = c.standardErrors.provider.userRejectedRequest(
                          "User denied account authorization"
                        );
                        e.ui.requestEthereumAccounts({
                          onCancel: function () {
                            return s(o);
                          },
                        });
                      }
                      n.accountRequestCallbackIds.add(r),
                        e.ui.inlineAccountsResponse() ||
                          e.ui.isStandalone() ||
                          e.publishWeb3RequestEvent(r, t);
                    }),
                    cancel: s,
                  };
                },
              },
              {
                key: "selectProvider",
                value: function (e) {
                  var t = this,
                    n = "selectProvider",
                    r = (0, d.randomBytesHex)(8);
                  return {
                    cancel: function (e) {
                      t.publishWeb3RequestCanceledEvent(r),
                        t.handleErrorResponse(r, n, e);
                    },
                    promise: new Promise(function (n, s) {
                      t.relayEventManager.callbacks.set(r, function (e) {
                        if ((0, g.isErrorResponse)(e))
                          return s(new Error(e.errorMessage));
                        n(e);
                      });
                      t.ui.selectProvider &&
                        t.ui.selectProvider({
                          onApprove: function (e) {
                            t.handleWeb3ResponseMessage({
                              type: "WEB3_RESPONSE",
                              id: r,
                              response: { method: "selectProvider", result: e },
                            });
                          },
                          onCancel: function (e) {
                            t.handleWeb3ResponseMessage({
                              type: "WEB3_RESPONSE",
                              id: r,
                              response: {
                                method: "selectProvider",
                                result: u.ProviderType.Unselected,
                              },
                            });
                          },
                          providerOptions: e,
                        });
                    }),
                  };
                },
              },
              {
                key: "watchAsset",
                value: function (e, t, n, r, s, i) {
                  var a = this,
                    o = {
                      method: "watchAsset",
                      params: {
                        type: e,
                        options: {
                          address: t,
                          symbol: n,
                          decimals: r,
                          image: s,
                        },
                        chainId: i,
                      },
                    },
                    c = null,
                    u = (0, d.randomBytesHex)(8),
                    l = function (e) {
                      a.publishWeb3RequestCanceledEvent(u),
                        a.handleErrorResponse(u, o.method, e),
                        null === c || void 0 === c || c();
                    };
                  return (
                    this.ui.inlineWatchAsset() ||
                      (c = this.ui.showConnecting({
                        isUnlinkedErrorState: this.isUnlinkedErrorState,
                        onCancel: l,
                        onResetConnection: this.resetAndReload,
                      })),
                    {
                      cancel: l,
                      promise: new Promise(function (d, l) {
                        a.relayEventManager.callbacks.set(u, function (e) {
                          if (
                            (null === c || void 0 === c || c(),
                            (0, g.isErrorResponse)(e))
                          )
                            return l(new Error(e.errorMessage));
                          d(e);
                        });
                        a.ui.inlineWatchAsset() &&
                          a.ui.watchAsset({
                            onApprove: function () {
                              a.handleWeb3ResponseMessage({
                                type: "WEB3_RESPONSE",
                                id: u,
                                response: { method: "watchAsset", result: !0 },
                              });
                            },
                            onCancel: function (e) {
                              a.handleWeb3ResponseMessage({
                                type: "WEB3_RESPONSE",
                                id: u,
                                response: { method: "watchAsset", result: !1 },
                              });
                            },
                            type: e,
                            address: t,
                            symbol: n,
                            decimals: r,
                            image: s,
                            chainId: i,
                          }),
                          a.ui.inlineWatchAsset() ||
                            a.ui.isStandalone() ||
                            a.publishWeb3RequestEvent(u, o);
                      }),
                    }
                  );
                },
              },
              {
                key: "addEthereumChain",
                value: function (e, t, n, r, s, i) {
                  var a = this,
                    o = {
                      method: "addEthereumChain",
                      params: {
                        chainId: e,
                        rpcUrls: t,
                        blockExplorerUrls: r,
                        chainName: s,
                        iconUrls: n,
                        nativeCurrency: i,
                      },
                    },
                    c = null,
                    u = (0, d.randomBytesHex)(8),
                    l = function (e) {
                      a.publishWeb3RequestCanceledEvent(u),
                        a.handleErrorResponse(u, o.method, e),
                        null === c || void 0 === c || c();
                    };
                  return (
                    this.ui.inlineAddEthereumChain(e) ||
                      (c = this.ui.showConnecting({
                        isUnlinkedErrorState: this.isUnlinkedErrorState,
                        onCancel: l,
                        onResetConnection: this.resetAndReload,
                      })),
                    {
                      promise: new Promise(function (t, n) {
                        a.relayEventManager.callbacks.set(u, function (e) {
                          if (
                            (null === c || void 0 === c || c(),
                            (0, g.isErrorResponse)(e))
                          )
                            return n(new Error(e.errorMessage));
                          t(e);
                        });
                        a.ui.inlineAddEthereumChain(e) &&
                          a.ui.addEthereumChain({
                            onCancel: function (e) {
                              a.handleWeb3ResponseMessage({
                                type: "WEB3_RESPONSE",
                                id: u,
                                response: {
                                  method: "addEthereumChain",
                                  result: { isApproved: !1, rpcUrl: "" },
                                },
                              });
                            },
                            onApprove: function (e) {
                              a.handleWeb3ResponseMessage({
                                type: "WEB3_RESPONSE",
                                id: u,
                                response: {
                                  method: "addEthereumChain",
                                  result: { isApproved: !0, rpcUrl: e },
                                },
                              });
                            },
                            chainId: o.params.chainId,
                            rpcUrls: o.params.rpcUrls,
                            blockExplorerUrls: o.params.blockExplorerUrls,
                            chainName: o.params.chainName,
                            iconUrls: o.params.iconUrls,
                            nativeCurrency: o.params.nativeCurrency,
                          }),
                          a.ui.inlineAddEthereumChain(e) ||
                            a.ui.isStandalone() ||
                            a.publishWeb3RequestEvent(u, o);
                      }),
                      cancel: l,
                    }
                  );
                },
              },
              {
                key: "switchEthereumChain",
                value: function (e, t) {
                  var n = this,
                    r = {
                      method: "switchEthereumChain",
                      params: Object.assign({ chainId: e }, { address: t }),
                    },
                    s = (0, d.randomBytesHex)(8);
                  return {
                    promise: new Promise(function (t, i) {
                      n.relayEventManager.callbacks.set(s, function (e) {
                        return (0, g.isErrorResponse)(e) && e.errorCode
                          ? i(
                              c.standardErrors.provider.custom({
                                code: e.errorCode,
                                message:
                                  "Unrecognized chain ID. Try adding the chain using addEthereumChain first.",
                              })
                            )
                          : (0, g.isErrorResponse)(e)
                          ? i(new Error(e.errorMessage))
                          : void t(e);
                      });
                      n.ui.switchEthereumChain({
                        onCancel: function (t) {
                          var r;
                          if (t) {
                            var i =
                              null !== (r = (0, c.getErrorCode)(t)) &&
                              void 0 !== r
                                ? r
                                : c.standardErrorCodes.provider
                                    .unsupportedChain;
                            n.handleErrorResponse(
                              s,
                              "switchEthereumChain",
                              t instanceof Error
                                ? t
                                : c.standardErrors.provider.unsupportedChain(e),
                              i
                            );
                          } else
                            n.handleWeb3ResponseMessage({
                              type: "WEB3_RESPONSE",
                              id: s,
                              response: {
                                method: "switchEthereumChain",
                                result: { isApproved: !1, rpcUrl: "" },
                              },
                            });
                        },
                        onApprove: function (e) {
                          n.handleWeb3ResponseMessage({
                            type: "WEB3_RESPONSE",
                            id: s,
                            response: {
                              method: "switchEthereumChain",
                              result: { isApproved: !0, rpcUrl: e },
                            },
                          });
                        },
                        chainId: r.params.chainId,
                        address: r.params.address,
                      }),
                        n.ui.inlineSwitchEthereumChain() ||
                          n.ui.isStandalone() ||
                          n.publishWeb3RequestEvent(s, r);
                    }),
                    cancel: function (e) {
                      n.publishWeb3RequestCanceledEvent(s),
                        n.handleErrorResponse(s, r.method, e);
                    },
                  };
                },
              },
              {
                key: "inlineAddEthereumChain",
                value: function (e) {
                  return this.ui.inlineAddEthereumChain(e);
                },
              },
              {
                key: "getSessionIdHash",
                value: function () {
                  return f.Session.hash(this._session.id);
                },
              },
              {
                key: "sendRequestStandalone",
                value: function (e, t) {
                  var n = this,
                    r = function (r) {
                      n.handleErrorResponse(e, t.method, r);
                    },
                    s = function (t) {
                      n.handleWeb3ResponseMessage({
                        type: "WEB3_RESPONSE",
                        id: e,
                        response: t,
                      });
                    };
                  switch (t.method) {
                    case "signEthereumMessage":
                      this.ui.signEthereumMessage({
                        request: t,
                        onSuccess: s,
                        onCancel: r,
                      });
                      break;
                    case "signEthereumTransaction":
                      this.ui.signEthereumTransaction({
                        request: t,
                        onSuccess: s,
                        onCancel: r,
                      });
                      break;
                    case "submitEthereumTransaction":
                      this.ui.submitEthereumTransaction({
                        request: t,
                        onSuccess: s,
                        onCancel: r,
                      });
                      break;
                    case "ethereumAddressFromSignedMessage":
                      this.ui.ethereumAddressFromSignedMessage({
                        request: t,
                        onSuccess: s,
                      });
                      break;
                    default:
                      r();
                  }
                },
              },
            ]),
            n
          );
        })(h.RelayAbstract);
      (t.WalletLinkRelay = m), (m.accountRequestCallbackIds = new Set());
    },
    38453: function (e, t, n) {
      "use strict";
      var r = n(38416).default,
        s = n(17061).default,
        i = n(17156).default,
        a = n(56690).default,
        o = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.WalletLinkConnection = void 0);
      var c = n(29213),
        u = n(80606),
        d = n(4995),
        l = n(35779),
        h = n(35429),
        f = n(8760),
        p = n(92809),
        g = (function () {
          function e(t) {
            var n = this,
              r = t.session,
              o = t.linkAPIUrl,
              g = t.listener,
              v = t.diagnostic,
              m = t.WebSocketClass,
              b = void 0 === m ? WebSocket : m;
            a(this, e),
              (this.destroyed = !1),
              (this.lastHeartbeatResponse = 0),
              (this.nextReqId = (0, c.IntNumber)(1)),
              (this._connected = !1),
              (this._linked = !1),
              (this.shouldFetchUnseenEventsOnConnect = !1),
              (this.requestResolutions = new Map()),
              (this.handleSessionMetadataUpdated = function (e) {
                e &&
                  new Map([
                    ["__destroyed", n.handleDestroyed],
                    ["EthereumAddress", n.handleAccountUpdated],
                    ["WalletUsername", n.handleWalletUsernameUpdated],
                    ["AppVersion", n.handleAppVersionUpdated],
                    [
                      "ChainId",
                      function (t) {
                        return (
                          e.JsonRpcUrl && n.handleChainUpdated(t, e.JsonRpcUrl)
                        );
                      },
                    ],
                  ]).forEach(function (t, n) {
                    var r = e[n];
                    void 0 !== r && t(r);
                  });
              }),
              (this.handleDestroyed = function (e) {
                var t, r;
                "1" === e &&
                  (null === (t = n.listener) ||
                    void 0 === t ||
                    t.resetAndReload(),
                  null === (r = n.diagnostic) ||
                    void 0 === r ||
                    r.log(d.EVENTS.METADATA_DESTROYED, {
                      alreadyDestroyed: n.isDestroyed,
                      sessionIdHash: h.Session.hash(n.session.id),
                    }));
              }),
              (this.handleAccountUpdated = (function () {
                var e = i(
                  s().mark(function e(t) {
                    var r, i, a;
                    return s().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0), (e.next = 3), n.cipher.decrypt(t)
                              );
                            case 3:
                              (a = e.sent),
                                null === (r = n.listener) ||
                                  void 0 === r ||
                                  r.accountUpdated(a),
                                (e.next = 10);
                              break;
                            case 7:
                              (e.prev = 7),
                                (e.t0 = e.catch(0)),
                                null === (i = n.diagnostic) ||
                                  void 0 === i ||
                                  i.log(d.EVENTS.GENERAL_ERROR, {
                                    message: "Had error decrypting",
                                    value: "selectedAddress",
                                  });
                            case 10:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 7]]
                    );
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.handleMetadataUpdated = (function () {
                var e = i(
                  s().mark(function e(t, r) {
                    var i, a, o;
                    return s().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0), (e.next = 3), n.cipher.decrypt(r)
                              );
                            case 3:
                              (o = e.sent),
                                null === (i = n.listener) ||
                                  void 0 === i ||
                                  i.metadataUpdated(t, o),
                                (e.next = 10);
                              break;
                            case 7:
                              (e.prev = 7),
                                (e.t0 = e.catch(0)),
                                null === (a = n.diagnostic) ||
                                  void 0 === a ||
                                  a.log(d.EVENTS.GENERAL_ERROR, {
                                    message: "Had error decrypting",
                                    value: t,
                                  });
                            case 10:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 7]]
                    );
                  })
                );
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.handleWalletUsernameUpdated = (function () {
                var e = i(
                  s().mark(function e(t) {
                    return s().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            n.handleMetadataUpdated(l.WALLET_USER_NAME_KEY, t);
                          case 1:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.handleAppVersionUpdated = (function () {
                var e = i(
                  s().mark(function e(t) {
                    return s().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            n.handleMetadataUpdated(l.APP_VERSION_KEY, t);
                          case 1:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.handleChainUpdated = (function () {
                var e = i(
                  s().mark(function e(t, r) {
                    var i, a, o, c;
                    return s().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0), (e.next = 3), n.cipher.decrypt(t)
                              );
                            case 3:
                              return (
                                (o = e.sent), (e.next = 6), n.cipher.decrypt(r)
                              );
                            case 6:
                              (c = e.sent),
                                null === (i = n.listener) ||
                                  void 0 === i ||
                                  i.chainUpdated(o, c),
                                (e.next = 13);
                              break;
                            case 10:
                              (e.prev = 10),
                                (e.t0 = e.catch(0)),
                                null === (a = n.diagnostic) ||
                                  void 0 === a ||
                                  a.log(d.EVENTS.GENERAL_ERROR, {
                                    message: "Had error decrypting",
                                    value: "chainId|jsonRpcUrl",
                                  });
                            case 13:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 10]]
                    );
                  })
                );
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.session = r),
              (this.cipher = new u.Cipher(r.secret)),
              (this.diagnostic = v),
              (this.listener = g);
            var w = new p.WalletLinkWebSocket("".concat(o, "/rpc"), b);
            w.setConnectionStateListener(
              (function () {
                var e = i(
                  s().mark(function e(t) {
                    var a, o, c;
                    return s().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              null === (a = n.diagnostic) ||
                                void 0 === a ||
                                a.log(d.EVENTS.CONNECTED_STATE_CHANGE, {
                                  state: t,
                                  sessionIdHash: h.Session.hash(r.id),
                                }),
                                (o = !1),
                                (e.t0 = t),
                                (e.next =
                                  e.t0 === p.ConnectionState.DISCONNECTED
                                    ? 5
                                    : e.t0 === p.ConnectionState.CONNECTED
                                    ? 7
                                    : e.t0 === p.ConnectionState.CONNECTING
                                    ? 21
                                    : 22);
                              break;
                            case 5:
                              return (
                                n.destroyed ||
                                  ((c = (function () {
                                    var e = i(
                                      s().mark(function e() {
                                        return s().wrap(function (e) {
                                          for (;;)
                                            switch ((e.prev = e.next)) {
                                              case 0:
                                                return (
                                                  (e.next = 2),
                                                  new Promise(function (e) {
                                                    return setTimeout(e, 5e3);
                                                  })
                                                );
                                              case 2:
                                                n.destroyed ||
                                                  w
                                                    .connect()
                                                    .catch(function () {
                                                      c();
                                                    });
                                              case 3:
                                              case "end":
                                                return e.stop();
                                            }
                                        }, e);
                                      })
                                    );
                                    return function () {
                                      return e.apply(this, arguments);
                                    };
                                  })()),
                                  c()),
                                e.abrupt("break", 22)
                              );
                            case 7:
                              return (
                                (e.prev = 7), (e.next = 10), n.authenticate()
                              );
                            case 10:
                              n.sendIsLinked(),
                                n.sendGetSessionConfig(),
                                (o = !0),
                                (e.next = 17);
                              break;
                            case 15:
                              (e.prev = 15), (e.t1 = e.catch(7));
                            case 17:
                              return (
                                n.updateLastHeartbeat(),
                                setInterval(function () {
                                  n.heartbeat();
                                }, 1e4),
                                n.shouldFetchUnseenEventsOnConnect &&
                                  n.fetchUnseenEventsAPI(),
                                e.abrupt("break", 22)
                              );
                            case 21:
                              return e.abrupt("break", 22);
                            case 22:
                              n.connected !== o && (n.connected = o);
                            case 23:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[7, 15]]
                    );
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })()
            ),
              w.setIncomingDataListener(function (e) {
                var t, s, i;
                switch (e.type) {
                  case "Heartbeat":
                    return void n.updateLastHeartbeat();
                  case "IsLinkedOK":
                  case "Linked":
                    var a = "IsLinkedOK" === e.type ? e.linked : void 0;
                    null === (t = n.diagnostic) ||
                      void 0 === t ||
                      t.log(d.EVENTS.LINKED, {
                        sessionIdHash: h.Session.hash(r.id),
                        linked: a,
                        type: e.type,
                        onlineGuests: e.onlineGuests,
                      }),
                      (n.linked = a || e.onlineGuests > 0);
                    break;
                  case "GetSessionConfigOK":
                  case "SessionConfigUpdated":
                    null === (s = n.diagnostic) ||
                      void 0 === s ||
                      s.log(d.EVENTS.SESSION_CONFIG_RECEIVED, {
                        sessionIdHash: h.Session.hash(r.id),
                        metadata_keys:
                          e && e.metadata ? Object.keys(e.metadata) : void 0,
                      }),
                      n.handleSessionMetadataUpdated(e.metadata);
                    break;
                  case "Event":
                    n.handleIncomingEvent(e);
                }
                void 0 !== e.id &&
                  (null === (i = n.requestResolutions.get(e.id)) ||
                    void 0 === i ||
                    i(e));
              }),
              (this.ws = w),
              (this.http = new f.WalletLinkHTTP(o, r.id, r.key));
          }
          return (
            o(e, [
              {
                key: "connect",
                value: function () {
                  var e;
                  if (this.destroyed) throw new Error("instance is destroyed");
                  null === (e = this.diagnostic) ||
                    void 0 === e ||
                    e.log(d.EVENTS.STARTED_CONNECTING, {
                      sessionIdHash: h.Session.hash(this.session.id),
                    }),
                    this.ws.connect();
                },
              },
              {
                key: "destroy",
                value: function () {
                  var e;
                  (this.destroyed = !0),
                    this.ws.disconnect(),
                    null === (e = this.diagnostic) ||
                      void 0 === e ||
                      e.log(d.EVENTS.DISCONNECTED, {
                        sessionIdHash: h.Session.hash(this.session.id),
                      }),
                    (this.listener = void 0);
                },
              },
              {
                key: "isDestroyed",
                get: function () {
                  return this.destroyed;
                },
              },
              {
                key: "connected",
                get: function () {
                  return this._connected;
                },
                set: function (e) {
                  var t, n;
                  (this._connected = e),
                    e &&
                      (null === (t = this.onceConnected) ||
                        void 0 === t ||
                        t.call(this)),
                    null === (n = this.listener) ||
                      void 0 === n ||
                      n.connectedUpdated(e);
                },
              },
              {
                key: "setOnceConnected",
                value: function (e) {
                  var t = this;
                  return new Promise(function (n) {
                    t.connected
                      ? e().then(n)
                      : (t.onceConnected = function () {
                          e().then(n), (t.onceConnected = void 0);
                        });
                  });
                },
              },
              {
                key: "linked",
                get: function () {
                  return this._linked;
                },
                set: function (e) {
                  var t, n;
                  (this._linked = e),
                    e &&
                      (null === (t = this.onceLinked) ||
                        void 0 === t ||
                        t.call(this)),
                    null === (n = this.listener) ||
                      void 0 === n ||
                      n.linkedUpdated(e);
                },
              },
              {
                key: "setOnceLinked",
                value: function (e) {
                  var t = this;
                  return new Promise(function (n) {
                    t.linked
                      ? e().then(n)
                      : (t.onceLinked = function () {
                          e().then(n), (t.onceLinked = void 0);
                        });
                  });
                },
              },
              {
                key: "handleIncomingEvent",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n, r, i, a;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  "Event" === t.type &&
                                  "Web3Response" === t.event
                                ) {
                                  e.next = 2;
                                  break;
                                }
                                return e.abrupt("return");
                              case 2:
                                return (
                                  (e.prev = 2),
                                  (e.next = 5),
                                  this.cipher.decrypt(t.data)
                                );
                              case 5:
                                if (
                                  ((i = e.sent),
                                  "WEB3_RESPONSE" === (a = JSON.parse(i)).type)
                                ) {
                                  e.next = 9;
                                  break;
                                }
                                return e.abrupt("return");
                              case 9:
                                null === (n = this.listener) ||
                                  void 0 === n ||
                                  n.handleWeb3ResponseMessage(a),
                                  (e.next = 15);
                                break;
                              case 12:
                                (e.prev = 12),
                                  (e.t0 = e.catch(2)),
                                  null === (r = this.diagnostic) ||
                                    void 0 === r ||
                                    r.log(d.EVENTS.GENERAL_ERROR, {
                                      message: "Had error decrypting",
                                      value: "incomingEvent",
                                    });
                              case 15:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[2, 12]]
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "checkUnseenEvents",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (this.connected) {
                                  e.next = 3;
                                  break;
                                }
                                return (
                                  (this.shouldFetchUnseenEventsOnConnect = !0),
                                  e.abrupt("return")
                                );
                              case 3:
                                return (
                                  (e.next = 5),
                                  new Promise(function (e) {
                                    return setTimeout(e, 250);
                                  })
                                );
                              case 5:
                                return (
                                  (e.prev = 5),
                                  (e.next = 8),
                                  this.fetchUnseenEventsAPI()
                                );
                              case 8:
                                e.next = 13;
                                break;
                              case 10:
                                (e.prev = 10), (e.t0 = e.catch(5));
                              case 13:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[5, 10]]
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "fetchUnseenEventsAPI",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      var t = this;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (this.shouldFetchUnseenEventsOnConnect = !1),
                                  (e.next = 3),
                                  this.http.fetchUnseenEvents()
                                );
                              case 3:
                                e.sent.forEach(function (e) {
                                  return t.handleIncomingEvent(e);
                                });
                              case 5:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "setSessionMetadata",
                value: (function () {
                  var e = i(
                    s().mark(function e(t, n) {
                      var a,
                        o = this;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (a = {
                                    type: "SetSessionConfig",
                                    id: (0, c.IntNumber)(this.nextReqId++),
                                    sessionId: this.session.id,
                                    metadata: r({}, t, n),
                                  }),
                                  e.abrupt(
                                    "return",
                                    this.setOnceConnected(
                                      i(
                                        s().mark(function e() {
                                          var t;
                                          return s().wrap(function (e) {
                                            for (;;)
                                              switch ((e.prev = e.next)) {
                                                case 0:
                                                  return (
                                                    (e.next = 2),
                                                    o.makeRequest(a)
                                                  );
                                                case 2:
                                                  if (
                                                    "Fail" !== (t = e.sent).type
                                                  ) {
                                                    e.next = 5;
                                                    break;
                                                  }
                                                  throw new Error(
                                                    t.error ||
                                                      "failed to set session metadata"
                                                  );
                                                case 5:
                                                case "end":
                                                  return e.stop();
                                              }
                                          }, e);
                                        })
                                      )
                                    )
                                  )
                                );
                              case 2:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "publishEvent",
                value: (function () {
                  var e = i(
                    s().mark(function e(t, n) {
                      var r,
                        a,
                        o,
                        u = this,
                        d = arguments;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (r = d.length > 2 && void 0 !== d[2] && d[2]),
                                  (e.next = 3),
                                  this.cipher.encrypt(
                                    JSON.stringify(
                                      Object.assign(Object.assign({}, n), {
                                        origin: location.origin,
                                        relaySource:
                                          window.coinbaseWalletExtension
                                            ? "injected_sdk"
                                            : "sdk",
                                      })
                                    )
                                  )
                                );
                              case 3:
                                return (
                                  (a = e.sent),
                                  (o = {
                                    type: "PublishEvent",
                                    id: (0, c.IntNumber)(this.nextReqId++),
                                    sessionId: this.session.id,
                                    event: t,
                                    data: a,
                                    callWebhook: r,
                                  }),
                                  e.abrupt(
                                    "return",
                                    this.setOnceLinked(
                                      i(
                                        s().mark(function e() {
                                          var t;
                                          return s().wrap(function (e) {
                                            for (;;)
                                              switch ((e.prev = e.next)) {
                                                case 0:
                                                  return (
                                                    (e.next = 2),
                                                    u.makeRequest(o)
                                                  );
                                                case 2:
                                                  if (
                                                    "Fail" !== (t = e.sent).type
                                                  ) {
                                                    e.next = 5;
                                                    break;
                                                  }
                                                  throw new Error(
                                                    t.error ||
                                                      "failed to publish event"
                                                  );
                                                case 5:
                                                  return e.abrupt(
                                                    "return",
                                                    t.eventId
                                                  );
                                                case 6:
                                                case "end":
                                                  return e.stop();
                                              }
                                          }, e);
                                        })
                                      )
                                    )
                                  )
                                );
                              case 6:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "sendData",
                value: function (e) {
                  this.ws.sendData(JSON.stringify(e));
                },
              },
              {
                key: "updateLastHeartbeat",
                value: function () {
                  this.lastHeartbeatResponse = Date.now();
                },
              },
              {
                key: "heartbeat",
                value: function () {
                  if (Date.now() - this.lastHeartbeatResponse > 2e4)
                    this.ws.disconnect();
                  else
                    try {
                      this.ws.sendData("h");
                    } catch (e) {}
                },
              },
              {
                key: "makeRequest",
                value: (function () {
                  var e = i(
                    s().mark(function e(t) {
                      var n,
                        r,
                        i,
                        a = this,
                        o = arguments;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (n =
                                    o.length > 1 && void 0 !== o[1]
                                      ? o[1]
                                      : 6e4),
                                  (r = t.id),
                                  this.sendData(t),
                                  e.abrupt(
                                    "return",
                                    Promise.race([
                                      new Promise(function (e, t) {
                                        i = window.setTimeout(function () {
                                          t(
                                            new Error(
                                              "request ".concat(r, " timed out")
                                            )
                                          );
                                        }, n);
                                      }),
                                      new Promise(function (e) {
                                        a.requestResolutions.set(
                                          r,
                                          function (t) {
                                            clearTimeout(i),
                                              e(t),
                                              a.requestResolutions.delete(r);
                                          }
                                        );
                                      }),
                                    ])
                                  )
                                );
                              case 4:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function (t) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "authenticate",
                value: (function () {
                  var e = i(
                    s().mark(function e() {
                      var t, n;
                      return s().wrap(
                        function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (t = {
                                    type: "HostSession",
                                    id: (0, c.IntNumber)(this.nextReqId++),
                                    sessionId: this.session.id,
                                    sessionKey: this.session.key,
                                  }),
                                  (e.next = 3),
                                  this.makeRequest(t)
                                );
                              case 3:
                                if ("Fail" !== (n = e.sent).type) {
                                  e.next = 6;
                                  break;
                                }
                                throw new Error(
                                  n.error || "failed to authentcate"
                                );
                              case 6:
                              case "end":
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function () {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: "sendIsLinked",
                value: function () {
                  var e = {
                    type: "IsLinked",
                    id: (0, c.IntNumber)(this.nextReqId++),
                    sessionId: this.session.id,
                  };
                  this.sendData(e);
                },
              },
              {
                key: "sendGetSessionConfig",
                value: function () {
                  var e = {
                    type: "GetSessionConfig",
                    id: (0, c.IntNumber)(this.nextReqId++),
                    sessionId: this.session.id,
                  };
                  this.sendData(e);
                },
              },
            ]),
            e
          );
        })();
      t.WalletLinkConnection = g;
    },
    8760: function (e, t, n) {
      "use strict";
      var r = n(17061).default,
        s = n(17156).default,
        i = n(56690).default,
        a = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.WalletLinkHTTP = void 0);
      var o = (function () {
        function e(t, n, r) {
          i(this, e), (this.linkAPIUrl = t), (this.sessionId = n);
          var s = "".concat(n, ":").concat(r);
          this.auth = "Basic ".concat(btoa(s));
        }
        return (
          a(e, [
            {
              key: "markUnseenEventsAsSeen",
              value: (function () {
                var e = s(
                  r().mark(function e(t) {
                    var n = this;
                    return r().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return e.abrupt(
                              "return",
                              Promise.all(
                                t.map(function (e) {
                                  return fetch(
                                    ""
                                      .concat(n.linkAPIUrl, "/events/")
                                      .concat(e.eventId, "/seen"),
                                    {
                                      method: "POST",
                                      headers: { Authorization: n.auth },
                                    }
                                  );
                                })
                              ).catch(function (e) {})
                            );
                          case 1:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: "fetchUnseenEvents",
              value: (function () {
                var e = s(
                  r().mark(function e() {
                    var t,
                      n,
                      s,
                      i,
                      a,
                      o,
                      c = this;
                    return r().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.next = 2),
                                fetch(
                                  "".concat(
                                    this.linkAPIUrl,
                                    "/events?unseen=true"
                                  ),
                                  { headers: { Authorization: this.auth } }
                                )
                              );
                            case 2:
                              if (!(n = e.sent).ok) {
                                e.next = 14;
                                break;
                              }
                              return (e.next = 6), n.json();
                            case 6:
                              if (
                                ((s = e.sent), (i = s.events), !(a = s.error))
                              ) {
                                e.next = 11;
                                break;
                              }
                              throw new Error(
                                "Check unseen events failed: ".concat(a)
                              );
                            case 11:
                              return (
                                (o =
                                  null !==
                                    (t =
                                      null === i || void 0 === i
                                        ? void 0
                                        : i
                                            .filter(function (e) {
                                              return "Web3Response" === e.event;
                                            })
                                            .map(function (e) {
                                              return {
                                                type: "Event",
                                                sessionId: c.sessionId,
                                                eventId: e.id,
                                                event: e.event,
                                                data: e.data,
                                              };
                                            })) && void 0 !== t
                                    ? t
                                    : []),
                                this.markUnseenEventsAsSeen(o),
                                e.abrupt("return", o)
                              );
                            case 14:
                              throw new Error(
                                "Check unseen events failed: ".concat(n.status)
                              );
                            case 15:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      this
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
            },
          ]),
          e
        );
      })();
      t.WalletLinkHTTP = o;
    },
    92809: function (e, t, n) {
      "use strict";
      var r,
        s = n(17061).default,
        i = n(861).default,
        a = n(17156).default,
        o = n(56690).default,
        c = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.WalletLinkWebSocket = t.ConnectionState = void 0),
        (function (e) {
          (e[(e.DISCONNECTED = 0)] = "DISCONNECTED"),
            (e[(e.CONNECTING = 1)] = "CONNECTING"),
            (e[(e.CONNECTED = 2)] = "CONNECTED");
        })(r || (t.ConnectionState = r = {}));
      var u = (function () {
        function e(t) {
          var n =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : WebSocket;
          o(this, e),
            (this.WebSocketClass = n),
            (this.webSocket = null),
            (this.pendingData = []),
            (this.url = t.replace(/^http/, "ws"));
        }
        return (
          c(e, [
            {
              key: "setConnectionStateListener",
              value: function (e) {
                this.connectionStateListener = e;
              },
            },
            {
              key: "setIncomingDataListener",
              value: function (e) {
                this.incomingDataListener = e;
              },
            },
            {
              key: "connect",
              value: (function () {
                var e = a(
                  s().mark(function e() {
                    var t = this;
                    return s().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (!this.webSocket) {
                                e.next = 2;
                                break;
                              }
                              throw new Error("webSocket object is not null");
                            case 2:
                              return e.abrupt(
                                "return",
                                new Promise(function (e, n) {
                                  var s, a;
                                  try {
                                    t.webSocket = a = new t.WebSocketClass(
                                      t.url
                                    );
                                  } catch (o) {
                                    return void n(o);
                                  }
                                  null === (s = t.connectionStateListener) ||
                                    void 0 === s ||
                                    s.call(t, r.CONNECTING),
                                    (a.onclose = function (e) {
                                      var s;
                                      t.clearWebSocket(),
                                        n(
                                          new Error(
                                            "websocket error "
                                              .concat(e.code, ": ")
                                              .concat(e.reason)
                                          )
                                        ),
                                        null ===
                                          (s = t.connectionStateListener) ||
                                          void 0 === s ||
                                          s.call(t, r.DISCONNECTED);
                                    }),
                                    (a.onopen = function (n) {
                                      var s;
                                      (e(),
                                      null ===
                                        (s = t.connectionStateListener) ||
                                        void 0 === s ||
                                        s.call(t, r.CONNECTED),
                                      t.pendingData.length > 0) &&
                                        (i(t.pendingData).forEach(function (e) {
                                          return t.sendData(e);
                                        }),
                                        (t.pendingData = []));
                                    }),
                                    (a.onmessage = function (e) {
                                      var n, r;
                                      if ("h" === e.data)
                                        null === (n = t.incomingDataListener) ||
                                          void 0 === n ||
                                          n.call(t, { type: "Heartbeat" });
                                      else
                                        try {
                                          var s = JSON.parse(e.data);
                                          null ===
                                            (r = t.incomingDataListener) ||
                                            void 0 === r ||
                                            r.call(t, s);
                                        } catch (i) {}
                                    });
                                })
                              );
                            case 3:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      this
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: "disconnect",
              value: function () {
                var e,
                  t = this.webSocket;
                if (t) {
                  this.clearWebSocket(),
                    null === (e = this.connectionStateListener) ||
                      void 0 === e ||
                      e.call(this, r.DISCONNECTED),
                    (this.connectionStateListener = void 0),
                    (this.incomingDataListener = void 0);
                  try {
                    t.close();
                  } catch (n) {}
                }
              },
            },
            {
              key: "sendData",
              value: function (e) {
                var t = this.webSocket;
                if (!t) return this.pendingData.push(e), void this.connect();
                t.send(e);
              },
            },
            {
              key: "clearWebSocket",
              value: function () {
                var e = this.webSocket;
                e &&
                  ((this.webSocket = null),
                  (e.onclose = null),
                  (e.onerror = null),
                  (e.onmessage = null),
                  (e.onopen = null));
              },
            },
          ]),
          e
        );
      })();
      t.WalletLinkWebSocket = u;
    },
    22953: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.isErrorResponse = void 0),
        (t.isErrorResponse = function (e) {
          return void 0 !== e.errorMessage;
        });
    },
    73092: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.WalletLinkRelayUI = void 0);
      var i = n(19448),
        a = n(9478),
        o = n(8379),
        c = (function () {
          function e(t) {
            r(this, e),
              (this.standalone = null),
              (this.attached = !1),
              (this.snackbar = new o.Snackbar({ darkMode: t.darkMode })),
              (this.linkFlow = new a.LinkFlow({
                darkMode: t.darkMode,
                version: t.version,
                sessionId: t.session.id,
                sessionSecret: t.session.secret,
                linkAPIUrl: t.linkAPIUrl,
                isParentConnection: !1,
              }));
          }
          return (
            s(e, [
              {
                key: "attach",
                value: function () {
                  if (this.attached)
                    throw new Error(
                      "Coinbase Wallet SDK UI is already attached"
                    );
                  var e = document.documentElement,
                    t = document.createElement("div");
                  (t.className = "-cbwsdk-css-reset"),
                    e.appendChild(t),
                    this.linkFlow.attach(t),
                    this.snackbar.attach(t),
                    (this.attached = !0),
                    (0, i.injectCssReset)();
                },
              },
              {
                key: "setConnected",
                value: function (e) {
                  this.linkFlow.setConnected(e);
                },
              },
              {
                key: "setChainId",
                value: function (e) {
                  this.linkFlow.setChainId(e);
                },
              },
              {
                key: "setConnectDisabled",
                value: function (e) {
                  this.linkFlow.setConnectDisabled(e);
                },
              },
              { key: "addEthereumChain", value: function () {} },
              { key: "watchAsset", value: function () {} },
              { key: "switchEthereumChain", value: function () {} },
              {
                key: "requestEthereumAccounts",
                value: function (e) {
                  this.linkFlow.open({ onCancel: e.onCancel });
                },
              },
              {
                key: "hideRequestEthereumAccounts",
                value: function () {
                  this.linkFlow.close();
                },
              },
              { key: "signEthereumMessage", value: function () {} },
              { key: "signEthereumTransaction", value: function () {} },
              { key: "submitEthereumTransaction", value: function () {} },
              {
                key: "ethereumAddressFromSignedMessage",
                value: function () {},
              },
              {
                key: "showConnecting",
                value: function (e) {
                  var t;
                  return (
                    (t = e.isUnlinkedErrorState
                      ? {
                          autoExpand: !0,
                          message: "Connection lost",
                          menuItems: [
                            {
                              isRed: !1,
                              info: "Reset connection",
                              svgWidth: "10",
                              svgHeight: "11",
                              path: "M5.00008 0.96875C6.73133 0.96875 8.23758 1.94375 9.00008 3.375L10.0001 2.375V5.5H9.53133H7.96883H6.87508L7.80633 4.56875C7.41258 3.3875 6.31258 2.53125 5.00008 2.53125C3.76258 2.53125 2.70633 3.2875 2.25633 4.36875L0.812576 3.76875C1.50008 2.125 3.11258 0.96875 5.00008 0.96875ZM2.19375 6.43125C2.5875 7.6125 3.6875 8.46875 5 8.46875C6.2375 8.46875 7.29375 7.7125 7.74375 6.63125L9.1875 7.23125C8.5 8.875 6.8875 10.0312 5 10.0312C3.26875 10.0312 1.7625 9.05625 1 7.625L0 8.625V5.5H0.46875H2.03125H3.125L2.19375 6.43125Z",
                              defaultFillRule: "evenodd",
                              defaultClipRule: "evenodd",
                              onClick: e.onResetConnection,
                            },
                          ],
                        }
                      : {
                          message: "Confirm on phone",
                          menuItems: [
                            {
                              isRed: !0,
                              info: "Cancel transaction",
                              svgWidth: "11",
                              svgHeight: "11",
                              path: "M10.3711 1.52346L9.21775 0.370117L5.37109 4.21022L1.52444 0.370117L0.371094 1.52346L4.2112 5.37012L0.371094 9.21677L1.52444 10.3701L5.37109 6.53001L9.21775 10.3701L10.3711 9.21677L6.53099 5.37012L10.3711 1.52346Z",
                              defaultFillRule: "inherit",
                              defaultClipRule: "inherit",
                              onClick: e.onCancel,
                            },
                            {
                              isRed: !1,
                              info: "Reset connection",
                              svgWidth: "10",
                              svgHeight: "11",
                              path: "M5.00008 0.96875C6.73133 0.96875 8.23758 1.94375 9.00008 3.375L10.0001 2.375V5.5H9.53133H7.96883H6.87508L7.80633 4.56875C7.41258 3.3875 6.31258 2.53125 5.00008 2.53125C3.76258 2.53125 2.70633 3.2875 2.25633 4.36875L0.812576 3.76875C1.50008 2.125 3.11258 0.96875 5.00008 0.96875ZM2.19375 6.43125C2.5875 7.6125 3.6875 8.46875 5 8.46875C6.2375 8.46875 7.29375 7.7125 7.74375 6.63125L9.1875 7.23125C8.5 8.875 6.8875 10.0312 5 10.0312C3.26875 10.0312 1.7625 9.05625 1 7.625L0 8.625V5.5H0.46875H2.03125H3.125L2.19375 6.43125Z",
                              defaultFillRule: "evenodd",
                              defaultClipRule: "evenodd",
                              onClick: e.onResetConnection,
                            },
                          ],
                        }),
                    this.snackbar.presentItem(t)
                  );
                },
              },
              {
                key: "reloadUI",
                value: function () {
                  document.location.reload();
                },
              },
              {
                key: "inlineAccountsResponse",
                value: function () {
                  return !1;
                },
              },
              {
                key: "inlineAddEthereumChain",
                value: function () {
                  return !1;
                },
              },
              {
                key: "inlineWatchAsset",
                value: function () {
                  return !1;
                },
              },
              {
                key: "inlineSwitchEthereumChain",
                value: function () {
                  return !1;
                },
              },
              {
                key: "setStandalone",
                value: function (e) {
                  this.standalone = e;
                },
              },
              {
                key: "isStandalone",
                value: function () {
                  var e;
                  return null !== (e = this.standalone) && void 0 !== e && e;
                },
              },
            ]),
            e
          );
        })();
      t.WalletLinkRelayUI = c;
    },
    8478: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          ".-cbwsdk-css-reset .-cbwsdk-connect-content{height:430px;width:700px;border-radius:12px;padding:30px}.-cbwsdk-css-reset .-cbwsdk-connect-content.light{background:#fff}.-cbwsdk-css-reset .-cbwsdk-connect-content.dark{background:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-connect-content-header{display:flex;align-items:center;justify-content:space-between;margin:0 0 30px}.-cbwsdk-css-reset .-cbwsdk-connect-content-heading{font-style:normal;font-weight:500;font-size:28px;line-height:36px;margin:0}.-cbwsdk-css-reset .-cbwsdk-connect-content-heading.light{color:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-connect-content-heading.dark{color:#fff}.-cbwsdk-css-reset .-cbwsdk-connect-content-layout{display:flex;flex-direction:row}.-cbwsdk-css-reset .-cbwsdk-connect-content-column-left{margin-right:30px;display:flex;flex-direction:column;justify-content:space-between}.-cbwsdk-css-reset .-cbwsdk-connect-content-column-right{flex:25%;margin-right:34px}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-wrapper{width:220px;height:220px;border-radius:12px;display:flex;justify-content:center;align-items:center;background:#fff}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-connecting{position:absolute;top:0;bottom:0;left:0;right:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-connecting.light{background-color:rgba(255,255,255,.95)}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-connecting.light>p{color:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-connecting.dark{background-color:rgba(10,11,13,.9)}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-connecting.dark>p{color:#fff}.-cbwsdk-css-reset .-cbwsdk-connect-content-qr-connecting>p{font-size:12px;font-weight:bold;margin-top:16px}.-cbwsdk-css-reset .-cbwsdk-connect-content-update-app{border-radius:8px;font-size:14px;line-height:20px;padding:12px;width:339px}.-cbwsdk-css-reset .-cbwsdk-connect-content-update-app.light{background:#eef0f3;color:#5b636e}.-cbwsdk-css-reset .-cbwsdk-connect-content-update-app.dark{background:#1e2025;color:#8a919e}.-cbwsdk-css-reset .-cbwsdk-cancel-button{-webkit-appearance:none;border:none;background:none;cursor:pointer;padding:0;margin:0}.-cbwsdk-css-reset .-cbwsdk-cancel-button-x{position:relative;display:block;cursor:pointer}.-cbwsdk-css-reset .-cbwsdk-wallet-steps{padding:0 0 0 16px;margin:0;width:100%;list-style:decimal}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-item{list-style-type:decimal;display:list-item;font-style:normal;font-weight:400;font-size:16px;line-height:24px;margin-top:20px}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-item.light{color:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-item.dark{color:#fff}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-item-wrapper{display:flex;align-items:center}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-pad-left{margin-left:6px}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-icon{display:flex;border-radius:50%;height:24px;width:24px}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-icon svg{margin:auto;display:block}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-icon.light{background:#0052ff}.-cbwsdk-css-reset .-cbwsdk-wallet-steps-icon.dark{background:#588af5}.-cbwsdk-css-reset .-cbwsdk-connect-item{align-items:center;display:flex;flex-direction:row;padding:16px 24px;gap:12px;cursor:pointer;border-radius:100px;font-weight:600}.-cbwsdk-css-reset .-cbwsdk-connect-item.light{background:#f5f8ff;color:#0052ff}.-cbwsdk-css-reset .-cbwsdk-connect-item.dark{background:#001033;color:#588af5}.-cbwsdk-css-reset .-cbwsdk-connect-item-copy-wrapper{margin:0 4px 0 8px}.-cbwsdk-css-reset .-cbwsdk-connect-item-title{margin:0 0 0;font-size:16px;line-height:24px;font-weight:500}.-cbwsdk-css-reset .-cbwsdk-connect-item-description{font-weight:400;font-size:14px;line-height:20px;margin:0}");
    },
    78603: function (e, t, n) {
      "use strict";
      var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.CoinbaseWalletSteps = t.ConnectContent = void 0);
      var s = r(n(54080)),
        i = n(51681),
        a = n(30246),
        o = n(60710),
        c = n(96294),
        u = n(34836),
        d = n(46891),
        l = n(60425),
        h = n(26657),
        f = r(n(8478)),
        p = "Coinbase Wallet app",
        g = "Connect with your self-custody wallet",
        v = w,
        m = function (e) {
          return "light" === e ? "#FFFFFF" : "#0A0B0D";
        };
      function b(e) {
        var t = e.title,
          n = e.description,
          r = e.theme;
        return (0, i.h)(
          "div",
          { className: (0, s.default)("-cbwsdk-connect-item", r) },
          (0, i.h)("div", null, (0, i.h)(u.CoinbaseWalletRound, null)),
          (0, i.h)(
            "div",
            { className: "-cbwsdk-connect-item-copy-wrapper" },
            (0, i.h)("h3", { className: "-cbwsdk-connect-item-title" }, t),
            (0, i.h)("p", { className: "-cbwsdk-connect-item-description" }, n)
          )
        );
      }
      function w(e) {
        var t = e.theme;
        return (0, i.h)(
          "ol",
          { className: "-cbwsdk-wallet-steps" },
          (0, i.h)(
            "li",
            { className: (0, s.default)("-cbwsdk-wallet-steps-item", t) },
            (0, i.h)(
              "div",
              { className: "-cbwsdk-wallet-steps-item-wrapper" },
              "Open Coinbase Wallet app"
            )
          ),
          (0, i.h)(
            "li",
            { className: (0, s.default)("-cbwsdk-wallet-steps-item", t) },
            (0, i.h)(
              "div",
              { className: "-cbwsdk-wallet-steps-item-wrapper" },
              (0, i.h)(
                "span",
                null,
                "Tap ",
                (0, i.h)("strong", null, "Scan"),
                " "
              ),
              (0, i.h)(
                "span",
                {
                  className: (0, s.default)(
                    "-cbwsdk-wallet-steps-pad-left",
                    "-cbwsdk-wallet-steps-icon",
                    t
                  ),
                },
                (0, i.h)(d.QRCodeIcon, { fill: m(t) })
              )
            )
          )
        );
      }
      (t.ConnectContent = function (e) {
        var t = e.theme,
          n = (0, a.createQrUrl)(
            e.sessionId,
            e.sessionSecret,
            e.linkAPIUrl,
            e.isParentConnection,
            e.version,
            e.chainId
          ),
          r = v;
        return (0, i.h)(
          "div",
          {
            "data-testid": "connect-content",
            className: (0, s.default)("-cbwsdk-connect-content", t),
          },
          (0, i.h)("style", null, f.default),
          (0, i.h)(
            "div",
            { className: "-cbwsdk-connect-content-header" },
            (0, i.h)(
              "h2",
              {
                className: (0, s.default)("-cbwsdk-connect-content-heading", t),
              },
              "Scan to connect with our mobile app"
            ),
            e.onCancel &&
              (0, i.h)(
                "button",
                {
                  type: "button",
                  className: "-cbwsdk-cancel-button",
                  onClick: e.onCancel,
                },
                (0, i.h)(c.CloseIcon, {
                  fill: "light" === t ? "#0A0B0D" : "#FFFFFF",
                })
              )
          ),
          (0, i.h)(
            "div",
            { className: "-cbwsdk-connect-content-layout" },
            (0, i.h)(
              "div",
              { className: "-cbwsdk-connect-content-column-left" },
              (0, i.h)(b, { title: p, description: g, theme: t })
            ),
            (0, i.h)(
              "div",
              { className: "-cbwsdk-connect-content-column-right" },
              (0, i.h)(
                "div",
                { className: "-cbwsdk-connect-content-qr-wrapper" },
                (0, i.h)(l.QRCode, {
                  content: n,
                  width: 200,
                  height: 200,
                  fgColor: "#000",
                  bgColor: "transparent",
                }),
                (0, i.h)("input", {
                  type: "hidden",
                  name: "cbw-cbwsdk-version",
                  value: o.LIB_VERSION,
                }),
                (0, i.h)("input", { type: "hidden", value: n })
              ),
              (0, i.h)(r, { theme: t }),
              !e.isConnected &&
                (0, i.h)(
                  "div",
                  {
                    "data-testid": "connecting-spinner",
                    className: (0, s.default)(
                      "-cbwsdk-connect-content-qr-connecting",
                      t
                    ),
                  },
                  (0, i.h)(h.Spinner, {
                    size: 36,
                    color: "dark" === t ? "#FFF" : "#000",
                  }),
                  (0, i.h)("p", null, "Connecting...")
                )
            )
          )
        );
      }),
        (t.CoinbaseWalletSteps = w);
    },
    57229: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          ".-cbwsdk-css-reset .-cbwsdk-connect-dialog{z-index:2147483647;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-backdrop{z-index:2147483647;position:fixed;top:0;left:0;right:0;bottom:0;transition:opacity .25s}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-backdrop.light{background-color:rgba(0,0,0,.5)}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-backdrop.dark{background-color:rgba(50,53,61,.4)}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-backdrop-hidden{opacity:0}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-box{display:flex;position:relative;flex-direction:column;transform:scale(1);transition:opacity .25s,transform .25s}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-box-hidden{opacity:0;transform:scale(0.85)}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-container{display:block}.-cbwsdk-css-reset .-cbwsdk-connect-dialog-container-hidden{display:none}");
    },
    87731: function (e, t, n) {
      "use strict";
      var r = n(27424).default,
        s =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ConnectDialog = void 0);
      var i = s(n(54080)),
        a = n(51681),
        o = n(22730),
        c = n(78603),
        u = n(99778),
        d = s(n(57229));
      t.ConnectDialog = function (e) {
        var t = e.isOpen,
          n = e.darkMode,
          s = (0, o.useState)(!t),
          l = r(s, 2),
          h = l[0],
          f = l[1],
          p = (0, o.useState)(!t),
          g = r(p, 2),
          v = g[0],
          m = g[1];
        (0, o.useEffect)(
          function () {
            var e = [
              window.setTimeout(function () {
                m(!t);
              }, 10),
            ];
            return (
              t
                ? f(!1)
                : e.push(
                    window.setTimeout(function () {
                      f(!0);
                    }, 360)
                  ),
              function () {
                e.forEach(window.clearTimeout);
              }
            );
          },
          [t]
        );
        var b = n ? "dark" : "light";
        return (0, a.h)(
          "div",
          {
            class: (0, i.default)(
              "-cbwsdk-connect-dialog-container",
              h && "-cbwsdk-connect-dialog-container-hidden"
            ),
          },
          (0, a.h)("style", null, d.default),
          (0, a.h)("div", {
            class: (0, i.default)(
              "-cbwsdk-connect-dialog-backdrop",
              b,
              v && "-cbwsdk-connect-dialog-backdrop-hidden"
            ),
          }),
          (0, a.h)(
            "div",
            { class: "-cbwsdk-connect-dialog" },
            (0, a.h)(
              "div",
              {
                class: (0, i.default)(
                  "-cbwsdk-connect-dialog-box",
                  v && "-cbwsdk-connect-dialog-box-hidden"
                ),
              },
              e.connectDisabled
                ? null
                : (0, a.h)(c.ConnectContent, {
                    theme: b,
                    version: e.version,
                    sessionId: e.sessionId,
                    sessionSecret: e.sessionSecret,
                    linkAPIUrl: e.linkAPIUrl,
                    isConnected: e.isConnected,
                    isParentConnection: e.isParentConnection,
                    chainId: e.chainId,
                    onCancel: e.onCancel,
                  }),
              (0, a.h)(u.TryExtensionContent, { theme: b })
            )
          )
        );
      };
    },
    9478: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.LinkFlow = void 0);
      var i = n(51681),
        a = n(87731),
        o = (function () {
          function e(t) {
            r(this, e),
              (this.connected = !1),
              (this.chainId = 1),
              (this.isOpen = !1),
              (this.onCancel = null),
              (this.root = null),
              (this.connectDisabled = !1),
              (this.darkMode = t.darkMode),
              (this.version = t.version),
              (this.sessionId = t.sessionId),
              (this.sessionSecret = t.sessionSecret),
              (this.linkAPIUrl = t.linkAPIUrl),
              (this.isParentConnection = t.isParentConnection);
          }
          return (
            s(e, [
              {
                key: "attach",
                value: function (e) {
                  (this.root = document.createElement("div")),
                    (this.root.className = "-cbwsdk-link-flow-root"),
                    e.appendChild(this.root),
                    this.render();
                },
              },
              {
                key: "setConnected",
                value: function (e) {
                  this.connected !== e && ((this.connected = e), this.render());
                },
              },
              {
                key: "setChainId",
                value: function (e) {
                  this.chainId !== e && ((this.chainId = e), this.render());
                },
              },
              {
                key: "detach",
                value: function () {
                  var e;
                  this.root &&
                    ((0, i.render)(null, this.root),
                    null === (e = this.root.parentElement) ||
                      void 0 === e ||
                      e.removeChild(this.root));
                },
              },
              {
                key: "setConnectDisabled",
                value: function (e) {
                  this.connectDisabled = e;
                },
              },
              {
                key: "open",
                value: function (e) {
                  (this.isOpen = !0),
                    (this.onCancel = e.onCancel),
                    this.render();
                },
              },
              {
                key: "close",
                value: function () {
                  (this.isOpen = !1), (this.onCancel = null), this.render();
                },
              },
              {
                key: "render",
                value: function () {
                  this.root &&
                    (0, i.render)(
                      (0, i.h)(a.ConnectDialog, {
                        darkMode: this.darkMode,
                        version: this.version,
                        sessionId: this.sessionId,
                        sessionSecret: this.sessionSecret,
                        linkAPIUrl: this.linkAPIUrl,
                        isOpen: this.isOpen,
                        isConnected: this.connected,
                        isParentConnection: this.isParentConnection,
                        chainId: this.chainId,
                        onCancel: this.onCancel,
                        connectDisabled: this.connectDisabled,
                      }),
                      this.root
                    );
                },
              },
            ]),
            e
          );
        })();
      t.LinkFlow = o;
    },
    60425: function (e, t, n) {
      "use strict";
      var r = n(8901).Buffer,
        s = n(27424).default,
        i =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.QRCode = void 0);
      var a = n(51681),
        o = n(22730),
        c = i(n(48012));
      t.QRCode = function (e) {
        var t = (0, o.useState)(""),
          n = s(t, 2),
          i = n[0],
          u = n[1];
        return (
          (0, o.useEffect)(
            function () {
              var t,
                n,
                s = new c.default({
                  content: e.content,
                  background: e.bgColor || "#ffffff",
                  color: e.fgColor || "#000000",
                  container: "svg",
                  ecl: "M",
                  width: null !== (t = e.width) && void 0 !== t ? t : 256,
                  height: null !== (n = e.height) && void 0 !== n ? n : 256,
                  padding: 0,
                  image: e.image,
                }),
                i = r.from(s.svg(), "utf8").toString("base64");
              u("data:image/svg+xml;base64,".concat(i));
            },
            [e.bgColor, e.content, e.fgColor, e.height, e.image, e.width]
          ),
          i ? (0, a.h)("img", { src: i, alt: "QR Code" }) : null
        );
      };
    },
    93498: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          ".-cbwsdk-css-reset .-cbwsdk-redirect-dialog-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;transition:opacity .25s;background-color:rgba(10,11,13,.5)}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-backdrop-hidden{opacity:0}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box{display:block;position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);padding:20px;border-radius:8px;background-color:#fff;color:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box p{display:block;font-weight:400;font-size:14px;line-height:20px;padding-bottom:12px;color:#5b636e}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box button{appearance:none;border:none;background:none;color:#0052ff;padding:0;text-decoration:none;display:block;font-weight:600;font-size:16px;line-height:24px}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box.dark{background-color:#0a0b0d;color:#fff}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box.dark button{color:#0052ff}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box.light{background-color:#fff;color:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-redirect-dialog-box.light button{color:#0052ff}");
    },
    61736: function (e, t, n) {
      "use strict";
      var r = n(56690).default,
        s = n(89728).default,
        i =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.RedirectDialog = void 0);
      var a = i(n(54080)),
        o = n(51681),
        c = n(19448),
        u = n(96318),
        d = i(n(93498)),
        l = (function () {
          function e() {
            r(this, e), (this.root = null);
          }
          return (
            s(e, [
              {
                key: "attach",
                value: function () {
                  var e = document.documentElement;
                  (this.root = document.createElement("div")),
                    (this.root.className = "-cbwsdk-css-reset"),
                    e.appendChild(this.root),
                    (0, c.injectCssReset)();
                },
              },
              {
                key: "present",
                value: function (e) {
                  this.render(e);
                },
              },
              {
                key: "clear",
                value: function () {
                  this.render(null);
                },
              },
              {
                key: "render",
                value: function (e) {
                  var t = this;
                  this.root &&
                    ((0, o.render)(null, this.root),
                    e &&
                      (0, o.render)(
                        (0, o.h)(
                          h,
                          Object.assign({}, e, {
                            onDismiss: function () {
                              t.clear();
                            },
                          })
                        ),
                        this.root
                      ));
                },
              },
            ]),
            e
          );
        })();
      t.RedirectDialog = l;
      var h = function (e) {
        var t = e.title,
          n = e.buttonText,
          r = e.darkMode,
          s = e.onButtonClick,
          i = e.onDismiss,
          c = r ? "dark" : "light";
        return (0, o.h)(
          u.SnackbarContainer,
          { darkMode: r },
          (0, o.h)(
            "div",
            { class: "-cbwsdk-redirect-dialog" },
            (0, o.h)("style", null, d.default),
            (0, o.h)("div", {
              class: "-cbwsdk-redirect-dialog-backdrop",
              onClick: i,
            }),
            (0, o.h)(
              "div",
              { class: (0, a.default)("-cbwsdk-redirect-dialog-box", c) },
              (0, o.h)("p", null, t),
              (0, o.h)("button", { onClick: s }, n)
            )
          )
        );
      };
    },
    20659: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          ".-cbwsdk-css-reset .-gear-container{margin-left:16px !important;margin-right:9px !important;display:flex;align-items:center;justify-content:center;width:24px;height:24px;transition:opacity .25s}.-cbwsdk-css-reset .-gear-container *{user-select:none}.-cbwsdk-css-reset .-gear-container svg{opacity:0;position:absolute}.-cbwsdk-css-reset .-gear-icon{height:12px;width:12px;z-index:10000}.-cbwsdk-css-reset .-cbwsdk-snackbar{align-items:flex-end;display:flex;flex-direction:column;position:fixed;right:0;top:0;z-index:2147483647}.-cbwsdk-css-reset .-cbwsdk-snackbar *{user-select:none}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance{display:flex;flex-direction:column;margin:8px 16px 0 16px;overflow:visible;text-align:left;transform:translateX(0);transition:opacity .25s,transform .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-header:hover .-gear-container svg{opacity:1}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-header{display:flex;align-items:center;background:#fff;overflow:hidden;border:1px solid #e7ebee;box-sizing:border-box;border-radius:8px;cursor:pointer}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-header-cblogo{margin:8px 8px 8px 8px}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-header *{cursor:pointer}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-header-message{color:#000;font-size:13px;line-height:1.5;user-select:none}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu{background:#fff;transition:opacity .25s ease-in-out,transform .25s linear,visibility 0s;visibility:hidden;border:1px solid #e7ebee;box-sizing:border-box;border-radius:8px;opacity:0;flex-direction:column;padding-left:8px;padding-right:8px}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item:last-child{margin-bottom:8px !important}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item:hover{background:#f5f7f8;border-radius:6px;transition:background .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item:hover span{color:#050f19;transition:color .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item:hover svg path{fill:#000;transition:fill .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item{visibility:inherit;height:35px;margin-top:8px;margin-bottom:0;display:flex;flex-direction:row;align-items:center;padding:8px;cursor:pointer}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item *{visibility:inherit;cursor:pointer}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item-is-red:hover{background:rgba(223,95,103,.2);transition:background .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item-is-red:hover *{cursor:pointer}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item-is-red:hover svg path{fill:#df5f67;transition:fill .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item-is-red:hover span{color:#df5f67;transition:color .25s}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-menu-item-info{color:#aaa;font-size:13px;margin:0 8px 0 32px;position:absolute}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-hidden{opacity:0;text-align:left;transform:translateX(25%);transition:opacity .5s linear}.-cbwsdk-css-reset .-cbwsdk-snackbar-instance-expanded .-cbwsdk-snackbar-instance-menu{opacity:1;display:flex;transform:translateY(8px);visibility:visible}");
    },
    8379: function (e, t, n) {
      "use strict";
      var r = n(27424).default,
        s = n(56690).default,
        i = n(89728).default,
        a =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.SnackbarInstance = t.SnackbarContainer = t.Snackbar = void 0);
      var o = a(n(54080)),
        c = n(51681),
        u = n(22730),
        d = a(n(20659)),
        l = (function () {
          function e(t) {
            s(this, e),
              (this.items = new Map()),
              (this.nextItemKey = 0),
              (this.root = null),
              (this.darkMode = t.darkMode);
          }
          return (
            i(e, [
              {
                key: "attach",
                value: function (e) {
                  (this.root = document.createElement("div")),
                    (this.root.className = "-cbwsdk-snackbar-root"),
                    e.appendChild(this.root),
                    this.render();
                },
              },
              {
                key: "presentItem",
                value: function (e) {
                  var t = this,
                    n = this.nextItemKey++;
                  return (
                    this.items.set(n, e),
                    this.render(),
                    function () {
                      t.items.delete(n), t.render();
                    }
                  );
                },
              },
              {
                key: "clear",
                value: function () {
                  this.items.clear(), this.render();
                },
              },
              {
                key: "render",
                value: function () {
                  this.root &&
                    (0, c.render)(
                      (0, c.h)(
                        "div",
                        null,
                        (0, c.h)(
                          t.SnackbarContainer,
                          { darkMode: this.darkMode },
                          Array.from(this.items.entries()).map(function (e) {
                            var n = r(e, 2),
                              s = n[0],
                              i = n[1];
                            return (0,
                            c.h)(t.SnackbarInstance, Object.assign({}, i, { key: s }));
                          })
                        )
                      ),
                      this.root
                    );
                },
              },
            ]),
            e
          );
        })();
      t.Snackbar = l;
      t.SnackbarContainer = function (e) {
        return (0, c.h)(
          "div",
          { class: (0, o.default)("-cbwsdk-snackbar-container") },
          (0, c.h)("style", null, d.default),
          (0, c.h)("div", { class: "-cbwsdk-snackbar" }, e.children)
        );
      };
      t.SnackbarInstance = function (e) {
        var t = e.autoExpand,
          n = e.message,
          s = e.menuItems,
          i = (0, u.useState)(!0),
          a = r(i, 2),
          d = a[0],
          l = a[1],
          h = (0, u.useState)(null !== t && void 0 !== t && t),
          f = r(h, 2),
          p = f[0],
          g = f[1];
        (0, u.useEffect)(function () {
          var e = [
            window.setTimeout(function () {
              l(!1);
            }, 1),
            window.setTimeout(function () {
              g(!0);
            }, 1e4),
          ];
          return function () {
            e.forEach(window.clearTimeout);
          };
        });
        return (0, c.h)(
          "div",
          {
            class: (0, o.default)(
              "-cbwsdk-snackbar-instance",
              d && "-cbwsdk-snackbar-instance-hidden",
              p && "-cbwsdk-snackbar-instance-expanded"
            ),
          },
          (0, c.h)(
            "div",
            {
              class: "-cbwsdk-snackbar-instance-header",
              onClick: function () {
                g(!p);
              },
            },
            (0, c.h)("img", {
              src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDkyIDEwLjQxOWE4LjkzIDguOTMgMCAwMTguOTMtOC45M2gxMS4xNjNhOC45MyA4LjkzIDAgMDE4LjkzIDguOTN2MTEuMTYzYTguOTMgOC45MyAwIDAxLTguOTMgOC45M0gxMC40MjJhOC45MyA4LjkzIDAgMDEtOC45My04LjkzVjEwLjQxOXoiIGZpbGw9IiMxNjUyRjAiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEwLjQxOSAwSDIxLjU4QzI3LjMzNSAwIDMyIDQuNjY1IDMyIDEwLjQxOVYyMS41OEMzMiAyNy4zMzUgMjcuMzM1IDMyIDIxLjU4MSAzMkgxMC40MkM0LjY2NSAzMiAwIDI3LjMzNSAwIDIxLjU4MVYxMC40MkMwIDQuNjY1IDQuNjY1IDAgMTAuNDE5IDB6bTAgMS40ODhhOC45MyA4LjkzIDAgMDAtOC45MyA4LjkzdjExLjE2M2E4LjkzIDguOTMgMCAwMDguOTMgOC45M0gyMS41OGE4LjkzIDguOTMgMCAwMDguOTMtOC45M1YxMC40MmE4LjkzIDguOTMgMCAwMC04LjkzLTguOTNIMTAuNDJ6IiBmaWxsPSIjZmZmIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNS45OTggMjYuMDQ5Yy01LjU0OSAwLTEwLjA0Ny00LjQ5OC0xMC4wNDctMTAuMDQ3IDAtNS41NDggNC40OTgtMTAuMDQ2IDEwLjA0Ny0xMC4wNDYgNS41NDggMCAxMC4wNDYgNC40OTggMTAuMDQ2IDEwLjA0NiAwIDUuNTQ5LTQuNDk4IDEwLjA0Ny0xMC4wNDYgMTAuMDQ3eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMi43NjIgMTQuMjU0YzAtLjgyMi42NjctMS40ODkgMS40ODktMS40ODloMy40OTdjLjgyMiAwIDEuNDg4LjY2NiAxLjQ4OCAxLjQ4OXYzLjQ5N2MwIC44MjItLjY2NiAxLjQ4OC0xLjQ4OCAxLjQ4OGgtMy40OTdhMS40ODggMS40ODggMCAwMS0xLjQ4OS0xLjQ4OHYtMy40OTh6IiBmaWxsPSIjMTY1MkYwIi8+PC9zdmc+",
              class: "-cbwsdk-snackbar-instance-header-cblogo",
            }),
            " ",
            (0, c.h)(
              "div",
              { class: "-cbwsdk-snackbar-instance-header-message" },
              n
            ),
            (0, c.h)(
              "div",
              { class: "-gear-container" },
              !p &&
                (0, c.h)(
                  "svg",
                  {
                    width: "24",
                    height: "24",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  (0, c.h)("circle", {
                    cx: "12",
                    cy: "12",
                    r: "12",
                    fill: "#F5F7F8",
                  })
                ),
              (0, c.h)("img", {
                src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDYuNzV2LTEuNWwtMS43Mi0uNTdjLS4wOC0uMjctLjE5LS41Mi0uMzItLjc3bC44MS0xLjYyLTEuMDYtMS4wNi0xLjYyLjgxYy0uMjQtLjEzLS41LS4yNC0uNzctLjMyTDYuNzUgMGgtMS41bC0uNTcgMS43MmMtLjI3LjA4LS41My4xOS0uNzcuMzJsLTEuNjItLjgxLTEuMDYgMS4wNi44MSAxLjYyYy0uMTMuMjQtLjI0LjUtLjMyLjc3TDAgNS4yNXYxLjVsMS43Mi41N2MuMDguMjcuMTkuNTMuMzIuNzdsLS44MSAxLjYyIDEuMDYgMS4wNiAxLjYyLS44MWMuMjQuMTMuNS4yMy43Ny4zMkw1LjI1IDEyaDEuNWwuNTctMS43MmMuMjctLjA4LjUyLS4xOS43Ny0uMzJsMS42Mi44MSAxLjA2LTEuMDYtLjgxLTEuNjJjLjEzLS4yNC4yMy0uNS4zMi0uNzdMMTIgNi43NXpNNiA4LjVhMi41IDIuNSAwIDAxMC01IDIuNSAyLjUgMCAwMTAgNXoiIGZpbGw9IiMwNTBGMTkiLz48L3N2Zz4=",
                class: "-gear-icon",
                title: "Expand",
              })
            )
          ),
          s &&
            s.length > 0 &&
            (0, c.h)(
              "div",
              { class: "-cbwsdk-snackbar-instance-menu" },
              s.map(function (e, t) {
                return (0,
                c.h)("div", { class: (0, o.default)("-cbwsdk-snackbar-instance-menu-item", e.isRed && "-cbwsdk-snackbar-instance-menu-item-is-red"), onClick: e.onClick, key: t }, (0, c.h)("svg", { width: e.svgWidth, height: e.svgHeight, viewBox: "0 0 10 11", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, (0, c.h)("path", { "fill-rule": e.defaultFillRule, "clip-rule": e.defaultClipRule, d: e.path, fill: "#AAAAAA" })), (0, c.h)("span", { class: (0, o.default)("-cbwsdk-snackbar-instance-menu-item-info", e.isRed && "-cbwsdk-snackbar-instance-menu-item-info-is-red") }, e.info));
              })
            )
        );
      };
    },
    96318: function (e, t, n) {
      "use strict";
      var r =
          (this && this.__createBinding) ||
          (Object.create
            ? function (e, t, n, r) {
                void 0 === r && (r = n);
                var s = Object.getOwnPropertyDescriptor(t, n);
                (s &&
                  !("get" in s
                    ? !t.__esModule
                    : s.writable || s.configurable)) ||
                  (s = {
                    enumerable: !0,
                    get: function () {
                      return t[n];
                    },
                  }),
                  Object.defineProperty(e, r, s);
              }
            : function (e, t, n, r) {
                void 0 === r && (r = n), (e[r] = t[n]);
              }),
        s =
          (this && this.__exportStar) ||
          function (e, t) {
            for (var n in e)
              "default" === n ||
                Object.prototype.hasOwnProperty.call(t, n) ||
                r(t, e, n);
          };
      Object.defineProperty(t, "__esModule", { value: !0 }), s(n(8379), t);
    },
    31609: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          ".-cbwsdk-css-reset .-cbwsdk-spinner{display:inline-block}.-cbwsdk-css-reset .-cbwsdk-spinner svg{display:inline-block;animation:2s linear infinite -cbwsdk-spinner-svg}.-cbwsdk-css-reset .-cbwsdk-spinner svg circle{animation:1.9s ease-in-out infinite both -cbwsdk-spinner-circle;display:block;fill:rgba(0,0,0,0);stroke-dasharray:283;stroke-dashoffset:280;stroke-linecap:round;stroke-width:10px;transform-origin:50% 50%}@keyframes -cbwsdk-spinner-svg{0%{transform:rotateZ(0deg)}100%{transform:rotateZ(360deg)}}@keyframes -cbwsdk-spinner-circle{0%,25%{stroke-dashoffset:280;transform:rotate(0)}50%,75%{stroke-dashoffset:75;transform:rotate(45deg)}100%{stroke-dashoffset:280;transform:rotate(360deg)}}");
    },
    26657: function (e, t, n) {
      "use strict";
      var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.Spinner = void 0);
      var s = n(51681),
        i = r(n(31609));
      t.Spinner = function (e) {
        var t,
          n = null !== (t = e.size) && void 0 !== t ? t : 64,
          r = e.color || "#000";
        return (0, s.h)(
          "div",
          { class: "-cbwsdk-spinner" },
          (0, s.h)("style", null, i.default),
          (0, s.h)(
            "svg",
            {
              viewBox: "0 0 100 100",
              xmlns: "http://www.w3.org/2000/svg",
              style: { width: n, height: n },
            },
            (0, s.h)("circle", { style: { cx: 50, cy: 50, r: 45, stroke: r } })
          )
        );
      };
    },
    69522: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default =
          ".-cbwsdk-css-reset .-cbwsdk-try-extension{display:flex;margin-top:12px;height:202px;width:700px;border-radius:12px;padding:30px}.-cbwsdk-css-reset .-cbwsdk-try-extension.light{background:#fff}.-cbwsdk-css-reset .-cbwsdk-try-extension.dark{background:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-try-extension-column-half{flex:50%}.-cbwsdk-css-reset .-cbwsdk-try-extension-heading{font-style:normal;font-weight:500;font-size:25px;line-height:32px;margin:0;max-width:204px}.-cbwsdk-css-reset .-cbwsdk-try-extension-heading.light{color:#0a0b0d}.-cbwsdk-css-reset .-cbwsdk-try-extension-heading.dark{color:#fff}.-cbwsdk-css-reset .-cbwsdk-try-extension-cta{appearance:none;border:none;background:none;color:#0052ff;cursor:pointer;padding:0;text-decoration:none;display:block;font-weight:600;font-size:16px;line-height:24px}.-cbwsdk-css-reset .-cbwsdk-try-extension-cta.light{color:#0052ff}.-cbwsdk-css-reset .-cbwsdk-try-extension-cta.dark{color:#588af5}.-cbwsdk-css-reset .-cbwsdk-try-extension-cta-wrapper{display:flex;align-items:center;margin-top:12px}.-cbwsdk-css-reset .-cbwsdk-try-extension-cta-icon{display:block;margin-left:4px;height:14px}.-cbwsdk-css-reset .-cbwsdk-try-extension-list{display:flex;flex-direction:column;justify-content:center;align-items:center;margin:0;padding:0;list-style:none;height:100%}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item{display:flex;align-items:center;flex-flow:nowrap;margin-top:24px}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item:first-of-type{margin-top:0}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-icon-wrapper{display:block}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-icon{display:flex;height:32px;width:32px;border-radius:50%}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-icon svg{margin:auto;display:block}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-icon.light{background:#eef0f3}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-icon.dark{background:#1e2025}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-copy{display:block;font-weight:400;font-size:14px;line-height:20px;padding-left:12px}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-copy.light{color:#5b636e}.-cbwsdk-css-reset .-cbwsdk-try-extension-list-item-copy.dark{color:#8a919e}");
    },
    99778: function (e, t, n) {
      "use strict";
      var r = n(27424).default,
        s =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.TryExtensionContent = void 0);
      var i = s(n(54080)),
        a = n(51681),
        o = n(22730),
        c = n(78158),
        u = n(47873),
        d = n(94719),
        l = s(n(69522));
      t.TryExtensionContent = function (e) {
        var t = e.theme,
          n = (0, o.useState)(!1),
          s = r(n, 2),
          h = s[0],
          f = s[1],
          p = (0, o.useCallback)(function () {
            window.open(
              "https://api.wallet.coinbase.com/rpc/v2/desktop/chrome",
              "_blank"
            );
          }, []),
          g = (0, o.useCallback)(
            function () {
              h ? window.location.reload() : (p(), f(!0));
            },
            [p, h]
          );
        return (0, a.h)(
          "div",
          { class: (0, i.default)("-cbwsdk-try-extension", t) },
          (0, a.h)("style", null, l.default),
          (0, a.h)(
            "div",
            { class: "-cbwsdk-try-extension-column-half" },
            (0, a.h)(
              "h3",
              { class: (0, i.default)("-cbwsdk-try-extension-heading", t) },
              "Or try the Coinbase Wallet browser extension"
            ),
            (0, a.h)(
              "div",
              { class: "-cbwsdk-try-extension-cta-wrapper" },
              (0, a.h)(
                "button",
                {
                  class: (0, i.default)("-cbwsdk-try-extension-cta", t),
                  onClick: g,
                },
                h ? "Refresh" : "Install"
              ),
              (0, a.h)(
                "div",
                null,
                !h &&
                  (0, a.h)(c.ArrowLeftIcon, {
                    class: "-cbwsdk-try-extension-cta-icon",
                    fill: "light" === t ? "#0052FF" : "#588AF5",
                  })
              )
            )
          ),
          (0, a.h)(
            "div",
            { class: "-cbwsdk-try-extension-column-half" },
            (0, a.h)(
              "ul",
              { class: "-cbwsdk-try-extension-list" },
              (0, a.h)(
                "li",
                { class: "-cbwsdk-try-extension-list-item" },
                (0, a.h)(
                  "div",
                  { class: "-cbwsdk-try-extension-list-item-icon-wrapper" },
                  (0, a.h)(
                    "span",
                    {
                      class: (0, i.default)(
                        "-cbwsdk-try-extension-list-item-icon",
                        t
                      ),
                    },
                    (0, a.h)(u.LaptopIcon, {
                      fill: "light" === t ? "#0A0B0D" : "#FFFFFF",
                    })
                  )
                ),
                (0, a.h)(
                  "div",
                  {
                    class: (0, i.default)(
                      "-cbwsdk-try-extension-list-item-copy",
                      t
                    ),
                  },
                  "Connect with dapps with just one click on your desktop browser"
                )
              ),
              (0, a.h)(
                "li",
                { class: "-cbwsdk-try-extension-list-item" },
                (0, a.h)(
                  "div",
                  { class: "-cbwsdk-try-extension-list-item-icon-wrapper" },
                  (0, a.h)(
                    "span",
                    {
                      class: (0, i.default)(
                        "-cbwsdk-try-extension-list-item-icon",
                        t
                      ),
                    },
                    (0, a.h)(d.SafeIcon, {
                      fill: "light" === t ? "#0A0B0D" : "#FFFFFF",
                    })
                  )
                ),
                (0, a.h)(
                  "div",
                  {
                    class: (0, i.default)(
                      "-cbwsdk-try-extension-list-item-copy",
                      t
                    ),
                  },
                  "Add an additional layer of security by using a supported Ledger hardware wallet"
                )
              )
            )
          )
        );
      };
    },
    78158: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ArrowLeftIcon = void 0);
      var r = n(51681);
      t.ArrowLeftIcon = function (e) {
        return (0, r.h)(
          "svg",
          Object.assign(
            {
              width: "16",
              height: "16",
              viewBox: "0 0 16 16",
              xmlns: "http://www.w3.org/2000/svg",
            },
            e
          ),
          (0, r.h)("path", {
            d: "M8.60675 0.155884L7.37816 1.28209L12.7723 7.16662H0V8.83328H12.6548L6.82149 14.6666L8 15.8451L15.8201 8.02501L8.60675 0.155884Z",
          })
        );
      };
    },
    96294: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.CloseIcon = void 0);
      var r = n(51681);
      t.CloseIcon = function (e) {
        return (0, r.h)(
          "svg",
          Object.assign(
            {
              width: "40",
              height: "40",
              viewBox: "0 0 40 40",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
            },
            e
          ),
          (0, r.h)("path", {
            d: "M13.7677 13L12.3535 14.4142L18.3535 20.4142L12.3535 26.4142L13.7677 27.8284L19.7677 21.8284L25.7677 27.8284L27.1819 26.4142L21.1819 20.4142L27.1819 14.4142L25.7677 13L19.7677 19L13.7677 13Z",
          })
        );
      };
    },
    34836: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.CoinbaseWalletRound = void 0);
      var r = n(51681);
      t.CoinbaseWalletRound = function (e) {
        return (0, r.h)(
          "svg",
          Object.assign(
            {
              width: "28",
              height: "28",
              viewBox: "0 0 28 28",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
            },
            e
          ),
          (0, r.h)("circle", { cx: "14", cy: "14", r: "14", fill: "#0052FF" }),
          (0, r.h)("path", {
            d: "M23.8521 14.0003C23.8521 19.455 19.455 23.8521 14.0003 23.8521C8.54559 23.8521 4.14844 19.455 4.14844 14.0003C4.14844 8.54559 8.54559 4.14844 14.0003 4.14844C19.455 4.14844 23.8521 8.54559 23.8521 14.0003Z",
            fill: "white",
          }),
          (0, r.h)("path", {
            d: "M11.1855 12.5042C11.1855 12.0477 11.1855 11.7942 11.2835 11.642C11.3814 11.4899 11.4793 11.3377 11.6261 11.287C11.8219 11.1855 12.0178 11.1855 12.5073 11.1855H15.4934C15.983 11.1855 16.1788 11.1855 16.3746 11.287C16.5215 11.3884 16.6683 11.4899 16.7173 11.642C16.8152 11.8449 16.8152 12.0477 16.8152 12.5042V15.4965C16.8152 15.953 16.8152 16.2066 16.7173 16.3587C16.6194 16.5109 16.5215 16.663 16.3746 16.7137C16.1788 16.8152 15.983 16.8152 15.4934 16.8152H12.5073C12.0178 16.8152 11.8219 16.8152 11.6261 16.7137C11.4793 16.6123 11.3324 16.5109 11.2835 16.3587C11.1855 16.1558 11.1855 15.953 11.1855 15.4965V12.5042Z",
            fill: "#0052FF",
          })
        );
      };
    },
    47873: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.LaptopIcon = void 0);
      var r = n(51681);
      t.LaptopIcon = function (e) {
        return (0, r.h)(
          "svg",
          Object.assign(
            {
              width: "14",
              height: "14",
              viewBox: "0 0 14 14",
              xmlns: "http://www.w3.org/2000/svg",
            },
            e
          ),
          (0, r.h)("path", {
            d: "M1.8001 2.2002H12.2001V9.40019H1.8001V2.2002ZM3.4001 3.8002V7.80019H10.6001V3.8002H3.4001Z",
          }),
          (0, r.h)("path", {
            d: "M13.4001 10.2002H0.600098C0.600098 11.0838 1.31644 11.8002 2.2001 11.8002H11.8001C12.6838 11.8002 13.4001 11.0838 13.4001 10.2002Z",
          })
        );
      };
    },
    46891: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.QRCodeIcon = void 0);
      var r = n(51681);
      t.QRCodeIcon = function (e) {
        return (0, r.h)(
          "svg",
          Object.assign(
            {
              width: "18",
              height: "18",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
            },
            e
          ),
          (0, r.h)("path", { d: "M3 3V8.99939L5 8.99996V5H9V3H3Z" }),
          (0, r.h)("path", { d: "M15 21L21 21V15.0006L19 15V19L15 19V21Z" }),
          (0, r.h)("path", { d: "M21 9H19V5H15.0006L15 3H21V9Z" }),
          (0, r.h)("path", { d: "M3 15V21H8.99939L8.99996 19H5L5 15H3Z" })
        );
      };
    },
    94719: function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.SafeIcon = void 0);
      var r = n(51681);
      t.SafeIcon = function (e) {
        return (0, r.h)(
          "svg",
          Object.assign(
            {
              width: "14",
              height: "14",
              viewBox: "0 0 14 14",
              xmlns: "http://www.w3.org/2000/svg",
            },
            e
          ),
          (0, r.h)("path", {
            "fill-rule": "evenodd",
            "clip-rule": "evenodd",
            d: "M0.600098 0.600098V11.8001H13.4001V0.600098H0.600098ZM7.0001 9.2001C5.3441 9.2001 4.0001 7.8561 4.0001 6.2001C4.0001 4.5441 5.3441 3.2001 7.0001 3.2001C8.6561 3.2001 10.0001 4.5441 10.0001 6.2001C10.0001 7.8561 8.6561 9.2001 7.0001 9.2001ZM0.600098 12.6001H3.8001V13.4001H0.600098V12.6001ZM10.2001 12.6001H13.4001V13.4001H10.2001V12.6001ZM8.8001 6.2001C8.8001 7.19421 7.99421 8.0001 7.0001 8.0001C6.00598 8.0001 5.2001 7.19421 5.2001 6.2001C5.2001 5.20598 6.00598 4.4001 7.0001 4.4001C7.99421 4.4001 8.8001 5.20598 8.8001 6.2001Z",
          })
        );
      };
    },
    37890: function (e, t, n) {
      var r = n(8901).Buffer,
        s = n(68858),
        i = n(43413);
      function a(e) {
        return e.startsWith("int[")
          ? "int256" + e.slice(3)
          : "int" === e
          ? "int256"
          : e.startsWith("uint[")
          ? "uint256" + e.slice(4)
          : "uint" === e
          ? "uint256"
          : e.startsWith("fixed[")
          ? "fixed128x128" + e.slice(5)
          : "fixed" === e
          ? "fixed128x128"
          : e.startsWith("ufixed[")
          ? "ufixed128x128" + e.slice(6)
          : "ufixed" === e
          ? "ufixed128x128"
          : e;
      }
      function o(e) {
        return parseInt(/^\D+(\d+)$/.exec(e)[1], 10);
      }
      function c(e) {
        var t = /^\D+(\d+)x(\d+)$/.exec(e);
        return [parseInt(t[1], 10), parseInt(t[2], 10)];
      }
      function u(e) {
        var t = e.match(/(.*)\[(.*?)\]$/);
        return t ? ("" === t[2] ? "dynamic" : parseInt(t[2], 10)) : null;
      }
      function d(e) {
        var t = typeof e;
        if ("string" === t)
          return s.isHexString(e)
            ? new i(s.stripHexPrefix(e), 16)
            : new i(e, 10);
        if ("number" === t) return new i(e);
        if (e.toArray) return e;
        throw new Error("Argument is not a number");
      }
      function l(e, t) {
        var n, a, h, f;
        if ("address" === e) return l("uint160", d(t));
        if ("bool" === e) return l("uint8", t ? 1 : 0);
        if ("string" === e) return l("bytes", new r(t, "utf8"));
        if (
          (function (e) {
            return e.lastIndexOf("]") === e.length - 1;
          })(e)
        ) {
          if ("undefined" === typeof t.length) throw new Error("Not an array?");
          if ("dynamic" !== (n = u(e)) && 0 !== n && t.length > n)
            throw new Error("Elements exceed array size: " + n);
          for (f in ((h = []),
          (e = e.slice(0, e.lastIndexOf("["))),
          "string" === typeof t && (t = JSON.parse(t)),
          t))
            h.push(l(e, t[f]));
          if ("dynamic" === n) {
            var p = l("uint256", t.length);
            h.unshift(p);
          }
          return r.concat(h);
        }
        if ("bytes" === e)
          return (
            (t = new r(t)),
            (h = r.concat([l("uint256", t.length), t])),
            t.length % 32 !== 0 &&
              (h = r.concat([h, s.zeros(32 - (t.length % 32))])),
            h
          );
        if (e.startsWith("bytes")) {
          if ((n = o(e)) < 1 || n > 32)
            throw new Error("Invalid bytes<N> width: " + n);
          return s.setLengthRight(t, 32);
        }
        if (e.startsWith("uint")) {
          if ((n = o(e)) % 8 || n < 8 || n > 256)
            throw new Error("Invalid uint<N> width: " + n);
          if ((a = d(t)).bitLength() > n)
            throw new Error(
              "Supplied uint exceeds width: " + n + " vs " + a.bitLength()
            );
          if (a < 0) throw new Error("Supplied uint is negative");
          return a.toArrayLike(r, "be", 32);
        }
        if (e.startsWith("int")) {
          if ((n = o(e)) % 8 || n < 8 || n > 256)
            throw new Error("Invalid int<N> width: " + n);
          if ((a = d(t)).bitLength() > n)
            throw new Error(
              "Supplied int exceeds width: " + n + " vs " + a.bitLength()
            );
          return a.toTwos(256).toArrayLike(r, "be", 32);
        }
        if (e.startsWith("ufixed")) {
          if (((n = c(e)), (a = d(t)) < 0))
            throw new Error("Supplied ufixed is negative");
          return l("uint256", a.mul(new i(2).pow(new i(n[1]))));
        }
        if (e.startsWith("fixed"))
          return (n = c(e)), l("int256", d(t).mul(new i(2).pow(new i(n[1]))));
        throw new Error("Unsupported or invalid type: " + e);
      }
      function h(e) {
        return "string" === e || "bytes" === e || "dynamic" === u(e);
      }
      function f(e, t) {
        if (e.length !== t.length)
          throw new Error("Number of types are not matching the values");
        for (var n, i, c = [], u = 0; u < e.length; u++) {
          var l = a(e[u]),
            h = t[u];
          if ("bytes" === l) c.push(h);
          else if ("string" === l) c.push(new r(h, "utf8"));
          else if ("bool" === l) c.push(new r(h ? "01" : "00", "hex"));
          else if ("address" === l) c.push(s.setLength(h, 20));
          else if (l.startsWith("bytes")) {
            if ((n = o(l)) < 1 || n > 32)
              throw new Error("Invalid bytes<N> width: " + n);
            c.push(s.setLengthRight(h, n));
          } else if (l.startsWith("uint")) {
            if ((n = o(l)) % 8 || n < 8 || n > 256)
              throw new Error("Invalid uint<N> width: " + n);
            if ((i = d(h)).bitLength() > n)
              throw new Error(
                "Supplied uint exceeds width: " + n + " vs " + i.bitLength()
              );
            c.push(i.toArrayLike(r, "be", n / 8));
          } else {
            if (!l.startsWith("int"))
              throw new Error("Unsupported or invalid type: " + l);
            if ((n = o(l)) % 8 || n < 8 || n > 256)
              throw new Error("Invalid int<N> width: " + n);
            if ((i = d(h)).bitLength() > n)
              throw new Error(
                "Supplied int exceeds width: " + n + " vs " + i.bitLength()
              );
            c.push(i.toTwos(n).toArrayLike(r, "be", n / 8));
          }
        }
        return r.concat(c);
      }
      e.exports = {
        rawEncode: function (e, t) {
          var n = [],
            s = [],
            i = 32 * e.length;
          for (var o in e) {
            var c = a(e[o]),
              u = l(c, t[o]);
            h(c)
              ? (n.push(l("uint256", i)), s.push(u), (i += u.length))
              : n.push(u);
          }
          return r.concat(n.concat(s));
        },
        solidityPack: f,
        soliditySHA3: function (e, t) {
          return s.keccak(f(e, t));
        },
      };
    },
    73297: function (e, t, n) {
      var r = n(8901).Buffer,
        s = n(74704).default,
        i = n(27424).default,
        a = n(68858),
        o = n(37890),
        c = {
          type: "object",
          properties: {
            types: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                  },
                  required: ["name", "type"],
                },
              },
            },
            primaryType: { type: "string" },
            domain: { type: "object" },
            message: { type: "object" },
          },
          required: ["types", "primaryType", "domain", "message"],
        },
        u = {
          encodeData: function (e, t, n) {
            var c = this,
              u =
                !(arguments.length > 3 && void 0 !== arguments[3]) ||
                arguments[3],
              d = ["bytes32"],
              l = [this.hashType(e, n)];
            if (u) {
              var h,
                f = function e(t, s, d) {
                  if (void 0 !== n[s])
                    return [
                      "bytes32",
                      null == d
                        ? "0x0000000000000000000000000000000000000000000000000000000000000000"
                        : a.keccak(c.encodeData(s, d, n, u)),
                    ];
                  if (void 0 === d)
                    throw new Error(
                      "missing value for field "
                        .concat(t, " of type ")
                        .concat(s)
                    );
                  if ("bytes" === s) return ["bytes32", a.keccak(d)];
                  if ("string" === s)
                    return (
                      "string" === typeof d && (d = r.from(d, "utf8")),
                      ["bytes32", a.keccak(d)]
                    );
                  if (s.lastIndexOf("]") === s.length - 1) {
                    var l = s.slice(0, s.lastIndexOf("[")),
                      h = d.map(function (n) {
                        return e(t, l, n);
                      });
                    return [
                      "bytes32",
                      a.keccak(
                        o.rawEncode(
                          h.map(function (e) {
                            return i(e, 1)[0];
                          }),
                          h.map(function (e) {
                            return i(e, 2)[1];
                          })
                        )
                      ),
                    ];
                  }
                  return [s, d];
                },
                p = s(n[e]);
              try {
                for (p.s(); !(h = p.n()).done; ) {
                  var g = h.value,
                    v = f(g.name, g.type, t[g.name]),
                    m = i(v, 2),
                    b = m[0],
                    w = m[1];
                  d.push(b), l.push(w);
                }
              } catch (C) {
                p.e(C);
              } finally {
                p.f();
              }
            } else {
              var k,
                y = s(n[e]);
              try {
                for (y.s(); !(k = y.n()).done; ) {
                  var E = k.value,
                    x = t[E.name];
                  if (void 0 !== x)
                    if ("bytes" === E.type)
                      d.push("bytes32"), (x = a.keccak(x)), l.push(x);
                    else if ("string" === E.type)
                      d.push("bytes32"),
                        "string" === typeof x && (x = r.from(x, "utf8")),
                        (x = a.keccak(x)),
                        l.push(x);
                    else if (void 0 !== n[E.type])
                      d.push("bytes32"),
                        (x = a.keccak(this.encodeData(E.type, x, n, u))),
                        l.push(x);
                    else {
                      if (E.type.lastIndexOf("]") === E.type.length - 1)
                        throw new Error(
                          "Arrays currently unimplemented in encodeData"
                        );
                      d.push(E.type), l.push(x);
                    }
                }
              } catch (C) {
                y.e(C);
              } finally {
                y.f();
              }
            }
            return o.rawEncode(d, l);
          },
          encodeType: function (e, t) {
            var n = "",
              r = this.findTypeDependencies(e, t).filter(function (t) {
                return t !== e;
              });
            r = [e].concat(r.sort());
            var i,
              a = s(r);
            try {
              for (a.s(); !(i = a.n()).done; ) {
                var o = i.value;
                if (!t[o])
                  throw new Error("No type definition specified: " + o);
                n +=
                  o +
                  "(" +
                  t[o]
                    .map(function (e) {
                      var t = e.name;
                      return e.type + " " + t;
                    })
                    .join(",") +
                  ")";
              }
            } catch (c) {
              a.e(c);
            } finally {
              a.f();
            }
            return n;
          },
          findTypeDependencies: function (e, t) {
            var n =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : [];
            if (((e = e.match(/^\w*/)[0]), n.includes(e) || void 0 === t[e]))
              return n;
            n.push(e);
            var r,
              i = s(t[e]);
            try {
              for (i.s(); !(r = i.n()).done; ) {
                var a,
                  o = r.value,
                  c = s(this.findTypeDependencies(o.type, t, n));
                try {
                  for (c.s(); !(a = c.n()).done; ) {
                    var u = a.value;
                    !n.includes(u) && n.push(u);
                  }
                } catch (d) {
                  c.e(d);
                } finally {
                  c.f();
                }
              }
            } catch (d) {
              i.e(d);
            } finally {
              i.f();
            }
            return n;
          },
          hashStruct: function (e, t, n) {
            var r =
              !(arguments.length > 3 && void 0 !== arguments[3]) ||
              arguments[3];
            return a.keccak(this.encodeData(e, t, n, r));
          },
          hashType: function (e, t) {
            return a.keccak(this.encodeType(e, t));
          },
          sanitizeData: function (e) {
            var t = {};
            for (var n in c.properties) e[n] && (t[n] = e[n]);
            return (
              t.types &&
                (t.types = Object.assign({ EIP712Domain: [] }, t.types)),
              t
            );
          },
          hash: function (e) {
            var t =
                !(arguments.length > 1 && void 0 !== arguments[1]) ||
                arguments[1],
              n = this.sanitizeData(e),
              s = [r.from("1901", "hex")];
            return (
              s.push(this.hashStruct("EIP712Domain", n.domain, n.types, t)),
              "EIP712Domain" !== n.primaryType &&
                s.push(this.hashStruct(n.primaryType, n.message, n.types, t)),
              a.keccak(r.concat(s))
            );
          },
        };
      e.exports = {
        TYPED_MESSAGE_SCHEMA: c,
        TypedDataUtils: u,
        hashForSignTypedDataLegacy: function (e) {
          return (function (e) {
            var t = new Error("Expect argument to be non-empty array");
            if ("object" !== typeof e || !e.length) throw t;
            var n = e.map(function (e) {
                return "bytes" === e.type ? a.toBuffer(e.value) : e.value;
              }),
              r = e.map(function (e) {
                return e.type;
              }),
              s = e.map(function (e) {
                if (!e.name) throw t;
                return e.type + " " + e.name;
              });
            return o.soliditySHA3(
              ["bytes32", "bytes32"],
              [
                o.soliditySHA3(new Array(e.length).fill("string"), s),
                o.soliditySHA3(r, n),
              ]
            );
          })(e.data);
        },
        hashForSignTypedData_v3: function (e) {
          return u.hash(e.data, !1);
        },
        hashForSignTypedData_v4: function (e) {
          return u.hash(e.data);
        },
      };
    },
    68858: function (e, t, n) {
      var r = n(8901).Buffer,
        s = n(71427),
        i = n(43413);
      function a(e) {
        return r.allocUnsafe(e).fill(0);
      }
      function o(e, t, n) {
        var r = a(t);
        return (
          (e = c(e)),
          n
            ? e.length < t
              ? (e.copy(r), r)
              : e.slice(0, t)
            : e.length < t
            ? (e.copy(r, t - e.length), r)
            : e.slice(-t)
        );
      }
      function c(e) {
        if (!r.isBuffer(e))
          if (Array.isArray(e)) e = r.from(e);
          else if ("string" === typeof e)
            e = u(e)
              ? r.from((t = d(e)).length % 2 ? "0" + t : t, "hex")
              : r.from(e);
          else if ("number" === typeof e) e = intToBuffer(e);
          else if (null === e || void 0 === e) e = r.allocUnsafe(0);
          else if (i.isBN(e)) e = e.toArrayLike(r);
          else {
            if (!e.toArray) throw new Error("invalid type");
            e = r.from(e.toArray());
          }
        var t;
        return e;
      }
      function u(e) {
        return "string" === typeof e && e.match(/^0x[0-9A-Fa-f]*$/);
      }
      function d(e) {
        return "string" === typeof e && e.startsWith("0x") ? e.slice(2) : e;
      }
      e.exports = {
        zeros: a,
        setLength: o,
        setLengthRight: function (e, t) {
          return o(e, t, !0);
        },
        isHexString: u,
        stripHexPrefix: d,
        toBuffer: c,
        bufferToHex: function (e) {
          return "0x" + (e = c(e)).toString("hex");
        },
        keccak: function (e, t) {
          return (
            (e = c(e)),
            t || (t = 256),
            s("keccak" + t)
              .update(e)
              .digest()
          );
        },
      };
    },
    48012: function (e) {
      function t(e) {
        (this.mode = r.MODE_8BIT_BYTE), (this.data = e), (this.parsedData = []);
        for (var t = 0, n = this.data.length; t < n; t++) {
          var s = [],
            i = this.data.charCodeAt(t);
          i > 65536
            ? ((s[0] = 240 | ((1835008 & i) >>> 18)),
              (s[1] = 128 | ((258048 & i) >>> 12)),
              (s[2] = 128 | ((4032 & i) >>> 6)),
              (s[3] = 128 | (63 & i)))
            : i > 2048
            ? ((s[0] = 224 | ((61440 & i) >>> 12)),
              (s[1] = 128 | ((4032 & i) >>> 6)),
              (s[2] = 128 | (63 & i)))
            : i > 128
            ? ((s[0] = 192 | ((1984 & i) >>> 6)), (s[1] = 128 | (63 & i)))
            : (s[0] = i),
            this.parsedData.push(s);
        }
        (this.parsedData = Array.prototype.concat.apply([], this.parsedData)),
          this.parsedData.length != this.data.length &&
            (this.parsedData.unshift(191),
            this.parsedData.unshift(187),
            this.parsedData.unshift(239));
      }
      function n(e, t) {
        (this.typeNumber = e),
          (this.errorCorrectLevel = t),
          (this.modules = null),
          (this.moduleCount = 0),
          (this.dataCache = null),
          (this.dataList = []);
      }
      (t.prototype = {
        getLength: function (e) {
          return this.parsedData.length;
        },
        write: function (e) {
          for (var t = 0, n = this.parsedData.length; t < n; t++)
            e.put(this.parsedData[t], 8);
        },
      }),
        (n.prototype = {
          addData: function (e) {
            var n = new t(e);
            this.dataList.push(n), (this.dataCache = null);
          },
          isDark: function (e, t) {
            if (
              e < 0 ||
              this.moduleCount <= e ||
              t < 0 ||
              this.moduleCount <= t
            )
              throw new Error(e + "," + t);
            return this.modules[e][t];
          },
          getModuleCount: function () {
            return this.moduleCount;
          },
          make: function () {
            this.makeImpl(!1, this.getBestMaskPattern());
          },
          makeImpl: function (e, t) {
            (this.moduleCount = 4 * this.typeNumber + 17),
              (this.modules = new Array(this.moduleCount));
            for (var r = 0; r < this.moduleCount; r++) {
              this.modules[r] = new Array(this.moduleCount);
              for (var s = 0; s < this.moduleCount; s++)
                this.modules[r][s] = null;
            }
            this.setupPositionProbePattern(0, 0),
              this.setupPositionProbePattern(this.moduleCount - 7, 0),
              this.setupPositionProbePattern(0, this.moduleCount - 7),
              this.setupPositionAdjustPattern(),
              this.setupTimingPattern(),
              this.setupTypeInfo(e, t),
              this.typeNumber >= 7 && this.setupTypeNumber(e),
              null == this.dataCache &&
                (this.dataCache = n.createData(
                  this.typeNumber,
                  this.errorCorrectLevel,
                  this.dataList
                )),
              this.mapData(this.dataCache, t);
          },
          setupPositionProbePattern: function (e, t) {
            for (var n = -1; n <= 7; n++)
              if (!(e + n <= -1 || this.moduleCount <= e + n))
                for (var r = -1; r <= 7; r++)
                  t + r <= -1 ||
                    this.moduleCount <= t + r ||
                    (this.modules[e + n][t + r] =
                      (0 <= n && n <= 6 && (0 == r || 6 == r)) ||
                      (0 <= r && r <= 6 && (0 == n || 6 == n)) ||
                      (2 <= n && n <= 4 && 2 <= r && r <= 4));
          },
          getBestMaskPattern: function () {
            for (var e = 0, t = 0, n = 0; n < 8; n++) {
              this.makeImpl(!0, n);
              var r = v.getLostPoint(this);
              (0 == n || e > r) && ((e = r), (t = n));
            }
            return t;
          },
          createMovieClip: function (e, t, n) {
            var r = e.createEmptyMovieClip(t, n);
            this.make();
            for (var s = 0; s < this.modules.length; s++)
              for (var i = 1 * s, a = 0; a < this.modules[s].length; a++) {
                var o = 1 * a;
                this.modules[s][a] &&
                  (r.beginFill(0, 100),
                  r.moveTo(o, i),
                  r.lineTo(o + 1, i),
                  r.lineTo(o + 1, i + 1),
                  r.lineTo(o, i + 1),
                  r.endFill());
              }
            return r;
          },
          setupTimingPattern: function () {
            for (var e = 8; e < this.moduleCount - 8; e++)
              null == this.modules[e][6] && (this.modules[e][6] = e % 2 == 0);
            for (var t = 8; t < this.moduleCount - 8; t++)
              null == this.modules[6][t] && (this.modules[6][t] = t % 2 == 0);
          },
          setupPositionAdjustPattern: function () {
            for (
              var e = v.getPatternPosition(this.typeNumber), t = 0;
              t < e.length;
              t++
            )
              for (var n = 0; n < e.length; n++) {
                var r = e[t],
                  s = e[n];
                if (null == this.modules[r][s])
                  for (var i = -2; i <= 2; i++)
                    for (var a = -2; a <= 2; a++)
                      this.modules[r + i][s + a] =
                        -2 == i ||
                        2 == i ||
                        -2 == a ||
                        2 == a ||
                        (0 == i && 0 == a);
              }
          },
          setupTypeNumber: function (e) {
            for (
              var t = v.getBCHTypeNumber(this.typeNumber), n = 0;
              n < 18;
              n++
            ) {
              var r = !e && 1 == ((t >> n) & 1);
              this.modules[Math.floor(n / 3)][
                (n % 3) + this.moduleCount - 8 - 3
              ] = r;
            }
            for (n = 0; n < 18; n++) {
              r = !e && 1 == ((t >> n) & 1);
              this.modules[(n % 3) + this.moduleCount - 8 - 3][
                Math.floor(n / 3)
              ] = r;
            }
          },
          setupTypeInfo: function (e, t) {
            for (
              var n = (this.errorCorrectLevel << 3) | t,
                r = v.getBCHTypeInfo(n),
                s = 0;
              s < 15;
              s++
            ) {
              var i = !e && 1 == ((r >> s) & 1);
              s < 6
                ? (this.modules[s][8] = i)
                : s < 8
                ? (this.modules[s + 1][8] = i)
                : (this.modules[this.moduleCount - 15 + s][8] = i);
            }
            for (s = 0; s < 15; s++) {
              i = !e && 1 == ((r >> s) & 1);
              s < 8
                ? (this.modules[8][this.moduleCount - s - 1] = i)
                : s < 9
                ? (this.modules[8][15 - s - 1 + 1] = i)
                : (this.modules[8][15 - s - 1] = i);
            }
            this.modules[this.moduleCount - 8][8] = !e;
          },
          mapData: function (e, t) {
            for (
              var n = -1,
                r = this.moduleCount - 1,
                s = 7,
                i = 0,
                a = this.moduleCount - 1;
              a > 0;
              a -= 2
            )
              for (6 == a && a--; ; ) {
                for (var o = 0; o < 2; o++)
                  if (null == this.modules[r][a - o]) {
                    var c = !1;
                    i < e.length && (c = 1 == ((e[i] >>> s) & 1)),
                      v.getMask(t, r, a - o) && (c = !c),
                      (this.modules[r][a - o] = c),
                      -1 == --s && (i++, (s = 7));
                  }
                if ((r += n) < 0 || this.moduleCount <= r) {
                  (r -= n), (n = -n);
                  break;
                }
              }
          },
        }),
        (n.PAD0 = 236),
        (n.PAD1 = 17),
        (n.createData = function (e, t, r) {
          for (
            var s = k.getRSBlocks(e, t), i = new y(), a = 0;
            a < r.length;
            a++
          ) {
            var o = r[a];
            i.put(o.mode, 4),
              i.put(o.getLength(), v.getLengthInBits(o.mode, e)),
              o.write(i);
          }
          var c = 0;
          for (a = 0; a < s.length; a++) c += s[a].dataCount;
          if (i.getLengthInBits() > 8 * c)
            throw new Error(
              "code length overflow. (" +
                i.getLengthInBits() +
                ">" +
                8 * c +
                ")"
            );
          for (
            i.getLengthInBits() + 4 <= 8 * c && i.put(0, 4);
            i.getLengthInBits() % 8 != 0;

          )
            i.putBit(!1);
          for (
            ;
            !(i.getLengthInBits() >= 8 * c) &&
            (i.put(n.PAD0, 8), !(i.getLengthInBits() >= 8 * c));

          )
            i.put(n.PAD1, 8);
          return n.createBytes(i, s);
        }),
        (n.createBytes = function (e, t) {
          for (
            var n = 0,
              r = 0,
              s = 0,
              i = new Array(t.length),
              a = new Array(t.length),
              o = 0;
            o < t.length;
            o++
          ) {
            var c = t[o].dataCount,
              u = t[o].totalCount - c;
            (r = Math.max(r, c)), (s = Math.max(s, u)), (i[o] = new Array(c));
            for (var d = 0; d < i[o].length; d++)
              i[o][d] = 255 & e.buffer[d + n];
            n += c;
            var l = v.getErrorCorrectPolynomial(u),
              h = new w(i[o], l.getLength() - 1).mod(l);
            a[o] = new Array(l.getLength() - 1);
            for (d = 0; d < a[o].length; d++) {
              var f = d + h.getLength() - a[o].length;
              a[o][d] = f >= 0 ? h.get(f) : 0;
            }
          }
          var p = 0;
          for (d = 0; d < t.length; d++) p += t[d].totalCount;
          var g = new Array(p),
            m = 0;
          for (d = 0; d < r; d++)
            for (o = 0; o < t.length; o++)
              d < i[o].length && (g[m++] = i[o][d]);
          for (d = 0; d < s; d++)
            for (o = 0; o < t.length; o++)
              d < a[o].length && (g[m++] = a[o][d]);
          return g;
        });
      for (
        var r = {
            MODE_NUMBER: 1,
            MODE_ALPHA_NUM: 2,
            MODE_8BIT_BYTE: 4,
            MODE_KANJI: 8,
          },
          s = 1,
          i = 0,
          a = 3,
          o = 2,
          c = 0,
          u = 1,
          d = 2,
          l = 3,
          h = 4,
          f = 5,
          p = 6,
          g = 7,
          v = {
            PATTERN_POSITION_TABLE: [
              [],
              [6, 18],
              [6, 22],
              [6, 26],
              [6, 30],
              [6, 34],
              [6, 22, 38],
              [6, 24, 42],
              [6, 26, 46],
              [6, 28, 50],
              [6, 30, 54],
              [6, 32, 58],
              [6, 34, 62],
              [6, 26, 46, 66],
              [6, 26, 48, 70],
              [6, 26, 50, 74],
              [6, 30, 54, 78],
              [6, 30, 56, 82],
              [6, 30, 58, 86],
              [6, 34, 62, 90],
              [6, 28, 50, 72, 94],
              [6, 26, 50, 74, 98],
              [6, 30, 54, 78, 102],
              [6, 28, 54, 80, 106],
              [6, 32, 58, 84, 110],
              [6, 30, 58, 86, 114],
              [6, 34, 62, 90, 118],
              [6, 26, 50, 74, 98, 122],
              [6, 30, 54, 78, 102, 126],
              [6, 26, 52, 78, 104, 130],
              [6, 30, 56, 82, 108, 134],
              [6, 34, 60, 86, 112, 138],
              [6, 30, 58, 86, 114, 142],
              [6, 34, 62, 90, 118, 146],
              [6, 30, 54, 78, 102, 126, 150],
              [6, 24, 50, 76, 102, 128, 154],
              [6, 28, 54, 80, 106, 132, 158],
              [6, 32, 58, 84, 110, 136, 162],
              [6, 26, 54, 82, 110, 138, 166],
              [6, 30, 58, 86, 114, 142, 170],
            ],
            G15: 1335,
            G18: 7973,
            G15_MASK: 21522,
            getBCHTypeInfo: function (e) {
              for (
                var t = e << 10;
                v.getBCHDigit(t) - v.getBCHDigit(v.G15) >= 0;

              )
                t ^= v.G15 << (v.getBCHDigit(t) - v.getBCHDigit(v.G15));
              return ((e << 10) | t) ^ v.G15_MASK;
            },
            getBCHTypeNumber: function (e) {
              for (
                var t = e << 12;
                v.getBCHDigit(t) - v.getBCHDigit(v.G18) >= 0;

              )
                t ^= v.G18 << (v.getBCHDigit(t) - v.getBCHDigit(v.G18));
              return (e << 12) | t;
            },
            getBCHDigit: function (e) {
              for (var t = 0; 0 != e; ) t++, (e >>>= 1);
              return t;
            },
            getPatternPosition: function (e) {
              return v.PATTERN_POSITION_TABLE[e - 1];
            },
            getMask: function (e, t, n) {
              switch (e) {
                case c:
                  return (t + n) % 2 == 0;
                case u:
                  return t % 2 == 0;
                case d:
                  return n % 3 == 0;
                case l:
                  return (t + n) % 3 == 0;
                case h:
                  return (Math.floor(t / 2) + Math.floor(n / 3)) % 2 == 0;
                case f:
                  return ((t * n) % 2) + ((t * n) % 3) == 0;
                case p:
                  return (((t * n) % 2) + ((t * n) % 3)) % 2 == 0;
                case g:
                  return (((t * n) % 3) + ((t + n) % 2)) % 2 == 0;
                default:
                  throw new Error("bad maskPattern:" + e);
              }
            },
            getErrorCorrectPolynomial: function (e) {
              for (var t = new w([1], 0), n = 0; n < e; n++)
                t = t.multiply(new w([1, m.gexp(n)], 0));
              return t;
            },
            getLengthInBits: function (e, t) {
              if (1 <= t && t < 10)
                switch (e) {
                  case r.MODE_NUMBER:
                    return 10;
                  case r.MODE_ALPHA_NUM:
                    return 9;
                  case r.MODE_8BIT_BYTE:
                  case r.MODE_KANJI:
                    return 8;
                  default:
                    throw new Error("mode:" + e);
                }
              else if (t < 27)
                switch (e) {
                  case r.MODE_NUMBER:
                    return 12;
                  case r.MODE_ALPHA_NUM:
                    return 11;
                  case r.MODE_8BIT_BYTE:
                    return 16;
                  case r.MODE_KANJI:
                    return 10;
                  default:
                    throw new Error("mode:" + e);
                }
              else {
                if (!(t < 41)) throw new Error("type:" + t);
                switch (e) {
                  case r.MODE_NUMBER:
                    return 14;
                  case r.MODE_ALPHA_NUM:
                    return 13;
                  case r.MODE_8BIT_BYTE:
                    return 16;
                  case r.MODE_KANJI:
                    return 12;
                  default:
                    throw new Error("mode:" + e);
                }
              }
            },
            getLostPoint: function (e) {
              for (var t = e.getModuleCount(), n = 0, r = 0; r < t; r++)
                for (var s = 0; s < t; s++) {
                  for (var i = 0, a = e.isDark(r, s), o = -1; o <= 1; o++)
                    if (!(r + o < 0 || t <= r + o))
                      for (var c = -1; c <= 1; c++)
                        s + c < 0 ||
                          t <= s + c ||
                          (0 == o && 0 == c) ||
                          (a == e.isDark(r + o, s + c) && i++);
                  i > 5 && (n += 3 + i - 5);
                }
              for (r = 0; r < t - 1; r++)
                for (s = 0; s < t - 1; s++) {
                  var u = 0;
                  e.isDark(r, s) && u++,
                    e.isDark(r + 1, s) && u++,
                    e.isDark(r, s + 1) && u++,
                    e.isDark(r + 1, s + 1) && u++,
                    (0 != u && 4 != u) || (n += 3);
                }
              for (r = 0; r < t; r++)
                for (s = 0; s < t - 6; s++)
                  e.isDark(r, s) &&
                    !e.isDark(r, s + 1) &&
                    e.isDark(r, s + 2) &&
                    e.isDark(r, s + 3) &&
                    e.isDark(r, s + 4) &&
                    !e.isDark(r, s + 5) &&
                    e.isDark(r, s + 6) &&
                    (n += 40);
              for (s = 0; s < t; s++)
                for (r = 0; r < t - 6; r++)
                  e.isDark(r, s) &&
                    !e.isDark(r + 1, s) &&
                    e.isDark(r + 2, s) &&
                    e.isDark(r + 3, s) &&
                    e.isDark(r + 4, s) &&
                    !e.isDark(r + 5, s) &&
                    e.isDark(r + 6, s) &&
                    (n += 40);
              var d = 0;
              for (s = 0; s < t; s++)
                for (r = 0; r < t; r++) e.isDark(r, s) && d++;
              return (n += 10 * (Math.abs((100 * d) / t / t - 50) / 5));
            },
          },
          m = {
            glog: function (e) {
              if (e < 1) throw new Error("glog(" + e + ")");
              return m.LOG_TABLE[e];
            },
            gexp: function (e) {
              for (; e < 0; ) e += 255;
              for (; e >= 256; ) e -= 255;
              return m.EXP_TABLE[e];
            },
            EXP_TABLE: new Array(256),
            LOG_TABLE: new Array(256),
          },
          b = 0;
        b < 8;
        b++
      )
        m.EXP_TABLE[b] = 1 << b;
      for (b = 8; b < 256; b++)
        m.EXP_TABLE[b] =
          m.EXP_TABLE[b - 4] ^
          m.EXP_TABLE[b - 5] ^
          m.EXP_TABLE[b - 6] ^
          m.EXP_TABLE[b - 8];
      for (b = 0; b < 255; b++) m.LOG_TABLE[m.EXP_TABLE[b]] = b;
      function w(e, t) {
        if (void 0 == e.length) throw new Error(e.length + "/" + t);
        for (var n = 0; n < e.length && 0 == e[n]; ) n++;
        this.num = new Array(e.length - n + t);
        for (var r = 0; r < e.length - n; r++) this.num[r] = e[r + n];
      }
      function k(e, t) {
        (this.totalCount = e), (this.dataCount = t);
      }
      function y() {
        (this.buffer = []), (this.length = 0);
      }
      (w.prototype = {
        get: function (e) {
          return this.num[e];
        },
        getLength: function () {
          return this.num.length;
        },
        multiply: function (e) {
          for (
            var t = new Array(this.getLength() + e.getLength() - 1), n = 0;
            n < this.getLength();
            n++
          )
            for (var r = 0; r < e.getLength(); r++)
              t[n + r] ^= m.gexp(m.glog(this.get(n)) + m.glog(e.get(r)));
          return new w(t, 0);
        },
        mod: function (e) {
          if (this.getLength() - e.getLength() < 0) return this;
          for (
            var t = m.glog(this.get(0)) - m.glog(e.get(0)),
              n = new Array(this.getLength()),
              r = 0;
            r < this.getLength();
            r++
          )
            n[r] = this.get(r);
          for (r = 0; r < e.getLength(); r++)
            n[r] ^= m.gexp(m.glog(e.get(r)) + t);
          return new w(n, 0).mod(e);
        },
      }),
        (k.RS_BLOCK_TABLE = [
          [1, 26, 19],
          [1, 26, 16],
          [1, 26, 13],
          [1, 26, 9],
          [1, 44, 34],
          [1, 44, 28],
          [1, 44, 22],
          [1, 44, 16],
          [1, 70, 55],
          [1, 70, 44],
          [2, 35, 17],
          [2, 35, 13],
          [1, 100, 80],
          [2, 50, 32],
          [2, 50, 24],
          [4, 25, 9],
          [1, 134, 108],
          [2, 67, 43],
          [2, 33, 15, 2, 34, 16],
          [2, 33, 11, 2, 34, 12],
          [2, 86, 68],
          [4, 43, 27],
          [4, 43, 19],
          [4, 43, 15],
          [2, 98, 78],
          [4, 49, 31],
          [2, 32, 14, 4, 33, 15],
          [4, 39, 13, 1, 40, 14],
          [2, 121, 97],
          [2, 60, 38, 2, 61, 39],
          [4, 40, 18, 2, 41, 19],
          [4, 40, 14, 2, 41, 15],
          [2, 146, 116],
          [3, 58, 36, 2, 59, 37],
          [4, 36, 16, 4, 37, 17],
          [4, 36, 12, 4, 37, 13],
          [2, 86, 68, 2, 87, 69],
          [4, 69, 43, 1, 70, 44],
          [6, 43, 19, 2, 44, 20],
          [6, 43, 15, 2, 44, 16],
          [4, 101, 81],
          [1, 80, 50, 4, 81, 51],
          [4, 50, 22, 4, 51, 23],
          [3, 36, 12, 8, 37, 13],
          [2, 116, 92, 2, 117, 93],
          [6, 58, 36, 2, 59, 37],
          [4, 46, 20, 6, 47, 21],
          [7, 42, 14, 4, 43, 15],
          [4, 133, 107],
          [8, 59, 37, 1, 60, 38],
          [8, 44, 20, 4, 45, 21],
          [12, 33, 11, 4, 34, 12],
          [3, 145, 115, 1, 146, 116],
          [4, 64, 40, 5, 65, 41],
          [11, 36, 16, 5, 37, 17],
          [11, 36, 12, 5, 37, 13],
          [5, 109, 87, 1, 110, 88],
          [5, 65, 41, 5, 66, 42],
          [5, 54, 24, 7, 55, 25],
          [11, 36, 12],
          [5, 122, 98, 1, 123, 99],
          [7, 73, 45, 3, 74, 46],
          [15, 43, 19, 2, 44, 20],
          [3, 45, 15, 13, 46, 16],
          [1, 135, 107, 5, 136, 108],
          [10, 74, 46, 1, 75, 47],
          [1, 50, 22, 15, 51, 23],
          [2, 42, 14, 17, 43, 15],
          [5, 150, 120, 1, 151, 121],
          [9, 69, 43, 4, 70, 44],
          [17, 50, 22, 1, 51, 23],
          [2, 42, 14, 19, 43, 15],
          [3, 141, 113, 4, 142, 114],
          [3, 70, 44, 11, 71, 45],
          [17, 47, 21, 4, 48, 22],
          [9, 39, 13, 16, 40, 14],
          [3, 135, 107, 5, 136, 108],
          [3, 67, 41, 13, 68, 42],
          [15, 54, 24, 5, 55, 25],
          [15, 43, 15, 10, 44, 16],
          [4, 144, 116, 4, 145, 117],
          [17, 68, 42],
          [17, 50, 22, 6, 51, 23],
          [19, 46, 16, 6, 47, 17],
          [2, 139, 111, 7, 140, 112],
          [17, 74, 46],
          [7, 54, 24, 16, 55, 25],
          [34, 37, 13],
          [4, 151, 121, 5, 152, 122],
          [4, 75, 47, 14, 76, 48],
          [11, 54, 24, 14, 55, 25],
          [16, 45, 15, 14, 46, 16],
          [6, 147, 117, 4, 148, 118],
          [6, 73, 45, 14, 74, 46],
          [11, 54, 24, 16, 55, 25],
          [30, 46, 16, 2, 47, 17],
          [8, 132, 106, 4, 133, 107],
          [8, 75, 47, 13, 76, 48],
          [7, 54, 24, 22, 55, 25],
          [22, 45, 15, 13, 46, 16],
          [10, 142, 114, 2, 143, 115],
          [19, 74, 46, 4, 75, 47],
          [28, 50, 22, 6, 51, 23],
          [33, 46, 16, 4, 47, 17],
          [8, 152, 122, 4, 153, 123],
          [22, 73, 45, 3, 74, 46],
          [8, 53, 23, 26, 54, 24],
          [12, 45, 15, 28, 46, 16],
          [3, 147, 117, 10, 148, 118],
          [3, 73, 45, 23, 74, 46],
          [4, 54, 24, 31, 55, 25],
          [11, 45, 15, 31, 46, 16],
          [7, 146, 116, 7, 147, 117],
          [21, 73, 45, 7, 74, 46],
          [1, 53, 23, 37, 54, 24],
          [19, 45, 15, 26, 46, 16],
          [5, 145, 115, 10, 146, 116],
          [19, 75, 47, 10, 76, 48],
          [15, 54, 24, 25, 55, 25],
          [23, 45, 15, 25, 46, 16],
          [13, 145, 115, 3, 146, 116],
          [2, 74, 46, 29, 75, 47],
          [42, 54, 24, 1, 55, 25],
          [23, 45, 15, 28, 46, 16],
          [17, 145, 115],
          [10, 74, 46, 23, 75, 47],
          [10, 54, 24, 35, 55, 25],
          [19, 45, 15, 35, 46, 16],
          [17, 145, 115, 1, 146, 116],
          [14, 74, 46, 21, 75, 47],
          [29, 54, 24, 19, 55, 25],
          [11, 45, 15, 46, 46, 16],
          [13, 145, 115, 6, 146, 116],
          [14, 74, 46, 23, 75, 47],
          [44, 54, 24, 7, 55, 25],
          [59, 46, 16, 1, 47, 17],
          [12, 151, 121, 7, 152, 122],
          [12, 75, 47, 26, 76, 48],
          [39, 54, 24, 14, 55, 25],
          [22, 45, 15, 41, 46, 16],
          [6, 151, 121, 14, 152, 122],
          [6, 75, 47, 34, 76, 48],
          [46, 54, 24, 10, 55, 25],
          [2, 45, 15, 64, 46, 16],
          [17, 152, 122, 4, 153, 123],
          [29, 74, 46, 14, 75, 47],
          [49, 54, 24, 10, 55, 25],
          [24, 45, 15, 46, 46, 16],
          [4, 152, 122, 18, 153, 123],
          [13, 74, 46, 32, 75, 47],
          [48, 54, 24, 14, 55, 25],
          [42, 45, 15, 32, 46, 16],
          [20, 147, 117, 4, 148, 118],
          [40, 75, 47, 7, 76, 48],
          [43, 54, 24, 22, 55, 25],
          [10, 45, 15, 67, 46, 16],
          [19, 148, 118, 6, 149, 119],
          [18, 75, 47, 31, 76, 48],
          [34, 54, 24, 34, 55, 25],
          [20, 45, 15, 61, 46, 16],
        ]),
        (k.getRSBlocks = function (e, t) {
          var n = k.getRsBlockTable(e, t);
          if (void 0 == n)
            throw new Error(
              "bad rs block @ typeNumber:" + e + "/errorCorrectLevel:" + t
            );
          for (var r = n.length / 3, s = [], i = 0; i < r; i++)
            for (
              var a = n[3 * i + 0], o = n[3 * i + 1], c = n[3 * i + 2], u = 0;
              u < a;
              u++
            )
              s.push(new k(o, c));
          return s;
        }),
        (k.getRsBlockTable = function (e, t) {
          switch (t) {
            case s:
              return k.RS_BLOCK_TABLE[4 * (e - 1) + 0];
            case i:
              return k.RS_BLOCK_TABLE[4 * (e - 1) + 1];
            case a:
              return k.RS_BLOCK_TABLE[4 * (e - 1) + 2];
            case o:
              return k.RS_BLOCK_TABLE[4 * (e - 1) + 3];
            default:
              return;
          }
        }),
        (y.prototype = {
          get: function (e) {
            var t = Math.floor(e / 8);
            return 1 == ((this.buffer[t] >>> (7 - (e % 8))) & 1);
          },
          put: function (e, t) {
            for (var n = 0; n < t; n++)
              this.putBit(1 == ((e >>> (t - n - 1)) & 1));
          },
          getLengthInBits: function () {
            return this.length;
          },
          putBit: function (e) {
            var t = Math.floor(this.length / 8);
            this.buffer.length <= t && this.buffer.push(0),
              e && (this.buffer[t] |= 128 >>> this.length % 8),
              this.length++;
          },
        });
      var E = [
        [17, 14, 11, 7],
        [32, 26, 20, 14],
        [53, 42, 32, 24],
        [78, 62, 46, 34],
        [106, 84, 60, 44],
        [134, 106, 74, 58],
        [154, 122, 86, 64],
        [192, 152, 108, 84],
        [230, 180, 130, 98],
        [271, 213, 151, 119],
        [321, 251, 177, 137],
        [367, 287, 203, 155],
        [425, 331, 241, 177],
        [458, 362, 258, 194],
        [520, 412, 292, 220],
        [586, 450, 322, 250],
        [644, 504, 364, 280],
        [718, 560, 394, 310],
        [792, 624, 442, 338],
        [858, 666, 482, 382],
        [929, 711, 509, 403],
        [1003, 779, 565, 439],
        [1091, 857, 611, 461],
        [1171, 911, 661, 511],
        [1273, 997, 715, 535],
        [1367, 1059, 751, 593],
        [1465, 1125, 805, 625],
        [1528, 1190, 868, 658],
        [1628, 1264, 908, 698],
        [1732, 1370, 982, 742],
        [1840, 1452, 1030, 790],
        [1952, 1538, 1112, 842],
        [2068, 1628, 1168, 898],
        [2188, 1722, 1228, 958],
        [2303, 1809, 1283, 983],
        [2431, 1911, 1351, 1051],
        [2563, 1989, 1423, 1093],
        [2699, 2099, 1499, 1139],
        [2809, 2213, 1579, 1219],
        [2953, 2331, 1663, 1273],
      ];
      function x(e) {
        if (
          ((this.options = {
            padding: 4,
            width: 256,
            height: 256,
            typeNumber: 4,
            color: "#000000",
            background: "#ffffff",
            ecl: "M",
            image: { svg: "", width: 0, height: 0 },
          }),
          "string" === typeof e && (e = { content: e }),
          e)
        )
          for (var t in e) this.options[t] = e[t];
        if ("string" !== typeof this.options.content)
          throw new Error("Expected 'content' as string!");
        if (0 === this.options.content.length)
          throw new Error("Expected 'content' to be non-empty!");
        if (!(this.options.padding >= 0))
          throw new Error("Expected 'padding' value to be non-negative!");
        if (!(this.options.width > 0) || !(this.options.height > 0))
          throw new Error(
            "Expected 'width' or 'height' value to be higher than zero!"
          );
        var r = this.options.content,
          c = (function (e, t) {
            for (
              var n = (function (e) {
                  var t = encodeURI(e)
                    .toString()
                    .replace(/\%[0-9a-fA-F]{2}/g, "a");
                  return t.length + (t.length != e ? 3 : 0);
                })(e),
                r = 1,
                s = 0,
                i = 0,
                a = E.length;
              i <= a;
              i++
            ) {
              var o = E[i];
              if (!o)
                throw new Error(
                  "Content too long: expected " + s + " but got " + n
                );
              switch (t) {
                case "L":
                  s = o[0];
                  break;
                case "M":
                  s = o[1];
                  break;
                case "Q":
                  s = o[2];
                  break;
                case "H":
                  s = o[3];
                  break;
                default:
                  throw new Error("Unknwon error correction level: " + t);
              }
              if (n <= s) break;
              r++;
            }
            if (r > E.length) throw new Error("Content too long");
            return r;
          })(r, this.options.ecl),
          u = (function (e) {
            switch (e) {
              case "L":
                return s;
              case "M":
                return i;
              case "Q":
                return a;
              case "H":
                return o;
              default:
                throw new Error("Unknwon error correction level: " + e);
            }
          })(this.options.ecl);
        (this.qrcode = new n(c, u)), this.qrcode.addData(r), this.qrcode.make();
      }
      (x.prototype.svg = function (e) {
        var t = this.options || {},
          n = this.qrcode.modules;
        "undefined" == typeof e && (e = { container: t.container || "svg" });
        for (
          var r = "undefined" == typeof t.pretty || !!t.pretty,
            s = r ? "  " : "",
            i = r ? "\r\n" : "",
            a = t.width,
            o = t.height,
            c = n.length,
            u = a / (c + 2 * t.padding),
            d = o / (c + 2 * t.padding),
            l = "undefined" != typeof t.join && !!t.join,
            h = "undefined" != typeof t.swap && !!t.swap,
            f = "undefined" == typeof t.xmlDeclaration || !!t.xmlDeclaration,
            p = "undefined" != typeof t.predefined && !!t.predefined,
            g = p
              ? s +
                '<defs><path id="qrmodule" d="M0 0 h' +
                d +
                " v" +
                u +
                ' H0 z" style="fill:' +
                t.color +
                ';shape-rendering:crispEdges;" /></defs>' +
                i
              : "",
            v =
              s +
              '<rect x="0" y="0" width="' +
              a +
              '" height="' +
              o +
              '" style="fill:' +
              t.background +
              ';shape-rendering:crispEdges;"/>' +
              i,
            m = "",
            b = "",
            w = 0;
          w < c;
          w++
        )
          for (var k = 0; k < c; k++) {
            if (n[k][w]) {
              var y = k * u + t.padding * u,
                E = w * d + t.padding * d;
              if (h) {
                var x = y;
                (y = E), (E = x);
              }
              if (l) {
                var C = u + y,
                  _ = d + E;
                (y = Number.isInteger(y) ? Number(y) : y.toFixed(2)),
                  (E = Number.isInteger(E) ? Number(E) : E.toFixed(2)),
                  (C = Number.isInteger(C) ? Number(C) : C.toFixed(2)),
                  (b +=
                    "M" +
                    y +
                    "," +
                    E +
                    " V" +
                    (_ = Number.isInteger(_) ? Number(_) : _.toFixed(2)) +
                    " H" +
                    C +
                    " V" +
                    E +
                    " H" +
                    y +
                    " Z ");
              } else
                m += p
                  ? s +
                    '<use x="' +
                    y.toString() +
                    '" y="' +
                    E.toString() +
                    '" href="#qrmodule" />' +
                    i
                  : s +
                    '<rect x="' +
                    y.toString() +
                    '" y="' +
                    E.toString() +
                    '" width="' +
                    u +
                    '" height="' +
                    d +
                    '" style="fill:' +
                    t.color +
                    ';shape-rendering:crispEdges;"/>' +
                    i;
            }
          }
        l &&
          (m =
            s +
            '<path x="0" y="0" style="fill:' +
            t.color +
            ';shape-rendering:crispEdges;" d="' +
            b +
            '" />');
        var S = "";
        if (void 0 !== this.options.image && this.options.image.svg) {
          var I = (a * this.options.image.width) / 100,
            M = (o * this.options.image.height) / 100,
            A = o / 2 - M / 2;
          (S += '<svg x="'
            .concat(a / 2 - I / 2, '" y="')
            .concat(A, '" width="')
            .concat(I, '" height="')
            .concat(
              M,
              '" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">'
            )),
            (S += this.options.image.svg + i),
            (S += "</svg>");
        }
        var R = "";
        switch (e.container) {
          case "svg":
            f && (R += '<?xml version="1.0" standalone="yes"?>' + i),
              (R +=
                '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' +
                a +
                '" height="' +
                o +
                '">' +
                i),
              (R += g + v + m),
              (R += S),
              (R += "</svg>");
            break;
          case "svg-viewbox":
            f && (R += '<?xml version="1.0" standalone="yes"?>' + i),
              (R +=
                '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' +
                a +
                " " +
                o +
                '">' +
                i),
              (R += g + v + m),
              (R += S),
              (R += "</svg>");
            break;
          case "g":
            (R += '<g width="' + a + '" height="' + o + '">' + i),
              (R += g + v + m),
              (R += S),
              (R += "</g>");
            break;
          default:
            R += (g + v + m + S).replace(/^\s+/, "");
        }
        return R;
      }),
        (e.exports = x);
    },
    60710: function (e, t) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.LIB_VERSION = void 0),
        (t.LIB_VERSION = "3.9.3");
    },
  },
]);
//# sourceMappingURL=vendor~7f854005.8b1c1074.js.map
