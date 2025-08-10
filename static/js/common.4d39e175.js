(self.webpackChunk_synfutures_v3_app =
  self.webpackChunk_synfutures_v3_app || []).push([
  [592],
  {
    70630: function (e, t, n) {
      "use strict";
      n(42052);
      t.Z =
        n.p +
        "static/media/icon_oracle_dexv2_uni.8233b883749d55e0270866873c9a9d07.svg";
    },
    15092: function (e, t, n) {
      "use strict";
      n(42052);
      t.Z =
        n.p +
        "";
    },
    24011: function (e, t, n) {
      "use strict";
      n(42052);
      t.Z =
        n.p +
        "static/media/icon_sushiswap.21cc3fea20b239d349c74cfab5f00490.svg";
    },
    47357: function (e, t, n) {
      "use strict";
      n.d(t, {
        Hi: function () {
          return a;
        },
        ag: function () {
          return u;
        },
        gA: function () {
          return s;
        },
        ij: function () {
          return o;
        },
      });
      var r = n(42052),
        i = n(52346),
        a = function (e) {
          var t = e.children;
          return (0, i.useMediaQuery)({ minWidth: 1280 }) ? t : null;
        },
        o = function (e) {
          var t = e.children;
          return (0, i.useMediaQuery)({ maxWidth: 767 }) ? t : null;
        },
        s = function (e) {
          var t = e.children;
          return (0, i.useMediaQuery)({ minWidth: 768 }) ? t : null;
        };
      function u() {
        var e = (0, i.useMediaQuery)({ minWidth: 1279 }),
          t = (0, i.useMediaQuery)({ query: "(min-width: 1824px)" }),
          n = (0, i.useMediaQuery)({ minWidth: 768, maxWidth: 1279 }),
          a = (0, i.useMediaQuery)({ query: "(orientation: portrait)" }),
          o = (0, i.useMediaQuery)({ query: "(min-resolution: 2dppx)" }),
          s = (0, i.useMediaQuery)({ maxWidth: 767 }),
          u = (0, i.useMediaQuery)({ minWidth: 768 }),
          c = (0, r.useMemo)(
            function () {
              return s ? "mobile" : n ? "tablet" : e ? "desktop" : "";
            },
            [e, s, n]
          );
        return {
          isDesktop: e,
          isBigScreen: t,
          isTablet: n,
          isPortrait: a,
          isRetina: o,
          isMobile: s,
          isNotMobile: u,
          deviceType: c,
        };
      }
    },
    22961: function (e, t, n) {
      "use strict";
      n(18148), n(42052), n(65441), n(64716), n(43370);
    },
    65441: function (e, t, n) {
      "use strict";
      if (
        (n.d(t, {
          Z: function () {
            return f;
          },
        }),
        179 == n.j)
      )
        var r = n(1413);
      n(78513);
      if (179 == n.j) var i = n(73050);
      var a,
        o = n(42052);
      const s = 179 == n.j ? ["title", "titleId"] : null;
      function u() {
        return (
          (u = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n)
                    ({}.hasOwnProperty.call(n, r) && (e[r] = n[r]));
                }
                return e;
              }),
          u.apply(null, arguments)
        );
      }
      const c =
        179 == n.j
          ? (0, o.forwardRef)((e, t) => {
              let { title: n, titleId: r } = e,
                i = (function (e, t) {
                  if (null == e) return {};
                  var n,
                    r,
                    i = (function (e, t) {
                      if (null == e) return {};
                      var n = {};
                      for (var r in e)
                        if ({}.hasOwnProperty.call(e, r)) {
                          if (t.includes(r)) continue;
                          n[r] = e[r];
                        }
                      return n;
                    })(e, t);
                  if (Object.getOwnPropertySymbols) {
                    var a = Object.getOwnPropertySymbols(e);
                    for (r = 0; r < a.length; r++)
                      (n = a[r]),
                        t.includes(n) ||
                          ({}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]));
                  }
                  return i;
                })(e, s);
              return o.createElement(
                "svg",
                u(
                  {
                    width: 16,
                    height: 16,
                    viewBox: "0 0 16 16",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                    ref: t,
                    "aria-labelledby": r,
                  },
                  i
                ),
                n ? o.createElement("title", { id: r }, n) : null,
                a ||
                  (a = o.createElement("path", {
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    d: "M8 15C11.9 15 15 11.9 15 8C15 4.1 11.9 1 8 1C4.1 1 1 4.1 1 8C1 11.9 4.1 15 8 15ZM7.2 4.2C7.3 4.1 7.5 4 7.7 4H8C8.2 4 8.3 4.1 8.5 4.2C8.6 4.3 8.7 4.5 8.7 4.7C8.7 4.9 8.6 5 8.5 5.2C8.3 5.3 8.2 5.3 8 5.3H7.7C7.5 5.3 7.4 5.2 7.2 5.1C7.1 5 7 4.8 7 4.7C7 4.5 7.1 4.3 7.2 4.2ZM6.2 6.9C6.3 6.8 6.5 6.7 6.7 6.7H8C8.2 6.7 8.3 6.8 8.5 6.9C8.6 7 8.7 7.2 8.7 7.3V10H9.4C9.6 10 9.7 10.1 9.9 10.2C10 10.3 10.1 10.5 10.1 10.7C10.1 10.9 10 11 9.9 11.2C9.8 11.3 9.6 11.4 9.4 11.4H6.7C6.5 11.4 6.4 11.3 6.2 11.2C6.1 11 6 10.8 6 10.7C6 10.5 6.1 10.4 6.2 10.2C6.3 10.1 6.5 10 6.7 10H7.4V8H6.7C6.5 8 6.3 7.9 6.2 7.8C6.1 7.7 6 7.5 6 7.3C6 7.2 6.1 7 6.2 6.9Z",
                    fill: "#29B5BC",
                  }))
              );
            })
          : null;
      n.p;
      var l = n(47357),
        d = n(43370),
        f =
          179 == n.j
            ? (0, o.memo)(function (e) {
                return (0, l.ag)().isMobile
                  ? (0, d.jsx)(d.Fragment, {})
                  : (0, d.jsx)(
                      i.Z,
                      (0, r.Z)(
                        (0, r.Z)({}, e),
                        {},
                        {
                          children: e.icon
                            ? e.icon
                            : (0, d.jsx)(c, {
                                onClick: function (e) {
                                  e.stopPropagation();
                                },
                                className: "syn-icon-tooltip",
                              }),
                        }
                      )
                    );
              })
            : null;
    },
    11946: function (e, t, n) {
      "use strict";
      var r = n(1413),
        i = n(73050),
        a = n(42052),
        o = n(47357),
        s = n(26409),
        u = n(43370),
        c = function (e) {
          return (0, o.ag)().isMobile && !e.showOnMobile
            ? (0, u.jsxs)(u.Fragment, { children: [" ", e.children] })
            : (0, u.jsx)(
                i.Z,
                (0, r.Z)((0, r.Z)({}, e), {}, { open: s.zf ? s.zf : e.open })
              );
        };
      t.Z = (0, a.memo)(c);
    },
    11714: function (e, t, n) {
      "use strict";
      n.d(t, {
        n: function () {
          return i;
        },
      });
      var r = n(68711);
      function i(e, t) {
        var i = n(54762)(
            "./".concat(
              (function (e) {
                switch (e) {
                  case r.CHAIN_ID.GOERLI:
                    return "goerli";
                  case r.CHAIN_ID.LINEA:
                    return "linea";
                  case r.CHAIN_ID.ARBITRUM:
                    return "arbitrum";
                  case r.CHAIN_ID.BLASTSEPOLIA:
                    return "blastSepolia";
                  case r.CHAIN_ID.BLAST:
                    return "blast";
                  case r.CHAIN_ID.BASE:
                    return "base";
                }
              })(e),
              ".json"
            )
          ),
          a = i;
        return i && ((a = JSON.parse(JSON.stringify(i))).wagmiChain = t), a;
      }
    },
    41924: function (e, t, n) {
      "use strict";
      n.d(t, {
        F: function () {
          return E;
        },
      });
      var r = n(74165),
        i = n(1413),
        a = n(93433),
        o = n(15861),
        s = n(82963),
        u = n(97326),
        c = n(60136),
        l = n(29388),
        d = n(43144),
        f = n(15671),
        p = n(42581),
        h = n(37113),
        E = (function (e) {
          (0, c.Z)(n, e);
          var t = (0, l.Z)(n);
          function n(e, r) {
            var i;
            return (
              (0, f.Z)(this, n),
              ((i = t.call(this)).url = e),
              (i.networkConfig = r),
              (i.underlyingProvider = void 0),
              (i.events = []),
              (i.requests = {}),
              (i.handler = {
                get: function (e, t, n) {
                  return Reflect.get(e.underlyingProvider, t, n);
                },
              }),
              (i.keepAlive = function (e) {
                var t = e.onDisconnect;
                try {
                  if (!i.underlyingProvider) return;
                  var n = i.underlyingProvider._websocket.onopen;
                  (i.underlyingProvider._websocket.onopen = function () {
                    var e;
                    if (i.underlyingProvider) {
                      for (
                        var t = arguments.length, r = new Array(t), a = 0;
                        a < t;
                        a++
                      )
                        r[a] = arguments[a];
                      for (var o; (o = i.events.pop()); ) {
                        var s, u;
                        null === (s = i.underlyingProvider) ||
                          void 0 === s ||
                          s._events.push(o),
                          null === (u = i.underlyingProvider) ||
                            void 0 === u ||
                            u._startEvent(o);
                      }
                      for (var c in i.requests) {
                        var l;
                        if (i.requests[c])
                          (i.underlyingProvider._requests[c] = i.requests[c]),
                            null === (l = i.underlyingProvider) ||
                              void 0 === l ||
                              l._websocket.send(i.requests[c].payload),
                            delete i.requests[c];
                      }
                      null === n ||
                        void 0 === n ||
                        n.call.apply(
                          n,
                          [
                            null === (e = i.underlyingProvider) || void 0 === e
                              ? void 0
                              : e._websocket,
                          ].concat(r)
                        );
                    }
                  }),
                    (i.underlyingProvider._websocket.onclose = function (e) {
                      t(e);
                    });
                  try {
                    var r = i.underlyingProvider._websocket.onmessage;
                    i.underlyingProvider._websocket.onmessage = function () {
                      try {
                        for (
                          var e, t = arguments.length, n = new Array(t), a = 0;
                          a < t;
                          a++
                        )
                          n[a] = arguments[a];
                        r &&
                          r.call.apply(
                            r,
                            [
                              null === (e = i.underlyingProvider) ||
                              void 0 === e
                                ? void 0
                                : e._websocket,
                            ].concat(n)
                          );
                      } catch (o) {}
                    };
                  } catch (a) {}
                } catch (a) {}
              }),
              i.connect(),
              (0, s.Z)(i, new Proxy((0, u.Z)(i), i.handler))
            );
          }
          return (
            (0, d.Z)(
              n,
              [
                {
                  key: "connect",
                  value: (function () {
                    var e = (0, o.Z)(
                      (0, r.Z)().mark(function e() {
                        var t = this;
                        return (0, r.Z)().wrap(
                          function (e) {
                            for (;;)
                              switch ((e.prev = e.next)) {
                                case 0:
                                  if (!this.underlyingProvider) {
                                    e.next = 8;
                                    break;
                                  }
                                  return (
                                    (this.events = [].concat(
                                      (0, a.Z)(this.events),
                                      (0, a.Z)(this.underlyingProvider._events)
                                    )),
                                    (this.requests = (0, i.Z)(
                                      (0, i.Z)({}, this.requests),
                                      this.underlyingProvider._requests
                                    )),
                                    (e.next = 5),
                                    this.underlyingProvider.destroy()
                                  );
                                case 5:
                                  return (
                                    (e.next = 7),
                                    new Promise(function (e) {
                                      return setTimeout(e, 2e3);
                                    })
                                  );
                                case 7:
                                case 8:
                                  try {
                                    (this.underlyingProvider = new p.q(
                                      this.url,
                                      this.networkConfig
                                    )),
                                      this.keepAlive({
                                        onDisconnect: (0, h.debounce)(function (
                                          e
                                        ) {
                                          t.connect();
                                        },
                                        500),
                                      });
                                  } catch (n) {}
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
                    return function () {
                      return e.apply(this, arguments);
                    };
                  })(),
                },
              ],
              [
                {
                  key: "getInstance",
                  value: function (e, t) {
                    var r = this.instances[e];
                    return r || ((r = new n(t, e)), (this.instances[e] = r)), r;
                  },
                },
              ]
            ),
            n
          );
        })(
          (function () {
            return (0, d.Z)(function e() {
              (0, f.Z)(this, e);
            });
          })()
        );
      E.instances = {};
    },
    36140: function (e, t, n) {
      "use strict";
      n.d(t, {
        o: function () {
          return r;
        },
      });
      var r = "https://ws.synfutures.com/public";
    },
    72958: function (e, t, n) {
      "use strict";
      n.d(t, {
        AO: function () {
          return f;
        },
        Bw: function () {
          return p;
        },
        Cv: function () {
          return E;
        },
        Cw: function () {
          return c;
        },
        Gm: function () {
          return l;
        },
        MT: function () {
          return T;
        },
        Px: function () {
          return _;
        },
        Z: function () {
          return o;
        },
        _J: function () {
          return s;
        },
        cO: function () {
          return m;
        },
        jg: function () {
          return i.jg;
        },
        kC: function () {
          return v;
        },
        ml: function () {
          return u;
        },
        oW: function () {
          return d;
        },
        pL: function () {
          return h;
        },
        t0: function () {
          return I;
        },
        xE: function () {
          return A;
        },
        z9: function () {
          return a;
        },
      });
      var r = n(21080),
        i = (n(62615), n(17534)),
        a = 4,
        o = 18,
        s = (function (e) {
          return (
            (e[(e.INIT = 0)] = "INIT"),
            (e[(e.FETCHING = 1)] = "FETCHING"),
            (e[(e.DONE = -1)] = "DONE"),
            e
          );
        })({}),
        u = (function (e) {
          return (
            (e.SLOW = "Slow"),
            (e.Standard = "Standard"),
            (e.FAST = "Fast"),
            (e.INSTANT = "Instant"),
            e
          );
        })({}),
        c = (function (e) {
          return (
            (e.Account = "Account"),
            (e.INITIAL_CHAIN_SWITCH = "INITIAL_CHAIN_SWITCH"),
            (e.Wallet = "Wallet"),
            (e.IpBlocked = "IpBlocked"),
            (e.Emergency = "Emergency"),
            (e.WrongNetwork = "WrongNetwork"),
            (e.Deposit = "Deposit"),
            (e.Withdraw = "Withdraw"),
            (e.SignedUp = "SignedUp"),
            (e.SignUp = "SignUp"),
            (e.Leadership = "Leadership"),
            (e.Term = "Term"),
            (e.Boost = "Boost"),
            (e.Team = "Team"),
            (e.TradeGuidance = "Trade Guidance"),
            (e.EarnGuidance = "Earn Guidance"),
            (e.ACCOUNT_TABLE = "Account Table"),
            (e.SETTLE = "Settle"),
            (e.CREATE_POOL = "Create Pool"),
            (e.PAIR_NOT_FOUND = "Pair not found"),
            (e.TRADE_MOBILE = "TRADE_MOBILE"),
            (e.MYSTERY_BOX = "mystery_box"),
            (e.SPIN_WHEEL = "spin_wheel"),
            (e.PROVIDE_LIQUIDITY = "provide_liquidity"),
            (e.INVITE_FRIEND = "invite_friend"),
            (e.SQUAD_REWARD = "squad_reward"),
            (e.SQUAD_MEMBER = "squad_member"),
            (e.LUCKY_DRAW = "lucky_draw"),
            (e.LUCK_TICKET = "lucky_ticket"),
            (e.LUCKY_CLAIM = "lucky_claim"),
            (e.CLAIM_TOKEN = "claim_token"),
            (e.MOBILE_TRADE = "mobile_trade"),
            (e.MOBILE_EARN = "mobile_earn"),
            (e.ORDER_PREVIEW = "order_preview"),
            e
          );
        })({}),
        l = (function (e) {
          return (
            (e.HIGH_RISK_LIQUIDITY = "HIGH_RISK_LIQUIDITY"),
            (e.PNL_SHARE = "PNL_SHARE"),
            (e.PNL_SHARE_NOTIFICATION = "PNL_SHARE_NOTIFICATION"),
            (e.CAMPAIGN_LEADERBOARD = "CAMPAIGN_LEADERBOARD"),
            (e.SYN_SCORE_2024 = "SYN_SCORE_2024"),
            e
          );
        })({}),
        d = (function (e) {
          return (e.TOKEN_EXCHANGE = "TOKEN_EXCHANGE"), e;
        })({}),
        f = (function (e) {
          return (e.Trade = "trade"), (e.Earn = "earn"), e;
        })({}),
        p = (function (e) {
          return (e.DARK = "dark-theme"), (e.LIGHT = "light-theme"), e;
        })({}),
        h = (function (e) {
          return (e.Dapp = "Dapp"), (e.Wallet = "Wallet"), e;
        })({}),
        E = (function (e) {
          return (e.WITHDRAW = "WITHDRAW"), (e.DEPOSIT = "DEPOSIT"), e;
        })({}),
        A = (r.O$.from(String(Math.pow(10, 18))), r.O$.from(0)),
        v =
          (r.O$.from(1),
          r.O$.from(2),
          179 == n.j
            ? [
                "campaigns",
                "tell-a-friend",
                "portfolio",
                "odyssey",
                "tgp",
                "referral",
              ]
            : null),
        m = "Perpetual",
        T = (function (e) {
          return (
            (e.ENGLISH = "en"),
            (e.TURKEY = "tr"),
            (e.VIETNAMESE = "vi"),
            (e.KOREAN = "kr"),
            (e.Spanish = "es"),
            (e.French = "fr"),
            (e.Japanese = "ja"),
            (e.Thai = "th"),
            e
          );
        })({}),
        _ = "LANGUAGE_CHOSEN",
        I = p.LIGHT;
    },
    26409: function (e, t, n) {
      "use strict";
      n.d(t, {
        Wx: function () {
          return i;
        },
        aD: function () {
          return a;
        },
        zf: function () {
          return r;
        },
      });
      var r = !1,
        i = !1,
        a = !1;
    },
    81773: function (e, t, n) {
      "use strict";
      n.d(t, {
        V: function () {
          return r;
        },
        c: function () {
          return i;
        },
      });
      var r = {
          1: "\u2081",
          2: "\u2082",
          3: "\u2083",
          4: "\u2084",
          5: "\u2085",
          6: "\u2086",
          7: "\u2087",
          8: "\u2088",
          9: "\u2089",
          10: "\u2081\u2080",
          11: "\u2081\u2081",
          12: "\u2081\u2082",
          13: "\u2081\u2083",
          14: "\u2081\u2084",
          15: "\u2081\u2085",
          16: "\u2081\u2086",
          17: "\u2081\u2087",
          18: "\u2081\u2088",
          19: "\u2081\u2089",
          20: "\u2082\u2080",
        },
        i = 0.001;
    },
    58123: function (e, t, n) {
      "use strict";
      n.d(t, {
        k: function () {
          return u;
        },
        u: function () {
          return s;
        },
      });
      var r,
        i,
        a = n(4942),
        o = n(68711),
        s =
          ((r = {}),
          (0, a.Z)(r, o.CHAIN_ID.BLASTSEPOLIA, ["https://sepolia.blast.io"]),
          (0, a.Z)(r, o.CHAIN_ID.BASE, [
            "https://mainnet-preconf.base.org/iVCRlQ4dHSYzXgOMMBfoR92yxGCndKUnJ0tF0dwAyzDN73xrJFYrQiNAPB9FRcVb",
          ]),
          (0, a.Z)(r, o.CHAIN_ID.BLAST, [
            "https://api.synfutures.com/rpc/public/blast",
          ]),
          r),
        u =
          ((i = {}),
          (0, a.Z)(i, o.CHAIN_ID.GOERLI, [
            "wss://misty-thrumming-sponge.ethereum-goerli.quiknode.pro/18a2c179737d82216cf2f11ea51e1f2d7114fbc3/",
            "wss://dark-crimson-night.ethereum-goerli.quiknode.pro/0630f179916b7122fce747ae37ad697856295c62/",
          ]),
          (0, a.Z)(
            i,
            o.CHAIN_ID.POLYGON,
            [
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
                PUBLISH_TIME: "2025-07-19 11:21:24",
                SITE_VERSION: "3.11.7",
                REACT_APP_DISPLAYABLE_CHAIN_ID: "8453,81457",
                REACT_APP_ODYSSEY_TWITTER_CALLBACK_URL:
                  "https://api.synfutures.com/v3/odyssey/prod/auth/twitter/callback",
                REACT_APP_GIT_SHA: "5a3b64f2f",
                REACT_APP_ODYSSEY_ENV: "prod",
                REACT_APP_AVAILABLE_CHAIN_ID: "81457,8453",
                REACT_APP_AWS_ENV: "prod",
                REACT_APP_HIDE_VAULT: "false",
                REACT_APP_PRIVY_APP_ID: "clz2gl5r702phkqjy3zhlalh9",
                REACT_APP_SPINDL_KEY: "fc62e9cb-fbec-487c-9dfc-b34833db1f93",
                REACT_APP_CHAIN_ID: "8453",
                REACT_APP_TWITTER_CLIENT_IDS:
                  "LUQ1MnhLblZPd2VaZUdnVm94aFg6MTpjaQ;VXJNS29iMkFGZGRkX3FCNDhDQUQ6MTpjaQ;aWRIamViSnhfcy1uTXVwelkxVUg6MTpjaQ;WndkRDRCWkd2algwSEF1OTluU1I6MTpjaQ",
                REACT_APP_WALLET_CONNECT_PROJECT_ID:
                  "f67004bd4fa36d541ea011f81d4e6182",
                REACT_APP_ENABLE_BLOCK_IP: "true",
                REACT_APP_APP_ENABLE_VCONSOLE: "false",
                REACT_APP_API_ENV: "prod",
                REACT_APP_LINEA_WSS_RPC:
                  "wss://lb.drpc.org/ogws?network=linea&dkey=AkhFZI-RCESCrQorQTqO09TKarNQfTER7qRoxqxINsn1",
                REACT_APP_ODYSSEY_TWITTER_CLIENT_ID:
                  "LUQ1MnhLblZPd2VaZUdnVm94aFg6MTpjaQ",
                REACT_APP_SHOW_TGP: "true",
                REACT_APP_GOERLI_WSS:
                  "wss://misty-thrumming-sponge.ethereum-goerli.quiknode.pro/18a2c179737d82216cf2f11ea51e1f2d7114fbc3/",
                REACT_APP_SERVICE_WORKER_ENV: "prod",
                REACT_APP_APP_DOMAIN: "",
                REACT_APP_APP_PORTFOLIO_SHOW_PNL: "false",
                REACT_APP_GOOGLE_ANALYTICS_ID: "G-186HRH3QXH",
              }.REACT_APP_POLYGON_WSS_RPC || "",
              "wss://wandering-blue-voice.matic.quiknode.pro/922dec71ad2bc92b7a6e64570721cf2b510bb31d/",
            ].filter(function (e) {
              return !!e;
            })
          ),
          (0, a.Z)(
            i,
            o.CHAIN_ID.LINEA,
            [
              "wss://lb.drpc.org/ogws?network=linea&dkey=AkhFZI-RCESCrQorQTqO09TKarNQfTER7qRoxqxINsn1",
              "wss://lb.drpc.org/ogws?network=linea&dkey=AkhFZI-RCESCrQorQTqO09TKarNQfTER7qRoxqxINsn1",
            ].filter(function (e) {
              return !!e;
            })
          ),
          (0, a.Z)(
            i,
            o.CHAIN_ID.ARBITRUM,
            [
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
                PUBLISH_TIME: "2025-07-19 11:21:24",
                SITE_VERSION: "3.11.7",
                REACT_APP_DISPLAYABLE_CHAIN_ID: "8453,81457",
                REACT_APP_ODYSSEY_TWITTER_CALLBACK_URL:
                  "https://api.synfutures.com/v3/odyssey/prod/auth/twitter/callback",
                REACT_APP_GIT_SHA: "5a3b64f2f",
                REACT_APP_ODYSSEY_ENV: "prod",
                REACT_APP_AVAILABLE_CHAIN_ID: "81457,8453",
                REACT_APP_AWS_ENV: "prod",
                REACT_APP_HIDE_VAULT: "false",
                REACT_APP_PRIVY_APP_ID: "clz2gl5r702phkqjy3zhlalh9",
                REACT_APP_SPINDL_KEY: "fc62e9cb-fbec-487c-9dfc-b34833db1f93",
                REACT_APP_CHAIN_ID: "8453",
                REACT_APP_TWITTER_CLIENT_IDS:
                  "LUQ1MnhLblZPd2VaZUdnVm94aFg6MTpjaQ;VXJNS29iMkFGZGRkX3FCNDhDQUQ6MTpjaQ;aWRIamViSnhfcy1uTXVwelkxVUg6MTpjaQ;WndkRDRCWkd2algwSEF1OTluU1I6MTpjaQ",
                REACT_APP_WALLET_CONNECT_PROJECT_ID:
                  "f67004bd4fa36d541ea011f81d4e6182",
                REACT_APP_ENABLE_BLOCK_IP: "true",
                REACT_APP_APP_ENABLE_VCONSOLE: "false",
                REACT_APP_API_ENV: "prod",
                REACT_APP_LINEA_WSS_RPC:
                  "wss://lb.drpc.org/ogws?network=linea&dkey=AkhFZI-RCESCrQorQTqO09TKarNQfTER7qRoxqxINsn1",
                REACT_APP_ODYSSEY_TWITTER_CLIENT_ID:
                  "LUQ1MnhLblZPd2VaZUdnVm94aFg6MTpjaQ",
                REACT_APP_SHOW_TGP: "true",
                REACT_APP_GOERLI_WSS:
                  "wss://misty-thrumming-sponge.ethereum-goerli.quiknode.pro/18a2c179737d82216cf2f11ea51e1f2d7114fbc3/",
                REACT_APP_SERVICE_WORKER_ENV: "prod",
                REACT_APP_APP_DOMAIN: "",
                REACT_APP_APP_PORTFOLIO_SHOW_PNL: "false",
                REACT_APP_GOOGLE_ANALYTICS_ID: "G-186HRH3QXH",
              }.REACT_APP_ARBITRUM_WSS_RPC || "",
              "wss://boldest-tiniest-tent.arbitrum-mainnet.quiknode.pro/c92b4b64a2156a038a0a9d846ca8f79c70fad7cf/",
            ].filter(function (e) {
              return !!e;
            })
          ),
          (0, a.Z)(
            i,
            o.CHAIN_ID.BLASTSEPOLIA,
            [
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
                PUBLISH_TIME: "2025-07-19 11:21:24",
                SITE_VERSION: "3.11.7",
                REACT_APP_DISPLAYABLE_CHAIN_ID: "8453,81457",
                REACT_APP_ODYSSEY_TWITTER_CALLBACK_URL:
                  "https://api.synfutures.com/v3/odyssey/prod/auth/twitter/callback",
                REACT_APP_GIT_SHA: "5a3b64f2f",
                REACT_APP_ODYSSEY_ENV: "prod",
                REACT_APP_AVAILABLE_CHAIN_ID: "81457,8453",
                REACT_APP_AWS_ENV: "prod",
                REACT_APP_HIDE_VAULT: "false",
                REACT_APP_PRIVY_APP_ID: "clz2gl5r702phkqjy3zhlalh9",
                REACT_APP_SPINDL_KEY: "fc62e9cb-fbec-487c-9dfc-b34833db1f93",
                REACT_APP_CHAIN_ID: "8453",
                REACT_APP_TWITTER_CLIENT_IDS:
                  "LUQ1MnhLblZPd2VaZUdnVm94aFg6MTpjaQ;VXJNS29iMkFGZGRkX3FCNDhDQUQ6MTpjaQ;aWRIamViSnhfcy1uTXVwelkxVUg6MTpjaQ;WndkRDRCWkd2algwSEF1OTluU1I6MTpjaQ",
                REACT_APP_WALLET_CONNECT_PROJECT_ID:
                  "f67004bd4fa36d541ea011f81d4e6182",
                REACT_APP_ENABLE_BLOCK_IP: "true",
                REACT_APP_APP_ENABLE_VCONSOLE: "false",
                REACT_APP_API_ENV: "prod",
                REACT_APP_LINEA_WSS_RPC:
                  "wss://lb.drpc.org/ogws?network=linea&dkey=AkhFZI-RCESCrQorQTqO09TKarNQfTER7qRoxqxINsn1",
                REACT_APP_ODYSSEY_TWITTER_CLIENT_ID:
                  "LUQ1MnhLblZPd2VaZUdnVm94aFg6MTpjaQ",
                REACT_APP_SHOW_TGP: "true",
                REACT_APP_GOERLI_WSS:
                  "wss://misty-thrumming-sponge.ethereum-goerli.quiknode.pro/18a2c179737d82216cf2f11ea51e1f2d7114fbc3/",
                REACT_APP_SERVICE_WORKER_ENV: "prod",
                REACT_APP_APP_DOMAIN: "",
                REACT_APP_APP_PORTFOLIO_SHOW_PNL: "false",
                REACT_APP_GOOGLE_ANALYTICS_ID: "G-186HRH3QXH",
              }.REACT_APP_BLASTSEPOLIA_WSS_RPC || "",
              "wss://blast-sepolia.drpc.org",
            ].filter(function (e) {
              return !!e;
            })
          ),
          i);
    },
    17534: function (e, t, n) {
      "use strict";
      n.d(t, {
        In: function () {
          return d;
        },
        jg: function () {
          return c;
        },
      });
      var r,
        i = n(4942),
        a = n(80997),
        o = n(32706),
        s = n(70995),
        u = n(20252),
        c = (function (e) {
          return (
            (e.APPROVE = "approve"),
            (e.DEPOSIT = "deposit"),
            (e.WITHDRAW = "withdraw"),
            (e.TRADE = "trade"),
            (e.PLACE_ORDER = "placeOrder"),
            (e.CANCEL_ORDER = "cancelOrder"),
            (e.FILL_ORDER = "fillOrder"),
            (e.ADJUST_MARGIN = "adjustMargin"),
            (e.ADD_LIQUIDITY = "addLiquidity"),
            (e.REMOVE_LIQUIDITY = "removeLiquidity"),
            (e.SETTLE = "settle"),
            (e.CREATE = "create"),
            (e.MINT = "mint"),
            (e.ACCEPT_INVITE = "acceptInvite"),
            (e.CREATE_TEAM = "createTeam"),
            (e.CLAIM_REWARDS = "claimRewards"),
            (e.CLAIM_WITHDRAW = "claimWithdraw"),
            (e.CLAIM_OO_TOKEN = "claimOOToken"),
            (e.BATCH_PLACE_SCALED_ORDER = "placeScaledOrder"),
            (e.PLACE_CROSS_MARKET_ORDER = "placeCrossMarketOrder"),
            (e.VAULT_DEPOSIT = "vaultDeposit"),
            (e.VAULT_WITHDRAW = "vaultWithdraw"),
            (e.VAULT_CLAIM = "vaultClaim"),
            (e.SWAP = "swap"),
            (e.NATIVE_SWAP = "native_swap"),
            (e.REFERRAL_TRADER_CLAIM = "referralTraderClaim"),
            (e.REFERRAL_AFFILIATES_CLAIM = "referralAffiliatesClaim"),
            e
          );
        })({}),
        l = {
          InstrumentInterface: u.Instrument__factory.createInterface(),
          GateInterface: u.Gate__factory.createInterface(),
          VaultInterface: s.Vault__factory.createInterface(),
          Erc20Interface: a.ERC20__factory.createInterface(),
          WrappedNativeInterface: a.WrappedNative__factory.createInterface(),
          OysterAggregatorInterface:
            o.OysterAggregator__factory.createInterface(),
        },
        d =
          ((r = {}),
          (0, i.Z)(r, c.DEPOSIT, [l.GateInterface]),
          (0, i.Z)(r, c.WITHDRAW, [l.GateInterface]),
          (0, i.Z)(r, c.TRADE, [l.InstrumentInterface]),
          (0, i.Z)(r, c.ADD_LIQUIDITY, [l.InstrumentInterface]),
          (0, i.Z)(r, c.REMOVE_LIQUIDITY, [l.InstrumentInterface]),
          (0, i.Z)(r, c.CREATE, [l.InstrumentInterface, l.GateInterface]),
          (0, i.Z)(r, c.ADJUST_MARGIN, [l.InstrumentInterface]),
          (0, i.Z)(r, c.CANCEL_ORDER, [l.InstrumentInterface]),
          (0, i.Z)(r, c.FILL_ORDER, [l.InstrumentInterface]),
          (0, i.Z)(r, c.PLACE_ORDER, [l.InstrumentInterface]),
          (0, i.Z)(r, c.SETTLE, [l.InstrumentInterface, l.GateInterface]),
          (0, i.Z)(r, c.BATCH_PLACE_SCALED_ORDER, [
            l.InstrumentInterface,
            l.GateInterface,
          ]),
          (0, i.Z)(r, c.PLACE_CROSS_MARKET_ORDER, [l.InstrumentInterface]),
          (0, i.Z)(r, c.VAULT_DEPOSIT, [l.VaultInterface]),
          (0, i.Z)(r, c.VAULT_WITHDRAW, [l.VaultInterface]),
          (0, i.Z)(r, c.VAULT_CLAIM, [l.VaultInterface]),
          (0, i.Z)(r, c.SWAP, [l.OysterAggregatorInterface]),
          (0, i.Z)(r, c.NATIVE_SWAP, [l.WrappedNativeInterface]),
          r);
    },
    33702: function (e, t, n) {
      "use strict";
      var r = n(93433),
        i = n(15671),
        a = n(43144),
        o = n(36140),
        s = n(20311),
        u = (function () {
          function e() {
            (0, i.Z)(this, e),
              (this.socket = null),
              (this.url = void 0),
              (this.eventQueue = new Map()),
              (this.url = o.o);
          }
          return (
            (0, a.Z)(
              e,
              [
                {
                  key: "connect",
                  value: function () {
                    var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : this.url;
                    return (
                      this.socket ||
                        ((this.socket = (0, s.io)(e, {
                          reconnection: !0,
                          reconnectionAttempts: 1 / 0,
                          reconnectionDelay: 1e3,
                          reconnectionDelayMax: 5e3,
                          randomizationFactor: 0.5,
                          path: "/ws",
                        })),
                        this.setupSocketListeners()),
                      this
                    );
                  },
                },
                {
                  key: "setupSocketListeners",
                  value: function () {
                    var e = this;
                    this.socket &&
                      (this.socket.on("connect", function () {
                        setTimeout(function () {
                          e.eventQueue.forEach(function (t, n) {
                            var i;
                            null === (i = e.socket) ||
                              void 0 === i ||
                              i.emit.apply(i, [n].concat((0, r.Z)(t)));
                          });
                        }, 500);
                      }),
                      this.socket.on("disconnect", function () {}),
                      this.socket.on("reconnect_attempt", function (e) {}),
                      this.socket.on("reconnect", function (e) {}),
                      this.socket.on("reconnect_error", function (e) {}),
                      this.socket.on("reconnect_failed", function () {}));
                  },
                },
                {
                  key: "disconnect",
                  value: function () {
                    this.socket &&
                      (this.socket.disconnect(),
                      (this.socket = null),
                      this.eventQueue.clear());
                  },
                },
                {
                  key: "emit",
                  value: function (e) {
                    if (this.socket) {
                      for (
                        var t,
                          n = arguments.length,
                          r = new Array(n > 1 ? n - 1 : 0),
                          i = 1;
                        i < n;
                        i++
                      )
                        r[i - 1] = arguments[i];
                      (t = this.socket).emit.apply(t, [e].concat(r)),
                        this.eventQueue.set(e, r);
                    }
                  },
                },
                {
                  key: "on",
                  value: function (e, t) {
                    this.socket && this.socket.on(e, t);
                  },
                },
                {
                  key: "off",
                  value: function (e) {
                    this.socket &&
                      (this.socket.off(e), this.eventQueue.delete(e));
                  },
                },
              ],
              [
                {
                  key: "getInstance",
                  value: function () {
                    return e.instance || (e.instance = new e()), e.instance;
                  },
                },
              ]
            ),
            e
          );
        })();
      (u.instance = void 0), (t.Z = 844 != n.j ? u : null);
    },
    30020: function (e, t, n) {
      "use strict";
      n.d(t, {
        $: function () {
          return P;
        },
      });
      var r = n(1413),
        i = n(44925),
        a = n(15671),
        o = n(43144),
        s = n(82963),
        u = n(11752),
        c = n(61120),
        l = n(60136),
        d = n(29388),
        f = n(79890),
        p = n(21080),
        h = n(37113),
        E = n(51118),
        A = n(72958),
        v = n(62615),
        m = n(86265),
        T = n(43370),
        _ = ["isStablePair", "roundingMode"],
        I = ["isStablePair", "roundingMode"];
      f.Z.config({ DECIMAL_PLACES: 18 });
      var P = (function (e) {
        (0, l.Z)(n, e);
        var t = (0, d.Z)(n);
        function n(e) {
          var r;
          return (
            (0, a.Z)(this, n),
            (r =
              e instanceof f.Z
                ? t.call(this, e)
                : e instanceof p.O$
                ? t.call(this, (0, m.dF)(e))
                : (0, h.has)(e, "_hex")
                ? t.call(this, (0, m.dF)(p.O$.from(e)))
                : t.call(
                    this,
                    (null === e || void 0 === e ? void 0 : e.toString()) || ""
                  )),
            (0, s.Z)(r)
          );
        }
        return (
          (0, o.Z)(
            n,
            [
              {
                key: "wadValue",
                get: function () {
                  return (0, m.Yu)(this.toString());
                },
              },
              {
                key: "displayValue",
                get: function () {
                  return (0, m.If)({ num: this });
                },
              },
              {
                key: "stringValue",
                get: function () {
                  return this.toString();
                },
              },
              {
                key: "sqrtVal",
                get: function () {
                  return n.from(this.sqrt());
                },
              },
              {
                key: "reciprocal",
                get: function () {
                  return n.from(1).div(this);
                },
              },
              {
                key: "decimalValue",
                value: function (e) {
                  return n.from((0, m.iL)(this.stringValue, e));
                },
              },
              {
                key: "abs",
                value: function () {
                  return n.from(
                    (0, u.Z)((0, c.Z)(n.prototype), "abs", this).call(this)
                  );
                },
              },
              {
                key: "add",
                value: function (e) {
                  return n.from(
                    (0, u.Z)((0, c.Z)(n.prototype), "plus", this).call(
                      this,
                      n.from(e)
                    )
                  );
                },
              },
              {
                key: "min",
                value: function (e) {
                  return n.from(
                    (0, u.Z)((0, c.Z)(n.prototype), "minus", this).call(
                      this,
                      n.from(e)
                    )
                  );
                },
              },
              {
                key: "mul",
                value: function (e) {
                  return n.from(
                    (0, u.Z)((0, c.Z)(n.prototype), "multipliedBy", this).call(
                      this,
                      n.from(e)
                    )
                  );
                },
              },
              {
                key: "divBy",
                value: function (e) {
                  return n.from(
                    (0, u.Z)((0, c.Z)(n.prototype), "dividedBy", this).call(
                      this,
                      n.from(e)
                    )
                  );
                },
              },
              {
                key: "div",
                value: function (e) {
                  return n.from(
                    (0, u.Z)((0, c.Z)(n.prototype), "div", this).call(this, e)
                  );
                },
              },
              {
                key: "gte",
                value: function (e) {
                  return (0, u.Z)(
                    (0, c.Z)(n.prototype),
                    "isGreaterThanOrEqualTo",
                    this
                  ).call(this, e);
                },
              },
              {
                key: "keepPositive",
                value: function () {
                  return this.lt(0) ? n.from(0) : this;
                },
              },
              {
                key: "notEq",
                value: function (e) {
                  return !this.eq(e);
                },
              },
              {
                key: "formatWithToolTip",
                value: function () {
                  return (0, E.yo)({ num: this });
                },
              },
              {
                key: "formatPriceNumberWithTooltip",
                value: function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : {},
                    t = e.isStablePair,
                    n = e.roundingMode,
                    a = (0, i.Z)(e, _);
                  return (0, E.QD)(
                    (0, r.Z)(
                      (0, r.Z)({ num: this }, a),
                      {},
                      {
                        roundingMode: n,
                        significantDigits: t ? v.tV + 1 : v.tV,
                      }
                    )
                  );
                },
              },
              {
                key: "formatPriceString",
                value: function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : {},
                    t = e.isStablePair,
                    n = e.roundingMode,
                    a = (0, i.Z)(e, I);
                  return (0, m.If)(
                    (0, r.Z)(
                      (0, r.Z)({ num: this }, a),
                      {},
                      {
                        type: "price",
                        roundingMode: n,
                        significantDigits: t ? v.tV + 1 : v.tV,
                      }
                    )
                  );
                },
              },
              {
                key: "formatLiqPriceNumberWithTooltip",
                value: function () {
                  var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {};
                  return (0, E.mD)((0, r.Z)({ num: this }, e));
                },
              },
              {
                key: "formatLiqPriceString",
                value: function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : {},
                    t = void 0,
                    i = "";
                  return (
                    this.eq(0) ||
                      (this.abs().gte(1e6)
                        ? (t = n.from(1 / 0))
                        : this.lt(0) && (t = n.ZERO),
                      (i = (0, m.If)(
                        (0, r.Z)(
                          (0, r.Z)({}, e),
                          {},
                          { num: t || this, type: "price" }
                        )
                      ))),
                    i
                  );
                },
              },
              {
                key: "formatLeverageString",
                value: function () {
                  return this.lt(0)
                    ? "-"
                    : "".concat(
                        this.eq(0) || this.eq(0)
                          ? 0
                          : null !== this && void 0 !== this && this.lt(0.1)
                          ? (0, T.jsx)(T.Fragment, { children: "< 0.1" })
                          : (0, m.uf)(this, 1),
                        "x"
                      );
                },
              },
              {
                key: "formatLeverageWithTooltip",
                value: function () {
                  return this.lt(0)
                    ? (0, T.jsx)(T.Fragment, { children: "-" })
                    : (0, T.jsxs)("span", {
                        className: "font-number",
                        children: [
                          this.eq(0) || this.eq(0)
                            ? 0
                            : null !== this && void 0 !== this && this.lt(0.1)
                            ? (0, T.jsx)(T.Fragment, { children: "< 0.1" })
                            : (0, m.uf)(this, 1),
                          "x",
                        ],
                      });
                },
              },
              {
                key: "formatNumberWithTooltip",
                value: function () {
                  var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {};
                  return (0, E.yo)((0, r.Z)({ num: this }, e));
                },
              },
              {
                key: "formatDisplayNumber",
                value: function () {
                  var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {};
                  return (0, m.If)((0, r.Z)({ num: this }, e));
                },
              },
              {
                key: "formatPercentage",
                value: function (e) {
                  return (0, E.rl)(
                    (0, r.Z)({ percentage: this.toString(10) }, e)
                  );
                },
              },
              {
                key: "formatPercentageString",
                value: function () {
                  var e =
                      !(arguments.length > 0 && void 0 !== arguments[0]) ||
                      arguments[0],
                    t =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : 2,
                    n =
                      arguments.length > 2 && void 0 !== arguments[2]
                        ? arguments[2]
                        : f.Z.ROUND_DOWN;
                  return (0, m.c2)({
                    percentage: this.toString(10),
                    hundredfold: e,
                    decimals: t,
                    roundingMode: n,
                  });
                },
              },
              {
                key: "formatNormalNumberString",
                value: function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : A.z9,
                    t =
                      !(arguments.length > 1 && void 0 !== arguments[1]) ||
                      arguments[1],
                    n =
                      arguments.length > 2 && void 0 !== arguments[2]
                        ? arguments[2]
                        : f.Z.ROUND_DOWN,
                    r =
                      arguments.length > 3 &&
                      void 0 !== arguments[3] &&
                      arguments[3];
                  return (0, m.uf)(this, e, t, n, r);
                },
              },
              {
                key: "toDisplayJSON",
                value: function () {
                  return {
                    wadValue: this.wadValue,
                    numStr: this.toString(10),
                    displayValue: this.displayValue,
                    stringValue: this.stringValue,
                  };
                },
              },
              {
                key: "valueOf",
                value: function () {
                  return JSON.stringify(this.toDisplayJSON());
                },
              },
              {
                key: "toJSON",
                value: function () {
                  return this.valueOf();
                },
              },
              {
                key: "toString",
                value: function (e) {
                  return (0, u.Z)((0, c.Z)(n.prototype), "toString", this).call(
                    this,
                    e || 10
                  );
                },
              },
            ],
            [
              {
                key: "ZERO",
                get: function () {
                  return new n(0);
                },
              },
              {
                key: "ONE",
                get: function () {
                  return new n(1);
                },
              },
              {
                key: "from",
                value: function (e) {
                  return e instanceof n ? e : new n(e);
                },
              },
            ]
          ),
          n
        );
      })(f.Z);
    },
    48501: function (e, t, n) {
      "use strict";
      n.d(t, {
        A: function () {
          return d;
        },
      });
      var r = n(15671),
        i = n(43144),
        a = n(60136),
        o = n(29388),
        s = n(37113),
        u = n.n(s),
        c = n(22935),
        l = n(30020),
        d = (function (e) {
          (0, a.Z)(n, e);
          var t = (0, o.Z)(n);
          function n(e) {
            var i,
              a = e.chainId,
              o = e.symbol,
              s = e.address,
              u = e.decimals,
              c = e.name,
              l = e.id;
            return (
              (0, r.Z)(this, n),
              ((i = t.call(this, {
                chainId: a,
                symbol: o,
                address: s,
                decimals: u,
                name: c,
                id: l,
              })).quoteParam = void 0),
              i
            );
          }
          return (
            (0, i.Z)(
              n,
              [
                {
                  key: "setTokenPrice",
                  value: function (e) {
                    e &&
                      ((this.price = l.$.from(e.current)),
                      (this.price_change_percentage_24h = l.$.from(
                        e.priceChangePercentage24h
                      )));
                  },
                },
                {
                  key: "setQuoteParam",
                  value: function (e) {
                    e && (this.quoteParam = e);
                  },
                },
                {
                  key: "toJSON",
                  value: function () {
                    return {
                      id: this.id,
                      chainId: this.chainId,
                      symbol: this.symbol,
                      address: this.address,
                      decimals: this.decimals,
                      name: this.name,
                      price: this.price,
                      quoteParam: this.quoteParam,
                    };
                  },
                },
                {
                  key: "toString",
                  value: function () {
                    return JSON.stringify(this.toJSON());
                  },
                },
              ],
              [
                {
                  key: "getInstance",
                  value: function (e, t) {
                    return e && t ? u().get(n.instances, [t, e]) : void 0;
                  },
                },
                {
                  key: "wrapInstance",
                  value: function (e) {
                    var t = e.metaToken,
                      r = e.chainId,
                      i = n.getInstance(t.id, r);
                    return (
                      i ||
                        ((i = new n((0, c.R)(t))),
                        u().set(n.instances, [r, t.id], i)),
                      i
                    );
                  },
                },
                {
                  key: "getInstanceMap",
                  value: function (e) {
                    return e ? u().get(n.instances, [e], void 0) : void 0;
                  },
                },
              ]
            ),
            n
          );
        })(n(18162).M);
      d.instances = {};
    },
    18162: function (e, t, n) {
      "use strict";
      n.d(t, {
        M: function () {
          return o;
        },
      });
      var r = n(15671),
        i = n(43144),
        a = n(30020),
        o = (function () {
          function e(t) {
            var n = t.chainId,
              i = t.symbol,
              a = t.address,
              o = t.decimals,
              s = t.name,
              u = t.id;
            (0, r.Z)(this, e),
              (this.id = void 0),
              (this.chainId = void 0),
              (this.name = void 0),
              (this.symbol = void 0),
              (this.address = void 0),
              (this.decimals = void 0),
              (this.price = void 0),
              (this.price_change_percentage_24h = void 0),
              (this.color = void 0),
              (this.chainId = n),
              (this.symbol = i),
              (this.address = a.toLowerCase()),
              (this.decimals = o),
              (this.name = s),
              (this.id = u);
          }
          return (
            (0, i.Z)(e, [
              {
                key: "setTokenPrice",
                value: function (e) {
                  e &&
                    ((this.price = a.$.from(e.current)),
                    (this.price_change_percentage_24h = a.$.from(
                      e.priceChangePercentage24h
                    )));
                },
              },
              {
                key: "toJSON",
                value: function () {
                  return {
                    id: this.id,
                    chainId: this.chainId,
                    symbol: this.symbol,
                    address: this.address,
                    decimals: this.decimals,
                    name: this.name,
                    price: this.price,
                  };
                },
              },
              {
                key: "toString",
                value: function () {
                  return JSON.stringify(this.toJSON());
                },
              },
            ]),
            e
          );
        })();
      o.instances = {};
    },
    92231: function (e, t, n) {
      "use strict";
      n.d(t, {
        e: function () {
          return r;
        },
      });
      var r = (function (e) {
        return (
          (e.NativeBalanceEvent = "NativeBalanceEvent"),
          (e.BalanceEvent = "BalanceEvent"),
          (e.ApprovalEvent = "ApprovalEvent"),
          (e.MulticallTokensAllowance = "MulticallTokensAllowance"),
          (e.MulticallBalance = "MulticallBalance"),
          (e.FetchPair = "FetchPair"),
          (e.BatchPairs = "BatchPairs"),
          (e.FetchPortfolio = "FetchPortfolio"),
          (e.FetchPortfolioList = "FetchPortfolioList"),
          (e.FetchGateBalance = "FetchGateBalance"),
          (e.CallFuturesList = "CallFuturesList"),
          (e.CallGateBalance = "CallGateBalance"),
          (e.WatchGateEvent = "GateBalanceEvent"),
          (e.UpdateFuturesEvent = "UpdateFuturesEvent"),
          (e.InstrumentUpdateEvent = "InstrumentUpdateEvent"),
          (e.RemoveAllInstrumentEventListener = "RemoveAllEventListener"),
          (e.RemoveAllGateEventListener = "RemoveAllGateEventListener"),
          (e.OnInstrumentOrderUpdateEvent = "OnInstrumentOrderUpdateEvent"),
          (e.FetchInstrumentSpotState = "FetchInstrumentSpotState"),
          (e.PollingFetchInstrument = "PollingFetchInstrument"),
          (e.UpdateSpotStateEvent = "UpdateSpotStateEvent"),
          (e.UpdateRawSpotPriceEvent = "UpdateRawSpotPriceEvent"),
          (e.UpdatePortfolioEvent = "UpdatePortfolioEvent"),
          (e.UpdateGateBalanceEvent = "UpdateGateBalanceEvent"),
          (e.UpdateTokenAllowanceEvent = "UpdateTokenAllowanceEvent"),
          (e.RemoveAllSocketEventListener = "RemoveAllSocketEventListener"),
          (e.UpdateMarketPairInfoEvent = "UpdateMarketPairInfoEvent"),
          (e.DispatchInstrumentUpdateEvent = "DispatchInstrumentUpdateEvent"),
          (e.DispatchPortfolioUpdateEvent = "DispatchPortfolioUpdateEvent"),
          (e.DispatchGateUpdateEvent = "DispatchGateUpdateEvent"),
          e
        );
      })({});
    },
    242: function (e, t, n) {
      "use strict";
      if (
        (n.d(t, {
          R: function () {
            return E;
          },
        }),
        844 != n.j)
      )
        var r = n(15671);
      if (844 != n.j) var i = n(43144);
      var a = n(8901),
        o = n(49490),
        s = n.n(o),
        u = n(85088);
      if (844 != n.j) var c = n(27e3);
      if (844 != n.j) var l = n(71866);
      if (844 != n.j) var d = n(76614);
      var f = n(37113),
        p = n.n(f),
        h =
          844 != n.j
            ? (function () {
                function e(t) {
                  (0, r.Z)(this, e),
                    (this.key = void 0),
                    (this.iv = void 0),
                    (this.nonce = void 0),
                    (this.nonce =
                      t || (0, u.Z)({ length: 48, type: "alphanumeric" }));
                  var n = a.Buffer.from(
                    c.keccak256(l.Y0(this.nonce)).slice(2),
                    "hex"
                  );
                  (this.key = d
                    .hexlify(n.subarray(0, 32), { allowMissingPrefix: !1 })
                    .replace("0x", "")),
                    (this.iv = d
                      .hexlify(n.subarray(n.length - 16), {
                        allowMissingPrefix: !1,
                      })
                      .replace("0x", ""));
                }
                return (
                  (0, i.Z)(e, [
                    {
                      key: "sign",
                      value: function (e) {
                        var t = e.body
                            ? JSON.stringify(
                                p().fromPairs(
                                  p().sortBy(p().toPairs(e.body), 0)
                                )
                              )
                            : void 0,
                          n = JSON.stringify({
                            uri: e.uri,
                            body: t,
                            nonce: this.nonce,
                            ts: e.ts,
                            authorization: e.authorization || void 0,
                          }),
                          r = s().AES.encrypt(n, s().enc.Hex.parse(this.key), {
                            iv: s().enc.Hex.parse(this.iv),
                            mode: s().mode.CBC,
                            padding: s().pad.Pkcs7,
                          }),
                          i = c
                            .keccak256(
                              l.Y0(
                                s().enc.Base64.stringify(
                                  s().enc.Utf8.parse(r.toString())
                                )
                              )
                            )
                            .replace("0x", "");
                        return {
                          "X-Api-Nonce": this.nonce,
                          "X-Api-Sign": i,
                          "X-Api-Ts": e.ts,
                        };
                      },
                    },
                  ]),
                  e
                );
              })()
            : null;
      function E(e) {
        var t = e.uri,
          n = e.authorization,
          r = {
            uri: t,
            body: e.body,
            ts: new Date().getTime(),
            authorization: n,
          };
        return new h().sign(r);
      }
    },
    91164: function (e, t, n) {
      "use strict";
      n.d(t, {
        F3: function () {
          return h;
        },
        Gj: function () {
          return E;
        },
        Jg: function () {
          return v;
        },
        Tj: function () {
          return _;
        },
        XJ: function () {
          return P;
        },
        qz: function () {
          return p;
        },
        tA: function () {
          return A;
        },
        zC: function () {
          return T;
        },
      });
      var r = n(74165),
        i = n(15861);
      if (179 == n.j) var a = n(78997);
      var o = n(67567),
        s = n(3305),
        u = n(41924),
        c = n(51931),
        l = n(58123),
        d = n(61721),
        f = n(84407);
      function p(e) {
        var t = "",
          n = c.UA[e];
        return n && (t = n.network.name || ""), t;
      }
      function h(e) {
        var t = "";
        return c.UA[e] && (t = c.UA[e].network.shortName || ""), t;
      }
      function E(e) {
        if (e) {
          var t = null;
          return (
            Object.entries(c.UA).map(function (n) {
              var r = (0, a.Z)(n, 2),
                i = r[0];
              r[1].network.shortName === e && (t = Number(i));
            }),
            t
          );
        }
      }
      function A() {
        var e = localStorage.getItem(d.TL);
        return null !== e && c.sI.includes(Number(e)) ? Number(e) : c.rC;
      }
      function v(e) {
        var t;
        return (
          (e &&
            (null === (t = c.UA[e]) || void 0 === t
              ? void 0
              : t.network.isTestnet)) ||
          !1
        );
      }
      var m = Object.values(c.UA).map(function (e) {
          return e.network.blockExplorer.url;
        }),
        T = function (e) {
          return m.some(function (t) {
            return e.toLowerCase().includes(t.toLowerCase());
          });
        };
      function _(e) {
        return I.apply(this, arguments);
      }
      function I() {
        return (I = (0, i.Z)(
          (0, r.Z)().mark(function e(t) {
            var n, i, a;
            return (0, r.Z)().wrap(function (e) {
              for (;;)
                switch ((e.prev = e.next)) {
                  case 0:
                    return (e.next = 2), (0, f.lp)(t);
                  case 2:
                    if ((n = e.sent)) {
                      e.next = 10;
                      break;
                    }
                    if (
                      !(a =
                        null === l.k ||
                        void 0 === l.k ||
                        null === (i = l.k[t]) ||
                        void 0 === i
                          ? void 0
                          : i[0])
                    ) {
                      e.next = 9;
                      break;
                    }
                    return e.abrupt("return", {
                      type: "wss",
                      provider: u.F.getInstance(t, a),
                    });
                  case 9:
                    return e.abrupt("return", {
                      type: "https",
                      provider: P(
                        t,
                        null === l.u || void 0 === l.u ? void 0 : l.u[t]
                      ),
                    });
                  case 10:
                    if ("wss" !== n.type) {
                      e.next = 14;
                      break;
                    }
                    return e.abrupt("return", {
                      type: "wss",
                      provider: u.F.getInstance(t, n.rpc),
                    });
                  case 14:
                    return e.abrupt("return", {
                      type: "https",
                      provider: new o.c(n.rpc, t),
                    });
                  case 15:
                  case "end":
                    return e.stop();
                }
            }, e);
          })
        )).apply(this, arguments);
      }
      function P(e, t) {
        var n = t
          .map(function (t) {
            return new o.c(t, e);
          })
          .map(function (e, t) {
            return {
              provider: e,
              priority: 1 + t,
              weight: 1,
              stallTimeout: 1e3,
            };
          });
        return new s.H(n);
      }
    },
    38278: function (e, t, n) {
      "use strict";
      n.d(t, {
        R: function () {
          return o;
        },
      });
      var r = n(1413),
        i = n(68711),
        a = n(77377);
      function o(e, t) {
        t || (t = (0, i.getChainInfo)(e));
        var n = (0, a.z3)(t.wrappedNativeToken, e),
          o = (0, a.z3)(t.nativeToken, e);
        return (0, r.Z)(
          (0, r.Z)({}, t),
          {},
          { nativeToken: o, wrappedNativeToken: n }
        );
      }
    },
    86926: function (e, t, n) {
      "use strict";
      n(37113);
      var r = n(65418),
        i = n.n(r),
        a = n(91164),
        o = [
          "event",
          "syn",
          "tx",
          "graph",
          "websocket",
          "other",
          "campaign",
          "ERC",
          "wallet",
          "simulate",
          "web3",
          "socket",
        ],
        s = ["wallet", "simulate", "web3", "socket"],
        u = function (e, t, n, r) {
          try {
            var u, c;
            if (!s.includes(e)) return;
            var l,
              d = [];
            if (t) {
              var f;
              o.indexOf(e);
              if ("tx" === e)
                if (null !== n && void 0 !== n && n.receipt)
                  1 ===
                  (null === n ||
                  void 0 === n ||
                  null === (f = n.receipt) ||
                  void 0 === f
                    ? void 0
                    : f.status)
                    ? "#1f9933"
                    : "#ff4d6a";
            }
            if (
              (d.push(
                " ".repeat(10) +
                  "| " +
                  "[Time: ".concat(i()().format("YYYY-MM-DD HH:mm:ss"), "]")
              ),
              null !== r &&
                void 0 !== r &&
                r.chainId &&
                d.push(" [Chain: ".concat((0, a.qz)(r.chainId), "]")),
              null !== r &&
                void 0 !== r &&
                r.userAddr &&
                d.push(
                  " [User: ".concat(
                    null === r || void 0 === r ? void 0 : r.userAddr,
                    "]"
                  )
                ),
              null !== r &&
                void 0 !== r &&
                null !== (u = r.underlying) &&
                void 0 !== u &&
                u.symbol)
            )
              d.push(
                " [Symbol: ".concat(
                  null === r ||
                    void 0 === r ||
                    null === (l = r.underlying) ||
                    void 0 === l
                    ? void 0
                    : l.symbol,
                  "]"
                )
              );
            null !== r &&
              void 0 !== r &&
              r.txHash &&
              d.push(
                " [txHash: ".concat(
                  null === r || void 0 === r ? void 0 : r.txHash,
                  "]"
                )
              ),
              r && d.push("\n" + " ".repeat(10) + "| params:", r),
              n && d.push("\n" + " ".repeat(10) + "| result:", n);
            for (
              var p = arguments.length, h = new Array(p > 4 ? p - 4 : 0), E = 4;
              E < p;
              E++
            )
              h[E - 4] = arguments[E];
            (c = console).log.apply(c, d.concat(h));
          } catch (A) {}
        };
      (console.record = u), self && (self.console.record = u);
    },
    68062: function (e, t, n) {
      "use strict";
      if (
        (n.d(t, {
          P: function () {
            return u;
          },
          i: function () {
            return s;
          },
        }),
        844 != n.j)
      )
        var r = n(1413);
      var i = n(72411),
        a = n(77377);
      if (844 != n.j) var o = n(66850);
      function s(e, t) {
        var n,
          o,
          s = e.instrumentAddr.toLowerCase(),
          u = e.base;
        if (!u && null !== e && void 0 !== e && e.symbol) {
          var c = null === e || void 0 === e ? void 0 : e.symbol.split("-")[0];
          (u = { name: c, symbol: c, address: i.ADDRESS_ZERO, decimals: 0 }),
            (e.base = u);
        }
        return (0, r.Z)(
          (0, r.Z)({}, e),
          {},
          {
            instrumentAddr: s,
            id: s,
            baseToken: (0, a.zR)({
              token: e.base,
              marketType:
                (null === (n = e.market) ||
                void 0 === n ||
                null === (o = n.info) ||
                void 0 === o
                  ? void 0
                  : o.type) || i.MarketType.LINK,
              chainId: t,
            }),
            quoteToken: (0, a.zR)({ token: e.quote, chainId: t }),
          }
        );
      }
      function u(e) {
        var t = e.amm,
          n = e.futures,
          a = e.blockInfo,
          s = (0, o.Kk)(n.instrumentAddr, t.expiry);
        return (0, r.Z)(
          (0, r.Z)({}, t),
          {},
          {
            id: s,
            instrumentId: n.instrumentAddr.toLowerCase(),
            markPrice: t.markPrice || i.ZERO,
            blockInfo: a || n.blockInfo || { height: 0, timestamp: 0 },
          }
        );
      }
    },
    66850: function (e, t, n) {
      "use strict";
      function r(e, t) {
        return "".concat(e, "-").concat(t).toLowerCase();
      }
      function i(e, t) {
        return "".concat(e, "-").concat(t).toLowerCase();
      }
      function a(e, t) {
        return "".concat(e, "-").concat(t).toLowerCase();
      }
      function o(e, t) {
        return "".concat(e, "-").concat(t).toLowerCase();
      }
      function s(e, t) {
        return "".concat(e, "-").concat(t).toLowerCase();
      }
      n.d(t, {
        Kk: function () {
          return r;
        },
        NO: function () {
          return o;
        },
        W1: function () {
          return s;
        },
        _4: function () {
          return i;
        },
        l0: function () {
          return a;
        },
      });
    },
    48920: function (e, t, n) {
      "use strict";
      n.d(t, {
        z: function () {
          return d;
        },
      });
      var r = n(74165),
        i = n(15861),
        a = n(15671),
        o = n(43144),
        s = n(68711),
        u = n(41924),
        c = n(58123),
        l = n(91164),
        d = (function () {
          function e(t, n) {
            var o = this;
            (0, a.Z)(this, e),
              (this.chainId = void 0),
              (this.chainContext = void 0),
              (this.readProviderFromLocalOrSetting = (0, i.Z)(
                (0, r.Z)().mark(function e() {
                  var t;
                  return (0, r.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), (0, l.Tj)(o.chainId);
                        case 2:
                          (t = e.sent), o.chainContext.setProvider(t.provider);
                        case 4:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              )),
              (this.chainId = t),
              (this.chainContext = new s.Context(t)),
              (this.chainContext.info.isOpSdkCompatible = !1),
              this.chainContext.setProvider(n);
          }
          return (
            (0, o.Z)(
              e,
              [
                {
                  key: "chainInfo",
                  get: function () {
                    return this.chainContext.info;
                  },
                },
                {
                  key: "provider",
                  get: function () {
                    return this.chainContext.provider;
                  },
                },
              ],
              [
                {
                  key: "getInstance",
                  value: function (t) {
                    var n = this.instances.get(t);
                    if (!n) {
                      var r,
                        i,
                        a = void 0;
                      null !== c.k &&
                        void 0 !== c.k &&
                        null !== (r = c.k[t]) &&
                        void 0 !== r &&
                        r[0] &&
                        (a = new u.F(
                          null === c.k ||
                          void 0 === c.k ||
                          null === (i = c.k[t]) ||
                          void 0 === i
                            ? void 0
                            : i[0],
                          t
                        )),
                        a ||
                          (a = (0, l.XJ)(
                            t,
                            null === c.u || void 0 === c.u ? void 0 : c.u[t]
                          )),
                        (n = new e(t, a)),
                        this.instances.set(t, n);
                    }
                    return n;
                  },
                },
              ]
            ),
            e
          );
        })();
      d.instances = new Map();
    },
    89052: function (e, t, n) {
      "use strict";
      n.d(t, {
        F2: function () {
          return o;
        },
        Ud: function () {
          return i;
        },
        uH: function () {
          return s;
        },
      });
      var r = n(22935);
      function i(e, t) {
        self && self.postMessage({ eventName: e, data: t });
      }
      function a(e) {
        return (0, r.R)(e);
      }
      var o = function (e, t, n, r, i) {
        var o = e.data;
        if (o.eventName === n) {
          if (i) {
            if (i.chainId && o.data.chainId && i.chainId !== o.data.chainId)
              return;
            if (i.userAddr && o.data.userAddr && i.userAddr !== o.data.userAddr)
              return;
          }
          r(a(o.data));
        }
      };
      function s(e, t, n, r) {
        e.addEventListener("message", function (e) {
          var i = e.data;
          if (i.eventName === t) {
            if (r) {
              if (r.chainId && i.data.chainId && r.chainId !== i.data.chainId)
                return;
              if (
                r.userAddr &&
                i.data.userAddr &&
                r.userAddr !== i.data.userAddr
              )
                return;
            }
            n(a(i.data));
          }
        });
      }
    },
    68167: function (e, t, n) {
      "use strict";
      n(86926);
    },
    54762: function (e, t, n) {
      var r = {
        "./arbitrum.json": 4533,
        "./base.json": 13789,
        "./blast.json": 31286,
        "./blastSepolia.json": 29439,
        "./goerli.json": 75513,
        "./linea.json": 73732,
        "./monadTestnet.json": 16604,
      };
      function i(e) {
        var t = a(e);
        return n(t);
      }
      function a(e) {
        if (!n.o(r, e)) {
          var t = new Error("Cannot find module '" + e + "'");
          throw ((t.code = "MODULE_NOT_FOUND"), t);
        }
        return r[e];
      }
      (i.keys = function () {
        return Object.keys(r);
      }),
        (i.resolve = a),
        (e.exports = i),
        (i.id = 54762);
    },
    43041: function (e) {
      "use strict";
      e.exports =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAZQSURBVHgB5VdpbFRVFP7ue286M52lM52WljLTzSmLFWxY3MMSKlVRMSqamBhTNUR/GGOMGmNITFxQf7gFozGoNWokFYO7Asq+VUAoNTWyRKFliUCBDrTTmXn3+r2ZbjMDtID88iQ39917zz3fd849d3nA/10ELpH4fOXlCaluBdRoKFWnFCo0gQORSFvFYD0D/5Hk54e9sVisTgjUKqjZCdMcNXic/VBAeea8iyJggcbj0bmAdmdPrGcmQewqQ0fpfkh3LaStyoTuXorI/WnjF7QEbl/5dGHKh6RS9xLUlgZoK4HMnQHpnETgG5XS8tIwEttEWvs8IvC85nJ9eJ/Q5ZMwzRrL0z5T0lkD030zAW8hgbLBk/rBnA6oeBxbExlWhxUBjyd0OwEX8PPyvj5lH4eEdw6k5x4ooyBNn8kGfx5w5WhgZICTmHYBn5UC2PfwXWL4SejwVZQZicQizqzt65Oe2Uj4HqDX16Tp5jqA8VXAuHLWYcDlzDJnOVue2XlWAm536VyY8YWM8wirbXrvQCLwBENckQY6pRqYOAaoKqXnWrYdp12iuKAHfm9c5eiq8UysssG9wcegxNtJj51XIT7iRYZ8bP/4aC7zjMlAzeiBPOgTT24CJQTMz4tjVGEUNiN9X7g8JedOQrc7OC0Jrtnp8VNI+OelFOndlCuAm64DivIHeUBzBb4YQkVRBAnocpo4k4iODq6pvSmzP4uA0ESDNIKIlXyQTDRLJrGaMw0YMQg4QA9Li7tRWdKFHFvG7me6a+1t0Fb+Aq25Gfq2LRBtbdZIURZeZofLN0HFgouT4Mxc1N8GhEMD3paN7EZ4VBcK/bF0Q52d0Jf/SNBV0NeuTrbPGInjOPcSmIHHk+DXTADmzkxlswVcSdDqilNpIU6CNi6GsWI5tE0bcRY5yvIjYXcgjk1ZhDI7jElK1V4N3D0z1S7K78GUy08yuQaA9fXrYCx6HzpDfAY5wfI9NPzMM/J7cRhHcA7JikD1ZSlwQ1eYEI5gTNnp1EA0CuOrpTDefB3awQOZ0/4moLXFlmA8tovVSGCYkkXgvpsYdoeJ6RM74HXTDu9RfUkjbBZwKpEGe/o5Y/ip6MBA/Ffj4uTTb0118NA/6nTkoOr6o0mZtZOV8qO/7Pfrx7t92nyVDy8uhexoPZkE73n3FSXLvP3AnX5xZF5eoM3tCSmXOxRl/bXLW/p4bm7ZRFyEZCWhBW579x3YFrzU37fA9xxe9M1fElP2N+z7QhFhajM4cRavlzI+Png8Ka6V2EBrLRrEFqlp+3M0fW9Hx9628yYQ/eJDZZ/3YPI7luvDJ1XPfvzIqafHEeyqXpVWJtyX3JrfxH8VW/PySv1xqMt0KauV0HlRSJ4eWrVQCCqLmBAcVl0E+oHPsZeHJGBOCCkr2eL5RVj61EZECistpYY1W/DZ58sRZONmnnvTqWpdUidIbBP7NrNsdDjRfGqdyNp24XDYzpOYZU/nkASs9U56v+BV2XL9o3827/I4+95y9HolN8UHnSaWPvMaxkoTIaFhKq2EOct6K1QpgXZ6v4e6bZzXoiSOEOSwzYbfu5tE+7AJ9Cz6COasOiqoxrXbA6vaj9hrqFyXJKMgOfCT0rDSkNhQf5fYPOCu8hr5qFYmz30FH69oN+cUWyTiW8XC4RDYy6pSBUOy+5vvoigozO0d+oIX4sLFy0YeSgjMoId1BOArAJN7xzcwN3YSbAe/dxkmDtTfLXZjCMkm4EMNDS2j8RGM+b6e9xsazVm11/L7htQEtUsqfKsptaR19+Ftrccm5XSfRKUtB2PYP5bhd5FEDVWLuVwOkTqwTCGx7KG54oUhCfSSKCeJn0hiTK9WQ2LOnM963novyFHr+T2VvaUKIsKs30wjGyG1JsSMHa7CwkNZ9vg2bmhATn29iA6LwCAiD1DjeQy85VaT1EcowFenmg4FNQNlQldTlZRhPiR4i/AmEIgwCs2MwnG2f1NKtAuIY7ke0SpE0d7zIjCIyDRq8gcEs/vJCCwnmbXQsV4cxZp+XfWXo6vLMZ5eByBFsa5LQ0pVLKEd9XhK3rsgAmlk8lDBWTew8NpCJVJJaJDMNtY7uXQtLNt5H55kJrQMdTNe9M+pKocDEZKSychcyeKGtRTWQSUQILFjrC2cFbw152fO/xcTPU1iPogkdAAAAABJRU5ErkJggg==";
    },
    81029: function (e, t, n) {
      "use strict";
      e.exports = n.p + "static/media/icon_crypto_alb.5cbbc510af945b469058.png";
    },
    46601: function () {},
    42480: function () {},
    56952: function () {},
    4533: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"network":{"chainId":42161,"icon":"https://api.synfutures.com/ipfs/icons/network/arbitrum.svg","name":"Arbitrum","shortName":"arbitrum","rpcUrl":{"public":"https://arb1.arbitrum.io/rpc"},"blockExplorer":{"name":"Etherscan","url":"https://arbiscan.io/"},"bridgeLink":"https://bridge.arbitrum.io/"},"wrappedNativeTokenSymbol":"WETH","nativeTokenSymbol":"ETH","subgraph":"https://api.synfutures.com/thegraph/v3-arbitrum","earn":{"pairJson":"https://api.synfutures.com/ipfs/v2-config/v3/pairs/arbitrum.json","filterMargins":["USDC","WETH"],"earnCustomPairs":[]},"market":{"depositCardQuoteSymbols":[]},"minNativeTokenKeep":0.002,"quoteDisplayList":["USDC","WETH"],"balanceDisplayList":["ETH","USDC","WETH"],"trade":{"defaultPairSymbol":"BTC-USDC-LINK-Perpetual","klineInterval":{"list":["5m","15m","30m","1h","1d","1w"],"default":"1h"},"fundingChartInterval":{"list":["1h","8h"],"default":"1h"}}}'
      );
    },
    13789: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"colors":{"border1":"#0052FF","bg1":"#0052FF33"},"network":{"isPageSupported":{"spot":true,"launchpad":true,"referral":true},"chainId":8453,"icon":"https://api.synfutures.com/ipfs/icons/network/base.svg","name":"Base","shortName":"base","rpcUrl":{"public":"https://mainnet.base.org"},"blockExplorer":{"name":"Base Explorer","url":"https://basescan.org"},"useCoingeckoPrice":true},"wrappedNativeToken":{"name":"Wrapped Ether","address":"0x4200000000000000000000000000000000000006","symbol":"WETH","decimals":18},"nativeToken":{"name":"Base Ether","address":"0x0000000000000000000000000000000000000000","symbol":"ETH","decimals":18},"subgraph":"https://api.synfutures.com/thegraph/v3-base","tokenListUrl":"https://api.synfutures.com/v3/token-list?chainId=8453","minNativeTokenKeep":0.005,"wssEventListener":{"trade":true,"earn":true,"portfolio":true},"pairPriceDecimals":{"BONSAICOIN-USDC-EMG-Perpetual":18},"extraTokenExchange":{"0xe4b20925d9e9a62f1e492e15a81dc0de62804dd4":{"name":"BtcUSD","url":"https://app.uniswap.org/explore/pools/base/0x086110481d226B1eD355141bEB1884E02c11eEeD"}},"referral":{"contract":{"trader":"0x8e961c28859351AC49Ab9EBfBD1f7525C6fA3A34","affiliates":"0x7e9bEDb173B08149c915293FEa4fff970e26a90A"}}}'
      );
    },
    31286: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"colors":{"border1":"#FCFC03","bg1":"#FCFC0333"},"network":{"chainId":81457,"icon":"https://api.synfutures.com/ipfs/icons/network/blast.svg","name":"Blast","shortName":"blast","rpcUrl":{"public":"https://rpc.ankr.com/blast"},"blockExplorer":{"name":"Etherscan","url":"https://blastscan.io"},"useCoingeckoPrice":true},"wrappedNativeToken":{"name":"Wrapped Ether","address":"0x4300000000000000000000000000000000000004","symbol":"WETH","decimals":18},"nativeToken":{"name":"Blast Ether","address":"0x0000000000000000000000000000000000000000","symbol":"ETH","decimals":18},"pairsToBeFilteredInMarketAndEarn":[],"subgraph":"https://api.synfutures.com/thegraph/v3-blast","minNativeTokenKeep":0.005,"wssEventListener":{"trade":true,"earn":true,"portfolio":true}}'
      );
    },
    29439: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"network":{"chainId":168587773,"icon":"https://api.synfutures.com/ipfs/icons/network/blast.svg","name":"Blast Sepolia","shortName":"blastsepolia","rpcUrl":{"public":"https://sepolia.blast.io"},"blockExplorer":{"name":"Etherscan","url":"https://testnet.blastscan.io"},"isTestnet":true,"testnet":{"faucetLink":"","mintTokens":[]}},"wrappedNativeTokenSymbol":"WETH","nativeTokenSymbol":"ETH","subgraph":"https://api.synfutures.com/thegraph/v3-blast-sepolia-new","market":{"depositCardQuoteSymbols":[]},"earn":{"pairJson":"https://api.synfutures.com/ipfs/v2-config/v3/pairs/blastSepolia.json","filterMargins":["USDB","WETH"],"earnCustomPairs":[{"id":"Major","title":"Major","pairs":["BTC-USDB-PYTH-Perpetual","USDB-WETH-PYTH-Perpetual","USDB-WETH-PYTH-0329","ETH-USDB-PYTH-Perpetual"]},{"id":"Stable","title":"Stable","pairs":["USDT-USDB-PYTH-Perpetual","USDC-USDB-PYTH-Perpetual","USDC-USDB-PYTH-0329","WIF-WETH-EMG-Perpetual","BOME-WETH-EMG-Perpetual","YES-WETH-EMG-Perpetual","MIA-WETH-DEXV2-Perpetual","NICK-WETH-EMG-Perpetual","SLERF-WETH-EMG-Perpetual"]},{"id":"meme","title":"MEME","pairs":["WIF-WETH-EMG-Perpetual","BOME-WETH-EMG-Perpetual","YES-WETH-EMG-Perpetual","MIA-WETH-DEXV2-Perpetual","NICK-WETH-EMG-Perpetual","SLERF-WETH-EMG-Perpetual"]}]},"minNativeTokenKeep":0.005,"quoteDisplayList":["USDB","WETH"],"balanceDisplayList":["ETH","USDB","WETH"],"trade":{"defaultPairSymbol":"BTC-USDB-LINK-Perpetual","klineInterval":{"list":["5m","15m","30m","1h","1d","1w"],"default":"1h"},"fundingChartInterval":{"list":["1h","8h"],"default":"1h"}},"wssEventListener":{"trade":false,"earn":false},"announcement":{"isShow":true,"i18nTitle":"common.announcement.blastTitle","isShowBarRight":true}}'
      );
    },
    75513: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"network":{"chainId":5,"icon":"https://api.synfutures.com/ipfs/icons/network/goerli.svg","name":"Goerli","shortName":"goerli","rpcUrl":{"public":"https://rpc.ankr.com/eth_goerli"},"blockExplorer":{"name":"Etherscan","url":"https://goerli.etherscan.io"},"isTestnet":true,"testnet":{"faucetLink":"https://goerlifaucet.com/","mintTokens":["USDM"]},"mockTokenConfig":{"mockTokenSymbol":"USDM","mappingTokenSymbol":"USDC"}},"wrappedNativeTokenSymbol":"WETH","nativeTokenSymbol":"ETH","subgraph":"https://api.synfutures.com/thegraph/v3-goerli-dev","market":{"depositCardQuoteSymbols":[]},"earn":{"pairJson":"https://api.synfutures.com/ipfs/v2-config/v3/pairs/goerli.json","filterMargins":["USDM","WETH"],"earnCustomPairs":[]},"minNativeTokenKeep":0.2,"quoteDisplayList":["USDM","WETH"],"balanceDisplayList":["ETH","USDM","WETH"],"trade":{"defaultPairSymbol":"ETH-USDM-LINK-Perpetual","klineInterval":{"list":["5m","15m","30m","1h","1d","1w"],"default":"1h"},"fundingChartInterval":{"list":["1h","8h"],"default":"1h"}},"wssEventListener":{"trade":true,"earn":true},"announcement":{"isShow":true,"i18nTitle":"common.announcement.mintTitle","showMintToken":true,"linkName":"Mint"}}'
      );
    },
    73732: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"network":{"chainId":59144,"icon":"https://api.synfutures.com/ipfs/icons/network/linea.svg","name":"Linea","shortName":"linea","rpcUrl":{"public":"https://rpc.linea.build"},"blockExplorer":{"name":"Etherscan","url":"https://lineascan.build"},"mockTokenConfig":{"mockTokenSymbol":"USDM","mappingTokenSymbol":"USDC"}},"wrappedNativeTokenSymbol":"WETH","nativeTokenSymbol":"ETH","subgraph":"https://api.synfutures.com/thegraph/v3-linea-prod","quoteTokens":[{"name":"USD Mock Token","address":"0x7a61Fd2092a3933831E826c08f0D12913FEfB96C","symbol":"USDM","decimals":6}],"market":{"depositCardQuoteSymbols":[]},"trendingPairs":[],"earn":{"pairJson":"https://api.synfutures.com/ipfs/v2-config/v3/pairs/linea.json","filterMargins":["USDM"],"earnCustomPairs":[]},"minNativeTokenKeep":0.2,"quoteDisplayList":["USDM"],"balanceDisplayList":["ETH","USDM"],"trade":{"defaultPairSymbol":"BTC-USDM-LINK-Perpetual","klineInterval":{"list":["1d","1w"],"default":"1d"},"fundingChartInterval":{"list":["1h","8h"],"default":"1h"},"isDisableLimitOrder":true},"announcement":{"isShow":true,"i18nTitle":"common.announcement.mintTitle","showMintToken":true,"linkName":"Mint"}}'
      );
    },
    16604: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"colors":{"border1":"#200052","bg1":"#20005233"},"network":{"isPageSupported":{"spot":false,"launchpad":false},"chainId":10143,"icon":"https://api.synfutures.com/ipfs/icons/network/monad.svg","name":"Monad Testnet","shortName":"Monad Testnet","rpcUrl":{"public":"https://testnet-rpc.monad.xyz"},"blockExplorer":{"name":"Monad Explorer","url":"https://testnet.monadexplorer.com/"},"useCoingeckoPrice":true},"wrappedNativeToken":{"name":"Wrapped Monad","address":"0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701","symbol":"WMON","decimals":18},"nativeToken":{"name":"MON","address":"0x0000000000000000000000000000000000000000","symbol":"MON","decimals":18},"subgraph":"","tokenListUrl":"https://api.synfutures.com/v3/token-list?chainId=10143","minNativeTokenKeep":0.05,"wssEventListener":{"trade":true,"earn":true,"portfolio":true},"pairPriceDecimals":{},"extraTokenExchange":{}}'
      );
    },
  },
]);
//# sourceMappingURL=common.4d39e175.js.map
