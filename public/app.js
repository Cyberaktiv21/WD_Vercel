// LIVE TIME
function updateTime() {
  document.getElementById("liveTime").innerText =
    "Company Time: " + new Date().toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();

/* ============================
   BLOG FETCHING & SLIDER
   ============================ */

const track = document.querySelector(".slider-track");
let slides = [];
let index = 1;
let slideWidth;
let interval;

async function fetchBlogs() {
  try {
    const response = await fetch('/api/blogs');
    const blogs = await response.json();

    if (blogs.length > 0) {
      renderBlogs(blogs);
      initSlider();
    }
  } catch (error) {
    console.error('Failed to load blogs', error);
  }
}

function renderBlogs(blogs) {
  track.innerHTML = ''; // Clear existing static blogs

  blogs.forEach(blog => {
    const a = document.createElement('a');
    a.className = 'blog-item';
    a.href = blog.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    a.innerHTML = `
      <img class="blog-thumb-img" src="${blog.image}" alt="${blog.title}" loading="lazy" />
      <h3>${blog.title}</h3>
      <p>${blog.description}</p>
    `;

    track.appendChild(a);
  });
}

function initSlider() {
  slides = Array.from(document.querySelectorAll(".blog-item"));
  if (slides.length === 0) return;

  // Clone first & last slides
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  firstClone.classList.add("clone");
  lastClone.classList.add("clone");

  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  const allSlides = Array.from(track.children);

  function setSlideWidth() {
    // Check if element is visible/has width
    const rect = allSlides[0].getBoundingClientRect();
    if (rect.width === 0) return; // Prevent errors if hidden

    slideWidth = rect.width + 20; // 20 = margin
    track.style.transform = `translateX(-${slideWidth * index}px)`;
  }

  window.addEventListener("resize", setSlideWidth);
  // Initial set with a small delay to ensure rendering
  setTimeout(setSlideWidth, 100);

  // Move slider
  function moveToIndex() {
    track.style.transition = "transform 0.45s ease";
    track.style.transform = `translateX(-${slideWidth * index}px)`;
  }

  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  // Next / Prev buttons
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (index >= allSlides.length - 1) return;
      index++;
      moveToIndex();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (index <= 0) return;
      index--;
      moveToIndex();
    };
  }

  // Seamless loop reset
  track.addEventListener("transitionend", () => {
    // Ensure index is within bounds of allSlides
    if (!allSlides[index]) return;

    if (allSlides[index].classList.contains("clone")) {
      track.style.transition = "none";

      if (index === allSlides.length - 1) {
        index = 1;
      } else if (index === 0) {
        index = allSlides.length - 2;
      }

      track.style.transform = `translateX(-${slideWidth * index}px)`;
    }
  });

  // Auto-rotate forever
  interval = setInterval(() => {
    index++;
    moveToIndex();
  }, 6000);
}

// Start
fetchBlogs();

/* ============================
   CHAT BUTTON HANDLER
   ============================ */

const chatButton = document.getElementById("chatButton");
const popupOverlay = document.getElementById("popupOverlay");
const popupClose = document.getElementById("popupClose");

// Show popup when chat button is clicked
chatButton.addEventListener("click", () => {
  popupOverlay.classList.add("active");
});

// Close popup when close button is clicked
popupClose.addEventListener("click", () => {
  popupOverlay.classList.remove("active");
});

// Close popup when clicking outside the popup content
popupOverlay.addEventListener("click", (e) => {
  if (e.target === popupOverlay) {
    popupOverlay.classList.remove("active");
  }
});

// Close popup with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && popupOverlay.classList.contains("active")) {
    popupOverlay.classList.remove("active");
  }
  if (e.key === "Escape" && leadershipModal.classList.contains("active")) {
    leadershipModal.classList.remove("active");
  }
});

/* ============================
   EXECUTIVE LEADERSHIP
   ============================ */

const leadershipGrid = document.getElementById('leadershipGrid');
const leadershipModal = document.getElementById('leadershipModal');
const leadershipClose = document.getElementById('leadershipClose');
const bioContent = document.getElementById('bioContent');

async function fetchLeadership() {
  try {
    const response = await fetch('/api/leadership');
    const leaders = await response.json();
    renderLeadership(leaders);
  } catch (error) {
    console.error('Failed to load leadership', error);
    leadershipGrid.innerHTML = '<p style="text-align:center; color: #ff6b6b;">Failed to load leadership team.</p>';
  }
}

function renderLeadership(leaders) {
  leadershipGrid.innerHTML = '';

  leaders.forEach(leader => {
    const card = document.createElement('div');
    card.className = 'leader-card';
    card.onclick = () => openBioModal(leader);

    // Fallback image if none found
    const imgSrc = leader.image || 'https://www.westerndigital.com/content/dam/store/en-us/assets/company/default-avatar.png'; // Use a placeholder or generic

    card.innerHTML = `
      <div class="leader-img-container">
        <img class="leader-img" src="${imgSrc}" alt="${leader.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/160?text=WD'"/>
      </div>
      <h3 class="leader-name">${leader.name}</h3>
      <p class="leader-title">${leader.title}</p>
    `;

    leadershipGrid.appendChild(card);
  });
}

function openBioModal(leader) {
  const imgSrc = leader.image || 'https://via.placeholder.com/100?text=WD';

  bioContent.innerHTML = `
    <div class="bio-header">
      <img class="bio-img" src="${imgSrc}" alt="${leader.name}" onerror="this.src='https://via.placeholder.com/100?text=WD'"/>
      <div class="bio-info">
        <h3>${leader.name}</h3>
        <p>${leader.title}</p>
      </div>
    </div>
    <div class="bio-text">
      ${leader.bio ? `<p>${leader.bio}</p>` : '<p>Bio not available.</p>'}
    </div>
  `;

  leadershipModal.classList.add('active');
}

// Close Leadership Modal
leadershipClose.addEventListener('click', () => {
  leadershipModal.classList.remove('active');
});

leadershipModal.addEventListener('click', (e) => {
  if (e.target === leadershipModal) {
    leadershipModal.classList.remove('active');
  }
});

// Init
fetchLeadership();

/* ============================
   ROADMAP INTERACTION
   ============================ */
function initRoadmap() {
  const capacityBoxes = document.querySelectorAll('.rm-capacity-box');
  const infoCards = document.querySelectorAll('.rm-info-card');
  const detailPanels = document.querySelectorAll('.rm-detail-panel');

  function showDetail(id) {
    detailPanels.forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById('detail-' + id);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  capacityBoxes.forEach(box => {
    box.addEventListener('click', () => {
      capacityBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');

      const tech = box.getAttribute('data-tech');
      showDetail(tech);
    });
  });

  infoCards.forEach(card => {
    card.addEventListener('click', () => {
      const detail = card.getAttribute('data-detail');
      showDetail(detail);
    });
  });

  // Timeline interaction
  const timelinePoints = document.querySelectorAll('.rm-timeline-point');
  timelinePoints.forEach(point => {
    point.addEventListener('click', () => {
      // Could scroll to relevant section or just highlight
      // For now, just a visual feedback
      timelinePoints.forEach(p => p.querySelector('.rm-point-dot').style.background = '#7b5fc9');
      point.querySelector('.rm-point-dot').style.background = '#5ec4d4';
    });
  });
}

// Call initRoadmap when DOM is ready or after content injection
document.addEventListener('DOMContentLoaded', initRoadmap);
// Also call it immediately in case we are injecting script late
initRoadmap();