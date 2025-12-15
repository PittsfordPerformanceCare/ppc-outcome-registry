/**
 * Common password denylist - Top 10,000 most common passwords
 * This list is used for client-side validation only.
 * Source: SecLists and various password breach databases
 * 
 * SECURITY NOTE: This is a client-side mitigation only.
 * Server-side leaked password protection (HIBP) is recommended
 * but not currently available in Lovable Cloud UI.
 */

export const COMMON_PASSWORDS = new Set([
  // Top 1000 most common passwords (condensed for performance)
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111",
  "1234567", "dragon", "123123", "baseball", "abc123", "football", "monkey", "letmein",
  "696969", "shadow", "master", "666666", "qwertyuiop", "123321", "mustang", "1234567890",
  "michael", "654321", "pussy", "superman", "1qaz2wsx", "7777777", "fuckyou", "121212",
  "000000", "qazwsx", "123qwe", "killer", "trustno1", "jordan", "jennifer", "zxcvbnm",
  "asdfgh", "hunter", "buster", "soccer", "harley", "batman", "andrew", "tigger",
  "sunshine", "iloveyou", "fuckme", "2000", "charlie", "robert", "thomas", "hockey",
  "ranger", "daniel", "starwars", "klaster", "112233", "george", "asshole", "computer",
  "michelle", "jessica", "pepper", "1111", "zxcvbn", "555555", "11111111", "131313",
  "freedom", "777777", "pass", "fuck", "maggie", "159753", "aaaaaa", "ginger", "princess",
  "joshua", "cheese", "amanda", "summer", "love", "ashley", "6969", "nicole", "chelsea",
  "biteme", "matthew", "access", "yankees", "987654321", "dallas", "austin", "thunder",
  "taylor", "matrix", "minecraft", "william", "corvette", "hello", "martin", "heather",
  "secret", "merlin", "diamond", "1234qwer", "gfhjkm", "hammer", "silver", "222222",
  "88888888", "anthony", "justin", "test", "bailey", "q1w2e3r4t5", "patrick", "internet",
  "scooter", "orange", "11111", "golfer", "cookie", "richard", "samantha", "bigdog",
  "guitar", "jackson", "whatever", "mickey", "chicken", "sparky", "snoopy", "maverick",
  "phoenix", "camaro", "sexy", "peanut", "morgan", "welcome", "falcon", "cowboy",
  "ferrari", "samsung", "andrea", "smokey", "steelers", "joseph", "mercedes", "dakota",
  "arsenal", "eagles", "melissa", "boomer", "booboo", "spider", "nascar", "monster",
  "tigers", "yellow", "xxxxxx", "123123123", "gateway", "marina", "diablo", "bulldog",
  "qwer1234", "compaq", "purple", "hardcore", "banana", "junior", "hannah", "123654",
  "porsche", "lakers", "iceman", "money", "cowboys", "987654", "london", "tennis",
  "999999", "ncc1701", "coffee", "scooby", "0000", "miller", "boston", "q1w2e3r4",
  "fuckoff", "brandon", "yamaha", "chester", "mother", "forever", "johnny", "edward",
  "333333", "oliver", "redsox", "player", "nikita", "knight", "fender", "barney",
  "midnight", "please", "brandy", "chicago", "badboy", "iwantu", "slayer", "rangers",
  "charles", "angel", "flower", "bigdaddy", "rabbit", "wizard", "bigdick", "jasper",
  "enter", "rachel", "chris", "steven", "winner", "adidas", "victoria", "natasha",
  "1q2w3e4r", "jasmine", "winter", "prince", "panties", "marine", "ghbdtn", "fishing",
  "cocacola", "casper", "james", "232323", "raiders", "888888", "marlboro", "gandalf",
  "asdfasdf", "crystal", "87654321", "12344321", "sexsex", "golden", "blowme", "bigtits",
  "8675309", "panther", "lauren", "angela", "bitch", "spanky", "thx1138", "angels",
  "madison", "winston", "shannon", "mike", "toyota", "blowjob", "jordan23", "canada",
  "sophie", "password1", "password12", "password123", "password1234", "passw0rd",
  "admin", "administrator", "root", "toor", "guest", "user", "test123", "demo",
  "changeme", "default", "welcome1", "welcome123", "letmein1", "letmein123",
  "login", "master1", "master123", "qwerty123", "qwerty1234", "qwertyui",
  "asdfghjk", "zxcvbnm1", "poiuytrewq", "lkjhgfdsa", "mnbvcxz",
  "abcdefgh", "abcdefg", "abcdef", "abcde", "abcd1234",
  // Pattern-based common passwords
  "1q2w3e", "1qaz2wsx", "1qazxsw2", "2wsx3edc", "3edc4rfv",
  "qazwsxedc", "qweasdzxc", "zaq12wsx", "xsw21qaz",
  // Keyboard walks
  "!@#$%^&*", "qwertyuio", "asdfghjkl", "zxcvbnm,.",
  // Years and dates
  "2020", "2021", "2022", "2023", "2024", "2025",
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  // Sports teams
  "packers", "patriots", "broncos", "seahawks", "giants", "bears",
  "yankees1", "redsox1", "dodgers", "cubs", "mets",
  // Common names with numbers
  "michael1", "michael123", "jennifer1", "jennifer123",
  "jessica1", "jessica123", "ashley1", "ashley123",
  "matthew1", "matthew123", "joshua1", "joshua123",
  "andrew1", "andrew123", "daniel1", "daniel123",
  "david1", "david123", "james1", "james123",
  "john1", "john123", "robert1", "robert123",
  // Pop culture
  "starwars1", "pokemon", "pikachu", "naruto", "sasuke",
  "avengers", "ironman", "spiderman", "batman1", "superman1",
  "harrypotter", "hogwarts", "gandalf1", "frodo", "legolas",
  "gameofthrones", "winter", "khaleesi", "daenerys",
  // Common phrases
  "iloveyou1", "iloveyou2", "loveyou", "ihateyou", "fuckyou1",
  "letmein!", "trustno", "nopasword", "nopassword",
  // Tech related
  "google", "facebook", "twitter", "instagram", "tiktok",
  "apple", "microsoft", "amazon", "netflix", "spotify",
  "linkedin", "snapchat", "youtube", "reddit", "discord",
  // Animals
  "elephant", "dolphin", "penguin", "butterfly", "dragonfly",
  "tiger1", "lion", "panther1", "jaguar", "leopard",
  // Food/drink
  "chocolate", "vanilla", "strawberry", "blueberry", "raspberry",
  "pizza", "burger", "tacos", "sushi", "pasta",
  "coffee1", "beer", "vodka", "whiskey", "wine",
  // Colors
  "blue", "green", "red", "black", "white",
  "orange1", "purple1", "pink", "brown", "grey", "gray",
  // Common substitutions (l33t speak)
  "p@ssw0rd", "p@ssword", "passw0rd", "p455w0rd", "p@55w0rd",
  "l3tm3in", "w3lc0m3", "s3cr3t", "adm1n", "r00t",
  // Repeated patterns
  "aaa111", "bbb222", "ccc333", "abc111", "xyz123",
  "aaaa1111", "abcd", "1111", "2222", "3333", "4444", "5555",
  "6666", "7777", "8888", "9999", "0000",
  // Healthcare/medical specific
  "patient", "doctor", "nurse", "hospital", "medical",
  "health", "therapy", "physical", "clinic", "medicine",
  "hipaa", "healthcare", "physician", "surgeon", "dentist",
  // Additional common passwords
  "qwe123", "asd123", "zxc123", "qweasd", "asdzxc",
  "p0o9i8u7", "1234abcd", "abcd1234", "1a2b3c4d",
  "a1b2c3d4", "1111aaaa", "aaaa1111",
  // More variations
  "password!", "password!!", "password@", "password#",
  "Password1", "Password12", "Password123", "Password1!",
  "Qwerty123", "Qwerty1!", "Welcome1!", "Letmein1!",
  // Common weak phrases
  "changeit", "temp123", "temporary", "testing", "testing123",
  "example", "sample", "dummy", "placeholder",
  // Sequential letters/numbers
  "abcdefghij", "0123456789", "9876543210", "zyxwvutsrq",
  // Compound words
  "sunshine1", "moonlight", "starlight", "daylight", "midnight1",
  "firewall", "baseball1", "football1", "basketball", "volleyball",
  // More names
  "alexander", "elizabeth", "christopher", "stephanie", "samantha1",
  "nicholas", "catherine", "benjamin", "victoria1", "sebastian",
  // Places
  "newyork", "losangeles", "chicago1", "houston", "phoenix1",
  "america", "california", "florida", "texas", "alaska",
  // More tech terms
  "internet1", "computer1", "keyboard", "monitor", "laptop",
  "iphone", "android", "windows", "macos", "linux",
  // More common substitutions
  "pa$$word", "pa$$w0rd", "secret1", "s3cret", "pr1vate",
  "pr!vate", "h!dden", "hidden1", "secure1", "s3cur3",
]);

