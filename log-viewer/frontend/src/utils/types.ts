
export type NewLogEntryInputs = {
    logtype: string
    regex_format: string
    timestamp_position: number
    entry_sample: string
    timestamp_format: string
    // this obj comes from the hook form but we don't need it
    // for sending back to backend
    schema?: {
        columnNames: string[], 
        columnTypes: {value: string, label?: string}[]
    }
    // schemaArr is the obj we send back to be saved directly to DB
    schemaArr?: string[]
    file_path: string
    interval: number
    expiration_time: number
    partition_unit: number
}