<?php
/**
 * Render: atonce/navbar
 *
 * Menu żyje w WP Menu (Wygląd → Menu) — blok tylko wybiera które (menuId)
 * i renderuje je natywnym wp_nav_menu (dropdowny = .menu-item-has-children / .sub-menu).
 */

$menu_id  = absint( $attributes['menuId'] ?? 0 );
$logo     = $attributes['logo'] ?? [];
$cta_text = $attributes['ctaText'] ?? '';
$cta_url  = $attributes['ctaUrl'] ?? '#';

// Fallback do domyślnego logo theme — identyczny jak w edit.js (edytor = front 1:1).
$logo_url = ! empty( $logo['url'] ) ? $logo['url'] : get_template_directory_uri() . '/assets/images/logo.svg';
$logo_alt = ! empty( $logo['alt'] ) ? $logo['alt'] : get_bloginfo( 'name' );

$wrapper = get_block_wrapper_attributes( [ 'class' => 'wp-block-atonce-navbar' ] );
?>
<nav <?php echo $wrapper; ?> data-navbar>
	<div class="nav__inner">
		<a class="nav__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<img
				class="nav__logo-img"
				src="<?php echo esc_url( $logo_url ); ?>"
				alt="<?php echo esc_attr( $logo_alt ); ?>"
			/>
		</a>

		<button
			class="nav__burger"
			type="button"
			aria-expanded="false"
			aria-controls="nav-panel"
			aria-label="<?php echo esc_attr__( 'Menu', 'adwise' ); ?>"
		>
			<span></span><span></span><span></span>
		</button>

		<div class="nav__panel" id="nav-panel">
			<?php
			if ( $menu_id ) {
				wp_nav_menu(
					[
						'menu'        => $menu_id,
						'container'   => false,
						'menu_class'  => 'nav__menu',
						'fallback_cb' => false,
						'depth'       => 2,
					]
				);
			}
			?>
			<a class="nav__cta" href="<?php echo esc_url( $cta_url ); ?>">
				<?php echo wp_kses_post( $cta_text ); ?>
			</a>
		</div>
	</div>
</nav>
