import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countries = [
  "Saudi Arabia",
  "Afghanistan",
  "Pakistan",
  "Bhutan",
  "East Timor",
  "The Philippines",
  "The Republic of Korea",
  "Cambodia",
  "Laos",
  "Maldives",
  "Malaysia",
  "Mongolia",
  "Bangladesh",
  "Myanmar",
  "Nepal",
  "Japan",
  "Sri Lanka",
  "Thailand",
  "Brunei",
  "Snafuora",
  "India",
  "Indonesia",
  "Vietnam",
  "Algeria",
  "United Arab Emirates",
  "Oman",
  "Egypt",
  "Palestine",
  "the two seas",
  "Qatar",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Mauritania",
  "Morocco",
  "Sudan",
  "Tunisia",
  "T\u00fcrkiye",
  "Syria",
  "Yemen",
  "Iraq",
  "Iran",
  "Israel",
  "Jordan",
  "Australia",
  "Papua New Guinea",
  "Fiji",
  "Kiribati",
  "Canada",
  "Cook Islands",
  "United State",
  "Micronesia",
  "Samoa",
  "Tonga",
  "Vanuatu",
  "New Zealand",
  "Cyprus",
  "Albania",
  "Estonia",
  "Bulgaria",
  "Poland",
  "Bosnia and Herzegovina",
  "Cech",
  "Croatia",
  "Latvia",
  "Lithuania",
  "Romania",
  "Macedonia",
  "Serbia and Montenegro",
  "Slovakia",
  "Slovenia",
  "Hungary",
  "Iranda",
  "Andorra",
  "Austria",
  "Belgium",
  "Iceland",
  "Denmark",
  "Germany",
  "France",
  "Finland",
  "Holland",
  "Luxembourg",
  "Liechtenstein",
  "Malta",
  "Monaco",
  "Norway",
  "Portugal",
  "Sweden",
  "Switzerland",
  "Spain",
  "Greece",
  "Italy",
  "Ethiopia",
  "Angola",
  "Benin",
  "Botswana",
  "Burundi",
  "Equatorial Guinea",
  "Togo",
  "Eritrea",
  "Green Head",
  "Gambia",
  "Republic of the Congo",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Guinea",
  "Bissau - Guinea",
  "Ghana",
  "Gabon",
  "Zimbabwe",
  "Cameroon",
  "the moon",
  "C\u00f4te d'Ivoire",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Rwanda",
  "Madagascar",
  "Financial",
  "Mauritius",
  "Mozambique",
  "Namibia",
  "South Africa",
  "Niger",
  "Nigeria",
  "Sierra Leone",
  "Senegal",
  "Seychelles",
  "Somalia",
  "Tanzania",
  "Uganda",
  "Zambia",
  "Chad",
  "Central African Republic",
];

async function main() {
  console.log("Start seeding countries of origin...");

  for (const countryName of countries) {
    const result = await prisma.countryOfOriginSale.create({
      data: {
        name: countryName,
      },
    });
    console.log(`Created country of origin with id: ${result.id}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
