var isEditing = false;
var dels = new Array();

jQuery(document).ready(function() {
  // order
  jQuery('#rgallery-edit-photos-list').sortable({
    placeholder: 'rgallery-placeholder', 
    handle: '.rgallery-edit-photo-image img', 
    tolerance: 'pointer',
    revert: true
  });
  // save button
  jQuery('#rgallery-edit-photos-buttons input#rgallery-save-button').click(function() { saveEdit(); });
  // cancel button
  jQuery('#rgallery-edit-photos-buttons input#rgallery-cancel-button').click(function() { cancelEdit(); });
  
  // edit title
  setEditableInput();
  // tag
  initTagInput();
});

function setEditableInput() {
  isEditing = false;
  
  jQuery('div.rgallery-edit-photo-description-wrapper div').each(function(index) {
    jQuery(this).click(function() {
      if (!isEditing) {
        var parent = jQuery(this).parent()[0];
        var id = parent.id.replace('rgallery-edit-photo-description-', '');
        var oldval = jQuery(parent).html();
        var html = jQuery(this).html() == 'Add a description' ? '' : jQuery(this).html();
        var textarea = jQuery('<textarea>'+ html.replace(/<br>|<br \/>|<br >/g, '\n') +'</textarea>');
        var buttons = jQuery('<input type="button" id="save-button" value="Save" /> <input type="button" id="cancel-button" value="Cancel" />');
        var buttonWrapper = jQuery('<div class="rgallery-buttons-wrapper edit-description-buttons"></div>').append(buttons);
        //jQuery(parent).html(textarea + buttons);
        jQuery(parent).empty().append(textarea).append(buttonWrapper);
        
        //jQuery('textarea').autogrow();
        jQuery(parent).find('textarea').focus();
        // save
        jQuery(parent).find('.edit-description-buttons input#save-button').click(function() { saveDescription(parent, id); });
        // cancel
        jQuery(parent).find('.edit-description-buttons input#cancel-button').click(function() {
          jQuery(parent).empty().append(oldval);
          setEditableInput();
        });
        isEditing = true;
      }
    });
  });
}

function saveDescription(parent, id) {
  if (id != 'undefined') {
    var content = jQuery(parent).find('textarea').val();
    jQuery(parent).html('<div class="rgallery-edit-photo-description">Saving...</div>');
    jQuery.post(Drupal.settings.basePath + 'rgallery/photo/save/'+id, { 'content': content }, function(result) {
      result = eval('('+result+')');
      // ok
      if (result.status == 200) {
        content = result.data == '' ? 'Add a description' : result.data;
        jQuery(parent).find('.rgallery-edit-photo-description').html(content.replace(/\n/g, '<br>'));
      }
      // permission
      else if (result.status == 403) {
        alert('Permission denied.');
        window.location.reload();
      }
    });
  }
  setEditableInput();
}

function initTagInput() {
  var placeHolderText = 'add new tag';
  // add autocomplete
  jQuery('.rgallery-input-tag').each(function() {
    var id = this.id.replace('rgallery-input-tag-', '');
    jQuery('<ul class="rgallery-autocomplete" id="rgallery-autocomplete-'+ id +'"></ul>').insertAfter(this).hide();
  });
  jQuery('.rgallery-input-tag')
  .click(function() {
    var id = this.id.replace('rgallery-input-tag-', '');
    var val = jQuery(this).val();
    console.log('click: '+id);
    console.log('val: '+val);
    if (val == placeHolderText) jQuery(this).val('');
    jQuery(this).css({'color': '#000', 'cursor': 'text' });
  })
  .blur(function() {
    var val = jQuery(this).val();
    var id = this.id.replace('rgallery-input-tag-', '');
    console.log('blur: '+id);
    console.log('val: '+val);
    if (val == '') {
      jQuery(this).css({'color': '#666', 'cursor': 'pointer' });
      jQuery(this).val(placeHolderText);
    }
  })
  .keyup(function(e) {
    // enter
    if (e.keyCode == 13 && jQuery(this).val() != '') {
      console.log('add new tag');
    }
    // esc
    else if (e.keyCode == 27) {
      jQuery(this).css({'color': '#666', 'cursor': 'pointer' });
      jQuery(this).val(placeHolderText);
      this.blur();
    }
    else {
      var id = this.id.replace('rgallery-input-tag-', '');
      var input = this;
      var autocomplete = jQuery('#rgallery-autocomplete-'+ id);
      console.log(autocomplete);
      jQuery.getJSON(Drupal.settings.basePath +'rgallery/get_tags', { 'text': jQuery(this).val() }, function(result) {
        //var json = eval('('+result+')');
        jQuery(autocomplete).empty();
        jQuery.each(result, function(tid, name) {
          jQuery('<li id="tags-'+ tid +'">'+ name +'</li>').prependTo(autocomplete).click(function() {
            jQuery(input).val(jQuery(this).html());
            jQuery(autocomplete).hide();
          });
        });
        jQuery(autocomplete).show();
      });
    }
    console.log('keycode: '+e.keyCode);
  });
}

function saveEdit() {
  // disable button
  jQuery('#rgallery-edit-photos-buttons input').attr('disabled', 'disabled');
  
  // process
  var order = new Array();
  var thumbnail = jQuery('input[name=thumbnail]:checked')[0].id.replace('thumbnail-', '');
  jQuery('#rgallery-edit-photos-list > li').each(function(index, obj) {
    order[index] = obj.id.replace('rgallery-edit-photo-', '');
  });
  if (order.length > 0) {
    jQuery.post(Drupal.settings.basePath + 'rgallery/album/save/'+Drupal.settings.rgallery.aid, { 'order': order.toString(), 'thumbnail': thumbnail }, function(result) {
      result = eval('('+result+')');
      if (result.status == 200) {
        window.location = Drupal.settings.basePath + 'node/' + Drupal.settings.rgallery.aid;
        //jQuery('#rgallery-edit-photos-buttons input').removeAttr('disabled');
      }
      else if (result.status == 400) {
        alert('Update error!');
        window.reload();
      }
      else if (result.status == 403) {
        alert('Access denied.');
        //window.location = Drupal.settings.basePath + 'user';
        window.reload();
      }
    });
  }
}

function cancelEdit() {
  // disable button
  jQuery('.rgallery-edit-photos-buttons input').attr('disabled', 'disabled');
  window.location = Drupal.settings.basePath + 'node/' + Drupal.settings.rgallery.aid;
}
