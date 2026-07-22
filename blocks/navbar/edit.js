import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { SelectControl, Spinner, Popover } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Zamienia płaską listę /wp/v2/menu-items na drzewo (top-level + children),
 * żeby w edytorze odwzorować dropdowny (USŁUGI, DLA KOGO) tak jak wp_nav_menu na froncie.
 */
function buildMenuTree( items ) {
	const map = {};
	items.forEach( ( it ) => {
		map[ it.id ] = { ...it, children: [] };
	} );
	const roots = [];
	items.forEach( ( it ) => {
		const parentId = it.menu_item_parent ? parseInt( it.menu_item_parent, 10 ) : 0;
		if ( parentId && map[ parentId ] ) {
			map[ parentId ].children.push( map[ it.id ] );
		} else {
			roots.push( map[ it.id ] );
		}
	} );
	return roots;
}

function menuItemLabel( item ) {
	return item.title?.rendered || item.title || '';
}

function MenuPreviewList( { items } ) {
	return (
		<ul className="nav__menu">
			{ items.map( ( it ) => (
				<li
					key={ it.id }
					className={ it.children.length ? 'menu-item-has-children' : '' }
				>
					{ /* Klik w edytorze NIE nawiguje — samo demo linków z prawdziwego menu */ }
					<a href={ it.url } onClick={ ( e ) => e.preventDefault() }>
						{ menuItemLabel( it ) }
					</a>
					{ it.children.length > 0 && (
						<ul className="sub-menu">
							{ it.children.map( ( child ) => (
								<li key={ child.id }>
									<a href={ child.url } onClick={ ( e ) => e.preventDefault() }>
										{ menuItemLabel( child ) }
									</a>
								</li>
							) ) }
						</ul>
					) }
				</li>
			) ) }
		</ul>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { menuId, logo, ctaText, ctaUrl } = attributes;
	const blockProps = useBlockProps( { className: 'wp-block-atonce-navbar' } );

	// Lista dostępnych menu do SelectControl.
	const menus = useSelect(
		( select ) => select( coreStore ).getEntityRecords( 'root', 'menu', { per_page: -1 } ),
		[]
	);

	// Pozycje wybranego menu — live preview.
	const [ items, setItems ] = useState( [] );
	const [ loading, setLoading ] = useState( false );
	useEffect( () => {
		if ( ! menuId ) {
			setItems( [] );
			return;
		}
		let cancelled = false;
		setLoading( true );
		apiFetch( { path: `/wp/v2/menu-items?menus=${ menuId }&per_page=100` } )
			.then( ( data ) => {
				if ( cancelled ) return;
				const sorted = [ ...( data || [] ) ].sort( ( a, b ) => a.menu_order - b.menu_order );
				setItems( sorted );
			} )
			.catch( () => {
				if ( ! cancelled ) setItems( [] );
			} )
			.finally( () => {
				if ( ! cancelled ) setLoading( false );
			} );
		return () => {
			cancelled = true;
		};
	}, [ menuId ] );

	const menuTree = buildMenuTree( items );

	const menuOptions = [
		{ value: 0, label: '— wybierz menu —' },
		...( menus || [] ).map( ( m ) => ( { value: m.id, label: m.name } ) ),
	];

	// Logo — fallback do domyślnego assetu theme (edytor = front 1:1).
	const logoFallback = `${ window.ADWISE?.themeUri ?? '' }/assets/images/logo.svg`;
	const logoUrl = logo?.url || logoFallback;
	const logoAlt = logo?.alt || 'Logo';

	// CTA — popover z LinkControl (URL edytowalny inline, nigdy w sidebarze).
	const [ showCtaPopover, setShowCtaPopover ] = useState( false );
	const ctaWrapRef = useRef( null );
	useEffect( () => {
		if ( ! showCtaPopover ) return;
		const handle = ( e ) => {
			if ( ctaWrapRef.current && ! ctaWrapRef.current.contains( e.target ) ) {
				if ( ! e.target.closest( '.components-popover' ) ) setShowCtaPopover( false );
			}
		};
		document.addEventListener( 'mousedown', handle );
		return () => document.removeEventListener( 'mousedown', handle );
	}, [ showCtaPopover ] );

	return (
		<nav { ...blockProps }>
			<div className="nav__inner">
				<div className="nav__logo-wrap">
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( m ) =>
								setAttributes( { logo: { id: m.id, url: m.url, alt: m.alt || '' } } )
							}
							allowedTypes={ [ 'image' ] }
							value={ logo?.id }
							render={ ( { open } ) => (
								<button type="button" className="nav__logo-btn" onClick={ open }>
									<img src={ logoUrl } alt={ logoAlt } className="nav__logo-img" />
								</button>
							) }
						/>
					</MediaUploadCheck>
					{ logo?.url && (
						<button
							type="button"
							className="nav__logo-remove"
							onClick={ () => setAttributes( { logo: {} } ) }
						>
							✕
						</button>
					) }
				</div>

				<div className="nav__panel">
					{ ! menuId ? (
						menus && menus.length === 0 ? (
							<div className="nav__menu-empty">
								<p>
									Brak menu. Utwórz je w <strong>Wygląd → Menu</strong>, dodaj
									pozycje, zapisz, wróć tu i odśwież.
								</p>
								<a href="nav-menus.php" target="_blank" rel="noopener noreferrer">
									Otwórz Wygląd → Menu ↗
								</a>
							</div>
						) : (
							<SelectControl
								label="Menu nawigacji"
								value={ menuId }
								options={ menuOptions }
								onChange={ ( val ) => setAttributes( { menuId: parseInt( val, 10 ) } ) }
							/>
						)
					) : (
						<div className="nav__menu-preview">
							{ loading && <Spinner /> }
							<MenuPreviewList items={ menuTree } />
							<button
								type="button"
								className="nav__menu-reset"
								onClick={ () => setAttributes( { menuId: 0 } ) }
							>
								✕ zmień menu
							</button>
						</div>
					) }

					<div
						className="nav__cta-wrap"
						ref={ ctaWrapRef }
						onClick={ () => setShowCtaPopover( true ) }
					>
						<RichText
							tagName="span"
							className="nav__cta"
							value={ ctaText }
							onChange={ ( val ) => setAttributes( { ctaText: val } ) }
							placeholder="Tekst przycisku…"
							allowedFormats={ [] }
						/>
						{ showCtaPopover && (
							<Popover position="bottom center">
								<LinkControl
									value={ { url: ctaUrl } }
									onChange={ ( { url } ) =>
										setAttributes( { ctaUrl: url || '/kontakt/' } )
									}
								/>
							</Popover>
						) }
					</div>
				</div>
			</div>
		</nav>
	);
}
