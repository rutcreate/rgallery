$(document).ready(function() {
  $('#rgallery-organize-photos-list').sortable({
    tolerance: 'pointer',
    placeholder: 'rgallery-placeholder',
    revert: true
  });
  
  // save button
  $('.rgallery-organize-buttons input#rgallery-save-button').click(function() { saveOrder(); });
  // cancel button
  $('.rgallery-organize-buttons input#rgallery-cancel-button').click(function() { cancelOrder(); });
});

function saveOrder() {
  // disable button
  $('.rgallery-organize-buttons input').attr('disabled', 'disabled');
  
  // process
  var order = new Array();
  $('#rgallery-organize-photos-list li').each(function(index, obj) {
    order[index] = obj.id.replace('rgallery-photo-', '');
  });
  if (order.length > 0) {
    alert(order.toString());
    $.post(Drupal.settings.basePath + 'rgallery/photo/save', { 'order': order.toString(), 'aid': Drupal.settings.rgallery.aid }, function(result) {
      if (result == 1) {
        window.location = Drupal.settings.basePath + 'node/' + Drupal.settings.rgallery.aid;
      }
      else {
        alert('Error!');
      }
    });
  }
}

function cancelOrder() {
  // disable button
  $('.rgallery-organize-buttons input').attr('disabled', 'disabled');
  window.location = Drupal.settings.basePath + 'node/' + Drupal.settings.rgallery.aid;
}
