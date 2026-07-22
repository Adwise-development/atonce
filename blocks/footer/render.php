<?php
/**
 * Render: atonce/footer
 *
 * @var array  $attributes Block attributes.
 * @var string $content    Inner block content (unused, SSR block).
 * @var WP_Block $block    Block instance.
 */

$company_info = $attributes['companyInfo'] ?? '';
$menu_id      = absint( $attributes['menuId'] ?? 0 );
$phone        = $attributes['phone'] ?? '';
$email        = $attributes['email'] ?? '';
$social_fb    = $attributes['socialFacebook'] ?? '';
$social_ig    = $attributes['socialInstagram'] ?? '';
$social_li    = $attributes['socialLinkedin'] ?? '';

$phone_href = $phone ? 'tel:' . preg_replace( '/\s+/', '', $phone ) : '';

$wrapper = get_block_wrapper_attributes( [ 'class' => 'wp-block-atonce-footer' ] );

// Inline SVG glyphy — przerysowane z assets/icons/social/*-white.svg (fill statyczny → currentColor).
$social_icons = [
	'facebook'  => [
		'label' => 'Facebook',
		'paths' => [
			'M31.1045 7.85425C28.8095 7.85425 26.6085 8.76594 24.9856 10.3888C23.3628 12.0116 22.4511 14.2126 22.4511 16.5076V21.3255H17.8204C17.5884 21.3255 17.3994 21.5126 17.3994 21.7464V28.1078C17.3994 28.3398 17.5865 28.5288 17.8204 28.5288H22.4511V41.579C22.4511 41.811 22.6382 42 22.8721 42H29.2335C29.4655 42 29.6545 41.8129 29.6545 41.579V28.5288H34.3264C34.5191 28.5288 34.6875 28.3978 34.7342 28.2107L36.3246 21.8493C36.3402 21.7873 36.3415 21.7224 36.3284 21.6598C36.3152 21.5971 36.2879 21.5383 36.2486 21.4878C36.2092 21.4373 36.1589 21.3964 36.1014 21.3683C36.0439 21.3402 35.9807 21.3255 35.9167 21.3255H29.6545V16.5076C29.6545 16.3172 29.692 16.1287 29.7649 15.9527C29.8377 15.7768 29.9445 15.617 30.0792 15.4823C30.2138 15.3477 30.3737 15.2408 30.5496 15.168C30.7255 15.0951 30.9141 15.0576 31.1045 15.0576H35.9691C36.2011 15.0576 36.3901 14.8705 36.3901 14.6366V8.27522C36.3901 8.04322 36.203 7.85425 35.9691 7.85425H31.1045Z',
		],
	],
	'instagram' => [
		'label' => 'Instagram',
		'paths' => [
			'M15.5095 7.9248H26.4929C30.677 7.9248 34.0767 11.3244 34.0767 15.5086V26.4919C34.0767 28.5033 33.2777 30.4322 31.8554 31.8545C30.4332 33.2767 28.5042 34.0757 26.4929 34.0757H15.5095C11.3254 34.0757 7.92578 30.6761 7.92578 26.4919V15.5086C7.92578 13.4972 8.72478 11.5683 10.147 10.146C11.5692 8.72381 13.4982 7.9248 15.5095 7.9248ZM15.248 10.5399C13.9996 10.5399 12.8023 11.0358 11.9196 11.9186C11.0368 12.8014 10.5409 13.9986 10.5409 15.247V26.7534C10.5409 29.3554 12.646 31.4606 15.248 31.4606H26.7544C28.0028 31.4606 29.2001 30.9647 30.0829 30.0819C30.9656 29.1991 31.4616 28.0019 31.4616 26.7534V15.247C31.4616 12.645 29.3564 10.5399 26.7544 10.5399H15.248ZM27.8658 12.5012C28.2993 12.5012 28.715 12.6734 29.0215 12.9799C29.3281 13.2864 29.5003 13.7022 29.5003 14.1356C29.5003 14.5691 29.3281 14.9848 29.0215 15.2914C28.715 15.5979 28.2993 15.7701 27.8658 15.7701C27.4323 15.7701 27.0166 15.5979 26.7101 15.2914C26.4036 14.9848 26.2314 14.5691 26.2314 14.1356C26.2314 13.7022 26.4036 13.2864 26.7101 12.9799C27.0166 12.6734 27.4323 12.5012 27.8658 12.5012ZM21.0012 14.4625C22.7351 14.4625 24.398 15.1513 25.6241 16.3774C26.8501 17.6034 27.5389 19.2663 27.5389 21.0002C27.5389 22.7342 26.8501 24.397 25.6241 25.6231C24.398 26.8492 22.7351 27.538 21.0012 27.538C19.2673 27.538 17.6044 26.8492 16.3784 25.6231C15.1523 24.397 14.4635 22.7342 14.4635 21.0002C14.4635 19.2663 15.1523 17.6034 16.3784 16.3774C17.6044 15.1513 19.2673 14.4625 21.0012 14.4625ZM21.0012 17.0776C19.9609 17.0776 18.9631 17.4909 18.2275 18.2265C17.4919 18.9622 17.0786 19.9599 17.0786 21.0002C17.0786 22.0406 17.4919 23.0383 18.2275 23.774C18.9631 24.5096 19.9609 24.9229 21.0012 24.9229C22.0416 24.9229 23.0393 24.5096 23.7749 23.774C24.5106 23.0383 24.9239 22.0406 24.9239 21.0002C24.9239 19.9599 24.5106 18.9622 23.7749 18.2265C23.0393 17.4909 22.0416 17.0776 21.0012 17.0776Z',
		],
	],
	'linkedin'  => [
		'label' => 'LinkedIn',
		'paths' => [
			'M10.8483 14.0831C12.6226 14.0831 14.0609 12.6448 14.0609 10.8705C14.0609 9.09628 12.6226 7.65796 10.8483 7.65796C9.07406 7.65796 7.63574 9.09628 7.63574 10.8705C7.63574 12.6448 9.07406 14.0831 10.8483 14.0831Z',
			'M17.0932 16.5174V34.3407H22.6271V25.5267C22.6271 23.201 23.0646 20.9486 25.9483 20.9486C28.7924 20.9486 28.8276 23.6077 28.8276 25.6735V34.3422H34.3644V24.5679C34.3644 19.7667 33.3308 16.0769 27.7191 16.0769C25.0248 16.0769 23.2188 17.5555 22.4803 18.9547H22.4054V16.5174H17.0932ZM8.07507 16.5174H13.6178V34.3407H8.07507V16.5174Z',
		],
	],
];

