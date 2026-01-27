-- Migration: HSK 1 Sentence Seed Data
-- 120 sentences for sentence practice mode

-- ============================================================================
-- GREETINGS & INTRODUCTIONS (15 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('你好', 'nǐ hǎo', 'Hello', 1, 1, 'greeting'),
('你好吗？', 'nǐ hǎo ma?', 'How are you?', 1, 1, 'greeting'),
('我很好', 'wǒ hěn hǎo', 'I''m very good', 1, 1, 'greeting'),
('谢谢', 'xièxie', 'Thank you', 1, 1, 'greeting'),
('不客气', 'búkèqì', 'You''re welcome', 1, 1, 'greeting'),
('对不起', 'duìbùqǐ', 'Sorry', 1, 1, 'greeting'),
('没关系', 'méiguānxì', 'It''s okay', 1, 1, 'greeting'),
('再见', 'zàijiàn', 'Goodbye', 1, 1, 'greeting'),
('我叫王明', 'wǒ jiào wáng míng', 'My name is Wang Ming', 1, 2, 'greeting'),
('你叫什么名字？', 'nǐ jiào shénme míngzi?', 'What''s your name?', 1, 2, 'greeting'),
('认识你很高兴', 'rènshi nǐ hěn gāoxìng', 'Nice to meet you', 1, 2, 'greeting'),
('我是学生', 'wǒ shì xuéshēng', 'I am a student', 1, 1, 'greeting'),
('我是老师', 'wǒ shì lǎoshī', 'I am a teacher', 1, 1, 'greeting'),
('我是中国人', 'wǒ shì zhōngguórén', 'I am Chinese', 1, 2, 'greeting'),
('你是哪国人？', 'nǐ shì nǎ guó rén?', 'What nationality are you?', 1, 2, 'greeting')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- QUESTIONS (25 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('这是什么？', 'zhè shì shénme?', 'What is this?', 1, 1, 'question'),
('那是谁？', 'nà shì shuí?', 'Who is that?', 1, 1, 'question'),
('你去哪儿？', 'nǐ qù nǎr?', 'Where are you going?', 1, 2, 'question'),
('你在哪儿？', 'nǐ zài nǎr?', 'Where are you?', 1, 2, 'question'),
('现在几点？', 'xiànzài jǐ diǎn?', 'What time is it?', 1, 2, 'question'),
('今天几号？', 'jīntiān jǐ hào?', 'What''s today''s date?', 1, 2, 'question'),
('今天星期几？', 'jīntiān xīngqī jǐ?', 'What day is it?', 1, 2, 'question'),
('你几岁？', 'nǐ jǐ suì?', 'How old are you?', 1, 2, 'question'),
('这个多少钱？', 'zhège duōshǎo qián?', 'How much is this?', 1, 2, 'question'),
('你怎么了？', 'nǐ zěnme le?', 'What''s wrong?', 1, 2, 'question'),
('天气怎么样？', 'tiānqì zěnmeyàng?', 'How''s the weather?', 1, 2, 'question'),
('你喜欢什么？', 'nǐ xǐhuān shénme?', 'What do you like?', 1, 2, 'question'),
('你想吃什么？', 'nǐ xiǎng chī shénme?', 'What do you want to eat?', 1, 2, 'question'),
('你想喝什么？', 'nǐ xiǎng hē shénme?', 'What do you want to drink?', 1, 2, 'question'),
('你会说汉语吗？', 'nǐ huì shuō hànyǔ ma?', 'Can you speak Chinese?', 1, 3, 'question'),
('你有时间吗？', 'nǐ yǒu shíjiān ma?', 'Do you have time?', 1, 2, 'question'),
('你有猫吗？', 'nǐ yǒu māo ma?', 'Do you have a cat?', 1, 2, 'question'),
('你有狗吗？', 'nǐ yǒu gǒu ma?', 'Do you have a dog?', 1, 2, 'question'),
('你住在哪儿？', 'nǐ zhù zài nǎr?', 'Where do you live?', 1, 2, 'question'),
('火车站在哪儿？', 'huǒchēzhàn zài nǎr?', 'Where is the train station?', 1, 3, 'question'),
('医院在哪儿？', 'yīyuàn zài nǎr?', 'Where is the hospital?', 1, 2, 'question'),
('你爸爸做什么工作？', 'nǐ bàba zuò shénme gōngzuò?', 'What does your father do?', 1, 3, 'question'),
('你什么时候来？', 'nǐ shénme shíhou lái?', 'When will you come?', 1, 3, 'question'),
('你想买什么？', 'nǐ xiǎng mǎi shénme?', 'What do you want to buy?', 1, 2, 'question'),
('你看什么书？', 'nǐ kàn shénme shū?', 'What book are you reading?', 1, 2, 'question')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STATEMENTS - DAILY LIFE (30 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('我喜欢吃米饭', 'wǒ xǐhuān chī mǐfàn', 'I like eating rice', 1, 2, 'statement'),
('我喜欢喝茶', 'wǒ xǐhuān hē chá', 'I like drinking tea', 1, 2, 'statement'),
('我喜欢看电影', 'wǒ xǐhuān kàn diànyǐng', 'I like watching movies', 1, 2, 'statement'),
('我喜欢看书', 'wǒ xǐhuān kàn shū', 'I like reading books', 1, 2, 'statement'),
('我想喝水', 'wǒ xiǎng hē shuǐ', 'I want to drink water', 1, 2, 'statement'),
('我想吃苹果', 'wǒ xiǎng chī píngguǒ', 'I want to eat an apple', 1, 2, 'statement'),
('我要买东西', 'wǒ yào mǎi dōngxi', 'I want to buy things', 1, 2, 'statement'),
('他是我的朋友', 'tā shì wǒ de péngyou', 'He is my friend', 1, 2, 'statement'),
('她是我的老师', 'tā shì wǒ de lǎoshī', 'She is my teacher', 1, 2, 'statement'),
('这是我的书', 'zhè shì wǒ de shū', 'This is my book', 1, 2, 'statement'),
('那是他的电脑', 'nà shì tā de diànnǎo', 'That is his computer', 1, 2, 'statement'),
('我有一个猫', 'wǒ yǒu yí gè māo', 'I have a cat', 1, 2, 'statement'),
('我有两个朋友', 'wǒ yǒu liǎng gè péngyou', 'I have two friends', 1, 2, 'statement'),
('我在学习汉语', 'wǒ zài xuéxí hànyǔ', 'I am studying Chinese', 1, 3, 'statement'),
('他在看电视', 'tā zài kàn diànshì', 'He is watching TV', 1, 2, 'statement'),
('她在打电话', 'tā zài dǎ diànhuà', 'She is making a phone call', 1, 3, 'statement'),
('我们去饭店', 'wǒmen qù fàndiàn', 'We''re going to a restaurant', 1, 2, 'statement'),
('他们去学校', 'tāmen qù xuéxiào', 'They''re going to school', 1, 2, 'statement'),
('我住在北京', 'wǒ zhù zài běijīng', 'I live in Beijing', 1, 2, 'statement'),
('我在家', 'wǒ zài jiā', 'I''m at home', 1, 1, 'statement'),
('我工作', 'wǒ gōngzuò', 'I work', 1, 1, 'statement'),
('我很高兴', 'wǒ hěn gāoxìng', 'I am very happy', 1, 2, 'statement'),
('今天很热', 'jīntiān hěn rè', 'Today is very hot', 1, 2, 'statement'),
('今天很冷', 'jīntiān hěn lěng', 'Today is very cold', 1, 2, 'statement'),
('这个很大', 'zhège hěn dà', 'This is very big', 1, 2, 'statement'),
('那个很小', 'nàge hěn xiǎo', 'That is very small', 1, 2, 'statement'),
('她很漂亮', 'tā hěn piàoliang', 'She is very beautiful', 1, 2, 'statement'),
('中国很大', 'zhōngguó hěn dà', 'China is very big', 1, 2, 'statement'),
('苹果很好吃', 'píngguǒ hěn hǎochī', 'Apples are delicious', 1, 2, 'statement'),
('我爱我的家', 'wǒ ài wǒ de jiā', 'I love my home', 1, 2, 'statement')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NEGATIVES (15 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('我不是学生', 'wǒ bú shì xuéshēng', 'I am not a student', 1, 2, 'negative'),
('我不喜欢', 'wǒ bù xǐhuān', 'I don''t like it', 1, 2, 'negative'),
('我不想去', 'wǒ bù xiǎng qù', 'I don''t want to go', 1, 2, 'negative'),
('我不会说汉语', 'wǒ bú huì shuō hànyǔ', 'I can''t speak Chinese', 1, 3, 'negative'),
('他不在家', 'tā bú zài jiā', 'He is not at home', 1, 2, 'negative'),
('我没有钱', 'wǒ méiyǒu qián', 'I don''t have money', 1, 2, 'negative'),
('我没有时间', 'wǒ méiyǒu shíjiān', 'I don''t have time', 1, 2, 'negative'),
('我没有猫', 'wǒ méiyǒu māo', 'I don''t have a cat', 1, 2, 'negative'),
('他没有来', 'tā méiyǒu lái', 'He didn''t come', 1, 2, 'negative'),
('我今天没去学校', 'wǒ jīntiān méi qù xuéxiào', 'I didn''t go to school today', 1, 3, 'negative'),
('这不是我的', 'zhè bú shì wǒ de', 'This is not mine', 1, 2, 'negative'),
('我不太好', 'wǒ bú tài hǎo', 'I''m not very well', 1, 2, 'negative'),
('不好意思', 'bù hǎoyìsi', 'Excuse me / Sorry', 1, 2, 'negative'),
('我不认识他', 'wǒ bú rènshi tā', 'I don''t know him', 1, 2, 'negative'),
('我不能去', 'wǒ bù néng qù', 'I can''t go', 1, 2, 'negative')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TIME EXPRESSIONS (15 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('现在三点', 'xiànzài sān diǎn', 'It''s 3 o''clock now', 1, 2, 'time'),
('今天是星期一', 'jīntiān shì xīngqīyī', 'Today is Monday', 1, 2, 'time'),
('明天见', 'míngtiān jiàn', 'See you tomorrow', 1, 1, 'time'),
('昨天我去了商店', 'zuótiān wǒ qù le shāngdiàn', 'Yesterday I went to the store', 1, 3, 'time'),
('我上午学习', 'wǒ shàngwǔ xuéxí', 'I study in the morning', 1, 2, 'time'),
('我下午工作', 'wǒ xiàwǔ gōngzuò', 'I work in the afternoon', 1, 2, 'time'),
('我中午吃饭', 'wǒ zhōngwǔ chīfàn', 'I eat lunch at noon', 1, 2, 'time'),
('我七点起床', 'wǒ qī diǎn qǐchuáng', 'I get up at 7 o''clock', 1, 2, 'time'),
('我十点睡觉', 'wǒ shí diǎn shuìjiào', 'I sleep at 10 o''clock', 1, 2, 'time'),
('今天是几月几号？', 'jīntiān shì jǐ yuè jǐ hào?', 'What''s today''s date?', 1, 3, 'time'),
('我二十岁', 'wǒ èrshí suì', 'I am 20 years old', 1, 2, 'time'),
('现在是下午五点', 'xiànzài shì xiàwǔ wǔ diǎn', 'It''s 5 PM now', 1, 3, 'time'),
('等一下', 'děng yíxià', 'Wait a moment', 1, 2, 'time'),
('我每天都学习', 'wǒ měitiān dōu xuéxí', 'I study every day', 1, 3, 'time'),
('什么时候？', 'shénme shíhou?', 'When?', 1, 2, 'time')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LOCATION (10 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('学校在前面', 'xuéxiào zài qiánmiàn', 'The school is in front', 1, 2, 'location'),
('医院在后面', 'yīyuàn zài hòumiàn', 'The hospital is behind', 1, 2, 'location'),
('书在桌子上', 'shū zài zhuōzi shàng', 'The book is on the table', 1, 2, 'location'),
('猫在椅子下', 'māo zài yǐzi xià', 'The cat is under the chair', 1, 2, 'location'),
('他在里面', 'tā zài lǐmiàn', 'He is inside', 1, 2, 'location'),
('商店在这儿', 'shāngdiàn zài zhèr', 'The store is here', 1, 2, 'location'),
('饭店在那儿', 'fàndiàn zài nàr', 'The restaurant is there', 1, 2, 'location'),
('请坐', 'qǐng zuò', 'Please sit', 1, 1, 'location'),
('请进', 'qǐng jìn', 'Please come in', 1, 1, 'location'),
('我去学校', 'wǒ qù xuéxiào', 'I''m going to school', 1, 2, 'location')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REQUESTS & OFFERS (10 sentences)
-- ============================================================================
INSERT INTO sentences (chinese, pinyin, english, hsk_level, difficulty, category) VALUES
('请喝茶', 'qǐng hē chá', 'Please have some tea', 1, 1, 'request'),
('请吃', 'qǐng chī', 'Please eat', 1, 1, 'request'),
('我能帮你吗？', 'wǒ néng bāng nǐ ma?', 'Can I help you?', 1, 2, 'request'),
('请问', 'qǐngwèn', 'May I ask...', 1, 1, 'request'),
('你能说慢一点吗？', 'nǐ néng shuō màn yìdiǎn ma?', 'Can you speak slower?', 1, 3, 'request'),
('请再说一遍', 'qǐng zài shuō yí biàn', 'Please say it again', 1, 3, 'request'),
('我想要这个', 'wǒ xiǎng yào zhège', 'I want this one', 1, 2, 'request'),
('给我一杯水', 'gěi wǒ yì bēi shuǐ', 'Give me a glass of water', 1, 2, 'request'),
('我们一起去吧', 'wǒmen yìqǐ qù ba', 'Let''s go together', 1, 2, 'request'),
('好的', 'hǎo de', 'Okay', 1, 1, 'request')
ON CONFLICT DO NOTHING;
