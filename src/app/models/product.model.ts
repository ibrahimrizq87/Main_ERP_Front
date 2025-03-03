export interface ProductBranch {
    id: string;
    store: Store;
    product_color: ProductColor;
    stock:number;
    product:Product
  }

export interface Product {
    id: string;
    name: string;
    name_lang: { en: string; ar: string };
    cover_image: string;
    description: string;
    default_price: string;
    stock: number;
    created_at: string;
    updated_at: string;
    colors: ProductColor[];
    images: ProductImage[];
    prices: ProductPrice[];
    productCategory: ProductCategory;
    product_unit: ProductUnit;
  }
  

  export interface ProductColor {
    id: string;
    image: string | null;
    color: string;
  }
  
  export interface ProductImage {
    id: number;
    image: string;
  }
  
  export interface ProductPrice {
    id: number;
    price: string;
    currency: string;
  }
  
  export interface ProductCategory {
    id: number;
    name: string;
    image: string;
  }
  
  export interface ProductUnit {
    id: number;
    name: string;
  }
  
  export interface Store {
    id: number;
    name: string;
    manager_name: string;
    phone: string;
    note: string | null;
  }
  