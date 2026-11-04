/* ログインの画面（#/login）。見本（editorial-ink の 20-login）どおり、一枚のページに：
   携帯：名前の下に TODAY'S EDITOR'S CHOICE、◆ の罫、大きな題と短い文、◆ の罫、「ログイン｜アカウント作成」のタブ、欄、紺の丸いボタン。
   パソコン：上の帯に WELCOME TO と BEAUTIFUL CONTEXT、題と文、左右に墨の山と金の筆。その下に「ログイン」と「アカウントを作る」の二つの札。
   題と文は、見本のとおり携帯とパソコンで違う（携帯は見本の携帯の言葉、パソコンは見本のパソコンの言葉）。ink.css 第27〜31段。

   ログインのしかた（BCSocial。中身は js/backend.js）。見本の欄のとおり：
   ・ログイン …… メールアドレスとパスワード（目の印で見える・隠れる）。「ログインしたままにする」はパソコンだけ（携帯はいつもログインしたまま）。
     まだメールを確かめていない登録なら、その場で 6桁のコードを聞く
   ・パスワードをお忘れの方 …… メールアドレス → 6桁のコードと新しいパスワード。
     メールのリンクで戻ってきたときは #/login?reset=1 で、新しいパスワードだけを聞く（app.js が 'auth' の recovery で開く）
   ・アカウントを作る …… ユーザー名・メールアドレス・パスワード・同意 → メールに届く 6桁のコード（届かなければ送り直す）
   ・Apple・Google …… BCSocial.methods() が開いているときだけ出す（config.js）。はじめての人には、戻ってきたこの画面で表示名だけを聞く
   ログインしている人には、名前とアカウントの入口だけを出す。
   ui：app.js の { toast, track, done, account } */