// Kolejność jak w makiecie: LinkedIn, Instagram, Facebook.
$social_links = [
	'linkedin'  => $social_li,
	'instagram' => $social_ig,
	'facebook'  => $social_fb,
];

$render_social_icon = function ( $name, $url ) use ( $social_icons ) {
	if ( ! $url || empty( $social_icons[ $name ] ) ) {
		return;
	}
	$icon  = $social_icons[ $name ];
	$paths = '';
	foreach ( $icon['paths'] as $d ) {
		$paths .= '<path d="' . esc_attr( $d ) . '" fill="currentColor" />';
	}
	?>
	<a class="ft__social-link" href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $icon['label'] ); ?>">
		<svg class="ft__social-icon" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><?php echo $paths; // phpcs:ignore -- trusted, hardcoded theme SVG, brak inputu usera. ?></svg>
	</a>
	<?php
};
?>
<section <?php echo $wrapper; ?>>
	<div class="ft__inner">
		<div class="ft__frame">
			<div class="ft__group ft__group--address">
				<p class="ft__address"><?php echo wp_kses_post( $company_info ); ?></p>
			</div>

			<?php if ( $menu_id ) : ?>
				<div class="ft__group ft__group--menu">
					<?php
					// Płaskie menu WP — pozycje łamią się na 2 kolumny przez CSS columns (.ft__menu).
					wp_nav_menu(
						[
							'menu'        => $menu_id,
							'container'   => false,
							'menu_class'  => 'ft__menu',
							'fallback_cb' => false,
							'depth'       => 1,
						]
					);
					?>
				</div>
			<?php endif; ?>

			<div class="ft__group ft__group--contact">
				<div class="ft__contact">
					<?php if ( $phone ) : ?>
						<a class="ft__contact-link" href="<?php echo esc_attr( $phone_href ); ?>"><?php echo esc_html( $phone ); ?></a>
					<?php endif; ?>
					<?php if ( $email ) : ?>
						<a class="ft__contact-link" href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a>
					<?php endif; ?>
				</div>
			</div>

			<?php if ( array_filter( $social_links ) ) : ?>
				<div class="ft__group ft__group--social">
					<div class="ft__social">
						<?php foreach ( $social_links as $name => $url ) : ?>
							<?php $render_social_icon( $name, $url ); ?>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>
