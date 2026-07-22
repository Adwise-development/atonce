import Swiper from 'swiper';
import { Navigation, Autoplay, A11y } from 'swiper/modules';

( function () {
	const blocks = document.querySelectorAll( '.wp-block-atonce-hero-slider' );
	if ( ! blocks.length ) return;

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	blocks.forEach( ( block ) => {
		const sliderEl = block.querySelector( '.hero__slider' );
		if ( ! sliderEl ) return;

		const loop = sliderEl.dataset.loop === '1';
		const autoplayEnabled = sliderEl.dataset.autoplay === '1' && ! reducedMotion;
		const delay = parseInt( sliderEl.dataset.delay, 10 ) || 6000;

		const options = {
			modules: [ Navigation, Autoplay, A11y ],
			loop,
			speed: 600,
			navigation: {
				prevEl: block.querySelector( '.hero__arrow--prev' ),
				nextEl: block.querySelector( '.hero__arrow--next' ),
			},
		};

		if ( autoplayEnabled ) {
			options.autoplay = {
				delay,
				disableOnInteraction: false,
				pauseOnMouseEnter: true,
			};
		}

		new Swiper( sliderEl, options );
	} );
} )();
