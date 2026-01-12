import type { ParsedTransaction, CategorizedTransaction } from '../types'

interface CategoryRule {
  pattern: RegExp
  category: string
  subcategory?: string
  merchant?: string
  is_transfer?: boolean
  is_recurring?: boolean
}

// Priority-ordered rules - first match wins
const CATEGORY_RULES: CategoryRule[] = [
  // === INCOME ===
  { pattern: /FASTER PAYMENTS RECEIPT.*SALARY|BACS.*SALARY|PAY.*SALARY/i, category: 'salary', merchant: 'Salary' },
  { pattern: /FASTER PAYMENTS RECEIPT.*LTD|BACS.*LTD/i, category: 'salary', merchant: 'Employer' },

  // === TRANSFERS ===
  { pattern: /FASTER PAYMENTS RECEIPT.*FROM.*DARLINGTON|TFR FROM.*DARLINGTON/i, category: 'transfer', is_transfer: true },
  { pattern: /TRANSFER TO.*SANTANDER|CREDIT CARD PAYMENT/i, category: 'credit_card_payment', is_transfer: true },
  { pattern: /FASTER PAYMENTS.*TO.*DARLINGTON|TFR TO.*DARLINGTON/i, category: 'transfer', is_transfer: true },
  { pattern: /INTERNAL TRANSFER|STANDING ORDER/i, category: 'transfer', is_transfer: true },

  // === REFUNDS ===
  { pattern: /REFUND|REVERSAL|CHARGEBACK/i, category: 'refunds' },

  // === HOUSING ===
  { pattern: /RENT|LANDLORD|LETTING|PROPERTY/i, category: 'housing', subcategory: 'rent', is_recurring: true },
  { pattern: /COUNCIL TAX/i, category: 'housing', subcategory: 'council_tax', is_recurring: true },
  { pattern: /MORTGAGE/i, category: 'housing', subcategory: 'mortgage', is_recurring: true },

  // === UTILITIES ===
  { pattern: /BRITISH GAS|EDF|OCTOPUS ENERGY|BULB|OVO|E\.ON|ECOTRICITY/i, category: 'utilities', subcategory: 'energy', is_recurring: true },
  { pattern: /THAMES WATER|SOUTHERN WATER|SEVERN TRENT|UNITED UTILITIES/i, category: 'utilities', subcategory: 'water', is_recurring: true },
  { pattern: /BT GROUP|VIRGIN MEDIA|SKY|TALK TALK|PLUSNET|THREE|VODAFONE|EE|O2|GIFFGAFF/i, category: 'utilities', subcategory: 'telecom', is_recurring: true },

  // === SUBSCRIPTIONS ===
  { pattern: /NETFLIX/i, category: 'subscriptions', merchant: 'Netflix', is_recurring: true },
  { pattern: /SPOTIFY/i, category: 'subscriptions', merchant: 'Spotify', is_recurring: true },
  { pattern: /APPLE\.COM.*BILL|APPLE SERVICES/i, category: 'subscriptions', merchant: 'Apple', is_recurring: true },
  { pattern: /AMAZON PRIME|AMZN DIGITAL/i, category: 'subscriptions', merchant: 'Amazon Prime', is_recurring: true },
  { pattern: /DISNEY PLUS|DISNEYPLUS/i, category: 'subscriptions', merchant: 'Disney+', is_recurring: true },
  { pattern: /YOUTUBE PREMIUM|GOOGLE \*YOUTUBE/i, category: 'subscriptions', merchant: 'YouTube', is_recurring: true },
  { pattern: /GITHUB/i, category: 'subscriptions', merchant: 'GitHub', is_recurring: true },
  { pattern: /OPENAI|CHATGPT/i, category: 'subscriptions', merchant: 'OpenAI', is_recurring: true },
  { pattern: /NOTION/i, category: 'subscriptions', merchant: 'Notion', is_recurring: true },
  { pattern: /FIGMA/i, category: 'subscriptions', merchant: 'Figma', is_recurring: true },
  { pattern: /VERCEL/i, category: 'subscriptions', merchant: 'Vercel', is_recurring: true },
  { pattern: /ANTHROPIC/i, category: 'subscriptions', merchant: 'Anthropic', is_recurring: true },
  { pattern: /CURSOR|ANYSPHERE/i, category: 'subscriptions', merchant: 'Cursor', is_recurring: true },
  { pattern: /AUDIBLE/i, category: 'subscriptions', merchant: 'Audible', is_recurring: true },
  { pattern: /PATREON/i, category: 'subscriptions', merchant: 'Patreon', is_recurring: true },
  { pattern: /SUBSTACK/i, category: 'subscriptions', merchant: 'Substack', is_recurring: true },

  // === GAMING ===
  { pattern: /STEAM|STEAMGAMES/i, category: 'gaming', merchant: 'Steam' },
  { pattern: /PLAYSTATION|PSN/i, category: 'gaming', merchant: 'PlayStation' },
  { pattern: /XBOX|MICROSOFT.*GAME/i, category: 'gaming', merchant: 'Xbox' },
  { pattern: /NINTENDO/i, category: 'gaming', merchant: 'Nintendo' },
  { pattern: /EPIC GAMES/i, category: 'gaming', merchant: 'Epic Games' },
  { pattern: /BLIZZARD|BATTLE\.NET/i, category: 'gaming', merchant: 'Blizzard' },

  // === GROCERIES ===
  { pattern: /TESCO/i, category: 'groceries', merchant: 'Tesco' },
  { pattern: /SAINSBURY/i, category: 'groceries', merchant: 'Sainsbury\'s' },
  { pattern: /ASDA/i, category: 'groceries', merchant: 'Asda' },
  { pattern: /MORRISONS/i, category: 'groceries', merchant: 'Morrisons' },
  { pattern: /WAITROSE/i, category: 'groceries', merchant: 'Waitrose' },
  { pattern: /ALDI/i, category: 'groceries', merchant: 'Aldi' },
  { pattern: /LIDL/i, category: 'groceries', merchant: 'Lidl' },
  { pattern: /CO-OP|COOP\s/i, category: 'groceries', merchant: 'Co-op' },
  { pattern: /M&S FOOD|MARKS.*SPENCER.*FOOD/i, category: 'groceries', merchant: 'M&S Food' },
  { pattern: /ICELAND\s/i, category: 'groceries', merchant: 'Iceland' },
  { pattern: /WHOLE FOODS/i, category: 'groceries', merchant: 'Whole Foods' },
  { pattern: /OCADO/i, category: 'groceries', merchant: 'Ocado' },

  // === FOOD & DRINK ===
  { pattern: /DELIVEROO/i, category: 'food_drink', subcategory: 'delivery', merchant: 'Deliveroo' },
  { pattern: /UBER EATS|UBEREATS/i, category: 'food_drink', subcategory: 'delivery', merchant: 'Uber Eats' },
  { pattern: /JUST EAT|JUSTEAT/i, category: 'food_drink', subcategory: 'delivery', merchant: 'Just Eat' },
  { pattern: /MCDONALDS|MCDONALD'S/i, category: 'food_drink', subcategory: 'fast_food', merchant: 'McDonald\'s' },
  { pattern: /BURGER KING/i, category: 'food_drink', subcategory: 'fast_food', merchant: 'Burger King' },
  { pattern: /KFC/i, category: 'food_drink', subcategory: 'fast_food', merchant: 'KFC' },
  { pattern: /SUBWAY/i, category: 'food_drink', subcategory: 'fast_food', merchant: 'Subway' },
  { pattern: /NANDO'?S/i, category: 'food_drink', subcategory: 'restaurant', merchant: 'Nando\'s' },
  { pattern: /PRET A MANGER|PRET\s/i, category: 'food_drink', subcategory: 'cafe', merchant: 'Pret' },
  { pattern: /COSTA COFFEE|COSTA\s/i, category: 'food_drink', subcategory: 'cafe', merchant: 'Costa' },
  { pattern: /STARBUCKS/i, category: 'food_drink', subcategory: 'cafe', merchant: 'Starbucks' },
  { pattern: /CAFFE NERO|NERO\s/i, category: 'food_drink', subcategory: 'cafe', merchant: 'Caffe Nero' },
  { pattern: /GREGGS/i, category: 'food_drink', subcategory: 'bakery', merchant: 'Greggs' },
  { pattern: /WETHERSPOON|SPOONS/i, category: 'food_drink', subcategory: 'pub', merchant: 'Wetherspoons' },
  { pattern: /DOMINO'?S PIZZA/i, category: 'food_drink', subcategory: 'delivery', merchant: 'Domino\'s' },
  { pattern: /PIZZA HUT/i, category: 'food_drink', subcategory: 'restaurant', merchant: 'Pizza Hut' },
  { pattern: /WAGAMAMA/i, category: 'food_drink', subcategory: 'restaurant', merchant: 'Wagamama' },
  { pattern: /ITSU/i, category: 'food_drink', subcategory: 'fast_food', merchant: 'Itsu' },
  { pattern: /LEON\s|LEON RESTAURANT/i, category: 'food_drink', subcategory: 'fast_food', merchant: 'Leon' },

  // === TRANSPORT ===
  { pattern: /TFL\.GOV|TRANSPORT FOR LONDON|OYSTER/i, category: 'transport', subcategory: 'public', merchant: 'TfL' },
  { pattern: /UBER TRIP|UBER\s*\*TRIP|UBER\s*BV/i, category: 'transport', subcategory: 'taxi', merchant: 'Uber' },
  { pattern: /BOLT\.EU|BOLT APP/i, category: 'transport', subcategory: 'taxi', merchant: 'Bolt' },
  { pattern: /ADDISON LEE/i, category: 'transport', subcategory: 'taxi', merchant: 'Addison Lee' },
  { pattern: /TRAINLINE|LNER|GWR|AVANTI|SOUTHEASTERN|SOUTHERN RAILWAY|NORTHERN RAIL/i, category: 'transport', subcategory: 'train', merchant: 'Train' },
  { pattern: /NATIONAL EXPRESS|MEGABUS/i, category: 'transport', subcategory: 'coach', merchant: 'Coach' },
  { pattern: /SHELL|BP\s|ESSO|TEXACO/i, category: 'transport', subcategory: 'fuel' },
  { pattern: /PARKING|NCP|APCOA|RINGGO/i, category: 'transport', subcategory: 'parking' },
  { pattern: /GRAB\s|GRAB HOLDINGS/i, category: 'transport', subcategory: 'taxi', merchant: 'Grab' },

  // === TRAVEL (International) ===
  { pattern: /AIRBNB/i, category: 'accommodation', merchant: 'Airbnb' },
  { pattern: /BOOKING\.COM|BOOKING HOLDINGS/i, category: 'accommodation', merchant: 'Booking.com' },
  { pattern: /HOTELS\.COM/i, category: 'accommodation', merchant: 'Hotels.com' },
  { pattern: /EXPEDIA/i, category: 'accommodation', merchant: 'Expedia' },
  { pattern: /HOSTELWORLD/i, category: 'accommodation', merchant: 'Hostelworld' },
  { pattern: /BRITISH AIRWAYS|EASYJET|RYANAIR|JET2|WIZZ AIR|VUELING/i, category: 'travel', subcategory: 'flights' },
  { pattern: /SKYSCANNER|KIWI\.COM/i, category: 'travel', subcategory: 'flights' },
  { pattern: /ATM.*WITHDRAWAL|CASH MACHINE/i, category: 'travel_cash' },
  { pattern: /WISE\.COM|TRANSFERWISE/i, category: 'transfer', merchant: 'Wise', is_transfer: true },
  { pattern: /REVOLUT/i, category: 'transfer', merchant: 'Revolut', is_transfer: true },

  // === SHOPPING ===
  { pattern: /AMAZON\.CO|AMZN\.CO|AMZ\*|AMAZON EU/i, category: 'shopping', merchant: 'Amazon' },
  { pattern: /EBAY/i, category: 'shopping', merchant: 'eBay' },
  { pattern: /ARGOS/i, category: 'shopping', merchant: 'Argos' },
  { pattern: /JOHN LEWIS/i, category: 'shopping', merchant: 'John Lewis' },
  { pattern: /CURRYS|PC WORLD/i, category: 'shopping', merchant: 'Currys' },
  { pattern: /APPLE STORE|APPLE\.COM\/UK/i, category: 'shopping', merchant: 'Apple' },
  { pattern: /BOOTS\s/i, category: 'shopping', subcategory: 'pharmacy', merchant: 'Boots' },
  { pattern: /SUPERDRUG/i, category: 'shopping', subcategory: 'pharmacy', merchant: 'Superdrug' },
  { pattern: /PRIMARK/i, category: 'shopping', subcategory: 'clothing', merchant: 'Primark' },
  { pattern: /H&M\s|H AND M/i, category: 'shopping', subcategory: 'clothing', merchant: 'H&M' },
  { pattern: /ZARA\s/i, category: 'shopping', subcategory: 'clothing', merchant: 'Zara' },
  { pattern: /UNIQLO/i, category: 'shopping', subcategory: 'clothing', merchant: 'Uniqlo' },
  { pattern: /IKEA/i, category: 'shopping', subcategory: 'home', merchant: 'IKEA' },
  { pattern: /B&Q|SCREWFIX|TOOLSTATION/i, category: 'shopping', subcategory: 'diy' },
  { pattern: /WATERSTONES|WHSmith/i, category: 'shopping', subcategory: 'books' },
  { pattern: /ETSY/i, category: 'shopping', merchant: 'Etsy' },
  { pattern: /ASOS/i, category: 'shopping', subcategory: 'clothing', merchant: 'ASOS' },

  // === ENTERTAINMENT ===
  { pattern: /ODEON|CINEWORLD|VUE CINEMA|PICTUREHOUSE/i, category: 'entertainment', subcategory: 'cinema' },
  { pattern: /TICKETMASTER|EVENTBRITE|DICE\.FM/i, category: 'entertainment', subcategory: 'events' },
  { pattern: /THEATRE|NATIONAL THEATRE/i, category: 'entertainment', subcategory: 'theatre' },

  // === FITNESS ===
  { pattern: /PUREGYM|PURE GYM/i, category: 'fitness', merchant: 'PureGym', is_recurring: true },
  { pattern: /THE GYM|THEGYM/i, category: 'fitness', merchant: 'The Gym', is_recurring: true },
  { pattern: /DAVID LLOYD/i, category: 'fitness', merchant: 'David Lloyd', is_recurring: true },
  { pattern: /VIRGIN ACTIVE/i, category: 'fitness', merchant: 'Virgin Active', is_recurring: true },
  { pattern: /NUFFIELD/i, category: 'fitness', merchant: 'Nuffield', is_recurring: true },
  { pattern: /STRAVA/i, category: 'fitness', merchant: 'Strava', is_recurring: true },
  { pattern: /PELOTON/i, category: 'fitness', merchant: 'Peloton', is_recurring: true },

  // === HEALTHCARE ===
  { pattern: /PHARMACY|CHEMIST/i, category: 'healthcare', subcategory: 'pharmacy' },
  { pattern: /NHS|DOCTOR|GP SURGERY/i, category: 'healthcare', subcategory: 'medical' },
  { pattern: /DENTIST|DENTAL/i, category: 'healthcare', subcategory: 'dental' },
  { pattern: /OPTICIAN|SPECSAVERS|VISION EXPRESS/i, category: 'healthcare', subcategory: 'optical' },
  { pattern: /BUPA/i, category: 'healthcare', subcategory: 'insurance', is_recurring: true },

  // === BANK FEES ===
  { pattern: /OVERDRAFT FEE|BANK CHARGE|INTERNATIONAL FEE|FX FEE/i, category: 'bank_fees' },
  { pattern: /CARD FEE|ANNUAL FEE|MAINTENANCE FEE/i, category: 'bank_fees' },

  // === GIFTS ===
  { pattern: /MOONPIG|FUNKYPIGEON/i, category: 'gifts', merchant: 'Cards' },
  { pattern: /INTERFLORA|BLOOM|FLOWERS/i, category: 'gifts', subcategory: 'flowers' },
]

