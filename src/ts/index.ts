import ScrollReveal from 'scrollreveal';

const slideUp = {
  distance: '120px',
  origin: 'bottom',
  opacity: 0,
  delay: 50,
  duration: 1000,
  interval: 50,
};

ScrollReveal().reveal('.reveal-up', slideUp);
