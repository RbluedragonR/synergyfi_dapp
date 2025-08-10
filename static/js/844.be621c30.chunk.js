!(function () {
  "use strict";
  var e = {
      51118: function (e, n, t) {
        t.d(n, {
          QD: function () {
            return b;
          },
          mD: function () {
            return I;
          },
          rl: function () {
            return m;
          },
          yo: function () {
            return k;
          },
        });
        var r = t(44925),
          a = t(1413),
          o = (t(5043), t(18148)),
          i = t.n(o),
          c = t(42052),
          u = t(47383),
          s = t(30020),
          l = t(86265),
          d = t(51997),
          f = t(43370),
          p = ["num", "colorShader", "suffix"];
        function v(e) {
          return (0, l.Md)(e).gte(0) ? "#14B84B" : "#FF6666";
        }
        var h = function (e) {
            var n = e.num,
              t = e.iProps,
              r = (0, a.Z)(
                (0, a.Z)(
                  {
                    duration: 1,
                    useEasing: !0,
                    useGrouping: !0,
                    preserveValue: !0,
                  },
                  t
                ),
                {},
                { decimals: 9 }
              ),
              o = (0, c.useCallback)(function (e) {
                return (0, l.If)({ num: e || 0, type: "price" });
              }, []);
            return (0, f.jsx)(
              u.ZP,
              (0, a.Z)(
                (0, a.Z)({}, r),
                {},
                {
                  formattingFn: o,
                  end: null === n || void 0 === n ? void 0 : n.toNumber(),
                }
              )
            );
          },
          g = function (e) {
            var n = e.num,
              t = e.formattedNumStr,
              r = e.colorShader,
              o = void 0 !== r && r,
              i = e.isBold,
              c = void 0 !== i && i,
              u = e.isShowTBMK,
              s = void 0 !== u && u,
              p = e.toolTipProps,
              g = e.prefix,
              k = e.suffix,
              b = e.showToolTip,
              I = void 0 === b || b,
              m = e.countUpProps,
              x = e.showPositive,
              w = e.colorSuffix,
              A = void 0 !== w && w,
              Z = e.isShowApproximatelyEqualTo,
              C = e.minDecimalPlaces,
              N = e.showZeroIfNegative,
              B = e.isUseMockNumber,
              T = void 0 !== B && B,
              S = e.isShowSuffixInTooltip,
              y = void 0 !== S && S,
              E = (0, l.Md)(T ? "1234567899876" : n || "");
            function _(e, n) {
              return !m || e.isNaN() || e.isZero()
                ? n
                : (0, f.jsx)(h, {
                    iProps: m,
                    num: e,
                    formattedNumStr: t,
                    isShowTBMK: s,
                  });
            }
            E.lt(0) && N && (E = (0, l.Md)(0));
            var O =
              k &&
              (0, f.jsx)("span", { className: "number-suffix", children: k });
            function D(e, n, t) {
              return arguments.length > 3 &&
                void 0 !== arguments[3] &&
                arguments[3]
                ? e && !n.eq(0)
                  ? (0, f.jsxs)("span", {
                      children: [
                        (0, f.jsxs)("b", {
                          className: "font-number",
                          style: { color: v(n) },
                          children: [g, _(n, t)],
                        }),
                        O,
                      ],
                    })
                  : (0, f.jsxs)("span", {
                      children: [
                        (0, f.jsxs)("b", {
                          className: "font-number",
                          children: [g, _(n, t)],
                        }),
                        O,
                      ],
                    })
                : e && !n.eq(0)
                ? (0, f.jsxs)("span", {
                    children: [
                      (0, f.jsxs)("span", {
                        className: "font-number",
                        style: { color: v(n) },
                        children: [g, _(n, t), A && O],
                      }),
                      !A && O,
                    ],
                  })
                : (0, f.jsxs)("span", {
                    children: [
                      (0, f.jsxs)("span", {
                        className: "font-number",
                        children: [g, _(n, t)],
                      }),
                      O,
                    ],
                  });
            }
            var M = E.eq(0) ? "0.00" : E.toString();
            return (
              (M =
                t ||
                (0, l.If)({
                  num: E,
                  showPositive: x,
                  isShowTBMK: s,
                  isShowApproximatelyEqualTo: Z,
                  minDecimalPlaces: C,
                })),
              "$" === g &&
                (M.startsWith("-") && ((g = "-$"), (M = M.slice(1))),
                M.startsWith("+") && ((g = "+$"), (M = M.slice(1))),
                M.startsWith("\uff1c") && ((g = "\uff1c$"), (M = M.slice(1)))),
              I && !E.eq(0)
                ? (0, f.jsx)(
                    d.u,
                    (0, a.Z)(
                      (0, a.Z)({}, p),
                      {},
                      {
                        title: ""
                          .concat((0, l.ET)(E))
                          .concat(y ? " ".concat(k) : ""),
                        children: D(o, E, M, c),
                      }
                    )
                  )
                : D(o, E, M, c)
            );
          },
          k = function (e) {
            var n = e.num,
              t = e.colorShader,
              r = void 0 !== t && t,
              a = e.isBold,
              o = void 0 !== a && a,
              i = e.isShowTBMK,
              c = void 0 !== i && i,
              u = e.toolTipProps,
              s = e.prefix,
              l = e.suffix,
              d = e.showPositive,
              f = e.colorSuffix,
              p = e.countUpProps,
              v = e.isShowApproximatelyEqualTo,
              h = e.showZeroIfNegative,
              k = e.showToolTip,
              b = e.minDecimalPlaces,
              I = e.isUseMockNumber,
              m = e.isShowSuffixInTooltip;
            return g({
              num: n,
              colorShader: r,
              isBold: o,
              toolTipProps: u,
              isShowTBMK: c,
              prefix: s,
              suffix: l,
              colorSuffix: f,
              countUpProps: p,
              showPositive: d,
              isShowApproximatelyEqualTo: v,
              showToolTip: k,
              minDecimalPlaces: b,
              showZeroIfNegative: h,
              isUseMockNumber: I,
              isShowSuffixInTooltip: m,
            });
          },
          b = function (e) {
            var n = e.num,
              t = e.colorShader,
              r = void 0 !== t && t,
              a = e.isOperateNum,
              o = void 0 !== a && a,
              i = e.isShowTBMK,
              c = void 0 !== i && i,
              u = e.prefix,
              s = e.isShowApproximatelyEqualTo,
              d = e.suffix,
              f = e.showPositive,
              p = e.significantDigits,
              v = e.roundingMode,
              h = (0, l.If)({
                num: n,
                type: "price",
                isOperateNum: o,
                isShowApproximatelyEqualTo: s,
                showPositive: f,
                significantDigits: p,
                roundingMode: v,
              });
            return g({
              num: n,
              formattedNumStr: h,
              colorShader: r,
              isShowTBMK: c,
              prefix: u,
              suffix: d,
            });
          },
          I = function (e) {
            var n = e.num,
              t = e.colorShader,
              o = void 0 !== t && t,
              i = e.suffix,
              c = (0, r.Z)(e, p),
              u = (0, l.Md)(n),
              s = "";
            return (
              u.eq(0) ||
                (u.abs().gte(1e6) ? (n = 1 / 0) : u.lt(0) && (n = 0),
                (s = (0, l.If)({ num: n, type: "price" }))),
              g(
                (0, a.Z)(
                  { num: n, formattedNumStr: s, colorShader: o, suffix: i },
                  c
                )
              )
            );
          };
        function m(e) {
          var n = e.percentage,
            t = e.hundredfold,
            r = void 0 === t || t,
            a = e.colorShader,
            o = void 0 === a || a,
            c = e.customTitle,
            u = e.decimals,
            p = void 0 === u ? 2 : u,
            v = e.withThreshHold,
            h = e.prefix,
            g = void 0 === h ? "" : h,
            k = e.suffix,
            b = void 0 === k ? "" : k,
            I = e.isColorShaderWhiteIfZero,
            m = void 0 !== I && I,
            x = e.isHiddenIfZero,
            w = void 0 !== x && x,
            A = e.requirePlusSymbol,
            Z = void 0 !== A && A,
            C = e.className,
            N = s.$.from(n).mul(r ? 100 : 1),
            B = (0, l.uf)(N, p);
          if (v) {
            var T = s.$.from(N),
              S = s.$.from(1 / Math.pow(10, p));
            T.notEq(0) &&
              T.abs().lt(S) &&
              (B = "<" + (N.gt(0) ? "" : "-") + S.stringValue);
          }
          var y = o ? (N.lt(0) ? "text-danger" : "text-success") : "";
          if ((m && N.eq(0) && (y = ""), N.eq(0) && w)) return null;
          var E = "";
          return (
            Z && N.gt(0) && (E = "+"),
            (0, f.jsx)(d.u, {
              title: c || void 0,
              children: (0, f.jsx)("span", {
                className: i()("font-number", C, y),
                children: "".concat(E).concat(g).concat(B, "%").concat(b),
              }),
            })
          );
        }
      },
      51997: function (e, n, t) {
        t.d(n, {
          u: function () {
            return r.Z;
          },
        });
        t(22961), t(65441);
        var r = t(11946);
      },
      51931: function (e, n, t) {
        t.d(n, {
          UA: function () {
            return k;
          },
        });
        var r,
          a,
          o,
          i = t(4942),
          c = t(68711),
          u = t(2040),
          s = t(34866),
          l = t(50339),
          d = t(27021),
          f = t(9984),
          p = t(11714),
          v = t(38278),
          h = (c.CHAIN_ID.BLAST, c.CHAIN_ID.BASE, "81457,8453".split(","));
        h &&
          h.length > 0 &&
          h.map(function (e) {
            return Number(e);
          });
        c.CHAIN_ID.BASE, c.CHAIN_ID.BLAST;
        var g = "8453,81457".split(",");
        g &&
          g.length > 0 &&
          g.map(function (e) {
            return Number(e);
          });
        parseInt(null !== (r = "8453") ? r : "1"),
          (a = {}),
          (0, i.Z)(a, c.CHAIN_ID.LINEA, (0, v.R)(c.CHAIN_ID.LINEA)),
          (0, i.Z)(
            a,
            c.CHAIN_ID.BLASTSEPOLIA,
            (0, v.R)(c.CHAIN_ID.BLASTSEPOLIA)
          ),
          (0, i.Z)(a, c.CHAIN_ID.BLAST, (0, v.R)(c.CHAIN_ID.BLAST)),
          (0, i.Z)(a, c.CHAIN_ID.ARBITRUM, (0, v.R)(c.CHAIN_ID.ARBITRUM)),
          (0, i.Z)(a, c.CHAIN_ID.BASE, (0, v.R)(c.CHAIN_ID.BASE));
        var k =
          ((o = {}),
          (0, i.Z)(o, c.CHAIN_ID.LINEA, (0, p.n)(c.CHAIN_ID.LINEA, u.P)),
          (0, i.Z)(
            o,
            c.CHAIN_ID.BLASTSEPOLIA,
            (0, p.n)(c.CHAIN_ID.BLASTSEPOLIA, s.d)
          ),
          (0, i.Z)(o, c.CHAIN_ID.BLAST, (0, p.n)(c.CHAIN_ID.BLAST, l.A)),
          (0, i.Z)(o, c.CHAIN_ID.ARBITRUM, (0, p.n)(c.CHAIN_ID.ARBITRUM, d.y)),
          (0, i.Z)(o, c.CHAIN_ID.BASE, (0, p.n)(c.CHAIN_ID.BASE, f.u)),
          o);
        c.CHAIN_ID.BASE,
          c.CHAIN_ID.BLAST,
          c.CHAIN_ID.BLASTSEPOLIA,
          c.CHAIN_ID.ARBITRUM,
          c.CHAIN_ID.LINEA,
          c.CHAIN_ID.GOERLI,
          c.CHAIN_ID.BLAST,
          c.CHAIN_ID.BASE,
          c.CHAIN_ID.BASE;
      },
      62615: function (e, n, t) {
        t.d(n, {
          p8: function () {
            return i;
          },
          rZ: function () {
            return o;
          },
          tV: function () {
            return u;
          },
        });
        var r,
          a = t(4942),
          o = "0x0000000000000000000000000000000000000000",
          i = 18,
          c = (function (e) {
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
          u =
            ((r = {}),
            (0, a.Z)(r, c.FAVORITE, "24HV"),
            (0, a.Z)(r, c.EARN_FAVORITE, "earn.estApy"),
            (0, a.Z)(r, c.VOLUME_24H, "24HV"),
            (0, a.Z)(r, c.CHANGE_24H, "24HC"),
            (0, a.Z)(r, c.TVL, "tvl"),
            (0, a.Z)(r, c.OI, "oiS"),
            (0, a.Z)(r, c.APY, "table.liqApy"),
            (0, a.Z)(r, c.BOOSTED_LIQUIDITY, "effectLiq"),
            5);
      },
      61721: function (e, n, t) {
        t.d(n, {
          zI: function () {
            return r;
          },
        });
        "".concat("syn", "-theme"), "".concat("syn", "-all-user-info");
        var r = "LOCAL_RPC_URL";
      },
      22935: function (e, n, t) {
        t.d(n, {
          R: function () {
            return l;
          },
          gI: function () {
            return s;
          },
        });
        var r = t(71002),
          a = (t(72958), t(61721), t(30020)),
          o = t(48501),
          i = t(21080),
          c = t(37113),
          u = t.n(c),
          s = function (e) {
            var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 3e3;
            return (
              (!(arguments.length > 2 && void 0 !== arguments[2]) ||
                arguments[2]) &&
                e(),
              setInterval(function () {
                e();
              }, n)
            );
          };
        function l(e) {
          var n = u().clone(e);
          if (n && n)
            try {
              Object.keys(n).forEach(function (e) {
                var t = n[e];
                if (
                  null !== t &&
                  void 0 !== t &&
                  t.bn &&
                  null !== t &&
                  void 0 !== t &&
                  t.value
                )
                  n[e] = i.O$.from(t.value);
                else if (
                  null === t ||
                  void 0 === t ||
                  !t._hex ||
                  !i.O$.isBigNumber(t) ||
                  t instanceof i.O$
                ) {
                  if (
                    null !== t &&
                    void 0 !== t &&
                    t.hex &&
                    "BigNumber" ===
                      (null === t || void 0 === t ? void 0 : t.type)
                  )
                    n[e] = i.O$.from(t);
                  else if (
                    "object" === (0, r.Z)(t) &&
                    t &&
                    Object.keys(t).length > 0
                  )
                    if (t instanceof a.$ || t instanceof o.A) n[e] = t;
                    else {
                      var c = l(t);
                      n[e] = c;
                    }
                } else n[e] = i.O$.from(t);
              });
            } catch (t) {}
          return n;
        }
      },
      86265: function (e, n, t) {
        t.d(n, {
          ET: function () {
            return h;
          },
          If: function () {
            return m;
          },
          Md: function () {
            return v;
          },
          Yu: function () {
            return C;
          },
          c2: function () {
            return N;
          },
          dF: function () {
            return Z;
          },
          iL: function () {
            return A;
          },
          uf: function () {
            return w;
          },
        });
        var r = t(78997),
          a = t(79890),
          o = t(21080),
          i = t(57331),
          c = t(14846),
          u = (t(37113), t(72958)),
          s = t(62615),
          l = t(81773),
          d = t(30020),
          f = t(72411);
        function p(e) {
          var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 4,
            t = e.toString(10),
            a = (function (e) {
              var n = v(e).toString(10).split(".")[1];
              if (n) {
                for (var t = 0, r = 0; r < n.length && "0" === n[r]; r++) t++;
                return t;
              }
              return 0;
            })(e),
            o = t.split("."),
            i = (0, r.Z)(o, 2),
            c = i[0],
            u = i[1];
          if (a > 20 || 0 === a) return t;
          var s = u.slice(a, u.length).slice(0, n),
            d = "".concat(s).concat("0".repeat(n - s.length));
          return "".concat(c, ".0").concat(l.V[a]).concat(d);
        }
        function v(e) {
          var n = e;
          return (
            "ether" ===
              (arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "normal") &&
              o.O$.isBigNumber(e) &&
              (n = i.formatEther(e)),
            "undefined" === typeof n && (n = 0),
            new a.Z(n.toString(10), 10)
          );
        }
        function h(e) {
          var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 10,
            t = v(e);
          return t.isNaN() ? "" : t.toString(n);
        }
        var g = function (e) {
            var n = e.toString().split(".");
            return n.length > 0
              ? ((n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")),
                n.join("."))
              : "";
          },
          k = ["K", "M", "B", "T"],
          b = Math.pow(10, 3);
        function I(e, n, t) {
          var r =
            arguments.length > 3 && void 0 !== arguments[3]
              ? arguments[3]
              : u.z9;
          t || (t = a.Z.ROUND_DOWN);
          var o = k.findIndex(function (e) {
              return e === n;
            }),
            i = e.toString(10);
          return (e = e.div(b)).gte(b) && "T" !== n
            ? I(e, k[o + 1], t, r)
            : ("T" === n && e.gte(b)
                ? (e = e.integerValue(t))
                : 0 !== r && (e = e.precision(r, t)),
              (i = ""
                .concat(0 === r ? e.toFixed(0, t) : e.toPrecision(r, t))
                .concat(k[o])),
              { numBN: e, numStr: i });
        }
        function m(e) {
          var n = e.num,
            t = e.isShowSeparator,
            r = void 0 === t || t,
            o = e.type,
            i = void 0 === o ? "normal" : o,
            c = e.isOperateNum,
            d = void 0 !== c && c,
            f = e.isShowTBMK,
            h = void 0 !== f && f,
            k = e.isShowApproximatelyEqualTo,
            b = void 0 === k || k,
            m = e.showPositive,
            x = e.roundingMode,
            w = void 0 === x ? a.Z.ROUND_DOWN : x,
            A = e.significantDigits,
            Z = void 0 === A ? s.tV : A,
            C = e.minDecimalPlaces,
            N = void 0 === C ? u.z9 : C,
            B = e.showTrailingZeros,
            T = void 0 === B || B,
            S = v(n);
          (S.isNaN() || S.eq(1 / 0)) && (S = v(0));
          var y = "";
          S.isNegative()
            ? ((y = "-"), (S = S.abs()))
            : m && S.gt(0) && (y = "+");
          var E = S.toString(10);
          if (d) E = S.gte(1) ? S.toFixed(N, w) : S.toPrecision(N, w);
          else if (S.eq(0)) E = S.toFixed(2, w);
          else if (S.gte(1e4)) {
            if (((E = S.integerValue(w).toString()), h))
              E = I(S, "K", w, N).numStr;
          } else if (S.gte(1e3) && S.lt(1e4)) {
            if ("price" === i) E = (S = S.precision(Z, w)).toPrecision(Z, w);
            else if (((E = S.precision(Z, w).toPrecision(Z, w)), h))
              E = I(S, "K", w, N).numStr;
          } else if (S.gte(1) && S.lt(1e3))
            (S = S.precision(Z, w)),
              (E = 0 === N ? S.toFixed(0, w) : S.toPrecision(Z, w));
          else if (S.gte(1e-4) && S.lt(1))
            E =
              "price" === i
                ? T && S.lt((0, a.Z)(l.c)) && S.gt((0, a.Z)(0))
                  ? p((S = S.precision(Z, w)))
                  : (S = S.precision(Z, w)).toPrecision(Z, w)
                : S.toFixed(N, w);
          else {
            if ("price" !== i)
              return (
                (E = S.toFixed(N, w)), "".concat(b ? "\u2248" : "").concat(E)
              );
            var _ = (S = S.precision(Z - 1, w)).decimalPlaces() || 0;
            E =
              T && S.lt((0, a.Z)(l.c)) && S.gt((0, a.Z)(0))
                ? p(S)
                : _ > 8
                ? S.toFixed(8, w)
                : S.toPrecision(4, w);
          }
          return r && (E = g(E)), "".concat(y).concat(E);
        }
        var x = function (e) {
          var n = e.toString().split(".");
          return n.length > 0
            ? ((n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")), n.join("."))
            : "";
        };
        function w(e) {
          var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : u.z9,
            t =
              !(arguments.length > 2 && void 0 !== arguments[2]) ||
              arguments[2],
            r =
              arguments.length > 3 && void 0 !== arguments[3]
                ? arguments[3]
                : a.Z.ROUND_DOWN,
            o = arguments.length > 4 && void 0 !== arguments[4] && arguments[4],
            i = v(e);
          (i.isNaN() || i.eq(1 / 0)) && (i = v(0));
          var c,
            s = i.toFixed(n, r);
          return (
            t && (s = x(s)),
            o &&
              ((c = (c = s).toString()).match(/\./) &&
                (c = c.replace(/\.?0+$/, "")),
              (s = c)),
            s
          );
        }
        function A(e) {
          var n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 4,
            t = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
          if (((e = e.toString()), 0 === Number(e))) return e;
          var r = t ? /[^0-9.-]/g : /[^0-9.]/g,
            a = (e = e.replace(r, "")).split(".");
          if (a.length >= 3) return "";
          var o = a[0];
          if (o.length > 0)
            for (; o.length > 1 && "0" === o[0]; ) {
              var i;
              o = null === (i = o) || void 0 === i ? void 0 : i.substring(1);
            }
          else 0 === e.indexOf(".") && (o = "0");
          var c,
            u = a[1] || "";
          u &&
            u.length > n &&
            (u = null === (c = u) || void 0 === c ? void 0 : c.substring(0, n));
          return (e =
            u && 0 !== u.length
              ? "".concat(o, ".").concat(u)
              : o + (2 === a.length && 0 !== n ? "." : ""));
        }
        function Z(e) {
          var n =
              arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
            t = e || u.xE;
          return (
            n &&
              !t.eq(u.xE) &&
              (t = (function (e) {
                return e.eq(0) ? e : (0, f.wdiv)(C(1), e);
              })(t)),
            i.formatEther(t)
          );
        }
        function C(e) {
          var n =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
          return (0, c.parseUnits)(e.toString()).div(Math.pow(10, n));
        }
        function N(e) {
          var n = e.percentage,
            t = e.hundredfold,
            r = void 0 === t || t,
            o = e.decimals,
            i = void 0 === o ? 2 : o,
            c = e.roundingMode,
            u = void 0 === c ? a.Z.ROUND_DOWN : c,
            s = d.$.from(n).mul(r ? 100 : 1);
          return "".concat(w(s, i, !1, u), "%");
        }
      },
      84407: function (e, n, t) {
        t.d(n, {
          lp: function () {
            return l;
          },
        });
        var r = t(74165),
          a = t(15861),
          o = (t(74790), t(73159)),
          i = t.n(o),
          c = t(37113),
          u = t.n(c),
          s = t(61721);
        function l(e) {
          return d.apply(this, arguments);
        }
        function d() {
          return (d = (0, a.Z)(
            (0, r.Z)().mark(function e(n) {
              var t, a;
              return (0, r.Z)().wrap(function (e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (e.next = 2), i().getItem(s.zI);
                    case 2:
                      if (((e.t0 = e.sent), e.t0)) {
                        e.next = 5;
                        break;
                      }
                      e.t0 = {};
                    case 5:
                      if (
                        ((t = e.t0),
                        !(a = u().get(t, [n || ""])) ||
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
      77377: function (e, n, t) {
        t.d(n, {
          tG: function () {
            return c;
          },
          z3: function () {
            return i;
          },
        });
        var r = t(1413),
          a = (t(72411), t(30585)),
          o = (t(51931), t(62615));
        function i(e, n) {
          return (0, r.Z)(
            (0, r.Z)({}, e),
            {},
            {
              id: e.address.toLowerCase(),
              address: e.address.toLowerCase(),
              chainId: n,
              decimals: e.decimals || o.p8,
            }
          );
        }
        function c(e) {
          return !!e && e.toLowerCase() === a.d;
        }
      },
      84974: function (e, n, t) {
        var r = t(1413),
          a = t(78997),
          o = t(74165),
          i = t(15861),
          c = t(15671),
          u = t(43144),
          s = (t(68167), t(80997)),
          l = t(76614),
          d = t(37113),
          f = t.n(d),
          p = t(62615),
          v = t(92231),
          h = t(22935),
          g = t(77377),
          k = t(58123),
          b = t(91164),
          I = t(48920),
          m = (t(86926), t(68711)),
          x = (function () {
            function e(n) {
              var t = this;
              (0, c.Z)(this, e),
                (this.chainId = void 0),
                (this.chainContext = void 0),
                (this.ERC20ContractMap = new Map()),
                (this.WrappedNativeContractMap = new Map()),
                (this.getERC20Contract = function (e, n) {
                  var r = t.ERC20ContractMap.get(e);
                  return (
                    r ||
                    ((r = s.ERC20__factory.connect(e, n)),
                    t.ERC20ContractMap.set(e, r),
                    r)
                  );
                }),
                (this.getWrappedNativeContract = function (e, n) {
                  var r = t.WrappedNativeContractMap.get(e);
                  return (
                    r ||
                    ((r = s.WrappedNative__factory.connect(e, n)),
                    t.WrappedNativeContractMap.set(e, r),
                    r)
                  );
                }),
                (this.chainId = n),
                (this.chainContext = new m.Context(n));
            }
            return (
              (0, u.Z)(e, null, [
                {
                  key: "getInstance",
                  value: function (n) {
                    var t = this.instances.get(n);
                    return t || ((t = new e(n)), this.instances.set(n, t)), t;
                  },
                },
              ]),
              e
            );
          })();
        x.instances = new Map();
        var w = t(89052),
          A = (function () {
            function e(n) {
              var t = this;
              (0, c.Z)(this, e),
                (this.chainId = void 0),
                (this.chainContextWorker = void 0),
                (this.erc20Worker = void 0),
                (this.nativeTokenBalanceInBlock = void 0),
                (this.erc20TokenBalanceMap = void 0),
                (this.erc20AllowanceMap = void 0),
                (this.listeningEvent = void 0),
                (this.isRequestBalance = {}),
                (this.isRequestAllowance = {}),
                (this.getERC20Contract = function (e) {
                  return t.erc20Worker.getERC20Contract(e, t.provider);
                }),
                (this.getWrappedNativeContract = function (e) {
                  return t.erc20Worker.getWrappedNativeContract(e, t.provider);
                }),
                (this.fetchTokenBalance = (function () {
                  var e = (0, i.Z)(
                    (0, o.Z)().mark(function e(n, r, a) {
                      var i, c, u, s;
                      return (0, o.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (a) {
                                e.next = 4;
                                break;
                              }
                              return (e.next = 3), t.provider.getBlockNumber();
                            case 3:
                              a = e.sent;
                            case 4:
                              if (
                                f().get(t.isRequestBalance, [r, n.address, a])
                              ) {
                                e.next = 9;
                                break;
                              }
                              f().set(
                                t.isRequestBalance,
                                [r, n.address, a],
                                !0
                              ),
                                (e.next = 10);
                              break;
                            case 9:
                              return e.abrupt("return", void 0);
                            case 10:
                              return (
                                (c = t.getERC20Contract(n.address)),
                                (e.next = 13),
                                c.balanceOf(r, { blockTag: a })
                              );
                            case 13:
                              if (
                                ((u = e.sent),
                                !(
                                  t.erc20TokenBalanceMap &&
                                  a <
                                    (null ===
                                      (i = t.erc20TokenBalanceMap[n.address]) ||
                                    void 0 === i
                                      ? void 0
                                      : i.block)
                                ))
                              ) {
                                e.next = 16;
                                break;
                              }
                              return e.abrupt(
                                "return",
                                t.erc20TokenBalanceMap[n.address]
                              );
                            case 16:
                              return (
                                (s = t.updateBalanceCache({
                                  userAddr: r,
                                  token: n,
                                  balance: u,
                                  block: a,
                                })),
                                e.abrupt("return", s)
                              );
                            case 18:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (n, t, r) {
                    return e.apply(this, arguments);
                  };
                })()),
                (this.watchERC20Balance = (function () {
                  var e = (0, i.Z)(
                    (0, o.Z)().mark(function e(n, r) {
                      var a, i;
                      return (0, o.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (((a = t.chainId), !(0, g.tG)(n.address))) {
                                e.next = 3;
                                break;
                              }
                              return e.abrupt("return");
                            case 3:
                              (i = t.getERC20Contract(n.address)).on(
                                {
                                  topics: [
                                    [
                                      i.interface.getEventTopic("Transfer"),
                                      i.interface.getEventTopic("Deposit"),
                                      i.interface.getEventTopic("Withdrawal"),
                                      i.interface.getEventTopic("Approval"),
                                    ],
                                    l.hexZeroPad(r, 32),
                                  ],
                                },
                                function (e) {
                                  var o = i.interface.parseLog(e);
                                  if (
                                    (t.fetchTokenBalance(n, r, e.blockNumber),
                                    "Approval" === o.name)
                                  ) {
                                    var c = o.args.to,
                                      u = o.args.amount;
                                    (0, w.Ud)(v.e.ApprovalEvent, {
                                      chainId: a,
                                      userAddr: r,
                                      block: e.blockNumber,
                                      token: n,
                                      allowanceInfo: {
                                        spender: c.toLowerCase(),
                                        allowance: u,
                                      },
                                    });
                                  }
                                }
                              );
                            case 5:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (n, t) {
                    return e.apply(this, arguments);
                  };
                })()),
                (this.callERC20Allowance = (function () {
                  var e = (0, i.Z)(
                    (0, o.Z)().mark(function e(n) {
                      var r, a, i, c, u, s, l;
                      return (0, o.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (
                                ((r = n.token),
                                (a = n.spender),
                                (i = n.userAddr),
                                (c = n.block))
                              ) {
                                e.next = 5;
                                break;
                              }
                              return (e.next = 4), t.provider.getBlockNumber();
                            case 4:
                              c = e.sent;
                            case 5:
                              if (null !== r && void 0 !== r && r.address) {
                                e.next = 7;
                                break;
                              }
                              return e.abrupt("return", {
                                data: void 0,
                                block: c,
                              });
                            case 7:
                              if (
                                f().get(t.isRequestAllowance, [
                                  i,
                                  r.address.toLowerCase(),
                                  c,
                                ])
                              ) {
                                e.next = 12;
                                break;
                              }
                              f().set(
                                t.isRequestAllowance,
                                [i, r.address.toLowerCase(), c],
                                !0
                              ),
                                (e.next = 13);
                              break;
                            case 12:
                              return e.abrupt("return", {
                                data: void 0,
                                block: c,
                              });
                            case 13:
                              return (
                                (u = t.getERC20Contract(r.address)),
                                (e.next = 16),
                                u.allowance(i, a)
                              );
                            case 16:
                              if (
                                ((s = e.sent),
                                !(
                                  (l = f().get(t.erc20AllowanceMap, [
                                    r.address,
                                    a,
                                  ])) &&
                                  c <
                                    (null === l || void 0 === l
                                      ? void 0
                                      : l.block)
                                ))
                              ) {
                                e.next = 20;
                                break;
                              }
                              return e.abrupt("return", l);
                            case 20:
                              return (
                                t.updateAllowanceCache({
                                  userAddr: i,
                                  token: r,
                                  spender: a,
                                  allowance: s,
                                  block: c,
                                }),
                                e.abrupt("return", { data: s, block: c })
                              );
                            case 22:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (n) {
                    return e.apply(this, arguments);
                  };
                })()),
                (this.multicallBalance = (function () {
                  var e = (0, i.Z)(
                    (0, o.Z)().mark(function e(n, r, a) {
                      var i, c, u, s, l;
                      return (0, o.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (i = n),
                                (e.next = 3),
                                t.chainContext.tokenAssistant.balanceOfTokenBatch(
                                  i.map(function (e) {
                                    return e.address;
                                  }),
                                  [r],
                                  { blockTag: a }
                                )
                              );
                            case 3:
                              return (
                                (c = e.sent),
                                (u = i.map(function (e, n) {
                                  return {
                                    token: e,
                                    balance: c.balances[0][n],
                                  };
                                })),
                                null !== c &&
                                  void 0 !== c &&
                                  c.blockInfo &&
                                  (a =
                                    null === (s = c.blockInfo) ||
                                    void 0 === s ||
                                    null === (l = s.height) ||
                                    void 0 === l
                                      ? void 0
                                      : l.toNumber()),
                                null !== u &&
                                  void 0 !== u &&
                                  u.length &&
                                  u.forEach(function (e) {
                                    t.updateBalanceCache({
                                      userAddr: r,
                                      token: e.token,
                                      balance: e.balance,
                                      block: a || 0,
                                    });
                                  }),
                                e.abrupt("return", { block: a || 0, data: u })
                              );
                            case 8:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (n, t, r) {
                    return e.apply(this, arguments);
                  };
                })()),
                (this.multicallAllowance = (function () {
                  var e = (0, i.Z)(
                    (0, o.Z)().mark(function e(n, r, i, c) {
                      var u, l, d;
                      return (0, o.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (null !== n && void 0 !== n && n.length && i) {
                                e.next = 2;
                                break;
                              }
                              return e.abrupt("return");
                            case 2:
                              return (
                                (u = n.map(function (e) {
                                  var n = s.ERC20__factory.connect(
                                    e.address,
                                    t.provider
                                  );
                                  return {
                                    callData: n.interface.encodeFunctionData(
                                      "allowance",
                                      [i, r]
                                    ),
                                    contract: n,
                                    token: e,
                                  };
                                })),
                                (e.next = 5),
                                t.chainContext.multiCall3.callStatic.aggregate3(
                                  u.map(function (e) {
                                    return {
                                      target: e.token.address,
                                      callData: e.callData,
                                      allowFailure: !1,
                                    };
                                  })
                                )
                              );
                            case 5:
                              return (
                                (l = e.sent),
                                null !==
                                  (d = u.map(function (e, n) {
                                    var t =
                                        e.contract.interface.decodeFunctionResult(
                                          "allowance",
                                          l[n].returnData
                                        ),
                                      r = (0, a.Z)(t, 1)[0];
                                    return { token: e.token, allowance: r };
                                  })) &&
                                  void 0 !== d &&
                                  d.length &&
                                  d.forEach(function (e) {
                                    t.updateAllowanceCache({
                                      userAddr: i,
                                      token: e.token,
                                      spender: r,
                                      allowance: e.allowance,
                                      block: c || 0,
                                    });
                                  }),
                                e.abrupt("return", { block: c || 0, data: d })
                              );
                            case 9:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (n, t, r, a) {
                    return e.apply(this, arguments);
                  };
                })()),
                (this.chainId = n);
              var r = (0, b.XJ)(
                n,
                null === k.u || void 0 === k.u ? void 0 : k.u[n]
              );
              (this.chainContextWorker = new I.z(n, r)),
                (this.erc20Worker = x.getInstance(n)),
                (this.erc20TokenBalanceMap = {}),
                (this.erc20AllowanceMap = {}),
                (this.listeningEvent = {});
            }
            return (
              (0, u.Z)(
                e,
                [
                  {
                    key: "init",
                    value: (function () {
                      var e = (0, i.Z)(
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
                    key: "chainInfo",
                    get: function () {
                      return this.chainContext.info;
                    },
                  },
                  {
                    key: "fetchNativeTokenBalance",
                    value: (function () {
                      var e = (0, i.Z)(
                        (0, o.Z)().mark(function e(n, t) {
                          var a, i, c, u;
                          return (0, o.Z)().wrap(
                            function (e) {
                              for (;;)
                                switch ((e.prev = e.next)) {
                                  case 0:
                                    return (
                                      (e.next = 3),
                                      this.provider.getBalance(n, t)
                                    );
                                  case 3:
                                    if (
                                      ((c = e.sent),
                                      (u = { balance: c, block: t || 0 }),
                                      !(
                                        this.nativeTokenBalanceInBlock &&
                                        (u.block || 0) <
                                          ((null ===
                                            (a =
                                              this.nativeTokenBalanceInBlock) ||
                                          void 0 === a
                                            ? void 0
                                            : a.block) || 0)
                                      ))
                                    ) {
                                      e.next = 8;
                                      break;
                                    }
                                    return e.abrupt(
                                      "return",
                                      this.nativeTokenBalanceInBlock
                                    );
                                  case 8:
                                    return (
                                      u.balance.eq(
                                        (null ===
                                          (i =
                                            this.nativeTokenBalanceInBlock) ||
                                        void 0 === i
                                          ? void 0
                                          : i.balance) || -1
                                      ) ||
                                        (0, w.Ud)(v.e.NativeBalanceEvent, {
                                          balanceInfo: (0, r.Z)({}, u),
                                          chainId: this.chainId,
                                          userAddr: n,
                                          token: this.chainContext.nativeToken,
                                          block: t || 0,
                                        }),
                                      (this.nativeTokenBalanceInBlock = u),
                                      e.abrupt("return", u)
                                    );
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
                      return function (n, t) {
                        return e.apply(this, arguments);
                      };
                    })(),
                  },
                  {
                    key: "updateBalanceCache",
                    value: function (e) {
                      var n,
                        t = e.userAddr,
                        a = e.balance,
                        o = e.token,
                        i = e.block;
                      if (a && null !== o && void 0 !== o && o.address) {
                        var c = { block: i, balance: a };
                        if (
                          !c.balance.eq(
                            (null ===
                              (n = this.erc20TokenBalanceMap[o.address]) ||
                            void 0 === n
                              ? void 0
                              : n.balance) || -1
                          )
                        ) {
                          var u = v.e.BalanceEvent;
                          (0, w.Ud)(u, {
                            balanceInfo: (0, r.Z)({}, c),
                            chainId: this.chainId,
                            userAddr: t,
                            token: o,
                            block: i,
                          });
                        }
                        return (
                          f().set(this.erc20TokenBalanceMap, [o.address], c), c
                        );
                      }
                    },
                  },
                  {
                    key: "updateAllowanceCache",
                    value: function (e) {
                      var n = e.userAddr,
                        t = e.token,
                        r = e.spender,
                        a = e.allowance,
                        o = e.block;
                      if (a && null !== t && void 0 !== t && t.address && r) {
                        var i = f().get(this.erc20AllowanceMap, [t.address, r]);
                        (i &&
                          a.eq(
                            (null === i || void 0 === i ? void 0 : i.data) || 0
                          )) ||
                          (0, w.Ud)(v.e.UpdateTokenAllowanceEvent, {
                            chainId: this.chainId,
                            userAddr: n,
                            block: o,
                            token: t,
                            allowanceInfo: { spender: r, allowance: a },
                          }),
                          f().set(this.erc20AllowanceMap, [t.address, r], {
                            data: a,
                            block: o,
                          });
                      }
                    },
                  },
                ],
                [
                  {
                    key: "getInstance",
                    value: (function () {
                      var n = (0, i.Z)(
                        (0, o.Z)().mark(function n(t) {
                          var r;
                          return (0, o.Z)().wrap(
                            function (n) {
                              for (;;)
                                switch ((n.prev = n.next)) {
                                  case 0:
                                    if ((r = this.instances["".concat(t)])) {
                                      n.next = 6;
                                      break;
                                    }
                                    return (
                                      (r = new e(t)),
                                      (this.instances["".concat(t)] = r),
                                      (n.next = 6),
                                      r.init()
                                    );
                                  case 6:
                                    return n.abrupt("return", r);
                                  case 7:
                                  case "end":
                                    return n.stop();
                                }
                            },
                            n,
                            this
                          );
                        })
                      );
                      return function (e) {
                        return n.apply(this, arguments);
                      };
                    })(),
                  },
                ]
              ),
              e
            );
          })();
        A.instances = {};
        var Z = (function () {
          function e() {
            var n = this;
            (0, c.Z)(this, e),
              (this.polling = void 0),
              (this.pollingFetchNativeTokenBalance = (function () {
                var e = (0, i.Z)(
                  (0, o.Z)().mark(function e(t, r) {
                    var a;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            n.clearPolling(),
                              (a = n.getChainInstance(t)),
                              (n.polling = (0, h.gI)(
                                (0, i.Z)(
                                  (0, o.Z)().mark(function e() {
                                    return (0, o.Z)().wrap(function (e) {
                                      for (;;)
                                        switch ((e.prev = e.next)) {
                                          case 0:
                                            a.fetchNativeTokenBalance(r);
                                          case 1:
                                          case "end":
                                            return e.stop();
                                        }
                                    }, e);
                                  })
                                ),
                                5e3,
                                !0
                              ));
                          case 3:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n, t) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.watchERC20Balance = (function () {
                var e = (0, i.Z)(
                  (0, o.Z)().mark(function e(t, r, a) {
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            n.getChainInstance(t).watchERC20Balance(a, r);
                          case 2:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n, t, r) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.multicallBalance = (function () {
                var e = (0, i.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var r, a, i, c, u, s;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = t.chainId),
                              (a = t.tokens),
                              (i = t.userAddr),
                              (c = t.block),
                              (u = n.getChainInstance(r)),
                              (e.next = 5),
                              u.multicallBalance(a, i, c)
                            );
                          case 5:
                            return (s = e.sent), e.abrupt("return", s);
                          case 7:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.multicallAllowance = (function () {
                var e = (0, i.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var r, a, i, c, u, s, l;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((r = t.chainId),
                              (a = t.tokens),
                              (i = t.userAddr),
                              (c = t.spender),
                              (u = t.block),
                              (s = n.getChainInstance(r)),
                              u)
                            ) {
                              e.next = 6;
                              break;
                            }
                            return (e.next = 5), s.provider.getBlockNumber();
                          case 5:
                            u = e.sent;
                          case 6:
                            return (
                              (e.next = 8), s.multicallAllowance(a, c, i, u)
                            );
                          case 8:
                            return (l = e.sent), e.abrupt("return", l);
                          case 10:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })()),
              (this.callERC20Allowance = (function () {
                var e = (0, i.Z)(
                  (0, o.Z)().mark(function e(t) {
                    var r, a, i, c, u, s, l;
                    return (0, o.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((r = t.chainId),
                              (a = t.token),
                              (i = t.spender),
                              (c = t.userAddr),
                              (u = t.block),
                              (s = n.getChainInstance(r)),
                              u)
                            ) {
                              e.next = 6;
                              break;
                            }
                            return (e.next = 5), s.provider.getBlockNumber();
                          case 5:
                            u = e.sent;
                          case 6:
                            return (
                              (e.next = 8),
                              s.callERC20Allowance({
                                token: a,
                                spender: i,
                                userAddr: c,
                                block: u,
                              })
                            );
                          case 8:
                            return (l = e.sent), e.abrupt("return", l);
                          case 10:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })());
          }
          return (
            (0, u.Z)(
              e,
              [
                {
                  key: "getChainInstance",
                  value: function (e) {
                    var n = this[e];
                    return n || ((n = new A(e)), (this[e] = n)), n;
                  },
                },
                {
                  key: "clearPolling",
                  value: function () {
                    this.polling && clearInterval(this.polling);
                  },
                },
              ],
              [
                {
                  key: "getInstance",
                  value: (function () {
                    var n = (0, i.Z)(
                      (0, o.Z)().mark(function n(t) {
                        var r;
                        return (0, o.Z)().wrap(
                          function (n) {
                            for (;;)
                              switch ((n.prev = n.next)) {
                                case 0:
                                  return (
                                    (r = this.instances.get(t)) ||
                                      ((r = new e()), this.instances.set(t, r)),
                                    n.abrupt("return", r)
                                  );
                                case 3:
                                case "end":
                                  return n.stop();
                              }
                          },
                          n,
                          this
                        );
                      })
                    );
                    return function (e) {
                      return n.apply(this, arguments);
                    };
                  })(),
                },
              ]
            ),
            e
          );
        })();
        (Z.instances = new Map()),
          (onmessage = (function () {
            var e = (0, i.Z)(
              (0, o.Z)().mark(function e(n) {
                var t, r, a, i, c, u, s, l, d, f, h, k, b, I, m, x, w, A;
                return (0, o.Z)().wrap(
                  function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (
                            ((e.prev = 0),
                            (t = n.data).eventName !== v.e.BalanceEvent)
                          ) {
                            e.next = 12;
                            break;
                          }
                          if (
                            ((r = t.data),
                            (a = r.chainId),
                            (i = r.userAddr),
                            (c = r.token),
                            i !== p.rZ)
                          ) {
                            e.next = 6;
                            break;
                          }
                          return e.abrupt("return");
                        case 6:
                          return (e.next = 8), Z.getInstance(a);
                        case 8:
                          (u = e.sent),
                            c &&
                              ((0, g.tG)(c.address) ||
                                u.watchERC20Balance(a, i, t.data.token)),
                            (e.next = 30);
                          break;
                        case 12:
                          if (t.eventName !== v.e.MulticallTokensAllowance) {
                            e.next = 22;
                            break;
                          }
                          if (
                            ((s = t.data),
                            (l = s.chainId),
                            (d = s.tokens),
                            (f = s.spender),
                            (h = s.userAddr),
                            (k = s.block),
                            h !== p.rZ)
                          ) {
                            e.next = 16;
                            break;
                          }
                          return e.abrupt("return");
                        case 16:
                          return (e.next = 18), Z.getInstance(l);
                        case 18:
                          (b = e.sent),
                            null !== d &&
                              void 0 !== d &&
                              d.length &&
                              b.multicallAllowance({
                                chainId: l,
                                tokens: d,
                                userAddr: h,
                                spender: f,
                                block: k,
                              }),
                            (e.next = 30);
                          break;
                        case 22:
                          if (t.eventName !== v.e.MulticallBalance) {
                            e.next = 30;
                            break;
                          }
                          if (
                            ((I = t.data),
                            (m = I.chainId),
                            (x = I.userAddr),
                            (w = I.tokens),
                            x !== p.rZ)
                          ) {
                            e.next = 26;
                            break;
                          }
                          return e.abrupt("return");
                        case 26:
                          return (e.next = 28), Z.getInstance(m);
                        case 28:
                          (A = e.sent),
                            null !== w &&
                              void 0 !== w &&
                              w.length &&
                              A.multicallBalance({
                                chainId: m,
                                userAddr: x,
                                tokens: w,
                              });
                        case 30:
                          e.next = 35;
                          break;
                        case 32:
                          (e.prev = 32), (e.t0 = e.catch(0));
                        case 35:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [[0, 32]]
                );
              })
            );
            return function (n) {
              return e.apply(this, arguments);
            };
          })());
      },
    },
    n = {};
  function t(r) {
    var a = n[r];
    if (void 0 !== a) return a.exports;
    var o = (n[r] = { id: r, loaded: !1, exports: {} });
    return e[r].call(o.exports, o, o.exports, t), (o.loaded = !0), o.exports;
  }
  (t.m = e),
    (t.x = function () {
      var e = t.O(
        void 0,
        [289, 24, 284, 861, 717, 886, 563, 159, 975, 682, 913, 241, 729, 592],
        function () {
          return t(84974);
        }
      );
      return (e = t.O(e));
    }),
    (t.amdO = {}),
    (function () {
      var e = [];
      t.O = function (n, r, a, o) {
        if (!r) {
          var i = 1 / 0;
          for (l = 0; l < e.length; l++) {
            (r = e[l][0]), (a = e[l][1]), (o = e[l][2]);
            for (var c = !0, u = 0; u < r.length; u++)
              (!1 & o || i >= o) &&
              Object.keys(t.O).every(function (e) {
                return t.O[e](r[u]);
              })
                ? r.splice(u--, 1)
                : ((c = !1), o < i && (i = o));
            if (c) {
              e.splice(l--, 1);
              var s = a();
              void 0 !== s && (n = s);
            }
          }
          return n;
        }
        o = o || 0;
        for (var l = e.length; l > 0 && e[l - 1][2] > o; l--) e[l] = e[l - 1];
        e[l] = [r, a, o];
      };
    })(),
    (t.n = function (e) {
      var n =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return t.d(n, { a: n }), n;
    }),
    (function () {
      var e,
        n = Object.getPrototypeOf
          ? function (e) {
              return Object.getPrototypeOf(e);
            }
          : function (e) {
              return e.__proto__;
            };
      t.t = function (r, a) {
        if ((1 & a && (r = this(r)), 8 & a)) return r;
        if ("object" === typeof r && r) {
          if (4 & a && r.__esModule) return r;
          if (16 & a && "function" === typeof r.then) return r;
        }
        var o = Object.create(null);
        t.r(o);
        var i = {};
        e = e || [null, n({}), n([]), n(n)];
        for (
          var c = 2 & a && r;
          "object" == typeof c && !~e.indexOf(c);
          c = n(c)
        )
          Object.getOwnPropertyNames(c).forEach(function (e) {
            i[e] = function () {
              return r[e];
            };
          });
        return (
          (i.default = function () {
            return r;
          }),
          t.d(o, i),
          o
        );
      };
    })(),
    (t.d = function (e, n) {
      for (var r in n)
        t.o(n, r) &&
          !t.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: n[r] });
    }),
    (t.f = {}),
    (t.e = function (e) {
      return Promise.all(
        Object.keys(t.f).reduce(function (n, r) {
          return t.f[r](e, n), n;
        }, [])
      );
    }),
    (t.u = function (e) {
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
    (t.miniCssF = function (e) {
      return "static/css/custom.c8c79122.css";
    }),
    (t.g = (function () {
      if ("object" === typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" === typeof window) return window;
      }
    })()),
    (t.o = function (e, n) {
      return Object.prototype.hasOwnProperty.call(e, n);
    }),
    (t.r = function (e) {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (t.nmd = function (e) {
      return (e.paths = []), e.children || (e.children = []), e;
    }),
    (t.j = 844),
    (t.p = "/"),
    (function () {
      var e = { 844: 1 };
      t.f.i = function (n, r) {
        e[n] || importScripts(t.p + t.u(n));
      };
      var n = (self.webpackChunk_synfutures_v3_app =
          self.webpackChunk_synfutures_v3_app || []),
        r = n.push.bind(n);
      n.push = function (n) {
        var a = n[0],
          o = n[1],
          i = n[2];
        for (var c in o) t.o(o, c) && (t.m[c] = o[c]);
        for (i && i(t); a.length; ) e[a.pop()] = 1;
        r(n);
      };
    })(),
    (t.nc = void 0),
    (function () {
      var e = t.x;
      t.x = function () {
        return Promise.all(
          [
            289, 24, 284, 861, 717, 886, 563, 159, 975, 682, 913, 241, 729, 592,
          ].map(t.e, t)
        ).then(e);
      };
    })();
  t.x();
})();
//# sourceMappingURL=844.be621c30.chunk.js.map
