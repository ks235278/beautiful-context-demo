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
    slug: 'highest-2-lowest', order: 2, image: 'img/highest.jpg',
    summary: 'スパイク・リーが、黒澤明『天国と地獄』の構造を現代のニューヨークへ移し替えた作品。富、家族、選択の価値が問われる。'
  };
  const HIGHLOW = {
    title: '黒澤明『天国と地獄』', type: '映画', year: '1963', creator: '黒澤明監督',
    slug: 'high-and-low', order: 3, image: 'img/highlow.jpg',
    summary: 'エド・マクベインの小説『King’s Ransom』を原作に、誘拐事件を通じて企業家の倫理と社会の格差を描いた作品。'
  };
  const GOULD = {
    title: 'グレン・グールド', type: '人物', year: '1932', creator: 'カナダのピアニスト',
    slug: 'glenn-gould', order: 5, image: 'img/gould.jpg',
    summary: 'バッハ演奏で知られ、クラシック音楽における「演奏とは何か」という考え方そのものを変えた20世紀を代表するピアニスト。'
  };
  const KUSAMAKURA = {
    title: '夏目漱石『草枕』', type: '書籍', year: '1906', creator: '夏目漱石',
    slug: 'kusamakura', order: 7, image: 'img/kusamakura.jpg',
    summary: '「智に働けば角が立つ。情に棹させば流される。」で始まる、画工が非人情の世界を求めて旅する小説。'
  };
  const KINGS = {
    title: 'エド・マクベイン『キングの身代金』', type: '書籍', year: '1959', creator: 'エド・マクベイン（87分署シリーズ）',
    slug: 'kings-ransom', order: 4, image: 'img/kings-ransom.jpg',
    summary: '架空の街アイソラの87分署を舞台にした警察小説シリーズの一作。原題『King’s Ransom』。靴会社の重役のもとに、身代金を要求する電話がかかってくる。'
  };
  const NAKOI = {
    title: '小天温泉『那古井館』', type: '宿', year: '1868', creator: '熊本・小天温泉',
    slug: 'nakoikan', order: 9, image: 'img/nakoikan.jpg',
    summary: '明治元年創業を掲げる、熊本・小天温泉の宿。'
  };
  const KANYO = {
    title: '中国名菜『漢陽楼』', type: '店', year: '1911', creator: '東京・神田',
    slug: 'kanyoro', order: 10, image: 'img/kanyoro.jpg',
    summary: '明治四十四年創業を掲げる、東京・神田の中国料理店。'
  };
  const ZHOU = {
    title: '周恩来『十九歳の東京日記』', type: '書籍', year: '1918', creator: '周恩来（矢吹晋 監修・鈴木博 訳）',
    slug: 'zhou-tokyo-diary', order: 11, image: 'img/zhou-diary.jpg',
    summary: '日本に留学していた周恩来が、1918年の東京で書いた日記。神保町、早稲田、浅草、上野、日本橋――19歳の青年が見た百年前の東京が記されている。'
  };

  /* 前田先生の「50タイトル」の残り 42 作品。
     絵は img/works。ポスター・表紙は作品紹介のための引用、人物や土地の写真は
     Wikimedia Commons の自由に使えるもの。credit に撮影者と条件を持ち、
     作品ページと「画像の出典」ページに出す。 */
  const W = {
    goldberg: {
      title: 'バッハ『ゴールドベルク変奏曲』', type: '音楽', year: '1741', creator: 'ヨハン・ゼバスティアン・バッハ',
      slug: 'goldberg-variations', order: 6, image: 'img/works/goldberg-variations.jpg',
      credit: 'J・S・バッハ『クラヴィーア練習曲集 第4部』初版の表紙（1741）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Goldberg-titlepage.png',
      summary: 'アリアと30の変奏からなる鍵盤作品。1741年ごろに出版された。グレン・グールドの1955年の録音によって、20世紀に広く聴かれる曲になった。'
    },
    soseki: {
      title: '夏目漱石', type: '人物', year: '1867', creator: '小説家（1867–1916）',
      slug: 'natsume-soseki', order: 8, image: 'img/works/natsume-soseki.jpg',
      credit: '撮影 小川一眞／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Natsume_Soseki_photo.jpg',
      summary: '『吾輩は猫である』『坊っちゃん』『草枕』『こころ』の作家。熊本の第五高等学校で教えたのち、1900年から英国に留学した。'
    },
    zhou: {
      title: '周恩来', type: '人物', year: '1898', creator: '中華人民共和国 初代国務院総理（1898–1976）',
      slug: 'zhou-enlai', order: 12, image: 'img/works/zhou-enlai.jpg',
      credit: 'White House Photo Office（1972）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Zhou_Enlai_1972.jpg',
      summary: '1917年から1919年まで日本に留学し、帰国後は革命運動に加わった。1949年から亡くなるまで国務院総理を務めた。'
    },
    kotringo: {
      title: 'コトリンゴ', type: '音楽', year: '', creator: 'シンガーソングライター・作曲家',
      slug: 'kotringo', order: 13, image: 'img/works/kotringo.jpg',
      credit: '撮影 CCPE Rosario／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Kotringo_2.jpg',
      summary: 'ピアノと歌のシンガーソングライター。アニメーション映画『この世界の片隅に』の音楽を手がけ、「悲しくてやりきれない」を歌った。'
    },
    kanashikute: {
      title: '「悲しくてやりきれない」', type: '音楽', year: '1968', creator: 'ザ・フォーク・クルセダーズ（作詞 サトウハチロー／作曲 加藤和彦）',
      slug: 'kanashikute-yarikirenai', order: 14, image: 'img/works/kanashikute-yarikirenai.jpg',
      credit: 'ザ・フォーク・クルセダーズ『紀元弐阡年』（1968）ジャケット／© 権利者／出典 Apple Music',
      creditUrl: 'https://music.apple.com/jp/song/795007085',
      summary: '1968年に発表されたザ・フォーク・クルセダーズの歌。多くの歌い手にうたい継がれてきた。'
    },
    konosekai: {
      title: '『この世界の片隅に』', type: '映画', year: '2016', creator: '片渕須直監督（原作 こうの史代）',
      slug: 'kono-sekai-no-katasumi-ni', order: 15, image: 'img/works/kono-sekai-no-katasumi-ni.jpg',
      credit: '© 2019 こうの史代・コアミックス／「この世界の片隅に」製作委員会／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/82278/',
      summary: '戦時中の広島と呉を舞台に、絵を描くことが好きな主人公すずの暮らしを描いたアニメーション映画。原作はこうの史代の漫画。'
    },
    kure: {
      title: '広島県呉市', type: '場所', year: '', creator: '広島県',
      slug: 'kure', order: 16, image: 'img/works/kure.jpg',
      credit: '呉港（撮影 Evelyn-rose）／CC0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Port-of-Kure-3.jpg',
      summary: '瀬戸内海に面した港町。明治期に海軍の鎮守府が置かれ、戦艦大和が建造された海軍工廠の町として知られる。'
    },
    torikawa: {
      title: '鳥皮みそ煮', type: '料理', year: '', creator: '広島県呉市の名物',
      slug: 'torikawa-misoni', order: 17, image: 'img/works/torikawa-misoni.jpg',
      credit: '缶詰を器に盛ったもの／© よしの味噌／出典 よしの味噌',
      creditUrl: 'https://www.yoshinomiso.com/products.php?product_number=R-30',
      summary: '広島県呉市の名物料理。鶏の皮をこんにゃくと一緒に味噌で煮込んだ一皿で、呉の居酒屋では「みそだき」とも呼ばれる。'
    },
    lookback: {
      title: '藤本タツキ『ルックバック』', type: '漫画', year: '2021', creator: '藤本タツキ',
      slug: 'look-back', order: 18, image: 'img/works/look-back.jpg',
      credit: '© 藤本タツキ／集英社（単行本の表紙）／出典 集英社',
      creditUrl: 'https://www.shueisha.co.jp/books/items/contents.html?isbn=978-4-08-882782-7',
      summary: '漫画を描くことに打ち込む二人の少女を描いた読み切り。2021年に少年ジャンプ＋で公開され、2024年にアニメーション映画になった。'
    },
    fujimoto: {
      title: '藤本タツキ', type: '人物', year: '', creator: '漫画家',
      slug: 'fujimoto-tatsuki', order: 19, image: 'img/works/fujimoto-tatsuki.jpg',
      credit: '『藤本タツキ短編集 17-21』の表紙／© 藤本タツキ／集英社／出典 集英社',
      creditUrl: 'https://www.shueisha.co.jp/books/items/contents.html?isbn=978-4-08-882803-9',
      summary: '『チェンソーマン』『ルックバック』『ファイアパンチ』の漫画家。'
    },
    csm: {
      title: '藤本タツキ『チェンソーマン』', type: '漫画', year: '2018', creator: '藤本タツキ',
      slug: 'chainsaw-man', order: 20, image: 'img/works/chainsaw-man.jpg',
      credit: '© 藤本タツキ／集英社（第1巻の表紙）／出典 集英社',
      creditUrl: 'https://www.shueisha.co.jp/books/items/contents.html?isbn=978-4-08-881780-4',
      summary: '悪魔のポチタと一体になり、チェンソーの悪魔の力を得た少年デンジの物語。2018年に週刊少年ジャンプで連載が始まった。'
    },
    koreeda: {
      title: '是枝裕和', type: '人物', year: '1962', creator: '映画監督',
      slug: 'koreeda-hirokazu', order: 21, image: 'img/works/koreeda-hirokazu.jpg',
      credit: '撮影 Kevin Paul／CC BY 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Hirokazu_Kore-eda_-_The_Egyptian_Theatre.jpg',
      summary: 'テレビのドキュメンタリー演出から映画監督になった。『誰も知らない』『万引き家族』『海街diary』などを撮っている。'
    },
    daremo: {
      title: '是枝裕和『誰も知らない』', type: '映画', year: '2004', creator: '是枝裕和監督',
      slug: 'nobody-knows', order: 22, image: 'img/works/nobody-knows.jpg',
      credit: '© 2004「誰も知らない」製作委員会／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/1568/',
      summary: '母親に置き去りにされた四人のきょうだいの暮らしを描いた映画。長男を演じた柳楽優弥がカンヌ国際映画祭で最優秀男優賞を受けた。'
    },
    manbiki: {
      title: '是枝裕和『万引き家族』', type: '映画', year: '2018', creator: '是枝裕和監督',
      slug: 'shoplifters', order: 23, image: 'img/works/shoplifters.jpg',
      credit: '© 2018 フジテレビジョン ギャガ AOI Pro.／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/88449/',
      summary: '万引きで暮らしを補う一家と、彼らに拾われた少女を描いた映画。2018年のカンヌ国際映画祭でパルム・ドールを受けた。'
    },
    daiyame: {
      title: '芋焼酎『だいやめ DAIYAME』', type: '酒', year: '', creator: '濵田酒造（鹿児島）',
      slug: 'daiyame', order: 24, image: 'img/works/daiyame.jpg',
      credit: '© 濵田酒造／出典 濵田酒造「だいやめ」特設サイト',
      creditUrl: 'https://www.hamadasyuzou.co.jp/daiyame_brand/',
      summary: '鹿児島の芋焼酎。ライチを思わせる香りで知られる。名前は、一日の疲れを癒やす晩酌を表す鹿児島の言葉から。'
    },
    mehldau: {
      title: 'ブラッド・メルドー', type: '音楽', year: '1970', creator: 'ジャズ・ピアニスト',
      slug: 'brad-mehldau', order: 25, image: 'img/works/brad-mehldau.jpg',
      credit: '撮影 Harald Krichel／CC BY 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Brad_Mehldau-9035.jpg',
      summary: 'アメリカのジャズ・ピアニスト。ピアノ・トリオでの演奏のほか、バッハやロックの曲を独自に解釈した録音でも知られる。'
    },
    gyoza: {
      title: '餃子酒場（勝どき店）', type: '店', year: '', creator: '東京・勝どき',
      slug: 'gyoza-sakaba-kachidoki', order: 26, image: 'img/works/gyoza-sakaba-kachidoki.jpg',
      credit: '羽根つき焼き餃子（撮影 Austin Keys）／CC BY-SA 2.0／Wikimedia Commons　※店舗の写真ではありません',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Hane-tsuki_Yaki-gyoza_(%E6%AD%93%E8%BF%8E)_(2392524364).jpg',
      summary: '勝どき駅前の、焼き餃子と酒の店。'
    },
    tetta: {
      title: 'ドメーヌ・テッタ', type: 'ワイナリー', year: '', creator: '岡山県新見市',
      slug: 'domaine-tetta', order: 27, image: 'img/works/domaine-tetta.jpg',
      credit: '出典 にいみ公式観光ホームページ（新見市）',
      creditUrl: 'https://www.city.niimi.okayama.jp/kanko/spot/spot_detail/index/201.html',
      summary: '岡山県新見市哲多町でぶどうを育て、ワインを造るワイナリー。名前は土地の名から。'
    },
    lumumba: {
      title: 'ラウル・ペック『ルムンバの叫び』', type: '映画', year: '2000', creator: 'ラウル・ペック監督',
      slug: 'lumumba', order: 28, image: 'img/works/lumumba.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/51466/',
      summary: 'コンゴ独立の指導者パトリス・ルムンバの、首相就任から殺害までを描いた映画。'
    },
    conrad: {
      title: 'ジョセフ・コンラッド', type: '人物', year: '1857', creator: '小説家（1857–1924）',
      slug: 'joseph-conrad', order: 29, image: 'img/works/joseph-conrad.jpg',
      credit: '撮影 George Charles Beresford／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Joseph_Conrad-remastered_to_black_and_white.png',
      summary: 'ポーランド生まれの英国の小説家。船乗りとして世界の海を渡ったのち、英語で『闇の奥』『ロード・ジム』などを書いた。'
    },
    hod: {
      title: 'ジョセフ・コンラッド『闇の奥』', type: '書籍', year: '1899', creator: 'ジョセフ・コンラッド',
      slug: 'heart-of-darkness', order: 30, image: 'img/works/heart-of-darkness.jpg',
      credit: '初出の「ブラックウッズ・マガジン」1899年2月号／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Blackwood%27s_Magazine_-_1899_cover.jpg',
      summary: '象牙交易の奥地へ向かう船乗りマーロウが、消息を絶った交易所の責任者クルツを探す物語。当時のコンゴ自由国が舞台とされる。'
    },
    apocalypse: {
      title: 'コッポラ『地獄の黙示録』', type: '映画', year: '1979', creator: 'フランシス・フォード・コッポラ監督',
      slug: 'apocalypse-now', order: 31, image: 'img/works/apocalypse-now.jpg',
      credit: '© 2019 ZOETROPE CORP. ALL RIGHTS RESERVED.／出典 映画.com（ファイナル・カット版）',
      creditUrl: 'https://eiga.com/movie/92262/',
      summary: 'ベトナム戦争のさなか、軍を離れて奥地に王国を築いたカーツ大佐の暗殺を命じられた大尉の旅。1979年のカンヌ国際映画祭でパルム・ドールを受けた。'
    },
    coppola: {
      title: 'フランシス・フォード・コッポラ', type: '人物', year: '1939', creator: '映画監督',
      slug: 'francis-ford-coppola', order: 32, image: 'img/works/francis-ford-coppola.jpg',
      credit: '撮影 Colleen Sturtevant／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Lena_Herzog_Francis_Ford_Coppola_Wernder_Herzog_Venice_Film_Festival_(cropped).jpg',
      summary: '『ゴッドファーザー』『地獄の黙示録』の映画監督。'
    },
    adan: {
      title: 'アダン', type: '植物', year: '', creator: '奄美・沖縄の海辺の木',
      slug: 'adan', order: 33, image: 'img/works/adan.jpg',
      credit: '撮影 Anonymous Powered／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Pandanus_odoratissimus.jpg',
      summary: '奄美や沖縄の海辺に生えるタコノキ科の木。パイナップルに似た実をつける。田中一村が「アダンの海辺」に描いた。'
    },
    isson: {
      title: '田中一村', type: '人物', year: '1908', creator: '日本画家（1908–1977）',
      slug: 'tanaka-isson', order: 34, image: 'img/works/tanaka-isson.jpg',
      credit: '奄美市の田中一村終焉の家（撮影 Kireinakokoro）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E5%A5%84%E7%BE%8E%E5%B8%82%E3%81%AE%E7%94%B0%E4%B8%AD%E4%B8%80%E6%9D%91%E3%81%AE%E4%BD%8F%E5%B1%85%E8%B7%A1.jpg',
      summary: '50歳で奄美大島に移り住み、亜熱帯の植物や鳥を描き続けた日本画家。中央の画壇から離れて暮らした。'
    },
    tsurunoyu: {
      title: '乳頭温泉郷「鶴の湯」', type: '宿', year: '', creator: '秋田県仙北市',
      slug: 'tsurunoyu', order: 35, image: 'img/works/tsurunoyu.jpg',
      credit: '撮影 Fumiaki Yoshimatsu／CC BY-SA 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Tsurunoyu_Onsen_03.jpg',
      summary: '秋田県の乳頭温泉郷でもっとも古いとされる湯宿。茅葺き屋根の長屋と白濁の湯で知られる。'
    },
    tazawako: {
      title: '田沢湖', type: '場所', year: '', creator: '秋田県仙北市',
      slug: 'tazawako', order: 36, image: 'img/works/tazawako.jpg',
      credit: '田沢湖と漢槎宮（撮影 掬茶）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Lake_Tazawa_and_Kansa-g%C5%AB_20210213.jpg',
      summary: '秋田県仙北市の湖。水深は日本一で、湖畔には辰子の伝説が残る。'
    },
    iris: {
      title: '韓国ドラマ『アイリス』', type: 'ドラマ', year: '2009', creator: 'イ・ビョンホン主演',
      slug: 'iris', order: 37, image: 'img/works/iris.jpg',
      credit: '© 2009 TAEWON ENTERTAINMENT.（映画版『アイリス THE LAST』）／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/55869/',
      summary: '韓国の特殊工作員を主人公にしたアクション・ドラマ。秋田県でのロケが行われ、日本でも話題になった。'
    },
    pluribus: {
      title: 'ヴィンス・ギリガン『プルリブス』', type: 'ドラマ', year: '2025', creator: 'ヴィンス・ギリガン',
      slug: 'pluribus', order: 38, image: 'img/works/pluribus.jpg',
      credit: '© Apple／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/show/umc.cmc.37axgovs2yozlyh3c2cmwzlza',
      summary: '『ブレイキング・バッド』のヴィンス・ギリガンが手がけた Apple TV+ のドラマ。人々の心がひとつに溶け合っていく世界で、それに加わらない一人の女性を描く。'
    },
    tanqueray: {
      title: 'タンカレー No.10', type: '酒', year: '', creator: 'ジン（英国）',
      slug: 'tanqueray-no-ten', order: 39, image: 'img/works/tanqueray-no-ten.jpg',
      credit: '右が No. TEN（撮影 Chris Corwin）／CC BY-SA 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Tanqueraybottles.jpg',
      summary: '英国のジン、タンカレーの上位銘柄。生の柑橘を使って蒸留されることで知られる。'
    },
    nurungji: {
      title: 'ヌルンジ（赤坂）', type: '店', year: '', creator: '東京・赤坂の韓国料理店',
      slug: 'nurungji', order: 40, image: 'img/works/nurungji.jpg',
      credit: '店名の由来の「ヌルンジ」（おこげ）（撮影 Hyeon-Jeong Suk）／CC BY 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Nurungji.jpg',
      summary: '東京・赤坂の韓国料理店。店名の「ヌルンジ」は韓国語で、釜の底にできるおこげのこと。'
    },
    reacher: {
      title: '『リーチャー 正義のアウトロー』', type: 'ドラマ', year: '2022', creator: 'リー・チャイルド原作',
      slug: 'reacher', order: 41, image: 'img/works/reacher.jpg',
      credit: '© Amazon／出典 Prime Video',
      creditUrl: 'https://www.primevideo.com/-/ja/detail/0RTZ57DQ6PBHH29UN5JS7U7CW4',
      summary: 'リー・チャイルドの小説シリーズを原作にしたドラマ。元軍人のジャック・リーチャーが、ひとりで各地の事件に立ち向かう。'
    },
    br: {
      title: 'リドリー・スコット『ブレードランナー』', type: '映画', year: '1982', creator: 'リドリー・スコット監督',
      slug: 'blade-runner', order: 42, image: 'img/works/blade-runner.jpg',
      credit: '写真：Album／アフロ／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/26947/',
      summary: 'フィリップ・K・ディックの小説『アンドロイドは電気羊の夢を見るか？』を原作に、2019年のロサンゼルスで人造人間を追う男を描いた映画。'
    },
    br2049: {
      title: 'ヴィルヌーヴ『ブレードランナー 2049』', type: '映画', year: '2017', creator: 'ドゥニ・ヴィルヌーヴ監督',
      slug: 'blade-runner-2049', order: 43, image: 'img/works/blade-runner-2049.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/85393/',
      summary: '前作から30年後の2049年を舞台にした続編。'
    },
    br2099: {
      title: '『ブレードランナー 2099』', type: 'ドラマ', year: '', creator: 'リドリー・スコット製作総指揮',
      slug: 'blade-runner-2099', order: 44, image: 'img/works/blade-runner-2099.jpg',
      credit: '© Amazon／出典 Prime Video',
      creditUrl: 'https://www.primevideo.com/-/ja/detail/0LB7N1ZYZ2AFOEXO5IJ1YUWQVF',
      summary: '2049年からさらに50年後を舞台にしたドラマ・シリーズ。ミシェル・ヨーとハンター・シェイファーが主演し、2026年11月25日から Prime Video で配信される。'
    },
    brazil: {
      title: 'テリー・ギリアム『未来世紀ブラジル』', type: '映画', year: '1985', creator: 'テリー・ギリアム監督',
      slug: 'brazil', order: 52, image: 'img/works/brazil.jpg',
      credit: '© 20th Century Studios／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/movie/umc.cmc.25tn9231aa7mzrvk4y5ssijqj',
      summary: '書類と管理に覆われた近未来の社会で、夢に逃げ込む役人を描いた映画。'
    },
    depp: {
      title: 'ジョニー・デップ', type: '人物', year: '1963', creator: '俳優',
      slug: 'johnny-depp', order: 46, image: 'img/works/johnny-depp.jpg',
      credit: '撮影 Harald Krichel／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Johnny_Depp_2020.jpg',
      summary: 'アメリカの俳優。ティム・バートンやテリー・ギリアムの作品に数多く出演し、『MINAMATA』では主演とともに製作にも加わった。'
    },
    minamata: {
      title: '『MINAMATA』', type: '映画', year: '2020', creator: 'アンドリュー・レヴィタス監督',
      slug: 'minamata', order: 47, image: 'img/works/minamata.jpg',
      credit: '© 2020 MINAMATA FILM, LLC © Larry Horricks／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/94900/',
      summary: '水俣病を世界に伝えた写真家W・ユージン・スミスと、アイリーン・美緒子・スミスの水俣での日々を描いた映画。音楽は坂本龍一。'
    },
    smith: {
      title: 'W・ユージン・スミス', type: '人物', year: '1918', creator: '写真家（1918–1978）',
      slug: 'w-eugene-smith', order: 48, image: 'img/works/w-eugene-smith.jpg',
      credit: 'ユージン・スミスとアイリーン（1974、撮影 Consuelo Kanaga）／ブルックリン美術館・No known restrictions／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Consuelo_Kanaga_(American,_1894-1978)._W._Eugene_Smith_and_Aileen,_1974_(borderless).jpg',
      summary: 'アメリカの写真家。「ライフ」誌のフォトエッセイで知られ、1970年代には熊本県水俣に移り住んで水俣病を撮った。'
    },
    historie: {
      title: '岩明均『ヒストリエ』', type: '漫画', year: '2003', creator: '岩明均',
      slug: 'historie', order: 49, image: 'img/works/historie.jpg',
      credit: '© 岩明均／講談社（第1巻の表紙）／出典 講談社',
      creditUrl: 'https://www.kodansha.co.jp/comic/products/0000030267',
      summary: 'アレクサンドロス大王の書記官エウメネスの生涯を描く歴史漫画。'
    },
    kiseiju: {
      title: '岩明均『寄生獣』', type: '漫画', year: '1988', creator: '岩明均',
      slug: 'parasyte', order: 50, image: 'img/works/parasyte.jpg',
      credit: '© 岩明均／講談社（第1巻の表紙）／出典 講談社',
      creditUrl: 'https://www.kodansha.co.jp/comic/products/0000029944',
      summary: '人間に寄生する生物が現れた世界で、右手に寄生された高校生・泉新一と「ミギー」の共生を描いた漫画。'
    },
    iwaaki: {
      title: '岩明均', type: '人物', year: '1960', creator: '漫画家',
      slug: 'iwaaki-hitoshi', order: 51, image: 'img/works/iwaaki-hitoshi.jpg',
      credit: '岩明均の短編集『新装版 骨の音』の表紙／© 岩明均／講談社／出典 講談社',
      creditUrl: 'https://www.kodansha.co.jp/comic/products/0000032031',
      summary: '『寄生獣』『ヒストリエ』の漫画家。'
    },

    /* ---- 100 タイトル版で増えた 49 作品（先生の一覧の 45・53〜100） ---- */
    androids: {
      title: 'フィリップ・K・ディック『アンドロイドは電気羊の夢を見るか？』', type: '書籍', year: '1968', creator: 'フィリップ・K・ディック',
      slug: 'do-androids-dream', order: 45, image: 'img/works/do-androids-dream.jpg',
      credit: 'ハヤカワ文庫SF の表紙／© 早川書房／出典 早川書房',
      creditUrl: 'https://www.hayakawa-online.co.jp/shop/g/g0000010229/',
      summary: '核戦争のあとの地球で、火星から逃げてきたアンドロイドを追う賞金稼ぎリック・デッカードの物語。映画『ブレードランナー』の原作。'
    },
    zero: {
      title: 'テリー・ギリアム『ゼロの未来』', type: '映画', year: '2013', creator: 'テリー・ギリアム監督',
      slug: 'the-zero-theorem', order: 53, image: 'img/works/the-zero-theorem.jpg',
      credit: '場面写真／© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/81428/',
      summary: '巨大企業の管理のもとで、「ゼロの定理」の証明に取り組まされる孤独なプログラマーを描いた映画。主演はクリストフ・ヴァルツ。'
    },
    gilliam: {
      title: 'テリー・ギリアム', type: '人物', year: '1940', creator: '映画監督・モンティ・パイソン',
      slug: 'terry-gilliam', order: 54, image: 'img/works/terry-gilliam.jpg',
      credit: '撮影 Towpilot／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Terry_Gilliam_01.jpg',
      summary: 'アメリカ生まれで、英国を拠点にする映画監督。モンティ・パイソンのアニメーションを手がけ、『未来世紀ブラジル』『12モンキーズ』『ゼロの未来』を撮った。'
    },
    foundation: {
      title: 'アイザック・アシモフ『ファウンデーション』', type: '書籍', year: '1951', creator: 'アイザック・アシモフ',
      slug: 'foundation', order: 55, image: 'img/works/foundation.jpg',
      credit: 'Apple TV+ のドラマ版／© Apple／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/show/umc.cmc.5983fipzqbicvrve6jdfep4x3',
      summary: '銀河帝国の崩壊を「心理歴史学」で予見した数学者ハリ・セルダンが、来るべき暗黒時代を短くするための計画を立てる。2021年から Apple TV+ でドラマになった。'
    },
    asimov: {
      title: 'アイザック・アシモフ', type: '人物', year: '1920', creator: 'SF作家・生化学者（1920–1992）',
      slug: 'isaac-asimov', order: 56, image: 'img/works/isaac-asimov.jpg',
      credit: '撮影 Phillip Leonian（New York World-Telegram & Sun）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Isaac.Asimov01.jpg',
      summary: '『われはロボット』『ファウンデーション』のSF作家。ロボットが守るべき「ロボット工学三原則」を考えた。'
    },
    youssou: {
      title: 'ユッスー・ンドゥール', type: '人物', year: '1959', creator: 'セネガルの歌手',
      slug: 'youssou-ndour', order: 57, image: 'img/works/youssou-ndour.jpg',
      credit: '撮影 Marc Ras／CC BY 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Youssou_N%27Dour.jpg',
      summary: 'セネガルの歌手。ンバラと呼ばれる音楽を世界に広めた。ピーター・ガブリエルとの共演でも知られる。'
    },
    gabriel: {
      title: 'ピーター・ガブリエル', type: '人物', year: '1950', creator: '英国のミュージシャン',
      slug: 'peter-gabriel', order: 58, image: 'img/works/peter-gabriel.jpg',
      credit: '撮影 Joi／CC BY 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Peter_Gabriel_(3)_(cropped).jpg',
      summary: 'ジェネシスのボーカルを経てソロへ。「スレッジハンマー」のほか、世界の音楽を紹介するレーベル「リアル・ワールド」と音楽祭 WOMAD を立ち上げた。'
    },
    bowie: {
      title: 'デヴィッド・ボウイ', type: '人物', year: '1947', creator: '英国のミュージシャン・俳優（1947–2016）',
      slug: 'david-bowie', order: 59, image: 'img/works/david-bowie.jpg',
      credit: 'RCA Records の宣材写真（1979）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:David_Bowie_Lodger_(1979_RCA_publicity_photo_01).jpg',
      summary: '「スペイス・オディティ」「ヒーローズ」の音楽家。俳優としても、大島渚監督『戦場のメリークリスマス』でセリアズ少佐を演じた。'
    },
    maddrive: {
      title: '映画『マッド・ドライヴ』（原題 Kill Your Friends）', type: '映画', year: '2015', creator: 'オーウェン・ハリス監督（原作 ジョン・ニーヴン）',
      slug: 'kill-your-friends', order: 60, image: 'img/works/kill-your-friends.jpg',
      credit: '© 権利者／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/movie/umc.cmc.5g3ynshjb0wd3oa3qrcktp7t9',
      summary: '1990年代、ブリットポップ全盛の英国の音楽業界で、成り上がるために道を踏み外していくレコード会社の男を描いたブラックコメディ。主演はニコラス・ホルト。'
    },
    sundemo: {
      title: 'フリーダ・サンデモ', type: '音楽', year: '', creator: 'スウェーデンのシンガーソングライター',
      slug: 'frida-sundemo', order: 61, image: 'img/works/frida-sundemo.jpg',
      credit: 'アルバム『Flashbacks & Futures』（2017）のジャケット／© 権利者／出典 Apple Music',
      creditUrl: 'https://music.apple.com/us/album/flashbacks-futures/1273236455',
      summary: 'スウェーデンのシンガーソングライター。80年代のシンセポップを思わせる、透きとおった音と声で知られる。'
    },
    kishimi: {
      title: '鷲田清一『時代のきしみ——〈わたし〉と国家のあいだ』', type: '書籍', year: '2002', creator: '鷲田清一',
      slug: 'jidai-no-kishimi', order: 62, image: 'img/works/jidai-no-kishimi.jpg',
      credit: '表紙／© 鷲田清一／出典 版元ドットコム',
      creditUrl: 'https://www.hanmoto.com/bd/isbn/9784484022055',
      summary: '法律や制度、習俗や縁といった「生の背景」が、個人の存在をどう編み上げているのかを考える哲学エッセイ集。'
    },
    washida: {
      title: '鷲田清一', type: '人物', year: '1949', creator: '哲学者',
      slug: 'washida-kiyokazu', order: 63, image: 'img/works/washida-kiyokazu.jpg',
      credit: '著書『モードの迷宮』（ちくま学芸文庫）の表紙／© 筑摩書房／出典 版元ドットコム',
      creditUrl: 'https://www.hanmoto.com/bd/isbn/9784480082442',
      summary: '京都生まれの哲学者。大阪大学総長をつとめた。『モードの迷宮』『「聴く」ことの力』など、ファッションや身体、ケアを哲学の主題にしてきた。'
    },
    interstellar: {
      title: 'クリストファー・ノーラン『インターステラー』', type: '映画', year: '2014', creator: 'クリストファー・ノーラン監督',
      slug: 'interstellar', order: 64, image: 'img/works/interstellar.jpg',
      credit: '© 2014 Warner Bros. Entertainment, Inc. and Paramount Pictures.／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/78321/',
      summary: '砂嵐と作物の枯死に追い詰められた近未来の地球から、人類の移住先を探して宇宙へ向かう元宇宙飛行士と、地球に残された娘の物語。'
    },
    nolan: {
      title: 'クリストファー・ノーラン', type: '人物', year: '1970', creator: '映画監督',
      slug: 'christopher-nolan', order: 65, image: 'img/works/christopher-nolan.jpg',
      credit: '撮影 Richard Goldschmidt／CC BY 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Christopher_Nolan,_London,_2013.jpg',
      summary: 'ロンドン生まれの映画監督。『ダークナイト』『インセプション』『インターステラー』『ダンケルク』『オッペンハイマー』。'
    },
    grapes: {
      title: 'ジョン・スタインベック『怒りの葡萄』', type: '書籍', year: '1939', creator: 'ジョン・スタインベック',
      slug: 'the-grapes-of-wrath', order: 66, image: 'img/works/the-grapes-of-wrath.jpg',
      credit: 'ドロシア・ラング「移民の母」（1936）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Lange-MigrantMother02.jpg',
      summary: '砂嵐に土地を奪われたオクラホマの農民ジョード一家が、仕事を求めてカリフォルニアへ向かう。ピューリッツァー賞を受けた。'
    },
    wotw: {
      title: 'H・G・ウェルズ『宇宙戦争』', type: '書籍', year: '1898', creator: 'H・G・ウェルズ',
      slug: 'the-war-of-the-worlds', order: 67, image: 'img/works/the-war-of-the-worlds.jpg',
      credit: 'アルヴィム・コヘアの挿絵版（1906）のポスター／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:The_War_of_the_Worlds_-_poster_by_Henrique_Alvim_Corr%C3%AAa,_original_graphic.jpg',
      summary: '火星人がロンドン近郊に降り立ち、当時世界最強だった英国の文明をたちまち圧倒する。侵略SFの古典。'
    },
    wotwfilm: {
      title: 'スピルバーグ『宇宙戦争』', type: '映画', year: '2005', creator: 'スティーヴン・スピルバーグ監督',
      slug: 'war-of-the-worlds-2005', order: 68, image: 'img/works/war-of-the-worlds-2005.jpg',
      credit: 'TM & © 2005 DreamWorks L.L.C. © 2005 Paramount Pictures.／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/1217/',
      summary: 'ウェルズの小説を現代のアメリカに移し、別れた妻のもとで暮らす子どもたちを連れて逃げる父親をトム・クルーズが演じた。'
    },
    bb: {
      title: 'ドラマ『ブレイキング・バッド』', type: 'ドラマ', year: '2008', creator: 'ヴィンス・ギリガン',
      slug: 'breaking-bad', order: 69, image: 'img/works/breaking-bad.jpg',
      credit: '© 権利者／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/show/umc.cmc.1v90fu25sgywa1e14jwnrt9uc',
      summary: '余命を告げられた高校の化学教師ウォルター・ホワイトが、家族のために麻薬の製造に手を染め、やがて裏社会の大物になっていく。'
    },
    bcs: {
      title: 'ドラマ『ベター・コール・ソウル』', type: 'ドラマ', year: '2015', creator: 'ヴィンス・ギリガン／ピーター・グールド',
      slug: 'better-call-saul', order: 70, image: 'img/works/better-call-saul.jpg',
      credit: '© 権利者／出典 Apple TV',
      creditUrl: 'https://tv.apple.com/jp/show/umc.cmc.z783dda5nkr23g1jj2kn8x22',
      summary: '『ブレイキング・バッド』の悪徳弁護士ソウル・グッドマンが、まだジミー・マッギルという名だった頃からを描くスピンオフ。'
    },
    hommeless: {
      title: '映画『ホームレス ニューヨークと寝た男』', type: '映画', year: '2014', creator: 'トーマス・ヴィルテンゾーン監督',
      slug: 'homme-less', order: 71, image: 'img/works/homme-less.jpg',
      credit: '© 2014 Schatzi Productions/Filmhaus Films.／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/85785/',
      summary: 'ファッション写真家で元モデルのマーク・レイは、マンハッタンのアパートの屋上で寝袋にくるまって暮らしていた。その日々を追ったドキュメンタリー。'
    },
    happy: {
      title: 'ファレル・ウィリアムス「HAPPY」', type: '音楽', year: '2013', creator: 'ファレル・ウィリアムス',
      slug: 'happy-pharrell', order: 72, image: 'img/works/happy-pharrell.jpg',
      credit: '「HAPPY」を収めたアルバム『G I R L』（2014）のジャケット／© 権利者／出典 Apple Music',
      creditUrl: 'https://music.apple.com/jp/album/g-i-r-l/863835302',
      summary: '映画『怪盗グルーのミニオン危機一発』のために書かれた曲。24時間ぶんのミュージックビデオが作られ、世界中で人々が踊る映像が生まれた。'
    },
    tengokufilm: {
      title: '大林宣彦『天国にいちばん近い島』', type: '映画', year: '1984', creator: '大林宣彦監督',
      slug: 'tengoku-film', order: 73, image: 'img/works/tengoku-film.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/37981/',
      summary: '亡き父から聞いた「天国にいちばん近い島」を探して、ニューカレドニアへ旅立つ少女の物語。主演は原田知世。'
    },
    tengokubook: {
      title: '森村桂『天国にいちばん近い島』', type: '書籍', year: '1966', creator: '森村桂',
      slug: 'tengoku-book', order: 74, image: 'img/works/tengoku-book.jpg',
      credit: '角川文庫の表紙／© KADOKAWA／出典 BOOK☆WALKER',
      creditUrl: 'https://bookwalker.jp/de60a2f677-3424-46e7-8e98-e744d0acc571/',
      summary: '1964年、貨物船に乗ってひとりニューカレドニアへ渡った著者の旅の記録。ベストセラーになった。'
    },
    rebellion: {
      title: '映画『裏切りの戦場 葬られた誓い』', type: '映画', year: '2011', creator: 'マチュー・カソヴィッツ監督',
      slug: 'rebellion-ordre-et-morale', order: 75, image: 'img/works/rebellion-ordre-et-morale.jpg',
      credit: '場面写真／© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/77285/',
      summary: '1988年、フランス領ニューカレドニアのウベア島で起きた人質事件を、交渉にあたった国家憲兵隊の特殊部隊の隊長の視点から描いた。'
    },
    harada: {
      title: '原田知世', type: '人物', year: '1967', creator: '俳優・歌手',
      slug: 'harada-tomoyo', order: 76, image: 'img/works/harada-tomoyo.jpg',
      credit: 'アルバム『music & me』（2007）のジャケット／© 権利者／出典 Apple Music',
      creditUrl: 'https://music.apple.com/jp/album/music-me/266792664',
      summary: '1983年、大林宣彦監督『時をかける少女』で映画に主演。大林監督の『天国にいちばん近い島』にも主演し、歌手としても活動を続けている。'
    },
    planets: {
      title: 'ホルスト『惑星』', type: '音楽', year: '1918', creator: 'グスターヴ・ホルスト',
      slug: 'the-planets', order: 77, image: 'img/works/the-planets.jpg',
      credit: '作曲者ホルスト（撮影 Herbert Lambert）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Gustav_Holst.jpg',
      summary: '火星・金星・水星・木星・土星・天王星・海王星の七つの楽章からなる管弦楽組曲。「木星」の旋律は、のちに英国の愛国歌「我は汝に誓う、我が祖国よ」になった。'
    },
    n1984: {
      title: 'ジョージ・オーウェル『1984年』', type: '書籍', year: '1949', creator: 'ジョージ・オーウェル',
      slug: 'nineteen-eighty-four', order: 78, image: 'img/works/nineteen-eighty-four.jpg',
      credit: 'ハヤカワepi文庫［新訳版］の表紙／© 早川書房／出典 早川書房',
      creditUrl: 'https://www.hayakawa-online.co.jp/shop/g/g0000310053/',
      summary: '「ビッグ・ブラザー」がすべてを監視する全体主義国家オセアニアで、真理省に勤めるウィンストンが体制に疑いを抱く。'
    },
    elephant: {
      title: 'ジョージ・オーウェル『象を撃つ』', type: '書籍', year: '1936', creator: 'ジョージ・オーウェル',
      slug: 'shooting-an-elephant', order: 79, image: 'img/works/shooting-an-elephant.jpg',
      credit: '著者ジョージ・オーウェル／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:George_Orwell_press_photo.jpg',
      summary: '英領ビルマで警官をしていた若いオーウェルが、暴れた象を、群衆の前で「撃たねばならなくなった」経験を書いたエッセイ。'
    },
    yasuhiko: {
      title: '安彦良和', type: '人物', year: '1947', creator: '漫画家・アニメーター',
      slug: 'yasuhiko-yoshikazu', order: 80, image: 'img/works/yasuhiko-yoshikazu.jpg',
      credit: '撮影 Dick Thomas Johnson from Tokyo, Japan／CC BY 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Yasuhiko_Yoshikazu_%22The_World_of_Gundam%22_at_Opening_Ceremony_of_the_28th_Tokyo_International_Film_Festival_(22442053681)_(cropped).jpg',
      summary: 'テレビアニメ『機動戦士ガンダム』のキャラクターデザインと作画監督をつとめた。漫画家として『虹色のトロツキー』など、歴史を題材にした作品を描く。'
    },
    origin: {
      title: '安彦良和『機動戦士ガンダム THE ORIGIN』', type: '漫画', year: '2001', creator: '安彦良和',
      slug: 'gundam-the-origin', order: 81, image: 'img/works/gundam-the-origin.jpg',
      credit: '第1巻の表紙／© 安彦良和・創通・サンライズ／KADOKAWA／出典 BOOK☆WALKER',
      creditUrl: 'https://bookwalker.jp/dec9dcfab5-7c56-4c1a-8a73-f1e47bc33bbd/',
      summary: 'テレビアニメ『機動戦士ガンダム』の物語を、安彦良和が自らの手で描き直した漫画。シャアとセイラの少年時代も描かれる。'
    },
    trotsky: {
      title: '安彦良和『虹色のトロツキー』', type: '漫画', year: '1990', creator: '安彦良和',
      slug: 'niji-iro-no-trotsky', order: 82, image: 'img/works/niji-iro-no-trotsky.jpg',
      credit: '第1巻の表紙／© 安彦良和／潮出版社／出典 BOOK☆WALKER',
      creditUrl: 'https://bookwalker.jp/de35478e47-5c3d-45e2-87cf-64f6a0a6867d/',
      summary: '1938年の満州。日本人とモンゴル人の血を引く青年ウムボルトが、建国大学に送り込まれ、トロツキーをめぐる謀略に巻き込まれていく。'
    },
    sobagome: {
      title: '徳島県「そば米汁」', type: '料理', year: '', creator: '徳島県・祖谷',
      slug: 'sobagome-jiru', order: 83, image: 'img/works/sobagome-jiru.jpg',
      credit: '同じ祖谷のそば料理「祖谷そば」（撮影 Totti）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Iya_Soba.jpg',
      summary: '塩ゆでして乾かしたそばの実（そば米）を、鶏肉や野菜と煮込む、徳島県祖谷地方の郷土料理。'
    },
    grechka: {
      title: 'ロシア「そばの実（グレチャ）」', type: '料理', year: '', creator: 'ロシア・東欧',
      slug: 'grechka', order: 84, image: 'img/works/grechka.jpg',
      credit: '撮影 KabanDanish／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Buckwheat_porridge_in_medvedkovo.jpg',
      summary: 'ロシアや東欧で日常的に食べられる、そばの実の粥や付け合わせ。ロシア語ではグレーチカと呼ぶ。'
    },
    minakata: {
      title: '南方熊楠', type: '人物', year: '1867', creator: '博物学者（1867–1941）',
      slug: 'minakata-kumagusu', order: 85, image: 'img/works/minakata-kumagusu.jpg',
      credit: 'Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Minakata-Kumagusu.jpg',
      summary: '和歌山生まれの博物学者。粘菌の研究で知られ、若い頃はロンドンの大英博物館に通って学んだ。'
    },
    mandala: {
      title: '南方曼荼羅', type: '思想', year: '1903', creator: '南方熊楠',
      slug: 'minakata-mandala', order: 86, image: 'img/works/minakata-mandala.jpg',
      credit: '南方熊楠が土宜法竜への書簡（1903）に描いた図／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E5%8D%97%E6%96%B9%E3%83%9E%E3%83%B3%E3%83%80%E3%83%A92.jpg',
      summary: '南方熊楠が、世界の出来事が因果と偶然で絡み合うさまを一枚の図に描いたもの。真言宗の僧・土宜法竜への手紙に記された。'
    },
    letters: {
      title: '『南方熊楠 土宜法竜 往復書簡』', type: '書籍', year: '1990', creator: '南方熊楠・土宜法竜',
      slug: 'minakata-toki-letters', order: 87, image: 'img/works/minakata-toki-letters.jpg',
      credit: '南方熊楠の書簡に描かれた図／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E5%8D%97%E6%96%B9%E3%83%9E%E3%83%B3%E3%83%80%E3%83%A91.jpg',
      summary: 'ロンドンで出会った南方熊楠と、真言宗の僧・土宜法竜が交わした手紙をまとめたもの。二人は仏教と科学をめぐって長い議論を交わした。'
    },
    gibson: {
      title: 'ジェームズ・J・ギブソン', type: '人物', year: '1904', creator: '知覚心理学者（1904–1979）',
      slug: 'james-j-gibson', order: 88, image: 'img/works/james-j-gibson.jpg',
      credit: '訳書『生態学的知覚システム』（東京大学出版会）の表紙／© 東京大学出版会／出典 版元ドットコム',
      creditUrl: 'https://www.hanmoto.com/bd/isbn/9784130111300',
      summary: 'アメリカの知覚心理学者。環境が動物に差し出す行為の可能性を「アフォーダンス」と名づけた。'
    },
    affordance: {
      title: 'アフォーダンス', type: '思想', year: '1979', creator: 'ジェームズ・J・ギブソン',
      slug: 'affordance', order: 89, image: 'img/works/affordance.jpg',
      credit: '「おす」の貼り紙があるドア（撮影 Ishikawa Ken）／CC BY-SA 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E3%81%8A%E3%81%99_(3971189153).jpg',
      summary: '環境が動物に与える、行為の可能性。椅子は「座る」ことを、取っ手は「つかむ」ことをアフォードする。ギブソンの造語。'
    },
    egan: {
      title: 'グレッグ・イーガン', type: '人物', year: '1961', creator: 'SF作家',
      slug: 'greg-egan', order: 90, image: 'img/works/greg-egan.jpg',
      credit: '代表作『順列都市』（ハヤカワ文庫SF）の表紙／© 早川書房／出典 早川書房',
      creditUrl: 'https://www.hayakawa-online.co.jp/shop/g/g0000011289/',
      summary: 'オーストラリアのSF作家。『順列都市』『ディアスポラ』など、意識や自己を数学と物理から問い直すハードSFで知られる。'
    },
    fuller: {
      title: 'バックミンスター・フラー', type: '人物', year: '1895', creator: '思想家・建築家（1895–1983）',
      slug: 'buckminster-fuller', order: 91, image: 'img/works/buckminster-fuller.jpg',
      credit: 'Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:R._Buckminster_Fuller_1972_(cropped).jpg',
      summary: 'ジオデシック・ドームを考案したアメリカの思想家・建築家。「宇宙船地球号」という言葉を広めた。'
    },
    spaceship: {
      title: 'バックミンスター・フラー『宇宙船地球号 操縦マニュアル』', type: '書籍', year: '1969', creator: 'バックミンスター・フラー',
      slug: 'spaceship-earth', order: 92, image: 'img/works/spaceship-earth.jpg',
      credit: 'ブルー・マーブル（1972）（撮影 NASA／アポロ17号の乗組員）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg',
      summary: '地球を、限られた資源で航行する一隻の宇宙船にたとえ、人類はその操縦のしかたを学ばねばならないと説いた。'
    },
    outsider: {
      title: 'コリン・ウィルソン『アウトサイダー』', type: '書籍', year: '1956', creator: 'コリン・ウィルソン',
      slug: 'the-outsider', order: 93, image: 'img/works/the-outsider.jpg',
      credit: '中公文庫の表紙（写真は著者）／© 中央公論新社／出典 版元ドットコム',
      creditUrl: 'https://www.hanmoto.com/bd/isbn/9784122057388',
      summary: '社会の中に居場所を見いだせない人間＝アウトサイダーを、カミュ、ドストエフスキー、ゴッホらの作品と生涯からたどった評論。20代半ばのデビュー作がベストセラーになった。'
    },
    wilson: {
      title: 'コリン・ウィルソン', type: '人物', year: '1931', creator: '作家・評論家（1931–2013）',
      slug: 'colin-wilson', order: 94, image: 'img/works/colin-wilson.jpg',
      credit: '撮影 Tom Ordelman／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Colin_Wilson.jpg',
      summary: '英国の作家・評論家。『アウトサイダー』でデビューし、犯罪やオカルトまで、幅広い主題を書いた。'
    },
    kpax: {
      title: '『光の旅人 K-PAX』', type: '映画', year: '2001', creator: 'イアン・ソフトリー監督',
      slug: 'k-pax', order: 95, image: 'img/works/k-pax.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/1487/',
      summary: '「K-PAX という星から来た」と語る男プロートと、彼を診る精神科医の物語。ケヴィン・スペイシーとジェフ・ブリッジスが演じた。'
    },
    heidegger: {
      title: 'マルティン・ハイデッガー', type: '人物', year: '1889', creator: '哲学者（1889–1976）',
      slug: 'martin-heidegger', order: 96, image: 'img/works/martin-heidegger.jpg',
      credit: '撮影 Willy Pragher／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Heidegger_2_(1960).jpg',
      summary: 'ドイツの哲学者。『存在と時間』で、人間を、世界の中にすでに投げ込まれて生きている存在として捉え直した。'
    },
    arendt: {
      title: 'ハンナ・アーレント', type: '人物', year: '1906', creator: '政治哲学者（1906–1975）',
      slug: 'hannah-arendt', order: 97, image: 'img/works/hannah-arendt.jpg',
      credit: '撮影 Barbara Niggl Radloff／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Hannah_Arendt_auf_dem_1._Kulturkritikerkongress,_Barbara_Niggl_Radloff,_FM-2019-1-5-9-16_(cropped).jpg',
      summary: 'ドイツ生まれの政治哲学者。ナチスを逃れて米国に渡り、『全体主義の起原』『人間の条件』、アイヒマン裁判の報告で「悪の凡庸さ」を論じた。'
    },
    think: {
      title: 'アップル「Think Different」', type: '広告', year: '1997', creator: 'アップル',
      slug: 'think-different', order: 98, image: 'img/works/think-different.jpg',
      credit: 'アップルの広告ポスター／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Apple_%27Think_Different%27_Poster_-_Theodore_Roosevelt.jpg',
      summary: '1997年にアップルが始めた広告キャンペーン。アインシュタイン、ガンディー、ピカソら、世界を変えた「クレイジーな人たち」への賛辞を掲げた。'
    },
    seed: {
      title: 'ヴァン・デル・ポスト『影の獄にて』', type: '書籍', year: '1963', creator: 'ローレンス・ヴァン・デル・ポスト',
      slug: 'the-seed-and-the-sower', order: 99, image: 'img/works/the-seed-and-the-sower.jpg',
      credit: '新思索社・新装版の表紙／© 新思索社／出典 版元ドットコム',
      creditUrl: 'https://www.hanmoto.com/bd/isbn/9784783511939',
      summary: 'ジャワの日本軍捕虜収容所での体験をもとにした物語。映画『戦場のメリークリスマス』の原作。'
    },
    merryxmas: {
      title: '大島渚『戦場のメリークリスマス』', type: '映画', year: '1983', creator: '大島渚監督',
      slug: 'merry-christmas-mr-lawrence', order: 100, image: 'img/works/merry-christmas-mr-lawrence.jpg',
      credit: '© 大島渚プロダクション／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/17648/',
      summary: '1942年、ジャワの日本軍捕虜収容所。デヴィッド・ボウイ、坂本龍一、ビートたけし、トム・コンティが演じた。音楽は坂本龍一。'
    },

    /* ---- 125 タイトル版で増えた 25 作品（先生の一覧の 101〜125） ---- */
    uniqlock: {
      title: 'UNIQLOCK', type: 'CM', year: '2007', creator: 'ユニクロ',
      slug: 'uniqlock', order: 101, image: 'img/works/uniqlock.jpg',
      credit: '映像の一場面（season 6）／© ユニクロ／出典 YouTube',
      creditUrl: 'https://www.youtube.com/watch?v=f_TY3z4TsSc',
      summary: 'ユニクロのウェブ広告。音楽とダンスと時計を組み合わせ、時刻を刻み続けるブログパーツとして世界に広まった。'
    },
    downfall: {
      title: '映画『ヒトラー〜最期の12日間〜』', type: '映画・ドラマ', year: '2004', creator: 'オリヴァー・ヒルシュビーゲル監督',
      slug: 'downfall', order: 102, image: 'img/works/downfall.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/52585/',
      summary: 'ベルリン陥落直前、総統地下壕で過ごしたヒトラーの最期の日々を、秘書の証言などをもとに描いたドイツ映画。'
    },
    ganz: {
      title: 'ブルーノ・ガンツ', type: '人物', year: '', creator: '俳優（1941–2019）',
      slug: 'bruno-ganz', order: 103, image: 'img/works/bruno-ganz.jpg',
      credit: '東京ドイツ映画祭（2005）（撮影 Yasu）／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Bruno_Ganz_DFF_Tokyo_2005.jpg',
      summary: 'スイス出身の俳優。『ベルリン・天使の詩』の天使ダミエル、『ヒトラー〜最期の12日間〜』のヒトラーを演じた。'
    },
    lambs: {
      title: '映画『羊たちの沈黙』', type: '映画・ドラマ', year: '1991', creator: 'ジョナサン・デミ監督',
      slug: 'the-silence-of-the-lambs', order: 104, image: 'img/works/the-silence-of-the-lambs.jpg',
      credit: '© 1991 Orion Pictures Corporation. All Rights Reserved.／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/25151/',
      summary: 'FBI訓練生クラリスが、収監中の精神科医ハンニバル・レクターの助言を得て連続殺人犯を追うサスペンス。アカデミー賞の主要5部門を受賞した。'
    },
    demme: {
      title: 'ジョナサン・デミ', type: '人物', year: '', creator: '映画監督（1944–2017）',
      slug: 'jonathan-demme', order: 105, image: 'img/works/jonathan-demme.jpg',
      credit: '撮影 Dan D\'Errico / Montclair Film Festival／CC BY 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Jonathan_Demme_(May_2015)_(cropped2).JPG',
      summary: 'アメリカの映画監督。『羊たちの沈黙』でアカデミー監督賞。『フィラデルフィア』や、トーキング・ヘッズのライブ映画『ストップ・メイキング・センス』も手がけた。'
    },
    hopkins: {
      title: 'アンソニー・ホプキンス', type: '人物', year: '', creator: '俳優（1937–）',
      slug: 'anthony-hopkins', order: 106, image: 'img/works/anthony-hopkins.jpg',
      credit: '撮影 Elena Torre／CC BY-SA 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Anthony_Hopkins_cropped_2009.jpg',
      summary: '英国ウェールズ出身の俳優。『羊たちの沈黙』のハンニバル・レクター役でアカデミー主演男優賞を受賞した。'
    },
    foster: {
      title: 'ジョディ・フォスター', type: '人物', year: '', creator: '俳優・映画監督（1962–）',
      slug: 'jodie-foster', order: 107, image: 'img/works/jodie-foster.jpg',
      credit: '撮影 Franz Richter／CC BY-SA 2.5／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Jodie_Foster.4785.jpg',
      summary: 'アメリカの俳優・映画監督。子役から活躍し、『羊たちの沈黙』のクラリス役で二度目のアカデミー主演女優賞を受賞した。'
    },
    wings: {
      title: '映画『ベルリン・天使の詩』', type: '映画・ドラマ', year: '1987', creator: 'ヴィム・ヴェンダース監督',
      slug: 'wings-of-desire', order: 108, image: 'img/works/wings-of-desire.jpg',
      credit: '場面写真／(C)Wim Wenders Stiftung – Argos Films／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/27461/',
      summary: '壁のあった時代のベルリンで、人々の心の声を聞き続けてきた天使が、人間になることを選ぶ物語。'
    },
    wenders: {
      title: 'ヴィム・ヴェンダース', type: '人物', year: '', creator: '映画監督（1945–）',
      slug: 'wim-wenders', order: 109, image: 'img/works/wim-wenders.jpg',
      credit: '撮影 Queryzo／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Wim_Wenders_Berlinale_2015.jpg',
      summary: 'ドイツの映画監督。『パリ、テキサス』『ベルリン・天使の詩』のほか、東京を舞台にした『PERFECT DAYS』も撮った。'
    },
    falk: {
      title: 'ピーター・フォーク', type: '人物', year: '', creator: '俳優（1927–2011）',
      slug: 'peter-falk', order: 110, image: 'img/works/peter-falk.jpg',
      credit: '『刑事コロンボ』の宣材写真（1973）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Peter_Falk_Colombo_1973.jpg',
      summary: 'アメリカの俳優。『刑事コロンボ』のコロンボ役で知られる。『ベルリン・天使の詩』には本人役で出演した。'
    },
    handke: {
      title: 'ペーター・ハントケ', type: '人物', year: '', creator: '作家（1942–）',
      slug: 'peter-handke', order: 111, image: 'img/works/peter-handke.jpg',
      credit: '撮影 Wild + Team Agentur／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Peter-handke_(cropped).jpg',
      summary: 'オーストリアの作家・劇作家。『ベルリン・天使の詩』の脚本に加わり、2019年にノーベル文学賞を受賞した。'
    },
    nobel: {
      title: 'ノーベル文学賞受賞者', type: '人物', year: '1901–', creator: 'スウェーデン・アカデミーが選ぶ',
      slug: 'nobel-literature-laureates', order: 112, image: 'img/works/nobel-literature-laureates.jpg',
      credit: 'ガルシア＝マルケスのノーベル文学賞のメダルと賞状（コロンビア国立図書館）（撮影 Peter Angritt）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Biblioteca_Nacional_-_Nobel_Prize_for_Literature_-_Gabriel_Garcia_Marquez.jpg',
      summary: '1901年から続くノーベル文学賞を受けた作家たち。'
    },
    cats: {
      title: 'ミュージカル『キャッツ』', type: 'ミュージカル', year: '1981', creator: 'アンドリュー・ロイド・ウェバー作曲',
      slug: 'cats', order: 113, image: 'img/works/cats.jpg',
      credit: 'オリジナル・ロンドン・キャスト盤（1981）のジャケット／© 権利者／出典 Apple Music',
      creditUrl: 'https://music.apple.com/jp/album/cats-original-1981-london-cast/1843487732',
      summary: 'T・S・エリオットの詩集『Old Possum’s Book of Practical Cats』（1939）をもとにしたミュージカル。1981年にロンドンで初演された。'
    },
    eliot: {
      title: 'T・S・エリオット', type: '人物', year: '', creator: '詩人・批評家（1888–1965）',
      slug: 't-s-eliot', order: 114, image: 'img/works/t-s-eliot.jpg',
      credit: '1923年（撮影 Lady Ottoline Morrell）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:T.S._Eliot,_1923.JPG',
      summary: 'アメリカに生まれ、英国で活躍した詩人・批評家。『荒地』『うつろな人々』を書き、1948年にノーベル文学賞を受賞した。'
    },
    pound: {
      title: 'エズラ・パウンド', type: '人物', year: '', creator: '詩人（1885–1972）',
      slug: 'ezra-pound', order: 115, image: 'img/works/ezra-pound.jpg',
      credit: '1913年（撮影 Alvin Langdon Coburn）／CC0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Ezra_Pound_by_Alvin_Langdon_Coburn,_1913,_collotype_photograph,_from_the_National_Portrait_Gallery_-_NPG-NPG_78_14Pound-000001.jpg',
      summary: 'アメリカの詩人。モダニズムの詩を牽引し、エリオットの『荒地』の草稿に大胆に手を入れて仕上げを助けた。'
    },
    wasteland: {
      title: '長編詩『荒地』The Waste Land', type: '詩', year: '1922', creator: 'T・S・エリオット',
      slug: 'the-waste-land', order: 116, image: 'img/works/the-waste-land.jpg',
      credit: '『荒地』が初めて載った季刊誌「The Criterion」創刊号（1922年10月）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:THE_CRITERION_PORTADA.jpg',
      summary: '「四月はいちばん残酷な月」で始まる長編詩。第一次世界大戦後のヨーロッパの荒廃を描いた、モダニズム詩の代表作。'
    },
    hollow: {
      title: '『うつろな人々』The Hollow Men', type: '詩', year: '1925', creator: 'T・S・エリオット',
      slug: 'the-hollow-men', order: 117, image: 'img/works/the-hollow-men.jpg',
      credit: '題辞「A penny for the Old Guy」のガイ・フォークス人形（撮影 paddy patterson）／CC BY 2.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:PennyForTheGuy.jpg',
      summary: '「世界の終わりはこうだ、爆発ではなく、すすり泣きで」と結ばれる詩。題辞にコンラッド『闇の奥』の一行を掲げる。'
    },
    lorenzo: {
      title: '映画「ロレンツォのオイル」', type: '映画・ドラマ', year: '1992', creator: 'ジョージ・ミラー監督',
      slug: 'lorenzos-oil', order: 118, image: 'img/works/lorenzos-oil.jpg',
      credit: '© 権利者／出典 映画.com',
      creditUrl: 'https://eiga.com/movie/64836/',
      summary: '難病ALDと診断された息子を救うため、医学の素人である両親が治療法を探し続けた実話の映画化。'
    },
    ald: {
      title: '副腎白質ジストロフィー（ALD）', type: '病気', year: '', creator: '遺伝性の病気',
      slug: 'adrenoleukodystrophy', order: 119, image: 'img/works/adrenoleukodystrophy.jpg',
      credit: 'ALD の脳の MRI 画像（撮影 Frank Gaillard）／CC BY-SA 3.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Adrenoleukodystrophy.jpg',
      summary: '脳の白質と副腎が侵される遺伝性の病気。主に男の子に発症する。'
    },
    elmer: {
      title: '映画「エルマー・ガントリー」', type: '映画・ドラマ', year: '1960', creator: 'リチャード・ブルックス監督',
      slug: 'elmer-gantry', order: 120, image: 'img/works/elmer-gantry.jpg',
      credit: '主演バート・ランカスター（本作でアカデミー主演男優賞）の肖像（Nicholas Volpe 画）／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Burt_Lancaster_1960.jpg',
      summary: 'シンクレア・ルイスの小説をもとに、口のうまい男が信仰復興運動の伝道者として成り上がっていく姿を描いた映画。'
    },
    antiintel: {
      title: '反知性主義', type: '言葉', year: '', creator: '言葉',
      slug: 'anti-intellectualism', order: 121, image: 'img/works/anti-intellectualism.jpg',
      credit: 'ホーフスタッターが反知性主義の源流の一つとした信仰復興運動の集会（1852）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Religious_revival_meeting_at_Eastham,_Mass.,_1852-_Prayer_meeting_in_a_tent_LCCN2003654804.jpg',
      summary: '知性や知識人への反発・不信を表す言葉。ホーフスタッター『アメリカの反知性主義』で広く知られるようになった。'
    },
    aibook: {
      title: 'アメリカの反知性主義', type: '書籍', year: '1963', creator: 'リチャード・ホーフスタッター（田村哲夫 訳）',
      slug: 'anti-intellectualism-in-american-life', order: 122, image: 'img/works/anti-intellectualism-in-american-life.jpg',
      credit: 'みすず書房版の表紙／© みすず書房／出典 みすず書房',
      creditUrl: 'https://www.msz.co.jp/book/detail/07066/',
      summary: 'アメリカ社会に根づく知性への反発を、宗教・政治・ビジネス・教育の歴史からたどった本。ピュリッツァー賞を受賞した。'
    },
    hofstadter: {
      title: 'リチャード・ホーフスタッター', type: '人物', year: '', creator: '歴史家（1916–1970）',
      slug: 'richard-hofstadter', order: 123, image: 'img/works/richard-hofstadter.jpg',
      credit: 'ホーフスタッターが教えたコロンビア大学の「アルマ・マーテル」像／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Almamater.jpg',
      summary: 'アメリカの歴史家。コロンビア大学で教え、『アメリカの反知性主義』などで二度ピュリッツァー賞を受けた。'
    },
    crime: {
      title: '罪と罰', type: '書籍', year: '1866', creator: 'ドストエフスキー',
      slug: 'crime-and-punishment', order: 124, image: 'img/works/crime-and-punishment.jpg',
      credit: '初版本（1867）の表紙／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Cover_of_the_first_edition_of_Crime_and_Punishment.jpg',
      summary: '貧しい元学生ラスコーリニコフが、自分の理屈で老婆を殺し、罪の意識に追いつめられていく長編小説。'
    },
    dost: {
      title: 'ドストエフスキー', type: '人物', year: '', creator: '作家（1821–1881）',
      slug: 'fyodor-dostoevsky', order: 125, image: 'img/works/fyodor-dostoevsky.jpg',
      credit: 'ヴァシーリー・ペローフ画（1872）／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg',
      summary: 'ロシアの作家。『罪と罰』『カラマーゾフの兄弟』などで、人間の内面と信仰を深く描いた。'
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
      a: W.kure,
      b: W.torikawa,
      context: {
        routeName: '呉の一皿',
        label: 'CONTEXT',
        kind: '事実',
        hub: '呉の名物',
        score: [4, 4, 4, 4],
        headline: '港町の居酒屋の味が、\n缶ひとつで旅をする。',
        slug: 'kure--torikawa-misoni',
        relation: '広島県呉市 ── 名物 ── 鳥皮みそ煮',
        leftStation: '呉',
        rightStation: '鳥皮みそ煮',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>町の名物は、たいてい居酒屋のカウンターから始まる。</strong></p><p>鳥皮みそ煮は、広島県呉市の名物として知られる料理。鶏の皮をこんにゃくと一緒に味噌で煮込んだもので、呉の居酒屋では「みそだき」とも呼ばれて親しまれている。</p><p>いまは缶詰にもなり、呉の土産として広島駅などでも手に入る。バーコードに戦艦大和を描いた缶もあり、海軍の町としての呉の顔が、小さな缶の上にも重なっている。</p><p>『この世界の片隅に』で、すずが配給の食材をやりくりした町。その町の台所で愛されてきた味を、いまは缶ひとつで遠くへ持ち帰ることができる。</p>'
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
    },

    /* ---- 100 タイトル版の区間（生成AIの初稿）。basis があるものは前田先生の note の読みを骨組みにした ---- */
    {
      id: 'seed-kill-your-friends--frida-sundemo',
      createdAt: '2026-09-14T09:00:00.000Z',
      updatedAt: '2026-09-14T09:00:00.000Z',
      a: W.maddrive,
      b: W.sundemo,
      context: {
        routeName: '手向けの花',
        label: 'CONTEXT',
        kind: '事実',
        hub: '作中のバンド「レイジーズ」',
        score: [4, 4, 5, 4],
        basis: '前田先生の note（2017–2018）',
        headline: '音楽を憎んだ男の前で、\nひとりの歌手が歌った。',
        slug: 'kill-your-friends--frida-sundemo',
        relation: '映画『マッド・ドライヴ』── 作中の新人バンドのボーカル ── フリーダ・サンデモ',
        leftStation: 'マッド・ドライヴ',
        rightStation: 'フリーダ・サンデモ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>邦題だけでは見えない、この映画の鍵。</strong></p><p>『マッド・ドライヴ』の原題は、ジョン・ニーヴンの原作小説と同じ『Kill Your Friends』。1990年代、ブリットポップに沸く英国の音楽業界で、売れる音楽しか信じないレコード会社の男が、成り上がるために道を踏み外していく。</p><p>作中には、前評判の高い新人バンドが登場する。そのボーカルとして歌うのが、スウェーデンのシンガーソングライター、フリーダ・サンデモである。80年代・90年代のシンセポップを思わせる彼女の歌がライブハウスに流れたとき、音楽を投資の銘柄のように語っていた主人公は、思わずうろたえる。</p><p>身勝手な主人公の物語の中で、救いになっているのは、彼が毛嫌いするインディーバンドのささやかな成功である。彼女の歌は、音楽を仕事にしてきた人間への、手向けの花のように置かれている。</p>'
      }
    },

    {
      id: 'seed-homme-less--happy-pharrell',
      createdAt: '2026-09-14T08:50:00.000Z',
      updatedAt: '2026-09-14T08:50:00.000Z',
      a: W.hommeless,
      b: W.happy,
      context: {
        routeName: '屋根のない部屋',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '屋根のない部屋',
        score: [5, 5, 4, 4],
        basis: '前田先生の note（2017–2018）',
        headline: '屋根のない部屋でも、\n手を叩ける。',
        slug: 'homme-less--happy-pharrell',
        relation: '映画『ホームレス ニューヨークと寝た男』── 屋根のない部屋 ── ファレル・ウィリアムス「HAPPY」',
        leftStation: 'ホームレス ニューヨークと寝た男',
        rightStation: 'HAPPY',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>ニューヨークの屋上で眠る男と、世界中で踊られた一曲。</strong></p><p>ファッション写真家で元モデルのマーク・レイは、華やかなパーティーのあと、友人のアパートの屋上で寝袋にくるまって眠っていた。「世界一華麗なホームレス」の数年を追ったのが『ホームレス ニューヨークと寝た男』である。</p><p>ファレル・ウィリアムスの「HAPPY」は、幸せな気分を「屋根のない部屋」にたとえる歌で、24時間ぶんのミュージックビデオには、世界中の街で踊る人々が映し出された。</p><p>屋根のない部屋で眠る男と、屋根のない部屋のような気分で手を叩く人々。都会そのものを自分の一部にして、なお希望を手放さない人の姿が、二つの作品で重なる。前田先生はこの二つを並べ、「まだまだ、これからなんだ。人生ってヤツは」と書いている。</p>'
      }
    },

    {
      id: 'seed-the-planets--the-war-of-the-worlds',
      createdAt: '2026-09-14T08:40:00.000Z',
      updatedAt: '2026-09-14T08:40:00.000Z',
      a: W.planets,
      b: W.wotw,
      context: {
        routeName: '火星、戦争をもたらす者',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '火星',
        score: [4, 4, 4, 4],
        basis: '前田先生の note（2017–2018）',
        headline: '組曲の最初の星は、\n戦争の神だった。',
        slug: 'the-planets--the-war-of-the-worlds',
        relation: 'ホルスト『惑星』第1曲「火星、戦争をもたらす者」── 火星 ── H・G・ウェルズ『宇宙戦争』',
        leftStation: '惑星',
        rightStation: '宇宙戦争（小説）',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。どちらも、火星を「戦争」として描いた英国の作品である。</strong></p><p>ホルストの組曲『惑星』は、第1曲「火星、戦争をもたらす者」の、執拗に刻まれる五拍子のリズムで始まる。作曲は第一次世界大戦の前後にあたる。</p><p>その十数年前、H・G・ウェルズは『宇宙戦争』で、火星人が当時世界最強の軍隊を持つ英国をたやすく壊滅させるさまを描いた。</p><p>惑星を占星術の性格で描いた組曲と、惑星からの侵略を描いた小説。宇宙を見上げながら、英国は二度、火星に戦争の顔を見ていた。「木星」の旋律は、のちに愛国歌「我は汝に誓う、我が祖国よ」になり、前田先生はこの曲を、英国人の気概を知る手がかりとして紹介している。</p>'
      }
    },

    {
      id: 'seed-tengoku-film--tengoku-book',
      createdAt: '2026-09-14T08:30:00.000Z',
      updatedAt: '2026-09-14T08:30:00.000Z',
      a: W.tengokufilm,
      b: W.tengokubook,
      context: {
        routeName: '原作から映画へ',
        label: 'CONTEXT',
        kind: '事実',
        hub: '原作',
        score: [2, 5, 5, 5],
        basis: '前田先生の note（2017–2018）',
        headline: '天国は、\n場所ではなかった。',
        slug: 'tengoku-film--tengoku-book',
        relation: '森村桂『天国にいちばん近い島』（1966）── 映画化 ── 大林宣彦『天国にいちばん近い島』（1984）',
        leftStation: '天国にいちばん近い島（映画）',
        rightStation: '天国にいちばん近い島（小説）',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>若い女性の実体験の旅が、映画になった。</strong></p><p>森村桂は1964年、1ドルが360円で海外渡航にも制限があった時代に、貨物船に乗ってひとりニューカレドニアへ渡った。その旅の記録が『天国にいちばん近い島』である。旅先で盲腸になった彼女を助けたのは、日本人と現地の人とのあいだに生まれ、どこの国籍も持てずにいた男性だった。</p><p>大林宣彦は1984年、原田知世の主演でこれを映画にした。前田先生の note によれば、映画には原作にない、近海で沈んだ日本の潜水艦の慰霊碑を訪ねる未亡人の挿話がさりげなく置かれている。</p><p>亡き父の言った「天国にいちばん近い島」は、地図の上の場所ではなく、人のこころの在りかだった。原作が見つけたその答えに、映画はもう一つ、戦争の記憶という層を重ねている。</p>'
      }
    },

    {
      id: 'seed-tengoku-book--rebellion-ordre-et-morale',
      createdAt: '2026-09-14T08:20:00.000Z',
      updatedAt: '2026-09-14T08:20:00.000Z',
      a: W.tengokubook,
      b: W.rebellion,
      context: {
        routeName: '天国の島の裏側',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'ニューカレドニア',
        score: [5, 4, 5, 3],
        basis: '前田先生の note（2017–2018）',
        headline: '天国に近い島は、\n植民地で、戦場だった。',
        slug: 'tengoku-book--rebellion-ordre-et-morale',
        relation: '森村桂『天国にいちばん近い島』── ニューカレドニア ── 映画『裏切りの戦場 葬られた誓い』',
        leftStation: '天国にいちばん近い島（小説）',
        rightStation: '裏切りの戦場 葬られた誓い',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>ハブはニューカレドニア。同じ島の、光と影。</strong></p><p>ニューカレドニアはいまもフランスの海外領土で、世界有数のニッケルの産地である。明治の半ばから多くの日本人が鉱山の労働者として渡ったが、太平洋戦争が始まると敵国人として収容所へ送られ、現地の人と家族をつくっていた人々は引き裂かれた。</p><p>森村桂の『天国にいちばん近い島』は、そんな歴史を背負う島の、穏やかでやさしい顔を描いた。</p><p>一方、映画『裏切りの戦場 葬られた誓い』が描くのは、1988年、独立を求めるカナックの人々がウベア島で憲兵を人質にとった事件である。前田先生は「天国に近い島は植民地で、戦場であり続ける」と書いた。同じ島を、二つの作品が反対の側から照らしている。</p>'
      }
    },

    {
      id: 'seed-tengoku-film--harada-tomoyo',
      createdAt: '2026-09-14T08:10:00.000Z',
      updatedAt: '2026-09-14T08:10:00.000Z',
      a: W.tengokufilm,
      b: W.harada,
      context: {
        routeName: '主演',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '主演',
        score: [1, 4, 3, 5],
        headline: '少女は、\n南の島へひとりで旅立つ。',
        slug: 'tengoku-film--harada-tomoyo',
        relation: '原田知世 ── 主演 ── 大林宣彦『天国にいちばん近い島』',
        leftStation: '天国にいちばん近い島（映画）',
        rightStation: '原田知世',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>大林宣彦と原田知世、二度目の組み合わせ。</strong></p><p>原田知世は1983年、大林宣彦監督の『時をかける少女』で映画に主演した。翌1984年、同じ監督のもとで主演したのが『天国にいちばん近い島』である。</p><p>亡き父の言葉を頼りに、南の島へひとりで旅立つ少女。まだ海外旅行が珍しかった時代の原作を、映画は80年代の少女の旅として描き直し、その透明なまなざしを原田知世が演じた。</p>'
      }
    },

    {
      id: 'seed-shooting-an-elephant--nineteen-eighty-four',
      createdAt: '2026-09-14T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
      a: W.elephant,
      b: W.n1984,
      context: {
        routeName: 'ビルマから『1984年』へ',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'ジョージ・オーウェル',
        score: [3, 4, 5, 5],
        basis: '前田先生の note（2017–2018）',
        headline: '象を撃った警官は、\nやがて監視国家を書いた。',
        slug: 'shooting-an-elephant--nineteen-eighty-four',
        relation: 'ジョージ・オーウェル『象を撃つ』── オーウェル ── 『1984年』',
        leftStation: '象を撃つ',
        rightStation: '1984年',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブは書き手オーウェル。権力の側に立った経験から、権力の物語が生まれた。</strong></p><p>本名エリック・ブレアは、1920年代に英領ビルマで警察官をしていた。『象を撃つ』は、街で暴れた象を、群衆の期待に応えるために撃たねばならなかった経験を書いたエッセイで、支配する側の人間の内面の敗北が描かれる。オーウェルはやがて警官を辞め、ビルマを舞台にした小説を書いた。</p><p>その目は、『動物農場』『1984年』で、国家が人を支配するしくみそのものへ向かう。前田先生の note によれば、ミャンマーでは長く、オーウェルの本が出版を禁じられていた。軍事政権のもとの暮らしを、あまりに正確に言い当てていたからである。</p>'
      }
    },

    {
      id: 'seed-shooting-an-elephant--heart-of-darkness',
      createdAt: '2026-09-14T07:50:00.000Z',
      updatedAt: '2026-09-14T07:50:00.000Z',
      a: W.elephant,
      b: W.hod,
      context: {
        routeName: '支配する側の闇',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '支配する側の内面',
        score: [4, 4, 5, 4],
        headline: '植民地を統べる者の\n心の奥。',
        slug: 'shooting-an-elephant--heart-of-darkness',
        relation: 'ジョセフ・コンラッド『闇の奥』── 植民地支配 ── ジョージ・オーウェル『象を撃つ』',
        leftStation: '象を撃つ',
        rightStation: '闇の奥',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>コンラッドの『闇の奥』は、コンゴの奥地で、文明の使者であるはずのクルツが壊れていくさまを、欧州の側から描いた。</p><p>オーウェルの『象を撃つ』は、ビルマで、権威ある白人警官であることを群衆に示すために象を撃つ自分を描いた。</p><p>どちらも、支配される側ではなく、支配する側の人間の内面に目を向けている。帝国の時代を内側から見つめた英語の二つの作品は、並べて読むことで互いの輪郭をはっきりさせる。</p>'
      }
    },

    {
      id: 'seed-nineteen-eighty-four--think-different',
      createdAt: '2026-09-14T07:40:00.000Z',
      updatedAt: '2026-09-14T07:40:00.000Z',
      a: W.n1984,
      b: W.think,
      context: {
        routeName: '1984年は『1984年』のようにはならない',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'アップルの広告「1984」',
        score: [4, 4, 4, 4],
        headline: 'ビッグ・ブラザーを、\nハンマーが打ち砕いた。',
        slug: 'nineteen-eighty-four--think-different',
        relation: 'ジョージ・オーウェル『1984年』── アップルの広告「1984」── アップル「Think Different」',
        leftStation: '1984年',
        rightStation: 'Think Different',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>ハブは、1984年のアップルの広告。</strong></p><p>1984年1月、アップルは最初の Macintosh を、オーウェルの『1984年』を下敷きにしたテレビ広告で発表した。画面の独裁者に向かって女性がハンマーを投げつけるこの広告は、リドリー・スコットが監督した。</p><p>13年後の1997年、アップルは「Think Different」で、世界を変えた「クレイジーな人たち」を讃えた。体制に従わない個人を主役にするという姿勢は、「1984」の広告からまっすぐ続いている。</p>'
      }
    },

    {
      id: 'seed-nineteen-eighty-four--blade-runner',
      createdAt: '2026-09-14T07:30:00.000Z',
      updatedAt: '2026-09-14T07:30:00.000Z',
      a: W.n1984,
      b: W.br,
      context: {
        routeName: 'リドリー・スコットを経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'リドリー・スコット',
        score: [5, 3, 4, 4],
        headline: '監督は、\n『1984年』の広告も撮っていた。',
        slug: 'nineteen-eighty-four--blade-runner',
        relation: 'ジョージ・オーウェル『1984年』── リドリー・スコットの広告「1984」── 『ブレードランナー』',
        leftStation: '1984年',
        rightStation: 'ブレードランナー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブは監督リドリー・スコット。</strong></p><p>『ブレードランナー』（1982）で、酸性雨の降る管理社会を描いたリドリー・スコットは、その2年後、オーウェルの『1984年』を下敷きにしたアップルのテレビ広告「1984」を監督した。</p><p>灰色の群衆と、巨大な画面から語りかける独裁者。広告の映像には、スコットが描いてきたディストピアの手触りがそのまま流れ込んでいる。小説が描いた監視社会は、映画と広告を通じて、20世紀後半の未来像になっていった。</p>'
      }
    },

    {
      id: 'seed-nineteen-eighty-four--brazil',
      createdAt: '2026-09-14T07:20:00.000Z',
      updatedAt: '2026-09-14T07:20:00.000Z',
      a: W.n1984,
      b: W.brazil,
      context: {
        routeName: '1984½',
        label: 'CONTEXT',
        kind: '事実',
        hub: '仮題『1984½』',
        score: [4, 4, 5, 5],
        headline: 'はじめの題は、\n『1984½』だった。',
        slug: 'nineteen-eighty-four--brazil',
        relation: 'ジョージ・オーウェル『1984年』── 仮題『1984½』── テリー・ギリアム『未来世紀ブラジル』',
        leftStation: '1984年',
        rightStation: '未来世紀ブラジル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>ギリアムの管理社会は、オーウェルへの目配せから始まった。</strong></p><p>テリー・ギリアムは『未来世紀ブラジル』の構想段階で、『1984½』という仮題を考えていた。オーウェルの『1984年』と、フェリーニの『8½』を重ねた題である。</p><p>書類と配管と手続きにがんじがらめになった社会で、夢に逃げ込むしかない役人。オーウェルの監視国家を、ギリアムは悪夢のようなユーモアで描き直した。</p><p>1985年に公開されたこの映画は、「1984年」が現実に過ぎ去ったあとに、なお終わらないディストピアを描いている。</p>'
      }
    },

    {
      id: 'seed-breaking-bad--better-call-saul',
      createdAt: '2026-09-14T07:10:00.000Z',
      updatedAt: '2026-09-14T07:10:00.000Z',
      a: W.bb,
      b: W.bcs,
      context: {
        routeName: 'スピンオフ',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'スピンオフ',
        score: [2, 5, 5, 5],
        basis: '前田先生の note（2017–2018）',
        headline: '悪徳弁護士には、\nまだ名前が違う頃があった。',
        slug: 'breaking-bad--better-call-saul',
        relation: 'ドラマ『ブレイキング・バッド』── スピンオフ ── 『ベター・コール・ソウル』',
        leftStation: 'ブレイキング・バッド',
        rightStation: 'ベター・コール・ソウル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>本編以上とも言われたスピンオフ。</strong></p><p>『ブレイキング・バッド』の主人公ウォルター・ホワイトは、正義より家族を、やがて家族より自分のアイデンティティを選び、すべてを失った。</p><p>『ベター・コール・ソウル』は、その物語に登場する悪徳弁護士ソウル・グッドマンが、まだジミー・マッギルという名だった頃から始まる。前田先生は、この作品の人物たちが家族や正義、名誉にこだわりながら報われない姿に、のちの『ブレイキング・バッド』の凶行へつながる「避けられない悪行の起源」を見ている。</p>'
      }
    },

    {
      id: 'seed-breaking-bad--pluribus',
      createdAt: '2026-09-14T07:00:00.000Z',
      updatedAt: '2026-09-14T07:00:00.000Z',
      a: W.bb,
      b: W.pluribus,
      context: {
        routeName: 'ヴィンス・ギリガンを経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'ヴィンス・ギリガン',
        score: [3, 4, 4, 4],
        headline: '化学教師の物語の作者が、\n次に描いたのは「私たち」。',
        slug: 'breaking-bad--pluribus',
        relation: 'ドラマ『ブレイキング・バッド』── ヴィンス・ギリガン ── 『プルリブス』',
        leftStation: 'ブレイキング・バッド',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>ハブは作り手ヴィンス・ギリガン。</strong></p><p>『ブレイキング・バッド』を生んだヴィンス・ギリガンは、『ベター・コール・ソウル』を経て、Apple TV+ の『プルリブス』を手がけた。</p><p>ひとりの男が善悪の境を越えていく物語から、人々の心がひとつに溶け合う世界で「ひとりであること」を問う物語へ。ギリガンは一貫して、共同体のなかで個人が選ぶことの重さを描いている。</p>'
      }
    },

    {
      id: 'seed-better-call-saul--pluribus',
      createdAt: '2026-09-14T06:50:00.000Z',
      updatedAt: '2026-09-14T06:50:00.000Z',
      a: W.bcs,
      b: W.pluribus,
      context: {
        routeName: 'レイ・シーホーンを経由して',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'レイ・シーホーン',
        score: [4, 5, 4, 4],
        headline: 'キムを演じた人が、\n世界でただひとりになる。',
        slug: 'better-call-saul--pluribus',
        relation: 'ドラマ『ベター・コール・ソウル』── 俳優レイ・シーホーン ── 『プルリブス』',
        leftStation: 'ベター・コール・ソウル',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>ハブは俳優レイ・シーホーン。</strong></p><p>『ベター・コール・ソウル』で、ジミーの恋人であり、有能な弁護士キム・ウェクスラーを演じたのがレイ・シーホーンである。</p><p>ヴィンス・ギリガンは『プルリブス』で、彼女を主役に据えた。人々の心がひとつになった世界で、それに加わらない作家キャロル。前作の脇で光った俳優が、次の作品の真ん中に立った。</p>'
      }
    },

    {
      id: 'seed-interstellar--the-grapes-of-wrath',
      createdAt: '2026-09-14T06:40:00.000Z',
      updatedAt: '2026-09-14T06:40:00.000Z',
      a: W.interstellar,
      b: W.grapes,
      context: {
        routeName: 'ダストボウル',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'ダストボウル',
        score: [4, 5, 5, 4],
        basis: '前田先生の note（2017–2018）',
        headline: '砂嵐の農場から、\n星の海へ。',
        slug: 'interstellar--the-grapes-of-wrath',
        relation: 'ジョン・スタインベック『怒りの葡萄』── ダストボウル ── クリストファー・ノーラン『インターステラー』',
        leftStation: 'インターステラー',
        rightStation: '怒りの葡萄',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>現代版の『怒りの葡萄』。</strong></p><p>『インターステラー』の冒頭には、砂嵐の記憶を語る老人たちのインタビューが流れる。これは、1930年代にアメリカ中西部を襲った砂嵐「ダストボウル」を実際に体験した人々の証言で、ケン・バーンズのドキュメンタリーから引かれている。</p><p>ダストボウルで土地を追われ、カリフォルニアへ向かった農民一家を描いたのが、スタインベックの『怒りの葡萄』である。</p><p>前田先生は、『地獄の黙示録』が『闇の奥』を下敷きにしたように、『インターステラー』は『怒りの葡萄』を下敷きにしたSFだと読む。過酷な環境から這い出るようにして生き延びる人々へのまなざしが、二つの作品を貫いている。</p>'
      }
    },

    {
      id: 'seed-interstellar--christopher-nolan',
      createdAt: '2026-09-14T06:30:00.000Z',
      updatedAt: '2026-09-14T06:30:00.000Z',
      a: W.interstellar,
      b: W.nolan,
      context: {
        routeName: '監督と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [1, 4, 4, 5],
        headline: '父は、\n本棚の向こうから娘を呼んだ。',
        slug: 'interstellar--christopher-nolan',
        relation: 'クリストファー・ノーラン ── 監督 ── 『インターステラー』',
        leftStation: 'インターステラー',
        rightStation: 'クリストファー・ノーラン',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>弟ジョナサンとの共同脚本。</strong></p><p>『インターステラー』は、弟のジョナサン・ノーランが書いていた脚本を、クリストファー・ノーランが引き継いで監督した作品である。</p><p>時間の流れが星ごとに違う宇宙で、父と娘の時間がずれていく。『メメント』『インセプション』『TENET』と、時間の構造そのものを物語にしてきたノーランの関心が、ここでは家族の物語として結晶している。</p>'
      }
    },

    {
      id: 'seed-the-war-of-the-worlds--war-of-the-worlds-2005',
      createdAt: '2026-09-14T06:20:00.000Z',
      updatedAt: '2026-09-14T06:20:00.000Z',
      a: W.wotw,
      b: W.wotwfilm,
      context: {
        routeName: '小説から映画へ',
        label: 'CONTEXT',
        kind: '事実',
        hub: '原作',
        score: [2, 4, 5, 4],
        basis: '前田先生の note（2017–2018）',
        headline: '火星人の侵略は、\n父と子の逃避行になった。',
        slug: 'the-war-of-the-worlds--war-of-the-worlds-2005',
        relation: 'H・G・ウェルズ『宇宙戦争』（1898）── 映画化 ── スピルバーグ『宇宙戦争』（2005）',
        leftStation: '宇宙戦争（小説）',
        rightStation: '宇宙戦争（映画）',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>同じ侵略、違う問い。</strong></p><p>ウェルズの『宇宙戦争』は、火星人の襲来でロンドンの理性がたちまち失われるさまを、思索する語り手の目で描いた。前田先生はこれを、人類が地球という閉じた空間での覇権を簡単に失いうることを示した警句として読み直している。</p><p>スピルバーグの映画は、舞台を現代のアメリカに移し、原作にない家族の物語を加えた。離婚した父親が、子どもたちを守るために父親になっていく。圧倒的な力の前で、人はどう生き、どう戦うのか。映画は原作と違う角度から同じ問いに答えている。</p>'
      }
    },

    {
      id: 'seed-war-of-the-worlds-2005--interstellar',
      createdAt: '2026-09-14T06:10:00.000Z',
      updatedAt: '2026-09-14T06:10:00.000Z',
      a: W.wotwfilm,
      b: W.interstellar,
      context: {
        routeName: 'スピルバーグを経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'スティーヴン・スピルバーグ',
        score: [5, 4, 4, 4],
        headline: '父と子の物語は、\nもう一人の監督へ渡った。',
        slug: 'war-of-the-worlds-2005--interstellar',
        relation: 'スピルバーグ『宇宙戦争』── スティーヴン・スピルバーグ ── 『インターステラー』',
        leftStation: '宇宙戦争（映画）',
        rightStation: 'インターステラー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブはスティーヴン・スピルバーグ。</strong></p><p>『インターステラー』は、はじめスピルバーグが監督する予定で企画が進められていた。脚本を書いていたのはジョナサン・ノーランで、のちに兄のクリストファーが引き継いだ。</p><p>スピルバーグが『宇宙戦争』で描いた、地球の危機のなかの父と子。『インターステラー』もまた、地球の危機のなかで父が子のために旅立つ物語になった。二つの作品は、同じ監督の手を経由して、同じ主題を分け持っている。</p>'
      }
    },

    {
      id: 'seed-interstellar--spaceship-earth',
      createdAt: '2026-09-14T06:00:00.000Z',
      updatedAt: '2026-09-14T06:00:00.000Z',
      a: W.interstellar,
      b: W.spaceship,
      context: {
        routeName: '地球という船',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '宇宙船地球号',
        score: [4, 4, 4, 4],
        headline: '人類は、\n船を乗り換えられるのか。',
        slug: 'interstellar--spaceship-earth',
        relation: 'バックミンスター・フラー『宇宙船地球号 操縦マニュアル』── 地球 ── 『インターステラー』',
        leftStation: 'インターステラー',
        rightStation: '宇宙船地球号',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>バックミンスター・フラーは、地球を、限られた資源で宇宙を航行する一隻の船にたとえ、人類はその操縦法を学ばねばならないと説いた。</p><p>『インターステラー』の人類は、その船がもう持たないと知り、乗り換える先を探しに星の海へ出る。</p><p>操縦法を学べなかった未来と、学ぼうとする現在。フラーの言葉は、映画を観たあとに読むと、半世紀前からの警告として響く。</p>'
      }
    },

    {
      id: 'seed-washida-kiyokazu--jidai-no-kishimi',
      createdAt: '2026-09-14T05:50:00.000Z',
      updatedAt: '2026-09-14T05:50:00.000Z',
      a: W.washida,
      b: W.kishimi,
      context: {
        routeName: '書き手と本',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        basis: '前田先生の note（2017–2018）',
        headline: '時代を拒むほど、\n時代に絡めとられる。',
        slug: 'washida-kiyokazu--jidai-no-kishimi',
        relation: '鷲田清一 ──『時代のきしみ——〈わたし〉と国家のあいだ』',
        leftStation: '鷲田清一',
        rightStation: '〈わたし〉と国家のあいだ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>前田先生が書き写した一節から。</strong></p><p>鷲田清一は、ひとは時代を拒否し、時代から遁走しようとするほど、より緻密に時代に絡めとられてゆく、と書く。法律や制度、習俗や縁といった生の背景が、もはや背景ではすまなくなるからだ。</p><p>わたしたちの存在を編んでいる意味の糸は、思考や欲望のかたちだけでなく、それに抵抗するスタイルまでも決めてしまう。前田先生は2017年の暮れ、この一節を note に書き写している。</p>'
      }
    },

    {
      id: 'seed-jidai-no-kishimi--hannah-arendt',
      createdAt: '2026-09-14T05:40:00.000Z',
      updatedAt: '2026-09-14T05:40:00.000Z',
      a: W.kishimi,
      b: W.arendt,
      context: {
        routeName: '個人と国家',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '個人と国家',
        score: [3, 4, 4, 4],
        headline: '〈わたし〉と国家の\nあいだに立つ。',
        slug: 'jidai-no-kishimi--hannah-arendt',
        relation: '鷲田清一『時代のきしみ——〈わたし〉と国家のあいだ』── 個人と国家 ── ハンナ・アーレント',
        leftStation: '〈わたし〉と国家のあいだ',
        rightStation: 'ハンナ・アーレント',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>ハンナ・アーレントは『全体主義の起原』で、国家が個人を丸ごと呑み込むしくみを分析し、アイヒマン裁判の報告では、命令に従っただけの凡庸な人間が巨大な悪を担うことを示した。</p><p>鷲田清一は、国家への抵抗のスタイルまでもが時代に規定されてしまうことを書いた。</p><p>個人は国家の外に立てるのか。二人の哲学者は、半世紀を隔てて、同じ〈わたし〉と国家のあいだに立っている。</p>'
      }
    },

    {
      id: 'seed-washida-kiyokazu--homme-less',
      createdAt: '2026-09-14T05:30:00.000Z',
      updatedAt: '2026-09-14T05:30:00.000Z',
      a: W.washida,
      b: W.hommeless,
      context: {
        routeName: '服を着る哲学',
        label: 'CONTEXT',
        kind: '似ている',
        hub: 'ファッション',
        score: [5, 4, 4, 3],
        headline: '哲学者は、\n服を着ることを考えた。',
        slug: 'washida-kiyokazu--homme-less',
        relation: '鷲田清一『モードの迷宮』── ファッション ── 映画『ホームレス ニューヨークと寝た男』',
        leftStation: '鷲田清一',
        rightStation: 'ホームレス ニューヨークと寝た男',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>鷲田清一は『モードの迷宮』などで、服を着ることを、自分と世界との境目をつくる行為として考えてきた。</p><p>『ホームレス ニューヨークと寝た男』のマーク・レイは、家を持たないまま、仕立てのよい服に身を包み、ファッション写真家としてマンハッタンの華やかな場に立ち続ける。</p><p>住まいを失っても、装いは手放さない。服が人を支えるとはどういうことか。哲学者の問いに、一人の男の暮らしが答えているように見える。</p>'
      }
    },

    {
      id: 'seed-do-androids-dream--blade-runner',
      createdAt: '2026-09-14T05:20:00.000Z',
      updatedAt: '2026-09-14T05:20:00.000Z',
      a: W.androids,
      b: W.br,
      context: {
        routeName: '小説から映画へ',
        label: 'CONTEXT',
        kind: '事実',
        hub: '原作',
        score: [2, 5, 5, 5],
        basis: '前田先生の note（2017–2018）',
        headline: '電気羊の夢は、\n酸性雨の街になった。',
        slug: 'do-androids-dream--blade-runner',
        relation: 'フィリップ・K・ディック『アンドロイドは電気羊の夢を見るか？』（1968）── 映画化 ── 『ブレードランナー』（1982）',
        leftStation: 'アンドロイドは電気羊の夢を見るか？',
        rightStation: 'ブレードランナー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>原作の題は、問いの形をしている。</strong></p><p>ディックの小説で、賞金稼ぎリック・デッカードが追うのは、人間と見分けのつかないアンドロイドである。本物の動物を飼うことが豊かさのしるしになった世界で、彼は電気仕掛けの羊を飼っている。</p><p>リドリー・スコットの『ブレードランナー』は、題も舞台も大きく変え、ロサンゼルスの酸性雨の夜を描いた。それでも、共感できることが人間の証なのかという原作の問いは、映画の最後の雨の場面までまっすぐに届いている。</p><p>前田先生は、ディックの別の小説に出てくる、自動運転タクシーが夫婦のあり方を諭す場面を紹介している。機械のほうが人間らしい、というディックの皮肉は、この作品にも通っている。</p>'
      }
    },

    {
      id: 'seed-isaac-asimov--do-androids-dream',
      createdAt: '2026-09-14T05:10:00.000Z',
      updatedAt: '2026-09-14T05:10:00.000Z',
      a: W.asimov,
      b: W.androids,
      context: {
        routeName: '人に似せて作られたもの',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '人に似せて作られたもの',
        score: [3, 4, 4, 4],
        headline: 'ロボットは三原則を守り、\nアンドロイドは嘘をつく。',
        slug: 'isaac-asimov--do-androids-dream',
        relation: 'アイザック・アシモフ ── 人に似せて作られた機械 ── フィリップ・K・ディック『アンドロイドは電気羊の夢を見るか？』',
        leftStation: 'アイザック・アシモフ',
        rightStation: 'アンドロイドは電気羊の夢を見るか？',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>アシモフは、人間に危害を加えないことなどを定めた「ロボット工学三原則」を考え、ロボットが人間と共に生きる物語を数多く書いた。</p><p>ディックのアンドロイドは、人間になりすまし、見分けるには共感の反応を測るしかない。</p><p>人間に仕える機械と、人間に紛れ込む機械。同じ時代のアメリカのSFが、人に似せて作られたものを正反対の方向から描いた。</p>'
      }
    },

    {
      id: 'seed-greg-egan--blade-runner-2049',
      createdAt: '2026-09-14T05:00:00.000Z',
      updatedAt: '2026-09-14T05:00:00.000Z',
      a: W.egan,
      b: W.br2049,
      context: {
        routeName: '記憶は誰のものか',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '記憶と自己',
        score: [4, 4, 4, 4],
        headline: '植えつけられた記憶でも、\nそれは自分なのか。',
        slug: 'greg-egan--blade-runner-2049',
        relation: 'グレッグ・イーガン ── 複製された意識と記憶 ── 『ブレードランナー 2049』',
        leftStation: 'グレッグ・イーガン',
        rightStation: '2049',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>グレッグ・イーガンは『順列都市』や『ディアスポラ』で、コンピュータの中に写し取られた意識や、自分のコピーと向き合う人間を、数学と物理の言葉で描いてきた。</p><p>『ブレードランナー 2049』の主人公Kは、自分の記憶が植えつけられたものかもしれないと知りながら、それでも自分の意味を探し続ける。</p><p>記憶が作りものでも、それを生きる自分は本物なのか。映画とハードSFが、同じ問いを別々の道具で掘り下げている。</p>'
      }
    },

    {
      id: 'seed-terry-gilliam--the-zero-theorem',
      createdAt: '2026-09-14T04:50:00.000Z',
      updatedAt: '2026-09-14T04:50:00.000Z',
      a: W.gilliam,
      b: W.zero,
      context: {
        routeName: '監督と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [2, 4, 4, 5],
        headline: '管理社会の三作目。',
        slug: 'terry-gilliam--the-zero-theorem',
        relation: 'テリー・ギリアム ── 監督 ──『ゼロの未来』',
        leftStation: 'テリー・ギリアム',
        rightStation: 'ゼロの未来',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>『未来世紀ブラジル』『12モンキーズ』に続くディストピア。</strong></p><p>『ゼロの未来』は、巨大企業の管理のもとで「ゼロの定理」の証明を命じられた孤独なプログラマーの物語で、『未来世紀ブラジル』『12モンキーズ』と並べて、ギリアムのディストピア三部作と呼ばれることがある。</p><p>書類の社会から、画面とネットワークの社会へ。30年を隔てて、ギリアムは同じ悪夢を、時代の道具に合わせて描き直した。</p>'
      }
    },

    {
      id: 'seed-terry-gilliam--brazil',
      createdAt: '2026-09-14T04:40:00.000Z',
      updatedAt: '2026-09-14T04:40:00.000Z',
      a: W.gilliam,
      b: W.brazil,
      context: {
        routeName: '監督と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [1, 4, 5, 5],
        headline: '夢に逃げる役人を、\n監督は救わなかった。',
        slug: 'terry-gilliam--brazil',
        relation: 'テリー・ギリアム ── 監督 ──『未来世紀ブラジル』',
        leftStation: 'テリー・ギリアム',
        rightStation: '未来世紀ブラジル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>ハリウッドと戦った一本。</strong></p><p>『未来世紀ブラジル』は、結末をめぐって配給会社と激しく対立し、ギリアムが新聞に抗議の広告を出したことでも知られる。</p><p>モンティ・パイソンで培った悪夢のようなユーモアで、管理社会の中の個人を描く。ギリアムの作家としての姿勢が、もっともはっきり現れた作品である。</p>'
      }
    },

    {
      id: 'seed-the-zero-theorem--brazil',
      createdAt: '2026-09-14T04:30:00.000Z',
      updatedAt: '2026-09-14T04:30:00.000Z',
      a: W.zero,
      b: W.brazil,
      context: {
        routeName: '30年後の管理社会',
        label: 'CONTEXT',
        kind: '似ている',
        hub: 'ギリアムのディストピア',
        score: [3, 4, 4, 5],
        headline: '書類の迷宮から、\n画面の迷宮へ。',
        slug: 'the-zero-theorem--brazil',
        relation: 'テリー・ギリアム『未来世紀ブラジル』（1985）── ディストピア ──『ゼロの未来』（2013）',
        leftStation: 'ゼロの未来',
        rightStation: '未来世紀ブラジル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。同じ監督が、30年を隔てて同じ悪夢を描いた。</strong></p><p>『未来世紀ブラジル』の役人サムは、書類と配管の迷宮の中で、夢の中にだけ自由を見る。</p><p>『ゼロの未来』のプログラマー、コーエンは、画面とデータの迷宮の中で、人生の意味を待ち続ける。</p><p>紙の官僚制から、ネットワークの管理へ。道具は変わっても、個人が巨大なしくみの中で夢に逃げ込む構図は変わらない。</p>'
      }
    },

    {
      id: 'seed-foundation--isaac-asimov',
      createdAt: '2026-09-14T04:20:00.000Z',
      updatedAt: '2026-09-14T04:20:00.000Z',
      a: W.foundation,
      b: W.asimov,
      context: {
        routeName: '作者と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '帝国の崩壊を、\n数学が予言した。',
        slug: 'foundation--isaac-asimov',
        relation: 'アイザック・アシモフ ──『ファウンデーション』',
        leftStation: 'ファウンデーション',
        rightStation: 'アイザック・アシモフ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>ローマ帝国の衰亡史に着想を得た銀河の物語。</strong></p><p>アシモフは、ギボンの『ローマ帝国衰亡史』から着想を得て、銀河帝国の崩壊と、その後の暗黒時代を短くしようとする人々の物語を書いた。</p><p>個人の運命ではなく、人類全体のふるまいを統計で予測する「心理歴史学」。のちにアシモフは、この物語を自身のロボットものとも結びつけ、ひとつの未来史にまとめていった。</p>'
      }
    },

    {
      id: 'seed-foundation--pluribus',
      createdAt: '2026-09-14T04:10:00.000Z',
      updatedAt: '2026-09-14T04:10:00.000Z',
      a: W.foundation,
      b: W.pluribus,
      context: {
        routeName: '同じ配信の窓',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'Apple TV+',
        score: [3, 3, 3, 3],
        headline: '銀河の帝国と、\nひとつになった人類。',
        slug: 'foundation--pluribus',
        relation: 'アイザック・アシモフ『ファウンデーション』── Apple TV+ ── 『プルリブス』',
        leftStation: 'ファウンデーション',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブは配信サービス Apple TV+。</strong></p><p>『ファウンデーション』は2021年から Apple TV+ でドラマになった。『プルリブス』も Apple TV+ のために作られたドラマである。</p><p>個人を超えた「全体」の行方を描く二つの物語が、同じ画面に並ぶ。数学で人類の未来を予測する物語と、人類の心がひとつになる物語。個と全体をめぐる問いは、配信の時代のSFの大きな主題になっている。</p>'
      }
    },

    {
      id: 'seed-youssou-ndour--peter-gabriel',
      createdAt: '2026-09-14T04:00:00.000Z',
      updatedAt: '2026-09-14T04:00:00.000Z',
      a: W.youssou,
      b: W.gabriel,
      context: {
        routeName: '「イン・ユア・アイズ」',
        label: 'CONTEXT',
        kind: '事実',
        hub: '「イン・ユア・アイズ」',
        score: [3, 5, 4, 5],
        headline: 'セネガルの声が、\n英国の曲の最後を歌った。',
        slug: 'youssou-ndour--peter-gabriel',
        relation: 'ピーター・ガブリエル「イン・ユア・アイズ」── 共演 ── ユッスー・ンドゥール',
        leftStation: 'ユッスー・ンドゥール',
        rightStation: 'ピーター・ガブリエル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>二人は何度も同じ舞台に立った。</strong></p><p>ピーター・ガブリエルの1986年のアルバム『So』に収められた「イン・ユア・アイズ」では、終盤でユッスー・ンドゥールがウォロフ語で歌う。</p><p>ガブリエルは世界の音楽を紹介するレーベルと音楽祭 WOMAD を立ち上げ、ユッスーをはじめとするアフリカの音楽家を世界に紹介した。二人はツアーでも共演を重ね、英国のロックとセネガルの音楽をつないだ。</p>'
      }
    },

    {
      id: 'seed-peter-gabriel--david-bowie',
      createdAt: '2026-09-14T03:50:00.000Z',
      updatedAt: '2026-09-14T03:50:00.000Z',
      a: W.gabriel,
      b: W.bowie,
      context: {
        routeName: '「ヒーローズ」',
        label: 'CONTEXT',
        kind: '事実',
        hub: '「ヒーローズ」',
        score: [3, 4, 4, 4],
        headline: 'ボウイの「ヒーローズ」を、\nガブリエルが歌い直した。',
        slug: 'peter-gabriel--david-bowie',
        relation: 'デヴィッド・ボウイ「ヒーローズ」── カバー ── ピーター・ガブリエル',
        leftStation: 'ピーター・ガブリエル',
        rightStation: 'デヴィッド・ボウイ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>ハブは一曲の歌。</strong></p><p>デヴィッド・ボウイの「ヒーローズ」（1977）は、ベルリンの壁のそばで逢う恋人たちを歌った曲である。</p><p>ピーター・ガブリエルは2010年のアルバム『スクラッチ・マイ・バック』で、この曲をオーケストラだけの伴奏で歌い直した。英国のロックを変えた二人の音楽家が、一曲の歌を通じて向き合っている。</p>'
      }
    },

    {
      id: 'seed-david-bowie--merry-christmas-mr-lawrence',
      createdAt: '2026-09-14T03:40:00.000Z',
      updatedAt: '2026-09-14T03:40:00.000Z',
      a: W.bowie,
      b: W.merryxmas,
      context: {
        routeName: '出演',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '出演',
        score: [2, 5, 4, 5],
        headline: 'ロックスターは、\n捕虜収容所の少佐になった。',
        slug: 'david-bowie--merry-christmas-mr-lawrence',
        relation: 'デヴィッド・ボウイ ── 出演 ── 大島渚『戦場のメリークリスマス』',
        leftStation: 'デヴィッド・ボウイ',
        rightStation: '戦場のメリークリスマス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>音楽家たちが俳優として並んだ映画。</strong></p><p>大島渚の『戦場のメリークリスマス』で、デヴィッド・ボウイは捕虜の英国人少佐セリアズを演じた。収容所長ヨノイ大尉を演じたのは坂本龍一、ハラ軍曹を演じたのはビートたけしである。</p><p>本業が俳優ではない三人の存在感が、国と文化の違いを越えて惹かれ合う男たちの物語に、独特の緊張を与えている。</p>'
      }
    },

    {
      id: 'seed-merry-christmas-mr-lawrence--the-seed-and-the-sower',
      createdAt: '2026-09-14T03:30:00.000Z',
      updatedAt: '2026-09-14T03:30:00.000Z',
      a: W.merryxmas,
      b: W.seed,
      context: {
        routeName: '小説から映画へ',
        label: 'CONTEXT',
        kind: '事実',
        hub: '原作',
        score: [2, 5, 5, 5],
        headline: '捕虜の記憶が、\n一つの映画になった。',
        slug: 'merry-christmas-mr-lawrence--the-seed-and-the-sower',
        relation: 'ローレンス・ヴァン・デル・ポスト『影の獄にて』（1963）── 映画化 ── 大島渚『戦場のメリークリスマス』（1983）',
        leftStation: '戦場のメリークリスマス',
        rightStation: '影の獄にて',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>作者自身の捕虜体験が原点にある。</strong></p><p>ヴァン・デル・ポストは第二次世界大戦中、ジャワで日本軍の捕虜になった。その体験をもとに書かれたのが『影の獄にて』である。</p><p>大島渚はこの物語を、日本人と英国人、看守と捕虜のあいだに生まれる、名づけようのない感情の映画にした。敵同士でありながら互いを理解しようとした人間の記憶が、小説から映画へ受け渡されている。</p>'
      }
    },

    {
      id: 'seed-merry-christmas-mr-lawrence--minamata',
      createdAt: '2026-09-14T03:20:00.000Z',
      updatedAt: '2026-09-14T03:20:00.000Z',
      a: W.merryxmas,
      b: W.minamata,
      context: {
        routeName: '坂本龍一を経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '坂本龍一',
        score: [4, 5, 4, 4],
        headline: '同じ作曲家が、\n40年を隔てて音楽をつけた。',
        slug: 'merry-christmas-mr-lawrence--minamata',
        relation: '大島渚『戦場のメリークリスマス』── 坂本龍一 ── 映画『MINAMATA』',
        leftStation: '戦場のメリークリスマス',
        rightStation: 'MINAMATA',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブは音楽家・坂本龍一。</strong></p><p>『戦場のメリークリスマス』（1983）の音楽は、ヨノイ大尉を演じた坂本龍一が作曲した。そのテーマ曲は、いまも世界中で演奏されている。</p><p>坂本龍一は2020年の映画『MINAMATA』でも音楽を担当した。戦争の傷と、公害の傷。日本が世界に向き合わねばならなかった二つの出来事の映画に、同じ作曲家が音を与えている。</p>'
      }
    },

    {
      id: 'seed-minakata-kumagusu--minakata-mandala',
      createdAt: '2026-09-14T03:10:00.000Z',
      updatedAt: '2026-09-14T03:10:00.000Z',
      a: W.minakata,
      b: W.mandala,
      context: {
        routeName: '書き手と図',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '世界のつながりを、\n一枚の図に描いた。',
        slug: 'minakata-kumagusu--minakata-mandala',
        relation: '南方熊楠 ── 南方曼荼羅',
        leftStation: '南方熊楠',
        rightStation: '南方曼荼羅',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>博物学者が描いた、世界のしくみの図。</strong></p><p>南方熊楠は、真言宗の僧・土宜法竜に宛てた手紙の中で、世界の出来事が必然と偶然で複雑に絡み合うさまを、線の交わる一枚の図に描いた。のちに「南方曼荼羅」と呼ばれるものである。</p><p>粘菌から民俗学まで、あらゆるものを観察した熊楠にとって、世界は一本の因果の線ではなく、無数の線が交わる網だった。</p>'
      }
    },

    {
      id: 'seed-minakata-mandala--minakata-toki-letters',
      createdAt: '2026-09-14T03:00:00.000Z',
      updatedAt: '2026-09-14T03:00:00.000Z',
      a: W.mandala,
      b: W.letters,
      context: {
        routeName: '手紙の中の曼荼羅',
        label: 'CONTEXT',
        kind: '事実',
        hub: '往復書簡',
        score: [3, 4, 5, 5],
        headline: 'その図は、\n手紙に描かれていた。',
        slug: 'minakata-mandala--minakata-toki-letters',
        relation: '南方曼荼羅 ──『南方熊楠 土宜法竜 往復書簡』',
        leftStation: '南方曼荼羅',
        rightStation: '南方熊楠 土宜法竜 往復書簡',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>曼荼羅は、ひとりの僧への返事として生まれた。</strong></p><p>南方熊楠と土宜法竜は、1893年にロンドンで出会い、その後も長く手紙を交わした。仏教と西洋の科学、因果と偶然をめぐる議論のなかで、熊楠は自分の考えを一枚の図にして法竜に送った。</p><p>往復書簡を読むと、南方曼荼羅は完成した理論ではなく、対話の途中で生まれた思考の形だったことがわかる。</p>'
      }
    },

    {
      id: 'seed-minakata-kumagusu--natsume-soseki',
      createdAt: '2026-09-14T02:50:00.000Z',
      updatedAt: '2026-09-14T02:50:00.000Z',
      a: W.minakata,
      b: W.soseki,
      context: {
        routeName: 'ロンドンですれ違う',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'ロンドン',
        score: [5, 4, 5, 3],
        headline: '同じ年に生まれた二人は、\nロンドンですれ違った。',
        slug: 'minakata-kumagusu--natsume-soseki',
        relation: '南方熊楠（1867年生まれ）── ロンドン ── 夏目漱石（1867年生まれ）',
        leftStation: '南方熊楠',
        rightStation: '夏目漱石',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>ハブはロンドン。同じ年に生まれた二人の、すれ違い。</strong></p><p>南方熊楠と夏目漱石は、どちらも1867年に生まれた。熊楠は1892年から1900年までロンドンに住み、大英博物館に通って学んだ。</p><p>熊楠がロンドンを離れたのは1900年9月。その翌月の10月末、入れ替わるように漱石が留学生としてロンドンに着く。</p><p>下宿にこもって神経をすり減らした漱石と、博物館で世界中の書物を読みあさった熊楠。同じ都市で、同じ時代に、正反対の留学生活を送った二人が、あとわずかで出会い損ねている。</p>'
      }
    },

    {
      id: 'seed-james-j-gibson--affordance',
      createdAt: '2026-09-14T02:40:00.000Z',
      updatedAt: '2026-09-14T02:40:00.000Z',
      a: W.gibson,
      b: W.affordance,
      context: {
        routeName: '名づけた人',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '造語',
        score: [1, 4, 4, 5],
        headline: '椅子は、\n座ることを差し出している。',
        slug: 'james-j-gibson--affordance',
        relation: 'ジェームズ・J・ギブソン ── アフォーダンス',
        leftStation: 'ジェームズ・J・ギブソン',
        rightStation: 'アフォーダンス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>知覚の心理学をひっくり返した言葉。</strong></p><p>ギブソンは、動物が世界を知覚するのは、頭の中で情報を組み立てるからではなく、環境そのものが行為の可能性を差し出しているからだと考えた。英語の afford から、その可能性を「アフォーダンス」と名づけた。</p><p>この考えは、のちにデザインの世界で広く使われるようになり、押したくなる扉、つかみたくなる取っ手をつくる考え方の土台になった。</p>'
      }
    },

    {
      id: 'seed-affordance--martin-heidegger',
      createdAt: '2026-09-14T02:30:00.000Z',
      updatedAt: '2026-09-14T02:30:00.000Z',
      a: W.affordance,
      b: W.heidegger,
      context: {
        routeName: '道具の哲学',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '道具',
        score: [4, 4, 4, 4],
        headline: '金槌は、\n使うときにだけ現れる。',
        slug: 'affordance--martin-heidegger',
        relation: 'マルティン・ハイデッガー『存在と時間』── 道具 ── アフォーダンス',
        leftStation: 'アフォーダンス',
        rightStation: 'ハイデッガー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>ハイデッガーは『存在と時間』で、わたしたちは金槌を「物」として眺める前に、まず手になじむ道具として使っている、と書いた。</p><p>ギブソンのアフォーダンスも、環境を、行為の可能性として知覚されるものとして捉える。</p><p>世界を観察の対象としてではなく、行為の手がかりとして見る。哲学と心理学が、別々の道から同じ地点に立っている。</p>'
      }
    },

    {
      id: 'seed-affordance--minakata-mandala',
      createdAt: '2026-09-14T02:20:00.000Z',
      updatedAt: '2026-09-14T02:20:00.000Z',
      a: W.affordance,
      b: W.mandala,
      context: {
        routeName: '関係から世界を見る',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '関係',
        score: [5, 3, 4, 3],
        headline: '物ではなく、\nつながりを見る。',
        slug: 'affordance--minakata-mandala',
        relation: '南方曼荼羅 ── 関係の網 ── アフォーダンス',
        leftStation: 'アフォーダンス',
        rightStation: '南方曼荼羅',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>南方熊楠は、世界を、因果と偶然の線が交わる網として描いた。</p><p>ギブソンのアフォーダンスは、物の性質を、それを使う動物との関係のなかにあるものとして捉えた。</p><p>物そのものではなく、物と物、物と生きものとの「あいだ」から世界を見る。明治の博物学者と20世紀の心理学者は、同じまなざしを持っていた。二つの作品のあいだにつながりを見るこのサービスの考え方にも近い。</p>'
      }
    },

    {
      id: 'seed-martin-heidegger--hannah-arendt',
      createdAt: '2026-09-14T02:10:00.000Z',
      updatedAt: '2026-09-14T02:10:00.000Z',
      a: W.heidegger,
      b: W.arendt,
      context: {
        routeName: '師と弟子',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'マールブルク大学',
        score: [3, 5, 5, 4],
        headline: '哲学者と、\nその学生だった哲学者。',
        slug: 'martin-heidegger--hannah-arendt',
        relation: 'マルティン・ハイデッガー ── マールブルク大学 ── ハンナ・アーレント',
        leftStation: 'ハイデッガー',
        rightStation: 'ハンナ・アーレント',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>生涯にわたって続いた、複雑な関係。</strong></p><p>1924年、18歳のハンナ・アーレントは、マールブルク大学でハイデッガーの講義を受け、二人は恋愛関係になった。</p><p>やがてハイデッガーはナチスに加わり、ユダヤ人のアーレントはドイツを逃れる。それでも戦後、二人は再会し、アーレントはハイデッガーの著作を英語圏に紹介することにも力を尽くした。考えることを教えた師と、その師がなぜ誤ったのかを考え続けた弟子の関係である。</p>'
      }
    },

    {
      id: 'seed-hannah-arendt--nineteen-eighty-four',
      createdAt: '2026-09-14T02:00:00.000Z',
      updatedAt: '2026-09-14T02:00:00.000Z',
      a: W.arendt,
      b: W.n1984,
      context: {
        routeName: '全体主義',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '全体主義',
        score: [3, 4, 5, 5],
        headline: '人を丸ごと呑み込む\n国家のしくみ。',
        slug: 'hannah-arendt--nineteen-eighty-four',
        relation: 'ハンナ・アーレント『全体主義の起原』── 全体主義 ── ジョージ・オーウェル『1984年』',
        leftStation: 'ハンナ・アーレント',
        rightStation: '1984年',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>アーレントの『全体主義の起原』とオーウェルの『1984年』は、どちらも第二次世界大戦のあと、ナチズムとスターリニズムの経験から書かれた。</p><p>孤立した個人をイデオロギーとテロルで組織する体制を、アーレントは歴史と政治の言葉で分析し、オーウェルは物語の言葉で描いた。</p><p>分析と寓話。同じ時代の二つの書物は、全体主義を理解するための両輪として、いまも並べて読まれている。</p>'
      }
    },

    {
      id: 'seed-buckminster-fuller--spaceship-earth',
      createdAt: '2026-09-14T01:50:00.000Z',
      updatedAt: '2026-09-14T01:50:00.000Z',
      a: W.fuller,
      b: W.spaceship,
      context: {
        routeName: '作者と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '地球には、\n操縦マニュアルがない。',
        slug: 'buckminster-fuller--spaceship-earth',
        relation: 'バックミンスター・フラー ──『宇宙船地球号 操縦マニュアル』',
        leftStation: 'バックミンスター・フラー',
        rightStation: '宇宙船地球号',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>「宇宙船地球号」を広めた一冊。</strong></p><p>フラーは1969年、『宇宙船地球号 操縦マニュアル』で、地球を限られた資源で航行する船にたとえ、人類は細分化された専門の知ではなく、全体を見渡す知でその船を操縦すべきだと説いた。</p><p>ジオデシック・ドームを考え、「より少ないもので、より多くを」を唱えたフラーの思想は、のちの環境運動やシリコンバレーの文化に大きな影響を与えた。</p>'
      }
    },

    {
      id: 'seed-buckminster-fuller--think-different',
      createdAt: '2026-09-14T01:40:00.000Z',
      updatedAt: '2026-09-14T01:40:00.000Z',
      a: W.fuller,
      b: W.think,
      context: {
        routeName: 'クレイジーな人たち',
        label: 'CONTEXT',
        kind: '事実',
        hub: '「クレイジーな人たち」',
        score: [4, 4, 4, 4],
        headline: '世界を変えられると\n本気で信じた人。',
        slug: 'buckminster-fuller--think-different',
        relation: 'バックミンスター・フラー ── 広告に登場 ── アップル「Think Different」',
        leftStation: 'バックミンスター・フラー',
        rightStation: 'Think Different',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>広告に登場した一人。</strong></p><p>1997年のアップルの「Think Different」のテレビ広告には、アインシュタイン、キング牧師、ガンディー、ピカソらとともに、バックミンスター・フラーの姿が登場する。</p><p>建築家とも発明家とも詩人ともつかない、分類できない思想家。自分は世界を変えられると信じる人こそが世界を変える、という広告の言葉に、フラーほどふさわしい人はいなかった。</p>'
      }
    },

    {
      id: 'seed-the-outsider--colin-wilson',
      createdAt: '2026-09-14T01:30:00.000Z',
      updatedAt: '2026-09-14T01:30:00.000Z',
      a: W.outsider,
      b: W.wilson,
      context: {
        routeName: '作者と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 4, 5],
        headline: '24歳の作家は、\n図書館で書いた。',
        slug: 'the-outsider--colin-wilson',
        relation: 'コリン・ウィルソン ──『アウトサイダー』',
        leftStation: 'アウトサイダー',
        rightStation: 'コリン・ウィルソン',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>無名の青年のデビュー作が、ベストセラーになった。</strong></p><p>コリン・ウィルソンは、定職を持たず、野宿をしながら大英博物館の閲覧室に通って『アウトサイダー』を書いた。1956年に出版されると、たちまち話題になった。</p><p>社会の中に居場所を見いだせない人間。カミュやドストエフスキー、ゴッホやニジンスキーの中にその姿を見いだしたこの本は、作者自身の姿でもあった。</p>'
      }
    },

    {
      id: 'seed-the-outsider--tanaka-isson',
      createdAt: '2026-09-14T01:20:00.000Z',
      updatedAt: '2026-09-14T01:20:00.000Z',
      a: W.outsider,
      b: W.isson,
      context: {
        routeName: '中央から離れて',
        label: 'CONTEXT',
        kind: '似ている',
        hub: 'アウトサイダー',
        score: [5, 4, 4, 4],
        headline: '画壇の外で、\n描き続けた画家。',
        slug: 'the-outsider--tanaka-isson',
        relation: 'コリン・ウィルソン『アウトサイダー』── アウトサイダー ── 田中一村',
        leftStation: 'アウトサイダー',
        rightStation: '田中一村',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>ウィルソンの『アウトサイダー』は、社会の中に居場所を見いだせず、それでも自分の見たものを表現しようとした人々をたどった。</p><p>田中一村は、中央の画壇に認められないまま50歳で奄美大島に渡り、大島紬の染色工として働きながら、亜熱帯の植物と鳥を描き続けた。その作品が広く知られたのは、亡くなったあとのことである。</p><p>一村の生き方は、ウィルソンが描いたアウトサイダーの、日本のひとつの姿のように見える。</p>'
      }
    },

    {
      id: 'seed-the-outsider--k-pax',
      createdAt: '2026-09-14T01:10:00.000Z',
      updatedAt: '2026-09-14T01:10:00.000Z',
      a: W.outsider,
      b: W.kpax,
      context: {
        routeName: '外から来た者',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '外から来た者',
        score: [4, 4, 3, 3],
        headline: '彼は、\n遠い星から来たと言う。',
        slug: 'the-outsider--k-pax',
        relation: 'コリン・ウィルソン『アウトサイダー』── 外から来た者 ──『光の旅人 K-PAX』',
        leftStation: 'アウトサイダー',
        rightStation: '光の旅人 K-PAX',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『光の旅人 K-PAX』のプロートは、自分は K-PAX という星から来たと語り、精神科医のもとに送られる。けれども彼は、医師よりも宇宙のことをよく知り、患者たちの心をひらいていく。</p><p>ウィルソンのアウトサイダーは、社会の外に立つからこそ、社会の内側の人間には見えないものを見る。</p><p>外から来た者のまなざしが、内側の人間の生き方を照らす。映画は、ウィルソンが評論で描いた人物像を、一人の不思議な男の物語にしている。</p>'
      }
    },

    {
      id: 'seed-yasuhiko-yoshikazu--gundam-the-origin',
      createdAt: '2026-09-14T01:00:00.000Z',
      updatedAt: '2026-09-14T01:00:00.000Z',
      a: W.yasuhiko,
      b: W.origin,
      context: {
        routeName: '作者と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [2, 5, 4, 5],
        headline: 'ガンダムを、\n自分の手で描き直す。',
        slug: 'yasuhiko-yoshikazu--gundam-the-origin',
        relation: '安彦良和 ──『機動戦士ガンダム THE ORIGIN』',
        leftStation: '安彦良和',
        rightStation: 'ガンダム THE ORIGIN',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>アニメの原点を、原点の作り手が描いた。</strong></p><p>安彦良和は、1979年のテレビアニメ『機動戦士ガンダム』でキャラクターデザインと作画監督をつとめた。</p><p>2001年から10年にわたって描いた『機動戦士ガンダム THE ORIGIN』は、その物語を安彦自身が漫画として描き直したもので、アニメでは語られなかったシャアとセイラの少年時代も描かれている。</p>'
      }
    },

    {
      id: 'seed-yasuhiko-yoshikazu--niji-iro-no-trotsky',
      createdAt: '2026-09-14T00:50:00.000Z',
      updatedAt: '2026-09-14T00:50:00.000Z',
      a: W.yasuhiko,
      b: W.trotsky,
      context: {
        routeName: '作者と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [2, 4, 4, 5],
        headline: '満州の大学に、\nひとりの青年が送り込まれる。',
        slug: 'yasuhiko-yoshikazu--niji-iro-no-trotsky',
        relation: '安彦良和 ──『虹色のトロツキー』',
        leftStation: '安彦良和',
        rightStation: '虹色のトロツキー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>ガンダムの作り手が描いた、満州の歴史。</strong></p><p>『虹色のトロツキー』は、1938年の満州を舞台に、日本人とモンゴル人の血を引く青年ウムボルトが、建国大学に送り込まれ、トロツキーを満州に招くという謀略に巻き込まれていく物語である。</p><p>石原莞爾ら実在の人物が登場し、ノモンハン事件へと向かう歴史を背景にしている。安彦良和は、アニメーターから漫画家に転じたあと、近代史を題材にした作品を描き続けている。</p>'
      }
    },

    {
      id: 'seed-niji-iro-no-trotsky--historie',
      createdAt: '2026-09-14T00:40:00.000Z',
      updatedAt: '2026-09-14T00:40:00.000Z',
      a: W.trotsky,
      b: W.historie,
      context: {
        routeName: '二つの民族のあいだで',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '二つの出自',
        score: [4, 4, 5, 5],
        headline: 'どちらの民族にも、\n属しきれない主人公。',
        slug: 'niji-iro-no-trotsky--historie',
        relation: '安彦良和『虹色のトロツキー』── 二つの出自 ── 岩明均『ヒストリエ』',
        leftStation: '虹色のトロツキー',
        rightStation: 'ヒストリエ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『虹色のトロツキー』のウムボルトは、日本人の父とモンゴル人の母のあいだに生まれ、満州で自分がどちらの側に立つのかを問われ続ける。</p><p>『ヒストリエ』のエウメネスは、スキタイ人の子として生まれながら、ギリシア人として育てられ、自分の出自を知ったときから居場所を失う。</p><p>歴史の大きなうねりの中で、二つの民族のあいだに立つ若者。時代も場所も違う二つの歴史漫画が、同じ主人公像を持っている。</p>'
      }
    },

    {
      id: 'seed-sobagome-jiru--grechka',
      createdAt: '2026-09-14T00:30:00.000Z',
      updatedAt: '2026-09-14T00:30:00.000Z',
      a: W.sobagome,
      b: W.grechka,
      context: {
        routeName: 'そばの実',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'そばの実',
        score: [5, 4, 4, 4],
        headline: '麺にしないそばは、\n祖谷にもロシアにもある。',
        slug: 'sobagome-jiru--grechka',
        relation: '徳島県「そば米汁」── そばの実 ── ロシア「グレチャ」',
        leftStation: 'そば米汁',
        rightStation: 'グレチャ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>ハブはそばの実。</strong></p><p>日本でそばといえば麺だが、徳島県の山深い祖谷地方では、そばの実を塩ゆでして乾かした「そば米」を、鶏肉や野菜と煮込んだ汁にして食べてきた。</p><p>ロシアや東欧では、そばの実は「グレーチカ」と呼ばれ、粥や付け合わせとして毎日の食卓にのぼる。</p><p>寒く、米の育ちにくい土地で、そばの実はそのまま粒で食べられてきた。遠く離れた二つの土地の料理が、同じ一粒でつながっている。</p>'
      }
    },

    /* ---- 前田先生の確認を受けて足した区間（ヌルンジ＝赤坂の韓国料理店） ---- */
    {
      id: 'seed-iris--nurungji',
      createdAt: '2026-09-28T09:00:00.000Z',
      updatedAt: '2026-09-28T09:00:00.000Z',
      a: W.iris,
      b: W.nurungji,
      context: {
        routeName: 'ドラマから食卓へ',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '韓国',
        score: [4, 4, 3, 3],
        headline: '画面で見た国の味を、\n赤坂の一皿で。',
        slug: 'iris--nurungji',
        relation: '韓国ドラマ『アイリス』── 韓国 ── 赤坂の「ヌルンジ」',
        leftStation: 'アイリス',
        rightStation: 'ヌルンジ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>画面の向こうの国は、東京の街角にもある。</strong></p><p>『アイリス』は、韓国の特殊工作員を主人公にしたアクション・ドラマ。日本でも放送され、秋田でのロケも話題になった。</p><p>赤坂には韓国料理の店が集まる一角があり、「ヌルンジ」もそのひとつ。店名は韓国語で、釜の底にできるおこげのこと。韓国では、おこげに湯を注いだ「スンニュン」を食後に飲む習慣がある。</p><p>ドラマで知った国へのいちばん近い入口は、案外、一皿の料理なのかもしれない。</p>'
      }
    },

    {
      id: 'seed-kanyoro--nurungji',
      createdAt: '2026-09-28T08:50:00.000Z',
      updatedAt: '2026-09-28T08:50:00.000Z',
      a: KANYO,
      b: W.nurungji,
      context: {
        routeName: '東京の中の隣国',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '東京にある隣国の食卓',
        score: [4, 3, 3, 4],
        headline: '神田の中国料理と、\n赤坂の韓国料理。',
        slug: 'kanyoro--nurungji',
        relation: '中国名菜『漢陽楼』（神田）── 隣国の食卓 ── 「ヌルンジ」（赤坂）',
        leftStation: '漢陽楼',
        rightStation: 'ヌルンジ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>東京には、隣の国の台所がいくつもある。</strong></p><p>神田の「漢陽楼」は、明治四十四年創業を掲げる中国料理店。中国からの留学生が集い、若き周恩来も通ったと伝えられている。</p><p>赤坂の「ヌルンジ」は、韓国料理の店が集まる一角にある韓国料理店。店名は、釜の底にできるおこげを表す韓国語から来ている。</p><p>百年以上前の留学生にとっても、いまの東京で暮らす人にとっても、故郷の味を出す店は、遠い国とこの街をつなぐ小さな駅のような場所になっている。</p>'
      }
    },

    /* ---- 125 タイトル版の区間（生成AIの初稿） ---- */
    {
      id: 'seed-think-different--uniqlock',
      createdAt: '2026-09-30T09:00:00.000Z',
      updatedAt: '2026-09-30T09:00:00.000Z',
      a: W.think,
      b: W.uniqlock,
      context: {
        routeName: '時代を刻んだ広告',
        label: 'CONTEXT',
        kind: '似ている',
        hub: 'ブランドの映像広告',
        score: [4, 4, 4, 4],
        headline: '商品を映さずに、\nブランドを語った。',
        slug: 'think-different--uniqlock',
        relation: 'アップル「Think Different」── 商品を映さない広告 ── ユニクロ「UNIQLOCK」',
        leftStation: 'Think Different',
        rightStation: 'UNIQLOCK',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>商品を見せずに、世界観だけで記憶に残る。</strong></p><p>1997年のアップル「Think Different」は、コンピューターを一台も映さず、アインシュタインやガンディーら「世界を変えた人々」の姿を並べた。</p><p>2007年のユニクロ「UNIQLOCK」は、服の説明をせず、音楽とダンスと時計だけで時刻を刻み続けた。ブログに貼れる時計として世界中に広まり、カンヌ国際広告祭でグランプリを受けた。</p><p>二つの広告に共通するのは、商品を語る代わりに、ブランドが大切にしている態度そのものを見せたことだ。</p>'
      }
    },

    {
      id: 'seed-downfall--bruno-ganz',
      createdAt: '2026-09-30T08:50:00.000Z',
      updatedAt: '2026-09-30T08:50:00.000Z',
      a: W.downfall,
      b: W.ganz,
      context: {
        routeName: 'ヒトラーを演じた人',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '主演',
        score: [4, 4, 5, 4],
        headline: '天使を演じた俳優が、\n独裁者を演じた。',
        slug: 'downfall--bruno-ganz',
        relation: 'ブルーノ・ガンツ ── 主演 ── 『ヒトラー〜最期の12日間〜』',
        leftStation: 'ヒトラー 最期の12日間',
        rightStation: 'ブルーノ・ガンツ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>同じ俳優が、天使と独裁者を演じた。</strong></p><p>『ヒトラー〜最期の12日間〜』でヒトラーを演じたのは、スイス出身のブルーノ・ガンツ。怒鳴り、震え、ときに穏やかな老人にも見える姿は、それまでの「悪の記号」としてのヒトラー像を揺さぶった。</p><p>その17年前、ガンツは『ベルリン・天使の詩』で、人間を見守る天使ダミエルを演じていた。同じベルリンを舞台に、同じ俳優が、人を見つめる側と、人を滅ぼした側の両方を生きたことになる。</p>'
      }
    },

    {
      id: 'seed-bruno-ganz--wings-of-desire',
      createdAt: '2026-09-30T08:40:00.000Z',
      updatedAt: '2026-09-30T08:40:00.000Z',
      a: W.ganz,
      b: W.wings,
      context: {
        routeName: '天使ダミエル',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '出演',
        score: [4, 5, 5, 5],
        headline: '人の心の声を聞く天使は、\nやがて人間になった。',
        slug: 'bruno-ganz--wings-of-desire',
        relation: 'ブルーノ・ガンツ ── 天使ダミエル ── 『ベルリン・天使の詩』',
        leftStation: 'ブルーノ・ガンツ',
        rightStation: 'ベルリン・天使の詩',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>永遠よりも、一杯のコーヒーの温かさを選ぶ。</strong></p><p>『ベルリン・天使の詩』で、ブルーノ・ガンツは天使ダミエルを演じた。図書館や地下鉄で人々の心の声に耳を澄ませ、見守ることしかできない存在だ。</p><p>サーカスの空中ブランコ乗りに恋したダミエルは、永遠の命を捨てて人間になる。ガンツの静かなまなざしが、その選択に説得力を与えている。</p>'
      }
    },

    {
      id: 'seed-downfall--anthony-hopkins',
      createdAt: '2026-09-30T08:30:00.000Z',
      updatedAt: '2026-09-30T08:30:00.000Z',
      a: W.downfall,
      b: W.hopkins,
      context: {
        routeName: '二人のヒトラー',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '総統地下壕',
        score: [5, 3, 4, 4],
        headline: 'レクター博士も、\nヒトラーを演じていた。',
        slug: 'downfall--anthony-hopkins',
        relation: 'アンソニー・ホプキンス（『ザ・バンカー』1981）── 総統地下壕 ── 『ヒトラー〜最期の12日間〜』',
        leftStation: 'ヒトラー 最期の12日間',
        rightStation: 'アンソニー・ホプキンス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>同じ地下壕を、二人の名優が演じている。</strong></p><p>『ヒトラー〜最期の12日間〜』は、ベルリンの総統地下壕で過ごした最期の日々を描く。</p><p>その20年以上前、アンソニー・ホプキンスはアメリカのテレビ映画『ザ・バンカー』（1981）で、同じ地下壕のヒトラーを演じ、エミー賞を受けている。のちに『羊たちの沈黙』のレクター博士となる俳優だ。</p><p>ブルーノ・ガンツとホプキンス。二人の俳優が、同じ地下の閉ざされた空間で、同じ人物の最期を演じている。</p>'
      }
    },

    {
      id: 'seed-the-silence-of-the-lambs--jonathan-demme',
      createdAt: '2026-09-30T08:20:00.000Z',
      updatedAt: '2026-09-30T08:20:00.000Z',
      a: W.lambs,
      b: W.demme,
      context: {
        routeName: '監督と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [3, 4, 5, 4],
        headline: 'ライブ映画の監督が、\n戦慄のサスペンスを撮った。',
        slug: 'the-silence-of-the-lambs--jonathan-demme',
        relation: 'ジョナサン・デミ ── 監督 ── 『羊たちの沈黙』',
        leftStation: '羊たちの沈黙',
        rightStation: 'ジョナサン・デミ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>音楽を愛した監督が、沈黙を撮った。</strong></p><p>ジョナサン・デミは、トーキング・ヘッズのライブ映画『ストップ・メイキング・センス』で知られた監督だった。</p><p>その彼が撮った『羊たちの沈黙』は、アカデミー賞の作品・監督・主演男優・主演女優・脚色の主要5部門を独占した。俳優の顔を正面から捉えるカメラが、観客を登場人物と一対一で向き合わせる。</p>'
      }
    },

    {
      id: 'seed-the-silence-of-the-lambs--anthony-hopkins',
      createdAt: '2026-09-30T08:10:00.000Z',
      updatedAt: '2026-09-30T08:10:00.000Z',
      a: W.lambs,
      b: W.hopkins,
      context: {
        routeName: 'レクター博士',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: 'ハンニバル・レクター',
        score: [3, 4, 5, 5],
        headline: '16分ほどの出演で、\n主演男優賞をとった。',
        slug: 'the-silence-of-the-lambs--anthony-hopkins',
        relation: 'アンソニー・ホプキンス ── ハンニバル・レクター ── 『羊たちの沈黙』',
        leftStation: '羊たちの沈黙',
        rightStation: 'アンソニー・ホプキンス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>短い出演時間が、映画全体を支配した。</strong></p><p>アンソニー・ホプキンスが演じたハンニバル・レクターは、画面に登場する時間が長くない。それでも彼はアカデミー主演男優賞を受けた。</p><p>まばたきの少ない視線、ガラス越しの穏やかな声。檻の中にいるはずの男が、会話の主導権を握り続ける。その不気味さが、映画を観終えたあとも残り続ける。</p>'
      }
    },

    {
      id: 'seed-the-silence-of-the-lambs--jodie-foster',
      createdAt: '2026-09-30T08:00:00.000Z',
      updatedAt: '2026-09-30T08:00:00.000Z',
      a: W.lambs,
      b: W.foster,
      context: {
        routeName: 'クラリス・スターリング',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '主演',
        score: [3, 4, 5, 5],
        headline: '怪物と向き合ったのは、\n一人の訓練生だった。',
        slug: 'the-silence-of-the-lambs--jodie-foster',
        relation: 'ジョディ・フォスター ── クラリス・スターリング ── 『羊たちの沈黙』',
        leftStation: '羊たちの沈黙',
        rightStation: 'ジョディ・フォスター',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>恐怖の物語の中心にいるのは、若い女性の勇気だ。</strong></p><p>ジョディ・フォスターは、FBI訓練生クラリス・スターリングを演じ、二度目のアカデミー主演女優賞を受けた。</p><p>男たちの視線に囲まれながら、クラリスはレクターと取引し、自分の過去を差し出して手がかりを得る。フォスターの抑えた演技が、この物語をホラーではなく、一人の人間の成長の物語にしている。</p>'
      }
    },

    {
      id: 'seed-wings-of-desire--wim-wenders',
      createdAt: '2026-09-30T07:50:00.000Z',
      updatedAt: '2026-09-30T07:50:00.000Z',
      a: W.wings,
      b: W.wenders,
      context: {
        routeName: '監督と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '監督',
        score: [3, 4, 5, 5],
        headline: '壁のあった街を、\n天使の目で撮った。',
        slug: 'wings-of-desire--wim-wenders',
        relation: 'ヴィム・ヴェンダース ── 監督 ── 『ベルリン・天使の詩』',
        leftStation: 'ベルリン・天使の詩',
        rightStation: 'ヴィム・ヴェンダース',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>街を見下ろす天使のまなざしは、監督のまなざしでもある。</strong></p><p>ヴィム・ヴェンダースは、アメリカで『パリ、テキサス』を撮ったあと、故国ドイツに戻って『ベルリン・天使の詩』を撮った。東西に分かれていた時代のベルリンが舞台だ。</p><p>天使の見る世界はモノクロで、人間の世界はカラーで描かれる。のちに東京で『PERFECT DAYS』を撮るヴェンダースは、ここでもすでに、ありふれた日常の輝きを見つめている。</p>'
      }
    },

    {
      id: 'seed-wings-of-desire--peter-falk',
      createdAt: '2026-09-30T07:40:00.000Z',
      updatedAt: '2026-09-30T07:40:00.000Z',
      a: W.wings,
      b: W.falk,
      context: {
        routeName: '元天使',
        label: 'CONTEXT',
        kind: '事実',
        hub: '本人役',
        score: [5, 5, 4, 5],
        headline: 'コロンボ刑事は、\nかつて天使だった。',
        slug: 'wings-of-desire--peter-falk',
        relation: 'ピーター・フォーク（本人役）── 元天使 ── 『ベルリン・天使の詩』',
        leftStation: 'ベルリン・天使の詩',
        rightStation: 'ピーター・フォーク',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>映画の中のピーター・フォークは、ピーター・フォーク本人だ。</strong></p><p>『ベルリン・天使の詩』に、『刑事コロンボ』で知られるピーター・フォークが本人役で登場する。映画の撮影でベルリンを訪れている俳優という設定だ。</p><p>ところが物語が進むと、彼もかつては天使で、人間になることを選んだ一人だったことがわかる。姿の見えない天使に「そこにいるんだろう」と語りかける場面は、映画のなかでもとりわけ温かい。</p>'
      }
    },

    {
      id: 'seed-wings-of-desire--peter-handke',
      createdAt: '2026-09-30T07:30:00.000Z',
      updatedAt: '2026-09-30T07:30:00.000Z',
      a: W.wings,
      b: W.handke,
      context: {
        routeName: '天使の言葉',
        label: 'CONTEXT',
        kind: '事実',
        hub: '脚本',
        score: [4, 4, 5, 5],
        headline: '天使の言葉を書いたのは、\nのちのノーベル賞作家。',
        slug: 'wings-of-desire--peter-handke',
        relation: 'ペーター・ハントケ ── 脚本 ── 『ベルリン・天使の詩』',
        leftStation: 'ベルリン・天使の詩',
        rightStation: 'ペーター・ハントケ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>映画の詩は、作家の手で書かれた。</strong></p><p>『ベルリン・天使の詩』の脚本には、オーストリアの作家ペーター・ハントケが加わった。映画のなかで繰り返される「子どもが子どもだったころ」という詩も、ハントケの言葉だ。</p><p>ハントケは2019年にノーベル文学賞を受ける。映画の天使たちが語る言葉は、文学の言葉でもあった。</p>'
      }
    },

    {
      id: 'seed-peter-handke--nobel-literature-laureates',
      createdAt: '2026-09-30T07:20:00.000Z',
      updatedAt: '2026-09-30T07:20:00.000Z',
      a: W.handke,
      b: W.nobel,
      context: {
        routeName: '2019年の受賞',
        label: 'CONTEXT',
        kind: '事実',
        hub: '2019年',
        score: [3, 3, 4, 4],
        headline: '天使の詩を書いた作家は、\nノーベル文学賞を受けた。',
        slug: 'peter-handke--nobel-literature-laureates',
        relation: 'ペーター・ハントケ ── 2019年 ── ノーベル文学賞',
        leftStation: 'ペーター・ハントケ',
        rightStation: 'ノーベル文学賞',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>映画の脚本家は、小説家であり劇作家だった。</strong></p><p>ペーター・ハントケは2019年、ノーベル文学賞を受けた。劇作『観客罵倒』や小説で、言葉と知覚そのものを問い直してきた作家だ。</p><p>受賞には政治的な発言をめぐる批判もあった。文学賞が作品だけでなく、作家という人間をも問われる賞であることを示した年でもある。</p>'
      }
    },

    {
      id: 'seed-t-s-eliot--nobel-literature-laureates',
      createdAt: '2026-09-30T07:10:00.000Z',
      updatedAt: '2026-09-30T07:10:00.000Z',
      a: W.eliot,
      b: W.nobel,
      context: {
        routeName: '1948年の受賞',
        label: 'CONTEXT',
        kind: '事実',
        hub: '1948年',
        score: [3, 3, 4, 4],
        headline: '『荒地』の詩人は、\n1948年に受賞した。',
        slug: 't-s-eliot--nobel-literature-laureates',
        relation: 'T・S・エリオット ── 1948年 ── ノーベル文学賞',
        leftStation: 'T・S・エリオット',
        rightStation: 'ノーベル文学賞',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>現代の詩の形を変えた詩人が、世界に認められた。</strong></p><p>T・S・エリオットは1948年にノーベル文学賞を受けた。アメリカに生まれ、英国に帰化した詩人である。</p><p>『荒地』や『うつろな人々』で、第一次世界大戦後の空虚さを断片的な言葉のコラージュで描いた。その手法は、詩だけでなく、映画や音楽にも影響を与えていく。</p>'
      }
    },

    {
      id: 'seed-the-grapes-of-wrath--nobel-literature-laureates',
      createdAt: '2026-09-30T07:00:00.000Z',
      updatedAt: '2026-09-30T07:00:00.000Z',
      a: W.grapes,
      b: W.nobel,
      context: {
        routeName: '1962年の受賞',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'ジョン・スタインベック',
        score: [3, 3, 4, 4],
        headline: '砂嵐の時代を描いて、\nノーベル賞へ。',
        slug: 'the-grapes-of-wrath--nobel-literature-laureates',
        relation: 'ジョン・スタインベック『怒りの葡萄』── 作者 ── ノーベル文学賞（1962）',
        leftStation: '怒りの葡萄',
        rightStation: 'ノーベル文学賞',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>土地を追われた人々の物語は、世界の文学になった。</strong></p><p>『怒りの葡萄』は、ダストボウルで土地を失いカリフォルニアへ向かう一家を描いた。</p><p>作者ジョン・スタインベックは1962年にノーベル文学賞を受けた。社会の底辺で生きる人々へのまなざしが、国境を越えて読まれ続けている。</p>'
      }
    },

    {
      id: 'seed-elmer-gantry--nobel-literature-laureates',
      createdAt: '2026-09-30T06:50:00.000Z',
      updatedAt: '2026-09-30T06:50:00.000Z',
      a: W.elmer,
      b: W.nobel,
      context: {
        routeName: '1930年の受賞',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'シンクレア・ルイス',
        score: [4, 3, 4, 4],
        headline: '伝道者を皮肉った作家は、\nアメリカ初の受賞者。',
        slug: 'elmer-gantry--nobel-literature-laureates',
        relation: 'シンクレア・ルイス（原作）── 1930年 ── ノーベル文学賞',
        leftStation: 'エルマー・ガントリー',
        rightStation: 'ノーベル文学賞',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>原作の小説家は、アメリカで最初のノーベル文学賞作家だった。</strong></p><p>映画「エルマー・ガントリー」の原作は、シンクレア・ルイスの同名小説（1927）。宗教を商売にする伝道者の姿を皮肉に描いた。</p><p>ルイスは1930年、アメリカの作家として初めてノーベル文学賞を受けた。アメリカ社会の俗物根性を鋭く描いた作家である。</p>'
      }
    },

    {
      id: 'seed-cats--t-s-eliot',
      createdAt: '2026-09-30T06:40:00.000Z',
      updatedAt: '2026-09-30T06:40:00.000Z',
      a: W.cats,
      b: W.eliot,
      context: {
        routeName: '猫の詩集',
        label: 'CONTEXT',
        kind: '事実',
        hub: '原作の詩集',
        score: [5, 5, 4, 4],
        headline: '『荒地』の詩人が、\n猫の詩も書いていた。',
        slug: 'cats--t-s-eliot',
        relation: 'T・S・エリオットの詩集 ── 原作 ── ミュージカル『キャッツ』',
        leftStation: 'キャッツ',
        rightStation: 'T・S・エリオット',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>難解な詩人が、子どもたちのために猫の詩を書いた。</strong></p><p>ミュージカル『キャッツ』の原作は、T・S・エリオットの詩集『Old Possum’s Book of Practical Cats』（1939）。名付け親の子どもたちのために書いた、ユーモラスな猫の詩の本だ。</p><p>アンドリュー・ロイド・ウェバーはその詩に曲をつけ、1981年にロンドンで舞台にした。代表曲「メモリー」の歌詞にも、エリオットの詩の言葉が使われている。</p><p>『荒地』の詩人と、世界でもっとも長く上演されたミュージカルの一つ。意外な二つは、同じ一人の手でつながっている。</p>'
      }
    },

    {
      id: 'seed-t-s-eliot--the-waste-land',
      createdAt: '2026-09-30T06:30:00.000Z',
      updatedAt: '2026-09-30T06:30:00.000Z',
      a: W.eliot,
      b: W.wasteland,
      context: {
        routeName: '詩人と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '代表作',
        score: [3, 4, 5, 5],
        headline: '四月は、\nいちばん残酷な月。',
        slug: 't-s-eliot--the-waste-land',
        relation: 'T・S・エリオット ── 代表作 ── 『荒地』',
        leftStation: 'T・S・エリオット',
        rightStation: '荒地',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>戦争のあとの世界を、言葉の断片で描いた。</strong></p><p>『荒地』は1922年に発表された。さまざまな言語、古典の引用、酒場の会話が、つなぎ目なく並べられる。</p><p>読者は筋を追うのではなく、崩れた文明の破片を拾い集めるように読むことになる。その手法は20世紀の文学のあり方を大きく変えた。</p>'
      }
    },

    {
      id: 'seed-ezra-pound--the-waste-land',
      createdAt: '2026-09-30T06:20:00.000Z',
      updatedAt: '2026-09-30T06:20:00.000Z',
      a: W.pound,
      b: W.wasteland,
      context: {
        routeName: '削った友人',
        label: 'CONTEXT',
        kind: '事実',
        hub: '草稿の編集',
        score: [5, 4, 4, 5],
        headline: '名作は、\n友人の赤ペンで生まれた。',
        slug: 'ezra-pound--the-waste-land',
        relation: 'エズラ・パウンド ── 草稿を削る ── 『荒地』',
        leftStation: 'エズラ・パウンド',
        rightStation: '荒地',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>『荒地』は、もっと長い詩だった。</strong></p><p>エリオットは『荒地』の草稿を、友人の詩人エズラ・パウンドに見せた。パウンドは大胆に削り、詩は大きく引き締まった。</p><p>エリオットは完成した詩をパウンドに捧げ、「より優れた言葉の匠へ」という献辞を添えた。一篇の詩の後ろには、もう一人の詩人の手がある。</p>'
      }
    },

    {
      id: 'seed-t-s-eliot--the-hollow-men',
      createdAt: '2026-09-30T06:10:00.000Z',
      updatedAt: '2026-09-30T06:10:00.000Z',
      a: W.eliot,
      b: W.hollow,
      context: {
        routeName: '詩人と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '詩',
        score: [3, 4, 4, 5],
        headline: '爆発ではなく、\nすすり泣きで。',
        slug: 't-s-eliot--the-hollow-men',
        relation: 'T・S・エリオット ── 詩 ── 『うつろな人々』',
        leftStation: 'T・S・エリオット',
        rightStation: 'うつろな人々',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>世界は派手には終わらない。</strong></p><p>『うつろな人々』（1925）は、「わたしたちはうつろな人間」と始まり、「世界の終わりはこうだ、爆発ではなく、すすり泣きで」と結ばれる。</p><p>中身を失った人々の姿を描いたこの詩は、のちに多くの映画や小説に引用されていく。</p>'
      }
    },

    {
      id: 'seed-the-hollow-men--apocalypse-now',
      createdAt: '2026-09-30T06:00:00.000Z',
      updatedAt: '2026-09-30T06:00:00.000Z',
      a: W.hollow,
      b: W.apocalypse,
      context: {
        routeName: 'カーツ大佐の朗読',
        label: 'CONTEXT',
        kind: '事実',
        hub: '引用',
        score: [5, 4, 5, 5],
        headline: 'ジャングルの奥で、\nカーツ大佐が詩を読む。',
        slug: 'the-hollow-men--apocalypse-now',
        relation: '『うつろな人々』── カーツ大佐の朗読 ── 『地獄の黙示録』',
        leftStation: 'うつろな人々',
        rightStation: '地獄の黙示録',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>映画の終盤、狂気の王国で詩が読まれる。</strong></p><p>『地獄の黙示録』のカーツ大佐（マーロン・ブランド）は、ジャングルの奥の王国で、エリオットの『うつろな人々』を朗読する。</p><p>部屋にはエリオットの詩が影響を受けた人類学の本も置かれている。戦争の果てにたどり着いた空虚を、コッポラは一篇の詩で語らせた。</p>'
      }
    },

    {
      id: 'seed-the-hollow-men--heart-of-darkness',
      createdAt: '2026-09-30T05:50:00.000Z',
      updatedAt: '2026-09-30T05:50:00.000Z',
      a: W.hollow,
      b: W.hod,
      context: {
        routeName: '題辞',
        label: 'CONTEXT',
        kind: '事実',
        hub: '「カーツ氏—死んだ」',
        score: [5, 4, 4, 5],
        headline: '詩の冒頭に、\n小説の一行がある。',
        slug: 'the-hollow-men--heart-of-darkness',
        relation: 'コンラッド『闇の奥』── 題辞 ── 『うつろな人々』',
        leftStation: 'うつろな人々',
        rightStation: '闇の奥',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>同じ「カーツ」が、小説から詩へ、そして映画へ渡っていく。</strong></p><p>エリオットは『うつろな人々』の冒頭に、「Mistah Kurtz—he dead（カーツの旦那—死んだよ）」という一行を掲げた。コンラッド『闇の奥』で、カーツの死を告げる言葉だ。</p><p>『闇の奥』は『地獄の黙示録』の下敷きになった小説でもある。小説、詩、映画が、カーツという一人の人物でつながっている。</p>'
      }
    },

    {
      id: 'seed-lorenzos-oil--adrenoleukodystrophy',
      createdAt: '2026-09-30T05:40:00.000Z',
      updatedAt: '2026-09-30T05:40:00.000Z',
      a: W.lorenzo,
      b: W.ald,
      context: {
        routeName: '実話の病',
        label: 'CONTEXT',
        kind: '事実',
        hub: '実話',
        score: [3, 5, 4, 4],
        headline: '息子の病に、\n両親は図書館で挑んだ。',
        slug: 'lorenzos-oil--adrenoleukodystrophy',
        relation: '副腎白質ジストロフィー（ALD）── 実話 ── 映画「ロレンツォのオイル」',
        leftStation: 'ロレンツォのオイル',
        rightStation: 'ALD',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>医師ではない両親が、治療法を探しはじめた。</strong></p><p>映画「ロレンツォのオイル」は、息子ロレンツォが副腎白質ジストロフィー（ALD）と診断された、オドーネ夫妻の実話をもとにしている。</p><p>当時、有効な治療法はほとんどなかった。夫妻は医学文献を読み込み、専門家に働きかけ、食事療法に使うオイルの開発にたどり着く。</p><p>映画は、病気そのものだけでなく、知ろうとし続けることの力を描いている。</p>'
      }
    },

    {
      id: 'seed-elmer-gantry--anti-intellectualism-in-american-life',
      createdAt: '2026-09-30T05:30:00.000Z',
      updatedAt: '2026-09-30T05:30:00.000Z',
      a: W.elmer,
      b: W.aibook,
      context: {
        routeName: '信仰復興運動',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '伝道者と大衆',
        score: [4, 3, 4, 5],
        headline: '熱狂させる伝道者を、\n歴史家は分析した。',
        slug: 'elmer-gantry--anti-intellectualism-in-american-life',
        relation: '映画「エルマー・ガントリー」── 信仰復興運動 ── 『アメリカの反知性主義』',
        leftStation: 'エルマー・ガントリー',
        rightStation: 'アメリカの反知性主義',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>同じアメリカの風景を、物語と歴史書が描いている。</strong></p><p>「エルマー・ガントリー」の主人公は、巧みな弁舌で人々を熱狂させる信仰復興運動の伝道者だ。</p><p>ホーフスタッター『アメリカの反知性主義』は、こうした信仰復興運動を、アメリカで知性への不信が育った源流の一つとして取り上げている。</p><p>映画が一人の男の物語として描いたものを、歴史書は社会全体の流れとして描いた。</p>'
      }
    },

    {
      id: 'seed-anti-intellectualism--anti-intellectualism-in-american-life',
      createdAt: '2026-09-30T05:20:00.000Z',
      updatedAt: '2026-09-30T05:20:00.000Z',
      a: W.antiintel,
      b: W.aibook,
      context: {
        routeName: '言葉と本',
        label: 'CONTEXT',
        kind: '事実',
        hub: '言葉を広めた本',
        score: [3, 4, 4, 5],
        headline: 'ひとつの言葉を、\n一冊の本が広めた。',
        slug: 'anti-intellectualism--anti-intellectualism-in-american-life',
        relation: '「反知性主義」── 言葉を広めた本 ── 『アメリカの反知性主義』',
        leftStation: '反知性主義',
        rightStation: 'アメリカの反知性主義',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>言葉は、それを使いこなした本とともに広まる。</strong></p><p>「反知性主義」は、知性や知識人に対する反発や不信を表す言葉だ。</p><p>この言葉を、アメリカ社会を読み解く言葉として定着させたのが、リチャード・ホーフスタッター『アメリカの反知性主義』（1963）である。日本でも近年、政治や社会を語る場面でしばしば使われるようになった。</p>'
      }
    },

    {
      id: 'seed-anti-intellectualism-in-american-life--richard-hofstadter',
      createdAt: '2026-09-30T05:10:00.000Z',
      updatedAt: '2026-09-30T05:10:00.000Z',
      a: W.aibook,
      b: W.hofstadter,
      context: {
        routeName: '著者と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '著者',
        score: [3, 3, 4, 5],
        headline: 'ピュリッツァー賞を\n二度受けた歴史家。',
        slug: 'anti-intellectualism-in-american-life--richard-hofstadter',
        relation: 'リチャード・ホーフスタッター ── 著者 ── 『アメリカの反知性主義』',
        leftStation: 'アメリカの反知性主義',
        rightStation: 'ホーフスタッター',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>歴史家は、自分の国の弱点を正面から書いた。</strong></p><p>リチャード・ホーフスタッターはコロンビア大学の歴史家。『改革の時代』と『アメリカの反知性主義』で、二度ピュリッツァー賞を受けた。</p><p>1950年代のマッカーシズムの時代を見つめた経験が、この本の背景にある。</p>'
      }
    },

    {
      id: 'seed-crime-and-punishment--fyodor-dostoevsky',
      createdAt: '2026-09-30T05:00:00.000Z',
      updatedAt: '2026-09-30T05:00:00.000Z',
      a: W.crime,
      b: W.dost,
      context: {
        routeName: '作家と作品',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '代表作',
        score: [3, 4, 5, 5],
        headline: '理屈で殺した青年は、\n良心に追いつめられる。',
        slug: 'crime-and-punishment--fyodor-dostoevsky',
        relation: 'ドストエフスキー ── 代表作 ── 『罪と罰』',
        leftStation: '罪と罰',
        rightStation: 'ドストエフスキー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>罪は、法よりも先に心を裁く。</strong></p><p>『罪と罰』は1866年に発表された。主人公ラスコーリニコフは、「非凡な人間は踏み越えてよい」という自分の理屈で老婆を殺す。</p><p>しかし罪の意識は、捜査官よりも早く彼を追いつめていく。ドストエフスキーは、人間の内面の揺れを、推理小説のような緊張感で描いた。</p>'
      }
    },

    {
      id: 'seed-the-outsider--fyodor-dostoevsky',
      createdAt: '2026-09-30T04:50:00.000Z',
      updatedAt: '2026-09-30T04:50:00.000Z',
      a: W.outsider,
      b: W.dost,
      context: {
        routeName: 'アウトサイダーの系譜',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'アウトサイダー',
        score: [4, 3, 4, 5],
        headline: '社会の外に立つ人間の\n原型が、ここにいる。',
        slug: 'the-outsider--fyodor-dostoevsky',
        relation: 'コリン・ウィルソン『アウトサイダー』── 論じた作家 ── ドストエフスキー',
        leftStation: 'アウトサイダー',
        rightStation: 'ドストエフスキー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>社会になじめない人間を、文学はずっと描いてきた。</strong></p><p>コリン・ウィルソンの『アウトサイダー』は、社会の外側に立つ人間を描いた作家たちを論じた本だ。そのなかで、ドストエフスキーの登場人物たちが大きく取り上げられている。</p><p>『罪と罰』のラスコーリニコフもまた、自分を特別な存在だと信じ、社会の外へ踏み出してしまった人間である。</p>'
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
