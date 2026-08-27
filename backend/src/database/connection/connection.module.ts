import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { SshModule } from '../ssh/ssh.module';

@Module({
    providers: [ConnectionService],
    exports: [ConnectionService],
    imports: [SshModule],
})
export class ConnectionModule { }