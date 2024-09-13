<?php
/**
 * Try label unlabelled form fields.
 *
 * @package accessibility-checker
 */

namespace EqualizeDigital\AccessibilityChecker\Fixes\Fix;

use EqualizeDigital\AccessibilityChecker\Fixes\FixInterface;

/**
 * Try to add labels to unlabelled form fields.
 *
 * @since 1.16.0
 */
class AddLabelToUnlabelledFormFieldsFix implements FixInterface {

	/**
	 * The slug of the fix.
	 *
	 * @return string
	 */
	public static function get_slug(): string {
		return 'add_label_to_unlabelled_form_fields';
	}

	/**
	 * The type of the fix.
	 *
	 * @return string
	 */
	public static function get_type(): string {
		return 'none';
	}

	/**
	 * Registers everything needed for the fix.
	 *
	 * @return void
	 */
	public function register(): void {

		add_filter(
			'edac_filter_fixes_settings_sections',
			function ( $sections ) {
				$sections[ $this->get_slug() ] = [
					'title'    => esc_html__( 'Unlabelled Form Fields', 'accessibility-checker' ),
					'callback' => [ $this, $this->get_slug() . '_section_callback' ],
				];

				return $sections;
			}
		);

		add_filter(
			'edac_filter_fixes_settings_fields',
			function ( $fields ) {
				$fields[ 'edac_fix_' . $this->get_slug() ] = [
					'label'       => esc_html__( 'Unlabelled Form Fields', 'accessibility-checker' ),
					'type'        => 'checkbox',
					'labelledby'  => $this->get_slug(),
					'description' => esc_html__( 'Attempts to add labels to form fields that are missing them.', 'accessibility-checker' ),
					'section'     => $this->get_slug(),
					'upsell'      => isset( $this->is_pro ) && $this->is_pro ? false : true,
				];

				return $fields;
			}
		);
	}

	/**
	 * Run the fix for adding the comment and search form labels.
	 */
	public function run(): void {

		// Intentionally left empty.
	}

	/**
	 * Callback for the fix settings section.
	 *
	 * @return void
	 */
	public function add_label_to_unlabelled_form_fields_section_callback() {
		?>
		<p>
			<?php
				printf(
				// translators: %1$s: a CSS class name wrapped in a <code> tag.
					esc_html__( 'Attempts to add labels to form fields that are missing them. Note: You may need to add custom styles targeting the %1$s class if adding labels affects your form layouts.', 'accessibility-checker' ),
					'<code>.edac-generated-label</code>'
				);
			?>
		</p>
		<?php
	}
}
