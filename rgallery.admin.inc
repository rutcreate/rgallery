<?php

/**
 * Content types settings form
 */
function rgallery_file_settings_form() {
  $form['rgallery_file_fs'] = array(
    '#title' => t('File information'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['rgallery_file_fs']['rgallery_file_size_limit'] = array(
    '#title' => t('File size limit'),
    '#description' => t('The file_size_limit setting defines the maximum allowed size of a file to be uploaded. This setting accepts a value and unit. Valid units are B, KB, MB and GB. If the unit is omitted default is KB. A value of 0 (zero) is interpreted as unlimited.'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_size_limit', 0),
  );
  $form['rgallery_file_fs']['rgallery_file_types'] = array(
    '#title' => t('File types'),
    '#description' => t('The file types setting accepts a semi-colon separated list of file extensions that are allowed to be selected by the user. Use \'*\' to allow all file types. ex. jpg, png, gif'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_types', '*'),
  );
  $form['rgallery_file_fs']['rgallery_file_types_description'] = array(
    '#title' => t('File types description'),
    '#description' => t('A text description that is displayed to the user in the File Browser dialog.'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_types_description', 'All files'),
  );
  $form['rgallery_file_fs']['rgallery_file_upload_limit'] = array(
    '#title' => t('File upload limit'),
    '#description' => t('The file_size_limit setting defines the maximum allowed size of a file to be uploaded. This setting accepts a value and unit. Valid units are B, KB, MB and GB. If the unit is omitted default is KB. A value of 0 (zero) is interpreted as unlimited.'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_upload_limit', 0),
  );
  $form['rgallery_file_fs']['rgallery_file_queue_limit'] = array(
    '#title' => t('File queue limit'),
    '#description' => t('Defines the number of unprocessed files allowed to be simultaneously queued. Once a file is uploaded, errored, or cancelled a new files can be queued in its place until the queue limit has been reached. If the upload limit (or remaining uploads allowed) is less than the queue limit then the lower number is used.'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_queue_limit', 1),
  );
  /*$form['rgallery_file_fs']['rgallery_file_upload_path'] = array(
    '#title' => t('File directory'),
    '#description' => t('A directory that store image files which relative with site/default/files/.'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_upload_path', 'rgallery'),
  );*/
  $form['rgallery_file_fs']['rgallery_file_debug'] = array(
    '#title' => t('Debug'),
    '#description' => t('A boolean value that defines whether the debug event handler should be fired.'),
    '#type' => 'radios',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_file_debug', 'false'),
    '#options' => array(
      '1' => t('Yes'),
      '0' => t('No'),
    ),
  );
  $form['#validate'] = array('rgallery_file_settings_form_validate');
  return system_settings_form($form);
}

/**
 * Imagecache settings
 */
function rgallery_style_settings_form() {
  $presets = image_styles();
  $options = array('None' => 'None');
  foreach ($presets as $key => $preset) {
    $options[$key] = $key;
  }
  $form['rgallery_imagestyles_fs'] = array(
    '#title' => t('Image styles settings'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['rgallery_imagestyles_fs']['rgallery_imagestyle_preview'] = array(
    '#title' => t('Preview preset'),
    '#description' => t('Select image types preset for preview image.'),
    '#type' => 'select',
    '#default_value' => variable_get('rgallery_imagestyle_preview', 'None'),
    '#options' => $options,
  );
  $form['rgallery_imagestyles_fs']['rgallery_imagestyle_thumbnail'] = array(
    '#title' => t('Thumbnail preset'),
    '#description' => t('Select image types preset for thumbnail image.'),
    '#type' => 'select',
    '#default_value' => variable_get('rgallery_imagestyle_thumbnail', 'None'),
    '#options' => $options,
  );
  $form['rgallery_imagestyles_fs']['rgallery_imagestyle_cover'] = array(
    '#title' => t('Album cover preset'),
    '#description' => t('Select image types preset for cover image.'),
    '#type' => 'select',
    '#default_value' => variable_get('rgallery_imagestyle_cover', 'None'),
    '#options' => $options,
  );
  return system_settings_form($form);
}

/**
 * Validate file settings form
 */
function rgallery_file_settings_form_validate($form, &$form_state) {
  $values = $form_state['values'];
  // file size limit
  if (!is_numeric(str_replace(array('B', 'KB', 'MB', 'GB'), array('', '', '', ''), $values['rgallery_file_size_limit']))) {
    form_set_error('rgallery_file_size_limit', t('File size limit is wrong format. ex. 1024, 200KB, 3MB, 1GB.'));
  }
  // file upload limit
  if (!is_numeric($values['rgallery_file_upload_limit'])) {
    form_set_error('rgallery_file_upload_limit', t('File upload limit is wrong format. ex. 1024, 200KB, 3MB, 1GB.'));
  }
  // file queue limit
  if (!is_numeric($values['rgallery_file_queue_limit'])) {
    form_set_error('rgallery_file_queue_limit', t('File queue limit must be integer.'));
  }
  elseif ($values['rgallery_file_queue_limit'] < 0) {
    form_set_error('rgallery_file_queue_limit', t('File queue limit must be positive integer.'));
  }
}

/**
 * Display settings
 */
function rgallery_display_settings_form() {
  $form['rgallery_fieldset_display'] = array(
    '#title' => t('Page settings'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['rgallery_fieldset_display']['rgallery_display_use_pager'] = array(
    '#title' => t('Use pager'),
    '#description' => t('If Yes is selected, you have to set Items per row.'),
    '#type' => 'radios',
    '#required' => TRUE,
    '#options' => array(
      1 => t('Yes'), 
      0 => t('No')
    ),
    '#default_value' => variable_get('rgallery_display_use_pager', 0),
  );
  $form['rgallery_fieldset_display']['rgallery_display_items_per_page'] = array(
    '#title' => t('Items per page'),
    '#description' => t('A number of items to be displayed each page.'),
    '#type' => 'textfield',
    '#required' => TRUE,
    '#default_value' => variable_get('rgallery_display_items_per_page', 10),
  );
  
  $form['#validate'] = array('rgallery_display_settings_form_validate');
  return system_settings_form($form);
}

/**
 * Validate display settings form
 */
function rgallery_display_settings_form_validate($form, &$form_state) {
  $values = $form_state['values'];
  // items per page
  if (!is_numeric($values['rgallery_display_items_per_page'])) {
    form_set_error('rgallery_display_items_per_page', t('Items per page must be integer.'));
  }
  elseif ($values['rgallery_display_items_per_page'] < 0) {
    form_set_error('rgallery_display_items_per_page', t('Items per page must be positive integer.'));
  }
}
