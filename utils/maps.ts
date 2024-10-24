export function removeElementsWithClass(className: string) {
  const elements = document.querySelectorAll(`.${className}`);

  elements.forEach((e) => e.remove());
}
