if(jQuery) {
  var HAS_NOTHING = '0';
  var HAS_LINK = '1';
  var HAS_ADDRESS = '2';
  var HAS_LINK_AND_ADDRESS = '3';

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
    // Making the toggle link "visited" - should technically be done after we show the images,
    // but I think it's a better user experience and is more consistent with normal <a> tags
    $(a).siblings('.toggle')[0].className += ' seen';
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
        localStorage[a.href] = 1;
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
        var titleLink = anchors[0];
        if(anchorsLen > addressAnchorsLen) {
          if(addressAnchorsLen > 0) {
            text = "has links and address!";
            localStorage[url] = HAS_LINK_AND_ADDRESS;
          } else {
            text =  "has links!";
            localStorage[url] = HAS_LINK;
          }
          for(var i = 0, len = anchors.length; i < len; i++) {
            if(!$.inArray(anchors[i], addressAnchors)) {
              titleLink = anchors[i];
              break;
            }
          }
        } else {
          localStorage[url] = HAS_ADDRESS;
        }
        $(a).siblings('.possible').first().replaceWith('<a href="'+url+'" class="helpfulText found" title="'+titleLink.href+'">'+text+'</a>');
      } else {
        $(a).siblings('.possible').first().replaceWith('<span class="helpfulText nope">no links</span>');
        localStorage[a.href] = HAS_NOTHING;
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
    var cssClasses = 'helpfulText toggle';
    if(localStorage[a.href]) {
      cssClasses += ' seen';
    }
    var toggleLink = $('<a class="'+cssClasses+'" href="'+url+'">show images</a>');
    toggleLink.click(function(e) {
      toggleImages(a);
      e.stopPropagation();
      e.preventDefault();
    });
    $(a).siblings("*:not('br')").last().after(toggleLink);
  };

  var addCheckForLinksLink = function(a) {
    var url = a.href;
    var storedInfo = localStorage[url];
    var checkLink = $('<a class="helpfulText" href="'+url+'">check for links</a>');
    if(storedInfo === HAS_NOTHING) {
      checkLink.addClass('nope').text('no links');
    } else if(storedInfo === HAS_LINK) {
      checkLink.addClass('found').text('has links!');
    } else if(storedInfo === HAS_ADDRESS) {
      checkLink.addClass('found').text('has address!');
    } else if(storedInfo === HAS_LINK_AND_ADDRESS) {
      checkLink.addClass('found').text('has links and address!');
    } else {
      checkLink.addClass('possible');
    }
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