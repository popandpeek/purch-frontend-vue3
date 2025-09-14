// Update User interface to work with Firebase
export interface User {
  id: string; // Firebase UID
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

// Add authentication interfaces
export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface HouseItem {
    id: number,
    name: string,
    storage_location: string,
    inventory_category: string,
    tracking_unit: UnitType,
    par_level: number,
    current_count: number,
    current_price_per_unit: string,
    active: boolean,
    default_vendor_item_id: number,
    vendor_items: Array<VendorItem>
}

export type UnitType = 'each' | 'pound' | 'gallon' | 'dozen' | 'case' | 'box' | 'bag' | 'bottle';

export interface ItemClass {
    id: number,
    type: string,
    house_items: null | Array<HouseItem>
}


export interface StorageLocation {
    id: number,
    name: string,
    storage_type: string,
    house_items: null | Array<HouseItem>
}


export interface HouseOrderUpdateItem {
    order_id: number,
    order_item_id: number,
    updated_quantity: string,
}

export interface HouseInventoryUpdateItem {
    inventory_id: number,
    inventory_item_id: number,
    updated_quantity: string,
}

export interface Inventory {
    id: number,
    date: string,
    status: string,
    total_value: string,
    notes: string,
    created_at: string,
    updated_at: string,
    items: Array<InventoryItem>
}

export interface InventoryItem {
    id: number,
    house_item_id: number,
    house_inventory_id: number,
    date: string,
    quantity: string,
    measure: string,
    unit: string,
    price: string
}

export interface Vendor {
    id: number,
    name: string,
    contact_first_name: string,
    contact_last_name: string,
    contact_email: string,
    phone: string,
    items: Array<VendorItem>
}

export interface VendorOrder {
    id: number;
    house_order_id: number | null; // Link to originating house order
    vendor_id: number;
    vendor_name?: string; // Populated vendor name
    date: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    total_cost?: number; // Alias for total_amount
    delivery_date?: string; // Expected delivery date
    notes: string;
    submitted: boolean;
    created_at: string;
    updated_at: string;
    items: Array<VendorOrderItem>;
    vendor: Vendor; // Populated vendor details
}

export interface VendorOrderItem {
    id: number,
    vendor_item_id: number,
    vendor_order_id: number,
    vendor_invoice_id: number,
    price: string,
    quantity: string,
    measure: string,
    unit: string,
}

export interface VendorItem {
    id: number,
    vendor_id: number,
    house_item_id: number,
    vendor_product_id: string,
    product_name: string,
    description: string,
    brand: string,
    brand_name?: string, // Alternative brand field
    category: string,
    sku: string,
    vendor_SKU?: string, // Alternative SKU field
    case_size: number,
    pack_size: number,
    pack_unit: string,
    case_weight: string,
    case_weight_unit: string,
    price_per_case: string,
    cost_price: string,
    min_order_quantity: number,
    max_order_quantity: number,
    is_available: boolean,
    is_active: boolean,
    weight: string,
    dimensions: string,
    shelf_life_days: number,
    storage_requirements: string,
    vendor_name: string,
    vendor_contact: string,
    house_item_name: string,
    vendor_order_items: null | Array<VendorOrderItem>,
    vendor_invoice_items: null | Array<VendorInvoiceItem>
}

export interface VendorInvoice {
    id: number,
    vendor_id: number,
    invoice_number: string,
    invoice_date: string,
    due_date: string,
    subtotal: string,
    tax_amount: string,
    total_amount: string,
    status: string,
    notes: string,
    created_at: string,
    updated_at: string,
    items: Array<VendorInvoiceItem>
}

export interface VendorInvoiceItem {
    id: number,
    invoice_id: number,
    vendor_item_id: number,
    quantity: number,
    unit_price: string,
    total_price: string,
    vendor_item_name: string,
    vendor_item_sku: string,
    vendor_item_description: string,
    case_size: number,
    pack_size: number,
    pack_unit: UnitType,
    case_weight: string,
    case_weight_unit: UnitType,
    price_per_case: string,
    price_per_unit: string,
    total_units: number
}

// House Order System Models
export interface HouseOrder {
    id: number;
    date: string; // ISO date
    status: 'draft' | 'processing' | 'submitted' | 'completed' | 'cancelled';
    priority?: 'high' | 'normal' | 'low'; // Order priority
    total_estimated_cost: number;
    notes: string;
    created_at: string;
    updated_at: string;
    items: HouseOrderItem[];
    vendor_orders: VendorOrder[];
}

export interface HouseOrderItem {
    id: number;
    house_order_id: number;
    house_item_id: number;
    quantity: number;
    priority: 'high' | 'normal' | 'low';
    house_item: HouseItem; // Populated house item details
    vendor_breakdowns: VendorOrderBreakdown[];
}

export interface VendorOrderBreakdown {
    id: number;
    house_order_item_id: number;
    vendor_order_id: number;
    vendor_item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    selection_reason: string; // Why this vendor was chosen
    vendor_item: VendorItem; // Populated vendor item details
}
