

import {computePosition, autoUpdate} from '@floating-ui/dom';
import { isFocusable, isTabbable } from 'tabbable';
import unique from 'unique-selector';


class AccessibilityCheckerDisableHTML {

	/**
	 * Constructor
	 */
	constructor() {
		this.disableStylesButton = document.querySelector('#edac-highlight-disable-styles');
		this.closePanel = document.querySelector('#edac-highlight-panel-controls-close');
		this.stylesDisabled = false;
		this.originalCss = [];
		this.init();
	}

	/**
	 * This function initializes the component by setting up event listeners.
	 */
	init() {
		this.disableStylesButton.addEventListener('click', () => {
			if (this.stylesDisabled) {
				this.enableStyles();
			} else {
				this.disableStyles();
			}
		});
		this.closePanel.addEventListener('click', () => this.enableStyles());
	}

	/**
	 * This function disables all styles on the page.
	 */
	disableStyles() {
		this.originalCss = Array.from(document.head.querySelectorAll('style[type="text/css"], style, link[rel="stylesheet"]'));

		var elementsWithStyle = document.querySelectorAll('*[style]:not([class^="edac"])');
		elementsWithStyle.forEach(function (element) {
			element.removeAttribute("style");
		});

		
		this.originalCss = this.originalCss.filter(function (element) {
			if (element.id === 'edac-app-css' || element.id === 'dashicons-css') {
				return false;
			}
			return true;
		});

		document.head.dataset.css = this.originalCss;
		this.originalCss.forEach(function (element) {
			element.remove();
		});

		document.querySelector('body').classList.add('edac-app-disable-styles');
	
		this.stylesDisabled = true;
		this.disableStylesButton.textContent = "Enable Styles";
	}

	/**
	 * This function enables all styles on the page.
	 */
	enableStyles() {
		this.originalCss.forEach(function (element) {
			if (element.tagName === 'STYLE') {
				document.head.appendChild(element.cloneNode(true));
			} else {
				const newElement = document.createElement('link');
				newElement.rel = 'stylesheet';
				newElement.href = element.href;
				document.head.appendChild(newElement);
			}
		});

	
		document.querySelector('body').classList.remove('edac-app-disable-styles');
	
		this.stylesDisabled = false;
		this.disableStylesButton.textContent = "Disable Styles";
	}
}


class AccessibilityCheckerHighlight {

	/**
	 * Constructor
	 */
	constructor() {
		this.addHighlightPanel();
		this.nextButton = document.querySelector('#edac-highlight-next');
		this.previousButton = document.querySelector('#edac-highlight-previous');
		this.panelToggle = document.querySelector('#edac-highlight-panel-toggle');
		this.closePanel = document.querySelector('#edac-highlight-panel-controls-close');
		this.panelDescription = document.querySelector('#edac-highlight-panel-description');
		this.panelControls = document.querySelector('#edac-highlight-panel-controls');
		this.descriptionCloseButton = document.querySelector('.edac-highlight-panel-description-close');
		this.issues = null;
		this.currentButtonIndex = 0;
		this.descriptionTimeout;
		this.urlParameter = this.get_url_parameter('edac');
		this.currentIssueStatus = null;
		this.tooltips = [];
		this.init();
	}
	
	/**
	 * This function initializes the component by setting up event listeners 
	 * and managing the initial state of the panel based on the URL parameter.
	 */
	init() {
		// Set focus highlight on buttons
		this.highlightButtonFocus();
		this.highlightButtonFocusOut();

		// Add event listeners for 'next' and 'previous' buttons
		this.nextButton.addEventListener('click', (event) => this.highlightFocusNext());
		this.previousButton.addEventListener('click', (event) => this.highlightFocusPrevious());

		// Manage panel open/close operations
		this.panelToggle.addEventListener('click', () => this.panelOpen());
		this.closePanel.addEventListener('click', () => this.panelClose());

		// Close description when close button is clicked
		this.descriptionCloseButton.addEventListener('click', () => this.descriptionClose());

		// Open panel if a URL parameter exists
		if(this.urlParameter){
			this.panelOpen();
		}
	}

