import { default as dienstleistungen } from '../assets/json/dienstleistungen.json';
import { Dienstleistung, FileDto, Message } from './types';

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
const uploadFileFormField = document.getElementById(
  'file-upload'
) as HTMLInputElement;
const uploadFileDropArea = document.getElementById(
  'file-upload-drop-area'
) as HTMLLabelElement;
const uploadFileLabel = document.getElementById(
  'file-upload-label'
) as HTMLInputElement;
const uploadFileDelete = document.getElementById(
  'file-upload-delete'
) as HTMLButtonElement;
const preisliste = document.getElementById('preisliste') as HTMLDivElement;
const sendMailSuccess = document.getElementById('send-mail-success');
const sendMailError = document.getElementById('send-mail-error');
const formSubmitButton = document.getElementById(
  'form-submit-button'
) as HTMLButtonElement;

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

const updateFileUploadLabel = () => {
  const files = uploadFileFormField.files;
  if (files.length) {
    uploadFileLabel.innerHTML = files[0].name;
    uploadFileLabel.classList.add('file-upload-label--valid');
    uploadFileDelete.classList.remove('icon--hidden');
  } else {
    uploadFileLabel.innerHTML = 'Datei hochladen';
    uploadFileLabel.classList.remove('file-upload-label--valid');
    uploadFileDelete.classList.add('icon--hidden');
  }
};

uploadFileFormField.addEventListener('change', updateFileUploadLabel);

const div = document.createElement('div');

const supportsDragNDrop =
  ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
  'FormData' in window &&
  'FileReader' in window;

if (supportsDragNDrop) {
  uploadFileDropArea.ondragover = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  uploadFileDropArea.ondragenter = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    uploadFileDropArea.classList.add('drag-area--drag');
  };

  uploadFileDropArea.ondragleave = uploadFileDropArea.ondragend = (
    e: DragEvent
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    uploadFileDropArea.classList.remove('drag-area--drag');
  };

  uploadFileDropArea.addEventListener('drop', (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    uploadFileDropArea.classList.remove('drag-area--drag');
    uploadFileFormField.files = e.dataTransfer.files;
    updateFileUploadLabel();
  });
}

const deleteUploadedFile = () => {
  uploadFileFormField.value = '';
  uploadFileLabel.innerHTML = 'Datei hochladen';
  uploadFileLabel.classList.remove('file-upload-label--valid');
  uploadFileDelete.classList.add('icon--hidden');
};

uploadFileDelete.addEventListener('click', deleteUploadedFile);

const readFile = async (file: File): Promise<FileDto> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        name: file.name,
        data: reader.result as string,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

form.addEventListener(
  'submit',
  async (e: Event): Promise<void> => {
    e.preventDefault();
    sendMailSuccess.classList.add('success-message--hidden');
    sendMailError.classList.add('error-message--hidden');
    formSubmitButton.disabled = true;
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
    const files = uploadFileFormField.files;
    const file = files.length ? await readFile(files[0]) : undefined;

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
      file,
    };

    const res = await fetch('/sendmail', {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'content-type': 'application/json',
      },
    });

    formSubmitButton.disabled = false;

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
      deleteUploadedFile();
      sendMailSuccess.classList.remove('success-message--hidden');
      setTimeout(() => {
        sendMailSuccess.classList.add('success-message--hidden');
      }, 5000);
    } else {
      sendMailError.classList.remove('error-message--hidden');
    }
  }
);
