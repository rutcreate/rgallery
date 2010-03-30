var pids = new Array();

function appendNewPhoto(data) {
  // prepare data
  var filename = data.filename;
  var filepath = data.imgcache;
  var pid = data.pid;
  var aid = data.aid;
  // collect pid
  pids[pids.length] = pid;
  
  // add new photo
  var li = '<li>';
	li += '<div class="image"><img src="' + Drupal.settings.basePath + filepath + '" title="' + filename + '" alt="' + filename + '" class="imagecache" /></div>';
  li += '<div class="information"><input type="text" id="rgallery-image-title-' + pid + '" class="rgallery-image-title" value="' + filename + '" />';
	li += '<textarea id="rgallery-image-description-' + pid + '" class="rzgallery-image-description" rows="3"></textarea></div>';
	li += '</li>';
	
	$('ul#new-photos-list').show();
	$('ul#new-photos-list').append(li);
	
	// add button
	addButton(aid);
}

function addButton(aid) {
  if($('input#rgallery-save-button').length == 0) {
    var saveButton = '<div id="rgallery-button"><input type="button" id="rgallery-save-button" value="Save" /> ';
    var saveExitButton = '<input type="button" id="rgallery-save-exit-button" value="Save and exit" /></div>';
    $('ul#new-photos-list').after(saveButton + saveExitButton);
    // add event
    $('input#rgallery-save-button').click(function() {
      saveData(false);
    });
    $('input#rgallery-save-exit-button').click(function() {
      saveData(Drupal.settings.basePath + 'node/'+ aid);
    })
  }
}

function saveData(redirect) {
  var titles = new Array();
  var descs = new Array();
  for(var i = 0; i < pids.length ; i++) {
    titles[i] = $('input#rgallery-image-title-' + pids[i]).val();
    descs[i] = $('textarea#rgallery-image-description-' + pids[i]).val();
  }
  // POST JSON
  $.post(Drupal.settings.basePath + 'rgallery/photo/save', { "nids": pids.toString(), "titles": titles.toString(), "descriptions": descs.toString() }, function(result) {
    // clear
    pids = new Array();
    titles = new Array();
    descs = new Array();
    if (redirect) {
      window.location = redirect;
    }
    else {
      $('ul#new-photos-list').fadeOut(2000, function() {
        $(this).children().remove();
      });
      $('div#rgallery-button').remove();
    }
    //$('input#rzgallery-save-button, input#rzgallery-save-exit-button').remove();
    //alert(result);
  });
}
