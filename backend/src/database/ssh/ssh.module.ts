import { Module } from '@nestjs/common';

import { SshTunnelService } from './ssh-tunnel.service';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [
        CommonModule,
    ],
    providers: [
        SshTunnelService,
    ],
    exports: [
        SshTunnelService,
    ],
})
export class SshModule { }