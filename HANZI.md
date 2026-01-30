# HSK 1 Expansion Spec - Hanzi Linker

## Executive Summary

Expand Hanzi Linker to fully support HSK 1 exam preparation by:
1. Adding complete HSK 1 vocabulary (150 words)
2. Organizing by grammatical word type (not just Duolingo units)
3. Adding typing input mode for pinyin keyboard training
4. Adding sentence practice mode
5. Tracking high scores for review mode

---

## Current State

- **109 characters** seeded from Duolingo Section 1 (9 units)
- Organized by thematic units ("Name food and drinks", etc.)
- Link game mode (English → Pinyin → Hanzi chains)
- Review mode (flashcard-style, tap to answer)
- Lesson mode (learning new characters)

### Current Character Inventory (109 total)

| Unit | Count | Characters |
|------|-------|------------|
| 1 | 14 | 水 咖 啡 和 茶 米 饭 汤 热 这 是 粥 豆 腐 |
| 2 | 9 | 美 国 中 日 本 我 你 呢 韩 |
| 3 | 11 | 英 文 医 生 老 师 对 不 律 说 学 |
| 4 | 9 | 喜 欢 课 大 数 他 音 乐 她 |
| 5 | 10 | 爸 儿 子 妈 公 加 拿 婆 也 女 |
| 6 | 13 | 去 常 书 店 超 市 馆 菜 吃 买 零 食 看 |
| 7 | 10 | 谢 杯 要 奶 两 牛 冰 绿 客 气 |
| 8 | 17 | 手 机 里 在 钱 包 洗 间 哪 火 车 站 呀 行 李 票 台 |
| 9 | 15 | 同 新 有 王 明 好 天 四 今 历 史 们 真 的 吗 |

---

## HSK 1 Requirements

HSK 1 tests **150 vocabulary words** (not individual characters). Key differences from current approach:

| Aspect | Current (Duolingo) | HSK 1 |
|--------|-------------------|-------|
| Unit of learning | Individual characters | Complete words |
| 咖 + 啡 | 2 separate items | 1 item: 咖啡 |
| Organization | Thematic units | Grammatical categories |
| Sentences | None | Required for comprehension |

---

## Vocabulary Audit

### Summary

| Category | HSK 1 Count | Currently Have | Need to Add |
|----------|-------------|----------------|-------------|
| Personal Pronouns | 8 | 4 | 4 |
| Demonstrative Pronouns | 4 | 1 | 3 |
| Interrogative Pronouns | 9 | 1 | 8 |
| Numbers | 11 | 2 | 9 |
| Quantifiers | 5 | 1 | 4 |
| Adverbs | 5 | 1 | 4 |
| Conjunctions | 1 | 1 | 0 |
| Prepositions | 1 | 1 | 0 |
| Auxiliary Particles | 4 | 3 | 1 |
| Interjections | 1 | 0 | 1 |
| Nouns | ~50 | ~20 | ~30 |
| Verbs | ~35 | ~12 | ~23 |
| Adjectives | 9 | 3 | 6 |
| **TOTAL** | **150** | **~50** | **~93** |

Additionally: **~20 compound words need to be ADDED** as complete vocabulary items (components already exist as separate characters).

---

### Detailed Word List

#### Personal Pronouns (pronoun_personal) - 8 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 我 | wǒ | I, me | ✅ Have (Unit 2) |
| 我们 | wǒmen | we, us | ❌ Add |
| 你 | nǐ | you | ✅ Have (Unit 2) |
| 你们 | nǐmen | you (plural) | ❌ Add |
| 他 | tā | he, him | ✅ Have (Unit 4) |
| 她 | tā | she, her | ✅ Have (Unit 4) |
| 他们 | tāmen | they (male/mixed) | ❌ Add |
| 她们 | tāmen | they (female) | ❌ Add |

#### Demonstrative Pronouns (pronoun_demonstrative) - 4 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 这 | zhè | this | ✅ Have (Unit 1) |
| 这儿 | zhèr | here | ❌ Add |
| 那 | nà | that | ❌ Add |
| 那儿 | nàr | there | ❌ Add |

