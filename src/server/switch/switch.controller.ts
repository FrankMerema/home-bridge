import { Controller, Get, Param } from '@nestjs/common';
import { SwitchModel } from '@shared/models';
import { SwitchService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('switch')
export class SwitchController {
  constructor(private switchService: SwitchService) {}

  @Get('all/:host')
  getAllSwitchesForHost(@Param('host') name: string): Observable<SwitchModel[]> {
    return this.switchService.getSwitches(name);
  }
}
