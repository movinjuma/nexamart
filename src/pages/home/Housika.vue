<template>
  <div class="company-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-heading">Welcome to Housika</h1>
        <p class="hero-subheading">Kenya's trusted rental platform for tenants, landlords, and agents.</p>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="container grid">
        <div class="stat-item">
          <svg class="icon"><use href="#home-icon" /></svg>
          <h3>{{ stats.propertiesListed }}</h3>
          <p>Properties Listed</p>
        </div>
        <div class="stat-item">
          <svg class="icon"><use href="#smile-icon" /></svg>
          <h3>{{ stats.satisfiedUsers }}</h3>
          <p>Happy Users</p>
        </div>
        <div class="stat-item">
          <svg class="icon"><use href="#handshake-icon" /></svg>
          <h3>{{ stats.successfulMatches }}</h3>
          <p>Successful Matches</p>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="about-section">
      <div class="container grid">
        <div class="card">
          <svg class="icon"><use href="#mission-icon" /></svg>
          <h3>Our Mission</h3>
          <p>To simplify renting for tenants and landlords through reliable tech.</p>
        </div>
        <div class="card">
          <svg class="icon"><use href="#vision-icon" /></svg>
          <h3>Our Vision</h3>
          <p>To become World's most trusted rental ecosystem with seamless services.</p>
        </div>
      </div>
    </section>

    <!-- Footer Contact -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-column">
            <h3 class="footer-title">Contact Us</h3>
            <ul class="footer-list">
              <li>
                <svg class="footer-icon"><use href="#phone-icon" /></svg>
                <span>{{ businessPhone }}</span>
              </li>
              <li>
                <svg class="footer-icon"><use href="#mail-icon" /></svg>
                <span>{{ primaryEmail }}</span>
              </li>
              <li>
                <svg class="footer-icon"><use href="#location-icon" /></svg>
                <span>Nairobi, Kenya (Head Office)</span>
              </li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 class="footer-title">Help & Support</h3>
            <ul class="footer-list">
              <li @click="router.push('/help/faq')">
                <svg class="footer-icon"><use href="#faq-icon" /></svg>
                <span>FAQ</span>
              </li>
              <li @click="router.push('/help/guides')">
                <svg class="footer-icon"><use href="#book-icon" /></svg>
                <span>Rental Guides</span>
              </li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 class="footer-title">Follow Us</h3>
            <ul class="footer-list social-links">
              <li>
                <a :href="facebookUrl" target="_blank" rel="noopener noreferrer">
                  <svg class="footer-icon social-icon"><use href="#facebook-icon" /></svg>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a :href="linkedinUrl" target="_blank" rel="noopener noreferrer">
                  <svg class="footer-icon social-icon"><use href="#linkedin-icon" /></svg>
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a :href="instagramUrl" target="_blank" rel="noopener noreferrer">
                  <svg class="footer-icon social-icon"><use href="#instagram-icon" /></svg>
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} Housika. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Floating Buttons -->
    <div class="floating-buttons">
      <a :href="'https://wa.me/' + businessPhone" class="btn whatsapp" title="Chat on WhatsApp" target="_blank" rel="noopener noreferrer">
        <svg width="22" height="22" fill="currentColor"><use href="#whatsapp-icon" /></svg>
      </a>
      <a :href="'tel:' + businessPhone" class="btn call" title="Call Us">
        <svg width="22" height="22" fill="currentColor"><use href="#phone-icon" /></svg>
      </a>
      <a :href="facebookUrl" class="btn messenger" title="Facebook" target="_blank" rel="noopener noreferrer">
        <svg width="22" height="22" fill="currentColor"><use href="#facebook-icon" /></svg>
      </a>
    </div>

    <!-- SVG Sprite -->
    <svg style="display: none;">
      <symbol id="home-icon" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9h-3v9h-12v-9h-3z" /></symbol>
      <symbol id="smile-icon" viewBox="0 0 24 24"><path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm-5 7c0 .6.4 1 1 1s1-.4 1-1-.4-1-1-1-1 .4-1 1zm8 0c0 .6.4 1 1 1s1-.4 1-1-.4-1-1-1-1 .4-1 1zm-8.5 5.3c1.3 1.6 3.3 2.7 5.5 2.7s4.2-1.1 5.5-2.7l-1.5-1.3c-.9 1.1-2.3 1.7-4 1.7s-3.1-.7-4-1.7l-1.5 1.3z"/></symbol>
      <symbol id="handshake-icon" viewBox="0 0 24 24"><path d="M20 8h-3.586l-2-2h-4.828l-2 2h-3.586v2h-2v2h2v2h3v-2h6v2h3v-2h2v-2h-2v-2z"/></symbol>
      <symbol id="mission-icon" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.3 2 7-6.5-4.5-6.5 4.5 2-7-5.5-4.3h7z"/></symbol>
      <symbol id="vision-icon" viewBox="0 0 24 24"><path d="M12 4.5c-7 0-12 7.5-12 7.5s5 7.5 12 7.5 12-7.5 12-7.5-5-7.5-12-7.5zm0 13c-3 0-5.5-2.5-5.5-5.5s2.5-5.5 5.5-5.5 5.5 2.5 5.5 5.5-2.5 5.5-5.5 5.5z"/></symbol>

      <!-- UI Icons -->
      <symbol id="mail-icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm8 8l8-6H4l8 6zm0 2l-8-6v10h16V8l-8 6z"/></symbol>
      <symbol id="phone-icon" viewBox="0 0 24 24"><path d="M6.6 10.8c1.6 3.1 4.5 6 7.6 7.6l2.5-2.5c.3-.3.8-.4 1.1-.2 1.3.5 2.7.8 4.2.8.6 0 1 .4 1 1V22c0 .6-.4 1-1 1C11.3 23 1 12.7 1 1c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.5.3 2.9.8 4.2.1.3 0 .8-.3 1.1L6.6 10.8z"/></symbol>
      <symbol id="location-icon" viewBox="0 0 24 24"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/></symbol>
      <symbol id="book-icon" viewBox="0 0 24 24"><path d="M19 2H6a2 2 0 0 0-2 2v17l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z"/></symbol>
      <symbol id="faq-icon" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 5.6 2 10c0 2.3 1.3 4.3 3.4 5.6L5 22l4.3-2.3c.9.2 1.9.3 2.7.3 5.5 0 10-3.6 10-8s-4.5-8-10-8zm.5 14h-1v-1h1v1zm1.2-4.3l-.7.6c-.5.4-.7.7-.7 1.7h-1V14h1c0-.6.1-.9.6-1.3l.9-.7c.3-.2.5-.5.5-.9 0-.6-.5-1-1-1s-1 .4-1 1H10c0-1.1.9-2 2-2s2 .9 2 2c0 .6-.3 1.1-.8 1.4z"/></symbol>

      <!-- Brand Icons -->
      <symbol id="facebook-icon" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0 0 22 12z"/></symbol>
      <symbol id="linkedin-icon" viewBox="0 0 24 24"><path d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM7 19H4V9h3v10zm-1.5-11.3c-1 0-1.8-.8-1.8-1.7S4.5 4.3 5.5 4.3s1.8.8 1.8 1.7-.8 1.7-1.8 1.7zM20 19h-3v-5.4c0-1.3 0-3-2-3s-2.3 1.5-2.3 2.9V19h-3V9h2.9v1.4h.1c.4-.7 1.3-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5V19z"/></symbol>
      <symbol id="instagram-icon" viewBox="0 0 24 24"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zM12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5a5 5 0 0 0 0-10zm0 8.2c-1.8 0-3.2-1.4-3.2-3.2S10.2 8.8 12 8.8s3.2 1.4 3.2 3.2S13.8 15.2 12 15.2zM17.8 6.2c0 .5-.4.9-.9.9s-.9-.4-.9-.9.4-.9.9-.9.9.4.9.9z"/></symbol>
      <symbol id="whatsapp-icon" viewBox="0 0 24 24"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 0 11.9 11.9 0 0 0 1.5 18L0 24l6-1.5A11.9 11.9 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.3-1.3-6.3-3.5-8.5z"/></symbol>
    </svg>
  </div>
