// Dynamic-Type strategy.
//
// Verso's layout is editorial and tightly tuned. We deliberately let SCREEN
// CONTENT (hooks, descriptions, list text) scale with the OS font size — that's
// the accessibility win. We only CAP the fixed-size chrome (nav labels, pills,
// toggles, the big city name, badges, buttons) so it can't clip or wrap at
// iOS's XXXL sizes. Apply this via `maxFontSizeMultiplier={MAX_CHROME_SCALE}`
// on those primitives.
//
// (A truly global cap isn't cleanly possible on RN 0.81 + React 19: `Text` is a
// plain function component exported through a getter, so there's no defaultProps
// hook and no reassignable export to patch.)

export const MAX_CHROME_SCALE = 1.3;
