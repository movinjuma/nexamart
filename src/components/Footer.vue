<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <h3 class="logo">Housika</h3>
          <p class="tagline">Find your perfect home in Kenya</p>
          <div class="social-links">
            <a href="https://facebook.com/housika" target="_blank" rel="noopener" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0 0 22 12z"/>
              </svg>
            </a>
            <a href="https://x.com/housika" target="_blank" rel="noopener" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.56 8.56 0 0 1-2.71 1.03A4.27 4.27 0 0 0 16.1 4a4.28 4.28 0 0 0-4.28 4.28c0 .34.04.67.1.99A12.1 12.1 0 0 1 3.16 5.1a4.28 4.28 0 0 0 1.32 5.7 4.24 4.24 0 0 1-1.94-.54v.06a4.28 4.28 0 0 0 3.44 4.19 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.97 8.6 8.6 0 0 1-5.33 1.84c-.35 0-.7-.02-1.04-.06A12.14 12.14 0 0 0 8.29 21c7.88 0 12.2-6.53 12.2-12.2v-.56A8.57 8.57 0 0 0 22.46 6z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/housika" target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.77 0 5-2.24 5-5v-14c0-2.76-2.23-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75S5.53 5.21 6.5 5.21s1.75.79 1.75 1.75S7.47 8.71 6.5 8.71zm13.5 10.29h-3v-4.36c0-1.04-.02-2.38-1.45-2.38-1.45 0-1.67 1.13-1.67 2.3v4.44h-3v-9h2.89v1.23h.04c.4-.76 1.36-1.56 2.79-1.56 2.98 0 3.53 1.96 3.53 4.51v4.82z"/>
              </svg>
            </a>
            <a href="https://wa.me/254745108505" target="_blank" rel="noopener" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.76 11.76 0 0 0 12.05 0C5.69 0 .43 5.25.43 11.68c0 2.06.54 4.06 1.56 5.83L0 24l6.72-1.77a11.64 11.64 0 0 0 5.33 1.36h.01c6.35 0 11.61-5.25 11.61-11.68 0-3.13-1.21-6.07-3.31-8.43zM12.05 21.24c-1.64 0-3.25-.44-4.65-1.28l-.33-.2-3.99 1.05 1.07-3.88-.21-.34a9.61 9.61 0 0 1-1.48-5.13c0-5.26 4.3-9.54 9.59-9.54a9.51 9.51 0 0 1 6.78 2.86 9.56 9.56 0 0 1 2.81 6.84c0 5.26-4.3 9.54-9.59 9.54zm5.44-7.14c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.63.07-.3-.15-1.26-.46-2.4-1.48a8.97 8.97 0 0 1-1.65-2.06c-.17-.3 0-.47.13-.62.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.23-.54-.47-.47-.66-.47-.17 0-.37 0-.57.01-.2.01-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.23 5.09 4.53.71.3 1.26.48 1.7.61.72.23 1.37.2 1.89.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.11-.27-.17-.57-.32z"/>
              </svg>
            </a>
          </div>

          <div class="whatsapp-link">
            <a href="https://wa.me/254745108505" target="_blank" rel="noopener">
              <span :class="{ 'pulse': isWhatsappHover }" @mouseover="hoverWhatsapp" @mouseleave="resetWhatsapp">WhatsApp Business: +254 745 108505</span>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="links-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          <div class="links-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Safety</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div class="links-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">GDPR</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ new Date().getFullYear() }} Housika Inc. All rights reserved.</p>
          <p>Built by <a href="https://pansoft.co.ke" target="_blank" rel="noopener">Pansoft Technologies Kenya</a></p>
        </div>
      </div>
    </div>
  </footer>
</template>
<style scoped>
.app-footer {
  background-color: #1a365d;
  color: #ffffff;
  padding: 0.5rem 0 0;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand {
  max-width: 300px;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.tagline {
  color: #a0aec0;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transition: all 0.3s ease;
}

.social-links a:hover {
  transform: translateY(-2px);
}

.social-links .active {
  background-color: #3182ce;
}

.whatsapp-link {
  margin-top: 1rem;
}

.whatsapp-link a {
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.whatsapp-link a:hover {
  color: #25d366;
}

.whatsapp-link span.pulse {
  animation: pulse 0.5s infinite alternate;
  color: #25d366;
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.links-column h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.links-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.links-column li {
  margin-bottom: 0.8rem;
}

.links-column a {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.95rem;
}

.links-column a:hover {
  color: #4299e1;
}

.footer-bottom {
  display: flex;
  flex-direction:column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0;
  gap: 1.5rem;
}

.copyright {
  text-align: center;
  color: #a0aec0;
  font-size: 0.9rem;
}

.copyright p {
  margin: 0.3rem 0;
}

.copyright a {
  color: #4299e1;
  text-decoration: none;
}

.copyright a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
  }

  .copyright {
    text-align: left;
  }
}
</style>
<script setup>
import { ref } from 'vue';

const isWhatsappHover = ref(false);

const hoverWhatsapp = () => {
  isWhatsappHover.value = true;
};

const resetWhatsapp = () => {
  isWhatsappHover.value = false;
};
</script>