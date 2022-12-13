(function ($) {
  "use strict";

  $(function () {

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

    var edac_id = getUrlParameter('edac');
    edac_frontend_highlight_ajax(edac_id);


    function edac_frontend_highlight_ajax(edac_id) {
        $.ajax({
            url: edac_script_vars.ajaxurl,
            method: 'GET',
            data: { action: 'edac_frontend_highlight_ajax', id: edac_id, nonce: edac_script_vars.nonce }
        }).done(function( response ) {
            if( true === response.success ) {
                let response_json = $.parseJSON( response.data );

                console.log(response_json);

                var html = $.parseHTML( response_json );

                var nodeName = html[0].nodeName;
            
                console.log(html);
                console.log(nodeName);

                var id = html[0]['id'];
                var classes = html[0]['classList']['value'];
                var innerText = html[0]['innerText'];

                //console.log(html[0]['attributes']);

                var element_selector = nodeName;
                var atributes_allowed = ['href','src', 'alt', 'aria-hidden', 'role', 'focusable'];
                
                
                if(id && nodeName != 'IMG'){
                element_selector += '#'+id;
                }
                if(classes && nodeName != 'IMG'){
                element_selector += '.'+classes.replace(" ",".");
                }
                if(innerText && nodeName == 'A'){
                element_selector += ":contains('"+innerText+"')";
                }
                

                var attribute_selector = '';
                $(html[0]['attributes']).each(function( i ) {
                //console.log(this.nodeName);
                //console.log(this.nodeValue);
                if(jQuery.inArray(this.nodeName, atributes_allowed) !== -1 && this.nodeValue != ''){
                    attribute_selector += '['+this.nodeName+'="'+this.nodeValue+'"]';
                }
                });
                //console.log('attribute_selector:'+attribute_selector);

                element_selector += attribute_selector;


                console.log('Selector:'+element_selector);

                var element = $(element_selector);
                element.css('outline','3px dashed red').css('outline-offset','2px');
                element.focus();

                $([document.documentElement, document.body]).animate({
                    scrollTop: $(element).offset().top-50
                }, 0);
            
            } else {
                console.log(response);
            }
        });
    }

  });
})(jQuery);
