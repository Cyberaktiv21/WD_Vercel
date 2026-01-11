const axios = require('axios');
const cheerio = require('cheerio');

async function debug() {
    try {
        console.log('Fetching URL...');
        const response = await axios.get('https://www.westerndigital.com/en-in/company/leadership', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log('Response status:', response.status);

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
            console.log(`\nSearching for: ${name}`);
            const nameEl = $(`p:contains("${name}"), h3:contains("${name}"), h4:contains("${name}"), h5:contains("${name}")`).last();

            if (nameEl.length) {
                console.log(`Found name element for ${name}: ${nameEl.prop('tagName')}`);
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
                console.log(`Title: ${title}`);

                let container = nameEl.closest('div.textcolumn, div.cmp-text');
                if (container.length) {
                    bio = container.text().trim();
                    bio = bio.replace(name, '').replace(title, '').trim();
                }
                console.log(`Bio length: ${bio.length}`);

                const nameSlug = name.toLowerCase().replace(/\s+/g, '-');
                const imgEl = $(`img[src*="${nameSlug}"], img[data-src*="${nameSlug}"]`).first();

                if (imgEl.length) {
                    image = imgEl.attr('data-src') || imgEl.attr('src');
                    if (image && !image.startsWith('http')) {
                        image = `https://www.westerndigital.com${image}`;
                    }
                    console.log(`Image: ${image}`);
                } else {
                    console.log('Image not found');
                }

                leadership.push({
                    name,
                    title,
                    bio,
                    image
                });
            } else {
                console.log(`Name element NOT found for ${name}`);
            }
        });

        console.log('\nFinal Leadership Array:', leadership);

    } catch (error) {
        console.error('Error fetching leadership:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
        }
    }
}

debug();
