/* 見本のデータ。エディターが保存するものと同じ形。

   組み合わせは前田先生の構成図（flowchart2）どおり。
     HIGHEST 2 LOWEST ＋ 天国と地獄      … 先生の資料の本文
     グレン・グールド ＋ 草枕             … 先生の資料の本文
     漢陽楼 ＋ 周恩来『十九歳の東京日記』
     天国と地獄 ＋ キングの身代金         … 天国と地獄をルーツに共有する
     草枕 ＋ 那古井館                     … 既存の作品に B を足す例

   後ろの三つの本文は見本として書いたもの。確かめられることだけを書き、
   言い伝えは「伝えられる」と書いている。

   その後ろに、先生の「50タイトル」（contents-titles-sample50）を
   つないだ 44 区間が続く。生成AIの初稿で、review: 'ai' が付いている。
   運営者メニューで編集者が承認するまで、ページに「初稿」と表示する。
     kind  … 事実 ／ ハブ ／ 似ている ／ 作者と作品（先生の分類）
     hub   … 二つをつなぐ固有名詞
     score … [意外性, 共感度, コンテンツ性, 世界観近似性] 各 1〜5

   並びは新しい順。共有するルーツどうしは離して置き、ストリームの
   リンクが実際にどこかへ連れていくようにしてある。 */
