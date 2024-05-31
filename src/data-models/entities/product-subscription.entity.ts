import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { PaymentProcessor } from "../enums/payment-processor.enum";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";
import { Product } from "./product.entity";

/**
 * Database entity for a subscription to a product.
 */
@Entity()
export class ProductSubscription extends CoreEntity {
  @Column({ type: "date" })
  expirationDateTime: string;

  @Column({ type: "varchar" })
  paymentId: string;

  @Column({ type: "enum", enum: PaymentProcessor })
  paymentProcessor: PaymentProcessor;

  @ManyToMany(() => Product)
  products: Array<Product>;

  @ManyToOne(() => Organization)
  organization: Organization;
}
