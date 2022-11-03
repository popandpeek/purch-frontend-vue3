export interface HouseItem {
    id: string,
    item_class_id: string,
    name: string,
    description: string,
    active: boolean,
    measure_unit: string,
    cur_price: null | string,
    default_vendor_item_id: null | string,
    item_class: null | Array<ItemClass>,
    house_order_items: null | Array<HouseOrderItem>,
    house_inventory_items: null | Array<InventoryItem>,
    vendor_items: null | Array<VendorItem>,
    storage_locations: null | Array<string>
}

export interface ItemClass {
    id: string,
    type: string,
    house_items: null | Array<HouseItem>
}


export interface StorageLocation {
    id: string,
    name: string,
    storage_type: string,
    house_items: null | Array<HouseItem>
}

export interface HouseOrder {
    id: string,
    date: null | string,
    submitted: null | boolean,
    items: null | Array<HouseOrderItem>,
    user_id: null | string
}

export interface HouseOrderItem {
    id: string,
    house_item_id: string,
    house_order_id: string,
    quantity: string,
    measure: string,
    price: string
}

export interface HouseOrderUpdateItem {
    id: string,
    house_item_id: string,
    updated_quantity: string,
}

export interface Inventory {
    id: string,
    date: string
    submitted: boolean,
    inventory_items: Array<InventoryItem>
}

export interface InventoryItem {
    id: string,
    house_item_id: string,
    inventory_id: string,
    date: string,
    quantity: string,
    measure_unit: string
    price: null | string
}

export interface Vendor {
    id: string,
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
    email: string
    delivery_days: null | Array<string>,
    delivery_times: null | Array<string>,
}

export interface VendorOrder {
    id: string,
    vendor_id: string,
    date: string,
    submitted: boolean,
    vendor_invoice_id: null | string,
    vendor_order_items: null | Array<VendorOrderItem>
}

export interface VendorOrderItem {
    id: string,
    vendor_item_id: string,
    vendor_order_id: string,
    vendor_invoice_id: string,
    price: string,
    quantity: string,
    measure: string,
}

export interface VendorItem {
    id: string,
    active: boolean,
    vendor_id: string,
    house_item_id: string,
    vendor_item_id: string,
    vendor_SKU: string,
    product_name: string,
    description: string,
    latest_price: string,
    measure_unit: string,
    pack_size: string,
    pack_number: string,
    brand_name: string,
    vendor_order_items: null | Array<VendorOrderItem>,
    vendor_invoice_items: null | Array<VendorInvoiceItem>
}

export interface VendorInvoice {
    id: string,
    vendor_id: string,
    vendor_order_id: string,
    date: string,
    invoice_doc_id: string,
    paid: boolean,
    vendor_invoice_items: null | Array<VendorInvoiceItem>
}

export interface VendorInvoiceItem {
    id: string,
    vendor_invoice_id: string,
    vendor_order_item_id: string,
    vendor_item_id: string,
    measure_unit: string,
    pack_size: string,
    pack_number: string,
    price: string,
    quantity: string
}