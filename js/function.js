var _fid = new Array();

function setScrollable() {
  $('div.scrollable').scrollable({
    next: 'div.nextPage',
    prev: 'div.prevPage',
  });
}

function setOperators() {
  //$('div#rzgallery-photostream').css('display', 'none');
  $('div#rzgallery-photostream').addClass('rzgallery-image-disabled');
  // mode
  $('div#rzgallery-sort-mode').click(function() {
    $(this).removeClass('mode-selected').addClass('mode-selected');
    $('div#rzgallery-select-mode').removeClass('mode-selected');
    $('div.rzgallery-op-button').addClass('op-enabled');
    mode = SORT_MODE;
    // set sortable to set's image
    $('div#rzgallery-set-image ul').sortable().sortable('enable');
    // clear selected item for photostream
    
    // slide toggle photostream (disabled)
    $('div#rzgallery-photostream').addClass('rzgallery-image-disabled');
    $('div#rzgallery-photostream ul li').removeClass('rzgallery-image-selected');
  })
  $('div#rzgallery-select-mode').click(function() {
    $(this).removeClass('mode-selected').addClass('mode-selected');
    $('div#rzgallery-sort-mode').removeClass('mode-selected');
    $('div.rzgallery-op-button').addClass('op-enabled');
    mode = SELECT_MODE;
    // disable sortable for set's image
    $('div#rzgallery-set-image ul').sortable('disable');
    // slide toggle photostream (enabled)
    $('div#rzgallery-photostream').removeClass('rzgallery-image-disabled');
    $('div#rzgallery-photostream ul li').removeClass('rzgallery-image-selected');
  })
  // operator
  // add
  $('div.rzgallery-add').click(function() {
    
  })
  // remove
  // thumbnail
  // clear
  // save
  // cancel
}