	/**
	 * This function tries to find an element on the page that matches a given HTML snippet.
	 * It parses the HTML snippet, and compares the outer HTML of the parsed element 
	 * with all elements present on the page. If a match is found, it 
	 * adds a tooltip, checks if the element is focusable, and then returns the element.
	 * If no matching element is found, or if the parsed HTML snippet does not contain an element,
	 * it returns null.
	 *
	 * @param {Object} value - Object containing the HTML snippet to be matched.
	 * @param {number} index - Index of the element being searched.
	 * @returns {HTMLElement|null} - Returns the matching HTML element, or null if no match is found.
	 */
	findElement(value, index) {
	
		// Parse the HTML snippet
		const htmlSnippet = value.object;
		const parser = new DOMParser();
		const parsedHtml = parser.parseFromString(htmlSnippet, 'text/html');
		const firstParsedElement = parsedHtml.body.firstElementChild;
	
		// If there's no parsed element, return null
		if (!firstParsedElement) {
			return null;
		}
	
		// Compare the outer HTML of the parsed element with all elements on the page
		const allElements = document.body.querySelectorAll('*');
	
		for (const element of allElements) {
	
			if (element.outerHTML === firstParsedElement.outerHTML) {
				
				const tooltip = this.addTooltip(element, value, index);
				this.tooltips.push( tooltip );
				
				return element;
			}
		}
	
		// If no matching element is found, return null
		return null;
	}

	/**
	 * This function makes an AJAX call to the server to retrieve the list of issues.
	 *
	 * Note: This function assumes that `edac_script_vars` is a global variable containing necessary data.
	 */
	highlightAjax() {
		return new Promise(function (resolve, reject) {
			const xhr = new XMLHttpRequest();
			const url = edac_script_vars.ajaxurl + '?action=edac_frontend_highlight_ajax&post_id=' + edac_script_vars.postID + '&nonce=' + edac_script_vars.nonce;
		
			xhr.open('GET', url);

			xhr.onload = function() {
				if (xhr.status === 200) {
					const response = JSON.parse(xhr.responseText);
					//console.log(response);
					if (true === response.success) {
						const response_json = JSON.parse(response.data);
						resolve(response_json);

					} else {
						//console.log(response);
					}
				} else {
					console.log('Request failed.  Returned status of ' + xhr.status);

					reject({
						status: xhr.status,
						statusText: xhr.statusText
					});
				}
			};
			
			xhr.onerror = function () {
				reject({
					status: xhr.status,
					statusText: xhr.statusText
				  });
			}
		
			xhr.send();
		});
	}

	/**
	 * This function removes the highlight/tooltip buttons and runs cleanups for each.
	 */
	removeHighlightButtons() {
		
		this.tooltips.forEach( ( item ) => {
			
			//remove click listener
			item.tooltip.removeEventListener('click', item.listeners.onClick );

			//remove position/resize listener: https://floating-ui.com/docs/autoUpdate
			item.listeners.cleanup();

			//remove tooltip
			item.tooltip.remove();
		});

	}
	

	/**
	 * This function adds a new button element to the DOM, which acts as a tooltip for the highlighted element.
	 * 
	 * @param {HTMLElement} element - The DOM element before which the tooltip button will be inserted.
	 * @param {Object} value - An object containing properties used to customize the tooltip button.
	 * @param {Number} index - The index of the element being processed.
	 * @return {Object} - information about the tooltip
	 */
	addTooltip(element, value, index) {
			// Create the tooltip.
			let tooltip = document.createElement('button');
			tooltip.classList = 'edac-highlight-btn edac-highlight-btn-' + value.rule_type;
			tooltip.ariaLabel = value.rule_title;
			tooltip.ariaExpanded = 'false';
			//tooltip.ariaControls = 'edac-highlight-tooltip-' + value.id;
			tooltip.dataset.id = value.id;
			tooltip.dataset.elementId = value.id;
			
		
			const onClick = (e) => {
				const id = e.currentTarget.dataset.id;
				this.showIssue( id );
			};
			
			tooltip.addEventListener('click', onClick );
			
			
			// Add the tooltip to the page.
			document.body.append(tooltip);
	
			// Place the tooltip at the element's position on the page.
			// See: https://floating-ui.com/docs/autoUpdate
			
			function updatePosition() {
				computePosition(element, tooltip, {
					placement: 'left',
				}).then(({x, y, middlewareData, placement}) => {

					Object.assign(tooltip.style, {
						left: `${x - 32}px`,
						top: `${y}px`
					});
				});
			};
			const cleanup = autoUpdate(
				element,
				tooltip,
				updatePosition
			);

		
			return {
				element,
				tooltip,
				listeners : {
					onClick,
					cleanup
				}
			};
			
	}

	
	/**
	 * This function adds a new div element to the DOM, which contains the accessibility checker panel.
	 */
	addHighlightPanel() {
		const newElement = `
			<div class="edac-highlight-panel">
			<button id="edac-highlight-panel-toggle" class="edac-highlight-panel-toggle" title="Toggle accessibility tools"></button>
			<div id="edac-highlight-panel-description" class="edac-highlight-panel-description">
				<button class="edac-highlight-panel-description-close" aria-label="Close">×</button>
				<div class="edac-highlight-panel-description-title"></div>
				<div class="edac-highlight-panel-description-content"></div>
				<div id="edac-highlight-panel-description-code" class="edac-highlight-panel-description-code"><code></code></div>			
			</div>
			<div id="edac-highlight-panel-controls" class="edac-highlight-panel-controls">
				<button id="edac-highlight-panel-controls-close" class="edac-highlight-panel-controls-close" aria-label="Close accessibility highlights panel" aria-label="Close">×</button>
				<div class="edac-highlight-panel-controls-title">Accessibility Checker</div>
				<div class="edac-highlight-panel-controls-summary"></div>
				<div class="edac-highlight-panel-controls-buttons">
					<div>
						<button id="edac-highlight-previous"><span aria-hidden="true">« </span>Previous</button>
						<button id="edac-highlight-next">Next<span aria-hidden="true"> »</span></button><br />
					</div>
					<div>
						<button id="edac-highlight-disable-styles" class="edac-highlight-disable-styles">Disable Styles</button>
					</div>
				</div>
			
			</div>
			</div>
		`;
		
		document.body.insertAdjacentHTML('afterbegin', newElement);
	}

