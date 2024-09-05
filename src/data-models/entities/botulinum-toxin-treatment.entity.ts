import { Column, Entity, ManyToOne, Relation } from "typeorm";
import { BotulinumToxin } from "./botulinum-toxin.entity";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

@Entity()
export class BotulinumToxinTreatment extends CoreEntity {
  @Column({ type: "real" })
  diluentMl: number;

  @Column({ type: "int" })
  priceChargedPerToxinUnitInBaseCurrencyUnits: number;

  @ManyToOne(() => BotulinumToxin, { nullable: false })
  product: BotulinumToxin;

  @Column({ type: "uuid" })
  productId: string;

  @ManyToOne(() => Organization, { nullable: false })
  organization: Relation<Organization>;

  @Column({ type: "uuid" })
  organizationId: string;
}
