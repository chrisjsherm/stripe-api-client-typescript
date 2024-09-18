import { Column, Entity, ManyToOne, Relation } from "typeorm";
import { BotulinumToxinPattern } from "./botulinum-toxin-pattern.entity";
import { BotulinumToxinTreatment } from "./botulinum-toxin-treatment.entity";
import { BotulinumToxin, IBotulinumToxin } from "./botulinum-toxin.entity";
import { CoreEntity } from "./core-entity.model";

/**
 * Database entity for the relationship between Treatment and Pattern.
 * Explicitly defined for the purpose of tracking metadata that only exists in
 * the sense of the relationship between these entities.
 */
@Entity()
export class BotulinumToxinTreatment_JOIN_BotulinumToxinPattern extends CoreEntity {
  @Column({ type: "real" })
  diluentMl: number;

  @Column({ type: "int" })
  priceChargedPerToxinUnitInBaseCurrencyUnits: number;

  @ManyToOne(() => BotulinumToxin, { nullable: false })
  product: BotulinumToxin;

  @Column({ type: "uuid" })
  productId: string;

  @ManyToOne(() => BotulinumToxinPattern)
  pattern: Relation<BotulinumToxinPattern>;

  @Column({ type: "uuid" })
  patternId: string;

  @Column({ type: "int" })
  toxinUnits: number;

  @ManyToOne(() => BotulinumToxinTreatment)
  treatment: Relation<BotulinumToxinTreatment>;

  @Column({ type: "uuid" })
  treatmentId: string;
}

/**
 * View model for creating the treatment-pattern relationship.
 */
export interface IBotulinumToxinTreatmentPatternViewModelCreate {
  diluentMl: number;
  priceChargedPerToxinUnitInBaseCurrencyUnits: number;
  productId: string;
  patternId: string;
  toxinUnits: number;
}

/**
 * View model for reading the treatment-pattern relationship.
 */
export interface IBotulinumToxinTreatmentPatternViewModelRead {
  id: string;
  name: string;
  diluentMl: number;
  priceChargedPerToxinUnitInBaseCurrencyUnits: number;
  product: Pick<IBotulinumToxin, "id" | "name">;
  toxinUnits: number;
}