#### Interrogative Pronouns (pronoun_interrogative) - 9 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 哪 | nǎ | which | ✅ Have (Unit 8) |
| 哪儿 | nǎr | where | ❌ Add |
| 谁 | shuí | who | ❌ Add |
| 什么 | shénme | what | ❌ Add |
| 多少 | duōshǎo | how many, how much | ❌ Add |
| 几 | jǐ | how many (small numbers) | ❌ Add |
| 怎么 | zěnme | how | ❌ Add |
| 怎么样 | zěnmeyàng | how about | ❌ Add |

#### Numbers (number) - 11 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 一 | yī | one | ❌ Add |
| 二 | èr | two | ❌ Add |
| 三 | sān | three | ❌ Add |
| 四 | sì | four | ✅ Have (Unit 9) |
| 五 | wǔ | five | ❌ Add |
| 六 | liù | six | ❌ Add |
| 七 | qī | seven | ❌ Add |
| 八 | bā | eight | ❌ Add |
| 九 | jiǔ | nine | ❌ Add |
| 十 | shí | ten | ❌ Add |
| 零 | líng | zero | ✅ Have (Unit 6) |

#### Quantifiers (quantifier) - 5 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 个 | gè | general measure word | ❌ Add |
| 岁 | suì | years old | ❌ Add |
| 本 | běn | measure for books | ✅ Have (Unit 2) |
| 些 | xiē | some | ❌ Add |
| 块 | kuài | piece / yuan | ❌ Add |

#### Adverbs (adverb) - 5 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 不 | bù | not | ✅ Have (Unit 3) |
| 没 | méi | not (have) | ❌ Add |
| 很 | hěn | very | ❌ Add |
| 太 | tài | too | ❌ Add |
| 都 | dōu | all | ❌ Add |

#### Conjunction (conjunction) - 1 word

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 和 | hé | and | ✅ Have (Unit 1) |

#### Preposition (preposition) - 1 word

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 在 | zài | at, in, on | ✅ Have (Unit 8) |

#### Auxiliary Particles (auxiliary) - 4 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 的 | de | possessive particle | ✅ Have (Unit 9) |
| 了 | le | completed action | ❌ Add |
| 吗 | ma | question particle | ✅ Have (Unit 9) |
| 呢 | ne | question particle | ✅ Have (Unit 2) |

#### Interjection (interjection) - 1 word

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 喂 | wèi | hello (phone) | ❌ Add |

#### Nouns (noun) - ~50 words

**Places:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 家 | jiā | home | ❌ Add |
| 学校 | xuéxiào | school | 🔄 Add compound (have 学) |
| 饭店 | fàndiàn | restaurant | 🔄 Add compound (have 饭 + 店) |
| 商店 | shāngdiàn | store | 🔄 Add compound (have 店) |
| 医院 | yīyuàn | hospital | 🔄 Add compound (have 医) |
| 火车站 | huǒchēzhàn | train station | 🔄 Add compound (have 火 + 车 + 站) |
| 中国 | zhōngguó | China | 🔄 Add compound (have 中 + 国) |
| 北京 | běijīng | Beijing | ❌ Add |

**Directions:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 上 | shàng | up, on | ❌ Add |
| 下 | xià | down, under | ❌ Add |
| 前面 | qiánmiàn | front | ❌ Add |
| 后面 | hòumiàn | behind | ❌ Add |
| 里 | lǐ | inside | ✅ Have (Unit 8) |

**Time:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 今天 | jīntiān | today | 🔄 Add compound (have 今 + 天) |
| 明天 | míngtiān | tomorrow | 🔄 Add compound (have 明 + 天) |
| 昨天 | zuótiān | yesterday | ❌ Add |
| 上午 | shàngwǔ | morning | ❌ Add |
| 中午 | zhōngwǔ | noon | ❌ Add |
| 下午 | xiàwǔ | afternoon | ❌ Add |
| 年 | nián | year | ❌ Add |
| 月 | yuè | month | ❌ Add |
| 日 | rì | day | ✅ Have (Unit 2) |
| 星期 | xīngqī | week | ❌ Add |
| 点 | diǎn | o'clock | ❌ Add |
| 分钟 | fēnzhōng | minute | ❌ Add |
| 现在 | xiànzài | now | ❌ Add |
| 时候 | shíhou | time (moment) | ❌ Add |

