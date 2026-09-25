export interface OrderLineItem {
  id: string;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  reference: string; // e.g. ORD-2026-0001
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  customer: OrderCustomer;
  items: OrderLineItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress: OrderShippingAddress;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    reference: "ORD-2026-0001",
    status: "PENDING",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+44 7700 900123",
    },
    items: [
      {
        id: "li_001",
        productName: "Premium Braiding Hair — 24 inch (Black)",
        sku: "BRAID-24-BLK",
        quantity: 3,
        unitPrice: 24.99,
        subtotal: 74.97,
      },
      {
        id: "li_002",
        productName: "Braiding Gel — 500ml",
        sku: "GEL-500",
        quantity: 1,
        unitPrice: 12.5,
        subtotal: 12.5,
      },
    ],
    subtotal: 87.47,
    shippingFee: 4.99,
    taxAmount: 0,
    total: 92.46,
    currency: "GBP",
    shippingAddress: {
      line1: "42 Brixton Road",
      line2: "Flat 3B",
      city: "London",
      state: null,
      postalCode: "SW9 6BU",
      country: "United Kingdom",
    },
    notes: "Please deliver after 5pm if possible.",
    createdAt: "2026-09-22T10:15:00Z",
    updatedAt: "2026-09-22T10:15:00Z",
  },
  {
    id: "ord_002",
    reference: "ORD-2026-0002",
    status: "PROCESSING",
    customer: {
      name: "Amara Okafor",
      email: "amara.okafor@example.com",
      phone: "+44 7700 900456",
    },
    items: [
      {
        id: "li_003",
        productName: "Lace Front Wig — Natural Black",
        sku: "WIG-LF-NB",
        quantity: 1,
        unitPrice: 189.0,
        subtotal: 189.0,
      },
    ],
    subtotal: 189.0,
    shippingFee: 8.5,
    taxAmount: 0,
    total: 197.5,
    currency: "GBP",
    shippingAddress: {
      line1: "15 Deansgate",
      city: "Manchester",
      state: null,
      postalCode: "M3 2BW",
      country: "United Kingdom",
    },
    notes: null,
    createdAt: "2026-09-21T14:32:00Z",
    updatedAt: "2026-09-22T09:10:00Z",
  },
  {
    id: "ord_003",
    reference: "ORD-2026-0003",
    status: "SHIPPED",
    customer: {
      name: "Grace Mensah",
      email: "grace.mensah@example.com",
      phone: "+44 7700 900789",
    },
    items: [
      {
        id: "li_004",
        productName: "Kinky Curly Bundle — 18 inch",
        sku: "KC-18",
        quantity: 2,
        unitPrice: 45.0,
        subtotal: 90.0,
      },
      {
        id: "li_005",
        productName: "Edge Control — Strong Hold",
        sku: "EDGE-SH",
        quantity: 2,
        unitPrice: 8.99,
        subtotal: 17.98,
      },
      {
        id: "li_006",
        productName: "Silk Bonnet — Satin (Pink)",
        sku: "BON-SAT-PNK",
        quantity: 1,
        unitPrice: 14.5,
        subtotal: 14.5,
      },
    ],
    subtotal: 122.48,
    shippingFee: 4.99,
    taxAmount: 0,
    total: 127.47,
    currency: "GBP",
    shippingAddress: {
      line1: "88 Broad Street",
      city: "Birmingham",
      state: null,
      postalCode: "B1 2EA",
      country: "United Kingdom",
    },
    notes: null,
    createdAt: "2026-09-19T08:20:00Z",
    updatedAt: "2026-09-21T16:45:00Z",
  },
  {
    id: "ord_004",
    reference: "ORD-2026-0004",
    status: "DELIVERED",
    customer: {
      name: "Chioma Adeyemi",
      email: "chioma.a@example.com",
      phone: null,
    },
    items: [
      {
        id: "li_007",
        productName: "Crochet Braid Pack — Mixed Colours",
        sku: "CRO-MIX",
        quantity: 5,
        unitPrice: 18.0,
        subtotal: 90.0,
      },
    ],
    subtotal: 90.0,
    shippingFee: 4.99,
    taxAmount: 0,
    total: 94.99,
    currency: "GBP",
    shippingAddress: {
      line1: "72 Mill Lane",
      city: "Leeds",
      state: null,
      postalCode: "LS1 5DL",
      country: "United Kingdom",
    },
    notes: null,
    createdAt: "2026-09-15T12:00:00Z",
    updatedAt: "2026-09-18T11:30:00Z",
  },
  {
    id: "ord_005",
    reference: "ORD-2026-0005",
    status: "CANCELLED",
    customer: {
      name: "Yaa Asantewaa",
      email: "yaa.asante@example.com",
      phone: "+44 7700 900234",
    },
    items: [
      {
        id: "li_008",
        productName: "Wig Cap — Elastic (Pack of 3)",
        sku: "CAP-EL-3",
        quantity: 2,
        unitPrice: 6.5,
        subtotal: 13.0,
      },
    ],
    subtotal: 13.0,
    shippingFee: 4.99,
    taxAmount: 0,
    total: 17.99,
    currency: "GBP",
    shippingAddress: {
      line1: "9 Sauchiehall Street",
      city: "Glasgow",
      state: null,
      postalCode: "G2 3AD",
      country: "United Kingdom",
    },
    notes: "Customer requested cancellation — item out of stock.",
    createdAt: "2026-09-12T09:45:00Z",
    updatedAt: "2026-09-12T15:20:00Z",
  },
  {
    id: "ord_006",
    reference: "ORD-2026-0006",
    status: "PENDING",
    customer: {
      name: "Abena Owusu",
      email: "abena.owusu@example.com",
      phone: "+44 7700 900567",
    },
    items: [
      {
        id: "li_009",
        productName: "Deep Wave Bundle — 22 inch",
        sku: "DW-22",
        quantity: 1,
        unitPrice: 68.0,
        subtotal: 68.0,
      },
    ],
    subtotal: 68.0,
    shippingFee: 4.99,
    taxAmount: 0,
    total: 72.99,
    currency: "GBP",
    shippingAddress: {
      line1: "55 Park Street",
      city: "Bristol",
      state: null,
      postalCode: "BS1 5NF",
      country: "United Kingdom",
    },
    notes: null,
    createdAt: "2026-09-23T07:05:00Z",
    updatedAt: "2026-09-23T07:05:00Z",
  },
];