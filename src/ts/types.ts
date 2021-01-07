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