**People:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 爸爸 | bàba | father | 🔄 Add compound (have 爸) |
| 妈妈 | māma | mother | 🔄 Add compound (have 妈) |
| 儿子 | érzi | son | 🔄 Add compound (have 儿 + 子) |
| 女儿 | nǚér | daughter | 🔄 Add compound (have 女) |
| 老师 | lǎoshī | teacher | 🔄 Add compound (have 老 + 师) |
| 学生 | xuéshēng | student | 🔄 Add compound (have 学 + 生) |
| 同学 | tóngxué | classmate | 🔄 Add compound (have 同 + 学) |
| 朋友 | péngyou | friend | ❌ Add |
| 医生 | yīshēng | doctor | 🔄 Add compound (have 医 + 生) |
| 先生 | xiānsheng | Mr. / sir | ❌ Add |
| 小姐 | xiǎojiě | Miss | ❌ Add |
| 人 | rén | person | ❌ Add |
| 名字 | míngzi | name | ❌ Add |

**Food & Drink:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 水 | shuǐ | water | ✅ Have (Unit 1) |
| 菜 | cài | vegetable, dish | ✅ Have (Unit 6) |
| 米饭 | mǐfàn | rice (cooked) | 🔄 Add compound (have 米 + 饭) |
| 水果 | shuǐguǒ | fruit | ❌ Add |
| 苹果 | píngguǒ | apple | ❌ Add |
| 茶 | chá | tea | ✅ Have (Unit 1) |
| 杯子 | bēizi | cup | 🔄 Add compound (have 杯 + 子) |

**Objects:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 钱 | qián | money | ✅ Have (Unit 8) |
| 飞机 | fēijī | airplane | 🔄 Add compound (have 机) |
| 出租车 | chūzūchē | taxi | 🔄 Add compound (have 车) |
| 电视 | diànshì | television | ❌ Add |
| 电脑 | diànnǎo | computer | ❌ Add |
| 电影 | diànyǐng | movie | ❌ Add |
| 天气 | tiānqì | weather | 🔄 Add compound (have 天 + 气) |
| 猫 | māo | cat | ❌ Add |
| 狗 | gǒu | dog | ❌ Add |
| 东西 | dōngxi | thing | ❌ Add |
| 书 | shū | book | ✅ Have (Unit 6) |
| 汉语 | hànyǔ | Chinese (language) | ❌ Add |
| 字 | zì | character | ❌ Add |
| 桌子 | zhuōzi | table | ❌ Add |
| 椅子 | yǐzi | chair | ❌ Add |
| 衣服 | yīfu | clothes | ❌ Add |

#### Verbs (verb) - ~35 words

**Greetings & Politeness:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 谢谢 | xièxie | thank you | 🔄 Add compound (have 谢) |
| 不客气 | búkèqì | you're welcome | 🔄 Add compound (have 不 + 客 + 气) |
| 再见 | zàijiàn | goodbye | ❌ Add |
| 请 | qǐng | please | ❌ Add |
| 对不起 | duìbùqǐ | sorry | 🔄 Add compound (have 对 + 不) |
| 没关系 | méiguānxì | it's okay | ❌ Add |

**Common Verbs:**
| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 是 | shì | to be | ✅ Have (Unit 1) |
| 有 | yǒu | to have | ✅ Have (Unit 9) |
| 看 | kàn | to look | ✅ Have (Unit 6) |
| 听 | tīng | to listen | ❌ Add |
| 说话 | shuōhuà | to speak | 🔄 Add compound (have 说) |
| 读 | dú | to read | ❌ Add |
| 写 | xiě | to write | ❌ Add |
| 看见 | kànjiàn | to see | 🔄 Add compound (have 看) |
| 叫 | jiào | to call / be called | ❌ Add |
| 来 | lái | to come | ❌ Add |
| 回 | huí | to return | ❌ Add |
| 去 | qù | to go | ✅ Have (Unit 6) |
| 吃 | chī | to eat | ✅ Have (Unit 6) |
| 喝 | hē | to drink | ❌ Add |
| 睡觉 | shuìjiào | to sleep | ❌ Add |
| 打电话 | dǎdiànhuà | to make a call | ❌ Add |
| 做 | zuò | to do | ❌ Add |
| 买 | mǎi | to buy | ✅ Have (Unit 6) |
| 开 | kāi | to open / drive | ❌ Add |
| 坐 | zuò | to sit | ❌ Add |
| 住 | zhù | to live | ❌ Add |
| 学习 | xuéxí | to study | 🔄 Add compound (have 学) |
| 工作 | gōngzuò | to work | ❌ Add |
| 下雨 | xiàyǔ | to rain | ❌ Add |
| 爱 | ài | to love | ❌ Add |
| 喜欢 | xǐhuān | to like | 🔄 Add compound (have 喜 + 欢) |
| 想 | xiǎng | to want / think | ❌ Add |
| 认识 | rènshi | to know (person) | ❌ Add |
| 会 | huì | can (learned skill) | ❌ Add |
| 能 | néng | can (ability) | ❌ Add |