</template>

<style scoped>
/* Base Styles */
.company-page {
  font-family: 'Segoe UI', sans-serif;
  background: #f9f9f9;
  color: #333;
}

.hero {
  background: linear-gradient(to right, #007bff, #00bcd4);
  color: #fff;
  text-align: center;
  padding: 2rem 1rem;
}

.hero-heading {
  font-size: 2rem;
  font-weight: bold;
}

.hero-subheading {
  font-size: 1.1rem;
  margin-top: 0.3rem;
}

.container {
  max-width: 1140px;
  margin: auto;
  padding: 1rem;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.stat-item,
.card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.icon {
  width: 32px;
  height: 32px;
  fill: #007bff;
  margin-bottom: 1rem;
}

/* Footer Styles */
.footer {
  background: #212529;
  color: white;
  padding: 2.5rem 0 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-column {
  margin-bottom: 1.5rem;
}

.footer-title {
  font-size: 1.2rem;
  margin-bottom: 1.2rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background: #007bff;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.footer-list li:hover {
  transform: translateX(5px);
}

.footer-list li span {
  margin-left: 0.5rem;
}

.footer-icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  fill: currentColor;
}

.social-links a {
  display: flex;
  align-items: center;
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.social-links a:hover {
  color: white;
}

.social-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
}

.footer-icon.fb { fill: #1877f2; }
.footer-icon.li { fill: #0077b5; }
.footer-icon.ig { fill: #e1306c; }

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: #aaa;
}

/* Floating Buttons */
.floating-buttons {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 1000;
}

.btn {
  width: 50px;
  height: 50px;
  font-size: 1.2rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.whatsapp {
  color: #25d366;
}

.call {
  color: #28a745;
}

.messenger {
  color: #0078ff;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-column {
    margin-bottom: 1rem;
  }
  
  .footer-title {
    margin-bottom: 1rem;
  }
  
  .floating-buttons {
    bottom: 1rem;
    right: 1rem;
  }
  
  .btn {
    width: 45px;
    height: 45px;
  }
}
</style>

<script>
export default {
  data() {
    return {
      stats: {
        propertiesListed: '2,500+',
        satisfiedUsers: '1,800+',
        successfulMatches: '3,200+',
      },
      businessPhone: "+254745108505",
      primaryEmail: "support@housika.co.ke",
      facebookUrl: "https://facebook.com/housika",
      linkedinUrl: "https://linkedin.com/company/housika",
      instagramUrl: "https://instagram.com/housika"
    };
  },
  methods: {
    openFacebookPage() {
      window.open(this.facebookUrl, '_blank');
    }
  }
};
</script>