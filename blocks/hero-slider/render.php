<?php
/**
 * Render: atonce/hero-slider
 *
 * Baner główny — slider 3 wariantów slajdów (cta / photo / split).
 * Konfiguracja (autoplay/delay/loop) trafia jako data-* na .hero__slider,
 * view.js ją czyta (patterns/slider.md) — nie hardcoduj tu wartości JS.
 *
 * @var array $attributes Block attributes.
 */

$slides = is_array( $attributes['slides'] ?? null ) ? $attributes['slides'] : [];

$autoplay = array_key_exists( 'autoplay', $attributes ) ? (bool) $attributes['autoplay'] : true;
$delay    = absint( $attributes['autoplayDelay'] ?? 6000 );
$loop     = array_key_exists( 'loop', $attributes ) ? (bool) $attributes['loop'] : true;

$wrapper = get_block_wrapper_attributes( [ 'class' => 'wp-block-atonce-hero-slider' ] );

// Inline arrow SVG — przerysowane z assets/icons/arrow-left.svg / arrow-right.svg (fill → currentColor, zaufany lokalny plik).
$hero_arrow_left_path  = 'M0.571776 9.47902L0.571776 11.5532L9.08692 20.0684L10.6426 18.7038L3.46474 11.5532L23.7974 11.5532L23.7974 9.47902L3.46474 9.47902L10.6426 2.32848L9.08692 0.963879L0.571776 9.47902Z';
$hero_arrow_right_path = 'M23.4282 11.2353V9.16114L14.9131 0.645996L13.3574 2.0106L20.5353 9.16114H0.202637V11.2353H20.5353L13.3574 18.3859L14.9131 19.7505L23.4282 11.2353Z';
?>
<section <?php echo $wrapper; ?>>
	<div class="hero__inner">
		<div
			class="hero__slider swiper"
			data-autoplay="<?php echo esc_attr( $autoplay ? '1' : '0' ); ?>"
			data-delay="<?php echo esc_attr( $delay ); ?>"
			data-loop="<?php echo esc_attr( $loop ? '1' : '0' ); ?>"
		>
			<div class="swiper-wrapper">
				<?php foreach ( $slides as $slide ) : ?>
					<?php
					$variant = in_array( $slide['variant'] ?? '', [ 'cta', 'photo', 'split' ], true ) ? $slide['variant'] : 'cta';
					$heading = $slide['heading'] ?? '';
					$text    = $slide['text'] ?? '';
					$image   = is_array( $slide['image'] ?? null ) ? $slide['image'] : [];
					$buttons = is_array( $slide['buttons'] ?? null ) ? $slide['buttons'] : [];

					$slide_style = '';
					if ( 'photo' === $variant ) {
						if ( ! empty( $image['url'] ) ) {
							$slide_style .= '--hero-bg:url(' . esc_url( $image['url'] ) . ');';
						}
						// Przyciemnienie overlay per slajd (suwak w edytorze), 0–80%, default 20%.
						$overlay      = isset( $slide['overlay'] ) ? max( 0, min( 80, (int) $slide['overlay'] ) ) : 20;
						$slide_style .= '--hero-overlay:' . ( $overlay / 100 ) . ';';
					}
					?>
					<div
						class="swiper-slide hero__slide hero__slide--<?php echo esc_attr( $variant ); ?>"
						<?php echo $slide_style ? 'style="' . esc_attr( $slide_style ) . '"' : ''; ?>
					>
						<?php if ( 'split' === $variant ) : ?>
							<div class="hero__split-text">
								<?php if ( $heading ) : ?>
									<h2 class="hero__heading"><?php echo wp_kses_post( $heading ); ?></h2>
								<?php endif; ?>
								<?php if ( $text ) : ?>
									<p class="hero__text"><?php echo wp_kses_post( $text ); ?></p>
								<?php endif; ?>
							</div>
							<div class="hero__split-image">
								<?php if ( ! empty( $image['id'] ) ) : ?>
									<?php
									echo wp_get_attachment_image(
										absint( $image['id'] ),
										'large',
										false,
										[
											'class'   => 'hero__split-img',
											'alt'     => $image['alt'] ?? '',
											'sizes'   => '(max-width: 1024px) 100vw, 39vw',
											'loading' => 'lazy',
										]
									);
									?>
								<?php elseif ( ! empty( $image['url'] ) ) : ?>
									<img
										class="hero__split-img"
										src="<?php echo esc_url( $image['url'] ); ?>"
										alt="<?php echo esc_attr( $image['alt'] ?? '' ); ?>"
										loading="lazy"
									/>
								<?php endif; ?>
							</div>
						<?php else : ?>
							<div class="hero__content">
								<?php if ( $heading ) : ?>
									<h2 class="hero__heading"><?php echo wp_kses_post( $heading ); ?></h2>
								<?php endif; ?>
								<?php if ( 'cta' === $variant && $text ) : ?>
									<p class="hero__text"><?php echo wp_kses_post( $text ); ?></p>
								<?php endif; ?>
								<?php if ( 'cta' === $variant && ! empty( $buttons ) ) : ?>
									<div class="hero__buttons">
										<?php foreach ( $buttons as $btn ) : ?>
											<?php
											$btn_label = $btn['label'] ?? '';
											$btn_url   = $btn['url'] ?? '#';
											$btn_style = ( 'outline' === ( $btn['style'] ?? 'filled' ) ) ? 'outline' : 'filled';
											if ( ! $btn_label ) {
												continue;
											}
											?>
											<a
												class="hero__btn hero__btn--<?php echo esc_attr( $btn_style ); ?>"
												href="<?php echo esc_url( $btn_url ); ?>"
											><?php echo esc_html( $btn_label ); ?></a>
										<?php endforeach; ?>
									</div>
								<?php endif; ?>
							</div>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
			</div>

			<div class="hero__nav">
				<button type="button" class="hero__arrow hero__arrow--prev" aria-label="<?php echo esc_attr__( 'Poprzedni slajd', 'adwise' ); ?>">
					<svg viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path d="<?php echo esc_attr( $hero_arrow_left_path ); ?>" fill="currentColor" />
					</svg>
				</button>
				<button type="button" class="hero__arrow hero__arrow--next" aria-label="<?php echo esc_attr__( 'Następny slajd', 'adwise' ); ?>">
					<svg viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path d="<?php echo esc_attr( $hero_arrow_right_path ); ?>" fill="currentColor" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>
