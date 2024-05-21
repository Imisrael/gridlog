
export type NewLogEntryInputs = {
    logtype: string
    regex_format: string
    timestamp_position: number
    entry_sample: string
    timestamp_format: string
    schema: {columnNames: string[], columnTypes: string[]}
    file_path: string
    interval: number
    expiration_time: number
    partition_unit: number
}