export interface Scripture {
  id: string;
  title: string;
  content: string;
  category: 'sutra' | 'mantra' | 'name' | 'meditation';
}

export const SCRIPTURES: Scripture[] = [
  {
    id: 'heart-sutra',
    title: '般若波罗蜜多心经',
    category: 'sutra',
    content: `观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。

舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。

舍利子，是诸法空相，不生不灭，不垢不净，不增不减。

是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法，无眼界，乃至无意识界。

无无明，亦无无明尽，乃至无老死，亦无老死尽。

无苦集灭道，无智亦无得。以无所得故，菩提萨埵，依般若波罗蜜多故，心无挂碍，无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。

三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。

故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，能除一切苦，真实不虚。

故说般若波罗蜜多咒，即说咒曰：揭谛揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。`
  },
  {
    id: 'diamond-sutra-verse',
    title: '金刚经 (四句偈)',
    category: 'sutra',
    content: `一切有为法，如梦幻泡影，如露亦如电，应作如是观。

凡所有相，皆是虚妄。若见诸相非相，则见如来。

若以色见我，以音声求我，是人行邪道，不能见如来。`
  },
  {
    id: 'amita-sutra',
    title: '佛说阿弥陀经 (节选)',
    category: 'sutra',
    content: `尔时，佛告长老舍利弗：从是西方，过十万亿佛土，有世界名曰极乐，其土有佛，号阿弥陀，今现在说法。

舍利弗，彼土何故名为极乐？其国众生，无有众苦，但受诸乐，故名极乐。

又舍利弗。极乐国土，七重栏楯，七重罗网，七重行树，皆是四宝周匝围绕，是故彼国名为极乐。`
  },
  {
    id: 'pumenpin',
    title: '观世音菩萨普门品 (节选)',
    category: 'sutra',
    content: `世尊妙相具，我今重问彼，佛子何因缘，名为观世音？

具足妙相尊，偈答无尽意：汝听观音行，善应诸方所，弘誓深如海，历劫不思议，侍多千亿佛，发大清净愿。

我为汝略说，闻名及见身，心念不空过，能灭诸有苦。`
  },
  {
    id: 'great-compassion-mantra',
    title: '大悲咒',
    category: 'mantra',
    content: `南无、喝啰怛那、哆啰夜耶，南无、阿唎耶，婆卢羯帝、烁钵啰耶，菩提萨埵婆耶，摩诃萨埵婆耶，摩诃、迦卢尼迦耶，唵，萨皤啰罚曳，数怛那怛写。

南无、悉吉栗埵、伊蒙阿唎耶，婆卢吉帝、室佛啰楞驮婆，南无、那啰谨墀，醯利摩诃、皤哆沙咩，萨婆阿他、豆输朋，阿逝孕，萨婆萨哆、那摩婆萨哆，那摩婆伽，摩罚特豆。`
  },
  {
    id: 'six-syllable',
    title: '六字大明咒',
    category: 'mantra',
    content: `唵 嘛 呢 叭 咪 吽

(Oṃ Maṇi Padme Hūṃ)`
  },
  {
    id: 'rebirth-mantra',
    title: '往生咒',
    category: 'mantra',
    content: `南无阿弥多婆夜。哆他伽多夜。哆地夜他。阿弥利都婆毗。阿弥利哆。悉耽婆毗。阿弥唎哆。毗迦兰帝。阿弥唎哆。毗迦兰多。伽弥腻。伽伽那。枳多迦利。娑婆诃。`
  },
  {
    id: 'medicine-mantra',
    title: '药师灌顶真言',
    category: 'mantra',
    content: `南谟薄伽伐帝。鞞杀社。窭噜薜琉璃。钵喇婆。喝啰阇也。怛他揭多也。阿啰喝帝。三藐三勃陀耶。怛侄他。唵。鞞杀逝。鞞杀逝。鞞杀社。三没揭帝莎诃。`
  },
  {
    id: 'name-amita',
    title: '南无阿弥陀佛',
    category: 'name',
    content: `南无阿弥陀佛

(Namo Amituofo)`
  },
  {
    id: 'name-guanyin',
    title: '南无观世音菩萨',
    category: 'name',
    content: `南无大慈大悲观世音菩萨

(Namo Guan Shi Yin Pu Sa)`
  },
  {
    id: 'name-dizhang',
    title: '南无地藏王菩萨',
    category: 'name',
    content: `南无大愿地藏王菩萨

(Namo Di Zhang Wang Pu Sa)`
  },
  {
    id: 'changsheng-meditation',
    title: '长生老师禅修引导',
    category: 'meditation',
    content: `【长生老师禅修引导】

请大家轻轻合上双眼，全身放松。
让你的心，像清晨的湖面一样平静。

深呼吸，吸气……呼气……
感受宇宙的能量，从头顶缓缓流向全身。
每一个细胞都在呼吸，每一个细胞都在微笑。

放下所有的烦恼，放下所有的牵挂。
此时此刻，你与宇宙合而为一。
你就是光，你就是爱，你就是慈悲。

静静地坐着，观察你的呼吸。
不评判，不执着，只是观察。
心如虚空，包容万物。

愿这份宁静，带给你身心的健康与喜悦。
愿这份慈悲，传递给身边的每一个人。`
  }
];
