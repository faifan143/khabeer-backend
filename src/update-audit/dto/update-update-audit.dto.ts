import { PartialType } from '@nestjs/mapped-types';
import { CreateUpdateAuditDto } from './create-update-audit.dto';

export class UpdateUpdateAuditDto extends PartialType(CreateUpdateAuditDto) { }
