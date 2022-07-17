import { Field, Int, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";

import { Recipe } from "./recipe";
import { User } from "./user";

@Entity()
@ObjectType()
export class Rate {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field((type) => Int)
  @Column({ type: "int" })
  value!: number;

  @Field((type) => User)
  @ManyToOne((type) => User)
  user!: User;
  @RelationId((rate: Rate) => rate.user)
  userId!: number;

  @Field()
  @CreateDateColumn()
  date!: Date;

  @ManyToOne((type) => Recipe)
  recipe!: Recipe;
  @RelationId((rate: Rate) => rate.recipe)
  recipeId!: number;
}
