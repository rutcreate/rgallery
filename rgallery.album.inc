<?php

/**
 * Gallery
 */
function rgallery_my_gallery($account = NULL) {
  global $user;
	// no user pass from url
	if (!isset($account)) $account = $user;
	// not found
  if (empty($account)) drupal_access_denied();
  
  
  
  drupal_add_css(rgallery_path() .'/css/rgallery.css');
  // Privacy album
  if (user_access('view any gallery') || $account->uid == $user->uid) {
    $albums = db_query("SELECT nid FROM {node} WHERE type = :type AND uid = :uid ORDER BY created DESC", array(':type' => 'ralbum', ':uid' => $account->uid))->fetchAll();
  }
  else {
    $albums = db_query("SELECT nid FROM {node} WHERE type = :type AND uid = :uid AND promote = 1 ORDER BY created DESC", array(':type' => 'ralbum', ':uid' => $account->uid))->fetchAll();
  }
  $output = '';
  foreach ($albums as $album) {
    $node = node_load($album->nid);
    $photos = rgallery_get_photos_by_album($node);
    $thumbnail = rgallery_get_thumbnail($node->nid);
    if (!$thumbnail) {
      if ($preset = variable_get('rgallery_imagestyle_cover', FALSE)) {
        $thumbnail = theme('image_style', array('style_name' => $preset, 'path' => 'public://rgallery/default.jpg'));
      }
    }
    $output .= '<li>'. theme('rgallery_album_item', array('thumbnail' => $thumbnail, 'title' => $node->title, 'count' => count($photos), 'link' => 'node/'. $node->nid)) .'</li>';
  }
  
  if (empty($output)) {
    $output = '<h6>There are no albums in this gallery.</h6>';
  }
  
  // set title
  drupal_set_title(t('Gallery of @name', array('@name' => $account->name)));
  
  $output = '<ul id="rgallery-view-albums-list">' . $output .'</ul>';
  if ($user->uid == $account->uid && user_access('create ralbum content', $account)) {
    $output = l(t('Create new album'), 'node/add/ralbum').$output;
  }
  return theme('rgallery_wrapper', array('data' => $output));
}

function rgallery_view_gallery($account) {
  return rgallery_my_gallery($account);
}

/**
 * Add photos form
 */
function rgallery_album_add_photos($node) {
  global $user;
    
  //swfupload
  $types = explode(',', str_replace(' ', '', variable_get('rgallery_file_types', '*')));
  for ($i = 0; $i < count($types); $i++) {
    $types[$i] = '*.' . $types[$i];
  }
  $type = implode(';', $types);
  $setting = array(
    'rgallery_swfupload' => array(
      'uploader' => base_path() . rgallery_path() . '/swfupload/swfupload.swf',
      'uploaderv9' => base_path() . rgallery_path() . '/swfupload/swfupload_fp9.swf',
      'uploadUrl' => $GLOBALS['base_url'] . '/rgallery/photos/upload',
      'session' => array(
        'id' => session_id(),
        'name' => session_name(),
        'uid' => $user->uid,
      ),
      'fileSizeLimit' => variable_get('rgallery_file_size_limit', 0),
      'fileTypes' => $type,
      'fileTypesDescription' => variable_get('rgallery_file_types_description', 'All Files'),
      'fileUploadLimit' => variable_get('rgallery_file_upload_limit', 0),
      'fileQueueLimit' => variable_get('rgallery_file_queue_limit', 0),
      'buttonImage' => base_path() . rgallery_path() . '/images/swfupload-button-61x22.png',
      'debug' => variable_get('rgallery_file_debug', 0),
      'album_id' => $node->nid,
    ),
  );
  
  drupal_add_js($setting, 'setting');
  drupal_add_css(rgallery_path() . '/css/swfupload.css');
  drupal_add_css(rgallery_path() . '/css/rzgallery.css');
  drupal_add_js(rgallery_path() . '/swfupload/swfupload.js');
  drupal_add_js(rgallery_path() . '/swfupload/swfupload.queue.js');
  drupal_add_js(rgallery_path() . '/swfupload/fileprogress.js');
  drupal_add_js(rgallery_path() . '/swfupload/handlers.js');
  drupal_add_js(rgallery_path() . '/js/swfu.js');
  drupal_add_js(rgallery_path() . '/js/upload.js');
  
  // form upload
  $output = '<form id="ragllery-photos-upload" method="post" enctype="multipart/form-data">';
  $output .= '	<div class="swfupload-fieldset swfupload-flash" id="fsUploadProgress">';
  $output .= '		<span class="legend">Upload Queue</span>';
  $output .= '	</div>';
  $output .= '	<div id="divStatus">0 Files Uploaded</div>';
  $output .= '	<div>';
  $output .= '		<span id="spanButtonPlaceHolder"></span>';
  $output .= '		<input id="btnCancel" type="button" value="Cancel All Uploads" onclick="swfu.cancelQueue();" disabled="disabled" style="margin-left: 2px 0px 0px 2px; font-size: 8pt; height: 21px;" />';
  $output .= '  </div>';
  $output .= '</form>';
  $output .= '<ul id="new-photos-list"></ul>';

  return $output;
}

