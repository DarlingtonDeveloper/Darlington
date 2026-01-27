-- Migration: HSK 1 Word Data
-- 1. Adds Unit 9 characters (Duolingo)
-- 2. Backfills existing words with word_type
-- 3. Adds all HSK 1 vocabulary words

-- ============================================================================
-- SECTION 1, UNIT 9: Introduce yourself and your classes (15 characters)
-- ============================================================================
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, mnemonic) VALUES
('同', 'tóng', 'tong2', 'same / together', 2, 6, 1, 9, 'Introduce yourself', 'introduced', 'All under one roof = same'),
('新', 'xīn', 'xin1', 'new', 1, 13, 1, 9, 'Introduce yourself', 'introduced', 'Stand + axe + tree = cutting new wood'),
('有', 'yǒu', 'you3', 'to have / there is', 3, 6, 1, 9, 'Introduce yourself', 'introduced', 'Hand + moon = having the moon in hand'),
('王', 'wáng', 'wang2', 'king / surname Wang', 2, 4, 1, 9, 'Introduce yourself', 'introduced', 'Three horizontal lines connected = heaven, earth, humanity'),
('明', 'míng', 'ming2', 'bright / tomorrow', 2, 8, 1, 9, 'Introduce yourself', 'introduced', 'Sun + moon = bright'),
('好', 'hǎo', 'hao3', 'good / well', 3, 6, 1, 9, 'Introduce yourself', 'introduced', 'Woman + child = good (family harmony)'),
('天', 'tiān', 'tian1', 'day / sky / heaven', 1, 4, 1, 9, 'Introduce yourself', 'introduced', 'Person with arms up under sky = heaven above'),
('四', 'sì', 'si4', 'four', 4, 5, 1, 9, 'Introduce yourself', 'introduced', 'Four divisions in a box'),
('今', 'jīn', 'jin1', 'now / today', 1, 4, 1, 9, 'Introduce yourself', 'introduced', NULL),
('历', 'lì', 'li4', 'history / calendar', 4, 4, 1, 9, 'Introduce yourself', 'introduced', NULL),
('史', 'shǐ', 'shi3', 'history', 3, 5, 1, 9, 'Introduce yourself', 'introduced', 'Hand holding writing brush = recording history'),
('们', 'men', 'men5', 'plural marker (people)', 5, 5, 1, 9, 'Introduce yourself', 'introduced', 'Person + door = many people at door'),
('真', 'zhēn', 'zhen1', 'true / real', 1, 10, 1, 9, 'Introduce yourself', 'introduced', NULL),
('的', 'de', 'de5', 'possessive particle', 5, 8, 1, 9, 'Introduce yourself', 'introduced', NULL),
('吗', 'ma', 'ma5', 'question particle', 5, 6, 1, 9, 'Introduce yourself', 'introduced', 'Mouth + horse = asking (horse sound)')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BACKFILL EXISTING WORDS WITH word_type
-- ============================================================================

-- Unit 1: Food and drinks
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '水';
UPDATE words SET word_type = 'noun' WHERE hanzi = '咖';  -- Part of compound, no HSK level
UPDATE words SET word_type = 'noun' WHERE hanzi = '啡';  -- Part of compound, no HSK level
UPDATE words SET word_type = 'conjunction', hsk_level = 1 WHERE hanzi = '和';
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '茶';
UPDATE words SET word_type = 'noun' WHERE hanzi = '米';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '饭';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '汤';  -- Not HSK 1
UPDATE words SET word_type = 'adjective', hsk_level = 1 WHERE hanzi = '热';
UPDATE words SET word_type = 'pronoun_demonstrative', hsk_level = 1 WHERE hanzi = '这';
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '是';
UPDATE words SET word_type = 'noun' WHERE hanzi = '粥';  -- Not HSK 1
UPDATE words SET word_type = 'noun' WHERE hanzi = '豆';  -- Not HSK 1
UPDATE words SET word_type = 'noun' WHERE hanzi = '腐';  -- Not HSK 1

