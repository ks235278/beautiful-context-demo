/* ログインのシート（Supabase：メールに届く 6桁のコード）。app.js の openLogin() から呼ぶ。

   流れ：メールアドレス →「コードを送る」→ 6桁のコード →「ログイン」→（まだ無ければ）表示名 → then(me)
   ・パスワードは作らない。新しいアドレスなら、コードを確かめた時点でアカウントができる
   ・Google のボタンは config.js の googleEnabled が true のときだけ出す（iPhone のホーム画面の BC で確かめてから）
   ・「あとで」はいつでも閉じる。閉じても、読む・フォローするはそのまま
   見た目は、いままでのシート（app.css の .sheet）をそのまま使う。GA の sign_up / login は app.js が送る（BCBackend の 'auth'） */
(() => {
  window.BCLogin = {
    /* ui：app.js の { sheet, closeSheet, toast } */
    open(ui, title, then) {
      const Social = window.BCSocial, R = window.BCRender;
      const me0 = Social.me();
      const intro = 'フォローした編集者の Today\'s Choice を、どの端末でも受け取れます。メールアドレスに届く6桁のコードでログインします（パスワードは要りません）。';
      const el = ui.sheet(`
        <p class="meta">BEAUTIFUL CONTEXT</p>
        <h2>${R.esc(title || 'ログイン')}</h2>
        <p class="sheet-note" data-login-note>${me0 ? 'コメントに出す名前を決めてください。' : R.esc(intro)}</p>
        ${Social.googleEnabled() && !me0 ? '<button type="button" class="sheet-go" data-login-google>Google で続ける</button>' : ''}
        <form data-login-email${me0 ? ' hidden' : ''}>
          <label>メールアドレス<input name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></label>
          <button type="submit" class="sheet-go">コードを送る</button>
        </form>
        <form data-login-code hidden>
          <label>メールに届いた6桁のコード<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" required placeholder="123456"></label>
          <button type="submit" class="sheet-go">ログイン</button>
          <button type="button" class="sheet-later" data-login-back>メールアドレスを入れ直す</button>
        </form>
        <form data-login-name${me0 ? '' : ' hidden'}>
          <label>表示名<input name="name" maxlength="24" autocomplete="nickname" required placeholder="例：映画と本の山田" value="${R.esc(Social.demoName())}"></label>
          <button type="submit" class="sheet-go">はじめる</button>
          ${me0 ? '<button type="button" class="sheet-later" data-login-out>ログアウト</button><button type="button" class="sheet-del" data-login-delete>アカウントを削除する</button>' : ''}
        </form>
        <p class="sheet-demo" data-login-msg role="status" aria-live="polite">メールアドレスはログインのためだけに使い、ほかの人には見えません。コメントには表示名だけが出ます。</p>
        <button type="button" class="sheet-later" data-sheet-close>あとで</button>`);
      el.setAttribute('aria-label', 'ログイン');
      const $ = (s) => el.querySelector(s);
      const fEmail = $('[data-login-email]'), fCode = $('[data-login-code]'), fName = $('[data-login-name]');
      const say = (t) => { $('[data-login-msg]').textContent = t; };
      const note = (t) => { $('[data-login-note]').textContent = t; };
      const step = (f) => {
        [fEmail, fCode, fName].forEach((x) => { x.hidden = x !== f; });
        const g = $('[data-login-google]'); if (g) g.hidden = f !== fEmail;
      };
      /* 送っているあいだはボタンを止める（二度押しで二通送らない） */
      const busy = async (f, label, job) => {
        const b = f.querySelector('button[type=submit]'), was = b.textContent;
        b.disabled = true; b.textContent = label;
        try { return await job(); } catch (err) { say(Social.message(err)); return null; }
        finally { b.disabled = false; b.textContent = was; }
      };
      let email = '';
      const done = () => {
        const me = Social.me();
        ui.closeSheet();
        ui.toast(`${me.name} としてログインしました`);
        if (then) then(me);
      };

      fEmail.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const v = fEmail.elements.email.value.trim();
        if (!v) return;
        const ok = await busy(fEmail, '送っています…', () => Social.sendCode(v).then(() => true));
        if (!ok) return;
        email = v;
        step(fCode);
        note(`${email} にコードを送りました。メールに書かれた数字を入れてください。`);
        say('届かないときは、迷惑メールのフォルダも見てください。数分たっても届かなければ、入れ直して送り直せます。');
        try { fCode.elements.code.focus({ preventScroll: true }); } catch (e) {}
      });
      $('[data-login-back]').addEventListener('click', () => {
        step(fEmail); note(intro); say('');
        fCode.elements.code.value = '';
      });
      fCode.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const code = fCode.elements.code.value.replace(/\D/g, '');
        if (code.length < 6) { say('6桁の数字を入れてください'); return; }
        const r = await busy(fCode, '確かめています…', () => Social.verifyCode(email, code));
        if (!r) return;
        if (!r.needsName) { done(); return; }
        step(fName);
        note('ログインしました。コメントに出す名前を決めてください。');
        say('Google やメールの名前は使いません。ここで決めた名前だけが出ます。');
      });
      fName.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const n = fName.elements.name.value.trim();
        if (!n) return;
        const ok = await busy(fName, '保存しています…', () => Social.setName(n).then(() => true));
        if (ok) done();
      });
      const g = $('[data-login-google]');
      if (g) g.addEventListener('click', async () => {
        g.disabled = true;
        try { await Social.signInWithGoogle(); } catch (err) { say(Social.message(err)); g.disabled = false; }
      });
      const out = $('[data-login-out]');
      if (out) out.addEventListener('click', () => { Social.signOut(); ui.closeSheet(); ui.toast('ログアウトしました'); });
      const del = $('[data-login-delete]');
      if (del) del.addEventListener('click', () => this.confirmDelete(ui));
      return el;
    },

    /* 退会の確かめ（App Store 5.1.1(v)：アプリの中で始めて、終えられること）。
       何が消えるかを一度だけ見せ、「削除する」で消す。二度目の確かめ（コードの入力など）は求めない。
       編集者・運営者は、サーバーが断る（理由の文をそのまま出す） */
    confirmDelete(ui) {
      const Social = window.BCSocial;
      const el = ui.sheet(`
        <p class="meta">ACCOUNT</p>
        <h2>アカウントを削除しますか</h2>
        <p class="sheet-note">表示名・フォロー・共感と、これまでに書いたコメント（公開中のものも）が、すべて消えます。元には戻せません。</p>
        <button type="button" class="sheet-go sheet-danger" data-delete-go>削除する</button>
        <button type="button" class="sheet-later" data-sheet-close>やめる</button>
        <p class="sheet-demo" data-delete-msg role="status" aria-live="polite"></p>`);
      el.setAttribute('aria-label', 'アカウントの削除');
      const go = el.querySelector('[data-delete-go]');
      go.addEventListener('click', async () => {
        go.disabled = true; go.textContent = '削除しています…';
        try {
          await Social.deleteAccount();
          if (ui.track) ui.track('account_delete');
          ui.closeSheet();
          ui.toast('アカウントを削除しました');
        } catch (err) {
          el.querySelector('[data-delete-msg]').textContent = Social.message(err);
          go.disabled = false; go.textContent = '削除する';
        }
      });
      return el;
    }
  };
})();
