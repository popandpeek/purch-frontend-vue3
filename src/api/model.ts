export interface HouseItem {
    id: string,
    name: string,
    description: string,
    vendorList: null| Array<string>,
    vendorItemIdList: null | Array<string>,
    storageLocations: null | Array<string>,
    measure: string,
    lastPrice: null | string
}

export interface HouseOrder {
    id: string,
    date?: string,
    submitted?: boolean,
    items: null | Array<HouseOrderItem>,
    users: null | Array<object>
}

export interface HouseOrderItem {
    itemId: string,
    quantity: string,
    measure: string,
    price: string
}

export interface HouseOrderUpdateItem {
    id: string,
    itemId: string,
    updatedQuantity: string,
}

export interface Inventory {
    id: string,
    date: string
    submitted: boolean,
    items: Array<InventoryItem>
}

export interface InventoryItem {
    houseItemId: string,
    quantity: string,
    measure: string
}

export interface Vendor {
    id: string,
    accountNumber: string,
    name: string,
    address: string,
    phone: string,
    email: string
    deliveryDays: null | Array<string>,
    deliveryTimes: null | Array<string>,
    contactList?: null | Array<string>
}

export interface VendorOrder {
    id: string,
    date: string,
    vendorId: string,
    vendorName: string,
    items: null | Array<VendorOrderItem>
}

export interface VendorOrderItem {
    itemId: string,
    vendorItemId: string,
    quantity: string,
    measure: string,
    price: string,
    costExtended: string
}

export interface VendorItem {
    id: string,
    name: string,
    description: string,
    vendorId: string,
    VendorItemId: string,
    packSize: string,
    packWeight: string,
    packQuantity: string,
    curPrice: string,
    pastPrices: null | Array<[string, string]>
}

export interface VendorInvoice {
    id: string,
    date: string,
    vendorId: string,
    vendorName: string,
    invoiceDocId: string,
    status: string,
    items: null | Array<VendorInvoiceItem>
}

export interface VendorInvoiceItem {
    id: string,
    description: string,
    packSize: string,
    packWeight: string,
    packQuantity: string,
    price: string,
    quantity: string
}