-- Unit 2: Nationalities
UPDATE words SET word_type = 'adjective' WHERE hanzi = '美';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '国';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '中';  -- Part of compound
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '日';
UPDATE words SET word_type = 'quantifier', hsk_level = 1 WHERE hanzi = '本';
UPDATE words SET word_type = 'pronoun_personal', hsk_level = 1 WHERE hanzi = '我';
UPDATE words SET word_type = 'pronoun_personal', hsk_level = 1 WHERE hanzi = '你';
UPDATE words SET word_type = 'auxiliary', hsk_level = 1 WHERE hanzi = '呢';
UPDATE words SET word_type = 'noun' WHERE hanzi = '韩';  -- Not HSK 1

-- Unit 3: Professions
UPDATE words SET word_type = 'noun' WHERE hanzi = '英';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '文';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '医';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '生';  -- Part of compound
UPDATE words SET word_type = 'adjective' WHERE hanzi = '老';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '师';  -- Part of compound
UPDATE words SET word_type = 'adjective' WHERE hanzi = '对';  -- Part of compound
UPDATE words SET word_type = 'adverb', hsk_level = 1 WHERE hanzi = '不';
UPDATE words SET word_type = 'noun' WHERE hanzi = '律';  -- Not HSK 1
UPDATE words SET word_type = 'verb' WHERE hanzi = '说';  -- Part of compound
UPDATE words SET word_type = 'verb' WHERE hanzi = '学';  -- Part of compound

-- Unit 4: Courses
UPDATE words SET word_type = 'verb' WHERE hanzi = '喜';  -- Part of compound
UPDATE words SET word_type = 'verb' WHERE hanzi = '欢';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '课';  -- Not HSK 1
UPDATE words SET word_type = 'adjective', hsk_level = 1 WHERE hanzi = '大';
UPDATE words SET word_type = 'number' WHERE hanzi = '数';  -- Not HSK 1 as standalone
UPDATE words SET word_type = 'pronoun_personal', hsk_level = 1 WHERE hanzi = '他';
UPDATE words SET word_type = 'noun' WHERE hanzi = '音';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '乐';  -- Part of compound
UPDATE words SET word_type = 'pronoun_personal', hsk_level = 1 WHERE hanzi = '她';

-- Unit 5: Possessive pronouns
UPDATE words SET word_type = 'noun' WHERE hanzi = '爸';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '儿';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '子';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '妈';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '公';  -- Part of compound (外公)
UPDATE words SET word_type = 'verb' WHERE hanzi = '加';  -- Not HSK 1
UPDATE words SET word_type = 'verb' WHERE hanzi = '拿';  -- Not HSK 1
UPDATE words SET word_type = 'noun' WHERE hanzi = '婆';  -- Part of compound (外婆)
UPDATE words SET word_type = 'adverb' WHERE hanzi = '也';  -- Not HSK 1 as standalone
UPDATE words SET word_type = 'noun' WHERE hanzi = '女';  -- Part of compound

-- Unit 6: Places
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '去';
UPDATE words SET word_type = 'adverb' WHERE hanzi = '常';  -- Not HSK 1
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '书';
UPDATE words SET word_type = 'noun' WHERE hanzi = '店';  -- Part of compound
UPDATE words SET word_type = 'verb' WHERE hanzi = '超';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '市';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '馆';  -- Part of compound
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '菜';
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '吃';
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '买';
UPDATE words SET word_type = 'number', hsk_level = 1 WHERE hanzi = '零';
UPDATE words SET word_type = 'noun' WHERE hanzi = '食';  -- Part of compound
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '看';

-- Unit 7: Drinks
UPDATE words SET word_type = 'verb' WHERE hanzi = '谢';  -- Part of compound
UPDATE words SET word_type = 'quantifier' WHERE hanzi = '杯';  -- Part of compound
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '要';
UPDATE words SET word_type = 'noun' WHERE hanzi = '奶';  -- Part of compound
UPDATE words SET word_type = 'number', hsk_level = 1 WHERE hanzi = '两';
UPDATE words SET word_type = 'noun' WHERE hanzi = '牛';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '冰';  -- Not HSK 1
UPDATE words SET word_type = 'adjective' WHERE hanzi = '绿';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '客';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '气';  -- Part of compound

