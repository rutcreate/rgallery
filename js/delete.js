jQuery(document).ready(function() {
  jQuery('#rgallery-edit-photos-list li')
  .mouseover(function() {
    jQuery(this).find('.rgallery-delete').show();
  })
  .mouseout(function() {
    jQuery(this).find('.rgallery-delete').hide();
  });
  // delete
  jQuery('.rgallery-delete').click(function() {
    if (confirm('Do you want to remove this photo?')) {
      var id = this.id.replace('delete-', '');
      //dels[dels.length] = id;
      jQuery.getJSON(Drupal.settings.basePath + 'rgallery/photo/delete/'+id, { 'pid': id }, function(result) {
        if (result.status == 200) {
          jQuery('#rgallery-edit-photo-'+id).fadeOut(1000, function() {
            // set new thumbnail
            if (result.data.new_thumbnail != 'null') {
              jQuery('#thumbnail-'+result.data.new_thumbnail).attr('checked', true);
            }
          });
          // if has no photo left, redirect to view page
          if (result.data.count == 0) {
            window.location = Drupal.settings.basePath + 'node/'+ Drupal.settings.rgallery.aid;
          }
        }
        else if (result.status == 403) {
          alert('Permission denied.');
          window.location = Drupal.settings.basePath + 'user';
        }
        else if (result.status == 400) {
          alert('Cannot delete.');
        }
      });
    }
  });
});
