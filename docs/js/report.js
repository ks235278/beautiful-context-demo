/* コメントの「…」から開くシート（App Store 審査 1.2：利用者が問題のある投稿を知らせられること・ほかの利用者を遮れること）。

   運営に知らせる …… 理由とひとことを reports に送る（ログインしていなくても送れる。送りすぎ止めはサーバー：migration 09〜11）。
                      運営者は運営者メニューの「通報」で見て、コメントを表示しないなどの対応をする
   表示しない ………… その人のコメントを、この人の画面から外す（js/social.js の mute。相手には知らせない。コメント欄から戻せる）

   app.js が { sheet, closeSheet, toast, track } を渡す。見た目はいままでのシート（app.css の .sheet）のまま */
(() => {
  const REASONS = [
    ['spam', '宣伝・スパム'],
    ['defamation', '悪口・攻撃・差別'],
    ['privacy', '個人の情報が書かれている'],
    ['copyright', '著作権・肖像の侵害'],
    ['other', 'そのほか']
  ];
  const cut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

  window.BCReport = {
    /* c：{ id, uid, name, text, slug }（コメントと、それが付いたつながりの slug） */
    open(ui, c) {
      const Social = window.BCSocial, R = window.BCRender;
      const el = ui.sheet(`
        <p class="meta">COMMENT</p>
        <h2>このコメントについて</h2>
        <p class="sheet-note">${R.esc(c.name)}「${R.esc(cut(c.text, 60))}」</p>
        <div data-report-menu>
          <button type="button" class="sheet-go" data-report-start>運営に知らせる</button>
          <button type="button" class="sheet-later" data-report-mute>${R.esc(c.name)} さんのコメントを表示しない</button>
          <button type="button" class="sheet-later" data-sheet-close>閉じる</button>
        </div>
        <form data-report-form hidden>
          <label>理由<select name="reason" required>${REASONS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
          <label>どこが問題か<textarea name="detail" rows="3" maxlength="2000" required placeholder="例：同じ宣伝が何度も書かれている"></textarea></label>
          <button type="submit" class="sheet-go">送る</button>
          <button type="button" class="sheet-later" data-sheet-close>やめる</button>
        </form>
        <p class="sheet-demo" data-report-msg role="status" aria-live="polite">運営が確かめて、必要なら表示をやめます。「表示しない」は、あなたの画面からだけ外します（相手には知らされません）。</p>`);
      el.setAttribute('aria-label', 'このコメントについて');
      const $ = (s) => el.querySelector(s);
      const say = (t) => { $('[data-report-msg]').textContent = t; };
      const form = $('[data-report-form]');

      $('[data-report-start]').addEventListener('click', () => {
        $('[data-report-menu]').hidden = true;
        form.hidden = false;
        say('ログインしていなくても送れます。書いた内容は運営だけが読みます。');
        try { form.elements.detail.focus({ preventScroll: true }); } catch (e) {}
      });
      $('[data-report-mute]').addEventListener('click', () => {
        Social.mute(c.uid);
        if (ui.track) ui.track('comment_mute');
        ui.closeSheet();
        ui.toast(`${c.name} さんのコメントを表示しません。コメント欄から戻せます`);
      });
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const detail = form.elements.detail.value.trim();
        if (!detail) { form.elements.detail.focus(); return; }
        const reason = form.elements.reason.value;
        const b = form.querySelector('button[type=submit]');
        b.disabled = true; b.textContent = '送っています…';
        try {
          await Social.report({
            kind: 'report', target_type: 'comment', target_id: c.id, reason, detail: detail.slice(0, 2000),
            target_url: c.slug ? `${location.origin}${new URL('./', document.baseURI).pathname}c/${encodeURIComponent(c.slug)}/` : ''
          });
          if (ui.track) ui.track('report_submit', { target_type: 'comment', reason });
          ui.closeSheet();
          ui.toast('運営に知らせました。確かめて対応します');
        } catch (err) {
          say(Social.message(err));
          b.disabled = false; b.textContent = '送る';
        }
      });
      return el;
    }
  };
})();
