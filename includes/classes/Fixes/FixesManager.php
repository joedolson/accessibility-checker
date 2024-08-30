<?php
/**
 * Manager class for fixes.
 *
 * @package Accessibility_Checker
 */

namespace EqualizeDigital\AccessibilityChecker\Fixes;

use EqualizeDigital\AccessibilityChecker\Fixes\Fix\SkipLinkFix;

/**
 * Manager class for fixes.
 *
 * @since 1.16.0
 */
class FixesManager {

	/**
	 * The single instance of the class.
	 *
	 * @var FixesManager|null
	 */
	private static $instance = null;

	/**
	 * The fixes.
	 *
	 * @var array
	 */
	private $fixes = [];

	/**
	 * Private constructor to prevent direct instantiation.
	 */
	private function __construct() {
		$this->maybe_enqueue_frontend_scripts();
	}

	/**
	 * Get the single instance of the class.
	 *
	 * @return FixesManager
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Maybe enqueue the frontend scripts.
	 */
	private function maybe_enqueue_frontend_scripts() {
		// Consider adding this only if we can determine at least 1 of the fixes are enabled.
		if ( ! is_admin() ) {
			add_action(
				'wp_enqueue_scripts',
				function () {
					wp_enqueue_script( 'edac-frontend-fixes', EDAC_PLUGIN_URL . 'build/frontendFixes.bundle.js', [], EDAC_VERSION, true );
					wp_localize_script(
						'edac-frontend-fixes',
						'edac_frontend_fixes',
						apply_filters( 'edac_filter_frontend_fixes_data', [] )
					);
				}
			);
		}
	}

	/**
	 * Load the fixes.
	 */
	private function load_fixes() {
		$fixes = apply_filters(
			'edac_filter_fixes',
			[
				SkipLinkFix::class,
			]
		);
		foreach ( $fixes as $fix ) {
			if ( is_subclass_of( $fix, '\EqualizeDigital\AccessibilityChecker\Fixes\FixInterface' ) ) {
				if ( ! isset( $this->fixes[ $fix::get_slug() ] ) ) {
					$fix_class = new $fix();
					$fix_class->register();
					$this->fixes[ $fix::get_slug() ] = $fix_class;
				}
			}
		}
	}

	/**
	 * Get a fix by its slug.
	 *
	 * @param string $slug The fix slug.
	 *
	 * @return FixInterface|null
	 */
	public function get_fix( $slug ) {
		return isset( $this->fixes[ $slug ] ) ? $this->fixes[ $slug ] : null;
	}

	/**
	 * Register the fixes.
	 */
	public function register_fixes() {
		$this->load_fixes();

		foreach ( $this->fixes as $fix ) {
			if ( 'backend' === $fix::get_type() && is_admin() ) {
				$fix->register();
			} elseif ( 'frontend' === $fix::get_type() && ! is_admin() ) {
				$fix->register();
			} elseif ( 'everywhere' === $fix::get_type() ) {
				$fix->register();
			}
		}
	}
}
