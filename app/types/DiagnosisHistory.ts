import type { JSONContent } from "@tiptap/vue-3";

export interface DiagnosisHistory {
  index: number;
  date: string;
  editor: JSONContent;
  html: string;
  author?: string;
  updatedAt?: string;
}
