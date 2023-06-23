import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { IDataServices } from 'src/common/repositories/data.service';
import { IUpdateJobBody } from './core-settings.interface';

@Injectable()
export class CoreSettingsService {
    constructor(private schedulerRegistry: SchedulerRegistry, private dataServices: IDataServices) {
        setTimeout(async () => {
            await this.syncJobList();
        }, 1000);
    }

    async getJobList() {
        const jobMap = await this.schedulerRegistry.getCronJobs();
        const jobs = Array.from(jobMap.keys());
        const jobList = await Promise.all(
            jobs.map(async (key: string) => {
                const job: CronJob = jobMap.get(key);
                if (!job) return;

                const cronTime = (job as any).cronTime.source;

                const config = await this.dataServices.jobConfigs.findOne({
                    key,
                });

                return {
                    key: key,
                    nextDate: job.nextDate().toISO(),
                    cronTime: cronTime,
                    active: config?.active,
                };
            }),
        );

        return jobList;
    }

    async syncJobList() {
        const jobMap = await this.schedulerRegistry.getCronJobs();
        const jobs = Array.from(jobMap.keys());
        const jobList = await Promise.all(
            jobs.map(async (key: string) => {
                const job: CronJob = jobMap.get(key);
                if (!job) return;

                const cronTime = (job as any).cronTime.source;

                let config = await this.dataServices.jobConfigs.findOne({
                    key,
                });

                if (!config) {
                    config = await this.dataServices.jobConfigs.create({
                        key,
                        cronTime: cronTime,
                    });
                } else if (config.cronTime !== cronTime) {
                    await job.setTime(new CronTime(config.cronTime));
                }
            }),
        );

        return jobList;
    }

    async updateJob(key: string, body: IUpdateJobBody) {
        const job = await this.schedulerRegistry.getCronJob(key);
        if (!job) return false;

        const { cronTime, active } = body;

        await this.dataServices.jobConfigs.updateOne(
            {
                key,
            },
            {
                key,
                cronTime: cronTime,
                active: active,
            },
            {
                upsert: true,
            },
        );

        await job.setTime(new CronTime(cronTime));
        job.start();

        return true;
    }
}
