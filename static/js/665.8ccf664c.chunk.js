!(function () {
  "use strict";
  var e = {
      51118: function (e, t, n) {
        n.d(t, {
          QD: function () {
            return g;
          },
          mD: function () {
            return k;
          },
          rl: function () {
            return I;
          },
          yo: function () {
            return b;
          },
        });
        var r = n(44925),
          a = n(1413),
          i = (n(5043), n(18148)),
          o = n.n(i),
          s = n(42052),
          u = n(47383),
          c = n(30020),
          d = n(86265),
          l = n(51997),
          p = n(43370),
          f = ["num", "colorShader", "suffix"];
        function h(e) {
          return (0, d.Md)(e).gte(0) ? "#14B84B" : "#FF6666";
        }
        var v = function (e) {
            var t = e.num,
              n = e.iProps,
              r = (0, a.Z)(
                (0, a.Z)(
                  {
                    duration: 1,
                    useEasing: !0,
                    useGrouping: !0,
                    preserveValue: !0,
                  },
                  n
                ),
                {},
                { decimals: 9 }
              ),
              i = (0, s.useCallback)(function (e) {
                return (0, d.If)({ num: e || 0, type: "price" });
              }, []);
            return (0, p.jsx)(
              u.ZP,
              (0, a.Z)(
                (0, a.Z)({}, r),
                {},
                {
                  formattingFn: i,
                  end: null === t || void 0 === t ? void 0 : t.toNumber(),
                }
              )
            );
          },
          m = function (e) {
            var t = e.num,
              n = e.formattedNumStr,
              r = e.colorShader,
              i = void 0 !== r && r,
              o = e.isBold,
              s = void 0 !== o && o,
              u = e.isShowTBMK,
              c = void 0 !== u && u,
              f = e.toolTipProps,
              m = e.prefix,
              b = e.suffix,
              g = e.showToolTip,
              k = void 0 === g || g,
              I = e.countUpProps,
              x = e.showPositive,
              A = e.colorSuffix,
              w = void 0 !== A && A,
              y = e.isShowApproximatelyEqualTo,
              Z = e.minDecimalPlaces,
              S = e.showZeroIfNegative,
              C = e.isUseMockNumber,
              N = void 0 !== C && C,
              E = e.isShowSuffixInTooltip,
              P = void 0 !== E && E,
              T = (0, d.Md)(N ? "1234567899876" : t || "");
            function L(e, t) {
              return !I || e.isNaN() || e.isZero()
                ? t
                : (0, p.jsx)(v, {
                    iProps: I,
                    num: e,
                    formattedNumStr: n,
                    isShowTBMK: c,
                  });
            }
            T.lt(0) && S && (T = (0, d.Md)(0));
            var _ =
              b &&
              (0, p.jsx)("span", { className: "number-suffix", children: b });
            function M(e, t, n) {
              return arguments.length > 3 &&
                void 0 !== arguments[3] &&
                arguments[3]
                ? e && !t.eq(0)
                  ? (0, p.jsxs)("span", {
                      children: [
                        (0, p.jsxs)("b", {
                          className: "font-number",
                          style: { color: h(t) },
                          children: [m, L(t, n)],
                        }),
                        _,
                      ],
                    })
                  : (0, p.jsxs)("span", {
                      children: [
                        (0, p.jsxs)("b", {
                          className: "font-number",
                          children: [m, L(t, n)],
                        }),
                        _,
                      ],
                    })
                : e && !t.eq(0)
                ? (0, p.jsxs)("span", {
                    children: [
                      (0, p.jsxs)("span", {
                        className: "font-number",
                        style: { color: h(t) },
                        children: [m, L(t, n), w && _],
                      }),
                      !w && _,
                    ],
                  })
                : (0, p.jsxs)("span", {
                    children: [
                      (0, p.jsxs)("span", {
                        className: "font-number",
                        children: [m, L(t, n)],
                      }),
                      _,
                    ],
                  });
            }
            var F = T.eq(0) ? "0.00" : T.toString();
            return (
              (F =
                n ||
                (0, d.If)({
                  num: T,
                  showPositive: x,
                  isShowTBMK: c,
                  isShowApproximatelyEqualTo: y,
                  minDecimalPlaces: Z,
                })),
              "$" === m &&
                (F.startsWith("-") && ((m = "-$"), (F = F.slice(1))),
                F.startsWith("+") && ((m = "+$"), (F = F.slice(1))),
                F.startsWith("\uff1c") && ((m = "\uff1c$"), (F = F.slice(1)))),
              k && !T.eq(0)
                ? (0, p.jsx)(
                    l.u,
                    (0, a.Z)(
                      (0, a.Z)({}, f),
                      {},
                      {
                        title: ""
                          .concat((0, d.ET)(T))
                          .concat(P ? " ".concat(b) : ""),
                        children: M(i, T, F, s),
                      }
                    )
                  )
                : M(i, T, F, s)
            );
          },
          b = function (e) {
            var t = e.num,
              n = e.colorShader,
              r = void 0 !== n && n,
              a = e.isBold,
              i = void 0 !== a && a,
              o = e.isShowTBMK,
              s = void 0 !== o && o,
              u = e.toolTipProps,
              c = e.prefix,
              d = e.suffix,
              l = e.showPositive,
              p = e.colorSuffix,
              f = e.countUpProps,
              h = e.isShowApproximatelyEqualTo,
              v = e.showZeroIfNegative,
              b = e.showToolTip,
              g = e.minDecimalPlaces,
              k = e.isUseMockNumber,
              I = e.isShowSuffixInTooltip;
            return m({
              num: t,
              colorShader: r,
              isBold: i,
              toolTipProps: u,
              isShowTBMK: s,
              prefix: c,
              suffix: d,
              colorSuffix: p,
              countUpProps: f,
              showPositive: l,
              isShowApproximatelyEqualTo: h,
              showToolTip: b,
              minDecimalPlaces: g,
              showZeroIfNegative: v,
              isUseMockNumber: k,
              isShowSuffixInTooltip: I,
            });
          },
          g = function (e) {
            var t = e.num,
              n = e.colorShader,
              r = void 0 !== n && n,
              a = e.isOperateNum,
              i = void 0 !== a && a,
              o = e.isShowTBMK,
              s = void 0 !== o && o,
              u = e.prefix,
              c = e.isShowApproximatelyEqualTo,
              l = e.suffix,
              p = e.showPositive,
              f = e.significantDigits,
              h = e.roundingMode,
              v = (0, d.If)({
                num: t,
                type: "price",
                isOperateNum: i,
                isShowApproximatelyEqualTo: c,
                showPositive: p,
                significantDigits: f,
                roundingMode: h,
              });
            return m({
              num: t,
              formattedNumStr: v,
              colorShader: r,
              isShowTBMK: s,
              prefix: u,
              suffix: l,
            });
          },
          k = function (e) {
            var t = e.num,
              n = e.colorShader,
              i = void 0 !== n && n,
              o = e.suffix,
              s = (0, r.Z)(e, f),
              u = (0, d.Md)(t),
              c = "";
            return (
              u.eq(0) ||
                (u.abs().gte(1e6) ? (t = 1 / 0) : u.lt(0) && (t = 0),
                (c = (0, d.If)({ num: t, type: "price" }))),
              m(
                (0, a.Z)(
                  { num: t, formattedNumStr: c, colorShader: i, suffix: o },
                  s
                )
              )
            );
          };
        function I(e) {
          var t = e.percentage,
            n = e.hundredfold,
            r = void 0 === n || n,
            a = e.colorShader,
            i = void 0 === a || a,
            s = e.customTitle,
            u = e.decimals,
            f = void 0 === u ? 2 : u,
            h = e.withThreshHold,
            v = e.prefix,
            m = void 0 === v ? "" : v,
            b = e.suffix,
            g = void 0 === b ? "" : b,
            k = e.isColorShaderWhiteIfZero,
            I = void 0 !== k && k,
            x = e.isHiddenIfZero,
            A = void 0 !== x && x,
            w = e.requirePlusSymbol,
            y = void 0 !== w && w,
            Z = e.className,
            S = c.$.from(t).mul(r ? 100 : 1),
            C = (0, d.uf)(S, f);
          if (h) {
            var N = c.$.from(S),
              E = c.$.from(1 / Math.pow(10, f));
            N.notEq(0) &&
              N.abs().lt(E) &&
              (C = "<" + (S.gt(0) ? "" : "-") + E.stringValue);
          }
          var P = i ? (S.lt(0) ? "text-danger" : "text-success") : "";
          if ((I && S.eq(0) && (P = ""), S.eq(0) && A)) return null;
          var T = "";
          return (
            y && S.gt(0) && (T = "+"),
            (0, p.jsx)(l.u, {
              title: s || void 0,
              children: (0, p.jsx)("span", {
                className: o()("font-number", Z, P),
                children: "".concat(T).concat(m).concat(C, "%").concat(g),
              }),
            })
          );
        }
      },
      51997: function (e, t, n) {
        n.d(t, {
          u: function () {
            return r.Z;
          },
        });
        n(22961), n(65441);
        var r = n(11946);
      },
      51931: function (e, t, n) {
        n.d(t, {
          UA: function () {
            return b;
          },
        });
        var r,
          a,
          i,
          o = n(4942),
          s = n(68711),
          u = n(2040),
          c = n(34866),
          d = n(50339),
          l = n(27021),
          p = n(9984),
          f = n(11714),
          h = n(38278),
          v = (s.CHAIN_ID.BLAST, s.CHAIN_ID.BASE, "81457,8453".split(","));
        v &&
          v.length > 0 &&
          v.map(function (e) {
            return Number(e);
          });
        s.CHAIN_ID.BASE, s.CHAIN_ID.BLAST;
        var m = "8453,81457".split(",");
        m &&
          m.length > 0 &&
          m.map(function (e) {
            return Number(e);
          });
        parseInt(null !== (r = "8453") ? r : "1"),
          (a = {}),
          (0, o.Z)(a, s.CHAIN_ID.LINEA, (0, h.R)(s.CHAIN_ID.LINEA)),
          (0, o.Z)(
            a,
            s.CHAIN_ID.BLASTSEPOLIA,
            (0, h.R)(s.CHAIN_ID.BLASTSEPOLIA)
          ),
          (0, o.Z)(a, s.CHAIN_ID.BLAST, (0, h.R)(s.CHAIN_ID.BLAST)),
          (0, o.Z)(a, s.CHAIN_ID.ARBITRUM, (0, h.R)(s.CHAIN_ID.ARBITRUM)),
          (0, o.Z)(a, s.CHAIN_ID.BASE, (0, h.R)(s.CHAIN_ID.BASE));
        var b =
          ((i = {}),
          (0, o.Z)(i, s.CHAIN_ID.LINEA, (0, f.n)(s.CHAIN_ID.LINEA, u.P)),
          (0, o.Z)(
            i,
            s.CHAIN_ID.BLASTSEPOLIA,
            (0, f.n)(s.CHAIN_ID.BLASTSEPOLIA, c.d)
          ),
          (0, o.Z)(i, s.CHAIN_ID.BLAST, (0, f.n)(s.CHAIN_ID.BLAST, d.A)),
          (0, o.Z)(i, s.CHAIN_ID.ARBITRUM, (0, f.n)(s.CHAIN_ID.ARBITRUM, l.y)),
          (0, o.Z)(i, s.CHAIN_ID.BASE, (0, f.n)(s.CHAIN_ID.BASE, p.u)),
          i);
        s.CHAIN_ID.BASE,
          s.CHAIN_ID.BLAST,
          s.CHAIN_ID.BLASTSEPOLIA,
          s.CHAIN_ID.ARBITRUM,
          s.CHAIN_ID.LINEA,
          s.CHAIN_ID.GOERLI,
          s.CHAIN_ID.BLAST,
          s.CHAIN_ID.BASE,
          s.CHAIN_ID.BASE;
      },
      62615: function (e, t, n) {
        n.d(t, {
          p8: function () {
            return i;
          },
          sO: function () {
            return u;
          },
          tV: function () {
            return s;
          },
        });
        var r,
          a = n(4942),
          i = 18,
          o = (function (e) {
            return (
              (e.FAVORITE = "favorite"),
              (e.EARN_FAVORITE = "earn.favorite"),
              (e.VOLUME_24H = "24HV"),
              (e.CHANGE_24H = "24HC"),
              (e.BOOSTED_LIQUIDITY = "effectLiq"),
              (e.TVL = "tvl"),
              (e.OI = "oi"),
              (e.APY = "apy"),
              e
            );
          })({}),
          s =
            ((r = {}),
            (0, a.Z)(r, o.FAVORITE, "24HV"),
            (0, a.Z)(r, o.EARN_FAVORITE, "earn.estApy"),
            (0, a.Z)(r, o.VOLUME_24H, "24HV"),
            (0, a.Z)(r, o.CHANGE_24H, "24HC"),
            (0, a.Z)(r, o.TVL, "tvl"),
            (0, a.Z)(r, o.OI, "oiS"),
            (0, a.Z)(r, o.APY, "table.liqApy"),
            (0, a.Z)(r, o.BOOSTED_LIQUIDITY, "effectLiq"),
            5),
          u = "https://api.synfutures.com";
      },
      61721: function (e, t, n) {
        n.d(t, {
          fm: function () {
            return r;
          },
          zI: function () {
            return a;
          },
        });
        "".concat("syn", "-theme"), "".concat("syn", "-all-user-info");
        var r = "JWT_FOR_TGP",
          a = "LOCAL_RPC_URL";
      },
      22935: function (e, t, n) {
        n.d(t, {
          R: function () {
            return d;
          },
          _q: function () {
            return l;
          },
          gI: function () {
            return c;
          },
        });
        var r = n(71002),
          a = (n(72958), n(61721), n(30020)),
          i = n(48501),
          o = n(21080),
          s = n(37113),
          u = n.n(s),
          c = function (e) {
            var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 3e3;
            return (
              (!(arguments.length > 2 && void 0 !== arguments[2]) ||
                arguments[2]) &&
                e(),
              setInterval(function () {
                e();
              }, t)
            );
          };
        function d(e) {
          var t = u().clone(e);
          if (t && t)
            try {
              Object.keys(t).forEach(function (e) {
                var n = t[e];
                if (
                  null !== n &&
                  void 0 !== n &&
                  n.bn &&
                  null !== n &&
                  void 0 !== n &&
                  n.value
                )
                  t[e] = o.O$.from(n.value);
                else if (
                  null === n ||
                  void 0 === n ||
                  !n._hex ||
                  !o.O$.isBigNumber(n) ||
                  n instanceof o.O$
                ) {
                  if (
                    null !== n &&
                    void 0 !== n &&
                    n.hex &&
                    "BigNumber" ===
                      (null === n || void 0 === n ? void 0 : n.type)
                  )
                    t[e] = o.O$.from(n);
                  else if (
                    "object" === (0, r.Z)(n) &&
                    n &&
                    Object.keys(n).length > 0
                  )
                    if (n instanceof a.$ || n instanceof i.A) t[e] = n;
                    else {
                      var s = d(n);
                      t[e] = s;
                    }
                } else t[e] = o.O$.from(n);
              });
            } catch (n) {}
          return t;
        }
        function l(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 300,
            n = null;
          return function () {
            for (var r = arguments.length, a = new Array(r), i = 0; i < r; i++)
              a[i] = arguments[i];
            return new Promise(function (r, i) {
              n && clearTimeout(n),
                (n = setTimeout(function () {
                  e.apply(void 0, a)
                    .then(r)
                    .catch(i);
                }, t));
            });
          };
        }
      },
      86265: function (e, t, n) {
        n.d(t, {
          ET: function () {
            return v;
          },
          If: function () {
            return I;
          },
          Md: function () {
            return h;
          },
          Yu: function () {
            return Z;
          },
          c2: function () {
            return S;
          },
          dF: function () {
            return y;
          },
          iL: function () {
            return w;
          },
          uf: function () {
            return A;
          },
        });
        var r = n(78997),
          a = n(79890),
          i = n(21080),
          o = n(57331),
          s = n(14846),
          u = (n(37113), n(72958)),
          c = n(62615),
          d = n(81773),
          l = n(30020),
          p = n(72411);
        function f(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 4,
            n = e.toString(10),
            a = (function (e) {
              var t = h(e).toString(10).split(".")[1];
              if (t) {
                for (var n = 0, r = 0; r < t.length && "0" === t[r]; r++) n++;
                return n;
              }
              return 0;
            })(e),
            i = n.split("."),
            o = (0, r.Z)(i, 2),
            s = o[0],
            u = o[1];
          if (a > 20 || 0 === a) return n;
          var c = u.slice(a, u.length).slice(0, t),
            l = "".concat(c).concat("0".repeat(t - c.length));
          return "".concat(s, ".0").concat(d.V[a]).concat(l);
        }
        function h(e) {
          var t = e;
          return (
            "ether" ===
              (arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "normal") &&
              i.O$.isBigNumber(e) &&
              (t = o.formatEther(e)),
            "undefined" === typeof t && (t = 0),
            new a.Z(t.toString(10), 10)
          );
        }
        function v(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 10,
            n = h(e);
          return n.isNaN() ? "" : n.toString(t);
        }
        var m = function (e) {
            var t = e.toString().split(".");
            return t.length > 0
              ? ((t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")),
                t.join("."))
              : "";
          },
          b = ["K", "M", "B", "T"],
          g = Math.pow(10, 3);
        function k(e, t, n) {
          var r =
            arguments.length > 3 && void 0 !== arguments[3]
              ? arguments[3]
              : u.z9;
          n || (n = a.Z.ROUND_DOWN);
          var i = b.findIndex(function (e) {
              return e === t;
            }),
            o = e.toString(10);
          return (e = e.div(g)).gte(g) && "T" !== t
            ? k(e, b[i + 1], n, r)
            : ("T" === t && e.gte(g)
                ? (e = e.integerValue(n))
                : 0 !== r && (e = e.precision(r, n)),
              (o = ""
                .concat(0 === r ? e.toFixed(0, n) : e.toPrecision(r, n))
                .concat(b[i])),
              { numBN: e, numStr: o });
        }
        function I(e) {
          var t = e.num,
            n = e.isShowSeparator,
            r = void 0 === n || n,
            i = e.type,
            o = void 0 === i ? "normal" : i,
            s = e.isOperateNum,
            l = void 0 !== s && s,
            p = e.isShowTBMK,
            v = void 0 !== p && p,
            b = e.isShowApproximatelyEqualTo,
            g = void 0 === b || b,
            I = e.showPositive,
            x = e.roundingMode,
            A = void 0 === x ? a.Z.ROUND_DOWN : x,
            w = e.significantDigits,
            y = void 0 === w ? c.tV : w,
            Z = e.minDecimalPlaces,
            S = void 0 === Z ? u.z9 : Z,
            C = e.showTrailingZeros,
            N = void 0 === C || C,
            E = h(t);
          (E.isNaN() || E.eq(1 / 0)) && (E = h(0));
          var P = "";
          E.isNegative()
            ? ((P = "-"), (E = E.abs()))
            : I && E.gt(0) && (P = "+");
          var T = E.toString(10);
          if (l) T = E.gte(1) ? E.toFixed(S, A) : E.toPrecision(S, A);
          else if (E.eq(0)) T = E.toFixed(2, A);
          else if (E.gte(1e4)) {
            if (((T = E.integerValue(A).toString()), v))
              T = k(E, "K", A, S).numStr;
          } else if (E.gte(1e3) && E.lt(1e4)) {
            if ("price" === o) T = (E = E.precision(y, A)).toPrecision(y, A);
            else if (((T = E.precision(y, A).toPrecision(y, A)), v))
              T = k(E, "K", A, S).numStr;
          } else if (E.gte(1) && E.lt(1e3))
            (E = E.precision(y, A)),
              (T = 0 === S ? E.toFixed(0, A) : E.toPrecision(y, A));
          else if (E.gte(1e-4) && E.lt(1))
            T =
              "price" === o
                ? N && E.lt((0, a.Z)(d.c)) && E.gt((0, a.Z)(0))
                  ? f((E = E.precision(y, A)))
                  : (E = E.precision(y, A)).toPrecision(y, A)
                : E.toFixed(S, A);
          else {
            if ("price" !== o)
              return (
                (T = E.toFixed(S, A)), "".concat(g ? "\u2248" : "").concat(T)
              );
            var L = (E = E.precision(y - 1, A)).decimalPlaces() || 0;
            T =
              N && E.lt((0, a.Z)(d.c)) && E.gt((0, a.Z)(0))
                ? f(E)
                : L > 8
                ? E.toFixed(8, A)
                : E.toPrecision(4, A);
          }
          return r && (T = m(T)), "".concat(P).concat(T);
        }
        var x = function (e) {
          var t = e.toString().split(".");
          return t.length > 0
            ? ((t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")), t.join("."))
            : "";
        };
        function A(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : u.z9,
            n =
              !(arguments.length > 2 && void 0 !== arguments[2]) ||
              arguments[2],
            r =
              arguments.length > 3 && void 0 !== arguments[3]
                ? arguments[3]
                : a.Z.ROUND_DOWN,
            i = arguments.length > 4 && void 0 !== arguments[4] && arguments[4],
            o = h(e);
          (o.isNaN() || o.eq(1 / 0)) && (o = h(0));
          var s,
            c = o.toFixed(t, r);
          return (
            n && (c = x(c)),
            i &&
              ((s = (s = c).toString()).match(/\./) &&
                (s = s.replace(/\.?0+$/, "")),
              (c = s)),
            c
          );
        }
        function w(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 4,
            n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
          if (((e = e.toString()), 0 === Number(e))) return e;
          var r = n ? /[^0-9.-]/g : /[^0-9.]/g,
            a = (e = e.replace(r, "")).split(".");
          if (a.length >= 3) return "";
          var i = a[0];
          if (i.length > 0)
            for (; i.length > 1 && "0" === i[0]; ) {
              var o;
              i = null === (o = i) || void 0 === o ? void 0 : o.substring(1);
            }
          else 0 === e.indexOf(".") && (i = "0");
          var s,
            u = a[1] || "";
          u &&
            u.length > t &&
            (u = null === (s = u) || void 0 === s ? void 0 : s.substring(0, t));
          return (e =
            u && 0 !== u.length
              ? "".concat(i, ".").concat(u)
              : i + (2 === a.length && 0 !== t ? "." : ""));
        }
        function y(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
            n = e || u.xE;
          return (
            t &&
              !n.eq(u.xE) &&
              (n = (function (e) {
                return e.eq(0) ? e : (0, p.wdiv)(Z(1), e);
              })(n)),
            o.formatEther(n)
          );
        }
        function Z(e) {
          var t =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
          return (0, s.parseUnits)(e.toString()).div(Math.pow(10, t));
        }
        function S(e) {
          var t = e.percentage,
            n = e.hundredfold,
            r = void 0 === n || n,
            i = e.decimals,
            o = void 0 === i ? 2 : i,
            s = e.roundingMode,
            u = void 0 === s ? a.Z.ROUND_DOWN : s,
            c = l.$.from(t).mul(r ? 100 : 1);
          return "".concat(A(c, o, !1, u), "%");
        }
      },
      84407: function (e, t, n) {
        n.d(t, {
          A3: function () {
            return l;
          },
          lp: function () {
            return p;
          },
        });
        var r = n(74165),
          a = n(15861),
          i = n(74790),
          o = n(73159),
          s = n.n(o),
          u = n(37113),
          c = n.n(u),
          d = n(61721);
        function l(e) {
          return i.Z.get("".concat(d.fm, "-").concat(e));
        }
        function p(e) {
          return f.apply(this, arguments);
        }
        function f() {
          return (f = (0, a.Z)(
            (0, r.Z)().mark(function e(t) {
              var n, a;
              return (0, r.Z)().wrap(function (e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (e.next = 2), s().getItem(d.zI);
                    case 2:
                      if (((e.t0 = e.sent), e.t0)) {
                        e.next = 5;
                        break;
                      }
                      e.t0 = {};
                    case 5:
                      if (
                        ((n = e.t0),
                        !(a = c().get(n, [t || ""])) ||
                          null === a ||
                          void 0 === a ||
                          !a.length)
                      ) {
                        e.next = 11;
                        break;
                      }
                      if (!a.startsWith("wss")) {
                        e.next = 10;
                        break;
                      }
                      return e.abrupt("return", { rpc: a, type: "wss" });
                    case 10:
                      return e.abrupt("return", { rpc: a, type: "https" });
                    case 11:
                    case "end":
                      return e.stop();
                  }
              }, e);
            })
          )).apply(this, arguments);
        }
      },
      77377: function (e, t, n) {
        n.d(t, {
          z3: function () {
            return s;
          },
          zR: function () {
            return c;
          },
        });
        var r = n(1413),
          a = n(72411),
          i = n(51931),
          o = n(62615);
        function s(e, t) {
          return (0, r.Z)(
            (0, r.Z)({}, e),
            {},
            {
              id: e.address.toLowerCase(),
              address: e.address.toLowerCase(),
              chainId: t,
              decimals: e.decimals || o.p8,
            }
          );
        }
        function u(e, t, n) {
          var r, a;
          if (!n) {
            var o = i.UA[e];
            n = null === o || void 0 === o ? void 0 : o.wrappedNativeToken;
          }
          return (
            (null === t || void 0 === t ? void 0 : t.toLowerCase()) ===
            (null === (r = n) ||
            void 0 === r ||
            null === (a = r.address) ||
            void 0 === a
              ? void 0
              : a.toLowerCase())
          );
        }
        function c(e) {
          var t = e.token,
            n = e.chainId,
            r = e.marketType,
            o = e.unWrappedNativeToken,
            c = void 0 !== o && o,
            d = i.UA[n];
          d && c && u(n, t.address) && d.nativeToken && (t = d.nativeToken);
          var l = s(t, n);
          return (
            r &&
              [a.MarketType.LINK, a.MarketType.EMG, a.MarketType.PYTH].includes(
                r
              ) &&
              (l.id = "".concat(r, "_").concat(l.symbol)),
            l
          );
        }
      },
      5727: function (e, t, n) {
        var r = n(1413),
          a = n(78997),
          i = n(4942),
          o = n(74165),
          s = n(15861),
          u = n(15671),
          c = n(43144),
          d = (n(68167), n(68711)),
          l = n(66358),
          p = n(76614),
          f = n(37113),
          h = n.n(f),
          v = n(51931),
          m = n(92231),
          b = n(22935),
          g = (n(72958), n(72411)),
          k = n(66850);
        function I(e, t, n, a, i) {
          if (
            ((n = n.toLowerCase()),
            i || (i = {}),
            i.accountMap || (i.accountMap = {}),
            i.positionMap || (i.positionMap = {}),
            i.portfolioMap || (i.portfolioMap = {}),
            i.orderMap || (i.orderMap = {}),
            i.rangeMap || (i.rangeMap = {}),
            a)
          ) {
            var o = a.blockInfo || { height: 0, timestamp: 0 };
            i.blockInfo = o;
            var s = (function (e, t, n, a) {
              var i = (0, k._4)(e, t),
                o = (0, k.l0)(i, n.expiry),
                s = (0, k.Kk)(t, n.expiry);
              return (0, r.Z)(
                {
                  id: o,
                  instrumentId: t.toLowerCase(),
                  pairId: s,
                  accountId: i,
                  blockInfo: a,
                },
                n
              );
            })(t, n, a, o);
            i.portfolioMap[s.id] = s;
            var u = a.position,
              c = (function (e) {
                var t = e.portfolio,
                  n = e.position,
                  a = e.userAddr,
                  i = e.instrumentAddr,
                  o = e.blockInfo,
                  s = (0, k._4)(a, i),
                  u = (0, k.l0)(s, t.expiry),
                  c = u,
                  d = (0, k.Kk)(i, t.expiry);
                return (0, r.Z)(
                  {
                    id: c,
                    instrumentId: i.toLowerCase(),
                    accountId: s,
                    portfolioId: u,
                    pairId: d,
                    blockInfo: n.blockInfo || o,
                  },
                  n
                );
              })({
                userAddr: t,
                instrumentAddr: n,
                portfolio: a,
                position: u,
                blockInfo: o,
              });
            (i.positionMap[c.id] = c),
              a.orders &&
                a.orders.forEach(function (e) {
                  var s = (function (e) {
                    var t = e.userAddr,
                      n = e.instrumentAddr,
                      a = e.portfolio,
                      i = e.order,
                      o = e.blockInfo,
                      s = (0, k._4)(t, n),
                      u = (0, k.l0)(s, a.expiry),
                      c = (0, k.NO)(u, i.oid),
                      d = (0, k.Kk)(n, a.expiry);
                    return (0, r.Z)(
                      {
                        id: c,
                        instrumentId: n.toLowerCase(),
                        accountId: s,
                        portfolioId: u,
                        pairId: d,
                        blockInfo: i.blockInfo || o,
                      },
                      i
                    );
                  })({
                    userAddr: t,
                    instrumentAddr: n,
                    portfolio: a,
                    order: e,
                    blockInfo: o,
                  });
                  i.orderMap[s.id] = s;
                }),
              a.ranges &&
                a.ranges.forEach(function (e) {
                  var s = (function (e) {
                    var t = e.userAddr,
                      n = e.instrumentAddr,
                      a = e.portfolio,
                      i = e.range,
                      o = e.blockInfo,
                      s = (0, k._4)(t, n),
                      u = (0, k.l0)(s, a.expiry),
                      c = (0, k.W1)(u, i.rid),
                      d = (0, k.Kk)(n, a.expiry);
                    return (0, r.Z)(
                      {
                        id: c,
                        instrumentId: n.toLowerCase(),
                        accountId: s,
                        portfolioId: u,
                        pairId: d,
                        blockInfo: i.blockInfo || o,
                      },
                      i
                    );
                  })({
                    userAddr: t,
                    instrumentAddr: n,
                    portfolio: a,
                    range: e,
                    blockInfo: o,
                  });
                  i.rangeMap[s.id] = s;
                });
          }
          return (i.chainId = e), i;
        }
        var x = n(68062);
        var A,
          w,
          y = n(48920),
          Z = n(20252),
          S = n(13676),
          C = JSON.parse(
            '{"chainConfig":{"8453":{"chainId":8453,"graphAddr":"https://api.synfutures.com/thegraph/v3-base-launchpad"}}}'
          ),
          N =
            ((A = {}),
            (0, i.Z)(A, S.Stage.INVALID, {
              color: "#3D4F5C",
              bgColor: "rgba(61, 79, 92, 0.20)",
              i18nId: "launchpad.invalid",
            }),
            (0, i.Z)(A, S.Stage.LIVE, {
              color: "#14B84B",
              bgColor: "rgba(20, 184, 75, 0.20)",
              i18nId: "launchpad.live",
            }),
            (0, i.Z)(A, S.Stage.SUSPENDED, {
              color: "#FFAA00",
              bgColor: "#FFAA0033",
              i18nId: "launchpad.suspend",
            }),
            (0, i.Z)(A, S.Stage.UPCOMING, {
              color: "#00BFBF",
              bgColor: "rgba(0, 191, 191, 0.20)",
              i18nId: "launchpad.upcoming",
            }),
            (function (e) {
              return (
                (e.deposit = "DEPOSIT"),
                (e.withdrawal = "WITHDRAW"),
                (e.depositFor = "DEPOSITFOR"),
                e
              );
            })({}));
        (w = {}),
          (0, i.Z)(w, N.deposit, { i18nId: "launchpad.vaultDeposit" }),
          (0, i.Z)(w, N.withdrawal, { i18nId: "launchpad.vaultWithdrawal" }),
          (0, i.Z)(w, N.depositFor, { i18nId: "launchpad.vaultDeposit" });
        var E,
          P,
          T = n(87677),
          L = n(43041),
          _ = n(81029),
          M = n(70630),
          F = n(15092),
          O = n(24011),
          D = (function (e) {
            return (e.H_1 = "1h"), (e.D_1 = "1d"), (e.W_1 = "1w"), e;
          })({}),
          R =
            ((E = {}),
            (0, i.Z)(E, D.H_1, 3e5),
            (0, i.Z)(E, D.D_1, 72e5),
            (0, i.Z)(E, D.W_1, 864e5),
            (0, r.Z)((0, r.Z)({}, T.PoolType), { OTHER: 100 })),
          U =
            ((P = {}),
            (0, i.Z)(P, R.PANCAKE_V3, {
              name: "Pancake V3",
              imageSrc: F.Z,
              version: "V3",
              color: "#fa0",
            }),
            (0, i.Z)(P, R.UNISWAP_V3, {
              name: "Uniswap V3",
              imageSrc: M.Z,
              version: "V3",
              color: "#fc74fe",
            }),
            (0, i.Z)(P, R.UNISWAP_V2, {
              name: "Uniswap V2",
              imageSrc: M.Z,
              version: "V2",
              color: "#fc74fe",
            }),
            (0, i.Z)(P, R.AERODROME_V3, {
              name: "Aerodrome V3",
              imageSrc: L,
              version: "V3",
              color: "#00bfbf",
            }),
            (0, i.Z)(P, R.AERODROME_V2, {
              name: "Aerodrome V2",
              imageSrc: L,
              version: "V2",
              color: "#00bfbf",
            }),
            (0, i.Z)(P, R.SUSHISWAP_V3, {
              name: "Sushiswap V3",
              imageSrc: O.Z,
              version: "V3",
              color: "#b54848",
            }),
            (0, i.Z)(P, R.ALB_V3, {
              name: "ALB V3",
              imageSrc: _,
              version: "V3",
              color: "#4d88ff",
            }),
            (0, i.Z)(P, R.OTHER, {
              name: "Others",
              imageSrc: "",
              version: "",
              color: "#000000",
            }),
            P),
          B =
            (h().orderBy(
              Object.values(T.PoolType).filter(function (e) {
                return "number" === typeof e;
              }),
              [
                function (e) {
                  var t;
                  return null === (t = h().get(U, [e])) || void 0 === t
                    ? void 0
                    : t.name.toLowerCase();
                },
              ],
              ["asc"]
            ),
            n(33702)),
          H = n(30020),
          q = n(7496),
          V = (function (e) {
            return (e.TGP = "tgp"), (e.ODYSSEY = "odyssey"), e;
          })({}),
          j = n(62615),
          $ = n(242),
          W = n(84407);
        function K(e) {
          return G.apply(this, arguments);
        }
        function G() {
          return (G = (0, s.Z)(
            (0, o.Z)().mark(function e(t) {
              var n, a, i, s, u, c, d, l, p;
              return (0, o.Z)().wrap(function (e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (
                        (n = t.url),
                        (a = t.address),
                        (i = t.config),
                        (s = t.type),
                        (u = t.domain),
                        (c = s && s === V.TGP && a ? (0, W.A3)(a) : void 0),
                        null !== i &&
                          void 0 !== i &&
                          i.params &&
                          ((d = new URLSearchParams(i.params)).sort(),
                          (l = d.toString()),
                          (n += (n.includes("?") ? "&" : "?") + l),
                          (i.params = void 0)),
                        null !== (p = Y({ url: n, jwtToken: c, domain: u })) &&
                          void 0 !== p &&
                          p.url &&
                          (n = p.url),
                        (e.next = 7),
                        q.Z.get(
                          n,
                          (0, r.Z)(
                            (0, r.Z)({}, i),
                            {},
                            {
                              headers: (0, r.Z)(
                                (0, r.Z)(
                                  {},
                                  null === i || void 0 === i
                                    ? void 0
                                    : i.headers
                                ),
                                {},
                                { Authorization: c },
                                null === p || void 0 === p
                                  ? void 0
                                  : p.encryptedData
                              ),
                            }
                          )
                        )
                      );
                    case 7:
                      return e.abrupt("return", e.sent);
                    case 8:
                    case "end":
                      return e.stop();
                  }
              }, e);
            })
          )).apply(this, arguments);
        }
        function Y(e) {
          var t = e.url,
            n = e.jwtToken,
            r = e.body,
            a = e.domain;
          if (
            (a || (a = j.sO),
            t.startsWith("http") ||
              (t.startsWith("/") || (t = "/" + t), (t = a + t)),
            t.startsWith(a))
          ) {
            var i = t.replace(a, "");
            return {
              encryptedData: (0, $.R)({ uri: i, authorization: n, body: r }),
              url: t,
            };
          }
        }
        var z = n(65418),
          Q = n.n(z),
          X = n(35150);
        function J(e, t) {
          var n = H.$.from(e);
          return n.isZero() ? n : t ? H.$.from(1).div(n) : n;
        }
        var ee = (0, b._q)(
            (function () {
              var e = (0, s.Z)(
                (0, o.Z)().mark(function e(t, n) {
                  var a, i, s, u;
                  return (0, o.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            K({
                              url: "/v3/public/perp/market/instrument/v1",
                              config: { params: { chainId: t, address: n } },
                            })
                          );
                        case 2:
                          if (
                            null === (i = e.sent) ||
                            void 0 === i ||
                            null === (a = i.data) ||
                            void 0 === a ||
                            !a.data
                          ) {
                            e.next = 7;
                            break;
                          }
                          return (
                            (s = (0, b.R)(i.data.data)),
                            (u = s.amms),
                            e.abrupt(
                              "return",
                              (0, r.Z)(
                                (0, r.Z)({}, s),
                                {},
                                {
                                  amms: u.reduce(function (e, t) {
                                    return e.set(t.expiry, t), e;
                                  }, new Map()),
                                }
                              )
                            )
                          );
                        case 7:
                          return e.abrupt("return", null);
                        case 8:
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
            0
          ),
          te = (function () {
            var e = (0, s.Z)(
              (0, o.Z)().mark(function e(t) {
                var n, a, i, s, u, c, d, l;
                return (0, o.Z)().wrap(function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        return (
                          (a = t.chainId),
                          (i = t.address),
                          (s = t.expiry),
                          (e.next = 3),
                          K({
                            url: "/v3/public/perp/market/pairInfo",
                            config: {
                              params: { chainId: a, address: i, expiry: s },
                            },
                          })
                        );
                      case 3:
                        if (
                          null === (u = e.sent) ||
                          void 0 === u ||
                          null === (n = u.data) ||
                          void 0 === n ||
                          !n.data
                        ) {
                          e.next = 8;
                          break;
                        }
                        return (
                          (d =
                            null === u ||
                            void 0 === u ||
                            null === (c = u.data) ||
                            void 0 === c
                              ? void 0
                              : c.data),
                          (l = d.isInverse),
                          e.abrupt(
                            "return",
                            (0, r.Z)(
                              (0, r.Z)({}, d),
                              {},
                              {
                                chainId: a,
                                id: (0, k.Kk)(d.instrumentAddress, d.expiry),
                                fairPrice: H.$.from(d.fairPrice),
                                markPrice: H.$.from(d.markPrice),
                                fairPriceChange24h: H.$.from(
                                  d.fairPriceChange24h
                                ),
                                markPriceChange24h: H.$.from(
                                  d.fairPriceChange24h
                                ),
                                liquidityApy: H.$.from(d.liquidityApy),
                                volume24h: H.$.from(d.volume24h),
                                openInterests: H.$.from(d.openInterests),
                                tvl: H.$.from(d.tvl),
                                volume24hUsd: H.$.from(d.volume24hUsd),
                                tvlUsd: H.$.from(d.tvlUsd),
                                effectLiqTvl: H.$.from(d.effectLiqTvl),
                                openInterestsUsd: H.$.from(d.openInterestsUsd),
                                isInverse: l,
                                longOi: H.$.from(d.longOi),
                                shortOi: H.$.from(d.shortOi),
                                _1hPeriodsFunding: {
                                  long: H.$.from(d._1hPeriodsFunding.long),
                                  short: H.$.from(d._1hPeriodsFunding.short),
                                },
                                _1hLastFunding: {
                                  long: H.$.from(d._1hLastFunding.long),
                                  short: H.$.from(d._1hLastFunding.short),
                                },
                                poolFee24h: H.$.from(d.poolFee24h),
                              }
                            )
                          )
                        );
                      case 8:
                        return e.abrupt("return", null);
                      case 9:
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
          ne =
            ((0, b._q)(
              (function () {
                var e = (0, s.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var n, a, i, s, u, c, d, l;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (a = t.chainId),
                              (i = t.address),
                              (s = t.expiry),
                              (u = t.sdk),
                              (e.next = 3),
                              K({
                                url: "/v3/public/perp/market/orderBook",
                                config: {
                                  params: { chainId: a, address: i, expiry: s },
                                },
                              })
                            );
                          case 3:
                            if (
                              null === (c = e.sent) ||
                              void 0 === c ||
                              null === (n = c.data) ||
                              void 0 === n ||
                              !n.data
                            ) {
                              e.next = 8;
                              break;
                            }
                            return (
                              (d = (0, b.R)(c.data.data)),
                              (l = h().reduce(
                                d,
                                function (e, t, n) {
                                  t.tick2Pearl = h().reduce(
                                    t.tick2Pearl,
                                    function (e, t, n) {
                                      return (
                                        e.set(Number(n), {
                                          liquidityNet: t[0],
                                          left: t[1],
                                        }),
                                        e
                                      );
                                    },
                                    new Map()
                                  );
                                  var a =
                                    u.perpDataSource.depth.getDepthDataByLiquidityDetails(
                                      t,
                                      t.size,
                                      t.tickDelta
                                    );
                                  if (t.isInverse) {
                                    var i = a.left;
                                    (a.left = a.right.map(function (e) {
                                      return (0,
                                      r.Z)((0, r.Z)({}, e), {}, { price: J(e.price, t.isInverse).toNumber() });
                                    })),
                                      (a.right = i.map(function (e) {
                                        return (0,
                                        r.Z)((0, r.Z)({}, e), {}, { price: J(e.price, t.isInverse).toNumber() });
                                      }));
                                  }
                                  return (e[n] = a), e;
                                },
                                {}
                              )),
                              e.abrupt("return", l)
                            );
                          case 8:
                            return e.abrupt("return", null);
                          case 9:
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
              0
            ),
            (0, b._q)(
              (function () {
                var e = (0, s.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var n, a, i, s, u, c, d, l, p;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (a = t.chainId),
                              (i = t.address),
                              (s = t.expiry),
                              (u = t.sdk),
                              (e.next = 3),
                              K({
                                url: "/v3/public/perp/market/depth",
                                config: {
                                  params: { chainId: a, address: i, expiry: s },
                                },
                              })
                            );
                          case 3:
                            if (
                              null === (c = e.sent) ||
                              void 0 === c ||
                              null === (n = c.data) ||
                              void 0 === n ||
                              !n.data
                            ) {
                              e.next = 10;
                              break;
                            }
                            return (
                              ((d = (0, b.R)(c.data.data)).tick2Pearl =
                                h().reduce(
                                  d.tick2Pearl,
                                  function (e, t, n) {
                                    return (
                                      e.set(Number(n), {
                                        liquidityNet: t[0],
                                        left: t[1],
                                      }),
                                      e
                                    );
                                  },
                                  new Map()
                                )),
                              (l =
                                u.perpDataSource.depth.getDepthRangeDataByLiquidityDetails(
                                  d,
                                  d.size,
                                  d.stepRatio,
                                  null === d || void 0 === d
                                    ? void 0
                                    : d.isInverse
                                )),
                              d.isInverse &&
                                ((p = l.left),
                                (l.left = l.right.map(function (e) {
                                  return (0,
                                  r.Z)((0, r.Z)({}, e), {}, { price: J(e.price, d.isInverse).toNumber() });
                                })),
                                (l.right = p.map(function (e) {
                                  return (0,
                                  r.Z)((0, r.Z)({}, e), {}, { price: J(e.price, d.isInverse).toNumber() });
                                }))),
                              e.abrupt("return", l)
                            );
                          case 10:
                            return e.abrupt("return", null);
                          case 11:
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
              0
            ),
            (0, b._q)(
              (function () {
                var e = (0, s.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var n, a, i, s, u, c, d, l;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (a = t.chainId),
                              (i = t.address),
                              (s = t.expiry),
                              (u = t.chartDuration),
                              (e.next = 3),
                              K({
                                url: "/v3/public/perp/market/funding",
                                config: {
                                  params: {
                                    chainId: a,
                                    address: i,
                                    expiry: s,
                                    type: u,
                                  },
                                },
                              })
                            );
                          case 3:
                            if (
                              null === (c = e.sent) ||
                              void 0 === c ||
                              null === (n = c.data) ||
                              void 0 === n ||
                              !n.data
                            ) {
                              e.next = 7;
                              break;
                            }
                            return (
                              (l =
                                null === c ||
                                void 0 === c ||
                                null === (d = c.data) ||
                                void 0 === d
                                  ? void 0
                                  : d.data.map(function (e) {
                                      return (0, r.Z)({}, e);
                                    })),
                              e.abrupt(
                                "return",
                                l.map(function (e) {
                                  var t = e.longFundingRate < 0;
                                  return (0,
                                  r.Z)((0, r.Z)({}, e), {}, { payRate: H.$.from(t ? e.longFundingRate : e.shortFundingRate), receiveRate: H.$.from(t ? e.shortFundingRate : e.longFundingRate), isLongPay: t });
                                })
                              )
                            );
                          case 7:
                            return e.abrupt("return", null);
                          case 8:
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
              0
            ),
            (0, b._q)(
              (function () {
                var e = (0, s.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var n, r, a, i, s, u, c, d, l, p, f, h;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = t.chainId),
                              (a = t.instrumentAddr),
                              (i = t.expiry),
                              (s = t.chartDuration),
                              (u =
                                (u = t.timeEnd) ||
                                Math.floor(Date.now() / 1e3)),
                              (c = Q()(1e3 * u).second(0)),
                              (d = Q()(1e3 * u)),
                              (l = d.unix()),
                              120,
                              s === X.KlineInterval.DAY
                                ? ((l = d.add(-120, "day").unix()),
                                  (c = c.add(1, "day")))
                                : s === X.KlineInterval.WEEK
                                ? ((l = d.add(-840, "day").unix()),
                                  (c = c.add(7, "day")))
                                : s === X.KlineInterval.MINUTE
                                ? ((l = d.add(-120, "minutes").unix()),
                                  (c = c.add(1, "minutes")))
                                : s === X.KlineInterval.FIVE_MINUTE
                                ? ((l = d.add(-600, "minutes").unix()),
                                  (c = c.add(5, "minutes")))
                                : s === X.KlineInterval.FIFTEEN_MINUTE
                                ? ((l = d.add(-1800, "minutes").unix()),
                                  (c = c.add(15, "minutes")))
                                : s === X.KlineInterval.THIRTY_MINUTE
                                ? ((l = d.add(-3600, "minutes").unix()),
                                  (c = c.add(30, "minutes")))
                                : s === X.KlineInterval.HOUR
                                ? ((l = d.add(-120, "hours").unix()),
                                  (c = c.add(1, "hours")))
                                : s === X.KlineInterval.FOUR_HOUR &&
                                  ((l = d.add(-480, "hours").unix()),
                                  (c = c.add(4, "hours"))),
                              (p = c.unix()),
                              (e.next = 10),
                              K({
                                url: "/v3/public/perp/market/kline",
                                config: {
                                  params: {
                                    chainId: r,
                                    instrument: a,
                                    expiry: i,
                                    interval: s,
                                    startTs: l,
                                    endTs: p,
                                  },
                                },
                              })
                            );
                          case 10:
                            return (
                              (f = e.sent),
                              (h =
                                null === f ||
                                void 0 === f ||
                                null === (n = f.data) ||
                                void 0 === n
                                  ? void 0
                                  : n.data).length &&
                                h.length >= 2 &&
                                0 === h[h.length - 1].baseVolume &&
                                (h = h.slice(0, h.length - 1)),
                              e.abrupt("return", h)
                            );
                          case 14:
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
              0
            ),
            (function (e) {
              return (
                (e.MARKET = "sub_market"),
                (e.VAULT = "sub_vault"),
                (e.EVENT = "sub_event"),
                (e.PAIR_INFO = "sub_pair_info"),
                (e.PORTFOLIO = "sub_portfolio"),
                e
              );
            })({})),
          re = (function (e) {
            return (
              (e.MARKET = "un_sub_market"),
              (e.VAULT = "un_sub_vault"),
              (e.EVENT = "un_sub_event"),
              (e.PAIR_INFO = "un_sub_pair_info"),
              (e.PORTFOLIO = "un_sub_portfolio"),
              e
            );
          })({}),
          ae = (function (e) {
            return (
              (e.sdkConfigChanged = "sdkConfigChanged"),
              (e.dappConfigChanged = "dappConfigChanged"),
              (e.blockNumberChanged = "blockNumberChanged"),
              (e.marketListChanged = "marketListChanged"),
              (e.vaultChanged = "vaultChanged"),
              (e.marketFeaturePairsUpdated = "marketFeaturePairsUpdated"),
              (e.perpEvent = "perpEvent"),
              (e.pairInfo = "pairInfo"),
              (e.portfolio = "portfolio"),
              e
            );
          })({}),
          ie = n(80817),
          oe = n(2397),
          se = n(89052),
          ue = 300,
          ce = (function () {
            function e(t) {
              var n = this,
                r =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : 500;
              (0, u.Z)(this, e),
                (this.chainId = void 0),
                (this.chainContextWorker = void 0),
                (this.sdk = void 0),
                (this.socketInstance = void 0),
                (this.instrumentMap = void 0),
                (this.instrumentSpotStateMap = void 0),
                (this.gateBalanceMap = void 0),
                (this.instrumentSpotRawPriceMap = void 0),
                (this.portfolioMap = void 0),
                (this.listeningEvent = void 0),
                (this.instrumentContractMap = void 0),
                (this.marketPairInfo = {}),
                (this.isRequestPair = {}),
                (this.isRequestPortfolio = {}),
                (this.isRequestBalance = {}),
                (this.pollingTimers = {}),
                (this.blockNumberCache = null),
                (this.cacheDuration = void 0),
                (this.watcherInstrumentAddr = void 0),
                (this.watcherAddr = void 0),
                (this.getInstrumentWithFallback = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t) {
                        var r, a, i, s;
                        return (0, o.Z)().wrap(
                          function (e) {
                            for (;;)
                              switch ((e.prev = e.next)) {
                                case 0:
                                  return (
                                    (r = t.instrumentAddr),
                                    (a = t.expiry),
                                    (e.prev = 1),
                                    (e.next = 4),
                                    n.getInstrumentFromApi({
                                      instrumentAddr: r,
                                      expiry: a,
                                    })
                                  );
                                case 4:
                                  if (
                                    null === (i = e.sent) ||
                                    void 0 === i ||
                                    !i.data
                                  ) {
                                    e.next = 7;
                                    break;
                                  }
                                  return e.abrupt("return", i);
                                case 7:
                                  throw new Error("API returned no data");
                                case 10:
                                  return (
                                    (e.prev = 10),
                                    (e.t0 = e.catch(1)),
                                    (e.prev = 13),
                                    (e.next = 16),
                                    n.getInstrumentFromChain(r, a)
                                  );
                                case 16:
                                  return (s = e.sent), e.abrupt("return", s);
                                case 20:
                                  throw (
                                    ((e.prev = 20),
                                    (e.t1 = e.catch(13)),
                                    new Error(
                                      "Failed to fetch instrument from both API and chain"
                                    ))
                                  );
                                case 24:
                                case "end":
                                  return e.stop();
                              }
                          },
                          e,
                          null,
                          [
                            [1, 10],
                            [13, 20],
                          ]
                        );
                      })
                    );
                    return function (t) {
                      return e.apply(this, arguments);
                    };
                  })(),
                  ue
                )),
                (this.getInstrumentFromApi = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t) {
                        var r, a, i, s, u;
                        return (0, o.Z)().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (r = t.instrumentAddr),
                                  (e.next = 3),
                                  ee(n.chainId, r)
                                );
                              case 3:
                                if (!(a = e.sent)) {
                                  e.next = 9;
                                  break;
                                }
                                return (
                                  (u =
                                    (null === (i = (s = a).blockInfo) ||
                                    void 0 === i
                                      ? void 0
                                      : i.height) || 0),
                                  n.updateInstrumentCache(s, u),
                                  e.abrupt("return", { data: s, block: u })
                                );
                              case 9:
                                return e.abrupt("return", {
                                  data: void 0,
                                  block: 0,
                                });
                              case 10:
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
                  ue
                )),
                (this.getPortfolioWithFallback = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t) {
                        var r, a, i, s;
                        return (0, o.Z)().wrap(
                          function (e) {
                            for (;;)
                              switch ((e.prev = e.next)) {
                                case 0:
                                  throw (
                                    ((r = t.userAddr),
                                    (a = t.instrumentAddr),
                                    (i = t.expiry),
                                    (e.prev = 1),
                                    new Error("API returned no data"))
                                  );
                                case 5:
                                  if (
                                    ((e.prev = 5),
                                    (e.t0 = e.catch(1)),
                                    (e.prev = 8),
                                    !a || !i)
                                  ) {
                                    e.next = 14;
                                    break;
                                  }
                                  return (
                                    (e.next = 12),
                                    n.getPortfolio({
                                      userAddr: r,
                                      instrumentAddr: a,
                                      expiry: i,
                                    })
                                  );
                                case 12:
                                  return (s = e.sent), e.abrupt("return", s);
                                case 14:
                                  e.next = 20;
                                  break;
                                case 16:
                                  throw (
                                    ((e.prev = 16),
                                    (e.t1 = e.catch(8)),
                                    new Error(
                                      "Failed to fetch instrument from both API and chain"
                                    ))
                                  );
                                case 20:
                                case "end":
                                  return e.stop();
                              }
                          },
                          e,
                          null,
                          [
                            [1, 5],
                            [8, 16],
                          ]
                        );
                      })
                    );
                    return function (t) {
                      return e.apply(this, arguments);
                    };
                  })(),
                  ue
                )),
                (this.dispatchInstrumentUpdateEvent = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t) {
                        var r, a, i, s, u, c;
                        return (0, o.Z)().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                (r = t.instrumentAddr),
                                  (a = t.expiry),
                                  (i = t.eventName),
                                  (s = t.eventArgs),
                                  (u = t.txHash),
                                  (c = t.trader),
                                  (0, se.Ud)(
                                    m.e.DispatchInstrumentUpdateEvent,
                                    {
                                      instrumentAddr: r,
                                      expiry: a,
                                      eventName: i,
                                      eventArgs: s,
                                      transactionHash: u,
                                      chainId: n.chainId,
                                      trader: c,
                                    }
                                  );
                              case 2:
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
                  ue
                )),
                (this.dispatchPortfolioUpdateEvent = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t) {
                        var r, a, i, s, u, c;
                        return (0, o.Z)().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                (r = t.instrumentAddr),
                                  (a = t.expiry),
                                  (i = t.eventName),
                                  (s = t.eventArgs),
                                  (u = t.txHash),
                                  (c = t.trader),
                                  (0, se.Ud)(m.e.DispatchPortfolioUpdateEvent, {
                                    instrumentAddr: r,
                                    expiry: a,
                                    eventName: i,
                                    eventArgs: s,
                                    transactionHash: u,
                                    chainId: n.chainId,
                                    trader: c,
                                  });
                              case 2:
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
                  ue
                )),
                (this.dispatchGateUpdateEvent = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t) {
                        var r, a, i, s, u;
                        return (0, o.Z)().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                (r = t.eventName),
                                  (a = t.eventArgs),
                                  (i = t.txHash),
                                  (s = t.userAddr),
                                  (u = t.block),
                                  (0, se.Ud)(m.e.DispatchGateUpdateEvent, {
                                    eventName: r,
                                    eventArgs: a,
                                    transactionHash: i,
                                    chainId: n.chainId,
                                    userAddr: s,
                                    block: u,
                                  });
                              case 2:
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
                  ue
                )),
                (this.getMarketPairInfoFromApi = (0, f.debounce)(
                  (function () {
                    var e = (0, s.Z)(
                      (0, o.Z)().mark(function e(t, r) {
                        var a;
                        return (0, o.Z)().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.next = 2),
                                  te({
                                    chainId: n.chainId,
                                    address: t,
                                    expiry: r,
                                  })
                                );
                              case 2:
                                if (!(a = e.sent)) {
                                  e.next = 5;
                                  break;
                                }
                                return e.abrupt("return", a);
                              case 5:
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
                  ue
                )),
                (this.chainId = t),
                (this.chainContextWorker = y.z.getInstance(t)),
                (this.instrumentMap = { block: 0, data: {} }),
                (this.gateBalanceMap = {}),
                (this.listeningEvent = {}),
                (this.instrumentContractMap = {}),
                (this.portfolioMap = {}),
                (this.instrumentSpotStateMap = {}),
                (this.instrumentSpotRawPriceMap = {}),
                (this.cacheDuration = r),
                (this.socketInstance = this.initSocketInstance());
            }
            return (
              (0, c.Z)(
                e,
                [
                  {
                    key: "initSDK",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n, r, a, i;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    return (
                                      (r = v.UA[t]),
                                      (a =
                                        null === (n = C.chainConfig[t]) ||
                                        void 0 === n
                                          ? void 0
                                          : n.graphAddr),
                                      (i = new d.Context(t)
                                        .use((0, g.perpPlugin)({ inverse: !0 }))
                                        .use(
                                          (0, l.txPlugin)({
                                            gasLimitMultiple: 1.7,
                                            gasEstimator:
                                              new l.DefaultEthGasEstimator(),
                                          })
                                        )
                                        .use(
                                          (0, X.perpDataSourcePlugin)({
                                            endpoint: r.subgraph,
                                            inverse: !0,
                                          })
                                        )
                                        .use((0, S.perpLaunchpadPlugin)())
                                        .use(
                                          (0, oe.perpLaunchpadDataSourcePlugin)(
                                            a || ""
                                          )
                                        )
                                        .use((0, T.aggregatorPlugin)())
                                        .use(
                                          (0, ie.aggregatorDataSourcePlugin)(
                                            "https://api.synfutures.com/thegraph/base-aggregator"
                                          )
                                        )).setProvider(this.provider),
                                      (e.next = 6),
                                      i.init()
                                    );
                                  case 6:
                                    return e.abrupt("return", i);
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
                    key: "init",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e() {
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    return (
                                      (e.next = 2),
                                      this.chainContextWorker.readProviderFromLocalOrSetting()
                                    );
                                  case 2:
                                    return (
                                      (e.next = 4), this.initSDK(this.chainId)
                                    );
                                  case 4:
                                    (this.sdk = e.sent),
                                      this.sdk.setProvider(this.provider);
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
                    key: "chainContext",
                    get: function () {
                      return this.chainContextWorker.chainContext;
                    },
                  },
                  {
                    key: "provider",
                    get: function () {
                      return this.chainContextWorker.provider;
                    },
                  },
                  {
                    key: "getBlockNumber",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e() {
                          var t, n;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (
                                      ((t = Date.now()),
                                      !(
                                        this.blockNumberCache &&
                                        t - this.blockNumberCache.timestamp <
                                          this.cacheDuration
                                      ))
                                    ) {
                                      e.next = 3;
                                      break;
                                    }
                                    return e.abrupt(
                                      "return",
                                      this.blockNumberCache.blockNumber
                                    );
                                  case 3:
                                    return (
                                      (e.next = 5),
                                      this.provider.getBlockNumber()
                                    );
                                  case 5:
                                    return (
                                      (n = e.sent),
                                      (this.blockNumberCache = {
                                        blockNumber: n,
                                        timestamp: t,
                                      }),
                                      e.abrupt("return", n)
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
                    key: "getAllFuturesFromChain",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n, r, a, i, s;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (t) {
                                      e.next = 4;
                                      break;
                                    }
                                    return (e.next = 3), this.getBlockNumber();
                                  case 3:
                                    t = e.sent;
                                  case 4:
                                    if (this.sdk) {
                                      e.next = 6;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 6:
                                    return (
                                      (e.next = 8),
                                      this.sdk.perp.observer.getAllInstruments({
                                        blockTag: t,
                                      })
                                    );
                                  case 8:
                                    if (!((n = e.sent).length > 0)) {
                                      e.next = 14;
                                      break;
                                    }
                                    if (
                                      ((i = n[0]),
                                      !(
                                        ((null === (r = i.blockInfo) ||
                                        void 0 === r
                                          ? void 0
                                          : r.height) || 0) <
                                        this.instrumentMap.block
                                      ))
                                    ) {
                                      e.next = 13;
                                      break;
                                    }
                                    return e.abrupt(
                                      "return",
                                      this.instrumentMap
                                    );
                                  case 13:
                                    t =
                                      (null === (a = i.blockInfo) ||
                                      void 0 === a
                                        ? void 0
                                        : a.height) || 0;
                                  case 14:
                                    return (
                                      (s = n.reduce(function (e, t) {
                                        return (
                                          (e[t.instrumentAddr.toLowerCase()] =
                                            t),
                                          e
                                        );
                                      }, {})),
                                      (this.instrumentMap = {
                                        data: s,
                                        block: t,
                                      }),
                                      e.abrupt("return", { data: s, block: t })
                                    );
                                  case 17:
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
                    key: "getInstrumentFromChain",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t, n, r) {
                          var a, i, s, u, c;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (r) {
                                      e.next = 4;
                                      break;
                                    }
                                    return (e.next = 3), this.getBlockNumber();
                                  case 3:
                                    r = e.sent;
                                  case 4:
                                    if (!r) {
                                      e.next = 11;
                                      break;
                                    }
                                    if (
                                      h().get(this.isRequestPair, [
                                        ""
                                          .concat(t, "-")
                                          .concat(n)
                                          .toLowerCase(),
                                        r,
                                      ])
                                    ) {
                                      e.next = 10;
                                      break;
                                    }
                                    h().set(
                                      this.isRequestPair,
                                      [
                                        ""
                                          .concat(t, "-")
                                          .concat(n)
                                          .toLowerCase(),
                                        r,
                                      ],
                                      !0
                                    ),
                                      (e.next = 11);
                                    break;
                                  case 10:
                                    return e.abrupt("return", {
                                      data: void 0,
                                      block: r,
                                    });
                                  case 11:
                                    if (!this.sdk) {
                                      e.next = 23;
                                      break;
                                    }
                                    return (
                                      (e.next = 14),
                                      this.sdk.perp.observer.getInstrument(
                                        [
                                          {
                                            instrument: t,
                                            expiries: n ? [n] : [],
                                          },
                                        ],
                                        { blockTag: r }
                                      )
                                    );
                                  case 14:
                                    if (!((a = e.sent).length > 0)) {
                                      e.next = 23;
                                      break;
                                    }
                                    if (
                                      ((u = a[0]),
                                      (c = h().get(this.instrumentMap, [
                                        "data",
                                        t,
                                      ])),
                                      !(
                                        ((null === (i = u.blockInfo) ||
                                        void 0 === i
                                          ? void 0
                                          : i.height) || 0) <
                                        this.instrumentMap.block
                                      ))
                                    ) {
                                      e.next = 20;
                                      break;
                                    }
                                    return e.abrupt("return", {
                                      data: c,
                                      block: this.instrumentMap.block,
                                    });
                                  case 20:
                                    return (
                                      (r =
                                        (null === (s = u.blockInfo) ||
                                        void 0 === s
                                          ? void 0
                                          : s.height) || 0),
                                      this.updateInstrumentCache(u, r),
                                      e.abrupt("return", { data: u, block: r })
                                    );
                                  case 23:
                                    return e.abrupt("return", {
                                      data: void 0,
                                      block: r || 0,
                                    });
                                  case 24:
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
                    key: "batchInstrumentFromChain",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t, n) {
                          var r,
                            a,
                            i,
                            s = this;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (n) {
                                      e.next = 4;
                                      break;
                                    }
                                    return (e.next = 3), this.getBlockNumber();
                                  case 3:
                                    n = e.sent;
                                  case 4:
                                    if (
                                      null !== t &&
                                      void 0 !== t &&
                                      t.length
                                    ) {
                                      e.next = 6;
                                      break;
                                    }
                                    return e.abrupt("return", {
                                      data: void 0,
                                      block: n,
                                    });
                                  case 6:
                                    if (
                                      !n ||
                                      null === t ||
                                      void 0 === t ||
                                      !t.length
                                    ) {
                                      e.next = 15;
                                      break;
                                    }
                                    if (
                                      ((a = t[0]),
                                      null === (r = a.expiries) ||
                                        void 0 === r ||
                                        !r.length)
                                    ) {
                                      e.next = 15;
                                      break;
                                    }
                                    if (
                                      h().get(this.isRequestPair, [
                                        ""
                                          .concat(a.instrument, "-")
                                          .concat(a.expiries.join("_"))
                                          .toLowerCase(),
                                        n,
                                      ])
                                    ) {
                                      e.next = 14;
                                      break;
                                    }
                                    h().set(
                                      this.isRequestPair,
                                      [
                                        ""
                                          .concat(a.instrument, "-")
                                          .concat(a.expiries.join("_"))
                                          .toLowerCase(),
                                        n,
                                      ],
                                      !0
                                    ),
                                      (e.next = 15);
                                    break;
                                  case 14:
                                    return e.abrupt("return", {
                                      data: void 0,
                                      block: n,
                                    });
                                  case 15:
                                    if (!this.sdk) {
                                      e.next = 22;
                                      break;
                                    }
                                    return (
                                      (e.next = 18),
                                      this.sdk.perp.observer.getInstrument(t, {
                                        blockTag: n,
                                      })
                                    );
                                  case 18:
                                    if (!((i = e.sent).length > 0)) {
                                      e.next = 22;
                                      break;
                                    }
                                    return (
                                      i.forEach(function (e) {
                                        var t;
                                        (n =
                                          (null === (t = e.blockInfo) ||
                                          void 0 === t
                                            ? void 0
                                            : t.height) || 0),
                                          s.updateInstrumentCache(e, n);
                                      }),
                                      e.abrupt("return", {
                                        data: i,
                                        block: this.instrumentMap.block,
                                      })
                                    );
                                  case 22:
                                    return e.abrupt("return", {
                                      data: void 0,
                                      block: n || 0,
                                    });
                                  case 23:
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
                    key: "getInstrumentSpotStateFromChain",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n, r, a, i, s, u;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (
                                      ((n = t.instrumentAddr),
                                      (r = t.instrument),
                                      (a = t.marketType),
                                      (i = t.block),
                                      this.sdk)
                                    ) {
                                      e.next = 3;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 3:
                                    if (i) {
                                      e.next = 7;
                                      break;
                                    }
                                    return (e.next = 6), this.getBlockNumber();
                                  case 6:
                                    i = e.sent;
                                  case 7:
                                    if (
                                      (r ||
                                        (r = h().get(this.instrumentMap, [
                                          "data",
                                          n,
                                        ])),
                                      !a && r && (a = r.market.info.type),
                                      r || a)
                                    ) {
                                      e.next = 11;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 11:
                                    if (!a) {
                                      e.next = 18;
                                      break;
                                    }
                                    if (
                                      !(s =
                                        this.sdk.perp.contracts.marketContracts[
                                          a
                                        ])
                                    ) {
                                      e.next = 18;
                                      break;
                                    }
                                    return (
                                      (e.next = 16),
                                      s.market.getSpotState(n, { blockTag: i })
                                    );
                                  case 16:
                                    (u = e.sent),
                                      this.updateSpotStateCache(
                                        n.toLowerCase(),
                                        u,
                                        i
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
                    key: "getInstrumentRawSpotPriceFromChain",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t, n) {
                          var r, a;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (((e.prev = 0), this.sdk)) {
                                      e.next = 3;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 3:
                                    if (n) {
                                      e.next = 7;
                                      break;
                                    }
                                    return (e.next = 6), this.getBlockNumber();
                                  case 6:
                                    n = e.sent;
                                  case 7:
                                    if (
                                      !(
                                        (null ===
                                          (r = h().get(
                                            this.instrumentSpotRawPriceMap,
                                            [t.instrumentAddr.toLowerCase()]
                                          )) || void 0 === r
                                          ? void 0
                                          : r.block) >= n
                                      )
                                    ) {
                                      e.next = 10;
                                      break;
                                    }
                                    return e.abrupt("return", {
                                      data: r.data,
                                      block: r.block,
                                    });
                                  case 10:
                                    if (!t) {
                                      e.next = 17;
                                      break;
                                    }
                                    return (
                                      (e.next = 13),
                                      this.sdk.perp.observer.getRawSpotPrice({
                                        marketType: t.market.info.type,
                                        baseSymbol: t.base,
                                        quoteSymbol: t.quote,
                                      })
                                    );
                                  case 13:
                                    return (
                                      (a = e.sent),
                                      h().set(
                                        this.instrumentSpotRawPriceMap,
                                        [t.instrumentAddr.toLowerCase()],
                                        { data: a, block: n }
                                      ),
                                      (0, se.Ud)(m.e.UpdateRawSpotPriceEvent, {
                                        instrumentSpotRawPriceMap:
                                          this.instrumentSpotRawPriceMap,
                                        block: n,
                                        chainId: this.chainId,
                                      }),
                                      e.abrupt("return", { data: a, block: n })
                                    );
                                  case 17:
                                    e.next = 22;
                                    break;
                                  case 19:
                                    (e.prev = 19), (e.t0 = e.catch(0));
                                  case 22:
                                  case "end":
                                    return e.stop();
                                }
                            },
                            e,
                            this,
                            [[0, 19]]
                          );
                        })
                      );
                      return function (t, n) {
                        return e.apply(this, arguments);
                      };
                    })(),
                  },
                  {
                    key: "updateInstrumentCache",
                    value: function (e, t) {
                      h().set(this.instrumentMap, ["block"], t);
                      var n = e.instrumentAddr.toLowerCase();
                      h().set(this.instrumentMap, ["data", n], e);
                      var r = (function (e, t) {
                        var n = h().reduce(
                          t,
                          function (t, n) {
                            var r;
                            t.futuresMap || (t.futuresMap = {}),
                              (null !== t &&
                                void 0 !== t &&
                                null !== (r = t.blockInfo) &&
                                void 0 !== r &&
                                r.height) ||
                                (t.blockInfo = n.blockInfo || {
                                  height: 0,
                                  timestamp: 0,
                                }),
                              t.pairMap || (t.pairMap = {});
                            var a = (0, x.i)(n, e);
                            t.futuresMap[a.id] = a;
                            var i =
                              null === n || void 0 === n ? void 0 : n.amms;
                            return (
                              i &&
                                i.forEach(function (e) {
                                  var r = ""
                                      .concat(n.instrumentAddr, "-")
                                      .concat(e.expiry)
                                      .toLowerCase(),
                                    a = (0, x.P)({
                                      amm: e,
                                      futures: n,
                                      blockInfo: e.blockInfo,
                                    });
                                  t.pairMap[r] = a;
                                }),
                              (0, b.R)(t)
                            );
                          },
                          {}
                        );
                        return (n.chainId = e), n;
                      })(
                        this.chainId,
                        (0, i.Z)({}, e.instrumentAddr.toLowerCase(), e)
                      );
                      (0, se.Ud)(m.e.UpdateFuturesEvent, {
                        futures: e,
                        block: t,
                        chainId: this.chainId,
                        pairList: Array.from(
                          (null === e || void 0 === e
                            ? void 0
                            : e.amms.values()) || []
                        ),
                        futuresRecord: r,
                      });
                    },
                  },
                  {
                    key: "updatePairCache",
                    value: function (e, t) {
                      var n = h().get(this.instrumentMap, ["data", e]);
                      if (n) {
                        var r = t.expiry;
                        n.amms.set(r, t);
                      }
                    },
                  },
                  {
                    key: "updateSpotStateCache",
                    value: function (e, t, n) {
                      t = (0, b.R)({ raw: t.raw, spot: t.spot, time: t.time });
                      var r = h().get(this.instrumentSpotStateMap, [e]);
                      r
                        ? r.block < n &&
                          (h().set(this.instrumentSpotStateMap, [e, "data"], t),
                          h().set(this.instrumentSpotStateMap, [e, "block"], n))
                        : (h().set(this.instrumentSpotStateMap, [e, "data"], t),
                          h().set(
                            this.instrumentSpotStateMap,
                            [e, "block"],
                            n
                          )),
                        (0, se.Ud)(m.e.UpdateSpotStateEvent, {
                          instrumentSpotStateMap: this.instrumentSpotStateMap,
                          block: n,
                          chainId: this.chainId,
                        });
                    },
                  },
                  {
                    key: "getPortfolio",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n, r, a, i, s, u, c;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (
                                      ((n = t.userAddr),
                                      (r = t.instrumentAddr),
                                      (a = t.expiry),
                                      (i = t.block),
                                      (e.prev = 1),
                                      this.sdk)
                                    ) {
                                      e.next = 4;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 4:
                                    if (r && a) {
                                      e.next = 6;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 6:
                                    if (
                                      h().get(this.isRequestPair, [
                                        ""
                                          .concat(n, "-")
                                          .concat(r, "-")
                                          .concat(a)
                                          .toLowerCase(),
                                        i || 0,
                                      ])
                                    ) {
                                      e.next = 11;
                                      break;
                                    }
                                    h().set(
                                      this.isRequestPair,
                                      [
                                        ""
                                          .concat(n, "-")
                                          .concat(r, "-")
                                          .concat(a)
                                          .toLowerCase(),
                                        i || 0,
                                      ],
                                      !0
                                    ),
                                      (e.next = 12);
                                    break;
                                  case 11:
                                    return e.abrupt("return", void 0);
                                  case 12:
                                    return (
                                      (e.next = 14),
                                      this.sdk.perp.observer.getPortfolio(
                                        {
                                          traderAddr: n,
                                          instrumentAddr: r,
                                          expiry: a,
                                        },
                                        { blockTag: i }
                                      )
                                    );
                                  case 14:
                                    if (
                                      ((u = e.sent),
                                      (c = h().get(this.portfolioMap, [
                                        n,
                                        r,
                                        a,
                                      ])),
                                      !(
                                        (i || 0) <
                                        ((null === c || void 0 === c
                                          ? void 0
                                          : c.block) || 0)
                                      ))
                                    ) {
                                      e.next = 18;
                                      break;
                                    }
                                    return e.abrupt("return", c);
                                  case 18:
                                    this.updatePortfolioCache({
                                      userAddr: n,
                                      instrumentAddr: r,
                                      expiry: a,
                                      portfolio: u,
                                      block:
                                        (null === (s = u.blockInfo) ||
                                        void 0 === s
                                          ? void 0
                                          : s.height) || 0,
                                    }),
                                      (e.next = 24);
                                    break;
                                  case 21:
                                    (e.prev = 21), (e.t0 = e.catch(1));
                                  case 24:
                                  case "end":
                                    return e.stop();
                                }
                            },
                            e,
                            this,
                            [[1, 21]]
                          );
                        })
                      );
                      return function (t) {
                        return e.apply(this, arguments);
                      };
                    })(),
                  },
                  {
                    key: "getPortfolioList",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t, n, r) {
                          var a,
                            i,
                            s,
                            u,
                            c,
                            d,
                            l,
                            p = this;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (((e.prev = 0), this.sdk)) {
                                      e.next = 3;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 3:
                                    if (n) {
                                      e.next = 7;
                                      break;
                                    }
                                    return (e.next = 6), this.getBlockNumber();
                                  case 6:
                                    n = e.sent;
                                  case 7:
                                    if (
                                      0 !==
                                        Object.keys(this.instrumentMap.data)
                                          .length &&
                                      !r
                                    ) {
                                      e.next = 10;
                                      break;
                                    }
                                    return (
                                      (e.next = 10),
                                      this.getAllFuturesFromChain(n)
                                    );
                                  case 10:
                                    return (
                                      (i = Object.keys(
                                        this.instrumentMap.data
                                      )),
                                      (s = i.map(function (e) {
                                        return {
                                          traderAddr: t,
                                          instrumentAddr: e,
                                          expiry: g.PERP_EXPIRY,
                                        };
                                      })),
                                      (e.next = 14),
                                      this.sdk.perp.observer.getPortfolio(s, {
                                        blockTag: n,
                                      })
                                    );
                                  case 14:
                                    return (
                                      (u = e.sent) &&
                                        null !== (a = u) &&
                                        void 0 !== a &&
                                        a.instrumentAddr &&
                                        (u = [u]),
                                      u.length > 0 &&
                                        ((d = u[0]),
                                        (n =
                                          (null === (c = d.blockInfo) ||
                                          void 0 === c
                                            ? void 0
                                            : c.height) || 0)),
                                      u.forEach(function (e) {
                                        var r,
                                          a = e.instrumentAddr.toLowerCase(),
                                          i = e.expiry,
                                          o = h().get(p.portfolioMap, [
                                            t,
                                            a,
                                            i,
                                          ]);
                                        (n || 0) <
                                          ((null === o || void 0 === o
                                            ? void 0
                                            : o.block) || 0) ||
                                          p.updatePortfolioCache({
                                            userAddr: t,
                                            instrumentAddr: a,
                                            expiry: i,
                                            portfolio: e,
                                            block:
                                              n ||
                                              (null === (r = e.blockInfo) ||
                                              void 0 === r
                                                ? void 0
                                                : r.height) ||
                                              0,
                                          });
                                      }),
                                      (l = u.reduce(function (e, t) {
                                        return (
                                          (e[t.instrumentAddr.toLowerCase()] =
                                            t),
                                          e
                                        );
                                      }, {})),
                                      e.abrupt("return", { data: l, block: n })
                                    );
                                  case 22:
                                    (e.prev = 22), (e.t0 = e.catch(0));
                                  case 25:
                                  case "end":
                                    return e.stop();
                                }
                            },
                            e,
                            this,
                            [[0, 22]]
                          );
                        })
                      );
                      return function (t, n, r) {
                        return e.apply(this, arguments);
                      };
                    })(),
                  },
                  {
                    key: "updatePortfolioCache",
                    value: function (e) {
                      var t = e.userAddr,
                        n = e.instrumentAddr,
                        r = e.expiry,
                        a = e.portfolio,
                        i = e.block;
                      if (a) {
                        h().set(this.portfolioMap, [t, n, r, "block"], i),
                          h().set(this.portfolioMap, [t, n, r, "data"], a);
                        var o = I(this.chainId, t, n, a);
                        (0, se.Ud)(m.e.UpdatePortfolioEvent, {
                          reducedPortfolio: o,
                          block: i,
                          chainId: this.chainId,
                          userAddr: t,
                          instrumentAddr: n,
                          expiry: r,
                        });
                      }
                    },
                  },
                  {
                    key: "updatePositionCache",
                    value: function (e) {
                      var t = e.userAddr,
                        n = e.instrumentAddr,
                        r = e.expiry,
                        a = e.position,
                        i = h().get(this.portfolioMap, [t, n, r, "data"]);
                      i && (i.position = a);
                    },
                  },
                  {
                    key: "updateOrderCache",
                    value: function (e) {
                      var t = e.userAddr,
                        n = e.instrumentAddr,
                        r = e.expiry,
                        a = e.order,
                        i = h().get(this.portfolioMap, [t, n, r, "data"]);
                      i &&
                        (i.orders || (i.orders = new Map()),
                        i.orders.set(a.oid, a));
                    },
                  },
                  {
                    key: "updateRangeCache",
                    value: function (e, t, n, r) {
                      var a = h().get(this.portfolioMap, [e, t, n, "data"]);
                      a &&
                        (a.ranges || (a.ranges = new Map()),
                        a.ranges.set(r.rid, r));
                    },
                  },
                  {
                    key: "getGateBalanceFromChain",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t, n, i) {
                          var s,
                            u,
                            c,
                            d,
                            l,
                            p,
                            f = this;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (this.sdk) {
                                      e.next = 2;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 2:
                                    if (0 !== n.length) {
                                      e.next = 4;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 4:
                                    if (i) {
                                      e.next = 8;
                                      break;
                                    }
                                    return (e.next = 7), this.getBlockNumber();
                                  case 7:
                                    i = e.sent;
                                  case 8:
                                    if (1 !== n.length) {
                                      e.next = 16;
                                      break;
                                    }
                                    if (
                                      ((s = n[0]),
                                      h().get(this.isRequestBalance, [
                                        t,
                                        s.address,
                                        i,
                                      ]))
                                    ) {
                                      e.next = 15;
                                      break;
                                    }
                                    h().set(
                                      this.isRequestBalance,
                                      [t, s.address, i],
                                      !0
                                    ),
                                      (e.next = 16);
                                    break;
                                  case 15:
                                    return e.abrupt("return", void 0);
                                  case 16:
                                    return (
                                      (n = n.map(function (e) {
                                        return e.address.toLowerCase() ===
                                          g.NATIVE_TOKEN_ADDRESS.toLowerCase()
                                          ? f.chainContext.wrappedNativeToken
                                          : e;
                                      })),
                                      (u = n.map(function (e) {
                                        return e.address;
                                      })),
                                      (e.next = 20),
                                      this.sdk.perp.contracts.observer.getVaultBalances(
                                        t,
                                        u,
                                        { blockTag: i }
                                      )
                                    );
                                  case 20:
                                    return (
                                      (c = e.sent),
                                      (d = (0, a.Z)(c, 2)),
                                      (l = d[0]),
                                      (p = d[1]) && (i = p[1]),
                                      n.forEach(function (e, n) {
                                        var a,
                                          o = e.address.toLowerCase(),
                                          s = l[n],
                                          u =
                                            null ===
                                              (a = f.gateBalanceMap[t]) ||
                                            void 0 === a
                                              ? void 0
                                              : a[e.address];
                                        s.eq(
                                          (null === u || void 0 === u
                                            ? void 0
                                            : u.data) || -1
                                        ) ||
                                          (0, se.Ud)(
                                            m.e.UpdateGateBalanceEvent,
                                            {
                                              gateBalance: s,
                                              chainId: f.chainId,
                                              userAddr: t,
                                              token: (0, r.Z)(
                                                (0, r.Z)({}, e),
                                                {},
                                                { address: o }
                                              ),
                                              block: i || 0,
                                            }
                                          ),
                                          h().set(f.gateBalanceMap, [t, o], {
                                            block: i,
                                            data: s,
                                          });
                                      }),
                                      e.abrupt("return", {
                                        block: i || 0,
                                        data: n.map(function (e, t) {
                                          return {
                                            token: (0, r.Z)(
                                              (0, r.Z)({}, e),
                                              {},
                                              {
                                                address:
                                                  e.address.toLowerCase(),
                                              }
                                            ),
                                            balance: l[t],
                                            block: i || 0,
                                          };
                                        }),
                                      })
                                    );
                                  case 27:
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
                    key: "getToken",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n, a, i;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (
                                      t.toLowerCase() !==
                                      g.NATIVE_TOKEN_ADDRESS.toLowerCase()
                                    ) {
                                      e.next = 2;
                                      break;
                                    }
                                    return e.abrupt(
                                      "return",
                                      this.chainContext.wrappedNativeToken
                                    );
                                  case 2:
                                    if (
                                      ((n = this.chainContext.info.erc20.find(
                                        function (e) {
                                          var n;
                                          return (
                                            (null === (n = e.address) ||
                                            void 0 === n
                                              ? void 0
                                              : n.toLowerCase()) ===
                                            t.toLowerCase()
                                          );
                                        }
                                      )),
                                      !n)
                                    ) {
                                      e.next = 5;
                                      break;
                                    }
                                    return e.abrupt(
                                      "return",
                                      (0, r.Z)(
                                        (0, r.Z)({}, n),
                                        {},
                                        { address: n.address.toLowerCase() }
                                      )
                                    );
                                  case 5:
                                    return (
                                      (e.next = 7),
                                      this.chainContext.getTokenInfo(t)
                                    );
                                  case 7:
                                    if (!(a = e.sent)) {
                                      e.next = 10;
                                      break;
                                    }
                                    return e.abrupt(
                                      "return",
                                      (0, r.Z)(
                                        (0, r.Z)({}, a),
                                        {},
                                        {
                                          address:
                                            null === (i = a.address) ||
                                            void 0 === i
                                              ? void 0
                                              : i.toLowerCase(),
                                        }
                                      )
                                    );
                                  case 10:
                                    return e.abrupt("return", a);
                                  case 11:
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
                    key: "WatchGateContract",
                    value: function (e) {
                      var t,
                        n = this;
                      if (this.sdk) {
                        var r = this.sdk.perp.contracts.gate,
                          a = this.chainId;
                        (null !== (t = this.listeningEvent.gate) &&
                          void 0 !== t &&
                          t["".concat(a, "-").concat(e).toLowerCase()]) ||
                          (h().set(
                            this.listeningEvent,
                            ["gate", "".concat(a, "-").concat(e).toLowerCase()],
                            !0
                          ),
                          r.once(
                            {
                              topics: [
                                [
                                  r.interface.getEventTopic("Deposit"),
                                  r.interface.getEventTopic("Withdraw"),
                                  r.interface.getEventTopic("Scatter"),
                                  r.interface.getEventTopic("Gather"),
                                ],
                                null,
                                p.hexZeroPad(e, 32),
                              ],
                            },
                            (function () {
                              var t = (0, s.Z)(
                                (0, o.Z)().mark(function t(a) {
                                  var i, s, u, c, d;
                                  return (0, o.Z)().wrap(function (t) {
                                    for (;;)
                                      switch ((t.prev = t.next)) {
                                        case 0:
                                          return (
                                            (s = r.interface.parseLog(a)),
                                            (u = s.args.quote),
                                            (c =
                                              null === (i = s.args.trader) ||
                                              void 0 === i
                                                ? void 0
                                                : i.toLowerCase()),
                                            (t.next = 5),
                                            n.getToken(u)
                                          );
                                        case 5:
                                          (d = t.sent) &&
                                            c &&
                                            n.getGateBalanceFromChain(
                                              e,
                                              [d],
                                              a.blockNumber
                                            );
                                        case 8:
                                        case "end":
                                          return t.stop();
                                      }
                                  }, t);
                                })
                              );
                              return function (e) {
                                return t.apply(this, arguments);
                              };
                            })()
                          ),
                          r.once(
                            {
                              topics: [
                                [r.interface.getEventTopic("NewInstrument")],
                              ],
                            },
                            (function () {
                              var e = (0, s.Z)(
                                (0, o.Z)().mark(function e(t) {
                                  var a, i, s, u, c;
                                  return (0, o.Z)().wrap(function (e) {
                                    for (;;)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          return (
                                            (a = r.interface.parseLog(t)),
                                            (i = a.args.instrument),
                                            (e.next = 5),
                                            n.getInstrumentFromChain(
                                              i,
                                              void 0,
                                              t.blockNumber
                                            )
                                          );
                                        case 5:
                                          (s = e.sent).data &&
                                            (n.pollingInstrument(
                                              null === (u = s.data) ||
                                                void 0 === u
                                                ? void 0
                                                : u.instrumentAddr.toLowerCase()
                                            ),
                                            n.batchInstrumentFromChain(
                                              [
                                                {
                                                  instrument:
                                                    null === (c = s.data) ||
                                                    void 0 === c
                                                      ? void 0
                                                      : c.instrumentAddr.toLowerCase(),
                                                  expiries: Array.from(
                                                    s.data.amms.values()
                                                  ).map(function (e) {
                                                    return e.expiry;
                                                  }),
                                                },
                                              ],
                                              t.blockNumber
                                            ));
                                        case 7:
                                        case "end":
                                          return e.stop();
                                      }
                                  }, e);
                                })
                              );
                              return function (t) {
                                return e.apply(this, arguments);
                              };
                            })()
                          ));
                      }
                    },
                  },
                  {
                    key: "getInstrumentContract",
                    value: function (e) {
                      e = e.toLowerCase();
                      var t = this.instrumentContractMap[e];
                      return (
                        t ||
                          ((t = Z.Instrument__factory.connect(
                            e,
                            this.provider
                          )),
                          h().set(this.instrumentContractMap, [e], t)),
                        t
                      );
                    },
                  },
                  {
                    key: "watchInstrumentUpdateContract",
                    value: function (e) {
                      var t,
                        n = this,
                        r = this.getInstrumentContract(e),
                        a = this.chainId;
                      (null !== (t = this.listeningEvent.instrument) &&
                        void 0 !== t &&
                        t["".concat(a, "-").concat(e).toLowerCase()]) ||
                        (h().set(
                          this.listeningEvent,
                          [
                            "instrument",
                            "".concat(a, "-").concat(e).toLowerCase(),
                          ],
                          !0
                        ),
                        r.on(
                          {
                            topics: [
                              [
                                r.interface.getEventTopic("UpdateAmmStatus"),
                                r.interface.getEventTopic(
                                  "UpdateSocialLossInsuranceFund"
                                ),
                              ],
                            ],
                          },
                          function (t) {
                            var a,
                              i = r.interface.parseLog(t),
                              o = i.args.expiry;
                            null === (a = i.args.trader) ||
                              void 0 === a ||
                              a.toLowerCase();
                            o && n.getInstrumentFromChain(e, o, t.blockNumber),
                              "UpdateFundingIndex" === i.name &&
                                n.getInstrumentFromChain(
                                  e,
                                  g.PERP_EXPIRY,
                                  t.blockNumber
                                );
                          }
                        ));
                    },
                  },
                  {
                    key: "watchAccountUpdateContact",
                    value: function (e, t) {
                      var n,
                        r = this,
                        a = this.getInstrumentContract(e),
                        i = this.chainId;
                      if (
                        null === (n = this.listeningEvent.instrument) ||
                        void 0 === n ||
                        !n[
                          ""
                            .concat(i, "-")
                            .concat(e, "-")
                            .concat(t)
                            .toLowerCase()
                        ]
                      ) {
                        h().set(
                          this.listeningEvent,
                          [
                            "instrument",
                            ""
                              .concat(i, "-")
                              .concat(e, "-")
                              .concat(t)
                              .toLowerCase(),
                          ],
                          !0
                        );
                        var o = {
                          topics: [
                            [
                              a.interface.getEventTopic("Place"),
                              a.interface.getEventTopic("Settle"),
                              a.interface.getEventTopic("Cancel"),
                              a.interface.getEventTopic("Fill"),
                              a.interface.getEventTopic("Adjust"),
                              a.interface.getEventTopic("Trade"),
                              a.interface.getEventTopic("Sweep"),
                              a.interface.getEventTopic("Add"),
                              a.interface.getEventTopic("Remove"),
                              a.interface.getEventTopic("Liquidate"),
                            ],
                            null,
                            p.hexZeroPad(t, 32),
                          ],
                        };
                        a.on(o, function (n) {
                          var i,
                            o = a.interface.parseLog(n),
                            s = o.args.expiry,
                            u =
                              null === (i = o.args.trader) || void 0 === i
                                ? void 0
                                : i.toLowerCase();
                          u === t.toLowerCase() &&
                            (s &&
                              u &&
                              r.getPortfolio({
                                userAddr: u,
                                instrumentAddr: e,
                                expiry: s,
                                block: n.blockNumber,
                              }),
                            ["Place", "Cancel", "Fill"].includes(o.name) &&
                              u === t.toLowerCase() &&
                              (0, se.Ud)(m.e.OnInstrumentOrderUpdateEvent, {
                                block: n.blockNumber,
                                chainId: r.chainId,
                                userAddr: u,
                                instrumentAddr: e,
                                expiry: s,
                                eventName: o.name,
                                transactionHash: n.transactionHash,
                                eventArgs: o.args,
                              }));
                        });
                      }
                    },
                  },
                  {
                    key: "watchSocketEvent",
                    value: function (e, t) {
                      var n,
                        r = this,
                        a = this.chainId,
                        i = this.socketInstance;
                      i &&
                        a &&
                        ((this.watcherAddr = e),
                        t && (this.watcherInstrumentAddr = t),
                        (null !== i &&
                          void 0 !== i &&
                          i.socket &&
                          null !== i &&
                          void 0 !== i &&
                          null !== (n = i.socket) &&
                          void 0 !== n &&
                          n.hasListeners(ae.perpEvent)) ||
                          (i.emit(ne.EVENT, { chainId: a }),
                          i.on(ae.perpEvent, function (e) {
                            e.chainId === a &&
                              e.event.forEach(function (e) {
                                var t;
                                r.handleSocketEvent({
                                  contractAddress:
                                    null === (t = e.contractAddress) ||
                                    void 0 === t
                                      ? void 0
                                      : t.toLowerCase(),
                                  contractType: e.contractType,
                                  eventName: e.eventName,
                                  eventArgs: e.eventArgs,
                                  blockNum: e.blockNum,
                                  event: e,
                                });
                              });
                          })));
                    },
                  },
                  {
                    key: "removeSocketEvent",
                    value: function () {
                      var e = this.chainId,
                        t = this.socketInstance;
                      t &&
                        e &&
                        (t.emit(re.EVENT, { chainId: e }), t.off(ae.perpEvent));
                    },
                  },
                  {
                    key: "handleSocketEvent",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n, r, a, i, s, u, c, d, l, p, f, h, v, b, k;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (
                                      ((r = t.contractAddress),
                                      (a = t.contractType),
                                      (i = t.eventName),
                                      (s = t.eventArgs),
                                      (u = t.blockNum),
                                      (c = t.event),
                                      (d = this.watcherAddr),
                                      (l = this.watcherInstrumentAddr),
                                      (p =
                                        null === s ||
                                        void 0 === s ||
                                        null === (n = s.trader) ||
                                        void 0 === n
                                          ? void 0
                                          : n.toLowerCase()),
                                      "instrument" !== a)
                                    ) {
                                      e.next = 27;
                                      break;
                                    }
                                    if (
                                      ((f =
                                        null === s || void 0 === s
                                          ? void 0
                                          : s.expiry),
                                      ![
                                        "UpdateAmmStatus",
                                        "UpdateSocialLossInsuranceFund",
                                      ].includes(i))
                                    ) {
                                      e.next = 14;
                                      break;
                                    }
                                    if (
                                      ((h =
                                        null === s || void 0 === s
                                          ? void 0
                                          : s.expiry),
                                      !l || l === r)
                                    ) {
                                      e.next = 10;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 10:
                                    r &&
                                      h &&
                                      this.dispatchInstrumentUpdateEvent({
                                        instrumentAddr: r,
                                        expiry: h,
                                        eventName: i,
                                        eventArgs: s,
                                        txHash: c.txHash,
                                        trader: p,
                                      }),
                                      "UpdateFundingIndex" === i &&
                                        r &&
                                        this.dispatchInstrumentUpdateEvent({
                                          instrumentAddr: r,
                                          expiry: g.PERP_EXPIRY,
                                          eventName: i,
                                          eventArgs: s,
                                          txHash: c.txHash,
                                          trader: p,
                                        }),
                                      (e.next = 25);
                                    break;
                                  case 14:
                                    if (
                                      ![
                                        "Place",
                                        "Settle",
                                        "Cancel",
                                        "Fill",
                                        "Adjust",
                                        "Trade",
                                        "Sweep",
                                        "Add",
                                        "Remove",
                                        "Liquidate",
                                      ].includes(i)
                                    ) {
                                      e.next = 25;
                                      break;
                                    }
                                    if (!l || l === r) {
                                      e.next = 17;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 17:
                                    if (
                                      (r &&
                                        f &&
                                        this.dispatchInstrumentUpdateEvent({
                                          instrumentAddr: r,
                                          expiry: f,
                                          eventName: i,
                                          eventArgs: s,
                                          txHash: c.txHash,
                                          trader: p,
                                        }),
                                      d)
                                    ) {
                                      e.next = 20;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 20:
                                    if (p === d.toLowerCase()) {
                                      e.next = 22;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 22:
                                    r &&
                                      f &&
                                      f &&
                                      p &&
                                      this.dispatchPortfolioUpdateEvent({
                                        instrumentAddr: r,
                                        expiry: f,
                                        eventName: i,
                                        eventArgs: s,
                                        txHash: c.txHash,
                                        trader: p,
                                      }),
                                      ["Place", "Cancel", "Fill"].includes(i) &&
                                        p === d.toLowerCase() &&
                                        (0, se.Ud)(
                                          m.e.OnInstrumentOrderUpdateEvent,
                                          {
                                            block: u || 0,
                                            chainId: this.chainId,
                                            userAddr: p,
                                            instrumentAddr: r,
                                            expiry: f,
                                            eventName: i,
                                            transactionHash: c.txHash,
                                            eventArgs: s,
                                          }
                                        );
                                  case 25:
                                    e.next = 46;
                                    break;
                                  case 27:
                                    if ("gate" !== a) {
                                      e.next = 46;
                                      break;
                                    }
                                    if ("NewInstrument" !== i) {
                                      e.next = 35;
                                      break;
                                    }
                                    if (
                                      (v =
                                        null === s || void 0 === s
                                          ? void 0
                                          : s.instrument)
                                    ) {
                                      e.next = 32;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 32:
                                    this.getInstrumentWithFallback({
                                      instrumentAddr: v,
                                    }),
                                      (e.next = 46);
                                    break;
                                  case 35:
                                    if (d) {
                                      e.next = 37;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 37:
                                    if (
                                      ((b =
                                        null === s || void 0 === s
                                          ? void 0
                                          : s.quote),
                                      d.toLowerCase() === p)
                                    ) {
                                      e.next = 40;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 40:
                                    return (e.next = 42), this.getToken(b);
                                  case 42:
                                    (k = e.sent) &&
                                      this.getGateBalanceFromChain(d, [k], u),
                                      this.dispatchGateUpdateEvent({
                                        eventName: i,
                                        eventArgs: s,
                                        txHash: c.txHash,
                                        userAddr: p,
                                        token: k,
                                        block: u || 0,
                                      });
                                  case 46:
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
                    key: "removeAllInstrumentListeners",
                    value: function () {
                      Object.values(this.instrumentContractMap).forEach(
                        function (e) {
                          e.removeAllListeners();
                        }
                      ),
                        h().set(this.listeningEvent, ["instrument"], {});
                    },
                  },
                  {
                    key: "removeAllGateListeners",
                    value: function () {
                      this.sdk &&
                        (this.sdk.perp.contracts.gate.removeAllListeners(),
                        h().set(this.listeningEvent, ["gate"], {}));
                    },
                  },
                  {
                    key: "pollingInstrument",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n,
                            r,
                            a,
                            i = this;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (!this.pollingTimers[t]) {
                                      e.next = 2;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 2:
                                    if (
                                      (n = h().get(this.instrumentMap, [
                                        "data",
                                        t,
                                      ]))
                                    ) {
                                      e.next = 8;
                                      break;
                                    }
                                    return (
                                      (e.next = 6),
                                      this.getInstrumentFromChain(t)
                                    );
                                  case 6:
                                    (r = e.sent).data && (n = r.data);
                                  case 8:
                                    n &&
                                      ((a = (0, b.gI)(function () {
                                        i.getInstrumentFromChain(t),
                                          i.getInstrumentRawSpotPriceFromChain(
                                            n
                                          ),
                                          i.getInstrumentSpotStateFromChain({
                                            instrumentAddr: t,
                                            instrument: n,
                                            marketType: n.market.info.type,
                                          });
                                      }, 5e3)),
                                      (this.pollingTimers[t] = a));
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
                    key: "initSocketInstance",
                    value: function () {
                      return this.socketInstance
                        ? this.socketInstance
                        : B.Z.getInstance().connect();
                    },
                  },
                  {
                    key: "updatePairInfoCache",
                    value: function (e, t, n) {
                      var r = n.id,
                        a = !1,
                        i = h().get(this.marketPairInfo, [r]);
                      (i && h().isEqual(i, n)) ||
                        (h().set(this.marketPairInfo, [r], n), (a = !0)),
                        a &&
                          (0, se.Ud)(m.e.UpdateMarketPairInfoEvent, {
                            pairInfo: n,
                            chainId: this.chainId,
                          });
                    },
                  },
                  {
                    key: "pollingInstrumentFromApi",
                    value: (function () {
                      var e = (0, s.Z)(
                        (0, o.Z)().mark(function e(t) {
                          var n,
                            r,
                            a,
                            i = this;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    if (!this.pollingTimers[t]) {
                                      e.next = 2;
                                      break;
                                    }
                                    return e.abrupt("return");
                                  case 2:
                                    if (
                                      (n = h().get(this.instrumentMap, [
                                        "data",
                                        t,
                                      ]))
                                    ) {
                                      e.next = 8;
                                      break;
                                    }
                                    return (
                                      (e.next = 6),
                                      this.getInstrumentFromApi({
                                        instrumentAddr: t,
                                      })
                                    );
                                  case 6:
                                    null !== (r = e.sent) &&
                                      void 0 !== r &&
                                      r.data &&
                                      (n = r.data);
                                  case 8:
                                    n &&
                                      ((a = (0, b.gI)(function () {
                                        i.getInstrumentFromApi({
                                          instrumentAddr: t,
                                        });
                                      }, 5e3)),
                                      (this.pollingTimers[t] = a));
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
                ],
                [
                  {
                    key: "getInstance",
                    value: (function () {
                      var t = (0, s.Z)(
                        (0, o.Z)().mark(function t(n) {
                          var r;
                          return (0, o.Z)().wrap(
                            function (t) {
                              for (;;)
                                switch ((t.prev = t.next)) {
                                  case 0:
                                    if ((r = this.instances[n])) {
                                      t.next = 6;
                                      break;
                                    }
                                    return (
                                      (r = new e(n)),
                                      (this.instances[n] = r),
                                      (t.next = 6),
                                      r.init()
                                    );
                                  case 6:
                                    return t.abrupt("return", r);
                                  case 7:
                                  case "end":
                                    return t.stop();
                                }
                            },
                            t,
                            this
                          );
                        })
                      );
                      return function (e) {
                        return t.apply(this, arguments);
                      };
                    })(),
                  },
                ]
              ),
              e
            );
          })();
        (ce.instances = {}),
          (onmessage = (function () {
            var e = (0, s.Z)(
              (0, o.Z)().mark(function e(t) {
                var n,
                  r,
                  a,
                  i,
                  s,
                  u,
                  c,
                  d,
                  l,
                  p,
                  f,
                  v,
                  b,
                  g,
                  k,
                  I,
                  x,
                  A,
                  w,
                  y,
                  Z,
                  S,
                  C,
                  N,
                  E,
                  P,
                  T,
                  L,
                  _,
                  M,
                  F,
                  O,
                  D,
                  R,
                  U,
                  B,
                  H,
                  q,
                  V,
                  j,
                  $,
                  W,
                  K,
                  G,
                  Y,
                  z,
                  Q,
                  X;
                return (0, o.Z)().wrap(
                  function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (
                            ((e.prev = 0),
                            (n = t.data).eventName !== m.e.WatchGateEvent)
                          ) {
                            e.next = 12;
                            break;
                          }
                          if (
                            ((r = n.data), (a = r.chainId), (i = r.userAddr))
                          ) {
                            e.next = 6;
                            break;
                          }
                          return e.abrupt("return");
                        case 6:
                          return (e.next = 8), ce.getInstance(a);
                        case 8:
                          (s = e.sent),
                            h().debounce(function () {
                              s.watchSocketEvent(i);
                            }, 300)(),
                            (e.next = 91);
                          break;
                        case 12:
                          if (n.eventName !== m.e.UpdateFuturesEvent) {
                            e.next = 20;
                            break;
                          }
                          return (
                            (u = n.data),
                            (c = u.chainId),
                            (d = u.instrumentAddr),
                            (e.next = 16),
                            ce.getInstance(c)
                          );
                        case 16:
                          (l = e.sent),
                            d && l && setTimeout(function () {}, 1e3),
                            (e.next = 91);
                          break;
                        case 20:
                          if (n.eventName !== m.e.InstrumentUpdateEvent) {
                            e.next = 28;
                            break;
                          }
                          return (
                            (p = n.data),
                            (f = p.chainId),
                            (v = p.userAddr),
                            (b = p.instrumentAddr),
                            (e.next = 24),
                            ce.getInstance(f)
                          );
                        case 24:
                          (g = e.sent),
                            b &&
                              v &&
                              g &&
                              h().debounce(function () {
                                g.watchSocketEvent(
                                  null === v || void 0 === v
                                    ? void 0
                                    : v.toLowerCase(),
                                  b
                                );
                              }, 300)(),
                            (e.next = 91);
                          break;
                        case 28:
                          if (n.eventName !== m.e.FetchPair) {
                            e.next = 31;
                            break;
                          }
                          e.next = 91;
                          break;
                        case 31:
                          if (n.eventName !== m.e.BatchPairs) {
                            e.next = 39;
                            break;
                          }
                          return (
                            (k = n.data),
                            (I = k.chainId),
                            (x = k.params),
                            (A = k.blockNumber),
                            (e.next = 35),
                            ce.getInstance(I)
                          );
                        case 35:
                          (w = e.sent),
                            x && x.length && w.batchInstrumentFromChain(x, A),
                            (e.next = 91);
                          break;
                        case 39:
                          if (n.eventName !== m.e.FetchPortfolio) {
                            e.next = 47;
                            break;
                          }
                          return (
                            (y = n.data),
                            (Z = y.chainId),
                            (S = y.instrumentAddr),
                            (C = y.expiry),
                            (N = y.userAddr),
                            (E = y.blockNumber),
                            (e.next = 43),
                            ce.getInstance(Z)
                          );
                        case 43:
                          (P = e.sent) &&
                            S &&
                            N &&
                            P.getPortfolio({
                              userAddr: N,
                              instrumentAddr: S,
                              expiry: C,
                              block: E,
                            }),
                            (e.next = 91);
                          break;
                        case 47:
                          if (n.eventName !== m.e.FetchPortfolioList) {
                            e.next = 55;
                            break;
                          }
                          return (
                            (T = n.data),
                            (L = T.chainId),
                            (_ = T.userAddr),
                            (M = T.blockNumber),
                            (F = T.needFetchInstruments),
                            (e.next = 51),
                            ce.getInstance(L)
                          );
                        case 51:
                          (O = e.sent) && _ && O.getPortfolioList(_, M, F),
                            (e.next = 91);
                          break;
                        case 55:
                          if (n.eventName !== m.e.FetchGateBalance) {
                            e.next = 63;
                            break;
                          }
                          return (
                            (D = n.data),
                            (R = D.chainId),
                            (U = D.tokens),
                            (B = D.userAddr),
                            (H = D.blockNumber),
                            (e.next = 59),
                            ce.getInstance(R)
                          );
                        case 59:
                          (q = e.sent) &&
                            U &&
                            U.length &&
                            B &&
                            q.getGateBalanceFromChain(B, U, H),
                            (e.next = 91);
                          break;
                        case 63:
                          if (
                            n.eventName !== m.e.RemoveAllInstrumentEventListener
                          ) {
                            e.next = 66;
                            break;
                          }
                          e.next = 91;
                          break;
                        case 66:
                          if (n.eventName !== m.e.RemoveAllGateEventListener) {
                            e.next = 69;
                            break;
                          }
                          e.next = 91;
                          break;
                        case 69:
                          if (n.eventName !== m.e.FetchInstrumentSpotState) {
                            e.next = 77;
                            break;
                          }
                          return (
                            (V = n.data),
                            (j = V.chainId),
                            ($ = V.instrumentAddr),
                            (W = V.blockNumber),
                            (K = V.marketType),
                            (e.next = 73),
                            ce.getInstance(j)
                          );
                        case 73:
                          (G = e.sent) &&
                            $ &&
                            G.getInstrumentSpotStateFromChain({
                              instrumentAddr: $,
                              block: W,
                              marketType: K,
                            }),
                            (e.next = 91);
                          break;
                        case 77:
                          if (n.eventName !== m.e.PollingFetchInstrument) {
                            e.next = 85;
                            break;
                          }
                          return (
                            (Y = n.data),
                            (z = Y.chainId),
                            Y.instrumentAddr,
                            (e.next = 81),
                            ce.getInstance(z)
                          );
                        case 81:
                          e.sent, (e.next = 91);
                          break;
                        case 85:
                          if (
                            n.eventName !== m.e.RemoveAllSocketEventListener
                          ) {
                            e.next = 91;
                            break;
                          }
                          return (
                            (Q = n.data.chainId),
                            (e.next = 89),
                            ce.getInstance(Q)
                          );
                        case 89:
                          (X = e.sent), Q && X && X.removeSocketEvent();
                        case 91:
                          e.next = 96;
                          break;
                        case 93:
                          (e.prev = 93), (e.t0 = e.catch(0));
                        case 96:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [[0, 93]]
                );
              })
            );
            return function (t) {
              return e.apply(this, arguments);
            };
          })());
      },
    },
    t = {};
  function n(r) {
    var a = t[r];
    if (void 0 !== a) return a.exports;
    var i = (t[r] = { id: r, loaded: !1, exports: {} });
    return e[r].call(i.exports, i, i.exports, n), (i.loaded = !0), i.exports;
  }
  (n.m = e),
    (n.x = function () {
      var e = n.O(
        void 0,
        [289, 24, 284, 861, 717, 886, 563, 159, 975, 682, 913, 241, 729, 592],
        function () {
          return n(5727);
        }
      );
      return (e = n.O(e));
    }),
    (n.amdO = {}),
    (function () {
      var e = [];
      n.O = function (t, r, a, i) {
        if (!r) {
          var o = 1 / 0;
          for (d = 0; d < e.length; d++) {
            (r = e[d][0]), (a = e[d][1]), (i = e[d][2]);
            for (var s = !0, u = 0; u < r.length; u++)
              (!1 & i || o >= i) &&
              Object.keys(n.O).every(function (e) {
                return n.O[e](r[u]);
              })
                ? r.splice(u--, 1)
                : ((s = !1), i < o && (o = i));
            if (s) {
              e.splice(d--, 1);
              var c = a();
              void 0 !== c && (t = c);
            }
          }
          return t;
        }
        i = i || 0;
        for (var d = e.length; d > 0 && e[d - 1][2] > i; d--) e[d] = e[d - 1];
        e[d] = [r, a, i];
      };
    })(),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return n.d(t, { a: t }), t;
    }),
    (function () {
      var e,
        t = Object.getPrototypeOf
          ? function (e) {
              return Object.getPrototypeOf(e);
            }
          : function (e) {
              return e.__proto__;
            };
      n.t = function (r, a) {
        if ((1 & a && (r = this(r)), 8 & a)) return r;
        if ("object" === typeof r && r) {
          if (4 & a && r.__esModule) return r;
          if (16 & a && "function" === typeof r.then) return r;
        }
        var i = Object.create(null);
        n.r(i);
        var o = {};
        e = e || [null, t({}), t([]), t(t)];
        for (
          var s = 2 & a && r;
          "object" == typeof s && !~e.indexOf(s);
          s = t(s)
        )
          Object.getOwnPropertyNames(s).forEach(function (e) {
            o[e] = function () {
              return r[e];
            };
          });
        return (
          (o.default = function () {
            return r;
          }),
          n.d(i, o),
          i
        );
      };
    })(),
    (n.d = function (e, t) {
      for (var r in t)
        n.o(t, r) &&
          !n.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (n.f = {}),
    (n.e = function (e) {
      return Promise.all(
        Object.keys(n.f).reduce(function (t, r) {
          return n.f[r](e, t), t;
        }, [])
      );
    }),
    (n.u = function (e) {
      return (
        "static/js/" +
        {
          24: "antd",
          159: "vendor~efdee510",
          241: "vendor~229eafb5",
          284: "vendor~cdd60c62",
          289: "custom",
          563: "vendor~d2eb5610",
          592: "common",
          682: "vendor~37d53f5a",
          717: "vendor~820c4f04",
          729: "vendor~a5ce148e",
          861: "vendor~db2560e8",
          886: "vendor~7f854005",
          913: "vendor~5a94f17d",
          975: "vendor~9241dc7c",
        }[e] +
        "." +
        {
          24: "9d70b1c1",
          159: "2459e0b9",
          241: "52efeb81",
          284: "832a929c",
          289: "f9e5dc12",
          563: "391301f2",
          592: "4d39e175",
          682: "d96e37c4",
          717: "6e46a94c",
          729: "2e84899a",
          861: "6d3f9f85",
          886: "8b1c1074",
          913: "e1f27d93",
          975: "1e55e1a0",
        }[e] +
        ".js"
      );
    }),
    (n.miniCssF = function (e) {
      return "static/css/custom.c8c79122.css";
    }),
    (n.g = (function () {
      if ("object" === typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" === typeof window) return window;
      }
    })()),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.r = function (e) {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (n.nmd = function (e) {
      return (e.paths = []), e.children || (e.children = []), e;
    }),
    (n.j = 665),
    (n.p = "/"),
    (function () {
      var e = { 665: 1 };
      n.f.i = function (t, r) {
        e[t] || importScripts(n.p + n.u(t));
      };
      var t = (self.webpackChunk_synfutures_v3_app =
          self.webpackChunk_synfutures_v3_app || []),
        r = t.push.bind(t);
      t.push = function (t) {
        var a = t[0],
          i = t[1],
          o = t[2];
        for (var s in i) n.o(i, s) && (n.m[s] = i[s]);
        for (o && o(n); a.length; ) e[a.pop()] = 1;
        r(t);
      };
    })(),
    (n.nc = void 0),
    (function () {
      var e = n.x;
      n.x = function () {
        return Promise.all(
          [
            289, 24, 284, 861, 717, 886, 563, 159, 975, 682, 913, 241, 729, 592,
          ].map(n.e, n)
        ).then(e);
      };
    })();
  n.x();
})();
//# sourceMappingURL=665.8ccf664c.chunk.js.map
