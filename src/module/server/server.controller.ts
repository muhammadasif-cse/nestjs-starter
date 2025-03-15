import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ServerService } from './server.service';

@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get()
  getServer(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html');
    res.send(this.serverService.getServer());
  }
}
