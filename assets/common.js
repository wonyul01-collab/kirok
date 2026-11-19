/* 키록 사이트 공통: 머리·꼬리·상담 창. body[data-root] = 사이트 뿌리까지의 상대 경로("./" 또는 "../") */
(function () {
  var root = document.body.getAttribute('data-root') || './';
  var page = document.body.getAttribute('data-page') || '';
  var C = window.KIROK_CONFIG || {};
  var FAQ = window.KIROK_FAQ || [];

  function kakaoChatUrl() {
    var u = (C.KAKAO_CHANNEL_URL || '').trim();
    if (!u) return '';
    u = u.replace(/\/+$/, '');
    return /\/chat$/.test(u) ? u : u + '/chat';
  }
  window.kirokKakaoUrl = kakaoChatUrl;

  var mark = '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true"><path d="M3 29V2h20v27" fill="none" stroke="#23604A" stroke-width="2.4"/><path d="M3 7h4M3 12h6M3 17h4M3 22h6" stroke="#23604A" stroke-width="1.6"/><path d="M11 11h9" stroke="#E4572E" stroke-width="2.6"/></svg>';
  var links = [
    ['', '처음'], ['#basis', '예측 근거'], ['library/', '성장 자료실'], ['manual/', '사용 설명서'], ['#price', '요금'], ['support/', '문의']
  ];
  var nav = links.map(function (l) {
    var href = l[0].charAt(0) === '#' ? root + l[0] : root + l[0];
    var cur = (page === 'home' && l[0] === '') || (l[0] && l[0].indexOf(page + '/') === 0) ? ' aria-current="page"' : '';
    return '<a href="' + href + '"' + cur + '>' + l[1] + '</a>';
  }).join('');
  var head = document.getElementById('top');
  if (head) {
    head.className = 'top';
    head.innerHTML = '<div class="wrap"><a class="brand" href="' + root + '">' + mark + '<b>키록</b><span>아이 키 기록·예측</span></a>' +
      '<button class="menu-btn" aria-expanded="false" aria-controls="nav">메뉴</button>' +
      '<nav class="nav" id="nav" aria-label="사이트 메뉴">' + nav + '</nav>' +
      '<a class="btn main small cta-top" href="' + root + 'app/">체험판 써 보기</a></div>';
    var mb = head.querySelector('.menu-btn'), nv = head.querySelector('.nav');
    mb.addEventListener('click', function () { var o = nv.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    nv.addEventListener('click', function (e) { if (e.target.tagName === 'A') nv.classList.remove('open'); });
  }
  var foot = document.getElementById('foot');
  if (foot) {
    foot.className = 'foot';
    foot.innerHTML = '<div class="wrap"><div class="cols">' +
      '<div><h4>키록</h4><p style="margin:0">부모 키와 우리 아이 기록으로 예상 성인 키 범위를 보여 주고, 성장 기록을 도와주는 앱입니다. 구글 플레이 ' + (C.PLAY_RELEASE || '출시 예정') + '.</p></div>' +
      '<div><h4>둘러보기</h4><ul><li><a href="' + root + 'app/">웹 체험판</a></li><li><a href="' + root + 'manual/">사용 설명서</a></li><li><a href="' + root + 'library/">성장 자료실</a></li><li><a href="' + root + '#basis">예측 근거</a></li></ul></div>' +
      '<div><h4>도움</h4><ul><li><a href="' + root + 'support/">문의·자주 묻는 질문</a></li><li><a href="' + root + 'privacy/">개인정보 처리방침</a></li><li><a href="' + root + 'support/#refund">환불 안내</a></li></ul></div>' +
      '</div><p class="biz">상호 꿈의 색깔(개인사업자) &nbsp;|&nbsp; 사업자등록번호 223-38-01338 &nbsp;|&nbsp; 통신판매업 신고 예정<br>문의는 <a href="' + root + 'support/">문의 페이지</a>에서 받습니다.</p>' +
      '<p class="notice">키록의 예측과 신호는 진단이 아닌 참고 정보입니다. 아이의 성장이 걱정되면 소아청소년과 전문의와 상담해 주세요.</p>' +
      '<p class="notice">© 2026 꿈의 색깔</p></div>';
  }

  /* ---------- 상담 창(규칙 기반, 외부 AI 없음) ---------- */
  function fill(s) { return s.replace(/\{root\}/g, root); }
  function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' '); }
  function bestAnswer(text) {
    var t = norm(text), best = null, score = 0;
    FAQ.forEach(function (f) {
      var sc = 0;
      f.keys.forEach(function (k) { if (t.indexOf(norm(k)) >= 0) sc += k.length >= 3 ? 2 : 1; });
      if (t.indexOf(norm(f.cat)) >= 0) sc += 2;
      if (sc > score) { score = sc; best = f; }
    });
    return score > 0 ? best : null;
  }
  window.kirokBestAnswer = bestAnswer;

  if (document.body.getAttribute('data-noask') === '1') return;
  var fab = document.createElement('button');
  fab.className = 'ask-fab';
  fab.setAttribute('aria-controls', 'ask');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M8 9.5h8M8 12.5h5" stroke="#fff" stroke-width="1.8"/></svg>궁금한 점 묻기';
  var box = document.createElement('section');
  box.className = 'ask'; box.id = 'ask'; box.setAttribute('aria-label', '자동 상담');
  var kurl = kakaoChatUrl();
  box.innerHTML = '<header><b>키록 상담</b><button type="button" class="x">닫기</button></header>' +
    '<div class="log" aria-live="polite"></div>' +
    '<div class="quick"></div>' +
    '<form><label class="skip" for="askq">질문 쓰기</label><input id="askq" placeholder="예: 환불은 어떻게 하나요?" maxlength="200" autocomplete="off"><button class="btn main small" type="submit">묻기</button></form>' +
    '<div class="kakao-row"><a class="btn small" href="' + root + 'support/#leave">문의 남기기</a>' +
    (kurl ? '<a class="btn small kakao" href="' + kurl + '" target="_blank" rel="noopener">카톡으로 묻기</a>' : '<span class="btn small kakao off" aria-disabled="true">카카오톡 채널 준비 중</span>') + '</div>';
  document.body.appendChild(fab); document.body.appendChild(box);
  var log = box.querySelector('.log'), quick = box.querySelector('.quick');
  function say(html, who) { var d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ['install', 'accuracy', 'price', 'refund', 'privacy', 'delete', 'device', 'invite', 'bug'].forEach(function (id) {
    var f = FAQ.filter(function (x) { return x.id === id; })[0]; if (!f) return;
    var b = document.createElement('button'); b.type = 'button'; b.textContent = f.cat;
    b.addEventListener('click', function () { say(esc(f.q), 'me'); say(fill(f.a), 'bot'); });
    quick.appendChild(b);
  });
  say('안녕하세요, 키록입니다. 아래에서 고르거나 궁금한 점을 써 주세요. 답이 없으면 문의를 남겨 주시면 사람이 확인해 답해 드려요.', 'bot');
  box.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault(); var inp = box.querySelector('input'); var q = inp.value.trim(); if (!q) return;
    say(esc(q), 'me'); inp.value = '';
    var f = bestAnswer(q);
    if (f) say(fill(f.a), 'bot');
    else say('이 질문은 미리 준비한 답이 없어요. <a href="' + root + 'support/#leave">문의 남기기</a>로 보내 주시면 확인해서 답해 드려요.', 'bot');
  });
  function toggle(open) { box.classList.toggle('open', open); fab.setAttribute('aria-expanded', open); if (open) box.querySelector('input').focus(); }
  fab.addEventListener('click', function () { toggle(!box.classList.contains('open')); });
  box.querySelector('.x').addEventListener('click', function () { toggle(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) toggle(false); });
})();