#### Adjectives (adjective) - 9 words

| Hanzi | Pinyin | English | Status |
|-------|--------|---------|--------|
| 好 | hǎo | good | ✅ Have (Unit 9) |
| 大 | dà | big | ✅ Have (Unit 4) |
| 小 | xiǎo | small | ❌ Add |
| 多 | duō | many | ❌ Add |
| 少 | shǎo | few | ❌ Add |
| 冷 | lěng | cold | ❌ Add |
| 热 | rè | hot | ✅ Have (Unit 1) |
| 高兴 | gāoxìng | happy | ❌ Add |
| 漂亮 | piàoliàng | beautiful | ❌ Add |

---

### Compound Words to Add (have components)

These are HSK 1 vocabulary items where we already have the individual characters but need to add the compound word:

| Compound | Components | Type |
|----------|------------|------|
| 咖啡 | 咖 + 啡 | noun |
| 豆腐 | 豆 + 腐 | noun (not HSK1, keep for Duolingo) |
| 米饭 | 米 + 饭 | noun |
| 中国 | 中 + 国 | noun |
| 老师 | 老 + 师 | noun |
| 学生 | 学 + 生 | noun |
| 医生 | 医 + 生 | noun |
| 同学 | 同 + 学 | noun |
| 今天 | 今 + 天 | noun |
| 明天 | 明 + 天 | noun |
| 天气 | 天 + 气 | noun |
| 喜欢 | 喜 + 欢 | verb |
| 儿子 | 儿 + 子 | noun |
| 杯子 | 杯 + 子 | noun |
| 爸爸 | 爸 + 爸 | noun |
| 妈妈 | 妈 + 妈 | noun |
| 谢谢 | 谢 + 谢 | verb |
| 不客气 | 不 + 客 + 气 | phrase |
| 对不起 | 对 + 不 + 起 | phrase |
| 火车站 | 火 + 车 + 站 | noun |

---

### Non-HSK Words to Keep (Duolingo extras)

These are NOT in HSK 1 but valuable to keep (tag with `hsk_level = NULL`):

| Hanzi | Pinyin | English | Notes |
|-------|--------|---------|-------|
| 汤 | tāng | soup | Useful food vocab |
| 粥 | zhōu | porridge/congee | Useful food vocab |
| 豆腐 | dòufu | tofu | Common food |
| 韩 | hán | Korea | Geography |
| 美国 | měiguó | America | Geography |
| 英文 | yīngwén | English | Language |
| 律师 | lǜshī | lawyer | Profession |
| 音乐 | yīnyuè | music | Common topic |
| 超市 | chāoshì | supermarket | Useful place |
| 书店 | shūdiàn | bookstore | Useful place |
| 零食 | língshí | snacks | Food vocab |
| 牛奶 | niúnǎi | milk | Food vocab |
| 绿茶 | lǜchá | green tea | Food vocab |
| 冰 | bīng | ice | Useful |
| 外公 | wàigōng | grandfather (maternal) | Family |
| 外婆 | wàipó | grandmother (maternal) | Family |
| 加拿大 | jiānádà | Canada | Geography |

---

## Sentences for HSK 1

### Sentence Categories

1. **Greetings & Introductions** (~15)
2. **Questions** (~25)
3. **Statements** (~30)
4. **Negatives** (~15)
5. **Time Expressions** (~15)
6. **Location** (~10)
7. **Requests & Offers** (~10)

### Complete Sentence List (120 sentences)

#### Greetings & Introductions