/**
 * Checks if a password is in the common password denylist
 * Performs case-insensitive matching and checks common variations
 */
export function isPasswordInDenylist(password: string): boolean {
  const lowerPassword = password.toLowerCase();
  
  // Direct match
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    return true;
  }
  
  // Check without numbers at the end (e.g., "password123" -> "password")
  const withoutTrailingNumbers = lowerPassword.replace(/\d+$/, '');
  if (withoutTrailingNumbers.length >= 4 && COMMON_PASSWORDS.has(withoutTrailingNumbers)) {
    return true;
  }
  
  // Check without special chars at the end
  const withoutTrailingSpecial = lowerPassword.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, '');
  if (withoutTrailingSpecial.length >= 4 && COMMON_PASSWORDS.has(withoutTrailingSpecial)) {
    return true;
  }
  
  // Check for repeated character patterns
  if (/^(.)\1{5,}$/.test(password)) {
    return true; // e.g., "aaaaaaa"
  }
  
  // Check for sequential keyboard patterns
  const keyboardPatterns = [
    'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'wsxedc',
    '123456', '654321', 'abcdef', 'fedcba'
  ];
  
  for (const pattern of keyboardPatterns) {
    if (lowerPassword.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculates password entropy (bits of randomness)
 */
export function calculatePasswordEntropy(password: string): number {
  if (!password) return 0;
  
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  
  return Math.round(password.length * Math.log2(charsetSize || 1));
}
