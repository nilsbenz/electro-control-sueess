import { default as dienstleistungen } from '../assets/json/dienstleistungen.json';
import { Dienstleistung, Message } from './types';

import * as firebase from 'firebase';

const form = document.getElementById('onlinekalkulator') as HTMLFormElement;
const dienstleistungenFormfield = document.getElementById(
  'dienstleistungen'
) as HTMLSelectElement;
const bereicheFormfield = document.getElementById(
  'bereiche'
) as HTMLSelectElement;
const firmaFormField = document.getElementById('company') as HTMLInputElement;
const anredeFormField = document.getElementById('anrede') as HTMLSelectElement;
const vornameFormField = document.getElementById(
  'firstname'
) as HTMLInputElement;
const nachnameFormField = document.getElementById(
  'lastname'
) as HTMLInputElement;
const adresseFormField = document.getElementById('address') as HTMLInputElement;
const wohnortFormField = document.getElementById('place') as HTMLInputElement;
const telefonFormField = document.getElementById('phone') as HTMLInputElement;
const emailFormField = document.getElementById('email') as HTMLInputElement;
const preisliste = document.getElementById('preisliste') as HTMLDivElement;
const sendMailSuccess = document.getElementById('send-mail-success');
const sendMailError = document.getElementById('send-mail-error');

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
  bereicheFormfield.required = !!bereiche.length;
  if (!!bereiche.length) {
    bereicheFormfield.parentElement.classList.remove('formfield--hidden');
  } else {
    bereicheFormfield.parentElement.classList.add('formfield--hidden');
  }
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

form.addEventListener(
  'submit',
  async (e: Event): Promise<void> => {
    e.preventDefault();
    sendMailSuccess.classList.add('success-message--hidden');
    sendMailError.classList.add('error-message--hidden');
    const service = dienstleistungenFormfield.value;
    const area = bereicheFormfield.value || undefined;
    const company = firmaFormField.value || undefined;
    const anrede = anredeFormField.value;
    const firstname = vornameFormField.value;
    const lastname = nachnameFormField.value;
    const address = adresseFormField.value;
    const domicile = wohnortFormField.value;
    const phone = telefonFormField.value;
    const mail = emailFormField.value;

    const message: Message = {
      service,
      area,
      company,
      form: anrede,
      firstname,
      lastname,
      address,
      domicile,
      phone,
      mail,
    };

    const res = await fetch('/sendmail', {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'content-type': 'application/json',
      },
    });

    const responseBody = await res.json();

    if (responseBody.success) {
      firmaFormField.value = '';
      anredeFormField.value = '';
      vornameFormField.value = '';
      nachnameFormField.value = '';
      adresseFormField.value = '';
      wohnortFormField.value = '';
      telefonFormField.value = '';
      emailFormField.value = '';
      sendMailSuccess.classList.remove('success-message--hidden');
      setTimeout(() => {
        sendMailSuccess.classList.add('success-message--hidden');
      }, 5000);
    } else {
      sendMailError.classList.remove('error-message--hidden');
    }
  }
);
