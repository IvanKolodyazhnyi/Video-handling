export type EnvVarName =
    | 'S3_VIDEO_BUCKET';

export function getEnvVar(name: EnvVarName, defaultValue?: string): string {
    const res = process.env[name] ?? defaultValue;
    if (typeof res === 'undefined') {
        throw new Error(`Environment variable '${name}' is not defined`);
    }
    return res;
}
