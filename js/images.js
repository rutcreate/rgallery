//var isEditing = false;

$(document).ready(function() {
  setEditableInput();
});

function setEditableInput() {
  isEditing = false;
  $('div[id^=rzgallery-images-image-title]').each(function(index) {
    $(this).click(function() {
      if(isEditing == false) {
        var id = $(this).attr('id').replace('rzgallery-images-image-title-', '');
        var textbox = '<div id="editable-' + id + '"><input type="text" style="width: 100%;" value="'+$(this).html().replace('click here to add title.', '')+'" />';
        var button = '<div><input type="button" value="SAVE" class="rzgallery-save-editable-button" /> OR <input type="button" value="CANCEL" class="rzgallery-cancel-editable-button" /></div></div>';
        var oldval = $(this).html();
        $(this).after(textbox + button).remove();
        $('.rzgallery-save-editable-button').click(function() { saveChanges(this, false, id, 'title'); });
        $('.rzgallery-cancel-editable-button').click(function() { saveChanges(this, oldval, id, 'title'); });
        isEditing = true;
      }
    });
  });
  $('div[id^=rzgallery-images-image-desc]').each(function(index) {
    $(this).click(function() {
      if(isEditing == false) {
        var id = $(this).attr('id').replace('rzgallery-images-image-desc-', '');
        var textbox = '<div><textarea rows="3" style="width: 100%;">'+$(this).html().replace(/<br>|<br \/>|<br >/g, '\n').replace('click here to add description.', '')+'</textarea>';
        var button = '<div><input type="button" value="SAVE" class="rzgallery-save-editable-button" /> OR <input type="button" value="CANCEL" class="rzgallery-cancel-editable-button" /></div></div>';
        var oldval = $(this).html();
        $(this).after(textbox + button).remove();
        $('.rzgallery-save-editable-button').click(function() { saveChanges(this, false, id, 'desc'); });
        $('.rzgallery-cancel-editable-button').click(function() { saveChanges(this, oldval, id, 'desc'); });
        isEditing = true;
      }
    });
  });
}

function saveChanges(obj, cancel, id, type) {
  // saving text
  element = '<div id="rzgallery-images-image-' + type + '-' + id + '" class="rzgallery-editable-' + type +'">Saving...</div>';
  $(obj).parent().parent().after(element).remove();
  if (cancel == false) {
		var t = $(obj).parent().siblings(0).val().replace('click here to add description.', '');
		$.post(Drupal.settings.basePath + 'rzgallery/images/save_data', { 'type': type, 'content': t, 'fid': id }, function(result) {
		  if (t == '') t = 'click here to add ' + type + '.';
			$('#rzgallery-images-image-'+ type + '-' + id).html(t.replace(/\n/g, '<br>'));
			//var timeout = setTimeout("$('#image-"+type+id+"').html('"+t.replace('\\','\\\\')+"')", 1000);
		});
	}
	else {
	  $('#rzgallery-images-image-' + type + '-' + id).html(cancel);
	}
	setEditableInput();
}