| Chinese | Pinyin | English |
|---------|--------|---------|
| 你好 | nǐ hǎo | Hello |
| 你好吗？ | nǐ hǎo ma? | How are you? |
| 我很好 | wǒ hěn hǎo | I'm very good |
| 谢谢 | xièxie | Thank you |
| 不客气 | búkèqì | You're welcome |
| 对不起 | duìbùqǐ | Sorry |
| 没关系 | méiguānxì | It's okay |
| 再见 | zàijiàn | Goodbye |
| 我叫... | wǒ jiào... | My name is... |
| 你叫什么名字？ | nǐ jiào shénme míngzi? | What's your name? |
| 认识你很高兴 | rènshi nǐ hěn gāoxìng | Nice to meet you |
| 我是学生 | wǒ shì xuéshēng | I am a student |
| 我是老师 | wǒ shì lǎoshī | I am a teacher |
| 我是中国人 | wǒ shì zhōngguórén | I am Chinese |
| 你是哪国人？ | nǐ shì nǎ guó rén? | What nationality are you? |

#### Questions - Who/What/Where/When/How

| Chinese | Pinyin | English |
|---------|--------|---------|
| 这是什么？ | zhè shì shénme? | What is this? |
| 那是谁？ | nà shì shuí? | Who is that? |
| 你去哪儿？ | nǐ qù nǎr? | Where are you going? |
| 你在哪儿？ | nǐ zài nǎr? | Where are you? |
| 现在几点？ | xiànzài jǐ diǎn? | What time is it? |
| 今天几号？ | jīntiān jǐ hào? | What's today's date? |
| 今天星期几？ | jīntiān xīngqī jǐ? | What day is it? |
| 你几岁？ | nǐ jǐ suì? | How old are you? |
| 这个多少钱？ | zhège duōshǎo qián? | How much is this? |
| 你怎么了？ | nǐ zěnme le? | What's wrong? |
| 天气怎么样？ | tiānqì zěnmeyàng? | How's the weather? |
| 你喜欢什么？ | nǐ xǐhuān shénme? | What do you like? |
| 你想吃什么？ | nǐ xiǎng chī shénme? | What do you want to eat? |
| 你想喝什么？ | nǐ xiǎng hē shénme? | What do you want to drink? |
| 你会说汉语吗？ | nǐ huì shuō hànyǔ ma? | Can you speak Chinese? |
| 你有时间吗？ | nǐ yǒu shíjiān ma? | Do you have time? |
| 你有猫吗？ | nǐ yǒu māo ma? | Do you have a cat? |
| 你有狗吗？ | nǐ yǒu gǒu ma? | Do you have a dog? |
| 你住在哪儿？ | nǐ zhù zài nǎr? | Where do you live? |
| 火车站在哪儿？ | huǒchēzhàn zài nǎr? | Where is the train station? |
| 医院在哪儿？ | yīyuàn zài nǎr? | Where is the hospital? |
| 你爸爸做什么工作？ | nǐ bàba zuò shénme gōngzuò? | What does your father do? |
| 你什么时候来？ | nǐ shénme shíhou lái? | When will you come? |
| 你想买什么？ | nǐ xiǎng mǎi shénme? | What do you want to buy? |
| 你看什么书？ | nǐ kàn shénme shū? | What book are you reading? |

#### Statements - Daily Life

