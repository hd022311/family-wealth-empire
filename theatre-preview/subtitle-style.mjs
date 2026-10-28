/** zh-TW narrative display only. Never use for law, quotations of statutes or system copy. */
export function subtitleText(text){return String(text??'').replace(/。(?=[」』”’）】》〉]*[ \t]*\r?$)/gmu,'');}
