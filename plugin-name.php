<?php
/*
Plugin Name: Immomat
*/

// Add Shortcode
function immomat() {
  $dir = untrailingslashit(plugin_dir_path( __FILE__ ));
  $url = untrailingslashit(plugin_dir_url( __FILE__ ));
  wp_enqueue_script("omat_data","$url/assets/data/data.js");
  wp_enqueue_script("omat_mustache","$url/assets/js/mustache.min.js");
  wp_enqueue_script("omat_zepto","$url/assets/js/zepto.min.js");
  wp_enqueue_script("omat_omat","$url/assets/js/omat.js");
  wp_enqueue_style("omat_icomoon","$url/assets/fonts/icomoon/font.css");
  wp_enqueue_style("omat_raleway","$url/assets/fonts/raleway/font.css");
  wp_enqueue_style("omat_opensans","$url/assets/fonts/open-sans/font.css");
  wp_enqueue_style("omat_omat","$url/assets/css/omat.css");
  $output = file_get_contents("$dir/index.html");
  $output = str_replace("CDUCSU_ANTWORTEN",plugin_dir_url(__FILE__)."assets/pdf/Antwort_Netzwerk_Immovielien.pdf",$output);
  $output = str_replace("WAHLCHECK_PNG",plugin_dir_url(__FILE__)."assets/images/Wahlcheck.png",$output);
  echo $output;
}
add_shortcode( 'immomat', 'immomat' );
