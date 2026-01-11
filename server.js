const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.static(path.join(__dirname, '.')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

app.get('/social-media', (req, res) => {
  res.sendFile(path.join(__dirname, 'social-media', 'index.html'));
});

app.get('/api/blogs', async (req, res) => {
  try {
    const response = await axios.get('https://blog.westerndigital.com');
    const html = response.data;
    const $ = cheerio.load(html);
    const blogs = [];

    $('.wdb-m-card').each((index, element) => {
      if (index >= 6) return; // Limit to 6 posts
      const title = $(element).find('.wdb-m-card__title h4 a').text().trim();
      const link = $(element).find('.wdb-m-card__title h4 a').attr('href');
      const image = $(element).find('.wdb-m-card__media img').attr('src');
      // Clean up byline to get just the date if possible, or use as is
      let byline = $(element).find('.wdb-m-card__byline').text().trim();
      // Remove extra whitespace/newlines
      byline = byline.replace(/\s+/g, ' ');

      if (title && link) {
        blogs.push({
          title,
          link,
          image,
          description: byline // Using byline as description/context
        });
      }
    });

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

app.get('/api/leadership', async (req, res) => {
  try {
    const response = await axios.get('https://www.westerndigital.com/en-in/company/leadership', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const leadership = [];

    const executives = [
      "Irving Tan",
      "Kris Sennesael",
      "Ahmed Shihab",
      "Scott Davis",
      "Cynthia Tregillis",
      "Vidya Gubbi",
      "Katie Watson",
      "Sesh Tirumala",
      "Jeremy Faulk",
      "Ginita Taylor"
    ];

    executives.forEach(name => {
      // Find element containing the name
      // We look for exact matches or close matches in p, h3, h4, h5
      const nameEl = $(`p:contains("${name}"), h3:contains("${name}"), h4:contains("${name}"), h5:contains("${name}")`).last();

      if (nameEl.length) {
        let title = '';
        let bio = '';
        let image = '';

        // Title is usually the next element or in the same container
        // Based on inspection, it might be in a sibling p tag
        let next = nameEl.next();
        if (next.length && next.text().trim().length < 100) {
          title = next.text().trim();
        } else {
          // Try parent's next
          next = nameEl.parent().next();
          if (next.length && next.text().trim().length < 100) {
            title = next.text().trim();
          }
        }

        // Bio is usually a longer paragraph nearby
        let container = nameEl.closest('div.textcolumn, div.cmp-text');
        if (container.length) {
          const candidates = [];

          // Check paragraphs and divs for bio text
          container.find('p, div').each((i, el) => {
            const text = $(el).text().trim();
            // Filter out short texts, titles, and the name itself
            if (text.length > 60 && text !== name && text !== title) {
              candidates.push(text);
            }
          });

          // Strategy 1: Find candidate starting with the Name (Best case)
          const nameStartRegex = new RegExp(`^${name}`, 'i');
          let bestBio = candidates.find(text => nameStartRegex.test(text));

          // Strategy 2: If no name match, take the longest candidate
          if (!bestBio && candidates.length > 0) {
            bestBio = candidates.sort((a, b) => b.length - a.length)[0];
          }

          if (bestBio) {
            bio = bestBio;
          } else {
            // Fallback: get full text but be careful
            bio = container.text().trim();
          }

          // CLEANUP:
          // 1. If the bio starts with the Title, it might be the "metadata sentence" issue.
          //    "Chief of Global Operations... is the Chief..."
          //    We check if it starts with Title and replace it with Name, or prepend Name.
          if (title && bio.toLowerCase().startsWith(title.toLowerCase())) {
            // Check if it follows the pattern "Title ... is the"
            if (bio.match(new RegExp(`^${title}.*\\s+is\\s+the`, 'i'))) {
              // Replace the starting Title (and Company if present) with the Name
              // Heuristic: Replace everything up to "is the" with "Name"
              bio = bio.replace(new RegExp(`^${title}.*?(?=\\s+is\\s+the)`, 'i'), name);
            } else {
              // Just prepend the name if it's missing
              bio = `${name}, ${bio}`;
            }
          }

          // 2. Ensure it starts with the Name (if it doesn't already)
          if (!bio.toLowerCase().startsWith(name.toLowerCase())) {
            // If it starts with "is", prepend Name
            if (bio.toLowerCase().startsWith('is ')) {
              bio = `${name} ${bio}`;
            } else {
              // Otherwise, just prepend Name + is? Or just Name?
              // Let's try to be safe. If it's a full sentence not starting with Name, 
              // maybe we shouldn't force it unless we are sure.
              // But the user specifically wants "Vidya Gubbi is..."
              // So let's prepend Name + " is " if the text seems to describe them.
              bio = `${name} ${bio.charAt(0).toLowerCase() + bio.slice(1)}`;
            }
          }
        }

        // Image: look for an image with the name in the src
        // Convert name to kebab-case for search
        const nameSlug = name.toLowerCase().replace(/\s+/g, '-');
        const imgEl = $(`img[src*="${nameSlug}"], img[data-src*="${nameSlug}"]`).first();

        if (imgEl.length) {
          image = imgEl.attr('data-src') || imgEl.attr('src');
          if (image && !image.startsWith('http')) {
            image = `https://www.westerndigital.com${image}`;
          }
        }

        leadership.push({
          name,
          title,
          bio,
          image
        });
      }
    });

    res.json(leadership);
  } catch (error) {
    console.error('Error fetching leadership:', error);
    res.status(500).json({ error: 'Failed to fetch leadership' });
  }
});

const PORT = process.env.PORT || 1000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`);
  });
}

module.exports = app;
