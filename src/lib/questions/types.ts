export interface Question {
  id: number;
  text: string;
  options?: { value: string; label: string }[];
  type?: "radio" | "text" | "scale";
}

export interface KesiapanQuestion {
  id: number;
  text: string;
  labelMin: string;
  labelMax: string;
}

export interface KesiapanSection {
  section: string;
  items: KesiapanQuestion[];
}

export interface KepribadianQuestion {
  id: number;
  optionA: string;
  optionB: string;
}
