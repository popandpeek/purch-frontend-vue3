export interface User {
    username: null | string,
    password: null | string,
    token: null | string
}

export interface HouseItem {
    id: number,
    item_class_id: number,
    name: string,
    description: string,
    active: boolean,
    measure_unit: string,
    cur_price: string,
    default_vendor_item_id: null | number,
    item_class: null | Array<ItemClass>,
    house_order_items: null | Array<HouseOrderItem>,
    house_inventory_items: null | Array<InventoryItem>,
    vendor_items: null | Array<VendorItem>,
    storage_locations: null | Array<string>
}

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

export interface HouseOrder {
    id: number,
    date: string,
    submitted: boolean,
    house_order_items: null | Array<HouseOrderItem>,
    user_id: null | number
}

export interface HouseOrderItem {
    id: number,
    house_item_id: number,
    house_order_id: number,
    quantity: string,
    measure_unit: string,
    price: string
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
    submitted: boolean,
    house_inventory_items: Array<InventoryItem>
}

export interface InventoryItem {
    id: number,
    house_item_id: number,
    house_inventory_id: number,
    date: string,
    quantity: string,
    measure_unit: string,
    price: string
}

export interface Vendor {
    id: number,
    name: string,
    account_number: string,
    address1: string,
    address2: null | string,
    address_city: string,
    address_state: string,
    address_zip: string,
    contact_name_first: string,
    contact_name_last: string,
    contact_email: string,
    phone: string,
    email: string,
    delivery_days: null | Array<string>,
    delivery_times: null | Array<string>,
}

export interface VendorOrder {
    id: number,
    vendor_id: number,
    date: string,
    submitted: boolean,
    vendor_invoice_id: null | number,
    vendor_order_items: null | Array<VendorOrderItem>
}

export interface VendorOrderItem {
    id: number,
    vendor_item_id: number,
    vendor_order_id: number,
    vendor_invoice_id: number,
    price: string,
    quantity: string,
    measure_unit: string,
}

export interface VendorItem {
    id: number,
    active: boolean,
    vendor_id: number,
    house_item_id: number,
    vendor_item_id: number,
    vendor_SKU: string,
    product_name: string,
    description: string,
    latest_price: string,
    measure_unit: string,
    pack_size: number,
    pack_number: number,
    brand_name: string,
    vendor_order_items: null | Array<VendorOrderItem>,
    vendor_invoice_items: null | Array<VendorInvoiceItem>
}

export interface VendorInvoice {
    id: number,
    vendor_id: number,
    vendor_order_id: number,
    date: string,
    invoice_doc_id: string,
    paid: boolean,
    vendor_invoice_items: null | Array<VendorInvoiceItem>
}

export interface VendorInvoiceItem {
    id: number,
    vendor_invoice_id: number,
    vendor_order_item_id: number,
    vendor_item_id: number,
    measure_unit: string,
    pack_size: string,
    pack_number: string,
    price: string,
    quantity: string
}