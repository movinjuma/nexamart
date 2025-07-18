<template>
  <div v-if="bannerImages && bannerImages.length" class="banner-carousel-container" role="region" aria-label="Property Banners">
    <carousel
      :items-to-show="1"
      :wrap-around="true"
      :autoplay="4000"
      :pause-autoplay-on-hover="true"
      :transition="500"
      aria-live="polite"
    >
      <slide
        v-for="(image, index) in bannerImages"
        :key="`banner-${index}`"
      >
        <div class="banner-image-wrapper">
          <img
            :src="image"
            class="banner-image"
            :alt="`Banner ${index + 1}`"
            @error="handleImageError"
            loading="lazy"
          />
        </div>
      </slide>

      <template #addons>
        <pagination />
      </template>
    </carousel>
  </div>
</template>
<style scoped>
:root {
  --accent-color: #ff6600;
  --dot-color: rgba(255, 255, 255, 0.5);
  --dot-active: #ff6600;
  --nav-bg: rgba(0, 0, 0, 0.4);
  --nav-hover: rgba(0, 0, 0, 0.7);
  --transition: 0.3s ease;
  --radius: 12px;
}

.banner-carousel-container {
  width: 99.5%;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 12px;
}

.banner-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 20%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform var(--transition);
}
.banner-image:hover {
  transform: scale(1.02);
}

.carousel__pagination-button::after {
  background-color: var(--dot-color);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: background-color var(--transition), transform var(--transition);
}
.carousel__pagination-button--active::after {
  background-color: var(--dot-active);
  transform: scale(1.4);
}

.carousel__prev,
.carousel__next {
  background-color: var(--nav-bg);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  transition: background-color var(--transition);
}
.carousel__prev:hover,
.carousel__next:hover {
  background-color: var(--nav-hover);
}

@media (max-width: 1024px) {
  .banner-image-wrapper {
    padding-top: 38%;
  }
  .banner-carousel-container {
  max-height: 500px;
}
}
@media (max-width: 768px) {
  .banner-image-wrapper {
    padding-top: 52%;
  }
   .banner-carousel-container {
  max-height: 180px;
}
}
@media (max-width: 480px) {
  .banner-image-wrapper {
    padding-top: 60%;
  }
  .banner-carousel-container {
  max-height: 170px;
}
  .carousel__prev,
  .carousel__next {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .carousel__pagination-button::after {
    width: 8px;
    height: 8px;
  }
}
</style>
<script setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

defineProps({
  bannerImages: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) =>
      value.every((img) => typeof img === 'string' && img.trim() !== '')
  }
})

const handleImageError = (event) => {
  console.warn('Banner image failed to load:', event.target.src)
  event.target.src = '/img/placeholder-banner.jpg'
  event.target.alt = 'Placeholder image'
}
</script>