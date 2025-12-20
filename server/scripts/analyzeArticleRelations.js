// scripts/analyzeProvidedArticles.js
//
require('dotenv').config()
const mongoose = require('mongoose')
const { analyzeRelatedArticles } = require('../utils/articleAnalysis')

const urls = [
  '/article/66e94c6d8d0747ddd2fec1b7/Tragic-Crime-in-Thane:-Husband-Murders-Wife-After-Domestic-Dispute',
  '/article/66e94e688d0747ddd2fec8c8/',
  '/article/66e9bd3aa23685c3aafdf7e2/',
  '/article/66e9be0ba23685c3aafdf8d8/',
  '/article/66e9be84a23685c3aafdfa1e/',
  '/article/66ea9df9919e918e23eb5e17/',
  '/article/66ea9f7b919e918e23eb6295/',
  '/article/66ebf13f919e918e230bbe59/',
  '/article/66ed429f919e918e232d1c26/',
  '/article/66ee3e3c36bae91581c14efe/Tragic-Lynching-of-Diamond-Artisan-in-Surat:-Six-Arrested-Including-Minors',
  "/article/66ef046ccfc89ddf851e43fb/Irish-Man's-Controversial-'Colonisation'-Remarks-on-Indian-Family's-Home-Purchase-Ignite-Fierce-Backlash",
  '/article/66ef32cbcfc89ddf852d334b/Discovering-Sustainability:-The-Dundee-Design-Festival-Leads-the-Way-in-Eco-Friendly-Innovation',
  '/article/66ef32e0cfc89ddf852d3353/Discover-14-Must-See-Art-Exhibitions-Across-Europe-This-Autumn',
  "/article/66ef8f73cfc89ddf8532a5db/Celebrating-Excellence:-Gandhigram-Professors-Shine-on-Stanford-University's-Influential-Scientists-List-for-the-Fifth-Time",
  '/article/66ef8f8fcfc89ddf8532a60f/Experience-the-Future:-2024-World-Manufacturing-Convention-Unveils-Next-Gen-Technologies',
  '/article/66ef900dcfc89ddf8532abbb/',
  '/article/66ef9115cfc89ddf8532ac97/Arch-Manning-Takes-Center-Stage:-Continuing-the-Legendary-Manning-Legacy-in-His-First-Start',
  "/article/66efe409adfb4ed284001a6a/New-'Dead-Tree'-Emoji-Launches-Amid-Growing-Drought-Concerns",
  "/article/66efe435adfb4ed284001a89/Janhvi-Kapoor-Whips-Up-'Zero-KCal'-Pasta-to-Delight-Rohit-Saraf",
  "/article/66efe43dadfb4ed284001a8f/Transforming-Your-Child's-Room:-Essential-Tips-for-a-Perfect-Space",
  '/article/66efe4b7adfb4ed284001b0f/Former-AIADMK-Minister-R.-Vaithilingam-Caught-in-Major-Bribery-Scandal',
  "/article/66efe59eadfb4ed284001b99/India's-Golden-Opportunity:-How-to-Secure-Gold-in-the-Open-Section-at-Chess-Olympiad-2024",
  '/article/66f05508838421de1844ed01/New-Highway-to-Transform-Travel-Between-Okhla-Barrage-and-Yamuna-Expressway!',
  "/article/66f05536838421de1844f3a6/Ravi-Shastri's-Bold-Advice-for-Virat-Kohli:-Adapt-or-Fall-Behind",
  "/article/66f0559f838421de1844f537/Yudhra's-Box-Office-Journey:-A-Dramatic-Decline-After-Promising-Start",
  '/article/66f0e17317e37d9db08fffbc/Shining-Bright:-Hybrid-Solar-Lights-Set-to-Illuminate-Maha-Kumbh-2025',
  "/article/66f0e21817e37d9db0900144/The-Birth-of-a-Legend:-How-a-Simple-Napkin-Became-Lionel-Messi's-First-Barcelona-Contract",
  "/article/66f135b2917608854b653bbf/Marseille's-Waters-Disturbed:-Environmental-Activists-Halt-Cruise-Ship-Operations",
  "/article/66f13632917608854b653c51/Gujarat's-Water-Strategy:-Surface-Water-Supplies-69percent-of-the-State's-Needs",
  '/',
  '/article/66978fe9b4362a9be22571e7',
  '/article/66a3de42b64ef0cc65c10375',
  "/article/66cc4b2da7880008d4f92784/A-booming-stock-market-isn't-stopping-bears-from-sounding-the-alarm-on-a-potential-crash.-Here's-what-they're-worried-about",
  '/article/66d683b9212540164e4d764e',
  "/article/66e8f953d36d92fbc02f328d/Discover-Carlito's-2024-Net-Worth-and-WWE-Earnings!",
  "/article/66ec619b919e918e2313ce67/Unlock-New-Opportunities:-Join-MTE-Hanoi-2024-for-the-Future-of-Vietnam's-Real-Estate-and-Hospitality",
  '/article/66ef32fecfc89ddf852d3365/Sisterly-Love:-Karisma-and-Kareena-Kapoor-Celebrate-Their-Coffee-Craze-Together',
  '/article/66ef90d8cfc89ddf8532ac5f',
  "/article/66efe452adfb4ed284001aa0/Discover-the-Effortless-Charm-of-Harsha-and-Anita-Bhogle's-Stylish-Home",
  '/article/67290591fef9a36c83522cac',
  '/article/67299199fef9a36c83668005',
  '/article/6729922cfef9a36c8366813f',
  '/article/672992fefef9a36c8366828d',
  '/article/6729932dfef9a36c836682fb',
  '/article/6729933afef9a36c83668327',
  '/article/67299364fef9a36c83668377',
  '/article/66dd6f9cc12274bf7211527d/The-man-who-gave-us-',
  '/article/66ea9ef8919e918e23eb613c/White-House-Denies-Involvement-in-Mysterious-Pager-Explosions-in-Lebanon',
  '/article/66ea9f06919e918e23eb620d/Illuminating-the-Heart:-A-Journey-through-Sufi-Reflections',
  "/article/66eb4019919e918e230146d7/Exciting-Developments:-Xiaomi's-Tri-Fold-Smartphone-Patent-Sparks-Anticipation",
  '/article/66eb9c23919e918e230668ba/West-Bengal-Government-Reaches-Out-to-Junior-Doctors-Amid-Flood-Crisis-and-Protests',
  "/article/66eb9c74919e918e23066910/Delta-Airlines-Revokes-Controversial-Memo-Mandating-'Proper-Undergarments'-for-Flight-Attendants",
  "/article/66ebf13f919e918e230bbe59/Refocus-on-the-Importance-of-English-in-India's-Education-System",
  "/article/66ebf207919e918e230bbeda/Barcelona's-Hansi-Flick-Expresses-Regret-Over-Fermin-Lopez's-Injury-Misfortune",
  '/article/66ec5ff7919e918e2313cb84/Surat-Celebrates-Ganesh-Chaturthi-with-Immersion-of-Nearly-63000-Idols',
  "/article/66ecef09919e918e23279634/Lewis-Hamilton-Condemns-FIA-Chief's-'Rapper'-Remarks-as-Racially-Charged",
  '/article/66ed419b919e918e232d1b62/Unlocking-the-Hidden-Power-of-Turmeric:-7-Surprising-Uses-in-Your-Kitchen',
  '/article/66edb36c36bae91581acf9f9/India-Emerges-as-a-Quad-Leader:-Insights-from-US-Officials',
  '/article/66ee3e3c36bae91581c14efe/Tragic-Lynching-of-Diamond-Artisan-in-Surat:-Six-Arrested-Including-Minors',
  '/article/66ee931f36bae91581c77c55/Gyanvapi:-The-Living-Legacy-of-Lord-Vishwanath-and-the-Pursuit-of-Knowledge',
  '/article/66c7a6e683da1cd40cb68e3e/',
  '/article/66da1b6597756e41a150682e/',
  '/article/66e165a06f5787ecee9547ad/',
  "/article/66e552b994707d17c02d23c3/Ironheart's-Anthony-Ramos-Talks-About-His-Transformation-Into-The-Hood",
  '/article/66e615a6a981868644af864c/Tropical-Storm-Ileana-heads-northward-over-the-southern-Gulf-of-California-bringing-heavy-rains',
  '/article/66e6f785afcb8af73b97d93a/Argentina-Triumphs-Over-Finland-to-Secure-Spot-in-Davis-Cup-Final',
  '/article/66e86b8ddfb374a6242b32c9/Scooter-Sales-Surge-Outpacing-Motorcycle-Growth-in-India',
  '/article/66e94c9f8d0747ddd2fec217/New-Wave-of-Benefits:-4.5-Lakh-Armed-Forces-Pensioners-Added-to-OROP-Scheme',
  '/article/66e94e688d0747ddd2fec8c8/Carlos-Vela-Returns-to-LAFC:-Club-Legend-Re-Signs-for-2024-Season',
  '/article/66e9bcd6a23685c3aafdf71e/',
  '/article/66ea9e34919e918e23eb5f31/Revving-Up!-The-2024-Triumph-Speed-400-and-T4-Unveiled-at-an-Affordable-Price-Point',
  '/article/66ea9e6b919e918e23eb6031/',
  '/article/66eb0e88919e918e23f2bcbb/Unlock-Your-Future:-MBA-Admission-Insights-at-the-University-of-Toronto',
  "/article/66eb0fa4919e918e23f2bf05/Ravichandran-Ashwin's-Emotional-Homecoming:-A-Birthday-Test-to-Remember-Against-Bangladesh",
  "/article/66eb1053919e918e23f2c0b9/Stree-2's-Box-Office-Journey:-Falls-Below-indian-rupee3-Crore-for-the-First-Time-On-Day-34!",
  '/article/66eb3e7b919e918e23014600/Tensions-Mount-in-Philip-Polkinghorne-Murder-Trial:-Judge-Urges-Jury-to-Stay-Objective',
  '/article/66eb3ee5919e918e2301463c/Hygenco-Partners-with-REC-to-Propel-Green-Ammonia-Initiative-in-Gopalpur-Odisha',
  '/article/66eb4027919e918e230146e3/Revolutionary-Update:-iPhone-16-Series-Introduces-Wireless-Restore-Functionality',
  '/article/66ebf1bc919e918e230bbead/Prince-Harry-and-Jill-Biden-Unite-for-Civic-Engagement-Before-US-Election',
  '/article/66ebf1d9919e918e230bbec1/Thrilling-Finish:-PSG-Edges-Past-Girona-1-0-in-Champions-League-Opener',
  '/article/66ec5fc1919e918e2313cb52/',
  '/article/66ec6065919e918e2313cc2a/Unbelievable-Balancing-Act:-Street-Vendor-Delivers-Five-Bowls-of-Noodles-on-a-Bike',
  '/article/66ec613d919e918e2313cd6b/Get-Ready!-SSC-MTS-2024-Admit-Card-Released-for-Northwestern-Region-Download-Now!',
  '/article/66ec6207919e918e2313d051/Sunita-Williams-Turns-59:-Celebrations-in-Space-and-Insights-into-Her-Remarkable-Journey',
  "/article/66ec905d919e918e232249e5/Unlock-Your-RSMSSB-CET-2024-Admit-Card-Today:-Here's-How-to-Download",
  '/article/66ecec5d919e918e23277f33/Senior-Executive-at-Univest-Financial-Sells-Over-dollar158000-in-Shares',
  "/article/66ececb8919e918e2327856f/Surat's-Grand-Farewell:-Nearly-63000-Ganesha-Idols-Immerse-in-Splendid-Ceremonial-Procession",
  '/article/66ecedd7919e918e232794a4/Tirupati-Prasad-Controversy-Ignites-Political-Firestorm:-CM-Naidu-Accuses-YSR-Congress-of-Using-Animal-Fat',
  '/article/66ed419b919e918e232d1b62/',
  '/article/66ed4280919e918e232d1bf4/Chennai-Grocery-Store-Fined-for-Selling-Rotten-Eggs',
  '/article/66edb14736bae91581acf73e/',
  '/article/66edb16236bae91581acf763/',
  '/article/66edb16a36bae91581acf775/Workers-Demand-Wage-Increase:-Odia-Posters-Create-Stir-in-Surat',
  "/article/66edb35436bae91581acf9ec/Discover-Thailand:-Must-See-Destinations-Inspired-by-Neha-and-Aisha-Sharma's-Fabulous-Holiday",
  "/article/66ede17136bae91581bc0713/JK-Rowling-Slams-Edinburgh-Harry-Potter-Tours-as-'Nonsense'-and-Plans-Her-Own-Charity-Bus-Tour",
  '/article/66ede19b36bae91581bc072c/12-Plants-to-Avoid-in-Terracotta-Pots:-Discover-Why-These-Favorites-May-Suffer',
  '/article/66ede1f836bae91581bc0758/',
  '/article/66ee3dfa36bae91581c14ec1/Tragic-Lynching-of-Diamond-Artisan:-Six-Arrested-Including-Minors-in-Surat',
  '/article/66ee3e0e36bae91581c14ed3/',
  '/article/66ee3e0e36bae91581c14ed3/IIMs-Under-Scrutiny:-Alarming-Vacancies-in-Reserved-Category-Faculty-Positions-Revealed-by-RTI',
  '/article/66ee3e1836bae91581c14ee0/',
  "/article/66ee3e5336bae91581c14f10/Elegant-Harmony:-The-Artistic-Allure-of-Hermes'-Tressage-Equestres-Collection",
  '/article/66ee3e6036bae91581c14f1d/',
  '/article/66ee3ea036bae91581c14f74/',
  "/article/66ee3ee936bae91581c14fa0/AAP's-Durgesh-Pathak-Accuses-BJP-of-Intimidation-Tactics-to-Poach-Councillors-Ahead-of-MCD-Election",
  '/article/66ee3f0b36bae91581c14fbf/Crew-9:-NASA-and-SpaceX-Join-Forces-for-a-Thrilling-Rescue-Mission-to-the-ISS',
  "/article/66ee3f1036bae91581c14fc5/Kohli's-Humorous-Quip-to-Shakib-Al-Hasan:-'Tu-Malinga-Bana-Hua-Hai!'",
  '/article/66ee3f1736bae91581c14fcb/',
  '/article/66ee3f2036bae91581c14fd1/EU-Commission-Pushes-for-iPhone-Compatibility-with-Third-Party-Smart-Devices',
  '/article/66ee3f5136bae91581c15019/Ansh-Patel:-My-Journey-to-Debuting-for-Canada-in-ODI-Cricket',
  "/article/66ee3f9d36bae91581c15079/Guardiola-Downplays-Title-Implications-in-Upcoming-Arsenal-Clash:-'It's-Just-a-Mood-Setter'",
  '/article/66ee3fa336bae91581c1508c/',
  '/article/66ee3fc236bae91581c150a6/',
  '/article/66ee924d36bae91581c77a8a/',
  '/article/66ee927336bae91581c77aa0/',
  '/article/66ee928136bae91581c77aad/',
  "/article/66ee92b836bae91581c77ae0/Gentari's-Ambitious-EV-Goals:-10000-Vehicles-by-2025-and-the-Path-Ahead",
  '/article/66ee932636bae91581c77c86/',
  '/article/66ee93af36bae91581c77e1e/',
  '/article/66ee93fb36bae91581c77e61/Prince-Harry-Reminisces-About-Unique-Washing-Rituals-From-His-Boarding-School-Days',
  '/article/66ee942436bae91581c77e94/',
  '/article/66ee945f36bae91581c77eaf/',
  "/article/66f08510838421de1854b61c/Coldplay's-2025-India-Tour:-Mumbai-Concert-Tickets-Flying-Off-the-Shelves!",
  '/article/66fed517c028f523e051c938/Textile-Workers-Rally-for-Health-and-Safety:-Demand-65kg-Limit-on-Bale-Weight',
]

