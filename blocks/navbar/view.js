( function () {
	const nav = document.querySelector( '[data-navbar]' );
	if ( ! nav ) return;

	const burger = nav.querySelector( '.nav__burger' );
	const panel = nav.querySelector( '.nav__panel' );
	if ( ! burger || ! panel ) return;

	const mobileQuery = window.matchMedia( '(max-width: 1120px)' );

	const setOpen = ( open ) => {
		nav.classList.toggle( 'is-open', open );
		burger.setAttribute( 'aria-expanded', String( open ) );
		// inert TYLKO na mobile — na desktopie panel to zawsze widoczne menu poziome
		if ( mobileQuery.matches ) {
			panel.toggleAttribute( 'inert', ! open );
		} else {
			panel.removeAttribute( 'inert' );
		}
		document.body.style.overflow = open ? 'hidden' : ''; // blokuj scroll tła
	};

	// Stan początkowy + zmiana breakpointu (desktop nigdy nie może zostać z inert)
	if ( mobileQuery.matches ) panel.setAttribute( 'inert', '' );
	mobileQuery.addEventListener( 'change', ( ev ) => {
		if ( ! ev.matches ) {
			setOpen( false );
			panel.removeAttribute( 'inert' );
		} else if ( ! nav.classList.contains( 'is-open' ) ) {
			panel.setAttribute( 'inert', '' );
		}
	} );

	burger.addEventListener( 'click', () => setOpen( ! nav.classList.contains( 'is-open' ) ) );

	document.addEventListener( 'keydown', ( e ) => {
		if ( e.key === 'Escape' && nav.classList.contains( 'is-open' ) ) setOpen( false );
	} );

	document.addEventListener( 'click', ( e ) => {
		if ( nav.classList.contains( 'is-open' ) && ! nav.contains( e.target ) ) setOpen( false );
	} );

	// Akordeon dropdownów (USŁUGI, DLA KOGO…) na panelu mobilnym — musi być
	// zarejestrowany PRZED ogólnym „klik w link zamyka panel” (kolejność listenerów
	// na tym samym elemencie decyduje o e.defaultPrevented widocznym w kolejnym handlerze).
	panel.querySelectorAll( '.menu-item-has-children > a' ).forEach( ( a ) => {
		a.addEventListener( 'click', ( e ) => {
			if ( ! mobileQuery.matches ) {
				// desktop: dropdown steruje CSS (:hover/:focus-within); placeholderowy
				// href="#" nie może skakać do góry strony
				if ( a.getAttribute( 'href' ) === '#' ) e.preventDefault();
				return;
			}
			e.preventDefault();
			a.parentElement.classList.toggle( 'is-sub-open' );
		} );
	} );

	// Klik w link zamyka panel — pomijamy parenty dropdownów (te tylko togglują submenu).
	panel.querySelectorAll( 'a' ).forEach( ( a ) => {
		a.addEventListener( 'click', ( e ) => {
			if ( e.defaultPrevented ) return;
			setOpen( false );
		} );
	} );

	// Sticky state — zmiana wyglądu paska po scrollu.
	const onScroll = () => nav.classList.toggle( 'is-scrolled', window.scrollY > 24 );
	onScroll();
	window.addEventListener( 'scroll', onScroll, { passive: true } );
} )();
