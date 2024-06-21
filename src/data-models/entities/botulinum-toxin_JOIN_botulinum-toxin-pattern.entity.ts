import { Column, Entity, ManyToOne, Relation } from "typeorm";
import { BotulinumToxinPattern } from "./botulinum-toxin-pattern.entity";
import { BotulinumToxin } from "./botulinum-toxin.entity";
import { CoreEntity } from "./core-entity.model";

/**
 * Database entity for the relationship between Toxin and Pattern.
 * Explicitly defined for the purpose of tracking metadata that only exists in
 * the sense of the relationship between these entities.
 */
@Entity()
export class BotulinumToxin_JOIN_BotulinumToxinPattern extends CoreEntity {
  @ManyToOne(() => BotulinumToxin)
  toxin: Relation<BotulinumToxin>;

  @Column({ type: "uuid" })
  toxinId: string;

  @ManyToOne(() => BotulinumToxinPattern)
  pattern: Relation<BotulinumToxinPattern>;

  @Column({ type: "uuid" })
  patternId: string;

  @Column({ type: "int" })
  referenceDoseInToxinUnits: number;
}