| Chinese | Pinyin | English |
|---------|--------|---------|
| 我喜欢吃米饭 | wǒ xǐhuān chī mǐfàn | I like eating rice |
| 我喜欢喝茶 | wǒ xǐhuān hē chá | I like drinking tea |
| 我喜欢看电影 | wǒ xǐhuān kàn diànyǐng | I like watching movies |
| 我喜欢看书 | wǒ xǐhuān kàn shū | I like reading books |
| 我想喝水 | wǒ xiǎng hē shuǐ | I want to drink water |
| 我想吃苹果 | wǒ xiǎng chī píngguǒ | I want to eat an apple |
| 我要买东西 | wǒ yào mǎi dōngxi | I want to buy things |
| 他是我的朋友 | tā shì wǒ de péngyou | He is my friend |
| 她是我的老师 | tā shì wǒ de lǎoshī | She is my teacher |
| 这是我的书 | zhè shì wǒ de shū | This is my book |
| 那是他的电脑 | nà shì tā de diànnǎo | That is his computer |
| 我有一个猫 | wǒ yǒu yí gè māo | I have a cat |
| 我有两个朋友 | wǒ yǒu liǎng gè péngyou | I have two friends |
| 我在学习汉语 | wǒ zài xuéxí hànyǔ | I am studying Chinese |
| 他在看电视 | tā zài kàn diànshì | He is watching TV |
| 她在打电话 | tā zài dǎ diànhuà | She is making a phone call |
| 我们去饭店 | wǒmen qù fàndiàn | We're going to a restaurant |
| 他们去学校 | tāmen qù xuéxiào | They're going to school |
| 我住在北京 | wǒ zhù zài běijīng | I live in Beijing |
| 我在家 | wǒ zài jiā | I'm at home |
| 我工作 | wǒ gōngzuò | I work |
| 我很高兴 | wǒ hěn gāoxìng | I am very happy |
| 今天很热 | jīntiān hěn rè | Today is very hot |
| 今天很冷 | jīntiān hěn lěng | Today is very cold |
| 这个很大 | zhège hěn dà | This is very big |
| 那个很小 | nàge hěn xiǎo | That is very small |
| 她很漂亮 | tā hěn piàoliang | She is very beautiful |
| 中国很大 | zhōngguó hěn dà | China is very big |
| 苹果很好吃 | píngguǒ hěn hǎochī | Apples are delicious |
| 我爱我的家 | wǒ ài wǒ de jiā | I love my home |

#### Negatives

| Chinese | Pinyin | English |
|---------|--------|---------|
| 我不是学生 | wǒ bú shì xuéshēng | I am not a student |
| 我不喜欢 | wǒ bù xǐhuān | I don't like it |
| 我不想去 | wǒ bù xiǎng qù | I don't want to go |
| 我不会说汉语 | wǒ bú huì shuō hànyǔ | I can't speak Chinese |
| 他不在家 | tā bú zài jiā | He is not at home |
| 我没有钱 | wǒ méiyǒu qián | I don't have money |
| 我没有时间 | wǒ méiyǒu shíjiān | I don't have time |
| 我没有猫 | wǒ méiyǒu māo | I don't have a cat |
| 他没有来 | tā méiyǒu lái | He didn't come |
| 我今天没去学校 | wǒ jīntiān méi qù xuéxiào | I didn't go to school today |
| 这不是我的 | zhè bú shì wǒ de | This is not mine |
| 我不太好 | wǒ bú tài hǎo | I'm not very well |
| 不好意思 | bù hǎoyìsi | Excuse me / Sorry |
| 我不认识他 | wǒ bú rènshi tā | I don't know him |
| 我不能去 | wǒ bù néng qù | I can't go |

#### Time Expressions

| Chinese | Pinyin | English |
|---------|--------|---------|
| 现在三点 | xiànzài sān diǎn | It's 3 o'clock now |
| 今天是星期一 | jīntiān shì xīngqīyī | Today is Monday |
| 明天见 | míngtiān jiàn | See you tomorrow |
| 昨天我去了商店 | zuótiān wǒ qù le shāngdiàn | Yesterday I went to the store |
| 我上午学习 | wǒ shàngwǔ xuéxí | I study in the morning |
| 我下午工作 | wǒ xiàwǔ gōngzuò | I work in the afternoon |
| 我中午吃饭 | wǒ zhōngwǔ chīfàn | I eat lunch at noon |
| 我七点起床 | wǒ qī diǎn qǐchuáng | I get up at 7 o'clock |
| 我十点睡觉 | wǒ shí diǎn shuìjiào | I sleep at 10 o'clock |
| 今天是几月几号？ | jīntiān shì jǐ yuè jǐ hào? | What's today's date? |
| 我二十岁 | wǒ èrshí suì | I am 20 years old |
| 现在是下午五点 | xiànzài shì xiàwǔ wǔ diǎn | It's 5 PM now |
| 等一下 | děng yíxià | Wait a moment |
| 我每天都学习 | wǒ měitiān dōu xuéxí | I study every day |
| 什么时候？ | shénme shíhou? | When? |

#### Location

