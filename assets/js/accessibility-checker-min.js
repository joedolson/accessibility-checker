!function($){"use strict";$((function(){!function(t){$.ajax({url:edac_script_vars.ajaxurl,method:"GET",data:{action:"edac_frontend_highlight_ajax",id:t,nonce:edac_script_vars.nonce}}).done((function(t){if(!0===t.success){let d=$.parseJSON(t.data);console.log(d);var e=$.parseHTML(d.object),i=e[0].nodeName;console.log(e),console.log(i);var a=e[0].id,o=e[0].classList.value,n=e[0].innerText,l=i,h=["href","src","alt","aria-hidden","role","focusable","width","height"];a&&"IMG"!=i&&(l+="#"+a),o&&"IMG"!=i&&(l+="."+o.replace(" ",".")),n&&"A"==i&&(l+=":contains('"+n+"')");var c="";$(e[0].attributes).each((function(t){-1!==jQuery.inArray(this.nodeName,h)&&""!=this.nodeValue&&(c+="["+this.nodeName+'="'+this.nodeValue+'"]')})),l+=c,console.log("Selector:"+l);var s=$(l);if(s.length){var r;function g(t){t.next(".edac-highlight-tooltip").fadeIn();var e=t.position(),i=e.left+t.width()+10,a=e.top;t.next(".edac-highlight-tooltip").css({left:i+"px",top:a+"px"})}function u(){r=setTimeout((function(){$(".edac-highlight-tooltip").fadeOut(400)}),400)}"error"==d.ruletype?"red":"warning"==d.ruletype&&"orange",s.wrap('<div class="edac-highlight edac-highlight-'+d.ruletype+'"></div>'),s.before('<div class="edac-highlight-tooltip-wrap"><button class="edac-highlight-btn edac-highlight-btn-'+d.ruletype+'" aria-label="'+d.rule_title+'" aria-expanded="false" aria-controls="edac-highlight-tooltip-'+d.id+'"></button><div class="edac-highlight-tooltip" id="edac-highlight-tooltip-'+d.id+'"><strong class="edac-highlight-tooltip-title">'+d.rule_title+'</strong><a href="'+d.link+'" class="edac-highlight-tooltip-reference" target="_blank" aria-label="Read documentation for '+d.rule_title+', opens new window"><span class="dashicons dashicons-info"></span></a><br /><span>'+d.summary+"</span></div></div>"),$([document.documentElement,document.body]).animate({scrollTop:$(s).offset().top-50},0),$(".edac-highlight-tooltip").hide(),$(".edac-highlight-btn").mouseover((function(){g($(this)),clearTimeout(r),$(this).next(".edac-highlight-tooltip").fadeIn(400)})).mouseout(u),$(".edac-highlight-tooltip").mouseover((function(){clearTimeout(r)})).mouseout(u),$(".edac-highlight-btn").click((function(){g($(this)),"false"==$(this).attr("aria-expanded")?($(this).next(".edac-highlight-tooltip").fadeIn(400),$(this).attr("aria-expanded","true")):($(this).next(".edac-highlight-tooltip").fadeOut(400),$(this).attr("aria-expanded","false"))})),$(".edac-highlight-btn",s.parent()).focus()}else alert("Accessibility Checker con not find the element on the page.")}else console.log(t)}))}(function(t){var e,i,a=window.location.search.substring(1).split("&");for(i=0;i<a.length;i++)if((e=a[i].split("="))[0]===t)return void 0===e[1]||decodeURIComponent(e[1]);return!1}("edac"))}))}(jQuery);