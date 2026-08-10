import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, userId } });
      if (!project) throw new NotFoundException('Project not found or access denied');
    }
    if (dto.parentId) {
      const parent = await this.prisma.task.findFirst({ where: { id: dto.parentId, userId } });
      if (!parent) throw new NotFoundException('Parent task not found or access denied');
    }

    return this.prisma.task.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        subtasks: {
          include: { user: true }
        },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        },
        labels: true,
        resources: true,
        user: true,
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    // Check if task exists and belongs to user
    await this.findOne(userId, id);

    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, userId } });
      if (!project) throw new NotFoundException('Project not found or access denied');
    }
    if (dto.parentId) {
      const parent = await this.prisma.task.findFirst({ where: { id: dto.parentId, userId } });
      if (!parent) throw new NotFoundException('Parent task not found or access denied');
    }

    return this.prisma.task.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    // Check if task exists and belongs to user
    await this.findOne(userId, id);

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async addComment(userId: string, taskId: string, content: string) {
    await this.findOne(userId, taskId);
    return this.prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: { user: true }
    });
  }

  async addLabel(userId: string, taskId: string, name: string, color?: string) {
    await this.findOne(userId, taskId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        labels: {
          create: { name, color }
        }
      },
      include: { labels: true }
    });
  }

  async addResource(userId: string, taskId: string, title: string, url?: string) {
    await this.findOne(userId, taskId);
    return this.prisma.resource.create({
      data: {
        title,
        url,
        taskId
      }
    });
  }
}
