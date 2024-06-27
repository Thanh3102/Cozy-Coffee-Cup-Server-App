export enum Role {
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  UNPAID = "Chưa thanh toán",
  PAID = "Đã thanh toán"
}

export enum Permission {
  Account_View = 'Account_View',
  Account_Create = 'Account_Create',
  Account_Edit = 'Account_Create',
  Account_Role_Create = 'Account_Role_Create',
  Account_Role_Edit = 'Account_Role_Edit',

  Order_View = 'Order_View',
  Order_Create = 'Order_Create',
  Order_Edit = 'Order_Edit',
  Order_Pay = 'Order_Pay',

  Product_View = 'Product_View',
  Product_Create = 'Product_Create',
  Product_Edit = 'Product_Edit',

  Warehouse_View = 'Warehouse_View',
  Warehouse_Material_Create = 'Warehouse_Material_Create',
  Warehouse_Material_Edit = 'Warehouse_Material_Edit',
  Warehouse_Provider_Create = 'Warehouse_Provider_Create',
  Warehouse_Provider_Edit = 'Warehouse_Provider_Edit',
  Warehouse_ImportNote_Create = 'Warehouse_ImportNote_Create',
  Warehouse_ExportNote_Create = 'Warehouse_ExportNote_Create',
  Warehouse_Note_Delete = 'Warehouse_Note_Delete',

  Definition_View = 'Definition_View',
  Definition_Create = 'Definition_Create',
  Definition_Edit = 'Definition_Edit',
}


