import { jsx as R, jsxs as I } from "react/jsx-runtime";
import { useRef as y, useEffect as $, useState as U } from "react";
const F = (t) => t === document.documentElement ? (document.scrollingElement || document.documentElement).scrollTop : t === window ? Math.max(
  window.pageYOffset,
  document.documentElement.scrollTop,
  document.body.scrollTop
) : t.scrollTop;
let x = !1;
try {
  const t = Object.defineProperty({}, "passive", {
    get() {
      x = !0;
    }
  });
  window.addEventListener("test", null, t);
} catch {
}
const n = {
  isSupportsPassive: () => x,
  on(t, o, s, l = { passive: !1 }) {
    t.addEventListener(o, s, x ? l : !1);
  },
  off(t, o, s, l = { passive: !1 }) {
    t.removeEventListener(o, s, x ? l : !1);
  }
}, W = (t) => {
  for (; t && t.parentNode && t.parentNode !== document.body; ) {
    const o = window.getComputedStyle(t);
    if (
      // The value of `overflow/overflowY` is scroll/auto
      (["scroll", "auto"].indexOf(o.overflowY) > -1 || ["scroll", "auto"].indexOf(o.overflow) > -1) && // The value of `height/max-height` grather than 0  `
      (parseInt(o.height, 10) > 0 || parseInt(o.maxHeight, 10) > 0)
    )
      return t;
    t = t.parentNode;
  }
  return window;
}, z = () => {
  const t = y(), o = y(0), s = y(window), l = y(() => {
  }), d = (e) => {
    o.current = 0;
    const a = (f) => {
      const h = f.touches[0];
      o.current = h.pageY;
    }, c = (f) => {
      var p;
      f.touches[0].pageY - o.current > 0 && f.cancelable && F(e) === 0 && ((p = t.current) != null && p.contains(f.target)) && f.preventDefault();
    }, r = () => {
      o.current = 0;
    };
    return n.on(e, "touchstart", a), n.on(e, "touchmove", c), n.on(e, "touchend", r), n.on(e, "touchcancel", r), () => {
      n.off(e, "touchstart", a), n.off(e, "touchmove", c), n.off(e, "touchend", r), n.off(e, "touchcancel", r);
    };
  };
  return $(() => {
    const e = W(t.current);
    e !== s.current && (l.current(), l.current = d(e), s.current = e);
  }), [t, s];
}, A = () => {
  const t = y(!1);
  return $(() => (t.current = !1, () => {
    t.current = !0;
  }), []), t;
}, O = () => {
  const t = y(!0);
  return t.current ? (t.current = !1, !0) : t.current;
}, q = (t, o) => {
  const s = O();
  $(() => {
    if (!s)
      return t();
  }, o);
}, _ = (t) => {
  const o = y(t);
  return o.current = t, o;
}, B = {
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0
};
function j(t) {
  return t && !("touches" in t);
}
const G = ({
  onDragStart: t,
  onDragMove: o,
  onDragEnd: s
}) => {
  const l = y(null), d = _(t), e = _(o), a = _(s);
  return $(() => {
    const c = l && l.current;
    if (!c)
      return;
    let r, f = !1;
    const h = () => {
      r = {
        ...B
      };
    };
    h();
    const i = (u) => {
      var m;
      if (f = !0, h(), j(u))
        r.startX = u.clientX, r.startY = u.clientY;
      else {
        const {
          touches: [w]
        } = u;
        r.startX = w.pageX, r.startY = w.pageY;
      }
      (m = d.current) == null || m.call(d, u, r);
    }, p = (u) => {
      var T;
      if (!f)
        return;
      let m = 0, w = 0;
      if (j(u))
        m = u.clientX, w = u.clientY;
      else {
        const E = u.touches[0];
        m = E.pageX, w = E.pageY;
      }
      const v = m - r.startX, X = w - r.startY, b = {
        ...r,
        offsetX: v,
        offsetY: X
      };
      (T = e.current) != null && T.call(e, u, b) && (r = b);
    }, g = (u) => {
      var m;
      f = !1, (m = a.current) == null || m.call(a, u, r), h();
    };
    return n.on(c, "touchstart", i), n.on(c, "touchmove", p), n.on(c, "touchend", g), n.on(c, "touchcancel", g), n.on(c, "mousedown", i), n.on(c, "mousemove", p), n.on(c, "mouseup", g), () => {
      n.off(c, "touchstart", i), n.off(c, "touchmove", p), n.off(c, "touchend", g), n.off(c, "touchcancel", g), n.off(c, "mousedown", i), n.off(c, "mousemove", p), n.off(c, "mouseup", g);
    };
  }, []), l;
}, Q = ({
  className: t,
  style: o,
  animationDuration: s = 300,
  completeDelay: l = 500,
  refreshing: d = !1,
  headHeight: e = 50,
  startDistance: a = 30,
  resistance: c = 0.6,
  threshold: r = e,
  onRefresh: f,
  disabled: h = !1,
  prefixCls: i = "pull-to-refreshify",
  renderText: p,
  children: g
}) => {
  const [u, m] = z(), w = A(), [[v, X, b], T] = U(
    d ? [e, s, "refreshing"] : [0, 0, "normal"]
  ), E = (Y, S = 0) => {
    switch (Y) {
      case "pulling":
      case "canRelease":
        T([S, 0, Y]);
        break;
      case "refreshing":
        T([e, s, Y]);
        break;
      case "complete":
        if (T([e, s, Y]), w.current)
          return;
        setTimeout(() => {
          E("normal");
        }, l);
        break;
      default:
        T([0, s, Y]);
    }
  };
  q(() => {
    E(d ? "refreshing" : "complete");
  }, [d]);
  const L = G({
    onDragMove: (Y, { offsetY: S }) => {
      if (
        // Not set onRefresh event
        !f || // Pull up
        S <= 0 || // Not scrolled to top
        S > 0 && F(m.current) > 0 || // Refreshing state has been triggered
        ["refreshing", "complete"].includes(b) || h
      )
        return !1;
      n.isSupportsPassive() || Y.preventDefault();
      const M = S / window.screen.height, k = S * (1 - M) * c, P = k - a < r ? "pulling" : "canRelease";
      return E(P, k), !0;
    },
    onDragEnd: (Y, { offsetY: S }) => {
      if (S) {
        if (b === "pulling") {
          E("normal");
          return;
        }
        typeof f == "function" && f();
      }
    }
  });
  let N = 0;
  return v >= a && (N = (v - a < r ? v - a : r) * 100 / r), /* @__PURE__ */ R(
    "div",
    {
      ref: L,
      className: t ? `${i} ${t}` : i,
      style: {
        minHeight: e,
        overflowY: "hidden",
        touchAction: "pan-y",
        ...o
      },
      children: /* @__PURE__ */ I(
        "div",
        {
          ref: u,
          className: `${i}__content`,
          style: {
            willChange: "transform",
            WebkitTransition: `all ${X}ms`,
            transition: `all ${X}ms`,
            WebkitTransform: `translate3d(0, ${v}px, 0)`,
            transform: `translate3d(0, ${v}px, 0)`
          },
          children: [
            /* @__PURE__ */ R(
              "div",
              {
                className: `${i}__refresh`,
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#909090",
                  fontSize: "14px",
                  marginTop: -e,
                  height: e
                },
                children: p(b, N)
              },
              v.toFixed(0)
            ),
            /* @__PURE__ */ R("div", { className: `${i}__body`, children: g })
          ]
        }
      )
    }
  );
};
export {
  Q as PullToRefreshify
};
