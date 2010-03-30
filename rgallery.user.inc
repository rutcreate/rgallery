<?php

/**
 * 
 */
function rgallery_user_settings_form() {
  global $user;
  $form['rgallery_user_'. $user->uid .'_allow_gallery'] = array(
    '#type' => 'checkbox',
    '#title' => t('Allow other users to view your gallery'),
    '#default_value' => variable_get('rgallery_user_'.$user->uid.'_allow_gallery', TRUE),
  );
  return system_settings_form($form);
}