/**
 * JSON upload photo
 *
 * Return HTTP 1.1 Status Code Definitions
 *
 * 200: OK
 * 400: Bad request
 * 403: Forbiden
 * 409: Conflict (no definition)
 */
function rgallery_album_photos_upload() {
  if(isset($_FILES['Filedata'])) {
    $sid = $_POST['PHPSESSID'];
    $aid = $_POST['AID'];
    
    $user = db_query("SELECT uid FROM {sessions} WHERE sid = :sid ORDER BY timestamp DESC LIMIT 0, 1", array(':sid' => $sid))->fetch();
    if (!$user->uid) {
      drupal_json_output(array('status' => 403));
      return;
    }
    if ($user->uid != 1) {
      $user = user_load($user->uid);
      if (!$user) {
        drupal_json_output(array('status' => 403));
        return;
      }
    }
    // check permission
    if (rgallery_manage_access('add', node_load($aid), $user)) {
      $uploadpath = rgallery_album_uri($aid);
      $filename = $_FILES['Filedata']['name'];
      $tmp_name = $_FILES['Filedata']['tmp_name'];
      $size = $_FILES['Filedata']['size'];
      // filter no thai and rename
      if(ereg("[ก-๙]", $filename)) {
        if ($pos = strrpos($filename, '.')) {
          $name = substr($filename, 0, $pos);
          $ext = substr($filename, $pos);
        }
        else {
          $name = $filename;
        }
        $name = 'error-thai-name';
        $filename = $name . $ext;
      }
      $filepath = $uploadpath . '/' . $filename;
      
      $source = new stdClass();
      $source->uri = $tmp_name;
      $source->uid = $user->uid;
      $source->filemime = file_get_mimetype(trim(basename($filename), '.'));
      
      if ($file = file_copy($source, $filepath, FILE_EXISTS_RENAME)) {
        $node = new stdClass();
        $node->title = $file->filename;
        $node->type = 'rphoto';
        $node->body[LANGUAGE_NONE][0]['value'] = $file->filename;
        $node->uid = $_POST['UID'];
        $node->name = $user->name;
        $node->language = LANGUAGE_NONE;
        $node->status = 1;
        $node->promote = 0;
        if (module_exists('comment')) {
          $node->comment = variable_get("comment_" . $node->type, COMMENT_NODE_OPEN);
        }
        node_save($node);
        if ($node->nid) {
          $last_weight = db_query("SELECT weight FROM {ralbum} WHERE aid = :aid ORDER BY weight DESC", array(':aid' => $aid))->fetchCol();          
          $weight = 0;
          if (!empty($last_weight)) $weight = $last_weight[0] + 1;
          $is_thumbnail = $weight == 0 ? 1 : 0;
          db_insert('ralbum')
            ->fields(array(
              'aid' => $aid,
              'pid' => $node->nid,
              'fid' => $file->fid,
              'weight' => $weight,
              'is_thumbnail' => $is_thumbnail
            ))
            ->execute();
          drupal_json_output(array('status' => 200));
        }
        else {
          drupal_json_output(array('status' => 400));
        }
      }
    }
    else {
      drupal_json_output(array('status' => 403));
    }
  }
  else {
    drupal_json_output(array('status' => 204));
  }
}

/**
 * Edit photo page
 */
function rgallery_album_edit_photos($node) {
  if (rgallery_manage_access('edit_photo', $node)) {
    drupal_add_js(rgallery_path() .'/js/ui.custom.js');
    drupal_add_js(rgallery_path() .'/js/edit.js');
    drupal_add_js(array('rgallery' => array('aid' => $node->nid,)), 'setting');
  }
  if (rgallery_manage_access('delete', $node)) {
    drupal_add_js(rgallery_path() .'/js/delete.js');
  }
  drupal_add_css(rgallery_path() .'/css/rgallery.css');
  // render items
  $output = theme('rgallery_photos_list', array('photos' => rgallery_get_photos_by_album($node)));
  if (rgallery_manage_access('edit_photo', $node)) {
    $output .= '<div id="rgallery-edit-photos-buttons" class="rgallery-buttons-wrapper">';
    $output .= '<input type="button" id="rgallery-save-button" value="Save Order" />';
    $output .= '<input type="button" id="rgallery-cancel-button" value="Cancel" />';
    $output .= '</div>';
  }
  return theme('rgallery_wrapper', array('data' => $output, 'attributes' => array('id' => 'rgallery-edit-photos-wrapper')));
}

