<template>
  <!--
    TheFooter must be a SIBLING of .site-main, not a child.
    .site-main has z-index: 20 + opaque background so it visually sits
    above the footer (z-index: 0). The footer's StringTune --progress
    animation (translate + ::after fade) then slides the footer into view
    from underneath, exactly as the footer-shifting tutorial requires.
  -->
  <div class="site-main">
    <AboutSection />
  </div>
  <TheFooter />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AboutSection from '~/components/AboutSection.vue'
import TheFooter from '~/components/TheFooter.vue'

// Pagină cu fundal închis → cursor alb, ca pe /servicii.
const cursorDark = useState('cursorDark', () => false)
onMounted(() => { cursorDark.value = true })
onUnmounted(() => { cursorDark.value = false })

useHead({
  title: 'Despre | Bloom Media',
  htmlAttrs: { 'data-page': 'despre' },
  meta: [
    {
      name: 'description',
      content: 'Bloom Media este o agenție de marketing digital din Cluj-Napoca. Construim strategii testate, măsurabile și ajustate până când funcționează cu adevărat.',
    },
    { property: 'og:title',       content: 'Despre Bloom Media' },
    { property: 'og:description', content: 'Strategie, onestitate și rezultate măsurabile. Aflați cum lucrăm și ce ne diferențiază.' },
    { property: 'og:url',         content: 'https://bloommedia.ro/despre' },
    { property: 'og:image',       content: 'https://bloommedia.ro/og-image.jpg' },
    { name: 'robots',             content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: 'https://bloommedia.ro/despre' }],
})
</script>
