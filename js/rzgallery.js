// for upload page
var _fid = new Array();
// for photostream page
var isEditing = false;
// for configue page
// mode
var SORT_MODE = 1;
var SELECT_MODE = 2;
var mode = 0;
// confirm
var isChanged = false;

$(document).ready(
  function() {
    setScrollable();
    setEditableInput();
    setSelectableImage();
    setOperators();
  }
);

function setScrollable() {
  $('div#rzgallery-photostream').scrollable({
    size: 5,
  });
}

function setOperators() {
  $('div#rzgallery-photostream').css('display', 'none');
  // mode
  $('div#rzgallery-sort-mode').click(function() {
    $(this).removeClass('mode-selected').addClass('mode-selected');
    $('div#rzgallery-select-mode').removeClass('mode-selected');
    $('div.rzgallery-op-button').addClass('op-enabled');
    mode = SORT_MODE;
    // set sortable to set's image
    $('div#rzgallery-set-image ul').sortable().sortable('enable');
    // clear selected item for photostream
    
    // slide toggle photostream
    $('div#rzgallery-photostream').slideUp(1000);
  })
  $('div#rzgallery-select-mode').click(function() {
    $(this).removeClass('mode-selected').addClass('mode-selected');
    $('div#rzgallery-sort-mode').removeClass('mode-selected');
    $('div.rzgallery-op-button').addClass('op-enabled');
    mode = SELECT_MODE;
    // disable sortable for set's image
    $('div#rzgallery-set-image ul').sortable('disable');
    // slide toggle photostream
    $('div#rzgallery-photostream').slideDown(1000, function() {
      // clear selected item
    });
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

function setSelectableImage() {
  $('div#rzgallery-photostream ul li').click(function() {
    selectRzImage($(this));
  })
}

function setEditableInput() {
  isEditing = false;
  $('div[id^=rzgallery-image-title]').each(function(index) {
    $(this).click(function() {
      if(isEditing == false) {
        var id = $(this).attr('id').replace('rzgallery-image-title-', '');
        var textbox = '<div id="editable-' + id + '"><input type="text" style="width: 100%;" value="'+$(this).html()+'" />';
        var button = '<div><input type="button" value="SAVE" class="rzgallery-save-editable-button" /> OR <a href="#" class="rzgallery-cancel-editable-button">Cancel</a></div></div>';
        var oldval = $(this).html();
        $(this).after(textbox + button).remove();
        $('.rzgallery-save-editable-button').click(function() { saveChanges(this, false, id, 'title'); });
        $('.rzgallery-cancel-editable-button').click(function() { saveChanges(this, oldval, id, 'title'); });
        isEditing = true;
      }
    });
  });
  $('div[id^=rzgallery-image-description]').each(function(index) {
    $(this).click(function() {
      if(isEditing == false) {
        var id = $(this).attr('id').replace('rzgallery-image-description-', '');
        var textbox = '<div><textarea rows="3" style="width: 100%;">'+$(this).html().replace(/<br>|<br \/>|<br >/g, '\n')+'</textarea>';
        var button = '<div><input type="button" value="SAVE" class="rzgallery-save-editable-button" /> OR <a href="#" class="rzgallery-cancel-editable-button">Cancel</a></div></div>';
        var oldval = $(this).html();
        $(this).after(textbox + button).remove();
        $('.rzgallery-save-editable-button').click(function() { saveChanges(this, false, id, 'description'); });
        $('.rzgallery-cancel-editable-button').click(function() { saveChanges(this, oldval, id, 'description'); });
        isEditing = true;
      }
    });
  });
}

function saveChanges(obj, cancel, id, type) {
  // saving text
  element = '<div id="rzgallery-image-' + type + '-' + id + '" class="rzgallery-editable-' + type +'">Saving...</div>';
  $(obj).parent().parent().after(element).remove();
  if (cancel == false) {
		var t = $(obj).parent().siblings(0).val();
		$.post(Drupal.settings.basePath + 'rzgallery/photostream/savedata', { 'type': type, 'content': t, 'fid': id }, function(result) {
		  if (t == '') t = 'click here to add ' + type + '.';
			$('#rzgallery-image-'+ type + '-' + id).html(t.replace(/\n/g, '<br>'));
			//var timeout = setTimeout("$('#image-"+type+id+"').html('"+t.replace('\\','\\\\')+"')", 1000);
		});
	}
	else {
	  $('#rzgallery-image-' + type + '-' + id).html(cancel);
	}
	setEditableInput();
}

function addEntry(data) {
  var filename = data.filename;
	var filepath = data.filepath;
	var fid = data.fid;
	var imgcache = data.imgcache;
	// add to new entry box
	var li = '<li>';
	li += '<div><input type="text" id="rzgallery-image-title-' + fid + '" class="rzgallery-image-title" value="' + filename + '" /></div>';
	li += '<div>' + imgcache + '</div>';
	li += '<div><textarea id="rzgallery-image-description-' + fid + '" class="rzgallery-image-description" rows="3"></textarea></div>';
	li += '</li>';
	if($('ul#box-new-entry').length == 0) {
	  $('form#rzgallery-photostream-upload').after('<ul id="box-new-entry" style="display: none"></ul>');
	}
  $('ul#box-new-entry').slideDown(1000);
  $('ul#box-new-entry').append(li);
	
	// store fid
	_fid[_fid.length] = fid;
	addButton();
}

function addButton() {
  if($('input#rzgallery-save-button').length == 0) {
    var saveButton = '<div><input type="button" id="rzgallery-save-button" value="Save" /> ';
    var saveUploadButton = '<input type="button" id="rzgallery-save-upload-button" value="Save and upload" /></div>';
    $('ul#box-new-entry').after(saveButton + saveUploadButton);
    // add event
    $('input#rzgallery-save-button').click(function() {
      saveData();
      window.location = Drupal.settings.basePath + 'rzgallery/images';
    });
    $('input#rzgallery-save-upload-button').click(function() {
      saveData();
    })
  }
}

function saveData() {
  var title = new Array();
  var desc = new Array();
  for(var i = 0; i < _fid.length ; i++) {
    title[i] = $('input#rzgallery-image-title-' + _fid[i]).val();
    desc[i] = $('textarea#rzgallery-image-description-' + _fid[i]).val();
  }
  $.post(Drupal.settings.basePath + 'rzgallery/images/savedata', { "fid": _fid.toString(), "title": title.toString(), "description": desc.toString() }, function(result) {
    _fid = new Array();
    title = new Array();
    desc = new Array();
    $('ul#box-new-entry').slideUp(2000, function() {
      $(this).children().remove();
    });
    $('input#rzgallery-save-button, input#rzgallery-save-upload-button').remove();
    alert(result);
  });
}

function selectRzImage(obj) {
  $(obj).toggleClass('rzgallery-image-selected');
  if($('.rzgallery-image-selected').size() == 0) {
    // disabled add button
  }
}
