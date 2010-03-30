<?php
/**
 * Fields available:
 * $data: content display
 * $attributes: contains with html attributes
 *
 */
?>

<?php if ($data): ?>
<div<?php print $attributes ?>>
  <?php print $data ?>
</div>
<?php endif; ?>
