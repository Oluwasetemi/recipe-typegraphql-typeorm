import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { FindOptionsWhere, Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Rate } from "../entities/rate";
import { Recipe } from "../entities/recipe";
import { User } from "../entities/user";
import { Context } from "../index";
import { RateInput } from "../types/rate-input";
import { RecipeInput } from "../types/recipe-input";

@Resolver((of) => Recipe)
export class RecipeResolver {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(Rate)
    private readonly ratingsRepository: Repository<Rate>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  @Query((returns) => Recipe, { nullable: true })
  recipe(@Arg("recipeId", (type) => Int) recipeId: number) {
    console.log(this);
    return this.recipeRepository.findOne({ where: { id: recipeId } });
  }

  @Query((returns) => [Recipe])
  recipes(): Promise<Recipe[]> {
    return this.recipeRepository.find();
  }

  @Mutation((returns) => Recipe)
  async addRecipe(
    @Arg("recipe") recipeInput: RecipeInput,
    @Ctx() { user }: Context
  ): Promise<Recipe> {
    const recipe = this.recipeRepository.create({
      ...recipeInput,
      authorId: user.id,
    });
    return await this.recipeRepository.save(recipe);
  }

  @Mutation((returns) => Recipe)
  async rate(
    @Arg("rate") rateInput: RateInput,
    @Ctx() { user }: Context
  ): Promise<Recipe> {
    // find the recipe
    const recipe = await this.recipeRepository.findOne({
      where: { id: rateInput.recipeId } as unknown as FindOptionsWhere<Recipe>,
    });
    if (!recipe) {
      throw new Error("Invalid recipe ID");
    }

    // set the new recipe rate
    const newRate = this.ratingsRepository.create({
      recipe,
      value: rateInput.value,
      user,
    });
    recipe.ratings.push(newRate);

    // update the recipe
    await this.recipeRepository.save(recipe);
    return recipe;
  }

  @FieldResolver()
  ratings(@Root() recipe: Recipe) {
    return this.ratingsRepository.find({
      cache: 1000,
      where: { recipe: { id: recipe.id } },
    });
  }

  @FieldResolver()
  async author(@Root() recipe: Recipe): Promise<User> {
    return (await this.userRepository.findOne({
      where: { id: recipe.authorId },
      cache: 1000,
    }))!;
  }
}
