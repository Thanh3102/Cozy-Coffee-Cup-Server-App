import { CreateProviderDto } from './../warehouse/provider/dtos';
type AddMaterialDto = {
  name: string;
  stock_quantity: number;
  expiration_date: Date;
  unit_id: number;
};

type UpdateMaterialDto = {
  id: number;
  name: string;
  stock_quantity: number;
  expiration_date: Date;
  unit_id: number;
  active: boolean;
};

type CreateProviderDto = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type UpdateProviderDto = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
};

type ImportNoteItem = {
  price: number;
  quantity: number;
  material_id: number | undefined;
};

type CreateImportNoteDto = {
  receiver_name: string;
  note: string;
  provider_id: string;
  import_note_detail: ImportNoteItem[];
};

type CreateExportNoteDto = {
  picker_name: string;
  note: string;
  export_note_detail: ExportNoteItem[];
};
