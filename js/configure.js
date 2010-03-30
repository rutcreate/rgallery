$(document).ready(
  function() {
    // lastupdate
    var lastupdate = $('div#rz-images-in-set').html();
    // selectable
    BindSelectable('div#rz-images-list div, div#rz-images-in-set div');
    
    // add button
    $('#add-button').click(
      function() {
        $('div#rz-images-list div.selected').each(
          function() {
            $(this).removeClass('selected').addClass('disabled');
            var tag = '<div id="' + $(this).attr('id') + '">' + $(this).html() + '</div>';
            $('div#rz-images-in-set').html($('div#rz-images-in-set').html() + tag);
            BindSelectable('div#rz-images-in-set div');
          }
        );
      }
    );
    
    // remove button
    $('#rz-remove-button').click(
      function() {
        $('div#rz-images-in-set div.selected').each(
          function() {
            $('div#rz-images-list div#' + $(this).attr('id')).removeClass('disabled');
            $(this).remove();            
          }
        );
      }
    );
    
    // save button
    $('#rz-save-button').click(
      function() {
        var pids = new Array();
        $('div#rz-images-in-set div').each(
          function() {
            pids[pids.length] = $(this).attr('id');
          }
        );
        $.post(
          Drupal.settings.basePath + 'rzgallery/sets/save_data', 
          { 'sid': Drupal.settings.nodeId, 'pids': pids.toString() }, 
          function(result) {
            // success
            if (result == 1) {
              lastupdate = $('div#rz-images-in-set').html();
              BindSelectable('div#rz-images-in-set div');
            }
            // passing error
            else if (result == 2) {
            
            }
            // no post
            else if (result == 3) {
            
            }
          }
        );
      }
    );
    
    // thumbnail
    $('#rz-thumbnail-button').click(function() {
      var first = $('div#rz-images-in-set div.selected')[0];
      $.post(Drupal.settings.basePath + 'rzgallery/sets/thumbnail', { 'sid': Drupal.settings.nodeId, 'pid': $(first).attr('id') }, function(result) {
        if (result == 1) {
          $('div#rz-images-in-set div').removeClass('thumbnail');
          $('div#rz-images-in-set div#' + $(first).attr('id')).addClass('thumbnail');
        }
        else {
          alert('Failed to set thumbnail');
        }
      });
    });
    
    // cancel button 
    $('div#rz-cancel-button').click(
      function() {
        $('div#rz-images-in-set').html(lastupdate);
        BindSelectable('div#rz-images-in-set div');
      }
    );
    
    // select all
    $('div#rz-selectall-button').click(
      function() {
        $('div#rz-images-in-set div').addClass('selected');
      }
    );
    
    // deselect all
    $('div#rz-deselectall-button').click(
      function() {
        $('div#rz-image-in-set div').removeClass('selected');
      }
    );
    
  }
);

function BindSelectable(selector) {
  $(selector).click(
    function() {
      $(this).toggleClass('selected');
    }
  );
}
