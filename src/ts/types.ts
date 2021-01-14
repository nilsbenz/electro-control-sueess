export interface Preis {
  name: string;
  preis: string;
}

export interface PreislistenItem {
  titel: string;
  preise: Preis[];
}

export interface Bereich {
  name: string;
  preisliste: PreislistenItem[];
}

export interface Dienstleistung {
  name: string;
  bereiche: Bereich[];
}

export interface FileDto {
  name: string;
  data: string;
}

export interface Message {
  service: string;
  area: string | undefined;
  company: string | undefined;
  form: string;
  firstname: string;
  lastname: string;
  address: string;
  domicile: string;
  phone: string;
  mail: string;
  file: FileDto | undefined;
}
