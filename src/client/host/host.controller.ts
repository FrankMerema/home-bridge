import { Controller, Delete, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HostModel, HostStatus } from '../../shared/models/host/host.model';
import { HostService } from './host.service';

@Controller('host')
export class HostController {

    constructor(private hostService: HostService) {
    }

    @Get('all')
    getAllHosts(): Observable<HostModel[]> {
        return this.hostService.getAllHosts();
    }

    @Get(':ip/status')
    getHostStatus(@Param() ip: string): Observable<{ status: HostStatus }> {
        return this.hostService.getHostStatus(ip);
    }

    @Get(':ip')
    getHost(@Param() ip: string): Observable<HostModel> {
        return this.hostService.getHost(ip);
    }

    @Delete(':ip')
    deleteHost(@Param() ip: string): Observable<{}> {
        return this.hostService.removeHost(ip);
    }
}
