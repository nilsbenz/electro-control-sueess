import { default as dienstleistungen } from '../assets/json/dienstleistungen.json';
import { Dienstleistung, FileDto, Message, PricelistItem } from './types';

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
const warningPvAnlage = document.getElementById('warning-pv-anlage');
const sendMailSuccess = document.getElementById('send-mail-success');
const sendMailError = document.getElementById('send-mail-error');
const formSubmitButton = document.getElementById(
  'form-submit-button'
) as HTMLButtonElement;

let total: PricelistItem[] = [];

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
  if (
    selectedDienstleistung ===
    'Abnahmekontrolle und Beglaubigung von PV-Anlagen'
  ) {
    warningPvAnlage.classList.remove('warning--hidden');
  } else {
    warningPvAnlage.classList.add('warning--hidden');
  }
});

const calculateTotal = (total: number, current: PricelistItem) =>
  total + current.amount * current.price;

const updateTotal = (
  element: HTMLParagraphElement,
  updatedItem: PricelistItem
): void => {
  total = total.filter((item) => item.name !== updatedItem.name);
  total.push(updatedItem);
  const newTotal = total.reduce(calculateTotal, 0);
  element.innerHTML = `Total: CHF ${newTotal.toFixed(2)}`;
};

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
  total = [];
  const heading = document.createElement('div');
  heading.classList.add('preisliste-heading');
  const title = document.createElement('h4');
  title.innerHTML = 'Preisliste';
  const number = document.createElement('p');
  number.innerHTML = 'Anzahl';
  heading.appendChild(title);
  heading.appendChild(number);
  preisliste.appendChild(heading);
  const preislisteTotal = document.createElement('h5');
  preislisteTotal.classList.add('preisliste-total');

  bereich.preisliste.forEach((preisListenItem) => {
    const subtitle = document.createElement('h5');
    subtitle.innerHTML = preisListenItem.titel;
    preisliste.appendChild(subtitle);
    preisListenItem.preise.forEach((preis) => {
      const item = document.createElement('div');
      const description = document.createElement('p');
      const priceWrapper = document.createElement('div');
      const price = document.createElement('p');
      const amount = document.createElement('input');
      description.innerHTML = preis.name;
      description.classList.add('preisliste-item-description');
      price.innerHTML = `CHF ${preis.preis.toFixed(2)} * `;
      amount.type = 'number';
      amount.min = '0';
      amount.max = '999';
      amount.pattern = '[0-9]*';
      amount.classList.add('preisliste-item-amount');
      item.classList.add('preisliste-item');
      item.appendChild(description);
      priceWrapper.appendChild(price);
      priceWrapper.appendChild(amount);
      item.appendChild(priceWrapper);
      preisliste.appendChild(item);

      amount.addEventListener('change', () => {
        if (!Number(amount.value) || Number(amount.value) < 0) {
          amount.value = '0';
        }
        amount.value = Math.floor(Number(amount.value)).toString();
        updateTotal(preislisteTotal, {
          name: preis.name,
          amount: Number(amount.value),
          price: preis.preis,
        });
      });
    });
  });

  preisliste.appendChild(preislisteTotal);

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
    const pricelist = total.filter((item) => item.amount > 0);
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
      pricelist,
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

    if (res.status === 200) {
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
    } else {
      sendMailError.classList.remove('error-message--hidden');
    }
  }
);
