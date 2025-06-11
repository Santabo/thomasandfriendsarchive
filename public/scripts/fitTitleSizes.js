export function fitTitlesToImages() {
  document.querySelectorAll('.episode').forEach(episode => {
    const img = episode.querySelector('img');
    const title = episode.querySelector('h3');

    if (!img || !title) return;

    const maxWidth = img.clientWidth;
    let fontSize = 20; // start size in px
    title.style.fontSize = fontSize + 'px';
    title.style.whiteSpace = 'nowrap';

    while (title.scrollWidth > maxWidth && fontSize > 10) {
      fontSize -= 1;
      title.style.fontSize = fontSize + 'px';
    }
  });
}
