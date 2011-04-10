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
        // prune out any dupes
        var existingImageUrls = [];
        for(var i = 0; i < images.length; i++) {
          var currentImg = images[i];
          var imgSrc = currentImg.src;
          if(existingImageUrls[imgSrc]) {
            images.splice(i, 1);
            i--;
          } else {
            existingImageUrls[imgSrc] = 1;
            // in case it has a silly width or height
            currentImg.style.width = "";
            currentImg.style.height = "";
          }
        }
        container.append(images);
        $(a).siblings('.toggle').last().after(container);
        container.slideDown(600);
      };
      fetchImages(a, callback);
    }
    toggleText($(a).siblings('.toggle')[0]);
  };

  var checkForLink = function(a) {
    var url = a.href;
    var callback = function(html) {
      var anchors = $(html).filter(function(i) { return this.id === 'userbody' }).find('a');
      var anchorsLen = anchors.length;
      if(anchorsLen > 0) {
        // if there are any anchors with no <small> parents, there are links in the text
        var addressAnchors = anchors.filter(function(i) { return $(this).parent('small').length > 0; });
        addressAnchorsLen = addressAnchors.length;
        var text = "has address!";
        var titleLink = anchors.first();
        if(anchorsLen > addressAnchorsLen) {
          text = addressAnchorsLen > 0 ? "has links and address!" : "has links!";
          for(var i = 0, len = anchors.length; i < len; i++) {
            if(!$.inArray(anchors[i], addressAnchors)) {
              titleLink = anchors[i];
              break;
            }
          }
        }
        $(a).siblings('.possible').first().replaceWith('<a href="'+url+'" class="helpfulText found" title="'+anchors.first().attr('href')+'">'+text+'</a>');
      } else {
        $(a).siblings('.possible').first().replaceWith('<span class="helpfulText nope">no links</span>');
      }
    };

    $.ajax( {
      'url' : url,
      'success' : callback,
      'dataType' : 'html'
      } );
  };

  var addFetchImagesLink = function(a) {
    var url = a.href;
    var toggleLink = $('<a class="helpfulText toggle" href="'+url+'">show images</a>');
    toggleLink.click(function(e) {
      toggleImages(a);
      e.stopPropagation();
      e.preventDefault();
    });
    $(a).siblings("*:not('br')").last().after(toggleLink);
  };

  var addCheckForLinksLink = function(a) {
    var url = a.href;
    var checkLink = $('<a class="helpfulText possible" href="'+url+'">check for links</a>');
    checkLink.click(function(e) {
      checkForLink(a);
      e.stopPropagation();
      e.preventDefault();
    });
    $(a).siblings('*:not("br")').last().after(checkLink);
  };

  var addLinks = function() {
    var imgEntries = $('.p');
    var i, len, entry, a;
    for(i = 0, len = imgEntries.length; i < len; i++) {
      entry = imgEntries[i];
      a = $(entry).siblings('a')[0];
      addFetchImagesLink(a);
    }
    var nonImgEntries = $('p').not(function(i) {
      return $(this).find('.p').length > 0;
    });
    for(i = 0, len = nonImgEntries.length; i < len; i++) {
      entry = nonImgEntries[i];
      a = $('a', entry)[0];
      addCheckForLinksLink(a);
    }
  };

  $(document).ready( function() {
    addLinks();
  } );
}