import { Product } from './producto.model';

export interface CartItem extends Product {
  cantidad: number;
}
