export type OrderRequestType = {
  deliveryType: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  phone: string;
  email: string;
  paymentType: string;
  street?: string;
  house?: string;
  entrance?: string;
  apartment?: string;
  comment?: string;
};
