import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HostModel, HostStatus } from '@shared/models';
import { HostService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('host')
export class HostController {

    constructor(private hostService: HostService) {
    }

    @Get('all')
    @UseGuards(AuthGuard('jwt'))
    getAllHosts(): Observable<HostModel[]> {
        return this.hostService.getAllHosts();
    }

    @Get(':name/status')
    @UseGuards(AuthGuard('jwt'))
    getHostStatus(@Param('name') name: string): Observable<{ status: HostStatus }> {
        return this.hostService.getHostStatus(name);
    }

    @Get(':name')
    @UseGuards(AuthGuard('jwt'))
    getHost(@Param('name') name: string): Observable<HostModel> {
        return this.hostService.getHost(name);
    }

    @Delete(':ip')
    @UseGuards(AuthGuard('jwt'))
    deleteHost(@Param('ip') ip: string): Observable<{}> {
        return this.hostService.deleteHost(ip);
    }
}
