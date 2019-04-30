import { Controller, Delete, Get, Param } from '@nestjs/common';
import { HostModel, HostStatus } from '@shared/models';
import { HostService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('host')
export class HostController {

    constructor(private hostService: HostService) {
    }

    @Get('all')
    getAllHosts(): Observable<HostModel[]> {
        return this.hostService.getAllHosts();
    }

    @Get(':name/status')
    getHostStatus(@Param() name: string): Observable<{ status: HostStatus }> {
        return this.hostService.getHostStatus(name);
    }

    @Get(':name')
    getHost(@Param() name: string): Observable<HostModel> {
        return this.hostService.getHost(name);
    }

    @Delete(':ip')
    deleteHost(@Param() ip: string): Observable<{}> {
        return this.hostService.deleteHost(ip);
    }
}
