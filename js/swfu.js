var swfu;
jQuery(document).ready(function() {
  var settings = {
    flash_url : Drupal.settings.rgallery_swfupload.uploader,
		flash9_url : Drupal.settings.rgallery_swfupload.uploaderv9,
    upload_url: Drupal.settings.rgallery_swfupload.uploadUrl,
    post_params: {
      "PHPSESSID" : Drupal.settings.rgallery_swfupload.session.id, 
      "PHPSESSNAME" : Drupal.settings.rgallery_swfupload.session.name, 
      "UID" : Drupal.settings.rgallery_swfupload.session.uid,
      "AID" : Drupal.settings.rgallery_swfupload.album_id
    },
    file_size_limit : Drupal.settings.rgallery_swfupload.fileSizeLimit,
    file_types : Drupal.settings.rgallery_swfupload.fileTypes,
    file_types_description : Drupal.settings.rgallery_swfupload.fileTypesDescription,
    file_upload_limit : Drupal.settings.rgallery_swfupload.fileUploadLimit,
    file_queue_limit : Drupal.settings.rgallery_swfupload.fileQueueLimit,
    custom_settings : {
      progressTarget : "fsUploadProgress",
      cancelButtonId : "btnCancel"
    },
    debug: (Drupal.settings.rgallery_swfupload.debug == '1') ? true : false,
    /* button */
    button_image_url: Drupal.settings.rgallery_swfupload.buttonImage,
    button_width: "61",
    button_height: "22",
    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
    button_placeholder_id: "spanButtonPlaceHolder",
    /* callback */
    file_queued_handler : fileQueued,
    file_queue_error_handler : fileQueueError,
    file_dialog_complete_handler : fileDialogComplete,
    upload_start_handler : uploadStart,
    upload_progress_handler : uploadProgress,
    upload_error_handler : uploadError,
    upload_success_handler : uploadSuccess,
    upload_complete_handler : uploadComplete,
    queue_complete_handler : queueComplete,
  };
  swfu = new SWFUpload(settings);
});
