import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SshTunnelService } from '../database/ssh/ssh-tunnel.service';

const PG_DUMP_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

@Injectable()
export class BackupRunnerService {
  constructor(private readonly sshTunnelService: SshTunnelService) {}

  private readonly processes = new Map<
    string,
    {
      child: ChildProcess;
      tunnel: Awaited<ReturnType<SshTunnelService['openTunnel']>> | null;
    }
  >();

  async validatePgDump(filename: string): Promise<void> {
    const args = [
      'exec',
      'backups-manager-tools',
      'pg_restore',
      '--list',
      `/backup/${filename}`,
    ];

    return new Promise((resolve, reject) => {
      const child = spawn('docker', args);

      let stderr = '';

      child.stdout.resume();

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            stderr.trim() || `pg_restore validation failed with code ${code}`,
          ),
        );
      });
    });
  }

  async runPgDump(config: {
    backupId: string;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    sslMode: string;
    filename: string;

    //For SSH
    sshEnabled: boolean;
    sshHost?: string | null;
    sshPort?: number | null;
    sshUsername?: string | null;
    sshPassword?: string | null;

    onProgress?: (info: { bytes: number; elapsedMs: number }) => void;
  }): Promise<{
    success: true;
    file: string;
  }> {
    let tunnel: Awaited<ReturnType<SshTunnelService['openTunnel']>> | null =
      null;

    if (config.sshEnabled) {
      if (
        !config.sshHost ||
        !config.sshPort ||
        !config.sshUsername ||
        !config.sshPassword
      ) {
        throw new Error('SSH configuration is incomplete');
      }

      tunnel = await this.sshTunnelService.openTunnel({
        sshHost: config.sshHost,
        sshPort: config.sshPort,
        sshUsername: config.sshUsername,
        sshPassword: config.sshPassword,

        remoteHost: config.host,
        remotePort: config.port,
      });
    }

    const databaseHost = tunnel ? '127.0.0.1' : config.host;

    const databasePort = tunnel ? tunnel.localPort : config.port;

    const file = path.join(process.cwd(), '..', 'storage', config.filename);

    const args = [
      'exec',

      '-e',
      `PGPASSWORD=${config.password}`,

      '-e',
      `PGSSLMODE=${config.sslMode}`,

      'backups-manager-tools',

      'pg_dump',

      '-h',
      databaseHost,

      '-p',
      String(databasePort),

      '-U',
      config.username,

      '-d',
      config.database,

      '-F',
      'c',

      '-f',
      `/backup/${config.filename}`,
    ];

    console.log('[pg_dump] starting', {
      backupId: config.backupId,
      host: databaseHost,
      port: databasePort,
      database: config.database,
      username: config.username,
      sshEnabled: config.sshEnabled,
    });

    const startedAt = Date.now();

    const child = spawn('docker', args);

    this.processes.set(config.backupId, {
      child,
      tunnel,
    });

    let stderr = '';
    let lastSize = 0;
    let lastProgressAt = Date.now();
    let settled = false;

    const cleanup = async () => {
      clearInterval(progressInterval);

      this.processes.delete(config.backupId);

      if (tunnel) {
        try {
          await this.sshTunnelService.closeTunnel(tunnel);
        } catch {
          //Nothing else to do.
        }

        tunnel = null;
      }
    };

    const terminate = async (): Promise<void> => {
      try {
        const killer = spawn('docker', [
          'exec',
          'backups-manager-tools',
          'pkill',
          '-TERM',
          '-f',
          config.filename,
        ]);

        await new Promise<void>((resolve) => {
          killer.on('close', () => {
            resolve();
          });

          killer.on('error', () => {
            resolve();
          });
        });
      } catch {
        //Nothing else to do.
      }
    };

    const progressInterval = setInterval(async () => {
      if (settled) {
        return;
      }

      try {
        const stats = await fs.promises.stat(file);

        const now = Date.now();

        const currentSize = stats.size;

        if (currentSize > lastSize) {
          lastSize = currentSize;

          lastProgressAt = now;
        }

        config.onProgress?.({
          bytes: currentSize,

          elapsedMs: now - startedAt,
        });

        const inactiveFor = now - lastProgressAt;

        if (inactiveFor >= PG_DUMP_INACTIVITY_TIMEOUT_MS) {
          settled = true;

          console.error(
            `[pg_dump] INACTIVITY TIMEOUT backup=${config.backupId}`,
            {
              inactiveForMs: inactiveFor,

              lastSize,

              filename: config.filename,
            },
          );

          await terminate();

          await cleanup();

          throw new Error(
            `pg_dump stopped after ${PG_DUMP_INACTIVITY_TIMEOUT_MS / 60000} minutes without progress`,
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith('pg_dump stopped after')
        ) {
          return;
        }
      }
    }, 10000);

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    return new Promise((resolve, reject) => {
      child.on('error', async (error) => {
        if (settled) {
          return;
        }

        settled = true;

        await cleanup();

        reject(error);
      });

      child.on('exit', (code, signal) => {
        console.log(`[pg_dump] EXIT backup=${config.backupId}`, {
          code,
          signal,
        });
      });

      child.on('close', async (code, signal) => {
        if (settled) {
          return;
        }

        settled = true;

        await cleanup();

        if (code === 0) {
          resolve({
            success: true,
            file: config.filename,
          });

          return;
        }

        reject(
          new Error(
            stderr.trim() ||
              `pg_dump exited with code ${code}${
                signal ? ` by signal ${signal}` : ''
              }`,
          ),
        );
      });
    });
  }

  async cancel(backupId: string): Promise<boolean> {
    const execution = this.processes.get(backupId);

    if (!execution) {
      return false;
    }

    console.log('[backup] cancelling', {
      backupId,
    });

    const filename = `${backupId}.dump`;

    // 1. Detener pg_dump
    await new Promise<void>((resolve) => {
      const killer = spawn('docker', [
        'exec',
        'backups-manager-tools',
        'pkill',
        '-TERM',
        '-f',
        filename,
      ]);

      killer.once('close', () => {
        resolve();
      });

      killer.once('error', () => {
        resolve();
      });
    });

    // 2. Cerrar explícitamente el túnel SSH
    if (execution.tunnel) {
      await this.sshTunnelService.closeTunnel(execution.tunnel);

      execution.tunnel = null;
    }

    // 3. Asegurar que el proceso docker exec también termine
    if (execution.child.exitCode === null && !execution.child.killed) {
      execution.child.kill('SIGTERM');
    }

    return true;
  }
}
