import { Field, ID, InputType, Int } from "type-graphql";

@InputType()
export class RateInput {
  @Field((type) => ID)
  recipeId!: string;

  @Field((type) => Int)
  value!: number;
}
