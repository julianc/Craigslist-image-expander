if(jQuery) {

	var fetchImages = function(a, callback) {
          var _callback = function(html) {
            callback($(html).find('img'));
          };
          $.ajax( {
            'url' : a.href,
            'success' : _callback,
            'dataType' : 'html'
            } );
	};

        var getImagesContainer = function(a) {
          return $(a).siblings('.container')[0];
        };

        var toggleText = function(toggleElement) {
          if(toggleElement.innerText === 'show images') {
            toggleElement.innerText = 'hide images';
          } else {
            toggleElement.innerText = 'show images';
          }
        };

        var toggleImages = function(a) {
          var container = getImagesContainer(a);
          if(container) {
            // we already have the images, just toggle
            $(container).slideToggle(500);
          } else {
            // we need to fetch the images
            var callback = function(images) {
              var container = $('<div class="container" style="display:none"></div>');
              container.append(images);
              $(a).siblings('.toggle').last().after(container);
              container.slideDown(600);
            }
            fetchImages(a, callback);
          }
          toggleText($(a).siblings('.toggle')[0]);
        }

	var addFetchImagesLink = function(a) {
          var url = a.href;
          var toggleLink = $('<a class="toggle" href="'+url+'">show images</a>');
          toggleLink.click(function(e) {
            toggleImages(a);
            e.stopPropagation();
            e.preventDefault();
          });
          $(a).siblings().last().after(toggleLink).after($('<span>&nbsp;&nbsp;&nbsp;</span>'));
	};
	
	var addLinks = function() {
		var imgEntries = $('.p');
		for(var i = 0, len = imgEntries.length; i < len; i++) {
			var entry = imgEntries[i];
			var a = $(entry).siblings('a')[0];
			addFetchImagesLink(a);
		}
	}

	$(document).ready( function() {
		addLinks();
	} );
}