// Generate MD5-like hash for deduplication
async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

export async function categorizeTransaction(
  transaction: ParsedTransaction
): Promise<CategorizedTransaction> {
  const description = transaction.description.toUpperCase()

  let category = 'other'
  let subcategory: string | null = null
  let merchant_name: string | null = null
  let is_transfer = false
  let is_recurring = false

  // Find matching rule
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(description)) {
      category = rule.category
      subcategory = rule.subcategory ?? null
      merchant_name = rule.merchant ?? null
      is_transfer = rule.is_transfer ?? false
      is_recurring = rule.is_recurring ?? false
      break
    }
  }

  // Generate import hash for deduplication
  const hashInput = `${transaction.transaction_date}|${transaction.description}|${transaction.amount}|${transaction.source}`
  const import_hash = await generateHash(hashInput)

  return {
    ...transaction,
    category,
    subcategory,
    merchant_name,
    is_transfer,
    is_recurring,
    import_hash,
  }
}

export async function categorizeTransactions(
  transactions: ParsedTransaction[]
): Promise<CategorizedTransaction[]> {
  return Promise.all(transactions.map(categorizeTransaction))
}

export function getCategoryList(): string[] {
  return [
    'salary',
    'gifts',
    'refunds',
    'transfer',
    'credit_card_payment',
    'housing',
    'utilities',
    'groceries',
    'healthcare',
    'food_drink',
    'transport',
    'shopping',
    'entertainment',
    'subscriptions',
    'travel',
    'accommodation',
    'travel_transport',
    'travel_food',
    'travel_activities',
    'travel_cash',
    'fitness',
    'gaming',
    'bank_fees',
    'other',
  ]
}
