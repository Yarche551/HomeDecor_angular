export type OrderItemType = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export type DeliveryInfoType = {
  street?: string;
  house?: string;
  entrance?: string;
  apartment?: string;
};

export type OrderType = {
  items: OrderItemType[];
  deliveryCost: number;
  totalAmount: number;
  deliveryType: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  phone: string;
  email: string;
  deliveryInfo?: DeliveryInfoType;
  paymentType: string;
  comment?: string;
  status: string;
  createdAt: string;
};