-- Unit 8: Travel
UPDATE words SET word_type = 'noun' WHERE hanzi = '手';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '机';  -- Part of compound
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '里';
UPDATE words SET word_type = 'preposition', hsk_level = 1 WHERE hanzi = '在';
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '钱';
UPDATE words SET word_type = 'noun' WHERE hanzi = '包';  -- Not HSK 1
UPDATE words SET word_type = 'verb' WHERE hanzi = '洗';  -- Not HSK 1
UPDATE words SET word_type = 'noun' WHERE hanzi = '间';  -- Not HSK 1
UPDATE words SET word_type = 'pronoun_interrogative', hsk_level = 1 WHERE hanzi = '哪';
UPDATE words SET word_type = 'noun' WHERE hanzi = '火';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '车';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '站';  -- Part of compound
UPDATE words SET word_type = 'auxiliary' WHERE hanzi = '呀';  -- Not HSK 1
UPDATE words SET word_type = 'verb' WHERE hanzi = '行';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '李';  -- Not HSK 1 standalone
UPDATE words SET word_type = 'noun' WHERE hanzi = '票';  -- Not HSK 1
UPDATE words SET word_type = 'noun' WHERE hanzi = '台';  -- Not HSK 1

-- Unit 9: Introduction (backfill if exists)
UPDATE words SET word_type = 'adjective' WHERE hanzi = '同';  -- Part of compound
UPDATE words SET word_type = 'adjective' WHERE hanzi = '新';  -- Not HSK 1 standalone
UPDATE words SET word_type = 'verb', hsk_level = 1 WHERE hanzi = '有';
UPDATE words SET word_type = 'noun' WHERE hanzi = '王';  -- Not HSK 1
UPDATE words SET word_type = 'adjective' WHERE hanzi = '明';  -- Part of compound
UPDATE words SET word_type = 'adjective', hsk_level = 1 WHERE hanzi = '好';
UPDATE words SET word_type = 'noun', hsk_level = 1 WHERE hanzi = '天';
UPDATE words SET word_type = 'number', hsk_level = 1 WHERE hanzi = '四';
UPDATE words SET word_type = 'noun' WHERE hanzi = '今';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '历';  -- Part of compound
UPDATE words SET word_type = 'noun' WHERE hanzi = '史';  -- Part of compound
UPDATE words SET word_type = 'auxiliary' WHERE hanzi = '们';  -- Part of compound
UPDATE words SET word_type = 'adjective' WHERE hanzi = '真';  -- Not HSK 1
UPDATE words SET word_type = 'auxiliary', hsk_level = 1 WHERE hanzi = '的';
UPDATE words SET word_type = 'auxiliary', hsk_level = 1 WHERE hanzi = '吗';

-- ============================================================================
-- HSK 1 VOCABULARY - NEW WORDS
-- Section 10 used for HSK words not tied to Duolingo units
-- ============================================================================

