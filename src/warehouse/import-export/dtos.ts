import { Type } from 'class-transformer';
import { IsNotEmpty, IsNotEmptyObject, ValidateNested } from 'class-validator';

export class ImportNoteItem {
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  quantity: number;
  @IsNotEmpty()
  material_id: number | undefined;
}

export class CreateImportNoteDto {
  @IsNotEmpty()
  receiver_name: string;
  note: string;
  @IsNotEmpty()
  provider_id: string;
  @ValidateNested({ each: true })
  @Type(() => ImportNoteItem)
  import_note_detail: ImportNoteItem[];
}


export class ExportNoteItem {
  @IsNotEmpty()
  quantity: number;
  @IsNotEmpty()
  material_id: number | undefined;
}

export class CreateExportNoteDto {
  @IsNotEmpty()
  picker_name: string;
  note: string;
  @ValidateNested({ each: true })
  @Type(() => ExportNoteItem)
  export_note_detail: ExportNoteItem[];
}

