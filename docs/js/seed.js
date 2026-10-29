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
    summary: '日本に留学していた周恩来が、1918年の東京で書いた日記。日比谷公園、靖国神社、浅草など、19歳の青年が見て回った百年前の東京が記されている。'
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
      summary: '1917年から1919年まで日本に留学し、帰国後は革命運動に加わった。1949年の建国から亡くなるまで、政務院総理、のち国務院総理を務めた。'
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
      summary: '広島県呉市の名物料理。鶏の皮を味噌で煮込んだ一皿で、呉では「味噌炊き」とも呼ばれる。'
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
      summary: '勝どき駅近くの、焼き餃子と酒の店。'
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
      summary: '『ブレイキング・バッド』のヴィンス・ギリガンが手がけた Apple TV のドラマ。人々の心がひとつに溶け合っていく世界で、その輪に加われない数少ない人間の一人である女性を描く。'
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
      summary: 'リー・チャイルドの小説シリーズを原作にしたドラマ。元軍人のジャック・リーチャーが、各地の事件に立ち向かう。'
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
      summary: 'アメリカの俳優。ティム・バートン監督作に数多く出演し、テリー・ギリアムの作品にも出演した。『MINAMATA』では主演とともに製作にも加わった。'
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
      title: '岩明均『寄生獣』', type: '漫画', year: '1989', creator: '岩明均',
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
      title: '映画『マッド・ドライヴ』（原題 Kill Your Friends）', type: '映画', year: '2015', creator: 'オーウェン・ハリス監督（原作 ジョン・ニヴン）',
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
      summary: 'スウェーデンのシンガーソングライター。オルタナティブ・ポップの歌い手として紹介され、映画『マッド・ドライヴ』で映画デビューを果たした。'
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
      summary: '干ばつと砂嵐、そして差し押さえで土地を追われたオクラホマの農民ジョード一家が、仕事を求めてカリフォルニアへ向かう。ピューリッツァー賞を受けた。'
    },
    wotw: {
      title: 'H・G・ウェルズ『宇宙戦争』', type: '書籍', year: '1898', creator: 'H・G・ウェルズ',
      slug: 'the-war-of-the-worlds', order: 67, image: 'img/works/the-war-of-the-worlds.jpg',
      credit: 'アルヴィム・コヘアの挿絵版（1906）のポスター／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:The_War_of_the_Worlds_-_poster_by_Henrique_Alvim_Corr%C3%AAa,_original_graphic.jpg',
      summary: '火星人がロンドン近郊に降り立ち、当時最大の植民地帝国だった英国に襲いかかる。侵略SFの古典。'
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
      summary: '映画『怪盗グルーのミニオン危機一発』のために書かれた曲。24時間ぶんのミュージックビデオがロサンゼルスで撮影され、のちに世界各地で人々が踊る動画が投稿された。'
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
      summary: '1964年、ひとりでニューカレドニアへ旅立った著者の旅行記。ベストセラーになった。'
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
      summary: '英領ビルマの警官である語り手「私」が、暴れた象を、群衆の前で「撃たねばならなくなった」ことを書いたエッセイ。作者自身の体験に基づくとされる。'
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
      title: 'ロシア「そばの実（グレーチカ）」', type: '料理', year: '', creator: 'ロシア・東欧',
      slug: 'grechka', order: 84, image: 'img/works/grechka.jpg',
      credit: '撮影 KabanDanish／CC BY-SA 4.0／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Buckwheat_porridge_in_medvedkovo.jpg',
      summary: 'ロシアで粥（カーシャ）にして食べられる、そばの実。ロシア語ではグレーチカと呼ぶ。'
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
      credit: '南方熊楠が土宜法龍への書簡（1903）に描いた図／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E5%8D%97%E6%96%B9%E3%83%9E%E3%83%B3%E3%83%80%E3%83%A92.jpg',
      summary: '南方熊楠が、世界の因果関係が交錯し連鎖するさまを一枚の図に描いたもの。真言宗の僧・土宜法龍への手紙に記された。'
    },
    letters: {
      title: '『南方熊楠 土宜法竜 往復書簡』', type: '書籍', year: '1990', creator: '南方熊楠・土宜法龍',
      slug: 'minakata-toki-letters', order: 87, image: 'img/works/minakata-toki-letters.jpg',
      credit: '南方熊楠の書簡に描かれた図／Public domain／Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%E5%8D%97%E6%96%B9%E3%83%9E%E3%83%B3%E3%83%80%E3%83%A91.jpg',
      summary: 'ロンドンで出会った南方熊楠と、真言宗の僧・土宜法龍が交わした手紙をまとめたもの。二人は仏教と科学をめぐって長い議論を交わした。'
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
      summary: 'ジオデシック・ドームで知られるアメリカの思想家・建築家。「宇宙船地球号」という言葉を広めた。'
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
    /* 前田先生 2026.10.22：「『ザ・バンカー』を登録して、『ベルリン・天使の詩』から外したい」。
       ホプキンスのヒトラーは、この作品を通して辿る（『ヒトラー〜最期の12日間〜』へ直接は結ばない）。
       2020年の同名の映画（Apple TV+）とは別の作品。安全に使える絵がまだないので、文字の札で立てる */
    bunker: {
      title: 'テレビ映画『ザ・バンカー』', type: '映画・ドラマ', year: '1981', creator: 'ジョージ・シェーファー監督（米 CBS）',
      slug: 'the-bunker-1981', order: 106.5,
      summary: 'ベルリンの総統地下壕で過ごしたヒトラーの最後の日々を、ジェームズ・P・オドネルの著書をもとに描いたアメリカのテレビ映画。アンソニー・ホプキンスがヒトラーを演じ、エミー賞（主演男優賞）を受けた。'
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
      summary: '「四月はいちばん残酷な月」で始まる長編詩。第一次世界大戦後のヨーロッパの荒廃を描いたと読まれてきた、モダニズム詩の代表作。'
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
      summary: '知性や知識人への反発・不信を表す言葉。ホーフスタッター『アメリカの反知性主義』（1963）は、この言葉をテーマにアメリカ社会の歴史を論じた。'
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
          '<p>黒澤版の権藤は製靴会社の重役であり、その倫理は「良い靴を作る」ことに宿る。リー版のデヴィッド・キングは音楽業界の大物（レーベルの創業者）であり、それは「良い音を聴き分ける耳」に置き換えられている。どちらも単なる富裕層ではなく、自分の仕事に強い美学を持つ成功者である。</p>' +
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
          '<p>1917年に日本へ渡った周恩来は、東京・神田に下宿し、東亜高等予備学校に通いながら受験勉強の日々を送った。のちに『十九歳の東京日記』としてまとめられた日記には、1918年1月27日、昼食のあと漢陽楼へ行き、同学会の月例会に出たことが書かれている。</p>' +
          '<h3>留学生の街</h3>' +
          '<p>当時の神田・神保町界隈には、中国からの留学生が数多く暮らしていた。明治四十四年創業を掲げる中国料理店「漢陽楼」は、そうした留学生たちが集った店のひとつで、その中に若き周恩来もいたと伝えられている。</p>' +
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
          '<p>靴会社の重役のもとに「息子を誘拐した」という電話がかかる。ところが連れ去られたのは、彼の息子ではなく、運転手の息子だった。他人の子のために全財産を差し出すのか。物語の芯になるこの問いは、小説から映画へ受け継がれた。ただし小説のキングが支払いをぎりぎりまで渋るのに対し、映画の権藤は大金を支払い、その金はいったん犯人に奪われる。</p>' +
          '<h3>移し替えられたもの</h3>' +
          '<p>黒澤は舞台を横浜に移し、誘拐サスペンスを、階級の格差と高度経済成長期の日本社会を描く映画へと大きく広げた。高台の邸宅と、それを見上げる下界。その高低差が、日本語の題名『天国と地獄』そのものになっている。</p>' +
          '<p>そして約60年後、スパイク・リーは黒澤版を「再解釈」し、物語をふたたびアメリカへ、現代のニューヨークへと移した（『Highest 2 Lowest』、2025年）。リーは、この物語はまずアメリカの小説で、それを黒澤が映画にしたのだと語っている。</p>'
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
        headline: '黒澤の映画の前にも、\n一冊の小説があった。',
        slug: 'highest-2-lowest--kings-ransom',
        relation: 'エド・マクベイン『King’s Ransom』── スパイク・リー『HIGHEST 2 LOWEST』',
        leftStation: 'HIGHEST 2 LOWEST',
        rightStation: 'キングの身代金',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>リメイクではなく「再解釈」。そう紹介される映画には、もう一本の源流がある。</strong></p><p>『HIGHEST 2 LOWEST』は、黒澤明『天国と地獄』の再解釈として紹介されることが多い。けれども、黒澤の映画そのものにも原作がある。エド・マクベインの小説『King’s Ransom』（1959）である。スパイク・リー自身も、これはまずアメリカの小説で、それを黒澤が映画にしたのだと語っている。</p><p>二つの作品を並べると、黒澤を経由する線の奥に、アメリカの小説からアメリカの映画へ戻ってくる線が見えてくる。どちらの線も、他人の子のために全財産を差し出せるか、という同じ問いに行き着く。</p>'
      }
    },

    {
      id: 'seed-glenn-gould--goldberg-variations',
      createdAt: '2026-09-15T08:50:00.000Z',
      updatedAt: '2026-09-15T08:50:00.000Z',
      a: GOULD,
      b: W.goldberg,
      context: {
        routeName: 'デビューと再録音',
        label: 'CONTEXT',
        kind: '事実',
        hub: '二度の録音',
        score: [2, 5, 5, 5],
        headline: 'デビュー盤と同じ曲を、\n死の前年に録り直した。',
        slug: 'glenn-gould--goldberg-variations',
        relation: 'グレン・グールド ── 1955年の録音／1981年の録音 ── 『ゴールドベルク変奏曲』',
        leftStation: 'グレン・グールド',
        rightStation: 'ゴールドベルク変奏曲',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>一人のピアニストが、同じ曲でデビューし、同じ曲の再録音を死の直前に世に送った。</strong></p><p>グレン・グールドは1955年にバッハの『ゴールドベルク変奏曲』を録音し、翌1956年に発売されたそのレコードでデビューした。演奏時間は約38分半。この録音は世界的な評価を得て、曲を広く知られるものにした。</p><p>1981年、グールドはもう一度この曲を録音する。演奏時間は約51分で、1955年盤より12分以上長い。そのレコードが発売されたのは1982年9月2日。翌月の10月4日、グールドは50歳で亡くなった。</p><p>ただし、これが最後の録音ではない。1982年9月初旬にも、グールドはリヒャルト・シュトラウスのピアノ・ソナタ ロ短調を録音している。1955年と1981年、二つの録音のあいだにある26年は、一人の演奏家の歩みそのものとも言える。</p>'
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
        headline: 'ゴールドベルクの主題に\nジャズ奏者が応えた。',
        slug: 'goldberg-variations--brad-mehldau',
        relation: 'J・S・バッハ ── ブラッド・メルドー『After Bach』（2018）／『After Bach II』（2024）',
        leftStation: 'ゴールドベルク変奏曲',
        rightStation: 'ブラッド・メルドー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブはバッハ。ジャズのピアニストが、バッハの曲に自作の曲で応えた。</strong></p><p>ブラッド・メルドーは2018年のアルバム『After Bach』で、バッハの『平均律クラヴィーア曲集』から前奏曲とフーガを弾き、そのあとに、その曲に触発されて自分で書いた曲を続けて並べた。ライナーを書いたティモ・アンドレスは、このアルバムを、バッハとメルドーが鍵盤奏者・即興演奏家・作曲家として共有する地平を見渡すものだと記している。</p><p>2024年の『After Bach II』には、メルドーが作曲した「Variations on Bach’s Goldberg Theme」が収められている。アリア風の曲と6つの変奏からなる全7曲で、第4変奏は「Breakbeat」、第5変奏は「Jazz」と題されている。</p><p>ゴールドベルクの主題は、約280年を経て、ジャズのピアニストの手でもう一度変奏された。</p>'
      }
    },

    {
      id: 'seed-kusamakura--natsume-soseki',
      createdAt: '2026-09-15T08:30:00.000Z',
      updatedAt: '2026-09-15T08:30:00.000Z',
      a: KUSAMAKURA,
      b: W.soseki,
      context: {
        routeName: '旅が生んだ『草枕』',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: '作者',
        score: [1, 4, 3, 5],
        headline: '「非人情」の小説には、\n漱石の芸術論が表れた。',
        slug: 'kusamakura--natsume-soseki',
        relation: '夏目漱石 ── 『草枕』（1906）',
        leftStation: '草枕',
        rightStation: '夏目漱石',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>『草枕』には、漱石自身の旅と芸術論が刻まれている。</strong></p><p>『草枕』は1906年（明治39年）9月、雑誌『新小説』に発表された。冒頭は「智に働けば角が立つ。情に棹させば流される。意地を通せば窮屈だ。」。一切の人間の事象を無私の目で見つめる「非人情」の美学をもとに書かれ、漱石自身の芸術論が色濃くあらわれた作品と紹介されている。</p><p>漱石は1896年4月に熊本の第五高等学校の講師となり、1897年の年末から年明けにかけて、同僚と小天温泉を旅した。宿は土地の名士、前田案山子の別邸である。この旅で出会った案山子と娘の卓が、小説の登場人物のモデルになったと、玉名市は紹介している。作家の暮らしと小説のあいだにも、一本の区間がある。</p>'
      }
    },

    {
      id: 'seed-natsume-soseki--zhou-tokyo-diary',
      createdAt: '2026-09-15T08:20:00.000Z',
      updatedAt: '2026-09-15T08:20:00.000Z',
      a: W.soseki,
      b: ZHOU,
      context: {
        routeName: '異国の都の記録',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '留学生の記録',
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
          '<p><strong>意味の上での近さから結ばれた区間。異国の都で、留学生が自分の学びと向き合いながら書いた。</strong></p><p>夏目漱石は1900年から約2年間、文部省の留学生としてロンドンに暮らした。下宿にこもって英文学と格闘し、神経をすり減らした日々は、漱石自身が『文学論』の序に書き残している。妻への手紙にも、ロンドンでの孤独を訴える言葉が見える。</p><p>その十数年後、今度は中国から周恩来が東京にやって来た。受験勉強と挫折、祖国への思いを綴った日記は、のちに『十九歳の東京日記』として読まれている。</p><p>日本から西洋へ向かった留学生と、中国から日本へ向かった留学生。向きは違っても、異国の都で自分の学びと向き合った記録として、二つは並べて読むことができる。</p>'
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
          '<p><strong>日記を書いたのは、まだ何者でもない青年だった。</strong></p><p>1917年秋に来日した周恩来は、東京・神田の東亜高等予備学校で日本語を学びながら、東京高等師範学校などの受験に備えた。『十九歳の東京日記』は、その翌1918年の1月1日から12月23日までの日記で、日比谷公園、靖国神社、浅草などを見て回った記録が残る。</p><p>1919年に帰国した青年は革命運動に加わり、1949年の建国から亡くなるまで、中華人民共和国の政務院総理、のち国務院総理を務めた。その人生のはじまりの一年が、東京という街とともに記録されている。</p>'
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
        headline: '小説の画工を、\n生きたかのような画家。',
        slug: 'tanaka-isson--kusamakura',
        relation: '夏目漱石『草枕』の画工 ── 田中一村',
        leftStation: '田中一村',
        rightStation: '草枕',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。事実のつながりではない。</strong></p><p>『草枕』の画工は、人の世のわずらわしさから離れ、世界を絵として眺めたいと願って山の温泉場へ旅をする。</p><p>田中一村は50歳で奄美大島に移り住み、紬工場の染色工として働きながら、亜熱帯の植物と鳥を描き続けた。中央の画壇と一線を画し、ひとり描くことを選んだ生き方は、小説の画工の願いを現実に生きたようにも見える。</p><p>二人を結ぶのは史実ではなく、「世を離れて描く」という態度そのものである。</p>'
      }
    },

    {
      id: 'seed-kotringo--kanashikute-yarikirenai',
      createdAt: '2026-09-15T07:50:00.000Z',
      updatedAt: '2026-09-15T07:50:00.000Z',
      a: W.kotringo,
      b: W.kanashikute,
      context: {
        routeName: '歌い直された歌',
        label: 'CONTEXT',
        kind: '事実',
        hub: '映画『この世界の片隅に』',
        score: [3, 5, 4, 5],
        headline: '1968年の歌を、\n静かな声が歌い直した。',
        slug: 'kotringo--kanashikute-yarikirenai',
        relation: 'ザ・フォーク・クルセダーズ（1968）── コトリンゴ（2016）',
        leftStation: 'コトリンゴ',
        rightStation: '悲しくてやりきれない',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>半世紀近く前の歌が、新しい声で映画の冒頭に置かれた。</strong></p><p>「悲しくてやりきれない」は、1968年にザ・フォーク・クルセダーズが発表した歌で、作詞はサトウハチロー、作曲は加藤和彦。</p><p>『この世界の片隅に』（2016）は片渕須直監督のアニメーション映画で、音楽はコトリンゴが担当した。映画の冒頭に流れるのは、コトリンゴがカバーしたこの歌である。予告編で使われたカバーを、生楽器を中心にリアレンジしたものが映画に使われているという。</p><p>柔らかな声と生楽器の響きで、原曲の悲しみは、日々を生きる人のささやきのようにも聴こえる。</p>'
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
        hub: 'オープニング曲',
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
          '<p><strong>悲しみを叫ぶのではなく、そっと差し出す歌。</strong></p><p>映画『この世界の片隅に』（2016）は、戦争の時代を生きたすずの暮らしを、配給物資が減っていくなかで食卓を工夫し、衣服を仕立て直す日々から描いていく。</p><p>そのオープニングで流れるのが、コトリンゴが歌う「悲しくてやりきれない」である。1968年にザ・フォーク・クルセダーズが発表した歌は、この映画の冒頭でも作品世界によく合うと評された。</p><p>どうにもならない悲しみを抱えながら、それでも日々は続いていく。歌の言葉は、映画がこれから描く時間をあらかじめ包んでいるようにも聴こえる。</p>'
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
          '<p><strong>すずの暮らしを形づくる物語の舞台は、実在の軍港・呉である。</strong></p><p>広島市の江波に生まれたすずは、18歳で呉の北條家に嫁ぐ。呉は海軍の鎮守府が置かれ、戦艦大和を建造した海軍工廠のある町だった。</p><p>配給物資が減っていくなかで、すずは食卓を工夫し、段々畑から港を眺めて軍艦の絵を描く。やがてその町は空襲にさらされる。</p><p>映画を観たあとに呉を訪ねる人もいる。作品に描かれた場所は、いまの呉の地図の上にも辿ることができる。ただし、旧上長ノ木・畝原・惣付のあたりは道の細い住宅街で、公式サイトは「聖地巡礼」の目的地としないよう呼びかけているという。</p>'
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
        headline: '戦後の港町で生まれ、\n缶ひとつで旅をする味。',
        slug: 'kure--torikawa-misoni',
        relation: '広島県呉市 ── 名物 ── 鳥皮みそ煮',
        leftStation: '呉',
        rightStation: '鳥皮みそ煮',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>捨てずに食べる工夫が、呉の名物の一皿になった。</strong></p><p>鳥皮みそ煮は、広島県呉市の名物として知られる料理。鶏の皮を味噌で煮込んだ一品で、呉のとり屋（焼鳥店）では「味噌炊き」の名でも親しまれている。串のまま出す店、串から外して小鉢で出す店、こんにゃくなどと煮込む店と、店ごとに個性がある。</p><p>生まれたのは食料事情の悪かった戦後復興期。卵を産まなくなった親鳥の硬い皮を、捨てずに食べる方法を考えた結果だという。いまは広島市のヤマトフーズが、缶詰の商品にもしている。</p><p>『この世界の片隅に』で、すずが配給の食材をやりくりした町。映画が描く時代のあと、同じ町で食料の乏しさから生まれた味を、いまは缶詰でも味わえる。</p>'
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
        headline: '描くことが好きな人が、\n喪失のあとを生きる。',
        slug: 'kono-sekai-no-katasumi-ni--look-back',
        relation: 'すずの絵 ── 藤野と京本の漫画',
        leftStation: 'この世界の片隅に',
        rightStation: 'ルックバック',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。二つの作品に直接の関係はない。</strong></p><p>『この世界の片隅に』のすずは、絵を描くことが好きな女性だった。けれども戦争は、そのすずの日々を大きく変えていく。</p><p>『ルックバック』は、小学生の藤野と不登校の京本が、漫画を描き続ける物語である。二人の時間は、ある日の突然の出来事によって断ち切られる。</p><p>どちらの作品も、描くことと深く結びついた人が、大切なものを失ったあとの時間を見つめている。絵や漫画を描くことが大切な意味を持つ二つの物語は、劇場アニメーションとして続けて観ることもできる。</p>'
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
        headline: 'チェンソーの心臓が、\n借金を負う少年に宿る。',
        slug: 'fujimoto-tatsuki--chainsaw-man',
        relation: '藤本タツキ ── 『チェンソーマン』（2018–2026）',
        leftStation: '藤本タツキ',
        rightStation: 'チェンソーマン',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>作者の名を広く知らしめた長編。</strong></p><p>『チェンソーマン』は2018年に週刊少年ジャンプで連載が始まった。父の借金を背負ったデンジは、チェンソーの悪魔ポチタと一体になり、公安のデビルハンターとして悪魔と戦うことになる。</p><p>第二部は2022年から少年ジャンプ＋に移り、2026年3月に最終回を迎えた。アニメはMAPPAが手がけた。累計発行部数は、2026年6月の時点で3600万部を超えている。</p><p>作者は『悪魔のいけにえ』『フリクリ』『ABARA』などからの影響を語っている。『ルックバック』についても、様々な映画からの影響を公言しており、タランティーノ作品などへのオマージュを含むとされる。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『寄生獣』の泉新一は、脳を乗っ取りそこねた寄生生物を右手に宿し、自ら「ミギー」と名乗るその生き物と共に生きることになる。</p><p>『チェンソーマン』のデンジは、命を落としたところをポチタが心臓となって蘇らせ、一体になる。</p><p>どちらの少年も、自分の体の中に人間ではない相棒を抱えて戦う。『寄生獣』は、人間らしさとは何かという問いを、ミギーという相棒の存在を通して投げかけてくる。時代を隔てた二つの漫画には、少年の体に人ならぬ存在が宿るという共通点がある。</p>'
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
        headline: '14歳が、カンヌで\n最年少の男優賞を得た。',
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
        headline: '日本映画が21年ぶりに\nパルム・ドールを得た。',
        slug: 'koreeda-hirokazu--shoplifters',
        relation: '是枝裕和 ── 『万引き家族』（2018）',
        leftStation: '是枝裕和',
        rightStation: '万引き家族',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>ドキュメンタリー出身の監督が、血のつながりは家族をつくるのに十分かと問い続けてきた、その主題を描いた作品。</strong></p><p>是枝裕和はテレビマンユニオンに入社後、ドキュメンタリーを多く手がけ、1995年に映画監督としてデビューした。</p><p>『万引き家族』は2018年のカンヌ国際映画祭でパルム・ドールを受けた。日本映画としては今村昌平『うなぎ』（1997）以来、21年ぶりのことだった。</p><p>血のつながらない人々が寄り添って暮らす家がある。彼らのあいだにあったものを、映画は丁寧に見つめる。</p>'
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
        headline: '社会の外側で、\n子どもたちは暮らした。',
        slug: 'nobody-knows--shoplifters',
        relation: '『誰も知らない』（2004）── 『万引き家族』（2018）',
        leftStation: '誰も知らない',
        rightStation: '万引き家族',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>同じ監督が、14年を隔てて同じ場所を見つめた。</strong></p><p>『誰も知らない』の子どもたちは、母に置いていかれ、学校にも通わず、アパートの一室で暮らす。『万引き家族』の少年と少女は、血のつながらない大人たちの家で、万引きを覚えながら育つ。</p><p>どちらの子どもも、制度の網から外れた場所にいる。周りの大人の目が届きにくいまま続いていく暮らしを、是枝裕和は、誰かを悪者にして断じることなく、近くで見つめる。二本を続けて観ると、そのまなざしがどちらにも通っているように見えてくる。</p>'
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
        headline: 'ジャングルの奥の戦争と\n東京の片隅の家族。',
        slug: 'shoplifters--apocalypse-now',
        relation: '『地獄の黙示録』（1979）── カンヌ国際映画祭パルム・ドール ── 『万引き家族』（2018）',
        leftStation: '万引き家族',
        rightStation: '地獄の黙示録',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブはカンヌ国際映画祭の最高賞。まったく違う二本が、同じ賞でつながる。</strong></p><p>コッポラの『地獄の黙示録』は1979年のパルム・ドールを受けた（『ブリキの太鼓』と同時受賞）。予算は倍増して2,500万ドルを超え、撮影も1年以上に延びた末に完成した、ベトナム戦争を舞台にした大作である。</p><p>39年後の2018年、日本映画として21年ぶりに同じ賞を受けたのは、東京で貧しさのなか身を寄せ合って暮らす一家を描いた『万引き家族』だった。</p><p>国家の戦争と、社会の片隅の暮らし。題材も規模も遠く離れた二本が、同じ賞を受けている。</p>'
      }
    },

    {
      id: 'seed-daiyame--domaine-tetta',
      createdAt: '2026-09-15T05:50:00.000Z',
      updatedAt: '2026-09-15T05:50:00.000Z',
      a: W.daiyame,
      b: W.tetta,
      context: {
        routeName: '名前が語る産地',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '名前に宿る土地',
        score: [4, 3, 3, 4],
        headline: '焼酎の名は晩酌の言葉、\nワイナリーの名は地名。',
        slug: 'daiyame--domaine-tetta',
        relation: '鹿児島の言葉「だいやめ」── 岡山・哲多の地名',
        leftStation: 'DAIYAME',
        rightStation: 'ドメーヌ・テッタ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>芋焼酎『だいやめ DAIYAME』の名は、晩酌して疲れを癒やすことを表す鹿児島の言葉から取られている。</p><p>ドメーヌ・テッタの「テッタ」は、ぶどう畑のある岡山県新見市哲多町の名である。</p><p>ひとつは暮らしの言葉から、ひとつは土地の名から。どちらも、名前をたどると生まれた場所に行き着く。南九州の蒸留酒と岡山のワインという遠い二本を、名前が結んでいる。</p>'
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
        headline: 'ライチのような芋焼酎と\n生の柑橘のジン。',
        slug: 'daiyame--tanqueray-no-ten',
        relation: '『DAIYAME』── タンカレー No.10',
        leftStation: 'DAIYAME',
        rightStation: 'タンカレー No.10',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『DAIYAME』は、芋焼酎でありながらライチを思わせる華やかな香りで知られる。タンカレー No.10 は、柑橘を丸ごと蒸留し、フレッシュな柑橘の風味を立たせたジンである。</p><p>原料も国も違う二本の蒸留酒である。『DAIYAME』は独自の「香熟製法」で、タンカレー No.10 は小さな蒸留器「Tiny Ten」を使った小バッチの蒸留で、それぞれの香りを引き出す。香りを前面に出した酒であるという点で、二本は通じ合う。</p>'
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
        headline: '「だいやめ」とは、\nつまり今夜の一杯だ。',
        slug: 'gyoza-sakaba-kachidoki--daiyame',
        relation: '餃子酒場（勝どき）── 晩酌 ── 『DAIYAME』',
        leftStation: '餃子酒場',
        rightStation: 'DAIYAME',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>「だいやめ」は、晩酌して疲れを癒やすことを表す鹿児島の言葉である。濵田酒造は、家族や友人と晩酌しながら、一日を無事に過ごせたことに感謝して明日を迎える習慣だと紹介している。</p><p>勝どきの餃子酒場は、勝どき駅から徒歩2分、手作りの焼餃子と約70種のドリンクを出す店である。</p><p>ひとつは瓶の名前に、ひとつは町の店に。どちらも、一日の終わりに杯を傾ける時間に結びついていると読める。</p>'
      }
    },

    {
      id: 'seed-kanyoro--gyoza-sakaba-kachidoki',
      createdAt: '2026-09-15T05:20:00.000Z',
      updatedAt: '2026-09-15T05:20:00.000Z',
      a: KANYO,
      b: W.gyoza,
      context: {
        routeName: '勝鬨と留学生',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '日露戦争',
        score: [5, 3, 4, 2],
        headline: '勝どきの名も、漢陽楼も\n日露戦争とつながる。',
        slug: 'kanyoro--gyoza-sakaba-kachidoki',
        relation: '中国名菜『漢陽楼』── 日露戦争 ── 餃子酒場（勝どき）',
        leftStation: '漢陽楼',
        rightStation: '餃子酒場',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>勝どきの地名と、神田の中国料理店のはじまりは、同じ戦争につながっている。</strong></p><p>勝どきは、勝鬨橋の名にちなむ町名である。中央区は、橋名を、日露戦争の旅順陥落の際に建てた「勝鬨の碑」と、その河岸に開いた「勝鬨の渡し」に由来するものと見ている。東京都建設局も、橋名は日露戦争の戦勝（勝ち鬨）を記念した命名だと説明する。</p><p>餃子酒場（勝どき店）は、ぐるなびの案内では勝どき2丁目にあり、勝どき駅から歩いて2分ほど。手作りの餃子と手羽先を看板にしている。</p><p>一方の漢陽楼は、1911年に神保町で始まり、いまは神田小川町にある。公式サイトによれば、初代の顧雲生はロシア銀行に勤めていたが、日露戦争をきっかけにその銀行は閉店した。職を失った初代は、留学生たちに店を出すよう勧められ、賄い付きの下宿から店を始めたという。</p><p>二つをつなぐのは、店どうしの縁ではなく、地名と創業の来歴である。勝鬨の名は町に残り、職を失った初代は留学生のための店を開いた。同じ戦争が、東京の二か所に、違う形で残っている。</p>'
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
          '<p><strong>ハブはコンゴ。時代を隔てて、同じ土地が二度描かれた。</strong></p><p>コンラッドの『闇の奥』は、象牙貿易の奥地出張所にいるクルツを追って川を遡る船乗りの物語で、ベルギー国王の私領だったコンゴ自由国が舞台とされる。植民地主義の暗い側面を描いた小説である。</p><p>1960年、コンゴは独立し、パトリス・ルムンバが初代首相となった。だが翌年、ルムンバは殺害される。独立の前後の激動を描いたのが『ルムンバの叫び』である。</p><p>奥地へ向かう船乗りの物語と、独立を叫ぶコンゴの人の物語。同じ土地を、反対の側から見た二つの作品として並べて読める。</p>'
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
          '<p><strong>19世紀末の小説が、20世紀の戦争映画に移し替えられた。</strong></p><p>『地獄の黙示録』は、コンラッドの『闇の奥』を下敷きにしている。象牙交易の奥地は、ベトナム戦争のジャングルに置き換えられた。</p><p>川を遡り、奥地で王のように振る舞う男を訪ねるという骨組みはそのままに、クルツはカーツ大佐となった。小説が見つめた文明の闇を、映画は戦争の狂気として描き直している。</p><p>アメリカの小説が黒澤によって日本へ移された『天国と地獄』と同じく、ここでも物語は土地を移りながら、そのたびに新しい時代の問いを引き受けている。</p><p>前田先生は note で、子供の頃から何度もテレビで観たこの映画の核心を、原作の存在を知らないまま長らく正確に理解できずにいたと振り返る。両作品が示すものを深く考えさせられた、とも書いている。</p>'
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
          '<p><strong>作品の裏に、もう一つの物語がある。</strong></p><p>コッポラはフィリピンで『地獄の黙示録』を撮影した。台風でセットが壊れ、主演のマーティン・シーンが撮影中に心臓発作で倒れ、撮影は予定を大きく超えて続いた。</p><p>その混乱は、妻エレノア・コッポラが現場で撮った映像をもとにしたドキュメンタリー『ハート・オブ・ダークネス コッポラの黙示録』（1991）に残されている。題名の Hearts of Darkness は、『地獄の黙示録』が着想を得たコンラッドの小説『闇の奥』（Heart of Darkness）に由来する。</p>'
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
        headline: 'コッポラとルーカスが、\n黒澤の映画を支えた。',
        slug: 'francis-ford-coppola--high-and-low',
        relation: 'フランシス・フォード・コッポラ ── 黒澤明 ── 『天国と地獄』',
        leftStation: 'コッポラ',
        rightStation: '天国と地獄',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>ハブは黒澤明。</strong></p><p>黒澤明の『影武者』（1980）は、製作費の不足に直面していた。黒澤を敬愛していたジョージ・ルーカスとフランシス・フォード・コッポラは、その海外版に製作総指揮として名を連ねた。20世紀フォックスの出資を取りつけたのは主にルーカスで、コッポラも黒澤とともにサントリーのウイスキーCMに出演するなどして、製作を支えた。</p><p>『天国と地獄』でアメリカの小説を日本に移した黒澤は、今度はアメリカの監督たちに支えられて映画を撮ることになった。のちにスパイク・リーが『天国と地獄』を再解釈したことも含めて、黒澤とアメリカ映画のあいだには、何度も往復する線が引かれている。</p>'
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
        headline: 'アダンの海辺は、一村の\n「閻魔大王への土産」。',
        slug: 'adan--tanaka-isson',
        relation: '田中一村 ──「アダンの海辺」── アダン',
        leftStation: 'アダン',
        rightStation: '田中一村',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>奄美の海辺の木が、一枚の絵の主役になった。</strong></p><p>アダンは、奄美や沖縄などの海辺に生えるタコノキ科の木で、パイナップルに似た実をつける。</p><p>50歳で奄美大島へ移り住んだ田中一村は、1969年の「アダンの海辺」で、この木を画面の正面に据え、浜辺の砂礫まで描き込んだ。一村は手紙にこの絵を「閻魔大王への土産」と記し、生涯手放さなかったという。</p><p>ありふれた海辺の木が、画家のまなざしによって、最高傑作の一つとされる絵の主役になった。</p>'
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
        headline: '韓国ドラマのロケ地に、\n秋田の田沢湖もあった。',
        slug: 'iris--tazawako',
        relation: '韓国ドラマ『アイリス』── ロケ地 ── 田沢湖',
        leftStation: 'アイリス',
        rightStation: '田沢湖',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>ドラマの舞台が、旅の目的地になる。</strong></p><p>イ・ビョンホン主演の韓国ドラマ『アイリス』（2009）は、同年3月に秋田県内の約20カ所で撮影が行われ、田沢湖や乳頭温泉などもロケ地となった。</p><p>放送後、秋田では「アイリス」効果が大きく、韓国との定期便の搭乗者数は2009年11月から2010年3月に前年比3.4倍となったと報じられている。作品が土地へ人を運ぶことは、作品と場所のあいだに区間を引くこのサービスの、分かりやすい例でもある。</p>'
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
        relation: '『寄生獣』（1989）── 『プルリブス』（2025）',
        leftStation: 'プルリブス',
        rightStation: '寄生獣',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『寄生獣』では、突如飛来した寄生生物が人間の頭に入り込み、その人になりすまして暮らし始める。見た目は同じでも、中身はもう人ではない。</p><p>『プルリブス』では、宇宙から来たウイルスによって、人類の大半の心がひとつに溶け合っていく。多くの人が穏やかで満ち足りた存在に変わるなか、主人公キャロルは免疫を持つごく少数のひとりとして、その輪に加われないまま取り残される。</p><p>外から来たものが、人間の内側から世界を入れ替えていく。変わっていく世界のなかで「人間であること」を問い直す作品として、三十年以上を隔てた二つは並べて読める。</p>'
      }
    },

    {
      id: 'seed-war-of-the-worlds-2005--reacher',
      createdAt: '2026-09-15T03:30:00.000Z',
      updatedAt: '2026-09-15T03:30:00.000Z',
      a: W.wotwfilm,
      b: W.reacher,
      context: {
        routeName: 'クルーズを経由して',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: 'トム・クルーズ',
        score: [4, 4, 4, 2],
        headline: '『宇宙戦争』の主演は、\nリーチャーも演じた。',
        slug: 'war-of-the-worlds-2005--reacher',
        relation: 'スピルバーグ『宇宙戦争』（2005）── トム・クルーズ ── 『リーチャー』',
        leftStation: '宇宙戦争（映画）',
        rightStation: 'リーチャー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブは俳優トム・クルーズ。ドラマの前に、映画でリーチャーを演じていた。</strong></p><p>スピルバーグの『宇宙戦争』（2005）で、クルーズは港湾労働者のレイを演じた。別れた妻から子どもたちを預かっているあいだに異星の巨大な機械が現れ、父親は子どもたちを連れて逃げ出す。</p><p>2012年、クルーズはリー・チャイルドの小説『One Shot』を映画化した『アウトロー』（原題 Jack Reacher）で、ジャック・リーチャーを演じた。日本公開は2013年2月。2016年には続編『Jack Reacher: Never Go Back』も公開された。原作のリーチャーは身長6フィート5インチ（約196センチ）の大男で、原作ファンからは体格の違いを指摘する声も上がった。</p><p>2018年、チャイルドはBBCラジオで、クルーズとの仕事は楽しかったと述べたうえで、リーチャーの大きさは本当に重要だと語った。そして、クルーズ主演の映画はもう作らず、まったく新しい俳優でテレビシリーズにすると明かした。2020年9月にアラン・リッチソンの起用が発表され、ドラマ『リーチャー』は2022年2月に Prime Video で配信が始まった。</p><p>同じ役が、時代を変えて、二人の俳優に演じられている。</p>'
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
        hub: 'Apple TV',
        score: [3, 2, 2, 2],
        headline: '誘拐劇とSFが、\n同じ画面から届く。',
        slug: 'highest-2-lowest--pluribus',
        relation: '『HIGHEST 2 LOWEST』── Apple TV ── 『プルリブス』',
        leftStation: 'HIGHEST 2 LOWEST',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>ハブは配信サービス。</strong></p><p>『HIGHEST 2 LOWEST』はアメリカで劇場公開されたのち、2025年9月に Apple TV（当時の名称は Apple TV+）で配信された。『プルリブス』は、同年11月に Apple TV で配信が始まった Apple Original のドラマである。</p><p>作品どうしの内容は遠い。けれども、同じ配信サービスで、どちらも観ることができる。作品と作品をつなぐのは、物語だけではなく、それを届ける窓でもある。</p>'
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
          '<p><strong>35年を隔てて作られた続編が、物語の中でも30年後を描いた。</strong></p><p>『ブレードランナー』は、酸性雨の降る2019年のロサンゼルスで、人造人間レプリカントを追う男デッカードを描いた。公開当時は興行的に振るわなかったが、のちに多くの映画に影響を与える作品になった。</p><p>2017年、ドゥニ・ヴィルヌーヴ監督の続編『ブレードランナー 2049』が公開された。前作から30年後のロサンゼルスで、新たなブレードランナーKが、社会を揺るがしかねない長く埋もれた秘密を掘り起こし、30年間行方不明だったデッカードを探し始める。ハリソン・フォードは同じ役で再び登場した。</p>'
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
          '<p><strong>映画から配信のシリーズへ、物語は30年、そして50年と先へ進む。</strong></p><p>『ブレードランナー 2099』は、『2049』からさらに50年後を舞台にしたドラマ・シリーズとして、2026年11月25日から Prime Video で配信される。リドリー・スコットが製作総指揮に名を連ね、ミシェル・ヨーとハンター・シェイファーが主演する。</p><p>1982年、2017年、そして次の作品へ。同じ世界が、30年後、さらに50年後へと引き延ばされていく。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>1982年の『ブレードランナー』は、降り続く雨と巨大なネオン広告の街を、企業への皮肉を込めて描いた。1985年の『未来世紀ブラジル』は、書類と配管と手続きに覆われた管理社会を、ブラックコメディとして描いた。</p><p>二つの映画を並べると、どちらも未来を磨き上げられた世界としてではなく、荒廃と機能不全を抱えたまま動き続ける世界として描いていることが見えてくる。</p><p>『ブレードランナー』の街並みは、『攻殻機動隊』など日本のアニメの未来像にも影響を与えたとされる。『未来世紀ブラジル』が官僚社会を風刺した世界も、のちの映画やテレビ作品に影響を残している。</p>'
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
        headline: '夢を演じる俳優と、\n夢に逃げる役人の監督。',
        slug: 'brazil--johnny-depp',
        relation: '『未来世紀ブラジル』── テリー・ギリアム ── ジョニー・デップ',
        leftStation: '未来世紀ブラジル',
        rightStation: 'ジョニー・デップ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブは監督テリー・ギリアム。</strong></p><p>『未来世紀ブラジル』を撮ったテリー・ギリアムは、のちにジョニー・デップを主演に『ラスベガスをやっつけろ』（1998）を撮った。デップは、ヒース・レジャーの急逝で未完成になりかけた『Dr.パルナサスの鏡』（2009）でも、ジュード・ロウ、コリン・ファレルとともに、レジャーが演じたトニーの別の姿を鏡の向こうの世界で演じた。</p><p>レジャーが演じた場面は、現実世界のトニーとしてそのまま残された。出演料は、三人ともレジャーの娘に贈られたと伝えられている。</p><p>『未来世紀ブラジル』の主人公は、現実を離れて、翼を持つ戦士になる夢の中へ逃げ込む。『Dr.パルナサスの鏡』の鏡の向こうは、人の想像が形になる世界である。ギリアムの映画を結ぶものは、現実のすぐ隣に夢の世界を置く構図だと読むこともできる。</p>'
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
          '<p><strong>俳優が、自ら製作にも名乗りを上げて演じた役。</strong></p><p>『MINAMATA』でジョニー・デップは、写真家W・ユージン・スミスを演じた。デップは製作にも名を連ねている。</p><p>『パイレーツ・オブ・カリビアン』のジャック・スパロウ役で知られる俳優が、かつて名を馳せながら隠遁していた写真家を演じる。映画が描くのは、熊本の水俣に移り住み、患者と家族の暮らしにカメラを向けたスミスの姿である。映画は2020年のベルリン国際映画祭でプレミア上映された。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>従軍写真家だったユージン・スミスは、太平洋戦争の最前線を撮り、1945年の沖縄戦で重傷を負った。戦後は『ライフ』誌でフォト・エッセイを発表し、1971年には水俣に移り住んで公害を撮った。</p><p>同じ1945年、『この世界の片隅に』のすずは、広島の江波から嫁いだ呉で暮らしていた。海軍の拠点だった呉は、この年の3月に空襲にさらされる。</p><p>一方は戦場の最前線で、一方は配給が減っていくなか、食卓に工夫を凝らす暮らしの中で。同じ年の戦争を、まったく違う場所から見つめた二つのまなざしは、並べて読むと互いを照らし合うように見える。</p>'
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
        headline: '右手に寄生した生き物が\n人間を問い直す。',
        slug: 'iwaaki-hitoshi--parasyte',
        relation: '岩明均 ── 『寄生獣』（1989–1995）',
        leftStation: '岩明均',
        rightStation: '寄生獣',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>作者の名を知らしめた長編。</strong></p><p>『寄生獣』は1989年に『モーニングオープン増刊』で連載が始まり、のちに『月刊アフタヌーン』へ移って、1995年2月号で完結した。人間を捕食する寄生生物と、それに右手だけを奪われた高校生の共生を通して、「人間とは何か」を問う物語である。</p><p>講談社漫画賞と星雲賞を受け、全世界の累計発行部数は2500万部を超える。</p><p>岩明均の作品には、残酷な描写と、哲学的でドラマティックな展開とを両立させたものが多いとされる。文化庁メディア芸術祭は、のちの『ヒストリエ』に「この作者特有の」突き放したような明るさと残酷さがあると評した。</p>'
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
        headline: '『寄生獣』の作者は、\n古代ギリシアを描いた。',
        slug: 'iwaaki-hitoshi--historie',
        relation: '岩明均 ── 『ヒストリエ』（2003–）',
        leftStation: '岩明均',
        rightStation: 'ヒストリエ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#2f8f5b' },
        body:
          '<p><strong>SFから歴史へ。『ヒストリエ』には「この作者特有の」突き放したような明るさと残酷さがあると、文化庁メディア芸術祭は評した。</strong></p><p>『ヒストリエ』は『月刊アフタヌーン』で2003年3月号から連載が始まった歴史漫画で、紀元前4世紀の古代ギリシア世界を舞台に、のちにアレクサンドロス大王の書記官となるエウメネスの生涯を描く。</p><p>作中のエウメネスは、自分がスキタイ人の出身であることを知らずに、都市国家カルディアで育つ。ギリシアとスキタイ、二つの世界にまたがるその立場は、『寄生獣』で人間と寄生生物のあいだに立った新一と重ねて読むこともできる。</p>'
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
        routeName: '争奪戦の新人バンド',
        label: 'CONTEXT',
        kind: '事実',
        hub: '作中のバンド「レイジーズ」',
        score: [4, 4, 5, 4],
        basis: '前田先生の note（2017–2018）',
        headline: '新人バンドの契約を、\n野心家の男が狙う。',
        slug: 'kill-your-friends--frida-sundemo',
        relation: '映画『マッド・ドライヴ』── 作中のバンド「レイジーズ」── フリーダ・サンデモ',
        leftStation: 'マッド・ドライヴ',
        rightStation: 'フリーダ・サンデモ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>映画の中の新人バンドのボーカルを、スウェーデンのシンガーソングライターが演じている。</strong></p><p>『マッド・ドライヴ』の原題は、ジョン・ニヴンの原作小説と同じ『Kill Your Friends』。1990年代のブリットポップに沸く英国で、レコード会社のA&R担当ステルフォックスが、成り上がるために道を踏み外していく。ある英国の映画評は、主人公が音楽も仕事も人生も憎んでいると書いた。</p><p>作中には、業界が競って契約を狙う、前評判の高い架空の新人バンド「レイジーズ」（The Lazies）が登場する。ステルフォックスも、同業のA&R担当と契約を競い合う。そのボーカルを演じるのが、フリーダ・サンデモである。本人は、その歌手役を「映画の中でほぼ唯一のいい人」と冗談めかして語っている。</p><p>前田先生は note で、この映画の鍵は「あえて目立たないよう配置されたアーティスト」、つまり彼女にあると書いた。先生によれば、主人公は、音楽を商売にする者に好みを聞くのは、投資家に銘柄を聞くのと同じで無意味だ、と嘯く。その直後、ライブハウスで彼女自身の曲が流れ、主人公は不用意にその音楽性に触れて、うろたえるという。</p><p>先生は、彼女の仕草や歌いぶりに、本人か監督のノスタルジーが強く表れていると見て、「同年代の私もホロリときてしまった」と書く。彼女の活躍と賞賛を、それまでに多大な努力をしたA&Rの人間への「手向けの花」と読んでいる。</p>'
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
          '<p><strong>ニューヨークの屋上で眠る男と、世界中で踊られた一曲。</strong></p><p>ファッション写真家で元モデルのマーク・レイは、華やかなパーティー会場を後に、友人のアパートの屋上で寝袋にくるまって朝を迎えていた。その暮らしは6年に及んだ。日々を追ったのが、2014年のドキュメンタリー『ホームレス ニューヨークと寝た男』である。</p><p>ファレル・ウィリアムスの「HAPPY」には、「屋根のない部屋」のような気分なら手を叩こう、という一節がある。2013年の24時間ぶんのミュージックビデオはロサンゼルスの街で撮影され、のちに世界各地の人々が同じ曲に合わせて踊る動画を次々に投稿した。その数は、2014年5月までに1,500本を超えたという。</p><p>前田先生は2018年8月の note「屋根のない部屋で見る＜夢と現実＞」で、この映画と「HAPPY」を結んでいる。先生はマーク・レイを「世界一華麗なホームレス」と呼び、世界中の人々が踊る様子が、ニューヨークにこだわる彼に重なると書く。そして映画を、都会が自分のアイデンティティの一部になった、いつまでも諦めずに希望を持つ人の象徴と見て、「まだまだ、これからなんだ。人生ってヤツは」と結ぶ。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。どちらも、火星を「戦争」として描いた英国の作品である。</strong></p><p>ホルストの組曲『惑星』は、第1曲「火星、戦争をもたらす者」の、執拗に刻まれる五拍子のリズムで始まる。作曲は1914年から1917年、第一次世界大戦のさなかである。ただし最初に書かれた「火星」は、開戦前に書き上げられていた。</p><p>その十数年前の1898年、H・G・ウェルズは『宇宙戦争』で、火星人が当時最大の植民地帝国だった英国に襲来し、軍隊の抵抗を押し切ってロンドンを含む南イングランドを蹂躙するさまを描いた。</p><p>惑星を占星術の性格で描いた組曲と、惑星からの侵略を描いた小説。宇宙を見上げながら、英国は二度、火星に戦争の顔を見ていたとも言える。「木星」の旋律は、のちに愛国歌「我は汝に誓う、我が祖国よ」になり、前田先生はこの曲を、英国人の気概を知る手がかりとして紹介している。</p>'
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
        headline: '父の語った島を探す旅は\n映画で別の物語になる。',
        slug: 'tengoku-film--tengoku-book',
        relation: '森村桂『天国にいちばん近い島』（1966）── 映画化 ── 大林宣彦『天国にいちばん近い島』（1984）',
        leftStation: '天国にいちばん近い島（映画）',
        rightStation: '天国にいちばん近い島（旅行記）',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>若い女性の実体験の旅が、のちに、まったく別の物語として映画になった。</strong></p><p>森村桂は1964年、1ドルが360円で海外渡航にも制限があった時代に、亡き父が語った「天国にいちばん近い島」を探して、ひとりでニューカレドニアへ旅立った。船会社の社長に手紙で頼み、運搬船にただで乗せてもらっての旅で、その記録が1966年に刊行された『天国にいちばん近い島』である。前田先生の note によれば、旅先で盲腸になった彼女を助けたのは、日本人の血を引く無国籍の男性ムッシュ・ワタナベだった。</p><p>大林宣彦は1984年、原田知世の主演で、同じ題名の映画を撮った。主人公は父を亡くした高校生の桂木万里で、筋は原作とまったく異なる。映画には、戦争で夫を亡くした女性（石川貞）が、夫の亡くなった海を主人公と訪れる場面がある。前田先生の note によれば、これは原作にない挿話で、未亡人は近海で沈んだ日本の潜水艦の兵士の慰霊碑を供養に訪れる。先生は、大林監督が戦争や政治の重い影をあえて前面に出さず、日本との暗い過去とのつながりをさりげなく挿入した、と読んでいる。</p>'
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
        headline: '天国にいちばん近い島は\n人質事件の島でもある。',
        slug: 'tengoku-book--rebellion-ordre-et-morale',
        relation: '森村桂『天国にいちばん近い島』── ニューカレドニア ── 映画『裏切りの戦場 葬られた誓い』',
        leftStation: '天国にいちばん近い島（旅行記）',
        rightStation: '裏切りの戦場 葬られた誓い',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>ハブはニューカレドニア。同じ土地の、光と影。</strong></p><p>ニューカレドニアはフランスの海外領土で、世界有数のニッケルの産地である。明治の半ばから多くの日本人が鉱山の労働者として渡り、現地の女性と所帯を持って暮らす人も少なくなかった。しかし太平洋戦争が始まると、日本人移民の多くは「敵性外国人」としてオーストラリアなどへ強制移送された。妻子を現地に残したまま、戦後に日本へ送還された人もいた。</p><p>森村桂の『天国にいちばん近い島』は、そんな歴史を背負う土地の、穏やかでやさしい顔を描いた旅行記と読める。前田先生の note によれば、本に登場する実在の人物ムッシュ・ワタナベは、フランス国籍を得られず差別された無国籍の人びとの一人だった。</p><p>一方、映画『裏切りの戦場 葬られた誓い』が描くのは、1988年、独立を求めるカナックの人々がウベア島で憲兵を人質にとった事件である。ウベア島は、森村桂の本と、同じ題名の映画（1984年）に導かれて日本人が多く訪れるようになった島でもある。</p><p>前田先生は、この土地について note の冒頭に「ニューカレドニアは、天国に近い島は植民地で、戦場であり続ける」と書いている。二つの作品は、その土地を反対の側から照らしている。</p>'
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
        headline: '亡き父の言葉を頼りに、\n少女は南の島へ向かう。',
        slug: 'tengoku-film--harada-tomoyo',
        relation: '原田知世 ── 主演 ── 大林宣彦『天国にいちばん近い島』',
        leftStation: '天国にいちばん近い島（映画）',
        rightStation: '原田知世',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>大林宣彦監督のもとで、原田知世は二年続けて主演した。</strong></p><p>原田知世は1983年7月公開の『時をかける少女』（大林宣彦監督、角川春樹事務所製作）で、映画に初主演した。その翌年、1984年12月15日に公開されたのが、同じ監督のもとで主演した『天国にいちばん近い島』である。</p><p>亡き父の言葉を頼りに、南の島へ向かう少女。原作の森村桂『天国にいちばん近い島』は、著者自身のニューカレドニア旅行を描いた旅行記だが、映画はまったく別の筋の物語で、主人公は父を亡くした高校生・桂木万里である。前田先生の note は、若い女性が飛行機で海外を旅するという映画の設定を、原作の旅があった1964年には考えられなかったことだと指摘している。</p><p>その万里を原田知世が演じ、同名の主題歌も歌った。主題歌は公開に先立つ1984年10月にシングルとして発売され、オリコン週間ランキングで1位になっている。</p>'
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
        headline: '『象を撃つ』の作者は、\n後に監視国家を書いた。',
        slug: 'shooting-an-elephant--nineteen-eighty-four',
        relation: 'ジョージ・オーウェル『象を撃つ』── オーウェル ── 『1984年』',
        leftStation: '象を撃つ',
        rightStation: '1984年',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブは書き手オーウェル。権力の側に立った経験から、権力の物語が生まれた。</strong></p><p>本名エリック・ブレアは、1920年代に英領ビルマで警察官をしていた。『象を撃つ』は、暴れた象を、群衆の期待に押されて撃たねばならなくなった警官の「私」を書いたエッセイである。作者自身の体験に基づくとされるが、事実か創作かは確定していない。オーウェルはやがて警官を辞め、ビルマを舞台にした小説『ビルマの日々』を書いた。前田先生は note で、この小説にも『象を撃つ』と同じく統治する側の人間の内面的な敗北が描かれていて、それこそ警官を辞めた理由そのものだと書いている。</p><p>オーウェルの目は、『動物農場』『1984年』で、国家が人を支配するしくみそのものへ向かっていく。前田先生の2018年の note によれば、ビルマ（現ミャンマー）では少し前まで、この二冊が出版禁止の「禁書」だった。軍事独裁の暗い歴史を予言し、批判する内容だったからだという。</p><p>エマ・ラーキンは『Finding George Orwell in Burma』で、この二冊がビルマの軍事独裁を予見していたと論じている。ラーキンが旅した当時のビルマには、オーウェルを「予言者」と呼ぶ人がいたという。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>コンラッドの『闇の奥』は、1899年に連載された。船乗りマーロウが、象牙取引の奥地コンゴで消息を絶ったクルツを探しに向かう。文明の使者であるはずのクルツが壊れていくさまを、欧州の側から描いた。</p><p>オーウェルの『象を撃つ』（1936）は、ビルマで、権威ある白人警官であることを群衆に示すために象を撃つ「私」を描いた。笑われまいとして引き金を引く「私」は、白人が暴君になるとき壊されるのは自分自身の自由だ、と書き留める。</p><p>どちらも、支配される側ではなく、支配する側の人間の内面に目を向けている。前田先生は2018年8月の二つの note で、『象を撃つ』に権力の側にある人間の内面的な敗北を、『闇の奥』（Heart of Darkness）に「（自称）文明人の心の闇」を読んでいる。帝国の時代を内側から見つめた英語の二つの作品は、並べて読むことで互いの輪郭をはっきりさせる。</p>'
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
          '<p><strong>ハブは、1984年のアップルの広告。</strong></p><p>1984年1月22日、アップルはスーパーボウルの中継で、2日後に発表する最初の Macintosh のテレビ広告を流した。オーウェルの『1984年』を下敷きにしたこの広告では、画面の独裁者に向かって女性がハンマーを投げつける。監督はリドリー・スコット、女性を演じたのはアニャ・メジャーである。</p><p>13年後の1997年、アップルは「Think Different」で、世界を変えた「クレイジーな人たち」を讃えた。1984年の広告は Chiat/Day が、1997年の「Think Different」は TBWA\\Chiat\\Day のロサンゼルス事務所が手がけた。「1984」は体制に挑む一人の女性を、「Think Different」は世界を変える「クレイジーな人たち」を主役にしている。</p><p>群衆ではなく個人に光を当てた広告として、二つは並べて読める。</p>'
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
        headline: '広告「1984」も、\nスコットが撮っていた。',
        slug: 'nineteen-eighty-four--blade-runner',
        relation: 'ジョージ・オーウェル『1984年』── リドリー・スコットの広告「1984」── 『ブレードランナー』',
        leftStation: '1984年',
        rightStation: 'ブレードランナー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブは監督リドリー・スコット。</strong></p><p>『ブレードランナー』（1982）で、酸性雨の降る管理社会を描いたリドリー・スコットは、オーウェルの『1984年』を下敷きにしたアップルのテレビ広告「1984」も監督した。広告が全米に流れたのは、『ブレードランナー』公開から約1年半後の1984年1月22日である。</p><p>灰色の群衆と、巨大な画面から語りかける独裁者。広告会社の Chiat/Day が探していたのは、SFに強い監督だった。スコットが選ばれたのは、前作『ブレードランナー』に、狙っていたディストピアの感触があったからだと、アンディ・ハーツフェルドは記している。</p><p>この広告は、1995年に広告専門誌 Advertising Age が選んだ「最高のコマーシャル50選」で第1位になった。</p>'
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
          '<p><strong>『未来世紀ブラジル』の仮題『1984½』は、迫りくる1984年と、フェリーニへの敬意から生まれた。</strong></p><p>テリー・ギリアムは『未来世紀ブラジル』の制作中、『1984½』という題を考えていた。本人の説明によれば、敬愛するフェリーニと、迫りくる1984年を重ねた題である。フェリーニの『8½』にならった題で、英語版Wikipediaは、オーウェルの『1984年』への目配せでもあったと紹介している。</p><p>書類と配管と手続きにがんじがらめになった社会で、夢に逃げ込むしかない役人。ギリアムは自作を「1984年版『1984年』」と呼び、小説の再現ではなく、今日の視点から未来を描いたと説明している。一方、2003年のインタビューでは、オーウェルの小説を読んだのは映画のあとだったとも話している。</p><p>1985年に公開されたこの映画は、「1984年」が現実に過ぎ去ったあとに、なお終わらないディストピアを描いていると読める。</p>'
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
        headline: '悪徳弁護士には、\n別の名前の頃があった。',
        slug: 'breaking-bad--better-call-saul',
        relation: 'ドラマ『ブレイキング・バッド』── スピンオフ ── 『ベター・コール・ソウル』',
        leftStation: 'ブレイキング・バッド',
        rightStation: 'ベター・コール・ソウル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>本編以上とも言われたスピンオフ。</strong></p><p>『ベター・コール・ソウル』は、『ブレイキング・バッド』に登場する悪徳弁護士ソウル・グッドマンが、まだジミー・マッギルという名だった頃から始まる。前田先生は、この作品について書いた note に「大ヒットドラマ『Breaking Bad』以上のスピンオフ作品」という題をつけた。</p><p>先生の読みでは、『ブレイキング・バッド』の主人公ウォルター・ホワイトは、正義より家族を、やがて家族よりもアイデンティティにこだわった。『ベター・コール・ソウル』の人物たちも、家族や正義、会社や名誉、アイデンティティにこだわって精一杯生きているが、達成感はなく、苛立ちや不安に苛まれている。</p><p>先生は、視聴者にはジミーの運の巡りの悪さばかりがユーモラスに映るだろうが、登場人物たちのやるせなさは、悪意を伴わないまま、いずれ『ブレイキング・バッド』の凶悪な犯罪に結びつき、それを加速させる、と読む。</p><p>そしてこの連関を考えると、このドラマは、米国の社会規範をより不明瞭にする現代の「不正義の起源」あるいは避けられない悪行の正当性を暗に主張する、危険なエンターテインメントにすら思える、と書いている。</p>'
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
        headline: '化学教師の物語の作者が\nのちに描く「私たち」。',
        slug: 'breaking-bad--pluribus',
        relation: 'ドラマ『ブレイキング・バッド』── ヴィンス・ギリガン ── 『プルリブス』',
        leftStation: 'ブレイキング・バッド',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>ハブは作り手ヴィンス・ギリガン。</strong></p><p>『ブレイキング・バッド』を生んだヴィンス・ギリガンは、『ベター・コール・ソウル』を経て、Apple TV の『プルリブス』を手がけた。</p><p>ひとりの男が善悪の境を越えていく物語から、人々の心がひとつに溶け合う世界で「ひとりであること」を問う物語へ。ギリガンは『ベター・コール・ソウル』の制作中にこの着想を得たと語る。悪人を主人公にしてきた作り手が、心がひとつになった世界で、それに加われないひとりを主人公に据えた。</p>'
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
        headline: '13人の免疫者の一人を\nキム役の俳優が演じる。',
        slug: 'better-call-saul--pluribus',
        relation: 'ドラマ『ベター・コール・ソウル』── 俳優レイ・シーホーン ── 『プルリブス』',
        leftStation: 'ベター・コール・ソウル',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>ハブは俳優レイ・シーホーン。</strong></p><p>『ベター・コール・ソウル』で、ジミーの恋人であり、有能な弁護士キム・ウェクスラーを演じたのがレイ・シーホーンである。</p><p>ヴィンス・ギリガンは『プルリブス』で、彼女を主役に据えた。キャロルという役は、ギリガンがシーホーンを念頭に書いたものだという。人々の心がひとつになった世界で、それに加われない13人のひとりが、作家のキャロルである。前作でジミーの隣にいた俳優が、次の作品の真ん中に立った。</p>'
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
          '<p><strong>前田先生は、『インターステラー』を現代版の『怒りの葡萄』として読む。</strong></p><p>『インターステラー』の冒頭には、砂嵐の記憶を語る老人たちのインタビューが流れる。これは、1930年代にアメリカのグレートプレーンズ（大平原）を襲った砂嵐「ダストボウル」を実際に体験した人々の証言で、ケン・バーンズのドキュメンタリーから引かれている。</p><p>ダストボウルで土地を追われ、カリフォルニアへ向かった農民一家を描いたのが、スタインベックの『怒りの葡萄』である。</p><p>先生は、『地獄の黙示録』が『闇の奥』に着想を得たように、『インターステラー』も『怒りの葡萄』を下敷きにつくられたと見ている。アメリカ人が過酷な環境から「這いずり出るように」アイデンティティーを得てきたのと同じく、この映画も「民衆の生き続けるたくましさ」をたたえるかのようだ、と書いている。</p>'
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
        headline: '父と娘の時間のずれを、\n兄弟で書いた。',
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
        headline: '異星人の侵略は、\n父と子の逃避行になる。',
        slug: 'the-war-of-the-worlds--war-of-the-worlds-2005',
        relation: 'H・G・ウェルズ『宇宙戦争』（1898）── 映画化 ── スピルバーグ『宇宙戦争』（2005）',
        leftStation: '宇宙戦争（小説）',
        rightStation: '宇宙戦争（映画）',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>同じ侵略、違う問い。</strong></p><p>ウェルズの『宇宙戦争』は、火星人の襲来でロンドンの秩序がたちまち崩れ、人々が逃げ惑うさまを、思索する語り手の目で描いた。前田先生はこれを、人類が地球という閉じた空間での覇権を簡単に失いうることを示した警句として読み直している。</p><p>スピルバーグの映画は、舞台を現代のアメリカに移し、原作にない父と子の物語を加えた。離婚した父親レイが、二人の子どもを連れて逃げる。映画が重心を置くのは、家族を一つにつなぎとめることだ。前田先生は、原作のような深い思索までは表現し切れていないとしつつ、この逃避行に「危機の中で突然芽生えた父親としての使命感」を見る。圧倒的な相手を前に、人間は「どう生きて、戦うべきか」。映画はそれを考えさせてくれる、と書いている。</p><p>同じ侵略を描きながら、原作は人類の覇権の行方を、映画は一つの家族の行方を見つめている、と読める。</p>'
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
        headline: '守る父を撮った監督は、\n旅立つ父の企画にいた。',
        slug: 'war-of-the-worlds-2005--interstellar',
        relation: 'スピルバーグ『宇宙戦争』── スティーヴン・スピルバーグ ── 『インターステラー』',
        leftStation: '宇宙戦争（映画）',
        rightStation: 'インターステラー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブはスティーヴン・スピルバーグ。</strong></p><p>『インターステラー』は、はじめスピルバーグが監督する予定で企画が進められていた。脚本を書いていたのはジョナサン・ノーランで、のちに兄のクリストファーが監督を引き継いだ。前田先生は note で、『怒りの葡萄』のSF版にあたるこの映画の監督を、スピルバーグが若い世代のクリストファー・ノーランに譲ったことになる、と書いている。</p><p>スピルバーグが『宇宙戦争』で描いたのは、地球の危機のなかで子どもたちを連れて逃げる父だった。『インターステラー』は、地球の危機のなかで父が子のために旅立つ物語になった。二つの作品は、スティーヴン・スピルバーグという名でつながっている。守ろうとする父と、旅立つ父。向きの違う二人の父が、その名の両側に立つ。</p>'
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
        headline: '人類は、\n船を乗り換えられるか。',
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
          '<p><strong>前田先生が note に書き写した一節から。</strong></p><p>書き写されたのは鷲田清一の文章で、note の日付は2017年12月30日。出典には『＜わたし＞と国家のあいだ』とある。『時代のきしみ』の副題と同じ題だ。</p><p>文章は、こう始まる。「ひとは時代を拒否し、時代から遁走しようとすればするだけ、より緻密に時代に絡みとられてゆく。」法律や制度、習俗や縁といった生の背景が、もはや背景ではすまなくなるからだ、と鷲田は書く。</p><p>鷲田はさらに、わたしたちの存在を編んでいる意味の糸が、思考や欲望のかたちを左右するだけでなく、システムの貫通や包囲をかわそうとする「抵抗のスタイル」までも規定している、と述べる。結びの一文はこうだ。「その意味で、時代を拒否するとは、ほとんどじぶんの存在を脱臼させるにひとしい。」</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>ハンナ・アーレントは『全体主義の起原』で、全体主義が個人の生活のあらゆる面を支配しようとするしくみを分析し、アイヒマン裁判の報告では、自分の頭で考えることをやめた凡庸な人間が、巨大な悪に加担しうることを論じた。</p><p>鷲田清一の『時代のきしみ』は、副題に〈わたし〉と国家のあいだを掲げる。前田先生が note に書き写した一節も、出典を『＜わたし＞と国家のあいだ』としている。鷲田はその一節で、時代を拒もうとするほど「より緻密に時代に絡みとられてゆく」と書き、システムをかわそうとする「抵抗のスタイル」さえ、存在を編む意味の糸が規定している、と述べる。</p><p>個人は国家の外に立てるのか。二人の思想家は、半世紀ほどを隔てて、どちらも〈わたし〉と国家のあいだで考えた、とも言える。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>鷲田清一は『モードの迷宮』で、衣服とそれを身にまとう自分とは何かを問い、『ちぐはぐな身体』では身体の〈境界〉という問題にも触れてきた。</p><p>『ホームレス ニューヨークと寝た男』のマーク・レイは、元モデルのファッション写真家で、スーツを着こなす。外から見れば華やかなニューヨークの暮らしを続けながら、夜は屋上の片隅で眠っていた。</p><p>マーク・レイ本人は2016年の来日時、MODE PRESS の取材に「助けを求めている人間だと思われたくなかったんだ。見た目に関してはプライドもあった。だからビルの屋上でひどい夜を過ごした後でさえ、僕は身なりを整えた」と語っている。衣服とそれを身にまとう自分とは何か。哲学者の問いと、一人の男の暮らしが、重なって見える。</p>'
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
          '<p><strong>原作の題は、問いの形をしている。</strong></p><p>ディックの小説で、賞金稼ぎリック・デッカードが追うのは、人間と見分けのつかないアンドロイドである。本物の動物を飼うことが豊かさのしるしになった世界で、彼は電気仕掛けの羊を飼っている。</p><p>リドリー・スコットの『ブレードランナー』は、題も舞台も大きく変え、ロサンゼルスの酸性雨の夜を描いた。それでも、共感できることが人間の証なのかという原作の問いは、形を変えながら、映画の終盤の雨の場面にまで流れている。</p><p>前田先生は note で、ディックの別の長編『去年を待ちながら』（1966）から、主人公が自律走行タクシーに問いかける場面を引いている。重病で回復の見込みのない妻を捨てるのか、それともそばにいるのか。そう尋ねられたタクシーは、自分には妻がいないと断ったうえで、「わたしならそばにいてやりますね」と言い切る。答えを先に口にしたのは機械で、主人公はそのあと、自分も妻のそばにいることにする。共感が人間の証なのだとすれば、この機械はどちら側に立つのだろう。</p><p>原作者のディックは1981年、アンドロイドを「生理的には人間なのに、人間らしくふるまわない人々」の比喩だと語った。同じ年の終わりごろ、完成前の映画の一部を見たあと、「原作と映画は戦わず、互いを補強する」と述べている。</p>'
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
        headline: '人に仕えるロボットと、\n紛れ込むアンドロイド。',
        slug: 'isaac-asimov--do-androids-dream',
        relation: 'アイザック・アシモフ ── 人に似せて作られた機械 ── フィリップ・K・ディック『アンドロイドは電気羊の夢を見るか？』',
        leftStation: 'アイザック・アシモフ',
        rightStation: 'アンドロイドは電気羊の夢を見るか？',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>アシモフは、人間に危害を加えないことなどを定めた「ロボット工学三原則」を打ち出し、ロボットが人間と共に生きる物語を数多く書いた。</p><p>ディックのアンドロイドは、人間になりすまし、見分けるには、共感の反応を測る検査が頼りになる。ディック自身は、アンドロイドを「生理的には人間なのに、人間らしくふるまわない人々」の比喩だと語っている。</p><p>人間に仕える機械と、人間に紛れ込む機械。アシモフが三原則を示した1942年から二十数年を隔てて、同じアメリカのSFが、人に似せて作られたものを正反対の方向から描いた。</p>'
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
        headline: '植えつけられた記憶でも\nそれは自分なのか。',
        slug: 'greg-egan--blade-runner-2049',
        relation: 'グレッグ・イーガン ── 複製された意識と記憶 ── 『ブレードランナー 2049』',
        leftStation: 'グレッグ・イーガン',
        rightStation: '2049',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>グレッグ・イーガンは『順列都市』（1994）や『ディアスポラ』（1997）で、コンピュータの中に写し取られた意識や、自分のコピーと向き合う人間を、数学と物理の言葉で描いてきた。</p><p>『ブレードランナー 2049』の主人公Kはレプリカントで、レプリカント用の記憶を作る専門家アナ・ステリンを訪ねる。作りものかもしれない記憶を抱えたまま、Kは自分が何者なのかを追っていく。</p><p>作られた記憶や複製された意識でも、それを生きる自分は本物なのか。イーガンの小説とヴィルヌーヴの映画は、近い問いを別々の道具で掘り下げているとも読める。</p>'
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
        headline: '『ブラジル』の監督が、\n今の世界の一端を描く。',
        slug: 'terry-gilliam--the-zero-theorem',
        relation: 'テリー・ギリアム ── 監督 ──『ゼロの未来』',
        leftStation: 'テリー・ギリアム',
        rightStation: 'ゼロの未来',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>『未来世紀ブラジル』『12モンキーズ』に続くディストピア。</strong></p><p>『ゼロの未来』は、巨大企業の管理のもとで「ゼロの定理」の証明を命じられた孤独なプログラマーの物語である。『未来世紀ブラジル』『12モンキーズ』と並べて、ディストピア三部作と呼ばれることがあるが、監督自身の発言は時期によって揺れている。</p><p>ギリアムは、『ブラジル』では当時の世界の姿を描こうとし、『ゼロの未来』は今の世界の一端だと述べている。書類の社会から、画面とネットワークの社会へ。およそ30年を隔てて、同じ監督が時代の道具に合わせて管理社会を描き直した、と読むこともできる。</p>'
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
        headline: '夢に逃げ込む役人を、\nブラックな笑いで描く。',
        slug: 'terry-gilliam--brazil',
        relation: 'テリー・ギリアム ── 監督 ──『未来世紀ブラジル』',
        leftStation: 'テリー・ギリアム',
        rightStation: '未来世紀ブラジル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>ハリウッドと戦った一本。</strong></p><p>『未来世紀ブラジル』は、結末をめぐって配給会社ユニバーサルと対立したことで知られる。ギリアムは『デイリー・バラエティ』紙に全面広告を出し、親会社MCAの社長シド・シェインバーグに宛てて「私の映画『ブラジル』をいつ公開するのか」と問いかけた。</p><p>ギリアムは自作を「ウォルター・ミティとフランツ・カフカの出会い」と呼んだ。主人公は情報局の小官吏サム。彼は、ヒーローになって天使のような娘と大空を飛ぶ夢想に耽る。情報管理社会に生きるそんな役人を、モンティ・パイソン出身のギリアムはブラックコメディとして描いた。</p><p>管理社会を描いた監督が、自作の公開をめぐって大手スタジオと争った。この重なりに、ギリアムの作家としての姿勢を読み取ることもできる。</p>'
      }
    },

    {
      id: 'seed-the-zero-theorem--brazil',
      createdAt: '2026-09-14T04:30:00.000Z',
      updatedAt: '2026-09-14T04:30:00.000Z',
      a: W.zero,
      b: W.brazil,
      context: {
        routeName: '二つの管理社会',
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
          '<p><strong>意味の上での近さから結ばれた区間。同じ監督が、およそ30年を隔てて、似た悪夢を描いた。</strong></p><p>『未来世紀ブラジル』の役人サムは、書類と配管の迷宮の中で、大空を飛ぶ夢想に耽る。</p><p>『ゼロの未来』のプログラマー、コーエンは、画面とデータの迷宮の中で、人生の意味を告げる電話を待ち続ける。</p><p>ギリアムは、『ブラジル』では当時の世界の姿を描こうとし、『ゼロの未来』は今の世界の一端だと述べている。紙の官僚制から、ネットワークの管理へ。道具は変わっても、個人が巨大なしくみの中で、救いや意味を求めてさまよう構図は重なって見える。</p>'
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
        hub: 'Apple TV',
        score: [3, 3, 3, 3],
        headline: '銀河の帝国と、\nひとつになった世界。',
        slug: 'foundation--pluribus',
        relation: 'アイザック・アシモフ『ファウンデーション』── Apple TV ── 『プルリブス』',
        leftStation: 'ファウンデーション',
        rightStation: 'プルリブス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#3447c9' },
        body:
          '<p><strong>ハブは配信サービス Apple TV（2025年10月に Apple TV+ から改称）。</strong></p><p>『ファウンデーション』のドラマ版は2021年9月24日に Apple TV+ で、『プルリブス』は2025年11月7日に Apple TV で、それぞれ配信が始まった。</p><p>数学者ハリ・セルダンが「心理歴史学」で銀河帝国の崩壊を予見する物語と、感染によってほぼすべての人の心がひとつにつながる世界の物語。個人を超えた「全体」をめぐる主題で、この二作を並べて読むこともできる。</p>'
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
        headline: 'セネガルの声が、\n英国の曲の最後を歌う。',
        slug: 'youssou-ndour--peter-gabriel',
        relation: 'ピーター・ガブリエル「イン・ユア・アイズ」── 共演 ── ユッスー・ンドゥール',
        leftStation: 'ユッスー・ンドゥール',
        rightStation: 'ピーター・ガブリエル',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>二人は何度も同じ舞台に立った。</strong></p><p>ピーター・ガブリエルの1986年のアルバム『So』に収められた「イン・ユア・アイズ」では、終盤でユッスー・ンドゥールがウォロフ語で歌う。ガブリエルはユッスーの声を「液体の黄金」（liquid gold）と形容し、この曲で彼が歌い出す場面を素晴らしい瞬間だと語っている。</p><p>共演は録音だけでは終わらなかった。1986〜87年の This Way Up ツアーでは、おもに北米公演で、ガブリエルがこの曲をユッスーとのデュエットで歌った。1988年のアムネスティ・インターナショナルの巡回公演『Human Rights Now!』には二人とも出演者として名を連ね、2014年には、ガブリエルがロックの殿堂入りを果たした式典で、二人が長いデュエットを披露している。この一曲の録音が、二人の長い共演の入り口になったとも言える。</p>'
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
        headline: 'ボウイ「ヒーローズ」を\nガブリエルが歌い直す。',
        slug: 'peter-gabriel--david-bowie',
        relation: 'デヴィッド・ボウイ「ヒーローズ」── カバー ── ピーター・ガブリエル',
        leftStation: 'ピーター・ガブリエル',
        rightStation: 'デヴィッド・ボウイ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>ハブは一曲の歌。</strong></p><p>デヴィッド・ボウイの「ヒーローズ」（1977）は、ベルリンの壁のそばで逢う恋人たちを歌った曲である。</p><p>ピーター・ガブリエルは2010年のアルバム『スクラッチ・マイ・バック』で、この曲をオーケストラだけの伴奏で歌い直した。二人の音楽家が、一曲の歌を通じて向き合っている。</p>'
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
        headline: 'ロックスターは、\n捕虜の少佐になった。',
        slug: 'david-bowie--merry-christmas-mr-lawrence',
        relation: 'デヴィッド・ボウイ ── 出演 ── 大島渚『戦場のメリークリスマス』',
        leftStation: 'デヴィッド・ボウイ',
        rightStation: '戦場のメリークリスマス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>音楽や笑いの世界の人びとが俳優として並んだ映画。</strong></p><p>大島渚の『戦場のメリークリスマス』で、デヴィッド・ボウイは捕虜の英国人少佐セリアズを演じた。収容所長ヨノイ大尉を演じたのは坂本龍一、ハラ軍曹を演じたのはビートたけしである。</p><p>ボウイはすでに1976年の『地球に落ちて来た男』で主演していたが、坂本龍一にとってこの映画は、映画音楽と俳優の両方のデビューだった。ビートたけしは当時、テレビのバラエティ番組で活躍する芸人として知られていた。異なる世界から集まった顔ぶれが、国と文化の違いのなかで向き合う男たちの物語に、独特の緊張を与えているとも言える。</p>'
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
        headline: '37年を隔てて、\n音楽は同じ作曲家だ。',
        slug: 'merry-christmas-mr-lawrence--minamata',
        relation: '大島渚『戦場のメリークリスマス』── 坂本龍一 ── 映画『MINAMATA』',
        leftStation: '戦場のメリークリスマス',
        rightStation: 'MINAMATA',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#3447c9' },
        body:
          '<p><strong>ハブは音楽家・坂本龍一。</strong></p><p>『戦場のメリークリスマス』（1983）の音楽は、ヨノイ大尉を演じた坂本龍一が作曲した。そのテーマ曲は、代表曲のひとつとして知られている。</p><p>坂本龍一は、2020年にベルリン国際映画祭で初上映された映画『MINAMATA』でも音楽を担当した。戦争の傷と、公害の傷。ジャワの捕虜収容所を舞台にした映画と、水俣病を伝えた写真家W・ユージン・スミスを描いた映画に、同じ作曲家が音を与えている。</p>'
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
          '<p><strong>博物学者が描いた、世界のしくみの図。</strong></p><p>南方熊楠は1903年7月18日、真言宗の僧・土宜法龍に宛てた手紙の中で、多くの線を使った一枚の図を描いた。熊楠は、世界では因果関係が交錯し、それがさらに連鎖して、さまざまな現象になって現れる、と説明した。のちに「南方曼荼羅」と呼ばれる図である。</p><p>線が交わる図の中心を、熊楠は「萃点」（すいてん）と名付けた。南方熊楠記念館の解説によれば、熊楠は帰国後の那智時代に、真言密教の曼荼羅や粘菌の生活史を用いて森羅万象を表す図を示した。粘菌が重要な研究対象になりはじめたのも、この頃である。</p><p>粘菌という小さな生き物の観察と、密教の曼荼羅。その二つが出会う場所で、熊楠は世界の全体を図にしようとした、と読むこともできる。</p>'
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
          '<p><strong>曼荼羅は、ひとりの僧に宛てた手紙のなかで生まれた。</strong></p><p>南方熊楠と土宜法龍は、1893年にロンドンで出会い、連日のように宗教を語り合った。法竜がパリへ渡ったあとは文通が始まり、手紙のやりとりは約30年にわたって続いた。</p><p>出会いから10年ほどのち、1903年7月18日付の法竜宛ての手紙のなかで、熊楠は南方曼荼羅の図を描いた。因果関係が交錯する世界のありさまを、多くの線で示した図である。</p><p>南方熊楠記念館は、こうした法竜宛ての書簡を、西洋の近代自然科学の因果律に仏教思想の偶然性を取り入れたものと解説する。熊楠の最も重要な学問論ともいわれる。二人の往復書簡は、『南方熊楠 土宜法竜 往復書簡』（八坂書房、1990年）にまとめられている。</p>'
      }
    },

    {
      id: 'seed-minakata-kumagusu--natsume-soseki',
      createdAt: '2026-09-14T02:50:00.000Z',
      updatedAt: '2026-09-14T02:50:00.000Z',
      a: W.minakata,
      b: W.soseki,
      context: {
        routeName: 'ロンドンの入れ違い',
        label: 'CONTEXT',
        kind: '事実',
        hub: 'ロンドン',
        score: [5, 4, 5, 3],
        headline: '同じ年生まれの二人は、\nロンドンで入れ違った。',
        slug: 'minakata-kumagusu--natsume-soseki',
        relation: '南方熊楠（1867年生まれ）── ロンドン ── 夏目漱石（1867年生まれ）',
        leftStation: '南方熊楠',
        rightStation: '夏目漱石',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>ハブはロンドン。同じ年に生まれた二人の、入れ違い。</strong></p><p>南方熊楠と夏目漱石は、どちらも1867年に生まれた。熊楠は1892年から1900年までロンドンに住み、大英博物館に通って学んだ。</p><p>熊楠がロンドンを離れたのは1900年9月。その翌月の10月末、入れ替わるように漱石が留学生としてロンドンに着く。</p><p>漱石は下宿先を転々とし、神経衰弱に陥った。熊楠は博物館で蔵書を筆写し、そのノート『ロンドン抜書』は52冊に及んだ。同じ都市で対照的な留学生活を送った二人は、そこでは顔を合わせないまま入れ違いになった。二人は1884年、ともに大学予備門に入学した同窓でもあった。</p>'
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
        headline: '椅子は「座る」ことを\n差し出している。',
        slug: 'james-j-gibson--affordance',
        relation: 'ジェームズ・J・ギブソン ── アフォーダンス',
        leftStation: 'ジェームズ・J・ギブソン',
        rightStation: 'アフォーダンス',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>知覚の心理学に新しい見方をもたらした言葉。</strong></p><p>ギブソンは、知覚とは頭の中で情報を組み立てることではなく、環境にある情報を直接とらえることだと考えた。環境は動物に、行為の可能性を差し出している。たとえば椅子は「座る」ことを、取っ手は「つかむ」ことを差し出す。英語の afford から、その可能性を「アフォーダンス」と名づけた。</p><p>この言葉は1988年、ドナルド・ノーマンがデザインの世界に紹介して広まった。ただしデザインでの使われ方は、ギブソン本来の意味とは異なる。ギブソンにとってアフォーダンスは環境と動物の関係であり、見えていなくても、知られていなくても存在する。ノーマン自身も、のちに「知覚されたアフォーダンス」と言うべきだったと述べている。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>ハイデッガーは『存在と時間』で、わたしたちは金槌を「物」として眺める前に、まず手になじむ道具として使っている、と書いた。手もとの道具が道具としての姿を現すのは、それを使っているときだけだ。</p><p>ギブソンのアフォーダンスも、環境を、行為の可能性として知覚されるものとして捉える。ハイデッガー研究者の Mark Wrathall は、手もとにあるものがそれぞれの場面で特定の行為を可能にしているとして、『存在と時間』の用語 Bewandtnis に affordance という訳語を提案している。編著『The Cambridge Heidegger Lexicon』（2021年）には、本人による「Affordance (Bewandtnis)」の項もある。</p><p>世界を観察の対象としてではなく、行為の手がかりとして見る。哲学と心理学が、別々の道から近い地点に立っているように見える。</p>'
      }
    },

    {
      id: 'seed-affordance--minakata-mandala',
      createdAt: '2026-09-14T02:20:00.000Z',
      updatedAt: '2026-09-14T02:20:00.000Z',
      a: W.affordance,
      b: W.mandala,
      context: {
        routeName: '見て、飲む',
        label: 'CONTEXT',
        kind: '似ている',
        hub: '見て、飲む',
        score: [4, 4, 4, 3],
        headline: '物との関わりを、二人は\n「飲む」を例に書いた。',
        slug: 'affordance--minakata-mandala',
        relation: 'アフォーダンス ── 見て、飲む ── 南方曼荼羅',
        leftStation: 'アフォーダンス',
        rightStation: '南方曼荼羅',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>ものとの関わりを説くのに、二つの文章は「飲む」を例にした。</strong></p><p>1903年8月8日、那智の南方熊楠は、真言宗の僧・土宜法龍に宛てた手紙で自分の曼荼羅を説いた。心と物が反応して事が生じる、という考えである。例に引いたのは酒だ。熊楠（心）が酒（物）を見る。酒のよさを人から聞いたことを思い出し、飲む。</p><p>ジェームズ・J・ギブソンは、1979年の『生態学的視覚論』第8章で、アフォーダンスを「環境が動物に差し出すもの」と定義した。辞書にない自分の造語だと断り、動物と環境が補い合うことを含む、と書いた。</p><p>同じ章でギブソンは、ゲシュタルト心理学者コフカ（1935年）の一節も引く。果物は「私を食べろ」と言い、水は「私を飲め」と言う。</p><p>ここで結ぶのは影響関係ではなく、同じ「飲む」という例である。76年を隔てた二つの文章は、説明の道すじが違う。熊楠の例には、人から聞いた話を思い出す一段が入る。ギブソンは、ものの価値や意味は直接知覚できる、という仮説を立てた。</p>'
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
          '<p><strong>半世紀にわたって続いた、複雑な関係。</strong></p><p>1924年、18歳のハンナ・アーレントはマールブルク大学でハイデッガーに学び始め、翌1925年から二人は恋愛関係になった。この出会いは、アーレントの思想に長く影響を残した。</p><p>やがてハイデッガーはナチスに加わり、ユダヤ人のアーレントはドイツを逃れる。それでも戦後、二人は再会し、アーレントはアメリカでのハイデッガーの著作の刊行を支えた。批判者からハイデッガーを擁護したこともある。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>オーウェルの『1984年』は、全体主義を風刺した小説として1949年に刊行された。アーレントの『全体主義の起原』は、その2年後の1951年に出た。どちらも第二次世界大戦のあとの書物である。</p><p>アーレントは、ナチズムとスターリニズムを歴史と政治の言葉で分析した。孤独を全体主義的支配の前提条件とし、イデオロギーとテロルによる新しい統治の形としてとらえた。オーウェルは、共産主義やファシズムに見られる歪みを、物語の言葉で描いた。</p><p>分析と物語。同じ時代の二つの書物は、全体主義という同じ主題を、別々の方法で扱っている。</p>'
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
          '<p><strong>「宇宙船地球号」を広めた一冊。</strong></p><p>フラーは1969年、『宇宙船地球号 操縦マニュアル』で、地球を限られた資源で航行する船にたとえ、この船には操縦の説明書が付いていないと指摘した。そして、人類は細分化された専門の知ではなく、全体を見渡す知でその船を操縦すべきだと説いた。</p><p>ジオデシック・ドームで知られ、「より少ないもので、より多くを」を唱えたフラー。その影響は、1968年に創刊された『ホール・アース・カタログ』にも及んでいる。創刊号には、フラーの洞察がこのカタログを始動させたと記されている。</p>'
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
        headline: '世界を変えられると\n本気で信じる一人。',
        slug: 'buckminster-fuller--think-different',
        relation: 'バックミンスター・フラー ── 広告に登場 ── アップル「Think Different」',
        leftStation: 'バックミンスター・フラー',
        rightStation: 'Think Different',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>広告に登場した一人。</strong></p><p>1997年のアップルの「Think Different」のテレビ広告（60秒版）には、アインシュタイン、キング牧師、ガンディー、ピカソらとともに、バックミンスター・フラーの姿が映る。</p><p>フラーの肩書きは、思想家、建築家、発明家、詩人など、ひとつに収まらない。広告は、自分が世界を変えられると本気で信じる人たちこそが、実際に世界を変えている、と語りかける。フラーは、その「クレイジーな人たち」の一人として登場する。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『光の旅人 K-PAX』のプロートは、自分は K-PAX という星から来たと語り、精神科医のもとに送られる。けれども彼は、天体物理学者を戸惑わせるほどの知識を見せ、ほかの患者たちからは疑いなく信じられていく。</p><p>ウィルソンの『アウトサイダー』が論じるのは、社会からの疎外を感じ、絶望のなかにありながら、ときに訪れる明晰な瞬間に、物事に意味があると感じる人びとである。</p><p>プロートを、外から来た者のまなざしで内側の人間の生き方を照らす存在として読むと、ウィルソンが論じたアウトサイダーの姿と重なって見える。映画の原作はジーン・ブリュワーの小説で、ウィルソンの評論との直接のつながりを示す資料は見当たらない。</p>'
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
          '<p><strong>アニメ版の作り手の一人が、その物語を漫画で描き直した。</strong></p><p>安彦良和は、1979年のテレビアニメ『機動戦士ガンダム』でキャラクターデザインと作画監督をつとめた。</p><p>2001年から2011年まで雑誌『ガンダムエース』に連載された『機動戦士ガンダム THE ORIGIN』は、安彦自身が描き直したガンダムの物語で、アニメではほとんど描かれなかったシャアとセイラの過去も描かれている。</p>'
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
        headline: '満州の大学に、\n青年が送り込まれる。',
        slug: 'yasuhiko-yoshikazu--niji-iro-no-trotsky',
        relation: '安彦良和 ──『虹色のトロツキー』',
        leftStation: '安彦良和',
        rightStation: '虹色のトロツキー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#2f8f5b' },
        body:
          '<p><strong>ガンダムの作り手が描いた、満州の歴史。</strong></p><p>『虹色のトロツキー』は、1938年の満州を舞台に、日本人とモンゴル人の血を引く青年ウムボルトが、建国大学に送り込まれ、トロツキーを満州に招くという謀略に巻き込まれていく物語である。</p><p>石原莞爾ら実在の人物が登場し、ノモンハン事件へと向かう歴史を背景にしている。安彦良和は、アニメーターから漫画家に転じたあと、『王道の狗』『天の血脈』など、歴史を題材にした作品を数多く手がけている。</p>'
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
          '<p><strong>意味の上での近さから結ばれた区間。</strong></p><p>『虹色のトロツキー』のウムボルトは、日本人の父とモンゴル人の母のあいだに生まれた。混血ゆえの曖昧なアイデンティティを抱え、満州で周囲とぶつかり合いながら、自分が何者かを求めていく。</p><p>『ヒストリエ』のエウメネスは、作中ではスキタイ人の子として生まれながら、ギリシア人として育てられ、その出自が周囲に暴かれたとき、居場所を失う。</p><p>歴史の大きなうねりの中で、二つの民族のあいだに立つ若者。時代も場所も違う二つの歴史漫画が、似た主人公像を持っている。</p>'
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
        headline: '麺にしないそばを、\n祖谷もロシアも食べる。',
        slug: 'sobagome-jiru--grechka',
        relation: '徳島県「そば米汁」── そばの実 ── ロシア「グレーチカ」',
        leftStation: 'そば米汁',
        rightStation: 'グレーチカ',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>ハブはそばの実。</strong></p><p>日本でそばといえば麺だが、徳島県の山深い祖谷地方では、そばの実を塩ゆでして乾かした「そば米」を、鶏肉や野菜と煮込んだ汁にして食べてきた。「そば米雑炊」の名でも知られ、農林水産省の「うちの郷土料理」も、祖谷地域でよく食べられる郷土料理として挙げている。</p><p>ロシアでは、そばの実は「グレーチカ」と呼ばれ、粥（カーシャ）にして食べられる。カーシャは、穀物や豆などを煮た粥の総称だ。「シチーとカーシャ、日々の糧」ということわざは、日本でいう飯と味噌汁にあたる組み合わせを表すという。</p><p>祖谷は高い山に囲まれ、米が育ちにくい土地だった。ヒエやムギとともにそばが育てられ、そばを主食とする文化が根づいたという。ロシアは、世界最大のそばの生産国でもある。遠く離れた二つの土地の料理が、同じ一粒でつながっている。</p>'
      }
    },

    /* ---- 前田先生の確認を受けて足した区間（ヌルンジ＝赤坂の韓国料理店）。先頭の iris--nurungji は 2026.10.27 iris--tsurunoyu（鶴の湯）に組み直した ---- */
    {
      id: 'seed-iris--tsurunoyu',
      createdAt: '2026-09-28T09:00:00.000Z',
      updatedAt: '2026-09-28T09:00:00.000Z',
      a: W.iris,
      b: W.tsurunoyu,
      context: {
        routeName: '画面の中の湯宿',
        label: 'CONTEXT',
        kind: '事実',
        hub: '秋田ロケ',
        score: [4, 4, 4, 3],
        headline: '主役二人の温泉デートは\n秋田の湯宿で撮られた。',
        slug: 'iris--tsurunoyu',
        relation: '韓国ドラマ『アイリス』── 秋田ロケ ── 乳頭温泉郷「鶴の湯」',
        leftStation: 'アイリス',
        rightStation: '鶴の湯',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#f2cf12' },
        body:
          '<p><strong>主人公二人の温泉デートは、秋田の湯宿・鶴の湯で撮られた。</strong></p><p>『アイリス』は、国家安全局の要員を主人公に、アクションと恋愛を描いた韓国ドラマ。2009年10月に韓国で放送が始まった。秋田ロケはその年の3月、県内の約20カ所で行われている。</p><p>2009年12月の記念パネル展（北秋田市商工会・仙北市商工会主催）には、田沢湖や乳頭温泉などのロケ写真43点が並んだ。鶴の湯については、秋田県観光連盟の「IRIS 秋田ロケ地を巡る旅マップ」が、二人の温泉デートの場面を撮った宿として載せていた。韓国の京郷新聞も2010年3月の旅行記で同じ場所を紹介し、入口にはロケ地を知らせる看板と、二人の場面のかまくらがあると記す。2013年の韓国の旅行記事も、乳頭温泉郷を入浴場面の撮影地としている。</p><p>鶴の湯は、寛永15年（1638年）に二代目秋田藩主・佐竹義隆が湯治に訪れたといわれる宿。茅葺き屋根の本陣は、そのとき警護の者が詰めた建物だという。京郷新聞の旅行記はもう一つ、温泉の場面で脱衣所の入口に使われたのが、田沢湖畔のたつこ像に近い公衆トイレだったとも書く。撮影のときは表示を外し、「鳥の湯」の看板だけを掛けたという。湯宿と湖が、ひとつの場面の中でつながっている。</p>'
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
          '<p><strong>東京には、隣の国の台所がいくつもある。</strong></p><p>神田の「漢陽楼」は、明治四十四年創業を掲げる中国料理店。中国からの留学生が集った店で、その中に若き周恩来もいたと伝えられている。</p><p>赤坂の「ヌルンジ」は韓国料理店。2019年1月に放送されたテレビ東京『出没！アド街ック天国』は、赤坂を「韓国料理密集地帯」として取り上げ、その一軒としてこの店を紹介した。店名と同じ「ヌルンジ」は、釜の底にできるおこげを指す韓国語である。</p><p>百年以上前、留学生たちは神田の漢陽楼に集った。故郷の味を出す店は、遠い国とこの街をつなぐ場所のひとつなのかもしれない。赤坂のヌルンジも、そんな場所のひとつとして読むことができる。</p>'
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
        hub: 'ブランドの世界観',
        score: [4, 4, 4, 4],
        headline: '商品の説明をせず、\nブランドを語った。',
        slug: 'think-different--uniqlock',
        relation: 'アップル「Think Different」── ブランドの世界観 ── ユニクロ「UNIQLOCK」',
        leftStation: 'Think Different',
        rightStation: 'UNIQLOCK',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#c43f9a' },
        body:
          '<p><strong>商品の説明をせずに、世界観で記憶に残る。</strong></p><p>1997年のアップル「Think Different」の60秒版は、白黒の映像に、アインシュタインやガンディーら20世紀を象徴する17人の姿を並べた。人物のポートレートを使った印刷広告には、アップルの製品への言及がなかった。</p><p>2007年6月、ポロシャツのキャンペーンの一環として登場したユニクロ「UNIQLOCK」は、服の説明はせず、ユニクロの服を着たダンサーの踊りと音楽で時刻を刻み続けた。ブログに貼れる時計として世界各国に広まり、2008年にはカンヌ国際広告祭のチタニウム部門とサイバー部門でグランプリを受けた。</p><p>二つの広告に共通するのは、ブランドの世界観を発信しようとしたことだ。</p>'
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
        headline: '人の心の声を聞く天使は\nやがて人間になった。',
        slug: 'bruno-ganz--wings-of-desire',
        relation: 'ブルーノ・ガンツ ── 天使ダミエル ── 『ベルリン・天使の詩』',
        leftStation: 'ブルーノ・ガンツ',
        rightStation: 'ベルリン・天使の詩',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#2f8f5b' },
        body:
          '<p><strong>永遠の命よりも、人間として生きることを選ぶ。</strong></p><p>『ベルリン・天使の詩』で、ブルーノ・ガンツは天使ダミエルを演じ、この役で好意的な評価を受けた。ダミエルは、ベルリンの人々の心の声に耳を澄ませながら、人間に直接かかわることはできない存在だ。</p><p>サーカスの空中ブランコ乗りマリオンに恋したダミエルは、永遠の命を捨てて人間になる。天使たちの視界はモノクロの映像で描かれ、ダミエルが人間に近づくにつれて、映像は色を帯びていく。人間になった彼は、食べ物を味わい、コーヒーを飲む。</p>'
      }
    },

    {
      id: 'seed-anthony-hopkins--the-bunker',
      createdAt: '2026-10-22T09:40:00.000Z',
      updatedAt: '2026-10-22T09:40:00.000Z',
      a: W.hopkins,
      b: W.bunker,
      context: {
        routeName: 'ヒトラーとレクター',
        label: 'CONTEXT',
        kind: '作者と作品',
        hub: 'ヒトラー役',
        score: [5, 3, 4, 4],
        headline: 'レクター博士も、\nヒトラーを演じていた。',
        slug: 'anthony-hopkins--the-bunker',
        relation: 'アンソニー・ホプキンス ── ヒトラー役 ── 『ザ・バンカー』（1981）',
        leftStation: 'アンソニー・ホプキンス',
        rightStation: 'ザ・バンカー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>エミー賞を受けたヒトラー役。</strong></p><p>1981年、アメリカの CBS が放送したテレビ映画『ザ・バンカー』で、アンソニー・ホプキンスはヒトラーを演じた。ベルリンの総統地下壕で過ごした最後の日々を、ジャーナリストのジェームズ・P・オドネルの著書をもとに描いた作品だ。</p><p>ホプキンスはこの役で、エミー賞の主演男優賞を受けている。</p><p>その十年後の1991年、彼は『羊たちの沈黙』でハンニバル・レクターを演じ、翌年アカデミー主演男優賞を受ける。独裁者と、檻の中の精神科医。閉ざされた空間にいる人物を、二度演じたことになる。</p>'
      }
    },

    {
      id: 'seed-the-bunker--downfall',
      createdAt: '2026-10-22T09:30:00.000Z',
      updatedAt: '2026-10-22T09:30:00.000Z',
      a: W.bunker,
      b: W.downfall,
      context: {
        routeName: '同じ地下壕',
        label: 'CONTEXT',
        kind: 'ハブ',
        hub: '総統地下壕',
        score: [4, 3, 4, 5],
        headline: '地下壕の最後の日々を、\n二本の映画が描いた。',
        slug: 'the-bunker--downfall',
        relation: '『ザ・バンカー』（1981）── 総統地下壕 ── 『ヒトラー〜最期の12日間〜』（2004）',
        leftStation: 'ザ・バンカー',
        rightStation: 'ヒトラー 最期の12日間',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 3, color: '#3447c9' },
        body:
          '<p><strong>同じ地下壕のヒトラーを、二人の俳優が演じている。</strong></p><p>『ザ・バンカー』（1981）と『ヒトラー〜最期の12日間〜』（2004）は、どちらもベルリン陥落直前の総統地下壕を舞台に、ヒトラーの最後の日々を描いている。</p><p>前者でヒトラーを演じたのはアンソニー・ホプキンス、後者はブルーノ・ガンツ。アメリカのテレビ映画と、ドイツの劇場映画。同じ地下の閉ざされた空間を、二十三年をへだてて、ちがう国の作り手が、それぞれ別の資料をもとに描いた。</p>'
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
        headline: 'ライブ映画の監督が、\nサスペンスを撮った。',
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
          '<p><strong>出番の短さは、役の評価を妨げなかった。</strong></p><p>ギネス世界記録によると、アンソニー・ホプキンスが演じたハンニバル・レクターが画面に登場する時間は、16分あまり。それでも彼はアカデミー主演男優賞を受け、主演男優賞の受賞者のなかで最も出演時間が短い例として記録されている。</p><p>ホプキンスは、2021年の英国版『GQ』のインタビューで、監督のジョナサン・デミに演じ方を聞かれ、「ほとんど動かない人物だと思う」と答えたと振り返っている。収監中の身でありながら、レクターは見返りを求め、会話の主導権を握る。その静けさが、短い出演時間を濃くしているとも言える。</p>'
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
          '<p><strong>恐怖の物語の中心にいるのは、若い女性の勇気だ。</strong></p><p>ジョディ・フォスターは、FBI訓練生クラリス・スターリングを演じ、二度目のアカデミー主演女優賞を受けた。最初の受賞は『告発の行方』による第61回（1989年）、二度目がこの作品の第64回（1992年）である。</p><p>男性が多い周囲のなかで、少数派の女性であるクラリスは、レクターと取引し、自分の過去を差し出して助言を得る。その役を演じたフォスターの演技は批評家から広く称賛され、作品は作品賞・監督賞・主演男優賞・主演女優賞・脚色賞の5部門を制した。</p>'
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
          '<p><strong>街を見守る天使のまなざしは、監督のまなざしとも重なって見える。</strong></p><p>ヴィム・ヴェンダースは、アメリカで『パリ、テキサス』を撮ったあと、故国ドイツに戻って『ベルリン・天使の詩』を撮った。8年間のアメリカ滞在を経た「帰郷」の作品で、舞台は壁で東西に分かれていた時代のベルリンだ。</p><p>天使のまなざしの世界はモノクロで描かれ、天使ダミエルが人間になると、世界は色を帯びはじめる。人間になった彼が知るのは、人生の小さな楽しみだ。</p><p>のちに東京で撮る『PERFECT DAYS』（2023）の主人公は、トイレの清掃員として質素に暮らす男だ。ヴェンダースは、『ベルリン・天使の詩』でもすでに、ありふれた日常の輝きを見つめていた、とも言える。</p>'
      }
    },

    {
      id: 'seed-wings-of-desire--peter-falk',
      createdAt: '2026-09-30T07:40:00.000Z',
      updatedAt: '2026-09-30T07:40:00.000Z',
      a: W.wings,
      b: W.falk,
      context: {
        routeName: '本人役の元天使',
        label: 'CONTEXT',
        kind: '事実',
        hub: '本人役',
        score: [5, 5, 4, 5],
        headline: 'コロンボ役の俳優は、\n劇中では元天使だった。',
        slug: 'wings-of-desire--peter-falk',
        relation: 'ピーター・フォーク ── 本人役 ── 『ベルリン・天使の詩』',
        leftStation: 'ベルリン・天使の詩',
        rightStation: 'ピーター・フォーク',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>映画の中のピーター・フォークは、ピーター・フォーク自身が演じる、半ば虚構の「ピーター・フォーク」だ。</strong></p><p>『ベルリン・天使の詩』に、『刑事コロンボ』で知られるピーター・フォークが本人役で登場する。映画の撮影でベルリンを訪れている俳優という設定だ。</p><p>ところが物語が進むと、彼もかつては天使で、人間になることを選んだのだとわかる。姿の見えない天使ダミエルの気配を感じ取り、人間の暮らしの楽しみを語りかけるフォークは、映画に温かさをもたらす存在と評される。</p>'
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
        headline: '劇中の詩を書いたのは\nのちのノーベル賞作家。',
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
        headline: '『天使の詩』の脚本家が\nノーベル文学賞を得た。',
        slug: 'peter-handke--nobel-literature-laureates',
        relation: 'ペーター・ハントケ ── 2019年 ── ノーベル文学賞',
        leftStation: 'ペーター・ハントケ',
        rightStation: 'ノーベル文学賞',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>映画の脚本家の一人は、小説家であり劇作家でもある。</strong></p><p>ペーター・ハントケはオーストリアの作家で、『ベルリン・天使の詩』ではヴィム・ヴェンダースらとともに脚本に名を連ねている。デビュー小説『Die Hornissen』（1966）や、俳優が観客を罵る劇『観客罵倒』で、早くから文壇に名を刻んだ。</p><p>2019年、ハントケはノーベル文学賞を受けた。授賞理由は、「言語的な独創性によって、人間の経験の周縁と特殊性を探究した、影響力のある作品」である。</p><p>授賞には批判もあった。ハントケの政治的な発言をめぐり、ボスニアやコソボで反発の声が上がり、アルバニアやトルコを含む複数の国が授賞式のボイコットや欠席を表明した。スウェーデン・アカデミー側は、授賞を擁護した。</p>'
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
          '<p><strong>現代の詩の形を変えた詩人が、世界に認められた。</strong></p><p>T・S・エリオットは1948年にノーベル文学賞を受けた。授賞理由は、「現代詩への卓越した先駆的貢献」だった。アメリカに生まれ、1927年に英国に帰化した詩人である。</p><p>『荒地』（1922）では、近代文明の不毛と無力を、モザイクのような技法で描いた。『うつろな人々』（1925）も、英語で書かれた詩のなかでよく知られた作品のひとつだ。授賞時に書かれた紹介文は、エリオットの詩は難解だが、現代の詩の言葉への影響は計り知れないと記している。</p>'
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
        headline: '砂嵐の時代を描く作家は\nノーベル文学賞を得た。',
        slug: 'the-grapes-of-wrath--nobel-literature-laureates',
        relation: 'ジョン・スタインベック『怒りの葡萄』── 作者 ── ノーベル文学賞（1962）',
        leftStation: '怒りの葡萄',
        rightStation: 'ノーベル文学賞',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#3447c9' },
        body:
          '<p><strong>土地を追われた人々の物語は、授賞式で、作者の名と最も強く結びつく大作と紹介された。</strong></p><p>『怒りの葡萄』は、干ばつと砂嵐、そして差し押さえで土地を追われ、オクラホマからカリフォルニアへ向かう一家を描いた。出版は1939年。</p><p>作者ジョン・スタインベックは、その23年後の1962年にノーベル文学賞を受けた。授賞は特定の一作ではなく、作品全体に対するものだった。理由は、「共感に満ちたユーモアと鋭い社会観察を併せもつ、写実的で想像力に富んだ作品」である。社会の底辺で生きる人々への共感は、スタインベックの作品を特徴づけている。</p>'
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
        headline: '伝道者を皮肉る作家は、\nアメリカ初の受賞者。',
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
          '<p><strong>難解な詩で知られる詩人が、子どもたちへの手紙に猫の詩を書いた。</strong></p><p>ミュージカル『キャッツ』の原作は、T・S・エリオットの詩集『Old Possum’s Book of Practical Cats』（1939）。エリオットは1930年代、自分が名付け親を務めた子どもたちへの手紙に、この猫の詩を添えていた。ユーモラスな軽い詩を集めた一冊だ。</p><p>アンドリュー・ロイド・ウェバーはその詩に曲をつけ、1981年にロンドンで舞台にした。代表曲「メモリー」の歌詞は、演出家のトレヴァー・ナンが、エリオットの別の詩『Rhapsody on a Windy Night』に着想を得て書いたものだ。</p><p>『荒地』の詩人と、ロンドンで21年、ブロードウェイで18年も上演されたミュージカル。意外な二つは、エリオットという一人の詩人でつながっている。</p>'
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
          '<p><strong>戦争のあとの荒れ果てた世界を、言葉の断片で描いた詩として読まれてきた。</strong></p><p>『荒地』は1922年に発表された。冒頭の一行は「四月はいちばん残酷な月」だ。ラテン語やギリシア語、ドイツ語、フランス語、サンスクリット語など、さまざまな言語の引用と酒場の会話が、切り替わりを示さないまま並べられる。</p><p>筋を追うよりも、崩れた文明の破片を拾い集めるように読む詩だと言える。断片を並べるこの手法は、20世紀の詩と文学に大きな影響を与えたとされる。</p>'
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
        headline: '友人の赤ペンが、\n『荒地』を形にした。',
        slug: 'ezra-pound--the-waste-land',
        relation: 'エズラ・パウンド ── 草稿を削る ── 『荒地』',
        leftStation: 'エズラ・パウンド',
        rightStation: '荒地',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>『荒地』は、もっと長い詩だった。</strong></p><p>エリオットは『荒地』の草稿を、友人の詩人エズラ・パウンドに見せた。パウンドは大胆に手を入れ、詩はおよそ半分の長さになった。</p><p>1925年の再刊で、エリオットはこの詩をパウンドに捧げ、「より優れた匠」（il miglior fabbro）という献辞を添えた。ダンテ『神曲』煉獄篇に由来する言葉だ。一篇の詩の後ろには、もう一人の詩人の手がある。</p>'
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
          '<p><strong>世界は派手には終わらない、とこの詩は言う。</strong></p><p>『うつろな人々』（1925）は、「わたしたちはうつろな人間」と始まり、「世界の終わりはこうだ、爆発ではなく、すすり泣きで」と結ばれる。</p><p>中身を失った人々の姿を描いたこの詩は、のちに映画『地獄の黙示録』（1979）や小説『Children of the Dust』（1985）でも引用された。</p>'
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
          '<p><strong>映画の終盤、狂気の王国で詩が読まれる。</strong></p><p>『地獄の黙示録』のカーツ大佐（マーロン・ブランド）は、ジャングルの奥の王国で、エリオットの『うつろな人々』の一節を朗読する。戦争の果てにたどり着いた空虚を、コッポラは一篇の詩に託したとも読める。</p><p>エリオットとの接点は、朗読だけではない。カーツの手もとには、フレイザー『金枝篇』とウェストン『祭祀からロマンスへ』が置かれている。どちらもエリオットが『荒地』の典拠に挙げた本だ。</p>'
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
        headline: '息子を救う方法を、\n両親は自ら探した。',
        slug: 'lorenzos-oil--adrenoleukodystrophy',
        relation: '副腎白質ジストロフィー（ALD）── 実話 ── 映画「ロレンツォのオイル」',
        leftStation: 'ロレンツォのオイル',
        rightStation: 'ALD',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#f2cf12' },
        body:
          '<p><strong>医師ではない両親が、治療法を探しはじめた。</strong></p><p>映画「ロレンツォのオイル」は、息子ロレンツォが副腎白質ジストロフィー（ALD）と診断された、オドーネ夫妻の実話をもとにしている。</p><p>当時、有効な治療法はほとんどなかった。映画では、夫妻が医学図書館に通いつめて文献を読み込み、専門家に働きかけ、食事療法に使うオイルの開発にたどり着く姿が描かれる。</p><p>この映画は、病気そのものだけでなく、知ろうとし続けることの力を描いた作品とも言える。ただし、オイルはすでに発症した子どもの神経症状の進行を止められないとされ、効果についてはその後も議論が続いている。</p>'
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
        headline: '熱狂させる伝道者を、\n映画も歴史書も描いた。',
        slug: 'elmer-gantry--anti-intellectualism-in-american-life',
        relation: '映画「エルマー・ガントリー」── 信仰復興運動 ── 『アメリカの反知性主義』',
        leftStation: 'エルマー・ガントリー',
        rightStation: 'アメリカの反知性主義',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#c43f9a' },
        body:
          '<p><strong>同じアメリカの風景を、物語と歴史書が描いている。</strong></p><p>映画「エルマー・ガントリー」（1960）の主人公は、巧みな弁舌で人々を熱狂させる信仰復興運動の伝道者だ。原作はシンクレア・ルイスの1927年の小説で、1920年代の福音伝道の世界を風刺している。映画は第33回アカデミー賞で、主演男優賞など3部門を受賞した。</p><p>ホーフスタッター『アメリカの反知性主義』（1963）には、福音主義の精神を扱う章と、福音主義と信仰復興運動の伝道者たちを扱う章がある。ホーフスタッターは、福音主義的なプロテスタンティズムの伝統を、アメリカで知性への不信が育った源流の一つとして論じている。そこでは、知的な厳密さより、霊的なものが重んじられたという。</p><p>映画が一人の男の物語として描いたものを、歴史書は社会全体の流れとしてたどった。二つは、同じ主題の近くに立つ作品として並べて読める。</p>'
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
        hub: '言葉を論じた本',
        score: [3, 4, 4, 5],
        headline: 'ひとつの言葉を、\n一冊の本が論じた。',
        slug: 'anti-intellectualism--anti-intellectualism-in-american-life',
        relation: '「反知性主義」── 言葉を論じた本 ── 『アメリカの反知性主義』',
        leftStation: '反知性主義',
        rightStation: 'アメリカの反知性主義',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 2, color: '#f2cf12' },
        body:
          '<p><strong>「反知性主義」という言葉を、そのまま題名に掲げた歴史書がある。</strong></p><p>「反知性主義」は、知性や知識人に対する反発や不信を表す言葉だ。</p><p>その歴史書が、リチャード・ホーフスタッター『アメリカの反知性主義』（1963）である。この言葉をテーマに、アメリカ社会の歴史を一冊で論じ、ピュリッツァー賞を受けた。ホーフスタッターは、反知性主義を知的生活への憤りと言い表している。</p><p>日本では2015年に、論壇などでこの言葉が盛んに使われ、一種の流行語になった。ただ、単に知性のない者を批判する言葉として使われることも多いとされる。この言葉がもともとどんな議論のなかで語られていたのか。それを確かめる手がかりの一つが、この本である。</p>'
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
          '<p><strong>歴史家は、自分の国に根づく知性への不信を、歴史をさかのぼって論じた。</strong></p><p>リチャード・ホーフスタッターはコロンビア大学の歴史家。『改革の時代』と『アメリカの反知性主義』で、二度ピュリッツァー賞を受けた。</p><p>ホーフスタッターによれば、「反知性主義」という言葉が急に使われはじめたのは1950年代。背景には、マッカーシズムと1952年の大統領選挙があった。1963年の『アメリカの反知性主義』で彼は、ニューイングランドの成立からのアメリカ史をたどり、この言葉が登場する前から反知性主義はアメリカにあったと論じた。</p>'
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
        headline: '理屈で殺した青年を、\n罪の意識が追いつめる。',
        slug: 'crime-and-punishment--fyodor-dostoevsky',
        relation: 'ドストエフスキー ── 代表作 ── 『罪と罰』',
        leftStation: '罪と罰',
        rightStation: 'ドストエフスキー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 0, color: '#2f8f5b' },
        body:
          '<p><strong>罪は、法よりも先に心を裁く。</strong></p><p>ドストエフスキーの代表作の一つ『罪と罰』は、1866年に雑誌『ロシア報知』に連載された。主人公ラスコーリニコフは、非凡な人間には法を踏み越える権利があるという自分の理屈で老婆を殺す。</p><p>しかし罪の意識は、予審判事ポルフィーリーの追及より先に、彼を追いつめていく。ドストエフスキーは、熱に浮かされたような心の揺れを描いた。ポルフィーリーとの三度の論戦は、推理小説の対決のようにも読める。</p>'
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
        headline: '着想の日の回想に、\nラスコーリニコフの名。',
        slug: 'the-outsider--fyodor-dostoevsky',
        relation: 'コリン・ウィルソン『アウトサイダー』── 論じた作家 ── ドストエフスキー',
        leftStation: 'アウトサイダー',
        rightStation: 'ドストエフスキー',
        author: AI,
        review: 'ai',
        aiUrl: '',
        line: { shape: 1, color: '#f2cf12' },
        body:
          '<p><strong>『アウトサイダー』の着想は、ラスコーリニコフに自分を重ねた日に生まれた。</strong></p><p>コリン・ウィルソンの『アウトサイダー』（1956）は、社会の外側に立つ作家や芸術家、思想家たちを論じた本だ。そのなかで、ドストエフスキーも取り上げられている。</p><p>ウィルソン自身の回想によれば、1954年のクリスマス、彼は一人きりの部屋で日記を書きはじめた。社会から完全に切り離された自分は、好きな小説の登場人物たちと同じ立場にいる。ドストエフスキーのラスコーリニコフ、リルケ『マルテの手記』のマルテ、ハムスン『飢え』の若い作家。それを書き進めるうちに、これは一冊の本になると気づいた。日記の後ろのページの冒頭には、「文学におけるアウトサイダー」という本のためのノートと書きつけた。</p><p>『罪と罰』のラスコーリニコフは、非凡な人間には法を踏み越える権利があると考えて老婆を殺し、やがて社会から切り離されていく。ウィルソンが自分の姿を重ねたのは、そうして孤立していく青年だったとも読める。</p>'
      }
    }
  ];

  /* 組み直して名前の変わった区間。古いアドレス（検索結果やリンク）から来た人は、新しい区間へ */
  window.BC_MOVED = {
    'downfall--anthony-hopkins': 'anthony-hopkins--the-bunker',   /* 2026.10.22 『ザ・バンカー』を通して辿るように */
    'pluribus--reacher': 'war-of-the-worlds-2005--reacher',   /* 2026.10.27 出典の確認でつながりが弱いとされ、組み直した */
    'iris--nurungji': 'iris--tsurunoyu'   /* 2026.10.27 出典の確認でつながりが弱いとされ、組み直した */
  };

  /* 編集者（コンテクストを選び、最終稿に名前を出す人）。読者はフォローした編集者の
     「Today's Editor's Choice」を毎日受け取る。名前は書き手（context.author）と結びつける。
     いまは見本の二人。本番は編集者のアカウントから作る。
     マイページに出せるもの：photo（上の大きな写真）、note（note のユーザー名。note.com/〇〇 へのリンク）、
     picks（ほかの人の区間から選んだつながり。区間の slug） */
  window.BC_EDITORS = [
    /* 編集長は前田先生（BC修正要望 2026.10.22）。匿名ではなく、半実名のペンネーム */
    { id: 'chief', authors: [AUTHOR, '編集部'], name: '眞江田國廣', mark: '眞', role: 'EDITOR IN CHIEF',
      photo: 'img/editors/chief.jpg', note: 'mdkh',
      bio: '思いがけない二つのあいだに、確かめられる一本の線を引く。その線を一日に一本ずつ選んでいます。' },
    { id: 'desk', authors: [AI], name: 'BC 編集部', mark: '部', role: 'EDITORIAL DESK',
      bio: '生成AIが書いた初稿を並べています。編集者が事実と出典まで確かめたものには「確認済み」と記します。' }
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
