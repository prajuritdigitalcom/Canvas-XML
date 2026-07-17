export interface ConverterSettings {
  autoDownload: boolean;
  beautifyXml: boolean;
  compressXml: boolean;
  rememberLastSettings: boolean;
  autoSaveHistory: boolean;
}

export interface ConversionHistoryItem {
  id: string;
  fileName: string;
  timestamp: string;
  status: 'success' | 'failed';
  inputSize: number;
  outputSize: number;
  xmlContent?: string;
  errorMessage?: string;
}

export interface ConversionStats {
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  lastConvertTime: string | null;
}

export interface FileAnalysis {
  name: string;
  size: number;
  cssCount: number;
  jsCount: number;
  imageCount: number;
  sectionCount: number;
  totalElements: number;
  isValid: boolean;
  validationError?: string;
}
