import { MemCreateInput } from './dto/input/memCreate.input';
import { GetMemsInput } from './dto/input/memsGetBest.input';
import { MemUpdateInput } from './dto/input/memUpdate.input';
import { MemNotFoundException } from './exceptions/memNotFound.exception';
import { NotMemCreatorException } from './exceptions/notMemCreator.exception copy';
import { MemMetadataService } from './mem.metadata.service';
import { MemModel } from './models/mem.model';

import { PrismaService } from '../../../../../libs/common/src/modules/prisma/prisma.service';
import { StoreImgBBService } from '../store/store.imgbb.service';

import { Injectable } from '@nestjs/common';
import { isNull, map, omit } from 'lodash';

@Injectable()
export class MemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metadataService: MemMetadataService,
    private readonly storeService: StoreImgBBService,
  ) {}

  async getMems(input: GetMemsInput): Promise<MemModel[]> {
    return this.prisma.mem.findMany({
      take: input.take,
      skip: input.skip,
      orderBy: { rating: { amount: 'desc' } },
    });
  }

  async getAllMemsIds() {
    return this.prisma.mem.findMany({
      select: { id: true },
    });
  }

  async countAllMemsAmount(): Promise<number> {
    return this.prisma.mem.count();
  }

  async createMem(
    input: MemCreateInput & { userId: string },
  ): Promise<MemModel> {
    const images = await this.storeService.storeManyImages(
      input.imgsBuffers.map(imgBuffer => Buffer.from(imgBuffer)),
    );

    return this.prisma.mem.create({
      data: {
        images: {
          createMany: {
            data: images.map(i => omit(i.imageMeta, 'id')),
          },
        },
        text: input.text ?? null,
        tags: {
          connectOrCreate: input.tags?.map(tag => ({
            create: { value: tag },
            where: { value: tag },
          })),
        },
        createdUser: { connect: { id: input.userId } },
        rating: { create: { amount: 0 } },
      },
    });
  }

  async updateMem(
    input: MemUpdateInput & { userId: string },
  ): Promise<MemModel> {
    const mem = await this.prisma.mem.findUnique({
      where: { id: input.id },
    });

    if (isNull(mem)) {
      throw new MemNotFoundException(input.id);
    }

    if (mem.createdUserId !== input.userId) {
      throw new NotMemCreatorException();
    }

    return this.prisma.mem.update({
      where: { id: input.id },
      data: {
        text: input.text,
        tags: {
          connectOrCreate: input.tags?.map(tag => ({
            create: { value: tag },
            where: { value: tag },
          })),
        },
      },
    });
  }
}
