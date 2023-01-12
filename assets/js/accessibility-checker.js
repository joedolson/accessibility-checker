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

                var html = $.parseHTML( response_json.object );

                var nodeName = html[0].nodeName;
            
                console.log(html);
                console.log(nodeName);

                var id = html[0]['id'];
                var classes = html[0]['classList']['value'];
                var innerText = html[0]['innerText'];

                //console.log(html[0]['attributes']);

                var element_selector = nodeName;
                var atributes_allowed = ['href','src', 'alt', 'aria-hidden', 'role', 'focusable', 'width', 'height'];
                
                
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
                if(element.length){
                    var element_border_color = 'red';
                    if(response_json.ruletype == 'error'){
                        element_border_color = 'red';
                    }else if(response_json.ruletype == 'warning'){
                        element_border_color = 'orange';
                    }
                    //element.css('outline','5px solid '+element_border_color).css('outline-offset','2px');
                    

                    element.wrap('<div class="edac-highlight edac-highlight-'+response_json.ruletype+'"></div>');


                    element.before('<div class="edac-highlight-tooltip-wrap" style="border: solid 1px red;"><button class="edac-highlight-btn edac-highlight-btn-'+response_json.ruletype+'" aria-label="'+response_json.rule_title+'"></button><div class="edac-highlight-tooltip"><strong>'+response_json.rule_title+'</strong><a href="'+response_json.link+'" class="" target="_blank" aria-label="Read documentation for '+response_json.rule_title+', opens new window"><span class="dashicons dashicons-info"></span></a><br /><span>'+response_json.summary+'</span></div></div>');

                    var is_hovered = false;

                    $(".edac-highlight-btn").mouseover(function(e) {
                        //$(this).parent('.edac-highlight-tooltip').show();
                        console.log( $(this).parent().next(".edac-highlight-tooltip"));
                        $(this).next(".edac-highlight-tooltip").fadeIn();
                        var position = $(this).position();
                        var x = position.left + $(this).width();
                        var y = position.top;

                        $(this).next(".edac-highlight-tooltip").css( { left: x + "px", top: y + "px" } );

                        $(this).next(".edac-highlight-tooltip").mouseover(function(e) {
                            is_hovered = true;
                            console.log(is_hovered);
                        });
                        // $(this).next(".edac-highlight-tooltip").mouseout(function(e) {
                        //     is_hovered = false;
                        //     console.log(is_hovered);
                        // });

                    });

                    $(".edac-highlight-tooltip-wrap").mouseleave(function(e) {
                        //if(is_hovered == false){
                            $(this).next(".edac-highlight-tooltip").fadeOut();
                        //}
                    });

                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(element).offset().top-50
                    }, 0);

                    element.focus();
                    
                }else{
                    alert('Accessibility Checker con not find the element on the page.');
                }                
            
            } else {
                console.log(response);
            }
        });
    }


  });
})(jQuery);
