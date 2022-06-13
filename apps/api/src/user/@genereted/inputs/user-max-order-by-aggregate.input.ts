import { SortOrder } from '../../../prisma/@genereted/enums/sort-order.enum';

import { Field, InputType, HideField } from '@nestjs/graphql';

@InputType()
export class UserMaxOrderByAggregateInput {
  @HideField()
  id?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  email?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  password?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  nickname?: keyof typeof SortOrder;

  @HideField()
  money?: keyof typeof SortOrder;
}
