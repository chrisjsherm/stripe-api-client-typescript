import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { BotoxPatternConfiguration } from "./botox-pattern-configuration.entity";
import { CoreEntity } from "./core-entity.model";
import { User } from "./user.entity";

/**
 * Organization or business using the app.
 */
@Entity()
export class Organization extends CoreEntity {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @OneToOne(() => BotoxPatternConfiguration, (pattern) => pattern.organization)
  botoxPatternConfiguration: BotoxPatternConfiguration;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}