async function runAnalysis() {
  try {
    // Run analysis
    console.log('Analyzing relationships between the provided articles...\n')
    const results = await analyzeRelatedArticles({ urls })

    if (results.success) {
      console.log('\nAnalysis Results:')
      console.log('================\n')

      // Print statistics
      console.log('Statistics:')
      console.log('-----------')
      console.log(`Total Articles Analyzed: ${results.stats.totalArticles}`)
      console.log(
        `Articles in Related Groups: ${results.stats.groupedArticles}`,
      )
      console.log(`Unrelated Articles: ${results.stats.unrelatedArticles}`)
      console.log(`Number of Article Groups: ${results.stats.groups}`)

      // Display overall weekly distribution
      console.log('\nOverall Weekly Distribution:')
      console.log('-------------------------')
      results.weeklyDistribution.forEach(([week, count]) => {
        const percentage = (
          (count / results.stats.totalArticles) *
          100
        ).toFixed(1)
        console.log(`${week}: ${count} articles (${percentage}%)`)
      })

      // Display related articles weekly distribution
      console.log('\nRelated Articles Weekly Distribution:')
      console.log('----------------------------------')
      results.relatedArticlesDistribution.forEach(([week, count]) => {
        const percentage = (
          (count / results.stats.groupedArticles) *
          100
        ).toFixed(1)
        console.log(`${week}: ${count} related articles (${percentage}%)`)

        // Calculate percentage of total articles in this week that are related
        const totalInWeek =
          results.weeklyDistribution.find(([w]) => w === week)?.[1] || 0
        if (totalInWeek > 0) {
          const percentOfWeek = ((count / totalInWeek) * 100).toFixed(1)
          console.log(
            `   (${percentOfWeek}% of all articles this week are related)`,
          )
        }
      })

      // Print groups
      if (results.articleGroups.length > 0) {
        console.log('\nRelated Article Groups:')
        console.log('----------------------')
        results.articleGroups.forEach((group, index) => {
          console.log(`\nGroup ${index + 1} (${group.length} articles):`)
          group.forEach(articleId => {
            const url = urls.find(u => u.includes(articleId))
            console.log(`- ${url || articleId}`)
          })
        })
      }

      // Print unrelated articles
      if (results.unrelatedArticles.length > 0) {
        console.log('\nUnrelated Articles:')
        console.log('------------------')
        results.unrelatedArticles.forEach(articleId => {
          const url = urls.find(u => u.includes(articleId))
          console.log(`- ${url || articleId}`)
        })
      }
    } else {
      console.error('Analysis failed:', results.error)
    }
  } catch (error) {
    console.error('Script error:', error)
  }
}

runAnalysis()
