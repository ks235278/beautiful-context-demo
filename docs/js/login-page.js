/* ログインの画面（#/login）。見本（editorial-ink の 20-login）どおり、一枚のページに：
   上に「WELCOME TO BEAUTIFUL CONTEXT」と題、墨の山と金の筆。下に「ログイン」と「アカウントを作る」の二つの札。
   携帯では二つを上のタブで切り替え、パソコンでは横に並べる（ink.css 第27段）。

   ログインのしかたは、いままでどおり（js/login.js のシートと同じ BCSocial の働き）：
   ・メールアドレス →「コードを送る」→ メールに届く 6桁のコード → ログイン。パスワードは作らない
   ・「アカウントを作る」は、表示名とメールアドレスを先に聞き、コードを確かめたらその名前で始める
     （新しいアドレスなら、コードを確かめた時点でアカウントができる。すでにあれば、そのままログイン）
   ・Google は config.js の googleEnabled が true のときだけ出す。Apple のログインは無いので出さない
   ・見本の「パスワード」「ログインしたままにする」「パスワードを忘れた方」は、働きが無いので置かない
   ログインしている人には、名前とアカウントの入口だけを出す。
   ui：app.js の { toast, track, done, account, signOut } */
(() => {
  const G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  /* 欄の左の線の印（見本どおり、手紙・鍵・人） */
  const IC = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/></svg>',
    key: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>'
  };
  const field = (ic, label, input, hint) => `<label class="lp-label">${label}<span class="lp-field">${IC[ic]}${input}</span>${hint ? `<small class="lp-hint">${hint}</small>` : ''}</label>`;
  const go = (text, cls) => `<button type="submit" class="lp-go${cls ? ' ' + cls : ''}">${text}<i aria-hidden="true">→</i></button>`;
  const CODE_HINT = 'メールに届く6桁のコードでログインします（パスワードは要りません）';

  function hero(esc){
    return `
        <header class="lp-hero">
          <i class="lp-art tl" aria-hidden="true"></i><i class="lp-art tr" aria-hidden="true"></i>
          <i class="lp-art pl" aria-hidden="true"></i><i class="lp-art pr" aria-hidden="true"></i>
          <p class="lp-kick">WELCOME TO</p>
          <p class="lp-brand" aria-hidden="true">BEAUTIFUL CONTEXT</p>
          <hr class="lp-rule">
          <h2 class="lp-title">言葉で、<br class="sp">まだ見ぬ世界とつながる。</h2>
          <p class="lp-sub">小説、映画、音楽、そして人々の記憶。<br>異なる時代と文化をつなぎ、<br class="sp">新しい物語との出会いをつくる<br>エディトリアル・プラットフォームです。</p>
          <hr class="lp-rule sp">
        </header>`;
  }

  window.BCLoginPage = {
    /* tab：'in'（ログイン）か 'new'（アカウントを作る）。携帯で最初に開く札 */
    html(tab) {
      const R = window.BCRender, Social = window.BCSocial, esc = R.esc;
      const me = Social.me();
      const back = `<button type="button" class="back-close" data-close aria-label="戻る">${R.ICON.back}</button>`;
      const logo = `<a class="c-logo on-paper" href="#/" data-top aria-label="BEAUTIFUL CONTEXT（TOP へ戻る）"><img src="img/logo-navy.png" alt=""></a>`;
      const foot = `<i class="lp-art bl" aria-hidden="true"></i><i class="lp-art br" aria-hidden="true"></i>`;
      /* ログインしている（名前も決まっている）：名前とアカウントの入口だけ */
      if (me && me.named !== false) {
        return `
      <article class="page text-page login-page signed">
        ${back}${logo}
        <div class="content">${hero(esc)}
          <section class="lp-card lp-me" aria-label="アカウント">
            <h3>ログインしています</h3>
            <p class="lp-lead"><b>${esc(me.name)}</b> としてログインしています。フォロー中の編集者 ${Social.following().length} 人。</p>
            <a class="lp-go" href="#/today" data-home>今日のつながりを読む<i aria-hidden="true">→</i></a>
            <button type="button" class="lp-alt" data-lp-account>アカウントの設定</button>
          </section>
          ${foot}
        </div>
      </article>`;
      }
      const google = Social.googleEnabled()
        ? `<p class="lp-or"><span>または</span></p><button type="button" class="lp-alt lp-google" data-lp-google>${G}<span>Google で続ける</span></button>` : '';
      const isNew = tab === 'new';
      /* 名前がまだ無い（コードを確かめたあとで閉じた、Google から戻ったばかり）：名前だけを聞く */
      const naming = !!me;
      return `
      <article class="page text-page login-page">
        ${back}${logo}
        <div class="content">${hero(esc)}
          <div class="lp-tabs" role="tablist" aria-label="ログインとアカウントの作成" data-on="${isNew ? 'new' : 'in'}">
            <button type="button" role="tab" id="lpTabIn" aria-controls="lpIn" aria-selected="${!isNew}" data-lp-tab="in">ログイン</button>
            <button type="button" role="tab" id="lpTabNew" aria-controls="lpNew" aria-selected="${isNew}" data-lp-tab="new">アカウント作成</button>
          </div>
          <div class="lp-cards" data-on="${isNew ? 'new' : 'in'}">
            <section class="lp-card lp-in" id="lpIn" role="tabpanel" aria-labelledby="lpTabIn">
              <h3>ログイン</h3>
              <p class="lp-lead">アカウントにログインして、<br>つながりの旅を続けましょう。</p>
              <form data-lp-email${naming ? ' hidden' : ''} novalidate>
                ${field('mail', 'メールアドレス', '<input name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" required placeholder="example@beautifulcontext.jp">', CODE_HINT)}
                ${go('コードを送る')}
              </form>
              <form data-lp-code hidden novalidate>
                ${field('key', 'メールに届いた6桁のコード', '<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" required placeholder="123456">')}
                ${go('ログイン')}
                <button type="button" class="lp-link" data-lp-back>メールアドレスを入れ直す</button>
              </form>
              <form data-lp-name${naming ? '' : ' hidden'} novalidate>
                ${field('user', '表示名', `<input name="name" maxlength="24" autocomplete="nickname" required placeholder="例：映画と本の山田" value="${esc(Social.demoName())}">`, 'コメントに出る名前です。Google やメールの名前は使いません')}
                ${go('はじめる')}
              </form>
              <p class="lp-msg" data-lp-msg role="status" aria-live="polite">${naming ? 'ログインしました。コメントに出す名前を決めてください。' : ''}</p>
              ${naming ? '' : google}
            </section>
            <section class="lp-card lp-new" id="lpNew" role="tabpanel" aria-labelledby="lpTabNew">
              <h3>アカウントを作る</h3>
              <p class="lp-lead">無料で始めて、映画・文学・音楽が<br>つながる体験をお楽しみください。</p>
              <form data-lp-email novalidate>
                ${field('user', 'ユーザー名', '<input name="name" maxlength="24" autocomplete="nickname" required placeholder="表示名（例：映画と本の山田）">', '他のユーザーに表示される名前です')}
                ${field('mail', 'メールアドレス', '<input name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" required placeholder="example@beautifulcontext.jp">', CODE_HINT)}
                <label class="lp-check"><input type="checkbox" name="agree" required><span><a href="#/terms">利用規約・プライバシーポリシー</a>に同意する</span></label>
                ${go('アカウントを作成', 'gold')}
              </form>
              <form data-lp-code hidden novalidate>
                ${field('key', 'メールに届いた6桁のコード', '<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" required placeholder="123456">')}
                ${go('アカウントを作成', 'gold')}
                <button type="button" class="lp-link" data-lp-back>メールアドレスを入れ直す</button>
              </form>
              <p class="lp-msg" data-lp-msg role="status" aria-live="polite"></p>
            </section>
          </div>
          <p class="lp-terms">ログインすることで、<a href="#/terms">利用規約・プライバシーポリシー</a>に同意したものとみなされます。</p>
          ${foot}
        </div>
      </article>`;
    },

    mount(root, ui) {
      const page = root.querySelector('.login-page');
      if (!page || page.dataset.wired) return;   // 同じ画面をもう一度開いたとき（メニューの「ログイン」など）、二度つながない
      page.dataset.wired = '1';
      const Social = window.BCSocial;
      const acc = page.querySelector('[data-lp-account]');
      if (acc) { acc.addEventListener('click', () => ui.account()); return; }

      /* 携帯のタブ：選んだ札だけを出す（パソコンでは二つとも出ていて、タブは隠れている） */
      const cards = page.querySelector('.lp-cards');
      const tabs = [...page.querySelectorAll('[data-lp-tab]')];
      const tabBox = page.querySelector('.lp-tabs');
      const pick = (k, focus) => {
        if (cards.dataset.on === k) return;
        cards.dataset.on = k; tabBox.dataset.on = k;
        const shown = page.querySelector(k === 'new' ? '.lp-new' : '.lp-in');
        shown.classList.remove('lp-step'); void shown.offsetWidth; shown.classList.add('lp-step');
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.lpTab === k)));
        if (focus) { const t = tabs.find((x) => x.dataset.lpTab === k); if (t) t.focus(); }
      };
      tabs.forEach((t) => t.addEventListener('click', () => pick(t.dataset.lpTab)));
      tabBox.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
        ev.preventDefault(); pick(cards.dataset.on === 'in' ? 'new' : 'in', true);
      });

      const done = (fresh) => {
        const me = Social.me();
        ui.toast(`${me.name} として${fresh ? 'はじめました' : 'ログインしました'}`);
        ui.done(me);
      };
      /* 一つの札の働き。name：アカウントを作る札では、先に聞いた表示名 */
      const wire = (card, makes) => {
        const $ = (s) => card.querySelector(s);
        const fEmail = $('[data-lp-email]'), fCode = $('[data-lp-code]'), fName = $('[data-lp-name]');
        const say = (t, bad) => { const m = $('[data-lp-msg]'); m.textContent = t; m.classList.toggle('bad', !!bad); };
        const show = (f) => {
          [fEmail, fCode, fName].filter(Boolean).forEach((x) => { x.hidden = x !== f; });
          card.querySelectorAll('.lp-or,[data-lp-google]').forEach((x) => { x.hidden = f !== fEmail; });
          f.classList.remove('lp-step'); void f.offsetWidth; f.classList.add('lp-step');
        };
        const busy = async (f, label, job) => {
          const b = f.querySelector('button[type=submit]'), was = b.innerHTML;
          b.disabled = true; b.textContent = label;
          try { return await job(); } catch (err) { say(Social.message(err), true); return null; }
          finally { b.disabled = false; b.innerHTML = was; }
        };
        const bad = (input, text) => { input.setAttribute('aria-invalid', 'true'); say(text, true); try { input.focus(); } catch (e) {} };
        card.addEventListener('input', (ev) => { if (ev.target.matches('input')) ev.target.removeAttribute('aria-invalid'); });
        let email = '', name = '';
        fEmail.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          const em = fEmail.elements.email, v = em.value.trim();
          if (makes) {
            const n = fEmail.elements.name;
            if (!n.value.trim()) return bad(n, 'ユーザー名を入れてください');
            name = n.value.trim();
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return bad(em, 'メールアドレスを確かめてください');
          if (makes && !fEmail.elements.agree.checked) return bad(fEmail.elements.agree, '利用規約・プライバシーポリシーへの同意が必要です');
          const ok = await busy(fEmail, '送っています…', () => Social.sendCode(v).then(() => true));
          if (!ok) return;
          email = v;
          show(fCode);
          say(`${email} にコードを送りました。届かないときは、迷惑メールのフォルダも見てください。`);
          try { fCode.elements.code.focus({ preventScroll: true }); } catch (e) {}
        });
        fCode.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          const c = fCode.elements.code, code = c.value.replace(/\D/g, '');
          if (code.length < 6) return bad(c, '6桁の数字を入れてください');
          const r = await busy(fCode, '確かめています…', () => Social.verifyCode(email, code));
          if (!r) return;
          if (!r.needsName) { done(false); return; }
          /* アカウントを作る札：先に聞いた名前で始める。ログインの札：名前を聞く */
          if (makes && name) {
            const ok = await busy(fCode, '保存しています…', () => Social.setName(name).then(() => true));
            if (ok) done(true);
            return;
          }
          show(fName);
          say('ログインしました。コメントに出す名前を決めてください。');
        });
        card.querySelector('[data-lp-back]').addEventListener('click', () => {
          show(fEmail); say(''); fCode.elements.code.value = '';
        });
        if (fName) fName.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          const n = fName.elements.name;
          if (!n.value.trim()) return bad(n, '表示名を入れてください');
          const ok = await busy(fName, '保存しています…', () => Social.setName(n.value.trim()).then(() => true));
          if (ok) done(true);
        });
        const g = card.querySelector('[data-lp-google]');
        if (g) {
          const html = g.innerHTML;
          const reset = () => { g.disabled = false; g.innerHTML = html; };
          g.addEventListener('click', async () => {
            g.disabled = true; g.textContent = 'Google に移っています…';
            if (ui.track) ui.track('login_start', { method: 'google' });
            try { await Social.signInWithGoogle(); } catch (err) { say(Social.message(err), true); reset(); }
          });
          window.addEventListener('pageshow', (ev) => { if (ev.persisted) reset(); }, { once: true });
        }
      };
      wire(page.querySelector('.lp-in'), false);
      wire(page.querySelector('.lp-new'), true);
    }
  };
})();
