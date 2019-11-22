const intro = document.querySelector('.intro');
const canvas = intro.querySelector('canvas');
const text =intro.querySelector('h1');
//END SECTION
const section = document.querySelector('section');
const end = section.querySelector('h1');

//SCROLL MAGIC
const controller = new ScrollMagic.Controller()
const scene = new ScrollMagic.Scene({
    duration: 500,
    triggerElement: intro,
    triggerHook: 0
})
.addIndicators()
.setPin(intro)
.addTo(controller);