	/**
	 * This function highlights the next element on the page. It uses the 'currentButtonIndex' property to keep track of the current element.
	 */
	highlightFocusNext = () => {
		this.currentButtonIndex = (this.currentButtonIndex + 1) % this.issues.length;
		const id = this.issues[this.currentButtonIndex]['id'];
		this.showIssue(id);
	}
	
	
	/**
	 * This function highlights the previous element on the page. It uses the 'currentButtonIndex' property to keep track of the current element.
	 */
	highlightFocusPrevious = () => {
		this.currentButtonIndex = (this.currentButtonIndex - 1 + this.issues.length) % this.issues.length;
		const id = this.issues[this.currentButtonIndex]['id'];
		this.showIssue(id);

	}


	/**
	 * This function shows an issue related to an element.
	 * @param {string} id - The ID of the element.
	 */

	showIssue = ( id ) => {
			
		
		const issueElement = document.querySelector(`[data-id="${id}"]`);
		const element = document.querySelector(`[data-element-id="${id}"]`);
		
		//remove selected class from previously selected elements
		const selectedElements = document.querySelectorAll('.edac-highlight-btn-selected');
		selectedElements.forEach( (selectedElement) => {
			selectedElement.classList.remove('edac-highlight-btn-selected');
		});

		
		
		if (issueElement && element) {
			if (isFocusable(issueElement)) {
				issueElement.focus();
				issueElement.classList.add('edac-highlight-btn-selected');

				if (!this.checkVisibility(issueElement) || !this.checkVisibility(element)) {
					this.currentIssueStatus = 'The element is not visible. Try disabling styles.';
					console.log(`Element with id ${id} is not visible!`);
				} else {
					this.currentIssueStatus = null;
				}
				
			} else {
				this.currentIssueStatus = 'The element is not focusable. Try disabling styles.';
				console.log(`Element with id ${id} is not focusable!`);
		  	}
		} else {
		  this.currentIssueStatus = 'The element was not found on the page.';
		  console.log(`Element with id ${id} not found in the document!`);
		}
		
		this.description(id);


	}

	//TODO: unused.
	/**
	 * This function checks if a given element is potentially focusable.
	 * 
	 * @param {HTMLElement} element - The DOM element to check for potential focusability.
 	 * 
 	 * @returns {Boolean} - Returns 'true' if the element is potentially focusable, otherwise returns 'false'.
	 */
	isElementFocusable = (element) => {
		
		// check if the element has a parent and if the parent has a parent (grandparent)
		if (element.parentElement && element.parentElement.parentElement) {
			const grandparentElement = element.parentElement.parentElement;
	

			const style = window.getComputedStyle(grandparentElement);
			grandparentElement.style.display = 'block';
			grandparentElement.style.visibility = 'visible';
			return style.display !== 'none' && style.visibility !== 'hidden';
		}
		return false;
	}

