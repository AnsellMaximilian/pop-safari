export function removeElementsWithClass(className: string) {
  const elements = document.querySelectorAll(`.${className}`);

  console.log({ elements });

  elements.forEach((e) => e.remove());
}