(() => {
  const H2L = {
    title: '『HIGHEST 2 LOWEST』', type: '映画', year: '2025', creator: 'スパイク・リー監督',
    slug: 'highest-2-lowest', image: 'img/highest.jpg',
    summary: 'スパイク・リーが、黒澤明『天国と地獄』の構造を現代のニューヨークへ移し替えた作品。富、家族、選択の価値が問われる。'
  };
  const HIGHLOW = {
    title: '黒澤明『天国と地獄』', type: '映画', year: '1963', creator: '黒澤明監督',
    slug: 'high-and-low', image: 'img/highlow.jpg',
    summary: 'エド・マクベインの小説『King’s Ransom』を原作に、誘拐事件を通じて企業家の倫理と社会の格差を描いた作品。'
  };
  const GOULD = {
    title: 'グレン・グールド', type: '人物', year: '1932', creator: 'カナダのピアニスト',
    slug: 'glenn-gould', image: 'img/gould.jpg',
    summary: 'バッハ演奏で知られ、クラシック音楽における「演奏とは何か」という考え方そのものを変えた20世紀を代表するピアニスト。'
  };
  const KUSAMAKURA = {
    title: '夏目漱石『草枕』', type: '書籍', year: '1906', creator: '夏目漱石',
    slug: 'kusamakura', image: 'img/kusamakura.jpg',
    summary: '「智に働けば角が立つ。情に棹させば流される。」で始まる、画工が非人情の世界を求めて旅する小説。'
  };
  const KINGS = {
    title: 'エド・マクベイン『キングの身代金』', type: '書籍', year: '1959', creator: 'エド・マクベイン（87分署シリーズ）',
    slug: 'kings-ransom', image: 'img/kings-ransom.jpg',
    summary: '架空の街アイソラの87分署を舞台にした警察小説シリーズの一作。原題『King’s Ransom』。靴会社の重役のもとに、身代金を要求する電話がかかってくる。'
  };
  const NAKOI = {
    title: '小天温泉『那古井館』', type: '宿', year: '1868', creator: '熊本・小天温泉',
    slug: 'nakoikan', image: 'img/nakoikan.jpg',
    summary: '明治元年創業を掲げる、熊本・小天温泉の宿。'
  };
  const KANYO = {
    title: '中国名菜『漢陽楼』', type: '店', year: '1911', creator: '東京・神田',
    slug: 'kanyoro', image: 'img/kanyoro.jpg',
    summary: '明治四十四年創業を掲げる、東京・神田の中国料理店。'
  };
  const ZHOU = {
    title: '周恩来『十九歳の東京日記』', type: '書籍', year: '1918', creator: '周恩来（矢吹晋 監修・鈴木博 訳）',
    slug: 'zhou-tokyo-diary', image: 'img/zhou-diary.jpg',
    summary: '日本に留学していた周恩来が、1918年の東京で書いた日記。神保町、早稲田、浅草、上野、日本橋――19歳の青年が見た百年前の東京が記されている。'
  };

  /* 前田先生の「50タイトル」の残り 42 作品。
     絵は img/works。ポスター・表紙は作品紹介のための引用、人物や土地の写真は
     Wikimedia Commons の自由に使えるもの。credit に撮影者と条件を持ち、
     作品ページと「画像の出典」ページに出す。鳥皮みそ煮・ムルンジだけは札のまま。 */
  const W = {
    goldberg: {
      title: 'バッハ『ゴールドベルク変奏曲』', type: '音楽', year: '1741', creator: 'ヨハン・ゼバスティアン・バッハ',
      slug: 'goldberg-variations', image: 'img/works/goldberg-variations.jpg',
      credit: 'J・S・バッハ『クラヴィーア練習曲集 第4部』初版の表紙（1741）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Goldberg-titlepage.png',
      summary: 'アリアと30の変奏からなる鍵盤作品。1741年ごろに出版された。グレン・グールドの1955年の録音によって、20世紀に広く聴かれる曲になった。'
    },
    soseki: {
      title: '夏目漱石', type: '人物', year: '1867', creator: '小説家（1867–1916）',
      slug: 'natsume-soseki', image: 'img/works/natsume-soseki.jpg',
      credit: '撮影 小川一眞／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Natsume_Soseki_photo.jpg',
      summary: '『吾輩は猫である』『坊っちゃん』『草枕』『こころ』の作家。熊本の第五高等学校で教えたのち、1900年から英国に留学した。'
    },
    zhou: {
      title: '周恩来', type: '人物', year: '1898', creator: '中華人民共和国 初代国務院総理（1898–1976）',
      slug: 'zhou-enlai', image: 'img/works/zhou-enlai.jpg',
      credit: 'White House Photo Office（1972）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Zhou_Enlai_1972.jpg',
      summary: '1917年から1919年まで日本に留学し、帰国後は革命運動に加わった。1949年から亡くなるまで国務院総理を務めた。'
    },
    kotringo: {
      title: 'コトリンゴ', type: '音楽', year: '', creator: 'シンガーソングライター・作曲家',
      slug: 'kotringo', image: 'img/works/kotringo.jpg',
      credit: '撮影 CCPE Rosario／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Kotringo_2.jpg',
      summary: 'ピアノと歌のシンガーソングライター。アニメーション映画『この世界の片隅に』の音楽を手がけ、「悲しくてやりきれない」を歌った。'
    },
    kanashikute: {
      title: '「悲しくてやりきれない」', type: '音楽', year: '1968', creator: 'ザ・フォーク・クルセダーズ（作詞 サトウハチロー／作曲 加藤和彦）',
      slug: 'kanashikute-yarikirenai', image: 'img/works/kanashikute-yarikirenai.jpg',
      credit: 'ザ・フォーク・クルセダーズ『紀元弐阡年』（1968）ジャケット／© 権利者／出典 Apple Music',
      creditUrl: 'https://music.apple.com/jp/song/795007085',
      summary: '1968年に発表されたザ・フォーク・クルセダーズの歌。多くの歌い手にうたい継がれてきた。'
    },
    konosekai: {
      title: '『この世界の片隅に』', type: '映画', year: '2016', creator: '片渕須直監督（原作 こうの史代）',
      slug: 'kono-sekai-no-katasumi-ni', image: 'img/works/kono-sekai-no-katasumi-ni.jpg',
      credit: '© 2019 こうの史代・コアミックス／「この世界の片隅に」製作委員会／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/82278/',
      summary: '戦時中の広島と呉を舞台に、絵を描くことが好きな主人公すずの暮らしを描いたアニメーション映画。原作はこうの史代の漫画。'
    },
    kure: {
      title: '広島県呉市', type: '場所', year: '', creator: '広島県',
      slug: 'kure', image: 'img/works/kure.jpg',
      credit: '呉港（撮影 Evelyn-rose）／CC0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Port-of-Kure-3.jpg',
      summary: '瀬戸内海に面した港町。明治期に海軍の鎮守府が置かれ、戦艦大和が建造された海軍工廠の町として知られる。'
    },
    torikawa: {
      title: '鳥皮みそ煮', type: '料理', year: '', creator: '',
      slug: 'torikawa-misoni', image: 'img/cards/torikawa-misoni.jpg',
      summary: '（解説は前田先生のテキストを待っています）'
    },
    lookback: {
      title: '藤本タツキ『ルックバック』', type: '漫画', year: '2021', creator: '藤本タツキ',
      slug: 'look-back', image: 'img/works/look-back.jpg',
      credit: '© 藤本タツキ／集英社（単行本の表紙）／出典 集英社',
      creditUrl: 'https://www.shueisha.co.jp/books/items/contents.html?isbn=978-4-08-882782-7',
      summary: '漫画を描くことに打ち込む二人の少女を描いた読み切り。2021年に少年ジャンプ＋で公開され、2024年にアニメーション映画になった。'
    },
    fujimoto: {
      title: '藤本タツキ', type: '人物', year: '', creator: '漫画家',
      slug: 'fujimoto-tatsuki', image: 'img/works/fujimoto-tatsuki.jpg',
      credit: '『藤本タツキ短編集 17-21』の表紙／© 藤本タツキ／集英社／出典 集英社',
      creditUrl: 'https://www.shueisha.co.jp/books/items/contents.html?isbn=978-4-08-882803-9',
      summary: '『チェンソーマン』『ルックバック』『ファイアパンチ』の漫画家。'
    },
    csm: {
      title: '藤本タツキ『チェンソーマン』', type: '漫画', year: '2018', creator: '藤本タツキ',
      slug: 'chainsaw-man', image: 'img/works/chainsaw-man.jpg',
      credit: '© 藤本タツキ／集英社（第1巻の表紙）／出典 集英社',
      creditUrl: 'https://www.shueisha.co.jp/books/items/contents.html?isbn=978-4-08-881780-4',
      summary: '悪魔のポチタと一体になり、チェンソーの悪魔の力を得た少年デンジの物語。2018年に週刊少年ジャンプで連載が始まった。'
    },
    koreeda: {
      title: '是枝裕和', type: '人物', year: '1962', creator: '映画監督',
      slug: 'koreeda-hirokazu', image: 'img/works/koreeda-hirokazu.jpg',
      credit: '撮影 Kevin Paul／CC BY 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Hirokazu_Kore-eda_-_The_Egyptian_Theatre.jpg',
      summary: 'テレビのドキュメンタリー演出から映画監督になった。『誰も知らない』『万引き家族』『海街diary』などを撮っている。'
    },
    daremo: {
      title: '是枝裕和『誰も知らない』', type: '映画', year: '2004', creator: '是枝裕和監督',
      slug: 'nobody-knows', image: 'img/works/nobody-knows.jpg',
      credit: '© 2004「誰も知らない」製作委員会／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/1568/',
      summary: '母親に置き去りにされた四人のきょうだいの暮らしを描いた映画。長男を演じた柳楽優弥がカンヌ国際映画祭で最優秀男優賞を受けた。'
    },
    manbiki: {
      title: '是枝裕和『万引き家族』', type: '映画', year: '2018', creator: '是枝裕和監督',
      slug: 'shoplifters', image: 'img/works/shoplifters.jpg',
      credit: '© 2018 フジテレビジョン ギャガ AOI Pro.／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/88449/',
      summary: '万引きで暮らしを補う一家と、彼らに拾われた少女を描いた映画。2018年のカンヌ国際映画祭でパルム・ドールを受けた。'
    },
    daiyame: {
      title: '芋焼酎『だいやめ DAIYAME』', type: '酒', year: '', creator: '濵田酒造（鹿児島）',
      slug: 'daiyame', image: 'img/works/daiyame.jpg',
      credit: '© 濵田酒造／出典 濵田酒造「だいやめ」特設サイト',
      creditUrl: 'https://www.hamadasyuzou.co.jp/daiyame_brand/',
      summary: '鹿児島の芋焼酎。ライチを思わせる香りで知られる。名前は、一日の疲れを癒やす晩酌を表す鹿児島の言葉から。'
    },
    mehldau: {
      title: 'ブラッド・メルドー', type: '音楽', year: '1970', creator: 'ジャズ・ピアニスト',
      slug: 'brad-mehldau', image: 'img/works/brad-mehldau.jpg',
      credit: '撮影 Harald Krichel／CC BY 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Brad_Mehldau-9035.jpg',
      summary: 'アメリカのジャズ・ピアニスト。ピアノ・トリオでの演奏のほか、バッハやロックの曲を独自に解釈した録音でも知られる。'
    },
    gyoza: {
      title: '餃子酒場（勝どき店）', type: '店', year: '', creator: '東京・勝どき',
      slug: 'gyoza-sakaba-kachidoki', image: 'img/works/gyoza-sakaba-kachidoki.jpg',
      credit: '羽根つき焼き餃子（撮影 Austin Keys）／CC BY-SA 2.0／Wikimedia Commons　※店舗の写真ではありません',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Hane-tsuki_Yaki-gyoza_(%E6%AD%93%E8%BF%8E)_(2392524364).jpg',
      summary: '勝どき駅前の、焼き餃子と酒の店。'
    },
    tetta: {
      title: 'ドメーヌ・テッタ', type: 'ワイナリー', year: '', creator: '岡山県新見市',
      slug: 'domaine-tetta', image: 'img/works/domaine-tetta.jpg',
      credit: '出典 にいみ公式観光ホームページ（新見市）',
      creditUrl: 'https://www.city.niimi.okayama.jp/kanko/spot/spot_detail/index/201.html',
      summary: '岡山県新見市哲多町でぶどうを育て、ワインを造るワイナリー。名前は土地の名から。'
    },
    lumumba: {
      title: 'ラウル・ペック『ルムンバの叫び』', type: '映画', year: '2000', creator: 'ラウル・ペック監督',
      slug: 'lumumba', image: 'img/works/lumumba.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/51466/',
      summary: 'コンゴ独立の指導者パトリス・ルムンバの、首相就任から殺害までを描いた映画。'
    },
    conrad: {
      title: 'ジョセフ・コンラッド', type: '人物', year: '1857', creator: '小説家（1857–1924）',
      slug: 'joseph-conrad', image: 'img/works/joseph-conrad.jpg',
      credit: '撮影 George Charles Beresford／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Joseph_Conrad-remastered_to_black_and_white.png',
      summary: 'ポーランド生まれの英国の小説家。船乗りとして世界の海を渡ったのち、英語で『闇の奥』『ロード・ジム』などを書いた。'
    },
    hod: {
      title: 'ジョセフ・コンラッド『闇の奥』', type: '書籍', year: '1899', creator: 'ジョセフ・コンラッド',
      slug: 'heart-of-darkness', image: 'img/works/heart-of-darkness.jpg',
      credit: '初出の「ブラックウッズ・マガジン」1899年2月号／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Blackwood%27s_Magazine_-_1899_cover.jpg',
      summary: '象牙交易の奥地へ向かう船乗りマーロウが、消息を絶った交易所の責任者クルツを探す物語。当時のコンゴ自由国が舞台とされる。'
    },
    apocalypse: {
      title: 'コッポラ『地獄の黙示録』', type: '映画', year: '1979', creator: 'フランシス・フォード・コッポラ監督',
      slug: 'apocalypse-now', image: 'img/works/apocalypse-now.jpg',
      credit: '© 2019 ZOETROPE CORP. ALL RIGHTS RESERVED.／出典 映画.com（ファイナル・カット版）',
      creditUrl: 'https://eiga.com/movie/92262/',
      summary: 'ベトナム戦争のさなか、軍を離れて奥地に王国を築いたカーツ大佐の暗殺を命じられた大尉の旅。1979年のカンヌ国際映画祭でパルム・ドールを受けた。'
    },
    coppola: {
      title: 'フランシス・フォード・コッポラ', type: '人物', year: '1939', creator: '映画監督',
      slug: 'francis-ford-coppola', image: 'img/works/francis-ford-coppola.jpg',
      credit: '撮影 Colleen Sturtevant／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Lena_Herzog_Francis_Ford_Coppola_Wernder_Herzog_Venice_Film_Festival_(cropped).jpg',
      summary: '『ゴッドファーザー』『地獄の黙示録』の映画監督。'
    },
    adan: {
      title: 'アダン', type: '植物', year: '', creator: '奄美・沖縄の海辺の木',
      slug: 'adan', image: 'img/works/adan.jpg',
      credit: '撮影 Anonymous Powered／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Pandanus_odoratissimus.jpg',
      summary: '奄美や沖縄の海辺に生えるタコノキ科の木。パイナップルに似た実をつける。田中一村が「アダンの海辺」に描いた。'
    },
    isson: {
      title: '田中一村', type: '人物', year: '1908', creator: '日本画家（1908–1977）',
      slug: 'tanaka-isson', image: 'img/works/tanaka-isson.jpg',
      credit: '奄美市の田中一村終焉の家（撮影 Kireinakokoro）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E5%A5%84%E7%BE%8E%E5%B8%82%E3%81%AE%E7%94%B0%E4%B8%AD%E4%B8%80%E6%9D%91%E3%81%AE%E4%BD%8F%E5%B1%85%E8%B7%A1.jpg',
      summary: '50歳で奄美大島に移り住み、亜熱帯の植物や鳥を描き続けた日本画家。中央の画壇から離れて暮らした。'
    },
    tsurunoyu: {
      title: '乳頭温泉郷「鶴の湯」', type: '宿', year: '', creator: '秋田県仙北市',
      slug: 'tsurunoyu', image: 'img/works/tsurunoyu.jpg',
      credit: '撮影 Fumiaki Yoshimatsu／CC BY-SA 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Tsurunoyu_Onsen_03.jpg',
      summary: '秋田県の乳頭温泉郷でもっとも古いとされる湯宿。茅葺き屋根の長屋と白濁の湯で知られる。'
    },
    tazawako: {
      title: '田沢湖', type: '場所', year: '', creator: '秋田県仙北市',
      slug: 'tazawako', image: 'img/works/tazawako.jpg',
      credit: '田沢湖と漢槎宮（撮影 掬茶）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Lake_Tazawa_and_Kansa-g%C5%AB_20210213.jpg',
      summary: '秋田県仙北市の湖。水深は日本一で、湖畔には辰子の伝説が残る。'
    },
    iris: {
      title: '韓国ドラマ『アイリス』', type: 'ドラマ', year: '2009', creator: 'イ・ビョンホン主演',
      slug: 'iris', image: 'img/works/iris.jpg',
      credit: '© 2009 TAEWON ENTERTAINMENT.（映画版『アイリス THE LAST』）／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/55869/',
      summary: '韓国の特殊工作員を主人公にしたアクション・ドラマ。秋田県でのロケが行われ、日本でも話題になった。'
    },
    pluribus: {
      title: 'ヴィンス・ギリガン『プルリブス』', type: 'ドラマ', year: '2025', creator: 'ヴィンス・ギリガン',
      slug: 'pluribus', image: 'img/works/pluribus.jpg',
      credit: '© Apple／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/show/umc.cmc.37axgovs2yozlyh3c2cmwzlza',
      summary: '『ブレイキング・バッド』のヴィンス・ギリガンが手がけた Apple TV+ のドラマ。人々の心がひとつに溶け合っていく世界で、それに加わらない一人の女性を描く。'
    },
    tanqueray: {
      title: 'タンカレー No.10', type: '酒', year: '', creator: 'ジン（英国）',
      slug: 'tanqueray-no-ten', image: 'img/works/tanqueray-no-ten.jpg',
      credit: '右が No. TEN（撮影 Chris Corwin）／CC BY-SA 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Tanqueraybottles.jpg',
      summary: '英国のジン、タンカレーの上位銘柄。生の柑橘を使って蒸留されることで知られる。'
    },
    mulungi: {
      title: 'ムルンジ', type: 'その他', year: '', creator: '',
      slug: 'mulungi', image: 'img/cards/mulungi.jpg',
      summary: '（解説は前田先生のテキストを待っています）'
    },
    reacher: {
      title: '『リーチャー 正義のアウトロー』', type: 'ドラマ', year: '2022', creator: 'リー・チャイルド原作',
      slug: 'reacher', image: 'img/works/reacher.jpg',
      credit: '© Amazon／出典 Prime Video',
      creditUrl: 'https://www.primevideo.com/-/ja/detail/0RTZ57DQ6PBHH29UN5JS7U7CW4',
      summary: 'リー・チャイルドの小説シリーズを原作にしたドラマ。元軍人のジャック・リーチャーが、ひとりで各地の事件に立ち向かう。'
    },
    br: {
      title: 'リドリー・スコット『ブレードランナー』', type: '映画', year: '1982', creator: 'リドリー・スコット監督',
      slug: 'blade-runner', image: 'img/works/blade-runner.jpg',
      credit: '写真：Album／アフロ／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/26947/',
      summary: 'フィリップ・K・ディックの小説『アンドロイドは電気羊の夢を見るか？』を原作に、2019年のロサンゼルスで人造人間を追う男を描いた映画。'
    },
    br2049: {
      title: 'ヴィルヌーヴ『ブレードランナー 2049』', type: '映画', year: '2017', creator: 'ドゥニ・ヴィルヌーヴ監督',
      slug: 'blade-runner-2049', image: 'img/works/blade-runner-2049.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/85393/',
      summary: '前作から30年後の2049年を舞台にした続編。'
    },
    br2099: {
      title: '『ブレードランナー 2099』', type: 'ドラマ', year: '', creator: 'リドリー・スコット製作総指揮',
      slug: 'blade-runner-2099', image: 'img/works/blade-runner-2099.jpg',
      credit: '© Amazon／出典 Prime Video',
      creditUrl: 'https://www.primevideo.com/-/ja/detail/0LB7N1ZYZ2AFOEXO5IJ1YUWQVF',
      summary: '2049年からさらに50年後を舞台にしたドラマ・シリーズ。ミシェル・ヨーとハンター・シェイファーが主演し、2026年11月25日から Prime Video で配信される。'
    },
    brazil: {
      title: 'テリー・ギリアム『未来世紀ブラジル』', type: '映画', year: '1985', creator: 'テリー・ギリアム監督',
      slug: 'brazil', image: 'img/works/brazil.jpg',
      credit: '© 20th Century Studios／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/movie/umc.cmc.25tn9231aa7mzrvk4y5ssijqj',
      summary: '書類と管理に覆われた近未来の社会で、夢に逃げ込む役人を描いた映画。'
    },
    depp: {
      title: 'ジョニー・デップ', type: '人物', year: '1963', creator: '俳優',
      slug: 'johnny-depp', image: 'img/works/johnny-depp.jpg',
      credit: '撮影 Harald Krichel／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Johnny_Depp_2020.jpg',
      summary: 'アメリカの俳優。ティム・バートンやテリー・ギリアムの作品に数多く出演し、『MINAMATA』では主演とともに製作にも加わった。'
    },
    minamata: {
      title: '『MINAMATA』', type: '映画', year: '2020', creator: 'アンドリュー・レヴィタス監督',
      slug: 'minamata', image: 'img/works/minamata.jpg',
      credit: '© 2020 MINAMATA FILM, LLC © Larry Horricks／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/94900/',
      summary: '水俣病を世界に伝えた写真家W・ユージン・スミスと、アイリーン・美緒子・スミスの水俣での日々を描いた映画。音楽は坂本龍一。'
    },
    smith: {
      title: 'W・ユージン・スミス', type: '人物', year: '1918', creator: '写真家（1918–1978）',
      slug: 'w-eugene-smith', image: 'img/works/w-eugene-smith.jpg',
      credit: 'ユージン・スミスとアイリーン（1974、撮影 Consuelo Kanaga）／ブルックリン美術館・No known restrictions／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Consuelo_Kanaga_(American,_1894-1978)._W._Eugene_Smith_and_Aileen,_1974_(borderless).jpg',
      summary: 'アメリカの写真家。「ライフ」誌のフォトエッセイで知られ、1970年代には熊本県水俣に移り住んで水俣病を撮った。'
    },
    historie: {
      title: '岩明均『ヒストリエ』', type: '漫画', year: '2003', creator: '岩明均',
      slug: 'historie', image: 'img/works/historie.jpg',
      credit: '© 岩明均／講談社（第1巻の表紙）／出典 講談社',
      creditUrl: 'https://www.kodansha.co.jp/comic/products/0000030267',
      summary: 'アレクサンドロス大王の書記官エウメネスの生涯を描く歴史漫画。'
    },
    kiseiju: {
      title: '岩明均『寄生獣』', type: '漫画', year: '1988', creator: '岩明均',
      slug: 'parasyte', image: 'img/works/parasyte.jpg',
      credit: '© 岩明均／講談社（第1巻の表紙）／出典 講談社',
      creditUrl: 'https://www.kodansha.co.jp/comic/products/0000029944',
      summary: '人間に寄生する生物が現れた世界で、右手に寄生された高校生・泉新一と「ミギー」の共生を描いた漫画。'
    },
    iwaaki: {
      title: '岩明均', type: '人物', year: '1960', creator: '漫画家',
      slug: 'iwaaki-hitoshi', image: 'img/works/iwaaki-hitoshi.jpg',
      credit: '岩明均の短編集『新装版 骨の音』の表紙／© 岩明均／講談社／出典 講談社',
      creditUrl: 'https://www.kodansha.co.jp/comic/products/0000032031',
      summary: '『寄生獣』『ヒストリエ』の漫画家。'
    }
  };

  const AUTHOR = '編集部（見本）';
  const AI = '生成AI（初稿）';

  window.BC_SEED = [
    {
      id: 'seed-highest-highlow',
      createdAt: '2026-09-20T09:00:00.000Z',
      updatedAt: '2026-09-20T09:00:00.000Z',
      a: H2L,
      b: HIGHLOW,
      context: {
        routeName: '原作から再解釈へ',
        label: 'CONTEXT',
        kind: '事実',
        hub: '原作『King’s Ransom』',
        score: [3, 5, 5, 4],
        headline: '誘拐劇は、60年後に\nアメリカへ戻った。',
        slug: 'highest-2-lowest--high-and-low',
        relation: '黒澤明『天国と地獄』── 原作『King’s Ransom』── スパイク・リー『HIGHEST 2 LOWEST』',
        leftStation: 'HIGHEST 2 LOWEST',
        rightStation: '天国と地獄',
        author: AUTHOR,
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>同じ物語が、別の社会を走る。</strong></p>' +
          '<p>1963年に日本で映画化された誘拐劇が、時代と場所を越えて、現代のニューヨークへ戻ってきた。</p>' +
          '<p>二作品をつないでいるのは名前だけではない。原作の構造を受け継ぎながら、富を持つ者の責任、都市の格差、家族を守る選択をそれぞれの社会に問い直している。</p>' +
          '<h3>系譜</h3>' +
          '<p>エド・マクベイン『King’s Ransom』（1959）から、黒澤明『天国と地獄』（1963）へ。そこからさらに、スパイク・リー『Highest 2 Lowest』（2025）へ。アメリカ小説が日本映画になり、その日本映画がふたたびアメリカ映画になるという、珍しい往復運動である。</p>' +
          '<h3>共通する問い</h3>' +
          '<p>誘拐犯が間違えてさらったのは、主人公の息子ではなく、運転手の息子だった。全財産を失ってでも、他人の子を救うのか。二作品はいずれも、この一点に主人公を立たせる。</p>' +
          '<p>黒澤版の権藤は製靴会社の重役であり、その倫理は「良い靴を作る」ことに宿る。リー版のデヴィッド・キングは音楽プロデューサーであり、それは「良い音を聴き分ける耳」に置き換えられている。どちらも単なる富裕層ではなく、自分の仕事に強い美学を持つ成功者である。</p>' +
          '<h3>高低差というタイトル</h3>' +
          '<p>黒澤は横浜を見下ろす高台の邸宅を「天国」、その下界を「地獄」として、都市の高低差をそのまま経済的な階級差に重ねた。スパイク・リーはそれを High and Low ではなく Highest 2 Lowest とし、頂点と最底辺の距離をさらに強調している。</p>'
      }
    },

    {
      id: 'seed-gould-kusamakura',
      createdAt: '2026-09-19T09:00:00.000Z',
      updatedAt: '2026-09-19T09:00:00.000Z',
      a: GOULD,
      b: KUSAMAKURA,
      context: {
        routeName: '非人情という共通言語',
        label: 'CONTEXT',
        kind: '事実',
        hub: '英訳『The Three-Cornered World』',
        score: [5, 4, 5, 4],
        headline: '枕元にあった二冊は、\n聖書と『草枕』だった。',
        slug: 'glenn-gould--kusamakura',
        relation: 'グレン・グールド ── 英訳『The Three-Cornered World』── 夏目漱石『草枕』',
        leftStation: 'グレン・グールド',
        rightStation: '草枕',
        author: AUTHOR,
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>意味の上での近さはない。あるのは、検証された事実である。</strong></p>' +
          '<p>カナダのピアニストと明治の日本文学に、本来なら接点はない。二人をつないでいるのは一冊の翻訳書という事実だけである。</p>' +
          '<h3>出会い</h3>' +
          '<p>グールドが読んだのは、アラン・ターニーによる英訳 The Three-Cornered World（1965年）である。1967年ごろに出会い、その後15年ほど強く惹かれ続けた。</p>' +
          '<p>『草枕』について37ページものノートを残し、英訳されていた漱石作品を次々に集め、最晩年には『草枕』をもとにしたラジオ作品まで構想していた。死去時、ベッドサイドにあった本が『聖書』と『草枕』だったとも伝えられている。</p>' +
          '<h3>非人情</h3>' +
          '<p>いちばん重要なのは「非人情」である。『草枕』の画工は、冒頭で「智に働けば角が立つ。情に棹させば流される。意地を通せば窮屈だ。」と語る。感情に流されず、しかし冷淡でもない場所から世界を眺めるという態度。</p>' +
          '<p>演奏会という場を離れ、録音というかたちで音楽と向き合うことを選んだグールドにとって、この作品は単なる愛読書ではなく、自分自身の芸術観を言語化してくれたものに近かったと考えると、二人の関係がよく見えてくる。</p>'
      }
    },

    {
      id: 'seed-kanyoro-zhou',
      createdAt: '2026-09-18T09:00:00.000Z',
      updatedAt: '2026-09-18T09:00:00.000Z',
      a: KANYO,
      b: ZHOU,
      context: {
        routeName: '若き日の東京',
        label: 'CONTEXT',
        kind: '事実',
        hub: '神田・神保町',
        score: [4, 4, 4, 3],
        headline: '百年前の留学生は、\n神田の街を歩いていた。',
        slug: 'kanyoro--zhou-tokyo-diary',
        relation: '周恩来『十九歳の東京日記』── 神田・神保町 ── 中国名菜『漢陽楼』',
        leftStation: '漢陽楼',
        rightStation: '十九歳の東京日記',
        author: AUTHOR,
        aiUrl: '',
        line: { shape: 3, color: '#d42b2b' },
        body:
          '<p><strong>一冊の日記と一軒の店が、同じ街の百年前を指している。</strong></p>' +
          '<p>1917年に日本へ渡った周恩来は、東京で受験勉強の日々を送った。のちに『十九歳の東京日記』としてまとめられた日記には、神保町、早稲田、浅草、上野、日本橋と、青年が歩いた東京の地名が並ぶ。</p>' +
          '<h3>留学生の街</h3>' +
          '<p>当時の神田・神保町界隈には、中国からの留学生が数多く暮らしていた。明治四十四年創業を掲げる中国料理店「漢陽楼」は、そうした留学生たちが集った店のひとつで、若き周恩来も通ったと伝えられている。</p>' +
          '<h3>百年後に辿る</h3>' +
          '<p>日記を手に神田を歩き、同じ店の暖簾をくぐる。書かれた言葉と、いまも続く店とが、読む人の中で一本の線につながる。本と場所を結ぶコンテクストは、読むことをそのまま出かけることへ変えていく。</p>'
      }
    },

    {
      id: 'seed-highlow-kings',
      createdAt: '2026-09-17T09:00:00.000Z',
      updatedAt: '2026-09-17T09:00:00.000Z',
      a: HIGHLOW,
      b: KINGS,
      context: {
        routeName: '小説から映画へ',
        label: 'CONTEXT',
        kind: '事実',
        hub: '翻案',
        score: [2, 4, 5, 4],
        headline: '身代金の電話は、\n横浜の高台で鳴った。',
        slug: 'high-and-low--kings-ransom',
        relation: 'エド・マクベイン『King’s Ransom』（1959）── 黒澤明『天国と地獄』（1963）',
        leftStation: '天国と地獄',
        rightStation: 'キングの身代金',
        author: AUTHOR,
        aiUrl: '',
        line: { shape: 2, color: '#b8792c' },
        body:
          '<p><strong>黒澤は、アメリカの警察小説を高度経済成長期の日本へ移した。</strong></p>' +
          '<p>『天国と地獄』は、まったくのオリジナル脚本ではない。原作は、エド・マクベインの〈87分署シリーズ〉の一作『King’s Ransom』（1959）である。</p>' +
          '<h3>取り違えられた子ども</h3>' +
          '<p>靴会社の重役のもとに「息子を誘拐した」という電話がかかる。ところが連れ去られたのは、彼の息子ではなく、運転手の息子だった。他人の子のために全財産を差し出すのか。物語の芯になるこの問いは、小説から映画へそのまま受け継がれている。</p>' +
          '<h3>移し替えられたもの</h3>' +
          '<p>黒澤は舞台を横浜に移し、誘拐サスペンスを、階級の格差と高度経済成長期の日本社会を描く映画へと大きく広げた。高台の邸宅と、それを見上げる下界。その高低差が、日本語の題名『天国と地獄』そのものになっている。</p>' +
          '<p>そして約60年後、スパイク・リーはこの同じ小説を企画の出発点に、物語をふたたびニューヨークへ戻すことになる。</p>'
      }
    },

    {
      id: 'seed-kusamakura-nakoi',
      createdAt: '2026-09-16T09:00:00.000Z',
      updatedAt: '2026-09-16T09:00:00.000Z',
      a: KUSAMAKURA,
      b: NAKOI,
      context: {
        routeName: '小説の舞台を訪ねる',
        label: 'CONTEXT',
        kind: '事実',
        hub: '小天温泉',
        score: [3, 4, 4, 4],
        headline: '「那古井」は、\n地図の上にもあった。',
        slug: 'kusamakura--nakoikan',
        relation: '夏目漱石『草枕』（1906）── 熊本・小天温泉 ── 那古井館',
        leftStation: '草枕',
        rightStation: '那古井館',
        author: AUTHOR,
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>非人情の旅先には、モデルとされる土地がある。</strong></p>' +
          '<p>『草枕』の画工が逗留する山あいの温泉場「那古井」。そのモデルとされるのが、熊本の小天（おあま）温泉である。</p>' +
          '<h3>漱石の滞在</h3>' +
          '<p>熊本の第五高等学校で教えていた漱石は、明治30年の暮れから翌年の正月にかけて小天温泉を訪れ、この地の前田家の別邸に滞在したと伝えられる。そのときの見聞が、のちの『草枕』の温泉場に重ねられていった。</p>' +
          '<h3>名を受け継ぐ宿</h3>' +
          '<p>いま小天温泉には、小説の地名を名に掲げる宿「那古井館」がある。架空の温泉場の名が、現実の宿の看板になっているという往復が面白い。</p>' +
          '<p>グールドが英訳で読み込んだ『草枕』の世界は、こうして九州の一つの温泉地へもつながっていく。</p>'
      }
    },

    /* ---- ここから、前田先生の 50 タイトルをつないだ区間（生成AIの初稿） ----
       事実・ハブ・似ている・作者と作品 の四種。本文は先生のテキストが届いたら差し替える。 */
    {
      id: 'seed-highest-2-lowest--kings-ransom',
      createdAt: '2026-09-15T09:00:00.000Z',
      updatedAt: '2026-09-15T09:00:00.000Z',
      a: H2L,
      b: KINGS,
      context: {
        routeName: 'もう一本の源流',
        label: 'CONTEXT',
        kind: '事実',
        hub: '『King’s Ransom』',
        score: [2, 4, 4, 4],
        headline: '始まりは黒澤ではなく、\n一冊の小説だった。',
        slug: 'highest-2-lowest--kings-ransom',
        relation: 'エド・マクベイン『King’s Ransom』── スパイク・リー『HIGHEST 2 LOWEST』',
        leftStation: 'HIGHEST 2 LOWEST',
        rightStation: 'キングの身代金',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>リメイクではなく「再解釈」。そう紹介される映画には、もう一本の源流がある。</strong></p><p>『HIGHEST 2 LOWEST』は、黒澤明『天国と地獄』の再解釈として紹介されることが多い。けれども、黒澤の映画そのものにも原作がある。エド・マクベインの小説『King’s Ransom』（1959）である。</p><p>二つの作品を並べると、黒澤を経由する線の奥に、アメリカの小説からアメリカの映画へ戻ってくる線が見えてくる。どちらの線も、他人の子のために全財産を差し出せるか、という同じ問いに行き着く。</p>'
      }
    },

    {
      id: 'seed-glenn-gould--goldberg-variations',
      createdAt: '2026-09-15T08:50:00.000Z',
      updatedAt: '2026-09-15T08:50:00.000Z',
      a: GOULD,
      b: W.goldberg,
      context: {
        routeName: '始まりと終わりの録音',
        label: 'CONTEXT',
        kind: '事実',
        hub: '二度の録音',
        score: [2, 5, 5, 5],
        headline: 'デビューも最後の録音も、\n同じ曲だった。',
        slug: 'glenn-gould--goldberg-variations',
        relation: 'グレン・グールド ── 1955年の録音／1981年の録音 ── 『ゴールドベルク変奏曲』',
        leftStation: 'グレン・グールド',
        rightStation: 'ゴールドベルク変奏曲',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>一人のピアニストが、同じ曲で世に出て、同じ曲で去った。</strong></p><p>グレン・グールドは1955年、バッハの『ゴールドベルク変奏曲』を録音してレコード・デビューした。速く、乾いた、それまでにない演奏は、この曲を広く知られるものにした。</p><p>1981年、グールドはもう一度この曲を録音する。テンポはずっと遅く、アリアは祈るように始まる。そのレコードが出た1982年に、グールドは50歳で亡くなった。</p><p>二つの録音のあいだにある26年が、そのまま一人の演奏家の歩みになっている。</p>'
      }
    },

    {
      id: 'seed-goldberg-variations--brad-mehldau',
      createdAt: '2026-09-15T08:40:00.000Z',
      updatedAt: '2026-09-15T08:40:00.000Z',
      a: W.goldberg,
      b: W.mehldau,
      context: {
        routeName: 'バッハを経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'J・S・バッハ',
        score: [4, 4, 4, 4],
        headline: 'ジャズのピアニストも、\nバッハから始め直した。',
        slug: 'goldberg-variations--brad-mehldau',
        relation: 'J・S・バッハ ── ブラッド・メルドー『After Bach』（2018）',
        leftStation: 'ゴールドベルク変奏曲',
        rightStation: 'ブラッド・メルドー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブはバッハ。二人のピアニストが、同じ作曲家を通って自分の音を探した。</strong></p><p>ブラッド・メルドーは2018年のアルバム『After Bach』で、バッハの鍵盤曲を弾き、その一曲ごとに自作の曲を続けて並べた。バッハを弾くことが、そのまま自分の即興の出発点になっている。</p><p>グールドが『ゴールドベルク変奏曲』で示したのも、楽譜に忠実であることと、弾き手が自由であることが両立するという考え方だった。クラシックとジャズという違う場所から、二人は同じ入口に立っている。</p>'
      }
    },

    {
      id: 'seed-kusamakura--natsume-soseki',
      createdAt: '2026-09-15T08:30:00.000Z',
      updatedAt: '2026-09-15T08:30:00.000Z',
      a: KUSAMAKURA,
      b: W.soseki,
      context: {
        routeName: '画工の目、作家の目',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 3, 5],
        headline: '「非人情」は、\n漱石自身の宿題だった。',
        slug: 'kusamakura--natsume-soseki',
        relation: '夏目漱石 ── 『草枕』（1906）',
        leftStation: '草枕',
        rightStation: '夏目漱石',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>主人公の画工は、書き手の分身でもある。</strong></p><p>『草枕』は1906年に発表された。人情の世界から一歩引き、世界を一枚の絵のように眺めたいという画工の願いは、教師として、作家として生活に追われていた漱石自身の願いでもあったと読まれてきた。</p><p>熊本で教えていた時代の小天温泉での滞在が、その温泉場の姿に重ねられている。作家の暮らしと小説のあいだにも、一本の区間がある。</p>'
      }
    },

    {
      id: 'seed-natsume-soseki--zhou-tokyo-diary',
      createdAt: '2026-09-15T08:20:00.000Z',
      updatedAt: '2026-09-15T08:20:00.000Z',
      a: W.soseki,
      b: ZHOU,
      context: {
        routeName: '異国の都の日記',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '留学生の日記',
        score: [5, 4, 4, 3],
        headline: '漱石はロンドンで、\n周恩来は東京で書いた。',
        slug: 'natsume-soseki--zhou-tokyo-diary',
        relation: '夏目漱石のロンドン留学（1900–1902）── 周恩来『十九歳の東京日記』（1918）',
        leftStation: '夏目漱石',
        rightStation: '十九歳の東京日記',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。異国の都で、若い留学生が自分の国の行く末を考えながら書いた。</strong></p><p>夏目漱石は1900年から約2年間、文部省の留学生としてロンドンに暮らした。下宿にこもって英文学と格闘し、神経をすり減らした日々は、日記や手紙に残されている。</p><p>その十数年後、今度は中国から周恩来が東京にやって来た。受験勉強と挫折、祖国への思いを綴った日記は、のちに『十九歳の東京日記』として読まれている。</p><p>日本から西洋へ向かった留学生と、中国から日本へ向かった留学生。向きは違っても、異国の都で「学ぶとは何か」に悩んだ記録として、二つは並べて読むことができる。</p>'
      }
    },

    {
      id: 'seed-zhou-enlai--zhou-tokyo-diary',
      createdAt: '2026-09-15T08:10:00.000Z',
      updatedAt: '2026-09-15T08:10:00.000Z',
      a: W.zhou,
      b: ZHOU,
      context: {
        routeName: '書き手と日記',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '日記の書き手',
        score: [2, 4, 4, 5],
        headline: 'のちの総理は、\n十九歳で東京にいた。',
        slug: 'zhou-enlai--zhou-tokyo-diary',
        relation: '周恩来 ── 『十九歳の東京日記』',
        leftStation: '周恩来',
        rightStation: '十九歳の東京日記',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>日記を書いたのは、まだ何者でもない青年だった。</strong></p><p>1917年秋に来日した周恩来は、東京で日本の学校への進学を目指した。日記には、試験の不安、読んだ本、歩いた街の名前が並ぶ。</p><p>やがて帰国した青年は革命運動に加わり、1949年から亡くなるまで中華人民共和国の国務院総理を務めた。その人生のはじまりの一年が、東京という街とともに記録されている。</p>'
      }
    },

    {
      id: 'seed-tanaka-isson--kusamakura',
      createdAt: '2026-09-15T08:00:00.000Z',
      updatedAt: '2026-09-15T08:00:00.000Z',
      a: W.isson,
      b: KUSAMAKURA,
      context: {
        routeName: '世を離れて描く',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '非人情',
        score: [5, 4, 4, 4],
        headline: '小説の画工を、\n生きてしまった画家がいる。',
        slug: 'tanaka-isson--kusamakura',
        relation: '夏目漱石『草枕』の画工 ── 田中一村',
        leftStation: '田中一村',
        rightStation: '草枕',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。事実のつながりではない。</strong></p><p>『草枕』の画工は、人の世のわずらわしさから離れ、世界を絵として眺めたいと願って山の温泉場へ旅をする。</p><p>田中一村は50歳で奄美大島に移り住み、大島紬の染色工として働きながら、亜熱帯の植物と鳥を描き続けた。中央の画壇に認められることを求めず、ひとり描くことを選んだ生き方は、小説の画工の願いを現実に生きたようにも見える。</p><p>二人を結ぶのは史実ではなく、「世を離れて描く」という態度そのものである。</p>'
      }
    },

    {
      id: 'seed-kotringo--kanashikute-yarikirenai',
      createdAt: '2026-09-15T07:50:00.000Z',
      updatedAt: '2026-09-15T07:50:00.000Z',
      a: W.kotringo,
      b: W.kanashikute,
      context: {
        routeName: 'うたい直された歌',
        label: 'CONTEXT',
        kind: '事実',
        hub: '映画『この世界の片隅に』',
        score: [3, 5, 4, 5],
        headline: '1968年の歌を、\n静かな声がうたい直した。',
        slug: 'kotringo--kanashikute-yarikirenai',
        relation: 'ザ・フォーク・クルセダーズ（1968）── コトリンゴ（2016）',
        leftStation: 'コトリンゴ',
        rightStation: '悲しくてやりきれない',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>半世紀近く前の歌が、新しい声で映画の冒頭に置かれた。</strong></p><p>「悲しくてやりきれない」は、1968年にザ・フォーク・クルセダーズが発表した歌で、作詞はサトウハチロー、作曲は加藤和彦。</p><p>コトリンゴはこの歌をカバーし、アニメーション映画『この世界の片隅に』（2016）の冒頭に流れる歌として使われた。ピアノに寄り添う柔らかな声は、原曲の悲しみを、日々を生きる人のささやきのように聴かせる。</p>'
      }
    },

    {
      id: 'seed-kanashikute-yarikirenai--kono-sekai-no-katasumi-ni',
      createdAt: '2026-09-15T07:40:00.000Z',
      updatedAt: '2026-09-15T07:40:00.000Z',
      a: W.kanashikute,
      b: W.konosekai,
      context: {
        routeName: '映画のはじまりの歌',
        label: 'CONTEXT',
        kind: '事実',
        hub: '主題歌',
        score: [3, 5, 4, 4],
        headline: '戦時下の日常は、\nこの歌から始まる。',
        slug: 'kanashikute-yarikirenai--kono-sekai-no-katasumi-ni',
        relation: '「悲しくてやりきれない」── 『この世界の片隅に』',
        leftStation: '悲しくてやりきれない',
        rightStation: 'この世界の片隅に',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>悲しみを叫ぶのではなく、そっと差し出す歌。</strong></p><p>映画『この世界の片隅に』は、戦争の時代を生きたすずの暮らしを、大きな事件よりも毎日の食事や針仕事のほうから描いていく。</p><p>その始まりに流れるのが「悲しくてやりきれない」である。どうにもならない悲しみを抱えながら、それでも日々は続いていく。歌の言葉は、映画がこれから描く時間をあらかじめ包んでいる。</p>'
      }
    },

    {
      id: 'seed-kono-sekai-no-katasumi-ni--kure',
      createdAt: '2026-09-15T07:30:00.000Z',
      updatedAt: '2026-09-15T07:30:00.000Z',
      a: W.konosekai,
      b: W.kure,
      context: {
        routeName: '嫁いだ先の町',
        label: 'CONTEXT',
        kind: '事実',
        hub: '物語の舞台',
        score: [2, 5, 5, 5],
        headline: 'すずは広島から、\n軍港の町へ嫁いだ。',
        slug: 'kono-sekai-no-katasumi-ni--kure',
        relation: '『この世界の片隅に』── 物語の舞台 ── 広島県呉市',
        leftStation: 'この世界の片隅に',
        rightStation: '呉',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>物語の舞台そのものが、もう一人の主人公になっている。</strong></p><p>広島市の江波で育ったすずは、18歳で呉の北條家に嫁ぐ。呉は海軍の鎮守府が置かれ、戦艦大和を建造した海軍工廠のある町だった。</p><p>港を見下ろす段々畑の家で、すずは配給の食材を工夫し、軍艦の絵を描く。やがてその町は空襲にさらされる。</p><p>映画を観たあとに呉を訪ねる人は多い。作品のなかの坂道や港の風景は、いまの町の地図の上にも重ねて辿ることができる。</p>'
      }
    },

    {
      id: 'seed-kure--torikawa-misoni',
      createdAt: '2026-09-15T07:20:00.000Z',
      updatedAt: '2026-09-15T07:20:00.000Z',
      status: 'private',
      note: 'つながりの根拠を確認中（前田先生のテキスト待ち）',
      a: W.kure,
      b: W.torikawa,
      context: {
        routeName: '呉の一皿',
        label: 'CONTEXT',
        kind: '要確認',
        headline: '港町と、\n一皿の料理。',
        slug: 'kure--torikawa-misoni',
        relation: '広島県呉市 ── 鳥皮みそ煮',
        leftStation: '呉',
        rightStation: '鳥皮みそ煮',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#b8792c' },
        body:
          '<p><strong>下書き。まだ公開していない区間。</strong></p><p>前田先生のリストで呉市と並べて置かれている一品。二つを結ぶ根拠をまだ確かめられていないため、先生のテキストを受けてから書く。</p>'
      }
    },

    {
      id: 'seed-kono-sekai-no-katasumi-ni--look-back',
      createdAt: '2026-09-15T07:10:00.000Z',
      updatedAt: '2026-09-15T07:10:00.000Z',
      a: W.konosekai,
      b: W.lookback,
      context: {
        routeName: '描く手',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '描く手',
        score: [5, 5, 5, 4],
        headline: '描くことを奪われても、\n描いた日々は消えない。',
        slug: 'kono-sekai-no-katasumi-ni--look-back',
        relation: 'すずの右手 ── 藤野と京本の漫画',
        leftStation: 'この世界の片隅に',
        rightStation: 'ルックバック',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。二つの作品に直接の関係はない。</strong></p><p>『この世界の片隅に』のすずは、絵を描くことが好きな少女だった。けれども空襲のあと、時限爆弾の爆発に巻き込まれ、絵を描いてきた右手を失う。</p><p>『ルックバック』は、漫画を描くことに人生を懸けた藤野と京本の物語である。二人の時間は、ある日の突然の出来事によって断ち切られる。</p><p>どちらの作品も、描く手がもう届かなくなったあとで、それでも描いた日々が人を支えることを描いている。描くことを主題にした二本のアニメーション映画として、並べて観られてよい。</p>'
      }
    },

    {
      id: 'seed-fujimoto-tatsuki--look-back',
      createdAt: '2026-09-15T07:00:00.000Z',
      updatedAt: '2026-09-15T07:00:00.000Z',
      a: W.fujimoto,
      b: W.lookback,
      context: {
        routeName: '描く人を描く',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '漫画家が、\n漫画を描く人を描いた。',
        slug: 'fujimoto-tatsuki--look-back',
        relation: '藤本タツキ ── 『ルックバック』（2021）',
        leftStation: '藤本タツキ',
        rightStation: 'ルックバック',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>描く人が、描く人を描いた。</strong></p><p>『ルックバック』は2021年に少年ジャンプ＋で公開された長編の読み切りで、公開直後から大きな反響を呼んだ。</p><p>小学生の藤野と、不登校の京本。互いの絵に打ちのめされ、励まされながら、二人は漫画を描き続ける。机に向かう背中を何度も描くこの作品には、描くことそのものへの作者の思いが刻まれている。2024年には押山清高監督によってアニメーション映画になった。</p>'
      }
    },

    {
      id: 'seed-fujimoto-tatsuki--chainsaw-man',
      createdAt: '2026-09-15T06:50:00.000Z',
      updatedAt: '2026-09-15T06:50:00.000Z',
      a: W.fujimoto,
      b: W.csm,
      context: {
        routeName: '悪魔を狩る少年',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '借金を背負った少年に、\nチェンソーの心臓が宿る。',
        slug: 'fujimoto-tatsuki--chainsaw-man',
        relation: '藤本タツキ ── 『チェンソーマン』（2018–）',
        leftStation: '藤本タツキ',
        rightStation: 'チェンソーマン',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>作者の名を広く知らしめた長編。</strong></p><p>『チェンソーマン』は2018年に週刊少年ジャンプで連載が始まった。父の借金を背負ったデンジは、チェンソーの悪魔ポチタと一体になり、悪魔を狩る側に回る。</p><p>容赦のない展開と、ふとした場面の静けさ。映画から受けた影響を隠さない画面づくりは、同じ作者の『ルックバック』にも通じている。第二部は少年ジャンプ＋に移って続き、アニメはMAPPAが手がけた。</p>'
      }
    },

    {
      id: 'seed-chainsaw-man--parasyte',
      createdAt: '2026-09-15T06:40:00.000Z',
      updatedAt: '2026-09-15T06:40:00.000Z',
      a: W.csm,
      b: W.kiseiju,
      context: {
        routeName: '体に宿るもう一つの命',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '共生',
        score: [4, 4, 5, 4],
        headline: '悪魔の心臓と、\n右手の寄生生物。',
        slug: 'chainsaw-man--parasyte',
        relation: 'デンジとポチタ ── 泉新一とミギー',
        leftStation: 'チェンソーマン',
        rightStation: '寄生獣',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『寄生獣』の泉新一は、脳を乗っ取られるはずだった寄生生物に右手だけを奪われ、「ミギー」と名づけたその生き物と共に生きることになる。</p><p>『チェンソーマン』のデンジは、瀕死のところを悪魔のポチタに救われ、ポチタが心臓となって一体になる。</p><p>どちらの少年も、自分の体の中に人間ではない相棒を抱えて戦う。そして物語は、人間とは何かという問いを、その相棒のほうから投げかけてくる。時代を隔てた二つの漫画は、同じ構図の上に立っている。</p>'
      }
    },

    {
      id: 'seed-koreeda-hirokazu--nobody-knows',
      createdAt: '2026-09-15T06:30:00.000Z',
      updatedAt: '2026-09-15T06:30:00.000Z',
      a: W.koreeda,
      b: W.daremo,
      context: {
        routeName: '見過ごされた子どもたち',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [2, 4, 4, 5],
        headline: '14歳の少年が、\nカンヌで最年少の男優賞を得た。',
        slug: 'koreeda-hirokazu--nobody-knows',
        relation: '是枝裕和 ── 『誰も知らない』（2004）',
        leftStation: '是枝裕和',
        rightStation: '誰も知らない',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>実際の出来事から着想した映画。</strong></p><p>『誰も知らない』は、1988年に東京で起きた子ども置き去り事件に着想を得て、是枝裕和が長い時間をかけて形にした作品である。</p><p>母親に置いていかれた四人のきょうだいが、誰にも気づかれないまま暮らしていく。長男・明を演じた柳楽優弥は、2004年のカンヌ国際映画祭で、史上最年少の最優秀男優賞を受けた。</p>'
      }
    },

    {
      id: 'seed-koreeda-hirokazu--shoplifters',
      createdAt: '2026-09-15T06:20:00.000Z',
      updatedAt: '2026-09-15T06:20:00.000Z',
      a: W.koreeda,
      b: W.manbiki,
      context: {
        routeName: '家族とは何か',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [2, 4, 4, 5],
        headline: '日本映画に21年ぶりの\nパルム・ドールをもたらした。',
        slug: 'koreeda-hirokazu--shoplifters',
        relation: '是枝裕和 ── 『万引き家族』（2018）',
        leftStation: '是枝裕和',
        rightStation: '万引き家族',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>ドキュメンタリー出身の監督が、繰り返し問いかけてきた主題の到達点。</strong></p><p>『万引き家族』は2018年のカンヌ国際映画祭でパルム・ドールを受けた。日本映画としては今村昌平『うなぎ』（1997）以来、21年ぶりのことだった。</p><p>血のつながらない人々が寄り添って暮らす家は、法の上では「家族」ではない。それでも彼らのあいだにあったものを、映画は丁寧に見つめる。</p>'
      }
    },

    {
      id: 'seed-nobody-knows--shoplifters',
      createdAt: '2026-09-15T06:10:00.000Z',
      updatedAt: '2026-09-15T06:10:00.000Z',
      a: W.daremo,
      b: W.manbiki,
      context: {
        routeName: '誰にも見えない家',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '見えない家族',
        score: [2, 5, 5, 5],
        headline: '社会の外側で、\n子どもたちは暮らしていた。',
        slug: 'nobody-knows--shoplifters',
        relation: '『誰も知らない』（2004）── 『万引き家族』（2018）',
        leftStation: '誰も知らない',
        rightStation: '万引き家族',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>同じ監督が、14年を隔てて同じ場所を見つめた。</strong></p><p>『誰も知らない』の子どもたちは、母に置いていかれ、学校にも通わず、アパートの一室で暮らす。『万引き家族』の少年と少女は、血のつながらない大人たちの家で、万引きを覚えながら育つ。</p><p>どちらの子どもも、制度の網から外れた場所にいる。周りの大人が気づかないまま続いていく暮らしを、是枝裕和は裁くのではなく、ただ近くで見つめる。二本を続けて観ると、その視線が変わっていないことに気づく。</p>'
      }
    },

    {
      id: 'seed-shoplifters--apocalypse-now',
      createdAt: '2026-09-15T06:00:00.000Z',
      updatedAt: '2026-09-15T06:00:00.000Z',
      a: W.manbiki,
      b: W.apocalypse,
      context: {
        routeName: 'パルム・ドールの系譜',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'パルム・ドール',
        score: [5, 3, 4, 2],
        headline: 'ジャングルの奥の戦争と、\n東京の片隅の家族。',
        slug: 'shoplifters--apocalypse-now',
        relation: '『地獄の黙示録』（1979）── カンヌ国際映画祭パルム・ドール ── 『万引き家族』（2018）',
        leftStation: '万引き家族',
        rightStation: '地獄の黙示録',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブはカンヌ国際映画祭の最高賞。まったく違う二本が、同じ賞でつながる。</strong></p><p>コッポラの『地獄の黙示録』は1979年のパルム・ドールを受けた（『ブリキの太鼓』と同時受賞）。巨額の予算と長い撮影の末に完成した、戦争の狂気をめぐる大作である。</p><p>39年後の2018年、同じ賞を受けたのは、東京の古い家で肩を寄せ合う家族を描いた『万引き家族』だった。</p><p>国家の戦争と、社会の片隅の暮らし。規模も手法も正反対の二本が同じ賞に選ばれたことは、映画祭が「人間とは何か」を問う作品を選び続けてきたことを物語っている。</p>'
      }
    },

    {
      id: 'seed-daiyame--domaine-tetta',
      createdAt: '2026-09-15T05:50:00.000Z',
      updatedAt: '2026-09-15T05:50:00.000Z',
      a: W.daiyame,
      b: W.tetta,
      context: {
        routeName: '土地の名を背負う酒',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '名前に宿る土地',
        score: [4, 3, 3, 4],
        headline: '晩酌の言葉と、\n村の名前。',
        slug: 'daiyame--domaine-tetta',
        relation: '鹿児島の言葉「だいやめ」── 岡山・哲多の地名',
        leftStation: 'DAIYAME',
        rightStation: 'ドメーヌ・テッタ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>芋焼酎『だいやめ DAIYAME』の名は、一日の疲れを癒やす晩酌を指す鹿児島の言葉から取られている。</p><p>ドメーヌ・テッタの「テッタ」は、ぶどう畑のある岡山県新見市哲多町の名である。</p><p>ひとつは暮らしの言葉から、ひとつは土地の名から。どちらの酒も、名前そのものが生まれた場所を語っている。南九州の蒸留酒と中国山地のワインという遠い二本を、名前が結んでいる。</p>'
      }
    },

    {
      id: 'seed-daiyame--tanqueray-no-ten',
      createdAt: '2026-09-15T05:40:00.000Z',
      updatedAt: '2026-09-15T05:40:00.000Z',
      a: W.daiyame,
      b: W.tanqueray,
      context: {
        routeName: '香りで選ぶ蒸留酒',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '香り',
        score: [4, 3, 3, 4],
        headline: 'ライチのような芋焼酎と、\n生の柑橘のジン。',
        slug: 'daiyame--tanqueray-no-ten',
        relation: '『DAIYAME』── タンカレー No.10',
        leftStation: 'DAIYAME',
        rightStation: 'タンカレー No.10',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『DAIYAME』は、芋焼酎でありながらライチを思わせる華やかな香りで知られる。タンカレー No.10 は、生の柑橘を使って蒸留し、みずみずしい香りを立たせたジンである。</p><p>原料も国も違う二本の蒸留酒は、どちらも「香り」を主役に据えることで、それぞれの酒の常識を少しずらした。食事の前の一杯として、香りから楽しむ酒という点で二本はよく似ている。</p>'
      }
    },

    {
      id: 'seed-gyoza-sakaba-kachidoki--daiyame',
      createdAt: '2026-09-15T05:30:00.000Z',
      updatedAt: '2026-09-15T05:30:00.000Z',
      a: W.gyoza,
      b: W.daiyame,
      context: {
        routeName: '今夜のだいやめ',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '晩酌',
        score: [3, 5, 3, 4],
        headline: '「だいやめ」とは、\nつまり今夜の一杯のこと。',
        slug: 'gyoza-sakaba-kachidoki--daiyame',
        relation: '餃子酒場（勝どき）── 晩酌 ── 『DAIYAME』',
        leftStation: '餃子酒場',
        rightStation: 'DAIYAME',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>「だいやめ」は、仕事の疲れを癒やす晩酌を表す鹿児島の言葉である。焼き餃子と酒の店は、まさにその「だいやめ」の場所と言える。</p><p>ひとつは瓶の名前に、ひとつは町の店に。一日の終わりを労うという同じ時間が、違うかたちで残っている。</p>'
      }
    },

    {
      id: 'seed-kanyoro--gyoza-sakaba-kachidoki',
      createdAt: '2026-09-15T05:20:00.000Z',
      updatedAt: '2026-09-15T05:20:00.000Z',
      a: KANYO,
      b: W.gyoza,
      context: {
        routeName: '東京の中華、百年',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '東京の中華',
        score: [3, 4, 4, 3],
        headline: '明治の中華料理店から、\n駅前の餃子酒場まで。',
        slug: 'kanyoro--gyoza-sakaba-kachidoki',
        relation: '中国名菜『漢陽楼』（明治四十四年創業）── 餃子酒場（勝どき）',
        leftStation: '漢陽楼',
        rightStation: '餃子酒場',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>神田の漢陽楼は明治四十四年創業を掲げ、中国からの留学生が集った時代の空気を今に伝える。</p><p>勝どきの駅前には、焼き餃子と酒を気軽に楽しむ店がある。</p><p>留学生の郷愁を支えた中華料理は、百年のあいだに、仕事帰りの一皿として東京の暮らしに溶け込んだ。二つの店を続けて訪ねると、東京の中華の百年を歩くことになる。</p>'
      }
    },

    {
      id: 'seed-lumumba--heart-of-darkness',
      createdAt: '2026-09-15T05:10:00.000Z',
      updatedAt: '2026-09-15T05:10:00.000Z',
      a: W.lumumba,
      b: W.hod,
      context: {
        routeName: 'コンゴという土地',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'コンゴ',
        score: [4, 3, 5, 3],
        headline: '植民地の奥地と、\n独立の叫び。',
        slug: 'lumumba--heart-of-darkness',
        relation: 'コンラッド『闇の奥』（1899）── コンゴ ── 『ルムンバの叫び』',
        leftStation: 'ルムンバの叫び',
        rightStation: '闇の奥',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>ハブはコンゴ。時代を隔てて、同じ土地が二度描かれた。</strong></p><p>コンラッドの『闇の奥』は、象牙を求めて川を遡る船乗りの物語で、ベルギー国王の私領だったコンゴ自由国が舞台とされる。植民地支配の暴力を、欧州の側から見つめた小説である。</p><p>1960年、コンゴは独立し、パトリス・ルムンバが初代首相となった。だが翌年、ルムンバは殺害される。その短い時間を描いたのが『ルムンバの叫び』である。</p><p>奥地へ向かう欧州人の物語と、独立を叫ぶコンゴの人の物語。同じ土地を、反対の側から見た二つの作品が並ぶ。</p>'
      }
    },

    {
      id: 'seed-joseph-conrad--heart-of-darkness',
      createdAt: '2026-09-15T05:00:00.000Z',
      updatedAt: '2026-09-15T05:00:00.000Z',
      a: W.conrad,
      b: W.hod,
      context: {
        routeName: '船乗りが見た川',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者の旅',
        score: [2, 3, 4, 5],
        headline: '作家は自分で、\nコンゴ川を遡っていた。',
        slug: 'joseph-conrad--heart-of-darkness',
        relation: 'ジョセフ・コンラッド ── 1890年のコンゴ行き ── 『闇の奥』',
        leftStation: 'コンラッド',
        rightStation: '闇の奥',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>小説の背後には、作者自身の旅がある。</strong></p><p>船乗りだったコンラッドは1890年、ベルギーの会社に雇われてコンゴに渡り、川を遡る蒸気船に乗った。そこで見たものと、体を壊して帰ってきた経験が、のちの『闇の奥』の土台になった。</p><p>語り手マーロウの旅は、作者の旅と重なりながら、一人の人間が文明の外側で壊れていく姿へと深まっていく。</p>'
      }
    },

    {
      id: 'seed-heart-of-darkness--apocalypse-now',
      createdAt: '2026-09-15T04:50:00.000Z',
      updatedAt: '2026-09-15T04:50:00.000Z',
      a: W.hod,
      b: W.apocalypse,
      context: {
        routeName: '川を遡る物語',
        label: 'CONTEXT',
        kind: '事実',
        hub: '翻案',
        score: [3, 4, 5, 4],
        headline: 'コンゴの川は、\nベトナムの川になった。',
        slug: 'heart-of-darkness--apocalypse-now',
        relation: 'コンラッド『闇の奥』── 翻案 ── コッポラ『地獄の黙示録』',
        leftStation: '闇の奥',
        rightStation: '地獄の黙示録',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>19世紀末の小説が、20世紀の戦争映画に移し替えられた。</strong></p><p>『地獄の黙示録』は、コンラッドの『闇の奥』を下敷きにしている。象牙交易の奥地は、ベトナム戦争のジャングルに置き換えられた。</p><p>川を遡り、奥地で王のように振る舞う男を訪ねるという骨組みはそのままに、クルツはカーツ大佐となった。小説が見つめた文明の闇を、映画は戦争の狂気として描き直している。</p><p>アメリカの小説が黒澤によって日本へ移された『天国と地獄』と同じく、ここでも物語は土地を移りながら、そのたびに新しい時代の問いを引き受けている。</p>'
      }
    },

    {
      id: 'seed-apocalypse-now--francis-ford-coppola',
      createdAt: '2026-09-15T04:40:00.000Z',
      updatedAt: '2026-09-15T04:40:00.000Z',
      a: W.apocalypse,
      b: W.coppola,
      context: {
        routeName: '監督も奥地へ',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [2, 4, 5, 5],
        headline: '映画の撮影そのものが、\n地獄の行軍になった。',
        slug: 'apocalypse-now--francis-ford-coppola',
        relation: 'フランシス・フォード・コッポラ ── 『地獄の黙示録』（1979）',
        leftStation: '地獄の黙示録',
        rightStation: 'コッポラ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>作品の裏に、もう一つの物語がある。</strong></p><p>コッポラはフィリピンで『地獄の黙示録』を撮影した。台風でセットが壊れ、主演のマーティン・シーンが撮影中に心臓発作で倒れ、撮影は予定を大きく超えて続いた。</p><p>その混乱は、妻エレノア・コッポラが現場で撮った映像をもとにしたドキュメンタリー『ハート・オブ・ダークネス／コッポラの黙示録』（1991）に残されている。原題 Hearts of Darkness は、原作『闇の奥』の原題をもじったものである。</p>'
      }
    },

    {
      id: 'seed-francis-ford-coppola--high-and-low',
      createdAt: '2026-09-15T04:30:00.000Z',
      updatedAt: '2026-09-15T04:30:00.000Z',
      a: W.coppola,
      b: HIGHLOW,
      context: {
        routeName: '黒澤明を経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '黒澤明',
        score: [5, 4, 5, 3],
        headline: 'コッポラは、\n黒澤の映画づくりを支えた。',
        slug: 'francis-ford-coppola--high-and-low',
        relation: 'フランシス・フォード・コッポラ ── 黒澤明 ── 『天国と地獄』',
        leftStation: 'コッポラ',
        rightStation: '天国と地獄',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>ハブは黒澤明。</strong></p><p>1970年代、黒澤明は新作の資金集めに苦しんでいた。黒澤を敬愛していたフランシス・フォード・コッポラとジョージ・ルーカスは、『影武者』（1980）の海外版に製作者として名を連ね、20世紀フォックスからの出資を後押しした。</p><p>『天国と地獄』でアメリカの小説を日本に移した黒澤は、今度はアメリカの監督たちに支えられて映画を撮ることになった。のちにスパイク・リーが『天国と地獄』を再解釈したことも含めて、黒澤とアメリカ映画のあいだには、何度も往復する線が引かれている。</p>'
      }
    },

    {
      id: 'seed-adan--tanaka-isson',
      createdAt: '2026-09-15T04:20:00.000Z',
      updatedAt: '2026-09-15T04:20:00.000Z',
      a: W.adan,
      b: W.isson,
      context: {
        routeName: '奄美の海辺',
        label: 'CONTEXT',
        kind: '事実',
        hub: '「アダンの海辺」',
        score: [2, 4, 4, 5],
        headline: '一村は、\nアダンの実を描き続けた。',
        slug: 'adan--tanaka-isson',
        relation: '田中一村 ──「アダンの海辺」── アダン',
        leftStation: 'アダン',
        rightStation: '田中一村',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>奄美の植物が、画家の代表作になった。</strong></p><p>アダンは、奄美や沖縄の海辺に生えるタコノキ科の木で、パイナップルに似た大きな実をつける。</p><p>奄美大島に移り住んだ田中一村は、この木と実を、浜辺の砂や雲とともに描いた。「アダンの海辺」は、一村が「閻魔大王への土産」と呼んだとも伝えられる作品である。</p><p>ありふれた海辺の木が、一人の画家のまなざしによって、奄美という土地そのものの象徴になった。</p>'
      }
    },

    {
      id: 'seed-tazawako--tsurunoyu',
      createdAt: '2026-09-15T04:10:00.000Z',
      updatedAt: '2026-09-15T04:10:00.000Z',
      a: W.tazawako,
      b: W.tsurunoyu,
      context: {
        routeName: '仙北の湖と秘湯',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '秋田県仙北市',
        score: [2, 4, 3, 4],
        headline: '日本一深い湖から、\n山の奥の湯宿へ。',
        slug: 'tazawako--tsurunoyu',
        relation: '田沢湖 ── 秋田県仙北市 ── 乳頭温泉郷「鶴の湯」',
        leftStation: '田沢湖',
        rightStation: '鶴の湯',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブは土地。同じ市の中にある、湖と湯宿。</strong></p><p>田沢湖は水深が日本一の湖で、湖畔には、永遠の美しさを願って龍になったという辰子の伝説が残る。</p><p>その湖から山へ入った先に、乳頭温泉郷がある。なかでも鶴の湯は、茅葺き屋根の長屋が並ぶ、郷でもっとも古いとされる湯宿である。</p><p>深く青い湖と、乳白色の湯。旅の一日に並べて訪ねられる二つが、ひとつの土地の表と奥を見せる。</p>'
      }
    },

    {
      id: 'seed-iris--tazawako',
      createdAt: '2026-09-15T04:00:00.000Z',
      updatedAt: '2026-09-15T04:00:00.000Z',
      a: W.iris,
      b: W.tazawako,
      context: {
        routeName: 'ロケ地になった湖',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'ロケ地',
        score: [4, 4, 3, 2],
        headline: '韓国ドラマの一場面が、\n秋田の湖畔で撮られた。',
        slug: 'iris--tazawako',
        relation: '韓国ドラマ『アイリス』── ロケ地 ── 田沢湖',
        leftStation: 'アイリス',
        rightStation: '田沢湖',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>ドラマの舞台が、旅の目的地になる。</strong></p><p>イ・ビョンホン主演の韓国ドラマ『アイリス』（2009）は、秋田県で撮影が行われ、田沢湖の湖畔もロケ地となった。</p><p>放送後、ドラマの場面を訪ねて韓国から秋田を訪れる人が増えたと伝えられる。作品が土地へ人を運ぶことは、作品と場所のあいだに区間を引くこのサービスの、分かりやすい例でもある。</p>'
      }
    },

    {
      id: 'seed-tsurunoyu--nakoikan',
      createdAt: '2026-09-15T03:50:00.000Z',
      updatedAt: '2026-09-15T03:50:00.000Z',
      a: W.tsurunoyu,
      b: NAKOI,
      context: {
        routeName: '湯宿と物語',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '古い湯宿',
        score: [4, 4, 4, 4],
        headline: '小説に描かれた湯と、\n山奥に守られた湯。',
        slug: 'tsurunoyu--nakoikan',
        relation: '小天温泉『那古井館』── 古い湯宿 ── 乳頭温泉郷「鶴の湯」',
        leftStation: '鶴の湯',
        rightStation: '那古井館',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>熊本の小天温泉は、漱石の『草枕』に描かれた那古井の温泉場のモデルとされ、宿は小説の地名を名に掲げている。</p><p>秋田の鶴の湯は、茅葺きの長屋と白い湯で、昔ながらの湯治場の姿を今に残している。</p><p>ひとつは物語によって、ひとつは建物と湯そのものによって、古い日本の湯の記憶を受け継いでいる。九州と東北にある二つの湯宿を結ぶのは、「残されてきた時間」である。</p>'
      }
    },

    {
      id: 'seed-pluribus--parasyte',
      createdAt: '2026-09-15T03:40:00.000Z',
      updatedAt: '2026-09-15T03:40:00.000Z',
      a: W.pluribus,
      b: W.kiseiju,
      context: {
        routeName: '内側から入れ替わる人類',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '内側からの侵略',
        score: [5, 4, 5, 3],
        headline: '隣の人が、\n昨日までの人ではない。',
        slug: 'pluribus--parasyte',
        relation: '『寄生獣』（1988）── 『プルリブス』（2025）',
        leftStation: 'プルリブス',
        rightStation: '寄生獣',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『寄生獣』では、人間の頭に入り込んだ生物が、その人になりすまして暮らし始める。見た目は同じでも、中身はもう人ではない。</p><p>『プルリブス』では、人々の心がひとつに溶け合っていく。誰もが穏やかで満ち足りているのに、それに加わらない主人公だけが取り残される。</p><p>外から攻めてくるのではなく、人間の内側から世界が入れ替わっていく恐ろしさ。そして、その変化を拒む一人の視点から「人間であること」を問い直す構図が、三十年以上を隔てた二つの作品に共通している。</p>'
      }
    },

    {
      id: 'seed-pluribus--reacher',
      createdAt: '2026-09-15T03:30:00.000Z',
      updatedAt: '2026-09-15T03:30:00.000Z',
      a: W.pluribus,
      b: W.reacher,
      context: {
        routeName: 'たった一人で',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '孤独な主人公',
        score: [4, 3, 3, 2],
        headline: '誰も味方がいなくても、\n一人で立つ。',
        slug: 'pluribus--reacher',
        relation: '『プルリブス』── 『リーチャー 正義のアウトロー』',
        leftStation: 'プルリブス',
        rightStation: 'リーチャー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『リーチャー』のジャック・リーチャーは、家も持たずに各地を渡り歩き、行く先々で出会った不正に一人で立ち向かう。</p><p>『プルリブス』の主人公は、心がひとつになった世界で、ただ一人それに加わらない。</p><p>ひとつは拳で、ひとつは拒むことで。まったく違う物語が、「大勢の側に入らない一人」を主人公にしている点で並ぶ。どちらも、配信の時代に生まれたシリーズ作品である。</p>'
      }
    },

    {
      id: 'seed-highest-2-lowest--pluribus',
      createdAt: '2026-09-15T03:20:00.000Z',
      updatedAt: '2026-09-15T03:20:00.000Z',
      a: H2L,
      b: W.pluribus,
      context: {
        routeName: '同じ配信の窓',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'Apple TV+',
        score: [3, 2, 2, 2],
        headline: '誘拐劇とSFが、\n同じ画面から届く。',
        slug: 'highest-2-lowest--pluribus',
        relation: '『HIGHEST 2 LOWEST』── Apple TV+ ── 『プルリブス』',
        leftStation: 'HIGHEST 2 LOWEST',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>ハブは配信サービス。</strong></p><p>『HIGHEST 2 LOWEST』は劇場公開ののち Apple TV+ で配信された。『プルリブス』は Apple TV+ のために作られたドラマである。</p><p>作品どうしの内容は遠い。けれども、同じ配信サービスの利用者の画面には、二つが隣り合って並ぶ。作品と作品をつなぐのは、物語だけではなく、それを届ける窓でもある。</p>'
      }
    },

    {
      id: 'seed-blade-runner--blade-runner-2049',
      createdAt: '2026-09-15T03:10:00.000Z',
      updatedAt: '2026-09-15T03:10:00.000Z',
      a: W.br,
      b: W.br2049,
      context: {
        routeName: '三十年後のロサンゼルス',
        label: 'CONTEXT',
        kind: '事実',
        hub: '続編',
        score: [1, 5, 5, 5],
        headline: '2019年の雨の街から、\n2049年の荒野へ。',
        slug: 'blade-runner--blade-runner-2049',
        relation: '『ブレードランナー』（1982）── 『ブレードランナー 2049』（2017）',
        leftStation: 'ブレードランナー',
        rightStation: '2049',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>35年を隔てて作られた続編が、物語の中でも30年後を描いた。</strong></p><p>『ブレードランナー』は、酸性雨の降る2019年のロサンゼルスで、人造人間レプリカントを追う男デッカードを描いた。公開当時は興行的に振るわなかったが、のちに多くの映画に影響を与える作品になった。</p><p>2017年、ドゥニ・ヴィルヌーヴが続編『ブレードランナー 2049』を撮る。前作から30年後の世界で、新たな捜査官Kが、デッカードの残した秘密に近づいていく。ハリソン・フォードは同じ役で再び登場した。</p>'
      }
    },

    {
      id: 'seed-blade-runner-2049--blade-runner-2099',
      createdAt: '2026-09-15T03:00:00.000Z',
      updatedAt: '2026-09-15T03:00:00.000Z',
      a: W.br2049,
      b: W.br2099,
      context: {
        routeName: 'さらに五十年後',
        label: 'CONTEXT',
        kind: '事実',
        hub: '続編',
        score: [1, 4, 3, 5],
        headline: '2049年の先に、\n2099年が続く。',
        slug: 'blade-runner-2049--blade-runner-2099',
        relation: '『ブレードランナー 2049』── 『ブレードランナー 2099』',
        leftStation: '2049',
        rightStation: '2099',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>映画から配信のシリーズへ、時代は半世紀ずつ進む。</strong></p><p>『ブレードランナー 2099』は、『2049』からさらに50年後を舞台にしたドラマ・シリーズとして、2026年11月25日から Prime Video で配信される。リドリー・スコットが製作総指揮に名を連ね、ミシェル・ヨーとハンター・シェイファーが主演する。</p><p>1982年、2017年、そして次の作品へ。同じ世界が、作られる時代ごとの技術と不安を映しながら、少しずつ未来へ引き延ばされていく。</p>'
      }
    },

    {
      id: 'seed-blade-runner--brazil',
      createdAt: '2026-09-15T02:50:00.000Z',
      updatedAt: '2026-09-15T02:50:00.000Z',
      a: W.br,
      b: W.brazil,
      context: {
        routeName: '八〇年代が描いた未来',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '壊れかけた未来',
        score: [3, 4, 4, 4],
        headline: '雨とネオンの未来と、\n書類に埋もれた未来。',
        slug: 'blade-runner--brazil',
        relation: '『ブレードランナー』（1982）── 『未来世紀ブラジル』（1985）',
        leftStation: 'ブレードランナー',
        rightStation: '未来世紀ブラジル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>1982年の『ブレードランナー』は、企業が支配する雨の街を、ネオンと煙の中に描いた。1985年の『未来世紀ブラジル』は、書類と配管と手続きに覆われた管理社会を、悪夢のようなユーモアで描いた。</p><p>どちらも、未来を磨き上げられた世界としてではなく、古いものが積み重なり、壊れかけたまま動き続ける世界として見せた。1980年代の映画が想像したこの「汚れた未来」の景色は、その後の映画やアニメの未来像に大きな影響を与えている。</p>'
      }
    },

    {
      id: 'seed-brazil--johnny-depp',
      createdAt: '2026-09-15T02:40:00.000Z',
      updatedAt: '2026-09-15T02:40:00.000Z',
      a: W.brazil,
      b: W.depp,
      context: {
        routeName: 'テリー・ギリアムを経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'テリー・ギリアム',
        score: [4, 3, 4, 3],
        headline: '夢に逃げる役人の監督と、\n夢を演じる俳優。',
        slug: 'brazil--johnny-depp',
        relation: '『未来世紀ブラジル』── テリー・ギリアム ── ジョニー・デップ',
        leftStation: '未来世紀ブラジル',
        rightStation: 'ジョニー・デップ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブは監督テリー・ギリアム。</strong></p><p>『未来世紀ブラジル』を撮ったテリー・ギリアムは、のちにジョニー・デップを主演に『ラスベガスをやっつけろ』（1998）を撮った。デップは、ヒース・レジャーの急逝で未完成になりかけた『Dr.パルナサスの鏡』（2009）でも、ギリアムのために役を引き継いでいる。</p><p>現実から夢や幻覚へと滑り込んでいくギリアムの映画は、奇妙な人物を演じることに長けた俳優を必要としてきた。二人の仕事は、その相性の良さを物語っている。</p>'
      }
    },

    {
      id: 'seed-johnny-depp--minamata',
      createdAt: '2026-09-15T02:30:00.000Z',
      updatedAt: '2026-09-15T02:30:00.000Z',
      a: W.depp,
      b: W.minamata,
      context: {
        routeName: '写真家を演じる',
        label: 'CONTEXT',
        kind: '事実',
        hub: '主演',
        score: [3, 4, 4, 3],
        headline: '海賊を演じた俳優が、\n水俣の写真家になった。',
        slug: 'johnny-depp--minamata',
        relation: 'ジョニー・デップ ── 主演・製作 ── 『MINAMATA』（2020）',
        leftStation: 'ジョニー・デップ',
        rightStation: 'MINAMATA',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>俳優が、自ら製作にも加わって選んだ役。</strong></p><p>『MINAMATA』でジョニー・デップは、写真家W・ユージン・スミスを演じた。デップは製作にも名を連ねている。</p><p>華やかな役柄で知られる俳優が、仕事を失いかけた晩年の写真家を演じる。熊本の水俣に移り住み、患者と家族の暮らしにカメラを向けたスミスの姿を通して、映画は公害の記憶を世界に向けて語り直した。</p>'
      }
    },

    {
      id: 'seed-w-eugene-smith--minamata',
      createdAt: '2026-09-15T02:20:00.000Z',
      updatedAt: '2026-09-15T02:20:00.000Z',
      a: W.smith,
      b: W.minamata,
      context: {
        routeName: '水俣を撮った人',
        label: 'CONTEXT',
        kind: '事実',
        hub: '水俣',
        score: [2, 5, 5, 5],
        headline: '写真が、\n世界に水俣を伝えた。',
        slug: 'w-eugene-smith--minamata',
        relation: 'W・ユージン・スミス ── 水俣の写真 ── 『MINAMATA』',
        leftStation: 'ユージン・スミス',
        rightStation: 'MINAMATA',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>映画の主人公は、実在の写真家である。</strong></p><p>W・ユージン・スミスは1971年から、妻アイリーン・美緒子・スミスとともに熊本県水俣市に暮らし、水俣病の患者と家族を撮り続けた。その写真は「ライフ」誌などに発表され、写真集『MINAMATA』として世界に知られた。</p><p>映画『MINAMATA』は、その日々を描いている。音楽は坂本龍一が手がけた。写真と映画という二つのかたちで、同じ土地の出来事が語り継がれている。</p>'
      }
    },

    {
      id: 'seed-w-eugene-smith--kono-sekai-no-katasumi-ni',
      createdAt: '2026-09-15T02:10:00.000Z',
      updatedAt: '2026-09-15T02:10:00.000Z',
      a: W.smith,
      b: W.konosekai,
      context: {
        routeName: '1945年の空',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '1945年',
        score: [5, 4, 4, 3],
        headline: '同じ年の戦争を、\n前線と台所から見た。',
        slug: 'w-eugene-smith--kono-sekai-no-katasumi-ni',
        relation: 'W・ユージン・スミス（1945年、沖縄戦で負傷）── 『この世界の片隅に』（1945年の呉・広島）',
        leftStation: 'ユージン・スミス',
        rightStation: 'この世界の片隅に',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>従軍写真家だったユージン・スミスは、太平洋戦争の最前線を撮り、1945年の沖縄戦で重傷を負った。戦争の悲惨を伝えようとした経験は、のちの仕事の出発点になった。</p><p>同じ1945年、『この世界の片隅に』のすずは、呉の空襲と広島の原爆のもとで暮らしていた。</p><p>一方は戦場の最前線で、一方は台所と段々畑で。同じ年の戦争を、まったく違う場所から見つめた二つのまなざしが、並べることで互いを照らす。</p>'
      }
    },

    {
      id: 'seed-iwaaki-hitoshi--parasyte',
      createdAt: '2026-09-15T02:00:00.000Z',
      updatedAt: '2026-09-15T02:00:00.000Z',
      a: W.iwaaki,
      b: W.kiseiju,
      context: {
        routeName: '作者と代表作',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '右手に寄生した生き物が、\n人間を問い直す。',
        slug: 'iwaaki-hitoshi--parasyte',
        relation: '岩明均 ── 『寄生獣』（1988–1995）',
        leftStation: '岩明均',
        rightStation: '寄生獣',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>作者の名を知らしめた長編。</strong></p><p>『寄生獣』は1988年から1995年まで連載された。人間を捕食する寄生生物と、それに右手だけを奪われた高校生の共生を通して、人間という種そのものを外側から見つめる物語である。</p><p>淡々とした線と、容赦のない出来事。その落差が生む緊張感は、のちの『ヒストリエ』にも受け継がれている。</p>'
      }
    },

    {
      id: 'seed-iwaaki-hitoshi--historie',
      createdAt: '2026-09-15T01:50:00.000Z',
      updatedAt: '2026-09-15T01:50:00.000Z',
      a: W.iwaaki,
      b: W.historie,
      context: {
        routeName: '古代を描く',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [2, 4, 4, 5],
        headline: '『寄生獣』の作者は、\n古代ギリシャへ向かった。',
        slug: 'iwaaki-hitoshi--historie',
        relation: '岩明均 ── 『ヒストリエ』（2003–）',
        leftStation: '岩明均',
        rightStation: 'ヒストリエ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>SFから歴史へ。舞台は変わっても、人間を見る目は変わらない。</strong></p><p>『ヒストリエ』は2003年に連載が始まった歴史漫画で、のちにアレクサンドロス大王の書記官となるエウメネスの生涯を描く。</p><p>異なる土地と文化のあいだで生きる主人公の、どこにも完全には属さない視点。それは『寄生獣』で、人間と寄生生物のあいだに立った新一の視点とも重なっている。</p>'
      }
    }
  ];

  /* 広告枠の見本。空いている枠には、枠そのものの案内を出す。 */
  window.BC_SEED_ADS = [
    {
      id: 'ad-vacant',
      title: 'この場所に、作品の広告を。',
      sub: '映画・音楽・書籍・イベント ── 広告枠のご案内',
      image: 'img/ad-hands.jpg',
      url: '#/ad',
      active: true
    }
  ];
})();
