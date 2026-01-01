/** biome-ignore-all lint/performance/noBarrelFile: I (@ImBIOS) don't know something better than this */
import type { Scenario } from "../types";
import { backupDatabase } from "./backup/backup-database";
import { backupScript } from "./file-operations/backup-script";
import { findLargeFiles } from "./file-operations/find-large-files";
import { symlinkSetup } from "./file-operations/symlink-setup";
import { diskUsage } from "./monitoring/disk-usage";
import { logRotation } from "./monitoring/log-rotation";
import { dnsCheck } from "./networking/dns-check";
import { hostsFile } from "./networking/hosts-file";
import { portForwarding } from "./networking/port-forwarding";
import { staticIp } from "./networking/static-ip";
import { installGit } from "./package-management/install-git";
import { updateSystem } from "./package-management/update-system";
import { fail2ban } from "./security/fail2ban";
import { filePermissions } from "./security/file-permissions";
import { firewallBasic } from "./security/firewall-basic";
import { sshHardening } from "./security/ssh-hardening";
import { sslCertificate } from "./security/ssl-certificate";
import { userCreation } from "./security/user-creation";
import { cronJob } from "./service-management/cron-job";
import { processKill } from "./service-management/process-kill";
import { systemdService } from "./service-management/systemd-service";
import { dockerInstall } from "./setup/docker-install";
import { nginxInstall } from "./setup/nginx-install";
import { postgresqlInstall } from "./setup/postgresql-install";
import { redisInstall } from "./setup/redis-install";
import { envVars } from "./system-config/env-vars";
import { timezone } from "./system-config/timezone";
import { logParsing } from "./text-processing/log-parsing";
import { debugConnection } from "./troubleshooting/debug-connection";
import { fixPermissions } from "./troubleshooting/fix-permissions";

/**
 * All available scenarios
 */
export const scenarios: Scenario[] = [
	// Setup category
	nginxInstall,
	dockerInstall,
	postgresqlInstall,
	redisInstall,

	// Security category
	userCreation,
	firewallBasic,
	sshHardening,
	filePermissions,
	fail2ban,
	sslCertificate,

	// Service Management category
	cronJob,
	systemdService,
	processKill,

	// Networking category
	staticIp,
	portForwarding,
	dnsCheck,
	hostsFile,

	// File Operations category
	backupScript,
	findLargeFiles,
	symlinkSetup,

	// Monitoring category
	logRotation,
	diskUsage,

	// Package Management category
	updateSystem,
	installGit,

	// System Config category
	timezone,
	envVars,

	// Backup category
	backupDatabase,

	// Troubleshooting category
	fixPermissions,
	debugConnection,

	// Text Processing category
	logParsing,
];

// Re-export utility functions
export * from "./_utils";
