const axios = require('axios');
const cheerio = require('cheerio');

// Fallback Data
const FALLBACK_BLOGS = [
  { "title": "Western Digital and the Foundation of the AI Data Economy", "link": "https://blog.westerndigital.com/western-digital-and-the-foundation-of-the-ai-data-economy/", "image": "https://blog.westerndigital.com/wp-content/uploads/2025/11/ReinventingStorageBlog-BlogHero-1440x758-Final.png", "description": "November 20, 2025 • 9 min read" },
  { "title": "The Long-Term Case for HDD Storage", "link": "https://blog.westerndigital.com/long-term-case-for-hdd-storage/", "image": "https://blog.westerndigital.com/wp-content/uploads/2025/10/IIC-BlogHero-1440x758-1.png", "description": "October 20, 2025 • 4 min read" },
  { "title": "The Central Role of HDDs in AI Storage", "link": "https://blog.westerndigital.com/the-central-role-of-hdds-in-ai-storage/", "image": "https://blog.westerndigital.com/wp-content/uploads/2025/09/BlogHero-DataCenter-1440x758-1.jpg", "description": "September 24, 2025 • 4 min read" },
  { "title": "Giving HDD Rare Earth Elements New Life", "link": "https://blog.westerndigital.com/giving-hdd-rare-earth-elements-new-life/", "image": "https://blog.westerndigital.com/wp-content/uploads/2025/04/NewsroomTile-Rare-Earth-Recycling-Program.jpg", "description": "April 17, 2025 • 7 min read" },
  { "title": "Powering the Future of Cloud Storage", "link": "https://blog.westerndigital.com/hdd-energy-efficiency-cloud-storage/", "image": "https://blog.westerndigital.com/wp-content/uploads/2025/12/PFCS-BlogHero-1440x758-1.jpg", "description": "December 10, 2025 • 8 min read" },
  { "title": "The Smart Path to Scalable Storage", "link": "https://blog.westerndigital.com/smr-hdd-technology-ai-data-centers/", "image": "https://blog.westerndigital.com/wp-content/uploads/2025/12/SPSS-BlogHero-1440x758-Final.png", "description": "December 4, 2025 • 6 min read" }
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
    const response = await axios.get('https://blog.westerndigital.com', { timeout: 3000 });
    const html = response.data;
    const $ = cheerio.load(html);
    const blogs = [];

    $('.wdb-m-card').each((index, element) => {
      if (index >= 6) return;
      const title = $(element).find('.wdb-m-card__title h4 a').text().trim();
      const link = $(element).find('.wdb-m-card__title h4 a').attr('href');
      const image = $(element).find('.wdb-m-card__media img').attr('src');
      let byline = $(element).find('.wdb-m-card__byline').text().trim();
      byline = byline.replace(/\s+/g, ' ');

      if (title && link) {
        blogs.push({ title, link, image, description: byline });
      }
    });

    if (blogs.length === 0) throw new Error('No blogs found');
    res.status(200).json(blogs);
  } catch (error) {
    console.log('Using fallback blog data due to error:', error.message);
    res.status(200).json(FALLBACK_BLOGS);
  }
};
