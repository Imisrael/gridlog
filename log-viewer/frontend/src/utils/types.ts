export interface NewLogEntryInputs {
    logtype: string
    regex_format: string
    timestamp_position: number
    entry_sample: string
    timestamp_format: string
    schema: string
    file_path: string
    interval: number
    expiration_time: number
    partition_unit: number
}