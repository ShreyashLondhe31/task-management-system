import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(user.userId, createTaskDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(user.userId, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.remove(user.userId, id);
  }

  @Post(':id/comments')
  addComment(@CurrentUser() user: any, @Param('id') id: string, @Body('content') content: string) {
    return this.tasksService.addComment(user.userId, id, content);
  }

  @Post(':id/labels')
  addLabel(@CurrentUser() user: any, @Param('id') id: string, @Body('name') name: string, @Body('color') color?: string) {
    return this.tasksService.addLabel(user.userId, id, name, color);
  }

  @Post(':id/resources')
  addResource(@CurrentUser() user: any, @Param('id') id: string, @Body('title') title: string, @Body('url') url?: string) {
    return this.tasksService.addResource(user.userId, id, title, url);
  }
}
