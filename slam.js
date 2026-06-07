/* ============================================================
   CSI Research SLAM — interactive math engine (shared)
   Each topic page defines a global TOPIC.math object and calls
   renderMath(). Pure client-side, works offline. Checks each
   step with tolerance, unlocks the next on success, and reveals
   the "say it on stage" line at the end. Encouraging, never harsh.
   ============================================================ */
(function () {
  // strip commas/spaces/~/≈ and parse; handles "3,000,000", "2.2E-8", "0.000000022"
  function cleanNum(s) {
    if (s == null) return NaN;
    s = String(s).trim().replace(/[,\s~≈≈]/g, '').replace(/×/g, '').replace(/x10\^?/i, 'e');
    if (s === '') return NaN;
    return parseFloat(s);
  }
  function isClose(val, step) {
    if (isNaN(val)) return false;
    var ans = step.answer;
    if (typeof step.tol === 'number' && Math.abs(val - ans) <= step.tol) return true;
    var rel = (typeof step.rel === 'number') ? step.rel : 0.08;
    if (ans !== 0) return Math.abs(val - ans) / Math.abs(ans) <= rel;
    return Math.abs(val) <= (step.tol || 0);
  }
  var PRAISE = ['Nailed it.', "That's it.", 'Correct — nice.', 'Yes!', 'Spot on.', 'Got it.'];

  window.renderMath = function () {
    var M = window.TOPIC && window.TOPIC.math;
    var root = document.getElementById('math-root');
    if (!M || !root) return;

    var html = '<div class="mathcard">';
    html += '<div class="mission">' + M.mission + '</div>';
    html += '<div class="setup">' + (M.setup || '') + '</div>';
    if (M.given && M.given.length) {
      html += '<div class="given"><h4>The numbers you need</h4><ul>';
      M.given.forEach(function (g) { html += '<li>• ' + g + '</li>'; });
      html += '</ul></div>';
    }
    M.steps.forEach(function (st, i) {
      html += '<div class="step' + (i === 0 ? '' : ' locked') + '" data-i="' + i + '">';
      html += '<div class="q"><b>Step ' + (i + 1) + '.</b> ' + st.q + '</div>';
      html += '<div class="inrow">';
      html += '<input type="text" inputmode="decimal" autocomplete="off" ' + (i === 0 ? '' : 'disabled') + ' aria-label="Step ' + (i + 1) + ' answer">';
      if (st.unit) html += '<span class="unit">' + st.unit + '</span>';
      html += '<button type="button"' + (i === 0 ? '' : ' disabled') + '>Check</button>';
      html += '</div>';
      html += '<div class="verdict"></div>';
      html += '</div>';
    });
    html += '<div class="finalbox"><h4>Say it on stage</h4><div class="say">' + M.final.say + '</div>';
    if (M.final.next) html += '<div class="next">→ ' + M.final.next + '</div>';
    html += '</div>';
    if (M.deeper) html += '<details class="deeper"><summary>Finished early? Go deeper</summary><p>' + M.deeper + '</p></details>';
    html += '</div>';
    root.innerHTML = html;

    var steps = root.querySelectorAll('.step');
    var finalbox = root.querySelector('.finalbox');

    steps.forEach(function (el, i) {
      var input = el.querySelector('input');
      var btn = el.querySelector('button');
      var verdict = el.querySelector('.verdict');
      var tries = 0;

      function check() {
        var val = cleanNum(input.value);
        if (isNaN(val)) { verdict.className = 'verdict no'; verdict.textContent = 'Type a number first.'; return; }
        if (isClose(val, M.steps[i])) {
          verdict.className = 'verdict ok';
          verdict.textContent = '✓ ' + PRAISE[i % PRAISE.length];
          input.disabled = true; btn.disabled = true;
          var next = steps[i + 1];
          if (next) {
            next.classList.remove('locked');
            var ni = next.querySelector('input'), nb = next.querySelector('button');
            ni.disabled = false; nb.disabled = false; ni.focus();
          } else {
            finalbox.classList.add('show');
            finalbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          tries++;
          verdict.className = 'verdict no';
          var msg = (tries >= 2 && M.steps[i].hint) ? 'Not quite — ' + M.steps[i].hint : 'Close? Check your arithmetic and try again.';
          verdict.innerHTML = msg;
        }
      }
      btn.addEventListener('click', check);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.renderMath);
  else window.renderMath();
})();
