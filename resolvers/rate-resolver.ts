import { FieldResolver, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Rate } from "../entities/rate";
import { User } from "../entities/user";

@Resolver((of) => Rate)
@Service()
export class RateResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  @FieldResolver()
  async user(@Root() rate: Rate): Promise<User> {
    return (await this.userRepository.findOne({ where: { id: rate.userId } }))!;
  }
}