| Chinese | Pinyin | English |
|---------|--------|---------|
| 学校在前面 | xuéxiào zài qiánmiàn | The school is in front |
| 医院在后面 | yīyuàn zài hòumiàn | The hospital is behind |
| 书在桌子上 | shū zài zhuōzi shàng | The book is on the table |
| 猫在椅子下 | māo zài yǐzi xià | The cat is under the chair |
| 他在里面 | tā zài lǐmiàn | He is inside |
| 商店在这儿 | shāngdiàn zài zhèr | The store is here |
| 饭店在那儿 | fàndiàn zài nàr | The restaurant is there |
| 请坐 | qǐng zuò | Please sit |
| 请进 | qǐng jìn | Please come in |
| 我去学校 | wǒ qù xuéxiào | I'm going to school |

#### Requests & Offers

| Chinese | Pinyin | English |
|---------|--------|---------|
| 请喝茶 | qǐng hē chá | Please have some tea |
| 请吃 | qǐng chī | Please eat |
| 我能帮你吗？ | wǒ néng bāng nǐ ma? | Can I help you? |
| 请问... | qǐngwèn... | May I ask... |
| 你能说慢一点吗？ | nǐ néng shuō màn yìdiǎn ma? | Can you speak slower? |
| 请再说一遍 | qǐng zài shuō yí biàn | Please say it again |
| 我想要这个 | wǒ xiǎng yào zhège | I want this one |
| 给我一杯水 | gěi wǒ yì bēi shuǐ | Give me a glass of water |
| 我们一起去吧 | wǒmen yìqǐ qù ba | Let's go together |
| 好的 | hǎo de | Okay |

---

## Database Schema Changes

### Words Table Updates

```sql
-- Add new columns
ALTER TABLE words ADD COLUMN IF NOT EXISTS char_count INTEGER DEFAULT 1;
ALTER TABLE words ADD COLUMN IF NOT EXISTS word_type TEXT;
ALTER TABLE words ADD COLUMN IF NOT EXISTS hsk_level INTEGER;

-- Add constraint for word_type
ALTER TABLE words ADD CONSTRAINT words_word_type_check CHECK (word_type IN (
  'pronoun_personal',
  'pronoun_demonstrative', 
  'pronoun_interrogative',
  'number',
  'quantifier',
  'adverb',
  'conjunction',
  'preposition',
  'auxiliary',
  'interjection',
  'noun',
  'verb',
  'adjective'
));
```

### Sentences Table (New)

```sql
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chinese TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  english TEXT NOT NULL,
  hsk_level INTEGER DEFAULT 1,
  difficulty INTEGER DEFAULT 1,
  category TEXT CHECK (category IN (
    'greeting',
    'question',
    'statement',
    'negative',
    'time',
    'location',
    'request'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sentence_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  correct_streak INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ,
  introduced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sentence_id)
);
```

### Profile Settings Updates

```sql
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS content_mode TEXT DEFAULT 'words' 
  CHECK (content_mode IN ('words', 'sentences'));
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS input_method TEXT DEFAULT 'tap'
  CHECK (input_method IN ('tap', 'type'));
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS view_by TEXT DEFAULT 'units'
  CHECK (view_by IN ('units', 'word_type'));

-- High scores for review mode (words)
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS words_session_high_score INTEGER DEFAULT 0;
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS words_lifetime_high_score INTEGER DEFAULT 0;

-- High scores for review mode (sentences)  
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS sentences_session_high_score INTEGER DEFAULT 0;
ALTER TABLE hanzi_profiles ADD COLUMN IF NOT EXISTS sentences_lifetime_high_score INTEGER DEFAULT 0;
```

---

## Task Breakdown

### Phase 1: Data Foundation (Priority: High)

| # | Task | Est. |
|---|------|------|
| 1.1 | Create migration: add columns to words table | 30m |
| 1.2 | Create migration: sentences + user_sentence_progress tables | 30m |
| 1.3 | Create migration: hanzi_profiles new columns | 30m |
| 1.4 | Create HSK 1 word seed data (150 words with word_type) | 2h |
| 1.5 | Backfill word_type for existing 109 characters | 1h |
| 1.6 | Create sentence seed data (120 sentences) | 2h |
| 1.7 | Update TypeScript types | 30m |
| **Subtotal** | | **7h** |

### Phase 2: Word Type View (Priority: High)