-- Personal Pronouns
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('我们', 'wǒmen', 'wo3men5', 'we / us', 3, 12, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_personal', 1, 2),
('你们', 'nǐmen', 'ni3men5', 'you (plural)', 3, 12, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_personal', 1, 2),
('他们', 'tāmen', 'ta1men5', 'they (male/mixed)', 1, 10, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_personal', 1, 2),
('她们', 'tāmen', 'ta1men5', 'they (female)', 1, 11, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_personal', 1, 2)
ON CONFLICT DO NOTHING;

-- Demonstrative Pronouns
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('这儿', 'zhèr', 'zhe4r5', 'here', 4, 9, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_demonstrative', 1, 2),
('那', 'nà', 'na4', 'that', 4, 6, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_demonstrative', 1, 1),
('那儿', 'nàr', 'na4r5', 'there', 4, 8, 1, 10, 'HSK 1 Pronouns', 'introduced', 'pronoun_demonstrative', 1, 2)
ON CONFLICT DO NOTHING;

-- Interrogative Pronouns
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('哪儿', 'nǎr', 'na3r5', 'where', 3, 11, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 2),
('谁', 'shuí', 'shui2', 'who', 2, 10, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 1),
('什么', 'shénme', 'shen2me5', 'what', 2, 8, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 2),
('多少', 'duōshǎo', 'duo1shao3', 'how many / how much', 1, 12, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 2),
('几', 'jǐ', 'ji3', 'how many (small)', 3, 2, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 1),
('怎么', 'zěnme', 'zen3me5', 'how', 3, 13, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 2),
('怎么样', 'zěnmeyàng', 'zen3me5yang4', 'how about', 3, 19, 1, 10, 'HSK 1 Questions', 'introduced', 'pronoun_interrogative', 1, 3)
ON CONFLICT DO NOTHING;

-- Numbers
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('一', 'yī', 'yi1', 'one', 1, 1, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('二', 'èr', 'er4', 'two', 4, 2, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('三', 'sān', 'san1', 'three', 1, 3, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('五', 'wǔ', 'wu3', 'five', 3, 4, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('六', 'liù', 'liu4', 'six', 4, 4, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('七', 'qī', 'qi1', 'seven', 1, 2, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('八', 'bā', 'ba1', 'eight', 1, 2, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('九', 'jiǔ', 'jiu3', 'nine', 3, 2, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1),
('十', 'shí', 'shi2', 'ten', 2, 2, 1, 10, 'HSK 1 Numbers', 'introduced', 'number', 1, 1)
ON CONFLICT DO NOTHING;

-- Quantifiers
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('个', 'gè', 'ge4', 'general measure word', 4, 3, 1, 10, 'HSK 1 Quantifiers', 'introduced', 'quantifier', 1, 1),
('岁', 'suì', 'sui4', 'years old', 4, 6, 1, 10, 'HSK 1 Quantifiers', 'introduced', 'quantifier', 1, 1),
('些', 'xiē', 'xie1', 'some', 1, 8, 1, 10, 'HSK 1 Quantifiers', 'introduced', 'quantifier', 1, 1),
('块', 'kuài', 'kuai4', 'piece / yuan (money)', 4, 7, 1, 10, 'HSK 1 Quantifiers', 'introduced', 'quantifier', 1, 1)
ON CONFLICT DO NOTHING;

-- Adverbs
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('没', 'méi', 'mei2', 'not (have)', 2, 7, 1, 10, 'HSK 1 Adverbs', 'introduced', 'adverb', 1, 1),
('很', 'hěn', 'hen3', 'very', 3, 9, 1, 10, 'HSK 1 Adverbs', 'introduced', 'adverb', 1, 1),
('太', 'tài', 'tai4', 'too (much)', 4, 4, 1, 10, 'HSK 1 Adverbs', 'introduced', 'adverb', 1, 1),
('都', 'dōu', 'dou1', 'all / both', 1, 10, 1, 10, 'HSK 1 Adverbs', 'introduced', 'adverb', 1, 1)
ON CONFLICT DO NOTHING;

-- Auxiliary Particles
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('了', 'le', 'le5', 'completed action', 5, 2, 1, 10, 'HSK 1 Particles', 'introduced', 'auxiliary', 1, 1)
ON CONFLICT DO NOTHING;

-- Interjection
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('喂', 'wèi', 'wei4', 'hello (phone)', 4, 12, 1, 10, 'HSK 1 Interjections', 'introduced', 'interjection', 1, 1)
ON CONFLICT DO NOTHING;

-- Nouns - Places
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('家', 'jiā', 'jia1', 'home / family', 1, 10, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 1),
('学校', 'xuéxiào', 'xue2xiao4', 'school', 2, 18, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 2),
('饭店', 'fàndiàn', 'fan4dian4', 'restaurant', 4, 15, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 2),
('商店', 'shāngdiàn', 'shang1dian4', 'store / shop', 1, 19, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 2),
('医院', 'yīyuàn', 'yi1yuan4', 'hospital', 1, 14, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 2),
('火车站', 'huǒchēzhàn', 'huo3che1zhan4', 'train station', 3, 18, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 3),
('中国', 'zhōngguó', 'zhong1guo2', 'China', 1, 12, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 2),
('北京', 'běijīng', 'bei3jing1', 'Beijing', 3, 13, 1, 10, 'HSK 1 Places', 'introduced', 'noun', 1, 2)
ON CONFLICT DO NOTHING;

-- Nouns - Directions
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('上', 'shàng', 'shang4', 'up / on / above', 4, 3, 1, 10, 'HSK 1 Directions', 'introduced', 'noun', 1, 1),
('下', 'xià', 'xia4', 'down / under / below', 4, 3, 1, 10, 'HSK 1 Directions', 'introduced', 'noun', 1, 1),
('前面', 'qiánmiàn', 'qian2mian4', 'front / in front', 2, 18, 1, 10, 'HSK 1 Directions', 'introduced', 'noun', 1, 2),
('后面', 'hòumiàn', 'hou4mian4', 'behind / back', 4, 15, 1, 10, 'HSK 1 Directions', 'introduced', 'noun', 1, 2)
ON CONFLICT DO NOTHING;

-- Nouns - Time
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('今天', 'jīntiān', 'jin1tian1', 'today', 1, 8, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('明天', 'míngtiān', 'ming2tian1', 'tomorrow', 2, 12, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('昨天', 'zuótiān', 'zuo2tian1', 'yesterday', 2, 13, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('上午', 'shàngwǔ', 'shang4wu3', 'morning', 4, 7, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('中午', 'zhōngwǔ', 'zhong1wu3', 'noon', 1, 8, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('下午', 'xiàwǔ', 'xia4wu3', 'afternoon', 4, 7, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('年', 'nián', 'nian2', 'year', 2, 6, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 1),
('月', 'yuè', 'yue4', 'month / moon', 4, 4, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 1),
('星期', 'xīngqī', 'xing1qi1', 'week', 1, 17, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('点', 'diǎn', 'dian3', 'o''clock / point', 3, 9, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 1),
('分钟', 'fēnzhōng', 'fen1zhong1', 'minute', 1, 14, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('现在', 'xiànzài', 'xian4zai4', 'now', 4, 14, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2),
('时候', 'shíhou', 'shi2hou5', 'time (moment)', 2, 17, 1, 10, 'HSK 1 Time', 'introduced', 'noun', 1, 2)
ON CONFLICT DO NOTHING;

-- Nouns - People
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('爸爸', 'bàba', 'ba4ba5', 'father / dad', 4, 16, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('妈妈', 'māma', 'ma1ma5', 'mother / mom', 1, 12, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('儿子', 'érzi', 'er2zi5', 'son', 2, 5, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('女儿', 'nǚér', 'nv3er2', 'daughter', 3, 5, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('老师', 'lǎoshī', 'lao3shi1', 'teacher', 3, 12, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('学生', 'xuéshēng', 'xue2sheng1', 'student', 2, 13, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('同学', 'tóngxué', 'tong2xue2', 'classmate', 2, 14, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('朋友', 'péngyou', 'peng2you5', 'friend', 2, 12, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('医生', 'yīshēng', 'yi1sheng1', 'doctor', 1, 12, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('先生', 'xiānsheng', 'xian1sheng5', 'Mr. / sir', 1, 11, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('小姐', 'xiǎojiě', 'xiao3jie3', 'Miss / young lady', 3, 11, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2),
('人', 'rén', 'ren2', 'person / people', 2, 2, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 1),
('名字', 'míngzi', 'ming2zi5', 'name', 2, 10, 1, 10, 'HSK 1 People', 'introduced', 'noun', 1, 2)
ON CONFLICT DO NOTHING;

-- Nouns - Food & Drink
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('米饭', 'mǐfàn', 'mi3fan4', 'cooked rice', 3, 13, 1, 10, 'HSK 1 Food', 'introduced', 'noun', 1, 2),
('水果', 'shuǐguǒ', 'shui3guo3', 'fruit', 3, 12, 1, 10, 'HSK 1 Food', 'introduced', 'noun', 1, 2),
('苹果', 'píngguǒ', 'ping2guo3', 'apple', 2, 16, 1, 10, 'HSK 1 Food', 'introduced', 'noun', 1, 2),
('杯子', 'bēizi', 'bei1zi5', 'cup / glass', 1, 11, 1, 10, 'HSK 1 Food', 'introduced', 'noun', 1, 2)
ON CONFLICT DO NOTHING;

-- Nouns - Objects
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('飞机', 'fēijī', 'fei1ji1', 'airplane', 1, 9, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('出租车', 'chūzūchē', 'chu1zu1che1', 'taxi', 1, 17, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 3),
('电视', 'diànshì', 'dian4shi4', 'television', 4, 18, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('电脑', 'diànnǎo', 'dian4nao3', 'computer', 4, 15, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('电影', 'diànyǐng', 'dian4ying3', 'movie', 4, 14, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('天气', 'tiānqì', 'tian1qi4', 'weather', 1, 8, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('猫', 'māo', 'mao1', 'cat', 1, 11, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 1),
('狗', 'gǒu', 'gou3', 'dog', 3, 8, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 1),
('东西', 'dōngxi', 'dong1xi5', 'thing / stuff', 1, 13, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('汉语', 'hànyǔ', 'han4yu3', 'Chinese language', 4, 11, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('字', 'zì', 'zi4', 'character / word', 4, 6, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 1),
('桌子', 'zhuōzi', 'zhuo1zi5', 'table / desk', 1, 13, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('椅子', 'yǐzi', 'yi3zi5', 'chair', 3, 15, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2),
('衣服', 'yīfu', 'yi1fu5', 'clothes', 1, 12, 1, 10, 'HSK 1 Objects', 'introduced', 'noun', 1, 2)
ON CONFLICT DO NOTHING;

-- Verbs - Greetings
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('谢谢', 'xièxie', 'xie4xie5', 'thank you', 4, 24, 1, 10, 'HSK 1 Greetings', 'introduced', 'verb', 1, 2),
('不客气', 'búkèqì', 'bu2ke4qi4', 'you''re welcome', 2, 17, 1, 10, 'HSK 1 Greetings', 'introduced', 'verb', 1, 3),
('再见', 'zàijiàn', 'zai4jian4', 'goodbye', 4, 13, 1, 10, 'HSK 1 Greetings', 'introduced', 'verb', 1, 2),
('请', 'qǐng', 'qing3', 'please / to invite', 3, 10, 1, 10, 'HSK 1 Greetings', 'introduced', 'verb', 1, 1),
('对不起', 'duìbùqǐ', 'dui4bu4qi3', 'sorry', 4, 14, 1, 10, 'HSK 1 Greetings', 'introduced', 'verb', 1, 3),
('没关系', 'méiguānxì', 'mei2guan1xi4', 'it''s okay / no problem', 2, 25, 1, 10, 'HSK 1 Greetings', 'introduced', 'verb', 1, 3)
ON CONFLICT DO NOTHING;

-- Verbs - Common
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('听', 'tīng', 'ting1', 'to listen', 1, 7, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('说话', 'shuōhuà', 'shuo1hua4', 'to speak / to talk', 1, 17, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('读', 'dú', 'du2', 'to read', 2, 10, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('写', 'xiě', 'xie3', 'to write', 3, 5, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('看见', 'kànjiàn', 'kan4jian4', 'to see', 4, 16, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('叫', 'jiào', 'jiao4', 'to call / to be called', 4, 5, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('来', 'lái', 'lai2', 'to come', 2, 7, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('回', 'huí', 'hui2', 'to return', 2, 6, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('喝', 'hē', 'he1', 'to drink', 1, 12, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('睡觉', 'shuìjiào', 'shui4jiao4', 'to sleep', 4, 20, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('打电话', 'dǎdiànhuà', 'da3dian4hua4', 'to make a phone call', 3, 21, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 3),
('做', 'zuò', 'zuo4', 'to do / to make', 4, 11, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('开', 'kāi', 'kai1', 'to open / to drive', 1, 4, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('坐', 'zuò', 'zuo4', 'to sit', 4, 7, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('住', 'zhù', 'zhu4', 'to live', 4, 7, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('学习', 'xuéxí', 'xue2xi2', 'to study', 2, 11, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('工作', 'gōngzuò', 'gong1zuo4', 'to work / job', 1, 14, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('下雨', 'xiàyǔ', 'xia4yu3', 'to rain', 4, 11, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('爱', 'ài', 'ai4', 'to love', 4, 10, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('喜欢', 'xǐhuān', 'xi3huan1', 'to like', 3, 18, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('想', 'xiǎng', 'xiang3', 'to want / to think', 3, 13, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('认识', 'rènshi', 'ren4shi5', 'to know (person)', 4, 11, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 2),
('会', 'huì', 'hui4', 'can (learned skill)', 4, 6, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1),
('能', 'néng', 'neng2', 'can (ability)', 2, 10, 1, 10, 'HSK 1 Verbs', 'introduced', 'verb', 1, 1)
ON CONFLICT DO NOTHING;

-- Adjectives
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, hsk_level, char_count) VALUES
('小', 'xiǎo', 'xiao3', 'small / little', 3, 3, 1, 10, 'HSK 1 Adjectives', 'introduced', 'adjective', 1, 1),
('多', 'duō', 'duo1', 'many / much', 1, 6, 1, 10, 'HSK 1 Adjectives', 'introduced', 'adjective', 1, 1),
('少', 'shǎo', 'shao3', 'few / little', 3, 4, 1, 10, 'HSK 1 Adjectives', 'introduced', 'adjective', 1, 1),
('冷', 'lěng', 'leng3', 'cold', 3, 7, 1, 10, 'HSK 1 Adjectives', 'introduced', 'adjective', 1, 1),
('高兴', 'gāoxìng', 'gao1xing4', 'happy', 1, 16, 1, 10, 'HSK 1 Adjectives', 'introduced', 'adjective', 1, 2),
('漂亮', 'piàoliang', 'piao4liang5', 'beautiful', 4, 25, 1, 10, 'HSK 1 Adjectives', 'introduced', 'adjective', 1, 2)
ON CONFLICT DO NOTHING;

-- Compound words from existing characters (Duolingo compounds)
INSERT INTO words (hanzi, pinyin, pinyin_numbered, english, tone, stroke_count, section, unit, unit_name, category, word_type, char_count) VALUES
('咖啡', 'kāfēi', 'ka1fei1', 'coffee', 1, 19, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('美国', 'měiguó', 'mei3guo2', 'America / USA', 3, 17, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('英文', 'yīngwén', 'ying1wen2', 'English (language)', 1, 12, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('律师', 'lǜshī', 'lv4shi1', 'lawyer', 4, 15, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('音乐', 'yīnyuè', 'yin1yue4', 'music', 1, 14, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('外公', 'wàigōng', 'wai4gong1', 'grandfather (maternal)', 4, 9, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('外婆', 'wàipó', 'wai4po2', 'grandmother (maternal)', 4, 16, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('加拿大', 'jiānádà', 'jia1na2da4', 'Canada', 1, 18, 1, 10, 'Compounds', 'introduced', 'noun', 3),
('书店', 'shūdiàn', 'shu1dian4', 'bookstore', 1, 12, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('超市', 'chāoshì', 'chao1shi4', 'supermarket', 1, 17, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('零食', 'língshí', 'ling2shi2', 'snacks', 2, 22, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('牛奶', 'niúnǎi', 'niu2nai3', 'milk', 2, 9, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('绿茶', 'lǜchá', 'lv4cha2', 'green tea', 4, 20, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('手机', 'shǒujī', 'shou3ji1', 'mobile phone', 3, 10, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('钱包', 'qiánbāo', 'qian2bao1', 'wallet', 2, 15, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('洗手间', 'xǐshǒujiān', 'xi3shou3jian1', 'restroom', 3, 20, 1, 10, 'Compounds', 'introduced', 'noun', 3),
('行李', 'xínglǐ', 'xing2li3', 'luggage', 2, 13, 1, 10, 'Compounds', 'introduced', 'noun', 2),
('历史', 'lìshǐ', 'li4shi3', 'history', 4, 9, 1, 10, 'Compounds', 'introduced', 'noun', 2)
ON CONFLICT DO NOTHING;

-- Set char_count = 1 for all single-character words that don't have it set
UPDATE words SET char_count = 1 WHERE char_count IS NULL AND length(hanzi) = 1;
UPDATE words SET char_count = length(hanzi) WHERE char_count IS NULL;
