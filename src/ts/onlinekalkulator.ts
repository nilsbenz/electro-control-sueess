import { default as dienstleistungen } from '../assets/json/dienstleistungen.json';
import { Dienstleistung } from './types';

const dienstleistungenFormfield = document.getElementById(
  'dienstleistungen'
) as HTMLSelectElement;
const bereicheFormfield = document.getElementById(
  'bereiche'
) as HTMLSelectElement;
const preisliste = document.getElementById('preisliste') as HTMLDivElement;

dienstleistungen.forEach((dienstleistung) => {
  const option = document.createElement('option');
  option.value = dienstleistung.name;
  option.innerHTML = dienstleistung.name;
  dienstleistungenFormfield.appendChild(option);
});

dienstleistungenFormfield.addEventListener('change', (e: Event): void => {
  const selectedDienstleistung = (e.target as HTMLSelectElement).value;
  const bereiche = dienstleistungen.find(
    (dienstleistung) => dienstleistung.name === selectedDienstleistung
  ).bereiche;
  bereicheFormfield.options.length = 1;
  bereicheFormfield.selectedIndex = 0;
  bereiche.forEach((bereich) => {
    const option = document.createElement('option');
    option.value = bereich.name;
    option.innerHTML = bereich.name;
    bereicheFormfield.appendChild(option);
  });
  preisliste.classList.add('preisliste--hidden');
  bereicheFormfield.parentElement.hidden = !bereiche.length;
});

bereicheFormfield.addEventListener('change', (e: Event): void => {
  const selectedDienstleistung: Dienstleistung =
    dienstleistungen[dienstleistungenFormfield.selectedIndex - 1];
  const selectedBereich = (e.target as HTMLSelectElement).value;
  const bereich = dienstleistungen
    .find(
      (dienstleistung) => dienstleistung.name === selectedDienstleistung.name
    )
    .bereiche.find((bereich) => bereich.name === selectedBereich);
  preisliste.innerHTML = '';
  const title = document.createElement('h4');
  title.innerHTML = 'Preisliste';
  preisliste.appendChild(title);
  bereich.preisliste.forEach((preisListenItem) => {
    const subtitle = document.createElement('h5');
    subtitle.innerHTML = preisListenItem.titel;
    preisliste.appendChild(subtitle);
    preisListenItem.preise.forEach((preis) => {
      const item = document.createElement('div');
      const description = document.createElement('p');
      const price = document.createElement('p');
      description.innerHTML = preis.name;
      price.innerHTML = preis.preis;
      item.classList.add('preisliste-item');
      item.appendChild(description);
      item.appendChild(price);
      preisliste.appendChild(item);
    });
  });
  if (!bereich.preisliste.length) {
    preisliste.classList.add('preisliste--hidden');
  } else {
    preisliste.classList.remove('preisliste--hidden');
  }
});
