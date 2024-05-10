import { Column, Entity } from "typeorm";
import { CoreEntity } from "./core-entity.model";

@Entity()
export class Product extends CoreEntity {
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar" })
  subtitle: string;

  @Column({ type: "integer" })
  priceInBaseUnits: number;

  @Column({ type: "varchar" })
  currencyCode: string;

  @Column({ type: "varchar" })
  groupMembershipsCsv: string;

  /**
   * Specify details about a transaction so a customer can understand it clearly
   * on his statement. The suffix is concatenated with the prefix, the * symbol,
   * and a space to form the complete statement descriptor that a customer
   * sees.
   *
   * Make sure that the total length of the concatenated descriptor is no more
   * than 22 characters, including the * symbol and the space. If the prefix is
   * RUNCLUB (7 characters), the dynamic suffix can contain up to 13
   * characters—for example, 9-22-19 10K (11 characters) or OCT MARATHON
   * (12 characters). The computed statement descriptor is RUNCLUB* 9-22-19 10K
   * or RUNCLUB* OCT MARATHON.
   */
  @Column({ type: "varchar" })
  statementDescriptorSuffix: string;

  @Column({ type: "smallint", nullable: true })
  adminCount?: number;

  @Column({ type: "smallint", nullable: true })
  userCount?: number;

  @Column({ type: "real", nullable: true })
  storageGb?: number;
}
