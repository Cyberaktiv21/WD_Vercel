const axios = require('axios');
const cheerio = require('cheerio');

// Fallback Data
const FALLBACK_LEADERSHIP = [
  { "name": "Irving Tan", "title": "Committee Chair", "bio": "Irving Tan is the Committee Chair and has been a Director since 2025.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/irving-tan-western-digital.png.thumb.1280.1280.png" },
  { "name": "Kris Sennesael", "title": "Chief Financial Officer", "bio": "Kris Sennesael currently serves as the Chief Financial Officer of Western Digital. He is responsible for the global finance organization, including accounting, financial planning and analysis, tax, treasury, internal audit, investor relations, and corporate real estate.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/kris-sennesael-western-digital.png.thumb.1280.1280.png" },
  { "name": "Ahmed Shihab", "title": "Chief Product Officer", "bio": "Ahmed Shihab is the Chief Product Officer at Western Digital. In this role, he is responsible for leading engineering and product strategy as well as innovation and the development of current and future Western Digital products and solutions.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/ahmed-shihab-western-digital.png.thumb.1280.1280.png" },
  { "name": "Scott Davis", "title": "SVP of Global Channel and ROEM Sales", "bio": "Scott Davis is a veteran sales executive with over 37 years at the company. Scott has unmatched experience in fostering deep, lasting customer relationships and cultivating high-performing teams.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/scott-davis-western-digital.png.thumb.1280.1280.png" },
  { "name": "Cynthia Tregillis", "title": "Chief Legal Officer", "bio": "Cynthia Tregillis is the Chief Legal Officer and Secretary at Western Digital. She oversees the company's worldwide legal, risk management, compliance, and government relations functions.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/cynthia-tregillis-western-digital.png.thumb.1280.1280.png" },
  { "name": "Vidya Gubbi", "title": "Chief of Global Operations", "bio": "Vidya Gubbi is the Chief of Global Operations at Western Digital. He is responsible for all global operations functions, including manufacturing operations, procurement, supply chain, quality and sustainability.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/vidya-gubbi-western-digital.png.thumb.1280.1280.png" },
  { "name": "Katie Watson", "title": "Chief Human Resources Officer", "bio": "Katie Watson is the Chief Human Resources Officer at Western Digital. She oversees the company's global human resources functions.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/katie-watson-western-digital.png.thumb.1280.1280.png" },
  { "name": "Sesh Tirumala", "title": "Chief Information Officer", "bio": "Sesh Tirumala is the Chief Information Officer at Western Digital, driving the company's digital transformation and fostering a culture of innovation through technology.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/sesh-tirumala-western-digital.png.thumb.1280.1280.png" },
  { "name": "Jeremy Faulk", "title": "VP of Strategy", "bio": "Jeremy Faulk is the Vice President of Strategy and Corporate Development at Western Digital. He is responsible for long-range planning, business and segment strategy.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/jeremy-faulk-western-digital.png.thumb.1280.1280.png" },
  { "name": "Ginita Taylor", "title": "Chief of Staff", "bio": "Ginita Taylor is the Chief of Staff to the CEO at Western Digital. She is responsible for planning and executing all aspects of the CEO office.", "image": "https://www.westerndigital.com/content/dam/store/en-us/assets/company/ginita-taylor-western-digital.png.thumb.1280.1280.png" }
];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Try to fetch with a short timeout
    const response = await axios.get('https://www.westerndigital.com/en-in/company/leadership', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 3000
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const leadership = [];

    const executives = [
      "Irving Tan", "Kris Sennesael", "Ahmed Shihab", "Scott Davis",
      "Cynthia Tregillis", "Vidya Gubbi", "Katie Watson", "Sesh Tirumala",
      "Jeremy Faulk", "Ginita Taylor"
    ];

    executives.forEach(name => {
      const nameEl = $(`p:contains("${name}"), h3:contains("${name}"), h4:contains("${name}"), h5:contains("${name}")`).last();
      if (nameEl.length) {
        let title = '';
        let bio = '';
        let image = '';

        let next = nameEl.next();
        if (next.length && next.text().trim().length < 100) {
          title = next.text().trim();
        } else {
          next = nameEl.parent().next();
          if (next.length && next.text().trim().length < 100) {
            title = next.text().trim();
          }
        }

        let container = nameEl.closest('div.textcolumn, div.cmp-text');
        if (container.length) {
          bio = container.text().trim();
          // Simple cleanup
          if (bio.length > 300) bio = bio.substring(0, 300) + '...';
        }

        const nameSlug = name.toLowerCase().replace(/\s+/g, '-');
        const imgEl = $(`img[src*="${nameSlug}"], img[data-src*="${nameSlug}"]`).first();
        if (imgEl.length) {
          image = imgEl.attr('data-src') || imgEl.attr('src');
          if (image && !image.startsWith('http')) {
            image = `https://www.westerndigital.com${image}`;
          }
        }

        leadership.push({ name, title, bio, image });
      }
    });

    if (leadership.length === 0) throw new Error('No leadership found');
    res.status(200).json(leadership);
  } catch (error) {
    console.log('Using fallback leadership data due to error:', error.message);
    res.status(200).json(FALLBACK_LEADERSHIP);
  }
};
