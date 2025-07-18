import React from "react";
import * as Icons from "lucide-react";

/**
 * EmojiIcon - Lucide ikonlarını kolayca kullanmak için genel bir komponent.
 * @param {string} name - Lucide ikon adı (örn: Smile, Heart, Star, ...)
 * @param {string} color - (Opsiyonel) İkon rengi
 * @param {number} size - (Opsiyonel) İkon boyutu (px)
 */
const EmojiIcon = ({ name, color = "currentColor", size = 24, ...rest }) => {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon color={color} size={size} {...rest} />;
};

export default EmojiIcon; 