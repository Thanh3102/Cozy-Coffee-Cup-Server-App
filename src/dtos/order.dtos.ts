import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class CreateOrderDto {
  note: string;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  total: number
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
}

export class UpdateOrderDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  note: string;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
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
}

export class PayOrderDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  paymentMethod: number;
  @IsNotEmpty()
  paymentAt: Date;
}
