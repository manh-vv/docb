export default function keepTextLength(text, postfix = '', length = 21) {
  if (!text) return text;
  if (text.length <= length) return text;
  return `${text.substr(0, length)}${postfix}`;
}
