import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { UpdateAuditService } from './update-audit.service';
import { CreateUpdateAuditDto } from './dto/create-update-audit.dto';
import { UpdateUpdateAuditDto } from './dto/update-update-audit.dto';

@Controller('update-audit')
export class UpdateAuditController {
    constructor(private readonly updateAuditService: UpdateAuditService) { }

    @Post()
    create(@Body() createUpdateAuditDto: CreateUpdateAuditDto) {
        return this.updateAuditService.create(createUpdateAuditDto);
    }

    @Get()
    findAll() {
        return this.updateAuditService.findAll();
    }

    @Get('latest')
    getLatestVersion() {
        return this.updateAuditService.getLatestVersion();
    }

    @Get('check/:version')
    checkVersionRequiresUpdate(@Param('version') version: string) {
        return this.updateAuditService.getVersionRequiresUpdate(version);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.updateAuditService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUpdateAuditDto: UpdateUpdateAuditDto,
    ) {
        return this.updateAuditService.update(+id, updateUpdateAuditDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.updateAuditService.remove(+id);
    }
}
