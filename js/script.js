const intro = document.querySelector('.intro');
const canvas = intro.querySelector('canvas');
const text =intro.querySelector('h1');
//END SECTION
const section = document.querySelector('section');
const end = section.querySelector('h1');

//SCROLL MAGIC
const controller = new ScrollMagic.Controller()
let scene = new ScrollMagic.Scene({
    duration: 1500,
    triggerElement: intro,
    triggerHook: 0
})
.addIndicators()
.setPin(intro)
.addTo(controller);
// TEXT ANIMATION
const textAnim = TweenMax.fromTo(text, 2/*Duration*/, {opacity: 1}, {opacity: 0});

let scene2 = new ScrollMagic.Scene({
    duration: 1000,
    triggerElement:intro,
    triggerHook:0
})
.setTween(textAnim)
.addTo(controller);