(() => {
  const G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  const APPLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.32-3.5zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.68-.92 2.68.97.08 1.96-.49 2.56-1.23z"/></svg>';
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  /* 欄の左の線の印（見本どおり、手紙・鍵・人。携帯では出さない） */
  const IC = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/></svg>',
    key: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>'
  };
  const field = (ic, label, input, hint) => `<label class="lp-label">${label}<span class="lp-field">${IC[ic]}${input}</span>${hint ? `<small class="lp-hint">${hint}</small>` : ''}</label>`;
  const go = (text, cls) => `<button type="submit" class="lp-go${cls ? ' ' + cls : ''}">${text}<i aria-hidden="true">→</i></button>`;
  const EMAIL = '<input name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" required placeholder="example@beautifulcontext.jp">';
  const CODE = '<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" placeholder="メールに届いたコード">';
  const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PW_HINT = '英数字を組み合わせて8文字以上で入力してください';
  /* パスワードの欄。右に目の印（押すと見える・隠れる） */
  const pwField = (label, place, hint, ac) => field('key', label,
    `<input name="password" type="password" autocomplete="${ac}" maxlength="72" required placeholder="${place}"><button type="button" class="lp-eye" data-lp-eye aria-label="パスワードを表示" aria-pressed="false">${EYE}</button>`, hint);
  const codeField = () => field('key', '認証コード', CODE);
  /* 見本の「または」と、その下のボタン（携帯は Apple・Google の順に縦、パソコンは Google・Apple を横に） */
  const socials = (m) => (m.google || m.apple) ? `<p class="lp-or"><span>または</span></p><div class="lp-socials">${
    m.apple ? `<button type="button" class="lp-alt lp-apple" data-lp-oauth="apple">${APPLE}<span>Apple で続ける</span></button>` : ''}${
    m.google ? `<button type="button" class="lp-alt lp-google" data-lp-oauth="google">${G}<span>Google で続ける</span></button>` : ''}</div>` : '';

  const hero = () => `
        <header class="lp-hero">
          <p class="lp-kick"><span class="sp">TODAY'S EDITOR'S CHOICE</span><span class="pc">WELCOME TO</span></p>
          <p class="lp-brand" aria-hidden="true">BEAUTIFUL CONTEXT</p>
          <hr class="lp-rule">
          <h2 class="lp-title"><span class="sp">映画がくれる、<br>新しい文脈に出会う。</span><span class="pc">言葉で、まだ見ぬ世界とつながる。</span></h2>
          <p class="lp-sub"><span class="sp">名作から、まだ見ぬ一本へ。<br>映画と言葉で、世界を少し豊かに。</span><span class="pc">小説、映画、音楽、そして人々の記憶。<br>異なる時代と文化をつなぎ、新しい物語との出会いをつくる<br>エディトリアル・プラットフォームです。</span></p>
          <hr class="lp-rule sp">
        </header>`;

  /* いま開いているログインの画面（一つだけ）。'auth' と pageshow は一度だけ登録し、ここへ渡す（開くたびに足さない） */
  let current = null, hooked = false;
  /* アカウント作成の下書き。規約を読みに出て戻っても、札と入れたものを残す（パスワードは持たない）。ログインできたら消す */
  let draft = { tab: '', name: '', email: '', agree: false };
  const hook = () => {
    if (hooked) return;
    hooked = true;
    /* Google・Apple から戻った人のログインが済んだ：名前がまだなら、この画面で聞く */
    if (window.BCBackend) BCBackend.on('auth', (ev) => {
      if (current && current.page.isConnected && ev.event === 'login' && ev.needsName) current.askName();
    });
    /* Google・Apple の画面から「戻る」で帰ってきた（ページがそのまま戻る）：ボタンをもう一度押せるように */
    window.addEventListener('pageshow', (ev) => { if (ev.persisted && current && current.page.isConnected) current.resetOauth(); });
  };

  window.BCLoginPage = {
    /* tab：'in'（ログイン）・'new'（アカウントを作る。携帯で最初に開く札）・'reset'（メールのリンクから戻った。新しいパスワードだけ） */
    html(tab) {
      const R = window.BCRender, Social = window.BCSocial, esc = R.esc;
      const me = Social.me();
      /* 見本どおり ‹ は置かない（≡ とロゴから、どこへでも行ける。ブラウザの戻るも効く） */
      const logo = `<a class="c-logo on-paper" href="#/" data-top aria-label="BEAUTIFUL CONTEXT（TOP へ戻る）"><img src="img/logo-navy.png" alt=""></a>`;
      const foot = `<i class="lp-art tl" aria-hidden="true"></i><i class="lp-art tr" aria-hidden="true"></i><i class="lp-art pl" aria-hidden="true"></i><i class="lp-art pr" aria-hidden="true"></i><i class="lp-art bl" aria-hidden="true"></i><i class="lp-art br" aria-hidden="true"></i>`;
      /* パスワードを忘れた人が、メールのリンクで戻ってきた（ログインはできている）：新しいパスワードだけ。
         data-stay：ログインしていても、この画面から自動で離れない（app.js の paintSocial・leaveLogin） */
      if (tab === 'reset' && me) {
        return `
      <article class="page text-page login-page" data-stay="1">
        ${logo}
        <div class="content">${hero()}
          <section class="lp-card lp-me" aria-label="新しいパスワード">
            <h3>新しいパスワード</h3>
            <p class="lp-lead">メールのリンクから戻りました。<br>新しいパスワードを決めてください。</p>
            <form data-lp-newpw novalidate>
              ${pwField('パスワード', '8文字以上で入力', PW_HINT, 'new-password')}
              ${go('パスワードを変える')}
            </form>
            <p class="lp-msg" data-lp-msg role="status" aria-live="polite"></p>
          </section>
          ${foot}
        </div>
      </article>`;
      }
      /* ログインしている（名前も決まっている）：名前とアカウントの入口だけ */
      if (me && me.named !== false) {
        return `
      <article class="page text-page login-page signed">
        ${logo}
        <div class="content">${hero()}
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
      const isNew = tab === 'new' || draft.tab === 'new';
      /* 名前がまだ無い（コードを確かめたあとで閉じた、Google・Apple から戻ったばかり）：名前だけを聞く */
      const naming = !!me;
      return `
      <article class="page text-page login-page${naming ? ' naming' : ''}">
        ${logo}
        <div class="content">${hero()}
          <div class="lp-tabs" role="tablist" aria-label="ログインとアカウントの作成" data-on="${isNew ? 'new' : 'in'}">
            <button type="button" role="tab" id="lpTabIn" aria-controls="lpIn" aria-selected="${!isNew}" data-lp-tab="in">ログイン</button>
            <button type="button" role="tab" id="lpTabNew" aria-controls="lpNew" aria-selected="${isNew}" data-lp-tab="new">アカウント作成</button>
          </div>
          <div class="lp-cards" data-on="${isNew ? 'new' : 'in'}">
            <section class="lp-card lp-in" id="lpIn" role="tabpanel" aria-labelledby="lpTabIn">
              <h3>${naming ? '表示名を決める' : 'ログイン'}</h3>
              <p class="lp-lead">${naming ? 'ログインしました。<br>コメントに出す名前を決めてください。' : 'アカウントにログインして、<br>つながりの旅を続けましょう。'}</p>
              <form data-lp-pass${naming ? ' hidden' : ''} novalidate>
                ${field('mail', 'メールアドレス', EMAIL)}
                ${pwField('パスワード', 'パスワードを入力', '', 'current-password')}
                <p class="lp-row"><label class="lp-check lp-remember"><input type="checkbox" name="remember"${Social.remembered() ? ' checked' : ''}>ログインしたままにする</label><button type="button" class="lp-send" data-lp-forgot><span class="sp">パスワードをお忘れの方</span><span class="pc">パスワードを忘れた方</span></button></p>
                ${go('ログイン')}
              </form>
              <form data-lp-confirm hidden novalidate>
                ${codeField()}
                <p class="lp-row"><button type="button" class="lp-send" data-lp-back>ログインに戻る</button><button type="button" class="lp-send" data-lp-resend>メールを送り直す</button></p>
                ${go('ログイン')}
              </form>
              <form data-lp-reset hidden novalidate>
                ${field('mail', 'メールアドレス', EMAIL)}
                <p class="lp-row"><button type="button" class="lp-send" data-lp-back>ログインに戻る</button></p>
                ${go('メールを送る')}
              </form>
              <form data-lp-recover hidden novalidate>
                ${codeField()}
                ${pwField('新しいパスワード', '8文字以上で入力', PW_HINT, 'new-password')}
                <p class="lp-row"><button type="button" class="lp-send" data-lp-back>ログインに戻る</button></p>
                ${go('パスワードを変える')}
              </form>
              <form data-lp-name${naming ? '' : ' hidden'} novalidate>
                ${field('user', '表示名', `<input name="name" maxlength="24" autocomplete="nickname" required placeholder="例：映画と本の山田" value="${esc(Social.demoName())}">`, 'コメントに出る名前です。Google・Apple やメールの名前は使いません')}
                ${go('はじめる')}
              </form>
              <p class="lp-msg" data-lp-msg role="status" aria-live="polite"></p>
              ${naming ? '' : socials(Social.methods())}
            </section>
            <section class="lp-card lp-new" id="lpNew" role="tabpanel" aria-labelledby="lpTabNew">
              <h3>アカウントを作る</h3>
              <p class="lp-lead">無料で始めて、映画・文学・音楽がつながる<br>体験をお楽しみください。</p>
              <form data-lp-make novalidate>
                ${field('user', 'ユーザー名', '<input name="name" maxlength="24" autocomplete="nickname" required placeholder="表示名（例：映画と本の山田）">', '他のユーザーに表示される名前です')}
                ${field('mail', 'メールアドレス', EMAIL)}
                ${pwField('パスワード', '8文字以上で入力', PW_HINT, 'new-password')}
                <label class="lp-check"><input type="checkbox" name="agree" required><span><a href="#/terms">利用規約・プライバシーポリシー</a>に同意する</span></label>
                ${go('アカウントを作成', 'gold')}
              </form>
              <form data-lp-confirm hidden novalidate>
                ${codeField()}
                <p class="lp-row"><button type="button" class="lp-send" data-lp-back>入れ直す</button><button type="button" class="lp-send" data-lp-resend>メールを送り直す</button></p>
                ${go('アカウントを作成', 'gold')}
              </form>
              <p class="lp-msg" data-lp-msg role="status" aria-live="polite"></p>
            </section>
          </div>
          <p class="lp-terms">ログインすることで、<a href="#/terms">利用規約・プライバシーポリシー</a><br>に同意したものとみなされます。</p>
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

      /* 目の印：押すとパスワードが見え、もう一度で隠れる */
      page.addEventListener('click', (ev) => {
        const eye = ev.target.closest('[data-lp-eye]');
        if (!eye) return;
        ev.preventDefault();
        const input = eye.parentNode.querySelector('input'), on = input.type === 'password';
        input.type = on ? 'text' : 'password';
        eye.setAttribute('aria-pressed', String(on));
        eye.setAttribute('aria-label', on ? 'パスワードを隠す' : 'パスワードを表示');
        try { input.focus({ preventScroll: true }); } catch (e) {}
      });
      page.addEventListener('input', (ev) => { if (ev.target.matches('input')) ev.target.removeAttribute('aria-invalid'); });

      const done = (fresh) => {
        const me = Social.me();
        draft = { tab: '', name: '', email: '', agree: false };
        ui.toast(`${me.name} として${fresh ? 'はじめました' : 'ログインしました'}`);
        ui.done(me);
      };
      /* 一つの札の道具：欄の出し分け・一言・送っているあいだのボタン */
      const kit = (card) => {
        const $ = (s) => card.querySelector(s);
        /* 一言は札のいちばん下。パソコンの低い画面では見えないことがあるので、出したら見える所まで寄せる */
        const say = (t, bad) => {
          const m = $('[data-lp-msg]'); m.textContent = t; m.classList.toggle('bad', !!bad);
          if (t) try { m.scrollIntoView({ block: 'nearest' }); } catch (e) {}
        };
        const show = (f) => {
          card.querySelectorAll('form').forEach((x) => { x.hidden = x !== f; });
          const first = card.querySelector('form');
          card.querySelectorAll('.lp-or,.lp-socials').forEach((x) => { x.hidden = f !== first; });
          f.classList.remove('lp-step'); void f.offsetWidth; f.classList.add('lp-step');
        };
        const focus = (input) => { try { input.focus({ preventScroll: true }); } catch (e) {} };
        /* 送っているあいだ・確かめているあいだは、押したボタンを止める（二度押しで二通送らない）。
           job が投げたら一言にする。handled(err) が true を返したら、その札が受け持つ */
        const busy = async (f, label, job, handled) => {
          const b = f.querySelector('button[type=submit]'), was = b.innerHTML;
          b.disabled = true; b.textContent = label;
          try { return await job(); }
          catch (err) { if (!(handled && handled(err))) say(Social.message(err), true); return null; }
          finally { b.disabled = false; b.innerHTML = was; }
        };
        const bad = (input, text) => { input.setAttribute('aria-invalid', 'true'); say(text, true); focus(input); return null; };
        const codeOf = (f) => f.elements.code.value.replace(/\D/g, '');
        /* 「コードを送り直す」：送るあいだと、送ってから 60 秒は押せない（Supabase も 60 秒に一通まで） */
        let cool = 0;
        const unlock = (b) => { clearTimeout(cool); b.disabled = false; };   // 別のアドレスになったら、待たずに押せる
        const resend = (b, to) => {
          if (b.disabled) return;
          b.disabled = true;
          Social.resendConfirm(to()).then(() => { say(`${to()} にメールを送り直しました。`); cool = setTimeout(() => { b.disabled = false; }, 60000); },
            (err) => { say(Social.message(err), true); b.disabled = false; });
        };
        return { $, say, show, focus, busy, bad, codeOf, resend, unlock };
      };

      /* メールのリンクから戻った：新しいパスワードだけ */
      const renew = page.querySelector('[data-lp-newpw]');
      if (renew) {
        const k = kit(page.querySelector('.lp-card'));
        current = null;
        renew.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          const pw = renew.elements.password, why = Social.passwordProblem(pw.value);
          if (why) return k.bad(pw, why);
          const ok = await k.busy(renew, '変えています…', () => Social.updatePassword(pw.value).then(() => true));
          if (!ok) return;
          delete page.dataset.stay;
          ui.toast('パスワードを変えました');
          ui.done(Social.me());
        });
        return;
      }

      /* 携帯のタブ：選んだ札だけを出す（パソコンでは二つとも出ていて、タブは隠れている）。金の線は滑って移る */
      const cards = page.querySelector('.lp-cards');
      const tabBox = page.querySelector('.lp-tabs');
      const tabs = [...page.querySelectorAll('[data-lp-tab]')];
      const pick = (k, focus) => {
        if (cards.dataset.on === k) return;
        cards.dataset.on = k; tabBox.dataset.on = k; draft.tab = k;
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

      /* ---- ログインの札 ---- */
      const inCard = page.querySelector('.lp-in'), K1 = kit(inCard);
      const f = { pass: K1.$('[data-lp-pass]'), confirm: K1.$('[data-lp-confirm]'), reset: K1.$('[data-lp-reset]'),
        recover: K1.$('[data-lp-recover]'), name: K1.$('[data-lp-name]') };
      let email = '', verified = false;
      const remember = () => f.pass.elements.remember.checked;
      const askName = () => {
        pick('in'); page.classList.add('naming');
        inCard.querySelector('h3').textContent = '表示名を決める';
        inCard.querySelector('.lp-lead').innerHTML = 'ログインしました。<br>コメントに出す名前を決めてください。';
        K1.show(f.name); K1.say(''); K1.focus(f.name.elements.name);
      };
      const after = (r) => { if (r.needsName) askName(); else done(false); };
      f.pass.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const em = f.pass.elements.email, pw = f.pass.elements.password, v = em.value.trim();
        if (!MAIL.test(v)) return K1.bad(em, 'メールアドレスを確かめてください');
        if (!pw.value) return K1.bad(pw, 'パスワードを入れてください');
        const r = await K1.busy(f.pass, 'ログインしています…',
          () => Social.signInWithPassword({ email: v, password: pw.value, remember: remember() }),
          (err) => {
            if (err.code !== 'email_not_confirmed') return false;
            /* 登録したまま、メールを確かめていない：その場で 6桁のコードを聞く */
            if (email !== v) K1.unlock(K1.$('[data-lp-resend]'));
            email = v; K1.show(f.confirm);
            K1.say(`${v} の確認がまだです。登録のときに届いたメールのコードを入れるか、メールのリンクを同じブラウザで開いてください（届いていなければ「メールを送り直す」）。`);
            K1.focus(f.confirm.elements.code);
            return true;
          });
        if (r) after(r);
      });
      f.confirm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const code = K1.codeOf(f.confirm);
        if (code.length < 6) return K1.bad(f.confirm.elements.code, '6桁の数字を入れてください');
        const r = await K1.busy(f.confirm, '確かめています…', () => Social.confirmSignup(email, code, { remember: remember() }));
        if (r) after(r);
      });
      K1.$('[data-lp-forgot]').addEventListener('click', () => {
        f.reset.elements.email.value = f.pass.elements.email.value;
        K1.show(f.reset);
        K1.say('登録したメールアドレスに、パスワードを決め直すためのメールを送ります。');
        K1.focus(f.reset.elements.email);
      });
      f.reset.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const em = f.reset.elements.email, v = em.value.trim();
        if (!MAIL.test(v)) return K1.bad(em, 'メールアドレスを確かめてください');
        const ok = await K1.busy(f.reset, '送っています…', () => Social.resetPassword(v, { returnTo: '#/login' }).then(() => true));
        if (!ok) return;
        email = v; verified = false;
        f.recover.elements.code.closest('.lp-label').hidden = false;
        K1.show(f.recover);
        K1.say(`${v} にメールを送りました（登録の無いアドレスには届きません）。メールのコードを入れるか、メールのリンクを同じブラウザで開いてください。届かないときは、迷惑メールのフォルダも見てください。`);
        K1.focus(f.recover.elements.code);
      });
      f.recover.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const code = K1.codeOf(f.recover), pw = f.recover.elements.password, why = Social.passwordProblem(pw.value);
        if (!verified && code.length < 6) return K1.bad(f.recover.elements.code, '6桁の数字を入れてください');
        if (why) return K1.bad(pw, why);
        /* コードを確かめるとログインになる。新しいパスワードを保存し終えるまで、この画面から離れない */
        page.dataset.stay = '1';
        const r = await K1.busy(f.recover, '変えています…', async () => {
          const v = verified ? { needsName: !Social.me() || Social.me().named === false } : await Social.verifyRecovery(email, code, { remember: remember() });
          verified = true;
          f.recover.elements.code.closest('.lp-label').hidden = true;   // 確かめ済み。パスワードだけ直してもう一度
          await Social.updatePassword(pw.value);
          return v;
        });
        if (!r) { if (!verified) delete page.dataset.stay; return; }
        delete page.dataset.stay;
        /* 一言は「パスワードを変えました」だけ（「ログインしました」で上書きしない） */
        if (r.needsName) { askName(); K1.say('パスワードを変えました。'); return; }
        ui.toast('パスワードを変えました');
        ui.done(Social.me());
      });
      inCard.querySelectorAll('[data-lp-back]').forEach((b) => b.addEventListener('click', () => {
        /* コードはもう確かめた（ログインしている）のに、パスワードを保存できずに戻る：ログインの欄は出さず、画面を離れる */
        if (verified && Social.me()) { delete page.dataset.stay; ui.done(Social.me()); return; }
        K1.show(f.pass); K1.say('');
        inCard.querySelectorAll('input[name=code]').forEach((x) => { x.value = ''; });
        K1.focus(f.pass.elements.email);
      }));
      K1.$('[data-lp-resend]').addEventListener('click', (ev) => K1.resend(ev.currentTarget, () => email));
      f.name.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const n = f.name.elements.name;
        if (!n.value.trim()) return K1.bad(n, '表示名を入れてください');
        const ok = await K1.busy(f.name, '保存しています…', () => Social.setName(n.value.trim()).then(() => true));
        if (ok) done(true);
      });
      /* Apple・Google：出かける。戻ってきたら、この画面（#/login）で続き（はじめての人は表示名） */
      const oauth = [...inCard.querySelectorAll('[data-lp-oauth]')].map((b) => {
        const html = b.innerHTML, who = b.dataset.lpOauth, via = who === 'apple' ? 'Apple' : 'Google';
        b.addEventListener('click', async () => {
          b.disabled = true; b.textContent = `${via} に移っています…`;
          if (ui.track) ui.track('login_start', { method: who });
          try { await (who === 'apple' ? Social.signInWithApple : Social.signInWithGoogle)({ remember: remember() }); }
          catch (err) { K1.say(Social.message(err), true); b.disabled = false; b.innerHTML = html; }
        });
        return () => { b.disabled = false; b.innerHTML = html; };
      });
      current = { page, askName, resetOauth: () => oauth.forEach((r) => r()) };
      hook();

      /* ---- アカウントを作る札 ---- */
      const newCard = page.querySelector('.lp-new'), K2 = kit(newCard);
      const make = K2.$('[data-lp-make]'), conf = K2.$('[data-lp-confirm]');
      make.elements.name.value = draft.name; make.elements.email.value = draft.email; make.elements.agree.checked = draft.agree;
      make.addEventListener('input', () => { draft.name = make.elements.name.value; draft.email = make.elements.email.value; draft.agree = make.elements.agree.checked; });
      let newMail = '';
      make.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const n = make.elements.name, em = make.elements.email, pw = make.elements.password, v = em.value.trim();
        if (!n.value.trim()) return K2.bad(n, 'ユーザー名を入れてください');
        if (!MAIL.test(v)) return K2.bad(em, 'メールアドレスを確かめてください');
        const why = Social.passwordProblem(pw.value);
        if (why) return K2.bad(pw, why);
        if (!make.elements.agree.checked) return K2.bad(make.elements.agree, '利用規約・プライバシーポリシーへの同意が必要です');
        const r = await K2.busy(make, '送っています…', () => Social.signUp({ name: n.value.trim(), email: v, password: pw.value, agreed: true }));
        if (!r) return;
        if (!r.needsConfirm) { if (r.needsName) askName(); else done(true); return; }
        if (newMail !== v) K2.unlock(K2.$('[data-lp-resend]'));
        newMail = v;
        K2.show(conf);
        K2.say(`${v} に確認のメールを送りました。メールのコードを入れるか、メールのリンクを同じブラウザで開いてください。届かないときは、迷惑メールのフォルダも見てください。`);
        K2.focus(conf.elements.code);
      });
      conf.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const code = K2.codeOf(conf);
        if (code.length < 6) return K2.bad(conf.elements.code, '6桁の数字を入れてください');
        const r = await K2.busy(conf, '確かめています…', () => Social.confirmSignup(newMail, code));
        if (!r) return;
        if (r.needsName) askName(); else done(true);
      });
      K2.$('[data-lp-resend]').addEventListener('click', (ev) => K2.resend(ev.currentTarget, () => newMail));
      K2.$('[data-lp-back]').addEventListener('click', () => { K2.show(make); K2.say(''); conf.elements.code.value = ''; K2.focus(make.elements.name); });
    }
  };
})();