| # | Task | Est. |
|---|------|------|
| 2.1 | Add view_by setting to profile API | 30m |
| 2.2 | Create word type grouping query/API | 1h |
| 2.3 | Build WordTypeSelector component (like UnitSelector) | 1.5h |
| 2.4 | Add toggle in settings UI | 30m |
| 2.5 | Update word selection logic for word_type mode | 1h |
| **Subtotal** | | **4.5h** |

### Phase 3: Typing Input Mode (Priority: High)

| # | Task | Est. |
|---|------|------|
| 3.1 | Add input_method setting to profile API | 30m |
| 3.2 | Create TextInput component for hanzi input | 1h |
| 3.3 | Add typing mode to Review game | 1.5h |
| 3.4 | Add input method toggle in settings | 30m |
| 3.5 | Validation logic (exact match) | 30m |
| **Subtotal** | | **4h** |

### Phase 4: High Scores (Priority: Medium)

| # | Task | Est. |
|---|------|------|
| 4.1 | Update profile API for high score fields | 30m |
| 4.2 | Track & update high scores in Review game | 1h |
| 4.3 | Display current/session/lifetime high scores in UI | 1h |
| 4.4 | Reset session score on game start | 30m |
| **Subtotal** | | **3h** |

### Phase 5: Sentence Mode (Priority: Medium)

| # | Task | Est. |
|---|------|------|
| 5.1 | Add content_mode setting to profile API | 30m |
| 5.2 | Create sentence fetch API | 1h |
| 5.3 | Create user_sentence_progress API (CRUD) | 1h |
| 5.4 | Update Review game to support sentences | 1.5h |
| 5.5 | Update Link game to support sentences | 1.5h |
| 5.6 | Add content mode toggle in settings | 30m |
| 5.7 | Sentence progress tracking | 1h |
| **Subtotal** | | **7h** |

### Phase 6: Testing & Polish (Priority: Medium)

| # | Task | Est. |
|---|------|------|
| 6.1 | Test all game modes with new content | 1h |
| 6.2 | Test typing mode on mobile (iOS/Android) | 1h |
| 6.3 | Test high score persistence | 30m |
| 6.4 | UI polish and edge cases | 1h |
| **Subtotal** | | **3.5h** |

---

## Total Estimate

| Phase | Hours |
|-------|-------|
| 1. Data Foundation | 7h |
| 2. Word Type View | 4.5h |
| 3. Typing Input Mode | 4h |
| 4. High Scores | 3h |
| 5. Sentence Mode | 7h |
| 6. Testing & Polish | 3.5h |
| **TOTAL** | **29h** |

---

## Implementation Order (Recommended)

1. **Phase 1** - Data foundation (must be first)
2. **Phase 4** - High scores (small, standalone)
3. **Phase 3** - Typing mode (core pinyin keyboard training)
4. **Phase 2** - Word type view (reorganization)
5. **Phase 5** - Sentence mode (builds on all above)
6. **Phase 6** - Testing

This order prioritizes:
- Getting HSK 1 data in place first
- Quick win with high scores
- Core pinyin keyboard training (your main goal)
- Then organizational and sentence features

---

## Acceptance Criteria

### F1: Word Type View
- [ ] Settings toggle: "View by: Units | Word Type"
- [ ] Word type selector shows all 13 categories
- [ ] Progress displayed per word type
- [ ] Games use selected word type as filter

### F2: HSK 1 Vocabulary  
- [ ] 150 HSK 1 words in database with hsk_level=1
- [ ] All words have word_type assigned
- [ ] Compound words added (咖啡, 老师, etc.)
- [ ] Existing Duolingo words preserved without hsk_level

### F3: Typing Mode
- [ ] Settings toggle: "Input method: Tap | Type"
- [ ] Review mode shows text field when typing enabled
- [ ] Pinyin keyboard input produces correct hanzi
- [ ] Exact character match validation
- [ ] Works on iOS, Android, and desktop

### F4: High Scores
- [ ] Current streak shown during game
- [ ] Session high score tracked
- [ ] Lifetime high score persisted to database
- [ ] Separate tracking for words vs sentences

### F5: Sentence Mode
- [ ] Settings toggle: "Content: Words | Sentences"
- [ ] 120 HSK 1 sentences seeded
- [ ] Review mode works with sentences
- [ ] Link mode works with sentences
- [ ] Separate progress tracking for sentences