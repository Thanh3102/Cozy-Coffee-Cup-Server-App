export type AddMaterialDto = {
  name: string;
  stock_quantity: number;
  expiration_date: Date;
  unit_id: number;
  min_stock: number;
};

export type UpdateMaterialDto = {
  id: number;
  name: string;
  stock_quantity: number;
  expiration_date: Date;
  unit_id: number;
  min_stock: number;
  active: boolean;
};

export type CreateProviderDto = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type UpdateProviderDto = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
};

export type ImportNoteItem = {
  price: number;
  quantity: number;
  material_id: number | undefined;
};

export type ExportNoteItem = {
  quantity: number;
  material_id: number | undefined;
};

export type CreateImportNoteDto = {
  receiver_name: string;
  note: string;
  total: number;
  provider_id: string;
  import_note_detail: ImportNoteItem[];
};

export type CreateExportNoteDto = {
  picker_name: string;
  note: string;
  export_note_detail: ExportNoteItem[];
};

export type CreateProductDto = {
  name: string;
  price: string;
  type_id: string;
  category_id: string;
  description: string;
  note: string;
  image: File;
};

export type UpdateProductDto = {
  id: string;
  name: string;
  price: string;
  type_id: string;
  category_id: string;
  description: string;
  note: string;
  image: File;
  status: string;
  discount: string;
};

export type CreateUnitDto = {
  name: string;
  short: string;
};

export type UpdateUnitDto = {
  id: number;
  name: string;
  short: string;
};

export type CreateOptionDto = {
  title: string;
  required: boolean;
  allows_multiple: boolean;
  values: { name: string; price: number }[];
};

export type UpdateOptionDto = {
  id: number;
  title: string;
  required: boolean;
  allows_multiple: boolean;
};

export type UpdateProductOptionDto = {
  product_id: number;
  options: {
    option_id: number;
    values: number[];
  }[];
};

export type CreateCategoryDto = {
  name: string;
};

export type UpdateCategoryDto = {
  id: number;
  name: string;
};

export type CreateProductTypeDto = {
  name: string;
};

export type UpdateProductTypeDto = {
  id: number;
  name: string;
};

export type CreateOrderDto = {
  note: string;
  type?: string;
  total: number;
  items: Array<{
    discount: number;
    is_gift: boolean;
    name: string;
    price: number;
    product_id: number;
    quantity: number;
    options: Array<{
      id: number;
      title: string;
      values: Array<{ id: number; name: string; price: number }>;
    }>;
  }>;
};

export type UpdateOrderDto = {
  id: number;
  note: string;
  type: string;
  total: number;
  items: Array<{
    id?: number;
    discount: number;
    is_gift: boolean;
    name: string;
    price: number;
    product_id: number;
    quantity: number;
    options: Array<{
      id: number;
      title: string;
      values: Array<{ id: number; name: string; price: number }>;
    }>;
  }>;
  deleteItems: Array<number>;
};

export type PayOrderDto = {
  id: number;
  paymentMethod: number;
  paymentAt: Date;
};

export type RevenueOverviewDto = {
  revenue: number;
  numberOfOrder: number;
};
