import { IOrganization } from "./organization.interface";

/**
 * Shape of the HTTP request to create a payment intent.
 */
export interface ICreatePaymentIntentRequestBody {
  productId: string;
  organization: Omit<IOrganization, "id"> & { id?: string };
}
