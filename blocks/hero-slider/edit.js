import {
	useBlockProps,
	RichText,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl,
	Button,
	Popover,
} from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const VARIANT_LABELS = {
	cta: __( 'CTA (nagłówek + tekst + przyciski)', 'adwise' ),
	photo: __( 'Zdjęcie (nagłówek na tle)', 'adwise' ),
	split: __( 'Split (tekst + zdjęcie obok)', 'adwise' ),
};

const VARIANT_SHORT = {
	cta: 'CTA',
	photo: __( 'Zdjęcie', 'adwise' ),
	split: 'Split',
};

export default function Edit( { attributes, setAttributes } ) {
	const { slides, autoplay, autoplayDelay, loop } = attributes;
	const blockProps = useBlockProps( { className: 'wp-block-atonce-hero-slider' } );

	const [ activeSlide, setActiveSlide ] = useState( 0 );
	const safeActiveSlide = Math.min( activeSlide, Math.max( 0, slides.length - 1 ) );
	const slide = slides[ safeActiveSlide ] || slides[ 0 ];

	// Popover URL buttona — klucz "slideIndex-btnIndex" (patterns/buttons-links.md, wariant "wiele buttonów").
	const [ activeBtnPopover, setActiveBtnPopover ] = useState( null );
	const btnWrapRefs = useRef( {} );

	useEffect( () => {
		if ( activeBtnPopover === null ) {
			return;
		}
		const handle = ( e ) => {
			const wrapEl = btnWrapRefs.current[ activeBtnPopover ];
			if ( wrapEl && ! wrapEl.contains( e.target ) ) {
				if ( ! e.target.closest( '.components-popover' ) ) {
					setActiveBtnPopover( null );
				}
			}
		};
		document.addEventListener( 'mousedown', handle );
		return () => document.removeEventListener( 'mousedown', handle );
	}, [ activeBtnPopover ] );

	const updateSlide = ( i, key, value ) => {
		const updated = [ ...slides ];
		updated[ i ] = { ...updated[ i ], [ key ]: value };
		setAttributes( { slides: updated } );
	};

	const addSlide = () => {
		setAttributes( {
			slides: [
				...slides,
				{
					variant: 'cta',
					heading: '',
					text: '',
					image: {},
					buttons: [],
				},
			],
		} );
		setActiveSlide( slides.length );
	};

	const removeSlide = ( i ) => {
		setAttributes( { slides: slides.filter( ( _, idx ) => idx !== i ) } );
		setActiveSlide( ( current ) => {
			if ( current === i ) {
				return Math.max( 0, i - 1 );
			}
			if ( current > i ) {
				return current - 1;
			}
			return current;
		} );
	};

	const updateButton = ( i, bi, key, value ) => {
		const updated = [ ...slides ];
		const buttons = [ ...( updated[ i ].buttons || [] ) ];
		buttons[ bi ] = { ...buttons[ bi ], [ key ]: value };
		updated[ i ] = { ...updated[ i ], buttons };
		setAttributes( { slides: updated } );
	};

	const addButton = ( i ) => {
		const buttons = slides[ i ].buttons || [];
		if ( buttons.length >= 2 ) {
			return;
		}
		const updated = [ ...slides ];
		updated[ i ] = {
			...updated[ i ],
			buttons: [
				...buttons,
				{
					label: __( 'Nowy przycisk', 'adwise' ),
					url: '#',
					style: buttons.length === 0 ? 'filled' : 'outline',
				},
			],
		};
		setAttributes( { slides: updated } );
	};

	const removeButton = ( i, bi ) => {
		const updated = [ ...slides ];
		updated[ i ] = { ...updated[ i ], buttons: updated[ i ].buttons.filter( ( _, idx ) => idx !== bi ) };
		setAttributes( { slides: updated } );
		setActiveBtnPopover( null );
	};

	const toggleButtonStyle = ( i, bi ) => {
		const updated = [ ...slides ];
		const buttons = [ ...updated[ i ].buttons ];
		buttons[ bi ] = { ...buttons[ bi ], style: buttons[ bi ].style === 'outline' ? 'filled' : 'outline' };
		updated[ i ] = { ...updated[ i ], buttons };
		setAttributes( { slides: updated } );
	};

	const imageFieldFor = ( i, currentImage, className ) => (
		<>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ ( m ) =>
						updateSlide( i, 'image', { id: m.id, url: m.url, alt: m.alt || '' } )
					}
					allowedTypes={ [ 'image' ] }
					value={ currentImage?.id }
					render={ ( { open } ) => (
						<button type="button" className={ className } onClick={ open }>
							{ currentImage?.url ? (
								<img
									src={ currentImage.url }
									alt={ currentImage.alt || '' }
									className="hero__media-preview"
								/>
							) : (
								<span className="hero__media-placeholder">
									{ __( 'Wybierz zdjęcie…', 'adwise' ) }
								</span>
							) }
						</button>
					) }
				/>
			</MediaUploadCheck>
			{ currentImage?.url && (
				<button
					type="button"
					className="hero__media-remove"
					onClick={ () => updateSlide( i, 'image', {} ) }
				>
					✕
				</button>
			) }
		</>
	);

	const renderButtons = ( i, buttons ) => (
		<div className="hero__buttons">
			{ buttons.map( ( btn, bi ) => {
				const popoverKey = `${ i }-${ bi }`;
				const style = btn.style === 'outline' ? 'outline' : 'filled';
				return (
					<div
						className="hero__btn-edit-wrap"
						key={ bi }
						ref={ ( el ) => {
							btnWrapRefs.current[ popoverKey ] = el;
						} }
					>
						<div className="hero__btn-toolbar">
							<button
								type="button"
								className="hero__btn-tool"
								onClick={ () => setActiveBtnPopover( popoverKey ) }
							>
								🔗
							</button>
							<button
								type="button"
								className="hero__btn-tool"
								onClick={ () => toggleButtonStyle( i, bi ) }
							>
								{ style === 'outline' ? '→ filled' : '→ outline' }
							</button>
							<button
								type="button"
								className="hero__btn-tool"
								onClick={ () => removeButton( i, bi ) }
							>
								✕
							</button>
						</div>
						<RichText
							tagName="span"
							className={ `hero__btn hero__btn--${ style }` }
							value={ btn.label }
							onChange={ ( val ) => updateButton( i, bi, 'label', val ) }
							allowedFormats={ [] }
							placeholder={ __( 'Tekst przycisku…', 'adwise' ) }
						/>
						{ activeBtnPopover === popoverKey && (
							<Popover position="bottom center">
								<LinkControl
									value={ { url: btn.url } }
									onChange={ ( { url } ) => updateButton( i, bi, 'url', url || '#' ) }
								/>
							</Popover>
						) }
					</div>
				);
			} ) }
			{ buttons.length < 2 && (
				<Button variant="secondary" className="hero__btn-add" onClick={ () => addButton( i ) }>
					{ __( '+ Dodaj przycisk', 'adwise' ) }
				</Button>
			) }
		</div>
	);

	const renderSlidePreview = () => {
		const i = safeActiveSlide;
		const headingField = (
			<RichText
				tagName="h2"
				className="hero__heading"
				value={ slide.heading }
				onChange={ ( val ) => updateSlide( i, 'heading', val ) }
				allowedFormats={ [] }
				placeholder={ __( 'Nagłówek…', 'adwise' ) }
			/>
		);

		if ( slide.variant === 'split' ) {
			return (
				<div className="hero__slide hero__slide--split">
					<div className="hero__split-text">
						{ headingField }
						<RichText
							tagName="p"
							className="hero__text"
							value={ slide.text }
							onChange={ ( val ) => updateSlide( i, 'text', val ) }
							allowedFormats={ [] }
							placeholder={ __( 'Tekst…', 'adwise' ) }
						/>
					</div>
					<div className="hero__split-image">
						{ imageFieldFor( i, slide.image, 'hero__media-btn' ) }
					</div>
				</div>
			);
		}

		if ( slide.variant === 'photo' ) {
			return (
				<div
					className="hero__slide hero__slide--photo"
					style={ slide.image?.url ? { '--hero-bg': `url(${ slide.image.url })` } : {} }
				>
					{ imageFieldFor( i, slide.image, 'hero__media-btn' ) }
					<div className="hero__content">{ headingField }</div>
				</div>
			);
		}

		// cta (default)
		return (
			<div className="hero__slide hero__slide--cta">
				<div className="hero__content">
					{ headingField }
					<RichText
						tagName="p"
						className="hero__text"
						value={ slide.text }
						onChange={ ( val ) => updateSlide( i, 'text', val ) }
						allowedFormats={ [] }
						placeholder={ __( 'Tekst…', 'adwise' ) }
					/>
					{ renderButtons( i, slide.buttons || [] ) }
				</div>
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Slider', 'adwise' ) } initialOpen={ true }>
					<ToggleControl
						label={ __( 'Autoplay', 'adwise' ) }
						checked={ !! autoplay }
						onChange={ ( val ) => setAttributes( { autoplay: val } ) }
					/>
					<RangeControl
						label={ __( 'Opóźnienie autoplay (ms)', 'adwise' ) }
						value={ autoplayDelay }
						onChange={ ( val ) => setAttributes( { autoplayDelay: val } ) }
						min={ 3000 }
						max={ 12000 }
						step={ 500 }
						disabled={ ! autoplay }
					/>
					<ToggleControl
						label={ __( 'Pętla (loop)', 'adwise' ) }
						checked={ !! loop }
						onChange={ ( val ) => setAttributes( { loop: val } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Aktywny slajd', 'adwise' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Wariant', 'adwise' ) }
						value={ slide.variant }
						options={ Object.entries( VARIANT_LABELS ).map( ( [ value, label ] ) => ( {
							value,
							label,
						} ) ) }
						onChange={ ( val ) => updateSlide( safeActiveSlide, 'variant', val ) }
					/>
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="hero__inner">
					<div className="hero__tabs">
						{ slides.map( ( _slide, i ) => (
							<div className={ `hero__tab${ i === safeActiveSlide ? ' is-active' : '' }` } key={ i }>
								<button
									type="button"
									className="hero__tab-select"
									onClick={ () => setActiveSlide( i ) }
								>
									{ `${ __( 'Slajd', 'adwise' ) } ${ i + 1 } · ${
										VARIANT_SHORT[ _slide.variant ] || 'CTA'
									}` }
								</button>
								{ slides.length > 1 && (
									<button
										type="button"
										className="hero__tab-remove"
										onClick={ () => removeSlide( i ) }
									>
										✕
									</button>
								) }
							</div>
						) ) }
						<Button variant="secondary" onClick={ addSlide }>
							{ __( '+ Dodaj slajd', 'adwise' ) }
						</Button>
					</div>

					<div className="hero__slider">{ renderSlidePreview() }</div>
				</div>
			</section>
		</>
	);
}
