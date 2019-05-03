import { Body, Controller, Param, Post } from '@nestjs/common';
import { HostModel, HostStatus } from '@shared/models';
import { HostService } from '@shared/service';
import { Observable } from 'rxjs';

interface HostCreateDto {
    hostname: string;
    name: string;
    ip: string;
    port: number;
}

@Controller('server/host')
export class HostController {

    constructor(private hostService: HostService) {
    }

    @Post()
    addHost(@Body() hostCreateDto: HostCreateDto): Observable<HostModel> {
        return this.hostService.addHost(hostCreateDto.hostname, hostCreateDto.name, hostCreateDto.ip, hostCreateDto.port);
    }

    @Post('/:name/status')
    updateHostStatus(@Param('name') name: string, @Body() hostStatus: { status: HostStatus }): Observable<HostModel> {
        return this.hostService.updateHostStatus(name, hostStatus.status);
    }
}
