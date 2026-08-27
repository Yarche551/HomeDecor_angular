// Значения должны совпадать с config.js на бэкенде
export enum DeliveryType {
  delivery = 'delivery',
  self = 'self',
}

export enum PaymentType {
  cashToCourier = 'cashToCourier',
  cardToCourier = 'cardToCourier',
  cardOnline = 'cardOnline',
}

export enum OrderStatus {
  new = 'new',
  pending = 'pending',
  delivery = 'delivery',
  cancelled = 'cancelled',
  success = 'success',
}

export const OrderStatusLabels: { [key: string]: string } = {
  [OrderStatus.new]: 'Новый',
  [OrderStatus.pending]: 'В обработке',
  [OrderStatus.delivery]: 'Доставляется',
  [OrderStatus.cancelled]: 'Отменен',
  [OrderStatus.success]: 'Выполнен',
};

export const PaymentTypeLabels: { [key: string]: string } = {
  [PaymentType.cashToCourier]: 'Наличными курьеру',
  [PaymentType.cardToCourier]: 'Картой курьеру',
  [PaymentType.cardOnline]: 'Картой онлайн',
};

export const DeliveryTypeLabels: { [key: string]: string } = {
  [DeliveryType.delivery]: 'Доставка',
  [DeliveryType.self]: 'Самовывоз',
};
