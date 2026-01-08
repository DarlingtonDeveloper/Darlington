-- Migration: Hanzi Linker - Seed Section 1 Words (93 characters)
-- Run this in Supabase SQL Editor AFTER 006_hanzi_tables.sql

-- ============================================================================
-- SECTION 1, UNIT 1: Name food and drinks (14 characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('水', 'shuǐ', 'shui3', 'water', 3, 4, 1, 1, 'Name food and drinks', 'introduced', 'Flowing streams of water'),
('咖', 'kā', 'ka1', 'coffee (part 1)', 1, 8, 1, 1, 'Name food and drinks', 'introduced', NULL),
('啡', 'fēi', 'fei1', 'coffee (part 2)', 1, 11, 1, 1, 'Name food and drinks', 'introduced', NULL),
('和', 'hé', 'he2', 'and', 2, 8, 1, 1, 'Name food and drinks', 'introduced', NULL),
('茶', 'chá', 'cha2', 'tea', 2, 9, 1, 1, 'Name food and drinks', 'introduced', 'Plant + person + tree = tea grows on plants/trees'),
('米', 'mǐ', 'mi3', 'rice (grain)', 3, 6, 1, 1, 'Name food and drinks', 'introduced', 'Looks like grains of rice scattered'),
('饭', 'fàn', 'fan4', 'meal / cooked rice', 4, 7, 1, 1, 'Name food and drinks', 'introduced', NULL),
('汤', 'tāng', 'tang1', 'soup', 1, 6, 1, 1, 'Name food and drinks', 'introduced', 'Water radical = liquid/soup'),
('热', 'rè', 're4', 'hot', 4, 10, 1, 1, 'Name food and drinks', 'introduced', 'Fire at bottom = hot'),
('这', 'zhè', 'zhe4', 'this', 4, 7, 1, 1, 'Name food and drinks', 'introduced', NULL),
('是', 'shì', 'shi4', 'is / am / are', 4, 9, 1, 1, 'Name food and drinks', 'introduced', 'Sun + correct = what is correct under the sun'),
('粥', 'zhōu', 'zhou1', 'porridge / congee', 1, 12, 1, 1, 'Name food and drinks', 'introduced', NULL),
('豆', 'dòu', 'dou4', 'bean', 4, 7, 1, 1, 'Name food and drinks', 'introduced', 'Looks like a bean plant on a stand'),
('腐', 'fǔ', 'fu3', 'rotten / tofu (part 2)', 3, 14, 1, 1, 'Name food and drinks', 'introduced', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 2: Talk about nationalities (9 characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('美', 'měi', 'mei3', 'beautiful / America', 3, 9, 1, 2, 'Talk about nationalities', 'introduced', 'Big sheep = beautiful'),
('国', 'guó', 'guo2', 'country / nation', 2, 8, 1, 2, 'Talk about nationalities', 'introduced', 'Jade inside border = precious country'),
('中', 'zhōng', 'zhong1', 'middle / China', 1, 4, 1, 2, 'Talk about nationalities', 'introduced', 'A line through the middle of a box'),
('日', 'rì', 'ri4', 'sun / day / Japan', 4, 4, 1, 2, 'Talk about nationalities', 'introduced', 'Picture of the sun'),
('本', 'běn', 'ben3', 'root / origin / book', 3, 5, 1, 2, 'Talk about nationalities', 'introduced', 'Tree with mark at root'),
('我', 'wǒ', 'wo3', 'I / me', 3, 7, 1, 2, 'Talk about nationalities', 'introduced', 'Hand holding a weapon = defending myself'),
('你', 'nǐ', 'ni3', 'you', 3, 7, 1, 2, 'Talk about nationalities', 'introduced', 'Person radical = referring to another person'),
('呢', 'ne', 'ne5', 'question particle', 5, 8, 1, 2, 'Talk about nationalities', 'introduced', NULL),
('韩', 'hán', 'han2', 'Korea', 2, 12, 1, 2, 'Talk about nationalities', 'introduced', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 3: Discuss professions (12 characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('英', 'yīng', 'ying1', 'hero / England', 1, 8, 1, 3, 'Discuss professions', 'introduced', NULL),
('文', 'wén', 'wen2', 'language / writing / culture', 2, 4, 1, 3, 'Discuss professions', 'introduced', 'Pattern of written lines'),
('医', 'yī', 'yi1', 'medicine / doctor', 1, 7, 1, 3, 'Discuss professions', 'introduced', NULL),
('生', 'shēng', 'sheng1', 'life / born / student', 1, 5, 1, 3, 'Discuss professions', 'introduced', 'A plant sprouting from the ground = life'),
('老', 'lǎo', 'lao3', 'old / prefix for teacher', 3, 6, 1, 3, 'Discuss professions', 'introduced', 'Person with a cane = old'),
('师', 'shī', 'shi1', 'teacher / master', 1, 6, 1, 3, 'Discuss professions', 'introduced', NULL),
('对', 'duì', 'dui4', 'correct / right / toward', 4, 5, 1, 3, 'Discuss professions', 'introduced', NULL),
('不', 'bù', 'bu4', 'not / no', 4, 4, 1, 3, 'Discuss professions', 'introduced', 'Bird flying up to sky but blocked = not'),
('律', 'lǜ', 'lv4', 'law / rule', 4, 9, 1, 3, 'Discuss professions', 'introduced', NULL),
('说', 'shuō', 'shuo1', 'to speak / to say', 1, 9, 1, 3, 'Discuss professions', 'introduced', 'Speech radical = speaking'),
('学', 'xué', 'xue2', 'to study / to learn', 2, 8, 1, 3, 'Discuss professions', 'introduced', 'Child under a roof learning')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 4: Discuss your courses (11 characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('喜', 'xǐ', 'xi3', 'happy / to like', 3, 12, 1, 4, 'Discuss your courses', 'introduced', 'Drum + mouth = happy celebration'),
('欢', 'huān', 'huan1', 'joyous / happy', 1, 6, 1, 4, 'Discuss your courses', 'introduced', NULL),
('课', 'kè', 'ke4', 'class / lesson', 4, 10, 1, 4, 'Discuss your courses', 'introduced', 'Speech radical + fruit = fruitful lessons'),
('大', 'dà', 'da4', 'big / large', 4, 3, 1, 4, 'Discuss your courses', 'introduced', 'Person with arms spread wide = big'),
('数', 'shù', 'shu4', 'number / to count', 4, 13, 1, 4, 'Discuss your courses', 'introduced', NULL),
('他', 'tā', 'ta1', 'he / him', 1, 5, 1, 4, 'Discuss your courses', 'introduced', 'Person radical + also = that other person (he)'),
('音', 'yīn', 'yin1', 'sound / tone', 1, 9, 1, 4, 'Discuss your courses', 'introduced', 'Stand + sun/day = sound standing out'),
('乐', 'yuè', 'yue4', 'music / happy', 4, 5, 1, 4, 'Discuss your courses', 'introduced', 'Simplified picture of a stringed instrument'),
('她', 'tā', 'ta1', 'she / her', 1, 6, 1, 4, 'Discuss your courses', 'introduced', 'Woman radical + also = that other person (she)')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 5: Use possessive pronouns (10 new characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('爸', 'bà', 'ba4', 'dad / father', 4, 8, 1, 5, 'Use possessive pronouns', 'introduced', 'Father + ba sound'),
('儿', 'ér', 'er2', 'son / child', 2, 2, 1, 5, 'Use possessive pronouns', 'introduced', 'Simplified picture of a child'),
('子', 'zǐ', 'zi3', 'child / son / suffix', 3, 3, 1, 5, 'Use possessive pronouns', 'introduced', 'Picture of a baby with arms'),
('妈', 'mā', 'ma1', 'mom / mother', 1, 6, 1, 5, 'Use possessive pronouns', 'introduced', 'Woman radical + horse sound'),
('公', 'gōng', 'gong1', 'public / grandfather', 1, 4, 1, 5, 'Use possessive pronouns', 'introduced', NULL),
('加', 'jiā', 'jia1', 'to add / Canada', 1, 5, 1, 5, 'Use possessive pronouns', 'introduced', 'Strength + mouth = adding force'),
('拿', 'ná', 'na2', 'to take / to hold', 2, 10, 1, 5, 'Use possessive pronouns', 'introduced', 'Join + hand = taking with hand'),
('婆', 'pó', 'po2', 'grandmother / old woman', 2, 11, 1, 5, 'Use possessive pronouns', 'introduced', 'Wave + woman = old waving grandmother'),
('也', 'yě', 'ye3', 'also / too', 3, 3, 1, 5, 'Use possessive pronouns', 'introduced', NULL),
('女', 'nǚ', 'nv3', 'female / woman', 3, 3, 1, 5, 'Use possessive pronouns', 'introduced', 'Picture of a kneeling woman')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 6: Talk about places you visit (13 new characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('去', 'qù', 'qu4', 'to go', 4, 5, 1, 6, 'Talk about places you visit', 'introduced', 'Earth + private = going away privately'),
('常', 'cháng', 'chang2', 'often / frequently', 2, 11, 1, 6, 'Talk about places you visit', 'introduced', NULL),
('书', 'shū', 'shu1', 'book', 1, 4, 1, 6, 'Talk about places you visit', 'introduced', 'Simplified picture of a hand holding a brush writing'),
('店', 'diàn', 'dian4', 'store / shop', 4, 8, 1, 6, 'Talk about places you visit', 'introduced', 'Roof/shelter + fortune = place to make fortune'),
('超', 'chāo', 'chao1', 'super / to exceed', 1, 12, 1, 6, 'Talk about places you visit', 'introduced', NULL),
('市', 'shì', 'shi4', 'market / city', 4, 5, 1, 6, 'Talk about places you visit', 'introduced', 'Cloth under roof = market stall'),
('馆', 'guǎn', 'guan3', 'building / hall', 3, 11, 1, 6, 'Talk about places you visit', 'introduced', 'Food radical + official = official food hall'),
('菜', 'cài', 'cai4', 'vegetable / dish', 4, 11, 1, 6, 'Talk about places you visit', 'introduced', 'Grass/plant + pick = picking vegetables'),
('吃', 'chī', 'chi1', 'to eat', 1, 6, 1, 6, 'Talk about places you visit', 'introduced', 'Mouth + beg = mouth begging for food'),
('买', 'mǎi', 'mai3', 'to buy', 3, 6, 1, 6, 'Talk about places you visit', 'introduced', NULL),
('零', 'líng', 'ling2', 'zero / snack', 2, 13, 1, 6, 'Talk about places you visit', 'introduced', NULL),
('食', 'shí', 'shi2', 'food / to eat', 2, 9, 1, 6, 'Talk about places you visit', 'introduced', 'Person + good = person eating good food'),
('看', 'kàn', 'kan4', 'to look / to watch', 4, 9, 1, 6, 'Talk about places you visit', 'introduced', 'Hand over eye = looking/shading eyes to see')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 7: Order drinks (10 new characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('谢', 'xiè', 'xie4', 'to thank', 4, 12, 1, 7, 'Order drinks', 'introduced', NULL),
('杯', 'bēi', 'bei1', 'cup / glass', 1, 8, 1, 7, 'Order drinks', 'introduced', 'Wood + not = wooden cup (not for eating)'),
('要', 'yào', 'yao4', 'to want / to need', 4, 9, 1, 7, 'Order drinks', 'introduced', 'West + woman = woman wants something'),
('奶', 'nǎi', 'nai3', 'milk / breast', 3, 5, 1, 7, 'Order drinks', 'introduced', 'Woman + milk-like strokes = mother''s milk'),
('两', 'liǎng', 'liang3', 'two (quantity)', 3, 7, 1, 7, 'Order drinks', 'introduced', 'Two people inside a frame'),
('牛', 'niú', 'niu2', 'cow / ox', 2, 4, 1, 7, 'Order drinks', 'introduced', 'Picture of cow face with horns'),
('冰', 'bīng', 'bing1', 'ice / cold', 1, 6, 1, 7, 'Order drinks', 'introduced', 'Water frozen solid'),
('绿', 'lǜ', 'lv4', 'green', 4, 11, 1, 7, 'Order drinks', 'introduced', 'Silk + record = green silk threads'),
('客', 'kè', 'ke4', 'guest / customer', 4, 9, 1, 7, 'Order drinks', 'introduced', 'Roof + each = each person under roof is guest'),
('气', 'qì', 'qi4', 'air / gas / manner', 4, 4, 1, 7, 'Order drinks', 'introduced', 'Steam rising')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 1, UNIT 8: Locate travel essentials (17 new characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('手', 'shǒu', 'shou3', 'hand', 3, 4, 1, 8, 'Locate travel essentials', 'introduced', 'Picture of a hand with fingers'),
('机', 'jī', 'ji1', 'machine / opportunity', 1, 6, 1, 8, 'Locate travel essentials', 'introduced', 'Wood + several = wooden machine parts'),
('里', 'lǐ', 'li3', 'inside / in', 3, 7, 1, 8, 'Locate travel essentials', 'introduced', 'Field + earth = inside the field'),
('在', 'zài', 'zai4', 'at / in / to exist', 4, 6, 1, 8, 'Locate travel essentials', 'introduced', NULL),
('钱', 'qián', 'qian2', 'money', 2, 10, 1, 8, 'Locate travel essentials', 'introduced', 'Metal radical = metal coins = money'),
('包', 'bāo', 'bao1', 'bag / to wrap', 1, 5, 1, 8, 'Locate travel essentials', 'introduced', 'Person wrapping something = bag'),
('洗', 'xǐ', 'xi3', 'to wash', 3, 9, 1, 8, 'Locate travel essentials', 'introduced', 'Water + first/ahead = water first for washing'),
('间', 'jiān', 'jian1', 'room / between', 1, 7, 1, 8, 'Locate travel essentials', 'introduced', 'Sun between doors = space between'),
('哪', 'nǎ', 'na3', 'which / where', 3, 9, 1, 8, 'Locate travel essentials', 'introduced', NULL),
('火', 'huǒ', 'huo3', 'fire', 3, 4, 1, 8, 'Locate travel essentials', 'introduced', 'Picture of flames'),
('车', 'chē', 'che1', 'car / vehicle', 1, 4, 1, 8, 'Locate travel essentials', 'introduced', 'Simplified picture of a cart/vehicle from above'),
('站', 'zhàn', 'zhan4', 'station / to stand', 4, 10, 1, 8, 'Locate travel essentials', 'introduced', 'Stand + fortune = standing at a station'),
('呀', 'ya', 'ya5', 'particle (emphasis)', 5, 7, 1, 8, 'Locate travel essentials', 'introduced', NULL),
('行', 'xíng', 'xing2', 'to travel / luggage / OK', 2, 6, 1, 8, 'Locate travel essentials', 'introduced', 'Two footprints = walking/traveling'),
('李', 'lǐ', 'li3', 'plum / surname / luggage (in 行李)', 3, 7, 1, 8, 'Locate travel essentials', 'introduced', 'Tree + child = plum tree with fruit'),
('票', 'piào', 'piao4', 'ticket', 4, 11, 1, 8, 'Locate travel essentials', 'introduced', NULL),
('台', 'tái', 'tai2', 'platform / Taiwan', 2, 5, 1, 8, 'Locate travel essentials', 'introduced', NULL)
ON CONFLICT DO NOTHING;
