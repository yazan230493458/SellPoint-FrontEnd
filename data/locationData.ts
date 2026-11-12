export type CountryDataType = {
  region: string;
  callingCode: string;
  cities: string[];
};

const countriesData: Record<string, CountryDataType> = {
  "Saudi Arabia": {
    region: "Arab World",
    callingCode: "+966",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Dhahran", "Taif", "Tabuk", "Abha", "Jazan", "Najran", "Hail", "Al-Baha", "Arar", "Sakaka", "Jubail", "Yanbu", "Hafar Al-Batin", "Al-Ahsa"],
  },
  "United Arab Emirates": {
    region: "Arab World",
    callingCode: "+971",
    cities: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Al Ain"],
  },
  Kuwait: {
    region: "Arab World",
    callingCode: "+965",
    cities: ["Kuwait City", "Hawalli", "Salmiya", "Farwaniya", "Jahra", "Ahmadi", "Mubarak Al-Kabeer"],
  },
  Qatar: {
    region: "Arab World",
    callingCode: "+974",
    cities: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Umm Salal", "Lusail"],
  },
  Bahrain: {
    region: "Arab World",
    callingCode: "+973",
    cities: ["Manama", "Muharraq", "Riffa", "Hamad Town", "Isa Town", "Sitra"],
  },
  Oman: {
    region: "Arab World",
    callingCode: "+968",
    cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Ibri", "Buraimi"],
  },
  Yemen: {
    region: "Arab World",
    callingCode: "+967",
    cities: ["Sanaa", "Aden", "Taiz", "Hodeidah", "Ibb", "Mukalla", "Dhamar"],
  },
  Iraq: {
    region: "Arab World",
    callingCode: "+964",
    cities: ["Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala", "Kirkuk", "Sulaymaniyah"],
  },
  Jordan: {
    region: "Arab World",
    callingCode: "+962",
    cities: ["Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba", "Jerash"],
  },
  Lebanon: {
    region: "Arab World",
    callingCode: "+961",
    cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Byblos", "Zahle", "Baalbek"],
  },
  Syria: {
    region: "Arab World",
    callingCode: "+963",
    cities: ["Damascus", "Aleppo", "Homs", "Hama", "Latakia", "Tartus", "Idlib", "Daraa"],
  },
  Palestine: {
    region: "Arab World",
    callingCode: "+970",
    cities: ["Jerusalem", "Gaza", "Ramallah", "Nablus", "Hebron", "Bethlehem", "Jenin", "Tulkarm"],
  },
  Egypt: {
    region: "Arab World",
    callingCode: "+20",
    cities: ["Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Aswan", "Luxor", "Port Said", "Suez", "Ismailia", "Banha", "Kafr El Sheikh"],
  },
  Sudan: {
    region: "Arab World",
    callingCode: "+249",
    cities: ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "El Obeid", "Wad Madani", "Nyala"],
  },
  Libya: {
    region: "Arab World",
    callingCode: "+218",
    cities: ["Tripoli", "Benghazi", "Misrata", "Sabha", "Zawiya", "Derna", "Tobruk"],
  },
  Tunisia: {
    region: "Arab World",
    callingCode: "+216",
    cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabes", "Monastir"],
  },
  Algeria: {
    region: "Arab World",
    callingCode: "+213",
    cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Setif", "Tlemcen"],
  },
  Morocco: {
    region: "Arab World",
    callingCode: "+212",
    cities: ["Casablanca", "Rabat", "Marrakesh", "Fez", "Tangier", "Agadir", "Meknes"],
  },
  Mauritania: {
    region: "Arab World",
    callingCode: "+222",
    cities: ["Nouakchott", "Nouadhibou", "Kiffa", "Rosso", "Atar", "Zouerate"],
  },
  Somalia: {
    region: "Arab World",
    callingCode: "+252",
    cities: ["Mogadishu", "Hargeisa", "Kismayo", "Bosaso", "Berbera", "Garowe"],
  },
  "United States": {
    region: "International",
    callingCode: "+1",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  },
  "United Kingdom": {
    region: "International",
    callingCode: "+44",
    cities: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol", "Sheffield", "Glasgow", "Edinburgh"],
  },
  Canada: {
    region: "International",
    callingCode: "+1",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City"],
  },
  Australia: {
    region: "International",
    callingCode: "+61",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin"],
  },
  Germany: {
    region: "International",
    callingCode: "+49",
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
  },
  France: {
    region: "International",
    callingCode: "+33",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
  },
  Italy: {
    region: "International",
    callingCode: "+39",
    cities: ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice", "Bologna", "Palermo"],
  },
  Spain: {
    region: "International",
    callingCode: "+34",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Alicante", "Valladolid"],
  },
  Netherlands: {
    region: "International",
    callingCode: "+31",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg"],
  },
  Belgium: {
    region: "International",
    callingCode: "+32",
    cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur"],
  },
  Switzerland: {
    region: "International",
    callingCode: "+41",
    cities: ["Zurich", "Geneva", "Basel", "Lausanne", "Bern", "Lucerne", "Lugano"],
  },
  Austria: {
    region: "International",
    callingCode: "+43",
    cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"],
  },
  Sweden: {
    region: "International",
    callingCode: "+46",
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro"],
  },
  Norway: {
    region: "International",
    callingCode: "+47",
    cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad"],
  },
  Denmark: {
    region: "International",
    callingCode: "+45",
    cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers"],
  },
  Finland: {
    region: "International",
    callingCode: "+358",
    cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä"],
  },
  Turkey: {
    region: "International",
    callingCode: "+90",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya"],
  },
  India: {
    region: "International",
    callingCode: "+91",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
  },
  Pakistan: {
    region: "International",
    callingCode: "+92",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Quetta"],
  },
  Bangladesh: {
    region: "International",
    callingCode: "+880",
    cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur"],
  },
  Indonesia: {
    region: "International",
    callingCode: "+62",
    cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Yogyakarta"],
  },
  Malaysia: {
    region: "International",
    callingCode: "+60",
    cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Kota Kinabalu", "Kuching", "Alor Setar"],
  },
  Singapore: {
    region: "International",
    callingCode: "+65",
    cities: ["Singapore"],
  },
  Japan: {
    region: "International",
    callingCode: "+81",
    cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka"],
  },
  "South Korea": {
    region: "International",
    callingCode: "+82",
    cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan"],
  },
  China: {
    region: "International",
    callingCode: "+86",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan", "Hangzhou"],
  },
  Brazil: {
    region: "International",
    callingCode: "+55",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Curitiba"],
  },
  Argentina: {
    region: "International",
    callingCode: "+54",
    cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata"],
  },
  Mexico: {
    region: "International",
    callingCode: "+52",
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Cancún"],
  },
  "South Africa": {
    region: "International",
    callingCode: "+27",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London"],
  },
} as const;

export type Country = keyof typeof countriesData;
export type CountryCallingCode = (typeof countriesData)[Country]["callingCode"];

export const citiesByCountry: Record<string, string[]> = Object.fromEntries(
  Object.entries(countriesData).map(([country, data]) => [
    country,
    [...data.cities],
  ]),
);

export const countryCallingCodes: Record<string, string> = Object.fromEntries(
  Object.entries(countriesData).map(([country, data]) => [
    country,
    data.callingCode,
  ]),
);

export const countryOptions = [
  {
    value: "Countries",
    items: Object.keys(countriesData),
  },
];

export default countriesData;