const FocusOutlineFixData = window.edac_frontend_fixes?.focus_outline || {
	enabled: false,
};

const FocusOutlineFix = () => {
	if ( ! FocusOutlineFixData.enabled ) {
		//return;
	}
};

export default FocusOutlineFix;