	/**
	 * This function checks if a given element is visible on the page.
	 * 
	 * @param {HTMLElement} el The element to check for visibility
	 * @returns 
	 */
	checkVisibility = (el) => {
		//checkVisibility is still in draft but well supported on many browsers.
		//See: https://drafts.csswg.org/cssom-view-1/#dom-element-checkvisibility
		//See: https://caniuse.com/mdn-api_element_checkvisibility
		if(typeof(el.checkVisibility) !== 'function'){

			//See: https://github.com/jquery/jquery/blob/main/src/css/hiddenVisibleSelectors.js
			return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length );
	
		} else {
			return el.checkVisibility({
				checkOpacity: true,      // Check CSS opacity property too
				checkVisibilityCSS: true // Check CSS visibility property too
		});
		}
	}

	//TODO: unused.
	/**
	 * This function checks if a given element is visible on the page.
	 * 
	 * @param {HTMLElement} el The element to check for visibility
	 * @returns 
	 */
	isElementVisible(el) {
		const rect = el.getBoundingClientRect();
		const windowHeight =
		window.innerHeight || document.documentElement.clientHeight;
		const windowWidth =
		window.innerWidth || document.documentElement.clientWidth;
	
		return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= windowHeight &&
		rect.right <= windowWidth
		);
	}

	//TODO: unused.
	/**
	 * This function checks if a given element is hidden on the page.
	 * 
	 * @param {HTMLElement} el The element to check for visibility
	 * @returns 
	 */
	isElementHidden(el) {
		const style = window.getComputedStyle(el);
		return style.display === 'none';
	}

	/**
	 * This function opens the accessibility checker panel.
	 */
	panelOpen() {
		this.panelControls.style.display = 'block';
		this.panelToggle.style.display = 'none';
		
		// Get the issues for this page.
		this.highlightAjax().then(
			(json) => {

				//console.log(json);

				this.issues = json;
				const id = this.issues[this.currentButtonIndex]['id'];

				json.forEach(function(value, index) {
					
					const matchedElement = this.findElement(value, index);

				}.bind(this));


				this.showIssueCount();
				this.showIssue( id );
			}
		).catch((err) => {
			//TODO:
		});
	}

	/**
	 * This function closes the accessibility checker panel.
	 */
	panelClose() {
		this.panelControls.style.display = 'none';
		this.panelDescription.style.display = 'none';
		this.panelToggle.style.display = 'block';
		this.removeHighlightButtons();
	}

	/**
	 * This function highlights the button when it receives focus.
	 */
	highlightButtonFocus() {
		document.addEventListener('focusin', (event) => {
			const focusedElement = event.target;
			if (focusedElement.classList.contains('edac-highlight-btn')) {
			const highlightParent = focusedElement.closest('.edac-highlight');
			if (highlightParent) {
				highlightParent.classList.add('active');
				//focusedElement.scrollIntoView();
		
				const dataIssueId = focusedElement.getAttribute('data-id');
				this.description( dataIssueId );
				
				this.cancelDescriptionTimeout();
			}
			}
		});
	}

	/**
	 * 	* This function removes the highlight from the button when it loses focus.
	 */
	highlightButtonFocusOut() {
		document.addEventListener('focusout', (event) => {
			const unfocusedElement = event.target;
			if (unfocusedElement.classList.contains('edac-highlight-btn')) {
				const highlightParent = unfocusedElement.closest('.edac-highlight');
				if (highlightParent) {
					highlightParent.classList.remove('active');
					/*
					const description = document.querySelector('#edac-highlight-panel-description');
					this.descriptionTimeout = setTimeout(function() {
						description.style.display = 'none';
					}, 500); // 1000 milliseconds (1 second) delay
					*/
				}
			}
		});
	}

	/**
	 * This function cancels the description timeout.
	 */
	cancelDescriptionTimeout() {
		clearTimeout(this.descriptionTimeout);
	}

	/**
	 * This function displays the description of the issue.
	 * 
	 * @param {string} dataId 
	 */
	description( dataId ) {
		// get the value of the property by key
		const searchTerm = dataId;
		const keyToSearch = "id";
		const matchingObj = this.issues.find(obj => obj[keyToSearch] === searchTerm);

		if( matchingObj ) {
			const descriptionTitle = document.querySelector('.edac-highlight-panel-description-title');
			const descriptionContent = document.querySelector('.edac-highlight-panel-description-content');
			const descriptionCode = document.querySelector('.edac-highlight-panel-description-code code');
		
			let content = '';

			// Get the status of the issue
			if( this.currentIssueStatus ) {
				content += ` <div class="edac-highlight-panel-description-status">${this.currentIssueStatus}</div>`;
			}

			// Get the summary of the issue
			content += matchingObj.summary;

			// Get the link to the documentation
			content += ` <br /><a class="edac-highlight-panel-description-reference" href="${matchingObj.link}">Full Documentation</a>`;

			// Get the code button
			content += `<button class="edac-highlight-panel-description-code-button" aria-expanded="false" aria-controls="edac-highlight-panel-description-code">Affected Code</button>`;

			// title and content
			descriptionTitle.innerHTML = matchingObj.rule_title + ' <span class="edac-highlight-panel-description-type edac-highlight-panel-description-type-' + matchingObj.rule_type + '" aria-label=" Issue type: ' + matchingObj.rule_type + '"> ' + matchingObj.rule_type + '</span>';
			
			// content
			descriptionContent.innerHTML = content;

			// code object
			let textNode = document.createTextNode(matchingObj.object);
			descriptionCode.innerText = textNode.nodeValue;
			
			// set code button listener
			this.codeContainer = document.querySelector('.edac-highlight-panel-description-code');
			this.codeButton = document.querySelector('.edac-highlight-panel-description-code-button');
			this.codeButton.addEventListener('click', () => this.codeToggle());

			// close the code container each time the description is opened
			this.codeContainer.style.display = 'none';

			// show the description
			this.panelDescription.style.display = 'block';
		}
	}

	/**
	 * 	* This function retrieves the value of a given URL parameter.
	 * 
	 * @param {String} sParam The name of the URL parameter to be retrieved.
	 * @returns {String|Boolean} Returns the value of the URL parameter, or false if the parameter is not found.
	 */
	get_url_parameter(sParam) {
		let sPageURL = window.location.search.substring(1);
		let sURLVariables = sPageURL.split('&');
		let sParameterName, i;
		
		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');
		
			if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
			}
		}
		return false;
	};

	/**
	 * This function toggles the code container.
	 */
	codeToggle() {
		this.cancelDescriptionTimeout();
		if (this.codeContainer.style.display === 'none' || this.codeContainer.style.display === '') {
			this.codeContainer.style.display = 'block';
			this.codeButton.setAttribute('aria-expanded', 'true');
		} else {
			this.codeContainer.style.display = 'none';
			this.codeButton.setAttribute('aria-expanded', 'false');
		}
	};

	/**
	 * This function closes the description.
	 */
	descriptionClose() {
		this.panelDescription.style.display = 'none';
	}

	/**
	 * This function counts the number of issues of a given type.
	 * 
	 * @param {String} rule_type The type of issue to be counted.
	 * @returns {Number} The number of issues of a given type.
	 */
	countIssues( rule_type ) {
		let count = 0;
		for (let issue of this.issues) {
			if (issue.rule_type === rule_type) {
				count++;
			}
		}
		return count;
	}

	/**
	 * This function counts the number of ignored issues.
	 * 
	 * @returns {Number} The number of ignored issues.
	 */
	countIgnored() {
		let count = 0;
		for (let issue of this.issues) {
			if ( issue.ignored == 1) {
				count++;
			}
		}
		return count;
	}

	/**
	 * This function shows the count of issues in the panel.
	 */
	showIssueCount() {
		let errorCount = this.countIssues('error');
		let warningCount = this.countIssues('warning');
		let ignoredCount = this.countIgnored();
		let div = document.querySelector('.edac-highlight-panel-controls-summary');
	
		let textContent = 'No issues detected.';
		if (errorCount > 0 || warningCount > 0 || ignoredCount > 0) {
			textContent = '';
			if (errorCount > 0) {
				textContent += errorCount + ' error' + (errorCount > 1 ? 's' : '') + ', ';
			}
			if (warningCount > 0) {
				textContent += warningCount + ' warning' + (warningCount > 1 ? 's' : '') + ', ';
			}
			if (ignoredCount > 0) {
				textContent += 'and ' + ignoredCount + ' Ignored Issue' + (ignoredCount > 1 ? 's' : '') + ' detected.';
			} else {
				// Remove the trailing comma and add "detected."
				textContent = textContent.slice(0, -2) + ' detected.';
			}
		}
	
		div.textContent = textContent;
	}	

}


window.addEventListener('DOMContentLoaded', () => {
	if( true == edac_script_vars.active ) {
		new AccessibilityCheckerHighlight();
		new AccessibilityCheckerDisableHTML();
	}
});