/**
 * Edit photo form
 */
function rgallery_album_edit_photos_form(&$form_state, $node) {
  $form['rgallery_edit_photos']['#tree'] = TRUE;
  $photos = _rgallery_get_photos_by_album($node);
  if (count($photos)) {
    foreach ($photos as $nid => $photo) {
      $form['rgallery_edit_photos'][$nid] = rgallery_album_edit_photos_form_fields($photo);
    }
  }
  $form['buttons']['submit'] = array(
		'#type' => 'submit',
		'#value' => t('Save changes'),
		'#disabled' => empty($photos),
	);
  return $form;
}

/**
 * Edit photo form field
 */
function rgallery_album_edit_photos_form_fields($photo) {
	$form['delete'] = array(
		'#type' => 'checkbox',
		'#value' => $photo['nid'],
	);
	$form['title'] = array(
		'#type' => 'textfield',
		'#value' => $photo['title'],
	);
	$form['description'] = array(
		'#type' => 'textarea',
		'#rows' => 3,
		'#value' => $photo['description'],
	);
	$form['image'] = array(
	  '#type' => 'markup',
	  '#value' => $photo['image'],
	);
	$form['weight'] = array(
		'#type' => 'weight',
		'#default_value' => $photo['weight'],
	);
  return $form;
}

/**
 * Delete photo callback
 * 
 */
function rgallery_album_photo_delete($node = NULL) {
  $node = node_load($node->nid);
  $album_node = node_load($node->album_id);
  node_delete($node->nid);
  drupal_get_messages();
  $photo_left = rgallery_get_photos_by_album($album_node);
  $count = count($photo_left);
  if ($node->is_thumbnail && $count > 0) {
    $pids = array_keys($photo_left);
    $new_pid = $pids[0];
    db_update('ralbum')
      ->fields(array(
        'is_thumbnail' => 1,
      ))
      ->condition('pid', $new_pid)
      ->execute();
  }
  drupal_json_output(array('status' => 200, 'data' => array('count' => $count, 'new_thumbnail' => $new_pid)));
}

/**
 * Save photo by JSON
 */
function rgallery_album_photo_save($node = NULL) {
  if (!empty($node->nid)) {
    if (rgallery_manage_access('edit_photo', $node)) {
      // Save title
      switch ($node->type) {
        case 'rphoto':
          if (isset($_POST['content'])) {
            $node->body[LANGUAGE_NONE][0]['value'] = $_POST['content'];
            node_save($node);
            $json = array(
              'status' => 200,
              'data' => $node->body[LANGUAGE_NONE][0]['value'],
            );
            drupal_json_output($json);
          }
          break;
        case 'ralbum':
          if (isset($_POST['order'])) {
            $pids = explode(',', $_POST['order']);
            if (count($pids)) {
              foreach ($pids as $weight => $pid) {
                $is_thumbnail = ($pid == $_POST['thumbnail']) ? 1 : 0;
                db_update('ralbum')
                  ->fields(array(
                    'weight' => $weight,
                    'is_thumbnail' => $is_thumbnail,
                  ))
                  ->condition('aid', $node->nid)
                  ->condition('pid', $pid)
                  ->execute();
              }
              drupal_json_output(array('status' => 200));
            }
          }
          break;
        default:
          drupal_json_output(array('status' => 204));
      }
    }
    else {
      drupal_json_output(array('status' => 403));
    }
  }
  else {
    drupal_json_output(array('status' => 403));
  }
}
/*function rgallery_album_photo_save($node) {
  if ($nid = $_POST['nid']) {
    // check permission
    $node = node_load($nid);
    if (rgallery_manage_access('edit', $node)) {
      // update description
      if (isset($_POST['content'])) {
        if ($node) {
          $node->body[LANGUAGE_NONE][0]['value'] = $_POST['content'];
          node_save($node);
          $json = array(
            'status' => 200,
            'data' => $node->body[LANGUAGE_NONE][0]['value'],
          );
          drupal_json_output($json);
        }
      }
      // update order
      elseif (isset($_POST['order'])) {
        $pids = explode(',', $_POST['order']);
        if (count($pids)) {
          foreach ($pids as $weight => $pid) {
            $is_thumbnail = $pid == $_POST['thumbnail'] ? 1 : 0;
            db_update('ralbum')
              ->fields(array(
                'weight' => $weight,
                'is_thumbnail' => $is_thumbnail,
              ))
              ->condition('aid', $nid)
              ->condition('pid', $pid)
              ->execute();
          }
          drupal_json_output(array('status' => 200));
        }
      }
    }
    // permission denied
    else {
      drupal_json_output(array('status' => 403));
    }
  }
}*/
